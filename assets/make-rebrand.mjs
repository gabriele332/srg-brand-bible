/* ==========================================================================
   2026-08 rebrand generator — serif wordmark (Lora), flag unchanged.

   Regenerates, keeping every filename identical so no page link changes:
     - logo kit: wordmark / horizontal / stacked / seal SVG+PNG x 3 colors
       (icon untouched - the flag never changes)
     - product labels: 15 SKUs x 3 colorways SVG+PNG (tall panel art)
     - BAC Water wide labels: 2 fills x 3 colorways SVG+PNG
   SVGs carry live Google-Fonts text (same approach as the previous labels);
   PNGs are flattened by headless Chrome, so the font always renders there.

   Run from the repo root:  node assets/make-rebrand.mjs
   ========================================================================== */
import { readFileSync, writeFileSync, existsSync, copyFileSync, rmSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { join, resolve } from 'node:path';

const ROOT = resolve('.');
if (!existsSync(join(ROOT, 'assets/logos-grotesk'))) { console.error('run from repo root'); process.exit(1); }
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p => existsSync(p));
const TEMP = process.env.TEMP;

const FONTS = "@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,500&amp;family=Space+Grotesk:wght@500;700;800&amp;display=swap');";
const SERIF = "'Lora',Georgia,serif";
const GROTESK = "'Space Grotesk',sans-serif";

const flag = c => 'data:image/png;base64,' +
  readFileSync(join(ROOT, `assets/logos-grotesk/srg-grotesk-${c}-icon.png`)).toString('base64');
const FLAGS = { white: flag('white'), black: flag('black'), green: flag('green') };
/* base trio keeps its original flag art; every other palette color tints the
   ORIGINAL black flag PNG through an SVG flood filter (never redrawn). */
const KITCOLORS = {
  white: '#FFFFFF', black: '#0D0D0D', green: '#869274',
  bone: '#F4F1E8', cream: '#FBF9F2', ink: '#23271F',
  warmgray: '#6E7263', sage: '#8A9A6B', olive: '#545A2D',
};
const BASE = ['white', 'black', 'green'];

const jobs = []; // {svg (already written), png, w, h, dsf, transparent}

function put(rel, body, png) { writeFileSync(join(ROOT, rel), body); if (png) jobs.push(png); }
const head = (w, h) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">\n` +
  `  <style>${FONTS}text{font-family:${SERIF}}</style>\n`;

