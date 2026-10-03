import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, money } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { Stars } from '../components/ProductCard.jsx';

export default function ProductPage() {
  const { id } = useParams();
  const { add } = useCart();
  const nav = useNavigate();
  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/products/${id}`).then(setP).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="alert">{error}</div>;
  if (!p) return <p className="muted">Loading…</p>;

  return (
    <>
      <Link to="/" className="link">← Back to shop</Link>
      <div className="card detail">
        <img src={p.image} alt={p.name} />
        <div>
          <span className="muted small">{p.category} · {p.brand}</span>
          <h1>{p.name}</h1>
          <Stars value={p.rating} />
          <p className="detail-price">{money(p.price)}</p>
          <p>{p.description}</p>
          <p className={p.stock > 0 ? 'ok' : 'bad'}>
            {p.stock > 0 ? `In stock (${p.stock} available)` : 'Out of stock'}
          </p>
          {p.stock > 0 && (
            <div className="row">
              <input
                className="input qty"
                type="number"
                min="1"
                max={p.stock}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(p.stock, Number(e.target.value) || 1)))}
              />
              <button className="btn btn-primary" onClick={() => add(p, qty)}>Add to cart</button>
              <button className="btn btn-ghost" onClick={() => { add(p, qty); nav('/cart'); }}>Buy now</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
