/* PROJECT: Book Keeper — Website
   FILE: Burrow Whispers Crossroads · js/crossroads.js
   VERSION: 1.0 · Part 1 of 1
   Lives at stories/burrow-whispers/js/crossroads.js

   What this file does:
     1. Builds the fireflies, pollen and haze inside #fx
     2. Shows a soft hint line when the visitor is idle
     3. Handles the two-stage tap: tap a place and the world answers
        (touch effect + discovery panel); the link inside the panel is
        stage two
     4. Opens the mailbox letter, the introduction to Burrow Whispers

   EDIT HERE (no other file needs to change):
     PLACES ... title, text, link label and link address for each spot
     HINTS .... the idle hint lines
     LETTER ... the mailbox letter (title, paragraphs, signature)

   A place with an empty href shows no link in its panel. Fill in the
   href when that page exists. Hot spot positions are in
   css/variables.css. */

(function () {
  'use strict';

  /* ---------- Place text and links ---------- */
  var PLACES = {
    waystone: {
      title: 'The Old Crossroads Stone',
      text: 'Stories linger here.',
      go: 'Crossroads Records',
      href: ''
    },
    pond: {
      title: 'Moonroot Pond',
      text: 'A quiet path beneath the moon.',
      go: 'Visit the pond',
      href: ''
    },
    moon: {
      title: 'The Moon Lotus Stone',
      text: 'A lotus is carved here, soft with moss. Someone sits here often.',
      go: '',
      href: ''
    },
    trail: {
      title: 'Lantern Trail',
      text: "Where tomorrow's stories begin.",
      go: 'Follow the trail',
      href: ''
    },
    hill: {
      title: 'Burrow Hill',
      text: 'Home to many friendly faces.',
      go: 'Visit the burrows',
      href: ''
    },
    clearing: {
      title: 'The Clearing',
      text: 'Tiny pawprints cross the path. Many rabbits pass through here every day.',
      go: '',
      href: ''
    },
    secret: {
      title: 'A Small Star',
      text: 'Carved long ago, and easy to miss. You looked closely.',
      go: '',
      href: ''
    }
  };

  /* Which touch effect each place uses (see css/effects.css) */
  var EFFECTS = {
    waystone: 'is-stone', pond: 'is-pond', moon: 'is-pond', trail: 'is-lantern',
    hill: 'is-hill', mailbox: 'is-mail', clearing: 'is-fern', secret: 'is-star'
  };

  /* ---------- Idle hints ---------- */
  var HINTS = [
    'Touch the stone.',
    'Something is waiting in the mailbox.',
    'Every path leads somewhere.',
    'Look closely at the roots.'
  ];

  /* ---------- The mailbox letter ---------- */
  var LETTER = {
    title: 'A Letter from the Book Keeper',
    paragraphs: [
      'Welcome to the Moonroot Wilds.',
      'This is the Crossroads, where curious rabbits pause, rest, share what they have found, and choose which path to follow next. Nothing here was built to be grand. The roots, the moss and the lanterns simply grew into a place that feels like home.',
      'Burrow Whispers is a collection of small stories about small lives. Each rabbit keeps a little courage, a little wonder, and a story worth telling. Touch the stone, wander to the pond, follow the lanterns, or visit the hill. Look closely, and you may find a secret or two.'
    ],
    sign: 'Many little lives, one shared world. ~ The Book Keeper'
  };

  /* ---------- Element lookups ---------- */
  var world = document.getElementById('world');
  var stage = document.getElementById('stage');
  var fx = document.getElementById('fx');
  var hint = document.getElementById('hint');
  var panel = document.getElementById('panel');
  var panelTitle = document.getElementById('panel-title');
  var panelText = document.getElementById('panel-text');
  var panelGo = document.getElementById('panel-go');
  var panelClose = document.getElementById('panel-close');
  var letter = document.getElementById('letter');
  var letterTitle = document.getElementById('letter-title');
  var letterBody = document.getElementById('letter-body');
  var letterSign = document.getElementById('letter-sign');
  var letterClose = document.getElementById('letter-close');
  if (!world || !fx || !panel || !letter) { return; }

  var lastFocus = null;

  /* ---------- Atmosphere ---------- */
  function rand(min, max) { return min + Math.random() * (max - min); }

  function addDrifter(kind, count, size, dur) {
    for (var i = 0; i < count; i++) {
      var el = document.createElement('span');
      el.className = kind;
      el.style.left = rand(2, 98) + '%';
      el.style.top = rand(8, 92) + '%';
      el.style.setProperty('--size', rand(size[0], size[1]).toFixed(1) + 'px');
      el.style.setProperty('--dx', rand(-50, 50).toFixed(0) + 'px');
      el.style.setProperty('--dy', rand(-90, -20).toFixed(0) + 'px');
      el.style.setProperty('--dur', rand(dur[0], dur[1]).toFixed(1) + 's');
      el.style.setProperty('--delay', (-rand(0, dur[1])).toFixed(1) + 's');
      fx.appendChild(el);
    }
  }

  function buildAtmosphere() {
    addDrifter('firefly', 16, [3, 6], [11, 20]);
    addDrifter('pollen', 22, [1.5, 3], [18, 32]);
    for (var i = 0; i < 3; i++) {
      var h = document.createElement('span');
      h.className = 'haze';
      h.style.top = (10 + i * 28) + '%';
      h.style.setProperty('--dur', (34 + i * 9) + 's');
      h.style.setProperty('--delay', (-i * 11) + 's');
      fx.appendChild(h);
    }
  }

  /* ---------- Touch effect ---------- */
  function touchEffect(id, x, y) {
    var el = document.createElement('span');
    el.className = 'fx-touch ' + (EFFECTS[id] || 'is-lantern');
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.addEventListener('animationend', function () {
      if (el.parentNode) { el.parentNode.removeChild(el); }
    });
    fx.appendChild(el);
  }

  /* ---------- Hint line ---------- */
  var hintIndex = 0;
  var hintTimer = null;
  var busy = false;

  function showHint() {
    if (busy) { hintTimer = setTimeout(showHint, 4000); return; }
    hint.textContent = HINTS[hintIndex % HINTS.length];
    hintIndex++;
    hint.classList.add('is-shown');
    hintTimer = setTimeout(function () {
      hint.classList.remove('is-shown');
      hintTimer = setTimeout(showHint, 7000);
    }, 5000);
  }

  function hideHint() { hint.classList.remove('is-shown'); }

  /* ---------- Discovery panel ---------- */
  function openPanel(id) {
    var place = PLACES[id];
    if (!place) { return; }
    panelTitle.textContent = place.title;
    panelText.textContent = place.text;
    if (place.href && place.go) {
      panelGo.textContent = place.go;
      panelGo.setAttribute('href', place.href);
    } else {
      panelGo.textContent = '';
      panelGo.removeAttribute('href');
    }
    busy = true;
    hideHint();
    world.classList.add('is-focus');
    panel.classList.add('is-open');
  }

  function closePanel() {
    panel.classList.remove('is-open');
    world.classList.remove('is-focus');
    busy = letter.classList.contains('is-open');
  }

  /* ---------- Mailbox letter ---------- */
  function buildLetter() {
    letterTitle.textContent = LETTER.title;
    letterSign.textContent = LETTER.sign;
    letterBody.textContent = '';
    LETTER.paragraphs.forEach(function (text) {
      var p = document.createElement('p');
      p.textContent = text;
      letterBody.appendChild(p);
    });
  }

  function openLetter() {
    closePanel();
    busy = true;
    hideHint();
    lastFocus = document.activeElement;
    letter.hidden = false;
    requestAnimationFrame(function () {
      letter.classList.add('is-open');
      letterClose.focus();
    });
  }

  function closeLetter() {
    letter.classList.remove('is-open');
    busy = false;
    setTimeout(function () { letter.hidden = true; }, 750);
    if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
  }

  /* ---------- Taps ---------- */
  function onHot(e) {
    var btn = e.currentTarget;
    var id = btn.getAttribute('data-id');
    var x = e.clientX, y = e.clientY;
    if (!e.clientX && !e.clientY) {          /* keyboard activation */
      var r = btn.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = r.top + r.height / 2;
    }
    touchEffect(id, x, y);
    if (id === 'mailbox') { setTimeout(openLetter, 450); return; }
    if (id === 'secret') { setTimeout(function () { openPanel(id); }, 700); return; }
    openPanel(id);
  }

  var spots = stage.querySelectorAll('.hot');
  for (var i = 0; i < spots.length; i++) {
    spots[i].addEventListener('click', onHot);
  }

  /* Tapping the open scenery, the close button or Escape closes things */
  world.addEventListener('click', function (e) {
    if (!e.target.closest('.hot')) { closePanel(); }
  });
  panelClose.addEventListener('click', closePanel);
  letterClose.addEventListener('click', closeLetter);
  letter.addEventListener('click', function (e) {
    if (e.target === letterBody || e.target === letter) { closeLetter(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') { return; }
    if (letter.classList.contains('is-open')) { closeLetter(); } else { closePanel(); }
  });

  /* ---------- Start ---------- */
  buildAtmosphere();
  buildLetter();
  hintTimer = setTimeout(showHint, 6500);   /* after the opening titles */
})();
