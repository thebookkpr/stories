/*
  PROJECT: Burrow Whispers #001 — The Silver Moth
  FILE: js/scrapbook.js
  VERSION: 0.6.0
  PART: 1 of 1
  LOAD ORDER: 4th script (after save.js, before game.js)
  NOTE: Draws the scrapbook and the picture viewer, and handles Start Over.
        Items marked soon: true in data.js show "Coming soon".
*/

(function () {
  "use strict";

  const VIEWER_CLOSE_TIME = 220;   // viewer-fade-out in effects.css
  const RESET_WAIT = 4000;         // ms the Start Over button stays armed

  const $ = (id) => document.getElementById(id);
  const scrapbook = $("scrapbook");
  const viewer = $("viewer");
  const viewerImg = $("viewer-img");

  let viewerClosing = false;
  let resetArmed = false;
  let resetTimer = null;

  // ---------- Rows ----------
  function nameButton(label, image) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "name-btn";
    b.textContent = label;
    b.dataset.image = image;
    b.dataset.alt = label;
    return b;
  }

  function row(item, unlocked, image) {
    const num = item.number ? "#" + item.number + " " : "";
    const el = document.createElement("li");

    if (item.soon) {
      el.className = "soon";
      el.textContent = num + item.name + " — Coming soon";
    } else if (!unlocked) {
      el.className = "locked";
      el.textContent = (num + "???").trim();
    } else if (image) {
      el.appendChild(nameButton(num + item.name, image));
    } else {
      el.textContent = num + item.name;
    }
    return el;
  }

  function fill(ul, items, listName, imageOf) {
    ul.innerHTML = "";
    items.forEach(function (item) {
      const unlocked = BW.Save.has(listName, item.id);
      ul.appendChild(row(item, unlocked, imageOf ? imageOf(item) : null));
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

  // ---------- Render / open / close ----------
  function render() {
    fill($("discovery-list"), BW.DISCOVERIES, "discoveries", (i) => i.card);
    fill($("keepsake-list"),  BW.KEEPSAKES,   "keepsakes",   (i) => i.card);
    fill($("journal-list"),   BW.JOURNAL,     "journal",     (i) => i.image);
    renderExtras();

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

  // ---------- Viewer ----------
  function openViewer(src, alt) {
    if (viewerClosing) return;
    viewerImg.src = src;
    viewerImg.alt = alt || "";
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

  scrapbook.addEventListener("click", function (e) {
    const btn = e.target.closest(".name-btn");
    if (btn && btn.dataset.image) openViewer(btn.dataset.image, btn.dataset.alt);
  });

  viewer.addEventListener("click", closeViewer);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeViewer();
  });

  window.BW = window.BW || {};
  const api = { open: open, close: close, render: render, onClose: null };
  BW.Scrapbook = api;
})();
