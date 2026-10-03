import { mockApi } from './mockApi.js';

const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const MOCK = Boolean(import.meta.env.VITE_MOCK); // demo build with an in-browser fake API

export async function api(path, { method = 'GET', body, token } = {}) {
  if (MOCK) return mockApi(path, { method, body, token });
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

export const money = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
