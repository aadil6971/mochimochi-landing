/* Site-wide behaviour: smooth scroll, nav, cursor, reveals, FAQ, subscribe, newsletter, footer. */
import { SIZES, SUB_DISCOUNT, eur } from './data.js';
import { $, $$, hasGsap, reduced, state, scrollToEl, splitWords, emit, on } from './ctx.js';

/* ---------- smooth scroll + anchors ---------- */
export function initScroll() {
  if (hasGsap && window.Lenis && !reduced) {
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.95, smoothWheel: true });
    state.lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href') === '#') return;
    const id = a.getAttribute('href');
    const t = document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    closeMenu();
    if (id === '#top') { state.lenis ? state.lenis.scrollTo(0, { duration: 1.6 }) : window.scrollTo(0, 0); }
    else if (id === '#making' && state.makingST) { const y = state.makingST.start; state.lenis ? state.lenis.scrollTo(y, { duration: 1.6 }) : window.scrollTo(0, y); }
    else if (id === '#making') { scrollToEl(t, { offset: 0, duration: 1.6 }); }
    else scrollToEl(t);
    history.replaceState(null, '', id);
    if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1');
    setTimeout(() => t.focus({ preventScroll: true }), 50);
  });
}

/* ---------- mobile menu ---------- */
const menu = () => $('#menu');
let menuOpen = false;
function trap(e) {
  if (e.key === 'Escape') { closeMenu(); $('#burger').focus(); return; }
  if (e.key !== 'Tab') return;
  const f = [$('#burger'), ...$$('a', menu())];
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}
function closeMenu() {
  if (!menuOpen) return;
  menuOpen = false;
  const m = menu(); m.classList.remove('is-open');
  $('#burger').setAttribute('aria-expanded', 'false'); $('#burger').setAttribute('aria-label', 'Open menu');
  state.lenis && state.lenis.start();
  document.removeEventListener('keydown', trap);
  setTimeout(() => { if (!menuOpen) m.hidden = true; }, 700);
}
export function initNav() {
  const b = $('#burger');
  b.addEventListener('click', () => {
    if (menuOpen) { closeMenu(); return; }
    menuOpen = true;
    const m = menu(); m.hidden = false; void m.offsetWidth; m.classList.add('is-open');
    b.setAttribute('aria-expanded', 'true'); b.setAttribute('aria-label', 'Close menu');
    state.lenis && state.lenis.stop();
    document.addEventListener('keydown', trap);
    setTimeout(() => $('a', m).focus(), 350);
  });
  matchMedia('(min-width:1101px)').addEventListener('change', (e) => e.matches && closeMenu());
}

/* ---------- cursor follower + pops ---------- */
export function initCursor() {
  const el = $('#cursor');
  if (!matchMedia('(hover:hover) and (pointer:fine)').matches || reduced || !hasGsap) return;
  let tx = -100, ty = -100, x = -100, y = -100, label = '';
  const set = (l) => { label = l; $('#cursorLabel').textContent = l; el.classList.toggle('is-label', !!l); };
  window.addEventListener('pointermove', (e) => {
    tx = e.clientX; ty = e.clientY; el.classList.add('is-on');
    const t = e.target.closest ? e.target.closest('a, button, label, input, .hot, [role=button]') : null;
    el.classList.toggle('is-link', !!t && !label);
  }, { passive: true });
  document.addEventListener('pointerleave', () => el.classList.remove('is-on'));
  on('hover', (over) => set(over ? 'poke' : ''));
  gsap.ticker.add(() => {
    x += (tx - x) * 0.2; y += (ty - y) * 0.2;
    const vx = tx - x, vy = ty - y, sp = Math.hypot(vx, vy);
    if (label || el.classList.contains('is-link')) { el.style.transform = `translate3d(${x}px,${y}px,0)`; return; }
    const s = Math.min(sp / 46, 0.55), a = Math.atan2(vy, vx);
    el.style.transform = `translate3d(${x}px,${y}px,0) rotate(${a}rad) scale(${1 + s},${1 - s * 0.45})`;
  });
}

