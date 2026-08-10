/* ==========================================================================
   Print-ready label PDFs at the confirmed 1.5in x 0.75in dieline — one per
   SKU per colorway, written to assets/labels-print/.

   Run from the REPO ROOT:  node assets/labels-print/make-labels.mjs
   Vector output: Chrome's print-to-PDF keeps the type live (the Canva
   round-trips proved it), so Illustrator opens these with editable vectors
   and Jessica's print software places them clean at any size.
   ========================================================================== */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { existsSync, rmSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const ROOT = resolve('.');
if (!existsSync(join(ROOT, 'assets/labels-print/label.html'))) {
  console.error('Run from the srg-brand-bible repo root.'); process.exit(1);
}
const OUT = join(ROOT, 'assets/labels-print');
const PORT = 8799;
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p => existsSync(p));

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png' };
const SKUS = ['rt10','rt20','rt30','tr10','tr20','tr30','tsm5','tsm10','bb10','kpv10','cp10','cu50','nj1000','hgh10','wa10','peptide'];
const WAYS = ['black','green','white'];

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
  const suffix = way === 'black' ? '' : '-' + way;   // mirrors the PNG/SVG set naming
  const target = join(OUT, `srg-label-print-${sku}${suffix}.pdf`);
  const profile = join(process.env.TEMP, `srglbl-${sku}-${way}`);
  await new Promise((done, fail) => {
    const c = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer',
      '--force-device-scale-factor=1', `--user-data-dir=${profile}`,
      `--print-to-pdf=${target}`, '--virtual-time-budget=7000',
      `http://127.0.0.1:${PORT}/assets/labels-print/label.html?sku=${sku}&way=${way}`], { stdio: 'ignore' });
    c.on('exit', code => (code === 0 || existsSync(target)) ? (ok++, done()) : fail(new Error(sku + '-' + way)));
    c.on('error', fail);
  }).catch(e => console.log('  FAIL ' + e.message));
  rmSync(profile, { recursive: true, force: true });
}
server.close();
console.log(`${ok}/${total} label PDFs written to assets/labels-print/`);
