import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { User, Product, Cart, Order } from './models.js';
const email = z.string().trim().toLowerCase().max(254).pipe(z.email());
const productInput = z
  .object({
    title: z.string().trim().min(3).max(160),
    description: z.string().trim().min(10).max(3000),
    price: z
      .number()
      .min(1)
      .max(10000000)
      .refine(
        (v) => Math.abs(v * 100 - Math.round(v * 100)) < 0.00001,
        'Use at most two decimal places.',
      ),
    originalPrice: z.number().min(1).max(10000000),
    category: z.enum(['Electronics', 'Fashion', 'Home & Kitchen']),
    image: z.enum([
      '/images/headphones.jpg',
      '/images/watch.jpg',
      '/images/backpack.jpg',
      '/images/speaker.jpg',
      '/images/keyboard.jpg',
      '/images/shoes.jpg',
      '/images/lamp.jpg',
      '/images/coffee.jpg',
    ]),
    inStock: z.boolean(),
  })
  .strict();
const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});
const fail = (status, message) => Object.assign(new Error(message), { status });
const validId = (id) => typeof id === 'string' && mongoose.isValidObjectId(id);
export function createApp({
  secret = process.env.JWT_SECRET,
  production = process.env.NODE_ENV === 'production',
} = {}) {
  if (!secret || secret.length < 32)
    throw new Error('Set JWT_SECRET to at least 32 random characters in .env.');
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet({ contentSecurityPolicy: production ? undefined : false }));
  app.use(express.json({ limit: '64kb' }));
  app.use(cookieParser());
  app.use('/api', (req, res, next) => {
    if (
      ['POST', 'PATCH', 'DELETE'].includes(req.method) &&
      !req.is('application/json')
    )
      return next(fail(415, 'Use application/json for API changes.'));
    if (req.headers['sec-fetch-site'] === 'cross-site')
      return next(fail(403, 'Cross-site requests are not allowed.'));
    next();
  });
  const cookieOptions = {
    httpOnly: true,
    secure: production,
    sameSite: 'strict',
    maxAge: 7 * 86400000,
    path: '/',
  };
  const session = (res, user) =>
    res.cookie(
      'amazon_session',
      jwt.sign({}, secret, {
        subject: String(user._id),
        expiresIn: '7d',
        algorithm: 'HS256',
      }),
      cookieOptions,
    );
  const protect = async (req, res, next) => {
    try {
      const payload = jwt.verify(req.cookies.amazon_session, secret, {
        algorithms: ['HS256'],
      });
      const user = validId(payload.sub) && (await User.findById(payload.sub));
      if (!user) throw new Error();
      req.user = user;
      next();
    } catch {
      next(fail(401, 'Please sign in to continue.'));
    }
  };
  const admin = (req, res, next) =>
    req.user.role === 'admin'
      ? next()
      : next(fail(403, 'Administrator access required.'));
  const authLimit = rateLimit({
    windowMs: 15 * 60000,
    limit: 60,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { message: 'Too many attempts. Please try again in 15 minutes.' },
  });
  app.get('/api/health', (req, res) =>
    res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({
      status: mongoose.connection.readyState === 1 ? 'ok' : 'unavailable',
      database: 'MongoDB',
    }),
  );
  app.post('/api/auth/register', authLimit, async (req, res) => {
    const data = z
      .object({
        name: z.string().trim().min(2).max(60),
        email,
        password: z.string().min(8, 'Use at least 8 characters.').max(72),
      })
      .strict()
      .parse(req.body);
    if (await User.exists({ email: data.email }))
      throw fail(409, 'An account with this email already exists.');
    const user = await User.create({
      ...data,
      password: await bcrypt.hash(data.password, 12),
    });
    session(res, user);
    res.status(201).json({ user: publicUser(user) });
  });
  app.post('/api/auth/login', authLimit, async (req, res) => {
    const data = z
      .object({ email, password: z.string().max(72) })
      .strict()
      .parse(req.body);
    const user = await User.findOne({ email: data.email }).select('+password');
    if (!user || !(await bcrypt.compare(data.password, user.password)))
      throw fail(401, 'Email or password is incorrect.');
    session(res, user);
    res.json({ user: publicUser(user) });
  });
  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('amazon_session', { ...cookieOptions, maxAge: undefined });
    res.json({ message: 'Signed out.' });
  });
  app.get('/api/auth/me', protect, (req, res) =>
    res.json({ user: publicUser(req.user) }),
  );
  app.get('/api/products', async (req, res) => {
    const query = z
      .object({
        search: z.string().max(100).optional(),
        category: z
          .enum(['Electronics', 'Fashion', 'Home & Kitchen'])
          .optional(),
      })
      .strict()
      .parse(req.query);
    const filter = {};
    if (query.category) filter.category = query.category;
    if (query.search?.trim())
      filter.title = {
        $regex: query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        $options: 'i',
      };
    res.json({ products: await Product.find(filter).sort({ createdAt: 1 }) });
  });
  const findProduct = async (id) => {
    if (!validId(id)) throw fail(404, 'Product not found.');
    const product = await Product.findById(id);
    if (!product) throw fail(404, 'Product not found.');
    return product;
  };
  app.get('/api/products/:id', async (req, res) =>
    res.json({ product: await findProduct(req.params.id) }),
  );
  app.post('/api/products', protect, admin, async (req, res) => {
    const data = productInput.parse(req.body);
    if (data.originalPrice < data.price)
      throw fail(400, 'Original price must be at least the selling price.');
    res.status(201).json({ product: await Product.create(data) });
  });
  app.patch('/api/products/:id', protect, admin, async (req, res) => {
    const product = await findProduct(req.params.id);
    const data = productInput.partial().parse(req.body);
    if (
      (data.originalPrice ?? product.originalPrice) <
      (data.price ?? product.price)
    )
      throw fail(400, 'Original price must be at least the selling price.');
    Object.assign(product, data);
    await product.save();
    res.json({ product });
  });
  app.delete('/api/products/:id', protect, admin, async (req, res) => {
    const product = await findProduct(req.params.id);
    await product.deleteOne();
    await Cart.updateMany(
      { 'items.product': product._id },
      { $pull: { items: { product: product._id } } },
    );
    res.json({ message: 'Product deleted.' });
  });
  const readCart = async (user) => {
    const cart = await Cart.findOne({ user }).populate('items.product');
    const items = (cart?.items || [])
      .filter((item) => item.product)
      .map((item) => ({ product: item.product, quantity: item.quantity }));
    return {
      items,
      total:
        Math.round(
          items.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0,
          ) * 100,
        ) / 100,
    };
  };
  app.use('/api/cart', protect);
  app.get('/api/cart', async (req, res) =>
    res.json(await readCart(req.user._id)),
  );
  app.post('/api/cart', async (req, res) => {
    const data = z
      .object({
        productId: z.string(),
        quantity: z.number().int().min(1).max(10).default(1),
      })
      .strict()
      .parse(req.body);
    const product = await findProduct(data.productId);
    if (!product.inStock)
      throw fail(400, 'This product is currently unavailable.');
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });
    const existing = cart.items.find(
      (item) => String(item.product) === data.productId,
    );
    if (existing) {
      if (existing.quantity + data.quantity > 10)
        throw fail(400, 'You can add up to 10 of each product.');
      existing.quantity += data.quantity;
    } else cart.items.push({ product: product._id, quantity: data.quantity });
    await cart.save();
    res.status(201).json(await readCart(req.user._id));
  });
  app.patch('/api/cart/:productId', async (req, res) => {
    const data = z
      .object({ quantity: z.number().int().min(1).max(10) })
      .strict()
      .parse(req.body);
    if (!validId(req.params.productId)) throw fail(404, 'Cart item not found.');
    const cart = await Cart.findOne({ user: req.user._id });
    const item = cart?.items.find(
      (item) => String(item.product) === req.params.productId,
    );
    if (!item) throw fail(404, 'Cart item not found.');
    item.quantity = data.quantity;
    await cart.save();
    res.json(await readCart(req.user._id));
  });
  app.delete('/api/cart/:productId', async (req, res) => {
    if (!validId(req.params.productId)) throw fail(404, 'Cart item not found.');
    await Cart.updateOne(
      { user: req.user._id },
      { $pull: { items: { product: req.params.productId } } },
    );
    res.json(await readCart(req.user._id));
  });
  app.use('/api/orders', protect);
  app.get('/api/orders', async (req, res) =>
    res.json({
      orders: await Order.find({ user: req.user._id }).sort({ createdAt: -1 }),
    }),
  );
  app.post('/api/orders', async (req, res) => {
    const data = z
      .object({
        requestId: z.uuid(),
        address: z
          .object({
            fullName: z.string().trim().min(2).max(80),
            phone: z
              .string()
              .regex(
                /^[6-9]\d{9}$/,
                'Enter a valid 10-digit Indian mobile number.',
              ),
            line: z.string().trim().min(5).max(250),
            city: z.string().trim().min(2).max(80),
            postalCode: z
              .string()
              .regex(/^[1-9]\d{5}$/, 'Enter a valid 6-digit PIN code.'),
          })
          .strict(),
      })
      .strict()
      .parse(req.body);
    const existing = await Order.findOne({
      user: req.user._id,
      requestId: data.requestId,
    });
    if (existing) return res.json({ order: existing });
    const cart = await readCart(req.user._id);
    if (!cart.items.length) throw fail(400, 'Your cart is empty.');
    if (cart.items.some((item) => !item.product.inStock))
      throw fail(
        400,
        'An item is unavailable. Please remove it from your cart.',
      );
    const items = cart.items.map(({ product, quantity }) => ({
      product: product._id,
      title: product.title,
      image: product.image,
      price: product.price,
      quantity,
    }));
    let order;
    try {
      order = await Order.create({
        user: req.user._id,
        requestId: data.requestId,
        address: data.address,
        total: cart.total,
        items,
      });
    } catch (error) {
      if (error.code !== 11000) throw error;
      order = await Order.findOne({
        user: req.user._id,
        requestId: data.requestId,
      });
    }
    await Cart.updateOne({ user: req.user._id }, { $set: { items: [] } });
    res.status(201).json({ order });
  });
  app.use('/api', (req, res) =>
    res.status(404).json({ message: 'API endpoint not found.' }),
  );
  const dist = fileURLToPath(new URL('../../client/dist/', import.meta.url));
  if (existsSync(dist)) {
    app.use(express.static(dist));
    app.get('/{*path}', (req, res) =>
      res.sendFile(path.join(dist, 'index.html')),
    );
  }
  app.use((err, req, res, next) => {
    if (err.name === 'VersionError')
      return res.status(409).json({
        message: 'Your cart changed in another request. Refresh and try again.',
      });
    if (err instanceof z.ZodError)
      return res
        .status(400)
        .json({ message: err.issues[0]?.message || 'Invalid input.' });
    if (err.code === 11000)
      return res
        .status(409)
        .json({ message: 'This entry already exists. Please try again.' });
    const status = err.status || (err.name === 'ValidationError' ? 400 : 500);
    if (status >= 500) console.error(err);
    res.status(status).json({
      message:
        status >= 500 ? 'Something went wrong. Please try again.' : err.message,
    });
  });
  return app;
}
