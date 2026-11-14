/* One More Little Step — game.js V1.2
   Project: One More Little Step (Burrow Whispers, Lunelle)
   Part 1 of 2 (JavaScript)
   Paste Part 2 directly after this part: they are one file.

   V1.2: Desktop 16:9 format added. There are now three screen shapes,
         read from width / height:
           under 1.55     "tablet"   (4:3)
           1.55 to 1.95   "desktop"  (16:9)
           1.95 and up   "wide"     (20:9, phones)
         A scene uses the desktop picture only if scenes.js gives it
         desktopBackground (so far Scene 1). Other scenes fall back to
         the 20:9 picture, and the stage switches to 20:9 for them.
         The stage shape now changes per screen (title or scene) while
         the fade is black. data-format on #game ("tablet", "desktop",
         "wide") is set for title.css.
         Desktop scenes can also move Lunelle (desktopLunelle) and the
         petal (desktopPetal).
   V1.1: Tablet format finished. Tablet hotspots list only id and
         position; kind, courage and clue come from the main hotspot.
         The petal hint arrow and text follow the petal on tablet.
   V1.0: NEW BEGINNING. Rebuilt around the new help system.
         Guidance (guidance.js) runs in every scene (hints, auto-reveal).
         Every tap gets particle feedback (Effects.touch):
           "explore" = empty area, "interactive" = hotspot,
           "discovery" = petal or last hotspot.
         Taps that find nothing count as Missed Searches.
         First-time intro text, petal hint, Lunelle vanish, Sound
         button, save and resume are kept.
         Resume ignores old hotspot ids that no longer exist.

   Needs scenes.js, effects.js, audio.js, guidance.js loaded first;
   save.js after. */

const Game = (() => {
  const stage = document.getElementById("game");
  const TOTAL = SCENES.length;
  const RATIOS = {                       /* [CSS ratio, number] per format */
    tablet:  ["4 / 3",  "1.3333"],
    desktop: ["16 / 9", "1.7778"],
    wide:    ["20 / 9", "2.2222"]
  };
  let current = -1, courage = 0, moving = false;
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

  /* ---------- Formats ---------- */
  const shape = () => {
    const r = innerWidth / innerHeight;
    return r < 1.55 ? "tablet" : r < 1.95 ? "desktop" : "wide";
  };

  /* The format a scene really uses (falls back to wide without art) */
  const fmtOf = s => {
    const f = shape();
    if (f === "tablet" && !s.tabletBackground) return "wide";
    if (f === "desktop" && !s.desktopBackground) return "wide";
    return f;
  };

  const bgOf = (s, f) => f === "tablet" ? s.tabletBackground
    : f === "desktop" ? s.desktopBackground : s.background;

  /* Hotspots for a format. Tablet and desktop entries borrow kind,
     courage and clue from the main hotspot with the same id. */
  const spots = (s, f = fmtOf(s)) => {
    const list = f === "tablet" ? s.tabletHotspots
      : f === "desktop" ? s.desktopHotspots : null;
    return list
      ? list.map(t => Object.assign({}, s.hotspots.find(h => h.id === t.id), t))
      : s.hotspots;
  };

  const petalAt = (s, f = fmtOf(s)) =>
    (f === "tablet" && s.tabletPetal) || (f === "desktop" && s.desktopPetal) || s.petal;

  const lunelleAt = (s, f = fmtOf(s)) =>
    f === "desktop" && s.desktopLunelle
      ? Object.assign({}, s.lunelle, s.desktopLunelle) : s.lunelle;

  const place = (b, h) => { b.style.cssText = `left:${h.x}%;top:${h.y}%;width:${h.w}%;height:${h.h}%`; };

  /* Stage shape for the screen being shown */
  function setStageFormat(f) {
    stage.dataset.format = f;
    stage.style.setProperty("--stage-ratio", RATIOS[f][0]);
    stage.style.setProperty("--stage-ratio-num", RATIOS[f][1]);
  }

  /* ---------- Build ---------- */
  function petalHintHTML(s) {
    if (!s.petalHint) return "";
    if (!s.petalPoint)
      return `<div class="petal-hint-text" style="left:50%;top:${s.petalHintY || 16}%">${s.petalHint}</div>`;
    const cx = s.petal.x + 2, tx = Math.min(Math.max(cx, 15), 85);
    return `<div class="petal-hint-text" style="left:${tx}%;top:${Math.max(s.petal.y - 18, 14)}%">${s.petalHint}</div>
            <div class="petal-hint-arrow" style="left:${cx}%;top:${s.petal.y - 10}%">&#9660;</div>`;
  }

  /* Move a scene's petal hint (text and arrow) to follow its petal */
  function placePetalHint(i, pt) {
    const e = sceneEls[i];
    const t = e.querySelector(".petal-hint-text"), a = e.querySelector(".petal-hint-arrow");
    if (!t || !a) return;                              /* no arrow: text stays centered */
    const cx = pt.x + 2;
    t.style.left = Math.min(Math.max(cx, 15), 85) + "%";
    t.style.top = Math.max(pt.y - 18, 14) + "%";
    a.style.left = cx + "%";
    a.style.top = (pt.y - 10) + "%";
  }

  /* Move Lunelle and her crest glow for a format */
  function placeLunelle(i, f) {
    const L = lunelleAt(SCENES[i], f), e = sceneEls[i];
    const sp = e.querySelector(".lunelle"), c = e.querySelector(".crest");
    sp.style.left = L.x + "%";
    sp.style.bottom = L.bottom + "%";
    sp.style.width = L.w + "%";
    c.style.left = (L.x + L.w * 0.4) + "%";
    c.style.bottom = (L.bottom + 30 * (L.w / 28)) + "%";
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

  /* ---- Part 2 of 2 continues below: paste it right here ---- */

                /* ---------- Part 2 of 2 of game.js V1.2 starts here ---------- */

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

  /* ---------- Format (tablet, desktop or wide) ---------- */
  /* Every scene is laid out for its own format. The stage shape follows
     the screen being shown (the title, or the current scene). */
  let lastShape = null;
  function applyFormat() {
    const sh = shape();
    if (sh === lastShape) return;
    lastShape = sh;
    SCENES.forEach((s, i) => {
      const f = fmtOf(s);
      sceneEls[i].querySelector(".bg").style.backgroundImage = `url('${bgOf(s, f)}')`;
      sceneEls[i].querySelectorAll(".hotspot").forEach(b => {
        const h = spots(s, f).find(x => x.id === b.getAttribute("aria-label"));
        if (h) place(b, h);
      });
      const pt = petalAt(s, f);
      petalEls[i].style.cssText = `left:${pt.x}%;top:${pt.y}%`;
      placePetalHint(i, pt);
      placeLunelle(i, f);
    });
    setStageFormat(current < 0 ? sh : fmtOf(scene()));
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
      setStageFormat(fmtOf(scene()));            /* while the screen is black */
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
      setStageFormat(shape());                   /* title art exists for every shape */
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
