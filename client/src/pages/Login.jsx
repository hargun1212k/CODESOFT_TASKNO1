import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import EmailInput, { saveEmail } from '../components/EmailInput.jsx';

const PERKS = [
  ['Free shipping', 'on every order over ₹999'],
  ['Secure checkout', 'card payments handled by Stripe'],
  ['Track orders', 'your full history in one place'],
];

export default function Login() {
  const { user, login, register } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const dest = loc.state?.from || '/';
  if (user) return <Navigate to={dest} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const email = form.email.trim().toLowerCase();
      if (mode === 'login') await login(email, form.password);
      else await register(form.name, email, form.password);
      saveEmail(email); // powers the email suggestions next time
      nav(dest, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const f = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

  return (
    <div className="auth-split">
      <aside className="auth-side">
        <span className="eyebrow">ShopSphere</span>
        <h2>Shop smarter.<br />Check out faster.</h2>
        <ul>
          {PERKS.map(([t, d]) => (
            <li key={t}>
              <strong>{t}</strong>
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </aside>

      <form className="auth-form" onSubmit={submit}>
        <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="muted">
          {mode === 'login' ? 'Sign in to continue to checkout.' : 'It takes less than a minute.'}
        </p>
        {error && <div className="alert">{error}</div>}

        {mode === 'register' && (
          <label className="field">
            <span>Full name</span>
            <input id="name" className="input" placeholder="Your name" required {...f('name')} />
          </label>
        )}
        <div className="field">
          <label htmlFor="email">Email</label>
          <EmailInput
            id="email"
            placeholder="you@example.com"
            required
            value={form.email}
            onChange={(email) => setForm({ ...form, email })}
          />
        </div>
        <label className="field">
          <span>Password</span>
          <input id="password" className="input" type="password" placeholder="Min 6 characters" minLength={6} required {...f('password')} />
        </label>

        <button className="btn btn-primary btn-lg block" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>

        <p className="muted small center">
          {mode === 'login' ? 'New here? ' : 'Already have an account? '}
          <button type="button" className="link" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
            {mode === 'login' ? 'Create an account' : 'Sign in'}
          </button>
        </p>
        <button
          type="button"
          className="demo-fill"
          onClick={() => { setMode('login'); setForm({ name: '', email: 'demo@shop.com', password: 'demo1234' }); }}
        >
          Use demo login · demo@shop.com
        </button>
      </form>
    </div>
  );
}
