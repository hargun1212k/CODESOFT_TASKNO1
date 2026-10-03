// In-browser stand-in for the Express API. Only bundled when built with VITE_MOCK=1 (used for the live preview).

const PALETTES = {
  Electronics: ['#0b1f4b', '#1d4ed8', '#93b4ff'],
  Fashion: ['#12306b', '#3b6bea', '#c9d8ff'],
  Home: ['#0e2a63', '#2f5fd0', '#b5ccff'],
  Sports: ['#0a1a3f', '#1a46b8', '#8fb0ff'],
  Stationery: ['#13285c', '#2a58cc', '#d6e2ff'],
};

function art(category, n) {
  const [a, b, c] = PALETTES[category] || PALETTES.Electronics;
  const shapes = [
    `<circle cx="300" cy="300" r="150" fill="${c}" opacity=".9"/><circle cx="300" cy="300" r="80" fill="${a}"/>`,
    `<rect x="170" y="170" width="260" height="260" rx="36" fill="${c}" opacity=".9" transform="rotate(${10 + (n % 4) * 8} 300 300)"/><rect x="230" y="230" width="140" height="140" rx="20" fill="${a}"/>`,
    `<path d="M120 440 L300 130 L480 440 Z" fill="${c}" opacity=".9"/><circle cx="300" cy="360" r="44" fill="${a}"/>`,
    `<rect x="120" y="250" width="360" height="100" rx="50" fill="${c}" opacity=".9"/><circle cx="${190 + (n % 3) * 110}" cy="300" r="34" fill="${a}"/>`,
  ];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${b}"/><stop offset="1" stop-color="${a}"/></linearGradient></defs><rect width="600" height="600" fill="url(#g)"/>${shapes[n % shapes.length]}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const RAW = [
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
];

const products = RAW.map(([name, category, brand, price, rating, stock, description], i) => ({
  _id: `p${String(i + 1).padStart(3, '0')}`,
  name, category, brand, price, rating, stock, description,
  image: art(category, i),
  createdAt: new Date(2026, 9, 1, 0, 0, 20 - i).toISOString(),
}));

const users = [{ _id: 'u1', name: 'Demo User', email: 'demo@shop.com', password: 'demo1234', isAdmin: false }];
let orders = [];
let currentUser = null;

const fail = (message) => { throw new Error(message); };
const pub = (u) => ({ _id: u._id, name: u.name, email: u.email, isAdmin: u.isAdmin, token: `mock-${u._id}` });

export async function mockApi(path, { method = 'GET', body, token } = {}) {
  await new Promise((r) => setTimeout(r, 120));
  const [pathname, search = ''] = path.split('?');
  const qs = new URLSearchParams(search);
  const needAuth = () => {
    const u = users.find((x) => `mock-${x._id}` === token);
    if (!u) fail('Not authenticated');
    return u;
  };

  if (pathname === '/auth/login') {
    const u = users.find((x) => x.email === (body.email || '').toLowerCase());
    if (!u || u.password !== body.password) fail('Invalid email or password');
    return pub(u);
  }
  if (pathname === '/auth/register') {
    if (users.some((x) => x.email === body.email.toLowerCase())) fail('Email already registered');
    const u = { _id: `u${users.length + 1}`, name: body.name, email: body.email.toLowerCase(), password: body.password, isAdmin: false };
    users.push(u);
    return pub(u);
  }

  if (pathname === '/products/meta/filters') {
    const prices = products.map((p) => p.price);
    return {
      categories: [...new Set(products.map((p) => p.category))].sort(),
      brands: [...new Set(products.map((p) => p.brand))].sort(),
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    };
  }

  if (pathname === '/products') {
    let list = [...products];
    const search = (qs.get('search') || '').toLowerCase();
    if (search) list = list.filter((p) => `${p.name} ${p.description} ${p.brand}`.toLowerCase().includes(search));
    if (qs.get('category')) list = list.filter((p) => qs.get('category').split(',').includes(p.category));
    if (qs.get('brand')) list = list.filter((p) => qs.get('brand').split(',').includes(p.brand));
    if (qs.get('minPrice')) list = list.filter((p) => p.price >= Number(qs.get('minPrice')));
    if (qs.get('maxPrice')) list = list.filter((p) => p.price <= Number(qs.get('maxPrice')));
    if (qs.get('minRating')) list = list.filter((p) => p.rating >= Number(qs.get('minRating')));
    const sort = qs.get('sort');
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    else list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const page = Math.max(1, Number(qs.get('page') || 1));
    const limit = Number(qs.get('limit') || 12);
    return { products: list.slice((page - 1) * limit, page * limit), total: list.length, page, pages: Math.ceil(list.length / limit) };
  }

  let m = pathname.match(/^\/products\/([^/]+)$/);
  if (m) return products.find((p) => p._id === m[1]) || fail('Product not found');

  if (pathname === '/orders' && method === 'POST') {
    const u = needAuth();
    if (!body.items?.length) fail('Cart is empty');
    const items = body.items.map((i) => {
      const p = products.find((x) => x._id === i.product) || fail('A product in your cart no longer exists');
      if (p.stock < i.qty) fail(`Only ${p.stock} left of "${p.name}"`);
      return { product: p._id, name: p.name, image: p.image, price: p.price, qty: i.qty };
    });
    const itemsTotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const shippingFee = itemsTotal >= 999 ? 0 : 49;
    const order = {
      _id: `o${Date.now().toString(16)}${orders.length}`.padEnd(24, '0'),
      user: u._id, items, shipping: body.shipping, itemsTotal, shippingFee,
      total: itemsTotal + shippingFee, status: 'pending', createdAt: new Date().toISOString(),
    };
    orders.unshift(order);
    return order;
  }
  if (pathname === '/orders/mine') {
    const u = needAuth();
    return orders.filter((o) => o.user === u._id);
  }
  m = pathname.match(/^\/orders\/([^/]+)\/(pay|confirm)$/);
  if (m) {
    const u = needAuth();
    const o = orders.find((x) => x._id === m[1] && x.user === u._id) || fail('Order not found');
    if (m[2] === 'pay' && o.status !== 'paid') {
      o.status = 'paid';
      o.items.forEach((i) => { products.find((p) => p._id === i.product).stock -= i.qty; });
    }
    return m[2] === 'pay' ? { order: o } : o;
  }
  m = pathname.match(/^\/orders\/([^/]+)$/);
  if (m) {
    const u = needAuth();
    return orders.find((x) => x._id === m[1] && x.user === u._id) || fail('Order not found');
  }
  return fail('Route not found');
}
