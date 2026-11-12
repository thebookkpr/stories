/* One More Little Step — scenes.js V1.0
   Project: One More Little Step (Burrow Whispers, Lunelle)
   Part 1 of 1 (JavaScript)

   V1.0: NEW BEGINNING. Version numbers restart at 1.0.
         Exactly 5 hotspots per scene.
         Scene 1 lost two hotspots: the moon (too bright for the glow)
         and the middle lotus (lotus-mid).
         Removed the empty whisper fields (dialogue is still deferred).
         Added per-scene "mood" (Hint Stage 4) and per-hotspot "clue"
         (Hint Stage 5). These are observations, never instructions.
         Added tablet background slots for Scenes 1 to 3.
         Tablet hotspot positions come later (tabletHotspots: null
         means "reuse the 20:9 hotspots for now").

   Scene data only. No behavior lives here.
   Positions are percentages of the stage
   (x, y = left, top; w, h = width, height). */

const SCENES = [
  {
    id: "pond",
    title: "Moonroot Pond",
    background: "images/scene-pond.jpg",
    tabletBackground: "images/scenepond-tablet.jpg",
    tabletHotspots: null,
    lunelle: { src: "assets/lunelle-blinking.gif", x: 4, bottom: 19, w: 12, vanishAfter: 15000 },
    courageRequired: 5,
    petalHint: "Did you forget something?",
    petalPoint: true,
    hint: "Tap what catches your eye",
    hint2: "Each discovery fills your Courage",
    mood: "The pond seems especially beautiful tonight.",
    hotspots: [
      { id: "lotus-left",  kind: "wonder", courage: 1,
        x: 15.7, y: 51.5, w: 9, h: 14,
        clue: "A lotus far across the pond seems to glow." },
      { id: "reflection",  kind: "wonder", courage: 1,
        x: 46.7, y: 55, w: 8, h: 18,
        clue: "Something silver rests upon the water." },
      { id: "lotus",       kind: "watch",  courage: 1,
        x: 62, y: 60, w: 8, h: 16,
        clue: "One lotus shines brighter than the rest." },
      { id: "fireflies",   kind: "watch",  courage: 1,
        x: 74, y: 23, w: 13, h: 29,
        clue: "The fireflies gather in one corner of the night." },
      { id: "lotus-right", kind: "wonder", courage: 1,
        x: 81.5, y: 64, w: 8, h: 14,
        clue: "Another bloom glows at the pond's far edge." }
    ],
    petal: { x: 77, y: 79 }
  },
  {
    id: "silver-light",
    title: "The Silver Light",
    background: "images/scene-silver-light.jpg",
    tabletBackground: "images/scenesilverlight-tablet.jpg",
    tabletHotspots: null,
    lunelle: { src: "images/sprites/lunelle-light.png", x: 10, bottom: 4, w: 28 },
    courageRequired: 5,
    petalHint: "A silver petal is hiding here",
    petalPoint: true,
    hint: "Tap what catches your eye",
    mood: "The silver light feels close tonight.",
    hotspots: [
      { id: "orb",       kind: "wonder", courage: 1,
        x: 61, y: 36, w: 11, h: 18,
        clue: "A soft light hovers beyond the trees." },
      { id: "flowers",   kind: "watch",  courage: 1,
        x: 9, y: 55, w: 11, h: 14,
        clue: "Pale flowers glow at the edge of the path." },
      { id: "fireflies", kind: "watch",  courage: 1,
        x: 28, y: 30, w: 12, h: 14,
        clue: "Tiny lights drift among the branches." },
      { id: "petals",    kind: "wonder", courage: 1,
        x: 40, y: 76, w: 14, h: 16,
        clue: "Fallen petals rest along the path." },
      { id: "roots",     kind: "listen", courage: 1,
        x: 68, y: 58, w: 12, h: 18,
        clue: "The old roots of the great tree seem to listen." }
    ],
    petal: { x: 91, y: 31 }
  },
  {
    id: "clearing",
    title: "The Clearing",
    background: "images/scene-clearing.jpg",
    tabletBackground: "images/sceneclearing-tablet.jpg",
    tabletHotspots: null,
    lunelle: { src: "images/sprites/lunelle-clearing.png", x: 10, bottom: 4, w: 28 },
    courageRequired: 5,
    petalHint: "Another silver petal is hiding here",
    petalPoint: true,
    hint: "Tap what catches your eye",
    mood: "The clearing feels like a place to pause.",
    hotspots: [
      { id: "boulder",   kind: "watch",  courage: 1,
        x: 17.5, y: 54, w: 8, h: 10.5,
        clue: "A mossy stone rests at the clearing's edge." },
      { id: "petals",    kind: "wonder", courage: 1,
        x: 33, y: 83, w: 12, h: 13,
        clue: "Glowing petals lie scattered in the grass." },
      { id: "fireflies", kind: "watch",  courage: 1,
        x: 40, y: 34, w: 17, h: 20,
        clue: "Fireflies shimmer among the trees." },
      { id: "glow",      kind: "wonder", courage: 1,
        x: 58, y: 45, w: 9.5, h: 19,
        clue: "A silver glow has gathered in the clearing." },
      { id: "log",       kind: "listen", courage: 1,
        x: 72, y: 80, w: 14, h: 14,
        clue: "An old fallen log has seen many seasons." }
    ],
    petal: { x: 25, y: 52.5 }
  },
  {
    id: "moth",
    title: "The Moth",
    background: "images/scene-moth.jpg",
    lunelle: { src: "images/sprites/lunelle-moth.png", x: 10, bottom: 4, w: 28 },
    courageRequired: 5,
    petalHint: "Can you find the hidden petal?",
    mood: "Something gentle watches over this place.",
    hotspots: [
      { id: "fireflies", kind: "watch",  courage: 1,
        x: 18, y: 24, w: 12, h: 14,
        clue: "Fireflies drift among the trees, high and far." },
      { id: "stones",    kind: "listen", courage: 1,
        x: 33, y: 72, w: 14, h: 14,
        clue: "Stepping stones lead quietly along the path." },
      { id: "moth",      kind: "wonder", courage: 1,
        x: 57.5, y: 25, w: 11, h: 16,
        clue: "A luminous visitor rests in the air." },
      { id: "boulder",   kind: "watch",  courage: 1,
        x: 66, y: 66, w: 13, h: 15,
        clue: "A great mossy boulder keeps its own company." },
      { id: "blossoms",  kind: "wonder", courage: 1,
        x: 82, y: 63, w: 8, h: 15,
        clue: "Glowing blossoms bloom at the far edge of the night." }
    ],
    petal: { x: 41.5, y: 46 }
  },
  {
    id: "hilltop",
    title: "Farther From the Burrow",
    background: "images/scene-hilltop.jpg",
    lunelle: { src: "images/sprites/lunelle-hilltop.png", x: 10, bottom: 4, w: 28 },
    courageRequired: 5,
    petalHint: "Can you find the hidden petal?",
    petalHintY: 28,
    mood: "The whole of the wilds stretches out below.",
    hotspots: [
      { id: "trail",     kind: "wonder", courage: 1,
        x: 12.5, y: 38, w: 11, h: 15,
        clue: "A silver trail winds through the valley." },
      { id: "fireflies", kind: "watch",  courage: 1,
        x: 20, y: 56, w: 11, h: 14,
        clue: "Fireflies drift above the dark pines." },
      { id: "meadow",    kind: "listen", courage: 1,
        x: 34, y: 80, w: 14, h: 12,
        clue: "Wildflowers sway softly in the meadow." },
      { id: "lake",      kind: "wonder", courage: 1,
        x: 55.5, y: 37, w: 11, h: 12,
        clue: "A distant lake shines in the valley." },
      { id: "boulder",   kind: "watch",  courage: 1,
        x: 72, y: 54, w: 15, h: 17,
        clue: "Mossy boulders rest beside the old tree." }
    ],
    petal: { x: 41, y: 59 }
  }
];
