/* Burrow Whispers Crossroads: js/crossroads.js V1.0 · Part 1 of 1
   Lives at stories/burrow-whispers/js/crossroads.js
   Pairs with index.html V1.9, variables.css V2.0, base.css V2.1, effects.css V2.0.
   Section 1: places (edit text and links here).
   Section 2: behaviour (two-stage tap, idle hints, secret, dust). */

/* ============ SECTION 1: PLACES ============
   id      matches data-id on the hot spot buttons in index.html
   title   panel heading
   text    panel flavour text (\n makes a line break)
   go      the button words
   url     where stage 2 travels to; null = no button yet
   lights  which hot spots glow when this place is noticed
   hint    idle line at the bottom (null = never hinted)
   To open a place later: change its url from null to a folder. */
const PLACES = {
  pond: {
    title: "Moonroot Pond",
    text: "A quiet pond shines beneath the moon.\nSomeone often visits here at night.",
    go: "Explore →",
    url: "lunelle/",
    lights: ["pond", "moon"],
    hint: "A faint glow shimmers across the pond..."
  },
  waystone: {
    title: "The Crossroads Stone",
    text: "Many journeys begin here.",
    go: "Read More →",
    url: null,
    lights: ["waystone"],
    hint: "The old waystone remembers many journeys..."
  },
  trail: {
    title: "The Lantern Trail",
    text: "A lantern-lit path disappears beneath the roots.\nIt has not been walked yet.",
    go: "Follow →",
    url: null,
    lights: ["trail"],
    hint: "A lantern-lit trail disappears beneath the roots..."
  },
  hill: {
    title: "Burrow Hill",
    text: "Warm lights glow behind round doors.\nMany little lives call this place home.",
    go: "Visit →",
    url: null,
    lights: ["hill"],
    hint: "Warm lights flicker among the hillside burrows..."
  },
  clearing: {
    title: "The Clearing",
    text: "Paw prints wander down the path.\nWhat is Burrow Whispers?",
    go: "Learn More →",
    url: "about/",
    lights: ["clearing"],
    hint: null
  }
};

/* A tap on the moon counts as a tap on the pond */
const ALIASES = { moon: "pond" };

/* Hints that light nothing */
const GENERAL_HINTS = [
  "Not every secret path is obvious.",
  "The Wilds reward curious travelers."
];

/* Order the place hints appear in */
const HINT_ORDER = ["pond", "hill", "waystone", "trail"];

/* The secret: set a folder (e.g. "secret/") to make it open something */
const SECRET_URL = null;

/* Opening titles finish at this many milliseconds (matches base.css) */
const INTRO_MS = 14000;


/* ============ SECTION 2: BEHAVIOUR ============ */

const $ = (id) => document.getElementById(id);
const rand = (a, b) => a + Math.random() * (b - a);
const el = (tag, cls) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  return n;
};

const stage      = $("stage");
const fx         = $("fx");
const hintEl     = $("hint");
const panel      = $("panel");
const panelTitle = $("panel-title");
const panelText  = $("panel-text");
const panelGo    = $("panel-go");
const panelClose = $("panel-close");

let openKey = null;       /* place shown in the panel */
let hintTimer = null;     /* waits before the next hint */
let hideTimer = null;     /* hides the hint that is showing */
const introEnd = performance.now() + INTRO_MS;

/* ---------- Light ---------- */
function clearLit() {
  stage.querySelectorAll(".hot.lit").forEach((n) => n.classList.remove("lit"));
}
function setLit(ids) {
  clearLit();
  ids.forEach((id) => {
    const n = stage.querySelector('.hot[data-id="' + id + '"]');
    if (n) n.classList.add("lit");
  });
}

/* ---------- Stage 1: discovery panel ---------- */
function openPlace(key) {
  const realKey = ALIASES[key] || key;
  const place = PLACES[realKey];
  if (!place) return;

  stopHints();
  openKey = realKey;

  panelTitle.textContent = place.title;
  panelText.textContent = "";
  place.text.split("\n").forEach((line, i) => {
    if (i) panelText.appendChild(document.createElement("br"));
    panelText.appendChild(document.createTextNode(line));
  });

  if (place.url) {                       /* stage 2 is only this button */
    panelGo.href = place.url;
    panelGo.textContent = place.go;
    panelGo.style.display = "";
  } else {
    panelGo.removeAttribute("href");
    panelGo.style.display = "none";
  }

  setLit(place.lights);
  panel.classList.add("open");
}

