/* One More Little Step — sw.js V1.5
   Project: One More Little Step (Burrow Whispers, Lunelle)
   Part 1 of 1 (JavaScript)

   V1.5: Desktop picture for Scene 5 added to the cache list:
         images/scenehilltop-desktop.jpg. All five scenes now have
         desktop art. Cache name bumped to "omls-1.5" so devices
         replace the files saved by V1.4.
   V1.4: New title picture (images/titlescreen.jpg) and title.css V1.2.
         Cache name bumped to "omls-1.4" so devices replace the
         files saved by V1.3. The file list is unchanged.
   V1.3: Desktop pictures for Scenes 2 to 4 added to the cache list:
         images/scenesilverlight-desktop.jpg,
         images/sceneclearing-desktop.jpg,
         images/scenemoth-desktop.jpg.
         Cache name bumped to "omls-1.3" so devices replace the
         files saved by V1.2.
   V1.2: Desktop format files added to the cache list:
         images/titlescreen-desktop.jpg, images/scenepond-desktop.jpg.
         Title picture renamed images/titlescreen.jpg (was
         images/title-screen.jpg). Logo added:
         assets/onemorelittlestep-logo.png. The silver petal now
         lives in assets/silver-petal.png (was images/sprites/).
   V1.1: Added the two new tablet pictures (scenemoth-tablet,
         scenehilltop-tablet). Cache name "omls-1.1".
   V1.0: NEW BEGINNING. Versions restart at 1.0.
         Added js/guidance.js and the first three tablet pictures.
         If a picture is not uploaded yet, it is simply skipped.
   Strategy: network-first. Online = newest files, offline = cached copy.
   All paths are relative. Bump VERSION when you update the game. */

const VERSION = "omls-1.5";

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
  "js/guidance.js",
  "js/game.js",
  "js/save.js",
  "images/titlescreen.jpg",
  "images/titlescreen-desktop.jpg",
  "images/scene-pond.jpg",
  "images/scene-silver-light.jpg",
  "images/scene-clearing.jpg",
  "images/scene-moth.jpg",
  "images/scene-hilltop.jpg",
  "images/scenepond-desktop.jpg",
  "images/scenesilverlight-desktop.jpg",
  "images/sceneclearing-desktop.jpg",
  "images/scenemoth-desktop.jpg",
  "images/scenehilltop-desktop.jpg",
  "images/scenepond-tablet.jpg",
  "images/scenesilverlight-tablet.jpg",
  "images/sceneclearing-tablet.jpg",
  "images/scenemoth-tablet.jpg",
  "images/scenehilltop-tablet.jpg",
  "assets/lunelle-blinking.gif",
  "assets/silver-petal.png",
  "assets/onemorelittlestep-logo.png",
  "images/sprites/lunelle-light.png",
  "images/sprites/lunelle-clearing.png",
  "images/sprites/lunelle-moth.png",
  "images/sprites/lunelle-hilltop.png",
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