# Emberclimb assets (2D only)

Every picture is a named slot: drop `games/emberclimb/media/<stem>.webp` and it is drawn, with no code change. Missing file = tidy code-drawn placeholder. Manifest: `assets.json` (regenerate everything with `node tools/gen-assets.js`). Prompts: `games-src/next-wave/flow-2d/emberclimb/prompts-wave{1,2,3}.json` (also split `-tall`, `-wide`, `-square`).

## Fit rules
- `card`, `bg`, `board` kinds are cover-fitted (cropped, never stretched). `portrait`, `token`, `icon`, `ui`, `fx` are contain-fitted (never stretched).
- Card frames (`frame-*`, `gem-*`) are full-card overlays 5:7; their window sits at y 14%-53% of the card, full width. Card art (`4:3`) shows behind it.
- Backgrounds are 9:16 and centre-cropped on wide screens. Keep the centre calm.

## Drop files in (3 steps, see PLAYBOOK "Finished pictures from the owner")
1. Generate a wave in Google Flow from the prompts file, key the white background to transparent where `alpha` is true, save as `<stem>.webp`.
2. Put the files in `assets-inbox/emberclimb/` and run `python3 games-src/scripts/ingest-assets.py` (`--check` first = dry run).
3. Tell the orchestrator; it runs the build-all deploy. The placeholders stay as fallback.

## Wave 1 (62 pictures)

