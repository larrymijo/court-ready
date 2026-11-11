// Turns the output of `npx expo export --platform web` into an installable, offline-capable web
// app for GitHub Pages:
//   1. index.html gets the tags iOS/Android need for "Add to Home Screen" (full screen, icon,
//      status bar, notch-safe viewport).
//   2. sw.js precaches every exported file so the app opens with no signal (gym basements).
//   3. 404.html is a copy of index.html, so deep links like /<repo>/routine/lower work on Pages.
//   4. The page and sw.js both carry the build's id, so an app left open can tell when a newer
//      build has been cached and offer "New version ready" (src/lib/serviceWorker.web.ts).
//
// The beta copy (EXPO_PUBLIC_CHANNEL=beta) is built the same way with its own base path, name and
// cache, so it installs as a second home-screen app next to the main one. The Pages workflow puts
// it in the main build's beta/ folder.
//
// Usage: EXPO_PUBLIC_BASE_URL=/court-ready node scripts/finish-web-build.mjs [dist]
//        EXPO_PUBLIC_BASE_URL=/court-ready/beta EXPO_PUBLIC_CHANNEL=beta node scripts/finish-web-build.mjs [dist]
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const dist = process.argv[2] ?? 'dist';
const base = (process.env.EXPO_PUBLIC_BASE_URL ?? '').replace(/\/+$/, '');
const beta = process.env.EXPO_PUBLIC_CHANNEL === 'beta';
// The beta copy gets its own name, so the two icons on the home screen can be told apart.
const homeScreenName = beta ? 'Hybrid Beta' : 'Hybrid';
// Each copy only cleans up caches it made itself, so the two never delete each other's files.
const cachePrefix = beta ? 'court-ready-beta-' : 'court-ready-app-';

function listFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

// 1. Home-screen tags.
const indexPath = join(dist, 'index.html');
let html = readFileSync(indexPath, 'utf8');
const viewport =
  '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />';
html = /<meta name="viewport"[^>]*>/.test(html)
  ? html.replace(/<meta name="viewport"[^>]*>/, viewport)
  : html.replace('</head>', `${viewport}\n</head>`);
// Stands in for the build id until it is known: the id is worked out from every file, this page included.
const BUILD_PENDING = 'window.__COURT_READY_BUILD__="pending"';
const tags = [
  // Tells the app which copy it is (src/lib/channel.ts), so the beta copy saves under its own key,
  // and which build it is, so it can tell when a newer one is ready.
  `<script>window.__COURT_READY_CHANNEL__=${JSON.stringify(beta ? 'beta' : 'main')};${BUILD_PENDING}</script>`,
  `<link rel="manifest" href="${base}/manifest.json" />`,
  `<link rel="apple-touch-icon" href="${base}/icons/apple-touch-icon.png" />`,
  '<meta name="theme-color" content="#000000" />',
  '<meta name="mobile-web-app-capable" content="yes" />',
  '<meta name="apple-mobile-web-app-capable" content="yes" />',
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />',
  `<meta name="apple-mobile-web-app-title" content="${homeScreenName}" />`,
  '<style>html, body { background-color: #000000; overscroll-behavior: none; }</style>',
];
if (!html.includes('rel="manifest"')) {
  html = html.replace('</head>', `\n    ${tags.join('\n    ')}\n  </head>`);
}
// Run on a folder that was finished before, the page already names a build: start from the stand-in again.
html = html.replace(/window\.__COURT_READY_BUILD__="[^"]*"/, BUILD_PENDING);
writeFileSync(indexPath, html);

const manifestPath = join(dist, 'manifest.json');
if (beta && existsSync(manifestPath)) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const named = { ...manifest, name: 'Hybrid Beta', short_name: homeScreenName };
  writeFileSync(manifestPath, `${JSON.stringify(named, null, 2)}\n`);
}

// 2. The build id: a fingerprint of everything exported. Any change to any file gives a new one.
const files = listFiles(dist)
  .map((file) => relative(dist, file).split(sep).join('/'))
  .filter((file) => !['sw.js', '404.html'].includes(file) && !file.endsWith('.map') && !file.startsWith('.'))
  .sort();
