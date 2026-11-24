# Inbox: vinegrave

Drop finished pictures (png, jpg or webp, 1024 px or larger), music/sound (mp3, wav) or boss clips (mp4) in this folder, then run `python3 games-src/scripts/ingest-assets.py` from the repo root. Names are matched without caring about case, `_` vs `-`, `(1)` suffixes or png/webp.
Originals move to `done/` (not committed). Run with `--check` first to see what would happen without writing anything.

The **Wired** column says what happens after the drop: `auto` = shows up in the game, `fallback` = shows up, but the game needs a fallback for the missing-file case (script lists it), `wiring` = a code change is still needed.

## Pictures (the to-make list) (179)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `board-map.webp` | 1600x1000 | 16:10 | no | Main board island map backdrop with three terraces (cover) | auto |
| `card-airship.webp` | 400x300 | 4:3 | no | Card picture for Survey Airship (item card, frame and numbers drawn by the game) | auto |
| `card-almanac.webp` | 400x300 | 4:3 | no | Card picture for Tide Almanac (item card, frame and numbers drawn by the game) | auto |
| `card-ancestor-mask.webp` | 400x300 | 4:3 | no | Card picture for Ancestor Mask (artifact card, frame and numbers drawn by the game) | auto |
| `card-ash-urn.webp` | 400x300 | 4:3 | no | Card picture for Ash Urn (artifact card, frame and numbers drawn by the game) | auto |
| `card-back.webp` | 300x420 | 5:7 | no | Face-down card back (deck and discard piles) | auto |
| `card-bat-wing-fan.webp` | 400x300 | 4:3 | no | Card picture for Bat Wing Fan (artifact card, frame and numbers drawn by the game) | auto |
| `card-bone-dice.webp` | 400x300 | 4:3 | no | Card picture for Bone Dice (artifact card, frame and numbers drawn by the game) | auto |
| `card-brush.webp` | 400x300 | 4:3 | no | Card picture for Soft Brush (item card, frame and numbers drawn by the game) | auto |
| `card-camera.webp` | 400x300 | 4:3 | no | Card picture for Box Camera (item card, frame and numbers drawn by the game) | auto |
| `card-canteen.webp` | 400x300 | 4:3 | no | Card picture for Dented Canteen (item card, frame and numbers drawn by the game) | auto |
| `card-chisel.webp` | 400x300 | 4:3 | no | Card picture for Mason Chisel (item card, frame and numbers drawn by the game) | auto |
| `card-clay-cup.webp` | 400x300 | 4:3 | no | Card picture for Clay Cup (artifact card, frame and numbers drawn by the game) | auto |
| `card-codebook.webp` | 400x300 | 4:3 | no | Card picture for Cipher Codebook (item card, frame and numbers drawn by the game) | auto |
| `card-coral-throne.webp` | 400x300 | 4:3 | no | Card picture for Coral Throne (artifact card, frame and numbers drawn by the game) | auto |
| `card-crate.webp` | 400x300 | 4:3 | no | Card picture for Supply Crate (item card, frame and numbers drawn by the game) | auto |
| `card-dinghy.webp` | 400x300 | 4:3 | no | Card picture for Rubber Dinghy (item card, frame and numbers drawn by the game) | auto |
| `card-dread.webp` | 400x300 | 4:3 | no | Card picture for Creeping Dread (fear card, frame and numbers drawn by the game) | auto |
| `card-ember-mask.webp` | 400x300 | 4:3 | no | Card picture for Ember Mask (artifact card, frame and numbers drawn by the game) | auto |
| `card-feather-cloak.webp` | 400x300 | 4:3 | no | Card picture for Feather Cloak (artifact card, frame and numbers drawn by the game) | auto |
| `card-flares.webp` | 400x300 | 4:3 | no | Card picture for Signal Flares (item card, frame and numbers drawn by the game) | auto |
| `card-frame-art.webp` | 300x420 | 5:7 | yes (flat white background, we key it) | Card frame overlay for art cards (empty centre) | auto |
| `card-frame-fear.webp` | 300x420 | 5:7 | yes (flat white background, we key it) | Card frame overlay for fear cards (empty centre) | auto |
| `card-frame-item.webp` | 300x420 | 5:7 | yes (flat white background, we key it) | Card frame overlay for item cards (empty centre) | auto |
| `card-gilded-beetle.webp` | 400x300 | 4:3 | no | Card picture for Gilded Beetle (artifact card, frame and numbers drawn by the game) | auto |
| `card-glyph-stone.webp` | 400x300 | 4:3 | no | Card picture for Glyph Stone (artifact card, frame and numbers drawn by the game) | auto |
| `card-gold-mask.webp` | 400x300 | 4:3 | no | Card picture for Sunken Gold Mask (artifact card, frame and numbers drawn by the game) | auto |
| `card-gramophone.webp` | 400x300 | 4:3 | no | Card picture for Camp Gramophone (item card, frame and numbers drawn by the game) | auto |
| `card-grant.webp` | 400x300 | 4:3 | no | Card picture for Patron Letter (item card, frame and numbers drawn by the game) | auto |
| `card-hammock.webp` | 400x300 | 4:3 | no | Card picture for Jungle Hammock (item card, frame and numbers drawn by the game) | auto |
| `card-hatchet.webp` | 400x300 | 4:3 | no | Card picture for Trail Hatchet (item card, frame and numbers drawn by the game) | prefix |
| `card-jade-frog.webp` | 400x300 | 4:3 | no | Card picture for Jade Frog (artifact card, frame and numbers drawn by the game) | auto |
| `card-jeepkey.webp` | 400x300 | 4:3 | no | Card picture for Spare Jeep Key (item card, frame and numbers drawn by the game) | auto |
| `card-journal.webp` | 400x300 | 4:3 | no | Card picture for Dusty Journal (item card, frame and numbers drawn by the game) | auto |
| `card-kettle.webp` | 400x300 | 4:3 | no | Card picture for Camp Kettle (item card, frame and numbers drawn by the game) | auto |
| `card-lamp.webp` | 400x300 | 4:3 | no | Card picture for Tin Lamp (item card, frame and numbers drawn by the game) | auto |
| `card-lantern.webp` | 400x300 | 4:3 | no | Card picture for Storm Lantern (item card, frame and numbers drawn by the game) | prefix |
| `card-lava-blade.webp` | 400x300 | 4:3 | no | Card picture for Lava Blade (artifact card, frame and numbers drawn by the game) | auto |
| `card-ledger.webp` | 400x300 | 4:3 | no | Card picture for Trade Ledger (item card, frame and numbers drawn by the game) | auto |
| `card-lockbox.webp` | 400x300 | 4:3 | no | Card picture for Iron Lockbox (item card, frame and numbers drawn by the game) | auto |
| `card-machete.webp` | 400x300 | 4:3 | no | Card picture for Brush Machete (item card, frame and numbers drawn by the game) | auto |
| `card-mapcase.webp` | 400x300 | 4:3 | no | Card picture for Leather Map Case (item card, frame and numbers drawn by the game) | auto |
| `card-moon-comb.webp` | 400x300 | 4:3 | no | Card picture for Moon Comb (artifact card, frame and numbers drawn by the game) | auto |
| `card-moss-idol.webp` | 400x300 | 4:3 | no | Card picture for Moss Figurine (artifact card, frame and numbers drawn by the game) | auto |
| `card-mule.webp` | 400x300 | 4:3 | no | Card picture for Pack Mule (item card, frame and numbers drawn by the game) | auto |
| `card-obsidian-mirror.webp` | 400x300 | 4:3 | no | Card picture for Obsidian Mirror (artifact card, frame and numbers drawn by the game) | auto |
| `card-old-codex.webp` | 400x300 | 4:3 | no | Card picture for Old Codex (artifact card, frame and numbers drawn by the game) | auto |
| `card-owl-totem.webp` | 400x300 | 4:3 | no | Card picture for Owl Totem (artifact card, frame and numbers drawn by the game) | auto |
| `card-permit.webp` | 400x300 | 4:3 | no | Card picture for Dig Permit (item card, frame and numbers drawn by the game) | auto |
| `card-pickaxe.webp` | 400x300 | 4:3 | no | Card picture for Short Pickaxe (item card, frame and numbers drawn by the game) | auto |
| `card-quiver.webp` | 400x300 | 4:3 | no | Card picture for Hunter Quiver (item card, frame and numbers drawn by the game) | auto |
| `card-radio.webp` | 400x300 | 4:3 | no | Card picture for Field Radio (item card, frame and numbers drawn by the game) | auto |
| `card-rain-drum.webp` | 400x300 | 4:3 | no | Card picture for Rain Drum (artifact card, frame and numbers drawn by the game) | auto |
| `card-reed-flute.webp` | 400x300 | 4:3 | no | Card picture for Reed Flute (artifact card, frame and numbers drawn by the game) | auto |
| `card-root-sceptre.webp` | 400x300 | 4:3 | no | Card picture for Root Sceptre (artifact card, frame and numbers drawn by the game) | auto |
| `card-rope.webp` | 400x300 | 4:3 | no | Card picture for Coil of Rope (item card, frame and numbers drawn by the game) | auto |
| `card-ropebridge.webp` | 400x300 | 4:3 | no | Card picture for Rope Bridge Kit (item card, frame and numbers drawn by the game) | auto |
| `card-satchel.webp` | 400x300 | 4:3 | no | Card picture for Field Satchel (item card, frame and numbers drawn by the game) | auto |
| `card-scale.webp` | 400x300 | 4:3 | no | Card picture for Jeweller Scale (item card, frame and numbers drawn by the game) | auto |
| `card-seaplane.webp` | 400x300 | 4:3 | no | Card picture for Seaplane Ticket (item card, frame and numbers drawn by the game) | auto |
| `card-serpent-ring.webp` | 400x300 | 4:3 | no | Card picture for Serpent Ring (artifact card, frame and numbers drawn by the game) | auto |
| `card-sextant.webp` | 400x300 | 4:3 | no | Card picture for Brass Sextant (item card, frame and numbers drawn by the game) | auto |
| `card-sky-lens.webp` | 400x300 | 4:3 | no | Card picture for Sky Lens (artifact card, frame and numbers drawn by the game) | auto |
| `card-sledge.webp` | 400x300 | 4:3 | no | Card picture for Rock Sledge (item card, frame and numbers drawn by the game) | prefix |
| `card-sling.webp` | 400x300 | 4:3 | no | Card picture for Pocket Sling (item card, frame and numbers drawn by the game) | prefix |
| `card-spirit-bowl.webp` | 400x300 | 4:3 | no | Card picture for Spirit Bowl (artifact card, frame and numbers drawn by the game) | auto |
| `card-spyglass.webp` | 400x300 | 4:3 | no | Card picture for Folding Spyglass (item card, frame and numbers drawn by the game) | auto |
| `card-star-chart.webp` | 400x300 | 4:3 | no | Card picture for Star Chart (artifact card, frame and numbers drawn by the game) | auto |
| `card-stone-heart.webp` | 400x300 | 4:3 | no | Card picture for Stone Heart (artifact card, frame and numbers drawn by the game) | auto |
| `card-storm-horn.webp` | 400x300 | 4:3 | no | Card picture for Storm Horn (artifact card, frame and numbers drawn by the game) | auto |
| `card-sun-disc.webp` | 400x300 | 4:3 | no | Card picture for Sun Disc (artifact card, frame and numbers drawn by the game) | auto |
| `card-tarp.webp` | 400x300 | 4:3 | no | Card picture for Oilcloth Tarp (item card, frame and numbers drawn by the game) | auto |
| `card-tent.webp` | 400x300 | 4:3 | no | Card picture for Canvas Tent (item card, frame and numbers drawn by the game) | auto |
| `card-theodolite.webp` | 400x300 | 4:3 | no | Card picture for Theodolite (item card, frame and numbers drawn by the game) | auto |
| `card-thorn-key.webp` | 400x300 | 4:3 | no | Card picture for Thorn Key (artifact card, frame and numbers drawn by the game) | auto |
| `card-tide-shell.webp` | 400x300 | 4:3 | no | Card picture for Tide Shell (artifact card, frame and numbers drawn by the game) | auto |
| `card-trail.webp` | 400x300 | 4:3 | no | Card picture for Trail Notes (item card, frame and numbers drawn by the game) | auto |
| `card-tusk-horn.webp` | 400x300 | 4:3 | no | Card picture for Tusk Horn (artifact card, frame and numbers drawn by the game) | auto |
| `card-twin-idols.webp` | 400x300 | 4:3 | no | Card picture for Twin Statuettes (artifact card, frame and numbers drawn by the game) | auto |
| `card-vine-crown.webp` | 400x300 | 4:3 | no | Card picture for Vine Crown (artifact card, frame and numbers drawn by the game) | auto |
| `card-whistle.webp` | 400x300 | 4:3 | no | Card picture for Bone Whistle (item card, frame and numbers drawn by the game) | prefix |
| `card-wind-chime.webp` | 400x300 | 4:3 | no | Card picture for Wind Chime (artifact card, frame and numbers drawn by the game) | auto |
| `card-world-seed.webp` | 400x300 | 4:3 | no | Card picture for World Seed (artifact card, frame and numbers drawn by the game) | auto |
| `explorer-0.webp` | 128x192 | 2:3 | yes (flat white background, we key it) | Explorer 1 pawn (teal) | auto |
| `explorer-1.webp` | 128x192 | 2:3 | yes (flat white background, we key it) | Explorer 2 pawn (amber) | auto |
| `explorer-2.webp` | 128x192 | 2:3 | yes (flat white background, we key it) | Explorer 3 pawn (crimson) | auto |
| `explorer-3.webp` | 128x192 | 2:3 | yes (flat white background, we key it) | Explorer 4 pawn (violet) | auto |
| `fx-discover.webp` | 512x512 | 1:1 | yes (flat white background, we key it) | Burst when a site is discovered | auto |
| `fx-guardian.webp` | 512x512 | 1:1 | yes (flat white background, we key it) | Burst when a guardian is overcome | auto |
| `fx-idol.webp` | 512x512 | 1:1 | yes (flat white background, we key it) | Burst when an idol is claimed | auto |
| `guard-ash-jaguar.webp` | 400x400 | 1:1 | yes (flat white background, we key it) | Guardian portrait: Ash Jaguar | auto |
| `guard-bone-heron.webp` | 400x400 | 1:1 | yes (flat white background, we key it) | Guardian portrait: Bone Heron | auto |
| `guard-canopy-wyrm.webp` | 400x400 | 1:1 | yes (flat white background, we key it) | Guardian portrait: Canopy Wyrm | auto |
| `guard-ember-hound.webp` | 400x400 | 1:1 | yes (flat white background, we key it) | Guardian portrait: Ember Hound | auto |
| `guard-glass-moth.webp` | 400x400 | 1:1 | yes (flat white background, we key it) | Guardian portrait: Glass Moth | auto |
| `guard-howl-bat.webp` | 400x400 | 1:1 | yes (flat white background, we key it) | Guardian portrait: Howler Bat | auto |
| `guard-mire-crawler.webp` | 400x400 | 1:1 | yes (flat white background, we key it) | Guardian portrait: Mire Crawler | auto |
| `guard-moss-golem.webp` | 400x400 | 1:1 | yes (flat white background, we key it) | Guardian portrait: Moss Golem | auto |
| `guard-old-warden.webp` | 400x400 | 1:1 | yes (flat white background, we key it) | Guardian portrait: The Old Warden | auto |
| `guard-rootback-boar.webp` | 400x400 | 1:1 | yes (flat white background, we key it) | Guardian portrait: Rootback Boar | auto |
| `guard-stone-ape.webp` | 400x400 | 1:1 | yes (flat white background, we key it) | Guardian portrait: Stone Ape | auto |
| `guard-temple-cat.webp` | 400x400 | 1:1 | yes (flat white background, we key it) | Guardian portrait: Temple Lynx | auto |
| `guard-thunder-toad.webp` | 400x400 | 1:1 | yes (flat white background, we key it) | Guardian portrait: Thunder Toad | auto |
| `guard-tide-serpent.webp` | 400x400 | 1:1 | yes (flat white background, we key it) | Guardian portrait: Tide Serpent | auto |
| `guard-vine-widow.webp` | 400x400 | 1:1 | yes (flat white background, we key it) | Guardian portrait: Vine Widow | auto |
| `icon-howto.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Menu icon: howto mode | auto |
| `icon-quick.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Menu icon: quick mode | auto |
| `icon-story.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Menu icon: story mode | auto |
| `idol-ape.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Ape Idol token (shrine slot and score area) | auto |
| `idol-bat.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Bat Idol token (shrine slot and score area) | auto |
| `idol-bird.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Heron Idol token (shrine slot and score area) | auto |
| `idol-boar.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Boar Idol token (shrine slot and score area) | auto |
| `idol-cat.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lynx Idol token (shrine slot and score area) | auto |
| `idol-crane.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Crane Idol token (shrine slot and score area) | prefix |
| `idol-fish.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Fish Idol token (shrine slot and score area) | auto |
| `idol-frog.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Frog Idol token (shrine slot and score area) | auto |
| `idol-moon.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Moon Idol token (shrine slot and score area) | auto |
| `idol-moth.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Moth Idol token (shrine slot and score area) | prefix |
| `idol-owl.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Owl Idol token (shrine slot and score area) | auto |
| `idol-ram.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Ram Idol token (shrine slot and score area) | prefix |
| `idol-snake.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Snake Idol token (shrine slot and score area) | auto |
| `idol-star.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Star Idol token (shrine slot and score area) | auto |
| `idol-sun.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Sun Idol token (shrine slot and score area) | auto |
| `idol-turtle.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Turtle Idol token (shrine slot and score area) | prefix |
| `map-act1.webp` | 1600x1000 | 16:10 | no | Campaign map, act 1 | auto |
| `map-act2.webp` | 1600x1000 | 16:10 | no | Campaign map, act 2 | auto |
| `map-act3.webp` | 1600x1000 | 16:10 | no | Campaign map, act 3 | auto |
| `portrait-mira.webp` | 512x512 | 1:1 | no | Portrait of mira (story and result screens) | auto |
| `portrait-okoro.webp` | 512x512 | 1:1 | no | Portrait of okoro (story and result screens) | auto |
| `portrait-pell.webp` | 512x512 | 1:1 | no | Portrait of pell (story and result screens) | auto |
| `portrait-quell.webp` | 512x512 | 1:1 | no | Portrait of quell (story and result screens) | auto |
| `portrait-sallow.webp` | 512x512 | 1:1 | no | Portrait of sallow (story and result screens) | auto |
| `portrait-tamsin.webp` | 512x512 | 1:1 | no | Portrait of tamsin (story and result screens) | auto |
| `portrait-vane.webp` | 512x512 | 1:1 | no | Portrait of vane (story and result screens) | auto |
| `portrait-warden.webp` | 512x512 | 1:1 | no | Portrait of warden (story and result screens) | auto |
| `res-arrow.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | arrowhead resource icon | auto |
| `res-coin.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | coin resource icon | auto |
| `res-compass.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | compass resource icon | auto |
| `res-jewel.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | jewel resource icon | auto |
| `res-tablet.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | tablet resource icon | auto |
| `result-lose.webp` | 1600x1000 | 16:10 | no | Defeat screen background | auto |
| `result-win.webp` | 1600x1000 | 16:10 | no | Victory screen background | auto |
| `shrine-slot.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Empty shrine slot on explorer board | auto |
| `site-bone-chapel.webp` | 400x300 | 4:3 | no | Level 2 dig site tile: Bone Chapel | auto |
| `site-broken-arch.webp` | 400x300 | 4:3 | no | Level 1 dig site tile: Broken Arch | auto |
| `site-c-cliff.webp` | 400x300 | 4:3 | no | Camp site tile: Lookout Cliff | auto |
| `site-c-cove.webp` | 400x300 | 4:3 | no | Camp site tile: Pearl Cove | auto |
| `site-c-road.webp` | 400x300 | 4:3 | no | Camp site tile: Logging Road | auto |
| `site-c-spring.webp` | 400x300 | 4:3 | no | Camp site tile: Clear Spring | auto |
| `site-c-wreck.webp` | 400x300 | 4:3 | no | Camp site tile: Old Wreck | auto |
| `site-crystal-vault.webp` | 400x300 | 4:3 | no | Level 2 dig site tile: Crystal Vault | auto |
| `site-drowned-hall.webp` | 400x300 | 4:3 | no | Level 2 dig site tile: Drowned Hall | auto |
| `site-echo-pit.webp` | 400x300 | 4:3 | no | Level 1 dig site tile: Echo Pit | auto |
| `site-fern-steps.webp` | 400x300 | 4:3 | no | Level 1 dig site tile: Fern Steps | auto |
| `site-frog-pool.webp` | 400x300 | 4:3 | no | Level 1 dig site tile: Frog Pool | auto |
| `site-hidden-1.webp` | 400x300 | 4:3 | no | Face-down level 1 site tile (overgrown back) | auto |
| `site-hidden-2.webp` | 400x300 | 4:3 | no | Face-down level 2 site tile (overgrown back) | auto |
| `site-hollow-tree.webp` | 400x300 | 4:3 | no | Level 1 dig site tile: Hollow Tree | auto |
| `site-jade-court.webp` | 400x300 | 4:3 | no | Level 2 dig site tile: Jade Court | auto |
| `site-lava-stair.webp` | 400x300 | 4:3 | no | Level 2 dig site tile: Lava Stair | auto |
| `site-moth-cave.webp` | 400x300 | 4:3 | no | Level 1 dig site tile: Moth Cave | auto |
| `site-root-gate.webp` | 400x300 | 4:3 | no | Level 1 dig site tile: Root Gate | auto |
| `site-sky-altar.webp` | 400x300 | 4:3 | no | Level 2 dig site tile: Sky Altar | auto |
| `site-snake-ford.webp` | 400x300 | 4:3 | no | Level 1 dig site tile: Snake Ford | auto |
| `site-star-pool.webp` | 400x300 | 4:3 | no | Level 2 dig site tile: Star Pool | auto |
| `site-statue-row.webp` | 400x300 | 4:3 | no | Level 1 dig site tile: Statue Row | auto |
| `site-sunken-well.webp` | 400x300 | 4:3 | no | Level 1 dig site tile: Sunken Well | auto |
| `site-thorn-palace.webp` | 400x300 | 4:3 | no | Level 2 dig site tile: Thorn Palace | auto |
| `temple-11.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Temple marker worth 11 points on the research track | auto |
| `temple-2.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Temple marker worth 2 points on the research track | auto |
| `temple-6.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Temple marker worth 6 points on the research track | auto |
| `title-bg.webp` | 1920x1080 | 16:9 | no | Title screen background (cover) | auto |
| `token-glass.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Research marker (magnifier track) | auto |
| `token-notebook.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Research marker (notebook track) | auto |
| `tr-boot.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Boot travel icon | auto |
| `tr-car.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Jeep travel icon | auto |
| `tr-plane.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Plane travel icon | auto |
| `tr-ship.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Boat travel icon | auto |
| `track-bg.webp` | 300x900 | 1:3 | no | Research track backdrop (vertical stair) | auto |
