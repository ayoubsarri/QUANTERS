/**
 * QUANTERS Universal Offline-First Service Worker (v3.2)
 * Provides multi-device PWA caching, offline route navigation,
 * API snapshot fallback, and aggressive bandwidth/quota reduction.
 */

const CACHE_VERSION = "quanters-pwa-v3.2";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGES_CACHE = `${CACHE_VERSION}-pages`;
const API_CACHE = `${CACHE_VERSION}-api`;

const CORE_PRECACHE_URLS = [
  "/",
  "/welcome",
  "/login",
  "/home",
  "/workshops",
  "/explore",
  "/badges",
  "/profile",
  "/checkin",
  "/exams",
  "/exams/exam-astrophysics",
  "/projects/submit",
  "/proposals",
  "/notifications",
  "/manager",
  "/onboarding",
  "/manifest.json",
  "/apple-touch-icon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/brand/logo_quanta_opt.webp",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(PAGES_CACHE).then(async (cache) => {
      await Promise.allSettled(
        CORE_PRECACHE_URLS.map(async (url) => {
          try {
            const res = await fetch(url, { credentials: "same-origin" });
            if (res && res.ok) {
              await cache.put(url, res.clone());
            }
          } catch {
            // Ignore individual precache failure when installing on flaky network
          }
        })
      );
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(
            (k) =>
              k !== STATIC_CACHE &&
              k !== PAGES_CACHE &&
              k !== API_CACHE
          )
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (!event.data) return;
  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data.type === "WARM_ROUTES" && Array.isArray(event.data.routes)) {
    event.waitUntil(
      caches.open(PAGES_CACHE).then(async (cache) => {
        for (const r of event.data.routes) {
          try {
            const existing = await cache.match(r);
            if (!existing) {
              const resp = await fetch(r, { credentials: "same-origin" });
              if (resp && resp.ok) {
                await cache.put(r, resp.clone());
              }
            }
          } catch {
            // Ignore offline errors during background warm
          }
        }
      })
    );
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Skip external non-HTTPS or browser-extension requests
  if (!url.protocol.startsWith("http")) return;

  // 1. API Snapshot Endpoint (/api/erp) -> Network-First with Offline Snapshot Fallback
  if (url.pathname === "/api/erp") {
    event.respondWith(
      (async () => {
        const apiCache = await caches.open(API_CACHE);
        try {
          const networkResp = await fetch(request);
          if (networkResp && networkResp.status === 200) {
            await apiCache.put("/api/erp", networkResp.clone());
          }
          return networkResp;
        } catch {
          const cachedResp = await apiCache.match("/api/erp");
          if (cachedResp) {
            return cachedResp;
          }
          return new Response(
            JSON.stringify({
              ok: true,
              offlineFallback: true,
              telemetry: {
                dbSizeBytes: 0,
                dbSizeKB: 0,
                memberCount: 11,
                quotaUsedPercent: 0,
              },
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                "X-Quanters-Offline": "1",
              },
            }
          );
        }
      })()
    );
    return;
  }

  // 2. Immutable Static Assets (/_next/static/*, /icons/*, /brand/*, Google Fonts) -> Cache-First (Saves Quota)
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/brand/") ||
    url.hostname.includes("fonts.gstatic.com") ||
    url.hostname.includes("fonts.googleapis.com")
  ) {
    event.respondWith(
      (async () => {
        const staticCache = await caches.open(STATIC_CACHE);
        const cached = await staticCache.match(request);
        if (cached) return cached;
        try {
          const resp = await fetch(request);
          if (resp && resp.status === 200) {
            await staticCache.put(request, resp.clone());
          }
          return resp;
        } catch {
          return cached || Response.error();
        }
      })()
    );
    return;
  }

  // 3. HTML Page Navigations & Next.js RSC Flight Payloads -> Network-First with Offline Page Cache Fallback
  const isNavigation = request.mode === "navigate";
  const isRsc = request.headers.get("RSC") === "1" || url.searchParams.has("_rsc");

  if (isNavigation || isRsc) {
    event.respondWith(
      (async () => {
        const pagesCache = await caches.open(PAGES_CACHE);
        const cleanPathKey = url.pathname;
        try {
          const networkResp = await fetch(request);
          if (networkResp && networkResp.status === 200) {
            await pagesCache.put(request, networkResp.clone());
            if (isNavigation) {
              await pagesCache.put(cleanPathKey, networkResp.clone());
            }
          }
          return networkResp;
        } catch {
          // Offline fallback lookup: exact request -> pathname -> /home app shell
          const exactMatch = await pagesCache.match(request);
          if (exactMatch) return exactMatch;

          const pathMatch = await pagesCache.match(cleanPathKey);
          if (pathMatch) return pathMatch;

          if (isNavigation) {
            const homeShell =
              (await pagesCache.match("/home")) ||
              (await pagesCache.match("/welcome")) ||
              (await pagesCache.match("/"));
            if (homeShell) return homeShell;
          }

          return new Response(
            "<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>QUANTERS Offline</title><style>body{font-family:system-ui,sans-serif;background:#040C1A;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100dvh;margin:0;padding:24px;text-align:center}.card{max-width:380px;background:#0A1A30;border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:24px}a{display:inline-block;margin-top:16px;padding:10px 20px;background:#1D63EB;color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:13px}</style></head><body><div class='card'><h2>QUANTERS Offline Mode</h2><p style='color:#94a3b8;font-size:13px'>Your connection is offline. Cached screens and your local member data remain available.</p><a href='/home'>Open Cached Member Hub</a></div></body></html>",
            {
              status: 200,
              headers: { "Content-Type": "text/html; charset=utf-8" },
            }
          );
        }
      })()
    );
    return;
  }

  // 4. All other GET requests (images, avatars, etc.) -> Stale-While-Revalidate
  event.respondWith(
    (async () => {
      const staticCache = await caches.open(STATIC_CACHE);
      const cached = await staticCache.match(request);
      const fetchPromise = fetch(request)
        .then((networkResp) => {
          if (networkResp && networkResp.status === 200) {
            staticCache.put(request, networkResp.clone());
          }
          return networkResp;
        })
        .catch(() => cached);
      return cached || (await fetchPromise) || Response.error();
    })()
  );
});
