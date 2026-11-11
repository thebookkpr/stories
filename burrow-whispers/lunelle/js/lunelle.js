/* PROJECT: Burrow Whispers — Book Keeper Website
   FILE: Moonlit Reverie, Lunelle's Home Region · js/lunelle.js
   VERSION: V1.0 · Part 1 of 2
   Lives at stories/burrow-whispers/lunelle/js/lunelle.js

   HOW THE TWO PARTS JOIN: this file is one script. Part 1 opens it
   and Part 2 continues directly beneath, then closes it. Paste Part 2
   under the last line of Part 1. Part 1 will not run alone.

   PART 1 holds the game addresses, places and lore, the reading panel,
   the tap levels (read, read more, then travel) and the two game routes.
   PART 2 will define these, which Part 1 calls:
     startAmbient()   mist, specks, fireflies, shimmer, idle timer, first whisper
     fx(id, ev)       the touch animation for a tapped spot
     whisper(text)    the soft line at the bottom
     markActivity()   resets the 20–30 s idle timer
     noteVisit(id)    counts places for the Silver Moth memory scene */

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

  /* ===== PART 2 OF 2 CONTINUES BELOW THIS LINE (it closes the file) ===== */

   /* ===== PART 2 OF 2 · continues directly below Part 1 =====
     PROJECT: Burrow Whispers — Book Keeper Website
     FILE: Moonlit Reverie, Lunelle's Home Region · js/lunelle.js
     VERSION: V1.0 · Part 2 of 2
     Paste this under the last line of Part 1. It closes the file.
     Part 1 calls these before this part runs, so the state variables
     below are declared WITHOUT values; setting them here would wipe
     the timer Part 1 starts.
     Places on the picture (moth, shimmer, ripples, stars, memory trail)
     are read from the hot spots in css/base.css, so they follow
     whichever of the three pictures is showing. */

  var idleT, reverieT, trail, mothAt, memDone, home, mw, mh;

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
  function glow(el) {                             /* FOCUS → TOUCH on a spot, then it settles */
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
    if (panel.hidden && !leaving) return whisper(text);
    if (tries < 5) setTimeout(function () { whisperFree(text, tries + 1); }, 4000);
  }

  /* ---------- LAYOUT: moth and shimmer sit where the hot spots say ---------- */
  function layout() {
    var sp = $('[data-spot="moth"]'), m = $(".moth"), sh = $(".shimmer");
    sp.style.removeProperty("--x"); sp.style.removeProperty("--y");
    var b = box("moth"), pb = box("pond");
    mw = b.w; mh = b.h; mothAt = 0;
    home = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
    m.style.left = home.x + "%"; m.style.top = home.y + "%";
    if (sh) { sh.style.left = pb.x + "%"; sh.style.top = pb.y + "%"; sh.style.width = pb.w + "%"; sh.style.height = pb.h + "%"; }
  }

  /* ---------- AMBIENT (State 01) ---------- */
  function startAmbient() {
    var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!calm) {
      put("mist", -10, 22); put("mist", -10, 58);
      put("shimmer", 0, 0);
      for (var i = 0; i < 20; i++) {
        var e = put(i < 14 ? "speck" : "firefly", rnd(5, 95), rnd(15, 85));
        e.style.setProperty("--dur", rnd(14, 26) + "s");
        e.style.setProperty("--delay", "-" + rnd(0, 14) + "s");
        e.style.setProperty("--drift", rnd(-18, 18) + "px");
      }
    }
    put("moth", 0, 0);                            /* rests on a lotus */
    layout();
    window.addEventListener("resize", function () {   /* turning the phone changes the picture */
      clearTimeout(layout.t); layout.t = setTimeout(layout, 300);
    });
    markActivity();
    setTimeout(function () { whisperFree("Take your time."); }, 4000);
  }

  /* ---------- IDLE: THE REVERIE MOMENT (20–30 s quiet, about 5 s long) ----------
     Wind slows, particles thin, pond stills, moon sharpens (css),
     then one careful step: a single soft ripple at the water's edge. */
  function markActivity() {
    clearTimeout(idleT); clearTimeout(reverieT);
    stg().classList.remove("is-reverie");
    idleT = setTimeout(reverie, rnd(20000, 30000));
  }
  function reverie() {
    if (!panel.hidden || leaving) return markActivity();
    stg().classList.add("is-reverie");
    reverieT = setTimeout(function () {
      var pb = box("pond");
      ring(pb.x + 2, pb.y + pb.h * 0.7, 1);
      whisperFree("Sometimes it simply takes one more little step.");
      reverieT = setTimeout(markActivity, 2500);  /* back to ambient, idle clock restarts */
    }, 2500);
  }

  /* ---------- TOUCH (State 03) ---------- */
  function fx(id, ev) {
    var el = $('[data-spot="' + id + '"]'), p = where(ev, el);
    glow(el);

    if (id === "reflection") {
      var rb = box("reflection"), pb = box("pond");
      ring(p.x, p.y, 3);                          /* rings out from the touch point */
      var g = put("reflection-break", 0, 0);      /* a soft glow over the moon stretches and reforms */
      g.style.cssText = "position:absolute;pointer-events:none;mix-blend-mode:screen;border-radius:50%;" +
        "left:" + (rb.x + rb.w * 0.1) + "%;top:" + (rb.y + rb.h * 0.25) + "%;" +
        "width:" + rb.w * 0.8 + "%;height:" + rb.h * 0.5 + "%;" +
        "background:radial-gradient(ellipse,rgba(238,241,248,.5),transparent 70%)";
      rm(g, 2600);
      if (Math.random() < 0.03) {                 /* rare: stars beneath the water, 1 s */
        for (var i = 0; i < 5; i++) rm(put("star", rnd(pb.x, pb.x + pb.w), rnd(pb.y, pb.y + pb.h)), 1100);
      }
    } else if (id === "lotus") {
      ring(p.x, p.y, 1); specks(p.x, p.y, 3);
      if (Math.random() < 0.5) petal(p.x, p.y);   /* optional: one petal drifts onto the pond */
    } else if (id === "petals") {
      for (var j = 0; j < 3; j++) petal(p.x + rnd(-4, 4), p.y + rnd(-2, 2));
    } else if (id === "moth") {
      flyMoth();
    }
  }

  /* ---------- SILVER MOTH: takeoff, circle, land on a nearby lotus ---------- */
  function flyMoth() {
    var OFF = [[0, 0], [-6, 5], [5, 3], [-11, 7]],   /* perches, as steps away from its home lotus */
        m = $(".moth"), sp = $('[data-spot="moth"]');
    mothAt = ((mothAt || 0) + 1) % OFF.length;
    var nx = home.x + OFF[mothAt][0], ny = home.y + OFF[mothAt][1];
    specks(parseFloat(m.style.left), parseFloat(m.style.top), 2);   /* silver trail */
    m.classList.add("is-flying");
    setTimeout(function () {
      m.style.left = nx + "%"; m.style.top = ny + "%";
      sp.style.setProperty("--x", nx - mw / 2); sp.style.setProperty("--y", ny - mh / 2);   /* the spot follows */
    }, 200);
    setTimeout(function () { m.classList.remove("is-flying"); specks(nx, ny, 2); }, 1200);
  }

  /* ---------- MEMORY SCENE: Moon Lotus Pond → Lotus Shore → Silver Light Grove ----------
     No dialogue, only a soft trail of silver and the old line. */
  function noteVisit(id) {
    trail = trail || [];
    if (id !== "pond" && id !== "shore" && id !== "grove") return;
    if (id === "grove" && !found.grove) return;   /* a glimpse does not count */
    if (trail[trail.length - 1] !== id) trail.push(id);
    trail = trail.slice(-3);
    if (!memDone && trail.join() === "pond,shore,grove") { memDone = true; memory(); }
  }
  function memory() {                             /* silver drifts from the shore toward the grove */
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
