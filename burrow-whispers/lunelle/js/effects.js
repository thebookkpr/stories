/* PROJECT: Burrow Whispers — Book Keeper Website
   FILE: Moonlit Reverie, Lunelle's Home Region · js/effects.js
   VERSION: V1.2 · Part 1 of 2
   Lives at stories/burrow-whispers/lunelle/js/effects.js

   WHAT THIS FILE IS: everything that moves on the picture. Particles,
   mist, idle moment, touch effects, the 40 s moth visit, the magic
   around Moonwatch Stone and the memory scene.
   It needs js/lore.js and js/panel.js loaded first.

   HOW THE TWO PARTS JOIN: this is one script. Part 1 opens it,
   Part 2 continues directly beneath and closes it. Paste in order.
   Part 1 will not run alone.

   PART 1 holds the helpers, whisper, layout, smooth particles,
   ambient start and the idle moment.
   PART 2 defines these, which Part 1 calls:
     startMoth()   the 40 s moth visit
     startStone()  magic around Moonwatch Stone
   PART 2 also hands these to js/panel.js through window.Lunelle:
     Lunelle.markActivity, Lunelle.fx, Lunelle.noteVisit
   and it starts everything on its last lines.

   NEW in V1.2: split out of lunelle.js. Reads the panel, found places
   and leaving state from panel.js instead of holding its own copies. */

