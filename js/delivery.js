/* Delivery: photo hotspots, the cold clock, and the truck that drives as you scroll. */
import { $, $$, hasGsap, reduced } from './ctx.js';

const tempAt = (h) => -20 + 12 * Math.pow(h / 72, 1.5);
const stateAt = (t) => (t < -15 ? 'Frozen solid' : t < -12 ? 'Perfectly frozen' : t < -9.5 ? 'Still frozen. Into the freezer it goes.' : 'Getting soft. Eat these first.');

export function initDelivery() {
  /* ---- hotspots ---- */
  const hots = $$('.hot');
  const tips = $$('.hot__tip');
  const close = () => { hots.forEach((h) => h.setAttribute('aria-expanded', 'false')); tips.forEach((t) => { t.hidden = true; }); };
  hots.forEach((h) => {
    const tip = $('#' + h.getAttribute('aria-controls'));
    h.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = h.getAttribute('aria-expanded') === 'true';
      close();
      if (!open) { h.setAttribute('aria-expanded', 'true'); tip.hidden = false; tip.classList.remove('is-in'); void tip.offsetWidth; tip.classList.add('is-in'); }
    });
    h.addEventListener('mouseenter', () => { if (matchMedia('(hover:hover)').matches) { close(); h.setAttribute('aria-expanded', 'true'); tip.hidden = false; tip.classList.add('is-in'); } });
  });
  $('#dlPhoto').addEventListener('mouseleave', () => { if (matchMedia('(hover:hover)').matches) close(); });
  document.addEventListener('click', (e) => { if (!e.target.closest('.dl__photo')) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  /* ---- cold clock ---- */
  const range = $('#clockRange');
  const Y = (t) => 104 - ((t + 20) / 12) * 74;
  let d = '';
  for (let h = 0; h <= 72; h += 4) d += (h ? 'L' : 'M') + ((h / 72) * 300).toFixed(1) + ' ' + Y(tempAt(h)).toFixed(1);
  $('#clockLine').setAttribute('d', d);
  const softY = Y(-9.5);
  const g = $('#clockGraph');
  g.querySelector('rect').setAttribute('height', softY);
  const ln = g.querySelector('line'); ln.setAttribute('y1', softY); ln.setAttribute('y2', softY);
  g.querySelector('text').setAttribute('y', softY - 6);

  const update = () => {
    const h = +range.value; const t = tempAt(h); const soft = Math.min(1, Math.max(0, (t + 20) / 12));
    const state = stateAt(t);
    $('#clockHours').textContent = h;
    $('#clockTemp').textContent = Math.round(t) + '°C';
    $('#clockState').textContent = state;
    $('#clockDot').setAttribute('cx', (h / 72) * 300);
    $('#clockDot').setAttribute('cy', Y(t));
    range.style.setProperty('--p', (h / 72) * 100 + '%');
    range.setAttribute('aria-valuetext', `${h} hours since dispatch. ${Math.round(t)} degrees. ${state}.`);
    const m = $('#clockMochi');
    m.style.transform = `scale(${1 + soft * 0.1}, ${1 - soft * 0.14})`;
    $('.clock__frost').style.setProperty('--frost', (1 - soft * 1.1).toFixed(2));
  };
  range.addEventListener('input', update);
  update();

  /* ---- route truck ---- */
  const truck = $('#routeTruck');
  if (hasGsap && !reduced) {
    gsap.set(truck, { x: 125, y: 40 });
    const stops = $$('.route__stops circle');
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '#route', start: 'top 85%', end: 'bottom 45%', scrub: 0.6 } });
    tl.to(truck, { x: 875, duration: 3 }, 0);
    tl.to(truck, { y: 34, duration: 0.15, yoyo: true, repeat: 19 }, 0);
    stops.forEach((s, i) => {
      if (i === 0) return;
      tl.fromTo(s, { scale: 1, transformOrigin: '50% 50%' }, { scale: 1.5, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.out' }, i - 0.1);
    });
    gsap.from('.route__labels li', { y: 24, opacity: 0, stagger: 0.12, duration: 0.8, ease: 'back.out(2)', scrollTrigger: { trigger: '#route', start: 'top 80%' } });
    gsap.from('#dlPhoto', { rotation: 4, y: 60, opacity: 0, duration: 1.1, ease: 'back.out(1.4)', scrollTrigger: { trigger: '#dlPhoto', start: 'top 85%' } });
    gsap.from('#clock', { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '#clock', start: 'top 85%' } });
  } else {
    truck.setAttribute('transform', 'translate(875 40)');
  }
}
