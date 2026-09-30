/* Shared data: flavours, prices, illustration builders. */

export const PLUM = '#2A1420';
export const CREAM = '#FFF1DC';

export const FLAVOURS = [
  {
    id: 'matcha', name: 'Matcha', jp: '抹茶', romaji: 'matcha',
    bg: '#B5DA57', ink: '#1E2A0A', mochi: '#8DBB45', fill: '#D3E79A', speck: '#4E7A1E', dots: 0.5,
    words: ['grassy', 'toasty', 'creamy'],
    note: 'Stone-ground Uji matcha goes into the dough and into the cream. Fresh-cut grass first, a soft sweetness in the middle, and a clean bitter edge at the end.',
    made: 'Uji matcha, Jersey cream, glutinous rice',
    pairs: 'Hot genmaicha',
    meters: { sweet: 3, tang: 2, creamy: 4 },
    art: [{ k: 'leaf', c: ['#4E8A2A', '#8DBB45'] }, { k: 'leaf', c: ['#7DAE3A', '#C4E27A'] }, { k: 'leaf', c: ['#3F7A26', '#6FA836'] }],
  },
  {
    id: 'sesame', name: 'Black sesame', jp: '黒ごま', romaji: 'kuro goma',
    bg: '#35303C', ink: '#FFF1DC', mochi: '#8E8A97', fill: '#BDB8C6', speck: '#17141B', dots: 0.85,
    words: ['nutty', 'toasted', 'deep'],
    note: 'We roast the seeds until they smell like a bakery, grind them warm, and stir them through a milk base. Nutty like peanut butter, but rounder and a bit smoky.',
    made: 'Roasted black sesame, whole milk, glutinous rice',
    pairs: 'Cold oat milk',
    meters: { sweet: 2, tang: 1, creamy: 4 },
    art: [{ k: 'seeds', c: ['#17141B', '#FFF1DC'] }, { k: 'seeds', c: ['#FFF1DC', '#17141B'] }, { k: 'seeds', c: ['#17141B', '#8E8A97'] }],
  },
  {
    id: 'yuzu', name: 'Yuzu', jp: '柚子', romaji: 'yuzu',
    bg: '#FFDA3D', ink: '#2B1A00', mochi: '#FFE873', fill: '#FFF6B0', speck: '#E0B000', dots: 0.6,
    words: ['bright', 'floral', 'zippy'],
    note: 'Juice and grated peel from Japanese yuzu, folded into a light cream. Lemon with a floral streak, sharp at the start and clean at the finish. The one to have after a big dinner.',
    made: 'Yuzu juice and zest, cream, glutinous rice',
    pairs: 'Sparkling water',
    meters: { sweet: 3, tang: 5, creamy: 2 },
    art: [{ k: 'citrus', c: ['#F2A900', '#FFF0A0'] }, { k: 'citrus', c: ['#E8B400', '#FFE46A'] }, { k: 'leaf', c: ['#4E8A2A', '#8DBB45'] }],
  },
  {
    id: 'strawberry', name: 'Strawberry milk', jp: 'いちごミルク', romaji: 'ichigo miruku',
    bg: '#FFA3C0', ink: '#3A0E23', mochi: '#FFC7D8', fill: '#FFE6EE', speck: '#FFFFFF', dots: 0.55,
    words: ['milky', 'jammy', 'sweet'],
    note: 'Ripe strawberries from a farm forty minutes away, swirled into whole-milk ice cream. It tastes like the pink milk at the bottom of a cereal bowl, in a good way.',
    made: 'Strawberries, whole milk, glutinous rice',
    pairs: 'Black coffee',
    meters: { sweet: 5, tang: 2, creamy: 5 },
    art: [{ k: 'berry', c: ['#E8314F', '#4E8A2A'] }, { k: 'drop', c: ['#FFFFFF'] }, { k: 'berry', c: ['#FF5673', '#6FA836'] }],
  },
  {
    id: 'hojicha', name: 'Hojicha', jp: 'ほうじ茶', romaji: 'hojicha',
    bg: '#C8773F', ink: '#2A1206', mochi: '#E3B58A', fill: '#EED0AE', speck: '#8A4E26', dots: 0.7,
    words: ['roasted', 'caramel', 'cosy'],
    note: 'Green tea roasted over charcoal until it turns brown and sweet-smelling. Low on bitterness, high on toffee and toast. A warm flavour in a cold little ball.',
    made: 'Roasted hojicha, cream, glutinous rice',
    pairs: 'A very cold glass of milk',
    meters: { sweet: 3, tang: 1, creamy: 4 },
    art: [{ k: 'leaf', c: ['#8A4E26', '#C98850'] }, { k: 'leaf', c: ['#A8632F', '#E3B58A'] }, { k: 'leaf', c: ['#6E3C1B', '#A8632F'] }],
  },
  {
    id: 'mango', name: 'Mango', jp: 'マンゴー', romaji: 'mango',
    bg: '#FFA928', ink: '#2B1400', mochi: '#FFCF5E', fill: '#FFE4A0', speck: '#F08C00', dots: 0.35,
    words: ['sunny', 'juicy', 'tangy'],
    note: 'Ripe Alphonso mango pulp with a squeeze of lime. It is the closest thing to a summer afternoon we know how to freeze. Juicy, a bit tangy, never sticky-sweet.',
    made: 'Alphonso mango, lime, cream, glutinous rice',
    pairs: 'Iced jasmine tea',
    meters: { sweet: 4, tang: 3, creamy: 3 },
    art: [{ k: 'mango', c: ['#FF9F1C', '#E8481C'] }, { k: 'leaf', c: ['#4E8A2A', '#8DBB45'] }, { k: 'mango', c: ['#FFC531', '#FF8A1C'] }],
  },
  {
    id: 'ube', name: 'Ube', jp: '紫芋', romaji: 'murasaki imo',
    bg: '#A784E8', ink: '#1E0B33', mochi: '#CDB4F5', fill: '#E6DAFB', speck: '#7A52C7', dots: 0.5,
    words: ['earthy', 'vanilla', 'plush'],
    note: 'Purple yam, steamed and mashed with coconut milk. Somewhere between vanilla, pistachio and sweet potato. Soft, velvety and a little bit mysterious.',
    made: 'Purple yam, coconut milk, glutinous rice',
    pairs: 'Pandan tea',
    meters: { sweet: 4, tang: 1, creamy: 5 },
    art: [{ k: 'yam', c: ['#7A52C7', '#D9C6FA'] }, { k: 'yam', c: ['#6A44B5', '#C3A6F0'] }, { k: 'drop', c: ['#FFFFFF'] }],
  },
  {
    id: 'caramel', name: 'Salted caramel', jp: '塩キャラメル', romaji: 'shio kyarameru',
    bg: '#78C3E3', ink: '#0B2230', mochi: '#E4B47A', fill: '#F3D3A6', speck: '#FFFFFF', dots: 0.55,
    words: ['buttery', 'salty', 'dangerous'],
    note: 'Sugar cooked slowly until it goes dark, butter, and flaky sea salt from the Zeeland coast. Sweet first, salty second, then you are already reaching for another.',
    made: 'Butter caramel, sea salt, cream, glutinous rice',
    pairs: 'A pinch of extra sea salt',
    meters: { sweet: 5, tang: 1, creamy: 4 },
    art: [{ k: 'caramel', c: ['#C9782A', '#F0A94A'] }, { k: 'salt', c: ['#FFFFFF'] }, { k: 'caramel', c: ['#B8681F', '#E8A040'] }],
  },
];

