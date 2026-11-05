/* One More Little Step — scenes.js V1.14
   V1.14: Scene 1 reeds hotspot replaced by the far-right large lotus (lotus-right) and a moon hotspot added (7 hotspots, 5 needed). Scene 2 and Scene 3 get the "Tap what catches your eye" hint. Scene 5 petal moved to the pine cluster (x 41, y 59) and petalHintY: 28 added so the hint text sits below the moon.
   V1.13: petal hints on all scenes (Scenes 1-3 point with an arrow, 4-5 only challenge); Scene 2 petal on the middle of the big tree; Scene 3 petal on the rock.
   V1.12: petalHint text on Scenes 1 and 2 (blinking arrow to the hidden petal once courage is full).
   V1.11: Scene 1 second left-lotus hotspot moved to the larger lotus nearer the middle.
   V1.10: Scene 5 (Farther From the Burrow) hotspots and petal placed. Petals moved: Scene 2 to the top of the left rock, Scene 3 onto the left mushroom. Scene 1 gets a sixth hotspot on the second left lotus (courage still needs 5).
   V1.9: Scene 3 petal moved beside the left tree (it vanished near the bright glow); Scene 4 (The Moth) hotspots and petal placed.
   V1.8: Scene 2 petal moved to the left rock; Scene 3 (The Clearing) hotspots and petal placed.
   V1.7: Scene 2 (The Silver Light) hotspots and petal placed on the real art.
   V1.6: Scene 1 extra hotspot moved to the far-left lotus so the five spots spread across the pond.
   V1.5: Scene 1 moon hotspot moved to the rocky hill (the moon was too
   bright for the tutorial glow to show).
   Scene data only. No behavior lives here.
   V1.1: Scene 1 tutorial hint text (interface guidance, not story dialogue).
   V1.2: Scene 1 hotspots and petal placed on the real pond art.
   V1.3: Lunelle sprites moved to images/sprites/.
   Hotspot and petal positions are percentages of the stage
   (x, y = left, top; w, h = width, height).
   Scenes 2 to 5 positions are still placeholders until their art is placed.
   Whisper text is deliberately empty: dialogue is written after
   the visual assets exist (project decision).
   V1.4: Lunelle's sprites moved to images/sprites/, the Scene 1 sprite is
   now half size near the shore and fades out after 5 seconds (with the crest
   shimmer scaling to the sprite and skipping once she's gone), and unfound
   hotspots glow again after 15 seconds without a discovery. */

