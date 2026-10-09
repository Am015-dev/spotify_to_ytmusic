# Missing assets: what is still to make, per game

Generated 9 Oct 2026 from the card data, art manifests, campaign files, hand-offs and the built pages. Page version: https://am015-dev.github.io/spotify_to_ytmusic/missing.html

- One list of everything still missing, so you can make it on the laptop. Counts are files (a music cue counts 2: versions a and b).
- Art (Google Flow): paste the game's style block in front of each prompt, keep the same seed and settings within a game, ask for 1:1 unless the size says otherwise. Never feed in scans of the original game. No text, letters or numbers in any picture.
- Target sizes are what we publish; make the picture at 1024 px or larger and we crop and convert it (the laptop prep scripts already do this).
- Music: Treblo (model v3, Advanced mode: Styles = Auto with the prompt, Lyrics = None). Make 2 versions of each cue (a and b). Save as MP3 (WAV is fine too). No vocals, never name artists, games or scores. The tool's licence must allow public game use; we log each file in ASSETS.md.
- Prompts use only our own names. Character looks are suggestions taken from the campaign text; change them if you prefer.

## Summary

| Game | Missing to MAKE (files) | Made but NOT WIRED (files) |
|---|---:|---:|
| Crown City Smash | 20 | 0 |
| Nebula Aces | 30 | 0 |
| Doorkick Dungeon | 9 | 0 |
| Shipwreck Isle | 51 | 61 |
| Sands of Qamar | 35 | 0 |
| Sunglaze | 33 | 0 |
| Rampart and Vine | 34 | 0 |
| Short Fuse | 2 | 56 |
| Tidewake | 31 | 0 |
| Hollowbough | 0 | 0 |
| The Thornbound Throne | 6 | 1 |
| Kaiten Kitchen | 13 | 29 |
| Lantern Dive | 42 | 0 |
| Cauldron Fair | 3 | 73 |
| Final Approach | 2 | 42 |
| Mainhattan Nightrun | 0 | 0 |
| **Total** | **311** | **262** |

## To make, per game

### Crown City Smash (`games/crown-city-smash/`)

**20 to make.** 8 of 9 monster pictures, 3 boss clips and 8 3D models are made and wired. Left: Clampede, 2 card backs, 2 tables, title and end art, music.

Style block (paste in front of every art prompt for this game):

> Bold hand-painted gouache illustration for a cheerful giant-monster city-brawl dice game, thick dark ink outline, saturated neon-night city colours, playful and a little menacing but never gory, simple readable silhouette, centred, no text

**Clampede (the only monster without a picture)**

- [ ] `games/crown-city-smash/camp-clampede.webp` (1:1, target 512x512 WebP)
  - Prompt: Clampede, a clam-headed centipede monster with a teal shell, many little legs and a toothy grin, crawling out of a glowing portal in a night city, bust portrait, centred
- [ ] `games/crown-city-smash/cut-clampede.webp` (1:1 on plain white or transparent, we key it)
  - Prompt: the same Clampede, full body, front three-quarter view, cut-out on a plain white background, same framing as the other cut-*.webp monsters
  - Note: Used as the avatar chip next to scores.

**Campaign unlocks, title and end art (games/crown-city-smash/media/)**

- [ ] `games/crown-city-smash/media/back-bulletin.webp` (3:4, target 300x426 WebP)
  - Prompt: a card back made of old newspaper print texture with one bold black-ink star in the centre, only grey scribble lines instead of readable words, portrait card back filling the whole card edge to edge, symmetrical, flat, no text
  - Note: Campaign unlock "Bulletin newsprint card back".
- [ ] `games/crown-city-smash/media/back-brass-beetle.webp` (3:4, target 300x426 WebP)
  - Prompt: a brass clockwork scarab beetle emblem in the centre of a dark teal card back, riveted border, portrait card back filling the whole card edge to edge, symmetrical, flat, no text
  - Note: Campaign unlock "Brass Beetle card back".
- [ ] `games/crown-city-smash/media/table-harbor-night.webp` (16:9, target 1376x768 WebP)
  - Prompt: a city harbour at night: dark water, wooden piers, neon reflections at the edges, seen from above, big calm empty area in the centre for the game pieces, edges busier than the middle
  - Note: Campaign table unlock "Harbor at Night".
- [ ] `games/crown-city-smash/media/table-spire-gold.webp` (16:9, target 1376x768 WebP)
  - Prompt: a golden plaza paving with an art-deco star inlay, brass railings at the edges, seen from above, big calm empty area in the centre for the game pieces, edges busier than the middle
  - Note: Campaign table unlock "Golden Spire".
- [ ] `games/crown-city-smash/media/title.webp` (16:9, target 1302x726 WebP)
  - Prompt: giant friendly monsters (a boar with lightning tusks, a one-eyed squid, a lava crab, a mushroom brute, a robot) stomping through a neon city at night, a golden crown glinting above the tallest tower, keep the top of the picture calm and clear for the game logo
- [ ] `games/crown-city-smash/media/title-phone.webp` (9:16, target 744x1334 WebP)
  - Prompt: giant friendly monsters (a boar with lightning tusks, a one-eyed squid, a lava crab, a mushroom brute, a robot) stomping through a neon city at night, a golden crown glinting above the tallest tower, keep the top of the picture calm and clear for the game logo, portrait orientation
- [ ] `games/crown-city-smash/media/end-win.webp` (16:9, target 1302x726 WebP)
  - Prompt: the winning monster on top of the tallest skyscraper wearing a golden crown, confetti and fireworks, other monsters cheering below, no text
- [ ] `games/crown-city-smash/media/end-lose.webp` (16:9, target 1302x726 WebP)
  - Prompt: the monster flattened in a smoky street with dizzy stars circling its head, its dropped crown rolling away, no text

**Music (none new yet: one CC0 loop is in the game)**

- [ ] `games-src/audio/crown/treblo/tavern-a.mp3 and tavern-b.mp3` (90 s seamless loop)
  - Prompt: Playful big-band monster-movie menu theme, 108 BPM, C major, bouncy upright bass, brass section, vibraphone and handclaps, a little retro-sci-fi theremin wobble, cheeky and heroic. Seamless loop, 90 seconds, no vocals.
- [ ] `games-src/audio/crown/treblo/main-a.mp3 and main-b.mp3` (2 min seamless loop)
  - Prompt: Mischievous city-stomp instrumental, 100 BPM, A minor, walking bass, muted trumpets, finger snaps, brushed snare, tuba stabs, confident and comic, sits under dice and card sounds without getting in the way. Seamless loop, 2 minutes, no vocals, no big crescendos.
- [ ] `games-src/audio/crown/treblo/fight-a.mp3 and fight-b.mp3` (60 s seamless loop)
  - Prompt: Comic giant-monster battle instrumental, 138 BPM, E minor, pounding toms and taiko, gritty baritone sax riffs, brass hits, thundering low strings. Exciting but funny. Seamless loop, 60 seconds, no vocals.
- [ ] `games-src/audio/crown/treblo/victory-a.mp3 and victory-b.mp3` (20 s, clean ending)
  - Prompt: Triumphant big-band fanfare with a crowd cheer and a fireworks sparkle, 120 BPM, C major, bright brass and cymbal swells. 20 seconds with a clean ending, no vocals.
- [ ] `games-src/audio/crown/treblo/defeat-a.mp3 and defeat-b.mp3` (10 s, clean ending)
  - Prompt: Comic sad-trombone lament with a deflating tuba, 70 BPM, D minor, a wry two-note shrug at the end. Funny, not depressing. 10 seconds with a clean ending, no vocals.

- Optional: Back default for the power cards: not listed; the cards are drawn in code.

### Nebula Aces (`games/nebula-aces/`)

**30 to make.** Nothing painted yet (ships and mat are 3D in code). Whole campaign kit missing.

Style block (paste in front of every art prompt for this game):

> Hand-painted gouache sci-fi illustration for a starfighter duel game, deep indigo space, glowing engine light, clean readable shapes, retro-futurist, rich but not neon colours, no text

**Campaign portraits (games/nebula-aces/media/)**

- [ ] `games/nebula-aces/media/camp-brecken.webp` (1:1, target 256x256 WebP)
  - Prompt: Marshal Odile Brecken, a stern middle-aged woman fleet marshal in a high-collared uniform with silver braid, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/nebula-aces/media/camp-kael.webp` (1:1, target 256x256 WebP)
  - Prompt: Kael Varro, a young eager rookie pilot with a flight helmet under his arm and a nervous grin, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/nebula-aces/media/camp-quill.webp` (1:1, target 256x256 WebP)
  - Prompt: Quill Marren, a bookish wing pilot with round goggles pushed up on a flight cap and a notebook, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/nebula-aces/media/camp-drill.webp` (1:1, target 256x256 WebP)
  - Prompt: Drill Wing Flight Officer, a young officer in a bright training flight suit with a trainer-wing patch, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/nebula-aces/media/camp-knife.webp` (1:1, target 256x256 WebP)
  - Prompt: "Knifepoint", a lean daring ace pilot with a scar and a sharp grin, visor pushed up, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/nebula-aces/media/camp-hammer.webp` (1:1, target 256x256 WebP)
  - Prompt: Hammer Squadron Lead, a broad heavy-armour bomber commander with huge shoulders and a stern jaw, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/nebula-aces/media/camp-hex.webp` (1:1, target 256x256 WebP)
  - Prompt: "Hex", a mysterious woman pilot swarm leader with a jinx charm necklace and glowing eyes under her visor, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/nebula-aces/media/camp-sorin.webp` (1:1, target 256x256 WebP)
  - Prompt: Sorin Vael, a proud fearless pilot in red armour with a flame-red scarf, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/nebula-aces/media/camp-kira.webp` (1:1, target 256x256 WebP)
  - Prompt: Kira Scald, a patient gunship hunter with a steady stare and scorched armour, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/nebula-aces/media/camp-wailer.webp` (1:1, target 256x256 WebP)
  - Prompt: "Wailer", a loud swarm wing leader with a bellowing open mouth and a cracked helmet, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/nebula-aces/media/camp-castigan.webp` (1:1, target 256x256 WebP)
  - Prompt: Lord Castigan, a cold exact dark-lord admiral in black and silver armour with a high collar, bust portrait, head and shoulders, centred, plain simple background

**Card backs, tables, title and end art (games/nebula-aces/media/)**

- [ ] `games/nebula-aces/media/back-default.webp` (3:4, target 300x426 WebP)
  - Prompt: a deep-space card back with a faint star field and a small golden compass-star in the centre, portrait card back filling the whole card edge to edge, symmetrical, flat, no text
  - Note: Default card/tile back.
- [ ] `games/nebula-aces/media/back-rift-crown.webp` (3:4, target 300x426 WebP)
  - Prompt: a crown-shaped tear in space glowing violet and gold on a starfield card back, portrait card back filling the whole card edge to edge, symmetrical, flat, no text
  - Note: Campaign unlock: Card back: The Rift Crown
- [ ] `games/nebula-aces/media/table-default.webp` (16:9, target 1376x768 WebP)
  - Prompt: an empty deep-space battle mat with faint star dust and a very subtle dark blue grid at the edges, seen from above, big calm empty area in the centre for the game pieces, edges busier than the middle
  - Note: Default table behind the board.
- [ ] `games/nebula-aces/media/table-default-phone.webp` (9:16, target 768x1376 WebP)
  - Prompt: an empty deep-space battle mat with faint star dust and a very subtle dark blue grid at the edges, seen from above, big calm empty area in the centre for the game pieces, edges busier than the middle, portrait orientation
  - Note: Phone version of the default table.