| stem | kind | size | ratio | alpha | slot |
|---|---|---|---|---|---|
| bg-title | bg | 1080x1920 | 9:16 | no | Title screen |
| bg-map | bg | 1080x1920 | 9:16 | no | Map screen |
| bg-battle-1 | bg | 1080x1920 | 9:16 | no | Fight 1 (floors 1,4,7) |
| hero-w | portrait | 768x1024 | 3:4 | yes | Title select, battle panel (Garrick Cinderplate) |
| hero-s | portrait | 768x1024 | 3:4 | yes | Title select, battle panel (Sable Quillfinger) |
| hero-a | portrait | 768x1024 | 3:4 | yes | Title select, battle panel (Cog-9) |
| hero-m | portrait | 768x1024 | 3:4 | yes | Title select, battle panel (Ione Stillwater) |
| frame-attack | ui | 500x700 | 5:7 | yes | Overlay on every attack card (window: upper half, y 14%-53%) |
| frame-skill | ui | 500x700 | 5:7 | yes | Overlay on every skill card (window: upper half, y 14%-53%) |
| frame-power | ui | 500x700 | 5:7 | yes | Overlay on every power card (window: upper half, y 14%-53%) |
| frame-status | ui | 500x700 | 5:7 | yes | Overlay on every status card (window: upper half, y 14%-53%) |
| gem-common | ui | 500x700 | 5:7 | yes | Rarity badge overlay at the card bottom centre (common) |
| gem-uncommon | ui | 500x700 | 5:7 | yes | Rarity badge overlay at the card bottom centre (uncommon) |
| gem-rare | ui | 500x700 | 5:7 | yes | Rarity badge overlay at the card bottom centre (rare) |
| card-back | card | 500x700 | 5:7 | no | Draw pile icon, card back |
| w-strike | card | 512x384 | 4:3 | no | Card art window (Cinder Strike, warrior) |
| w-defend | card | 512x384 | 4:3 | no | Card art window (Plate Guard, warrior) |
| w-hammer | card | 512x384 | 4:3 | no | Card art window (Anvil Blow, warrior) |
| s-strike | card | 512x384 | 4:3 | no | Card art window (Quick Cut, rogue) |
| s-defend | card | 512x384 | 4:3 | no | Card art window (Cloak Guard, rogue) |
| s-pinprick | card | 512x384 | 4:3 | no | Card art window (Pinprick, rogue) |
| s-slip-away | card | 512x384 | 4:3 | no | Card art window (Slip Away, rogue) |
| a-strike | card | 512x384 | 4:3 | no | Card art window (Piston Jab, automaton) |
| a-defend | card | 512x384 | 4:3 | no | Card art window (Plating Shift, automaton) |
| a-zap | card | 512x384 | 4:3 | no | Card art window (Spark Up, automaton) |
| a-dualcast | card | 512x384 | 4:3 | no | Card art window (Twin Pulse, automaton) |
| m-strike | card | 512x384 | 4:3 | no | Card art window (Open Palm, monk) |
| m-defend | card | 512x384 | 4:3 | no | Card art window (Guarded Stance, monk) |
| m-eruption | card | 512x384 | 4:3 | no | Card art window (Wrath Eruption, monk) |
| m-vigilance | card | 512x384 | 4:3 | no | Card art window (Quiet Vigil, monk) |
| shiv | card | 512x384 | 4:3 | no | Card art window (Shiv, status) |
| enemy-mire-slug | portrait | 768x768 | 1:1 | yes | Battle enemy: Mire Slug |
| enemy-gnawer | portrait | 768x768 | 1:1 | yes | Battle enemy: Gnawer |
| enemy-hex-acolyte | portrait | 768x768 | 1:1 | yes | Battle enemy: Hex Acolyte |
| enemy-gape-grub | portrait | 768x768 | 1:1 | yes | Battle enemy: Gape Grub |
| enemy-rust-tick | portrait | 768x768 | 1:1 | yes | Battle enemy: Rust Tick |
| relic-ember-brand | token | 256x256 | 1:1 | yes | Relic icon: Ember Brand |
| relic-whetstone-ring | token | 256x256 | 1:1 | yes | Relic icon: Whetstone Ring |
| relic-spark-core | token | 256x256 | 1:1 | yes | Relic icon: Spark Core |
| relic-prayer-beads | token | 256x256 | 1:1 | yes | Relic icon: Prayer Beads |
| node-monster | token | 256x256 | 1:1 | yes | Map node icon |
| node-elite | token | 256x256 | 1:1 | yes | Map node icon |
| node-rest | token | 256x256 | 1:1 | yes | Map node icon |
| node-shop | token | 256x256 | 1:1 | yes | Map node icon |
| node-event | token | 256x256 | 1:1 | yes | Map node icon |
| node-treasure | token | 256x256 | 1:1 | yes | Map node icon |
| node-boss | token | 256x256 | 1:1 | yes | Map node icon |
| intent-attack | icon | 128x128 | 1:1 | yes | Enemy intent bubble |
| intent-attack-big | icon | 128x128 | 1:1 | yes | Enemy intent bubble |
| intent-defend | icon | 128x128 | 1:1 | yes | Enemy intent bubble |
| intent-buff | icon | 128x128 | 1:1 | yes | Enemy intent bubble |
| intent-debuff | icon | 128x128 | 1:1 | yes | Enemy intent bubble |
| intent-weak | icon | 128x128 | 1:1 | yes | Enemy intent bubble |
| intent-vuln | icon | 128x128 | 1:1 | yes | Enemy intent bubble |
| intent-frail | icon | 128x128 | 1:1 | yes | Enemy intent bubble |
| intent-poison | icon | 128x128 | 1:1 | yes | Enemy intent bubble |
| intent-burn | icon | 128x128 | 1:1 | yes | Enemy intent bubble |
| intent-slime | icon | 128x128 | 1:1 | yes | Enemy intent bubble |
| intent-daze | icon | 128x128 | 1:1 | yes | Enemy intent bubble |
| intent-unknown | icon | 128x128 | 1:1 | yes | Enemy intent bubble |
| intent-sleep | icon | 128x128 | 1:1 | yes | Enemy intent bubble |
| icon-energy | ui | 256x256 | 1:1 | yes | Energy orb behind the number |

## Wave 2 (154 pictures)

