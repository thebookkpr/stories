/* PROJECT: Burrow Whispers — Book Keeper Website
   FILE: Moonlit Reverie, Lunelle's Home Region · js/lunelle.js
   VERSION: V1.1 · Part 1 of 3
   Lives at stories/burrow-whispers/lunelle/js/lunelle.js

   HOW THE THREE PARTS JOIN: this file is one script. Part 1 opens it,
   Part 2 continues directly beneath, and Part 3 continues beneath that
   and closes it. Paste them in order. Part 1 will not run alone.

   PART 1 holds the game addresses, places and lore, the reading panel,
   the tap levels (read, read more, then travel) and the two game routes.
   PART 2 and PART 3 define these, which Part 1 calls:
     startAmbient()   mist, particles, idle timer, first whisper (Part 2)
     markActivity()   resets the 20–30 s idle timer (Part 2)
     whisper(text)    the soft line at the bottom (Part 2)
     fx(id, ev)       the touch animation for a tapped spot (Part 3)
     noteVisit(id)    counts places for the Silver Moth memory scene (Part 3)
     startMoth()      the 40 s moth visit, called by startAmbient (Part 3)
     startStone()     magic around Moonwatch Stone, called by startAmbient (Part 3) */

(function () {
  "use strict";

  /* ---------- GAME ADDRESSES (change them here) ---------- */
  var GAMES = {
    step: "./one-more-little-step/index.html",
    moth: "./the-silver-moth/index.html"
  };
  var TRAVEL_FADE = 1400;   /* matches --travel-fade in variables.css */

  /* ---------- PLACES AND LORE ----------
     n = name, t = type (C place, A lore object, B discovery)
     l = reading levels, o = explore options after reading
     o.to = travel, o.game = open a game, o.say = a short scene,
     o.r = reveals a place */
  var P = {
    stone: { n: "Moonwatch Stone", t: "C",
      l: ["Welcome to Moonlit Reverie.\n\nBeneath the roots of an ancient tree rests a quiet pond where moon lotus flowers bloom beneath silver light.\n\nThis is a place of wonder, reflection, and small acts of courage.\n\nTake your time.\n\nEvery path here rewards curiosity.",
          "A smooth stone overlooking the pond.\n\nLunelle often sits here before exploring somewhere unfamiliar. Whenever she feels uncertain, she watches the moon’s reflection until her courage returns."],
      o: [{ a: "Approach the Pond", to: "pond" },
          { a: "Look Across the Water", say: "Far across the pond, a faint silver light waits among roots and flowers. It is too far to reach tonight, but it is easy to keep looking at.", r: "grove" },
          { a: "Watch the Moon", game: "step" }] },

    pond: { n: "Moon Lotus Pond", t: "C",
      l: ["A broad, tranquil pond. The water is calm and reflective, and the moon often rests on its surface.",
          "Nothing about the pond feels made. It feels discovered. Moon lotus blossoms drift on it, and the silver glow along their edges is the pond’s own."],
      o: [{ a: "Visit Lotus Shore", to: "shore" },
          { a: "Follow the Shoreline Trail", to: "trail" },
          { a: "Watch the Reflection", to: "reflection" }] },

    shore: { n: "Lotus Shore", t: "C",
      l: ["A flower-lined bank where moon lotus blossoms gather in greater numbers, with lavender wildflowers and small resting stones.",
          "The shoreline curves gently here. Look closely and small details appear: a ring of petals, a heart-shaped leaf, a pebble polished smooth."],
      o: [{ a: "Walk the Shoreline", to: "trail" },
          { a: "Inspect the Lotus Blossoms", to: "lotus" },
          { a: "Cross Toward the Grove", to: "grove", r: "grove", v: "You follow the shoreline slowly.\n\nMoon lotus flowers drift beside you as reflected moonlight dances upon the water.\n\nAhead, Silver Light Grove waits in quiet silence." }] },

    trail: { n: "Shoreline Trail", t: "C",
      l: ["A natural path along the pond’s edge, winding past clover, scattered flowers, and the odd root arch.",
          "The trail is the thread of Moonlit Reverie. Every place here can be reached by it, one small step at a time."],
      o: [{ a: "Return to the Pond", to: "pond" },
          { a: "Continue to the Grove", to: "grove", r: "grove" }] },

    meadow: { n: "Moon Blossom Meadow", t: "C",
      l: ["A gently rolling meadow between the roots and the pond. Lavender flowers and clover sway in the grass.",
          "The blossoms change with the seasons, but the meadow always feels like a doorway between the woods and the water."],
      o: [{ a: "Visit Moonwatch Stone", to: "stone" },
          { a: "Observe the Meadow", say: "The grass moves in slow waves. A few petals lift, turn, and settle again, as if the meadow were breathing." }] },

    moonroot: { n: "Ancient Moonroot", t: "C",
      l: ["An enormous tree rises at the northern edge of the wilds. Its roots spread across the land, shaping the ground and framing the view.",
          "The Moonroot is older than the pond. Moss grows thick on its bark, ferns shelter in its alcoves, and small flowers bloom in pockets between the roots."],
      o: [{ a: "Visit Moss Hollow", to: "hollow" },
          { a: "Examine the Root Caverns", to: "roothollow" }] },

    hollow: { n: "Moss Hollow", t: "C",
      l: ["A sheltered hollow beneath the roots, with moss bedding, clover cushions, and fallen petals.",
          "It is not hidden. It is simply tucked away, where soft moonlight comes in through the root openings."],
      o: [{ a: "Return to Ancient Moonroot", to: "moonroot" },
          { a: "Visit Moon Blossom Meadow", to: "meadow" },
          { a: "Sit Quietly", say: "You sit for a while.\n\nThe moss is warm. The wind slows. Somewhere far away, water moves against stone." }] },

    rootpath: { n: "Hidden Root Path", t: "C",
      l: ["Something seems unusual about these roots.",
          "The moss is slightly displaced. Between the ferns, flat stones lead back under the roots, a quiet path that continues farther than it first appears."],
      o: [{ a: "Follow the Hidden Path", to: "grove", r: "grove" }] },

    grove: { n: "Silver Light Grove", t: "C",
      g: "A faint silver light glows on the far side of the pond. It is visible from here, but no path to it has been found yet.",
      l: ["A small clearing on the far side of the pond, where silver-toned flowers and lotus clusters grow among mossy stones.",
          "Few places feel this still. It rewards curiosity without demanding it."],
      o: [{ a: "Observe the Silver Flowers", say: "Each blossom holds a little of the moon along its edge, and when the air moves, they glow a little brighter." },
          { a: "Search the Grove", say: "Under a mossy stone lies a pressed lotus petal, silver along its edge. Someone left it long ago, perhaps so the next visitor would know the walk was worth it." },
          { a: "Rest Beside the Water", say: "You rest at the water’s edge. Across the pond, Moonwatch Stone looks small and far away. You came all this way, one small step at a time." }] },

    moth: { n: "Silver Moth", t: "C",
      l: ["A tiny silver moth rests on a lotus petal, its wings opening and closing in no hurry.",
          "A moth like this was the first silver light Lunelle ever noticed across the pond. She feared what it might be. It turned out to be a friend."],
      o: [{ a: "Follow the Silver Moth", game: "moth" }] },

    reflection: { n: "The Moon’s Reflection", t: "A",
      l: ["The moon rests on the water, so still it seems you could touch it.",
          "Ripples never keep the moon for long. It always comes back together, a little brighter than before."] },

    lotus: { n: "Moon Lotus Cluster", t: "A",
      l: ["Moon lotus blossoms, pale lavender and ivory, open slowly above the dark water.",
          "They grow from the mud and still bloom in moonlight. Lunelle’s crest is shaped like one."] },

    petals: { n: "Drifting Petals", t: "A",
      l: ["A few petals drift across the meadow, light as breath.",
          "They gather into small circles near the stones. Nobody can say who arranges them."] },

    roothollow: { n: "Root Hollow", t: "B",
      l: ["A small darkness beneath the roots. A leaf rustles.",
          "A tiny hidden compartment, just wide enough to reach into."],
      r: ["You find a polished pebble, smooth and cool.", "You find a small acorn, tucked away for later.", "You find a soft grey feather.", "You find a single flower petal, kept perfectly fresh."] }
  };

  /* ---------- ELEMENTS AND STATE ---------- */
  var $ = function (s) { return document.querySelector(s); };
  var panel = $(".panel"), pTitle = $(".panel-title"), pText = $(".panel-text"),
      pActs = $(".panel-actions"), veil = $(".travel-veil");
  var cur = null, found = {}, leaving = false;

  /* ---------- THE READING PANEL (never closes by itself) ---------- */
  function openPanel(title, text, acts) {
    pTitle.textContent = title;
    pText.textContent = text;
    pActs.textContent = "";
    acts.forEach(function (x) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = x.a;
      if (x.q) b.className = "quiet";
      b.addEventListener("click", x.f);
      pActs.appendChild(b);
    });
    panel.hidden = false;
    panel.classList.remove("is-open"); void panel.offsetWidth; panel.classList.add("is-open");
    panel.tabIndex = -1; panel.focus({ preventScroll: true });
  }
  function closePanel() { panel.hidden = true; panel.classList.remove("is-open"); cur = null; }
  var back = { a: "Return", q: true, f: closePanel };

  /* ---------- TAP LEVELS: read, read more, then travel ---------- */
  function show(id, lvl) {
    var p = P[id], more = function () { show(id, lvl + 1); };
    if (lvl === 0) noteVisit(id);
    if (id === "grove" && !found.grove) {            /* seen, not yet reachable */
      cur = { id: id, lvl: 0 }; return openPanel(p.n, p.g, [back]);
    }
    if (p.t === "B") {                               /* notice, discover, reward */
      cur = { id: id, lvl: Math.min(lvl, 2) };
      if (lvl < 2) return openPanel(p.n, p.l[lvl], [{ a: "Continue", f: more }, back]);
      return openPanel(p.n, p.r[Math.floor(Math.random() * p.r.length)], [back]);
    }
    cur = { id: id, lvl: Math.min(lvl, 1) };         /* places and lore objects */
    if (lvl === 0) return openPanel(p.n, p.l[0], [{ a: "Continue", f: more }, back]);
    var acts = (p.o || []).map(function (o) { return { a: o.a, f: function () { run(id, o); } }; });
    openPanel(p.n, p.l[1], acts.concat(back));
  }

  function run(id, o) {
    if (o.r) found[o.r] = true;
    if (o.game) return goGame(o.game);
    if (o.to) {                                      /* travel is told as a short story */
      var v = o.v || "You make your way toward " + P[o.to].n + ", slowly, taking in everything along the way.";
      return openPanel(P[id].n, v, [{ a: "Continue", f: function () { show(o.to, 0); } }]);
    }
    openPanel(P[id].n, o.say, [{ a: "Continue", f: function () { show(id, 1); } }]);
  }

  /* ---------- GAME ROUTES (soft fade, then open) ---------- */
  function goGame(key) {
    if (leaving) return;
    leaving = true;
    veil.classList.add("is-leaving");
    setTimeout(function () { location.href = GAMES[key]; }, TRAVEL_FADE);
  }
  window.addEventListener("pageshow", function (e) {   /* back button returns calmly */
    if (e.persisted) { leaving = false; veil.classList.remove("is-leaving"); }
  });

  /* ---------- SPOTS ---------- */
  function onSpot(id, ev) {
    markActivity();
    fx(id, ev);
    if (leaving) return;
    if (cur && cur.id === id && !panel.hidden) show(id, cur.lvl + 1);
    else show(id, 0);
  }
  Array.prototype.forEach.call(document.querySelectorAll(".spot"), function (el) {
    var id = el.getAttribute("data-spot");
    if (P[id]) el.addEventListener("click", function (ev) { onSpot(id, ev); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) closePanel();
  });

  startAmbient();

  /* ===== PART 2 OF 3 CONTINUES BELOW THIS LINE ===== */

  /* ===== PART 2 OF 3 · continues directly below Part 1 =====
     PROJECT: Burrow Whispers — Book Keeper Website
     FILE: Moonlit Reverie, Lunelle's Home Region · js/lunelle.js
     VERSION: V1.1 · Part 2 of 3
     Paste under Part 1. Part 3 closes the file.
     State variables are declared WITHOUT values (Part 1 calls
     startAmbient() before this code runs; values here would wipe it).
     NEW in V1.1: particles are JS-driven. Each one fades in, drifts and
     fades out on its own random clock, then is reborn elsewhere, so
     no visible loop. startMoth() and startStone() live in Part 3. */

  var idleT, reverieT, trail, memDone, home, mw, mh, calm, field, perched;

  /* ---------- SMALL HELPERS ---------- */
  function stg() { return $(".stage"); }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function box(id) {
    var cs = getComputedStyle($('[data-spot="' + id + '"]')), n = function (k) { return parseFloat(cs.getPropertyValue(k)); };
    return { x: n("--x"), y: n("--y"), w: n("--w"), h: n("--h") };
  }
  function mid(id) { var b = box(id); return { x: b.x + b.w / 2, y: b.y + b.h / 2 }; }
  function put(cls, x, y) {
    var e = document.createElement("div");
    e.className = cls; e.style.left = x + "%"; e.style.top = y + "%";
    stg().appendChild(e); return e;
  }
  function rm(e, ms) { setTimeout(function () { if (e.parentNode) e.parentNode.removeChild(e); }, ms); }
  function where(ev, el) {
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
  function whisperFree(text, tries) {
    tries = tries || 0;
    if (panel.hidden && !leaving) return whisper(text);
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
    startMoth();                                  /* Part 3: the 40 s moth visit */
    startStone();                                 /* Part 3: magic around the stone */
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
    if (!panel.hidden || leaving) return markActivity();
    stg().classList.add("is-reverie");
    if (field) field.style.opacity = 0.35;        /* particles thin, then return */
    reverieT = setTimeout(function () {
      var pb = box("pond");
      ring(pb.x + 2, pb.y + pb.h * 0.7, 1);
      whisperFree("Sometimes it simply takes one more little step.");
      reverieT = setTimeout(markActivity, 2500);
    }, 2500);
  }

  /* ===== PART 3 OF 3 · continues directly below Part 2 =====
     PROJECT: Burrow Whispers — Book Keeper Website
     FILE: Moonlit Reverie, Lunelle's Home Region · js/lunelle.js
     VERSION: V1.1 · Part 3 of 3
     Paste under Part 2. This part closes the file.
     NEW in V1.1: the 40 s moth visit (wait 12 s, flutter down, magic
     on landing, rest 10 s, flutter away) and the magic that gathers
     around Moonwatch Stone every 40 s. Both use the Web Animations API. */

  /* ---------- SMALL HELPERS FOR PART 3 ---------- */
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
      if (leaving) return;
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
    if (id === "grove" && !found.grove) return;
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

})();