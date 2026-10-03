import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: String,
        image: String,
        price: Number,
        qty: { type: Number, required: true, min: 1 },
      },
    ],
    shipping: {
      fullName: String,
      address: String,
      city: String,
      postalCode: String,
      country: String,
    },
    itemsTotal: Number,
    shippingFee: Number,
    total: Number,
    paymentMethod: { type: String, enum: ['stripe', 'demo'], default: 'demo' },
    stripeSessionId: String,
    status: { type: String, enum: ['pending', 'paid', 'shipped', 'cancelled'], default: 'pending' },
    paidAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
