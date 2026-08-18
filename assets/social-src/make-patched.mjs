/* ==========================================================================
   Re-export the 12 platform covers from patch.html — the ORIGINAL shipped
   PNGs (assets/social-src/originals/) with only the wordmark re-set in Lora.
   Run from the REPO ROOT:  node assets/social-src/make-patched.mjs
   ========================================================================== */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { existsSync, rmSync, copyFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const ROOT = resolve('.');
if (!existsSync(join(ROOT, 'assets/social-src/patch.html'))) {
  console.error('Run from the srg-brand-bible repo root.'); process.exit(1);
}
const OUT = join(ROOT, 'assets/social');
const PORT = 8797;
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p => existsSync(p));

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };

const DIMS = { fb: [2187, 832], li: [4224, 1056], x: [4000, 1333], yt: [3413, 1920] };
const NAME = { fb: 'facebook-cover', li: 'linkedin-banner', x: 'x-header', yt: 'youtube-banner' };
const JOBS = [];
for (const p of ['fb', 'li', 'x', 'yt']) for (const s of ['photo', 'watermark', 'cutout'])
  JOBS.push({ id: `${p}-${s}`, w: DIMS[p][0], h: DIMS[p][1], file: `srg-${NAME[p]}-${s}.png` });

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
  const shot = join(process.env.TEMP, `srgpatch-${j.id}.png`);
  const profile = join(process.env.TEMP, `srgpatch-prof-${j.id}`);
  rmSync(shot, { force: true });
  try {
    await new Promise((done, fail) => {
      const c = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars',
        '--force-device-scale-factor=1', `--window-size=${j.w},${j.h}`,
        `--user-data-dir=${profile}`, `--screenshot=${shot}`, '--virtual-time-budget=12000',
        `http://127.0.0.1:${PORT}/assets/social-src/patch.html?id=${j.id}`], { stdio: 'ignore' });
      c.on('exit', () => existsSync(shot) ? done() : fail(new Error('no screenshot')));
      c.on('error', fail);
    });
    copyFileSync(shot, join(OUT, j.file));
    ok++; console.log(`ok ${j.id}`);
  } catch (e) { console.log(`FAIL ${j.id}: ${e.message}`); }
  rmSync(shot, { force: true });
  rmSync(profile, { recursive: true, force: true });
}
server.close();
console.log(`${ok}/${JOBS.length} patched covers written to assets/social/`);
