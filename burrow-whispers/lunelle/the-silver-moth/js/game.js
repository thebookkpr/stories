/*
  PROJECT: Burrow Whispers #001 — The Silver Moth
  FILE: js/game.js
  VERSION: 0.1.0
  PART: 1 of 1
*/

(function () {
  "use strict";

  // ---------- Data ----------
  const CLUES = {
    reflection: "The light flickers when it moves. It does not seem like a lantern.",
    petal:      "Something delicate has landed nearby.",
    fireflies:  "Fireflies glow gold. The mysterious light shines silver.",
    moonbeam:   "The moonlight follows the light wherever it goes."
  };
  const TOTAL_CLUES = Object.keys(CLUES).length;
  const PETAL_REWARD = 100;
  const START_DISCOVERIES = 12;

  const INTRO = [
    "The moon rested quietly upon the water.",
    "As usual, Lunelle sat among the moon lotuses and listened to the sounds of the Wilds.",
    "Then she noticed something.",
    "A small silver light glimmered beyond the pond.",
    "She had never seen it before.",
    "What could it be?"
  ];

  const WALK = [
    "Lunelle took one careful step.",
    "Then another.",
    "And another.",
    "The clearing seemed much smaller than she imagined."
  ];

  // ---------- State ----------
  const found = new Set();
  let storyMode = "intro"; // "intro" | "walk"
  let revealed = false;

  // ---------- Elements ----------
  const $ = (id) => document.getElementById(id);
  const scene = $("scene");
  const storyPanel = $("story-panel");
  const storyTitle = $("story-title");
  const storyText = $("story-text");
  const storyBtn = $("story-btn");
  const popup = $("popup");
  const popupText = $("popup-text");
  const popupBadge = popup.querySelector(".clue-badge");
  const silverLight = $("silver-light");
  const moth = $("moth");
  const reward = $("reward");

  // ---------- Helpers ----------
  function showStory(title, lines, buttonLabel) {
    storyTitle.textContent = title;
    storyText.innerHTML = "";
    lines.forEach((line) => {
      const p = document.createElement("p");
      p.textContent = line;
      storyText.appendChild(p);
    });
    storyBtn.textContent = buttonLabel;
    storyPanel.hidden = false;
  }

  function showPopup(text, isClue) {
    popupText.textContent = text;
    popupBadge.hidden = !isClue;
    popup.hidden = false;
  }

  function updateClueCount() {
    $("clue-count").textContent = found.size + "/" + TOTAL_CLUES;
  }

  function makeFireflies(count) {
    const box = $("fireflies");
    for (let i = 0; i < count; i++) {
      const f = document.createElement("span");
      f.className = "firefly";
      f.style.left = 5 + Math.random() * 90 + "%";
      f.style.top = 8 + Math.random() * 70 + "%";
      f.style.animationDelay = (Math.random() * -9).toFixed(1) + "s";
      f.style.animationDuration = 6 + Math.random() * 6 + "s";
      box.appendChild(f);
    }
  }

  // ---------- Clues ----------
  function onHotspot(e) {
    const btn = e.currentTarget;
    const key = btn.dataset.clue;
    if (!CLUES[key] || found.has(key)) return;

    found.add(key);
    btn.classList.add("found");
    updateClueCount();
    showPopup(CLUES[key], true);

    if (found.size === TOTAL_CLUES) {
      silverLight.classList.add("ready");
    }
  }

  function onSilverLight() {
    if (revealed) return;
    if (found.size < TOTAL_CLUES) {
      showPopup("It's too far away to see clearly.", false);
      return;
    }
    storyMode = "walk";
    showStory("", WALK, "Continue");
  }

  // ---------- Reveal & Reward ----------
  function playReveal() {
    revealed = true;
    scene.classList.add("zoom");

    setTimeout(function () {
      silverLight.hidden = true;
      moth.hidden = false;
    }, 1800);

    setTimeout(showReward, 4600);
  }

  function showReward() {
    $("petal-amount").textContent = PETAL_REWARD;
    $("discovery-count").textContent = (START_DISCOVERIES + 1) + " Discoveries";
    reward.hidden = false;
  }

  // ---------- Events ----------
  storyBtn.addEventListener("click", function () {
    storyPanel.hidden = true;
    if (storyMode === "walk") playReveal();
  });

  $("popup-close").addEventListener("click", function () {
    popup.hidden = true;
  });

  document.querySelectorAll(".hotspot").forEach(function (h) {
    h.addEventListener("click", onHotspot);
  });

  silverLight.addEventListener("click", onSilverLight);

  $("reward-btn").addEventListener("click", function () {
    reward.hidden = true;
    scene.classList.remove("zoom");
    showPopup("Your scrapbook page is ready. It will open in a future update.", false);
  });

  $("hud-scrapbook").addEventListener("click", function () {
    showPopup("The Moonroot Scrapbook is coming soon.", false);
  });

  $("crest-menu").addEventListener("click", function () {
    showPopup("The Moon Lotus Crest menu is coming soon.", false);
  });

  // ---------- Init ----------
  makeFireflies(14);
  updateClueCount();
  $("discovery-count").textContent = START_DISCOVERIES + " Discoveries";
  showStory("Moonroot Pond", INTRO, "Investigate the Light");
})();
