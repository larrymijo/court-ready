import { afterAll, describe, expect, it } from '@jest/globals';
import { Buffer } from 'node:buffer';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { runInNewContext } from 'node:vm';

import { examplePlans } from '@/data/plan-templates';
import { planMediaOrder } from '@/lib/serviceWorkerMedia';

const origin = 'https://example.test';
const root = mkdtempSync(join(tmpdir(), 'hybrid-sw-'));
afterAll(() => rmSync(root, { recursive: true, force: true }));

// Exercise the same generated worker the Pages build publishes, against a small synthetic export.
function build(channel, includeIncompletePair = false) {
  const base = channel === 'beta' ? '/court-ready/beta/' : '/court-ready/';
  const dir = mkdtempSync(join(root, channel + '-'));
  for (const id of ['alpha', 'bench']) {
    const path = join(dir, 'media', id);
    mkdirSync(path, { recursive: true });
    for (const frame of ['start', 'end']) writeFileSync(join(path, frame + '.webp'), frame);
  }
  if (includeIncompletePair) {
    const path = join(dir, 'media', 'incomplete');
    mkdirSync(path);
    writeFileSync(join(path, 'start.webp'), 'start');
  }
  writeFileSync(join(dir, 'index.html'), '<html><head></head><body></body></html>');
  execFileSync(process.execPath, [resolve('scripts/finish-web-build.mjs'), dir], {
    stdio: 'pipe',
    env: { ...process.env, EXPO_PUBLIC_BASE_URL: base.slice(0, -1), EXPO_PUBLIC_CHANNEL: channel },
  });
  return { base, code: readFileSync(join(dir, 'sw.js'), 'utf8') };
}

function worker({ base, code }, stores = new Map()) {
  const listeners = {};
  const fetched = [];
  const path = (request) => new URL(request.url ?? request, origin).pathname;
  const photo = { ok: true, headers: { get: () => 'image/webp' }, clone: () => photo };
  let network = () => photo;
  const navigator = { onLine: true };
  const caches = {
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map());
      const entries = stores.get(name);
      return {
        match: async (request) => entries.get(path(request)),
        put: async (request, response) => entries.set(path(request), response),
        addAll: async (requests) => {
          for (const request of requests) entries.set(path(request), 'shell');
        },
      };
    },
    keys: async () => [...stores.keys()],
    delete: async (name) => stores.delete(name),
    match: async (request, { cacheName }) => stores.get(cacheName)?.get(path(request)),
  };
  runInNewContext(code, {
    self: {
      navigator, location: { origin }, skipWaiting() {}, clients: { claim() {} },
      addEventListener(type, listener) { listeners[type] = listener; },
    },
    URL,
    Request: class { constructor(url) { this.url = url; } },
    Response: class { constructor(body, options) { this.body = body; this.status = options.status; } },
    caches,
    fetch: async (request) => {
      const url = path(request);
      fetched.push(url);
      return network(url);
    },
  });
  function dispatch(type, data) {
    let result;
    const handle = (promise) => { result = promise; };
    listeners[type]({ waitUntil: handle, respondWith: handle, ...data });
    return result;
  }
  return {
    stores, fetched, photo, dispatch, navigator,
    setNetwork(fn) { network = fn; },
    queue: (exerciseIds) => dispatch('message', { data: { type: 'court-ready:cache-media', exerciseIds } }),
    request: (pathname, mode) => dispatch('fetch', { request: { url: origin + pathname, method: 'GET', mode } }),
    frame: (id, frame) => base + 'media/' + id + '/' + frame + '.webp',
  };
}

