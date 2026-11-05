/* One More Little Step — save.js V1.0
   Part 1 of 1 (JavaScript Part 4)
   Saves progress in the browser (localStorage) and powers the Continue button.
   Needs game.js loaded first. Saves: current scene, courage, found hotspots,
   and collected Silver Petals. Game calls Save.save() after every discovery
   and scene change. If storage is blocked, the game still plays normally. */

const Save = (() => {
  const KEY = "omls-save-v1";
  const TOTAL = SCENES.length;
  const btn = document.getElementById("btn-continue");

  /* Only accept a save that matches the current game shape */
  function valid(d) {
    return !!d && d.v === 1 &&
      Number.isInteger(d.current) && d.current >= 0 && d.current < TOTAL &&
      typeof d.courage === "number" &&
      Array.isArray(d.petalsGot) && d.petalsGot.length === TOTAL &&
      Array.isArray(d.foundIds) && d.foundIds.length === TOTAL &&
      d.foundIds.every(a => Array.isArray(a));
  }

  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(KEY));
      return valid(d) ? d : null;
    } catch (e) { return null; }
  }

  const has = () => !!load();

  function refresh() {
    if (btn) btn.disabled = !has();
  }

  function save() {
    try {
      const s = Game.getState();
      if (s.current < 0) return;               /* on the title screen */
      localStorage.setItem(KEY, JSON.stringify({ v: 1, ...s, savedAt: Date.now() }));
      refresh();
    } catch (e) { /* storage unavailable: ignore */ }
  }

  function clear() {
    try { localStorage.removeItem(KEY); } catch (e) {}
    refresh();
  }

  if (btn) btn.addEventListener("click", () => {
    const d = load();
    if (d) Game.resume(d);
  });

  refresh();
  return { save, load, has, clear };
})();
