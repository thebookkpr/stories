/*
  PROJECT: Burrow Whispers #001 — The Silver Moth
  FILE: js/game.js
  VERSION: 0.6.0
  PART: 1 of 1
  LOAD ORDER: 5th script (last)
  NOTE: Runs the mysteries in order. Content is in mysteries.js,
        items and rewards in data.js, saving in save.js.
*/

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const S = BW.Save;

  // Timings (ms). Keep in sync with variables.css / effects.css
  const CONTINUE_DELAY = 1000;
  const PETAL_POPUP_DELAY = 900;
  const PETAL_FX_TIME = 1600;
  const REWARD_DELAY = 3200;

  // Journal lines shown on the reward screen (more come with their art)
  const JOURNAL_TEXT = {
    moth: ["Sometimes courage doesn't roar.",
           "Sometimes it simply takes one more little step."]
  };

  // ---------- State ----------
  let mystery = null;
  let mode = "intro";       // "intro" | "walk" | "done"
  let revealed = false;
  let waiting = false;      // true while the petal animation plays
  let continueTimer = null;

  // ---------- Elements ----------
  const storyPanel = $("story-panel"), storyTitle = $("story-title");
  const storyText = $("story-text"), storyBtn = $("story-btn");
  const dialog = $("clue-dialog"), dialogTitle = $("dialog-title");
  const dialogText = $("dialog-text"), dialogProgress = $("dialog-progress");
  const dialogBtn = $("dialog-btn");
  const silverLight = $("silver-light"), moth = $("moth"), petalFx = $("petal-fx");
  const reward = $("reward");

  // ---------- Helpers ----------
  const disc = () => BW.DISCOVERIES.find((d) => d.id === mystery.id);
  const total = () => mystery.clues.length;
  const allFound = () => S.state.found.length >= total();

  function showStory(title, lines, label) {
    storyTitle.textContent = title;
    storyTitle.hidden = !title;
    storyText.innerHTML = "";
    lines.forEach(function (line) {
      const p = document.createElement("p");
      p.textContent = line;
      storyText.appendChild(p);
    });
    storyBtn.textContent = label;
    storyPanel.hidden = false;
  }

  function updateClueCount() {
    $("clue-count").textContent = S.state.found.length + "/" + total();
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

  // ---------- Bottom dialog (Continue appears after a short delay) ----------
  function showDialog(title, text, showProgress) {
    clearTimeout(continueTimer);
    dialogBtn.classList.remove("ready");
    dialogTitle.textContent = title;
    dialogText.textContent = text;
    dialogProgress.hidden = !showProgress;
    dialogProgress.textContent =
      "Clues Found: " + S.state.found.length + " / " + total();
    dialog.hidden = false;
    waiting = false;
    continueTimer = setTimeout(function () {
      dialogBtn.classList.add("ready");
    }, CONTINUE_DELAY);
  }

  function closeDialog() {
    clearTimeout(continueTimer);
    dialogBtn.classList.remove("ready");
    dialog.hidden = true;
  }

  // ---------- Scene ----------
  function buildScene() {
    const box = $("hotspots");
    box.innerHTML = "";
    mystery.clues.forEach(function (c) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "hotspot";
      b.dataset.clue = c.key;
      b.setAttribute("aria-label", c.label);
      b.style.left = c.x + "%";
      b.style.top = c.y + "%";
      if (S.state.found.indexOf(c.key) !== -1) b.classList.add("found");
      b.addEventListener("click", onHotspot);
      box.appendChild(b);
    });

    const t = mystery.target;
    [silverLight, moth].forEach(function (el) {
      el.style.left = t.x + "%";
      el.style.top = t.y + "%";
    });
    silverLight.setAttribute("aria-label", t.label);
    silverLight.classList.toggle("ready", allFound());
    silverLight.hidden = false;

    moth.hidden = true;
    moth.src = disc().sprite;
    moth.alt = disc().name;
    revealed = false;
    updateClueCount();
  }

  function playPetalFx(clue) {
    petalFx.style.left = clue.x + "%";
    petalFx.style.top = clue.y + "%";
    petalFx.hidden = false;
    setTimeout(function () { petalFx.hidden = true; }, PETAL_FX_TIME + 100);
  }

  // ---------- Clues ----------
  function onHotspot(e) {
    if (waiting) return;
    const btn = e.currentTarget;
    const clue = mystery.clues.find((c) => c.key === btn.dataset.clue);
    if (!clue || S.state.found.indexOf(clue.key) !== -1) return;

    S.recordClue(clue.key);
    btn.classList.add("found");
    updateClueCount();
    const bonus = S.countDailyClue();   // daily reward: +5 on the 3rd clue

    let text = clue.text;
    if (allFound()) {
      silverLight.classList.add("ready");
      text += BW.NUDGE;
    }
    if (bonus) {
      text += " 🌸 +" + bonus + " Moon Petals for observing " +
              BW.DAILY.clues + " clues today.";
    }

    if (mystery.id === "moth" && clue.key === "petal") {
      waiting = true;
      playPetalFx(clue);
      setTimeout(function () {
        showDialog("🌙 Clue Found", text, true);
      }, PETAL_POPUP_DELAY);
    } else {
      showDialog("🌙 Clue Found", text, true);
    }
  }

  function onSilverLight() {
    if (!mystery || revealed || waiting) return;
    if (!allFound()) {
      showDialog("🌙 Too Far Away", BW.TOO_FAR, false);
      return;
    }
    mode = "walk";
    showStory("", mystery.walk, "Continue");
  }

  // ---------- Reveal & Reward ----------
  function playReveal() {
    revealed = true;
    silverLight.hidden = true;
    moth.hidden = false;
    setTimeout(showReward, REWARD_DELAY);
  }

  function figure(src, alt, caption) {
    const f = document.createElement("figure");
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    const cap = document.createElement("figcaption");
    cap.innerHTML = caption;
    f.appendChild(img);
    f.appendChild(cap);
    return f;
  }

  function showReward() {
    const d = disc();
    const lines = [];
    const cards = $("reward-cards");
    cards.innerHTML = "";
    cards.appendChild(figure(d.card, d.name + " discovery card",
      "Discovery #" + d.number + "<br>" + d.name));

    S.unlock("discoveries", d.id);
    const k = BW.KEEPSAKES.find((i) => i.id === "petal");
    if (S.unlock("keepsakes", k.id)) {
      cards.appendChild(figure(k.card, k.name + " keepsake card",
        "Keepsake #" + k.number + "<br>" + k.name));
    }

    // Journal entry + sticker (coming soon until their art exists)
    const j = BW.JOURNAL.find((i) => i.id === d.id);
    const st = BW.STICKERS.find((i) => i.id === d.id);
    S.unlock("journal", j.id);
    S.unlock("stickers", st.id);
    lines.push((j.soon ? "📖 " : "✅ ") + "Journal Entry #" + d.number +
               (j.soon ? " — Coming soon" : ""));
    lines.push((st.soon ? "🎟 " : "✅ ") + st.name +
               (st.soon ? " — Coming soon" : ""));

    // Petals by rarity
    const earned = BW.RARITY[d.rarity].petals;
    S.addPetals(earned);
    lines.push("🌸 +" + earned + " Moon Petals");

    // Achievements
    BW.ACHIEVEMENTS.forEach(function (a) {
      if (a.soon || S.has("achievements", a.id)) return;
      const done =
        (a.when === "complete-moth" && d.id === "moth") ||
        (a.when === "complete-region" &&
         S.state.discoveries.length >= BW.DISCOVERIES.length);
      if (!done) return;
      S.unlock("achievements", a.id);
      S.addPetals(a.petals);
      lines.push("🏆 " + a.name + " · +" + a.petals + " Moon Petals");
      if (a.id === "moonroot-explorer") {
        lines.push("🖼 Exclusive Moonroot Frame — Coming soon");
      }
    });
    lines.push("🌙 Total: " + S.state.petals + " Moon Petals");

    $("reward-list").innerHTML = "";
    lines.forEach(function (text) {
      const li = document.createElement("li");
      li.textContent = text;
      $("reward-list").appendChild(li);
    });

    $("reward-quote").textContent = "“" + mystery.quote + "”";
    const jt = JOURNAL_TEXT[d.id];
    $("reward-journal").hidden = !jt;
    $("reward-journal").innerHTML = jt ? jt.join("<br>") : "";

    reward.hidden = false;
  }

  // ---------- Next mystery ----------
  function startMystery() {
    // Rewards already given (e.g. page reloaded on the reward screen)? Skip ahead.
    while (S.state.current < BW.MYSTERIES.length &&
           S.has("discoveries", BW.MYSTERIES[S.state.current].id)) {
      S.nextMystery();
    }
    if (S.state.current >= BW.MYSTERIES.length) return allDone();

    mystery = BW.MYSTERIES[S.state.current];
    buildScene();
    if (!S.state.introSeen) {
      mode = "intro";
      showStory(mystery.title, mystery.intro, mystery.button);
    }
  }

  function allDone() {
    mode = "done";
    $("hotspots").innerHTML = "";
    silverLight.hidden = true;
    moth.hidden = true;
    $("clue-count").textContent = "Done";
    showStory("The Pond Rests",
      ["You found every mystery in Moonroot Pond.", "More are coming soon."],
      "Open the Scrapbook");
  }

  // ---------- Events ----------
  storyBtn.addEventListener("click", function () {
    storyPanel.hidden = true;
    if (mode === "intro") S.markIntroSeen();
    else if (mode === "walk") playReveal();
    else if (mode === "done") BW.Scrapbook.open();
  });

  dialogBtn.addEventListener("click", closeDialog);
  silverLight.addEventListener("click", onSilverLight);

  $("reward-btn").addEventListener("click", function () {
    reward.hidden = true;
    BW.Scrapbook.onClose = function () {
      S.nextMystery();
      startMystery();
    };
    BW.Scrapbook.open();
  });

  // ---------- Init ----------
  S.load();
  makeFireflies(14);
  startMystery();
})();