describe('exercise photos in the offline web build', () => {
  it('gives the active plan and its checklist movements priority over other saved plans', () => {
    const [first, second] = examplePlans();
    const gym = first.workouts[0];
    const workout = (id, warmup) => ({ ...gym, warmup, items: [{ ...gym.items[0], exerciseId: id }] });
    const plans = [
      { ...first, workouts: [workout('other', 'lower')], sports: [] },
      { ...second, workouts: [workout('active', 'upper')], sports: [] },
    ];
    const ids = planMediaOrder(plans, second.id);
    expect(ids[0]).toBe('active');
    expect(ids).toContain('c_wallslide');
    expect(ids.indexOf('c_wallslide')).toBeLessThan(ids.indexOf('other'));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('installs without photos, downloads known pairs in order, and resumes after losing signal', async () => {
    const w = worker(build('beta'));
    await w.dispatch('install');
    expect([...w.stores.values()].flatMap((cache) => [...cache.keys()])).toEqual(['/court-ready/beta/']);
    const first = w.frame('bench', 'start');
    const second = w.frame('bench', 'end');
    w.setNetwork((url) => {
      if (url !== first) {
        w.navigator.onLine = false;
        throw new Error('offline');
      }
      return w.photo;
    });
    await w.queue(['missing', 'bench']);
    expect(w.fetched).toEqual([first, second]);
    expect(await w.request(first)).toBe(w.photo);
    w.navigator.onLine = true;
    w.setNetwork(() => w.photo);
    await w.queue(['bench']);
    expect(w.fetched).toEqual([first, second, second, w.frame('alpha', 'start'), w.frame('alpha', 'end')]);
    w.setNetwork(() => { throw new Error('offline'); });
    expect(await w.request(second)).toBe(w.photo);
  });

  it('keeps downloading after a failed frame and gives a recoverable response if the shell was evicted', async () => {
    const w = worker(build('main', true));
    w.setNetwork((url) => {
      if (url === w.frame('alpha', 'end')) throw new Error('connection reset');
      return w.photo;
    });
    await w.queue([]);
    expect(w.fetched).toHaveLength(4);
    w.setNetwork(() => { throw new Error('offline'); });
    expect(await w.request(w.frame('bench', 'end'))).toBe(w.photo);
    expect((await w.request('/court-ready/', 'navigate')).status).toBe(503);
    await w.dispatch('install');
    expect(await w.request('/court-ready/', 'navigate')).toBe('shell');
  });

  it('keeps the root and beta caches isolated and retries a photo that returned an HTML page', async () => {
    const stores = new Map();
    const main = worker(build('main'), stores);
    const beta = worker(build('beta'), stores);
    for (const w of [main, beta]) await w.dispatch('install');
    const url = beta.frame('alpha', 'start');
    const html = { ok: true, headers: { get: () => 'text/html' } };
    beta.setNetwork((address) => address === url ? html : beta.photo);
    await beta.queue([]);
    await main.queue([]);
    const validKeys = [...stores.keys()];
    stores.set('court-ready-app-old', new Map());
    await main.dispatch('activate');
    expect([...stores.keys()]).toEqual(validKeys);
    expect(main.request(url)).toBeUndefined();
    expect(beta.request(main.frame('alpha', 'start'))).toBeUndefined();
    beta.setNetwork(() => beta.photo);
    expect(await beta.request(url)).toBe(beta.photo);
    beta.setNetwork(() => { throw new Error('offline'); });
    expect(await beta.request(url)).toBe(beta.photo);
    expect(beta.fetched.filter((u) => u === url)).toHaveLength(2);
  });

  it('recognizes WebP from a static host serving binary files and skips a generic HTML fallback', async () => {
    const w = worker(build('beta'));
    const valid = w.frame('bench', 'start');
    const fallback = w.frame('bench', 'end');
    const bytes = readFileSync(resolve('public/media/d_squat/start.webp'));
    const response = (data) => ({
      ok: true, headers: { get: () => 'application/octet-stream' },
      clone() { return this; },
      arrayBuffer: async () => Uint8Array.from(data).buffer,
    });
    const photo = response(bytes);
    w.setNetwork((url) => url === fallback ? response(Buffer.from('<html>missing</html>')) : photo);
    await w.queue(['bench']);
    w.setNetwork(() => { throw new Error('offline'); });
    expect(await w.request(valid)).toBe(photo);
    await expect(w.request(fallback)).rejects.toThrow('offline');
    w.setNetwork(() => photo);
    expect(await w.request(fallback)).toBe(photo);
    w.setNetwork(() => { throw new Error('offline'); });
    expect(await w.request(fallback)).toBe(photo);
  });
});
