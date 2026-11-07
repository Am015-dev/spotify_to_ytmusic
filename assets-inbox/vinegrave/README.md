# Inbox: vinegrave

Drop finished pictures (png, jpg or webp, 1024 px or larger), music/sound (mp3, wav) or boss clips (mp4) in this folder, then run `python3 games-src/scripts/ingest-assets.py` from the repo root. Names are matched without caring about case, `_` vs `-`, `(1)` suffixes or png/webp.
Originals move to `done/` (not committed). Run with `--check` first to see what would happen without writing anything.

The **Wired** column says what happens after the drop: `auto` = shows up in the game, `fallback` = shows up, but the game needs a fallback for the missing-file case (script lists it), `wiring` = a code change is still needed.

## Pictures (the to-make list) (170)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `board-map.webp` | 1600x1000 | 16:10 | no | Main board island map backdrop with three terraces (cover) | wiring |
| `card-airship.webp` | 400x300 | 4:3 | no | Card picture for Survey Airship (item card, frame and numbers drawn by the game) | wiring |
| `card-almanac.webp` | 400x300 | 4:3 | no | Card picture for Tide Almanac (item card, frame and numbers drawn by the game) | wiring |
| `card-ancestor-mask.webp` | 400x300 | 4:3 | no | Card picture for Ancestor Mask (artifact card, frame and numbers drawn by the game) | wiring |
| `card-ash-urn.webp` | 400x300 | 4:3 | no | Card picture for Ash Urn (artifact card, frame and numbers drawn by the game) | wiring |
| `card-back.webp` | 300x420 | 5:7 | no | Face-down card back (deck and discard piles) | wiring |
| `card-bat-wing-fan.webp` | 400x300 | 4:3 | no | Card picture for Bat Wing Fan (artifact card, frame and numbers drawn by the game) | wiring |
| `card-bone-dice.webp` | 400x300 | 4:3 | no | Card picture for Bone Dice (artifact card, frame and numbers drawn by the game) | wiring |
| `card-brush.webp` | 400x300 | 4:3 | no | Card picture for Soft Brush (item card, frame and numbers drawn by the game) | wiring |
| `card-camera.webp` | 400x300 | 4:3 | no | Card picture for Box Camera (item card, frame and numbers drawn by the game) | wiring |
| `card-canteen.webp` | 400x300 | 4:3 | no | Card picture for Dented Canteen (item card, frame and numbers drawn by the game) | wiring |
| `card-chisel.webp` | 400x300 | 4:3 | no | Card picture for Mason Chisel (item card, frame and numbers drawn by the game) | wiring |
| `card-clay-cup.webp` | 400x300 | 4:3 | no | Card picture for Clay Cup (artifact card, frame and numbers drawn by the game) | wiring |
| `card-codebook.webp` | 400x300 | 4:3 | no | Card picture for Cipher Codebook (item card, frame and numbers drawn by the game) | wiring |
| `card-coral-throne.webp` | 400x300 | 4:3 | no | Card picture for Coral Throne (artifact card, frame and numbers drawn by the game) | wiring |
| `card-crate.webp` | 400x300 | 4:3 | no | Card picture for Supply Crate (item card, frame and numbers drawn by the game) | wiring |
| `card-dinghy.webp` | 400x300 | 4:3 | no | Card picture for Rubber Dinghy (item card, frame and numbers drawn by the game) | wiring |
| `card-dread.webp` | 400x300 | 4:3 | no | Card picture for Creeping Dread (fear card, frame and numbers drawn by the game) | wiring |
| `card-ember-mask.webp` | 400x300 | 4:3 | no | Card picture for Ember Mask (artifact card, frame and numbers drawn by the game) | wiring |
| `card-feather-cloak.webp` | 400x300 | 4:3 | no | Card picture for Feather Cloak (artifact card, frame and numbers drawn by the game) | wiring |
| `card-flares.webp` | 400x300 | 4:3 | no | Card picture for Signal Flares (item card, frame and numbers drawn by the game) | wiring |
| `card-frame-art.webp` | 300x420 | 5:7 | yes (flat white background, we key it) | Card frame overlay for art cards (empty centre) | wiring |
| `card-frame-fear.webp` | 300x420 | 5:7 | yes (flat white background, we key it) | Card frame overlay for fear cards (empty centre) | wiring |
| `card-frame-item.webp` | 300x420 | 5:7 | yes (flat white background, we key it) | Card frame overlay for item cards (empty centre) | wiring |
| `card-gilded-beetle.webp` | 400x300 | 4:3 | no | Card picture for Gilded Beetle (artifact card, frame and numbers drawn by the game) | wiring |
| `card-glyph-stone.webp` | 400x300 | 4:3 | no | Card picture for Glyph Stone (artifact card, frame and numbers drawn by the game) | wiring |
| `card-gold-mask.webp` | 400x300 | 4:3 | no | Card picture for Sunken Gold Mask (artifact card, frame and numbers drawn by the game) | wiring |
| `card-gramophone.webp` | 400x300 | 4:3 | no | Card picture for Camp Gramophone (item card, frame and numbers drawn by the game) | wiring |
| `card-grant.webp` | 400x300 | 4:3 | no | Card picture for Patron Letter (item card, frame and numbers drawn by the game) | wiring |
| `card-hammock.webp` | 400x300 | 4:3 | no | Card picture for Jungle Hammock (item card, frame and numbers drawn by the game) | wiring |
| `card-jade-frog.webp` | 400x300 | 4:3 | no | Card picture for Jade Frog (artifact card, frame and numbers drawn by the game) | wiring |
| `card-jeepkey.webp` | 400x300 | 4:3 | no | Card picture for Spare Jeep Key (item card, frame and numbers drawn by the game) | wiring |
| `card-journal.webp` | 400x300 | 4:3 | no | Card picture for Dusty Journal (item card, frame and numbers drawn by the game) | wiring |
| `card-kettle.webp` | 400x300 | 4:3 | no | Card picture for Camp Kettle (item card, frame and numbers drawn by the game) | wiring |
| `card-lamp.webp` | 400x300 | 4:3 | no | Card picture for Tin Lamp (item card, frame and numbers drawn by the game) | wiring |
| `card-lava-blade.webp` | 400x300 | 4:3 | no | Card picture for Lava Blade (artifact card, frame and numbers drawn by the game) | wiring |
| `card-ledger.webp` | 400x300 | 4:3 | no | Card picture for Trade Ledger (item card, frame and numbers drawn by the game) | wiring |
| `card-lockbox.webp` | 400x300 | 4:3 | no | Card picture for Iron Lockbox (item card, frame and numbers drawn by the game) | wiring |
| `card-machete.webp` | 400x300 | 4:3 | no | Card picture for Brush Machete (item card, frame and numbers drawn by the game) | wiring |
| `card-mapcase.webp` | 400x300 | 4:3 | no | Card picture for Leather Map Case (item card, frame and numbers drawn by the game) | wiring |
| `card-moon-comb.webp` | 400x300 | 4:3 | no | Card picture for Moon Comb (artifact card, frame and numbers drawn by the game) | wiring |
| `card-moss-idol.webp` | 400x300 | 4:3 | no | Card picture for Moss Figurine (artifact card, frame and numbers drawn by the game) | wiring |
| `card-mule.webp` | 400x300 | 4:3 | no | Card picture for Pack Mule (item card, frame and numbers drawn by the game) | wiring |
| `card-obsidian-mirror.webp` | 400x300 | 4:3 | no | Card picture for Obsidian Mirror (artifact card, frame and numbers drawn by the game) | wiring |
| `card-old-codex.webp` | 400x300 | 4:3 | no | Card picture for Old Codex (artifact card, frame and numbers drawn by the game) | wiring |
| `card-owl-totem.webp` | 400x300 | 4:3 | no | Card picture for Owl Totem (artifact card, frame and numbers drawn by the game) | wiring |
| `card-permit.webp` | 400x300 | 4:3 | no | Card picture for Dig Permit (item card, frame and numbers drawn by the game) | wiring |
| `card-pickaxe.webp` | 400x300 | 4:3 | no | Card picture for Short Pickaxe (item card, frame and numbers drawn by the game) | wiring |
| `card-quiver.webp` | 400x300 | 4:3 | no | Card picture for Hunter Quiver (item card, frame and numbers drawn by the game) | wiring |
| `card-radio.webp` | 400x300 | 4:3 | no | Card picture for Field Radio (item card, frame and numbers drawn by the game) | wiring |
| `card-rain-drum.webp` | 400x300 | 4:3 | no | Card picture for Rain Drum (artifact card, frame and numbers drawn by the game) | wiring |
| `card-reed-flute.webp` | 400x300 | 4:3 | no | Card picture for Reed Flute (artifact card, frame and numbers drawn by the game) | wiring |
| `card-root-sceptre.webp` | 400x300 | 4:3 | no | Card picture for Root Sceptre (artifact card, frame and numbers drawn by the game) | wiring |
| `card-rope.webp` | 400x300 | 4:3 | no | Card picture for Coil of Rope (item card, frame and numbers drawn by the game) | wiring |
| `card-ropebridge.webp` | 400x300 | 4:3 | no | Card picture for Rope Bridge Kit (item card, frame and numbers drawn by the game) | wiring |
| `card-satchel.webp` | 400x300 | 4:3 | no | Card picture for Field Satchel (item card, frame and numbers drawn by the game) | wiring |
| `card-scale.webp` | 400x300 | 4:3 | no | Card picture for Jeweller Scale (item card, frame and numbers drawn by the game) | wiring |
| `card-seaplane.webp` | 400x300 | 4:3 | no | Card picture for Seaplane Ticket (item card, frame and numbers drawn by the game) | wiring |
| `card-serpent-ring.webp` | 400x300 | 4:3 | no | Card picture for Serpent Ring (artifact card, frame and numbers drawn by the game) | wiring |
| `card-sextant.webp` | 400x300 | 4:3 | no | Card picture for Brass Sextant (item card, frame and numbers drawn by the game) | wiring |
| `card-sky-lens.webp` | 400x300 | 4:3 | no | Card picture for Sky Lens (artifact card, frame and numbers drawn by the game) | wiring |
| `card-spirit-bowl.webp` | 400x300 | 4:3 | no | Card picture for Spirit Bowl (artifact card, frame and numbers drawn by the game) | wiring |
| `card-spyglass.webp` | 400x300 | 4:3 | no | Card picture for Folding Spyglass (item card, frame and numbers drawn by the game) | wiring |
| `card-star-chart.webp` | 400x300 | 4:3 | no | Card picture for Star Chart (artifact card, frame and numbers drawn by the game) | wiring |
| `card-stone-heart.webp` | 400x300 | 4:3 | no | Card picture for Stone Heart (artifact card, frame and numbers drawn by the game) | wiring |
| `card-storm-horn.webp` | 400x300 | 4:3 | no | Card picture for Storm Horn (artifact card, frame and numbers drawn by the game) | wiring |
| `card-sun-disc.webp` | 400x300 | 4:3 | no | Card picture for Sun Disc (artifact card, frame and numbers drawn by the game) | wiring |
| `card-tarp.webp` | 400x300 | 4:3 | no | Card picture for Oilcloth Tarp (item card, frame and numbers drawn by the game) | wiring |
| `card-tent.webp` | 400x300 | 4:3 | no | Card picture for Canvas Tent (item card, frame and numbers drawn by the game) | wiring |
| `card-theodolite.webp` | 400x300 | 4:3 | no | Card picture for Theodolite (item card, frame and numbers drawn by the game) | wiring |
| `card-thorn-key.webp` | 400x300 | 4:3 | no | Card picture for Thorn Key (artifact card, frame and numbers drawn by the game) | wiring |
| `card-tide-shell.webp` | 400x300 | 4:3 | no | Card picture for Tide Shell (artifact card, frame and numbers drawn by the game) | wiring |
| `card-trail.webp` | 400x300 | 4:3 | no | Card picture for Trail Notes (item card, frame and numbers drawn by the game) | wiring |
| `card-tusk-horn.webp` | 400x300 | 4:3 | no | Card picture for Tusk Horn (artifact card, frame and numbers drawn by the game) | wiring |
| `card-twin-idols.webp` | 400x300 | 4:3 | no | Card picture for Twin Statuettes (artifact card, frame and numbers drawn by the game) | wiring |
| `card-vine-crown.webp` | 400x300 | 4:3 | no | Card picture for Vine Crown (artifact card, frame and numbers drawn by the game) | wiring |
| `card-wind-chime.webp` | 400x300 | 4:3 | no | Card picture for Wind Chime (artifact card, frame and numbers drawn by the game) | wiring |
| `card-world-seed.webp` | 400x300 | 4:3 | no | Card picture for World Seed (artifact card, frame and numbers drawn by the game) | wiring |
| `explorer-0.webp` | 128x192 | 2:3 | yes (flat white background, we key it) | Explorer 1 pawn (teal) | wiring |
| `explorer-1.webp` | 128x192 | 2:3 | yes (flat white background, we key it) | Explorer 2 pawn (amber) | wiring |
| `explorer-2.webp` | 128x192 | 2:3 | yes (flat white background, we key it) | Explorer 3 pawn (crimson) | wiring |
| `explorer-3.webp` | 128x192 | 2:3 | yes (flat white background, we key it) | Explorer 4 pawn (violet) | wiring |
| `fx-discover.webp` | 512x512 | 1:1 | yes (flat white background, we key it) | Burst when a site is discovered | wiring |
| `fx-guardian.webp` | 512x512 | 1:1 | yes (flat white background, we key it) | Burst when a guardian is overcome | wiring |
| `fx-idol.webp` | 512x512 | 1:1 | yes (flat white background, we key it) | Burst when an idol is claimed | wiring |
| `guard-ash-jaguar.webp` | 400x400 | 1:1 | yes (flat white background, we key it) | Guardian portrait: Ash Jaguar | wiring |
| `guard-bone-heron.webp` | 400x400 | 1:1 | yes (flat white background, we key it) | Guardian portrait: Bone Heron | wiring |
| `guard-canopy-wyrm.webp` | 400x400 | 1:1 | yes (flat white background, we key it) | Guardian portrait: Canopy Wyrm | wiring |
| `guard-ember-hound.webp` | 400x400 | 1:1 | yes (flat white background, we key it) | Guardian portrait: Ember Hound | wiring |
| `guard-glass-moth.webp` | 400x400 | 1:1 | yes (flat white background, we key it) | Guardian portrait: Glass Moth | wiring |
| `guard-howl-bat.webp` | 400x400 | 1:1 | yes (flat white background, we key it) | Guardian portrait: Howler Bat | wiring |
| `guard-mire-crawler.webp` | 400x400 | 1:1 | yes (flat white background, we key it) | Guardian portrait: Mire Crawler | wiring |
| `guard-moss-golem.webp` | 400x400 | 1:1 | yes (flat white background, we key it) | Guardian portrait: Moss Golem | wiring |
| `guard-old-warden.webp` | 400x400 | 1:1 | yes (flat white background, we key it) | Guardian portrait: The Old Warden | wiring |
| `guard-rootback-boar.webp` | 400x400 | 1:1 | yes (flat white background, we key it) | Guardian portrait: Rootback Boar | wiring |
| `guard-stone-ape.webp` | 400x400 | 1:1 | yes (flat white background, we key it) | Guardian portrait: Stone Ape | wiring |
| `guard-temple-cat.webp` | 400x400 | 1:1 | yes (flat white background, we key it) | Guardian portrait: Temple Lynx | wiring |
| `guard-thunder-toad.webp` | 400x400 | 1:1 | yes (flat white background, we key it) | Guardian portrait: Thunder Toad | wiring |
| `guard-tide-serpent.webp` | 400x400 | 1:1 | yes (flat white background, we key it) | Guardian portrait: Tide Serpent | wiring |
| `guard-vine-widow.webp` | 400x400 | 1:1 | yes (flat white background, we key it) | Guardian portrait: Vine Widow | wiring |
| `icon-howto.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Menu icon: howto mode | wiring |
| `icon-quick.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Menu icon: quick mode | wiring |
| `icon-story.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Menu icon: story mode | wiring |
| `idol-ape.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Ape Idol token (shrine slot and score area) | wiring |
| `idol-bat.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Bat Idol token (shrine slot and score area) | wiring |
| `idol-bird.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Heron Idol token (shrine slot and score area) | wiring |
| `idol-boar.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Boar Idol token (shrine slot and score area) | wiring |
| `idol-cat.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Lynx Idol token (shrine slot and score area) | wiring |
| `idol-fish.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Fish Idol token (shrine slot and score area) | wiring |
| `idol-frog.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Frog Idol token (shrine slot and score area) | wiring |
| `idol-moon.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Moon Idol token (shrine slot and score area) | wiring |
| `idol-owl.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Owl Idol token (shrine slot and score area) | wiring |
| `idol-snake.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Snake Idol token (shrine slot and score area) | wiring |
| `idol-star.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Star Idol token (shrine slot and score area) | wiring |
| `idol-sun.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Sun Idol token (shrine slot and score area) | wiring |
| `map-act1.webp` | 1600x1000 | 16:10 | no | Campaign map, act 1 | wiring |
| `map-act2.webp` | 1600x1000 | 16:10 | no | Campaign map, act 2 | wiring |
| `map-act3.webp` | 1600x1000 | 16:10 | no | Campaign map, act 3 | wiring |
| `portrait-mira.webp` | 512x512 | 1:1 | no | Portrait of mira (story and result screens) | wiring |
| `portrait-okoro.webp` | 512x512 | 1:1 | no | Portrait of okoro (story and result screens) | wiring |
| `portrait-pell.webp` | 512x512 | 1:1 | no | Portrait of pell (story and result screens) | wiring |
| `portrait-quell.webp` | 512x512 | 1:1 | no | Portrait of quell (story and result screens) | wiring |
| `portrait-sallow.webp` | 512x512 | 1:1 | no | Portrait of sallow (story and result screens) | wiring |
| `portrait-tamsin.webp` | 512x512 | 1:1 | no | Portrait of tamsin (story and result screens) | wiring |
| `portrait-vane.webp` | 512x512 | 1:1 | no | Portrait of vane (story and result screens) | wiring |
| `portrait-warden.webp` | 512x512 | 1:1 | no | Portrait of warden (story and result screens) | wiring |
| `res-arrow.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | arrowhead resource icon | wiring |
| `res-coin.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | coin resource icon | wiring |
| `res-compass.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | compass resource icon | wiring |
| `res-jewel.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | jewel resource icon | wiring |
| `res-tablet.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | tablet resource icon | wiring |
| `result-lose.webp` | 1600x1000 | 16:10 | no | Defeat screen background | wiring |
| `result-win.webp` | 1600x1000 | 16:10 | no | Victory screen background | wiring |
| `shrine-slot.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Empty shrine slot on explorer board | wiring |
| `site-bone-chapel.webp` | 400x300 | 4:3 | no | Level 2 dig site tile: Bone Chapel | wiring |
| `site-broken-arch.webp` | 400x300 | 4:3 | no | Level 1 dig site tile: Broken Arch | wiring |
| `site-c-cliff.webp` | 400x300 | 4:3 | no | Camp site tile: Lookout Cliff | wiring |
| `site-c-cove.webp` | 400x300 | 4:3 | no | Camp site tile: Pearl Cove | wiring |
| `site-c-road.webp` | 400x300 | 4:3 | no | Camp site tile: Logging Road | wiring |
| `site-c-spring.webp` | 400x300 | 4:3 | no | Camp site tile: Clear Spring | wiring |
| `site-c-wreck.webp` | 400x300 | 4:3 | no | Camp site tile: Old Wreck | wiring |
| `site-crystal-vault.webp` | 400x300 | 4:3 | no | Level 2 dig site tile: Crystal Vault | wiring |
| `site-drowned-hall.webp` | 400x300 | 4:3 | no | Level 2 dig site tile: Drowned Hall | wiring |
| `site-echo-pit.webp` | 400x300 | 4:3 | no | Level 1 dig site tile: Echo Pit | wiring |
| `site-fern-steps.webp` | 400x300 | 4:3 | no | Level 1 dig site tile: Fern Steps | wiring |
| `site-frog-pool.webp` | 400x300 | 4:3 | no | Level 1 dig site tile: Frog Pool | wiring |
| `site-hidden-1.webp` | 400x300 | 4:3 | no | Face-down level 1 site tile (overgrown back) | wiring |
| `site-hidden-2.webp` | 400x300 | 4:3 | no | Face-down level 2 site tile (overgrown back) | wiring |
| `site-hollow-tree.webp` | 400x300 | 4:3 | no | Level 1 dig site tile: Hollow Tree | wiring |
| `site-jade-court.webp` | 400x300 | 4:3 | no | Level 2 dig site tile: Jade Court | wiring |
| `site-lava-stair.webp` | 400x300 | 4:3 | no | Level 2 dig site tile: Lava Stair | wiring |
| `site-moth-cave.webp` | 400x300 | 4:3 | no | Level 1 dig site tile: Moth Cave | wiring |
| `site-root-gate.webp` | 400x300 | 4:3 | no | Level 1 dig site tile: Root Gate | wiring |
| `site-sky-altar.webp` | 400x300 | 4:3 | no | Level 2 dig site tile: Sky Altar | wiring |
| `site-snake-ford.webp` | 400x300 | 4:3 | no | Level 1 dig site tile: Snake Ford | wiring |
| `site-star-pool.webp` | 400x300 | 4:3 | no | Level 2 dig site tile: Star Pool | wiring |
| `site-statue-row.webp` | 400x300 | 4:3 | no | Level 1 dig site tile: Statue Row | wiring |
| `site-sunken-well.webp` | 400x300 | 4:3 | no | Level 1 dig site tile: Sunken Well | wiring |
| `site-thorn-palace.webp` | 400x300 | 4:3 | no | Level 2 dig site tile: Thorn Palace | wiring |
| `temple-11.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Temple marker worth 11 points on the research track | wiring |
| `temple-2.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Temple marker worth 2 points on the research track | wiring |
| `temple-6.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Temple marker worth 6 points on the research track | wiring |
| `title-bg.webp` | 1920x1080 | 16:9 | no | Title screen background (cover) | wiring |
| `token-glass.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Research marker (magnifier track) | wiring |
| `token-notebook.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Research marker (notebook track) | wiring |
| `tr-boot.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Boot travel icon | wiring |
| `tr-car.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Jeep travel icon | wiring |
| `tr-plane.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Plane travel icon | wiring |
| `tr-ship.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Boat travel icon | wiring |
| `track-bg.webp` | 300x900 | 1:3 | no | Research track backdrop (vertical stair) | wiring |
