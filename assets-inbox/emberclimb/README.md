# Inbox: emberclimb

Drop finished pictures (png, jpg or webp, 1024 px or larger), music/sound (mp3, wav) or boss clips (mp4) in this folder, then run `python3 games-src/scripts/ingest-assets.py` from the repo root. Names are matched without caring about case, `_` vs `-`, `(1)` suffixes or png/webp.
Originals move to `done/` (not committed). Run with `--check` first to see what would happen without writing anything.

The **Wired** column says what happens after the drop: `auto` = shows up in the game, `fallback` = shows up, but the game needs a fallback for the missing-file case (script lists it), `wiring` = a code change is still needed.

## Pictures (the to-make list) (221)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `a-ball-lightning.webp` | 512x384 | 4:3 | no | Card art window (Ball Lightning, automaton) | auto |
| `a-barrier-pulse.webp` | 512x384 | 4:3 | no | Card art window (Barrier Pulse, automaton) | auto |
| `a-beam-cell.webp` | 512x384 | 4:3 | no | Card art window (Beam Cell, automaton) | auto |
| `a-biased-core.webp` | 512x384 | 4:3 | no | Card art window (Biased Core, automaton) | auto |
| `a-capacitor.webp` | 512x384 | 4:3 | no | Card art window (Capacitor Bank, automaton) | auto |
| `a-charge-up.webp` | 512x384 | 4:3 | no | Card art window (Charge Up, automaton) | auto |
| `a-compile-strike.webp` | 512x384 | 4:3 | no | Card art window (Compile Strike, automaton) | auto |
| `a-cool-circuit.webp` | 512x384 | 4:3 | no | Card art window (Cool Circuit, automaton) | auto |
| `a-core-breach.webp` | 512x384 | 4:3 | no | Card art window (Core Breach, automaton) | auto |
| `a-darkness.webp` | 512x384 | 4:3 | no | Card art window (Dark Matter, automaton) | auto |
| `a-defend.webp` | 512x384 | 4:3 | no | Card art window (Plating Shift, automaton) | auto |
| `a-defrag.webp` | 512x384 | 4:3 | no | Card art window (Focus Lattice, automaton) | auto |
| `a-dualcast.webp` | 512x384 | 4:3 | no | Card art window (Twin Pulse, automaton) | auto |
| `a-glacier.webp` | 512x384 | 4:3 | no | Card art window (Glacier Core, automaton) | auto |
| `a-hyperbeam.webp` | 512x384 | 4:3 | no | Card art window (Hyperbeam, automaton) | auto |
| `a-meteor-strike.webp` | 512x384 | 4:3 | no | Card art window (Meteor Strike, automaton) | auto |
| `a-multicast.webp` | 512x384 | 4:3 | no | Card art window (Multicast, automaton) | auto |
| `a-overclock.webp` | 512x384 | 4:3 | no | Card art window (Overclock, automaton) | auto |
| `a-reactor.webp` | 512x384 | 4:3 | no | Card art window (Mini Reactor, automaton) | auto |
| `a-static-jolt.webp` | 512x384 | 4:3 | no | Card art window (Static Jolt, automaton) | auto |
| `a-strike.webp` | 512x384 | 4:3 | no | Card art window (Piston Jab, automaton) | auto |
| `a-sweeping-beam.webp` | 512x384 | 4:3 | no | Card art window (Sweeping Beam, automaton) | auto |
| `a-tempest.webp` | 512x384 | 4:3 | no | Card art window (Storm Array, automaton) | auto |
| `a-zap.webp` | 512x384 | 4:3 | no | Card art window (Spark Up, automaton) | auto |
| `bg-battle-1.webp` | 1080x1920 | 9:16 | no | Fight 1 (floors 1,4,7) | auto |
| `bg-battle-2.webp` | 1080x1920 | 9:16 | no | Fight 2 (floors 2,5,8) | auto |
| `bg-battle-3.webp` | 1080x1920 | 9:16 | no | Fight 3 (floors 3,6,9) | auto |
| `bg-boss-ashen-wraith.webp` | 1080x1920 | 9:16 | no | Boss: ashen wraith | auto |
| `bg-boss-gate-colossus.webp` | 1080x1920 | 9:16 | no | Boss: gate colossus | auto |
| `bg-boss-mire-behemoth.webp` | 1080x1920 | 9:16 | no | Boss: mire behemoth | auto |
| `bg-defeat.webp` | 1080x1920 | 9:16 | no | Lose screen | auto |
| `bg-elite.webp` | 1080x1920 | 9:16 | no | Elite fights | auto |
| `bg-event.webp` | 1080x1920 | 9:16 | no | Event screen | auto |
| `bg-map.webp` | 1080x1920 | 9:16 | no | Map screen | auto |
| `bg-rest.webp` | 1080x1920 | 9:16 | no | Campfire screen | auto |
| `bg-reward.webp` | 1080x1920 | 9:16 | no | Reward and treasure screens | auto |
| `bg-shop.webp` | 1080x1920 | 9:16 | no | Shop screen | auto |
| `bg-title.webp` | 1080x1920 | 9:16 | no | Title screen | auto |
| `bg-victory.webp` | 1080x1920 | 9:16 | no | Win screen | auto |
| `burn.webp` | 512x384 | 4:3 | no | Card art window (Burn, status) | auto |
| `calm-spark.webp` | 512x384 | 4:3 | no | Card art window (Calm Spark, status) | auto |
| `card-back.webp` | 500x700 | 5:7 | no | Draw pile icon, card back | auto |
| `dazed.webp` | 512x384 | 4:3 | no | Card art window (Dazed, status) | auto |
| `die-1.webp` | 192x192 | 1:1 | yes (flat white background, we key it) | Dice roll popup (face 1) | prefix |
| `die-2.webp` | 192x192 | 1:1 | yes (flat white background, we key it) | Dice roll popup (face 2) | prefix |
| `die-3.webp` | 192x192 | 1:1 | yes (flat white background, we key it) | Dice roll popup (face 3) | prefix |
| `die-4.webp` | 192x192 | 1:1 | yes (flat white background, we key it) | Dice roll popup (face 4) | prefix |
| `die-5.webp` | 192x192 | 1:1 | yes (flat white background, we key it) | Dice roll popup (face 5) | prefix |
| `die-6.webp` | 192x192 | 1:1 | yes (flat white background, we key it) | Dice roll popup (face 6) | prefix |
| `doubt.webp` | 512x384 | 4:3 | no | Card art window (Doubt, curse) | auto |
| `enemy-ash-imp.webp` | 768x768 | 1:1 | yes (flat white background, we key it) | Battle enemy: Ash Imp | auto |
| `enemy-ashen-wraith.webp` | 768x768 | 1:1 | yes (flat white background, we key it) | Battle enemy: Ashen Wraith (boss) | auto |
| `enemy-bile-blob.webp` | 768x768 | 1:1 | yes (flat white background, we key it) | Battle enemy: Bile Blob | auto |
| `enemy-gape-grub.webp` | 768x768 | 1:1 | yes (flat white background, we key it) | Battle enemy: Gape Grub | auto |
| `enemy-gate-colossus.webp` | 768x768 | 1:1 | yes (flat white background, we key it) | Battle enemy: Gate Colossus (boss) | auto |
| `enemy-gnawer.webp` | 768x768 | 1:1 | yes (flat white background, we key it) | Battle enemy: Gnawer | auto |
| `enemy-hex-acolyte.webp` | 768x768 | 1:1 | yes (flat white background, we key it) | Battle enemy: Hex Acolyte | auto |
| `enemy-iron-warden.webp` | 768x768 | 1:1 | yes (flat white background, we key it) | Battle enemy: Iron Warden (elite) | auto |
| `enemy-mire-behemoth.webp` | 768x768 | 1:1 | yes (flat white background, we key it) | Battle enemy: Mire Behemoth (boss) | auto |
| `enemy-mire-slug.webp` | 768x768 | 1:1 | yes (flat white background, we key it) | Battle enemy: Mire Slug | auto |
| `enemy-rust-tick.webp` | 768x768 | 1:1 | yes (flat white background, we key it) | Battle enemy: Rust Tick | auto |
| `enemy-sleeper-statue.webp` | 768x768 | 1:1 | yes (flat white background, we key it) | Battle enemy: Sleeper Statue (elite) | auto |
| `enemy-snare-vine.webp` | 768x768 | 1:1 | yes (flat white background, we key it) | Battle enemy: Snare Vine | auto |
| `enemy-thorn-brute.webp` | 768x768 | 1:1 | yes (flat white background, we key it) | Battle enemy: Thorn Brute (elite) | auto |
| `event-back-alley-gambler.webp` | 512x384 | 4:3 | no | Event screen picture: Back Alley Gambler | auto |
| `event-ember-shrine.webp` | 512x384 | 4:3 | no | Event screen picture: Ember Shrine | auto |
| `event-mirror-pool.webp` | 512x384 | 4:3 | no | Event screen picture: Mirror Pool | auto |
| `event-stranded-caravan.webp` | 512x384 | 4:3 | no | Event screen picture: Stranded Caravan | auto |
| `event-wandering-tinker.webp` | 512x384 | 4:3 | no | Event screen picture: Wandering Tinker | auto |
| `event-whispering-well.webp` | 512x384 | 4:3 | no | Event screen picture: Whispering Well | auto |
| `frame-attack.webp` | 500x700 | 5:7 | yes (flat white background, we key it) | Overlay on every attack card (window: upper half, y 14%-53%) | prefix |
| `frame-power.webp` | 500x700 | 5:7 | yes (flat white background, we key it) | Overlay on every power card (window: upper half, y 14%-53%) | prefix |
| `frame-skill.webp` | 500x700 | 5:7 | yes (flat white background, we key it) | Overlay on every skill card (window: upper half, y 14%-53%) | prefix |
| `frame-status.webp` | 500x700 | 5:7 | yes (flat white background, we key it) | Overlay on every status card (window: upper half, y 14%-53%) | prefix |
| `fx-block-burst.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Effect over a target | prefix |
| `fx-fire-burst.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Effect over a target | prefix |
| `fx-heal-sparkle.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Effect over a target | prefix |
| `fx-poison-cloud.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Effect over a target | prefix |
| `fx-slash.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Effect over a target | prefix |
| `gem-common.webp` | 500x700 | 5:7 | yes (flat white background, we key it) | Rarity badge overlay at the card bottom centre (common) | prefix |
| `gem-rare.webp` | 500x700 | 5:7 | yes (flat white background, we key it) | Rarity badge overlay at the card bottom centre (rare) | prefix |
| `gem-uncommon.webp` | 500x700 | 5:7 | yes (flat white background, we key it) | Rarity badge overlay at the card bottom centre (uncommon) | prefix |
| `hero-a.webp` | 768x1024 | 3:4 | yes (flat white background, we key it) | Title select, battle panel (Cog-9) | auto |
| `hero-m.webp` | 768x1024 | 3:4 | yes (flat white background, we key it) | Title select, battle panel (Ione Stillwater) | auto |
| `hero-s.webp` | 768x1024 | 3:4 | yes (flat white background, we key it) | Title select, battle panel (Sable Quillfinger) | auto |
| `hero-w.webp` | 768x1024 | 3:4 | yes (flat white background, we key it) | Title select, battle panel (Garrick Cinderplate) | auto |
| `icon-energy.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Energy orb behind the number | prefix |
| `icon-remove.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Shop: remove a card | prefix |
| `injury.webp` | 512x384 | 4:3 | no | Card art window (Lingering Injury, curse) | auto |
| `intent-attack.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Enemy intent bubble | prefix |
| `intent-attack-big.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Enemy intent bubble | prefix |
| `intent-buff.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Enemy intent bubble | prefix |
| `intent-debuff.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Enemy intent bubble | prefix |
| `intent-defend.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Enemy intent bubble | prefix |
| `intent-sleep.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Enemy intent bubble | prefix |
| `m-bow.webp` | 512x384 | 4:3 | no | Card art window (Deep Bow, monk) | auto |
| `m-crush-joints.webp` | 512x384 | 4:3 | no | Card art window (Crush Joints, monk) | auto |
| `m-cut-through.webp` | 512x384 | 4:3 | no | Card art window (Cut Through, monk) | auto |
| `m-defend.webp` | 512x384 | 4:3 | no | Card art window (Guarded Stance, monk) | auto |
| `m-deva-form.webp` | 512x384 | 4:3 | no | Card art window (Deva Form, monk) | auto |
| `m-empty-fist.webp` | 512x384 | 4:3 | no | Card art window (Empty Fist, monk) | auto |
| `m-eruption.webp` | 512x384 | 4:3 | no | Card art window (Wrath Eruption, monk) | auto |
| `m-flying-sleeves.webp` | 512x384 | 4:3 | no | Card art window (Flying Sleeves, monk) | auto |
| `m-inner-peace.webp` | 512x384 | 4:3 | no | Card art window (Inner Peace, monk) | auto |
| `m-judgment.webp` | 512x384 | 4:3 | no | Card art window (Final Verdict, monk) | auto |
| `m-mental-fort.webp` | 512x384 | 4:3 | no | Card art window (Mental Fortress, monk) | auto |
| `m-palm-flurry.webp` | 512x384 | 4:3 | no | Card art window (Palm Flurry, monk) | auto |
| `m-pressure-point.webp` | 512x384 | 4:3 | no | Card art window (Pressure Point, monk) | auto |
| `m-roll-with-it.webp` | 512x384 | 4:3 | no | Card art window (Roll With It, monk) | auto |
| `m-rushdown.webp` | 512x384 | 4:3 | no | Card art window (Rushdown, monk) | auto |
| `m-sash-whip.webp` | 512x384 | 4:3 | no | Card art window (Sash Whip, monk) | auto |
| `m-sky-hammer.webp` | 512x384 | 4:3 | no | Card art window (Sky Hammer, monk) | auto |
| `m-still-water.webp` | 512x384 | 4:3 | no | Card art window (Still Water, monk) | auto |
| `m-strike.webp` | 512x384 | 4:3 | no | Card art window (Open Palm, monk) | auto |
| `m-third-eye.webp` | 512x384 | 4:3 | no | Card art window (Third Eye, monk) | auto |
| `m-vigilance.webp` | 512x384 | 4:3 | no | Card art window (Quiet Vigil, monk) | auto |
| `m-wheel-kick.webp` | 512x384 | 4:3 | no | Card art window (Wheel Kick, monk) | auto |
| `m-windmill.webp` | 512x384 | 4:3 | no | Card art window (Windmill Strike, monk) | auto |
| `m-zen-burst.webp` | 512x384 | 4:3 | no | Card art window (Zen Burst, monk) | auto |
| `n-bandage.webp` | 512x384 | 4:3 | no | Card art window (Bandage Up, neutral) | auto |
| `n-finesse.webp` | 512x384 | 4:3 | no | Card art window (Finesse, neutral) | auto |
| `n-good-instincts.webp` | 512x384 | 4:3 | no | Card art window (Good Instincts, neutral) | auto |
| `n-hand-of-greed.webp` | 512x384 | 4:3 | no | Card art window (Hand of Greed, neutral) | auto |
| `n-panic-button.webp` | 512x384 | 4:3 | no | Card art window (Panic Button, neutral) | auto |
| `node-boss.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Map node icon | auto |
| `node-elite.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Map node icon | auto |
| `node-event.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Map node icon | auto |
| `node-monster.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Map node icon | auto |
| `node-rest.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Map node icon | auto |
| `node-shop.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Map node icon | auto |
| `node-treasure.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Map node icon | auto |
| `orb-D.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Automaton orb slot | prefix |
| `orb-F.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Automaton orb slot | prefix |
| `orb-L.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Automaton orb slot | prefix |
| `pot-block-brew.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Potion belt and rewards: Block Brew | auto |
| `pot-energy-vial.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Potion belt and rewards: Energy Vial | auto |
| `pot-fire-flask.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Potion belt and rewards: Fire Flask | auto |
| `pot-fortune-die.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Potion belt and rewards: Fortune Die | auto |
| `pot-frost-gas.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Potion belt and rewards: Frost Gas | auto |
| `pot-healing-draught.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Potion belt and rewards: Healing Draught | auto |
| `pot-strength-tonic.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Potion belt and rewards: Strength Tonic | auto |
| `pot-swift-draught.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Potion belt and rewards: Swift Draught | auto |
| `pot-venom-vial.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Potion belt and rewards: Venom Vial | auto |
| `regret.webp` | 512x384 | 4:3 | no | Card art window (Regret, curse) | auto |
| `relic-bag-of-marbles.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Bag of Marbles | auto |
| `relic-candle-stub.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Candle Stub | auto |
| `relic-clover-dice.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Clover Dice | auto |
| `relic-dawnstone.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Dawnstone | auto |
| `relic-ember-brand.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Ember Brand | auto |
| `relic-gale-cloak.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Gale Cloak | auto |
| `relic-gold-tooth.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Gold Tooth | auto |
| `relic-healing-moss.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Healing Moss | auto |
| `relic-iron-bangle.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Iron Bangle | auto |
| `relic-lantern.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Tin Lantern | auto |
| `relic-lucky-coin.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Lucky Coin | auto |
| `relic-oak-heart.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Oak Heart | auto |
| `relic-phoenix-ash.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Phoenix Ash | auto |
| `relic-pocket-satchel.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Pocket Satchel | auto |
| `relic-prayer-beads.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Prayer Beads | auto |
| `relic-smoking-censer.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Smoking Censer | auto |
| `relic-spark-core.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Spark Core | auto |
| `relic-tin-flute.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Tin Flute | auto |
| `relic-whetstone-ring.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Whetstone Ring | auto |
| `s-afterimage.webp` | 512x384 | 4:3 | no | Card art window (Afterimage, rogue) | auto |
| `s-backstab.webp` | 512x384 | 4:3 | no | Card art window (Backstab, rogue) | auto |
| `s-blade-fan.webp` | 512x384 | 4:3 | no | Card art window (Blade Fan, rogue) | auto |
| `s-catalyst.webp` | 512x384 | 4:3 | no | Card art window (Catalyst, rogue) | auto |
| `s-choking-cloud.webp` | 512x384 | 4:3 | no | Card art window (Choking Cloud, rogue) | auto |
| `s-cripple.webp` | 512x384 | 4:3 | no | Card art window (Hamstring, rogue) | auto |
| `s-dagger-spray.webp` | 512x384 | 4:3 | no | Card art window (Dagger Spray, rogue) | auto |
| `s-defend.webp` | 512x384 | 4:3 | no | Card art window (Cloak Guard, rogue) | auto |
| `s-dodge-roll.webp` | 512x384 | 4:3 | no | Card art window (Dodge Roll, rogue) | auto |
| `s-envenom.webp` | 512x384 | 4:3 | no | Card art window (Coat Blades, rogue) | auto |
| `s-final-flourish.webp` | 512x384 | 4:3 | no | Card art window (Final Flourish, rogue) | auto |
| `s-hidden-knives.webp` | 512x384 | 4:3 | no | Card art window (Hidden Knives, rogue) | auto |
| `s-knife-rain.webp` | 512x384 | 4:3 | no | Card art window (Knife Rain, rogue) | auto |
| `s-lucky-pick.webp` | 512x384 | 4:3 | no | Card art window (Lucky Pick, rogue) | auto |
| `s-needle-rain.webp` | 512x384 | 4:3 | no | Card art window (Needle Volley, rogue) | auto |
| `s-noxious.webp` | 512x384 | 4:3 | no | Card art window (Noxious Haze, rogue) | auto |
| `s-pinprick.webp` | 512x384 | 4:3 | no | Card art window (Pinprick, rogue) | auto |
| `s-plague-doctor.webp` | 512x384 | 4:3 | no | Card art window (Plague Brew, rogue) | auto |
| `s-quick-stab.webp` | 512x384 | 4:3 | no | Card art window (Gutter Stab, rogue) | auto |
| `s-slip-away.webp` | 512x384 | 4:3 | no | Card art window (Slip Away, rogue) | auto |
| `s-snap-cut.webp` | 512x384 | 4:3 | no | Card art window (Barbed Cut, rogue) | auto |
| `s-strike.webp` | 512x384 | 4:3 | no | Card art window (Quick Cut, rogue) | auto |
| `s-toxic-vial.webp` | 512x384 | 4:3 | no | Card art window (Toxic Vial, rogue) | auto |
| `s-venom-storm.webp` | 512x384 | 4:3 | no | Card art window (Venom Storm, rogue) | auto |
| `shiv.webp` | 512x384 | 4:3 | no | Card art window (Shiv, status) | auto |
| `slimed.webp` | 512x384 | 4:3 | no | Card art window (Slimed, status) | auto |
| `st-frail.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Status chip icon | prefix |
| `st-poison.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Status chip icon | prefix |
| `st-str.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Status chip icon | prefix |
| `st-vuln.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Status chip icon | prefix |
| `st-weak.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Status chip icon | prefix |
| `stance-c.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Monk stance badge | prefix |
| `stance-w.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Monk stance badge | prefix |
| `w-berserk-roll.webp` | 512x384 | 4:3 | no | Card art window (Berserk Roll, warrior) | auto |
| `w-body-check.webp` | 512x384 | 4:3 | no | Card art window (Body Check, warrior) | auto |
| `w-bulwark-bash.webp` | 512x384 | 4:3 | no | Card art window (Bulwark Bash, warrior) | auto |
| `w-cleave.webp` | 512x384 | 4:3 | no | Card art window (Sweeping Arc, warrior) | auto |
| `w-colossus-slam.webp` | 512x384 | 4:3 | no | Card art window (Colossus Slam, warrior) | auto |
| `w-defend.webp` | 512x384 | 4:3 | no | Card art window (Plate Guard, warrior) | auto |
| `w-double-down.webp` | 512x384 | 4:3 | no | Card art window (Double Down, warrior) | auto |
| `w-final-gambit.webp` | 512x384 | 4:3 | no | Card art window (Final Gambit, warrior) | auto |
| `w-hammer.webp` | 512x384 | 4:3 | no | Card art window (Anvil Blow, warrior) | auto |
| `w-iron-skin.webp` | 512x384 | 4:3 | no | Card art window (Iron Skin, warrior) | auto |
| `w-kindle.webp` | 512x384 | 4:3 | no | Card art window (Kindle, warrior) | auto |
| `w-plate-up.webp` | 512x384 | 4:3 | no | Card art window (Plate Up, warrior) | auto |
| `w-pyre-heart.webp` | 512x384 | 4:3 | no | Card art window (Pyre Heart, warrior) | auto |
| `w-reapers-edge.webp` | 512x384 | 4:3 | no | Card art window (Reaper's Edge, warrior) | auto |
| `w-roar.webp` | 512x384 | 4:3 | no | Card art window (Intimidating Roar, warrior) | auto |
| `w-second-wind.webp` | 512x384 | 4:3 | no | Card art window (Second Wind, warrior) | auto |
| `w-skull-rap.webp` | 512x384 | 4:3 | no | Card art window (Skull Rap, warrior) | auto |
| `w-slow-burn.webp` | 512x384 | 4:3 | no | Card art window (Slow Burn, warrior) | auto |
| `w-strike.webp` | 512x384 | 4:3 | no | Card art window (Cinder Strike, warrior) | auto |
| `w-sunder.webp` | 512x384 | 4:3 | no | Card art window (Sunder Plate, warrior) | auto |
| `w-twin-slash.webp` | 512x384 | 4:3 | no | Card art window (Twin Slash, warrior) | auto |
| `w-warm-up.webp` | 512x384 | 4:3 | no | Card art window (Warm Up, warrior) | auto |
| `w-whirlwind.webp` | 512x384 | 4:3 | no | Card art window (Whirling Gale, warrior) | auto |
| `w-wild-swing.webp` | 512x384 | 4:3 | no | Card art window (Wild Swing, warrior) | auto |
| `wound.webp` | 512x384 | 4:3 | no | Card art window (Wound, status) | auto |
