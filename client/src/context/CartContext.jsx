import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ss_cart')) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ss_cart', JSON.stringify(items));
    } catch {
      /* storage unavailable (private mode); cart just won't persist */
    }
  }, [items]);

  const add = (p, qty = 1) =>
    setItems((cur) => {
      const found = cur.find((i) => i._id === p._id);
      if (found)
        return cur.map((i) =>
          i._id === p._id ? { ...i, qty: Math.min(p.stock, i.qty + qty) } : i
        );
      return [...cur, { _id: p._id, name: p.name, image: p.image, price: p.price, stock: p.stock, qty }];
    });

  const setQty = (id, qty) =>
    setItems((cur) =>
      cur.flatMap((i) => {
        if (i._id !== id) return [i];
        if (qty < 1) return [];
        return [{ ...i, qty: Math.min(i.stock, qty) }];
      })
    );
  const remove = (id) => setItems((cur) => cur.filter((i) => i._id !== id));
  const clear = () => setItems([]);

  const { count, subtotal } = useMemo(
    () => ({
      count: items.reduce((s, i) => s + i.qty, 0),
      subtotal: items.reduce((s, i) => s + i.qty * i.price, 0),
    }),
    [items]
  );

  return (
    <CartContext.Provider value={{ items, add, setQty, remove, clear, count, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}
