/* PROJECT: Burrow Whispers — Book Keeper Website
   FILE: Moonlit Reverie, Lunelle's Home Region · js/panel.js
   VERSION: V1.2 · Part 1 of 1
   Lives at stories/burrow-whispers/lunelle/js/panel.js

   WHAT THIS FILE IS: behavior for reading. It holds the reading panel,
   the tap levels (read, read more, then travel), the travel stories,
   the two game routes and the clicks on the hot spots.
   It needs js/lore.js loaded first (Lunelle.P, Lunelle.GAMES,
   Lunelle.TRAVEL_FADE).

   SHARED WITH js/effects.js through window.Lunelle:
     Lunelle.panel        the panel element
     Lunelle.found        places revealed so far (found.grove)
     Lunelle.isLeaving()  true while the page is fading out to a game

   CALLED FROM js/effects.js (loaded last, defined there):
     Lunelle.markActivity()   resets the idle timer
     Lunelle.fx(id, ev)       the touch animation for a tapped spot
     Lunelle.noteVisit(id)    counts places for the memory scene
   They are looked up when a tap happens, so load order is safe. */

(function () {
  "use strict";

  var L = window.Lunelle, P = L.P, GAMES = L.GAMES;

  /* ---------- ELEMENTS AND STATE ---------- */
  var $ = function (s) { return document.querySelector(s); };
  var panel = $(".panel"), pTitle = $(".panel-title"), pText = $(".panel-text"),
      pActs = $(".panel-actions"), veil = $(".travel-veil");
  var cur = null, found = {}, leaving = false;

  L.panel = panel;
  L.found = found;
  L.isLeaving = function () { return leaving; };

  function call(name, a, b) {                      /* effects.js may not be ready; never break reading */
    if (typeof L[name] === "function") L[name](a, b);
  }

  /* ---------- THE READING PANEL (never closes by itself) ---------- */
  function openPanel(title, text, acts) {
    pTitle.textContent = title;
    pText.textContent = text;
    pActs.textContent = "";
    acts.forEach(function (x) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = x.a;
      if (x.q) b.className = "quiet";
      b.addEventListener("click", x.f);
      pActs.appendChild(b);
    });
    panel.hidden = false;
    panel.classList.remove("is-open"); void panel.offsetWidth; panel.classList.add("is-open");
    panel.tabIndex = -1; panel.focus({ preventScroll: true });
  }
  function closePanel() { panel.hidden = true; panel.classList.remove("is-open"); cur = null; }
  var back = { a: "Return", q: true, f: closePanel };

  /* ---------- TAP LEVELS: read, read more, then travel ---------- */
  function show(id, lvl) {
    var p = P[id], more = function () { show(id, lvl + 1); };
    if (lvl === 0) call("noteVisit", id);
    if (id === "grove" && !found.grove) {            /* seen, not yet reachable */
      cur = { id: id, lvl: 0 }; return openPanel(p.n, p.g, [back]);
    }
    if (p.t === "B") {                               /* notice, discover, reward */
      cur = { id: id, lvl: Math.min(lvl, 2) };
      if (lvl < 2) return openPanel(p.n, p.l[lvl], [{ a: "Continue", f: more }, back]);
      return openPanel(p.n, p.r[Math.floor(Math.random() * p.r.length)], [back]);
    }
    cur = { id: id, lvl: Math.min(lvl, 1) };         /* places and lore objects */
    if (lvl === 0) return openPanel(p.n, p.l[0], [{ a: "Continue", f: more }, back]);
    var acts = (p.o || []).map(function (o) { return { a: o.a, f: function () { run(id, o); } }; });
    openPanel(p.n, p.l[1], acts.concat(back));
  }

  function run(id, o) {
    if (o.r) found[o.r] = true;
    if (o.game) return goGame(o.game);
    if (o.to) {                                      /* travel is told as a short story */
      var v = o.v || "You make your way toward " + P[o.to].n + ", slowly, taking in everything along the way.";
      return openPanel(P[id].n, v, [{ a: "Continue", f: function () { show(o.to, 0); } }]);
    }
    openPanel(P[id].n, o.say, [{ a: "Continue", f: function () { show(id, 1); } }]);
  }

  /* ---------- GAME ROUTES (soft fade, then open) ---------- */
  function goGame(key) {
    if (leaving) return;
    leaving = true;
    veil.classList.add("is-leaving");
    setTimeout(function () { location.href = GAMES[key]; }, L.TRAVEL_FADE);
  }
  window.addEventListener("pageshow", function (e) {   /* back button returns calmly */
    if (e.persisted) { leaving = false; veil.classList.remove("is-leaving"); }
  });

  /* ---------- SPOTS ---------- */
  function onSpot(id, ev) {
    call("markActivity");
    call("fx", id, ev);
    if (leaving) return;
    if (cur && cur.id === id && !panel.hidden) show(id, cur.lvl + 1);
    else show(id, 0);
  }
  Array.prototype.forEach.call(document.querySelectorAll(".spot"), function (el) {
    var id = el.getAttribute("data-spot");
    if (P[id]) el.addEventListener("click", function (ev) { onSpot(id, ev); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) closePanel();
  });

})();