/*
  PROJECT: Burrow Whispers #001 — The Silver Moth
  FILE: js/scrapbook.js
  VERSION: 0.8.0
  PART: 1 of 1
  LOAD ORDER: 4th script (after save.js, before guidance.js and game.js)
  NOTE: Draws the scrapbook and the picture viewer, and handles Start Over.
        Items marked soon: true in data.js show "Coming soon".
        v0.8.0: text journal view, Save Card link, Guidance setting.
*/

(function () {
  "use strict";

  const VIEWER_CLOSE_TIME = 220;   // viewer-fade-out in effects.css
  const RESET_WAIT = 4000;         // ms the Start Over button stays armed

  const $ = (id) => document.getElementById(id);
  const scrapbook = $("scrapbook");
  const viewer = $("viewer");
  const viewerImg = $("viewer-img");
  const viewerText = $("viewer-text");
  const viewerSave = $("viewer-save");

  let viewerClosing = false;
  let resetArmed = false;
  let resetTimer = null;

  // Guidance modes (Accessibility Discovery Mode)
  const MODES = [
    { id: "off", label: "Off",
      text: "The pond guides you gently. Hints appear if you are stuck." },
    { id: "gentle", label: "Gentle",
      text: "Hotspots glow brighter and sparkle more often." },
    { id: "assisted", label: "Assisted",
      text: "Adds a faint outline, bigger touch areas, and moon dust." }
  ];

  // ---------- Rows ----------
  // kind: "card" (opens the picture), "journal" (opens the text), or null
  function nameButton(label, kind, item) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "name-btn";
    b.textContent = label;
    b.dataset.kind = kind;
    b.dataset.id = item.id;
    b.dataset.label = label;
    if (kind === "card") {
      b.dataset.image = item.card;
      b.dataset.file = fileName(item.name, item.card);
    }
    return b;
  }

  // e.g. "Silver Moon Moth" -> "burrow-whispers-silver-moon-moth-card.jpg"
  function fileName(name, src) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return "burrow-whispers-" + slug + "-card." + src.split(".").pop();
  }

  function row(item, unlocked, kind) {
    const num = item.number ? "#" + item.number + " " : "";
    const el = document.createElement("li");
    const canOpen = (kind === "card" && item.card) || (kind === "journal" && item.text);

    if (item.soon) {
      el.className = "soon";
      el.textContent = num + item.name + " — Coming soon";
    } else if (!unlocked) {
      el.className = "locked";
      el.textContent = (num + "???").trim();
    } else if (canOpen) {
      el.appendChild(nameButton(num + item.name, kind, item));
    } else {
      el.textContent = num + item.name;
    }
    return el;
  }

  function fill(ul, items, listName, kind) {
    ul.innerHTML = "";
    items.forEach(function (item) {
      const unlocked = BW.Save.has(listName, item.id);
      ul.appendChild(row(item, unlocked, kind));
    });
  }

  // ---------- Extra sections ----------
  function withCost(items) {
    return items.map(function (i) {
      return { id: i.id, soon: i.soon, name: i.name + " · " + i.cost + " petals" };
    });
  }

  function achievementItems() {
    return BW.ACHIEVEMENTS.map(function (a) {
      const done = BW.Save.has("achievements", a.id);
      return done ? Object.assign({}, a, { name: "✅ " + a.name }) : a;
    });
  }

  function renderExtras() {
    const box = $("extras");
    box.innerHTML = "";

    const sections = [
      { title: "Stickers",       items: BW.STICKERS,                list: "stickers" },
      { title: "Achievements",   items: achievementItems(),         list: "achievements" },
      { title: "Frames",         items: withCost(BW.FRAMES),        list: "frames" },
      { title: "Sticker Packs",  items: withCost(BW.STICKER_PACKS), list: "packs" },
      { title: "Journal Themes", items: withCost(BW.JOURNAL_THEMES), list: "themes" }
    ];

    sections.forEach(function (s) {
      const div = document.createElement("div");
      div.className = "extra";
      const h = document.createElement("h3");
      h.textContent = s.title;
      const ul = document.createElement("ul");
      s.items.forEach(function (item) {
        const unlocked = BW.Save.has("achievements", item.id) || BW.Save.has("stickers", item.id);
        ul.appendChild(row(item, unlocked, null));
      });
      div.appendChild(h);
      div.appendChild(ul);
      box.appendChild(div);
    });
  }

  // ---------- Guidance setting ----------
  function chooseMode(id) {
    if (BW.Guidance) BW.Guidance.setMode(id);
    else BW.Save.setGuidance(id);
    renderGuidance();
  }

  function renderGuidance() {
    const box = $("guidance-setting");
    const current = BW.Save.getGuidance();
    box.innerHTML = "";

    const h = document.createElement("h3");
    h.textContent = "Guidance";
    const p = document.createElement("p");
    const btns = document.createElement("div");
    btns.className = "mode-row";

    MODES.forEach(function (m) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "mode-btn" + (m.id === current ? " on" : "");
      b.dataset.mode = m.id;
      b.textContent = m.label;
      b.setAttribute("aria-pressed", m.id === current ? "true" : "false");
      btns.appendChild(b);
      if (m.id === current) p.textContent = m.text;
    });

    box.appendChild(h);
    box.appendChild(p);
    box.appendChild(btns);
  }

  // ---------- Render / open / close ----------
  function render() {
    fill($("discovery-list"), BW.DISCOVERIES, "discoveries", "card");
    fill($("keepsake-list"),  BW.KEEPSAKES,   "keepsakes",   "card");
    fill($("journal-list"),   BW.JOURNAL,     "journal",     "journal");
    renderExtras();
    renderGuidance();

    const n = BW.Save.state.discoveries.length;
    $("petal-total").textContent = BW.Save.state.petals;
    $("discovery-count").textContent = n + (n === 1 ? " Discovery" : " Discoveries");
  }

  function open() {
    render();
    scrapbook.hidden = false;
  }

  function close() {
    disarmReset();
    scrapbook.hidden = true;
    const after = api.onClose;      // one-time callback (game.js sets it)
    api.onClose = null;
    if (after) after();
  }

  // ---------- Viewer (a card with Save Card, or a journal entry as text) ----------
  function openViewer(opts) {
    if (viewerClosing) return;
    if (opts.text) {
      viewerText.innerHTML = "";
      const h = document.createElement("h3");
      h.textContent = opts.title;
      viewerText.appendChild(h);
      opts.text.forEach(function (line) {
        const p = document.createElement("p");
        p.textContent = line;
        viewerText.appendChild(p);
      });
      viewerText.hidden = false;
      viewerImg.hidden = true;
      viewerSave.hidden = true;
    } else {
      viewerImg.src = opts.src;
      viewerImg.alt = opts.alt || "";
      viewerImg.hidden = false;
      viewerText.hidden = true;
      viewerSave.href = opts.src;
      viewerSave.setAttribute("download", opts.file || "card.jpg");
      viewerSave.hidden = false;
    }
    viewer.classList.remove("closing");
    viewer.hidden = false;
  }

  function closeViewer() {
    if (viewer.hidden || viewerClosing) return;
    viewerClosing = true;
    viewer.classList.add("closing");
    setTimeout(function () {
      viewer.hidden = true;
      viewer.classList.remove("closing");
      viewerImg.src = "";
      viewerText.innerHTML = "";
      viewerClosing = false;
    }, VIEWER_CLOSE_TIME);
  }

  // ---------- Start Over (two taps so it can't happen by accident) ----------
  function disarmReset() {
    resetArmed = false;
    clearTimeout(resetTimer);
    $("start-over").textContent = "Start Over";
  }

  function onStartOver() {
    if (!resetArmed) {
      resetArmed = true;
      $("start-over").textContent = "Tap again to erase everything";
      resetTimer = setTimeout(disarmReset, RESET_WAIT);
      return;
    }
    BW.Save.reset();
    location.reload();
  }

  // ---------- Events ----------
  $("hud-scrapbook").addEventListener("click", open);
  $("crest-menu").addEventListener("click", open);
  $("book-close").addEventListener("click", close);
  $("start-over").addEventListener("click", onStartOver);

  $("guidance-setting").addEventListener("click", function (e) {
    const b = e.target.closest(".mode-btn");
    if (b) chooseMode(b.dataset.mode);
  });

  scrapbook.addEventListener("click", function (e) {
    const btn = e.target.closest(".name-btn");
    if (!btn) return;
    if (btn.dataset.kind === "journal") {
      const j = BW.JOURNAL.find((i) => i.id === btn.dataset.id);
      if (j && j.text) openViewer({ title: j.name, text: j.text });
    } else if (btn.dataset.image) {
      openViewer({ src: btn.dataset.image, alt: btn.dataset.label,
                   file: btn.dataset.file });
    }
  });

  viewer.addEventListener("click", function (e) {
    if (e.target.closest("#viewer-save")) return;   // let the download happen
    closeViewer();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeViewer();
  });

  window.BW = window.BW || {};
  const api = { open: open, close: close, render: render, onClose: null };
  BW.Scrapbook = api;
})();
