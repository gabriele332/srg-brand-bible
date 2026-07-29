/* ==========================================================================
   Export every creative in pack.js to PNG at true size.

   Drives headless Chrome over export.html?id=<ID> once per asset and writes
   exports/srg-ad01-<id>-<slug>-<w>x<h>.png. Chrome is used directly rather
   than Puppeteer so this needs no install — but it means we serve the folder
   over http first, because file:// URLs can't load pack.js as a script in
   modern Chrome without loosening flags we don't want on.

   Usage, from the ads/ folder:  node export.mjs
   ========================================================================== */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, mkdir, rm, readdir, rename } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const ROOT = resolve('.');
const OUT = join(ROOT, 'exports');
const PORT = 8791;

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
].find(p => p && existsSync(p));

if (!CHROME) { console.error('No Chrome or Edge found.'); process.exit(1); }

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml'
};

/* Read the pack the same way the browser does, so ids and slugs can't drift. */
const packSrc = await readFile(join(ROOT, 'pack.js'), 'utf8');
const sandbox = { window: {} };
new Function('window', packSrc)(sandbox.window);
const PACK = sandbox.window.SRGPACK;
const ASSETS = PACK.FEED.map(a => ({ ...a, story: false }))
  .concat(PACK.STORIES.map(a => ({ ...a, story: true })));

const server = createServer(async (req, res) => {
  const path = decodeURIComponent(req.url.split('?')[0]);
  const file = join(ROOT, path === '/' ? 'index.html' : path);
  try {
    const buf = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
    res.end(buf);
  } catch {
    res.writeHead(404).end('not found');
  }
});
await new Promise(r => server.listen(PORT, r));

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

/* PDF alongside the PNG: the PNG is what gets uploaded to Meta, the PDF is what
   Canva imports, because a PDF carries real text runs and comes in as editable
   text boxes rather than one flat picture. */
function toPdf(ad) {
  const h = ad.story ? 1920 : 1080;
  const name = `srg-ad01-${ad.id.toLowerCase()}-${ad.slug}-1080x${h}.pdf`;
  const target = join(OUT, name);
  const profile = join(OUT, '.q-' + ad.id);
  const args = [
    '--headless=new', '--disable-gpu', '--no-pdf-header-footer',
    '--force-device-scale-factor=1',
    `--user-data-dir=${profile}`,
    `--print-to-pdf=${target}`,
    '--virtual-time-budget=8000',
    `http://127.0.0.1:${PORT}/export.html?id=${ad.id}`
  ];
  return new Promise((done, fail) => {
    const p = spawn(CHROME, args, { stdio: 'ignore' });
    p.on('exit', code => (code === 0 || existsSync(target)) ? done(name) : fail(new Error(`${ad.id} exit ${code}`)));
    p.on('error', fail);
  });
}

function shoot(ad) {
  const w = 1080, h = ad.story ? 1920 : 1080;
  const name = `srg-ad01-${ad.id.toLowerCase()}-${ad.slug}-${w}x${h}.png`;
  const target = join(OUT, name);
  // A per-asset profile dir keeps parallel-safe state and stops Chrome
  // reusing a warm window that ignores --window-size.
  const profile = join(OUT, '.p-' + ad.id);
  const args = [
    '--headless=new', '--disable-gpu', '--hide-scrollbars',
    '--force-device-scale-factor=1', '--default-background-color=00000000',
    `--user-data-dir=${profile}`,
    `--window-size=${w},${h}`,
    `--screenshot=${target}`,
    '--virtual-time-budget=8000',
    `http://127.0.0.1:${PORT}/export.html?id=${ad.id}`
  ];
  return new Promise((done, fail) => {
    const p = spawn(CHROME, args, { stdio: 'ignore' });
    p.on('exit', code => code === 0 || existsSync(target) ? done(name) : fail(new Error(`${ad.id} exit ${code}`)));
    p.on('error', fail);
  });
}

const made = [];
for (const ad of ASSETS) {
  try {
    made.push(await shoot(ad));
    console.log('  png  ' + made[made.length - 1]);
  } catch (e) {
    console.log('  FAIL png ' + ad.id + ' — ' + e.message);
  }
  try {
    console.log('  pdf  ' + await toPdf(ad));
  } catch (e) {
    console.log('  FAIL pdf ' + ad.id + ' — ' + e.message);
  }
}

// Drop the throwaway Chrome profiles, keep only the artwork.
for (const d of await readdir(OUT)) {
  if (d.startsWith('.p-') || d.startsWith('.q-')) await rm(join(OUT, d), { recursive: true, force: true });
}

server.close();
console.log(`\n${made.length}/${ASSETS.length} exported to exports/`);
