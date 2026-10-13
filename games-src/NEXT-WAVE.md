# Next wave: everything still to make, with prompts

Generated 2026-10-13 by `python3 games-src/scripts/next-wave.py` (rerun after look-check and wiring-status). Page: https://am015-dev.github.io/spotify_to_ytmusic/next-wave.html

- Replaces `MISSING-ASSETS.md` as the to-make list. Same sources deduped by game + file name: missing items, facelift elements still plain, and the look-check reviewer's findings (`games/look/needs-art.json`, not there yet).
- Laptop prompt files (copy `games-src/next-wave/flow-2d` and `flow-3d` into game-assets): `flow-2d/<game>/prompts-wave6[-wide|-43|-34|-tall].json`, same `{"cards": {name: prompt}}` schema, one file per ratio. Card prompts are bare like the earlier waves (the runner puts the game's style block in front); the style block sits in the file under `style`.
- Music and sound cues: `games-src/next-wave/music/<game>/cues-wave6.json` (2 versions a and b of each, no vocals).
- Every picture prompt: our own names, no text, letters or numbers in the picture; a UI piece is one object on a plain flat white background. Make at 1024 px or larger; we crop and convert.

**Total 26**: paintings 17, 3D source paintings 0, music/sound 8, video 1.

Plus 1130 wave 7 items (pose sets, 3D variety, art variety): see `games-src/VARIETY-PLAN.md` and the page.

Dropped as already done: 3 family already made, 283 made (finished card), 8 replaced by approved 3D model, 1 named in game code, 13 pattern already made, 9 kit/family made, 1 kit made, 8 stale.

## Doorkick Dungeon (`doorkick-dungeon`): 9

### doorkick-twins-boss: Boss reveal clip
- Why: missing. Missing: boss clip
- Type: video; priority 3 (missing extra)
- Save as: `doorkick-twins-boss.mp4` (laptop) -> `games/doorkick-dungeon/media/doorkick-twins-boss.mp4`
- Size/ratio: 854x480, ratio 16:9
- Note: Also repaint the Doorkick card painting twins.webp from the same still if you like the new look.
- Prompt: Step 1, new still (Flow refused the old card picture, which shows two ghost children): two identical tall hooded skeleton gravediggers holding hands in a candlelit crypt doorway, mist at their feet, glowing pale eyes, grinning, storybook gouache. Step 2, image-to-video from that still: slow cinematic push-in, the twins sway in perfect sync, mist drifts, eyes flare once, candle flames flicker, 6 seconds, no audio, no text.

### amb-tavern: Sound extras
- Why: missing. Missing: music cue
- Type: music; priority 3 (missing extra)
- Save as: `amb-tavern.mp3` -> `games-src/audio/doorkick/treblo/amb-tavern.mp3`
- Size/ratio: 60 s seamless loop
- Prompt: Medieval tavern ambience loop: distant crowd chatter with no clear words, mugs clinking, a crackling fireplace, creaking floorboards. 60 seconds, seamless loop. No vocals. Make 2 versions (a and b).

### stinger-bad: Sound extras
- Why: missing. Missing: music cue
- Type: music; priority 3 (missing extra)
- Save as: `stinger-bad.mp3` -> `games-src/audio/doorkick/treblo/stinger-bad.mp3`
- Size/ratio: under 2 s
- Prompt: Short medieval game sound effect, two quick low plucks slightly off-key, a playful "nope", under 2 seconds, dry, no reverb tail, no vocals. Make 2 versions (a and b).

### stinger-boss: Sound extras
- Why: missing. Missing: music cue
- Type: music; priority 3 (missing extra)
- Save as: `stinger-boss.mp3` -> `games-src/audio/doorkick/treblo/stinger-boss.mp3`
- Size/ratio: under 2 s
- Prompt: Short medieval game sound effect, deep war-drum hit with a low horn blast and a door-slam crack, under 2 seconds, dry, no reverb tail, no vocals. Make 2 versions (a and b).

### stinger-curse: Sound extras
- Why: missing. Missing: music cue
- Type: music; priority 3 (missing extra)
- Save as: `stinger-curse.mp3` -> `games-src/audio/doorkick/treblo/stinger-curse.mp3`
- Size/ratio: under 2 s
- Prompt: Short medieval game sound effect, spooky rising glass-harmonica shimmer with a goblin giggle and no words, under 2 seconds, dry, no reverb tail, no vocals. Make 2 versions (a and b).

### stinger-level: Sound extras
- Why: missing. Missing: music cue
- Type: music; priority 3 (missing extra)
- Save as: `stinger-level.mp3` -> `games-src/audio/doorkick/treblo/stinger-level.mp3`
- Size/ratio: under 2 s
- Prompt: Short medieval game sound effect, bright lute strum rising into a small bell chime, a happy level-up, under 2 seconds, dry, no reverb tail, no vocals. Make 2 versions (a and b).

### stinger-lose: Sound extras
- Why: missing. Missing: music cue
- Type: music; priority 3 (missing extra)
- Save as: `stinger-lose.mp3` -> `games-src/audio/doorkick/treblo/stinger-lose.mp3`
- Size/ratio: under 2 s
- Prompt: Short medieval game sound effect, descending bassoon wah-wah with a soft drum thud, comic, under 2 seconds, dry, no reverb tail, no vocals. Make 2 versions (a and b).

### stinger-turn: Sound extras
- Why: missing. Missing: music cue
- Type: music; priority 3 (missing extra)
- Save as: `stinger-turn.mp3` -> `games-src/audio/doorkick/treblo/stinger-turn.mp3`
- Size/ratio: under 2 s
- Prompt: Short medieval game sound effect, a single warm hand-drum tap plus a lute pluck, a gentle "your turn", under 2 seconds, dry, no reverb tail, no vocals. Make 2 versions (a and b).

### stinger-win: Sound extras
- Why: missing. Missing: music cue
- Type: music; priority 3 (missing extra)
- Save as: `stinger-win.mp3` -> `games-src/audio/doorkick/treblo/stinger-win.mp3`
- Size/ratio: under 2 s
- Prompt: Short medieval game sound effect, short brass fanfare three notes up with a cymbal sparkle, under 2 seconds, dry, no reverb tail, no vocals. Make 2 versions (a and b).

## Mainhattan Nightrun (`mainhattan-nightrun`): 16

Style block (in front of every picture prompt): Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers

### fx-bullet-needle: Enemy bullet effects
- Why: missing. Missing: picture not yet made
- Type: painting; priority 3 (missing extra)
- Save as: `fx-bullet-needle.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-bullet-needle.webp`
- Size/ratio: 256x64, ratio 4:1
- Note: Light on a black background (added on screen).
- Prompt: Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers. a thin fast lime-yellow energy needle pointing RIGHT with a short fading tail, light on black, no text, letters or numbers

### fx-bullet-rocket: Enemy bullet effects
- Why: missing. Missing: picture not yet made
- Type: painting; priority 3 (missing extra)
- Save as: `fx-bullet-rocket.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-bullet-rocket.webp`
- Size/ratio: 256x128, ratio 2:1
- Note: Light on a black background (added on screen).
- Prompt: Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers. a glowing missile flying RIGHT, pale blue-white body, red nose, orange exhaust flame trailing left, light on black, no text, letters or numbers

### fx-bullet-shell: Enemy bullet effects
- Why: missing. Missing: picture not yet made
- Type: painting; priority 3 (missing extra)
- Save as: `fx-bullet-shell.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-bullet-shell.webp`
- Size/ratio: 128x128, ratio 1:1
- Note: Light on a black background (added on screen).
- Prompt: Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers. a big round orange energy shell, hot white core, molten orange glow, a thin darker ring, light on black, no text, letters or numbers

### kit-ckp: Garage perk icons
- Why: missing. Missing: picture not yet made
- Type: painting; priority 3 (missing extra)
- Save as: `kit-ckp.webp` (laptop) -> `games/mainhattan-nightrun/media/kit-ckp.webp`
- Size/ratio: 128x128, ratio 1:1
- Prompt: Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers. Combo Keeper: a padlock holding a glowing orange multiplier flame, no text, letters or numbers

### kit-crt: Garage perk icons
- Why: missing. Missing: picture not yet made
- Type: painting; priority 3 (missing extra)
- Save as: `kit-crt.webp` (laptop) -> `games/mainhattan-nightrun/media/kit-crt.webp`
- Size/ratio: 128x128, ratio 1:1
- Prompt: Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers. Critical Core: a faceted red crystal with a white starburst at its heart, no text, letters or numbers

### kit-dmg: Garage perk icons
- Why: missing. Missing: picture not yet made
- Type: painting; priority 3 (missing extra)
- Save as: `kit-dmg.webp` (laptop) -> `games/mainhattan-nightrun/media/kit-dmg.webp`
- Size/ratio: 128x128, ratio 1:1
- Prompt: Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers. Power Core: a glowing red-orange reactor core with a lightning crack, no text, letters or numbers

### kit-drn: Garage perk icons
- Why: missing. Missing: picture not yet made
- Type: painting; priority 3 (missing extra)
- Save as: `kit-drn.webp` (laptop) -> `games/mainhattan-nightrun/media/kit-drn.webp`
- Size/ratio: 128x128, ratio 1:1
- Prompt: Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers. Wingman Drone: a small round gunmetal drone with two thrusters and a cyan eye, no text, letters or numbers

### kit-dsh: Garage perk icons
- Why: missing. Missing: picture not yet made
- Type: painting; priority 3 (missing extra)
- Save as: `kit-dsh.webp` (laptop) -> `games/mainhattan-nightrun/media/kit-dsh.webp`
- Size/ratio: 128x128, ratio 1:1
- Prompt: Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers. Dash Capacitor: a capacitor cylinder with a bright motion streak behind it, no text, letters or numbers

### kit-hul: Garage perk icons
- Why: missing. Missing: picture not yet made
- Type: painting; priority 3 (missing extra)
- Save as: `kit-hul.webp` (laptop) -> `games/mainhattan-nightrun/media/kit-hul.webp`
- Size/ratio: 128x128, ratio 1:1
- Prompt: Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers. Hull Plating: a riveted steel hull plate with a green plus cut into it, no text, letters or numbers

### kit-mag: Garage perk icons
- Why: missing. Missing: picture not yet made
- Type: painting; priority 3 (missing extra)
- Save as: `kit-mag.webp` (laptop) -> `games/mainhattan-nightrun/media/kit-mag.webp`
- Size/ratio: 128x128, ratio 1:1
- Prompt: Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers. Magnet Coil: a coil magnet pulling small neon crystals toward it, no text, letters or numbers

### kit-nmn: Garage perk icons
- Why: missing. Missing: picture not yet made
- Type: painting; priority 3 (missing extra)
- Save as: `kit-nmn.webp` (laptop) -> `games/mainhattan-nightrun/media/kit-nmn.webp`
- Size/ratio: 128x128, ratio 1:1
- Prompt: Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers. Neon Mining: a pickaxe striking a cluster of neon crystals, no text, letters or numbers

### kit-pwd: Garage perk icons
- Why: missing. Missing: picture not yet made
- Type: painting; priority 3 (missing extra)
- Save as: `kit-pwd.webp` (laptop) -> `games/mainhattan-nightrun/media/kit-pwd.webp`
- Size/ratio: 128x128, ratio 1:1
- Prompt: Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers. Power Amp: a speaker amplifier cone with magenta shock rings, no text, letters or numbers

### kit-rev: Garage perk icons
- Why: missing. Missing: picture not yet made
- Type: painting; priority 3 (missing extra)
- Save as: `kit-rev.webp` (laptop) -> `games/mainhattan-nightrun/media/kit-rev.webp`
- Size/ratio: 128x128, ratio 1:1
- Prompt: Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers. Revive Token: a golden coin with a heartbeat glow, a thin halo above it, no text, letters or numbers

### kit-rgn: Garage perk icons
- Why: missing. Missing: picture not yet made
- Type: painting; priority 3 (missing extra)
- Save as: `kit-rgn.webp` (laptop) -> `games/mainhattan-nightrun/media/kit-rgn.webp`
- Size/ratio: 128x128, ratio 1:1
- Prompt: Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers. Shield Regen: a cyan shield with a circular refill arrow around it, no text, letters or numbers

### kit-rof: Garage perk icons
- Why: missing. Missing: picture not yet made
- Type: painting; priority 3 (missing extra)
- Save as: `kit-rof.webp` (laptop) -> `games/mainhattan-nightrun/media/kit-rof.webp`
- Size/ratio: 128x128, ratio 1:1
- Prompt: Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers. Rapid Coil: a coil of copper wire charged with yellow sparks, two forward chevrons behind it, no text, letters or numbers

### kit-shd: Garage perk icons
- Why: missing. Missing: picture not yet made
- Type: painting; priority 3 (missing extra)
- Save as: `kit-shd.webp` (laptop) -> `games/mainhattan-nightrun/media/kit-shd.webp`
- Size/ratio: 128x128, ratio 1:1
- Prompt: Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers. Shield Plating: a cyan shield made of layered armour plates, no text, letters or numbers

## Shipwreck Isle (`shipwreck-isle`): 1

Style block (in front of every picture prompt): Tropical castaway gouache illustration for a co-operative island survival card game, turquoise, sand, jungle green and driftwood colours, soft rim light, matte paper texture, slightly wobbly dark ink outline, simple readable silhouette that works small, centred, plenty of margin, no text

### char-soldier: Card art, part 2
- Why: missing. Missing: picture not yet made
- Type: painting; priority 3 (missing extra)
- Save as: `char-soldier.webp` (laptop) -> `games-src/rc/art/char-soldier.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Character card picture. We crop media/camp-soldier.webp from this one.
- Prompt: Tropical castaway gouache illustration for a co-operative island survival card game, turquoise, sand, jungle green and driftwood colours, soft rim light, matte paper texture, slightly wobbly dark ink outline, simple readable silhouette that works small, centred, plenty of margin, no text. The Soldier: a weary castaway soldier in a tattered red coat with a flintlock pistol on his belt, no text, letters or numbers

