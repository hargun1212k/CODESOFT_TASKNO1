import { Link } from 'react-router-dom';
import { money } from '../api.js';
import { useCart } from '../context/CartContext.jsx';

export const Stars = ({ value }) => (
  <span className="stars" title={`${value} / 5`}>
    {'★'.repeat(Math.round(value))}
    <span className="stars-off">{'★'.repeat(5 - Math.round(value))}</span>
    <small> {value.toFixed(1)}</small>
  </span>
);

export default function ProductCard({ p }) {
  const { add } = useCart();
  return (
    <article className="card product">
      <Link to={`/product/${p._id}`} className="product-img">
        <img src={p.image} alt={p.name} loading="lazy" />
        {p.stock === 0 && <span className="tag tag-out">Out of stock</span>}
      </Link>
      <div className="product-body">
        <span className="muted small">{p.category} · {p.brand}</span>
        <Link to={`/product/${p._id}`} className="product-name">{p.name}</Link>
        <Stars value={p.rating} />
        <div className="product-foot">
          <strong className="price">{money(p.price)}</strong>
          <button className="btn btn-primary btn-sm" disabled={p.stock === 0} onClick={() => add(p)}>
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}
