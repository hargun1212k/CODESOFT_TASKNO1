import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Orders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/orders/mine', { token }).then(setOrders).catch((e) => setError(e.message));
  }, [token]);

  if (error) return <div className="alert">{error}</div>;
  if (!orders) return <p className="muted">Loading…</p>;

  return (
    <>
      <h1>My orders</h1>
      {!orders.length && <div className="card empty">No orders yet. <Link to="/" className="link">Go shopping</Link></div>}
      <div className="card">
        {orders.map((o) => (
          <Link key={o._id} to={`/order/${o._id}`} className="order-row">
            <div>
              <strong>#{o._id.slice(-8).toUpperCase()}</strong>
              <div className="muted small">{new Date(o.createdAt).toLocaleDateString()} · {o.items.length} item(s)</div>
            </div>
            <span className={`tag ${o.status === 'paid' ? 'tag-ok' : ''}`}>{o.status}</span>
            <strong>{money(o.total)}</strong>
          </Link>
        ))}
      </div>
    </>
  );
}
