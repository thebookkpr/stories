/* PROJECT: Book Keeper — Website
   SUBTITLE: BURROW WHISPERS — CROSSROADS
   FILE: Burrow Whispers Crossroads · js/crossroads.js
   VERSION: 1.3 · Part 1 of 1
   Location: https://thebookkpr.github.io/stories/burrow-whispers/
   Lives at stories/burrow-whispers/js/crossroads.js

   Everything here is built around the hot spots (positions are in
   css/variables.css). Each hot spot has:
     - a place card (title, text, link label, link address)
     - a touch effect (css/effects.css)
     - an idle hint line, which also plays that spot's glow

   Tap logic:  tap once = the world answers and a card appears
               tap the link in the card = travel
               tap empty scenery = the world still answers softly

   EDIT HERE (no other file needs to change):
     LUNELLE_URL ... address of Lunelle's game (pond, moon stone)
     SECRET_URL .... optional: send the hidden star to a page instead
     PLACES ........ card text and links
     HINT_ORDER .... which spots whisper while idle
     LETTER ........ the mailbox introduction
     SECRET ........ the page the hidden star opens
   A place with an empty href shows its card without a link.
   A place with a messages list shows the next message on each tap. */

(function () {
  'use strict';

  /* ---------- Addresses ---------- */
  var LUNELLE_URL = 'https://thebookkpr.github.io/stories/burrow-whispers/lunelle/index.html';
  var SECRET_URL  = '';   /* optional */

  /* ---------- Places ---------- */
  var PLACES = {
    waystone: {
      title: 'The Crossroads Stone',
      messages: [
        'Many journeys begin here.',
        "The lotus is Lunelle's favorite carving.",
        'Bramble always stops to look at the fern.',
        'Piperberry likes the little blossom best.',
        'The lantern is for finding the way.',
        'The star is for what comes next.',
        'Moss has grown in every groove. Nobody minds.'
      ],
      go: '', href: '',
      hint: 'The old waystone remembers many journeys...'
    },
    pond: {
      title: 'Moonroot Pond',
      text: 'A quiet pond shines beneath the moon.\nSomeone often visits here at night.',
      go: 'Explore →', href: LUNELLE_URL,
      hint: 'A faint glow shimmers across the pond...'
    },
    moon: {
      title: 'Moon Lotus',
      text: 'Some journeys begin with a single step.',
      go: 'Explore →', href: LUNELLE_URL
    },
    trail: {
      title: 'Lantern Trail',
      text: "Where tomorrow's stories begin.",
      go: 'Follow →', href: '',
      hint: 'A lantern-lit trail disappears beneath the roots...'
    },
    hill: {
      title: 'Burrow Hill',
      text: 'Warm lights glow behind round doors.\nMany little lives call this place home.',
      go: 'Visit →', href: '',
      hint: 'Warm lights flicker among the hillside burrows...'
    },
    clearing: {
      title: 'The Clearing',
      text: 'Tiny pawprints cross the path.\nMany rabbits pass through here every day.',
      go: '', href: ''
    },
    mailbox: { hint: 'Something waits in the old mailbox...' }
  };

  var HINT_ORDER = ['pond', 'hill', 'waystone', 'trail', 'mailbox'];

  var EFFECTS = {
    waystone: 'is-stone', pond: 'is-pond', moon: 'is-pond', trail: 'is-lantern',
    hill: 'is-hill', mailbox: 'is-mail', clearing: 'is-fern', secret: 'is-star'
  };

  /* ---------- Letters ---------- */
  var LETTER = {
    title: 'A Letter from the Book Keeper',
    paragraphs: [
      'Welcome to the Moonroot Wilds.',
      'This is the Crossroads, where curious rabbits pause, rest, share what they have found, and choose which path to follow next. Nothing here was built to be grand. The roots, the moss and the lanterns simply grew into a place that feels like home.',
      'Burrow Whispers is a collection of small stories about small lives. Each rabbit keeps a little courage, a little wonder, and a story worth telling. Touch the stone, wander to the pond, follow the lanterns, or visit the hill. Look closely, and you may find a secret or two.'
    ],
    sign: 'Many little lives, one shared world. ~ The Book Keeper'
  };

  var SECRET = {
    title: 'A Page Between the Roots',
    paragraphs: [
      'You found the star.',
      'Few visitors look this closely. Some secrets are only kept for the curious.'
    ],
    sign: '~ The Book Keeper'
  };

  /* ---------- Elements ---------- */
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
  if (!world || !stage || !fx || !panel || !letter) { return; }

  var SHRUNK = 'translate(-50%, -50%) scale(0.05)';
  var lastFocus = null;
  var busy = false;
  var messageIndex = {};

  function rand(min, max) { return min + Math.random() * (max - min); }
  function hot(id) { return stage.querySelector('.hot[data-id="' + id + '"]'); }

  /* ---------- Atmosphere ---------- */
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

  /* ---------- Touch effect and hot spot glow ---------- */
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

  function glowSpot(id) {
    var btn = hot(id);
    if (!btn) { return; }
    var r = btn.getBoundingClientRect();
    touchEffect(id, r.left + r.width / 2, r.top + r.height / 2);
  }

  /* ---------- Idle hints: every 8 to 12 seconds ---------- */
  var hintIndex = 0;

  function hideHint() { hint.classList.remove('is-shown'); }

  function whisper() {
    var wait = rand(8000, 12000);
    if (!busy && !document.hidden) {
      var id = HINT_ORDER[hintIndex % HINT_ORDER.length];
      hintIndex++;
      hint.textContent = PLACES[id].hint;
      hint.classList.add('is-shown');
      glowSpot(id);
      setTimeout(hideHint, 5000);
    }
    setTimeout(whisper, wait);
  }

  /* ---------- Place card (stage 1) ---------- */
  function setLines(el, text) {
    el.textContent = '';
    text.split('\n').forEach(function (line, i) {
      if (i) { el.appendChild(document.createElement('br')); }
      el.appendChild(document.createTextNode(line));
    });
  }

  function cardText(id, p) {
    if (!p.messages) { return p.text; }
    var n = messageIndex[id] || 0;
    messageIndex[id] = n + 1;
    return p.messages[n % p.messages.length];
  }

  function openPanel(id) {
    var p = PLACES[id];
    if (!p) { return; }
    panelTitle.textContent = p.title;
    setLines(panelText, cardText(id, p));
    if (p.href && p.go) {
      panelGo.textContent = p.go;
      panelGo.setAttribute('href', p.href);
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

  /* ---------- Letters: grow from the spot, shrink back into it ---------- */
  function fillLetter(c) {
    letterTitle.textContent = c.title;
    letterSign.textContent = c.sign;
    letterBody.textContent = '';
    c.paragraphs.forEach(function (text) {
      var p = document.createElement('p');
      p.textContent = text;
      letterBody.appendChild(p);
    });
  }

  function openLetter(c, fromId) {
    closePanel();
    busy = true;
    hideHint();
    lastFocus = document.activeElement;
    fillLetter(c);
    letter.hidden = false;

    var origin = '50% 50%', btn = fromId && hot(fromId);
    if (btn) {
      var r = btn.getBoundingClientRect();
      var left = (window.innerWidth - letter.offsetWidth) / 2;
      var top = (window.innerHeight - letter.offsetHeight) / 2;
      origin = (r.left + r.width / 2 - left) + 'px ' + (r.top + r.height / 2 - top) + 'px';
    }
    letter.style.transformOrigin = origin;
    letter.style.transition = 'none';
    letter.style.transform = SHRUNK;
    void letter.offsetWidth;                 /* lock in the small start */
    letter.style.transition = '';
    letter.style.transform = '';
    letter.classList.add('is-open');
    letterClose.focus();
  }

  function closeLetter() {
    letter.style.transform = SHRUNK;
    letter.classList.remove('is-open');
    busy = false;
    setTimeout(function () {
      letter.hidden = true;
      letter.style.transform = '';
    }, 750);
    if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
  }

  /* ---------- Taps ---------- */
  function onHot(e) {
    var btn = e.currentTarget;
    var id = btn.getAttribute('data-id');
    var x = e.clientX, y = e.clientY;
    if (!x && !y) {                          /* keyboard activation */
      var r = btn.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = r.top + r.height / 2;
    }
    touchEffect(id, x, y);

    if (id === 'mailbox') {
      setTimeout(function () { openLetter(LETTER, 'mailbox'); }, 450);
    } else if (id === 'secret') {
      setTimeout(function () {
        if (SECRET_URL) { window.location.href = SECRET_URL; }
        else { openLetter(SECRET, 'secret'); }
      }, 800);
    } else {
      openPanel(id);
    }
  }

  var spots = stage.querySelectorAll('.hot');
  for (var i = 0; i < spots.length; i++) {
    spots[i].addEventListener('click', onHot);
  }

  /* Empty scenery: close any card, and let the world answer softly */
  world.addEventListener('click', function (e) {
    if (e.target.closest('.hot')) { return; }
    closePanel();
    touchEffect('clearing', e.clientX, e.clientY);
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
  setTimeout(whisper, 6500);                 /* after the opening titles */
})();
