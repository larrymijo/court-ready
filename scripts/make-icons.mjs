// Draws the Hybrid app icon (a block H and an underline bar on black, with a thin ring) and writes
// every icon file the app uses:
//   public/icons/        apple-touch-icon (180), icon-192, icon-512      the web app's home-screen icons
//   assets/images/       icon (1024), favicon (48, no ring: too faint at that size), splash-icon
//                        (1024, rounded tile on transparent), android-icon-foreground / -monochrome
//                        (H and bar only, transparent, inside the adaptive icon's safe zone) and
//                        android-icon-background (black with the ring)
// Node built-ins only: shapes are tested per sample (4 x 4 samples per pixel for anti-aliasing) and
// the PNGs are encoded here with node:zlib. Output is deterministic: running it twice gives
// byte-identical files.
//
// Usage: node scripts/make-icons.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { crc32, deflateSync } from 'node:zlib';

const SS = 4; // samples per axis per pixel
const INK = 250; // #fafafa
const RING = 46; // #2e2e2e

// The design on a 1024 canvas.
const RING_CENTRE = [735, 240];
const RING_RADIUS = 630;
const RING_WIDTH = 18;
const H_RECTS = [
  [362, 280, 450, 640], // left stem
  [574, 280, 662, 640], // right stem
  [450, 426, 574, 494], // crossbar
];
const BAR = { x0: 392, y0: 712, x1: 632, y1: 748 }; // rounded ends, radius 18
const TILE_RADIUS = 224; // corner radius of the splash tile

function inRect(x, y, [x0, y0, x1, y1]) {
  return x >= x0 && x < x1 && y >= y0 && y < y1;
}

function inBar(x, y) {
  const r = (BAR.y1 - BAR.y0) / 2;
  const cy = BAR.y0 + r;
  if (y < BAR.y0 || y >= BAR.y1) return false;
  if (x >= BAR.x0 + r && x < BAR.x1 - r) return true;
  const cx = x < BAR.x0 + r ? BAR.x0 + r : BAR.x1 - r;
  return (x - cx) ** 2 + (y - cy) ** 2 < r * r;
}

function inRing(x, y) {
  const d = Math.hypot(x - RING_CENTRE[0], y - RING_CENTRE[1]);
  return Math.abs(d - RING_RADIUS) < RING_WIDTH / 2;
}

function inTile(x, y) {
  const r = TILE_RADIUS;
  const cx = Math.min(Math.max(x, r), 1024 - r);
  const cy = Math.min(Math.max(y, r), 1024 - r);
  return (x - cx) ** 2 + (y - cy) ** 2 < r * r;
}

// Each layer maps a point on the 1024 canvas to [grey, alpha] (alpha 0..1).
const full = (ring) => (x, y) => {
  if (inBar(x, y) || H_RECTS.some((r) => inRect(x, y, r))) return [INK, 1];
  return [ring && inRing(x, y) ? RING : 0, 1];
};

// Android adaptive icon: the H and bar shrink to fit the box the old CR letters filled
// (y 379..662, centred on x 512), well inside the 66% safe circle.
const FIT = (662 - 379) / (748 - 280);
const foreground = (grey) => (x, y) => {
  const ux = 512 + (x - 512) / FIT;
  const uy = 280 + (y - 379) / FIT;
  const on = inBar(ux, uy) || H_RECTS.some((r) => inRect(ux, uy, r));
  return [grey, on ? 1 : 0];
};

const layers = {
  full: full(true),
  small: full(false),
  tile: (x, y) => (inTile(x, y) ? full(true)(x, y) : [0, 0]),
  foreground: foreground(INK),
  monochrome: foreground(255),
  background: (x, y) => [inRing(x, y) ? RING : 0, 1],
};

function render(size, layer) {
  const out = Buffer.alloc(size * size * 4);
  const scale = 1024 / size;
  const n = SS * SS;
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let sumGrey = 0;
      let sumAlpha = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const [g, a] = layer((px + (sx + 0.5) / SS) * scale, (py + (sy + 0.5) / SS) * scale);
          sumGrey += g * a;
          sumAlpha += a;
        }
      }
      const i = (py * size + px) * 4;
      const grey = sumAlpha ? Math.round(sumGrey / sumAlpha) : 0;
      out[i] = out[i + 1] = out[i + 2] = grey;
      out[i + 3] = Math.round((sumAlpha / n) * 255);
    }
  }
  return out;
}

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const head = Buffer.alloc(4);
  head.writeUInt32BE(data.length);
  const tail = Buffer.alloc(4);
  tail.writeUInt32BE(crc32(body));
  return Buffer.concat([head, body, tail]);
}

// 8-bit RGBA PNG, every scanline filtered with "none".
function encodePng(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: RGBA
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const files = [
  ['public/icons/apple-touch-icon.png', 180, 'full'],
  ['public/icons/icon-192.png', 192, 'full'],
  ['public/icons/icon-512.png', 512, 'full'],
  ['assets/images/icon.png', 1024, 'full'],
  ['assets/images/favicon.png', 48, 'small'],
  ['assets/images/splash-icon.png', 1024, 'tile'],
  ['assets/images/android-icon-foreground.png', 1024, 'foreground'],
  ['assets/images/android-icon-background.png', 1024, 'background'],
  ['assets/images/android-icon-monochrome.png', 1024, 'monochrome'],
];

for (const [path, size, layer] of files) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, encodePng(size, render(size, layers[layer])));
  console.log(`${path} (${size} x ${size})`);
}
