/* ==========================================================================
   Regenerate the 12 platform headers (+ the 3 shipping highlight covers)
   from headers.html, writing over the existing files in assets/social/ so
   the bible page needs no markup changes.

   Run from the REPO ROOT:  node assets/social-src/make-headers.mjs
   Same pipeline as ads/export.mjs: serve the repo, drive headless Chrome,
   screenshot at exact pixel size.
   ========================================================================== */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { existsSync, rmSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const ROOT = resolve('.');
if (!existsSync(join(ROOT, 'assets/social-src/headers.html'))) {
  console.error('Run from the srg-brand-bible repo root.'); process.exit(1);
}
const OUT = join(ROOT, 'assets/social');
const PORT = 8798;
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p => existsSync(p));

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };

const JOBS = [
  { id: 'fb-photo',     w: 2187, h: 832,  file: 'srg-facebook-cover-photo.png' },
  { id: 'fb-watermark', w: 2187, h: 832,  file: 'srg-facebook-cover-watermark.png' },
  { id: 'fb-cutout',    w: 2187, h: 832,  file: 'srg-facebook-cover-cutout.png' },
  { id: 'li-photo',     w: 4224, h: 1056, file: 'srg-linkedin-banner-photo.png' },
  { id: 'li-watermark', w: 4224, h: 1056, file: 'srg-linkedin-banner-watermark.png' },
  { id: 'li-cutout',    w: 4224, h: 1056, file: 'srg-linkedin-banner-cutout.png' },
  { id: 'x-photo',      w: 4000, h: 1333, file: 'srg-x-header-photo.png' },
  { id: 'x-watermark',  w: 4000, h: 1333, file: 'srg-x-header-watermark.png' },
  { id: 'x-cutout',     w: 4000, h: 1333, file: 'srg-x-header-cutout.png' },
  { id: 'yt-photo',     w: 3413, h: 1920, file: 'srg-youtube-banner-photo.png' },
  { id: 'yt-watermark', w: 3413, h: 1920, file: 'srg-youtube-banner-watermark.png' },
  { id: 'yt-cutout',    w: 3413, h: 1920, file: 'srg-youtube-banner-cutout.png' }
];

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

let ok = 0;
for (const j of JOBS) {
  const profile = join(process.env.TEMP, 'srgsoc-' + j.id);
  const target = join(OUT, j.file);
  await new Promise((done, fail) => {
    const c = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars',
      '--force-device-scale-factor=1', `--user-data-dir=${profile}`,
      `--window-size=${j.w},${j.h}`, `--screenshot=${target}`,
      '--virtual-time-budget=9000',
      `http://127.0.0.1:${PORT}/assets/social-src/headers.html?id=${j.id}`], { stdio: 'ignore' });
    c.on('exit', code => { (code === 0 || existsSync(target)) ? (ok++, done()) : fail(new Error(j.id)); });
    c.on('error', fail);
  }).catch(e => console.log('  FAIL ' + e.message));
  rmSync(profile, { recursive: true, force: true });
  console.log('  ok   ' + j.file);
}
server.close();
console.log(`${ok}/${JOBS.length} written to assets/social/`);