function closePanel() {
  if (!openKey) return;
  openKey = null;
  panel.classList.remove("open");
  clearLit();
  startHints();
}

/* ---------- Taps ---------- */
stage.querySelectorAll(".hot").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const id = btn.dataset.id;
    if (id === "secret") return openSecret(btn);
    openPlace(id);
  });
});
stage.addEventListener("click", closePanel);
panelClose.addEventListener("click", closePanel);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePanel();
});

/* Coming back with the Back button: start fresh */
window.addEventListener("pageshow", () => {
  openKey = null;
  panel.classList.remove("open");
  clearLit();
  startHints();
});

/* ---------- The secret ---------- */
function openSecret(btn) {
  if (SECRET_URL) {
    window.location.href = SECRET_URL;
    return;
  }
  /* Nothing to open yet: a few motes drift up, then quiet */
  const r = btn.getBoundingClientRect();
  for (let i = 0; i < 6; i++) {
    const m = el("div", "mote");
    m.style.left = (r.left + r.width * rand(0.25, 0.75)).toFixed(0) + "px";
    m.style.top = (r.top + r.height * rand(0.3, 0.8)).toFixed(0) + "px";
    m.style.setProperty("--dur", rand(2.2, 3.6).toFixed(1) + "s");
    m.style.setProperty("--delay", rand(0, 0.5).toFixed(2) + "s");
    m.style.setProperty("--drift", rand(-24, 24).toFixed(0) + "px");
    m.style.animationIterationCount = "1";
    m.style.animationFillMode = "forwards";
    m.addEventListener("animationend", () => m.remove());
    fx.appendChild(m);
  }
}

/* ---------- Idle hints: one line every 8 to 12 seconds ---------- */
const HINTS = HINT_ORDER
  .filter((k) => PLACES[k] && PLACES[k].hint)
  .map((k) => ({ text: PLACES[k].hint, lights: PLACES[k].lights }))
  .concat(GENERAL_HINTS.map((t) => ({ text: t, lights: [] })));
let hintIndex = 0;

function stopHints() {
  clearTimeout(hintTimer);
  clearTimeout(hideTimer);
  hintEl.classList.remove("show");
}

function scheduleHint(delay) {
  clearTimeout(hintTimer);
  hintTimer = setTimeout(showHint, delay);
}

function showHint() {
  if (openKey || document.hidden || !HINTS.length) {
    return scheduleHint(rand(8000, 12000));
  }
  const h = HINTS[hintIndex % HINTS.length];
  hintIndex++;

  hintEl.textContent = h.text;
  hintEl.classList.add("show");
  if (h.lights.length) setLit(h.lights);

  hideTimer = setTimeout(() => {
    hintEl.classList.remove("show");
    if (!openKey) clearLit();
    scheduleHint(rand(8000, 12000));
  }, 5200);
}

/* The first hint waits until the opening titles are finished */
function startHints() {
  stopHints();
  const wait = Math.max(rand(3500, 5500), introEnd - performance.now() + 1500);
  scheduleHint(wait);
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopHints();
  else if (!openKey) startHints();
});

/* ---------- Firefly dust and haze (styles in effects.css) ---------- */
fx.append(el("div", "haze one"), el("div", "haze two"));
for (let i = 0; i < 16; i++) {
  const m = el("div", "mote");
  m.style.left = rand(5, 95).toFixed(1) + "%";
  m.style.top = rand(10, 90).toFixed(1) + "%";
  m.style.setProperty("--dur", rand(5, 9).toFixed(1) + "s");
  m.style.setProperty("--delay", (-rand(0, 9)).toFixed(1) + "s");
  m.style.setProperty("--drift", rand(-30, 30).toFixed(0) + "px");
  fx.appendChild(m);
}

/* ---------- Begin ---------- */
startHints();
