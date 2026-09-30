/* Hero: eight soft mochi in a tiny physics world. Poke, drag, throw.
   Custom circle physics + Three.js (orthographic) with a squash/dent vertex shader. */
import * as THREE from './vendor/three.module.min.js';
import { FLAVOURS } from './data.js';

const hex = (h) => {
  const n = parseInt(h.slice(1), 16);
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

const VERT = /* glsl */ `
uniform vec4 uSq;        // xyz = axis, w = amount (scale along axis = 1 + w)
uniform vec3 uDentDir;
uniform float uDent;
uniform float uDentK;
uniform float uOutline;
uniform float uBulge;
varying vec3 vN;
varying vec3 vObj;
varying float vDent;
void main() {
  vec3 p = position;
  vec3 n = normal;
  vObj = position;
  p.y *= 0.9;
  // poke dent
  float c = dot(n, uDentDir);
  float g = exp(-uDentK * (1.0 - c));
  vDent = uDent * g;
  p += n * (-uDent * g);
  vec3 tang = uDentDir - n * c;
  n = normalize(n + uDent * uDentK * g * tang);
  p.xy *= 1.0 + uBulge;
  // squash & stretch (volume preserving)
  float s = max(0.35, 1.0 + uSq.w);
  float t = inversesqrt(s);
  vec3 a = uSq.xyz;
  p = t * p + (s - t) * a * dot(a, p);
  n = normalize((1.0 / t) * n + (1.0 / s - 1.0 / t) * a * dot(a, n));
  p += n * uOutline;
  vN = normalize(normalMatrix * n);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;

const FRAG = /* glsl */ `
precision highp float;
uniform vec3 uColor;
uniform vec3 uSpeck;
uniform float uDots;
uniform float uRot;
uniform float uSeed;
varying vec3 vN;
varying vec3 vObj;
varying float vDent;
float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x) {
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
void main() {
  vec3 n = normalize(vN);
  float sr = sin(uRot), cr = cos(uRot);
  vec3 o = vec3(cr * vObj.x - sr * vObj.y, sr * vObj.x + cr * vObj.y, vObj.z) + uSeed;
  float dust = noise(o * 34.0) * 0.55 + noise(o * 88.0) * 0.45;
  vec3 q = o * 13.0; vec3 id = floor(q); vec3 f = fract(q) - 0.5;
  vec3 jit = (vec3(hash(id + 1.7), hash(id + 5.3), hash(id + 9.1)) - 0.5) * 0.5;
  float d = length(f - jit);
  float r = mix(0.11, 0.21, hash(id + 11.3));
  float sp = (1.0 - smoothstep(r * 0.65, r, d)) * step(1.0 - uDots * 0.5, hash(id + 3.1));
  vec3 base = uColor * (0.94 + dust * 0.12);
  base = mix(base, uSpeck, sp * 0.92);
  vec3 L = normalize(vec3(-0.5, 0.65, 0.62));
  float nl = dot(n, L);
  float w = clamp((nl + 0.5) / 1.5, 0.0, 1.0);
  w = w * w * (3.0 - 2.0 * w);
  vec3 shade = base * vec3(0.66, 0.6, 0.72);
  vec3 col = mix(shade, base * 1.05, w);
  col += base * 0.08 * clamp(-n.y, 0.0, 1.0);
  float rim = pow(1.0 - clamp(n.z, 0.0, 1.0), 2.8);
  col += vec3(1.0, 0.96, 0.9) * rim * 0.16;
  vec3 h = normalize(L + vec3(0.0, 0.0, 1.0));
  col += vec3(1.0) * pow(clamp(dot(n, h), 0.0, 1.0), 30.0) * 0.16;
  col *= 1.0 - clamp(vDent * 0.95, 0.0, 0.4);
  gl_FragColor = vec4(col, 1.0);
}`;

const OUT_FRAG = /* glsl */ `
precision highp float;
void main() { gl_FragColor = vec4(0.1647, 0.0784, 0.1255, 1.0); }`;

const SHADOW_VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const SHADOW_FRAG = `precision highp float; varying vec2 vUv; uniform float uA;
void main(){ float d = length((vUv - 0.5) * 2.0); float a = smoothstep(1.0, 0.15, d) * uA; gl_FragColor = vec4(0.1647, 0.0784, 0.1255, a); }`;

export function initHero({ canvas, stage, reduced = false, onPoke = () => {}, onHover = () => {} }) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    return null;
  }
  if (!renderer.getContext()) return null;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 3000);
  camera.position.z = 1000;

  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  const sphere = new THREE.SphereGeometry(1, small ? 40 : 64, small ? 30 : 48);
  const plane = new THREE.PlaneGeometry(2, 2);

  let W = 0, H = 0, R = 60, floorY = 0;
  const order = [0, 3, 2, 5, 1, 6, 4, 7]; // interleave colours so the pile looks lively
  const bodies = order.map((fi, i) => {
    const f = FLAVOURS[fi];
    const uniforms = {
      uColor: { value: hex(f.mochi) },
      uSpeck: { value: hex(f.speck) },
      uDots: { value: f.dots },
      uRot: { value: rand(0, 6.28) },
      uSeed: { value: rand(0, 50) },
      uSq: { value: new THREE.Vector4(0, 1, 0, 0) },
      uDentDir: { value: new THREE.Vector3(0, 0, 1) },
      uDent: { value: 0 },
      uDentK: { value: 6.5 },
      uOutline: { value: 0 },
      uBulge: { value: 0 },
    };
    const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms });
    const outMat = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: OUT_FRAG, side: THREE.BackSide,
      uniforms: { ...uniforms, uOutline: { value: 0.05 } },
    });
    const mesh = new THREE.Mesh(sphere, mat);
    const hull = new THREE.Mesh(sphere, outMat);
    const shMat = new THREE.ShaderMaterial({ vertexShader: SHADOW_VERT, fragmentShader: SHADOW_FRAG, transparent: true, depthWrite: false, uniforms: { uA: { value: 0.3 } } });
    const shadow = new THREE.Mesh(plane, shMat);
    shadow.renderOrder = -1;
    hull.renderOrder = 1; mesh.renderOrder = 2;
    scene.add(shadow, hull, mesh);
    return {
      f, i, mesh, hull, shadow, uniforms, outU: outMat.uniforms.uOutline, shU: shMat.uniforms.uA,
      k: rand(0.94, 1.06), x: 0, y: 0, vx: 0, vy: 0, r: 50,
      sq: 0, sqv: 0, ax: 0, ay: 1, dn: 0, dnv: 0, dnT: 0,
      grabbed: false, pressed: false, floor: false, hop: 0,
    };
  });

  /* ---------- layout ---------- */
  function layout(first) {
    const rect = stage.getBoundingClientRect();
    const nw = Math.max(200, Math.round(rect.width)), nh = Math.max(200, Math.round(rect.height));
    const sx = W ? nw / W : 1, sy = H ? nh / H : 1;
    W = nw; H = nh;
    const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H, false);
    camera.left = -W / 2; camera.right = W / 2; camera.top = H / 2; camera.bottom = -H / 2;
    camera.updateProjectionMatrix();
    R = clamp(Math.sqrt(0.0135 * W * H), 34, 118);
    floorY = -H / 2 + 8;
    bodies.forEach((b) => {
      b.r = R * b.k;
      b.uniforms.uDentK.value = 6.5;
      b.outU.value = 3.2 / b.r;
      if (!first) { b.x *= sx; b.y *= sy; }
      b.x = clamp(b.x, -W / 2 + b.r, W / 2 - b.r);
      b.y = Math.max(b.y, floorY + b.r * 0.9);
    });
    if (!first) wake();
  }

  function spawn() {
    bodies.forEach((b, i) => {
      b.x = rand(-W / 2 + b.r, W / 2 - b.r) * 0.85;
      b.y = H / 2 + b.r * (1.2 + i * 1.25);
      b.vx = rand(-140, 140);
      b.vy = rand(-200, 0);
      b.sq = b.sqv = b.dn = b.dnv = b.dnT = 0;
    });
  }

  /* ---------- physics ---------- */
  const G = () => H * 3.3;
  function kickSquash(b, nx, ny, speed, gain = 0.0004) {
    // blend axis toward contact normal
    if (Math.abs(b.sq) < 0.05) { b.ax = nx; b.ay = ny; }
    else { const mx = b.ax + nx * (nx * b.ax + ny * b.ay >= 0 ? 1 : -1) * 0.6, my = b.ay + ny * (nx * b.ax + ny * b.ay >= 0 ? 1 : -1) * 0.6; const l = Math.hypot(mx, my) || 1; b.ax = mx / l; b.ay = my / l; }
    b.sqv -= clamp(speed * gain, 0, 0.7) * 12;
  }

  let pointer = { x: 0, y: 0, active: false };
  let grab = null;

  function step(dt) {
    const g = G();
    const grabbedBody = grab ? grab.b : null;
    for (const b of bodies) {
      if (b.grabbed) {
        // follow pointer (kinematic), keep velocity for the throw
        const tx = pointer.x - grab.ox, ty = pointer.y - grab.oy;
        const cx = clamp(tx, -W / 2 + b.r, W / 2 - b.r), cy = Math.max(ty, floorY + b.r * 0.9);
        let vx = (cx - b.x) * 24, vy = (cy - b.y) * 24;
        const sp = Math.hypot(vx, vy), cap = 3400;
        if (sp > cap) { vx *= cap / sp; vy *= cap / sp; }
        b.vx = vx; b.vy = vy;
        b.x += vx * dt; b.y += vy * dt;
        // stretch toward motion
        const l = Math.hypot(vx, vy);
        if (l > 60) { b.ax = vx / l; b.ay = vy / l; }
        b.sqT = clamp(l / 5200, 0, 0.16);
        continue;
      }
      b.sqT = 0;
      b.vy -= g * dt;
      b.vx *= 0.9994; b.vy *= 0.9997;
      b.x += b.vx * dt; b.y += b.vy * dt;
      b.floor = false;
      // floor
      const fy = floorY + b.r * 0.9;
      if (b.y < fy) {
        const imp = -b.vy;
        b.y = fy;
        if (imp > 80) { b.vy = imp * 0.5; kickSquash(b, 0, 1, imp); } else { b.vy = 0; }
        b.vx *= 0.985;
        b.floor = true;
      }
      // walls
      const lx = -W / 2 + b.r, rx = W / 2 - b.r;
      if (b.x < lx) { const imp = -b.vx; b.x = lx; b.vx = imp * 0.55; if (imp > 120) kickSquash(b, 1, 0, imp); }
      if (b.x > rx) { const imp = b.vx; b.x = rx; b.vx = -imp * 0.55; if (imp > 120) kickSquash(b, 1, 0, imp); }
    }
    // pairs
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i], b = bodies[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const min = (a.r + b.r) * 0.97;
        const d2 = dx * dx + dy * dy;
        if (d2 >= min * min || d2 === 0) continue;
        const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, ov = min - d;
        const ma = a.grabbed ? 1e6 : a.r * a.r, mb = b.grabbed ? 1e6 : b.r * b.r;
        const tm = ma + mb;
        a.x -= nx * ov * (mb / tm); a.y -= ny * ov * (mb / tm);
        b.x += nx * ov * (ma / tm); b.y += ny * ov * (ma / tm);
        const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (rv < 0) {
          const e = 0.62;
          const jn = (-(1 + e) * rv) / (1 / ma + 1 / mb);
          if (!a.grabbed) { a.vx -= (jn / ma) * nx; a.vy -= (jn / ma) * ny; }
          if (!b.grabbed) { b.vx += (jn / mb) * nx; b.vy += (jn / mb) * ny; }
          const sp = -rv;
          if (sp > 90) { kickSquash(a, nx, ny, sp * (mb / tm) * 1.4); kickSquash(b, nx, ny, sp * (ma / tm) * 1.4); }
        }
      }
    }
    // springs (squash + dent) and rolling
    for (const b of bodies) {
      const target = b.grabbed ? (b.sqT || 0) : b.floor ? -0.045 : 0;
      b.sqv += ((target - b.sq) * 320 - b.sqv * 10.5) * dt;
      b.sq += b.sqv * dt;
      b.sq = clamp(b.sq, -0.4, 0.4);
      b.dnv += ((b.dnT - b.dn) * 420 - b.dnv * 12.5) * dt;
      b.dn += b.dnv * dt;
      b.dn = clamp(b.dn, -0.15, 0.7);
      if (b.floor) b.uniforms.uRot.value -= (b.vx / b.r) * dt * 0.9;
      else b.uniforms.uRot.value += b.vx * 0.0006 * dt;
    }
  }

  /* ---------- render sync ---------- */
  function sync() {
    for (const b of bodies) {
      b.mesh.position.set(b.x, b.y, 0);
      b.hull.position.copy(b.mesh.position);
      b.mesh.scale.setScalar(b.r); b.hull.scale.setScalar(b.r);
      b.uniforms.uSq.value.set(b.ax, b.ay, 0, b.sq);
      b.uniforms.uDent.value = b.dn;
      b.uniforms.uBulge.value = Math.max(0, b.dn) * 0.2;
      const h = clamp((b.y - (floorY + b.r * 0.9)) / (H * 0.6), 0, 1);
      b.shadow.position.set(b.x, floorY + 2, -900);
      b.shadow.scale.set(b.r * (1.05 - h * 0.45), b.r * 0.2 * (1 - h * 0.4), 1);
      b.shU.value = 0.34 * (1 - h * 0.85);
    }
    renderer.render(scene, camera);
  }

  /* ---------- loop ---------- */
  let raf = 0, last = 0, acc = 0, visible = true, idleUntil = 0, nextHop = 0, running = false;
  const SUB = 1 / 120;
  function frame(t) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (t - last) / 1000 || SUB);
    last = t;
    acc += dt;
    while (acc >= SUB) { step(SUB); acc -= SUB; }
    // idle hops keep the pile alive
    if (!reduced && !grab && t > nextHop) {
      nextHop = t + rand(2600, 5200);
      const rest = bodies.filter((b) => b.floor && Math.abs(b.vy) < 30);
      if (rest.length) { const b = rest[(Math.random() * rest.length) | 0]; b.vy = rand(520, 760); b.vx += rand(-90, 90); kickSquash(b, 0, 1, 500); }
    }
    sync();
    if (reduced && t > idleUntil && !grab) stop();
  }
  function start() { if (running || !visible) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); }
  function wake(ms = 3500) { idleUntil = performance.now() + ms; start(); }

  /* ---------- pointer ---------- */
  function toWorld(e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left - W / 2, y: H / 2 - (e.clientY - r.top) };
  }
  function pick(p) {
    let best = null, bd = 1e9;
    for (const b of bodies) {
      const d = Math.hypot(p.x - b.x, p.y - b.y);
      if (d < b.r * 1.02 && d < bd) { best = b; bd = d; }
    }
    return best;
  }
  function setDent(b, p) {
    const lx = clamp((p.x - b.x) / b.r, -0.95, 0.95), ly = clamp((p.y - b.y) / (b.r * 0.9), -0.95, 0.95);
    const lz = Math.sqrt(Math.max(0.02, 1 - lx * lx - ly * ly));
    b.uniforms.uDentDir.value.set(lx, ly, lz).normalize();
  }
  let down = null, hovering = false;
  canvas.addEventListener('pointerdown', (e) => {
    if (e.button > 0) return;
    const p = toWorld(e); const b = pick(p);
    if (!b) return;
    pointer = { ...p, active: true };
    down = { b, x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId, p };
    b.pressed = true; setDent(b, p); b.dnT = 0.52;
    try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
    canvas.classList.add('is-grab');
    wake(4000);
  });
  canvas.addEventListener('pointermove', (e) => {
    const p = toWorld(e);
    if (down && e.pointerId === down.id) {
      pointer = { ...p, active: true };
      const b = down.b;
      if (!b.grabbed && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 9) {
        b.grabbed = true; b.pressed = false; b.dnT = 0;
        grab = { b, ox: down.p.x - b.x, oy: down.p.y - b.y };
        wake(6000);
      }
      return;
    }
    if (e.pointerType === 'mouse') {
      const over = !!pick(p);
      if (over !== hovering) { hovering = over; onHover(over); }
      // gentle nudge when the cursor sweeps fast through a mochi
      const b = over ? pick(p) : null;
      if (b && !down) {
        const sp = Math.hypot(e.movementX || 0, e.movementY || 0);
        if (sp > 18) { b.vx += (e.movementX || 0) * 3.2; b.vy += -(e.movementY || 0) * 3.2 + 30; wake(); }
      }
    }
  });
  function release(e) {
    if (!down || (e && e.pointerId !== down.id)) return;
    const b = down.b;
    const held = performance.now() - down.t;
    const moved = Math.hypot((e ? e.clientX : down.x) - down.x, (e ? e.clientY : down.y) - down.y);
    if (b.grabbed) {
      b.grabbed = false; grab = null;
      const sp = Math.hypot(b.vx, b.vy), cap = 2300;
      if (sp > cap) { b.vx *= cap / sp; b.vy *= cap / sp; }
      b.dnT = 0;
    } else {
      // poke: release the dent with a rebound, shove the mochi away from the fingertip
      b.pressed = false; b.dnT = 0; b.dnv = -6;
      const p = down.p;
      const dx = b.x - p.x, dy = b.y - p.y, d = Math.hypot(dx, dy) || 1;
      b.vx += (dx / d) * 380 + rand(-60, 60); b.vy += (dy / d) * 260 + 420;
      kickSquash(b, 0, 1, 380, 0.0006);
      if (held < 600 && moved < 12) onPoke(e ? e.clientX : down.x, e ? e.clientY : down.y, b.f);
    }
    down = null;
    canvas.classList.remove('is-grab');
    wake(5000);
    try { if (e) canvas.releasePointerCapture(e.pointerId); } catch (_) {}
  }
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('pointerleave', () => { if (hovering) { hovering = false; onHover(false); } });

  function shake() {
    bodies.forEach((b) => {
      b.vy += rand(700, 1250); b.vx += rand(-520, 520);
      kickSquash(b, 0, 1, 700);
    });
    wake(6000);
  }

  /* ---------- lifecycle ---------- */
  layout(true);
  if (reduced) {
    spawn();
    for (let i = 0; i < 700; i++) step(SUB);
    bodies.forEach((b) => { b.vx = b.vy = 0; b.sq = b.sqv = 0; });
    sync();
  } else {
    spawn();
    sync();
    nextHop = performance.now() + 5200;
    start();
  }
  canvas.classList.add('is-ready');

  const ro = new ResizeObserver(() => { layout(false); if (!running) sync(); });
  ro.observe(stage);
  const io = new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (!visible) stop(); else if (!reduced) start();
  }, { threshold: 0 });
  io.observe(stage);

  return {
    shake,
    dispose() { stop(); ro.disconnect(); io.disconnect(); renderer.dispose(); },
  };
}
