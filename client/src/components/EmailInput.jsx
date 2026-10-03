import { useEffect, useId, useMemo, useRef, useState } from 'react';

const STORE_KEY = 'ss_emails';
const DOMAINS = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'icloud.com', 'proton.me', 'yahoo.co.in', 'rediffmail.com'];

export function getSavedEmails() {
  try {
    const list = JSON.parse(localStorage.getItem(STORE_KEY));
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveEmail(email) {
  try {
    const next = [email, ...getSavedEmails().filter((e) => e !== email)].slice(0, 5);
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable; suggestions just won't remember this one */
  }
}

// Suggestions shown while typing: emails used before on this device first,
// then the typed name completed with common providers once "@" is typed.
export function buildSuggestions(value, saved = getSavedEmails()) {
  const v = value.trim().toLowerCase();
  const out = [];
  const add = (email, tag) => {
    if (email !== v && !out.some((o) => o.email === email)) out.push({ email, tag });
  };

  saved.filter((e) => e.startsWith(v)).forEach((e) => add(e, 'Used before'));

  const at = v.indexOf('@');
  if (v && at === -1) {
    // No "@" yet: show previously used addresses that contain what was typed.
    saved.filter((e) => e.includes(v)).forEach((e) => add(e, 'Used before'));
  } else if (at > 0) {
    const name = v.slice(0, at);
    const typedDomain = v.slice(at + 1);
    DOMAINS.filter((d) => d.startsWith(typedDomain)).forEach((d) => add(`${name}@${d}`, 'Suggested'));
  }
  return out.slice(0, 6);
}

export default function EmailInput({ value, onChange, ...rest }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrap = useRef(null);
  const listId = useId();

  const suggestions = useMemo(() => buildSuggestions(value), [value, open]);
  const show = open && suggestions.length > 0;

  useEffect(() => {
    const close = (e) => wrap.current && !wrap.current.contains(e.target) && setOpen(false);
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  const pick = (email) => {
    onChange(email);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (e) => {
    if (!show) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (a + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (a <= 0 ? suggestions.length - 1 : a - 1));
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault();
      pick(suggestions[active].email);
    } else if (e.key === 'Tab' && active >= 0) {
      pick(suggestions[active].email);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="email-wrap" ref={wrap}>
      <input
        {...rest}
        className="input"
        type="email"
        autoComplete="off"
        role="combobox"
        aria-expanded={show}
        aria-controls={listId}
        aria-autocomplete="list"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {show && (
        <ul className="suggest" id={listId} role="listbox">
          {suggestions.map((s, i) => (
            <li
              key={s.email}
              role="option"
              aria-selected={i === active}
              className={i === active ? 'active' : ''}
              onPointerDown={(e) => {
                e.preventDefault(); // keep focus in the input
                pick(s.email);
              }}
              onMouseEnter={() => setActive(i)}
            >
              <span className="suggest-mail">
                <b>{value.trim().toLowerCase()}</b>
                {s.email.slice(value.trim().length)}
              </span>
              <span className={`suggest-tag ${s.tag === 'Used before' ? 'used' : ''}`}>{s.tag}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
