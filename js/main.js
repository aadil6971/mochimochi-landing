import { FLAVOURS } from './data.js';
import { $, hasGsap, reduced, emit } from './ctx.js';
import { initScroll, initNav, initCursor, initMagnetic, initReveals, initMarquee, initFaq, initSubscribe, initNewsletter, initFooterWord, initHeroIntro, pop } from './ui.js';
import { initGallery } from './gallery.js';
import { initBuilder } from './builder.js';
import { initMaking } from './making.js';
import { initDelivery } from './delivery.js';

initScroll();
initNav();
initHeroIntro();
initGallery();
initBuilder();
initMaking();
initDelivery();
initSubscribe();
initFaq();
initNewsletter();
initFooterWord();
initReveals();
initMarquee();
initMagnetic();
initCursor();

/* ---------- hero: physics mochi, loaded after first paint ---------- */
function fallbackPile() {
  const fb = $('#fallback');
  fb.hidden = false;
  const order = [0, 3, 2, 5, 1, 6, 4, 7];
  fb.innerHTML = order.map((fi, i) => {
    const f = FLAVOURS[fi];
    const row = i < 3 ? 0 : i < 6 ? 1 : 2;
    const col = row === 2 ? i - 6 : i - row * 3;
    const n = row === 2 ? 2 : 3;
    const left = 50 + (col - (n - 1) / 2) * 27 + (row === 1 ? 0 : 0);
    const bottom = 6 + row * 24;
    return `<svg viewBox="0 0 100 100" style="position:absolute;width:28%;left:${left - 14}%;bottom:${bottom}%"><use href="#mochi" style="--m:${f.mochi};--sp:${f.speck}"/></svg>`;
  }).join('');
}

let pokes = 0;
const hintMsgs = ['Soft, right?', 'It has feelings about this.', 'Okay, you are good at this.', 'Now try dragging one.'];
function startHero() {
  const canvas = $('#mochiCanvas'), stage = $('#stage');
  import('./hero3d.js').then((m) => {
    const hero = m.initHero({
      canvas, stage, reduced,
      onPoke: (x, y) => {
        pop(x, y);
        pokes++;
        if (pokes === 1 || pokes % 4 === 0) {
          const h = $('#hint'); $('#hintText').textContent = hintMsgs[Math.min(hintMsgs.length - 1, Math.floor(pokes / 4))];
          h.classList.remove('is-swap'); void h.offsetWidth; h.classList.add('is-swap');
        }
      },
      onHover: (over) => emit('hover', over),
    });
    if (!hero) { fallbackPile(); return; }
    $('#shakeBtn').addEventListener('click', () => { hero.shake(); pop(innerWidth / 2, innerHeight / 2, 'shake'); });
  }).catch((err) => { console.warn('Hero scene unavailable', err); fallbackPile(); });
}
const idle = window.requestIdleCallback || ((f) => setTimeout(f, 200));
if (document.readyState === 'complete') idle(startHero); else window.addEventListener('load', () => idle(startHero, { timeout: 1200 }), { once: true });

if (hasGsap) {
  const refresh = () => ScrollTrigger.refresh();
  document.fonts && document.fonts.ready.then(refresh);
  window.addEventListener('load', () => setTimeout(refresh, 300));
}
