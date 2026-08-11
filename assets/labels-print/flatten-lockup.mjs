/* ==========================================================================
   Flatten the horizontal lockup against each label ground color.

   Why: Jessica's print software chokes on the alpha channel — Chrome embeds
   RGBA PNGs into the PDF as image + /SMask, and her RIP renders the mask's
   bounding box instead of flattening it ("bounding box around the logo",
   Slack 2026-08-11). Compositing the lockup onto the label's own flat ground
   ahead of time yields an OPAQUE RGB PNG, so Chrome emits no SMask at all
   and there is nothing left to flatten.

   Reads the kit PNGs verbatim (never redrawn), writes three flat lockups:
     lockup-flat-black.png  white art on #141414
     lockup-flat-green.png  white art on #869274
     lockup-flat-white.png  black art on #F4F1E8

   Run from the repo root:  node assets/labels-print/flatten-lockup.mjs
   ========================================================================== */
import { readFileSync, writeFileSync } from 'node:fs';
import { inflateSync, deflateSync } from 'node:zlib';

const JOBS = [
  ['assets/logos-grotesk/srg-grotesk-white-horizontal.png', '#141414', 'assets/labels-print/lockup-flat-black.png'],
  ['assets/logos-grotesk/srg-grotesk-white-horizontal.png', '#869274', 'assets/labels-print/lockup-flat-green.png'],
  ['assets/logos-grotesk/srg-grotesk-black-horizontal.png', '#F4F1E8', 'assets/labels-print/lockup-flat-white.png'],
];

const CRC_T = Array.from({ length: 256 }, (_, n) => {
  for (let k = 0; k < 8; k++) n = n & 1 ? 0xEDB88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
const crc32 = b => {
  let c = 0xFFFFFFFF;
  for (const x of b) c = CRC_T[(c ^ x) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
};
const chunk = (type, data) => {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
};

function decode(file) {
  const b = readFileSync(file);
  const w = b.readUInt32BE(16), h = b.readUInt32BE(20);
  if (b[24] !== 8 || b[25] !== 6 || b[28] !== 0) throw new Error(file + ': expected 8-bit RGBA non-interlaced');
  const idat = [];
  for (let p = 8; p < b.length;) {
    const len = b.readUInt32BE(p), type = b.toString('ascii', p + 4, p + 8);
    if (type === 'IDAT') idat.push(b.subarray(p + 8, p + 8 + len));
    p += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const bpp = 4, stride = w * bpp, px = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const out = px.subarray(y * stride), prev = y ? px.subarray((y - 1) * stride) : null;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[x - bpp] : 0, u = prev ? prev[x] : 0, c = prev && x >= bpp ? prev[x - bpp] : 0;
      let v = line[x];
      if (f === 1) v += a;
      else if (f === 2) v += u;
      else if (f === 3) v += (a + u) >> 1;
      else if (f === 4) { // Paeth
        const p0 = a + u - c, pa = Math.abs(p0 - a), pb = Math.abs(p0 - u), pc = Math.abs(p0 - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? u : c;
      }
      out[x] = v & 0xFF;
    }
  }
  return { w, h, px };
}

function encodeRGB(w, h, rgb) {
  const stride = w * 3, raw = Buffer.alloc(h * (stride + 1));
  for (let y = 0; y < h; y++) rgb.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit truecolour, NO alpha — nothing to mask
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const [src, hex, out] of JOBS) {
  const bg = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  const { w, h, px } = decode(src);
  const rgb = Buffer.alloc(w * h * 3);
  for (let i = 0, o = 0; i < px.length; i += 4, o += 3) {
    const a = px[i + 3] / 255;
    for (let k = 0; k < 3; k++) rgb[o + k] = Math.round(px[i + k] * a + bg[k] * (1 - a));
  }
  writeFileSync(out, encodeRGB(w, h, rgb));
  console.log(out, w + 'x' + h, 'flat on', hex);
}
