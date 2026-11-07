/* Burrow Whispers About Page: mailbox.js V1.0 · Part 1 of 1
   Lives at stories/burrow-whispers/about/js/mailbox.js
   Tap the paper: it shrinks into the mailbox.
   Tap the mailbox: the paper grows back out of it.
   The animation itself lives in css/base.css (.paper.is-away).
   This script only toggles classes and measures the flight distance.
   Needs in index.html: an element .paper and a button #mailbox.
   Load with: <script src="./js/mailbox.js" defer></script> */

(function () {
  "use strict";

  const paper   = document.querySelector(".paper");
  const mailbox = document.getElementById("mailbox");
  if (!paper || !mailbox) return;

  let away = false;

  /* ---------- Measure the flight from paper to mailbox ---------- */
  /* Uses layout offsets, which ignore transforms, so the answer is the
     same whether the paper is showing or tucked away. */
  function measureShift() {
    const page = paper.offsetParent || document.body;
    const pr   = page.getBoundingClientRect();
    const mr   = mailbox.getBoundingClientRect();

    const paperX = pr.left + paper.offsetLeft + paper.offsetWidth  / 2;
    const paperY = pr.top  + paper.offsetTop  + paper.offsetHeight / 2;
    const boxX   = mr.left + mr.width  / 2;
    const boxY   = mr.top  + mr.height / 2;

    paper.style.setProperty("--mailbox-shift-x", Math.round(boxX - paperX) + "px");
    paper.style.setProperty("--mailbox-shift-y", Math.round(boxY - paperY) + "px");
  }

  /* ---------- States ---------- */
  function tuckAway() {
    if (away) return;
    away = true;
    measureShift();                       /* measure before it moves */
    paper.classList.add("is-away");
    paper.setAttribute("aria-hidden", "true");
    paper.tabIndex = -1;
    mailbox.classList.add("has-mail");
    mailbox.setAttribute("aria-label", "Mailbox. Open it to bring back the note.");
    mailbox.focus({ preventScroll: true });
  }

  function bringBack() {
    if (!away) return;
    away = false;
    measureShift();                       /* the page may have scrolled */
    paper.classList.remove("is-away");
    paper.removeAttribute("aria-hidden");
    paper.tabIndex = 0;
    mailbox.classList.remove("has-mail");
    mailbox.setAttribute("aria-label", "Mailbox. The note is out on the page.");
    paper.focus({ preventScroll: true });
  }

  /* ---------- Paper: tap, Enter or Space ---------- */
  paper.setAttribute("role", "button");
  paper.setAttribute("aria-label", "About Burrow Whispers. Tap to tuck it into the mailbox.");
  paper.tabIndex = 0;

  paper.addEventListener("click", tuckAway);
  paper.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      tuckAway();
    }
  });

  /* ---------- Mailbox: tap brings the paper back ---------- */
  mailbox.setAttribute("aria-label", "Mailbox. The note is out on the page.");
  mailbox.addEventListener("click", bringBack);

  /* ---------- Keep the measurement fresh ---------- */
  let queued = false;
  function refresh() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      queued = false;
      measureShift();
    });
  }
  window.addEventListener("resize", refresh);
  window.addEventListener("orientationchange", refresh);
  window.addEventListener("scroll", refresh, { passive: true });
  window.addEventListener("load", measureShift);

  measureShift();
})();
