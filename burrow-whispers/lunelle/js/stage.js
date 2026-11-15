/*
  PROJECT: Burrow Whispers #001 — The Silver Moth
  FILE: js/stage.js
  VERSION: 0.9.0
  PART: 1 of 1
  LOAD ORDER: 5th script (after scrapbook.js, before guidance.js and game.js)
  NOTE: Odd-Ratio Screen Rule. Picks the art whose shape is closest to the
        screen, then sizes the scene to that art's own shape (letterboxed,
        never stretched or cropped). No special cases for any device.
        Also draws sprites on a <canvas>, because Opera night mode
        recolors <img> sprites but leaves canvas alone.
*/

(function () {
  "use strict";

  // ---------- Art list ----------
  // ratio = width / height of the picture file. Edit here if a file changes.
  const ARTS = [
    { src: "images/silvermoth-bg.jpg",      ratio: 0.46 },    // tall phone (assumed)
    { src: "images/silvermoth-916.jpg",     ratio: 9 / 16 },  // phone
    { src: "images/silvermoth-tablet.jpg",  ratio: 4 / 3 },   // tablet
    { src: "images/silvermoth-desktop.jpg", ratio: 16 / 9 }   // desktop
  ];

  const $ = (id) => document.getElementById(id);
  let current = null;
  let queued = false;

  // Midpoint of two neighboring art ratios is the cut-off.
  // Below it: the squarer art. Above it: the wider art.
  function pick(screen) {
    const list = ARTS.slice().sort(function (a, b) { return a.ratio - b.ratio; });
    for (let i = 0; i < list.length - 1; i++) {
      const cutoff = (list[i].ratio + list[i + 1].ratio) / 2;
      if (screen < cutoff) return list[i];
    }
    return list[list.length - 1];
  }

  // Biggest box with the art's own shape that fits the screen
  function fit() {
    queued = false;
    const game = $("game"), bg = $("bg");
    if (!game || !bg) return;
    const w = game.clientWidth, h = game.clientHeight;
    if (!w || !h) return;

    const art = pick(w / h);
    let sw = w, sh = w / art.ratio;
    if (sh > h) { sh = h; sw = h * art.ratio; }

    const root = document.documentElement.style;
    root.setProperty("--stage-w", Math.round(sw) + "px");
    root.setProperty("--stage-h", Math.round(sh) + "px");

    if (art !== current) {
      current = art;
      bg.src = art.src;
    }
    game.classList.add("staged");
  }

  function queueFit() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(fit);
  }

  // ---------- Sprites ----------
  // On a <canvas> the sprite is drawn onto it; on an <img> it is set as src.
  function paint(el, src, label) {
    if (!el) return;
    const isCanvas = el.tagName === "CANVAS";
    if (label !== undefined) {
      el.setAttribute(isCanvas ? "aria-label" : "alt", label);
    }
    if (!isCanvas) { el.src = src; return; }

    el.setAttribute("role", "img");
    el.dataset.paint = src;
    const img = new Image();
    img.onload = function () {
      if (el.dataset.paint !== src) return;   // a newer sprite was asked for
      el.width = img.naturalWidth;
      el.height = img.naturalHeight;
      el.getContext("2d").drawImage(img, 0, 0);
    };
    img.src = src;
  }

  window.addEventListener("resize", queueFit);
  window.addEventListener("orientationchange", queueFit);
  fit();

  window.BW = window.BW || {};
  BW.Stage = { pick: pick, fit: fit, paint: paint };
})();
