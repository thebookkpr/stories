/*
  PROJECT: Burrow Whispers #001 — The Silver Moth
  FILE: js/journal.js
  VERSION: 0.12.0
  PART: 1 of 1
  LOAD ORDER: 2nd script (after data.js, before mysteries.js)
  NOTE: The text of Lunelle's journal entries. One list per entry,
        one line of text per paragraph. data.js lists the entries
        (id, number, name); this file adds the text to each one.
        To change an entry, edit its lines here.
*/

(function () {
  "use strict";

  const TEXT = {

    // ---------- #001 The Silver Moth (Courage) ----------
    moth: [
      "Tonight I saw a strange silver light across Moonroot Pond.",
      "At first, I only watched from where I sat. The light was small and far away, and I wasn't sure if I should follow it. I wondered if it would disappear before I reached it.",
      "The more carefully I looked, the more curious I became.",
      "When I finally crossed the clearing, I discovered the light was only a tiny silver moth resting on a fallen lotus petal.",
      "It wasn't grand or mysterious after all.",
      "Just beautiful.",
      "I think there are many things in the Wilds like that. Things that seem distant until we take the time to approach them.",
      "Sometimes courage doesn't arrive all at once.",
      "Sometimes it begins with a single step, followed by one more.",
      "Tonight, that was enough.",
      "— Lunelle"
    ],

    // ---------- #002 Moonroot Frog (Listening) ----------
    frog: [
      "This evening, the pond sounded quiet.",
      "Or so I thought.",
      "I had only been sitting among the reeds for a moment when I began to notice it. A soft, low sound drifting up from the water. Then another. Then a whole chorus of tiny voices I had never heard before.",
      "The pond had been singing all along.",
      "I followed the music slowly, careful not to disturb it. Small rings spread across the water. A lotus leaf bowed and trembled. Damp little prints crossed a mossy stone.",
      "At last I found the singer: a Moonroot Frog resting among the reeds, humming to the night.",
      "It was not hiding from me. It was not trying to be found. It was simply singing, the way it always had.",
      "I had only needed to stop and listen.",
      "The world often speaks softly. We discover its wonders when we take time to listen.",
      "I think quiet things often have the most to say.",
      "Tonight, I stayed until the last note faded.",
      "I was glad I did.",
      "— Lunelle"
    ],

    // ---------- #003 Nightfire Cricket (Wonder) ----------
    cricket: [
      "Tonight, something strange was glowing in the grass.",
      "It was not the cool silver of the moth, or the gold of the fireflies. It was a warm amber light, like a tiny ember that never burned.",
      "It flickered between the blades of grass, vanished, then appeared somewhere new.",
      "I wondered if it wanted me to follow.",
      "A steady little chirp rose and fell nearby, in time with the glow. A leaf lay dusted with faint sparks. The old roots felt warm in one small spot.",
      "When I finally crept close, I found a Nightfire Cricket, singing beneath the moonlight while its glow danced through the grasses.",
      "It was not leading me anywhere.",
      "It was not a sign, or a warning, or a message.",
      "It was only a small creature, glowing and singing, happy to be awake.",
      "For a while I sat beside it and forgot to wonder what it meant.",
      "Not every light is meant to guide us somewhere. Some are meant simply to remind us that beauty exists.",
      "I think beauty does not always need a purpose.",
      "Tonight, that was reason enough to stay.",
      "— Lunelle"
    ],

    // ---------- #004 Pond Pearl (Perception) ----------
    pearl: [
      "Today, the pond was as clear as glass.",
      "I leaned over the water to look at my reflection, and instead I noticed something shimmering far below the lotus roots.",
      "Pale. Soft. Like a second moon resting on the bottom of the pond.",
      "Gentle rings rose from the depths, though nothing had touched the surface. An empty shell lay smooth and cool on the bank. The roots curled around something round, holding it carefully.",
      "I almost did not look again.",
      "The pond was full of reflections and ripples, and it would have been easy to see only those.",
      "But when I waited, and looked a little longer, the shimmer grew clearer.",
      "A luminous pearl lay hidden among the roots and stones, glowing quietly in the dark water.",
      "It had been there all along, patient and still, waiting for someone to look beneath the surface.",
      "The most precious things are not always immediately visible.",
      "I think we must look beyond what first meets the eye.",
      "Today, I am glad I was patient.",
      "— Lunelle"
    ],

    // ---------- #005 Lantern Seed (Hope) ----------
    seed: [
      "At dusk, a tiny light rose from the grass.",
      "It drifted slowly upward, swaying on the evening breeze, like a lantern with no hand to carry it.",
      "I followed it across the clearing.",
      "Soft fluff hung in the air where it had passed. The glow did not flicker the way the fireflies do. It shone calm and steady, and it drifted the same way as the wind.",
      "When it finally slowed, I saw what it was: a Lantern Seed, glowing like a tiny lantern as it traveled toward a place where it could grow.",
      "Nearby, a small husk lay split open like a little door.",
      "The seed did not know where it would land. It did not know if the soil would be soft, or if the rain would come. It only knew it was time to go.",
      "I watched until it disappeared behind the ferns.",
      "Every journey begins before we know exactly where it will lead.",
      "I think that is what hope feels like. Trust the journey, even when the destination is unknown.",
      "Tonight, I wished it well.",
      "— Lunelle"
    ]
  };

  // Add the text to each entry listed in data.js
  BW.JOURNAL.forEach(function (entry) {
    if (TEXT[entry.id]) entry.text = TEXT[entry.id];
  });
})();