import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Product } from './models.js';
export async function seedDemo() {
  for (const account of [
    {
      name: 'Bibek',
      email: 'demo@example.com',
      password: 'Demo12345!',
      role: 'customer',
    },
    {
      name: 'Admin',
      email: 'admin@example.com',
      password: 'Admin12345!',
      role: 'admin',
    },
  ]) {
    if (!(await User.exists({ email: account.email })))
      await User.create({
        ...account,
        password: await bcrypt.hash(account.password, 12),
      });
  }
  if (!(await Product.exists({})))
    await Product.insertMany([
      {
        title: 'SoundMax Wireless Over-Ear Headphones',
        description:
          'Enjoy your favourite music with deep bass, soft ear cushions, and up to 30 hours of battery life. Includes a charging cable and adjustable headband. Bluetooth connectivity makes everyday listening simple.',
        price: 1999,
        originalPrice: 3999,
        category: 'Electronics',
        image: '/images/headphones.jpg',
        rating: 4.5,
        reviewCount: 1248,
      },
      {
        title: 'Classic Minimalist Analog Watch',
        description:
          'A clean everyday watch with a comfortable strap, quartz movement, and a timeless dial. An easy match for casual and office wear. Includes a presentation box.',
        price: 1299,
        originalPrice: 2499,
        category: 'Fashion',
        image: '/images/watch.jpg',
        rating: 4.3,
        reviewCount: 864,
      },
      {
        title: 'UrbanTrail Everyday Travel Backpack',
        description:
          'A lightweight, practical backpack for college, work, and weekend trips. Features a padded laptop compartment, adjustable shoulder straps, and easy-access pockets.',
        price: 899,
        originalPrice: 1799,
        category: 'Fashion',
        image: '/images/backpack.jpg',
        rating: 4.4,
        reviewCount: 2167,
      },
      {
        title: 'BeatBox Portable Bluetooth Speaker',
        description:
          'Take your playlist anywhere with this compact Bluetooth speaker. Clear sound, portable design, and easy wireless pairing make it ideal for your desk or a day out.',
        price: 1499,
        originalPrice: 2999,
        category: 'Electronics',
        image: '/images/speaker.jpg',
        rating: 4.2,
        reviewCount: 732,
      },
      {
        title: 'KeyPro Mechanical Gaming Keyboard',
        description:
          'A comfortable keyboard for coding, gaming, and everyday typing. Responsive mechanical keys, a sturdy design, and a USB connection keep your setup simple.',
        price: 2499,
        originalPrice: 4499,
        category: 'Electronics',
        image: '/images/keyboard.jpg',
        rating: 4.6,
        reviewCount: 948,
      },
      {
        title: 'Stride Everyday Running Shoes',
        description:
          'Lightweight everyday shoes with a cushioned sole and breathable upper. Designed for comfortable walks, workouts, and busy days. Demo listing: standard size UK 8.',
        price: 1799,
        originalPrice: 3499,
        category: 'Fashion',
        image: '/images/shoes.jpg',
        rating: 4.3,
        reviewCount: 1562,
      },
      {
        title: 'Nordic Modern Table Lamp',
        description:
          'Bring a warm glow to your favourite corner. This simple table lamp is a beautiful fit for a bedside table or home office. Standard mains power connection.',
        price: 1199,
        originalPrice: 2199,
        category: 'Home & Kitchen',
        image: '/images/lamp.jpg',
        rating: 4.4,
        reviewCount: 425,
      },
      {
        title: 'Morning Brew Premium Coffee, 250 g',
        description:
          'Make every morning a little better with aromatic roasted coffee. A balanced, full-bodied flavour for your daily cup. Store in a cool, dry place after opening.',
        price: 449,
        originalPrice: 699,
        category: 'Home & Kitchen',
        image: '/images/coffee.jpg',
        rating: 4.5,
        reviewCount: 1863,
      },
    ]);
  console.log(
    'Seed ready. Customer: demo@example.com / Demo12345! | Admin: admin@example.com / Admin12345!',
  );
}
if (process.argv[1]?.endsWith('/seed.js')) {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/amazon_clone',
      { serverSelectionTimeoutMS: 8000 },
    );
    await seedDemo();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
