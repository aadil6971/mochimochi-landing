/* Flavour gallery: pick one, the whole page changes colour and the tasting notes swap. */
import { FLAVOURS, ART, DOTS, PLUM } from './data.js';
import { $, $$, hasGsap, reduced, splitChars, pad2, emit, on } from './ctx.js';

const DEFAULT = { bg: '#FFF1DC', ink: '#2A1420' };
const root = document.documentElement;
const themeMeta = document.querySelector('meta[name="theme-color"]');

export function setTheme(f) {
  const t = f || DEFAULT;
  root.style.setProperty('--bg', t.bg);
  root.style.setProperty('--ink', t.ink);
  if (themeMeta) themeMeta.setAttribute('content', t.bg);
}

function starPath(cx, cy, ro, ri, n) {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? ri : ro, a = (Math.PI * i) / n - Math.PI / 2;
    d += (i ? 'L' : 'M') + (cx + Math.cos(a) * r).toFixed(1) + ' ' + (cy + Math.sin(a) * r).toFixed(1);
  }
  return d + 'Z';
}

const SLOTS = [
  { t: 'translate(24 44) rotate(-14 85 85) scale(.86)' },
  { t: 'translate(392 388) rotate(12 85 85) scale(.8)' },
  { t: 'translate(446 24) rotate(20 65 65) scale(.62)' },
];

function dotsFor(f, scale, ox, oy, r) {
  const n = Math.round(DOTS.length * f.dots * 0.9);
  return DOTS.slice(0, n).map(([x, y]) => `<circle cx="${(ox + x * scale).toFixed(1)}" cy="${(oy + y * scale).toFixed(1)}" r="${r}"/>`).join('');
}

