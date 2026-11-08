/* Lunelle Games Menu — js/lunelle.js V1.0 · Part 1 of 1
   Lives at stories/burrow-whispers/lunelle/js/lunelle.js
   Builds the ambient effects, runs the tap flow, and opens the game.
   Timings are read from css/variables.css, so change them there.

   Flow:  Ambient -> (tap reflection) Focused -> Revealed
          -> (tap medallion) Travel -> game opens.
   Classes added to .scene: is-focused, is-revealed, is-traveling.

   Expected HTML, inside <main class="scene">:
   .stage > button.reflection-hotspot, button.medallion > span.medallion-img
   p.whisper, div.travel-veil */

(function () {
  'use strict';

  /* ---------- Settings you may want to change ---------- */
  const GAME_URL = 'one-more-little-step/index.html';
  const MOTH_COUNT = 9;
  const WHISPERS = [
    'Moonlight gathers upon still water...',
    'Something glimmers where the moon lies down.',
    'The lotus blooms keep their own quiet light.',
    'A mysterious light drifts across the pond...',
    'Perhaps it takes only one more little step.'
  ];

  /* ---------- Helpers ---------- */
  const root = document.documentElement;
  const css = (name) => getComputedStyle(root).getPropertyValue(name).trim();
  const ms = (name) => {
    const v = css(name);
    return v.endsWith('ms') ? parseFloat(v) : parseFloat(v) * 1000;
  };
  const rand = (a, b) => a + Math.random() * (b - a);
  const make = (tag, cls) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  };

  const scene     = document.querySelector('.scene');
  const stage     = document.querySelector('.stage');
  const hotspot   = document.querySelector('.reflection-hotspot');
  const medallion = document.querySelector('.medallion');
  const whisper   = document.querySelector('.whisper');
  if (!scene || !stage || !hotspot || !medallion || !whisper) return;

  let state = 'ambient';   // ambient | focused | revealed | traveling
  let focusTimer = 0, whisperTimer = 0, whisperHideTimer = 0;

  /* ---------- Ambient effects (styled in effects.css) ---------- */
  function buildAmbient() {
    ['one', 'two'].forEach((n) => stage.appendChild(make('div', 'fx-mist ' + n)));

    for (let i = 0; i < MOTH_COUNT; i++) {
      const m = make('div', 'fx-moth');
      m.style.left = rand(8, 92).toFixed(1) + '%';
      m.style.top  = rand(18, 78).toFixed(1) + '%';
      m.style.setProperty('--dur',   rand(7, 12).toFixed(1) + 's');
      m.style.setProperty('--delay', (-rand(0, 10)).toFixed(1) + 's');
      m.style.setProperty('--drift', rand(-40, 40).toFixed(0) + 'px');
      stage.appendChild(m);
    }

    stage.appendChild(make('div', 'fx-shimmer'));
    stage.appendChild(make('div', 'fx-ripple'));
    stage.appendChild(make('div', 'fx-ripple late'));
  }

  /* ---------- Idle whispers ---------- */
  let lastWhisper = -1;

  function scheduleWhisper() {
    clearTimeout(whisperTimer);
    whisperTimer = setTimeout(showWhisper,
      rand(ms('--whisper-gap-min'), ms('--whisper-gap-max')));
  }

  function showWhisper() {
    if (state !== 'ambient') return;
    let i;
    do { i = Math.floor(Math.random() * WHISPERS.length); }
    while (i === lastWhisper && WHISPERS.length > 1);
    lastWhisper = i;
    whisper.textContent = WHISPERS[i];
    whisper.classList.add('is-showing');
    whisperHideTimer = setTimeout(() => {
      whisper.classList.remove('is-showing');
      scheduleWhisper();
    }, ms('--whisper-fade') + ms('--whisper-hold'));
  }

  function stopWhispers() {
    clearTimeout(whisperTimer);
    clearTimeout(whisperHideTimer);
    whisper.classList.remove('is-showing');
  }

  /* ---------- State changes ---------- */
  function focus() {                       // first tap: the world reacts
    if (state !== 'ambient') return;
    state = 'focused';
    stopWhispers();
    scene.classList.add('is-focused');
    focusTimer = setTimeout(reveal, ms('--focus-delay'));
  }

  function reveal() {                      // the medallion rises
    if (state !== 'focused') return;
    state = 'revealed';
    scene.classList.add('is-revealed');
  }

  function backToAmbient() {               // tap the scenery to dismiss
    if (state !== 'focused' && state !== 'revealed') return;
    clearTimeout(focusTimer);
    scene.classList.remove('is-focused', 'is-revealed');
    state = 'ambient';
    scheduleWhisper();
  }

  function burstParticles() {
    medallion.querySelectorAll('.fx-particle').forEach((p) => p.remove());
    const count = parseInt(css('--particle-count'), 10) || 14;
    for (let i = 0; i < count; i++) {
      const p = make('span', 'fx-particle');
      p.style.setProperty('--angle', ((360 / count) * i + rand(-12, 12)).toFixed(0) + 'deg');
      p.style.setProperty('--dist',  rand(70, 140).toFixed(0) + 'px');
      p.style.setProperty('--delay', rand(0, 0.2).toFixed(2) + 's');
      medallion.appendChild(p);
    }
  }

  function travel() {                      // second tap: open the game
    if (state !== 'revealed') return;
    state = 'traveling';
    burstParticles();
    scene.classList.add('is-traveling');
    setTimeout(() => { window.location.href = GAME_URL; }, ms('--travel-duration'));
  }

  /* ---------- Events ---------- */
  hotspot.addEventListener('click', focus);
  medallion.addEventListener('click', travel);

  stage.addEventListener('click', (e) => {
    if (e.target.closest('.reflection-hotspot, .medallion')) return;
    backToAmbient();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') backToAmbient();
  });

  /* Coming back with the Back button: start fresh */
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    scene.classList.remove('is-traveling', 'is-focused', 'is-revealed');
    state = 'ambient';
    scheduleWhisper();
  });

  /* ---------- Start ---------- */
  buildAmbient();
  scheduleWhisper();
})();
