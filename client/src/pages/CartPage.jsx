import { Link, useNavigate } from 'react-router-dom';
import { money } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function CartPage() {
  const { items, setQty, remove, subtotal } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 49;

  if (!items.length)
    return (
      <div className="card empty">
        <h2>Your cart is empty</h2>
        <Link to="/" className="btn btn-primary">Start shopping</Link>
      </div>
    );

  return (
    <>
      <h1>Shopping cart</h1>
      <div className="cart">
        <div className="card">
          {items.map((i) => (
            <div key={i._id} className="cart-row">
              <img src={i.image} alt={i.name} />
              <div className="grow">
                <Link to={`/product/${i._id}`} className="product-name">{i.name}</Link>
                <div className="muted small">{money(i.price)} each</div>
                <button className="link bad" onClick={() => remove(i._id)}>Remove</button>
              </div>
              <div className="stepper">
                <button onClick={() => setQty(i._id, i.qty - 1)} aria-label="Decrease">−</button>
                <span>{i.qty}</span>
                <button onClick={() => setQty(i._id, i.qty + 1)} disabled={i.qty >= i.stock} aria-label="Increase">+</button>
              </div>
              <strong className="line-total">{money(i.price * i.qty)}</strong>
            </div>
          ))}
        </div>

        <aside className="card summary">
          <h3>Order summary</h3>
          <div className="sum-row"><span>Subtotal</span><span>{money(subtotal)}</span></div>
          <div className="sum-row"><span>Shipping</span><span>{shipping ? money(shipping) : 'Free'}</span></div>
          <div className="sum-row total"><span>Total</span><span>{money(subtotal + shipping)}</span></div>
          {shipping > 0 && <p className="muted small">Free shipping on orders over {money(999)}.</p>}
          <button className="btn btn-primary block" onClick={() => nav(user ? '/checkout' : '/login', { state: { from: '/checkout' } })}>
            {user ? 'Proceed to checkout' : 'Sign in to checkout'}
          </button>
        </aside>
      </div>
    </>
  );
}
