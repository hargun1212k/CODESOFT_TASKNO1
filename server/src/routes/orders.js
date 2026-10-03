import { Router } from 'express';
import Stripe from 'stripe';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';

const router = Router();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const FREE_SHIPPING_OVER = 999;
const SHIPPING_FEE = 49;

// Create order from cart. Prices are always re-read from the DB (never trusted from the client).
router.post('/', protect, async (req, res) => {
  try {
    const { items, shipping } = req.body;
    if (!Array.isArray(items) || !items.length)
      return res.status(400).json({ message: 'Cart is empty' });
    const required = ['fullName', 'address', 'city', 'postalCode', 'country'];
    if (!shipping || required.some((k) => !shipping[k]))
      return res.status(400).json({ message: 'Complete shipping details are required' });

    const products = await Product.find({ _id: { $in: items.map((i) => i.product) } });
    const map = new Map(products.map((p) => [String(p._id), p]));

    const orderItems = [];
    for (const i of items) {
      const p = map.get(String(i.product));
      const qty = Math.max(1, Math.floor(Number(i.qty)));
      if (!p) return res.status(400).json({ message: 'A product in your cart no longer exists' });
      if (p.stock < qty)
        return res.status(400).json({ message: `Only ${p.stock} left of "${p.name}"` });
      orderItems.push({ product: p._id, name: p.name, image: p.image, price: p.price, qty });
    }

    const itemsTotal = orderItems.reduce((s, i) => s + i.price * i.qty, 0);
    const shippingFee = itemsTotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shipping,
      itemsTotal,
      shippingFee,
      total: itemsTotal + shippingFee,
      paymentMethod: stripe ? 'stripe' : 'demo',
    });
    res.status(201).json(order);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

async function markPaid(order) {
  if (order.status === 'paid') return order;
  order.status = 'paid';
  order.paidAt = new Date();
  await order.save();
  await Promise.all(
    order.items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: -i.qty } }))
  );
  return order;
}

// Pay for an order. Stripe Checkout when a key is configured, otherwise a demo payment.
router.post('/:id/pay', protect, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status === 'paid') return res.json({ order });

    if (stripe) {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
          ...order.items.map((i) => ({
            quantity: i.qty,
            price_data: {
              currency: 'inr',
              unit_amount: Math.round(i.price * 100),
              product_data: { name: i.name },
            },
          })),
          ...(order.shippingFee
            ? [
                {
                  quantity: 1,
                  price_data: {
                    currency: 'inr',
                    unit_amount: Math.round(order.shippingFee * 100),
                    product_data: { name: 'Shipping' },
                  },
                },
              ]
            : []),
        ],
        metadata: { orderId: String(order._id) },
        success_url: `${clientUrl}/#/order/${order._id}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${clientUrl}/#/order/${order._id}?cancelled=1`,
      });
      order.stripeSessionId = session.id;
      await order.save();
      return res.json({ url: session.url });
    }

    // Demo payment: simulates a successful card charge.
    res.json({ order: await markPaid(order) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Called by the client after returning from Stripe; verifies the session server-side.
router.post('/:id/confirm', protect, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (stripe && order.stripeSessionId && order.status !== 'paid') {
      const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
      if (session.payment_status === 'paid') await markPaid(order);
    }
    res.json(order);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/mine', protect, async (req, res) => {
  res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }));
});

router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch {
    res.status(404).json({ message: 'Order not found' });
  }
});

export default router;
