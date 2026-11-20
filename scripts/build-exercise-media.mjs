// Run "node scripts/build-exercise-media.mjs [exercise-id ...]" with Node 20+ and
// Python 3 + Pillow (set PYTHON to the interpreter if it is not named "python").
// A clean build downloads the credited originals. Their verified copies in .expo/
// allow subsequent builds offline. The application only uses the committed WebPs.
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const manifest = JSON.parse(await readFile(join(root, 'src/data/exerciseMedia.json'), 'utf8'));
const cache = join(root, '.expo/exercise-media-originals');
const selected = process.argv.slice(2);
const ids = selected.length ? [...new Set(selected)] : Object.keys(manifest);
for (const id of ids) {
  if (!/^[a-z0-9_]+$/.test(id) || !Object.hasOwn(manifest, id)) throw new Error('Unknown exercise: ' + id);
}

const encode = `
import json, sys
from PIL import Image, ImageOps

for frame in json.load(sys.stdin):
    with Image.open(frame["input"]) as original:
        original.seek(frame.get("index", 0))
        photo = ImageOps.exif_transpose(original).convert("RGB")
    if "crop" in frame:
        left, top, right, bottom = frame["crop"]
        if not (0 <= left < right <= photo.width and 0 <= top < bottom <= photo.height):
            raise ValueError("Crop extends beyond the original: " + frame["input"])
        photo = photo.crop((left, top, right, bottom))
    photo = ImageOps.pad(ImageOps.grayscale(photo), (480, 320), Image.Resampling.LANCZOS, color=0)
    photo.save(frame["output"], "WEBP", quality=78, method=6)
`;

const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const verified = new Set();
async function original(frame) {
  if (!/^[a-f0-9]{64}$/.test(frame.sha256) || !frame.url.startsWith('https://')) {
    throw new Error('An original needs an HTTPS URL and a SHA-256 digest: ' + frame.source);
  }
  const path = join(cache, frame.sha256);
  if (!verified.has(path)) {
    let saved;
    try {
      saved = await readFile(path);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    if (!saved) {
      const response = await fetch(frame.url, {
        headers: { 'User-Agent': 'Hybrid exercise media builder (https://github.com/larrymijo/court-ready)' },
      });
      if (!response.ok) throw new Error('Download returned ' + response.status + ': ' + frame.url);
      saved = Buffer.from(await response.arrayBuffer());
      if (hash(saved) !== frame.sha256) throw new Error('Original changed. Review the new source: ' + frame.source);
      await writeFile(path, saved);
    } else if (hash(saved) !== frame.sha256) {
      throw new Error('Cached original failed verification: ' + path);
    }
    verified.add(path);
  }
  return path;
}

await mkdir(cache, { recursive: true });
const scratch = await mkdtemp(join(tmpdir(), 'hybrid-exercise-media-'));
try {
  const frames = [];
  for (const id of ids) {
    const pair = manifest[id].frames;
    if (pair.length !== 2) throw new Error('Expected two reviewed frames for ' + id);
    for (const [i, frame] of pair.entries()) {
      const name = i === 0 ? 'start' : 'end';
      frames.push({
        input: await original(frame),
        index: frame.index ?? 0,
        crop: frame.crop,
        output: join(scratch, id + '-' + name + '.webp'),
        destination: join(root, 'public/media', id, name + '.webp'),
      });
    }
  }
  const result = spawnSync(process.env.PYTHON || 'python', ['-c', encode], {
    input: JSON.stringify(frames), stdio: ['pipe', 'inherit', 'inherit'],
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error('Could not encode the reviewed frames with Python + Pillow.');
  for (const frame of frames) {
    await mkdir(dirname(frame.destination), { recursive: true });
    // Stage alongside the destination for atomic replacement even when tmpdir is on another volume.
    const staged = frame.destination + '.' + process.pid + '.tmp';
    try {
      await writeFile(staged, await readFile(frame.output));
      await rename(staged, frame.destination);
    } finally {
      await rm(staged, { force: true });
    }
  }
  console.log('Built ' + ids.length + ' exercise photo pairs.');
} finally {
  await rm(scratch, { recursive: true, force: true });
}
