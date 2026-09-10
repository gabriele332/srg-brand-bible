/* ==========================================================================
   Print-ready label PDFs — FULLY FLATTENED single-image files.

   History: v1 printed the type as live vectors, but Jessica's print RIP drew
   a box around the logo. Removing the alpha mask (flatten-lockup.mjs) wasn't
   enough — an image object and a vector fill of the "same" RGB color can
   convert to CMYK differently in the RIP, which still ghosts a rectangle.
   So now each label is rendered by Chrome as ONE screenshot at 12x
   (1152 dpi at the 96px/in dieline scale) and wrapped into a PDF whose page
   is exactly the dieline WITH BLEED (1/8in past the trim on every side, per
   Jessica 2026-09-09). One opaque image, no masks, no text objects, no
   vector fills: there is nothing left for any print software to mis-flatten.

   Run from the REPO ROOT:  node assets/labels-print/make-labels.mjs
   Output: assets/labels-print/srg-label-print-<sku>[-green|-white].pdf
   ========================================================================== */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { existsSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { inflateSync, deflateSync } from 'node:zlib';
import { extname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const ROOT = resolve('.');
if (!existsSync(join(ROOT, 'assets/labels-print/label.html'))) {
  console.error('Run from the srg-brand-bible repo root.'); process.exit(1);
}
const OUT = join(ROOT, 'assets/labels-print');
const PORT = 8799;
const SCALE = 12; // 12 x 96px/in = 1152 dpi
/* Chrome / Chromium: CHROME=<path> overrides; otherwise the usual installs. */
const CHROME = process.env.CHROME || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  /* Playwright's headless_shell first: its viewport is exactly --window-size
     (the full Chromium build in --headless=new keeps ~86px for browser UI). */
  '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
].find(p => existsSync(p));
if (!CHROME) { console.error('No Chrome found - set CHROME=<path to chrome binary>.'); process.exit(1); }
const TEMP = process.env.TEMP || tmpdir();
/* headless Chrome refuses windows smaller than a few hundred px, so the shot
   is taken in a window at least this big and cropped to the label */
const MIN_WIN = [400, 300];

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png' };
const SKUS = ['rt10','rt20','rt30','tr10','tr20','tr30','tsm5','tsm10','bb10','kpv10','cp10','cu50','nj1000','hgh10','wa10','peptide','ss31','ss3150','motsc'];
const WAYS = ['black','green','white'];
/* Dielines (Jessica, Slack 2026-09-09): files run 1/8in larger than the trim on
   every side so the art prints all the way to the edge.
     vials:            trim 1.5 x 0.75 in -> file 1.75 x 1.00 in
     BAC Water + NAD+: trim 2.5 x 1.00 in -> file 2.75 x 1.25 in
   [CSS px canvas, PDF points] — 96 CSS px = 1in = 72 pt. The page size is the
   file (bleed) size; label.html keeps the type at the trim scale. */
const WIDE = new Set(['wa10', 'nj1000']);
const DIE = sku => WIDE.has(sku) ? { css: [264, 120], pt: [198, 90] } : { css: [168, 96], pt: [126, 72] };

/* ---- PNG screenshot -> raw opaque RGB ---------------------------------- */
function pngToRGB(file, cropW, cropH) {
  const b = readFileSync(file);
  const w = b.readUInt32BE(16), h = b.readUInt32BE(20), ct = b[25];
  if (b[24] !== 8 || (ct !== 6 && ct !== 2) || b[28] !== 0) throw new Error(file + ': unexpected PNG format');
  const idat = [];
  for (let p = 8; p < b.length;) {
    const len = b.readUInt32BE(p), type = b.toString('ascii', p + 4, p + 8);
    if (type === 'IDAT') idat.push(b.subarray(p + 8, p + 8 + len));
    p += 12 + len;
  }
  const bpp = ct === 6 ? 4 : 3, stride = w * bpp;
  const raw = inflateSync(Buffer.concat(idat));
  const px = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const out = px.subarray(y * stride), prev = y ? px.subarray((y - 1) * stride) : null;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[x - bpp] : 0, u = prev ? prev[x] : 0, c = prev && x >= bpp ? prev[x - bpp] : 0;
      let v = line[x];
      if (f === 1) v += a;
      else if (f === 2) v += u;
      else if (f === 3) v += (a + u) >> 1;
      else if (f === 4) {
        const p0 = a + u - c, pa = Math.abs(p0 - a), pb = Math.abs(p0 - u), pc = Math.abs(p0 - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? u : c;
      }
      out[x] = v & 0xFF;
    }
  }
  if (w < cropW || h < cropH) throw new Error(`shot ${w}x${h} smaller than label ${cropW}x${cropH}`);
  /* crop to the label (top-left of the page) and drop alpha */
  const rgb = Buffer.alloc(cropW * cropH * 3);
  for (let y = 0; y < cropH; y++) for (let x = 0, i = y * stride, o = y * cropW * 3; x < cropW; x++, i += bpp, o += 3) {
    rgb[o] = px[i]; rgb[o + 1] = px[i + 1]; rgb[o + 2] = px[i + 2];
  }
  return { w: cropW, h: cropH, rgb };
}