- [ ] `games/nebula-aces/media/table-nebula7.webp` (16:9, target 1376x768 WebP)
  - Prompt: swirling rusty-orange nebula dust over black space at the edges, calm dark centre, seen from above, big calm empty area in the centre for the game pieces, edges busier than the middle
  - Note: Campaign unlock: Battlefield skin: Nebula-7 dust
- [ ] `games/nebula-aces/media/title.webp` (16:9, target 1302x726 WebP)
  - Prompt: two starfighters in a close dogfight in front of a huge glowing nebula, engine trails, a small fleet far behind, keep the top of the picture calm and clear for the game logo
- [ ] `games/nebula-aces/media/title-phone.webp` (9:16, target 744x1334 WebP)
  - Prompt: two starfighters in a close dogfight in front of a huge glowing nebula, engine trails, a small fleet far behind, keep the top of the picture calm and clear for the game logo, portrait orientation
- [ ] `games/nebula-aces/media/end-win.webp` (16:9, target 1302x726 WebP)
  - Prompt: a squadron of starfighters flying home in victory formation past a shining ringed planet, no text
- [ ] `games/nebula-aces/media/end-lose.webp` (16:9, target 1302x726 WebP)
  - Prompt: a crippled starfighter drifting with sparks and smoke, the silhouette of an enemy cruiser behind, no text

**Music (one CC0 loop is in the game, nothing new yet)**

- [ ] `games-src/audio/nebula/treblo/tavern-a.mp3 and tavern-b.mp3` (90 s seamless loop)
  - Prompt: Heroic retro-future space-opera menu theme, 96 BPM, D minor lifting to D major, warm analog synth pads, a French horn melody, a soft arpeggio, hopeful and adventurous. Seamless loop, 90 seconds, no vocals.
- [ ] `games-src/audio/nebula/treblo/main-a.mp3 and main-b.mp3` (2 min seamless loop)
  - Prompt: Calm tactical space-duel underscore, 88 BPM, F sharp minor, pulsing analog bass, glassy arpeggios, distant brass swells, tense but never frantic, sits under dice rolls and voice lines. Seamless loop, 2 minutes, no vocals, no big crescendos.
- [ ] `games-src/audio/nebula/treblo/fight-a.mp3 and fight-b.mp3` (60 s seamless loop)
  - Prompt: Driving starfighter dogfight instrumental, 140 BPM, B minor, tight snare, staccato strings, brass stabs and a rough synth lead, urgent and exciting. Seamless loop, 60 seconds, no vocals.
- [ ] `games-src/audio/nebula/treblo/victory-a.mp3 and victory-b.mp3` (20 s, clean ending)
  - Prompt: Triumphant space-opera fanfare, brass and strings with a bright synth shimmer, 120 BPM, D major. 20 seconds with a clean ending, no vocals.
- [ ] `games-src/audio/nebula/treblo/defeat-a.mp3 and defeat-b.mp3` (10 s, clean ending)
  - Prompt: Sombre falling synth and low strings with a fading radio-static tail, 60 BPM, D minor. 10 seconds with a clean ending, no vocals.

- Optional: Pilot and upgrade card pictures: none painted (the game uses code-drawn card faces). Not on this list unless you want a card set.

### Doorkick Dungeon (`games/doorkick-dungeon/`)

**9 to make.** Cards (147/147), portraits, backs, tables, title, end art, 6 boss clips and music loops are all made and wired. Left: one boss clip and the sound extras.

**Boss reveal clip**

- [ ] `games/doorkick-dungeon/media/doorkick-twins-boss.mp4` (16:9 video, 6 s, no audio; target 854x480 H.264 MP4)
  - Prompt: Step 1, new still (Flow refused the old card picture, which shows two ghost children): two identical tall hooded skeleton gravediggers holding hands in a candlelit crypt doorway, mist at their feet, glowing pale eyes, grinning, storybook gouache. Step 2, image-to-video from that still: slow cinematic push-in, the twins sway in perfect sync, mist drifts, eyes flare once, candle flames flicker, 6 seconds, no audio, no text.
  - Note: Also repaint the Doorkick card painting twins.webp from the same still if you like the new look.

**Sound extras (Treblo or any text-to-sound tool; the 5 music loops are already done)**

- [ ] `games-src/audio/doorkick/treblo/stinger-level.mp3` (under 2 s)
  - Prompt: Short medieval game sound effect, bright lute strum rising into a small bell chime, a happy level-up, under 2 seconds, dry, no reverb tail, no vocals.
- [ ] `games-src/audio/doorkick/treblo/stinger-win.mp3` (under 2 s)
  - Prompt: Short medieval game sound effect, short brass fanfare three notes up with a cymbal sparkle, under 2 seconds, dry, no reverb tail, no vocals.
- [ ] `games-src/audio/doorkick/treblo/stinger-lose.mp3` (under 2 s)
  - Prompt: Short medieval game sound effect, descending bassoon wah-wah with a soft drum thud, comic, under 2 seconds, dry, no reverb tail, no vocals.
- [ ] `games-src/audio/doorkick/treblo/stinger-turn.mp3` (under 2 s)
  - Prompt: Short medieval game sound effect, a single warm hand-drum tap plus a lute pluck, a gentle "your turn", under 2 seconds, dry, no reverb tail, no vocals.
- [ ] `games-src/audio/doorkick/treblo/stinger-bad.mp3` (under 2 s)
  - Prompt: Short medieval game sound effect, two quick low plucks slightly off-key, a playful "nope", under 2 seconds, dry, no reverb tail, no vocals.
- [ ] `games-src/audio/doorkick/treblo/stinger-boss.mp3` (under 2 s)
  - Prompt: Short medieval game sound effect, deep war-drum hit with a low horn blast and a door-slam crack, under 2 seconds, dry, no reverb tail, no vocals.
- [ ] `games-src/audio/doorkick/treblo/stinger-curse.mp3` (under 2 s)
  - Prompt: Short medieval game sound effect, spooky rising glass-harmonica shimmer with a goblin giggle and no words, under 2 seconds, dry, no reverb tail, no vocals.
- [ ] `games-src/audio/doorkick/treblo/amb-tavern.mp3` (60 s seamless loop)
  - Prompt: Medieval tavern ambience loop: distant crowd chatter with no clear words, mugs clinking, a crackling fireplace, creaking floorboards. 60 seconds, seamless loop.

- Optional: Sock Slurper test clip (slurper.mp4, 8 s) exists only on the laptop; not needed.

### Shipwreck Isle (`games/shipwreck-isle/`)

**51 to make.** (2026-10-09: the 50 card paintings, the default back and the Treblo music are now wired in; card list page `games/shipwreck-isle/cards.html`.) Part 2 (discoveries, wrecks, characters, portraits, backs, tables, title and end screens) is still to make; Flow paused it with an "unusual activity" refusal.

Style block (paste in front of every art prompt for this game):

> Tropical castaway gouache illustration for a co-operative island survival card game, turquoise, sand, jungle green and driftwood colours, soft rim light, matte paper texture, slightly wobbly dark ink outline, simple readable silhouette that works small, centred, plenty of margin, no text

**Card art, part 2 (all 256x256, same set as the part 1 pictures in games-src/rc/art/)**

- [ ] `games-src/rc/art/beast-alligator.webp` (1:1, target 256x256 WebP (send 1024 PNG/JPEG))
  - Prompt: an alligator surfacing in murky swamp water with eyes and snout above the surface, jungle roots, one grumpy eye on the viewer
  - Note: Alligator
- [ ] `games-src/rc/art/beast-birds.webp` (1:1, target 256x256 WebP (send 1024 PNG/JPEG))
  - Prompt: a noisy flock of colourful tropical birds bursting out of a palm tree, feathers flying
  - Note: Birds
- [ ] `games-src/rc/art/item-stormglass.webp` (1:1, target 256x256 WebP (send 1024 PNG/JPEG))
  - Prompt: a glass vial of cloudy crystal liquid in a small brass stand, swirling storm clouds inside
  - Note: Storm Glass
- [ ] `games-src/rc/art/item-bible.webp` (1:1, target 256x256 WebP (send 1024 PNG/JPEG))
  - Prompt: a battered, salt-stained leather prayer book with a frayed ribbon bookmark, resting on driftwood
  - Note: Prayer Book
- [ ] `games-src/rc/art/disc-candles.webp` (1:1, target 256x256 WebP (send 1024 PNG/JPEG))
  - Prompt: three melted candle stubs in a clam shell, tiny flame
  - Note: Candle Stubs
- [ ] `games-src/rc/art/disc-fallentree.webp` (1:1, target 256x256 WebP (send 1024 PNG/JPEG))
  - Prompt: a huge fallen jungle tree trunk across a path, ferns and moss, good timber
  - Note: Fallen Tree
- [ ] `games-src/rc/art/disc-goat.webp` (1:1, target 256x256 WebP (send 1024 PNG/JPEG))
  - Prompt: a curious wild mountain goat with curved horns on a rocky ledge
  - Note: Wild Goat
- [ ] `games-src/rc/art/disc-healherbs.webp` (1:1, target 256x256 WebP (send 1024 PNG/JPEG))
  - Prompt: a bundle of soft green healing leaves tied with vine, a small glow
  - Note: Healing Leaves
- [ ] `games-src/rc/art/disc-herbs.webp` (1:1, target 256x256 WebP (send 1024 PNG/JPEG))
  - Prompt: a bunch of purple-flowered calming herbs in a coconut shell
  - Note: Calming Herbs
- [ ] `games-src/rc/art/disc-leaves.webp` (1:1, target 256x256 WebP (send 1024 PNG/JPEG))
  - Prompt: a stack of enormous glossy palm and banana leaves, perfect for a roof
  - Note: Big Leaves
- [ ] `games-src/rc/art/disc-larvae.webp` (1:1, target 256x256 WebP (send 1024 PNG/JPEG))
  - Prompt: a wooden bowl of fat white grubs on a log, cheerful and slightly gross
  - Note: Grubs
- [ ] `games-src/rc/art/disc-machete.webp` (1:1, target 256x256 WebP (send 1024 PNG/JPEG))
  - Prompt: a rusty old machete half buried in sand with a worn wooden handle
  - Note: Old Machete
- [ ] `games-src/rc/art/disc-poison.webp` (1:1, target 256x256 WebP (send 1024 PNG/JPEG))
  - Prompt: a hollow reed dripping sickly green sap, a warning skull-shaped leaf
  - Note: Poison Sap
- [ ] `games-src/rc/art/disc-thorns.webp` (1:1, target 256x256 WebP (send 1024 PNG/JPEG))
  - Prompt: a tangle of long-thorned bushes with red berries, a torn scrap of cloth caught on them
  - Note: Thorn Bushes
- [ ] `games-src/rc/art/disc-tobacco.webp` (1:1, target 256x256 WebP (send 1024 PNG/JPEG))
  - Prompt: tall wild tobacco plants with big leaves and pink flowers drying on a rack
  - Note: Wild Tobacco
- [ ] `games-src/rc/art/disc-treasure.webp` (1:1, target 256x256 WebP (send 1024 PNG/JPEG))
  - Prompt: a gold coin glinting in beach sand with a small shell, sparkle
  - Note: Glint in the Sand
- [ ] `games-src/rc/art/disc-veggies.webp` (1:1, target 256x256 WebP (send 1024 PNG/JPEG))
  - Prompt: a basket of wild roots, yams and green shoots
  - Note: Wild Vegetables
- [ ] `games-src/rc/art/disc-sc1.webp` (1:1, target 256x256 WebP (send 1024 PNG/JPEG))
  - Prompt: a carved weathered stone idol fragment half sunk in moss
  - Note: Scenario find I. The four scenario finds are only suggestions; the game needs four distinct pictures.
- [ ] `games-src/rc/art/disc-sc2.webp` (1:1, target 256x256 WebP (send 1024 PNG/JPEG))
  - Prompt: a brass ship's compass with a cracked glass lying in the sand
  - Note: Scenario find II. The four scenario finds are only suggestions; the game needs four distinct pictures.
