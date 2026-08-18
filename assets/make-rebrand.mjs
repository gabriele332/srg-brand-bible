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
const KITCOLORS = { white: '#FFFFFF', black: '#0D0D0D', green: '#869274' };

const jobs = []; // {svg (already written), png, w, h, dsf, transparent}

function put(rel, body, png) { writeFileSync(join(ROOT, rel), body); if (png) jobs.push(png); }
const head = (w, h) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">\n` +
  `  <style>${FONTS}text{font-family:${SERIF}}</style>\n`;

/* ---------------- logo kit ---------------- */
for (const [c, ink] of Object.entries(KITCOLORS)) {
  const F = FLAGS[c];

  put(`assets/logos-grotesk/srg-grotesk-${c}-wordmark.svg`,
    head(768, 220) +
    `  <text x="384" y="122" text-anchor="middle" font-weight="600" font-size="108" fill="${ink}">Steadfast</text>\n` +
    `  <text x="391" y="186" text-anchor="middle" font-weight="500" font-size="25" letter-spacing="13" fill="${ink}">RESEARCH GROUP</text>\n</svg>\n`,
    { svg: `assets/logos-grotesk/srg-grotesk-${c}-wordmark.svg`, png: `assets/logos-grotesk/srg-grotesk-${c}-wordmark.png`, w: 768, h: 220, dsf: 2, transparent: true });

  put(`assets/logos-grotesk/srg-grotesk-${c}-horizontal.svg`,
    head(839, 230) +
    `  <image x="26" y="25" width="198.4" height="180" preserveAspectRatio="xMidYMid meet" href="${F}"/>\n` +
    `  <text x="262" y="128" font-weight="600" font-size="88" fill="${ink}">Steadfast</text>\n` +
    `  <text x="266" y="182" font-weight="500" font-size="21" letter-spacing="10.4" fill="${ink}">RESEARCH GROUP</text>\n</svg>\n`,
    { svg: `assets/logos-grotesk/srg-grotesk-${c}-horizontal.svg`, png: `assets/logos-grotesk/srg-grotesk-${c}-horizontal.png`, w: 839, h: 230, dsf: 2, transparent: true });

  put(`assets/logos-grotesk/srg-grotesk-${c}-stacked.svg`,
    head(638, 400) +
    `  <image x="228" y="16" width="182" height="165" preserveAspectRatio="xMidYMid meet" href="${F}"/>\n` +
    `  <text x="319" y="288" text-anchor="middle" font-weight="600" font-size="82" fill="${ink}">Steadfast</text>\n` +
    `  <text x="324" y="340" text-anchor="middle" font-weight="500" font-size="19" letter-spacing="9.5" fill="${ink}">RESEARCH GROUP</text>\n</svg>\n`,
    { svg: `assets/logos-grotesk/srg-grotesk-${c}-stacked.svg`, png: `assets/logos-grotesk/srg-grotesk-${c}-stacked.png`, w: 638, h: 400, dsf: 2, transparent: true });

  /* Ring geometry: both arcs share one radial band between the rings.
     startOffset is absolute and pre-compensates the trailing letter-space,
     so both lines sit optically dead-center (Gabi, 2026-08-18). */
  put(`assets/logos-grotesk/srg-grotesk-${c}-seal.svg`,
    head(600, 600) +
    `  <defs>\n` +
    `    <path id="arcT" d="M 55 300 A 245 245 0 0 1 545 300" fill="none"/>\n` +
    `    <path id="arcB" d="M 18 300 A 282 282 0 0 0 582 300" fill="none"/>\n` +
    `  </defs>\n` +
    `  <circle cx="300" cy="300" r="292" fill="none" stroke="${ink}" stroke-width="4"/>\n` +
    `  <circle cx="300" cy="300" r="196" fill="none" stroke="${ink}" stroke-width="2"/>\n` +
    `  <image x="217" y="212" width="166" height="150.6" preserveAspectRatio="xMidYMid meet" href="${F}"/>\n` +
    `  <text font-weight="600" font-size="54" letter-spacing="10" fill="${ink}"><textPath href="#arcT" startOffset="389" text-anchor="middle">STEADFAST</textPath></text>\n` +
    `  <text font-weight="500" font-size="40" letter-spacing="9" fill="${ink}"><textPath href="#arcB" startOffset="447" text-anchor="middle">RESEARCH GROUP</textPath></text>\n` +
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
};
const WAYS = {
  black: { dir: 'assets/labels-products',       sfx: '',       bg: '#141414', fg: '#FFFFFF', boxBg: '#FFFFFF', boxFg: '#141414', flag: 'white' },
  green: { dir: 'assets/labels-products-green', sfx: '-green', bg: '#869274', fg: '#FFFFFF', boxBg: '#FFFFFF', boxFg: '#66704E', flag: 'green_white' },
  white: { dir: 'assets/labels-products-white', sfx: '-white', bg: '#FFFFFF', fg: '#141414', boxBg: '#141414', boxFg: '#FFFFFF', flag: 'black' },
};
/* green labels historically use the white flag art */
const flagFor = w => w.flag === 'green_white' ? FLAGS.white : FLAGS[w.flag];

function tallLabel(sku, w) {
  const [name, mg] = SKUS[sku];
  const nameSize = Math.min(40, Math.round(300 / (0.62 * name.length)));
  const boxW = Math.max(92, 30 + mg.length * 15.2);
  const first = sku === 'wa10' ? 'BACTERIOSTATIC WATER' : 'LYOPHILIZED POWDER';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="430" viewBox="0 0 360 430">
  <style>${FONTS}</style>
  <rect x="0" y="0" width="360" height="430" fill="${w.bg}"/>
  <image x="130" y="22" width="99.2" height="90" preserveAspectRatio="xMidYMid meet" href="${flagFor(w)}"/>
  <text x="180" y="164" text-anchor="middle" font-family="${SERIF}" font-weight="600" font-size="42" fill="${w.fg}">Steadfast</text>
  <line x1="84" y1="181" x2="276" y2="181" stroke="${w.fg}" stroke-width="1.2"/>
  <text x="182.7" y="204" text-anchor="middle" font-family="${SERIF}" font-weight="500" font-size="13.5" letter-spacing="5.4" fill="${w.fg}">RESEARCH GROUP</text>
  <text x="180" y="262" text-anchor="middle" font-family="${GROTESK}" font-weight="800" font-size="${nameSize}" letter-spacing="2" fill="${w.fg}">${name}</text>
  <rect x="${(360 - boxW) / 2}" y="280" width="${boxW}" height="33" fill="${w.boxBg}"/>
  <text x="180" y="304" text-anchor="middle" font-family="${GROTESK}" font-weight="800" font-size="21" fill="${w.boxFg}">${mg}</text>
  <text x="180" y="346" text-anchor="middle" font-family="${GROTESK}" font-weight="500" font-size="14.5" fill="${w.fg}">${first}</text>
  <text x="180" y="369" text-anchor="middle" font-family="${GROTESK}" font-weight="500" font-size="14.5" fill="${w.fg}">FOR RESEARCH USE ONLY</text>
  <text x="180" y="392" text-anchor="middle" font-family="${GROTESK}" font-weight="500" font-size="14.5" fill="${w.fg}">NOT FOR HUMAN CONSUMPTION</text>
  <line x1="84" y1="410" x2="276" y2="410" stroke="${w.fg}" stroke-width="1.1"/>
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
