/* PROJECT: Burrow Whispers — Book Keeper Website
   FILE: Moonlit Reverie, Lunelle's Home Region · js/lore.js
   VERSION: V1.2 · Part 1 of 1
   Lives at stories/burrow-whispers/lunelle/js/lore.js

   WHAT THIS FILE IS: data only. It holds the game addresses and the
   places, lore and discovery text. It does nothing on its own.
   It creates window.Lunelle, which the other files share:
     Lunelle.GAMES        game addresses
     Lunelle.TRAVEL_FADE  fade time before travel (ms)
     Lunelle.P            places and lore

   LOAD ORDER in index.html (each with defer):
     1. js/lore.js      (this file)
     2. js/panel.js
     3. js/effects.js
   Edit story text and game addresses here, nowhere else. */

(function () {
  "use strict";

  var L = window.Lunelle = window.Lunelle || {};

  /* ---------- GAME ADDRESSES (change them here) ---------- */
  L.GAMES = {
    step: "./one-more-little-step/index.html",
    moth: "./the-silver-moth/index.html"
  };
  L.TRAVEL_FADE = 1400;   /* matches --travel-fade in variables.css */

  /* ---------- PLACES AND LORE ----------
     n = name, t = type (C place, A lore object, B discovery)
     l = reading levels, o = explore options after reading
     o.to = travel, o.game = open a game, o.say = a short scene,
     o.r = reveals a place, o.v = custom travel story
     g = glimpse text (shown before a place is found)
     r = discovery rewards (type B) */
  L.P = {
    stone: { n: "Moonwatch Stone", t: "C",
      l: ["Welcome to Moonlit Reverie.\n\nBeneath the roots of an ancient tree rests a quiet pond where moon lotus flowers bloom beneath silver light.\n\nThis is a place of wonder, reflection, and small acts of courage.\n\nTake your time.\n\nEvery path here rewards curiosity.",
          "A smooth stone overlooking the pond.\n\nLunelle often sits here before exploring somewhere unfamiliar. Whenever she feels uncertain, she watches the moon’s reflection until her courage returns."],
      o: [{ a: "Approach the Pond", to: "pond" },
          { a: "Look Across the Water", say: "Far across the pond, a faint silver light waits among roots and flowers. It is too far to reach tonight, but it is easy to keep looking at.", r: "grove" },
          { a: "Watch the Moon", game: "step" }] },

    pond: { n: "Moon Lotus Pond", t: "C",
      l: ["A broad, tranquil pond. The water is calm and reflective, and the moon often rests on its surface.",
          "Nothing about the pond feels made. It feels discovered. Moon lotus blossoms drift on it, and the silver glow along their edges is the pond’s own."],
      o: [{ a: "Visit Lotus Shore", to: "shore" },
          { a: "Follow the Shoreline Trail", to: "trail" },
          { a: "Watch the Reflection", to: "reflection" }] },

    shore: { n: "Lotus Shore", t: "C",
      l: ["A flower-lined bank where moon lotus blossoms gather in greater numbers, with lavender wildflowers and small resting stones.",
          "The shoreline curves gently here. Look closely and small details appear: a ring of petals, a heart-shaped leaf, a pebble polished smooth."],
      o: [{ a: "Walk the Shoreline", to: "trail" },
          { a: "Inspect the Lotus Blossoms", to: "lotus" },
          { a: "Cross Toward the Grove", to: "grove", r: "grove", v: "You follow the shoreline slowly.\n\nMoon lotus flowers drift beside you as reflected moonlight dances upon the water.\n\nAhead, Silver Light Grove waits in quiet silence." }] },

    trail: { n: "Shoreline Trail", t: "C",
      l: ["A natural path along the pond’s edge, winding past clover, scattered flowers, and the odd root arch.",
          "The trail is the thread of Moonlit Reverie. Every place here can be reached by it, one small step at a time."],
      o: [{ a: "Return to the Pond", to: "pond" },
          { a: "Continue to the Grove", to: "grove", r: "grove" }] },

    meadow: { n: "Moon Blossom Meadow", t: "C",
      l: ["A gently rolling meadow between the roots and the pond. Lavender flowers and clover sway in the grass.",
          "The blossoms change with the seasons, but the meadow always feels like a doorway between the woods and the water."],
      o: [{ a: "Visit Moonwatch Stone", to: "stone" },
          { a: "Observe the Meadow", say: "The grass moves in slow waves. A few petals lift, turn, and settle again, as if the meadow were breathing." }] },

    moonroot: { n: "Ancient Moonroot", t: "C",
      l: ["An enormous tree rises at the northern edge of the wilds. Its roots spread across the land, shaping the ground and framing the view.",
          "The Moonroot is older than the pond. Moss grows thick on its bark, ferns shelter in its alcoves, and small flowers bloom in pockets between the roots."],
      o: [{ a: "Visit Moss Hollow", to: "hollow" },
          { a: "Examine the Root Caverns", to: "roothollow" }] },

    hollow: { n: "Moss Hollow", t: "C",
      l: ["A sheltered hollow beneath the roots, with moss bedding, clover cushions, and fallen petals.",
          "It is not hidden. It is simply tucked away, where soft moonlight comes in through the root openings."],
      o: [{ a: "Return to Ancient Moonroot", to: "moonroot" },
          { a: "Visit Moon Blossom Meadow", to: "meadow" },
          { a: "Sit Quietly", say: "You sit for a while.\n\nThe moss is warm. The wind slows. Somewhere far away, water moves against stone." }] },

    rootpath: { n: "Hidden Root Path", t: "C",
      l: ["Something seems unusual about these roots.",
          "The moss is slightly displaced. Between the ferns, flat stones lead back under the roots, a quiet path that continues farther than it first appears."],
      o: [{ a: "Follow the Hidden Path", to: "grove", r: "grove" }] },

    grove: { n: "Silver Light Grove", t: "C",
      g: "A faint silver light glows on the far side of the pond. It is visible from here, but no path to it has been found yet.",
      l: ["A small clearing on the far side of the pond, where silver-toned flowers and lotus clusters grow among mossy stones.",
          "Few places feel this still. It rewards curiosity without demanding it."],
      o: [{ a: "Observe the Silver Flowers", say: "Each blossom holds a little of the moon along its edge, and when the air moves, they glow a little brighter." },
          { a: "Search the Grove", say: "Under a mossy stone lies a pressed lotus petal, silver along its edge. Someone left it long ago, perhaps so the next visitor would know the walk was worth it." },
          { a: "Rest Beside the Water", say: "You rest at the water’s edge. Across the pond, Moonwatch Stone looks small and far away. You came all this way, one small step at a time." }] },

    moth: { n: "Silver Moth", t: "C",
      l: ["A tiny silver moth rests on a lotus petal, its wings opening and closing in no hurry.",
          "A moth like this was the first silver light Lunelle ever noticed across the pond. She feared what it might be. It turned out to be a friend."],
      o: [{ a: "Follow the Silver Moth", game: "moth" }] },

    reflection: { n: "The Moon’s Reflection", t: "A",
      l: ["The moon rests on the water, so still it seems you could touch it.",
          "Ripples never keep the moon for long. It always comes back together, a little brighter than before."] },

    lotus: { n: "Moon Lotus Cluster", t: "A",
      l: ["Moon lotus blossoms, pale lavender and ivory, open slowly above the dark water.",
          "They grow from the mud and still bloom in moonlight. Lunelle’s crest is shaped like one."] },

    petals: { n: "Drifting Petals", t: "A",
      l: ["A few petals drift across the meadow, light as breath.",
          "They gather into small circles near the stones. Nobody can say who arranges them."] },

    roothollow: { n: "Root Hollow", t: "B",
      l: ["A small darkness beneath the roots. A leaf rustles.",
          "A tiny hidden compartment, just wide enough to reach into."],
      r: ["You find a polished pebble, smooth and cool.", "You find a small acorn, tucked away for later.", "You find a soft grey feather.", "You find a single flower petal, kept perfectly fresh."] }
  };

})();