- [ ] `games-src/rc/art/disc-sc3.webp` (1:1, target 256x256 WebP (send 1024 PNG/JPEG))
  - Prompt: a ring of bleached shells around a scrap of old treasure map
  - Note: Scenario find III. The four scenario finds are only suggestions; the game needs four distinct pictures.
- [ ] `games-src/rc/art/disc-sc4.webp` (1:1, target 256x256 WebP (send 1024 PNG/JPEG))
  - Prompt: a half-buried iron lockbox with a rusty padlock
  - Note: Scenario find IV. The four scenario finds are only suggestions; the game needs four distinct pictures.
- [ ] `games-src/rc/art/wreck-crates.webp` (1:1, target 256x256 WebP (send 1024 PNG/JPEG))
  - Prompt: wooden crates and barrels bobbing in shallow turquoise surf, a rope trailing
  - Note: Crates on the Tide
- [ ] `games-src/rc/art/wreck-seachest.webp` (1:1, target 256x256 WebP (send 1024 PNG/JPEG))
  - Prompt: a brass-bound sea chest floating on calm water, a gull perched on the lid
  - Note: Floating Sea Chest
- [ ] `games-src/rc/art/wreck-dinghy.webp` (1:1, target 256x256 WebP (send 1024 PNG/JPEG))
  - Prompt: a smashed wooden dinghy washed onto the sand, splintered planks, one oar
  - Note: Smashed Dinghy
- [ ] `games-src/rc/art/char-carpenter.webp` (1:1, target 256x256 WebP (send 1024 PNG/JPEG))
  - Prompt: The Carpenter: a sturdy castaway carpenter in a torn shirt, tool belt, sawdust in his beard, determined
  - Note: Character card picture. We crop media/camp-carpenter.webp from this one.
- [ ] `games-src/rc/art/char-cook.webp` (1:1, target 256x256 WebP (send 1024 PNG/JPEG))
  - Prompt: The Cook: a round cheerful castaway ship's cook in a stained apron holding a ladle
  - Note: Character card picture. We crop media/camp-cook.webp from this one.
- [ ] `games-src/rc/art/char-explorer.webp` (1:1, target 256x256 WebP (send 1024 PNG/JPEG))
  - Prompt: The Explorer: a lean sunburnt castaway explorer with a rolled map, a spyglass and a wide hat
  - Note: Character card picture. We crop media/camp-explorer.webp from this one.
- [ ] `games-src/rc/art/char-soldier.webp` (1:1, target 256x256 WebP (send 1024 PNG/JPEG))
  - Prompt: The Soldier: a weary castaway soldier in a tattered red coat with a flintlock pistol on his belt
  - Note: Character card picture. We crop media/camp-soldier.webp from this one.
- [ ] `games-src/rc/art/char-friday.webp` (1:1, target 256x256 WebP (send 1024 PNG/JPEG))
  - Prompt: Friday: a young islander with a calm kind face and a woven bracelet, wary but friendly
  - Note: Character card picture. We crop media/camp-friday.webp from this one.

**Portraits, card backs, tables, title and end screens (games/shipwreck-isle/media/)**

- [ ] `games/shipwreck-isle/media/camp-log.webp` (1:1, target 256x256 WebP)
  - Prompt: the Ship's Log: an open weathered ship's logbook with a quill, a lantern and a pressed leaf, still life, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/shipwreck-isle/media/camp-ada.webp` (1:1, target 256x256 WebP)
  - Prompt: Ada: a pale exhausted young woman castaway wrapped in a blanket on the beach, hopeful eyes (the rescue clock runs on her), bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/shipwreck-isle/media/camp-hunger.webp` (1:1, target 256x256 WebP)
  - Prompt: Gnawing Hunger: an empty wooden bowl with a gaunt grey shadow looming behind it, bust portrait, head and shoulders, centred, plain simple background
  - Note: Boss/threat portrait, drawn as a symbolic picture rather than a face.
- [ ] `games/shipwreck-isle/media/camp-rain.webp` (1:1, target 256x256 WebP)
  - Prompt: The Long Rain: a heavy grey curtain of rain over a thatched roof, drips and puddles, bust portrait, head and shoulders, centred, plain simple background
  - Note: Boss/threat portrait, drawn as a symbolic picture rather than a face.
- [ ] `games/shipwreck-isle/media/camp-prowlers.webp` (1:1, target 256x256 WebP)
  - Prompt: The Night Prowlers: pairs of glowing eyes in dark jungle undergrowth, a shape of paws, bust portrait, head and shoulders, centred, plain simple background
  - Note: Boss/threat portrait, drawn as a symbolic picture rather than a face.
- [ ] `games/shipwreck-isle/media/camp-horizon.webp` (1:1, target 256x256 WebP)
  - Prompt: The Empty Horizon: an endless empty ocean horizon at dusk with a lone floating bottle, bust portrait, head and shoulders, centred, plain simple background
  - Note: Boss/threat portrait, drawn as a symbolic picture rather than a face.
- [ ] `games/shipwreck-isle/media/camp-whisper.webp` (1:1, target 256x256 WebP)
  - Prompt: The Whispering Fog: thick fog between palm trunks with faint ghostly shapes, bust portrait, head and shoulders, centred, plain simple background
  - Note: Boss/threat portrait, drawn as a symbolic picture rather than a face.
- [ ] `games/shipwreck-isle/media/camp-altar.webp` (1:1, target 256x256 WebP)
  - Prompt: The Altar Shadows: a mossy stone altar in a jungle ruin with a shadowy figure and carved totems, bust portrait, head and shoulders, centred, plain simple background
  - Note: Boss/threat portrait, drawn as a symbolic picture rather than a face.
- [ ] `games/shipwreck-isle/media/camp-shroud.webp` (1:1, target 256x256 WebP)
  - Prompt: The Grey Shroud: a cold grey shroud of mist wrapping a dead tree on the shore, bust portrait, head and shoulders, centred, plain simple background
  - Note: Boss/threat portrait, drawn as a symbolic picture rather than a face.
- [ ] `games/shipwreck-isle/media/camp-gale.webp` (1:1, target 256x256 WebP)
  - Prompt: The Autumn Gale: a storm bending palms, flying leaves and a torn sail, bust portrait, head and shoulders, centred, plain simple background
  - Note: Boss/threat portrait, drawn as a symbolic picture rather than a face.
- [ ] `games/shipwreck-isle/media/camp-winter.webp` (1:1, target 256x256 WebP)
  - Prompt: The Lean Season: a bare frosty field, a thin sack of grain and withered crops, bust portrait, head and shoulders, centred, plain simple background
  - Note: Boss/threat portrait, drawn as a symbolic picture rather than a face.
- [ ] `games/shipwreck-isle/media/camp-undertow.webp` (1:1, target 256x256 WebP)
  - Prompt: The Undertow: dark water dragging at a broken driftwood palisade on the beach, bust portrait, head and shoulders, centred, plain simple background
  - Note: Boss/threat portrait, drawn as a symbolic picture rather than a face.
- [ ] `games/shipwreck-isle/media/back-cross.webp` (3:4, target 300x426 WebP)
  - Prompt: a driftwood cross lashed with rope on a sand-coloured card back with a faint compass rose, portrait card back filling the whole card edge to edge, symmetrical, flat, no text
  - Note: Campaign card back unlock "Driftwood Cross".
- [ ] `games/shipwreck-isle/media/back-lifeboat.webp` (3:4, target 300x426 WebP)
  - Prompt: a small wooden lifeboat on turquoise waves, rope border, portrait card back filling the whole card edge to edge, symmetrical, flat, no text
  - Note: Campaign card back unlock "The Lifeboat".
- [ ] `games/shipwreck-isle/media/table-beach.webp` (16:9, target 1376x768 WebP)
  - Prompt: a sandy beach camp: pale sand, a line of surf and shells and driftwood at the edges, seen from above, big calm empty area in the centre for the game pieces, edges busier than the middle
  - Note: Default table.
- [ ] `games/shipwreck-isle/media/table-beach-phone.webp` (9:16, target 768x1376 WebP)
  - Prompt: a sandy beach camp: pale sand, a line of surf and shells and driftwood at the edges, seen from above, big calm empty area in the centre for the game pieces, edges busier than the middle, portrait orientation
  - Note: Phone version of the default table.
- [ ] `games/shipwreck-isle/media/table-temple-ruins.webp` (16:9, target 1376x768 WebP)
  - Prompt: mossy ancient temple ruins floor: cracked stone slabs, roots and vines at the edges, a faint carved glyph ring, seen from above, big calm empty area in the centre for the game pieces, edges busier than the middle
  - Note: Campaign table unlock.
- [ ] `games/shipwreck-isle/media/table-homestead.webp` (16:9, target 1376x768 WebP)
  - Prompt: a cosy castaway homestead yard: packed earth, a woven fence, a drying rack and a campfire ring at the edges, seen from above, big calm empty area in the centre for the game pieces, edges busier than the middle
  - Note: Campaign table unlock.
- [ ] `games/shipwreck-isle/media/title.webp` (16:9, target 1302x726 WebP)
  - Prompt: castaways on a storm-lashed beach in front of a wrecked ship, a small camp with a smoking fire, a dog, a jungle ridge behind, dramatic turquoise sky, keep the top of the picture calm and clear for the game logo
- [ ] `games/shipwreck-isle/media/title-phone.webp` (9:16, target 744x1334 WebP)
  - Prompt: castaways on a storm-lashed beach in front of a wrecked ship, a small camp with a smoking fire, a dog, a jungle ridge behind, dramatic turquoise sky, keep the top of the picture calm and clear for the game logo, portrait orientation
- [ ] `games/shipwreck-isle/media/end-win.webp` (16:9, target 1302x726 WebP)
  - Prompt: the castaways waving from a hill as a rescue ship sails into a sunny turquoise bay, a dog beside them, no text
- [ ] `games/shipwreck-isle/media/end-lose.webp` (16:9, target 1302x726 WebP)
  - Prompt: an empty beach at dusk, a cold campfire, a lone sail disappearing on the horizon, a gull, no text

- Optional: Event, adventure and mystery cards have no pictures (drawn in code).

### Sands of Qamar (`games/sands-of-qamar/`)

**35 to make.** Nothing painted yet. Whole campaign kit missing.

Style block (paste in front of every art prompt for this game):

> Hand-painted gouache illustration for a bazaar-and-palace bidding game, warm sand, copper and lapis blue, lantern light, soft rim light, matte paper texture, slightly wobbly dark brown outline, simple readable silhouette, no text

**Campaign portraits (games/sands-of-qamar/media/)**

