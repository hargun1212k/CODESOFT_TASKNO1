import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();

  return (
    <header className="nav">
      <div className="promo">Free shipping on orders over ₹999</div>
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">S</span> ShopSphere
        </Link>
        <nav className="nav-links">
          <NavLink to="/" end>Shop</NavLink>
          {user && <NavLink to="/orders">Orders</NavLink>}
          <NavLink to="/cart" className="cart-link">
            Cart {count > 0 && <span className="badge">{count}</span>}
          </NavLink>
          {user ? (
            <>
              <span className="hello">Hi, {user.name.split(' ')[0]}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => { logout(); nav('/'); }}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Sign in</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
