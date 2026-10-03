import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api, money } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function OrderPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { token } = useAuth();
  const { clear } = useCart();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // After a Stripe redirect, ask the server to verify the session before showing status.
    const path = params.get('session_id') ? `/orders/${id}/confirm` : `/orders/${id}`;
    api(path, { method: params.get('session_id') ? 'POST' : 'GET', token })
      .then((o) => { setOrder(o); if (o.status === 'paid') clear(); })
      .catch((e) => setError(e.message));
  }, [id, token, params]);

  if (error) return <div className="alert">{error}</div>;
  if (!order) return <p className="muted">Loading…</p>;

  return (
    <>
      <div className={`card banner ${order.status === 'paid' ? 'banner-ok' : ''}`}>
        <h1>{order.status === 'paid' ? 'Thank you! Your order is confirmed 🎉' : `Order ${order.status}`}</h1>
        <p className="muted">Order #{order._id.slice(-8).toUpperCase()}</p>
      </div>
      <div className="cart">
        <div className="card">
          {order.items.map((i) => (
            <div key={i.product} className="cart-row">
              <img src={i.image} alt={i.name} />
              <div className="grow"><strong>{i.name}</strong><div className="muted small">Qty {i.qty}</div></div>
              <strong>{money(i.price * i.qty)}</strong>
            </div>
          ))}
        </div>
        <aside className="card summary">
          <h3>Details</h3>
          <div className="sum-row"><span>Items</span><span>{money(order.itemsTotal)}</span></div>
          <div className="sum-row"><span>Shipping</span><span>{order.shippingFee ? money(order.shippingFee) : 'Free'}</span></div>
          <div className="sum-row total"><span>Total</span><span>{money(order.total)}</span></div>
          <p className="muted small">
            Ship to: {order.shipping.fullName}, {order.shipping.address}, {order.shipping.city} {order.shipping.postalCode},{' '}
            {order.shipping.country}
          </p>
          <Link to="/" className="btn btn-primary block">Continue shopping</Link>
        </aside>
      </div>
    </>
  );
}
