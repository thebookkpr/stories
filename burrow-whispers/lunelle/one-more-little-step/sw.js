/* One More Little Step — sw.js V1.4
   V1.4: site moved to the stories repository; cache name bumped to omls-v4. No path changes needed (all paths are relative).
   V1.3: game moved into the one-more-little-step/ folder; cache name bumped to omls-v3. No path changes needed (all paths are relative).
   V1.1: cache name bumped to omls-v2 so old saved files are replaced (scene.css fade fix for Lunelle).
   V1.0: network-first: online = newest files, offline = cached copy.
   Bump VERSION when you update the game (good habit, not required). */

const VERSION = "omls-v4";

const FILES = [
  "./",
  "index.html",
  "manifest.json",
  "css/variables.css",
  "css/base.css",
  "css/title.css",
  "css/scene.css",
  "css/ui.css",
  "css/effects.css",
  "css/responsive.css",
  "js/scenes.js",
  "js/effects.js",
  "js/audio.js",
  "js/game.js",
  "js/save.js",
  "images/title-screen.jpg",
  "images/scene-pond.jpg",
  "images/scene-silver-light.jpg",
  "images/scene-clearing.jpg",
  "images/scene-moth.jpg",
  "images/scene-hilltop.jpg",
  "assets/lunelle-blinking.gif",
  "images/sprites/lunelle-light.png",
  "images/sprites/lunelle-clearing.png",
  "images/sprites/lunelle-moth.png",
  "images/sprites/lunelle-hilltop.png",
  "images/sprites/silver-petal.png",
  "images/icon-192.png",
  "images/icon-512.png"
];

/* Install: save every file. One missing file will not break the rest. */
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(VERSION)
      .then(c => Promise.all(FILES.map(f => c.add(f).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

/* Activate: delete caches from older versions */
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Fetch: try the network first, keep a fresh copy, fall back to cache */
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(VERSION).then(c => c.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req, { ignoreSearch: true })
          .then(hit => hit || caches.match("index.html"))
      )
  );
});
