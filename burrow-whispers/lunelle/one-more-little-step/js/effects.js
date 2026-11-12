/* One More Little Step — effects.js V1.0
   Project: One More Little Step (Burrow Whispers, Lunelle)
   Part 1 of 1 (JavaScript)

   V1.0: NEW BEGINNING. Versions restart at 1.0.
         Kept: the scene recipes (fireflies, particles, sparkles, fog,
         silver reflection, Moon Lotus glow) from the old build.
         Added: Effects.touch(sceneEl, x, y, kind, soft)
                Touch-State feedback from the exact tap position:
                "explore" (empty area, 3 to 6 motes, 250 to 400 ms),
                "interactive" (hotspot: shimmer, bloom, drift, about 1.2 s),
                "discovery" (petal or last hotspot: lotus, bloom,
                particle spiral, about 2.5 s).
                Only the highest-priority touch effect plays at a time.
                soft = true is a repeat touch (half strength).
                No rings, ripples, stars or bursts (spec prohibits them).
         Added: guidance effects used by guidance.js:
                Effects.attract(sceneEl)       Stage 1
                Effects.motes(sceneEl, x, y)   Stage 2
                Effects.bloom(sceneEl, x, y)   Stage 3
         Styles live in effects.css (Step 6).
   Positions are percentages of the stage.
   Safe to call repeatedly. Called by game.js and guidance.js. */