/* ---------------- logo kit ---------------- */
for (const [c, ink] of Object.entries(KITCOLORS)) {
  const isBase = BASE.includes(c);
  const F = isBase ? FLAGS[c] : FLAGS.black;
  const tintDef = isBase ? '' :
    `  <defs><filter id="tint" color-interpolation-filters="sRGB"><feFlood flood-color="${ink}"/><feComposite in2="SourceAlpha" operator="in"/></filter></defs>\n`;
  const tintAttr = isBase ? '' : ' filter="url(#tint)"';

  /* palette colors also get their own tinted icon (the base trio keeps its
     original hand-made icon files untouched) */
  if (!isBase) {
    put(`assets/logos-grotesk/srg-grotesk-${c}-icon.svg`,
      `<svg xmlns="http://www.w3.org/2000/svg" width="661" height="600" viewBox="0 0 661 600">\n` + tintDef +
      `  <image x="0" y="0" width="661" height="600" preserveAspectRatio="xMidYMid meet"${tintAttr} href="${F}"/>\n</svg>\n`,
      { svg: `assets/logos-grotesk/srg-grotesk-${c}-icon.svg`, png: `assets/logos-grotesk/srg-grotesk-${c}-icon.png`, w: 661, h: 600, dsf: 2, transparent: true });
  }

  put(`assets/logos-grotesk/srg-grotesk-${c}-wordmark.svg`,
    head(768, 220) +
    `  <text x="384" y="122" text-anchor="middle" font-weight="600" font-size="108" fill="${ink}">Steadfast</text>\n` +
    `  <text x="391" y="186" text-anchor="middle" font-weight="500" font-size="25" letter-spacing="13" fill="${ink}">RESEARCH GROUP</text>\n</svg>\n`,
    { svg: `assets/logos-grotesk/srg-grotesk-${c}-wordmark.svg`, png: `assets/logos-grotesk/srg-grotesk-${c}-wordmark.png`, w: 768, h: 220, dsf: 2, transparent: true });

  put(`assets/logos-grotesk/srg-grotesk-${c}-horizontal.svg`,
    head(839, 230) + tintDef +
    `  <image x="26" y="25" width="198.4" height="180" preserveAspectRatio="xMidYMid meet"${tintAttr} href="${F}"/>\n` +
    `  <text x="262" y="128" font-weight="600" font-size="88" fill="${ink}">Steadfast</text>\n` +
    `  <text x="266" y="182" font-weight="500" font-size="21" letter-spacing="10.4" fill="${ink}">RESEARCH GROUP</text>\n</svg>\n`,
    { svg: `assets/logos-grotesk/srg-grotesk-${c}-horizontal.svg`, png: `assets/logos-grotesk/srg-grotesk-${c}-horizontal.png`, w: 839, h: 230, dsf: 2, transparent: true });

  put(`assets/logos-grotesk/srg-grotesk-${c}-stacked.svg`,
    head(638, 400) + tintDef +
    `  <image x="228" y="16" width="182" height="165" preserveAspectRatio="xMidYMid meet"${tintAttr} href="${F}"/>\n` +
    `  <text x="319" y="288" text-anchor="middle" font-weight="600" font-size="82" fill="${ink}">Steadfast</text>\n` +
    `  <text x="324" y="340" text-anchor="middle" font-weight="500" font-size="19" letter-spacing="9.5" fill="${ink}">RESEARCH GROUP</text>\n</svg>\n`,
    { svg: `assets/logos-grotesk/srg-grotesk-${c}-stacked.svg`, png: `assets/logos-grotesk/srg-grotesk-${c}-stacked.png`, w: 638, h: 400, dsf: 2, transparent: true });

  /* Ring geometry: both arcs share one radial band between the rings.
     startOffset is absolute and pre-compensates the trailing letter-space,
     so both lines sit optically dead-center (Gabi, 2026-08-18). */
  put(`assets/logos-grotesk/srg-grotesk-${c}-seal.svg`,
    head(600, 600) + tintDef +
    `  <defs>\n` +
    `    <path id="arcT" d="M 75 300 A 225 225 0 0 1 525 300" fill="none"/>\n` +
    `    <path id="arcB" d="M 42 300 A 258 258 0 0 0 558 300" fill="none"/>\n` +
    `  </defs>\n` +
    `  <circle cx="300" cy="300" r="292" fill="none" stroke="${ink}" stroke-width="4"/>\n` +
    `  <circle cx="300" cy="300" r="196" fill="none" stroke="${ink}" stroke-width="2"/>\n` +
    `  <image x="217" y="212" width="166" height="150.6" preserveAspectRatio="xMidYMid meet"${tintAttr} href="${F}"/>\n` +
    `  <text font-weight="600" font-size="54" letter-spacing="10" fill="${ink}"><textPath href="#arcT" startOffset="357.6" text-anchor="middle">STEADFAST</textPath></text>\n` +
    `  <text font-weight="500" font-size="40" letter-spacing="9" fill="${ink}"><textPath href="#arcB" startOffset="409.3" text-anchor="middle">RESEARCH GROUP</textPath></text>\n` +
    `  <circle cx="47" cy="300" r="7" fill="${ink}"/>\n  <circle cx="553" cy="300" r="7" fill="${ink}"/>\n</svg>\n`,
    { svg: `assets/logos-grotesk/srg-grotesk-${c}-seal.svg`, png: `assets/logos-grotesk/srg-grotesk-${c}-seal.png`, w: 600, h: 600, dsf: 2, transparent: true });
}

