/* One More Little Step — effects.js V1.4
   V1.4: Scene 5 recipe (lake glow, twinkling light trail).
   V1.3: Scene 4 recipe (soft glow around the moth).
   V1.2: Scene 3 recipe (glow pulse in the clearing).
   V1.1: Scene 2 recipe (silver orb pulse).
   Part 1 of 1 (JavaScript Part 3)
   Fills each scene's .fx-layer with fireflies, particles, fog,
   water sparkle, the silver reflection and Moon Lotus glow.
   Styles live in effects.css. Positions are percentages of the stage.
   Called by game.js: Effects.start(sceneElement). Safe to call repeatedly. */

const Effects = (() => {
  const rand = (a, b) => a + Math.random() * (b - a);

  /* Per-scene recipes. Scenes without a recipe use "default". */
  const RECIPES = {
    pond: {
      fireflies: 14, particles: 10, sparkles: 14, fog: true,
      /* extra fireflies gathered around the upper-right cluster */
      cluster: { x: 74, y: 23, w: 13, h: 29, count: 6 },
      /* sparkle zone: the water */
      water: { x: 28, y: 56, w: 44, h: 22 },
      /* silver reflection, matched to the moon-path hotspot */
      reflection: { x: 45, y: 53, w: 11, h: 24 },
      /* Moon Lotus bloom glow, matched to the lotus hotspot */
      lotus: [{ x: 61.5, y: 59, w: 9, h: 18 }]
    },
    "silver-light": {
      fireflies: 8, particles: 10, sparkles: 0, fog: true,
      /* pulse on the silver orb */
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
      /* twinkle along the silver trail */
      water: { x: 12, y: 38, w: 10, h: 15 },
      /* glow on the distant lake */
      reflection: { x: 55.5, y: 36, w: 11, h: 15 }
    },
    default: { fireflies: 8, particles: 8, sparkles: 0, fog: true }
  };

  function add(layer, cls, style, vars) {
    const d = document.createElement("div");
    d.className = cls;
    if (style) d.style.cssText = style;
    if (vars) Object.entries(vars).forEach(([k, v]) => d.style.setProperty(k, v));
    layer.appendChild(d);
    return d;
  }

  function firefly(layer, x, y) {
    add(layer, "firefly", `left:${x}%;top:${y}%`, {
      "--dur": rand(3, 6).toFixed(1) + "s",
      "--delay": (-rand(0, 6)).toFixed(1) + "s",
      "--drift": rand(-40, 40).toFixed(0) + "px"
    });
  }

  function start(sceneEl) {
    const layer = sceneEl && sceneEl.querySelector(".fx-layer");
    if (!layer) return;
    layer.innerHTML = "";                       /* rebuild cleanly each visit */

    const id = sceneEl.id.replace("scene-", "");
    const r = RECIPES[id] || RECIPES.default;

    /* Fog: two slow drifting layers */
    if (r.fog) {
      add(layer, "fog one");
      add(layer, "fog two");
    }

    /* Silver reflection: the story hook */
    if (r.reflection) {
      const f = r.reflection;
      add(layer, "silver-reflection",
        `left:${f.x}%;top:${f.y}%;width:${f.w}%;height:${f.h}%`);
    }

    /* Moon Lotus glow */
    (r.lotus || []).forEach(l => {
      const g = add(layer, "lotus-glow",
        `left:${l.x}%;top:${l.y}%;width:${l.w}%;height:${l.h}%;` +
        `border-radius:50%;background:radial-gradient(circle,` +
        `rgba(205,191,232,0.35) 0%,rgba(205,191,232,0) 70%)`);
      g.style.animationDelay = (-rand(0, 7)).toFixed(1) + "s";
    });

    /* Water sparkle */
    if (r.water) {
      const w = r.water;
      for (let i = 0; i < r.sparkles; i++) {
        add(layer, "sparkle",
          `left:${rand(w.x, w.x + w.w).toFixed(1)}%;top:${rand(w.y, w.y + w.h).toFixed(1)}%`,
          { "--dur": rand(2, 4.5).toFixed(1) + "s",
            "--delay": (-rand(0, 4)).toFixed(1) + "s" });
      }
    }

    /* Fireflies: scattered, plus a cluster if the scene has one */
    for (let i = 0; i < r.fireflies; i++) {
      firefly(layer, rand(8, 92).toFixed(1), rand(14, 76).toFixed(1));
    }
    if (r.cluster) {
      const c = r.cluster;
      for (let i = 0; i < c.count; i++) {
        firefly(layer, rand(c.x, c.x + c.w).toFixed(1), rand(c.y, c.y + c.h).toFixed(1));
      }
    }

    /* Floating particles: pollen and dust */
    for (let i = 0; i < r.particles; i++) {
      add(layer, "particle",
        `left:${rand(5, 95).toFixed(1)}%;top:${rand(35, 90).toFixed(1)}%`,
        { "--dur": rand(10, 18).toFixed(1) + "s",
          "--delay": (-rand(0, 14)).toFixed(1) + "s" });
    }
  }

  /* Optional: clear a scene's effects */
  function stop(sceneEl) {
    const layer = sceneEl && sceneEl.querySelector(".fx-layer");
    if (layer) layer.innerHTML = "";
  }

  return { start, stop };
})();
