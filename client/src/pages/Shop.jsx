import { useEffect, useState } from 'react';
import { api } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';

const initial = { search: '', category: [], brand: [], minPrice: '', maxPrice: '', minRating: '', sort: 'newest' };

export default function Shop() {
  const [filters, setFilters] = useState(initial);
  const [meta, setMeta] = useState({ categories: [], brands: [] });
  const [data, setData] = useState({ products: [], total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    api('/products/meta/filters').then(setMeta).catch(() => {});
  }, []);

  // Debounce so typing in search/price doesn't fire a request per keystroke.
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      const qs = new URLSearchParams({ page, limit: 9, sort: filters.sort });
      if (filters.search) qs.set('search', filters.search);
      if (filters.category.length) qs.set('category', filters.category.join(','));
      if (filters.brand.length) qs.set('brand', filters.brand.join(','));
      if (filters.minPrice) qs.set('minPrice', filters.minPrice);
      if (filters.maxPrice) qs.set('maxPrice', filters.maxPrice);
      if (filters.minRating) qs.set('minRating', filters.minRating);
      api(`/products?${qs}`)
        .then((d) => { setData(d); setError(''); })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [filters, page]);

  const set = (patch) => { setFilters((f) => ({ ...f, ...patch })); setPage(1); };
  const toggle = (key, val) =>
    set({ [key]: filters[key].includes(val) ? filters[key].filter((v) => v !== val) : [...filters[key], val] });

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">New season · Free shipping over ₹999</span>
          <h1>Gear up for<br />everything.</h1>
          <p>Electronics, fashion, home and sport. Picked well, priced fair, delivered fast.</p>
          <div className="hero-search">
            <input
              className="input"
              placeholder="Search headphones, shoes, lamps…"
              value={filters.search}
              onChange={(e) => set({ search: e.target.value })}
              aria-label="Search products"
            />
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <span className="orb orb-1" />
          <span className="orb orb-2" />
          <span className="orb orb-3" />
          <div className="hero-stat"><strong>{meta.categories.length || 5}</strong><span>categories</span></div>
        </div>
      </section>

      <div className="trust">
        <div><strong>Free shipping</strong><span>on orders over ₹999</span></div>
        <div><strong>Secure payment</strong><span>cards via Stripe</span></div>
        <div><strong>Easy checkout</strong><span>done in under a minute</span></div>
      </div>

      <div className="chips" role="tablist" aria-label="Categories">
        <button
          className={`chip ${filters.category.length === 0 ? 'on' : ''}`}
          onClick={() => set({ category: [] })}
        >
          All
        </button>
        {meta.categories.map((c) => (
          <button
            key={c}
            className={`chip ${filters.category.length === 1 && filters.category[0] === c ? 'on' : ''}`}
            onClick={() => set({ category: [c] })}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="shop">
        <button className="btn btn-ghost filters-toggle" onClick={() => setShowFilters((s) => !s)}>
          {showFilters ? 'Hide filters' : 'Show filters'}
        </button>

        <aside className={`card filters ${showFilters ? 'open' : ''}`}>
          <div className="filters-head">
            <h3>Filters</h3>
            <button className="link" onClick={() => { setFilters(initial); setPage(1); }}>Reset</button>
          </div>

          <h4>Category</h4>
          {meta.categories.map((c) => (
            <label key={c} className="check">
              <input type="checkbox" checked={filters.category.includes(c)} onChange={() => toggle('category', c)} /> {c}
            </label>
          ))}

          <h4>Brand</h4>
          {meta.brands.map((b) => (
            <label key={b} className="check">
              <input type="checkbox" checked={filters.brand.includes(b)} onChange={() => toggle('brand', b)} /> {b}
            </label>
          ))}

          <h4>Price (₹)</h4>
          <div className="row">
            <input className="input" type="number" min="0" placeholder="Min" value={filters.minPrice} onChange={(e) => set({ minPrice: e.target.value })} />
            <input className="input" type="number" min="0" placeholder="Max" value={filters.maxPrice} onChange={(e) => set({ maxPrice: e.target.value })} />
          </div>

          <h4>Rating</h4>
          <select className="input" value={filters.minRating} onChange={(e) => set({ minRating: e.target.value })}>
            <option value="">Any</option>
            <option value="4.5">4.5 ★ &amp; up</option>
            <option value="4">4 ★ &amp; up</option>
            <option value="3">3 ★ &amp; up</option>
          </select>
        </aside>

        <section>
          <div className="toolbar">
            <span className="muted">{loading ? 'Loading…' : `${data.total} product${data.total === 1 ? '' : 's'}`}</span>
            <select className="input sort" value={filters.sort} onChange={(e) => set({ sort: e.target.value })}>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="rating">Top rated</option>
            </select>
          </div>

          {error && <div className="alert">{error}. Is the API running?</div>}

          {!loading && !error && data.products.length === 0 && (
            <div className="card empty">No products match your filters.</div>
          )}

          <div className="grid">
            {data.products.map((p) => <ProductCard key={p._id} p={p} />)}
          </div>

          {data.pages > 1 && (
            <div className="pager">
              <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</button>
              <span className="muted">Page {page} of {data.pages}</span>
              <button className="btn btn-ghost btn-sm" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next →</button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