const WORDS = ['boing', 'squish', 'mochi', 'soft', 'mmm', 'chew', 'poof'];
export function pop(x, y, word) {
  const holder = $('#pops');
  const s = document.createElement('span');
  s.className = 'pop'; s.textContent = word || WORDS[(Math.random() * WORDS.length) | 0];
  s.style.left = x + 'px'; s.style.top = y + 'px';
  holder.appendChild(s);
  if (!hasGsap || reduced) { setTimeout(() => s.remove(), 900); return; }
  const dx = (Math.random() - 0.5) * 140;
  gsap.timeline({ onComplete: () => s.remove() })
    .fromTo(s, { xPercent: -50, yPercent: -50, scale: 0.2, rotation: (Math.random() - 0.5) * 30 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1,.4)' })
    .to(s, { y: -90, x: dx, opacity: 0, duration: 0.8, ease: 'power2.in' }, 0.35);
}
on('confetti', ({ el }) => {
  const r = el.getBoundingClientRect();
  ['squish', 'yum', 'mochi', 'boing'].forEach((w, i) => setTimeout(() => pop(r.left + r.width * (0.2 + i * 0.2), r.top, w), i * 110));
});

/* ---------- magnetic buttons ---------- */
export function initMagnetic() {
  if (!hasGsap || reduced || !matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  $$('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1,.5)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1,.5)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.28); yTo((e.clientY - (r.top + r.height / 2)) * 0.36);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

/* ---------- reveals ---------- */
export function initReveals() {
  if (!hasGsap || reduced) return;
  $$('[data-reveal]').forEach((el) => {
    gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true }, onStart: () => { el.style.translate = 'none'; } });
    gsap.set(el, { y: 44, translate: 'none' });
  });
  $$('.h2').forEach((h) => {
    if (h.closest('.making')) return;
    const words = splitWords(h);
    gsap.from(words, { yPercent: 55, rotation: 5, opacity: 0, scale: 0.9, duration: 0.9, stagger: 0.055, ease: 'back.out(2.2)', scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
  });
  gsap.from('.score__n', { textContent: 0, duration: 1.6, ease: 'power2.out', snap: { textContent: 0.1 }, scrollTrigger: { trigger: '.score', start: 'top 85%', once: true }, onUpdate() { const n = this.targets()[0]; n.textContent = (+n.textContent).toFixed(1); } });
  gsap.from('.rev', { y: 80, rotation: (i) => (i % 2 ? 6 : -6), opacity: 0, duration: 1, stagger: 0.15, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.cards', start: 'top 82%', once: true } });
  gsap.from('.reviews__photo', { rotation: 8, y: 60, opacity: 0, duration: 1, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.reviews__photo', start: 'top 88%', once: true } });
  gsap.from('.sub__photo', { rotation: 8, scale: 0.85, opacity: 0, duration: 1.1, ease: 'back.out(1.8)', scrollTrigger: { trigger: '.sub__photo', start: 'top 88%', once: true } });
  gsap.from('.frow', { y: 30, opacity: 0, duration: 0.7, stagger: 0.06, ease: 'back.out(1.8)', scrollTrigger: { trigger: '#bList', start: 'top 86%', once: true } });
  gsap.from('.size', { y: 40, opacity: 0, scale: 0.9, duration: 0.8, stagger: 0.08, ease: 'back.out(1.8)', scrollTrigger: { trigger: '#sizesGrid', start: 'top 88%', once: true } });
  gsap.from('.chip', { y: 40, opacity: 0, scale: 0.7, duration: 0.8, stagger: 0.05, ease: 'back.out(2.4)', scrollTrigger: { trigger: '#picker', start: 'top 92%', once: true } });
}

/* ---------- marquee speeds up with scroll ---------- */
export function initMarquee() {
  const track = $('.marquee__track');
  if (!track || !hasGsap || reduced) return;
  track.style.animation = 'none';
  const tw = gsap.to(track, { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
  let dir = 1;
  ScrollTrigger.create({
    onUpdate: (self) => {
      const v = self.getVelocity();
      if (Math.abs(v) > 40) dir = v > 0 ? 1 : -1;
      gsap.to(tw, { timeScale: dir * (1 + Math.min(Math.abs(v) / 500, 7)), duration: 0.25, overwrite: true, onComplete: () => gsap.to(tw, { timeScale: dir, duration: 1.2 }) });
    },
  });
}

/* ---------- FAQ ---------- */
export function initFaq() {
  $$('.acc__btn').forEach((btn) => {
    const panel = $('#' + btn.getAttribute('aria-controls'));
    const inner = panel.firstElementChild;
    const sync = (open) => {
      btn.setAttribute('aria-expanded', String(open));
      panel.classList.toggle('is-open', open);
      inner.inert = !open;
    };
    sync(btn.getAttribute('aria-expanded') === 'true');
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      sync(open);
      if (open && hasGsap && !reduced) gsap.fromTo(inner.firstElementChild, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.1, ease: 'power3.out' });
      setTimeout(() => hasGsap && ScrollTrigger.refresh(), 620);
    });
  });
}

/* ---------- subscribe ---------- */
export function initSubscribe() {
  let billing = 'monthly', n = 12;
  const shown = { now: 0 };
  const sizes = $('#planSizes');
  sizes.innerHTML = SIZES.map((s) => `<label><input type="radio" name="psize" value="${s.n}" ${s.n === n ? 'checked' : ''}><span>${s.n} mochi</span></label>`).join('');
  const price = () => { const s = SIZES.find((x) => x.n === n); return billing === 'monthly' ? Math.round(s.price * (1 - SUB_DISCOUNT) * 100) / 100 : s.price; };
  const render = (first) => {
    const s = SIZES.find((x) => x.n === n); const m = billing === 'monthly';
    $('#planName').textContent = m ? `The Monthly ${n}` : `One box of ${n}`;
    const was = $('#planWas'); was.hidden = !m; was.textContent = eur(s.price);
    $('#planPer').textContent = m ? '/ month' : 'one time';
    const target = price(), el = $('#planNow');
    if (first || !hasGsap || reduced) { shown.now = target; el.textContent = eur(target); }
    else gsap.to(shown, { now: target, duration: 0.6, ease: 'power3.out', overwrite: true, onUpdate: () => { el.textContent = eur(shown.now); } });
    $$('#perks li').forEach((li) => {
      const k = li.dataset.perk;
      const on = m || (k === 'ship' && s.ship === 0);
      li.classList.toggle('is-off', !on);
    });
    $('#planCta span').textContent = m ? 'Start my monthly box' : 'Build this box';
    $('#planFine').textContent = m ? 'Cancel any time. Charged the day your box ships.' : 'One payment. No subscription. Delivery from €5.90 on a box of 6.';
    if (!first && hasGsap && !reduced) gsap.fromTo('#plan .plan__price', { scale: 0.94 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1,.4)' });
  };
  $('#planToggle').addEventListener('change', (e) => { billing = e.target.value; render(); });
  sizes.addEventListener('change', (e) => { n = +e.target.value; render(); });
  $('#planCta').addEventListener('click', () => { emit('size', n); });
  render(true);
}

/* ---------- newsletter ---------- */
export function initNewsletter() {
  const form = $('#news'), input = $('#email'), msg = $('#newsMsg');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = input.value.trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    msg.className = 'news__msg';
    if (!ok) {
      input.setAttribute('aria-invalid', 'true'); msg.classList.add('is-err');
      msg.textContent = v ? 'That email looks off. Check it and try again.' : 'Add your email address first.';
      input.focus();
      if (hasGsap && !reduced) gsap.fromTo(input, { x: -10 }, { x: 0, duration: 0.7, ease: 'elastic.out(1,.25)' });
      return;
    }
    input.removeAttribute('aria-invalid');
    msg.classList.add('is-ok'); msg.textContent = 'You are on the list. First note lands next month.';
    input.value = '';
    emit('confetti', { el: form.querySelector('button') });
  });
  input.addEventListener('input', () => input.removeAttribute('aria-invalid'));
}

/* ---------- footer wordmark ---------- */
export function initFooterWord() {
  const w = $('#footWord');
  const txt = w.textContent; w.textContent = '';
  const chars = Array.from(txt).map((c) => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; w.appendChild(s); return s; });
  if (!hasGsap || reduced) return;
  gsap.from(chars, { yPercent: -120, rotation: () => (Math.random() - 0.5) * 30, opacity: 0, duration: 1.2, stagger: 0.05, ease: 'bounce.out', scrollTrigger: { trigger: w, start: 'top 95%', once: true } });
  if (matchMedia('(hover:hover)').matches) {
    chars.forEach((c) => c.addEventListener('pointerenter', () => {
      gsap.fromTo(c, { y: 0, scaleY: 1 }, { keyframes: [{ y: -50, scaleY: 1.12, duration: 0.18, ease: 'power2.out' }, { y: 0, scaleY: 0.85, duration: 0.16, ease: 'power2.in' }, { scaleY: 1, duration: 0.7, ease: 'elastic.out(1,.3)' }], overwrite: true });
    }));
  }
}

/* ---------- hero intro ---------- */
export function initHeroIntro() {
  const title = $('.hero__title');
  const words = splitWords(title);
  if (!hasGsap || reduced) return;
  const tl = gsap.timeline({ delay: 0.1 });
  tl.fromTo(words, { opacity: 0, y: 70, scale: 0.6, rotation: (i) => (i % 2 ? 7 : -7) }, { opacity: 1, y: 0, scale: 1, rotation: 0, duration: 1.1, stagger: 0.09, ease: 'elastic.out(1,.55)' });
  tl.to(title.querySelector('em'), { '--hl': 1, duration: 0.8, ease: 'power3.out' }, 0.7);
  tl.fromTo('.hero__copy > *:not(.hero__title)', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.09, ease: 'power3.out' }, 0.5);
  tl.from('.hero__badge', { scale: 0, rotation: -120, duration: 1.1, ease: 'back.out(1.8)' }, 0.9);
  tl.from('.hero__hint', { scale: 0, rotation: 20, duration: 0.9, ease: 'back.out(2.2)' }, 1.5);
  tl.from('.hero__sun', { scale: 0.6, opacity: 0, duration: 1.2, ease: 'elastic.out(1,.6)' }, 0.1);
  gsap.set(title.querySelector('em'), { '--hl': 0 });
  gsap.to('.hero__badge', { rotation: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__sun', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
}
