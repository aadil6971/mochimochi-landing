/* How it's made: one pinned, scroll-scrubbed illustration. Rice -> mochi -> filling -> frozen. */
import { $, $$, hasGsap, reduced, state } from './ctx.js';

const NS = 'http://www.w3.org/2000/svg';
const rnd = (a, b) => a + Math.random() * (b - a);

export function initMaking() {
  const section = $('#making');
  const steps = $$('.step', section);
  const dots = $$('.making__dots li', section);
  const polaroid = $('#polaroid');
  if (!hasGsap) { section.classList.add('making--static'); return; }

  /* ---- build grains ---- */
  const gWrap = $('#mkGrains');
  const grains = [];
  let seed = 7;
  const r = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  for (let i = 0; i < 70; i++) {
    const e = document.createElementNS(NS, 'ellipse');
    e.setAttribute('rx', 11); e.setAttribute('ry', 5.5); e.setAttribute('fill', '#FFFDF5');
    e.setAttribute('stroke', '#2A1420'); e.setAttribute('stroke-width', 2.5);
    gWrap.appendChild(e);
    const x = 300 + (r() * 2 - 1) * 150;
    const mound = 96 * Math.max(0, 1 - Math.pow((x - 300) / 165, 2));
    const y1 = 392 - r() * mound - 6;
    grains.push({ el: e, x, y1, y0: y1 - 560 - r() * 340, rot: r() * 180 - 90 });
    gsap.set(e, { x, y: y1 - 700, rotation: r() * 360 });
  }

  /* ---- final mochi (clone of the dough, so it can leave the bowl) ---- */
  const dough = $('#mkDough');
  const doughWrap = $('#mkDoughWrap');
  const final = dough.cloneNode(true);
  final.removeAttribute('id');
  $$('[id]', final).forEach((n) => n.removeAttribute('id'));
  const fw = document.createElementNS(NS, 'g');
  fw.setAttribute('transform', 'translate(300 350)');
  fw.appendChild(final);
  $('#mkBowl').after(fw);
  const finalShape = final.querySelector('path');
  finalShape.setAttribute('fill', '#CFE59A');
  final.querySelector('g').setAttribute('opacity', 1);
  gsap.set(final, { opacity: 0, transformOrigin: '50% 100%', scale: 0.92 });

  /* ---- snowflakes ---- */
  const flakes = $('#mkFlakes');
  const flakeEls = [];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.3;
    const rad = 205 + (i % 2) * 34;
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('transform', `translate(${(300 + Math.cos(a) * rad).toFixed(1)} ${(320 + Math.sin(a) * rad * 0.9).toFixed(1)})`);
    const inner = document.createElementNS(NS, 'g');
    const u = document.createElementNS(NS, 'use');
    const s = 30 + (i % 3) * 12;
    u.setAttribute('href', '#i-snow'); u.setAttribute('x', -s / 2); u.setAttribute('y', -s / 2);
    u.setAttribute('width', s); u.setAttribute('height', s); u.style.color = '#fff';
    inner.appendChild(u); g.appendChild(inner); flakes.appendChild(g);
    flakeEls.push(inner);
    gsap.set(inner, { scale: 0, transformOrigin: '50% 50%' });
  }

  const mallet = $('#mkMallet'), scoop = $('#mkScoop'), bowl = $('#mkBowl');
  gsap.set(mallet, { x: 300, y: -300, opacity: 0 });
  gsap.set(scoop, { x: 300, y: -260 });
  gsap.set(dough, { transformOrigin: '50% 100%', scale: 0, opacity: 0 });
  gsap.set(bowl, { y: 0 });

  const temp = { t: 20 };
  const tempEl = $('#mkTemp'), merc = $('#mkMerc');
  const bgs = ['#FFE9A8', '#FFA3C0', '#7CC4E0', '#12274B'];

  const tl = gsap.timeline({ defaults: { ease: 'none' } });

  /* Step 1: rice falls into the bowl, steam rises */
  tl.to(grains.map((g) => g.el), { y: (i) => grains[i].y1, rotation: (i) => grains[i].rot, duration: 0.55, ease: 'power2.in', stagger: { each: 0.007 } }, 0.02);
  tl.to('#mkSteam', { opacity: 1, duration: 0.25 }, 0.62);
  tl.to(bowl, { y: 6, duration: 0.06, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 0.58);

  /* Step 2: grains melt into dough, mallet pounds it */
  tl.to('#mkSteam', { opacity: 0, duration: 0.2 }, 1.0);
  tl.to(section, { backgroundColor: bgs[1], duration: 0.3 }, 0.85);
  tl.to(grains.map((g) => g.el), { x: 300, y: 340, scale: 0.15, opacity: 0, duration: 0.42, ease: 'power2.in', stagger: { each: 0.004 } }, 1.02);
  tl.set(dough, { opacity: 1 }, 1.2);
  tl.to(dough, { scale: 0.9, duration: 0.3, ease: 'back.out(2)' }, 1.2);
  tl.set(mallet, { opacity: 1 }, 1.3);
  tl.to(mallet, { y: 0, duration: 0.14, ease: 'power2.out' }, 1.32);
  const hit = (t0, s) => {
    tl.to(mallet, { y: 118, duration: 0.09, ease: 'power3.in' }, t0);
    tl.to(dough, { scaleY: s * 0.8, scaleX: s * 1.12, duration: 0.05 }, t0 + 0.08);
    tl.to(mallet, { y: 0, duration: 0.1, ease: 'power2.out' }, t0 + 0.14);
    tl.to(dough, { scaleY: s * 1.03, scaleX: s * 0.99, duration: 0.1, ease: 'back.out(3)' }, t0 + 0.14);
  };
  hit(1.5, 0.94); hit(1.7, 1.0); hit(1.9, 1.06);
  tl.to(mallet, { y: -300, duration: 0.2, ease: 'power2.in' }, 2.08);
  tl.set(mallet, { opacity: 0 }, 2.3);

  /* Step 3: flatten, drop the scoop, wrap */
  tl.to(section, { backgroundColor: bgs[2], duration: 0.3 }, 1.95);
  tl.to(dough, { scaleX: 1.42, scaleY: 0.3, y: -10, duration: 0.3, ease: 'power2.inOut' }, 2.2);
  tl.to(scoop, { y: 318, duration: 0.24, ease: 'power2.in' }, 2.5);
  tl.to(scoop, { scaleY: 0.86, scaleX: 1.08, transformOrigin: '50% 100%', duration: 0.05 }, 2.74);
  tl.to(scoop, { scaleY: 1, scaleX: 1, duration: 0.1, ease: 'back.out(3)' }, 2.79);
  tl.to(scoop, { y: 300, scale: 0.7, opacity: 0, duration: 0.2, ease: 'power2.in' }, 2.84);
  tl.to(dough, { scaleX: 0.92, scaleY: 0.92, y: 0, duration: 0.24, ease: 'back.out(1.6)' }, 2.84);
  tl.to(finalShape, { fill: '#CFE59A', duration: 0.001 }, 0);
  tl.to(dough.querySelector('path'), { fill: '#CFE59A', duration: 0.24 }, 2.84);
  tl.to('#mkDoughDots', { opacity: 1, duration: 0.2 }, 2.9);

  /* Step 4: out of the bowl, into the freezer */
  tl.set(dough, { opacity: 0 }, 3.02);
  tl.set(final, { opacity: 1 }, 3.02);
  tl.to(section, { backgroundColor: bgs[3], color: '#FFF1DC', duration: 0.35 }, 2.95);
  tl.to('#mkDisc', { fill: '#2C4E96', fillOpacity: 0.55, duration: 0.35 }, 2.95);
  tl.to(bowl, { y: 300, opacity: 0, duration: 0.4, ease: 'power2.in' }, 3.05);
  tl.to(final, { y: -6, scale: 1.08, duration: 0.4, ease: 'back.out(1.6)' }, 3.2);
  tl.to('#mkFrost', { opacity: 1, duration: 0.2 }, 3.3);
  tl.to(flakeEls, { scale: 1, rotation: 90, duration: 0.4, ease: 'back.out(2)', stagger: 0.03 }, 3.3);
  tl.to('#mkRing', { rotation: 60, svgOrigin: '300 330', duration: 0.7 }, 3.3);
  tl.to('#mkThermo', { opacity: 1, duration: 0.2 }, 3.3);
  tl.to(temp, { t: -25, duration: 0.62, ease: 'power1.out', onUpdate: () => { tempEl.textContent = Math.round(temp.t) + '°'; } }, 3.38);
  tl.to(merc, { attr: { height: 70, y: 340 }, duration: 0.62, ease: 'power1.out' }, 3.38);
  tl.to(final, { y: -12, duration: 0.3, ease: 'sine.inOut' }, 3.7);
  tl.set({}, {}, 4);

  /* ---- static (reduced motion): jump to the finished picture ---- */
  if (reduced) {
    tl.progress(1);
    section.classList.add('making--static');
    return;
  }

  const setStep = (i) => {
    steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
    polaroid.classList.toggle('is-on', i === 1 || i === 2);
    $$('.polaroid__img', polaroid).forEach((img) => img.classList.toggle('is-on', +img.dataset.for === i));
  };
  let idx = -1;

  state.makingST = ScrollTrigger.create({
    trigger: section, start: 'top top', end: '+=360%', pin: true, anticipatePin: 1, scrub: 0.6, animation: tl,
    onUpdate: (self) => {
      const p = self.progress;
      const i = Math.min(3, Math.floor(p * 4 + 0.001));
      if (i !== idx) { idx = i; setStep(i); }
      dots.forEach((d, k) => d.style.setProperty('--p', Math.min(1, Math.max(0, p * 4 - k)).toFixed(3)));
    },
  });
  setStep(0);
}