/* ---------------- tall product labels ---------------- */
const SKUS = {
  rt10: ['RETATRUTIDE', '10 MG'], rt20: ['RETATRUTIDE', '20 MG'], rt30: ['RETATRUTIDE', '30 MG'],
  tr10: ['TIRZEPATIDE', '10 MG'], tr20: ['TIRZEPATIDE', '20 MG'], tr30: ['TIRZEPATIDE', '30 MG'],
  tsm5: ['TESAMORELIN', '5 MG'], tsm10: ['TESAMORELIN', '10 MG'],
  bb10: ['BPC157/TB500', '10 MG'], kpv10: ['KPV', '10 MG'],
  cp10: ['CJC1295/IPAMORELIN', '10 MG'], cu50: ['GHK-CU', '50 MG'],
  nj1000: ['NAD+', '1000 MG'], hgh10: ['HGH', '10 IU'], wa10: ['BAC WATER', '10 ML'],
  ss31: ['SS-31', '10 MG'], motsc: ['MOTS-C', '10 MG'],
};
const WAYS = {
  black: { dir: 'assets/labels-products',       sfx: '',       bg: '#141414', fg: '#FFFFFF', boxBg: '#FFFFFF', boxFg: '#141414', flag: 'white' },
  green: { dir: 'assets/labels-products-green', sfx: '-green', bg: '#545A2D', fg: '#FFFFFF', boxBg: '#F4F1E8', boxFg: '#3A3D20', flag: 'green_white' },
  white: { dir: 'assets/labels-products-white', sfx: '-white', bg: '#FFFFFF', fg: '#141414', boxBg: '#141414', boxFg: '#FFFFFF', flag: 'black' },
};
/* green labels historically use the white flag art */
const flagFor = w => w.flag === 'green_white' ? FLAGS.white : FLAGS[w.flag];

const DISPLAY = {
  rt10:'Retatrutide', rt20:'Retatrutide', rt30:'Retatrutide',
  tr10:'Tirzepatide', tr20:'Tirzepatide', tr30:'Tirzepatide',
  tsm5:'Tesamorelin', tsm10:'Tesamorelin',
  bb10:'BPC157/TB500', kpv10:'KPV', cp10:'CJC1295/Ipamorelin', cu50:'GHK-Cu',
  nj1000:'NAD+', hgh10:'HGH', wa10:'BAC Water', peptide:'Peptide',
  ss31:'SS-31', motsc:'MOTS-c',
};

