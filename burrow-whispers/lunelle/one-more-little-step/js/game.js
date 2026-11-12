/* One More Little Step — game.js V1.0
   Project: One More Little Step (Burrow Whispers, Lunelle)
   Part 1 of 1 (JavaScript)

   V1.0: NEW BEGINNING. Rebuilt around the new help system.
         Removed: the 8-second tutorial glow, the 15-second idle
         reminder, and the circle ripple (the Touch-State spec bans
         ripples).
         Added: Guidance (guidance.js) is started for every scene.
         Every tap gets particle feedback (Effects.touch):
           "explore" = empty area, "interactive" = hotspot,
           "discovery" = petal or final hotspot.
         Added: taps that find nothing count as Missed Searches.
         Added: auto-reveal (Guidance calls reveal) counts as a find.
         Added: a short "touched" scale on hotspots.
         Added: tablet format. Narrow screens (under 1.7:1) swap to
         scene.tabletBackground and scene.tabletHotspots / tabletPetal
         when a scene has them. TABLET_RATIO is a guess: set it to
         the real tablet art ratio.
         Kept: first-time intro text (Scenes with a hint), petal hint,
         Lunelle vanish, Sound button, save and resume.
         Resume now ignores old hotspot ids that no longer exist.

   Needs scenes.js, effects.js, audio.js, guidance.js loaded first;
   save.js after. */

