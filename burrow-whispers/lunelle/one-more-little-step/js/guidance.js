/* One More Little Step — guidance.js V1.0
   Project: One More Little Step (Burrow Whispers, Lunelle)
   Part 1 of 1 (JavaScript)

   V1.0: NEW FILE. The help system, built on the Moonroot Curiosity
         Guidance System (MCGS) V2.0. It replaces the old repeating
         hotspot glow and the idle reminder in game.js.

   How it works:
   - It measures lack of discovery, not lack of activity.
   - Observer: seconds since the last discovery (15, 30, 60, 90, 150).
   - Searcher: missed taps since the last discovery (one stage per 8).
   - Whichever reaches a stage first advances the hint stage.
   - Any discovery (hotspot, petal) resets all three counters.
   - Stages 1 to 3 are animations, 4 to 5 are short text observations.
   - After Stage 5, if nothing is found for AUTO_REVEAL_AFTER seconds,
     one hidden spot reveals itself and counts as found.

   Stage 1  Environmental attraction  (Effects.attract)
   Stage 2  Silver particle drift     (Effects.motes)
   Stage 3  Moon Lotus resonance      (Effects.bloom)
   Stage 4  Mood text                 (scene.mood)
   Stage 5  Focused text              (hotspot.clue)

   Effects hooks (built in effects.js, Step 4), x and y in percent:
     Effects.attract(sceneEl)
     Effects.motes(sceneEl, x, y)
     Effects.bloom(sceneEl, x, y)

   game.js gives this module a context object:
     { el, scene, say(text, ms), reveal(hotspotId), busy() }
   and calls start(ctx), stop(), discovery() and miss(). */

const Guidance = (() => {
  const OBSERVER = [15, 30, 60, 90, 150];  /* seconds, Stages 1 to 5 */
  const MISSES_PER_STAGE = 8;
  const AUTO_REVEAL_AFTER = 30;            /* seconds after Stage 5 */
  const MAX = 5;

  let ctx = null, timer = null;
  let secs = 0, misses = 0, stage = 0, atFive = 0, target = null;

  const fx = (fn, ...a) => {
    if (typeof Effects !== "undefined" && Effects[fn]) Effects[fn](...a);
  };

  /* Hotspot data for every hotspot not yet found */
  const remaining = () => ctx.scene.hotspots.filter(h => {
    const b = ctx.el.querySelector(`.hotspot[aria-label="${h.id}"]`);
    return b && !b.classList.contains("found");
  });

  /* The hotspot this round of hints points toward (stays the same until found) */
  function pick() {
    const left = remaining();
    if (!left.length) return (target = null);
    if (!target || !left.includes(target))
      target = left[Math.floor(Math.random() * left.length)];
    return target;
  }

  /* A point near the target, never exactly on it (hints suggest an area) */
  const near = v => Math.min(95, Math.max(5, v + (Math.random() * 8 - 4)));

  function run(n) {
    const t = pick();
    if (!t) return;
    const x = near(t.x + t.w / 2), y = near(t.y + t.h / 2);
    if (n === 1) fx("attract", ctx.el);
    else if (n === 2) fx("motes", ctx.el, x, y);
    else if (n === 3) fx("bloom", ctx.el, x, y);
    else if (n === 4) ctx.say(ctx.scene.mood, 6000);
    else { ctx.say(t.clue, 7000); atFive = secs; }
  }

  function setStage(n) {
    n = Math.min(n, MAX);
    if (n <= stage) return;
    stage = n;
    run(n);
  }

  function tick() {
    if (!ctx || document.hidden || ctx.busy()) return;   /* paused while hidden or fading */
    secs++;
    setStage(OBSERVER.filter(s => secs >= s).length);
    if (stage === MAX && target && secs - atFive >= AUTO_REVEAL_AFTER) {
      const id = target.id;
      target = null;
      ctx.reveal(id);                                    /* game.js counts it as a discovery */
    }
  }

  function reset() {
    secs = 0; misses = 0; stage = 0; atFive = 0; target = null;
  }

  /* ---------- Public ---------- */
  function start(context) {
    stop();
    ctx = context;
    reset();
    if (!remaining().length) return;
    timer = setInterval(tick, 1000);
  }

  function stop() {
    clearInterval(timer);
    timer = null;
    ctx = null;
    reset();
  }

  /* A meaningful discovery: everything starts over */
  function discovery() {
    if (!ctx) return;
    reset();
    if (!remaining().length) { clearInterval(timer); timer = null; }
  }

  /* A tap that found nothing */
  function miss() {
    if (!ctx || !timer) return;
    misses++;
    setStage(Math.floor(misses / MISSES_PER_STAGE));
  }

  return { start, stop, discovery, miss };
})();
