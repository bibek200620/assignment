import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';
import { User, Product, Cart, Order } from '../src/models.js';

const secret = 'test-only-secret-longer-than-thirty-two-characters';
const app = createApp({ secret, production: false });
const customer = request.agent(app),
  admin = request.agent(app),
  other = request.agent(app);
const sample = {
  title: 'Test Headphones',
  description: 'Comfortable headphones for integration testing.',
  price: 999,
  originalPrice: 1499,
  category: 'Electronics',
  image: '/images/headphones.jpg',
  inStock: true,
};
const address = {
  fullName: 'Test Customer',
  phone: '9876543210',
  line: '123 Demo Street',
  city: 'Bengaluru',
  postalCode: '560001',
};
let productId, customerId, orderId;
const requestId = randomUUID();
describe('Amazon Clone REST API with real MongoDB', () => {
  before(async () => {
    await mongoose.connect(
      process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017',
      {
        dbName: `amazon_test_${randomUUID().replaceAll('-', '')}`,
        serverSelectionTimeoutMS: 8000,
      },
    );
    await Promise.all([User.init(), Cart.init(), Order.init()]);
  });
  after(async () => {
    if (mongoose.connection.readyState === 1)
      await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });
  it('connects to MongoDB and allows public catalog browsing', async () => {
    assert.equal(
      (await request(app).get('/api/health').expect(200)).body.database,
      'MongoDB',
    );
    assert.deepEqual(
      (await request(app).get('/api/products').expect(200)).body.products,
      [],
    );
  });
  it('protects cart, orders, and product writes', async () => {
    await request(app).get('/api/cart').expect(401);
    await request(app).get('/api/orders').expect(401);
    await request(app).post('/api/products').send(sample).expect(401);
  });
  it('validates accounts and prevents public admin registration', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'invalid', password: 'short' })
      .expect(400);
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test',
        email: 'test@example.com',
        password: 'Password123!',
        role: 'admin',
      })
      .expect(400);
    assert.equal(await User.countDocuments(), 0);
  });
  it('registers customers with hashed passwords and protected JWT cookies', async () => {
    const res = await customer
      .post('/api/auth/register')
      .send({
        name: 'Test Customer',
        email: 'CUSTOMER@example.com',
        password: 'Password123!',
      })
      .expect(201);
    customerId = res.body.user._id;
    assert.equal(res.body.user.email, 'customer@example.com');
    assert.equal(res.body.user.role, 'customer');
    assert.equal(res.body.user.password, undefined);
    assert.match(res.headers['set-cookie'][0], /HttpOnly/);
    assert.match(res.headers['set-cookie'][0], /SameSite=Strict/);
    assert.match(
      (await User.findById(customerId).select('+password')).password,
      /^\$2/,
    );
    await customer.get('/api/auth/me').expect(200);
  });
  it('rejects duplicates, incorrect passwords, and invalid or expired tokens', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Duplicate',
        email: 'customer@example.com',
        password: 'Password123!',
      })
      .expect(409);
    await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer@example.com', password: 'wrong' })
      .expect(401);
    await request(app)
      .get('/api/cart')
      .set('Cookie', 'amazon_session=invalid')
      .expect(401);
    const expired = jwt.sign({}, secret, {
      subject: customerId,
      expiresIn: -1,
    });
    await request(app)
      .get('/api/orders')
      .set('Cookie', `amazon_session=${expired}`)
      .expect(401);
  });
  it('enforces administrator permissions for full catalog CRUD', async () => {
    await customer.post('/api/products').send(sample).expect(403);
    const res = await admin
      .post('/api/auth/register')
      .send({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'Password123!',
      })
      .expect(201);
    // Role is assigned directly by trusted setup, never through a public API.
    await User.updateOne({ _id: res.body.user._id }, { role: 'admin' });
    const product = await admin.post('/api/products').send(sample).expect(201);
    productId = product.body.product._id;
    assert.equal((await Product.findById(productId)).price, 999);
    await customer
      .patch(`/api/products/${productId}`)
      .send({ price: 1 })
      .expect(403);
    await customer.delete(`/api/products/${productId}`).send({}).expect(403);
  });
  it('reads, searches, and filters catalog products', async () => {
    assert.equal(
      (await request(app).get(`/api/products/${productId}`).expect(200)).body
        .product.title,
      sample.title,
    );
    assert.equal(
      (
        await request(app)
          .get('/api/products?search=HEADPHONES&category=Electronics')
          .expect(200)
      ).body.products.length,
      1,
    );
    assert.equal(
      (await request(app).get('/api/products?search=%5B').expect(200)).body
        .products.length,
      0,
    );
    await request(app).get('/api/products?search[$ne]=null').expect(400);
    await request(app).get('/api/products/not-an-id').expect(404);
  });
  it('updates products and validates prices and unknown fields', async () => {
    await admin
      .patch(`/api/products/${productId}`)
      .send({ price: 899 })
      .expect(200);
    assert.equal((await Product.findById(productId)).price, 899);
    await admin
      .patch(`/api/products/${productId}`)
      .send({ price: -1 })
      .expect(400);
    await admin
      .patch(`/api/products/${productId}`)
      .send({ originalPrice: 10 })
      .expect(400);
    await admin
      .patch(`/api/products/${productId}`)
      .send({ rating: 5 })
      .expect(400);
  });
  it('creates, reads, updates, and deletes a MongoDB cart item', async () => {
    const added = await customer
      .post('/api/cart')
      .send({ productId, quantity: 1 })
      .expect(201);
    assert.equal(added.body.total, 899);
    await customer
      .patch(`/api/cart/${productId}`)
      .send({ quantity: 3 })
      .expect(200);
    assert.equal(
      (await Cart.findOne({ user: customerId })).items[0].quantity,
      3,
    );
    assert.equal(
      (await customer.get('/api/cart').expect(200)).body.total,
      2697,
    );
    await customer
      .patch(`/api/cart/${productId}`)
      .send({ quantity: 11 })
      .expect(400);
    await customer.delete(`/api/cart/${productId}`).send({}).expect(200);
    assert.equal((await customer.get('/api/cart')).body.items.length, 0);
  });
  it('rejects unavailable products and quantity overflow', async () => {
    await admin
      .patch(`/api/products/${productId}`)
      .send({ inStock: false })
      .expect(200);
    await customer.post('/api/cart').send({ productId }).expect(400);
    await admin
      .patch(`/api/products/${productId}`)
      .send({ inStock: true })
      .expect(200);
    await customer
      .post('/api/cart')
      .send({ productId, quantity: 10 })
      .expect(201);
    await customer.post('/api/cart').send({ productId }).expect(400);
    await customer
      .patch(`/api/cart/${productId}`)
      .send({ quantity: 2 })
      .expect(200);
  });
  it('validates checkout and refuses client-supplied totals', async () => {
    await customer
      .post('/api/orders')
      .send({ requestId, address: { ...address, postalCode: '123' } })
      .expect(400);
    await customer
      .post('/api/orders')
      .send({ requestId, address, total: 1 })
      .expect(400);
    assert.equal(await Order.countDocuments(), 0);
  });
  it('creates a correctly priced order snapshot and clears the cart', async () => {
    const res = await customer
      .post('/api/orders')
      .send({ requestId, address })
      .expect(201);
    orderId = res.body.order._id;
    assert.equal(res.body.order.total, 1798);
    assert.equal(res.body.order.items[0].quantity, 2);
    assert.equal(res.body.order.paymentMethod, 'Cash on delivery (demo)');
    assert.equal((await customer.get('/api/cart')).body.items.length, 0);
    assert.equal((await Order.findById(orderId)).address.city, 'Bengaluru');
  });
  it('handles checkout retries without creating duplicate orders', async () => {
    assert.equal(
      (
        await customer
          .post('/api/orders')
          .send({ requestId, address })
          .expect(200)
      ).body.order._id,
      orderId,
    );
    assert.equal(await Order.countDocuments(), 1);
    await customer
      .post('/api/orders')
      .send({ requestId: randomUUID(), address })
      .expect(400);
  });
  it('isolates carts and order history between accounts', async () => {
    await other
      .post('/api/auth/register')
      .send({
        name: 'Other Customer',
        email: 'other@example.com',
        password: 'Password123!',
      })
      .expect(201);
    assert.deepEqual((await other.get('/api/cart')).body.items, []);
    assert.deepEqual((await other.get('/api/orders')).body.orders, []);
    await other
      .patch(`/api/cart/${productId}`)
      .send({ quantity: 9 })
      .expect(404);
    assert.equal((await customer.get('/api/orders')).body.orders.length, 1);
  });
  it('deletes catalog products and cart references while preserving order history', async () => {
    await customer.post('/api/cart').send({ productId }).expect(201);
    await admin.delete(`/api/products/${productId}`).send({}).expect(200);
    assert.equal(await Product.countDocuments(), 0);
    assert.equal((await customer.get('/api/cart')).body.items.length, 0);
    const order = await Order.findById(orderId);
    assert.equal(order.items[0].title, sample.title);
    assert.equal(order.items[0].price, 899);
  });
  it('rejects cross-site changes and logs out safely', async () => {
    await admin
      .post('/api/products')
      .set('Sec-Fetch-Site', 'cross-site')
      .send(sample)
      .expect(403);
    await customer
      .post('/api/cart')
      .type('form')
      .send({ productId })
      .expect(415);
    await customer.post('/api/auth/logout').send({}).expect(200);
    await customer.get('/api/cart').expect(401);
    await customer
      .post('/api/auth/login')
      .send({ email: 'customer@example.com', password: 'Password123!' })
      .expect(200);
    await customer.get('/api/auth/me').expect(200);
  });
});
