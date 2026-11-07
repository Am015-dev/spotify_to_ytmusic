# Inbox: emberclimb

Drop finished pictures (png, jpg or webp, 1024 px or larger), music/sound (mp3, wav) or boss clips (mp4) in this folder, then run `python3 games-src/scripts/ingest-assets.py` from the repo root. Names are matched without caring about case, `_` vs `-`, `(1)` suffixes or png/webp.
Originals move to `done/` (not committed). Run with `--check` first to see what would happen without writing anything.

The **Wired** column says what happens after the drop: `auto` = shows up in the game, `fallback` = shows up, but the game needs a fallback for the missing-file case (script lists it), `wiring` = a code change is still needed.

## Pictures (the to-make list) (221)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `a-ball-lightning.webp` | 512x384 | 4:3 | no | Card art window (Ball Lightning, automaton) | prefix |
| `a-barrier-pulse.webp` | 512x384 | 4:3 | no | Card art window (Barrier Pulse, automaton) | prefix |
| `a-beam-cell.webp` | 512x384 | 4:3 | no | Card art window (Beam Cell, automaton) | prefix |
| `a-biased-core.webp` | 512x384 | 4:3 | no | Card art window (Biased Core, automaton) | prefix |
| `a-capacitor.webp` | 512x384 | 4:3 | no | Card art window (Capacitor Bank, automaton) | prefix |
| `a-charge-up.webp` | 512x384 | 4:3 | no | Card art window (Charge Up, automaton) | prefix |
| `a-compile-strike.webp` | 512x384 | 4:3 | no | Card art window (Compile Strike, automaton) | prefix |
| `a-cool-circuit.webp` | 512x384 | 4:3 | no | Card art window (Cool Circuit, automaton) | prefix |
| `a-core-breach.webp` | 512x384 | 4:3 | no | Card art window (Core Breach, automaton) | prefix |
| `a-darkness.webp` | 512x384 | 4:3 | no | Card art window (Dark Matter, automaton) | prefix |
| `a-defend.webp` | 512x384 | 4:3 | no | Card art window (Plating Shift, automaton) | prefix |
| `a-defrag.webp` | 512x384 | 4:3 | no | Card art window (Focus Lattice, automaton) | prefix |
| `a-dualcast.webp` | 512x384 | 4:3 | no | Card art window (Twin Pulse, automaton) | prefix |
| `a-glacier.webp` | 512x384 | 4:3 | no | Card art window (Glacier Core, automaton) | prefix |
| `a-hyperbeam.webp` | 512x384 | 4:3 | no | Card art window (Hyperbeam, automaton) | prefix |
| `a-meteor-strike.webp` | 512x384 | 4:3 | no | Card art window (Meteor Strike, automaton) | prefix |
| `a-multicast.webp` | 512x384 | 4:3 | no | Card art window (Multicast, automaton) | prefix |
| `a-overclock.webp` | 512x384 | 4:3 | no | Card art window (Overclock, automaton) | prefix |
| `a-reactor.webp` | 512x384 | 4:3 | no | Card art window (Mini Reactor, automaton) | prefix |
| `a-static-jolt.webp` | 512x384 | 4:3 | no | Card art window (Static Jolt, automaton) | prefix |
| `a-strike.webp` | 512x384 | 4:3 | no | Card art window (Piston Jab, automaton) | prefix |
| `a-sweeping-beam.webp` | 512x384 | 4:3 | no | Card art window (Sweeping Beam, automaton) | prefix |
| `a-tempest.webp` | 512x384 | 4:3 | no | Card art window (Storm Array, automaton) | prefix |
| `a-zap.webp` | 512x384 | 4:3 | no | Card art window (Spark Up, automaton) | prefix |
| `bg-battle-1.webp` | 1080x1920 | 9:16 | no | Fight 1 (floors 1,4,7) | prefix |
| `bg-battle-2.webp` | 1080x1920 | 9:16 | no | Fight 2 (floors 2,5,8) | prefix |
| `bg-battle-3.webp` | 1080x1920 | 9:16 | no | Fight 3 (floors 3,6,9) | prefix |
| `bg-boss-ashen-wraith.webp` | 1080x1920 | 9:16 | no | Boss: ashen wraith | prefix |
| `bg-boss-gate-colossus.webp` | 1080x1920 | 9:16 | no | Boss: gate colossus | prefix |
| `bg-boss-mire-behemoth.webp` | 1080x1920 | 9:16 | no | Boss: mire behemoth | prefix |
| `bg-defeat.webp` | 1080x1920 | 9:16 | no | Lose screen | prefix |
| `bg-elite.webp` | 1080x1920 | 9:16 | no | Elite fights | prefix |
| `bg-event.webp` | 1080x1920 | 9:16 | no | Event screen | prefix |
| `bg-map.webp` | 1080x1920 | 9:16 | no | Map screen | prefix |
| `bg-rest.webp` | 1080x1920 | 9:16 | no | Campfire screen | prefix |
| `bg-reward.webp` | 1080x1920 | 9:16 | no | Reward and treasure screens | prefix |
| `bg-shop.webp` | 1080x1920 | 9:16 | no | Shop screen | prefix |
| `bg-title.webp` | 1080x1920 | 9:16 | no | Title screen | prefix |
| `bg-victory.webp` | 1080x1920 | 9:16 | no | Win screen | prefix |
| `burn.webp` | 512x384 | 4:3 | no | Card art window (Burn, status) | prefix |
| `calm-spark.webp` | 512x384 | 4:3 | no | Card art window (Calm Spark, status) | prefix |
| `card-back.webp` | 500x700 | 5:7 | no | Draw pile icon, card back | prefix |
| `dazed.webp` | 512x384 | 4:3 | no | Card art window (Dazed, status) | prefix |
| `die-1.webp` | 192x192 | 1:1 | yes (flat white background, we key it) | Dice roll popup (face 1) | prefix |
| `die-2.webp` | 192x192 | 1:1 | yes (flat white background, we key it) | Dice roll popup (face 2) | prefix |
| `die-3.webp` | 192x192 | 1:1 | yes (flat white background, we key it) | Dice roll popup (face 3) | prefix |
| `die-4.webp` | 192x192 | 1:1 | yes (flat white background, we key it) | Dice roll popup (face 4) | prefix |
| `die-5.webp` | 192x192 | 1:1 | yes (flat white background, we key it) | Dice roll popup (face 5) | prefix |
| `die-6.webp` | 192x192 | 1:1 | yes (flat white background, we key it) | Dice roll popup (face 6) | prefix |
| `doubt.webp` | 512x384 | 4:3 | no | Card art window (Doubt, curse) | prefix |
| `enemy-ash-imp.webp` | 768x768 | 1:1 | yes (flat white background, we key it) | Battle enemy: Ash Imp | prefix |
| `enemy-ashen-wraith.webp` | 768x768 | 1:1 | yes (flat white background, we key it) | Battle enemy: Ashen Wraith (boss) | prefix |
| `enemy-bile-blob.webp` | 768x768 | 1:1 | yes (flat white background, we key it) | Battle enemy: Bile Blob | prefix |
| `enemy-gape-grub.webp` | 768x768 | 1:1 | yes (flat white background, we key it) | Battle enemy: Gape Grub | prefix |
| `enemy-gate-colossus.webp` | 768x768 | 1:1 | yes (flat white background, we key it) | Battle enemy: Gate Colossus (boss) | prefix |
| `enemy-gnawer.webp` | 768x768 | 1:1 | yes (flat white background, we key it) | Battle enemy: Gnawer | prefix |
| `enemy-hex-acolyte.webp` | 768x768 | 1:1 | yes (flat white background, we key it) | Battle enemy: Hex Acolyte | prefix |
| `enemy-iron-warden.webp` | 768x768 | 1:1 | yes (flat white background, we key it) | Battle enemy: Iron Warden (elite) | prefix |
| `enemy-mire-behemoth.webp` | 768x768 | 1:1 | yes (flat white background, we key it) | Battle enemy: Mire Behemoth (boss) | prefix |
| `enemy-mire-slug.webp` | 768x768 | 1:1 | yes (flat white background, we key it) | Battle enemy: Mire Slug | prefix |
| `enemy-rust-tick.webp` | 768x768 | 1:1 | yes (flat white background, we key it) | Battle enemy: Rust Tick | prefix |
| `enemy-sleeper-statue.webp` | 768x768 | 1:1 | yes (flat white background, we key it) | Battle enemy: Sleeper Statue (elite) | prefix |
| `enemy-snare-vine.webp` | 768x768 | 1:1 | yes (flat white background, we key it) | Battle enemy: Snare Vine | prefix |
| `enemy-thorn-brute.webp` | 768x768 | 1:1 | yes (flat white background, we key it) | Battle enemy: Thorn Brute (elite) | prefix |
| `event-back-alley-gambler.webp` | 512x384 | 4:3 | no | Event screen picture: Back Alley Gambler | prefix |
| `event-ember-shrine.webp` | 512x384 | 4:3 | no | Event screen picture: Ember Shrine | prefix |
| `event-mirror-pool.webp` | 512x384 | 4:3 | no | Event screen picture: Mirror Pool | prefix |
| `event-stranded-caravan.webp` | 512x384 | 4:3 | no | Event screen picture: Stranded Caravan | prefix |
| `event-wandering-tinker.webp` | 512x384 | 4:3 | no | Event screen picture: Wandering Tinker | prefix |
| `event-whispering-well.webp` | 512x384 | 4:3 | no | Event screen picture: Whispering Well | prefix |
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
| `hero-a.webp` | 768x1024 | 3:4 | yes (flat white background, we key it) | Title select, battle panel (Cog-9) | prefix |
| `hero-m.webp` | 768x1024 | 3:4 | yes (flat white background, we key it) | Title select, battle panel (Ione Stillwater) | prefix |
| `hero-s.webp` | 768x1024 | 3:4 | yes (flat white background, we key it) | Title select, battle panel (Sable Quillfinger) | prefix |
| `hero-w.webp` | 768x1024 | 3:4 | yes (flat white background, we key it) | Title select, battle panel (Garrick Cinderplate) | prefix |
| `icon-energy.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Energy orb behind the number | prefix |
| `icon-remove.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Shop: remove a card | prefix |
| `injury.webp` | 512x384 | 4:3 | no | Card art window (Lingering Injury, curse) | prefix |
| `intent-attack.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Enemy intent bubble | prefix |
| `intent-attack-big.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Enemy intent bubble | prefix |
| `intent-buff.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Enemy intent bubble | prefix |
| `intent-debuff.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Enemy intent bubble | prefix |
| `intent-defend.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Enemy intent bubble | prefix |
| `intent-sleep.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Enemy intent bubble | prefix |
| `m-bow.webp` | 512x384 | 4:3 | no | Card art window (Deep Bow, monk) | prefix |
| `m-crush-joints.webp` | 512x384 | 4:3 | no | Card art window (Crush Joints, monk) | prefix |
| `m-cut-through.webp` | 512x384 | 4:3 | no | Card art window (Cut Through, monk) | prefix |
| `m-defend.webp` | 512x384 | 4:3 | no | Card art window (Guarded Stance, monk) | prefix |
| `m-deva-form.webp` | 512x384 | 4:3 | no | Card art window (Deva Form, monk) | prefix |
| `m-empty-fist.webp` | 512x384 | 4:3 | no | Card art window (Empty Fist, monk) | prefix |
| `m-eruption.webp` | 512x384 | 4:3 | no | Card art window (Wrath Eruption, monk) | prefix |
| `m-flying-sleeves.webp` | 512x384 | 4:3 | no | Card art window (Flying Sleeves, monk) | prefix |
| `m-inner-peace.webp` | 512x384 | 4:3 | no | Card art window (Inner Peace, monk) | prefix |
| `m-judgment.webp` | 512x384 | 4:3 | no | Card art window (Final Verdict, monk) | prefix |
| `m-mental-fort.webp` | 512x384 | 4:3 | no | Card art window (Mental Fortress, monk) | prefix |
| `m-palm-flurry.webp` | 512x384 | 4:3 | no | Card art window (Palm Flurry, monk) | prefix |
| `m-pressure-point.webp` | 512x384 | 4:3 | no | Card art window (Pressure Point, monk) | prefix |
| `m-roll-with-it.webp` | 512x384 | 4:3 | no | Card art window (Roll With It, monk) | prefix |
| `m-rushdown.webp` | 512x384 | 4:3 | no | Card art window (Rushdown, monk) | prefix |
| `m-sash-whip.webp` | 512x384 | 4:3 | no | Card art window (Sash Whip, monk) | prefix |
| `m-sky-hammer.webp` | 512x384 | 4:3 | no | Card art window (Sky Hammer, monk) | prefix |
| `m-still-water.webp` | 512x384 | 4:3 | no | Card art window (Still Water, monk) | prefix |
| `m-strike.webp` | 512x384 | 4:3 | no | Card art window (Open Palm, monk) | prefix |
| `m-third-eye.webp` | 512x384 | 4:3 | no | Card art window (Third Eye, monk) | prefix |
| `m-vigilance.webp` | 512x384 | 4:3 | no | Card art window (Quiet Vigil, monk) | prefix |
| `m-wheel-kick.webp` | 512x384 | 4:3 | no | Card art window (Wheel Kick, monk) | prefix |
| `m-windmill.webp` | 512x384 | 4:3 | no | Card art window (Windmill Strike, monk) | prefix |
| `m-zen-burst.webp` | 512x384 | 4:3 | no | Card art window (Zen Burst, monk) | prefix |
| `n-bandage.webp` | 512x384 | 4:3 | no | Card art window (Bandage Up, neutral) | prefix |
| `n-finesse.webp` | 512x384 | 4:3 | no | Card art window (Finesse, neutral) | prefix |
| `n-good-instincts.webp` | 512x384 | 4:3 | no | Card art window (Good Instincts, neutral) | prefix |
| `n-hand-of-greed.webp` | 512x384 | 4:3 | no | Card art window (Hand of Greed, neutral) | prefix |
| `n-panic-button.webp` | 512x384 | 4:3 | no | Card art window (Panic Button, neutral) | prefix |
| `node-boss.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Map node icon | prefix |
| `node-elite.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Map node icon | prefix |
| `node-event.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Map node icon | prefix |
| `node-monster.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Map node icon | prefix |
| `node-rest.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Map node icon | prefix |
| `node-shop.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Map node icon | prefix |
| `node-treasure.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Map node icon | prefix |
| `orb-D.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Automaton orb slot | prefix |
| `orb-F.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Automaton orb slot | prefix |
| `orb-L.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Automaton orb slot | prefix |
| `pot-block-brew.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Potion belt and rewards: Block Brew | prefix |
| `pot-energy-vial.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Potion belt and rewards: Energy Vial | prefix |
| `pot-fire-flask.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Potion belt and rewards: Fire Flask | prefix |
| `pot-fortune-die.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Potion belt and rewards: Fortune Die | prefix |
| `pot-frost-gas.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Potion belt and rewards: Frost Gas | prefix |
| `pot-healing-draught.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Potion belt and rewards: Healing Draught | prefix |
| `pot-strength-tonic.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Potion belt and rewards: Strength Tonic | prefix |
| `pot-swift-draught.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Potion belt and rewards: Swift Draught | prefix |
| `pot-venom-vial.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Potion belt and rewards: Venom Vial | prefix |
| `regret.webp` | 512x384 | 4:3 | no | Card art window (Regret, curse) | prefix |
| `relic-bag-of-marbles.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Bag of Marbles | prefix |
| `relic-candle-stub.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Candle Stub | prefix |
| `relic-clover-dice.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Clover Dice | prefix |
| `relic-dawnstone.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Dawnstone | prefix |
| `relic-ember-brand.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Ember Brand | prefix |
| `relic-gale-cloak.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Gale Cloak | prefix |
| `relic-gold-tooth.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Gold Tooth | prefix |
| `relic-healing-moss.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Healing Moss | prefix |
| `relic-iron-bangle.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Iron Bangle | prefix |
| `relic-lantern.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Tin Lantern | prefix |
| `relic-lucky-coin.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Lucky Coin | prefix |
| `relic-oak-heart.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Oak Heart | prefix |
| `relic-phoenix-ash.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Phoenix Ash | prefix |
| `relic-pocket-satchel.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Pocket Satchel | prefix |
| `relic-prayer-beads.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Prayer Beads | prefix |
| `relic-smoking-censer.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Smoking Censer | prefix |
| `relic-spark-core.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Spark Core | prefix |
| `relic-tin-flute.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Tin Flute | prefix |
| `relic-whetstone-ring.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Relic icon: Whetstone Ring | prefix |
| `s-afterimage.webp` | 512x384 | 4:3 | no | Card art window (Afterimage, rogue) | prefix |
| `s-backstab.webp` | 512x384 | 4:3 | no | Card art window (Backstab, rogue) | prefix |
| `s-blade-fan.webp` | 512x384 | 4:3 | no | Card art window (Blade Fan, rogue) | prefix |
| `s-catalyst.webp` | 512x384 | 4:3 | no | Card art window (Catalyst, rogue) | prefix |
| `s-choking-cloud.webp` | 512x384 | 4:3 | no | Card art window (Choking Cloud, rogue) | prefix |
| `s-cripple.webp` | 512x384 | 4:3 | no | Card art window (Hamstring, rogue) | prefix |
| `s-dagger-spray.webp` | 512x384 | 4:3 | no | Card art window (Dagger Spray, rogue) | prefix |
| `s-defend.webp` | 512x384 | 4:3 | no | Card art window (Cloak Guard, rogue) | prefix |
| `s-dodge-roll.webp` | 512x384 | 4:3 | no | Card art window (Dodge Roll, rogue) | prefix |
| `s-envenom.webp` | 512x384 | 4:3 | no | Card art window (Coat Blades, rogue) | prefix |
| `s-final-flourish.webp` | 512x384 | 4:3 | no | Card art window (Final Flourish, rogue) | prefix |
| `s-hidden-knives.webp` | 512x384 | 4:3 | no | Card art window (Hidden Knives, rogue) | prefix |
| `s-knife-rain.webp` | 512x384 | 4:3 | no | Card art window (Knife Rain, rogue) | prefix |
| `s-lucky-pick.webp` | 512x384 | 4:3 | no | Card art window (Lucky Pick, rogue) | prefix |
| `s-needle-rain.webp` | 512x384 | 4:3 | no | Card art window (Needle Volley, rogue) | prefix |
| `s-noxious.webp` | 512x384 | 4:3 | no | Card art window (Noxious Haze, rogue) | prefix |
| `s-pinprick.webp` | 512x384 | 4:3 | no | Card art window (Pinprick, rogue) | prefix |
| `s-plague-doctor.webp` | 512x384 | 4:3 | no | Card art window (Plague Brew, rogue) | prefix |
| `s-quick-stab.webp` | 512x384 | 4:3 | no | Card art window (Gutter Stab, rogue) | prefix |
| `s-slip-away.webp` | 512x384 | 4:3 | no | Card art window (Slip Away, rogue) | prefix |
| `s-snap-cut.webp` | 512x384 | 4:3 | no | Card art window (Barbed Cut, rogue) | prefix |
| `s-strike.webp` | 512x384 | 4:3 | no | Card art window (Quick Cut, rogue) | prefix |
| `s-toxic-vial.webp` | 512x384 | 4:3 | no | Card art window (Toxic Vial, rogue) | prefix |
| `s-venom-storm.webp` | 512x384 | 4:3 | no | Card art window (Venom Storm, rogue) | prefix |
| `shiv.webp` | 512x384 | 4:3 | no | Card art window (Shiv, status) | prefix |
| `slimed.webp` | 512x384 | 4:3 | no | Card art window (Slimed, status) | prefix |
| `st-frail.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Status chip icon | prefix |
| `st-poison.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Status chip icon | prefix |
| `st-str.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Status chip icon | prefix |
| `st-vuln.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Status chip icon | prefix |
| `st-weak.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Status chip icon | prefix |
| `stance-c.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Monk stance badge | prefix |
| `stance-w.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Monk stance badge | prefix |
| `w-berserk-roll.webp` | 512x384 | 4:3 | no | Card art window (Berserk Roll, warrior) | prefix |
| `w-body-check.webp` | 512x384 | 4:3 | no | Card art window (Body Check, warrior) | prefix |
| `w-bulwark-bash.webp` | 512x384 | 4:3 | no | Card art window (Bulwark Bash, warrior) | prefix |
| `w-cleave.webp` | 512x384 | 4:3 | no | Card art window (Sweeping Arc, warrior) | prefix |
| `w-colossus-slam.webp` | 512x384 | 4:3 | no | Card art window (Colossus Slam, warrior) | prefix |
| `w-defend.webp` | 512x384 | 4:3 | no | Card art window (Plate Guard, warrior) | prefix |
| `w-double-down.webp` | 512x384 | 4:3 | no | Card art window (Double Down, warrior) | prefix |
| `w-final-gambit.webp` | 512x384 | 4:3 | no | Card art window (Final Gambit, warrior) | prefix |
| `w-hammer.webp` | 512x384 | 4:3 | no | Card art window (Anvil Blow, warrior) | prefix |
| `w-iron-skin.webp` | 512x384 | 4:3 | no | Card art window (Iron Skin, warrior) | prefix |
| `w-kindle.webp` | 512x384 | 4:3 | no | Card art window (Kindle, warrior) | prefix |
| `w-plate-up.webp` | 512x384 | 4:3 | no | Card art window (Plate Up, warrior) | prefix |
| `w-pyre-heart.webp` | 512x384 | 4:3 | no | Card art window (Pyre Heart, warrior) | prefix |
| `w-reapers-edge.webp` | 512x384 | 4:3 | no | Card art window (Reaper's Edge, warrior) | prefix |
| `w-roar.webp` | 512x384 | 4:3 | no | Card art window (Intimidating Roar, warrior) | prefix |
| `w-second-wind.webp` | 512x384 | 4:3 | no | Card art window (Second Wind, warrior) | prefix |
| `w-skull-rap.webp` | 512x384 | 4:3 | no | Card art window (Skull Rap, warrior) | prefix |
| `w-slow-burn.webp` | 512x384 | 4:3 | no | Card art window (Slow Burn, warrior) | prefix |
| `w-strike.webp` | 512x384 | 4:3 | no | Card art window (Cinder Strike, warrior) | prefix |
| `w-sunder.webp` | 512x384 | 4:3 | no | Card art window (Sunder Plate, warrior) | prefix |
| `w-twin-slash.webp` | 512x384 | 4:3 | no | Card art window (Twin Slash, warrior) | prefix |
| `w-warm-up.webp` | 512x384 | 4:3 | no | Card art window (Warm Up, warrior) | prefix |
| `w-whirlwind.webp` | 512x384 | 4:3 | no | Card art window (Whirling Gale, warrior) | prefix |
| `w-wild-swing.webp` | 512x384 | 4:3 | no | Card art window (Wild Swing, warrior) | prefix |
| `wound.webp` | 512x384 | 4:3 | no | Card art window (Wound, status) | prefix |
