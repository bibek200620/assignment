import mongoose from 'mongoose';
const { Schema } = mongoose;
const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  },
  { timestamps: true },
);
const productSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, maxlength: 3000 },
    price: { type: Number, required: true, min: 1, max: 10000000 },
    originalPrice: { type: Number, required: true, min: 1, max: 10000000 },
    category: {
      type: String,
      enum: ['Electronics', 'Fashion', 'Home & Kitchen'],
      required: true,
    },
    image: { type: String, required: true },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, min: 0, default: 0 },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true },
);
const cartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: { type: Number, required: true, min: 1, max: 10 },
      },
    ],
  },
  { timestamps: true, optimisticConcurrency: true },
);
const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    requestId: { type: String, required: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        title: String,
        image: String,
        price: Number,
        quantity: Number,
      },
    ],
    address: {
      fullName: String,
      phone: String,
      line: String,
      city: String,
      postalCode: String,
    },
    total: { type: Number, required: true },
    status: { type: String, default: 'Placed' },
    paymentMethod: { type: String, default: 'Cash on delivery (demo)' },
  },
  { timestamps: true },
);
orderSchema.index({ user: 1, requestId: 1 }, { unique: true });
export const User = mongoose.model('User', userSchema);
export const Product = mongoose.model('Product', productSchema);
export const Cart = mongoose.model('Cart', cartSchema);
export const Order = mongoose.model('Order', orderSchema);
