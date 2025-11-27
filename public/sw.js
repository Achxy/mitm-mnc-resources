const CACHE_VERSION = "v3";
const STATIC_CACHE = `static-${CACHE_VERSION}`;
// Shared cache name with main.js
const RESOURCE_CACHE = "mnc-resource-cache-v1";

const STATIC_ASSETS = ["/", "/index.html", "/resources-manifest.json", "/sw.js"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("static-") && key !== STATIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
});

const cacheFirstPdf = async (request) => {
  // Try the shared resource cache first (populated by passive loader)
  const cache = await caches.open(RESOURCE_CACHE);
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }

  // Fallback to network
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    throw error;
  }
};

const networkFirst = async (request) => {
  const cache = await caches.open(STATIC_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
};

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);
  const pathname = url.pathname.toLowerCase();

  if (pathname.startsWith("/contents/") && pathname.endsWith(".pdf")) {
    event.respondWith(cacheFirstPdf(event.request));
    return;
  }

  event.respondWith(networkFirst(event.request));
});
