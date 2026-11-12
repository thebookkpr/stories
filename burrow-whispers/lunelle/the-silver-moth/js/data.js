/*
  PROJECT: Burrow Whispers #001 — The Silver Moth
  FILE: js/data.js
  VERSION: 0.8.0
  PART: 1 of 1
  LOAD ORDER: 1st script (before mysteries.js, save.js, game.js)
  NOTE: Items, rewards, and achievements live here.
        soon: true = art not created yet, shown as "Coming soon".
        When art arrives: add the file path and delete "soon".
        Journal entries are text only: put each line in "text".
*/

window.BW = window.BW || {};

// ---------- Rewards (Master Reward Table) ----------
BW.RARITY = {
  common:    { label: "Common",    petals: 25 },
  uncommon:  { label: "Uncommon",  petals: 50 },
  rare:      { label: "Rare",      petals: 100 },
  legendary: { label: "Legendary", petals: 250 }
};

BW.DAILY = { clues: 3, petals: 5 };   // observe 3 clues in a day
BW.REGION_BONUS = { petals: 100, frame: "moonroot-frame" };

// ---------- Discoveries (one per mystery) ----------
BW.DISCOVERIES = [
  { id: "moth", number: "001", name: "Silver Moon Moth", rarity: "common",
    sprite: "assets/silvermoon-moth.png",
    card: "assets/silvermoonmoth-card.jpg" },
  { id: "frog", number: "002", name: "Moonroot Frog", rarity: "common",
    sprite: "assets/moonroot-frog.png",
    card: "assets/moonrootfrog-card.jpg" },
  { id: "cricket", number: "003", name: "Nightfire Cricket", rarity: "common",
    sprite: "assets/nightfire-cricket.png",
    card: "assets/nightfirecricket-card.jpg" },
  { id: "pearl", number: "004", name: "Pond Pearl", rarity: "uncommon",
    sprite: "assets/pond-pearl.png",
    card: "assets/pondpearl-card.jpg" },
  { id: "seed", number: "005", name: "Lantern Seed", rarity: "uncommon",
    sprite: "assets/lantern-seed.png",
    card: "assets/lanternseed-card.jpg" }
];

// ---------- Keepsakes ----------
BW.KEEPSAKES = [
  { id: "petal", number: "001", name: "Moon Petal",
    sprite: "assets/moon-petal.png",
    card: "assets/moonpetal-card.jpg" },
  { id: "lotus",  number: "002", name: "Pressed Moon Lotus", soon: true },
  { id: "acorn",  number: "003", name: "Acorn Charm",        soon: true },
  { id: "ribbon", number: "004", name: "Silver Ribbon",      soon: true },
  { id: "key",    number: "005", name: "Lantern Key",        soon: true }
];

// ---------- Journal entries (text only, one per mystery) ----------
BW.JOURNAL = [
  { id: "moth",    number: "001", name: "The Silver Moth",
    text: ["Sometimes courage doesn't roar.",
           "Sometimes it simply takes one more little step."] },
  { id: "frog",    number: "002", name: "Entry #002", soon: true },
  { id: "cricket", number: "003", name: "Entry #003", soon: true },
  { id: "pearl",   number: "004", name: "Entry #004", soon: true },
  { id: "seed",    number: "005", name: "Entry #005", soon: true }
];

// ---------- Stickers (one per discovery) ----------
BW.STICKERS = [
  { id: "moth",    name: "Silver Moon Moth Sticker",   soon: true },
  { id: "frog",    name: "Moonroot Frog Sticker",      soon: true },
  { id: "cricket", name: "Nightfire Cricket Sticker",  soon: true },
  { id: "pearl",   name: "Pond Pearl Sticker",         soon: true },
  { id: "seed",    name: "Lantern Seed Sticker",       soon: true }
];

// ---------- Achievements ----------
BW.ACHIEVEMENTS = [
  { id: "first-steps", name: "First Steps", petals: 10,
    text: "Take your first step toward the unknown.",
    when: "complete-moth" },
  { id: "patient-observer", name: "Patient Observer", petals: 15,
    text: "Find every clue without hints.",
    soon: true },   // needs a hint feature that does not exist yet
  { id: "moonroot-explorer", name: "Moonroot Explorer", petals: 100,
    text: "Complete all Moonroot Pond mysteries.",
    when: "complete-region" }
];

// ---------- Moon Petal uses (cosmetic only, no shop) ----------
BW.FRAMES = [
  { id: "moon-frame",      name: "Moon Frame",      cost: 50,  soon: true },
  { id: "lotus-frame",     name: "Lotus Frame",     cost: 100, soon: true },
  { id: "crescent-frame",  name: "Crescent Frame",  cost: 250, soon: true },
  { id: "moonroot-frame",  name: "Moonroot Frame",  cost: 500, soon: true }
];
BW.STICKER_PACKS = [
  { id: "pond-pack",      name: "Pond Pack",      cost: 50,  soon: true },
  { id: "firefly-pack",   name: "Firefly Pack",   cost: 100, soon: true },
  { id: "forest-pack",    name: "Forest Pack",    cost: 150, soon: true },
  { id: "moonlight-pack", name: "Moonlight Pack", cost: 250, soon: true }
];
BW.JOURNAL_THEMES = [
  { id: "lavender", name: "Lavender Theme",  cost: 100, soon: true },
  { id: "silver",   name: "Silver Theme",    cost: 200, soon: true },
  { id: "moonlit",  name: "Moonlit Theme",   cost: 300, soon: true },
  { id: "dreamer",  name: "Dreamer's Theme", cost: 500, soon: true }
];