export function initGallery() {
  const svg = $('#flSvg');
  const picker = $('#picker');
  let current = FLAVOURS[0];
  let themeOn = false;
  let counts = {};

  /* --- chips --- */
  picker.insertAdjacentHTML('beforeend', FLAVOURS.map((f, i) => `
    <label class="chip">
      <input type="radio" name="flavour" value="${f.id}" ${i === 0 ? 'checked' : ''}>
      <span class="chip__body">
        <svg viewBox="0 0 100 100" aria-hidden="true"><use href="#mochi" style="--m:${f.mochi};--sp:${f.speck}"/></svg>
        <span>${f.name}</span>
      </span>
    </label>`).join(''));

  /* --- scene --- */
  const whole = `<path class="fl-skin" d="M50 12C74 12 92 30 92 55c0 20-17 33-42 33S8 75 8 55C8 30 26 12 50 12Z" stroke="${PLUM}" stroke-width="3" stroke-linejoin="round"/>
    <g class="fl-speck" id="flWholeDots"></g>
    <path d="M22 46c3-14 14-23 29-25" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M40 84c7 3 14 3 21 0" fill="none" stroke="${PLUM}" stroke-opacity=".28" stroke-width="2" stroke-linecap="round"/>`;
  svg.innerHTML = `
    <g id="flBurstW"><g id="flBurst"><path d="${starPath(300, 300, 288, 256, 22)}" fill="#fff" fill-opacity=".3" stroke="#fff" stroke-opacity=".3" stroke-width="18" stroke-linejoin="round"/></g></g>
    <g transform="${SLOTS[0].t}"><g class="fl-art" id="flArt0"></g></g>
    <g transform="${SLOTS[2].t}"><g class="fl-art" id="flArt2"></g></g>
    <ellipse cx="300" cy="536" rx="214" ry="20" fill="${PLUM}" opacity=".2"/>
    <g transform="translate(345 285)"><g class="fl-anim" id="flCut">
      <circle r="176" class="fl-skin" stroke="${PLUM}" stroke-width="7"/>
      <circle r="150" class="fl-fill" stroke="${PLUM}" stroke-width="5"/>
      <g fill="none" stroke="${PLUM}" stroke-opacity=".13" stroke-width="7" stroke-linecap="round">
        <path d="M-96 -44c30-42 104-52 146-10"/><path d="M-116 24c44 12 94-22 116 10"/><path d="M-40 78c52 22 104 0 136-42"/></g>
      <g class="fl-speck" id="flCutDots"></g>
      <path d="M-124 -78c10-30 40-58 82-68" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="10" stroke-linecap="round"/>
    </g></g>
    <g transform="translate(66 296) scale(2.1)"><g class="fl-anim" id="flWhole">${whole}</g></g>
    <g transform="${SLOTS[1].t}"><g class="fl-art" id="flArt1"></g></g>`;

  const burst = $('#flBurst');
  if (hasGsap && !reduced) {
    gsap.to(burst, { rotation: 360, svgOrigin: '300 300', duration: 80, ease: 'none', repeat: -1 });
    [0, 1, 2].forEach((i) => gsap.to(`#flArt${i}`, { y: i % 2 ? -8 : 8, rotation: i % 2 ? 3 : -3, duration: 2.6 + i * 0.5, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 50%' }));
  }

  /* --- meters --- */
  $$('#flMeters dd').forEach((dd) => { dd.innerHTML = '<span class="dots" role="img">' + '<span class="dot"></span>'.repeat(5) + '</span>'; });

  function paintArt(f, animate) {
    f.art.forEach((a, i) => {
      const g = $('#flArt' + i);
      g.innerHTML = ART[a.k](a.c);
      if (animate && hasGsap && !reduced) gsap.fromTo(g.parentNode.firstElementChild, { scale: 0, rotation: -40, transformOrigin: '50% 50%' }, { scale: 1, rotation: 0, duration: 0.9, delay: 0.08 * i, ease: 'back.out(2.2)' });
    });
  }

  function paint(f, animate) {
    svg.style.setProperty('--m', f.mochi);
    svg.style.setProperty('--fill', f.fill);
    svg.style.setProperty('--sp', f.speck);
    $('#flWholeDots').innerHTML = dotsFor(f, 1, 0, 0, 1.9);
    $('#flCutDots').innerHTML = dotsFor(f, 2.3, -118, -118, 4.2);
    paintArt(f, animate);
    if (animate && hasGsap && !reduced) {
      gsap.fromTo('#flWhole', { scaleX: 1.14, scaleY: 0.82, transformOrigin: '50% 100%' }, { scaleX: 1, scaleY: 1, duration: 1.1, ease: 'elastic.out(1,.32)' });
      gsap.fromTo('#flCut', { rotation: -9, scale: 0.9, transformOrigin: '50% 50%' }, { rotation: 0, scale: 1, duration: 1.1, ease: 'elastic.out(1,.4)' });
    }
  }

  function text(f, animate) {
    const idx = FLAVOURS.indexOf(f);
    $('#flIdx').textContent = pad2(idx + 1);
    const name = $('#flName');
    name.textContent = f.name;
    $('#flJp').textContent = f.jp;
    $('#flRomaji').textContent = f.romaji;
    $('#flWords').innerHTML = f.words.map((w) => `<li>${w}</li>`).join('');
    $('#flNote').textContent = f.note;
    $('#flMade').textContent = f.made;
    $('#flPairs').textContent = f.pairs;
    const card = $('#flCard');
    card.style.setProperty('--f-fill', f.fill);
    card.style.setProperty('--f-mochi', f.mochi);
    $$('#flMeters dd').forEach((dd) => {
      const v = f.meters[dd.dataset.m];
      $('.dots', dd).setAttribute('aria-label', `${dd.previousElementSibling.textContent}: ${v} out of 5`);
      $$('.dot', dd).forEach((d, i) => {
        d.classList.toggle('on', i < v);
        if (animate && hasGsap && !reduced) gsap.fromTo(d, { scale: 0.4 }, { scale: 1, duration: 0.7, delay: 0.25 + i * 0.05, ease: 'back.out(3)' });
      });
    });
    const chars = splitChars(name);
    if (animate && hasGsap && !reduced) {
      gsap.from(chars, { yPercent: 70, rotation: 8, opacity: 0, duration: 0.7, stagger: 0.025, ease: 'back.out(2.4)' });
      gsap.from(['#flJp', '#flWords li', '#flNote', '#flMeters', '.fl__meta', '.fl__actions'], { y: 18, opacity: 0, duration: 0.6, stagger: 0.05, ease: 'power3.out', delay: 0.1 });
    }
    $('#flLive').textContent = `${f.name}, ${f.romaji}. Tastes ${f.words.join(', ')}.`;
    refreshAdded();
  }

  function refreshAdded() {
    const n = counts[current.id] || 0;
    $('#flAdded').textContent = n ? `${n} in your box` : '';
  }

  function select(id, { user = false } = {}) {
    const f = FLAVOURS.find((x) => x.id === id) || FLAVOURS[0];
    const changed = f !== current;
    current = f;
    if (user) themeOn = true;
    if (themeOn || !hasGsap) setTheme(f);
    if (changed || user) { paint(f, changed); text(f, changed); }
    $$('input[name=flavour]', picker).forEach((i) => { i.checked = i.value === id; });
  }

  picker.addEventListener('change', (e) => { if (e.target.name === 'flavour') select(e.target.value, { user: true }); });

  $('#flAdd').addEventListener('click', (e) => {
    emit('add', { id: current.id, from: 'gallery' });
    const btn = e.currentTarget;
    if (hasGsap && !reduced) gsap.fromTo(btn, { scale: 1.12, rotation: -3 }, { scale: 1, rotation: 0, duration: 0.7, ease: 'elastic.out(1,.35)' });
  });
  on('counts', (c) => { counts = c; refreshAdded(); });

  paint(current, false);
  text(current, false);

  if (hasGsap) {
    ScrollTrigger.create({
      trigger: '#flavours', start: 'top 60%',
      onEnter: () => { themeOn = true; setTheme(current); },
      onEnterBack: () => { themeOn = true; setTheme(current); },
      onLeaveBack: () => { themeOn = false; setTheme(null); },
    });
  }
}
