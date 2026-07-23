/* Crown Hair Oil PWA — offline shell cache.
   All shell paths are relative to the SW scope so the same worker
   serves both root deployments and subpath deployments (GitHub Pages).

   Strategy:
   - HTML/navigation requests are NETWORK-FIRST so a new deploy shows up
     immediately (the cache is only an offline fallback). This stops the
     app from getting "stuck" on a previously cached version.
   - Hashed static assets (Vite emits content-hashed filenames) are
     cache-first / stale-while-revalidate, which is safe because a new
     build changes the filename. */
const CACHE = "crown-app-v2.1.3";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./assets/logo.jpg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function cachePut(request, response) {
  if (response && response.ok && new URL(request.url).origin === location.origin) {
    const copy = response.clone();
    caches.open(CACHE).then((c) => c.put(request, copy));
  }
  return response;
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  const isHTML = req.mode === "navigate" || req.destination === "document";

  if (isHTML) {
    // Network-first: always try the latest page; fall back to cache offline.
    e.respondWith(
      fetch(req)
        .then((res) => cachePut(req, res))
        .catch(() => caches.match(req).then((c) => c || caches.match("./index.html")))
    );
    return;
  }

  // Stale-while-revalidate for everything else (hashed assets, images…).
  e.respondWith(
    caches.match(req).then((cached) => {
      const fetched = fetch(req).then((res) => cachePut(req, res)).catch(() => cached);
      return cached || fetched;
    })
  );
});
