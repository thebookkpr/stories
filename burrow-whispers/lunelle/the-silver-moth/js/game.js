/*
  PROJECT: Burrow Whispers #001 — The Silver Moth
  FILE: js/game.js
  VERSION: 0.3.0
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

  // Timings (ms). Keep in sync with variables.css
  const PETAL_POPUP_DELAY = 900;   // clue text appears while the petal drifts away
  const PETAL_FX_TIME = 1600;      // matches --petal-time
  const REWARD_DELAY = 3200;       // moth grows (1.4s), hovers a moment, then rewards

  const DISCOVERIES = [
    { id: "moth",    label: "#001 Silver Moon Moth" },
    { id: "frog",    label: "#002 Moon Frog" },
    { id: "seed",    label: "#003 Lantern Seed" },
    { id: "pearl",   label: "#004 Pond Pearl" },
    { id: "cricket", label: "#005 Nightfire Cricket" }
  ];

  const KEEPSAKES = [
    { id: "petal",   label: "#001 Moon Petal" },
    { id: "lotus",   label: "#002 Pressed Moon Lotus" },
    { id: "acorn",   label: "#003 Acorn Charm" },
    { id: "ribbon",  label: "#004 Silver Ribbon" },
    { id: "key",     label: "#005 Lantern Key" }
  ];

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
  const unlockedDiscoveries = new Set();
  const unlockedKeepsakes = new Set();
  let petals = 0;
  let journalUnlocked = false;
  let storyMode = "intro"; // "intro" | "walk"
  let revealed = false;

  // ---------- Elements ----------
  const $ = (id) => document.getElementById(id);
  const storyPanel = $("story-panel");
  const storyTitle = $("story-title");
  const storyText = $("story-text");
  const storyBtn = $("story-btn");
  const popup = $("popup");
  const popupText = $("popup-text");
  const popupBadge = popup.querySelector(".clue-badge");
  const silverLight = $("silver-light");
  const moth = $("moth");
  const petalFx = $("petal-fx");
  const reward = $("reward");
  const scrapbook = $("scrapbook");

  // ---------- Helpers ----------
  function showStory(title, lines, buttonLabel) {
    storyTitle.textContent = title;
    storyTitle.hidden = !title;
    storyText.innerHTML = "";
    lines.forEach(function (line) {
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

  // ---------- Scrapbook ----------
  function fillList(listId, items, unlocked) {
    const ul = $(listId);
    ul.innerHTML = "";
    items.forEach(function (item) {
      const li = document.createElement("li");
      if (unlocked.has(item.id)) {
        li.textContent = item.label;
      } else {
        li.textContent = item.label.split(" ")[0] + " ???";
        li.className = "locked";
      }
      ul.appendChild(li);
    });
  }

  function renderScrapbook() {
    fillList("discovery-list", DISCOVERIES, unlockedDiscoveries);
    fillList("keepsake-list", KEEPSAKES, unlockedKeepsakes);
    $("petal-total").textContent = petals;
    $("journal-section").classList.toggle("locked", !journalUnlocked);
    $("discovery-count").textContent =
      unlockedDiscoveries.size + (unlockedDiscoveries.size === 1 ? " Discovery" : " Discoveries");
  }

  function openScrapbook() {
    renderScrapbook();
    scrapbook.hidden = false;
  }

  // ---------- Petal animation (clue only, not collected) ----------
  function playPetalFx() {
    petalFx.hidden = false;
    setTimeout(function () {
      petalFx.hidden = true;
    }, PETAL_FX_TIME + 100);
  }

  // ---------- Clues ----------
  function onHotspot(e) {
    const btn = e.currentTarget;
    const key = btn.dataset.clue;
    if (!CLUES[key] || found.has(key)) return;

    found.add(key);
    btn.classList.add("found");
    updateClueCount();

    let text = CLUES[key];
    if (found.size === TOTAL_CLUES) {
      silverLight.classList.add("ready");
      text += " Lunelle gathers her courage. Perhaps it's time to look at the silver light again.";
    }

    if (key === "petal") {
      playPetalFx();
      setTimeout(function () { showPopup(text, true); }, PETAL_POPUP_DELAY);
    } else {
      showPopup(text, true);
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
    silverLight.hidden = true;
    moth.hidden = false;           // grows into view (effects.css)
    setTimeout(showReward, REWARD_DELAY);
  }

  function showReward() {
    unlockedDiscoveries.add("moth");
    unlockedKeepsakes.add("petal");
    journalUnlocked = true;
    petals += PETAL_REWARD;

    $("petal-amount").textContent = PETAL_REWARD;
    renderScrapbook();
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
    openScrapbook();
  });

  $("hud-scrapbook").addEventListener("click", openScrapbook);
  $("crest-menu").addEventListener("click", openScrapbook);
  $("book-close").addEventListener("click", function () {
    scrapbook.hidden = true;
  });

  // ---------- Init ----------
  makeFireflies(14);
  updateClueCount();
  renderScrapbook();
  showStory("Moonroot Pond", INTRO, "Investigate the Light");
})();
