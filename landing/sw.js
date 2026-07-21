/* Crown Hair Oil — root kill-switch service worker.
   The mobile app used to live at the site root and registered a
   caching SW here (/Crown-Oil-Hier/sw.js). The app has since moved to
   /app/, so this replacement takes over that old registration, clears
   its caches, reloads any open clients onto the new home page, and
   unregisters itself. New visitors never register this — it only runs
   to clean up returning users who still have the old worker. */
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: "window" });
    await Promise.all(clients.map((c) => c.navigate(c.url).catch(() => {})));
    await self.registration.unregister();
  })());
});
