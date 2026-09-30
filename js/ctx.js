/* Shared runtime context: motion preference, GSAP availability, Lenis, event bus. */
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const hasGsap = !!(window.gsap && window.ScrollTrigger);
export const bus = new EventTarget();
export const emit = (name, detail) => bus.dispatchEvent(new CustomEvent(name, { detail }));
export const on = (name, fn) => bus.addEventListener(name, (e) => fn(e.detail));
export const state = { lenis: null };

if (hasGsap) {
  gsap.registerPlugin(ScrollTrigger);
  if (!reduced) document.documentElement.classList.add('gsap');
}

export function scrollToEl(target, opts = {}) {
  const el = typeof target === 'string' ? $(target) : target;
  if (!el) return;
  if (state.lenis) state.lenis.scrollTo(el, { offset: opts.offset ?? -84, duration: opts.duration ?? 1.4, lock: false });
  else el.scrollIntoView({ behavior: 'auto', block: 'start' });
}

/* Split text into word spans, keeping inline elements (like <em>) intact. */
export function splitWords(el) {
  const words = [];
  const walk = (node) => {
    Array.from(node.childNodes).forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const s = document.createElement('span');
          s.className = 'w'; s.textContent = part; s.style.display = 'inline-block';
          frag.appendChild(s); words.push(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
  };
  walk(el);
  return words;
}

export function splitChars(el, cls = 'ch') {
  const txt = el.textContent;
  el.setAttribute('aria-label', txt);
  el.textContent = '';
  return Array.from(txt).map((c) => {
    const s = document.createElement('span');
    s.className = cls; s.setAttribute('aria-hidden', 'true');
    s.textContent = c === ' ' ? ' ' : c;
    el.appendChild(s);
    return s;
  });
}

export const pad2 = (n) => String(n).padStart(2, '0');
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
