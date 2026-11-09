/*
  PROJECT: Burrow Whispers #001 — The Silver Moth
  FILE: js/mysteries.js
  VERSION: 0.6.0
  PART: 1 of 1
  LOAD ORDER: 2nd script (after data.js)
  NOTE: One entry per mystery. Each id matches a discovery id in data.js.
        x / y are % positions on the pond scene.
        #001 is your approved text. #002-#005 are DRAFTS with
        PLACEHOLDER positions: edit freely.
*/

window.BW = window.BW || {};

BW.TOO_FAR = "It's too far away to see clearly.";
BW.NUDGE = " Lunelle gathers her courage. Perhaps it's time to look again.";

BW.MYSTERIES = [

  // ---------- #001 The Silver Moth (approved) ----------
  { id: "moth",
    title: "Moonroot Pond",
    button: "Investigate the Light",
    intro: [
      "The moon rested quietly upon the water.",
      "As usual, Lunelle sat among the moon lotuses and listened to the sounds of the Wilds.",
      "Then she noticed something.",
      "A small silver light glimmered beyond the pond.",
      "She had never seen it before.",
      "What could it be?"
    ],
    target: { x: 88, y: 52, label: "The silver light" },
    clues: [
      { key: "reflection", label: "Pond reflection", x: 52, y: 62,
        text: "The light flickers when it moves. It does not seem like a lantern." },
      { key: "petal", label: "Lotus petal", x: 32, y: 85,
        text: "A tiny petal looks disturbed. Something very small may have rested here recently." },
      { key: "fireflies", label: "Firefly swarm", x: 22, y: 36,
        text: "The fireflies glow warm gold. The silver light shines a different color." },
      { key: "moonbeam", label: "Moonbeam", x: 55, y: 20,
        text: "The moonlight follows the light wherever it goes." }
    ],
    walk: [
      "Lunelle took one careful step.",
      "Then another.",
      "And another.",
      "The clearing seemed much smaller than she imagined."
    ],
    quote: "A gentle traveler drawn to moonlit blossoms."
  },

  // ---------- #002 The Moonroot Frog (draft) ----------
  { id: "frog",
    title: "A Soft Sound",
    button: "Follow the Sound",
    intro: [
      "The pond was quiet again.",
      "Then a soft, low sound drifted from the reeds.",
      "Lunelle tilted her ears.",
      "Who was singing in the dark?"
    ],
    target: { x: 14, y: 72, label: "The rustling reeds" },
    clues: [
      { key: "ripples", label: "Ripples", x: 40, y: 66,
        text: "Small rings spread across the water, as if something just hopped in." },
      { key: "stone", label: "Mossy stone", x: 70, y: 78,
        text: "The stone is damp, with tiny wet prints leading away." },
      { key: "leaf", label: "Lotus leaf", x: 28, y: 80,
        text: "One lotus leaf is bowed down, the way a small weight would bend it." },
      { key: "song", label: "Night song", x: 60, y: 40,
        text: "The sound repeats in a gentle rhythm. It sounds friendly." }
    ],
    walk: [
      "Lunelle tiptoed through the reeds.",
      "The song grew softer, and closer.",
      "She held her breath."
    ],
    quote: "A tiny singer who keeps the pond company."
  },

  // ---------- #003 The Nightfire Cricket (draft) ----------
  { id: "cricket",
    title: "A Warm Glow",
    button: "Look Closer",
    intro: [
      "Something chirped near the old roots.",
      "A faint, warm glow flickered beneath the bark.",
      "It was not gold like the fireflies.",
      "What was it?"
    ],
    target: { x: 78, y: 84, label: "The glowing roots" },
    clues: [
      { key: "chirp", label: "Chirping", x: 45, y: 30,
        text: "The chirps come in steady little pulses. Fireflies never chirp." },
      { key: "glow", label: "Warm glow", x: 62, y: 70,
        text: "The glow is orange, like a tiny ember that never burns." },
      { key: "leaf", label: "Dusty leaf", x: 20, y: 62,
        text: "A leaf is dusted with faint glowing specks. Something passed this way." },
      { key: "roots", label: "Old roots", x: 85, y: 30,
        text: "The roots are warm to the touch, just in one small spot." }
    ],
    walk: [
      "Lunelle crept toward the roots.",
      "The chirping paused, then began again.",
      "It did not sound afraid."
    ],
    quote: "A glowing little musician of the roots."
  },

  // ---------- #004 The Pond Pearl (draft) ----------
  { id: "pearl",
    title: "Beneath the Water",
    button: "Peer Into the Pond",
    intro: [
      "The pond was calm and clear.",
      "Far below the lotus roots, something pale shimmered.",
      "It glowed softly, like a second moon.",
      "What was hiding down there?"
    ],
    target: { x: 50, y: 74, label: "The shimmer in the water" },
    clues: [
      { key: "rings", label: "Water rings", x: 36, y: 60,
        text: "Gentle rings rise from below, though nothing touched the surface." },
      { key: "shell", label: "Empty shell", x: 74, y: 86,
        text: "An empty shell lies on the bank. It is smooth and cool." },
      { key: "roots", label: "Lotus roots", x: 24, y: 78,
        text: "The roots curl around something round, holding it carefully." },
      { key: "moonbeam", label: "Moonbeam", x: 58, y: 24,
        text: "The moonbeam bends in the water and gleams back from below." }
    ],
    walk: [
      "Lunelle leaned over the water.",
      "The shimmer grew brighter.",
      "It was waiting to be found."
    ],
    quote: "A quiet treasure shaped by patient water."
  },

  // ---------- #005 The Lantern Seed (draft) ----------
  { id: "seed",
    title: "A Drifting Light",
    button: "Follow the Light",
    intro: [
      "A tiny light floated up from the grass.",
      "It drifted slowly, rising with the breeze.",
      "Lunelle had never seen a lantern without a hand to carry it.",
      "Where was it going?"
    ],
    target: { x: 84, y: 24, label: "The drifting light" },
    clues: [
      { key: "fluff", label: "Soft fluff", x: 30, y: 48,
        text: "Soft fluff lingers in the air, as if something just let go." },
      { key: "steady", label: "Steady glow", x: 66, y: 34,
        text: "The light does not flicker. It glows calm and steady." },
      { key: "breeze", label: "Night breeze", x: 18, y: 26,
        text: "The light drifts the same way as the breeze." },
      { key: "husk", label: "Empty husk", x: 46, y: 82,
        text: "A small husk rests in the grass, split open like a tiny door." }
    ],
    walk: [
      "Lunelle followed the drifting light.",
      "It rose, then slowed, as if waiting.",
      "She reached out one paw."
    ],
    quote: "A little lantern that carries the dream of a tree."
  }
];
