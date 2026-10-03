import { Router } from 'express';
import Product from '../models/Product.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

// GET /api/products?search=&category=&brand=&minPrice=&maxPrice=&minRating=&sort=&page=&limit=
router.get('/', async (req, res) => {
  try {
    const { search, category, brand, minPrice, maxPrice, minRating, sort, page = 1, limit = 12 } = req.query;
    const q = {};
    if (search) q.$text = { $search: search };
    if (category && category !== 'all') q.category = { $in: category.split(',') };
    if (brand) q.brand = { $in: brand.split(',') };
    if (minPrice || maxPrice) {
      q.price = {};
      if (minPrice) q.price.$gte = Number(minPrice);
      if (maxPrice) q.price.$lte = Number(maxPrice);
    }
    if (minRating) q.rating = { $gte: Number(minRating) };

    const sorts = {
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      rating: { rating: -1 },
      newest: { createdAt: -1 },
    };
    const pageNum = Math.max(1, Number(page));
    const lim = Math.min(48, Math.max(1, Number(limit)));

    const [products, total] = await Promise.all([
      Product.find(q)
        .sort(sorts[sort] || { createdAt: -1 })
        .skip((pageNum - 1) * lim)
        .limit(lim),
      Product.countDocuments(q),
    ]);
    res.json({ products, total, page: pageNum, pages: Math.ceil(total / lim) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/meta/filters', async (_req, res) => {
  const [categories, brands, price] = await Promise.all([
    Product.distinct('category'),
    Product.distinct('brand'),
    Product.aggregate([{ $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } }]),
  ]);
  res.json({
    categories: categories.sort(),
    brands: brands.filter(Boolean).sort(),
    minPrice: price[0]?.min ?? 0,
    maxPrice: price[0]?.max ?? 0,
  });
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch {
    res.status(404).json({ message: 'Product not found' });
  }
});

// Admin CRUD
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    res.status(201).json(await Product.create(req.body));
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!p) return res.status(404).json({ message: 'Product not found' });
    res.json(p);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

export default router;