| stem | kind | size | ratio | alpha | slot |
|---|---|---|---|---|---|
| bg-battle-2 | bg | 1080x1920 | 9:16 | no | Fight 2 (floors 2,5,8) |
| bg-battle-3 | bg | 1080x1920 | 9:16 | no | Fight 3 (floors 3,6,9) |
| bg-elite | bg | 1080x1920 | 9:16 | no | Elite fights |
| bg-boss-mire-behemoth | bg | 1080x1920 | 9:16 | no | Boss: mire behemoth |
| bg-boss-ashen-wraith | bg | 1080x1920 | 9:16 | no | Boss: ashen wraith |
| bg-boss-gate-colossus | bg | 1080x1920 | 9:16 | no | Boss: gate colossus |
| bg-reward | bg | 1080x1920 | 9:16 | no | Reward and treasure screens |
| bg-rest | bg | 1080x1920 | 9:16 | no | Campfire screen |
| bg-shop | bg | 1080x1920 | 9:16 | no | Shop screen |
| bg-event | bg | 1080x1920 | 9:16 | no | Event screen |
| w-cleave | card | 512x384 | 4:3 | no | Card art window (Sweeping Arc, warrior) |
| w-twin-slash | card | 512x384 | 4:3 | no | Card art window (Twin Slash, warrior) |
| w-warm-up | card | 512x384 | 4:3 | no | Card art window (Warm Up, warrior) |
| w-bulwark-bash | card | 512x384 | 4:3 | no | Card art window (Bulwark Bash, warrior) |
| w-sunder | card | 512x384 | 4:3 | no | Card art window (Sunder Plate, warrior) |
| w-iron-skin | card | 512x384 | 4:3 | no | Card art window (Iron Skin, warrior) |
| w-skull-rap | card | 512x384 | 4:3 | no | Card art window (Skull Rap, warrior) |
| w-roar | card | 512x384 | 4:3 | no | Card art window (Intimidating Roar, warrior) |
| w-wild-swing | card | 512x384 | 4:3 | no | Card art window (Wild Swing, warrior) |
| w-whirlwind | card | 512x384 | 4:3 | no | Card art window (Whirling Gale, warrior) |
| w-kindle | card | 512x384 | 4:3 | no | Card art window (Kindle, warrior) |
| w-slow-burn | card | 512x384 | 4:3 | no | Card art window (Slow Burn, warrior) |
| w-body-check | card | 512x384 | 4:3 | no | Card art window (Body Check, warrior) |
| w-second-wind | card | 512x384 | 4:3 | no | Card art window (Second Wind, warrior) |
| w-berserk-roll | card | 512x384 | 4:3 | no | Card art window (Berserk Roll, warrior) |
| w-reapers-edge | card | 512x384 | 4:3 | no | Card art window (Reaper's Edge, warrior) |
| w-plate-up | card | 512x384 | 4:3 | no | Card art window (Plate Up, warrior) |
| w-pyre-heart | card | 512x384 | 4:3 | no | Card art window (Pyre Heart, warrior) |
| w-colossus-slam | card | 512x384 | 4:3 | no | Card art window (Colossus Slam, warrior) |
| w-double-down | card | 512x384 | 4:3 | no | Card art window (Double Down, warrior) |
| w-final-gambit | card | 512x384 | 4:3 | no | Card art window (Final Gambit, warrior) |
| s-blade-fan | card | 512x384 | 4:3 | no | Card art window (Blade Fan, rogue) |
| s-toxic-vial | card | 512x384 | 4:3 | no | Card art window (Toxic Vial, rogue) |
| s-quick-stab | card | 512x384 | 4:3 | no | Card art window (Gutter Stab, rogue) |
| s-dodge-roll | card | 512x384 | 4:3 | no | Card art window (Dodge Roll, rogue) |
| s-hidden-knives | card | 512x384 | 4:3 | no | Card art window (Hidden Knives, rogue) |
| s-dagger-spray | card | 512x384 | 4:3 | no | Card art window (Dagger Spray, rogue) |
| s-cripple | card | 512x384 | 4:3 | no | Card art window (Hamstring, rogue) |
| s-lucky-pick | card | 512x384 | 4:3 | no | Card art window (Lucky Pick, rogue) |
| s-snap-cut | card | 512x384 | 4:3 | no | Card art window (Barbed Cut, rogue) |
| s-catalyst | card | 512x384 | 4:3 | no | Card art window (Catalyst, rogue) |
| s-noxious | card | 512x384 | 4:3 | no | Card art window (Noxious Haze, rogue) |
| s-envenom | card | 512x384 | 4:3 | no | Card art window (Coat Blades, rogue) |
| s-knife-rain | card | 512x384 | 4:3 | no | Card art window (Knife Rain, rogue) |
| s-backstab | card | 512x384 | 4:3 | no | Card art window (Backstab, rogue) |
| s-choking-cloud | card | 512x384 | 4:3 | no | Card art window (Choking Cloud, rogue) |
| s-needle-rain | card | 512x384 | 4:3 | no | Card art window (Needle Volley, rogue) |
| s-venom-storm | card | 512x384 | 4:3 | no | Card art window (Venom Storm, rogue) |
| s-afterimage | card | 512x384 | 4:3 | no | Card art window (Afterimage, rogue) |
| s-final-flourish | card | 512x384 | 4:3 | no | Card art window (Final Flourish, rogue) |
| s-plague-doctor | card | 512x384 | 4:3 | no | Card art window (Plague Brew, rogue) |
| a-ball-lightning | card | 512x384 | 4:3 | no | Card art window (Ball Lightning, automaton) |
| a-cool-circuit | card | 512x384 | 4:3 | no | Card art window (Cool Circuit, automaton) |
| a-charge-up | card | 512x384 | 4:3 | no | Card art window (Charge Up, automaton) |
| a-barrier-pulse | card | 512x384 | 4:3 | no | Card art window (Barrier Pulse, automaton) |
| a-beam-cell | card | 512x384 | 4:3 | no | Card art window (Beam Cell, automaton) |
| a-sweeping-beam | card | 512x384 | 4:3 | no | Card art window (Sweeping Beam, automaton) |
| a-overclock | card | 512x384 | 4:3 | no | Card art window (Overclock, automaton) |
| a-static-jolt | card | 512x384 | 4:3 | no | Card art window (Static Jolt, automaton) |
| a-compile-strike | card | 512x384 | 4:3 | no | Card art window (Compile Strike, automaton) |
| a-capacitor | card | 512x384 | 4:3 | no | Card art window (Capacitor Bank, automaton) |
| a-defrag | card | 512x384 | 4:3 | no | Card art window (Focus Lattice, automaton) |
| a-glacier | card | 512x384 | 4:3 | no | Card art window (Glacier Core, automaton) |
| a-darkness | card | 512x384 | 4:3 | no | Card art window (Dark Matter, automaton) |
| a-tempest | card | 512x384 | 4:3 | no | Card art window (Storm Array, automaton) |
| a-multicast | card | 512x384 | 4:3 | no | Card art window (Multicast, automaton) |
| a-core-breach | card | 512x384 | 4:3 | no | Card art window (Core Breach, automaton) |
| a-biased-core | card | 512x384 | 4:3 | no | Card art window (Biased Core, automaton) |
| a-meteor-strike | card | 512x384 | 4:3 | no | Card art window (Meteor Strike, automaton) |
| a-hyperbeam | card | 512x384 | 4:3 | no | Card art window (Hyperbeam, automaton) |
| a-reactor | card | 512x384 | 4:3 | no | Card art window (Mini Reactor, automaton) |
| m-palm-flurry | card | 512x384 | 4:3 | no | Card art window (Palm Flurry, monk) |
| m-crush-joints | card | 512x384 | 4:3 | no | Card art window (Crush Joints, monk) |
| m-pressure-point | card | 512x384 | 4:3 | no | Card art window (Pressure Point, monk) |
| m-still-water | card | 512x384 | 4:3 | no | Card art window (Still Water, monk) |
| m-sash-whip | card | 512x384 | 4:3 | no | Card art window (Sash Whip, monk) |
| m-cut-through | card | 512x384 | 4:3 | no | Card art window (Cut Through, monk) |
| m-empty-fist | card | 512x384 | 4:3 | no | Card art window (Empty Fist, monk) |
| m-bow | card | 512x384 | 4:3 | no | Card art window (Deep Bow, monk) |
| m-third-eye | card | 512x384 | 4:3 | no | Card art window (Third Eye, monk) |
| m-inner-peace | card | 512x384 | 4:3 | no | Card art window (Inner Peace, monk) |
| m-wheel-kick | card | 512x384 | 4:3 | no | Card art window (Wheel Kick, monk) |
| m-rushdown | card | 512x384 | 4:3 | no | Card art window (Rushdown, monk) |
| m-mental-fort | card | 512x384 | 4:3 | no | Card art window (Mental Fortress, monk) |
| m-flying-sleeves | card | 512x384 | 4:3 | no | Card art window (Flying Sleeves, monk) |
| m-windmill | card | 512x384 | 4:3 | no | Card art window (Windmill Strike, monk) |
| m-roll-with-it | card | 512x384 | 4:3 | no | Card art window (Roll With It, monk) |
| m-sky-hammer | card | 512x384 | 4:3 | no | Card art window (Sky Hammer, monk) |
| m-zen-burst | card | 512x384 | 4:3 | no | Card art window (Zen Burst, monk) |
| m-deva-form | card | 512x384 | 4:3 | no | Card art window (Deva Form, monk) |
| m-judgment | card | 512x384 | 4:3 | no | Card art window (Final Verdict, monk) |
| n-bandage | card | 512x384 | 4:3 | no | Card art window (Bandage Up, neutral) |
| n-good-instincts | card | 512x384 | 4:3 | no | Card art window (Good Instincts, neutral) |
| n-finesse | card | 512x384 | 4:3 | no | Card art window (Finesse, neutral) |
| n-panic-button | card | 512x384 | 4:3 | no | Card art window (Panic Button, neutral) |
| n-hand-of-greed | card | 512x384 | 4:3 | no | Card art window (Hand of Greed, neutral) |
| wound | card | 512x384 | 4:3 | no | Card art window (Wound, status) |
| dazed | card | 512x384 | 4:3 | no | Card art window (Dazed, status) |
| burn | card | 512x384 | 4:3 | no | Card art window (Burn, status) |
| slimed | card | 512x384 | 4:3 | no | Card art window (Slimed, status) |
| regret | card | 512x384 | 4:3 | no | Card art window (Regret, curse) |
| doubt | card | 512x384 | 4:3 | no | Card art window (Doubt, curse) |
| injury | card | 512x384 | 4:3 | no | Card art window (Lingering Injury, curse) |
| calm-spark | card | 512x384 | 4:3 | no | Card art window (Calm Spark, status) |
| enemy-bile-blob | portrait | 768x768 | 1:1 | yes | Battle enemy: Bile Blob |
| enemy-snare-vine | portrait | 768x768 | 1:1 | yes | Battle enemy: Snare Vine |
| enemy-ash-imp | portrait | 768x768 | 1:1 | yes | Battle enemy: Ash Imp |
| enemy-thorn-brute | portrait | 768x768 | 1:1 | yes | Battle enemy: Thorn Brute (elite) |
| enemy-sleeper-statue | portrait | 768x768 | 1:1 | yes | Battle enemy: Sleeper Statue (elite) |
| enemy-iron-warden | portrait | 768x768 | 1:1 | yes | Battle enemy: Iron Warden (elite) |
| enemy-mire-behemoth | portrait | 768x768 | 1:1 | yes | Battle enemy: Mire Behemoth (boss) |
| enemy-ashen-wraith | portrait | 768x768 | 1:1 | yes | Battle enemy: Ashen Wraith (boss) |
| enemy-gate-colossus | portrait | 768x768 | 1:1 | yes | Battle enemy: Gate Colossus (boss) |
| relic-lucky-coin | token | 256x256 | 1:1 | yes | Relic icon: Lucky Coin |
| relic-iron-bangle | token | 256x256 | 1:1 | yes | Relic icon: Iron Bangle |
| relic-lantern | token | 256x256 | 1:1 | yes | Relic icon: Tin Lantern |
| relic-bag-of-marbles | token | 256x256 | 1:1 | yes | Relic icon: Bag of Marbles |
| relic-clover-dice | token | 256x256 | 1:1 | yes | Relic icon: Clover Dice |
| relic-healing-moss | token | 256x256 | 1:1 | yes | Relic icon: Healing Moss |
| relic-gold-tooth | token | 256x256 | 1:1 | yes | Relic icon: Gold Tooth |
| relic-oak-heart | token | 256x256 | 1:1 | yes | Relic icon: Oak Heart |
| relic-candle-stub | token | 256x256 | 1:1 | yes | Relic icon: Candle Stub |
| relic-pocket-satchel | token | 256x256 | 1:1 | yes | Relic icon: Pocket Satchel |
| relic-tin-flute | token | 256x256 | 1:1 | yes | Relic icon: Tin Flute |
| relic-smoking-censer | token | 256x256 | 1:1 | yes | Relic icon: Smoking Censer |
| relic-dawnstone | token | 256x256 | 1:1 | yes | Relic icon: Dawnstone |
| relic-gale-cloak | token | 256x256 | 1:1 | yes | Relic icon: Gale Cloak |
| relic-phoenix-ash | token | 256x256 | 1:1 | yes | Relic icon: Phoenix Ash |
| pot-fire-flask | token | 256x256 | 1:1 | yes | Potion belt and rewards: Fire Flask |
| pot-block-brew | token | 256x256 | 1:1 | yes | Potion belt and rewards: Block Brew |
| pot-strength-tonic | token | 256x256 | 1:1 | yes | Potion belt and rewards: Strength Tonic |
| pot-swift-draught | token | 256x256 | 1:1 | yes | Potion belt and rewards: Swift Draught |
| pot-energy-vial | token | 256x256 | 1:1 | yes | Potion belt and rewards: Energy Vial |
| pot-venom-vial | token | 256x256 | 1:1 | yes | Potion belt and rewards: Venom Vial |
| pot-frost-gas | token | 256x256 | 1:1 | yes | Potion belt and rewards: Frost Gas |
| pot-healing-draught | token | 256x256 | 1:1 | yes | Potion belt and rewards: Healing Draught |
| pot-fortune-die | token | 256x256 | 1:1 | yes | Potion belt and rewards: Fortune Die |
| event-ember-shrine | card | 512x384 | 4:3 | no | Event screen picture: Ember Shrine |
| event-wandering-tinker | card | 512x384 | 4:3 | no | Event screen picture: Wandering Tinker |
| event-whispering-well | card | 512x384 | 4:3 | no | Event screen picture: Whispering Well |
| event-stranded-caravan | card | 512x384 | 4:3 | no | Event screen picture: Stranded Caravan |
| event-mirror-pool | card | 512x384 | 4:3 | no | Event screen picture: Mirror Pool |
| event-back-alley-gambler | card | 512x384 | 4:3 | no | Event screen picture: Back Alley Gambler |
| st-str | icon | 128x128 | 1:1 | yes | Status chip icon |
| st-vuln | icon | 128x128 | 1:1 | yes | Status chip icon |
| st-weak | icon | 128x128 | 1:1 | yes | Status chip icon |
| st-poison | icon | 128x128 | 1:1 | yes | Status chip icon |
| st-frail | icon | 128x128 | 1:1 | yes | Status chip icon |
| orb-L | token | 128x128 | 1:1 | yes | Automaton orb slot |
| orb-F | token | 128x128 | 1:1 | yes | Automaton orb slot |
| orb-D | token | 128x128 | 1:1 | yes | Automaton orb slot |
| stance-w | icon | 128x128 | 1:1 | yes | Monk stance badge |
| stance-c | icon | 128x128 | 1:1 | yes | Monk stance badge |
| icon-remove | icon | 128x128 | 1:1 | yes | Shop: remove a card |

## Wave 3 (13 pictures)

| stem | kind | size | ratio | alpha | slot |
|---|---|---|---|---|---|
| bg-victory | bg | 1080x1920 | 9:16 | no | Win screen |
| bg-defeat | bg | 1080x1920 | 9:16 | no | Lose screen |
| die-1 | token | 192x192 | 1:1 | yes | Dice roll popup (face 1) |
| die-2 | token | 192x192 | 1:1 | yes | Dice roll popup (face 2) |
| die-3 | token | 192x192 | 1:1 | yes | Dice roll popup (face 3) |
| die-4 | token | 192x192 | 1:1 | yes | Dice roll popup (face 4) |
| die-5 | token | 192x192 | 1:1 | yes | Dice roll popup (face 5) |
| die-6 | token | 192x192 | 1:1 | yes | Dice roll popup (face 6) |
| fx-slash | fx | 256x256 | 1:1 | yes | Effect over a target |
| fx-block-burst | fx | 256x256 | 1:1 | yes | Effect over a target |
| fx-heal-sparkle | fx | 256x256 | 1:1 | yes | Effect over a target |
| fx-poison-cloud | fx | 256x256 | 1:1 | yes | Effect over a target |
| fx-fire-burst | fx | 256x256 | 1:1 | yes | Effect over a target |


## Temporary art credits

Glyphs from game-icons.net, licensed CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/), drawn on our own code-made shapes. Stems in `temp-art/` are placeholders: a Flow file with the same stem replaces them.

