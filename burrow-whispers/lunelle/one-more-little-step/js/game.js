/* One More Little Step — game.js V1.9
   V1.9: tutorial now runs per scene (Scenes 1 to 3 show "Tap what catches your eye"); petalHintY lets a scene lower its petal hint text
   V1.8: petal hint after 1 second; scenes with petalPoint get an arrow, others just ask the player to find the petal
   V1.7
   V1.7: blinking arrow and text pointing to the hidden petal (scenes with petalHint)
   V1.6
   V1.6: sound hooks (audio.js) and a Sound on/off button in Settings
   V1.5
   V1.5: save support: remembers found hotspots, resume() for Continue, newGame() resets cleanly
   V1.1: gentle first-time tutorial (Scene 1 only)
   V1.2: missing Lunelle sprite files are hidden instead of showing a broken image
   V1.3: crest offset scales with sprite size; optional vanishAfter fades Lunelle out
   V1.4: idle reminder: unfound hotspots glow again after 30 seconds without a discovery */

const Game = (() => {
  const stage = document.getElementById("game");
  const TOTAL = SCENES.length;
  const IDLE_MS = 15000;          /* time without a discovery before the reminder */
  let current = -1;
  let courage = 0;
  let found = 0;
  let petalsGot = new Array(TOTAL).fill(false);
  let foundIds = SCENES.map(() => []);   /* hotspot ids found, per scene */
  const petalEls = [];
  let moving = false;

  /* Optional modules (effects.js, save.js) may not exist yet */
  const fx = (fn, ...a) => { if (typeof Effects !== "undefined") Effects[fn](...a); };
  const sv = () => { if (typeof Save !== "undefined") Save.save(); };
  const au = (fn, ...a) => { if (typeof Sound !== "undefined") Sound[fn](...a); };

  /* Fade overlay, created once */
  const fade = document.createElement("div");
  fade.className = "fade-overlay";
  stage.appendChild(fade);

  /* ---------- Build ---------- */
  /* Blinking text and arrow that point at the hidden petal (scenes with petalHint) */
  function petalHintHTML(s) {
    if (!s.petalHint) return "";
    if (!s.petalPoint)                                     /* challenge only, no arrow */
      return `<div class="petal-hint-text" style="left:50%;top:${s.petalHintY || 16}%">${s.petalHint}</div>`;
    const cx = s.petal.x + 2;                              /* petal is 4% wide */
    const tx = Math.min(Math.max(cx, 15), 85);             /* keep the text on screen */
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
      `<div class="bg" style="background-image:url('${s.background}')"></div>
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
      b.style.cssText = `left:${h.x}%;top:${h.y}%;width:${h.w}%;height:${h.h}%`;
      b.addEventListener("click", e => onHotspot(s, h, b, e));
      el.appendChild(b);
    });

    const p = document.createElement("button");
    p.className = "petal";
    p.setAttribute("aria-label", "Silver petal");
    p.style.cssText = `left:${s.petal.x}%;top:${s.petal.y}%`;
    p.addEventListener("click", () => onPetal(i, p));
    petalEls[i] = p;
    el.appendChild(p);

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

  function whisper(text) {
    if (!text) return;
    const w = el().querySelector(".whisper");
    w.textContent = text;
    w.classList.add("show");
    clearTimeout(whisper.t);
    whisper.t = setTimeout(() => w.classList.remove("show"), 3500);
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
    if (sprite && sprite.classList.contains("gone")) return;  /* she has left, no crest to shimmer */
    const c = el().querySelector(".crest");
    c.classList.remove("shimmer");
    void c.offsetWidth;            /* restart the animation */
    c.classList.add("shimmer");
  }

  /* ---------- Lunelle vanish (optional, set per scene with vanishAfter) ---------- */
  let vanishTimer;

  function startVanishTimer() {
    clearTimeout(vanishTimer);
    const sprite = el().querySelector(".lunelle");
    if (!sprite) return;
    sprite.classList.remove("gone");
    const ms = scene().lunelle.vanishAfter;
    if (!ms) return;
    vanishTimer = setTimeout(() => sprite.classList.add("gone"), ms);
  }
  
    /* ---------- Tutorial (Scenes with a hint, once per scene per session) ---------- */
  let tutorialDone = SCENES.map(() => false), hintTimer, glowTimer, hintHide;

  function showHint(text, ms) {
    const h = el().querySelector(".hint");
    h.textContent = text;
    h.classList.add("show");
    clearTimeout(hintHide);
    if (ms) hintHide = setTimeout(() => h.classList.remove("show"), ms);
  }

  function stopTutorialTimers() {
    clearTimeout(hintTimer);
    clearTimeout(glowTimer);
  }

  function startTutorial() {
    stopTutorialTimers();
    const s = scene();
    if (!s.hint || tutorialDone[current]) return;
    hintTimer = setTimeout(() => showHint(s.hint), 2500);
    glowTimer = setTimeout(() => {
      el().querySelectorAll(".hotspot:not(.found)")
        .forEach(b => b.classList.add("hint-glow"));
    }, 8000);
  }

  function endTutorial() {
    if (tutorialDone[current] || !scene().hint) return;
    tutorialDone[current] = true;
    stopTutorialTimers();
    el().querySelectorAll(".hint-glow")
      .forEach(b => b.classList.remove("hint-glow"));
    if (scene().hint2) showHint(scene().hint2, 4500);
    else el().querySelector(".hint").classList.remove("show");
  }

  /* ---------- Petal hint (after the meter is full and the petal is still hidden) ---------- */
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
    }, 1000);                                  /* one second after the meter fills */
  }

  /* ---------- Idle reminder (every scene with hotspots) ---------- */
  let idleTimer;

  function resetIdle() {
    clearTimeout(idleTimer);
    if (current < 0) return;
    const left = el().querySelectorAll(".hotspot:not(.found)").length;
    if (!left) return;                          /* everything found, no reminder needed */
    idleTimer = setTimeout(idleNudge, IDLE_MS);
  }

  function idleNudge() {
    if (current < 0 || moving) return resetIdle();
    el().querySelectorAll(".hotspot:not(.found)").forEach(b => {
      b.classList.remove("hint-glow");
      void b.offsetWidth;                       /* restart the glow animation */
      b.classList.add("hint-glow");
    });
    if (scene().hint) showHint(scene().hint, 4500);
    resetIdle();                                /* repeat in another 30 seconds */
  }

  /* ---------- Interaction ---------- */
  function onHotspot(s, h, btn, e) {
    if (btn.classList.contains("found")) return;
    btn.classList.add("found");
    foundIds[current].push(h.id);
    const r = stage.getBoundingClientRect();
    const rip = document.createElement("div");
    rip.className = "hotspot-ripple";
    rip.style.left = ((e.clientX - r.left) / r.width * 100) + "%";
    rip.style.top = ((e.clientY - r.top) / r.height * 100) + "%";
    el().appendChild(rip);
    setTimeout(() => rip.remove(), 1300);
    courage += h.courage;
    updateMeter();
    au("discover", h.kind);
    if (courage === s.courageRequired) { au("ready"); checkPetalHint(); }
    whisper(h.whisper);
    endTutorial();
    shimmer();
    resetIdle();
    sv();
  }

  function onPetal(i, btn) {
    if (petalsGot[i]) return;
    petalsGot[i] = true;
    btn.classList.add("collected");
    au("petal");
    hidePetalHint();
    updatePetals();
    shimmer();
    resetIdle();
    sv();
  }

  /* Show saved/found state on a scene's hotspots and petal */
  function applyFound(i) {
    sceneEls[i].querySelectorAll(".hotspot").forEach(b =>
      b.classList.toggle("found", foundIds[i].includes(b.getAttribute("aria-label"))));
    petalEls[i].classList.toggle("collected", petalsGot[i]);
  }
  
    /* ---------- Navigation ---------- */
  function swap(fn) {
    if (moving) return;
    moving = true;
    fade.classList.add("on");
    setTimeout(() => {
      fn();
      fade.classList.remove("on");
      moving = false;
    }, 1200);
  }

  function goTo(i, keep) {
    swap(() => {
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
      startTutorial();
      startVanishTimer();
      resetIdle();
      checkPetalHint();
      sv();
    });
  }

  function goTitle() {
    swap(() => {
      hidePetalHint();
      stopTutorialTimers();
      clearTimeout(vanishTimer);
      clearTimeout(idleTimer);
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
    tutorialDone = SCENES.map(() => false);    /* a new journey shows the hints again */
    sceneEls.forEach((_, n) => applyFound(n));
    goTo(0);
  }

  function resume(s) {
    petalsGot = [...s.petalsGot];
    foundIds = s.foundIds.map(a => [...a]);
    courage = s.courage;
    sceneEls.forEach((_, n) => applyFound(n));
    /* earlier scenes are done; the current one is done if they already found something */
    tutorialDone = SCENES.map((_, n) => n < s.current || (n === s.current && s.foundIds[n].length > 0));
    goTo(s.current, true);
  }

  document.getElementById("btn-start").addEventListener("click", () => {
    if (typeof Save !== "undefined" && Save.has() &&
        !confirm("Begin a new journey? Your saved progress will be replaced.")) return;
    newGame();
  });
  document.getElementById("btn-settings").addEventListener("click", () => settingsPanel.classList.add("show"));
  document.getElementById("btn-credits").addEventListener("click", () => creditsPanel.classList.add("show"));

  /* Public hooks for save.js and effects.js (later Parts) */
  return {
    goTo, newGame, resume,
    getState: () => ({ current, courage, petalsGot: [...petalsGot],
                       foundIds: foundIds.map(a => [...a]) }),
    setState: s => { courage = s.courage; petalsGot = s.petalsGot; foundIds = s.foundIds; }
  };
})();