const hash = createHash('sha256');
for (const file of files) hash.update(file).update(readFileSync(join(dist, file)));
const version = hash.digest('hex').slice(0, 12);
const urls = files.map((file) => (file === 'index.html' ? `${base}/` : `${base}/${file}`));
html = html.replace(BUILD_PENDING, `window.__COURT_READY_BUILD__=${JSON.stringify(version)}`);
writeFileSync(indexPath, html);

// 3. 404.html fallback for client-side routes. Pages serves the main build's 404.html for every
// missing path on the site, the beta copy's included. A deep link into the beta copy that reaches
// it is sent to the beta start page, where the beta copy's own service worker takes over.
const betaPath = `${base}/beta/`;
const toBeta = `<script>(function(){var b=${JSON.stringify(betaPath)},p=location.pathname;if(p.indexOf(b)===0&&p!==b)location.replace(b)})()</script>`;
writeFileSync(join(dist, '404.html'), beta ? html : html.replace(/<head[^>]*>/, (head) => `${head}${toBeta}`));

// 4. Service worker with a precache list of everything exported.
// Caches this copy made earlier. The main app also owns the names it used before the beta copy existed.
const ownsCache = beta
  ? `(key) => key.startsWith(${JSON.stringify(cachePrefix)})`
  : `(key) => key.startsWith(${JSON.stringify(cachePrefix)}) || /^court-ready-[0-9a-f]{12}$/.test(key)`;
// The beta copy lives under the main app's path but looks after itself.
const skipBeta = beta ? '' : `\n  if (url.pathname.startsWith(${JSON.stringify(betaPath)})) return;`;

const sw = `// Generated by scripts/finish-web-build.mjs. Do not edit.
const VERSION = ${JSON.stringify(version)};
const CACHE = ${JSON.stringify(cachePrefix)} + VERSION;
const SHELL = ${JSON.stringify(`${base}/`)};
const PRECACHE = ${JSON.stringify(urls, null, 2)};
const ownsCache = ${ownsCache};

// Files with a fingerprint in their name never change, so the browser's own copy will do. The page,
// the manifest and the icons keep their names from build to build: fetch those afresh, or a copy
// the browser still holds from the previous build could end up in this build's cache.
const fresh = (url) => (url.includes('/_expo/') || url.includes('/assets/') ? url : new Request(url, { cache: 'reload' }));

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE.map(fresh)))
      .then(() => self.skipWaiting()),
  );
});

// The open app asks which build is cached here. If it is not the one on screen, the app offers
// "New version ready" (src/lib/serviceWorker.web.ts).
self.addEventListener('message', (event) => {
  const port = event.ports && event.ports[0];
  if (port && event.data && event.data.type === 'court-ready:version') port.postMessage({ version: VERSION });
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => ownsCache(key) && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

// A response that followed a redirect can't answer a page load, so hand back a plain copy of it.
function plain(response) {
  if (!response.redirected) return response;
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers: response.headers });
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;${skipBeta}
  if (request.mode === 'navigate' && !/\\.[a-z0-9]+$/i.test(url.pathname)) {
    // Every page of the app is the same shell. Ask the network for it first so a new version shows
    // up; offline, or when the host answers with an error page, use the cached copy.
    const cached = () => caches.match(SHELL, { cacheName: CACHE });
    event.respondWith(
      fetch(SHELL, { cache: 'no-store' })
        .then((response) => (response.ok ? plain(response) : cached().then((hit) => hit || response)))
        .catch(cached),
    );
    return;
  }
  // Every exported file is in this version's cache; a new build gets a new cache.
  event.respondWith(caches.match(request).then((hit) => hit || fetch(request)));
});
`;
writeFileSync(join(dist, 'sw.js'), sw);

console.log(
  `Web build ready (${beta ? 'beta' : 'main'} copy): base "${base || '/'}", ${files.length} files precached, version ${version}.`,
);
