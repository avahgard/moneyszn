/* CONFIG */
const shell = `${config.base}index.html`;
const assetPaths = new Set(config.assets);

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(config.cacheName);
        // Reload prevents HTTP cache reuse of the mutable HTML and manifest.
        await cache.addAll(
          config.assets.map((url) => new Request(url, { cache: 'reload' })),
        );
        await self.skipWaiting();
      } catch (error) {
        await caches.delete(config.cacheName);
        throw error;
      }
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter(
            (name) =>
              name.startsWith(config.prefix) && name !== config.cacheName,
          )
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (
    event.request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    !url.pathname.startsWith(config.base)
  )
    return;
  // Only the application entry points are shell navigations. Missing routes and
  // resources retain HTTP failures instead of being disguised as successful HTML.
  const navigation =
    event.request.mode === 'navigate' &&
    (url.pathname === config.base || url.pathname === shell);
  if (!navigation && !assetPaths.has(url.pathname)) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(config.cacheName);
      if (navigation) {
        try {
          const response = await fetch(event.request);
          if (response.ok) return response;
        } catch {
          /* Offline: use the atomically installed shell. */
        }
        return (await cache.match(shell)) ?? Response.error();
      }
      return (await cache.match(url.pathname)) ?? fetch(event.request);
    })(),
  );
});