export const SIZES = [
  { n: 6, price: 18, ship: 5.9, tag: 'A little treat' },
  { n: 12, price: 34, ship: 0, tag: 'Most picked' },
  { n: 24, price: 62, ship: 0, tag: 'Party sized' },
];
export const SUB_DISCOUNT = 0.15;

export const eur = (n) => {
  const whole = Math.abs(n - Math.round(n)) < 0.005;
  return '€' + (whole ? Math.round(n).toString() : n.toFixed(2));
};

/* ---------- illustration builders (sticker style: flat colour + plum outline) ---------- */
const S = `stroke="${PLUM}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;

export const ART = {
  leaf: ([a, b]) => `
    <path d="M22 160C16 78 76 22 172 18C176 108 120 176 22 160Z" fill="${a}" ${S}/>
    <path d="M22 160C64 112 110 70 158 34" fill="none" ${S}/>
    <path d="M70 108l4 -40M104 78l30 -4M62 128l38 6" fill="none" stroke="${b}" stroke-width="5" stroke-linecap="round"/>`,
  seeds: ([a, b]) => `
    <path d="M40 70c20-30 44-20 40 8c-6 26-40 30-40-8Z" fill="${a}" ${S}/>
    <path d="M100 40c22-22 44-8 36 18c-8 24-42 22-36-18Z" fill="${b}" ${S}/>
    <path d="M110 118c22-24 46-10 38 16c-8 26-46 24-38-16Z" fill="${a}" ${S}/>
    <path d="M36 132c20-28 42-14 36 12c-8 24-42 24-36-12Z" fill="${b}" ${S}/>`,
  citrus: ([rind, flesh]) => `
    <circle cx="100" cy="100" r="78" fill="${rind}" ${S}/>
    <circle cx="100" cy="100" r="62" fill="${flesh}" stroke="${PLUM}" stroke-width="3.5"/>
    <path d="M100 100V42M100 100l50-30M100 100l50 30M100 100v58M100 100l-50 30M100 100L50 70" fill="none" stroke="${rind}" stroke-width="7" stroke-linecap="round"/>
    <circle cx="100" cy="100" r="8" fill="${rind}"/>`,
  berry: ([red, green]) => `
    <path d="M100 176C56 150 26 108 34 72c8-26 44-30 66-14c22-16 58-12 66 14c8 36-22 78-66 104Z" fill="${red}" ${S}/>
    <path d="M100 58c-12-14-30-16-42-6c16 4 26 12 42 6Zm0 0c12-14 30-16 42-6c-16 4-26 12-42 6Zm0 0c0-12 0-22 4-32" fill="${green}" ${S}/>
    <g fill="#FFF1DC"><circle cx="76" cy="96" r="4"/><circle cx="104" cy="112" r="4"/><circle cx="128" cy="90" r="4"/><circle cx="88" cy="132" r="4"/><circle cx="118" cy="140" r="4"/></g>`,
  drop: ([c]) => `
    <path d="M100 18C100 18 42 88 42 126a58 58 0 0 0 116 0C158 88 100 18 100 18Z" fill="${c}" ${S}/>
    <path d="M70 128a30 30 0 0 0 26 30" fill="none" stroke="${PLUM}" stroke-opacity=".35" stroke-width="6" stroke-linecap="round"/>`,
  mango: ([a, b]) => `
    <path d="M52 52C96 6 176 34 172 106c-4 58-62 86-102 64C26 148 22 84 52 52Z" fill="${a}" ${S}/>
    <path d="M120 40c14-22 40-26 54-14c-12 20-34 28-54 14Z" fill="#6FA836" ${S}/>
    <path d="M60 96c8-24 26-40 48-46" fill="none" stroke="${b}" stroke-width="10" stroke-linecap="round" opacity=".7"/>`,
  yam: ([a, b]) => `
    <path d="M28 108c0-42 44-72 88-66c42 6 66 44 54 82c-12 38-64 50-102 34C42 150 28 132 28 108Z" fill="${a}" ${S}/>
    <ellipse cx="128" cy="96" rx="34" ry="30" fill="${b}" stroke="${PLUM}" stroke-width="3.5"/>
    <path d="M114 96a16 14 0 0 1 28 0M120 108a10 8 0 0 1 16 0" fill="none" stroke="${a}" stroke-width="5" stroke-linecap="round"/>`,
  caramel: ([a, b]) => `
    <path d="M20 44h160v34c0 14-10 20-18 20c-6 0-12 4-12 14v36c0 10-8 18-18 18s-18-8-18-18v-24c0-8-6-12-12-12s-12 4-12 12v38c0 10-8 18-18 18s-18-8-18-18V98c-8 0-14-6-14-20V44Z" fill="${a}" ${S}/>
    <path d="M40 62h44" fill="none" stroke="${b}" stroke-width="9" stroke-linecap="round"/>`,
  salt: ([c]) => `
    <g fill="${c}" ${S}><rect x="30" y="46" width="52" height="52" rx="8" transform="rotate(-14 56 72)"/><rect x="104" y="30" width="38" height="38" rx="7" transform="rotate(18 123 49)"/><rect x="92" y="98" width="58" height="58" rx="9" transform="rotate(8 121 127)"/><rect x="30" y="126" width="30" height="30" rx="6" transform="rotate(-24 45 141)"/></g>`,
};

/* dot positions for the illustrated mochi (unit box 0-100) */
export const DOTS = [
  [26, 44], [34, 28], [46, 22], [58, 26], [70, 34], [78, 48], [64, 46], [50, 42], [38, 52], [24, 60],
  [32, 70], [46, 64], [60, 62], [74, 66], [56, 76], [40, 80], [68, 78], [84, 58], [18, 52], [52, 56],
];