const Game = (() => {
  const stage = document.getElementById("game");
  const TOTAL = SCENES.length;
  const TABLET_RATIO = 4 / 3;               /* confirm with the real art */
  let current = -1, courage = 0, moving = false, tablet = null;
  let petalsGot = new Array(TOTAL).fill(false);
  let foundIds = SCENES.map(() => []);
  let tutorialDone = SCENES.map(() => false);
  const petalEls = [];

  /* Optional modules */
  const fx = (fn, ...a) => { if (typeof Effects !== "undefined" && Effects[fn]) Effects[fn](...a); };
  const sv = () => { if (typeof Save !== "undefined") Save.save(); };
  const au = (fn, ...a) => { if (typeof Sound !== "undefined") Sound[fn](...a); };

  const fade = document.createElement("div");
  fade.className = "fade-overlay";
  stage.appendChild(fade);

  const spots = s => (tablet && s.tabletHotspots) || s.hotspots;
  const place = (b, h) => { b.style.cssText = `left:${h.x}%;top:${h.y}%;width:${h.w}%;height:${h.h}%`; };

  /* ---------- Build ---------- */
  function petalHintHTML(s) {
    if (!s.petalHint) return "";
    if (!s.petalPoint)
      return `<div class="petal-hint-text" style="left:50%;top:${s.petalHintY || 16}%">${s.petalHint}</div>`;
    const cx = s.petal.x + 2, tx = Math.min(Math.max(cx, 15), 85);
    return `<div class="petal-hint-text" style="left:${tx}%;top:${Math.max(s.petal.y - 18, 14)}%">${s.petalHint}</div>
            <div class="petal-hint-arrow" style="left:${cx}%;top:${s.petal.y - 10}%">&#9660;</div>`;
  }

  function buildScene(s, i) {
    const slots = SCENES.map(() => '<span class="petal-slot"></span>').join("");
    const L = s.lunelle;
    const el = document.createElement("section");
    el.id = "scene-" + s.id;
    el.className = "screen scene";
    el.innerHTML =
      `<div class="bg"></div>
       <div class="fx-layer"></div>
       <div class="scene-name">${s.title}</div>
       <div class="hud">
         <div class="courage"><span>Courage</span>
           <div class="courage-bar"><div class="courage-fill"></div></div></div>
         <div class="petals">${slots}</div>
       </div>
       <img class="lunelle" src="${L.src}" alt="Lunelle"
            onerror="this.style.display='none';this.nextElementSibling.style.display='none'"
            style="left:${L.x}%;bottom:${L.bottom}%;width:${L.w}%">
       <div class="crest" style="left:${L.x + L.w * 0.4}%;bottom:${L.bottom + 30 * (L.w / 28)}%"></div>
       <p class="whisper"></p>
       <p class="hint"></p>
       ${petalHintHTML(s)}
       <button class="next-btn">${i === TOTAL - 1 ? "One more little step" : "Next"}</button>`;

    s.hotspots.forEach(h => {
      const b = document.createElement("button");
      b.className = "hotspot";
      b.setAttribute("aria-label", h.id);
      place(b, h);
      b.addEventListener("click", e => {
        const p = pos(e);
        discover(s, h, b, p.x, p.y);
      });
      el.appendChild(b);
    });

    const p = document.createElement("button");
    p.className = "petal";
    p.setAttribute("aria-label", "Silver petal");
    p.style.cssText = `left:${s.petal.x}%;top:${s.petal.y}%`;
    p.addEventListener("click", e => onPetal(i, p, pos(e)));
    petalEls[i] = p;
    el.appendChild(p);

    /* Taps on empty scenery: acknowledged, and counted as a Missed Search */
    el.addEventListener("click", e => {
      if (e.target.closest(".hotspot, .petal, .next-btn")) return;
      const q = pos(e);
      const old = foundAt(e);
      fx("touch", el, q.x, q.y, "explore", old);   /* old = softer repeat touch */
      if (!old) Guidance.miss();
    });

    el.querySelector(".next-btn").addEventListener("click", () => {
      i === TOTAL - 1 ? goTitle() : goTo(i + 1);
    });
    stage.appendChild(el);
    return el;
  }

  const sceneEls = SCENES.map(buildScene);
  const titleEl = document.getElementById("title-screen");

  /* ---------- Helpers ---------- */
  const scene = () => SCENES[current];
  const el = () => sceneEls[current];

  function pos(e) {                              /* tap position in % of the stage */
    const r = stage.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * 100, y: (e.clientY - r.top) / r.height * 100 };
  }

  function foundAt(e) {                          /* did the tap land on an already-found hotspot? */
    return [...el().querySelectorAll(".hotspot.found")].some(b => {
      const r = b.getBoundingClientRect();
      return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    });
  }

  function whisper(text) {
    if (!text) return;
    const w = el().querySelector(".whisper");
    w.textContent = text;
    w.classList.add("show");
    clearTimeout(whisper.t);
    whisper.t = setTimeout(() => w.classList.remove("show"), 3500);
  }

  let hintHide;
  function showHint(text, ms) {
    if (current < 0 || !text) return;
    const h = el().querySelector(".hint");
    h.textContent = text;
    h.classList.add("show");
    clearTimeout(hintHide);
    if (ms) hintHide = setTimeout(() => h.classList.remove("show"), ms);
  }

  function updateMeter() {
    const pct = Math.min(100, (courage / scene().courageRequired) * 100);
    el().querySelector(".courage-fill").style.width = pct + "%";
    const full = courage >= scene().courageRequired;
    el().querySelector(".courage").classList.toggle("full", full);
    el().querySelector(".next-btn").classList.toggle("ready", full);
  }

  function updatePetals() {
    sceneEls.forEach(s => s.querySelectorAll(".petal-slot").forEach((slot, n) =>
      slot.classList.toggle("got", petalsGot[n])));
  }

  function shimmer() {
    const sprite = el().querySelector(".lunelle");
    if (sprite && sprite.classList.contains("gone")) return;
    const c = el().querySelector(".crest");
    c.classList.remove("shimmer");
    void c.offsetWidth;
    c.classList.add("shimmer");
  }

  /* ---------- Lunelle vanish ---------- */
  let vanishTimer;
  function startVanishTimer() {
    clearTimeout(vanishTimer);
    const sprite = el().querySelector(".lunelle");
    if (!sprite) return;
    sprite.classList.remove("gone");
    const ms = scene().lunelle.vanishAfter;
    if (ms) vanishTimer = setTimeout(() => sprite.classList.add("gone"), ms);
  }

  /* ---------- First-time intro text (no glow) ---------- */
  let introTimer;
  function startIntro() {
    clearTimeout(introTimer);
    const s = scene();
    if (s.hint && !tutorialDone[current]) introTimer = setTimeout(() => showHint(s.hint), 2500);
  }
  function endIntro() {
    if (tutorialDone[current] || !scene().hint) return;
    tutorialDone[current] = true;
    clearTimeout(introTimer);
    if (scene().hint2) showHint(scene().hint2, 4500);
    else el().querySelector(".hint").classList.remove("show");
  }

  /* ---------- Petal hint (after the meter is full) ---------- */
  let petalHintTimer;
  function hidePetalHint() {
    clearTimeout(petalHintTimer);
    sceneEls.forEach((e, n) => {
      e.querySelectorAll(".petal-hint-text, .petal-hint-arrow").forEach(x => x.classList.remove("show"));
      petalEls[n].classList.remove("hinted");
    });
  }
  function checkPetalHint() {
    clearTimeout(petalHintTimer);
    if (current < 0) return;
    const s = scene();
    if (!s.petalHint || petalsGot[current] || courage < s.courageRequired) return;
    petalHintTimer = setTimeout(() => {
      if (current < 0 || petalsGot[current]) return;
      el().querySelectorAll(".petal-hint-text, .petal-hint-arrow").forEach(x => x.classList.add("show"));
      if (s.petalPoint) petalEls[current].classList.add("hinted");
    }, 1000);
  }

  /* ---------- Interaction ---------- */
  function discover(s, h, btn, x, y) {
    if (btn.classList.contains("found")) return;
    btn.classList.add("found", "touched");
    setTimeout(() => btn.classList.remove("touched"), 160);
    foundIds[current].push(h.id);
    courage += h.courage;
    updateMeter();
    const last = courage === s.courageRequired;
    fx("touch", el(), x, y, last ? "discovery" : "interactive");
    au("discover", h.kind);
    if (last) { au("ready"); checkPetalHint(); }
    whisper(h.whisper);
    endIntro();
    shimmer();
    Guidance.discovery();
    sv();
  }

  function onPetal(i, btn, p) {
    if (petalsGot[i]) return;
    petalsGot[i] = true;
    btn.classList.add("collected");
    fx("touch", el(), p.x, p.y, "discovery");
    au("petal");
    hidePetalHint();
    updatePetals();
    shimmer();
    Guidance.discovery();
    sv();
  }

  /* Guidance reveals a hidden spot by itself */
  function reveal(id) {
    const s = scene(), h = spots(s).find(x => x.id === id);
    const b = el().querySelector(`.hotspot[aria-label="${id}"]`);
    if (h && b) discover(s, h, b, h.x + h.w / 2, h.y + h.h / 2);
  }

  function applyFound(i) {
    sceneEls[i].querySelectorAll(".hotspot").forEach(b =>
      b.classList.toggle("found", foundIds[i].includes(b.getAttribute("aria-label"))));
    petalEls[i].classList.toggle("collected", petalsGot[i]);
  }

  /* ---------- Format (wide or tablet) ---------- */
  function applyFormat() {
    const t = innerWidth / innerHeight < 1.7;
    if (t === tablet) return;
    tablet = t;
    stage.style.setProperty("--stage-ratio", t ? "4 / 3" : "20 / 9");
    stage.style.setProperty("--stage-ratio-num", t ? TABLET_RATIO : 2.2222);
    SCENES.forEach((s, i) => {
      const bg = t && s.tabletBackground ? s.tabletBackground : s.background;
      sceneEls[i].querySelector(".bg").style.backgroundImage = `url('${bg}')`;
      sceneEls[i].querySelectorAll(".hotspot").forEach(b => {
        const h = spots(s).find(x => x.id === b.getAttribute("aria-label"));
        if (h) place(b, h);
      });
      const pt = (t && s.tabletPetal) || s.petal;
      petalEls[i].style.cssText = `left:${pt.x}%;top:${pt.y}%`;
    });
  }
  applyFormat();
  addEventListener("resize", applyFormat);

  /* ---------- Navigation ---------- */
  function swap(fn) {
    if (moving) return;
    moving = true;
    fade.classList.add("on");
    setTimeout(() => { fn(); fade.classList.remove("on"); moving = false; }, 1200);
  }

  function goTo(i, keep) {
    swap(() => {
      Guidance.stop();
      titleEl.classList.remove("active");
      sceneEls.forEach(s => s.classList.remove("active"));
      hidePetalHint();
      current = i;
      if (!keep) { courage = 0; foundIds[i] = []; }
      applyFound(i);
      el().classList.add("active");
      updateMeter();
      updatePetals();
      fx("start", el());
      au("scene", scene().id);
      startIntro();
      startVanishTimer();
      checkPetalHint();
      Guidance.start({
        el: el(),
        scene: Object.assign({}, scene(), { hotspots: spots(scene()) }),
        say: showHint, reveal, busy: () => moving
      });
      sv();
    });
  }

  function goTitle() {
    swap(() => {
      Guidance.stop();
      hidePetalHint();
      clearTimeout(introTimer);
      clearTimeout(vanishTimer);
      sceneEls.forEach(s => s.classList.remove("active"));
      current = -1;
      titleEl.classList.add("active");
      au("scene", "title");
    });
  }

  /* ---------- Panels ---------- */
  function panel(title, body) {
    const p = document.createElement("div");
    p.className = "panel";
    p.innerHTML = `<div class="panel-card"><h2>${title}</h2><p>${body}</p>
      <button class="menu-btn">Close</button></div>`;
    p.querySelector("button").addEventListener("click", () => p.classList.remove("show"));
    stage.appendChild(p);
    return p;
  }
  const settingsPanel = panel("Settings", "Gentle night sounds can be turned on or off here.");
  if (typeof Sound !== "undefined") {
    const card = settingsPanel.querySelector(".panel-card");
    const sb = document.createElement("button");
    sb.className = "menu-btn";
    const label = () => { sb.textContent = "Sound: " + (Sound.isOn() ? "On" : "Off"); };
    label();
    sb.addEventListener("click", () => { Sound.toggle(); label(); });
    card.insertBefore(sb, card.querySelector("button"));
  }
  const creditsPanel = panel("Credits", "One More Little Step<br>A Burrow Whispers Story");

  /* ---------- Menu wiring ---------- */
  function newGame() {
    petalsGot = new Array(TOTAL).fill(false);
    foundIds = SCENES.map(() => []);
    courage = 0;
    tutorialDone = SCENES.map(() => false);
    sceneEls.forEach((_, n) => applyFound(n));
    goTo(0);
  }

  function resume(s) {
    petalsGot = [...s.petalsGot];
    /* keep only hotspot ids that still exist (old saves had 7 on Scene 1) */
    foundIds = s.foundIds.map((a, n) => a.filter(id => SCENES[n].hotspots.some(h => h.id === id)));
    courage = foundIds[s.current].length;
    sceneEls.forEach((_, n) => applyFound(n));
    tutorialDone = SCENES.map((_, n) => n < s.current || (n === s.current && foundIds[n].length > 0));
    goTo(s.current, true);
  }

  document.getElementById("btn-start").addEventListener("click", () => {
    if (typeof Save !== "undefined" && Save.has() &&
        !confirm("Begin a new journey? Your saved progress will be replaced.")) return;
    newGame();
  });
  document.getElementById("btn-settings").addEventListener("click", () => settingsPanel.classList.add("show"));
  document.getElementById("btn-credits").addEventListener("click", () => creditsPanel.classList.add("show"));

  return {
    goTo, newGame, resume,
    getState: () => ({ current, courage, petalsGot: [...petalsGot],
                       foundIds: foundIds.map(a => [...a]) }),
    setState: s => { courage = s.courage; petalsGot = s.petalsGot; foundIds = s.foundIds; }
  };
})();
