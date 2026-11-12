/*
  PROJECT: Burrow Whispers #001 — The Silver Moth
  FILE: js/guidance.js
  VERSION: 0.8.0
  PART: 1 of 1
  LOAD ORDER: 5th script (after scrapbook.js, before game.js)
  NOTE: Exploration Guidance System v1.0. Reads the scene from the page
        (hotspots, silver light), so it works for every mystery.
        game.js calls: start, stop, noteProgress, clueTouched, tooFar.
        scrapbook.js calls: setMode.
*/

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  // Nothing is timed or animated while one of these is open
  const BLOCKERS = ["story-panel", "clue-dialog", "reward", "scrapbook", "viewer"];

  // Tier II spark interval (seconds) by clue; other clues use 15-25
  const INTERVAL = { reflection: 20, petal: 18, fireflies: 15, moonbeam: 22 };
  const KIND = { petal: "turn", leaf: "turn", fluff: "turn",
                 moonbeam: "pulse", glow: "pulse", steady: "pulse",
                 fireflies: "loop" };

  const STAGE1 = 20, STAGE2 = 45, STAGE3 = 90;   // seconds without progress
  const MAX_SPARKS = 3;                          // discovery events at once
  const WHISPER_COOLDOWN = 20;

  // ---------- State ----------
  let running = false;
  let clock = 0, idle = 0;          // seconds (only counted while playable)
  let nextGlimmer = 0, nextStrong = 0, nextDust = 0, whisperReady = 0;
  let stage2Done = false;
  let sparks = 0, glimmering = false, guided = false, whispering = false;
  let nextSpark = new Map();

  // ---------- Helpers ----------
  const rand = (a, b) => a + Math.random() * (b - a);
  const mode = () => BW.Save.getGuidance();
  const rate = () => (mode() === "assisted" ? 0.6 : mode() === "gentle" ? 0.75 : 1);
  const light = () => $("silver-light");
  const lightShown = () => !light().hidden;
  const blocked = () =>
    document.hidden || BLOCKERS.some((id) => $(id) && !$(id).hidden);
  const openSpots = () =>
    Array.from(document.querySelectorAll("#hotspots .hotspot:not(.found)"));
  const at = (el) => ({ left: el.style.left, top: el.style.top });

  function center(el) {
    const f = $("guide-fx").getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2 - f.left, y: r.top + r.height / 2 - f.top };
  }

  // Adds one short-lived particle to the effects layer
  function put(cls, left, top, vars, life) {
    const box = $("guide-fx");
    if (!box) return;
    const s = document.createElement("span");
    s.className = cls;
    s.style.left = left;
    s.style.top = top;
    Object.keys(vars || {}).forEach((k) => s.style.setProperty(k, vars[k]));
    box.appendChild(s);
    setTimeout(() => s.remove(), life);
  }

  function burst(el, count, cls) {
    const p = at(el);
    for (let i = 0; i < count; i++) {
      const a = (i / count) * 6.283 + rand(0, 0.6), d = rand(26, 58);
      put(cls || "dust", p.left, p.top,
        { "--dx": Math.cos(a) * d + "px", "--dy": Math.sin(a) * d + "px" }, 800);
    }
  }

  function pickTarget() {
    const spots = openSpots();
    if (spots.length) return spots[Math.floor(Math.random() * spots.length)];
    return lightShown() ? light() : null;
  }

  // ---------- Touch states B and C ----------
  function clueTouched(el) {
    const p = at(el);
    burst(el, 8);                                        // B: dust + light pulse
    put("pulse-ring", p.left, p.top, null, 800);
    setTimeout(function () {                             // C: discovery success
      burst(el, 14);
      put("pulse-ring success", p.left, p.top, null, 950);
    }, 400);
  }

  function tooFar(el) { burst(el, 4, "dust soft"); }

  // ---------- Tier I and II cues ----------
  function glimmer() {
    const l = light();
    glimmering = true;
    l.classList.remove("glimmer");
    void l.offsetWidth;
    l.classList.add("glimmer");
    setTimeout(function () {
      l.classList.remove("glimmer");
      glimmering = false;
    }, 1100);
  }

  function spark(btn, strong) {
    if (sparks >= MAX_SPARKS || btn.classList.contains("found")) return;
    const kind = KIND[btn.dataset.clue] || "dot";
    btn.dataset.spark = kind;
    btn.classList.remove("spark", "strong");
    void btn.offsetWidth;
    btn.classList.add("spark");
    if (strong) btn.classList.add("strong");
    sparks++;
    setTimeout(function () {
      btn.classList.remove("spark", "strong");
      sparks = Math.max(0, sparks - 1);
    }, kind === "loop" ? 900 : 600);
  }

  // ---------- Stuck assistance ----------
  // Stage 2: the crest glows and drifts a few particles toward the target
  function stage2() {
    stage2Done = true;
    const t = pickTarget();
    if (!t) return;
    const crest = $("crest-menu"), c = center(crest), g = center(t);
    const dx = g.x - c.x, dy = g.y - c.y, len = Math.hypot(dx, dy) || 1;
    guided = true;
    crest.classList.add("sense");
    for (let i = 0; i < 3; i++) {
      setTimeout(function () {
        put("crest-p", c.x + "px", c.y + "px",
          { "--tx": (dx / len) * 120 + "px", "--ty": (dy / len) * 120 + "px" }, 2100);
      }, i * 350);
    }
    setTimeout(function () {
      crest.classList.remove("sense");
      guided = false;
    }, 2600);
  }

  // Stage 3: Moon Whisper (one at a time, 20 second cooldown)
  function stage3() {
    const t = pickTarget();
    if (!t || whispering) return;
    whispering = true;
    whisperReady = clock + WHISPER_COOLDOWN;
    const p = at(t);
    for (let i = 0; i < 6; i++) {
      setTimeout(function () {
        put("whisper-p", p.left, p.top, { "--wx": rand(-16, 16) + "px" }, 1600);
      }, i * 140);
    }
    setTimeout(function () { whispering = false; }, 1700);
  }

  // ---------- One tick per second ----------
  function tick() {
    if (!running || blocked()) return;
    clock++;
    idle++;
    const r = rate();

    // Tier I: Curiosity Glimmer every 8-12 seconds
    if (lightShown() && clock >= nextGlimmer) {
      glimmer();
      nextGlimmer = clock + rand(8, 12) * r;
    }

    // Tier II: Discovery Spark (paused while a more important cue plays)
    const busy = glimmering || guided || whispering;
    openSpots().forEach(function (btn) {
      if (!nextSpark.has(btn)) nextSpark.set(btn, clock + rand(4, 14));
      if (clock < nextSpark.get(btn)) return;
      if (!busy) spark(btn, false);
      nextSpark.set(btn, clock + (INTERVAL[btn.dataset.clue] || rand(15, 25)) * r);
    });

    // Stuck stages
    if (idle >= STAGE1 && clock >= nextStrong) {
      nextStrong = clock + 10;
      const spots = openSpots();
      if (spots.length) spots.forEach((b, i) => setTimeout(() => spark(b, true), i * 300));
      else if (lightShown()) glimmer();
    }
    if (idle >= STAGE2 && !stage2Done) stage2();
    if (idle >= STAGE3 && clock >= whisperReady) stage3();

    // Assisted: persistent moon dust
    if (mode() === "assisted" && clock >= nextDust) {
      nextDust = clock + rand(5, 9);
      const spots = openSpots();
      if (spots.length) burst(spots[Math.floor(Math.random() * spots.length)], 3, "dust soft");
    }
  }

  // ---------- Assisted: soft outline when a finger is close ----------
  function nearCheck(e) {
    if (mode() !== "assisted") return;
    openSpots().forEach(function (b) {
      const r = b.getBoundingClientRect();
      const d = Math.hypot(e.clientX - (r.left + r.width / 2),
                           e.clientY - (r.top + r.height / 2));
      b.classList.toggle("near", d < r.width * 1.1);
    });
  }

  function nearClear() {
    setTimeout(function () {
      document.querySelectorAll(".hotspot.near")
        .forEach((b) => b.classList.remove("near"));
    }, 500);
  }

  // ---------- Mode and control ----------
  function applyMode() {
    const m = mode();
    document.body.classList.toggle("guide-gentle", m === "gentle");
    document.body.classList.toggle("guide-assisted", m === "assisted");
  }

  function setMode(m) {
    BW.Save.setGuidance(m);
    applyMode();
  }

  function start() {
    applyMode();
    running = true;
    clock = 0;
    idle = 0;
    nextGlimmer = rand(3, 6);
    nextStrong = 0;
    nextDust = rand(3, 6);
    whisperReady = 0;
    stage2Done = false;
    nextSpark = new Map();
  }

  function stop() { running = false; }

  // A clue was found: the player is not stuck anymore
  function noteProgress() {
    idle = 0;
    stage2Done = false;
    nextStrong = 0;
  }

  setInterval(tick, 1000);
  document.addEventListener("pointermove", nearCheck, { passive: true });
  document.addEventListener("pointerdown", nearCheck, { passive: true });
  document.addEventListener("pointerup", nearClear);
  document.addEventListener("pointercancel", nearClear);

  window.BW = window.BW || {};
  BW.Guidance = {
    start: start,
    stop: stop,
    noteProgress: noteProgress,
    clueTouched: clueTouched,
    tooFar: tooFar,
    setMode: setMode,
    getMode: mode,
    applyMode: applyMode
  };
})();