- badges (game-icons.net/1x1/badges/): skull
- carl-olsen (game-icons.net/1x1/carl-olsen/): flame, mite-alt
- caro-asercion (game-icons.net/1x1/caro-asercion/): round-potion
- delapouite (game-icons.net/1x1/delapouite/): bracer, crosshair, diamond-ring, dice-six-faces-four, dice-six-faces-six, dungeon-gate, flute, gate, health-potion, knocked-out-stars, magic-potion, marbles, night-sleep, ogre, pearl-necklace, rat, shop, slime, snail-eyes, swamp, tire-iron, trash-can, two-coins
- lorc (game-icons.net/1x1/lorc/): acorn, barbute, broadsword, broken-bone, broken-shield, campfire, candle-light, cog, crossed-swords, crowned-skull, cultist, fire-bowl, ghost, hood, horned-skull, imp-laugh, incense, knapsack, lantern, lightning-arc, lightning-frequency, locked-chest, lotus, meditation, moon, orbital, poison-bottle, potion-ball, robot-golem, round-bottom-flask, snowflake-2, sprout, standing-potion, star-swirl, stone-tower, strong, sun, thorny-vine, tooth, uncertainty, worm-mouth
- lucasms (game-icons.net/1x1/lucasms/): cloak
- sbed (game-icons.net/1x1/sbed/): shield
