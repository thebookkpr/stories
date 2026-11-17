/*
  PROJECT: Burrow Whispers #001 — The Silver Moth
  FILE: js/data.js
  VERSION: 0.12.0
  PART: 1 of 1
  LOAD ORDER: 1st script (before journal.js, mysteries.js, save.js, game.js)
  NOTE: Items, rewards, and achievements live here.
        soon: true = art not created yet, shown as "Coming soon".
        When art arrives: add the file path and delete "soon".
        Journal entries are listed here; their text is in js/journal.js.
        v0.11.0: art moved to images/discovery-cards, images/sprites, images/stickers.
        v0.12.0: journal entries #001-#005 named; text moved to js/journal.js.
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
    sprite: "images/sprites/silvermoon-moth.png",
    card: "images/discovery-cards/silvermoonmoth-card.jpg" },
  { id: "frog", number: "002", name: "Moonroot Frog", rarity: "common",
    sprite: "images/sprites/moonrootfrog-female.png",
    card: "images/discovery-cards/moonrootfrog-card.jpg" },
  { id: "cricket", number: "003", name: "Nightfire Cricket", rarity: "common",
    sprite: "images/sprites/nightfire-cricket.png",
    card: "images/discovery-cards/nightfirecricket-card.jpg" },
  { id: "pearl", number: "004", name: "Pond Pearl", rarity: "uncommon",
    sprite: "images/sprites/pond-pearl.png",
    card: "images/discovery-cards/pondpearl-card.jpg" },
  { id: "seed", number: "005", name: "Lantern Seed", rarity: "uncommon",
    sprite: "images/sprites/lantern-seed.png",
    card: "images/discovery-cards/lanternseed-card.jpg" }
];

// ---------- Keepsakes ----------
BW.KEEPSAKES = [
  { id: "petal", number: "001", name: "Moon Petal",
    sprite: "images/sprites/moon-petal.png",
    card: "images/discovery-cards/moonpetal-card.jpg" },
  { id: "lotus",  number: "002", name: "Pressed Moon Lotus", soon: true },
  { id: "acorn",  number: "003", name: "Acorn Charm",        soon: true },
  { id: "ribbon", number: "004", name: "Silver Ribbon",      soon: true },
  { id: "key",    number: "005", name: "Lantern Key",        soon: true }
];

// ---------- Journal entries (the text is added by js/journal.js) ----------
BW.JOURNAL = [
  { id: "moth",    number: "001", name: "The Silver Moth" },
  { id: "frog",    number: "002", name: "Moonroot Frog" },
  { id: "cricket", number: "003", name: "Nightfire Cricket" },
  { id: "pearl",   number: "004", name: "Pond Pearl" },
  { id: "seed",    number: "005", name: "Lantern Seed" }
];

// ---------- Stickers (one per discovery) ----------
BW.STICKERS = [
  { id: "moth",    name: "Silver Moon Moth Sticker",
    card: "images/stickers/silvermoonmoth-sticker.png" },
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