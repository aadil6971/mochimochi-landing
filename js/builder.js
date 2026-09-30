/* Box builder: size, flavours, live counter and price. Can't overfill. */
import { FLAVOURS, SIZES, eur } from './data.js';
import { $, $$, hasGsap, reduced, emit, on, scrollToEl } from './ctx.js';

const COLS = { 6: 3, 12: 4, 24: 6 };
const tokenSvg = (f) => `<svg viewBox="0 0 100 100" aria-hidden="true"><use href="#mochi" style="--m:${f.mochi};--sp:${f.speck}"/></svg>`;

export function initBuilder() {
  let size = 12;
  let slots = []; // ordered flavour ids
  let basket = { boxes: 0, total: 0 };
  const shown = { count: 0, box: 0, ship: 0, total: 0 };

  const sizesGrid = $('#sizesGrid');
  const list = $('#bList');
  const tray = $('#tray');
  const status = $('#bStatus');
  const addBtn = $('#bAdd');
  const obar = $('#obar');

  /* --- sizes --- */
  sizesGrid.innerHTML = SIZES.map((s) => `
    <label class="size">
      <input type="radio" name="size" value="${s.n}" ${s.n === size ? 'checked' : ''}>
      <span class="size__body">
        ${s.n === 12 ? '<span class="size__tag">Most picked</span>' : ''}
        <span class="size__n">${s.n}</span>
        <span class="size__u">mochi</span>
        <span class="size__p">${eur(s.price)}</span>
        <span class="size__each">${eur(s.price / s.n)} each${s.ship ? ' + delivery' : ', free delivery'}</span>
      </span>
    </label>`).join('');

  /* --- rows --- */
  list.innerHTML = FLAVOURS.map((f) => `
    <li class="frow" data-id="${f.id}" style="--rowc:color-mix(in srgb, ${f.mochi} 42%, #fff)">
      <span class="frow__sw">${tokenSvg(f)}</span>
      <span><span class="frow__t">${f.name}</span><span class="frow__s">${f.words.join(', ')}</span></span>
      <span class="stepper">
        <button type="button" data-d="-1" aria-label="Remove one ${f.name}"><svg class="ic" aria-hidden="true"><use href="#i-minus"/></svg></button>
        <output aria-label="${f.name} in your box">0</output>
        <button type="button" data-d="1" aria-label="Add one ${f.name}"><svg class="ic" aria-hidden="true"><use href="#i-plus"/></svg></button>
      </span>
    </li>`).join('');

  const S = () => SIZES.find((s) => s.n === size);
  const countOf = (id) => slots.filter((x) => x === id).length;
  const counts = () => Object.fromEntries(FLAVOURS.map((f) => [f.id, countOf(f.id)]));
  const flav = (id) => FLAVOURS.find((f) => f.id === id);

  function say(msg) { status.textContent = msg; }

  function tween(key, to, el, fmt) {
    if (!hasGsap || reduced) { shown[key] = to; el.textContent = fmt(to); return; }
    gsap.to(shown, { [key]: to, duration: 0.55, ease: 'power3.out', overwrite: 'auto', onUpdate: () => { el.textContent = fmt(shown[key]); } });
  }

  function money() {
    const s = S(); const n = slots.length;
    const unit = s.price / s.n;
    const box = n === s.n ? s.price : Math.round(unit * n * 100) / 100;
    const ship = n === 0 ? 0 : s.ship;
    return { box, ship, total: box + ship, full: n === s.n, n };
  }

  function renderTray(newIdx = -1) {
    const s = S();
    tray.style.setProperty('--cols', COLS[s.n]);
    tray.innerHTML = Array.from({ length: s.n }, (_, i) => `<span class="slot" data-i="${i}">${slots[i] ? tokenSvg(flav(slots[i])) : ''}</span>`).join('');
    if (newIdx >= 0 && hasGsap && !reduced) {
      const el = $(`.slot[data-i="${newIdx}"] svg`, tray);
      if (el) gsap.fromTo(el, { y: -90, scaleY: 1.3, scaleX: 0.75, opacity: 0, transformOrigin: '50% 100%' }, { y: 0, scaleY: 1, scaleX: 1, opacity: 1, duration: 0.9, ease: 'elastic.out(1,.42)' });
    }
  }

  function render(opts = {}) {
    const s = S(); const m = money();
    $('#bSize').textContent = s.n;
    $$('.frow', list).forEach((row) => {
      const id = row.dataset.id; const n = countOf(id);
      const out = $('output', row);
      if (out.textContent !== String(n)) {
        out.textContent = n;
        if (opts.pop === id && hasGsap && !reduced) { out.classList.remove('pop'); void out.offsetWidth; out.classList.add('pop'); }
      }
      row.classList.toggle('has', n > 0);
      $('[data-d="1"]', row).setAttribute('aria-disabled', String(m.full));
      $('[data-d="-1"]', row).setAttribute('aria-disabled', String(n === 0));
    });
    tween('count', m.n, $('#bCount'), (v) => Math.round(v));
    tween('box', m.box, $('#bBox'), eur);
    tween('total', m.total, $('#bTotal'), eur);
    $('#bShip').textContent = m.n === 0 ? '–' : m.ship ? eur(m.ship) : 'Free';
    const meter = $('#bMeter'); meter.style.scale = `${m.n / s.n} 1`;
    meter.parentNode.classList.toggle('full', m.full);
    const left = s.n - m.n;
    addBtn.setAttribute('aria-disabled', String(!m.full));
    const label = m.full ? `Add box · ${eur(m.total)}` : m.n === 0 ? `Pick ${s.n} mochi` : `Add ${left} more`;
    $('#bAddLabel').textContent = label;
    $('#obarBtn').textContent = m.full ? `Add · ${eur(m.total)}` : `Add ${left} more`;
    $('#obarN').textContent = `${m.n} / ${s.n}`;
    $('#obarP').textContent = m.full ? eur(m.total) + ' total' : `${left} to go`;
    const basketN = $('#basketN');
    basketN.textContent = m.n;
    $('#basket').setAttribute('aria-label', `Your box: ${m.n} of ${s.n} mochi picked`);
    if (opts.bump) { basketN.classList.remove('bump'); void basketN.offsetWidth; basketN.classList.add('bump'); }
    emit('counts', counts());
  }

  function nope(msg) {
    say(msg);
    const box = $('#bbox');
    box.classList.remove('shake-it'); void box.offsetWidth; box.classList.add('shake-it');
  }

  function add(id, from) {
    if (slots.length >= size) { nope(`Your box is full. Remove one to swap, or pick a bigger size.`); return false; }
    slots.push(id);
    const f = flav(id);
    renderTray(slots.length - 1);
    render({ pop: id, bump: true });
    const left = size - slots.length;
    say(left ? `${f.name} added. ${slots.length} of ${size}, ${left} to go.` : `${f.name} added. Your box of ${size} is full.`);
    if (from === 'gallery') showToast(`${f.name} added to your box (${slots.length} of ${size}).`);
    if (!left && hasGsap && !reduced) gsap.fromTo('#bbox', { scale: 1.03 }, { scale: 1, duration: 0.8, ease: 'elastic.out(1,.4)' });
    return true;
  }
  function remove(id) {
    const i = slots.lastIndexOf(id);
    if (i < 0) return;
    slots.splice(i, 1);
    renderTray();
    render({ pop: id });
    say(`${flav(id).name} removed. ${slots.length} of ${size}.`);
  }

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-d]');
    if (!btn) return;
    const id = btn.closest('.frow').dataset.id;
    if (btn.dataset.d === '1') add(id); else remove(id);
  });

  sizesGrid.addEventListener('change', (e) => setSize(+e.target.value, true));
  function setSize(n, user) {
    if (n === size) return;
    const old = size; size = n;
    const removed = Math.max(0, slots.length - size);
    if (removed) slots = slots.slice(0, size);
    $$('input[name=size]', sizesGrid).forEach((i) => { i.checked = +i.value === size; });
    renderTray(); render();
    say(removed ? `Box changed to ${size}. We took ${removed} off the end so it fits.` : `Box changed from ${old} to ${size}.`);
  }
  on('size', (n) => { setSize(n); });

  $('#bClear').addEventListener('click', () => { if (!slots.length) return; slots = []; renderTray(); render(); say('Box cleared.'); });
  $('#bShuffle').addEventListener('click', () => {
    const need = size - slots.length;
    if (need <= 0) { nope('Your box is already full. Clear it to try a new mix.'); return; }
    let i = 0;
    const tick = () => {
      if (i++ >= need) { say(`Surprise. ${size} mochi in your box.`); return; }
      slots.push(FLAVOURS[(Math.random() * FLAVOURS.length) | 0].id);
      renderTray(slots.length - 1); render({ bump: true });
      setTimeout(tick, reduced ? 0 : 70);
    };
    tick();
  });
  on('add', ({ id, from }) => add(id, from));

  /* --- add to basket --- */
  function checkout() {
    const m = money();
    if (!m.full) { nope(`${size - m.n} more to fill your box of ${size}. Pick a few flavours above.`); scrollToEl('.flist', { offset: -100 }); return; }
    basket.boxes += 1; basket.total += m.total;
    showToast(`Box of ${size} added: ${eur(m.total)}. Checkout is not live in this demo.`);
    emit('confetti', { el: addBtn });
    const bb = $('#bBasket');
    bb.hidden = false; bb.textContent = `In your basket: ${basket.boxes} box${basket.boxes > 1 ? 'es' : ''}, ${eur(basket.total)}`;
    slots = []; renderTray(); render();
    say(`Added. Your basket has ${basket.boxes} box${basket.boxes > 1 ? 'es' : ''}. Build another whenever you like.`);
  }
  addBtn.addEventListener('click', checkout);
  $('#obarBtn').addEventListener('click', checkout);

  let toastT;
  function showToast(msg) {
    const t = $('#toast'); t.textContent = msg; t.hidden = false;
    if (hasGsap && !reduced) gsap.fromTo(t, { y: 30, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'elastic.out(1,.5)' });
    clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 4200);
  }

  if (hasGsap) {
    ScrollTrigger.create({ trigger: '#build', start: 'top 70%', end: 'bottom 40%', onToggle: (s) => obar.classList.toggle('is-on', s.isActive) });
  }

  renderTray(); render();
}