const Effects = (() => {
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const COLORS = ["#a9bfd9", "#e6ebf2", "#cdbfe8"];   /* mist, silver, lavender */

  /* Per-scene recipes. Scenes without a recipe use "default". */
  const RECIPES = {
    pond: {
      fireflies: 14, particles: 10, sparkles: 14, fog: true,
      cluster: { x: 74, y: 23, w: 13, h: 29, count: 6 },
      water: { x: 28, y: 56, w: 44, h: 22 },
      reflection: { x: 45, y: 53, w: 11, h: 24 },
      lotus: [{ x: 61.5, y: 59, w: 9, h: 18 }]
    },
    "silver-light": {
      fireflies: 8, particles: 10, sparkles: 0, fog: true,
      reflection: { x: 58.5, y: 33, w: 10, h: 18 }
    },
    clearing: {
      fireflies: 10, particles: 10, sparkles: 0, fog: true,
      reflection: { x: 57.5, y: 45, w: 10, h: 20 }
    },
    moth: {
      fireflies: 10, particles: 10, sparkles: 0, fog: true,
      reflection: { x: 56.5, y: 22, w: 13, h: 22 }
    },
    hilltop: {
      fireflies: 12, particles: 10, sparkles: 8, fog: true,
      water: { x: 12, y: 38, w: 10, h: 15 },
      reflection: { x: 55.5, y: 36, w: 11, h: 15 }
    },
    default: { fireflies: 8, particles: 8, sparkles: 0, fog: true }
  };

  function add(layer, cls, style, vars, ttl) {
    const d = document.createElement("div");
    d.className = cls;
    if (style) d.style.cssText = style;
    if (vars) Object.entries(vars).forEach(([k, v]) => d.style.setProperty(k, v));
    layer.appendChild(d);
    if (ttl) setTimeout(() => d.remove(), ttl);
    return d;
  }

  const layerOf = sceneEl => sceneEl && sceneEl.querySelector(".fx-layer");
  const at = (x, y) => `left:${x.toFixed(1)}%;top:${y.toFixed(1)}%`;

  function firefly(layer, x, y) {
    add(layer, "firefly", `left:${x}%;top:${y}%`, {
      "--dur": rand(3, 6).toFixed(1) + "s",
      "--delay": (-rand(0, 6)).toFixed(1) + "s",
      "--drift": rand(-40, 40).toFixed(0) + "px"
    });
  }

  /* ---------- Scene effects ---------- */
  function start(sceneEl) {
    const layer = layerOf(sceneEl);
    if (!layer) return;
    layer.innerHTML = "";

    const id = sceneEl.id.replace("scene-", "");
    const r = RECIPES[id] || RECIPES.default;

    if (r.fog) { add(layer, "fog one"); add(layer, "fog two"); }

    if (r.reflection) {
      const f = r.reflection;
      add(layer, "silver-reflection",
        `left:${f.x}%;top:${f.y}%;width:${f.w}%;height:${f.h}%`);
    }

    (r.lotus || []).forEach(l => {
      const g = add(layer, "lotus-glow",
        `left:${l.x}%;top:${l.y}%;width:${l.w}%;height:${l.h}%;` +
        `border-radius:50%;background:radial-gradient(circle,` +
        `rgba(205,191,232,0.35) 0%,rgba(205,191,232,0) 70%)`);
      g.style.animationDelay = (-rand(0, 7)).toFixed(1) + "s";
    });

    if (r.water) {
      const w = r.water;
      for (let i = 0; i < r.sparkles; i++) {
        add(layer, "sparkle",
          at(rand(w.x, w.x + w.w), rand(w.y, w.y + w.h)),
          { "--dur": rand(2, 4.5).toFixed(1) + "s", "--delay": (-rand(0, 4)).toFixed(1) + "s" });
      }
    }

    for (let i = 0; i < r.fireflies; i++)
      firefly(layer, rand(8, 92).toFixed(1), rand(14, 76).toFixed(1));
    if (r.cluster) {
      const c = r.cluster;
      for (let i = 0; i < c.count; i++)
        firefly(layer, rand(c.x, c.x + c.w).toFixed(1), rand(c.y, c.y + c.h).toFixed(1));
    }

    for (let i = 0; i < r.particles; i++) {
      add(layer, "particle", at(rand(5, 95), rand(35, 90)),
        { "--dur": rand(10, 18).toFixed(1) + "s", "--delay": (-rand(0, 14)).toFixed(1) + "s" });
    }
  }

  function stop(sceneEl) {
    const layer = layerOf(sceneEl);
    if (layer) layer.innerHTML = "";
  }

  /* ---------- Touch-State feedback ---------- */
  const PRIORITY = { explore: 1, interactive: 2, discovery: 3 };
  const TTL = { explore: 450, interactive: 1300, discovery: 2600 };
  let lock = { p: 0, until: 0 };

  function mote(layer, x, y, dx, dy, dur, delay, o) {
    add(layer, "touch-mote", at(x, y), {
      "--dx": dx.toFixed(0) + "px", "--dy": dy.toFixed(0) + "px",
      "--dur": dur + "ms", "--delay": (delay || 0) + "ms",
      "--c": pick(COLORS), "--o": o
    }, dur + (delay || 0) + 80);
  }

  function touch(sceneEl, x, y, kind, soft) {
    const layer = layerOf(sceneEl);
    if (!layer) return;
    kind = PRIORITY[kind] ? kind : "explore";
    const now = Date.now(), p = PRIORITY[kind];
    if (now < lock.until && p < lock.p) return;          /* a stronger effect is playing */
    lock = { p, until: now + TTL[kind] };
    const o = soft ? 0.5 : 1;

    if (kind === "explore") {
      const n = Math.round(rand(3, 6) * (soft ? 0.6 : 1));
      for (let i = 0; i < n; i++)
        mote(layer, x, y, rand(-22, 22), rand(-26, 4), rand(250, 400), 0, 0.5 * o);
    } else if (kind === "interactive") {
      add(layer, "touch-bloom", at(x, y), { "--o": o }, 1300);
      const n = Math.round(8 * (soft ? 0.5 : 1));
      for (let i = 0; i < n; i++)
        mote(layer, x, y, rand(-40, 40), rand(-50, -8), rand(700, 1200), i * 40, 0.8 * o);
    } else {
      add(layer, "touch-lotus", at(x, y), null, 2600);
      add(layer, "touch-bloom big", at(x, y), { "--o": 1 }, 2000);
      for (let k = 0; k < 12; k++) {                     /* particle spiral */
        const a = k * 0.55, r = 18 + k * 7;
        mote(layer, x, y, Math.cos(a) * r, Math.sin(a) * r - 20,
             rand(1400, 1800), k * 80, 0.9);
      }
    }
  }

  /* ---------- Guidance effects ---------- */
  /* Stage 1: the world stirs. A falling petal, livelier fireflies, a twinkle. */
  function attract(sceneEl) {
    const layer = layerOf(sceneEl);
    if (!layer) return;
    add(layer, "guide-petal", at(rand(15, 85), 8), { "--drift": rand(-60, 60).toFixed(0) + "px" }, 9000);
    for (let i = 0; i < 3; i++)
      add(layer, "guide-firefly", at(rand(10, 90), rand(25, 75)),
        { "--drift": rand(-50, 50).toFixed(0) + "px", "--delay": (i * 0.6) + "s" }, 7000);
    for (let i = 0; i < 2; i++)
      add(layer, "guide-twinkle", at(rand(10, 90), rand(8, 45)), { "--delay": (i * 0.9) + "s" }, 4000);
  }

  /* Stage 2: silver motes drift through the area (never a line or an arrow) */
  function motes(sceneEl, x, y) {
    const layer = layerOf(sceneEl);
    if (!layer) return;
    for (let i = 0; i < 9; i++)
      add(layer, "guide-mote",
        at(Math.min(96, Math.max(4, x + rand(-9, 9))), Math.min(96, Math.max(4, y + rand(-9, 9)))),
        { "--dx": rand(-60, 60).toFixed(0) + "px", "--dy": rand(-50, 10).toFixed(0) + "px",
          "--dur": rand(3500, 5500).toFixed(0) + "ms", "--delay": (i * 350) + "ms" }, 9500);
  }

  /* Stage 3: a brief lotus shimmer, 0.5 to 1 second, subtle */
  function bloom(sceneEl, x, y) {
    const layer = layerOf(sceneEl);
    if (!layer) return;
    add(layer, "guide-bloom", at(x, y), null, 1200);
  }

  return { start, stop, touch, attract, motes, bloom };
})();
