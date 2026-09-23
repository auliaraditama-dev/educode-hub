/* global self, caches */
// Generated with a unique build ID. Only public, same-origin GET resources are cached.
const CONFIG = /* PWA_CONFIG */ null;
const CACHE = `educode-offline-${CONFIG.version}`;
const MARKER = new URL("/__educode_offline_ready", self.location.origin).href;
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      try {
        for (let i = 0; i < CONFIG.urls.length; i += 8) {
          await Promise.all(
            CONFIG.urls.slice(i, i + 8).map(async (url) => {
              const response = await fetch(
                new Request(url, {
                  cache: "reload",
                  credentials: "same-origin",
                }),
              );
              if (!response.ok || response.redirected)
                throw new Error(`Offline download failed: ${url}`);
              await cache.put(url, response);
            }),
          );
        }
        await cache.put(MARKER, new Response(CONFIG.version));
      } catch (error) {
        await caches.delete(CACHE);
        throw error;
      }
    })(),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Keep the preceding version for tabs that still use its chunk URLs.
      const old = (await caches.keys()).filter(
        (key) => key.startsWith("educode-offline-") && key !== CACHE,
      );
      await Promise.all(old.slice(0, -1).map((key) => caches.delete(key)));
      await self.clients.claim();
    })(),
  );
});
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data?.type === "STATUS")
    event.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE);
        event.ports[0]?.postMessage({
          ready: Boolean(await cache.match(MARKER)),
          version: CONFIG.version,
          count: CONFIG.urls.length,
        });
      })(),
    );
});
async function fromCache(url) {
  const cache = await caches.open(CACHE);
  return cache.match(url, { ignoreVary: true });
}
self.addEventListener("fetch", (event) => {
  const request = event.request,
    url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  // Never mix React flight responses with full HTML documents.
  if (request.headers.get("RSC") === "1" || url.searchParams.has("_rsc"))
    return;
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request, {
            signal: AbortSignal.timeout(4000),
          });
          if (response.status < 500) return response;
        } catch {}
        // Search runs locally; any query uses the same pre-rendered search page.
        return (
          (await fromCache(url.pathname)) || (await fromCache("/offline.html"))
        );
      })(),
    );
    return;
  }
  if (CONFIG.urls.includes(url.pathname))
    event.respondWith(
      (async () => {
        const hit = await fromCache(url.pathname);
        if (hit) return hit;
        return fetch(request);
      })(),
    );
  else if (url.pathname.startsWith("/_next/static/"))
    event.respondWith(
      (async () => {
        // Old open tabs may still reference the preceding build.
        const hit = await caches.match(request, { ignoreVary: true });
        return hit || fetch(request);
      })(),
    );
});
