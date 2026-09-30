# Brief — MOCHIMOCHI: Japanese mochi ice cream, delivered frozen

**Client:** MOCHIMOCHI makes mochi ice cream in 8 flavours (matcha, black sesame, yuzu, strawberry milk, hojicha, mango, ube, salted caramel), hand-made in small batches and delivered frozen in insulated boxes of 6, 12 or 24. From €18. (Fictional brand — invent plausible details.)

**Goal:** build a box and order (primary CTA "Build your box"), or subscribe monthly (secondary).

**Art direction:** bright, playful, joyful and tactile — bold colours per flavour, chunky rounded type, squishy/bouncy motion, stickers and illustration energy. It should make people smile and feel hungry. Still clean and readable, not childish.

**Required sections (your layout):**
1. Hero with a playful wow moment (e.g. 3D/physics mochi you can poke, drag or squish; flavours bouncing in; scroll-driven box opening).
2. Flavour gallery — all 8 flavours; picking one changes the page colour and shows tasting notes.
3. How it's made — a scroll-driven step sequence (rice → mochi → filling → frozen).
4. Build your box — an interactive box builder: choose size, add flavours, live counter and price, can't overfill.
5. Delivery — how the frozen shipping works, with a fun visual.
6. Reviews — 3 short fictional reviews with star ratings.
7. Subscribe — monthly plan with a toggle and perks.
8. FAQ (accessible accordion) + footer with newsletter.
## Rules for every page (read carefully)

You are the sole art director, copywriter and front-end engineer. The result will be recorded on video: real-time scroll-throughs, hover interactions, mobile recordings and close-ups of the details. Build the best landing page you can — something a top design studio would be proud of, not a template.

**Ambition bar**
- At least one real "wow" moment that only works on the web: WebGL/Three.js scene, canvas/SVG generative visual, scroll-driven animation sequence, or physics interaction. It must be tied to the brand, not decoration.
- Scroll storytelling: sections should reveal, pin, move, morph or animate as you scroll (GSAP + ScrollTrigger, Lenis, Three.js via CDN are fine — or vanilla).
- Micro-interactions everywhere: hover states, magnetic/animated buttons, cursor details (desktop), animated counters, toggles that feel good.
- A distinctive typographic system (Google Fonts are fine) and a clear art direction that matches the client below. Avoid generic "AI landing page" look: no default purple gradients, no generic glassmorphism cards, no emoji icons.
- Write all copy yourself. No lorem ipsum. No exclamation-mark hype.

**Images**
- You may generate up to **6 images** with the Higgsfield tools (image models only, no video). Make them feel like one coherent series. Save them in `assets/` as optimised WebP/JPG with width/height set. You can also draw visuals in code.

**Technical**
- Deliver `index.html` (+ `css/`, `js/`, `assets/`) in THIS directory. Must run from a plain static server, no build step.
- Responsive and polished at 375, 768, 1280 and 1920 px. No horizontal scroll. Mobile menu.
- Semantic HTML, keyboard navigable, visible focus, AA contrast, labelled form fields, respects `prefers-reduced-motion`.
- Zero console errors, no broken assets. Aim for Lighthouse Performance ≥ 85 and Accessibility ≥ 95 on desktop.
- Test it in a real browser yourself (screenshots at several widths) before you say you're done.

**Time**: aim to finish within about 60 minutes.

**When done**: print a short summary — headline, concept in one sentence, the wow moment, images generated, anything unfinished.