function tallLabel(sku, w) {
  const [name, mg] = SKUS[sku];
  const disp = DISPLAY[sku] || name;
  const mgTxt = mg.replace(/ /g, '');
  const nameSize = Math.min(46, Math.round(340 / (0.56 * disp.length)));
  const boxW = Math.max(88, 34 + mgTxt.length * 14.5);
  const first = sku === 'wa10' ? 'BACTERIOSTATIC WATER' : 'LYOPHILIZED POWDER';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="430" viewBox="0 0 360 430">
  <style>${FONTS}</style>
  <rect x="0" y="0" width="360" height="430" fill="${w.bg}"/>
  <image x="52" y="74" width="52" height="48" preserveAspectRatio="xMidYMid meet" href="${flagFor(w)}"/>
  <text x="118" y="96" text-anchor="start" font-family="${GROTESK}" font-weight="500" font-size="24" letter-spacing="7" fill="${w.fg}">STEADFAST</text>
  <text x="119" y="120" text-anchor="start" font-family="${GROTESK}" font-weight="500" font-size="11.5" letter-spacing="4.6" fill="${w.fg}">RESEARCH GROUP</text>
  <line x1="118" y1="136" x2="306" y2="136" stroke="${w.fg}" stroke-width="1"/>
  <text x="180" y="218" text-anchor="middle" font-family="${SERIF}" font-weight="500" font-size="${nameSize}" letter-spacing="0.5" fill="${w.fg}">${disp}</text>
  <rect x="${(360 - boxW) / 2}" y="238" width="${boxW}" height="32" fill="${w.boxBg}"/>
  <text x="180" y="261" text-anchor="middle" font-family="${GROTESK}" font-weight="700" font-size="19" fill="${w.boxFg}">${mgTxt}</text>
  <text x="180" y="336" text-anchor="middle" font-family="${GROTESK}" font-weight="500" font-size="14.5" fill="${w.fg}">${first}</text>
  <text x="180" y="359" text-anchor="middle" font-family="${GROTESK}" font-weight="500" font-size="14.5" fill="${w.fg}">FOR RESEARCH USE ONLY</text>
  <text x="180" y="382" text-anchor="middle" font-family="${GROTESK}" font-weight="500" font-size="14.5" fill="${w.fg}">NOT FOR HUMAN CONSUMPTION</text>
  <line x1="84" y1="406" x2="276" y2="406" stroke="${w.fg}" stroke-width="1.1"/>
</svg>\n`;
}

for (const sku of Object.keys(SKUS)) for (const w of Object.values(WAYS)) {
  const base = `${w.dir}/srg-label-${sku}${w.sfx}`;
  put(`${base}.svg`, tallLabel(sku, w),
    { svg: `${base}.svg`, png: `${base}.png`, w: 360, h: 430, dsf: 4, transparent: false });
}

/* ---------------- BAC Water wide labels ---------------- */
function wideLabel(volume, w) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="260" viewBox="0 0 500 260">
  <style>${FONTS}</style>
  <rect x="0" y="0" width="500" height="260" fill="${w.bg}"/>
  <image x="225" y="12" width="50" height="45.4" preserveAspectRatio="xMidYMid meet" href="${flagFor(w)}"/>
  <text x="250" y="92" text-anchor="middle" font-family="${SERIF}" font-weight="600" font-size="31" fill="${w.fg}">Steadfast</text>
  <line x1="160" y1="102" x2="340" y2="102" stroke="${w.fg}" stroke-width="1.2"/>
  <text x="252.4" y="120" text-anchor="middle" font-family="${SERIF}" font-weight="500" font-size="11.5" letter-spacing="4.8" fill="${w.fg}">RESEARCH GROUP</text>
  <text x="250" y="158" text-anchor="middle" font-family="${GROTESK}" font-weight="800" font-size="32" letter-spacing="2" fill="${w.fg}">BAC WATER</text>
  <rect x="204" y="170" width="92" height="27" fill="${w.boxBg}"/>
  <text x="250" y="189.5" text-anchor="middle" font-family="${GROTESK}" font-weight="800" font-size="17" fill="${w.boxFg}">${volume}</text>
  <text x="250" y="215" text-anchor="middle" font-family="${GROTESK}" font-weight="500" font-size="11.5" fill="${w.fg}">BACTERIOSTATIC WATER</text>
  <text x="250" y="230" text-anchor="middle" font-family="${GROTESK}" font-weight="500" font-size="11.5" fill="${w.fg}">FOR RESEARCH USE ONLY</text>
  <text x="250" y="245" text-anchor="middle" font-family="${GROTESK}" font-weight="500" font-size="11.5" fill="${w.fg}">NOT FOR HUMAN CONSUMPTION</text>
  <line x1="160" y1="254" x2="340" y2="254" stroke="${w.fg}" stroke-width="1"/>
</svg>\n`;
}
for (const [cname, w] of Object.entries(WAYS)) for (const [sfx, vol] of [['30ml', '30 ML'], ['10ml', '10 ML']]) {
  const base = `assets/labels-bacwater/srg-label-bacwater-${sfx}-${cname}`;
  put(`${base}.svg`, wideLabel(vol, w),
    { svg: `${base}.svg`, png: `${base}.png`, w: 500, h: 260, dsf: 4, transparent: false });
}

/* ---------------- render PNGs with Chrome ---------------- */
/* ONLY=<substring> renders just the matching files (e.g. ONLY=seal) */
const only = process.env.ONLY;
const torun = only ? jobs.filter(j => j.svg.includes(only)) : jobs;
let ok = 0;
for (const j of torun) {
  const shot = join(TEMP, 'srg-rebrand-shot.png');
  const profile = join(TEMP, 'srg-rebrand-profile');
  rmSync(shot, { force: true });
  await new Promise((done, fail) => {
    const args = ['--headless=new', '--disable-gpu', '--hide-scrollbars',
      `--force-device-scale-factor=${j.dsf}`, `--window-size=${j.w},${j.h}`,
      `--user-data-dir=${profile}`, `--screenshot=${shot}`, '--virtual-time-budget=9000'];
    if (j.transparent) args.push('--default-background-color=00000000');
    args.push('file:///' + join(ROOT, j.svg).replace(/\\/g, '/'));
    const c = spawn(CHROME, args, { stdio: 'ignore' });
    c.on('exit', () => existsSync(shot) ? done() : fail(new Error('no screenshot for ' + j.svg)));
    c.on('error', fail);
  });
  copyFileSync(shot, join(ROOT, j.png));
  ok++;
  if (ok % 10 === 0) console.log(`${ok}/${jobs.length} rendered`);
}
rmSync(join(TEMP, 'srg-rebrand-profile'), { recursive: true, force: true });
console.log(`done: ${ok}/${jobs.length} PNGs rendered, ${jobs.length} SVGs written`);