const SCENES = [
  {
    id: "pond",
    title: "Moonroot Pond",
    background: "images/scene-pond.jpg",
    lunelle: { src: "images/sprites/lunelle-pond.png", x: 4, bottom: 4, w: 14, vanishAfter: 5000 },
    courageRequired: 5,
    petalHint: "Did you forget something?",
    petalPoint: true,
    hint: "Tap what catches your eye",
    hint2: "Each discovery fills your Courage",
    hotspots: [
      /* the silver moon-path on the water */
      { id: "reflection", kind: "wonder", courage: 1,
        x: 46.7, y: 55, w: 8, h: 18, whisper: "" },
      /* the large glowing Moon Lotus, right of centre */
      { id: "lotus",      kind: "watch",  courage: 1,
        x: 62, y: 60, w: 8, h: 16, whisper: "" },
      /* the firefly cluster, upper right */
      { id: "fireflies",  kind: "watch",  courage: 1,
        x: 74, y: 23, w: 13, h: 29, whisper: "" },
      /* the glowing Moon Lotus on the far left of the pond */
      { id: "lotus-left", kind: "wonder", courage: 1,
        x: 15.7, y: 51.5, w: 9, h: 14, whisper: "" },
      /* the larger lotus nearer the middle of the pond */
      { id: "lotus-mid",  kind: "watch",  courage: 1,
        x: 34.5, y: 56, w: 7, h: 11, whisper: "" },
      /* the large glowing Moon Lotus, far right */
      { id: "lotus-right", kind: "wonder", courage: 1,
        x: 81.5, y: 64, w: 8, h: 14, whisper: "" },
      /* the full moon (spare, extra courage) */
      { id: "moon",       kind: "wonder", courage: 1,
        x: 45.5, y: 3, w: 9, h: 18, whisper: "" }
    ],
    petal: { x: 77, y: 79 }
  },
  {
    id: "silver-light",
    title: "The Silver Light",
    background: "images/scene-silver-light.jpg",
    lunelle: { src: "images/sprites/lunelle-light.png", x: 10, bottom: 4, w: 28 },
    courageRequired: 5,
    petalHint: "A silver petal is hiding here",
    petalPoint: true,
    hint: "Tap what catches your eye",
    hotspots: [
      /* the glowing silver orb and its trail */
      { id: "orb",      kind: "wonder", courage: 1,
        x: 61, y: 36, w: 11, h: 18, whisper: "" },
      /* the pale glowing flowers, far left */
      { id: "flowers",  kind: "watch",  courage: 1,
        x: 9, y: 55, w: 11, h: 14, whisper: "" },
      /* the fireflies drifting among the trees */
      { id: "fireflies", kind: "watch", courage: 1,
        x: 28, y: 30, w: 12, h: 14, whisper: "" },
      /* the fallen petals along the path */
      { id: "petals",   kind: "wonder", courage: 1,
        x: 40, y: 76, w: 14, h: 16, whisper: "" },
      /* the old mossy roots of the great tree */
      { id: "roots",    kind: "listen", courage: 1,
        x: 68, y: 58, w: 12, h: 18, whisper: "" }
    ],
    /* on the trunk of the big tree, right side, middle of the tree */
    petal: { x: 91, y: 31 }
  },
  
    {
    id: "clearing",
    title: "The Clearing",
    background: "images/scene-clearing.jpg",
    lunelle: { src: "images/sprites/lunelle-clearing.png", x: 10, bottom: 4, w: 28 },
    courageRequired: 5,
    petalHint: "Another silver petal is hiding here",
    petalPoint: true,
    hint: "Tap what catches your eye",
    hotspots: [
      /* the mossy boulder, left */
      { id: "boulder",   kind: "watch",  courage: 1,
        x: 17.5, y: 54, w: 8, h: 10.5, whisper: "" },
      /* the glowing petals resting in the grass */
      { id: "petals",    kind: "wonder", courage: 1,
        x: 33, y: 83, w: 12, h: 13, whisper: "" },
      /* the fireflies in the trees, centre */
      { id: "fireflies", kind: "watch",  courage: 1,
        x: 40, y: 34, w: 17, h: 20, whisper: "" },
      /* the silver glow gathered in the clearing */
      { id: "glow",      kind: "wonder", courage: 1,
        x: 58, y: 45, w: 9.5, h: 19, whisper: "" },
      /* the old fallen log, lower right */
      { id: "log",       kind: "listen", courage: 1,
        x: 72, y: 80, w: 14, h: 14, whisper: "" }
    ],
    /* on the mossy rock at the left */
    petal: { x: 25, y: 52.5 }
  },
  {
    id: "moth",
    title: "The Moth",
    background: "images/scene-moth.jpg",
    lunelle: { src: "images/sprites/lunelle-moth.png", x: 10, bottom: 4, w: 28 },
    courageRequired: 5,
    petalHint: "Can you find the hidden petal?",
    hotspots: [
      /* the fireflies among the trees, upper left */
      { id: "fireflies", kind: "watch",  courage: 1,
        x: 18, y: 24, w: 12, h: 14, whisper: "" },
      /* the stepping stones along the path */
      { id: "stones",    kind: "listen", courage: 1,
        x: 33, y: 72, w: 14, h: 14, whisper: "" },
      /* the luminous moon moth */
      { id: "moth",      kind: "wonder", courage: 1,
        x: 57.5, y: 25, w: 11, h: 16, whisper: "" },
      /* the big mossy boulder, right */
      { id: "boulder",   kind: "watch",  courage: 1,
        x: 66, y: 66, w: 13, h: 15, whisper: "" },
      /* the glowing blossoms, far right */
      { id: "blossoms",  kind: "wonder", courage: 1,
        x: 82, y: 63, w: 8, h: 15, whisper: "" }
    ],
    /* at the foot of the tall tree, centre-left, in the dark ferns */
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
    hotspots: [
      /* the silver trail of light winding through the valley */
      { id: "trail",     kind: "wonder", courage: 1,
        x: 12.5, y: 38, w: 11, h: 15, whisper: "" },
      /* the fireflies drifting over the pines */
      { id: "fireflies", kind: "watch",  courage: 1,
        x: 20, y: 56, w: 11, h: 14, whisper: "" },
      /* the wildflowers dotting the meadow */
      { id: "meadow",    kind: "listen", courage: 1,
        x: 34, y: 80, w: 14, h: 12, whisper: "" },
      /* the distant lake, shining in the valley */
      { id: "lake",      kind: "wonder", courage: 1,
        x: 55.5, y: 37, w: 11, h: 12, whisper: "" },
      /* the mossy boulders by the tree */
      { id: "boulder",   kind: "watch",  courage: 1,
        x: 72, y: 54, w: 15, h: 17, whisper: "" }
    ],
    /* in the dark pine cluster, middle of the valley */
    petal: { x: 41, y: 59 }
  }
];
      
