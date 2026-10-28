/**
 * QUANTERS Universal Offline-First & Notification Service Worker (v4.0)
 * Provides multi-device PWA caching, offline route navigation,
 * API snapshot fallback, and native Push / System notifications.
 */

const CACHE_VERSION = "quanters-pwa-v5.0";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGES_CACHE = `${CACHE_VERSION}-pages`;
const API_CACHE = `${CACHE_VERSION}-api`;

const CORE_PRECACHE_URLS = [
  "/",
  "/welcome",
  "/home",
  "/workshops",
  "/explore",
  "/badges",
  "/profile",
  "/checkin",
  "/exams",
  "/exams/exam",
  "/admin/members/member",
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
  "/brand/quanters_vector_v2.svg",
  "/brand/univ_logo_d.svg",
  "/brand/univ_logo_darkmode.svg",
  "/brand/univ_logo.svg",
  "/brand/welcome_keyframe_1.webp",
  "/brand/admin_overview_banner_bg.webp",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(PAGES_CACHE).then(async (cache) => {
      await Promise.allSettled(
        CORE_PRECACHE_URLS.map(async (url) => {
          try {
            const res = await fetch(url, { credentials: "same-origin", cache: "no-cache" });
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
            const resp = await fetch(r, { credentials: "same-origin" });
            if (resp && resp.ok) {
              await cache.put(r, resp.clone());
            }
          } catch {
            // Ignore offline errors during background warm
          }
        }
      })
    );
  }

  if (event.data.type === "SHOW_NOTIFICATION" && event.data.payload) {
    const { title, body, url, tag, priority } = event.data.payload;
    if (self.registration && self.registration.showNotification) {
      event.waitUntil(
        self.registration.showNotification(title || "QUANTERS", {
          body: body || "New update in QUANTERS.",
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-96.png",
          tag: tag || `quanters-${Date.now()}`,
          renotify: true,
          vibrate: [100, 50, 100],
          requireInteraction: priority === "Action needed",
          data: { url: url || "/notifications" },
        })
      );
    }
  }
});

self.addEventListener("push", (event) => {
  let payload = {
    title: "QUANTERS",
    body: "New update in QUANTERS.",
    url: "/notifications",
  };
  try {
    if (event.data) {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    }
  } catch {
    if (event.data) {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-96.png",
      tag: "quanters-push",
      renotify: true,
      vibrate: [100, 50, 100],
      data: { url: payload.url || "/notifications" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/notifications";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.focus();
            if ("navigate" in client) {
              client.navigate(targetUrl).catch(() => {});
            }
            return;
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Bypass byte-range requests (e.g. video streaming) to prevent browser buffer stalls
  if (request.headers.has("range")) return;

  const url = new URL(request.url);
  if (!url.protocol.startsWith("http")) return;
  if (
    url.origin !== self.location.origin &&
    !url.hostname.includes("fonts.gstatic.com") &&
    !url.hostname.includes("fonts.googleapis.com")
  ) {
    return;
  }

  // 1. API Snapshot Endpoint (/api/erp) -> Network-First with Offline Snapshot Fallback
  if (url.pathname === "/api/erp") {
    const hasAuth = request.headers.has("authorization");
    const isDeltaQuery = url.searchParams.has("versions") || url.searchParams.has("since");

    event.respondWith(
      (async () => {
        const apiCache = await caches.open(API_CACHE);
        try {
          const networkResp = await fetch(request);
          const ct = networkResp?.headers?.get("content-type") || "";
          // Only cache complete, unprivileged master snapshots to prevent delta cache poisoning or credential leakage
          if (
            networkResp &&
            networkResp.status === 200 &&
            ct.includes("application/json") &&
            !hasAuth &&
            !isDeltaQuery
          ) {
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
                memberCount: 13,
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

  // 2. Immutable Static Assets -> Cache-First
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
          const exactMatch = await pagesCache.match(request);
          if (exactMatch) return exactMatch;

          // RSC payloads must NEVER receive HTML fallbacks (prevents Next.js Flight parse crashes)
          if (!isNavigation) {
            return new Response("", {
              status: 503,
              statusText: "Service Unavailable Offline",
              headers: { "Content-Type": "text/x-component" },
            });
          }

          const pathMatch = await pagesCache.match(cleanPathKey);
          if (pathMatch) return pathMatch;

          // Route-aware dynamic offline shell matching (L3-PWA-02)
          if (cleanPathKey.startsWith("/admin/members/")) {
            const memberShell = await pagesCache.match("/admin/members/member");
            if (memberShell) return memberShell;
          }
          if (cleanPathKey.startsWith("/exams/")) {
            const examShell = await pagesCache.match("/exams/exam");
            if (examShell) return examShell;
          }

          const homeShell =
            (await pagesCache.match("/home")) ||
            (await pagesCache.match("/welcome")) ||
            (await pagesCache.match("/"));
          if (homeShell) return homeShell;

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

  // 4. All other GET requests -> Stale-While-Revalidate
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