(function () {
  "use strict";

  var L = window.Lunelle, panel = L.panel, found = L.found;
  var $ = function (s) { return document.querySelector(s); };
  function away() { return L.isLeaving(); }

  /* State: no values here on purpose; each is set where it is first used */
  var idleT, reverieT, trail, memDone, home, mw, mh, calm, field, perched;

  /* ---------- SMALL HELPERS ---------- */
  function stg() { return $(".stage"); }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function box(id) {                              /* a hot spot's place, in % of the picture */
    var cs = getComputedStyle($('[data-spot="' + id + '"]')), n = function (k) { return parseFloat(cs.getPropertyValue(k)); };
    return { x: n("--x"), y: n("--y"), w: n("--w"), h: n("--h") };
  }
  function mid(id) { var b = box(id); return { x: b.x + b.w / 2, y: b.y + b.h / 2 }; }
  function put(cls, x, y) {                       /* add a piece to the picture, in % */
    var e = document.createElement("div");
    e.className = cls; e.style.left = x + "%"; e.style.top = y + "%";
    stg().appendChild(e); return e;
  }
  function rm(e, ms) { setTimeout(function () { if (e.parentNode) e.parentNode.removeChild(e); }, ms); }
  function where(ev, el) {                        /* touch point, or the spot's center for keys */
    var r = stg().getBoundingClientRect(), s = el.getBoundingClientRect();
    if (ev && ev.clientX) return { x: (ev.clientX - r.left) / r.width * 100, y: (ev.clientY - r.top) / r.height * 100 };
    return { x: (s.left + s.width / 2 - r.left) / r.width * 100, y: (s.top + s.height / 2 - r.top) / r.height * 100 };
  }
  function glow(el) {
    el.classList.remove("is-touched"); void el.offsetWidth; el.classList.add("is-touched");
    setTimeout(function () { el.classList.remove("is-touched"); }, 1000);
  }
  function ring(x, y, n) {
    for (var i = 0; i < (n || 1); i++) {
      var e = put("ripple", x, y); e.style.animationDelay = i * 160 + "ms"; rm(e, 1800);
    }
  }
  function specks(x, y, n) {
    for (var i = 0; i < n; i++) { rm(put("speck rise", x + rnd(-3, 3), y + rnd(-1, 1)), 1600); }
  }
  function petal(x, y) {
    var e = put("petal", x, y), d = rnd(2000, 4000);
    e.style.setProperty("--dx", rnd(-70, 90) + "px");
    e.style.setProperty("--dy", rnd(20, 70) + "px");
    e.style.setProperty("--dur", d + "ms"); rm(e, d + 200);
  }

  /* ---------- THE WHISPER ---------- */
  function whisper(text) {
    var w = $(".whisper");
    w.textContent = text; w.classList.add("is-whispering");
    clearTimeout(whisper.t);
    whisper.t = setTimeout(function () { w.classList.remove("is-whispering"); }, 6000);
  }
  function whisperFree(text, tries) {             /* waits while a panel is being read */
    tries = tries || 0;
    if (panel.hidden && !away()) return whisper(text);
    if (tries < 5) setTimeout(function () { whisperFree(text, tries + 1); }, 4000);
  }

  /* ---------- LAYOUT: home lotus and shimmer follow the hot spots ---------- */
  function layout() {
    var m = $(".moth"), sh = $(".shimmer"), b = box("moth"), pb = box("pond");
    mw = b.w; mh = b.h;
    home = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
    if (perched) { m.style.left = home.x + "%"; m.style.top = home.y + "%"; }
    if (sh) { sh.style.left = pb.x + "%"; sh.style.top = pb.y + "%"; sh.style.width = pb.w + "%"; sh.style.height = pb.h + "%"; }
  }

  /* ---------- SMOOTH PARTICLES: no loop to spot ----------
     Every mote has its own length (16–28 s), path and twinkle. It fades
     from nothing to nothing, so its rebirth is never seen. The first
     batch starts part-way through its life, so the scene is full at once. */
  function mote(glowy, first) {
    var e = document.createElement("div"), s = glowy ? rnd(4, 7) : rnd(2, 4),
        d = rnd(16, 28) * 1000, dx = rnd(-40, 40), dy = rnd(-70, -20), pk = glowy ? 0.85 : 0.55,
        o = glowy ? [0, 0.7, 0.35, 1, 0.4, 0.8, 0] : [0, 0.6, 0.8, 0.7, 0.8, 0.5, 0],
        f = [], ph = rnd(0, 6), i, t;
    e.style.cssText = "position:absolute;border-radius:50%;pointer-events:none;opacity:0;" +
      "left:" + rnd(5, 95) + "%;top:" + rnd(15, 85) + "%;width:" + s + "px;height:" + s + "px;" +
      (glowy ? "background:radial-gradient(circle,#fff6d0,rgba(242,196,109,.6) 50%,transparent 72%);box-shadow:0 0 9px 2px rgba(242,196,109,.35)"
             : "background:rgba(238,241,248,.85)");
    field.appendChild(e);
    for (i = 0; i <= 6; i++) {
      t = i / 6;
      f.push({ offset: t, opacity: pk * o[i],
               transform: "translate(" + (dx * t + Math.sin(i * 1.3 + ph) * 12) + "px," + dy * t + "px)" });
    }
    e.animate(f, { duration: d, delay: first ? -rnd(0, d * 0.9) : 0, easing: "linear", fill: "both" })
      .onfinish = function () {
        if (e.parentNode) e.parentNode.removeChild(e);
        setTimeout(function () { mote(glowy); }, rnd(0, 2500));
      };
  }

  /* ---------- AMBIENT (State 01) ---------- */
  function startAmbient() {
    calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!calm) {
      put("mist", -10, 22); put("mist", -10, 58);
      put("shimmer", 0, 0);
      field = put("motes", 0, 0);                 /* holds all particles so they can be thinned together */
      field.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;" +
        "pointer-events:none;transition:opacity 2.5s ease";
      for (var i = 0; i < 22; i++) mote(i >= 15, true);
    }
    put("moth", 0, 0);
    layout();
    startMoth();                                  /* Part 2: the 40 s moth visit */
    startStone();                                 /* Part 2: magic around the stone */
    window.addEventListener("resize", function () {
      clearTimeout(layout.t); layout.t = setTimeout(layout, 300);
    });
    markActivity();
    setTimeout(function () { whisperFree("Take your time."); }, 4000);
  }

  /* ---------- IDLE: THE REVERIE MOMENT (20–30 s quiet, about 5 s long) ---------- */
  function markActivity() {
    clearTimeout(idleT); clearTimeout(reverieT);
    stg().classList.remove("is-reverie");
    if (field) field.style.opacity = 1;
    idleT = setTimeout(reverie, rnd(20000, 30000));
  }
  function reverie() {
    if (!panel.hidden || away()) return markActivity();
    stg().classList.add("is-reverie");
    if (field) field.style.opacity = 0.35;        /* particles thin, then return */
    reverieT = setTimeout(function () {
      var pb = box("pond");
      ring(pb.x + 2, pb.y + pb.h * 0.7, 1);
      whisperFree("Sometimes it simply takes one more little step.");
      reverieT = setTimeout(markActivity, 2500);
    }, 2500);
  }

  /* ===== PART 2 OF 2 CONTINUES BELOW THIS LINE ===== */

  /* ===== PART 2 OF 2 · continues directly below Part 1 =====
     PROJECT: Burrow Whispers — Book Keeper Website
     FILE: Moonlit Reverie, Lunelle's Home Region · js/effects.js
     VERSION: V1.2 · Part 2 of 2
     Paste under Part 1. This part closes the file.
     It holds the touch effects, the moth's flight and landing magic,
     the 40 s moth visit, the magic around Moonwatch Stone and the
     memory scene. It then hands three functions to js/panel.js and
     starts everything on its last lines. */

  /* ---------- SMALL HELPERS FOR PART 2 ---------- */
  function at(e) {                                /* a piece's center, in % of the picture */
    var r = stg().getBoundingClientRect(), s = e.getBoundingClientRect();
    return { x: (s.left + s.width / 2 - r.left) / r.width * 100, y: (s.top + s.height / 2 - r.top) / r.height * 100 };
  }
  function dot(x, y, size) {                      /* a soft silver-gold light, styled inline */
    var e = put("", x, y);
    e.style.cssText = "position:absolute;pointer-events:none;border-radius:50%;opacity:0;" +
      "left:" + x + "%;top:" + y + "%;width:" + size + "px;height:" + size + "px;margin:-" + size / 2 + "px 0 0 -" + size / 2 + "px;" +
      "background:radial-gradient(circle,#fff,rgba(238,241,248,.8) 45%,transparent 72%);box-shadow:0 0 8px 2px rgba(196,176,224,.4)";
    return e;
  }

  /* ---------- TOUCH (State 03) ---------- */
  function fx(id, ev) {
    var el = $('[data-spot="' + id + '"]'), p = where(ev, el);
    glow(el);
    if (id === "reflection") {
      var rb = box("reflection"), pb = box("pond");
      ring(p.x, p.y, 3);
      var g = put("reflection-break", 0, 0);
      g.style.cssText = "position:absolute;pointer-events:none;mix-blend-mode:screen;border-radius:50%;" +
        "left:" + (rb.x + rb.w * 0.1) + "%;top:" + (rb.y + rb.h * 0.25) + "%;" +
        "width:" + rb.w * 0.8 + "%;height:" + rb.h * 0.5 + "%;" +
        "background:radial-gradient(ellipse,rgba(238,241,248,.5),transparent 70%)";
      rm(g, 2600);
      if (Math.random() < 0.03) {
        for (var i = 0; i < 5; i++) rm(put("star", rnd(pb.x, pb.x + pb.w), rnd(pb.y, pb.y + pb.h)), 1100);
      }
    } else if (id === "lotus") {
      ring(p.x, p.y, 1); specks(p.x, p.y, 3);
      if (Math.random() < 0.5) petal(p.x, p.y);
    } else if (id === "petals") {
      for (var j = 0; j < 3; j++) petal(p.x + rnd(-4, 4), p.y + rnd(-2, 2));
    } else if (id === "moth") {
      var q = at($(".moth"));
      specks(q.x, q.y, 3);                        /* a small shimmer; the moth stays perched */
    }
  }

  /* ---------- SILVER MOTH: how it flies ----------
     Wings: scaleX snaps open and shut about 12 times a second.
     Path: a smooth glide plus sideways wandering that fades as it nears
     its goal. Body leans into each wobble. Landing slows the wings. */
  function flight(a, b, ms, wild, land) {
    var n = Math.round(ms / 80), f = [], ph = rnd(0, 6), i, t, e, k, lo, op;
    for (i = 0; i <= n; i++) {
      t = i / n; e = t * t * (3 - 2 * t); k = 1 - e * 0.85;
      lo = land ? Math.min(0.8, 0.35 + Math.max(0, t - 0.75) * 1.8) : 0.35;
      op = land ? Math.min(1, t / 0.1) : Math.min(1, (1 - t) / 0.15);
      f.push({
        offset: t, opacity: op,
        left: (a.x + (b.x - a.x) * e + Math.sin(t * 9 + ph) * wild * k) + "%",
        top:  (a.y + (b.y - a.y) * e + Math.sin(t * 14 + ph) * wild * 0.35 * k) + "%",
        transform: "translate(-50%,-50%) rotate(" + Math.cos(t * 9 + ph) * 22 * k + "deg) scaleX(" + (i % 2 ? 1 : lo) + ")"
      });
    }
    return f;
  }

  function magic(p) {                             /* the landing: halo, burst of light, ripples, wing glow */
    var h = put("", p.x, p.y), m = $(".moth"), i, d, c, r, a;
    h.style.cssText = "position:absolute;pointer-events:none;mix-blend-mode:screen;opacity:0;border-radius:50%;" +
      "left:" + p.x + "%;top:" + p.y + "%;width:90px;height:90px;margin:-45px 0 0 -45px;" +
      "background:radial-gradient(circle,rgba(238,241,248,.85),rgba(196,176,224,.4) 45%,transparent 70%)";
    h.animate([{ opacity: 0, transform: "scale(.3)" }, { opacity: 0.9, transform: "scale(1)", offset: 0.35 },
               { opacity: 0, transform: "scale(2.1)" }], { duration: 2600, easing: "ease-out" });
    rm(h, 2700);
    ring(p.x, p.y, 2);
    for (i = 0; i < 14; i++) {
      a = i / 14 * 6.283 + rnd(-0.2, 0.2); r = rnd(30, 80); d = rnd(1800, 2600);
      c = dot(p.x, p.y, rnd(3, 6));
      c.animate([{ opacity: 0, transform: "translate(0,0) scale(.4)" },
                 { opacity: 1, transform: "translate(" + Math.cos(a) * r * 0.6 + "px," + Math.sin(a) * r * 0.6 + "px) scale(1)", offset: 0.3 },
                 { opacity: 0, transform: "translate(" + Math.cos(a) * r + "px," + (Math.sin(a) * r - 20) + "px) scale(.5)" }],
                { duration: d, easing: "ease-out" });
      rm(c, d + 100);
    }
    m.animate([{ filter: "drop-shadow(0 0 0 rgba(238,241,248,0))" },
               { filter: "drop-shadow(0 0 12px rgba(238,241,248,.95))", offset: 0.4 },
               { filter: "drop-shadow(0 0 0 rgba(238,241,248,0))" }], { duration: 2600 });
  }

  /* ---------- SILVER MOTH: the 40 s visit ----------
     0 s  hidden · 12 s flutters down (6.5 s) · ~18.5 s lands + magic (2.6 s)
     · rests 10 s · ~31 s flutters away (6 s) · hidden · repeats at 40 s.
     It can only be tapped while it is perched. */
  function startMoth() {
    var m = $(".moth"), sp = $('[data-spot="moth"]'), rest;
    m.style.opacity = 0; sp.style.pointerEvents = "none"; sp.tabIndex = -1;

    function settle() {                           /* perched: inline position, gentle wing breathing */
      m.style.left = home.x + "%"; m.style.top = home.y + "%"; m.style.opacity = 1;
      m.style.transform = "translate(-50%,-50%)";
      perched = true; sp.style.pointerEvents = ""; sp.tabIndex = 0;
      if (!calm) {
        rest = m.animate([{ transform: "translate(-50%,-50%) scaleX(1)" }, { transform: "translate(-50%,-50%) scaleX(.78)" }],
                         { duration: 2600, iterations: Infinity, direction: "alternate", easing: "ease-in-out" });
        magic(home);
      }
    }
    function arrive() {
      var from = { x: home.x + rnd(-22, 22), y: home.y - rnd(42, 55) }, tr, a;
      if (calm) { settle(); return; }
      m.style.left = from.x + "%"; m.style.top = from.y + "%";
      tr = setInterval(function () { var q = at(m); specks(q.x, q.y, 1); }, 380);   /* silver trail */
      a = m.animate(flight(from, home, 6500, 7, true), { duration: 6500, easing: "linear", fill: "forwards" });
      a.onfinish = function () { clearInterval(tr); settle(); a.cancel(); };
    }
    function leave() {
      var to = { x: home.x + rnd(-30, 30), y: home.y - rnd(45, 60) }, tr, a;
      perched = false; sp.style.pointerEvents = "none"; sp.tabIndex = -1;
      if (rest) rest.cancel();
      if (calm) { m.style.opacity = 0; return; }
      tr = setInterval(function () { var q = at(m); specks(q.x, q.y, 1); }, 380);
      a = m.animate(flight(home, to, 6000, 5, false), { duration: 6000, easing: "linear", fill: "forwards" });
      a.onfinish = function () { clearInterval(tr); m.style.opacity = 0; a.cancel(); };
    }
    function visit() {
      setTimeout(arrive, 12000);
      setTimeout(leave, 12000 + 6500 + 2600 + 10000);
    }
    visit();
    setInterval(visit, 40000);
  }

  /* ---------- MOONWATCH STONE: magic gathers every 40 s ----------
     Lights drift in from all around, curl a little, and sink into the stone,
     which glows softly as they arrive. */
  function startStone() {
    if (calm) return;
    function gather() {
      if (away()) return;
      var s = mid("stone"), h = put("", s.x, s.y), i, a, r, d, de, c;
      h.style.cssText = "position:absolute;pointer-events:none;mix-blend-mode:screen;opacity:0;border-radius:50%;" +
        "left:" + s.x + "%;top:" + s.y + "%;width:120px;height:120px;margin:-60px 0 0 -60px;" +
        "background:radial-gradient(circle,rgba(246,239,220,.6),rgba(196,176,224,.25) 50%,transparent 72%)";
      h.animate([{ opacity: 0 }, { opacity: 0.6, offset: 0.5 }, { opacity: 0 }], { duration: 5200, delay: 1800, easing: "ease-in-out", fill: "both" });
      rm(h, 7200);
      for (i = 0; i < 16; i++) {
        a = rnd(0, 6.283); r = rnd(70, 150); d = rnd(3200, 4800); de = rnd(0, 2400);
        c = dot(s.x, s.y, rnd(3, 6));
        c.animate([{ opacity: 0, transform: "translate(" + Math.cos(a) * r + "px," + Math.sin(a) * r * 0.7 + "px) scale(.6)" },
                   { opacity: 0.95, offset: 0.35 },
                   { opacity: 0.8, offset: 0.8, transform: "translate(" + Math.cos(a + 1.2) * r * 0.25 + "px," + Math.sin(a + 1.2) * r * 0.18 + "px) scale(1)" },
                   { opacity: 0, transform: "translate(0,0) scale(.3)" }],
                  { duration: d, delay: de, easing: "ease-in-out", fill: "both" });
        rm(c, d + de + 200);
      }
    }
    setTimeout(gather, 5000);
    setInterval(gather, 40000);
  }

  /* ---------- MEMORY SCENE: Moon Lotus Pond → Lotus Shore → Silver Light Grove ---------- */
  function noteVisit(id) {
    trail = trail || [];
    if (id !== "pond" && id !== "shore" && id !== "grove") return;
    if (id === "grove" && !found.grove) return;   /* a glimpse does not count */
    if (trail[trail.length - 1] !== id) trail.push(id);
    trail = trail.slice(-3);
    if (!memDone && trail.join() === "pond,shore,grove") { memDone = true; memory(); }
  }
  function memory() {
    var s = mid("shore"), g = mid("grove");
    setTimeout(function () {
      for (var k = 0; k <= 8; k++) (function (k) {
        setTimeout(function () {
          specks(s.x + (g.x - s.x) * k / 8, s.y + (g.y - s.y) * k / 8 + Math.sin(k) * 1.5, 2);
        }, k * 350);
      })(k);
      whisperFree("One more little step.");
    }, 1500);
  }

  /* ---------- HAND-OFF TO panel.js, THEN START ---------- */
  L.markActivity = markActivity;
  L.fx = fx;
  L.noteVisit = noteVisit;

  startAmbient();

})();