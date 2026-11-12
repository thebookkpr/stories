/*
  PROJECT: Burrow Whispers #001 — The Silver Moth
  FILE: js/save.js
  VERSION: 0.8.0
  PART: 1 of 1
  LOAD ORDER: 3rd script (after data.js and mysteries.js)
  NOTE: Saves progress in the browser (localStorage).
        If saving is blocked (private mode), the game still works,
        it just forgets when the page closes.
        v0.8.0: adds settings.guidance ("off", "gentle", "assisted").
*/

(function () {
  "use strict";

  const KEY = "bw-silver-moth-save";
  const VERSION = 1;

  const GUIDANCE_MODES = ["off", "gentle", "assisted"];

  function defaults() {
    return {
      version: VERSION,
      petals: 0,
      current: 0,            // index of the mystery in progress
      found: [],             // clue keys found in the current mystery
      introSeen: false,      // intro story shown for the current mystery
      discoveries: [],       // ids from BW.DISCOVERIES
      keepsakes: [],         // ids from BW.KEEPSAKES
      journal: [],           // ids from BW.JOURNAL
      stickers: [],          // ids from BW.STICKERS
      achievements: [],      // ids from BW.ACHIEVEMENTS
      daily: { date: "", clues: 0, claimed: false },
      settings: { guidance: "off" }   // Accessibility Discovery Mode
    };
  }

  // Local calendar day, e.g. "2026-11-09"
  function today() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  let state = defaults();

  // ---------- Load / save / reset ----------
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.version === VERSION) {
          state = Object.assign(defaults(), saved);
          state.daily = Object.assign(defaults().daily, saved.daily);
          state.settings = Object.assign(defaults().settings, saved.settings);
        }
      }
    } catch (err) {
      state = defaults();
    }
    return state;
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (err) {
      /* saving blocked: keep playing */
    }
  }

  function reset() {
    try {
      localStorage.removeItem(KEY);
    } catch (err) {
      /* nothing to remove */
    }
    state = defaults();
    return state;
  }

  // ---------- Helpers ----------
  // Adds an id to a list. Returns true only if it was new.
  function unlock(listName, id) {
    const list = state[listName];
    if (list.indexOf(id) !== -1) return false;
    list.push(id);
    save();
    return true;
  }

  function has(listName, id) {
    return state[listName].indexOf(id) !== -1;
  }

  function addPetals(amount) {
    state.petals += amount;
    save();
    return state.petals;
  }

  // ---------- Mystery progress ----------
  function recordClue(key) {
    if (state.found.indexOf(key) === -1) state.found.push(key);
    save();
  }

  function nextMystery() {
    state.current += 1;
    state.found = [];
    state.introSeen = false;
    save();
  }

  function markIntroSeen() {
    state.introSeen = true;
    save();
  }

  // ---------- Daily reward (observe 3 clues, +5 petals) ----------
  // Call once per clue found. Returns the petals earned (0 if none).
  function countDailyClue() {
    const d = state.daily;
    if (d.date !== today()) {
      d.date = today();
      d.clues = 0;
      d.claimed = false;
    }
    d.clues += 1;

    let earned = 0;
    if (!d.claimed && d.clues >= BW.DAILY.clues) {
      d.claimed = true;
      earned = BW.DAILY.petals;
      state.petals += earned;
    }
    save();
    return earned;
  }

  // ---------- Guidance setting (Accessibility Discovery Mode) ----------
  function getGuidance() {
    return state.settings.guidance;
  }

  function setGuidance(mode) {
    if (GUIDANCE_MODES.indexOf(mode) === -1) return;
    state.settings.guidance = mode;
    save();
  }

  window.BW = window.BW || {};
  BW.Save = {
    get state() { return state; },
    load: load,
    save: save,
    reset: reset,
    unlock: unlock,
    has: has,
    addPetals: addPetals,
    recordClue: recordClue,
    nextMystery: nextMystery,
    markIntroSeen: markIntroSeen,
    countDailyClue: countDailyClue,
    getGuidance: getGuidance,
    setGuidance: setGuidance
  };
})();
