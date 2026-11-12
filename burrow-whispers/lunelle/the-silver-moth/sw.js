/*
  PROJECT: Burrow Whispers #001 — The Silver Moth
  FILE: sw.js
  VERSION: 0.8.1
  PART: 1 of 1
  LOCATION: /stories/burrow-whispers/lunelle/the-silver-moth/ (same folder as index.html)
  NOTE: Offline play. Game files are saved at install.
        Images and fonts are saved the first time they are seen.
*/

const VERSION = "0.8.1";
const SHELL_CACHE = "bw-silver-moth-shell-" + VERSION;
const SEEN_CACHE = "bw-silver-moth-seen";   // kept between versions

// Saved at install. If you add a new game file, add it here and bump VERSION.
const SHELL_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/variables.css",
  "./css/base.css",
  "./css/panels.css",
  "./css/effects.css",
  "./css/guidance.css",
  "./js/data.js",
  "./js/mysteries.js",
  "./js/save.js",
  "./js/scrapbook.js",
  "./js/guidance.js",
  "./js/game.js",
  "./images/icon-192.png",
  "./images/icon-512.png",
  "./images/icon-512-maskable.png",
  "./assets/moon-petal.png"
];

const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

// ---------- Install: save the game files ----------
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(function (cache) {
      // One missing file must not break the whole install
      return Promise.all(SHELL_FILES.map(function (url) {
        return cache.add(url).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

// ---------- Activate: remove old game-file caches ----------
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(names.map(function (name) {
        const old = name.indexOf("bw-silver-moth-shell-") === 0 && name !== SHELL_CACHE;
        return old ? caches.delete(name) : null;
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

// ---------- Images and fonts: saved as seen ----------
async function cacheFirst(req) {
  const hit = await caches.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok || res.type === "opaque") {
      const cache = await caches.open(SEEN_CACHE);
      cache.put(req, res.clone());
    }
    return res;
  } catch (err) {
    return Response.error();
  }
}

// ---------- Game files: newest copy first, saved copy when offline ----------
async function networkFirst(req) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    if (req.mode === "navigate") {
      const page = await cache.match("./index.html");
      if (page) return page;
    }
    return Response.error();
  }
}

self.addEventListener("fetch", function (event) {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFont = FONT_HOSTS.indexOf(url.hostname) !== -1;
  if (!sameOrigin && !isFont) return;

  if (isFont || req.destination === "image") {
    event.respondWith(cacheFirst(req));
  } else {
    event.respondWith(networkFirst(req));
  }
});
