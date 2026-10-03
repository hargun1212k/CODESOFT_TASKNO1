import 'dotenv/config';
import mongoose from 'mongoose';
import Product from './models/Product.js';
import User from './models/User.js';

const img = (seed) => `https://picsum.photos/seed/${seed}/600/600`;

const products = [
  ['Aero Wireless Headphones', 'Electronics', 'Sonic', 4999, 4.6, 40, 'Over-ear ANC headphones with 40h battery.'],
  ['Pulse Smartwatch', 'Electronics', 'Sonic', 7999, 4.4, 25, 'AMOLED display, GPS and heart-rate tracking.'],
  ['Nimbus Bluetooth Speaker', 'Electronics', 'Aurora', 2499, 4.2, 60, 'Waterproof portable speaker with deep bass.'],
  ['Vertex Mechanical Keyboard', 'Electronics', 'Aurora', 3499, 4.7, 35, 'Hot-swappable switches, white backlight.'],
  ['Lumen 27" Monitor', 'Electronics', 'Vertex', 15999, 4.5, 12, '27-inch QHD IPS, 144Hz.'],
  ['Atlas Backpack 30L', 'Fashion', 'Northfield', 1799, 4.3, 80, 'Water-resistant, laptop sleeve, ergonomic straps.'],
  ['Classic Oxford Shirt', 'Fashion', 'Northfield', 1299, 4.1, 100, '100% cotton, tailored fit.'],
  ['Stride Running Shoes', 'Fashion', 'Stride', 3999, 4.6, 55, 'Lightweight mesh with responsive cushioning.'],
  ['Everyday Denim Jacket', 'Fashion', 'Stride', 2799, 4.0, 45, 'Washed denim, relaxed fit.'],
  ['Ceramic Pour-Over Set', 'Home', 'Hearth', 1499, 4.8, 30, 'Dripper, server and 2 cups.'],
  ['Linen Throw Blanket', 'Home', 'Hearth', 1999, 4.5, 50, 'Soft stonewashed linen, 130x170cm.'],
  ['Halo Desk Lamp', 'Home', 'Lumos', 2299, 4.4, 40, 'Dimmable LED, wireless charging base.'],
  ['Cedar Bookshelf', 'Home', 'Lumos', 8999, 4.2, 10, 'Five-tier solid cedar shelf.'],
  ['Trailblazer Yoga Mat', 'Sports', 'Stride', 999, 4.3, 120, '6mm non-slip eco mat.'],
  ['Adjustable Dumbbell Pair', 'Sports', 'Ironclad', 6499, 4.7, 18, '2-24kg per hand, quick-dial.'],
  ['Summit Water Bottle 1L', 'Sports', 'Ironclad', 699, 4.5, 200, 'Insulated steel, keeps cold 24h.'],
  ['Pixel Sketchbook A4', 'Stationery', 'Inkwell', 399, 4.6, 150, '120 gsm acid-free paper, 80 sheets.'],
  ['Fountain Pen Starter Kit', 'Stationery', 'Inkwell', 1199, 4.4, 70, 'Fine nib, 6 ink cartridges.'],
  ['Focus Planner 2027', 'Stationery', 'Inkwell', 599, 4.2, 90, 'Weekly layout, lay-flat binding.'],
  ['Noise-Free Mouse', 'Electronics', 'Vertex', 1299, 4.3, 75, 'Silent clicks, 2.4GHz + Bluetooth.'],
].map(([name, category, brand, price, rating, stock, description], i) => ({
  name, category, brand, price, rating, stock, description, image: img(`shopsphere-${i + 1}`),
}));

await mongoose.connect(process.env.MONGO_URI);
await Product.deleteMany({});
await Product.insertMany(products);

if (!(await User.findOne({ email: 'admin@shop.com' }))) {
  await User.create({ name: 'Admin', email: 'admin@shop.com', password: 'admin123', isAdmin: true });
}
if (!(await User.findOne({ email: 'demo@shop.com' }))) {
  await User.create({ name: 'Demo User', email: 'demo@shop.com', password: 'demo1234' });
}

console.log(`Seeded ${products.length} products + demo users`);
await mongoose.disconnect();