- [ ] `games/sands-of-qamar/media/camp-hadiya.webp` (1:1, target 256x256 WebP)
  - Prompt: Old Hadiya, a wise old woman storyteller in a patterned headscarf with a tea glass, kind eyes, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/sands-of-qamar/media/camp-you.webp` (1:1, target 256x256 WebP)
  - Prompt: You, a hopeful young caravan heir in a travelling cloak and a copper amulet, face lit by a lantern, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/sands-of-qamar/media/camp-farid.webp` (1:1, target 256x256 WebP)
  - Prompt: Farid the Water-Boy, a cheerful careless boy carrying two water skins on a yoke, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/sands-of-qamar/media/camp-layla.webp` (1:1, target 256x256 WebP)
  - Prompt: Layla Coin-Counter, a thrifty young woman with a leather coin purse and a pair of scales, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/sands-of-qamar/media/camp-yusra.webp` (1:1, target 256x256 WebP)
  - Prompt: Yusra of the Copper Scales, a shrewd merchant woman with copper scales and a greedy glint, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/sands-of-qamar/media/camp-tahir.webp` (1:1, target 256x256 WebP)
  - Prompt: Master Tahir, a patient steady master merchant with a grey beard and a ledger, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/sands-of-qamar/media/camp-sabah.webp` (1:1, target 256x256 WebP)
  - Prompt: Sabah the Silk-Seller, a flashy rich woman draped in bright silks and jewellery, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/sands-of-qamar/media/camp-marwan.webp` (1:1, target 256x256 WebP)
  - Prompt: Grand Advisor Marwan, a calm calculating court advisor in a tall turban and a long robe, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/sands-of-qamar/media/camp-zubaida.webp` (1:1, target 256x256 WebP)
  - Prompt: Zubaida of the Lamp, a mysterious woman with a glowing brass lamp and star-patterned veil, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/sands-of-qamar/media/camp-qays.webp` (1:1, target 256x256 WebP)
  - Prompt: Qays and Kamil, two cheeky brothers grinning side by side, matching striped scarves, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/sands-of-qamar/media/camp-nimr.webp` (1:1, target 256x256 WebP)
  - Prompt: Nimr of the Night Roads, a quiet ruthless camel rider in a dark indigo cloak with a camel behind him, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/sands-of-qamar/media/camp-qadira.webp` (1:1, target 256x256 WebP)
  - Prompt: Qadira the Uncrowned, a proud clever young queen-to-be with a gold circlet and a djinn smoke curl, bust portrait, head and shoulders, centred, plain simple background

**Card backs, tables, title and end art (games/sands-of-qamar/media/)**

- [ ] `games/sands-of-qamar/media/back-default.webp` (3:4, target 300x426 WebP)
  - Prompt: a card back with a repeating copper-and-lapis geometric pattern and a small crescent moon in the centre, portrait card back filling the whole card edge to edge, symmetrical, flat, no text
  - Note: Default card/tile back.
- [ ] `games/sands-of-qamar/media/back-copper.webp` (3:4, target 300x426 WebP)
  - Prompt: a copper-scale pattern card back with a small round medallion, portrait card back filling the whole card edge to edge, symmetrical, flat, no text
  - Note: Campaign unlock: Copper-scale card back
- [ ] `games/sands-of-qamar/media/back-lamp.webp` (3:4, target 300x426 WebP)
  - Prompt: a golden oil-lamp emblem in the centre of a deep blue card back with stars, portrait card back filling the whole card edge to edge, symmetrical, flat, no text
  - Note: Campaign unlock: Lamp card back
- [ ] `games/sands-of-qamar/media/table-default.webp` (16:9, target 1376x768 WebP)
  - Prompt: a market stall table top seen from above: woven rug in sand and copper, brass trays and spice bowls at the edges, seen from above, big calm empty area in the centre for the game pieces, edges busier than the middle
  - Note: Default table behind the board.
- [ ] `games/sands-of-qamar/media/table-default-phone.webp` (9:16, target 768x1376 WebP)
  - Prompt: a market stall table top seen from above: woven rug in sand and copper, brass trays and spice bowls at the edges, seen from above, big calm empty area in the centre for the game pieces, edges busier than the middle, portrait orientation
  - Note: Phone version of the default table.
- [ ] `games/sands-of-qamar/media/table-workshop.webp` (16:9, target 1376x768 WebP)
  - Prompt: a craftsman workshop bench: scarred wood, small tools and copper filings at the edges, seen from above, big calm empty area in the centre for the game pieces, edges busier than the middle
  - Note: Campaign unlock: Workshop table skin
- [ ] `games/sands-of-qamar/media/table-court.webp` (16:9, target 1376x768 WebP)
  - Prompt: a palace court floor of cool white marble with lapis inlay at the edges, seen from above, big calm empty area in the centre for the game pieces, edges busier than the middle
  - Note: Campaign unlock: Court table skin
- [ ] `games/sands-of-qamar/media/table-night.webp` (16:9, target 1376x768 WebP)
  - Prompt: night desert sands under a star-filled sky with soft dune ripples at the edges, seen from above, big calm empty area in the centre for the game pieces, edges busier than the middle
  - Note: Campaign unlock: Night-sands table skin
- [ ] `games/sands-of-qamar/media/table-palace.webp` (16:9, target 1376x768 WebP)
  - Prompt: a golden palace carpet with ornate borders and tassels at the edges, seen from above, big calm empty area in the centre for the game pieces, edges busier than the middle
  - Note: Campaign unlock: Palace table skin
- [ ] `games/sands-of-qamar/media/title.webp` (16:9, target 1302x726 WebP)
  - Prompt: a lantern-lit desert bazaar at dusk with a gleaming palace on the hill, a caravan of camels, merchants haggling in the foreground and an empty golden throne glimpsed in the palace window, keep the top of the picture calm and clear for the game logo
- [ ] `games/sands-of-qamar/media/title-phone.webp` (9:16, target 744x1334 WebP)
  - Prompt: a lantern-lit desert bazaar at dusk with a gleaming palace on the hill, a caravan of camels, merchants haggling in the foreground and an empty golden throne glimpsed in the palace window, keep the top of the picture calm and clear for the game logo, portrait orientation
- [ ] `games/sands-of-qamar/media/end-win.webp` (16:9, target 1302x726 WebP)
  - Prompt: the heir crowned on a golden throne under a rain of petals, the whole bazaar cheering, no text
- [ ] `games/sands-of-qamar/media/end-lose.webp` (16:9, target 1302x726 WebP)
  - Prompt: an empty market at night, the unclaimed throne in the distance, a rolled-up rug and a lone camel, no text

**Music (one CC0 loop is in the game, nothing new yet)**

- [ ] `games-src/audio/sands/treblo/tavern-a.mp3 and tavern-b.mp3` (90 s seamless loop)
  - Prompt: Warm bazaar menu theme, 100 BPM, D Phrygian, oud and frame drum with a light darbuka groove, a reed flute answering, hand claps, welcoming and mysterious. Seamless loop, 90 seconds, no vocals.
- [ ] `games-src/audio/sands/treblo/main-a.mp3 and main-b.mp3` (2 min seamless loop)
  - Prompt: Patient desert-market bidding underscore, 92 BPM, A minor, plucked oud, soft tabla, low strings pad, a wooden flute motif, calm and clever, sits under card and coin sounds. Seamless loop, 2 minutes, no vocals, no big crescendos.
- [ ] `games-src/audio/sands/treblo/fight-a.mp3 and fight-b.mp3` (60 s seamless loop)
  - Prompt: Tense palace-intrigue showdown, 128 BPM, E Phrygian, driving frame drums, urgent oud and violin runs, low brass drones. Exciting and sly. Seamless loop, 60 seconds, no vocals.
- [ ] `games-src/audio/sands/treblo/victory-a.mp3 and victory-b.mp3` (20 s, clean ending)
  - Prompt: Joyful coronation fanfare, brass, oud and hand drums with a shimmering bell tree, 116 BPM, D major. 20 seconds with a clean ending, no vocals.
- [ ] `games-src/audio/sands/treblo/defeat-a.mp3 and defeat-b.mp3` (10 s, clean ending)
  - Prompt: Wistful descending oud and a soft low flute, a fading drum, 66 BPM, D minor. 10 seconds with a clean ending, no vocals.

### Sunglaze (`games/sunglaze/`)

**33 to make.** Nothing painted yet (tiles are drawn in code). Whole campaign kit missing.

Style block (paste in front of every art prompt for this game):

> Hand-painted gouache illustration for a glazed-tile mosaic workshop game, jewel-bright glaze colours, warm kiln glow, matte paper texture, slightly wobbly dark ink outline, simple readable silhouette, no text

**Campaign portraits (games/sunglaze/media/)**

- [ ] `games/sunglaze/media/camp-ochre.webp` (1:1, target 256x256 WebP)
  - Prompt: Mother Ochre, a warm elderly master tile-maker with a clay-stained apron and kind eyes, a kiln glow behind her, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/sunglaze/media/camp-tamsin.webp` (1:1, target 256x256 WebP)
  - Prompt: Tamsin Reed, a cheerful fellow apprentice with a messy braid and glaze-splattered smock, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/sunglaze/media/camp-bram.webp` (1:1, target 256x256 WebP)
  - Prompt: Bram Kettle, a big-handed kiln stoker with soot on his cheeks and a leather apron, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/sunglaze/media/camp-saffra.webp` (1:1, target 256x256 WebP)
  - Prompt: Saffra Vell, Keeper of the Courtyard, a proud woman with a sun-gold sash and a tall collar, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/sunglaze/media/camp-cobb.webp` (1:1, target 256x256 WebP)
  - Prompt: Cobb the Sorter, a careful guild sorter with spectacles and a tray of tiles, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/sunglaze/media/camp-iris.webp` (1:1, target 256x256 WebP)
  - Prompt: Iris Prismwright, a dreamy glass artist with rainbow light on her face and a prism pendant, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/sunglaze/media/camp-garnet.webp` (1:1, target 256x256 WebP)
  - Prompt: Master Garnet Hale, a stern guild master in deep red robes with a measuring rod, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/sunglaze/media/camp-nell.webp` (1:1, target 256x256 WebP)
  - Prompt: Nell Frost, a cool patient gatekeeper in pale blue with frosted hair pins, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/sunglaze/media/camp-twins.webp` (1:1, target 256x256 WebP)
  - Prompt: The Lumen Twins, two playful lamp-lighters grinning side by side holding little lamps, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/sunglaze/media/camp-vesper.webp` (1:1, target 256x256 WebP)
  - Prompt: Vesper Ash, a quiet precise servant of the Black Kiln in charcoal robes with ash-grey hair, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/sunglaze/media/camp-umbra.webp` (1:1, target 256x256 WebP)
  - Prompt: Lady Umbra of the Black Kiln, a cold elegant mistress in black glazed-tile armour with violet eyes, bust portrait, head and shoulders, centred, plain simple background

**Card backs, tables, title and end art (games/sunglaze/media/)**

- [ ] `games/sunglaze/media/back-default.webp` (3:4, target 300x426 WebP)
  - Prompt: a tile back with a repeating tiny sun and mosaic pattern in glazed blue and gold, a small sun medallion in the centre, portrait card back filling the whole card edge to edge, symmetrical, flat, no text
  - Note: Default card/tile back.
- [ ] `games/sunglaze/media/back-guild-seal.webp` (3:4, target 300x426 WebP)
  - Prompt: a round guild seal in gold on deep blue glazed tile backs, portrait card back filling the whole card edge to edge, symmetrical, flat, no text
  - Note: Campaign unlock: Guild seal tile backs
- [ ] `games/sunglaze/media/back-lamplight.webp` (3:4, target 300x426 WebP)
  - Prompt: a warm lamp glow over cream tile backs with a faint pattern, portrait card back filling the whole card edge to edge, symmetrical, flat, no text
  - Note: Campaign unlock: Lamplight tile backs
- [ ] `games/sunglaze/media/table-default.webp` (16:9, target 1376x768 WebP)
  - Prompt: a tile-workshop table top seen from above: pale plaster surface with clay dust, brushes and glaze jars at the edges, seen from above, big calm empty area in the centre for the game pieces, edges busier than the middle
  - Note: Default table behind the board.
- [ ] `games/sunglaze/media/table-default-phone.webp` (9:16, target 768x1376 WebP)
  - Prompt: a tile-workshop table top seen from above: pale plaster surface with clay dust, brushes and glaze jars at the edges, seen from above, big calm empty area in the centre for the game pieces, edges busier than the middle, portrait orientation
  - Note: Phone version of the default table.
- [ ] `games/sunglaze/media/table-prism-light.webp` (16:9, target 1376x768 WebP)
  - Prompt: soft rainbow prism light patterns on a pale stone surface, seen from above, big calm empty area in the centre for the game pieces, edges busier than the middle
  - Note: Campaign unlock: Prism-light table
- [ ] `games/sunglaze/media/table-unmarked-slate.webp` (16:9, target 1376x768 WebP)
  - Prompt: plain dark slate slab with chalk marks at the edges, seen from above, big calm empty area in the centre for the game pieces, edges busier than the middle
  - Note: Campaign unlock: Unmarked slate table
- [ ] `games/sunglaze/media/table-sun-palace.webp` (16:9, target 1376x768 WebP)
  - Prompt: a golden sunburst mosaic floor of a palace courtyard at the edges, seen from above, big calm empty area in the centre for the game pieces, edges busier than the middle
  - Note: Campaign unlock: Sun Palace table
- [ ] `games/sunglaze/media/title.webp` (16:9, target 1302x726 WebP)
  - Prompt: a glowing mosaic workshop with a half-finished sunburst tile wall, apprentices carrying trays of bright glazed tiles, a big kiln glowing at the back, keep the top of the picture calm and clear for the game logo
- [ ] `games/sunglaze/media/title-phone.webp` (9:16, target 744x1334 WebP)
  - Prompt: a glowing mosaic workshop with a half-finished sunburst tile wall, apprentices carrying trays of bright glazed tiles, a big kiln glowing at the back, keep the top of the picture calm and clear for the game logo, portrait orientation
- [ ] `games/sunglaze/media/end-win.webp` (16:9, target 1302x726 WebP)
  - Prompt: the finished sunburst mosaic wall lit by golden light, the apprentices cheering and tossing tiles, no text
- [ ] `games/sunglaze/media/end-lose.webp` (16:9, target 1302x726 WebP)
  - Prompt: a cracked unfinished mosaic and a cold black kiln, scattered grey tiles, no text

**Music (one CC0 loop is in the game, nothing new yet)**

- [ ] `games-src/audio/sunglaze/treblo/tavern-a.mp3 and tavern-b.mp3` (90 s seamless loop)
  - Prompt: Bright workshop menu theme, 104 BPM, G major, marimba and glockenspiel, plucked strings, soft shaker, a clarinet melody, warm and cheerful, like sunlight on tiles. Seamless loop, 90 seconds, no vocals.
- [ ] `games-src/audio/sunglaze/treblo/main-a.mp3 and main-b.mp3` (2 min seamless loop)
  - Prompt: Calm focused tile-laying underscore, 90 BPM, D major, gentle marimba ostinato, soft pizzicato strings, a flute motif, relaxed and thoughtful, sits under tile clicks. Seamless loop, 2 minutes, no vocals, no big crescendos.
- [ ] `games-src/audio/sunglaze/treblo/fight-a.mp3 and fight-b.mp3` (60 s seamless loop)
  - Prompt: Tense final-round kiln countdown, 124 BPM, A minor, ticking woodblock, driving pizzicato, rising strings, quick marimba runs, playful pressure. Seamless loop, 60 seconds, no vocals.
- [ ] `games-src/audio/sunglaze/treblo/victory-a.mp3 and victory-b.mp3` (20 s, clean ending)
  - Prompt: Radiant celebration fanfare, glockenspiel, brass and bells, 120 BPM, G major. 20 seconds with a clean ending, no vocals.
- [ ] `games-src/audio/sunglaze/treblo/defeat-a.mp3 and defeat-b.mp3` (10 s, clean ending)
  - Prompt: Gentle sad descending marimba and a soft low clarinet, 64 BPM, E minor. 10 seconds with a clean ending, no vocals.

### Rampart and Vine (`games/rampart-and-vine/`)

**34 to make.** Nothing painted yet (tiles are drawn in code). Whole campaign kit missing.

Style block (paste in front of every art prompt for this game):

> Hand-painted gouache illustration for a medieval valley tile-laying game, green fields, stone towers and vines, warm afternoon light, matte paper texture, slightly wobbly dark brown outline, simple readable silhouette, no text

**Campaign portraits (games/rampart-and-vine/media/)**

- [ ] `games/rampart-and-vine/media/camp-tamsin.webp` (1:1, target 256x256 WebP)
  - Prompt: Old Tamsin, a kindly old village storyteller with a walking stick and a shawl, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/rampart-and-vine/media/camp-garnet.webp` (1:1, target 256x256 WebP)
  - Prompt: Garnet, a hopeful young settler with a travelling pack and a determined smile, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/rampart-and-vine/media/camp-hob.webp` (1:1, target 256x256 WebP)
  - Prompt: Hob the Carter, a friendly careless carter with a straw hat and a cart of barrels, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/rampart-and-vine/media/camp-wren.webp` (1:1, target 256x256 WebP)
  - Prompt: Wren Ashlar, a proud mason's apprentice with a trowel and a stone-dust smudge, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/rampart-and-vine/media/camp-mabry.webp` (1:1, target 256x256 WebP)
  - Prompt: Mabry Furrow, a slow-talking farmer in a patched smock holding a pitchfork, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/rampart-and-vine/media/camp-quill.webp` (1:1, target 256x256 WebP)
  - Prompt: Brother Quill, a calm patient monk in a brown habit with a quill and a small book, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/rampart-and-vine/media/camp-ferro.webp` (1:1, target 256x256 WebP)
  - Prompt: Ferro the Boatman, a steady practical ferryman with a pole and a woollen cap, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/rampart-and-vine/media/camp-dulcie.webp` (1:1, target 256x256 WebP)
  - Prompt: Dulcie Tapwell, a bold gambling tavern keeper with a dice cup and a wink, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/rampart-and-vine/media/camp-ostrand.webp` (1:1, target 256x256 WebP)
  - Prompt: Reeve Ostrand, a cold bookkeeper reeve with a ledger and thin spectacles, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/rampart-and-vine/media/camp-isolde.webp` (1:1, target 256x256 WebP)
  - Prompt: Isolde of Lilac Hall, a polite exact noblewoman in a lilac gown with a tiny crown, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/rampart-and-vine/media/camp-corvin.webp` (1:1, target 256x256 WebP)
  - Prompt: Corvin Blackmere, a sly grasping lord in black velvet with a ring on every finger, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/rampart-and-vine/media/camp-baron.webp` (1:1, target 256x256 WebP)
  - Prompt: The Sable Baron, an arrogant ruthless baron in black plate armour with a sable cloak, bust portrait, head and shoulders, centred, plain simple background

**Card backs, tables, title and end art (games/rampart-and-vine/media/)**

- [ ] `games/rampart-and-vine/media/back-default.webp` (3:4, target 300x426 WebP)
  - Prompt: a tile back with a repeating vine-and-tower pattern in green and stone grey, a small round tower medallion in the centre, portrait card back filling the whole card edge to edge, symmetrical, flat, no text
  - Note: Default card/tile back.
- [ ] `games/rampart-and-vine/media/back-tavern.webp` (3:4, target 300x426 WebP)
  - Prompt: a swinging tavern sign emblem on a warm brown tile back, portrait card back filling the whole card edge to edge, symmetrical, flat, no text
  - Note: Campaign unlock: Tavern-sign tile back
- [ ] `games/rampart-and-vine/media/back-raven.webp` (3:4, target 300x426 WebP)
  - Prompt: a black raven emblem on a dark blue-grey tile back, portrait card back filling the whole card edge to edge, symmetrical, flat, no text
  - Note: Campaign unlock: Raven tile back
- [ ] `games/rampart-and-vine/media/table-default.webp` (16:9, target 1376x768 WebP)
  - Prompt: a farmhouse table top seen from above: scrubbed oak planks with wheat sheaves and a few apples at the edges, seen from above, big calm empty area in the centre for the game pieces, edges busier than the middle
  - Note: Default table behind the board.
- [ ] `games/rampart-and-vine/media/table-default-phone.webp` (9:16, target 768x1376 WebP)
  - Prompt: a farmhouse table top seen from above: scrubbed oak planks with wheat sheaves and a few apples at the edges, seen from above, big calm empty area in the centre for the game pieces, edges busier than the middle, portrait orientation
  - Note: Phone version of the default table.
- [ ] `games/rampart-and-vine/media/table-harvest.webp` (16:9, target 1376x768 WebP)
  - Prompt: a harvest-festival table with golden wheat, pumpkins and ribbons at the edges, seen from above, big calm empty area in the centre for the game pieces, edges busier than the middle
  - Note: Campaign unlock: Harvest table
- [ ] `games/rampart-and-vine/media/table-riverbank.webp` (16:9, target 1376x768 WebP)
  - Prompt: a riverbank: reeds, pebbles and gentle water at the edges, seen from above, big calm empty area in the centre for the game pieces, edges busier than the middle
  - Note: Campaign unlock: Riverbank table
- [ ] `games/rampart-and-vine/media/table-sable-hall.webp` (16:9, target 1376x768 WebP)
  - Prompt: a dark great-hall table with black banners and candle stubs at the edges, seen from above, big calm empty area in the centre for the game pieces, edges busier than the middle
  - Note: Campaign unlock: Sable Hall table
- [ ] `games/rampart-and-vine/media/title.webp` (16:9, target 1302x726 WebP)
  - Prompt: a sunny green valley with a small walled town, a stone rampart, vineyards on the hills, a river with a ferry, a distant dark baron castle on a ridge, keep the top of the picture calm and clear for the game logo
- [ ] `games/rampart-and-vine/media/title-phone.webp` (9:16, target 744x1334 WebP)
  - Prompt: a sunny green valley with a small walled town, a stone rampart, vineyards on the hills, a river with a ferry, a distant dark baron castle on a ridge, keep the top of the picture calm and clear for the game logo, portrait orientation
- [ ] `games/rampart-and-vine/media/end-win.webp` (16:9, target 1302x726 WebP)
  - Prompt: the whole valley celebrating at a harvest feast under bunting, the walled town gates open and glowing, no text
- [ ] `games/rampart-and-vine/media/end-lose.webp` (16:9, target 1302x726 WebP)
  - Prompt: the valley under grey clouds with the dark baron banner flying over the town gate, no text

**Music (one CC0 loop is in the game, nothing new yet)**

- [ ] `games-src/audio/rampart/treblo/tavern-a.mp3 and tavern-b.mp3` (90 s seamless loop)
  - Prompt: Cosy medieval valley menu theme, 104 BPM, G major, fiddle and tin whistle over a light hand drum and plucked lute, warm and welcoming. Seamless loop, 90 seconds, no vocals.
- [ ] `games-src/audio/rampart/treblo/main-a.mp3 and main-b.mp3` (2 min seamless loop)
  - Prompt: Pastoral medieval tile-laying underscore, 88 BPM, D major, lute, soft fiddle, recorder, gentle tambourine, relaxed and thoughtful, sits under tile clicks. Seamless loop, 2 minutes, no vocals, no big crescendos.
- [ ] `games-src/audio/rampart/treblo/fight-a.mp3 and fight-b.mp3` (60 s seamless loop)
  - Prompt: Tense rival-baron showdown, 126 BPM, E minor, driving frame drums, urgent fiddle, low horn stabs, dramatic but not scary. Seamless loop, 60 seconds, no vocals.
- [ ] `games-src/audio/rampart/treblo/victory-a.mp3 and victory-b.mp3` (20 s, clean ending)
  - Prompt: Joyful harvest-feast fanfare, brass, fiddle and hand drums, a crowd cheer at the end, 118 BPM, G major. 20 seconds with a clean ending, no vocals.
- [ ] `games-src/audio/rampart/treblo/defeat-a.mp3 and defeat-b.mp3` (10 s, clean ending)
  - Prompt: Mournful descending lute and a low recorder, a fading drum, 64 BPM, E minor. 10 seconds with a clean ending, no vocals.

### Short Fuse (`games/short-fuse/`)

**2 to make.** 32 card paintings, 6 portraits, backs, 3 tables, title and end art are made, but none of it is in the game yet. Left to make: the two phone pictures.

Style block (paste in front of every art prompt for this game):

> Workshop gouache illustration for a cheerful bomb-defusal crew card game, warm lamplight against cool blueprint blues, brass and copper wire, slightly wobbly dark ink outline, matte paper texture, simple readable silhouette, no text

**Phone pictures**

- [ ] `games/short-fuse/media/title-phone.webp` (9:16, target 744x1334 WebP)
  - Prompt: a steampunk clockmaker workshop in a tall attic, a big clock face glowing behind, four crew members (a girl in goggles, an old man with a moustache and a magnifying glass, a big smiling man, a freckled boy) leaning over a brass bomb with a sparking fuse on the workbench, keep the top of the picture calm and clear for the game logo, portrait orientation
- [ ] `games/short-fuse/media/table-workbench-phone.webp` (9:16, target 768x1376 WebP)
  - Prompt: a defusal workbench seen from above, scattered tools, blueprints and coiled copper wire at the edges, calm clear centre, seen from above, big calm empty area in the centre for the game pieces, edges busier than the middle, portrait orientation
  - Note: Phone version of table-workbench.webp.

### Tidewake (`games/tidewake/`)

**31 to make.** Nothing painted yet (tiles are drawn in code). Whole campaign kit missing.

Style block (paste in front of every art prompt for this game):

> Hand-painted gouache illustration for a sea-tile navigation game with giant sea leviathans, deep teal water, warm lantern light, foam and scales, matte paper texture, slightly wobbly dark navy outline, simple readable silhouette, no text

**Campaign portraits (games/tidewake/media/)**

- [ ] `games/tidewake/media/camp-osk.webp` (1:1, target 256x256 WebP)
  - Prompt: Grandmother Osk, a wise old sea-wife with a lantern, white braids and a knitted shawl, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/tidewake/media/camp-wick.webp` (1:1, target 256x256 WebP)
  - Prompt: Wick, a cheerful young cabin hand with a woollen cap and a rope coil, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/tidewake/media/camp-harrow.webp` (1:1, target 256x256 WebP)
  - Prompt: Gull Harrow, a swaggering toll-taker with a tricorn hat and a gull on his shoulder, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/tidewake/media/camp-brann.webp` (1:1, target 256x256 WebP)
  - Prompt: Brann Ashkeel, a loud cannoneer with a soot-streaked face and a lit fuse, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/tidewake/media/camp-saltshade.webp` (1:1, target 256x256 WebP)
  - Prompt: Saltshade, a patient leviathan with one huge calm eye surfacing, barnacle-crusted scales, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/tidewake/media/camp-sabel.webp` (1:1, target 256x256 WebP)
  - Prompt: Sabel Riftwright, a calm navigator with a brass sextant and a long coat, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/tidewake/media/camp-vey.webp` (1:1, target 256x256 WebP)
  - Prompt: Corsair Vey, a cold elegant corsair with an eyepatch and a plumed hat, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/tidewake/media/camp-crown.webp` (1:1, target 256x256 WebP)
  - Prompt: The Abyssal Crown, the eldest leviathan with a ring of black coral like a crown, glowing eyes in the deep, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/tidewake/media/camp-ysolde.webp` (1:1, target 256x256 WebP)
  - Prompt: Admiral Ysolde, a ruthless admiral in a navy greatcoat with gold epaulettes and a sharp stare, bust portrait, head and shoulders, centred, plain simple background

**Card backs, tables, title and end art (games/tidewake/media/)**

- [ ] `games/tidewake/media/back-default.webp` (3:4, target 300x426 WebP)
  - Prompt: a tile back with repeating wave and scale pattern in deep teal, a small lantern medallion in the centre, portrait card back filling the whole card edge to edge, symmetrical, flat, no text
  - Note: Default card/tile back.
- [ ] `games/tidewake/media/back-scales.webp` (3:4, target 300x426 WebP)
  - Prompt: overlapping leviathan scales in teal and silver on a tile back, portrait card back filling the whole card edge to edge, symmetrical, flat, no text
  - Note: Campaign unlock: Leviathan-scale tile back
- [ ] `games/tidewake/media/back-night.webp` (3:4, target 300x426 WebP)
  - Prompt: a night-watch tile back: dark navy with a tiny lantern and stars, portrait card back filling the whole card edge to edge, symmetrical, flat, no text
  - Note: Campaign unlock: Night-watch tile back
- [ ] `games/tidewake/media/table-default.webp` (16:9, target 1376x768 WebP)
  - Prompt: a ship chart table seen from above: aged chart paper, brass dividers and a compass at the edges, seen from above, big calm empty area in the centre for the game pieces, edges busier than the middle
  - Note: Default table behind the board.
- [ ] `games/tidewake/media/table-default-phone.webp` (9:16, target 768x1376 WebP)
  - Prompt: a ship chart table seen from above: aged chart paper, brass dividers and a compass at the edges, seen from above, big calm empty area in the centre for the game pieces, edges busier than the middle, portrait orientation
  - Note: Phone version of the default table.
- [ ] `games/tidewake/media/table-dawn.webp` (16:9, target 1376x768 WebP)
  - Prompt: calm dawn shallows, pale turquoise water with soft sunrise glints at the edges, seen from above, big calm empty area in the centre for the game pieces, edges busier than the middle
  - Note: Campaign unlock: Dawn-shallows board skin
- [ ] `games/tidewake/media/table-storm.webp` (16:9, target 1376x768 WebP)
  - Prompt: storm-tossed dark water with white foam streaks at the edges, seen from above, big calm empty area in the centre for the game pieces, edges busier than the middle
  - Note: Campaign unlock: Storm-reach board skin
- [ ] `games/tidewake/media/table-lantern.webp` (16:9, target 1376x768 WebP)
  - Prompt: night sea dotted with floating lantern glows at the edges, seen from above, big calm empty area in the centre for the game pieces, edges busier than the middle
  - Note: Campaign unlock: Lantern-night board skin
- [ ] `games/tidewake/media/title.webp` (16:9, target 1302x726 WebP)
  - Prompt: a small lantern-lit ship sailing between rocky islands at dusk while a giant leviathan eye and scaled back rise from the dark water behind it, keep the top of the picture calm and clear for the game logo
- [ ] `games/tidewake/media/title-phone.webp` (9:16, target 744x1334 WebP)
  - Prompt: a small lantern-lit ship sailing between rocky islands at dusk while a giant leviathan eye and scaled back rise from the dark water behind it, keep the top of the picture calm and clear for the game logo, portrait orientation
- [ ] `games/tidewake/media/end-win.webp` (16:9, target 1302x726 WebP)
  - Prompt: the ship sailing into a calm golden harbour with lanterns lit on the pier and the leviathan sinking peacefully away, no text
- [ ] `games/tidewake/media/end-lose.webp` (16:9, target 1302x726 WebP)
  - Prompt: a lantern floating alone on dark water with huge leviathan coils circling, the ship mast tilting under the waves, no text

**Music (one CC0 loop is in the game, nothing new yet)**

- [ ] `games-src/audio/tidewake/treblo/tavern-a.mp3 and tavern-b.mp3` (90 s seamless loop)
  - Prompt: Warm harbour-inn menu theme, 100 BPM, A minor, accordion and fiddle with a light hand drum and plucked guitar, salty and welcoming, no sea-shanty vocals. Seamless loop, 90 seconds, no vocals.
- [ ] `games-src/audio/tidewake/treblo/main-a.mp3 and main-b.mp3` (2 min seamless loop)
  - Prompt: Calm sailing underscore with a hint of mystery, 84 BPM, D minor, soft pizzicato strings, harp, low clarinet, distant foghorn tone, steady and thoughtful, sits under tile clicks. Seamless loop, 2 minutes, no vocals, no big crescendos.
- [ ] `games-src/audio/tidewake/treblo/fight-a.mp3 and fight-b.mp3` (60 s seamless loop)
  - Prompt: Leviathan chase instrumental, 132 BPM, E minor, pounding taiko and timpani, driving low strings, brass stabs, a rising sea-horn motif. Exciting and ominous. Seamless loop, 60 seconds, no vocals.
- [ ] `games-src/audio/tidewake/treblo/victory-a.mp3 and victory-b.mp3` (20 s, clean ending)
  - Prompt: Triumphant harbour fanfare, brass, accordion and bells with a crowd cheer, 118 BPM, D major. 20 seconds with a clean ending, no vocals.
- [ ] `games-src/audio/tidewake/treblo/defeat-a.mp3 and defeat-b.mp3` (10 s, clean ending)
  - Prompt: Mournful descending low strings and a distant foghorn, slow bell, 60 BPM, D minor. 10 seconds with a clean ending, no vocals.

### Hollowbough (`games/hollowbough/`)

**0 to make.** All 48 cards, portraits, backs, tables, title/end art and music are made and wired. Nothing required.

- Optional: The 11 forest locations, 8 basic locations, 4 basic events and 16 special events have no paintings (drawn in code). Only if you want a full set.

### The Thornbound Throne (`games/thornbound/`)

**6 to make.** All 51 kingdom cards (kc01 to kc51, including kc27), portraits, backs, tables, title/end art and music are made. Left: 4 faction Basic-card paintings and the painted kingdom map (2). Until they exist, the Basic cards show a crop of the faction's campaign portrait and the map shows the painted table through a parchment wash; the page picks the new files up automatically.

Style block (paste in front of every art prompt for this game):

> Dark-fairytale court painting in deep green, crimson and tarnished gold, candlelit, painterly brushwork, rich shadows, no text, no lettering, no frame.

**Faction Basic cards (one painting per faction, used behind all 14 of that faction's Basic cards)**

- [ ] `games-src/thornbound/art/basic-gilded.webp` (1:1, 256x256 WebP; make at 1024 px)
  - Prompt: a card-art vignette for The Gilded Line: a noble court: a gold-trimmed crimson banner, a jewelled signet ring and a tall candle on dark green velvet, a gilded hall behind; centred subject, calm lower third so a big number reads on top
  - Note: embedded automatically (like the kingdom paintings) as `basic-gilded`.
- [ ] `games-src/thornbound/art/basic-heath.webp` (1:1, 256x256 WebP; make at 1024 px)
  - Prompt: a card-art vignette for The Tidebound (heath clans): a windswept heath: a standing stone, a driftwood-and-rope clan standard and a tide-pool lantern, grey sea and heather behind; centred subject, calm lower third so a big number reads on top
  - Note: embedded automatically (like the kingdom paintings) as `basic-heath`.
- [ ] `games-src/thornbound/art/basic-lantern.webp` (1:1, 256x256 WebP; make at 1024 px)
  - Prompt: a card-art vignette for The Ember Guild (lantern uprising): a lantern-lit alley: a crowd of raised lanterns and a torn orange pennant, rooftops and warm ember glow behind; centred subject, calm lower third so a big number reads on top
  - Note: embedded automatically (like the kingdom paintings) as `basic-lantern`.
- [ ] `games-src/thornbound/art/basic-choir.webp` (1:1, 256x256 WebP; make at 1024 px)
  - Prompt: a card-art vignette for The Pale Vigil (moth choir): a candlelit vigil: pale moths around a single white candle and a violet veil, silver thread, an arched chapel behind; centred subject, calm lower third so a big number reads on top
  - Note: embedded automatically (like the kingdom paintings) as `basic-choir`.

**Painted kingdom map (wired automatically when present; locations, roads and the track are drawn on top)**

- [ ] `games/thornbound/media/map.webp` (16:9, 1376x768 WebP)
  - Prompt: a painted parchment map of a small thorn-hedged kingdom seen from above on a candlelit table: a ring of road around the edge, six marked places (two uplands, two tablelands, two marshes) with a crowned throne hill in the centre, a winding river, forests and ruins, ink linework in tarnished gold and green, lots of empty calm space for tokens, parchment edges fading to transparent green felt, no text, no lettering
  - Note: the page loads `map-phone` in portrait, `map` otherwise.
- [ ] `games/thornbound/media/map-phone.webp` (9:16, 768x1376 WebP)
  - Prompt: the same painted parchment kingdom map composed upright for a phone: ring road around the edge, six marked places, crowned throne hill in the centre, winding river, forests and ruins, ink linework in tarnished gold and green, calm empty space for tokens, parchment edges fading to green felt, no text, no lettering
  - Note: the page loads `map-phone` in portrait, `map` otherwise.

### Kaiten Kitchen (`games/kaiten-kitchen/`)

**13 to make.** 6 plates, belt, counter, back, title, Pip, 3 backs, 1 table, end art made. Left: 7 plates, 4 diners, 1 table, phone title.

Style block (paste in front of every art prompt for this game):

> Hand-painted gouache illustration for a cosy card game, top-down view of a single round ceramic plate, the food on the plate is a cute character with an expressive face (little eyebrows, eyelids, a clear emotion), warm-brown ink outline with a slightly wobbly brush edge, soft rim light, gentle shadow under the plate, rich but warm colours, matte paper texture, crisp at small sizes, simple readable silhouette, centred, plenty of margin, plain transparent background, no text. Do NOT put the plate on a placemat.

**Plates and diners (still painted stand-ins; the first set came out on a square placemat and is being redone)**

- [ ] `games-src/kaiten/art/sashimi.png` (1:1, 1024x1024 PNG, transparent or plain white)
  - Prompt: a sleepy slab of pink raw fish with a tiny "z" sleep puff, resting on a green leaf, on a raspberry red plate with a wave-pattern rim
  - Note: Fish Slice. Round plate, no square placemat.
- [ ] `games-src/kaiten/art/roll3.png` (1:1, 1024x1024 PNG, transparent or plain white)
  - Prompt: three round seaweed rice rolls in a triangle, yellow, green and orange fillings, cheeky faces, on a teal plate with a stripe rim
  - Note: Seaweed Roll ×3. Round plate, no square placemat.
- [ ] `games-src/kaiten/art/squid.png` (1:1, 1024x1024 PNG, transparent or plain white)
  - Prompt: a dreamy rice block topped with a pale lilac squid slice with soft ridges, a little crescent moon and stars, on an indigo plate
  - Note: Moon Nigiri. Round plate, no square placemat.
- [ ] `games-src/kaiten/art/egg.png` (1:1, 1024x1024 PNG, transparent or plain white)
  - Prompt: a happy rice block topped with a fluffy yellow omelette slice held by a thin seaweed belt, sun rays, on a lemon yellow plate
  - Note: Sun Nigiri. Round plate, no square placemat.
- [ ] `games-src/kaiten/art/wasabi.png` (1:1, 1024x1024 PNG, transparent or plain white)
  - Prompt: a fiery little green paste mound with a determined grin and small flame wisps on its head, on a lime green plate
  - Note: Fire Paste. Round plate, no square placemat.
- [ ] `games-src/kaiten/art/wasabi-nigiri.png` (1:1, 1024x1024 PNG, transparent or plain white)
  - Prompt: the green fire paste character proudly holding a nigiri on top of its head, sparkle burst, on a lime green plate
  - Note: Fire Paste + nigiri. Round plate, no square placemat.
- [ ] `games-src/kaiten/art/pudding.png` (1:1, 1024x1024 PNG, transparent or plain white)
  - Prompt: a blissful wobbly custard pudding with caramel top, a tiny chef's hat and a cherry, eyes closed in delight, on a pink plate
  - Note: Custard Cup. Round plate, no square placemat.
- [ ] `games-src/kaiten/art/chef-mina.png` (1:1, 1024x1024 PNG, round frame)
  - Prompt: a friendly cartoon diner bust portrait, round frame, braids and a headband, gouache, warm colours
  - Note: Round medallion, no placemat. We crop media/camp-mina.webp from this.
- [ ] `games-src/kaiten/art/chef-taro.png` (1:1, 1024x1024 PNG, round frame)
  - Prompt: a friendly cartoon diner bust portrait, round frame, spiky hair and a towel headband, quiet and serious, gouache, warm colours
  - Note: Round medallion, no placemat. We crop media/camp-taro.webp from this.
- [ ] `games-src/kaiten/art/chef-odile.png` (1:1, 1024x1024 PNG, round frame)
  - Prompt: a friendly cartoon diner bust portrait, round frame, a tall chef's hat, retired baker, cheerful, gouache, warm colours
  - Note: Round medallion, no placemat. We crop media/camp-odile.webp from this.
- [ ] `games-src/kaiten/art/chef-kofi.png` (1:1, 1024x1024 PNG, round frame)
  - Prompt: a friendly cartoon diner bust portrait, round frame, a bus-driver cap and a big smile, gouache, warm colours
  - Note: Round medallion, no placemat. We crop media/camp-kofi.webp from this.

**Table and phone title**

- [ ] `games/kaiten-kitchen/media/table-dinner-counter.webp` (16:9, target 1376x768 WebP)
  - Prompt: a warm wooden sushi-bar dinner counter top with a cloth runner, soft paper-lantern light, a few empty tea cups at the edges, seen from above, big calm empty area in the centre for the game pieces, edges busier than the middle
  - Note: Campaign table unlock "Dinner counter table skin".
- [ ] `games-src/kaiten/art/title-phone.png` (9:16, 1440x2560 PNG)
  - Prompt: a cosy conveyor-belt sushi bar at night, portrait orientation, paper lanterns across the top, plates of cute food characters gliding past on the belt, four friendly diners at the counter, warm light, calm top for the logo, no text
  - Note: 9:16 keeps failing in Flow; the game crops art/title.png until this exists.

### Lantern Dive (`games/lantern-dive/`)

**42 to make.** Only painted stand-ins from the code generator so far (17 pictures, none from Flow). Whole kit missing, including 9 portraits.

Style block (paste in front of every art prompt for this game):

> Hand-painted gouache illustration for a calm co-operative deep-sea card game, deep blue and teal water, a small warm golden lantern glow as the only strong warm light, soft rim light, visible gentle brush texture on matte paper, slightly wobbly dark navy ink outline, simple readable silhouette that still works at 40 pixels, rich but not neon colours, centred, plenty of margin, no text

**In-game art: Flow paintings to replace the stand-ins (games-src/lantern-dive/art/, prompts from its ART-PROMPTS.md)**

- [ ] `games-src/lantern-dive/art/emb0.png` (320x320 PNG, transparent)
  - Prompt: a single branching coral fan in raspberry pink-red, thick rounded branches, a few tiny bubbles, flat front view
  - Note: Coral suit emblem (pink-red, colour 1 of 4), printed large in the middle of cards 1-9
- [ ] `games-src/lantern-dive/art/emb1.png` (320x320 PNG, transparent)
  - Prompt: a single curling ocean wave crest in cobalt blue with a foam curl and two small droplets, flat front view
  - Note: Tide suit emblem (blue)
- [ ] `games-src/lantern-dive/art/emb2.png` (320x320 PNG, transparent)
  - Prompt: a single swaying kelp frond with three leaf blades in sea green, a small holdfast at the bottom, flat front view
  - Note: Kelp suit emblem (green)
- [ ] `games-src/lantern-dive/art/emb3.png` (320x320 PNG, transparent)
  - Prompt: a single plump five-armed starfish in golden yellow with a dotted texture on the arms, flat front view
  - Note: Sunstar suit emblem (yellow)
- [ ] `games-src/lantern-dive/art/emb4.png` (320x320 PNG, transparent)
  - Prompt: a glowing brass diving lantern with a warm pale-gold flame inside a round glass, a small ring on top, soft halo, flat front view
  - Note: Lantern emblem (the four trump cards)
- [ ] `games-src/lantern-dive/art/back.png` (320x448 PNG, opaque)
  - Prompt: a portrait card back: deep navy water with a faint pattern of tiny rising bubbles and one small pale-gold lantern glow in the middle, a thin gold inner border drawn as part of the painting, symmetrical
  - Note: Card back, shown for face-down cards and the hot-seat pass screen
- [ ] `games-src/lantern-dive/art/ping.png` (192x192 PNG, transparent)
  - Prompt: a round brass sonar ping token seen from the front: concentric pale-gold ripple rings around a small bright centre, slight dent texture on the metal
  - Note: The ping token shown over a card when a diver signals
- [ ] `games-src/lantern-dive/art/flare.png` (192x192 PNG, transparent)
  - Prompt: a small emergency flare stick with a bright orange-red flame and a puff of pink smoke, held at a slight angle, readable as a flare
  - Note: The distress flare token
- [ ] `games-src/lantern-dive/art/cmd.png` (192x192 PNG, transparent)
  - Prompt: a round brass badge with a four-pointed compass star and a tiny lantern at its centre, a short ribbon below
  - Note: The Commander badge
- [ ] `games-src/lantern-dive/art/drone.png` (256x256 PNG, transparent)
  - Prompt: a cute small yellow-and-teal underwater drone with one round glass eye, two little propellers and a tiny lantern on top, friendly, seen from the front
  - Note: Echo, the drone in 2-diver dives (avatar)
- [ ] `games-src/lantern-dive/art/diver0.png` (256x256 PNG, transparent)
  - Prompt: a friendly diver portrait in a round brass helmet with the glass open, warm brown skin, short dark curls, calm focused expression, pink-red collar, shoulders up
  - Note: Diver 1 avatar (Nerea: harbour pilot, careful)
- [ ] `games-src/lantern-dive/art/diver1.png` (256x256 PNG, transparent)
  - Prompt: a friendly diver portrait in a round brass helmet with the glass open, light skin, sandy beard and a knitted blue cap under the helmet rim, relaxed half smile, shoulders up
  - Note: Diver 2 avatar (Bram: pump fixer, steady)
- [ ] `games-src/lantern-dive/art/diver2.png` (256x256 PNG, transparent)
  - Prompt: a friendly diver portrait in a round brass helmet with the glass open, East Asian features, black bob haircut, bright curious eyes, small green notebook strap on the shoulder, shoulders up
  - Note: Diver 3 avatar (Sumi: fish scientist, signals often)
- [ ] `games-src/lantern-dive/art/diver3.png` (256x256 PNG, transparent)
  - Prompt: a friendly diver portrait in a round brass helmet with the glass open, freckled face, red-blond tufts of hair, a wide cheerful grin, a slightly too-big yellow collar, shoulders up
  - Note: Diver 4 avatar (Dag: new, cheerful)
- [ ] `games-src/lantern-dive/art/diver4.png` (256x256 PNG, transparent)
  - Prompt: a friendly diver portrait in a round brass helmet with the glass open, dark skin, a short grey-streaked beard, kind eyes, an orange scarf, shoulders up
  - Note: Diver 5 avatar (Lio: the extra diver in 5-diver crews)
- [ ] `games-src/lantern-dive/art/table.png` (1280x720 PNG, opaque)
  - Prompt: a wide view into deep ocean water, deep blue at the top fading to near-navy at the bottom, a few soft light shafts from the surface, tall kelp silhouettes at the far left and far right edges, very quiet in the centre (the cards go there), soft blurred light pools instead of line patterns (no scribbles, no thin bright lines, no outlines on the water), a little sand and a few rounded pebbles at the bottom edge, no creatures in the middle
  - Note: Table background behind the felt, drawn under all the UI
- [ ] `games-src/lantern-dive/art/title.png` (1440x810 PNG, opaque)
  - Prompt: a wide scene: a small crew of three divers on a rocky ledge looking down into a deep blue trench, each holding a glowing lantern, the lanterns reflecting in the water, a faint outline of a huge friendly whale far below, rays of light from the surface, dark navy at the bottom, leave the central lower third calm because the title and buttons sit there
  - Note: Title screen painting

**Portraits, campaign backs and table, phone title, end art (games/lantern-dive/media/)**

- [ ] `games/lantern-dive/media/camp-brack.webp` (1:1, target 256x256 WebP)
  - Prompt: Chief Ottilie Brack, a stern but warm harbour chief in a yellow oilskin with a brass whistle, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/lantern-dive/media/camp-nerea.webp` (1:1, target 256x256 WebP)
  - Prompt: Nerea, a careful harbour pilot in a diving helmet with the visor up, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/lantern-dive/media/camp-bram.webp` (1:1, target 256x256 WebP)
  - Prompt: Bram, a steady pump fixer in a patched diving suit with a wrench, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/lantern-dive/media/camp-sumi.webp` (1:1, target 256x256 WebP)
  - Prompt: Sumi, a fish scientist in a diving suit holding a glowing sample jar, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/lantern-dive/media/camp-dag.webp` (1:1, target 256x256 WebP)
  - Prompt: Dag, a new cheerful diver with a too-big helmet and a big grin, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/lantern-dive/media/camp-echo.webp` (1:1, target 256x256 WebP)
  - Prompt: Echo, a small round brass drone with one glowing eye and a little propeller, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/lantern-dive/media/camp-undertow.webp` (1:1, target 256x256 WebP)
  - Prompt: The Grey Undertow, a swirling grey current with faint hollow eyes dragging at a diver light, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/lantern-dive/media/camp-maze.webp` (1:1, target 256x256 WebP)
  - Prompt: The Thousand Turns, a drowned stone maze of endless arches and turns with a faint playful glow, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/lantern-dive/media/camp-lampless.webp` (1:1, target 256x256 WebP)
  - Prompt: The Lampless One, a vast dark shape with soft eyes that swallows the lantern light, bust portrait, head and shoulders, centred, plain simple background
- [ ] `games/lantern-dive/media/back-wreck-brass.webp` (3:4, target 300x426 WebP)
  - Prompt: corroded wreck brass plates and rivets on a deep teal card back, a tiny lantern in the middle, portrait card back filling the whole card edge to edge, symmetrical, flat, no text
  - Note: Campaign unlock "Wreck-brass card back".
- [ ] `games/lantern-dive/media/back-last-light.webp` (3:4, target 300x426 WebP)
  - Prompt: a single pale-gold lantern glow in pitch-dark water on a card back, tiny bubbles, portrait card back filling the whole card edge to edge, symmetrical, flat, no text
  - Note: Campaign unlock "Last-light card back".
- [ ] `games/lantern-dive/media/table-tunnel-glow.webp` (16:9, target 1376x768 WebP)
  - Prompt: a drowned tunnel floor: dark stone, glowing algae and a faint gold glow at the edges, seen from above, big calm empty area in the centre for the game pieces, edges busier than the middle
  - Note: Campaign unlock "Tunnel-glow table".
- [ ] `games/lantern-dive/media/title-phone.webp` (9:16, target 744x1334 WebP)
  - Prompt: a small crew of divers with lanterns swimming down a drowned road lined with ruins, a huge dark shape in the deep behind them, keep the top of the picture calm and clear for the game logo, portrait orientation
- [ ] `games/lantern-dive/media/end-win.webp` (16:9, target 1302x726 WebP)
  - Prompt: the divers surfacing into a bright dawn with their lanterns lit, a drone circling happily, no text
- [ ] `games/lantern-dive/media/end-lose.webp` (16:9, target 1302x726 WebP)
  - Prompt: a lone lantern sinking into black water, bubbles rising, a drowned road below, no text

**Music (a CC0 underwater loop and a water pad are in the game; nothing new)**

- [ ] `games-src/audio/lantern-dive/treblo/tavern-a.mp3 and tavern-b.mp3` (90 s seamless loop)
  - Prompt: Calm underwater menu theme, 78 BPM, F major, glass harmonica, soft harp, deep warm pad, distant whale-like cello, gentle bubbles, wondrous and safe. Seamless loop, 90 seconds, no vocals.
- [ ] `games-src/audio/lantern-dive/treblo/main-a.mp3 and main-b.mp3` (2 min seamless loop)
  - Prompt: Quiet cooperative deep-sea underscore, 72 BPM, D minor, slow harp arpeggios, soft pad, a lone flute, sparse sonar pings, calm and focused, sits under whispered signals. Seamless loop, 2 minutes, no vocals, no big crescendos.
- [ ] `games-src/audio/lantern-dive/treblo/fight-a.mp3 and fight-b.mp3` (60 s seamless loop)
  - Prompt: Tense deep-sea pursuit instrumental, 112 BPM, E minor, pulsing sub bass, taiko heartbeat, urgent pizzicato strings, rising brass swells. Ominous but never scary. Seamless loop, 60 seconds, no vocals.
- [ ] `games-src/audio/lantern-dive/treblo/victory-a.mp3 and victory-b.mp3` (20 s, clean ending)
  - Prompt: Radiant surfacing fanfare, harp glissando, warm strings and bells rising to sunlight, 100 BPM, F major. 20 seconds with a clean ending, no vocals.
- [ ] `games-src/audio/lantern-dive/treblo/defeat-a.mp3 and defeat-b.mp3` (10 s, clean ending)
  - Prompt: Slow sinking low strings and a fading sonar ping, 56 BPM, D minor. 10 seconds with a clean ending, no vocals.

### Cauldron Fair (`games/cauldron-fair/`)

**3 to make.** 27 table pieces, 24 fortune cards, portraits, bag skins, end screens and 2 tables are made. Left: Tamsin redo and 2 phone pictures.

Style block (paste in front of every art prompt for this game):

> Hand-painted gouache illustration for a cosy fantasy-fair board game, warm brown ink outline with a slightly wobbly brush edge, soft rim light, matte paper texture, rich but warm colours, simple readable silhouette that still works at 60 px wide, centred, plenty of margin, no text, no numbers

**Art**

- [ ] `games-src/cauldron-fair/art/char-tamsin.png` (1:1, 1024x1024 PNG, transparent or plain white)
  - Prompt: Tamsin, the Feather Seer: a clever young woman seer, cartoon bust portrait, pointed blue hat with wren feathers, round spectacles, mysterious grin, long dark hair, definitely not an old man with a beard
  - Note: Flow made her an old bearded man; the story says "her stall". Also gives us camp-tamsin.webp (we crop it).
- [ ] `games-src/cauldron-fair/art/table-phone.png` (9:16, 1440x2560 PNG)
  - Prompt: a night-time village fair seen from above-front, portrait orientation: dark violet sky with stars at the top, strings of triangular bunting, a striped tent at each side edge, a wooden stall counter along the bottom, big calm empty area in the centre, warm lantern glow, painted
  - Note: Flow failed twice on 9:16; try 3:4 or paint a tall version and crop.
- [ ] `games-src/cauldron-fair/art/title-phone.png` (9:16, 1620x2880 PNG)
  - Prompt: the same village fair at dusk, portrait orientation: four makers (a braided herbalist, a straw-hatted dealer, a feathered seer, a red-scarfed brewer) behind their cauldrons stacked left and right, bunting overhead, keep the top middle calm for the logo, no text
  - Note: Flow failed twice on 9:16; the game crops the desktop title until this exists.

### Final Approach (`games/final-approach/`)

**2 to make.** Sky and terrain strips, planes, crew, title and end art, 10 portraits, backs, 3 tables are made. Left: 1 portrait and the phone title.

Style block (paste in front of every art prompt for this game):

> Hand-painted gouache illustration for a cosy cockpit game, chunky soft shapes with a slightly wobbly dark navy outline, matte paper grain, rich but warm colours (teal panel, warm cream highlights, blue and orange crew colours), gentle rim light, soft drop shadow, crisp and readable at very small sizes, simple silhouettes, no text, no numbers

**Portraits and title**

- [ ] `games/final-approach/media/camp-palmreach.webp` (1:1, target 256x256 WebP)
  - Prompt: Palmreach Tower, the tower that never answers: a silent tropical control tower window with an empty radio headset swinging on its hook, warm rain on the glass, palm fronds outside, a small tail-wind flag, bust portrait, head and shoulders, centred, plain simple background
  - Note: Quote in the campaign: "Palmreach (no reply)". 256x256.
- [ ] `games/final-approach/media/title-phone.webp` (9:16, target 744x1334 WebP)
  - Prompt: the cockpit view of a passenger plane lining up on a runway at dusk, two pilots (a captain in a blue cap and a first officer in an orange cap) seen from behind in the foreground, warm instrument glow, runway lights ahead, keep the top of the picture calm and clear for the game logo, portrait orientation

- Optional: Check ter-water.png: the hand-off says it shows a cream band over the sky; repaint with a transparent top only if it looks wrong in the game.

### Mainhattan Nightrun (`games/mainhattan-nightrun/`)

**0 to make.** Nothing missing: all 8 stage tracks (menu, 3 stages, 2 bosses, 2 endless) are in games/mainhattan-nightrun/music/ and wired. Owned by the Game Night orchestrator.

## Made but NOT wired (work for us, not the owner)

Files that exist in the repo but the live game does not use yet. This is our work (rebuild, wiring, deploy), not yours.

### Shipwreck Isle (61 files)

- [ ] 50 card paintings in games-src/rc/art/ (14 beasts, 30 inventions, 6 items) + manifest.json: embed as SW_ART in build.py and show on the cards (50)
- [ ] media/back-default.webp (card back) (1)
- [ ] Treblo music: games-src/audio/shipwreck/treblo/ has 10 tracks; nothing in games/shipwreck-isle/music/ (10)

### Short Fuse (56 files)

- [x] Short Fuse: all painted art and Treblo music wired and deployed 9 Oct (32 cards, portraits, backs, 3 tables, title/end art, music with picker, cards.html). Still to make: title-phone and table-workbench-phone.

### The Thornbound Throne (1 files)

- [ ] games/thornbound/media/back-court.webp (the "crowned stag" deck back) is not used by the page; only back-default and the campaign unlocks are. (1)

### Kaiten Kitchen: all wired and deployed 9 Oct (11 paintings, artBase portraits, 3 card backs, midnight-belt table, end art, Treblo music with Music picker)

### Cauldron Fair (done 9 Oct 2026, live)

- [x] 27 Flow paintings rebuilt and deployed; portraits via artBase `media/`; bag skins (moss-bag, ember-bag), table skins (market-cloth, judges-tent) and end-win/end-lose wired
- [x] 24 fortune cards shown on the fortune bar, chip, long-press card, option box and card list; `games/cauldron-fair/cards.html` (built by `cauldron-fair/cards-page.js`)
- [x] Treblo music (10 tracks in `games/cauldron-fair/music/`), per-screen crossfades, Music picker
- [ ] Still to make: Tamsin redo (char-tamsin.png, Flow drew a bearded man), table-phone.png and title-phone.png (9:16)

### Final Approach (42 files): wired and deployed 9 Oct (paintings, portraits, backs, 3 table skins, Treblo music with Music picker incl. Shuffle all songs, end art)

- [x] 17 Flow paintings in games-src/final-approach/art/*.png (sky x4, terrain x5, planes x2, crew x2, title, end-land, end-crash; committed 9 Oct, built page is the 8 Oct one): rebuild and deploy (17)
- [x] 10 portraits media/camp-*.webp: no artBase set (10)
- [x] 2 card backs media/back-default.webp and back-spires.webp (2)
- [x] 3 table skins media/table-night-lake.webp, table-storm.webp, table-valley.webp (3)
- [x] Treblo music: games-src/audio/final-approach/treblo/ has 10 tracks; nothing in games/final-approach/music/ (10)

