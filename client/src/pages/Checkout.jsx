import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api, money } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Checkout() {
  const { user, token } = useAuth();
  const { items, subtotal, clear } = useCart();
  const nav = useNavigate();
  const [ship, setShip] = useState({ fullName: user.name, address: '', city: '', postalCode: '', country: 'India' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!items.length) return <Navigate to="/cart" replace />;

  const shipping = subtotal >= 999 ? 0 : 49;
  const f = (k) => ({ value: ship[k], onChange: (e) => setShip({ ...ship, [k]: e.target.value }), required: true });

  const placeOrder = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const order = await api('/orders', {
        method: 'POST',
        token,
        body: { items: items.map((i) => ({ product: i._id, qty: i.qty })), shipping: ship },
      });
      const pay = await api(`/orders/${order._id}/pay`, { method: 'POST', token });
      if (pay.url) {
        window.location.href = pay.url; // Stripe Checkout; cart is cleared once payment is confirmed
      } else {
        clear();
        nav(`/order/${order._id}`, { replace: true });
      }
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <>
      <h1>Checkout</h1>
      <form className="cart" onSubmit={placeOrder}>
        <div className="card form-grid">
          <h3>Shipping address</h3>
          {error && <div className="alert">{error}</div>}
          <input className="input" placeholder="Full name" {...f('fullName')} />
          <input className="input" placeholder="Address" {...f('address')} />
          <div className="row">
            <input className="input" placeholder="City" {...f('city')} />
            <input className="input" placeholder="Postal code" {...f('postalCode')} />
          </div>
          <input className="input" placeholder="Country" {...f('country')} />
          <div className="note">
            <strong>Payment</strong>
            <p className="muted small">
              You'll be redirected to Stripe's secure page when card payments are enabled. Otherwise a demo payment is
              used and no real card is charged.
            </p>
          </div>
        </div>

        <aside className="card summary">
          <h3>Your order</h3>
          {items.map((i) => (
            <div key={i._id} className="sum-row small">
              <span>{i.name} × {i.qty}</span>
              <span>{money(i.price * i.qty)}</span>
            </div>
          ))}
          <div className="sum-row"><span>Shipping</span><span>{shipping ? money(shipping) : 'Free'}</span></div>
          <div className="sum-row total"><span>Total</span><span>{money(subtotal + shipping)}</span></div>
          <button className="btn btn-primary block" disabled={busy}>
            {busy ? 'Processing…' : `Pay ${money(subtotal + shipping)}`}
          </button>
        </aside>
      </form>
    </>
  );
}