/* ---- minimal single-image PDF ------------------------------------------ */
function imagePDF(w, h, rgb, ptW, ptH) {
  const img = deflateSync(rgb, { level: 9 });
  const content = Buffer.from(`q ${ptW} 0 0 ${ptH} 0 0 cm /Im0 Do Q`, 'ascii');
  const objs = [
    Buffer.from('<< /Type /Catalog /Pages 2 0 R >>'),
    Buffer.from('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'),
    Buffer.from(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${ptW} ${ptH}] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>`),
    Buffer.concat([Buffer.from(`<< /Length ${content.length} >>\nstream\n`), content, Buffer.from('\nendstream')]),
    Buffer.concat([Buffer.from(`<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /Length ${img.length} >>\nstream\n`), img, Buffer.from('\nendstream')]),
  ];
  const head = Buffer.from('%PDF-1.4\n%\xB5\xB6\n', 'latin1');
  const parts = [head], offs = [];
  let pos = head.length;
  objs.forEach((o, i) => {
    offs.push(pos);
    const b = Buffer.concat([Buffer.from(`${i + 1} 0 obj\n`), o, Buffer.from('\nendobj\n')]);
    parts.push(b); pos += b.length;
  });
  const xref = Buffer.from('xref\n0 6\n0000000000 65535 f \n' +
    offs.map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('') +
    `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${pos}\n%%EOF\n`);
  parts.push(xref);
  return Buffer.concat(parts);
}

/* ---- serve repo, screenshot every label, wrap -------------------------- */
const server = createServer(async (req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]);
  const f = join(ROOT, p === '/' ? 'index.html' : p);
  try {
    const b = await readFile(f);
    res.writeHead(200, { 'Content-Type': MIME[extname(f)] || 'application/octet-stream' });
    res.end(b);
  } catch { res.writeHead(404).end(); }
});
await new Promise(r => server.listen(PORT, r));

let ok = 0, total = 0;
for (const sku of SKUS) for (const way of WAYS) {
  total++;
  const { css, pt } = DIE(sku);
  const suffix = way === 'black' ? '' : '-' + way;
  const shot = join(TEMP, `srglbl-${sku}-${way}.png`);
  const profile = join(TEMP, `srglbl-${sku}-${way}`);
  const win = [Math.max(css[0], MIN_WIN[0]), Math.max(css[1], MIN_WIN[1])];
  try {
    await new Promise((done, fail) => {
      const c = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars',
        ...(process.platform === 'win32' ? [] : ['--no-sandbox']),
        `--force-device-scale-factor=${SCALE}`, `--window-size=${win[0]},${win[1]}`,
        `--user-data-dir=${profile}`, `--screenshot=${shot}`, '--virtual-time-budget=7000',
        `http://127.0.0.1:${PORT}/assets/labels-print/label.html?sku=${sku}&way=${way}`], { stdio: 'ignore' });
      c.on('exit', () => existsSync(shot) ? done() : fail(new Error('no screenshot')));
      c.on('error', fail);
    });
    const { w, h, rgb } = pngToRGB(shot, css[0] * SCALE, css[1] * SCALE);
    writeFileSync(join(OUT, `srg-label-print-${sku}${suffix}.pdf`), imagePDF(w, h, rgb, pt[0], pt[1]));
    ok++;
  } catch (e) { console.log(`  FAIL ${sku}-${way}: ${e.message}`); }
  rmSync(shot, { force: true });
  rmSync(profile, { recursive: true, force: true });
}
server.close();
console.log(`${ok}/${total} flattened label PDFs written to assets/labels-print/ (${SCALE * 96} dpi)`);
