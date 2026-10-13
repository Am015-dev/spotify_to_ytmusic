# Next wave: everything still to make, with prompts

Generated 2026-10-13 by `python3 games-src/scripts/next-wave.py` (rerun after look-check and wiring-status). Page: https://am015-dev.github.io/spotify_to_ytmusic/next-wave.html

- Replaces `MISSING-ASSETS.md` as the to-make list. Same sources deduped by game + file name: missing items, facelift elements still plain, and the look-check reviewer's findings (`games/look/needs-art.json`).
- Laptop prompt files (copy `games-src/next-wave/flow-2d` and `flow-3d` into game-assets): `flow-2d/<game>/prompts-wave6[-wide|-43|-34|-tall].json`, same `{"cards": {name: prompt}}` schema, one file per ratio. Card prompts are bare like the earlier waves (the runner puts the game's style block in front); the style block sits in the file under `style`.
- Music and sound cues: `games-src/next-wave/music/<game>/cues-wave6.json` (2 versions a and b of each, no vocals).
- Every picture prompt: our own names, no text, letters or numbers in the picture; a UI piece is one object on a plain flat white background. Make at 1024 px or larger; we crop and convert.

**Total 111**: paintings 102, 3D source paintings 0, music/sound 8, video 1.

Plus 1130 wave 7 items (pose sets, 3D variety, art variety): see `games-src/VARIETY-PLAN.md` and the page.

Dropped as already done: 3 family already made, 283 made (finished card), 8 replaced by approved 3D model, 1 named in game code, 13 pattern already made, 9 kit/family made, 1 kit made, 8 stale.

## Cauldron Fair (`cauldron-fair`): 5

Style block (in front of every picture prompt): Hand-painted gouache illustration for a cosy fantasy-fair board game, warm brown ink outline with a slightly wobbly brush edge, soft rim light, matte paper texture, rich but warm colours, simple readable silhouette that still works at 60 px wide, centred, plenty of margin, no text, no numbers

### gx-bar-plate: gx bar plate
- Why: look-check finding. Look-check: gx bar plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `gx-bar-plate.webp` (laptop) -> `games/cauldron-fair/media/gx-bar-plate.webp`
- Size/ratio: 1024x512, ratio 8.86, transparent (flat white background, we key it)
- Prompt: Hand-painted gouache illustration for a cosy fantasy-fair board game, warm brown ink outline with a slightly wobbly brush edge, soft rim light, matte paper texture, rich but warm colours, simple readable silhouette that still works at 60 px wide, centred, plenty of margin, no text, no numbers. a single gx bar plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### gx-drawer-head-plate: gx drawer head plate
- Why: look-check finding. Look-check: gx drawer head plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `gx-drawer-head-plate.webp` (laptop) -> `games/cauldron-fair/media/gx-drawer-head-plate.webp`
- Size/ratio: 1024x512, ratio 6, transparent (flat white background, we key it)
- Prompt: Hand-painted gouache illustration for a cosy fantasy-fair board game, warm brown ink outline with a slightly wobbly brush edge, soft rim light, matte paper texture, rich but warm colours, simple readable silhouette that still works at 60 px wide, centred, plenty of margin, no text, no numbers. a single gx drawer head plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### gxh-ok-button-plate: gxh ok button plate
- Why: look-check finding. Look-check: gxh ok button plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `gxh-ok-button-plate.webp` (laptop) -> `games/cauldron-fair/media/gxh-ok-button-plate.webp`
- Size/ratio: 512x512, ratio 1.68, transparent (flat white background, we key it)
- Prompt: Hand-painted gouache illustration for a cosy fantasy-fair board game, warm brown ink outline with a slightly wobbly brush edge, soft rim light, matte paper texture, rich but warm colours, simple readable silhouette that still works at 60 px wide, centred, plenty of margin, no text, no numbers. a single gxh ok button plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### tlink-button-plate: tlink button plate
- Why: look-check finding. Look-check: tlink button plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `tlink-button-plate.webp` (laptop) -> `games/cauldron-fair/media/tlink-button-plate.webp`
- Size/ratio: 1024x512, ratio 8.14, transparent (flat white background, we key it)
- Prompt: Hand-painted gouache illustration for a cosy fantasy-fair board game, warm brown ink outline with a slightly wobbly brush edge, soft rim light, matte paper texture, rich but warm colours, simple readable silhouette that still works at 60 px wide, centred, plenty of margin, no text, no numbers. a single tlink button plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### ttl-bg-picture: ttl bg picture
- Why: look-check finding. Look-check: ttl bg picture looks plain on screen | Look-check: ttl bg picture looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `ttl-bg-picture.webp` (laptop) -> `games/cauldron-fair/media/ttl-bg-picture.webp`
- Size/ratio: 1024x1024, ratio 0.51
- Prompt: Hand-painted gouache illustration for a cosy fantasy-fair board game, warm brown ink outline with a slightly wobbly brush edge, soft rim light, matte paper texture, rich but warm colours, simple readable silhouette that still works at 60 px wide, centred, plenty of margin, no text, no numbers. a single ttl bg picture, game art for a board game, no text

## Crown City Smash (`crown-city-smash`): 5

Style block (in front of every picture prompt): Bold hand-painted gouache illustration for a cheerful giant-monster city-brawl dice game, thick dark ink outline, saturated neon-night city colours, playful and a little menacing but never gory, simple readable silhouette, centred, no text

### btn-primary-button-plate: btn primary button plate
- Why: look-check finding. Look-check: btn primary button plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `btn-primary-button-plate.webp` (laptop) -> `games/crown-city-smash/media/btn-primary-button-plate.webp`
- Size/ratio: 1024x512, ratio 1.79, transparent (flat white background, we key it)
- Prompt: Bold hand-painted gouache illustration for a cheerful giant-monster city-brawl dice game, thick dark ink outline, saturated neon-night city colours, playful and a little menacing but never gory, simple readable silhouette, centred, no text. a single btn primary button plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### gx-bar-plate: gx bar plate
- Why: look-check finding. Look-check: gx bar plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `gx-bar-plate.webp` (laptop) -> `games/crown-city-smash/media/gx-bar-plate.webp`
- Size/ratio: 1024x512, ratio 7.5, transparent (flat white background, we key it)
- Prompt: Bold hand-painted gouache illustration for a cheerful giant-monster city-brawl dice game, thick dark ink outline, saturated neon-night city colours, playful and a little menacing but never gory, simple readable silhouette, centred, no text. a single gx bar plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### gx-drawer-head-plate: gx drawer head plate
- Why: look-check finding. Look-check: gx drawer head plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `gx-drawer-head-plate.webp` (laptop) -> `games/crown-city-smash/media/gx-drawer-head-plate.webp`
- Size/ratio: 1024x512, ratio 5.96, transparent (flat white background, we key it)
- Prompt: Bold hand-painted gouache illustration for a cheerful giant-monster city-brawl dice game, thick dark ink outline, saturated neon-night city colours, playful and a little menacing but never gory, simple readable silhouette, centred, no text. a single gx drawer head plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### gxh-ok-button-plate: gxh ok button plate
- Why: look-check finding. Look-check: gxh ok button plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `gxh-ok-button-plate.webp` (laptop) -> `games/crown-city-smash/media/gxh-ok-button-plate.webp`
- Size/ratio: 512x512, ratio 2.06, transparent (flat white background, we key it)
- Prompt: Bold hand-painted gouache illustration for a cheerful giant-monster city-brawl dice game, thick dark ink outline, saturated neon-night city colours, playful and a little menacing but never gory, simple readable silhouette, centred, no text. a single gxh ok button plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### newsbtn-button-plate: newsbtn button plate
- Why: look-check finding. Look-check: newsbtn button plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `newsbtn-button-plate.webp` (laptop) -> `games/crown-city-smash/media/newsbtn-button-plate.webp`
- Size/ratio: 512x512, ratio 11.94, transparent (flat white background, we key it)
- Prompt: Bold hand-painted gouache illustration for a cheerful giant-monster city-brawl dice game, thick dark ink outline, saturated neon-night city colours, playful and a little menacing but never gory, simple readable silhouette, centred, no text. a single newsbtn button plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

## Doorkick Dungeon (`doorkick-dungeon`): 16

Style block (in front of every picture prompt): Storybook gouache illustration for a cheerful, slightly grubby fantasy dungeon card game, warm torchlight against deep brown stone, thick dark-brown ink outline, simple readable silhouette, matte paper texture, no text

### btn-primary-button-plate: btn primary button plate
- Why: look-check finding. Look-check: btn primary button plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `btn-primary-button-plate.webp` (laptop) -> `games/doorkick-dungeon/media/btn-primary-button-plate.webp`
- Size/ratio: 512x512, ratio 2.25, transparent (flat white background, we key it)
- Prompt: Storybook gouache illustration for a cheerful, slightly grubby fantasy dungeon card game, warm torchlight against deep brown stone, thick dark-brown ink outline, simple readable silhouette, matte paper texture, no text. a single btn primary button plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### gx-app-plate: gx app plate
- Why: look-check finding. Look-check: gx app plate looks plain on screen | Look-check: gx app plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `gx-app-plate.webp` (laptop) -> `games/doorkick-dungeon/media/gx-app-plate.webp`
- Size/ratio: 1024x1024, ratio 0.51
- Prompt: Storybook gouache illustration for a cheerful, slightly grubby fantasy dungeon card game, warm torchlight against deep brown stone, thick dark-brown ink outline, simple readable silhouette, matte paper texture, no text. a single gx app plate, game art for a board game, no text

### gx-bar-plate: gx bar plate
- Why: look-check finding. Look-check: gx bar plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `gx-bar-plate.webp` (laptop) -> `games/doorkick-dungeon/media/gx-bar-plate.webp`
- Size/ratio: 1024x512, ratio 8.86, transparent (flat white background, we key it)
- Prompt: Storybook gouache illustration for a cheerful, slightly grubby fantasy dungeon card game, warm torchlight against deep brown stone, thick dark-brown ink outline, simple readable silhouette, matte paper texture, no text. a single gx bar plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### gx-dock-plate: gx dock plate
- Why: look-check finding. Look-check: gx dock plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `gx-dock-plate.webp` (laptop) -> `games/doorkick-dungeon/media/gx-dock-plate.webp`
- Size/ratio: 512x1024, ratio 0.57, transparent (flat white background, we key it)
- Prompt: Storybook gouache illustration for a cheerful, slightly grubby fantasy dungeon card game, warm torchlight against deep brown stone, thick dark-brown ink outline, simple readable silhouette, matte paper texture, no text. a single gx dock plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### gxt-b-pri-button-plate: gxt b pri button plate
- Why: look-check finding. Look-check: gxt b pri button plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `gxt-b-pri-button-plate.webp` (laptop) -> `games/doorkick-dungeon/media/gxt-b-pri-button-plate.webp`
- Size/ratio: 1024x512, ratio 6.29, transparent (flat white background, we key it)
- Prompt: Storybook gouache illustration for a cheerful, slightly grubby fantasy dungeon card game, warm torchlight against deep brown stone, thick dark-brown ink outline, simple readable silhouette, matte paper texture, no text. a single gxt b pri button plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### gxt-b-pulse-button-plate: gxt b pulse button plate
- Why: look-check finding. Look-check: gxt b pulse button plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `gxt-b-pulse-button-plate.webp` (laptop) -> `games/doorkick-dungeon/media/gxt-b-pulse-button-plate.webp`
- Size/ratio: 1024x512, ratio 6.29, transparent (flat white background, we key it)
- Prompt: Storybook gouache illustration for a cheerful, slightly grubby fantasy dungeon card game, warm torchlight against deep brown stone, thick dark-brown ink outline, simple readable silhouette, matte paper texture, no text. a single gxt b pulse button plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### modal-plate: modal plate
- Why: look-check finding. Look-check: modal plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `modal-plate.webp` (laptop) -> `games/doorkick-dungeon/media/modal-plate.webp`
- Size/ratio: 1024x1024, ratio 0.51
- Prompt: Storybook gouache illustration for a cheerful, slightly grubby fantasy dungeon card game, warm torchlight against deep brown stone, thick dark-brown ink outline, simple readable silhouette, matte paper texture, no text. a single modal plate, game art for a board game, no text

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

## Final Approach (`final-approach`): 3

Style block (in front of every picture prompt): Hand-painted gouache illustration for a cosy cockpit game, chunky soft shapes with a slightly wobbly dark navy outline, matte paper grain, rich but warm colours (teal panel, warm cream highlights, blue and orange crew colours), gentle rim light, soft drop shadow, crisp and readable at very small sizes, simple silhouettes, no text, no numbers

### gx-bar-plate: gx bar plate
- Why: look-check finding. Look-check: gx bar plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `gx-bar-plate.webp` (laptop) -> `games/final-approach/media/gx-bar-plate.webp`
- Size/ratio: 1024x512, ratio 8.86, transparent (flat white background, we key it)
- Prompt: Hand-painted gouache illustration for a cosy cockpit game, chunky soft shapes with a slightly wobbly dark navy outline, matte paper grain, rich but warm colours (teal panel, warm cream highlights, blue and orange crew colours), gentle rim light, soft drop shadow, crisp and readable at very small sizes, simple silhouettes, no text, no numbers. a single gx bar plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### tlink-button-plate: tlink button plate
- Why: look-check finding. Look-check: tlink button plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `tlink-button-plate.webp` (laptop) -> `games/final-approach/media/tlink-button-plate.webp`
- Size/ratio: 512x512, ratio 3.03, transparent (flat white background, we key it)
- Prompt: Hand-painted gouache illustration for a cosy cockpit game, chunky soft shapes with a slightly wobbly dark navy outline, matte paper grain, rich but warm colours (teal panel, warm cream highlights, blue and orange crew colours), gentle rim light, soft drop shadow, crisp and readable at very small sizes, simple silhouettes, no text, no numbers. a single tlink button plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### ttl-bg-picture: ttl bg picture
- Why: look-check finding. Look-check: ttl bg picture looks plain on screen | Look-check: ttl bg picture looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `ttl-bg-picture.webp` (laptop) -> `games/final-approach/media/ttl-bg-picture.webp`
- Size/ratio: 1024x1024, ratio 0.51
- Prompt: Hand-painted gouache illustration for a cosy cockpit game, chunky soft shapes with a slightly wobbly dark navy outline, matte paper grain, rich but warm colours (teal panel, warm cream highlights, blue and orange crew colours), gentle rim light, soft drop shadow, crisp and readable at very small sizes, simple silhouettes, no text, no numbers. a single ttl bg picture, game art for a board game, no text

## Hollowbough (`hollowbough`): 3

Style block (in front of every picture prompt): Storybook watercolour and gouache illustration for a woodland city-building game, woodland critters and tree houses in autumn colours, soft brown outline, matte paper texture, simple readable silhouette, no text

### board-plate: board plate
- Why: look-check finding. Look-check: board plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `board-plate.webp` (laptop) -> `games/hollowbough/media/board-plate.webp`
- Size/ratio: 1024x1024, ratio 0.54
- Prompt: Storybook watercolour and gouache illustration for a woodland city-building game, woodland critters and tree houses in autumn colours, soft brown outline, matte paper texture, simple readable silhouette, no text. a single board plate, game art for a board game, no text

### chipb-button-plate: chipb button plate
- Why: look-check finding. Look-check: chipb button plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `chipb-button-plate.webp` (laptop) -> `games/hollowbough/media/chipb-button-plate.webp`
- Size/ratio: 512x512, ratio 1.36, transparent (flat white background, we key it)
- Prompt: Storybook watercolour and gouache illustration for a woodland city-building game, woodland critters and tree houses in autumn colours, soft brown outline, matte paper texture, simple readable silhouette, no text. a single chipb button plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### start-plate: start plate
- Why: look-check finding. Look-check: start plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `start-plate.webp` (laptop) -> `games/hollowbough/media/start-plate.webp`
- Size/ratio: 1024x1024, ratio 0.51
- Prompt: Storybook watercolour and gouache illustration for a woodland city-building game, woodland critters and tree houses in autumn colours, soft brown outline, matte paper texture, simple readable silhouette, no text. a single start plate, game art for a board game, no text

## Kaiten Kitchen (`kaiten-kitchen`): 6

Style block (in front of every picture prompt): Hand-painted gouache illustration for a cosy card game, top-down view of a single round ceramic plate, the food on the plate is a cute character with an expressive face (little eyebrows, eyelids, a clear emotion), warm-brown ink outline with a slightly wobbly brush edge, soft rim light, gentle shadow under the plate, rich but warm colours, matte paper texture, crisp at small sizes, simple readable silhouette, centred, plenty of margin, plain transparent background, no text. Do NOT put the plate on a placemat.

### chipb-button-plate: chipb button plate
- Why: look-check finding. Look-check: chipb button plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `chipb-button-plate.webp` (laptop) -> `games/kaiten-kitchen/media/chipb-button-plate.webp`
- Size/ratio: 512x512, ratio 1.52, transparent (flat white background, we key it)
- Prompt: Hand-painted gouache illustration for a cosy card game, top-down view of a single round ceramic plate, the food on the plate is a cute character with an expressive face (little eyebrows, eyelids, a clear emotion), warm-brown ink outline with a slightly wobbly brush edge, soft rim light, gentle shadow under the plate, rich but warm colours, matte paper texture, crisp at small sizes, simple readable silhouette, centred, plenty of margin, plain transparent background, no text. Do NOT put the plate on a placemat. a single chipb button plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### chipb-seatb-button-plate: chipb seatb button plate
- Why: look-check finding. Look-check: chipb seatb button plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `chipb-seatb-button-plate.webp` (laptop) -> `games/kaiten-kitchen/media/chipb-seatb-button-plate.webp`
- Size/ratio: 512x512, ratio 1.67, transparent (flat white background, we key it)
- Prompt: Hand-painted gouache illustration for a cosy card game, top-down view of a single round ceramic plate, the food on the plate is a cute character with an expressive face (little eyebrows, eyelids, a clear emotion), warm-brown ink outline with a slightly wobbly brush edge, soft rim light, gentle shadow under the plate, rich but warm colours, matte paper texture, crisp at small sizes, simple readable silhouette, centred, plenty of margin, plain transparent background, no text. Do NOT put the plate on a placemat. a single chipb seatb button plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### gx-bar-plate: gx bar plate
- Why: look-check finding. Look-check: gx bar plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `gx-bar-plate.webp` (laptop) -> `games/kaiten-kitchen/media/gx-bar-plate.webp`
- Size/ratio: 1024x512, ratio 8.86, transparent (flat white background, we key it)
- Prompt: Hand-painted gouache illustration for a cosy card game, top-down view of a single round ceramic plate, the food on the plate is a cute character with an expressive face (little eyebrows, eyelids, a clear emotion), warm-brown ink outline with a slightly wobbly brush edge, soft rim light, gentle shadow under the plate, rich but warm colours, matte paper texture, crisp at small sizes, simple readable silhouette, centred, plenty of margin, plain transparent background, no text. Do NOT put the plate on a placemat. a single gx bar plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### tlink-button-plate: tlink button plate
- Why: look-check finding. Look-check: tlink button plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `tlink-button-plate.webp` (laptop) -> `games/kaiten-kitchen/media/tlink-button-plate.webp`
- Size/ratio: 512x512, ratio 3.03, transparent (flat white background, we key it)
- Prompt: Hand-painted gouache illustration for a cosy card game, top-down view of a single round ceramic plate, the food on the plate is a cute character with an expressive face (little eyebrows, eyelids, a clear emotion), warm-brown ink outline with a slightly wobbly brush edge, soft rim light, gentle shadow under the plate, rich but warm colours, matte paper texture, crisp at small sizes, simple readable silhouette, centred, plenty of margin, plain transparent background, no text. Do NOT put the plate on a placemat. a single tlink button plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### ttl-bg-dim-picture: ttl bg dim picture
- Why: look-check finding. Look-check: ttl bg dim picture looks plain on screen | Look-check: ttl bg dim picture looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `ttl-bg-dim-picture.webp` (laptop) -> `games/kaiten-kitchen/media/ttl-bg-dim-picture.webp`
- Size/ratio: 1024x1024, ratio 0.51
- Prompt: Hand-painted gouache illustration for a cosy card game, top-down view of a single round ceramic plate, the food on the plate is a cute character with an expressive face (little eyebrows, eyelids, a clear emotion), warm-brown ink outline with a slightly wobbly brush edge, soft rim light, gentle shadow under the plate, rich but warm colours, matte paper texture, crisp at small sizes, simple readable silhouette, centred, plenty of margin, plain transparent background, no text. Do NOT put the plate on a placemat. a single ttl bg dim picture, game art for a board game, no text

### ttl-bg-picture: ttl bg picture
- Why: look-check finding. Look-check: ttl bg picture looks plain on screen | Look-check: ttl bg picture looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `ttl-bg-picture.webp` (laptop) -> `games/kaiten-kitchen/media/ttl-bg-picture.webp`
- Size/ratio: 1024x1024, ratio 0.51
- Prompt: Hand-painted gouache illustration for a cosy card game, top-down view of a single round ceramic plate, the food on the plate is a cute character with an expressive face (little eyebrows, eyelids, a clear emotion), warm-brown ink outline with a slightly wobbly brush edge, soft rim light, gentle shadow under the plate, rich but warm colours, matte paper texture, crisp at small sizes, simple readable silhouette, centred, plenty of margin, plain transparent background, no text. Do NOT put the plate on a placemat. a single ttl bg picture, game art for a board game, no text

## Lantern Dive (`lantern-dive`): 3

Style block (in front of every picture prompt): Hand-painted gouache illustration for a calm co-operative deep-sea card game, deep blue and teal water, a small warm golden lantern glow as the only strong warm light, soft rim light, visible gentle brush texture on matte paper, slightly wobbly dark navy ink outline, simple readable silhouette that still works at 40 pixels, rich but not neon colours, centred, plenty of margin, no text

### gx-bar-plate: gx bar plate
- Why: look-check finding. Look-check: gx bar plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `gx-bar-plate.webp` (laptop) -> `games/lantern-dive/media/gx-bar-plate.webp`
- Size/ratio: 1024x512, ratio 8.67, transparent (flat white background, we key it)
- Prompt: Hand-painted gouache illustration for a calm co-operative deep-sea card game, deep blue and teal water, a small warm golden lantern glow as the only strong warm light, soft rim light, visible gentle brush texture on matte paper, slightly wobbly dark navy ink outline, simple readable silhouette that still works at 40 pixels, rich but not neon colours, centred, plenty of margin, no text. a single gx bar plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### tlink-button-plate: tlink button plate
- Why: look-check finding. Look-check: tlink button plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `tlink-button-plate.webp` (laptop) -> `games/lantern-dive/media/tlink-button-plate.webp`
- Size/ratio: 512x512, ratio 3.03, transparent (flat white background, we key it)
- Prompt: Hand-painted gouache illustration for a calm co-operative deep-sea card game, deep blue and teal water, a small warm golden lantern glow as the only strong warm light, soft rim light, visible gentle brush texture on matte paper, slightly wobbly dark navy ink outline, simple readable silhouette that still works at 40 pixels, rich but not neon colours, centred, plenty of margin, no text. a single tlink button plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### ttl-bg-picture: ttl bg picture
- Why: look-check finding. Look-check: ttl bg picture looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `ttl-bg-picture.webp` (laptop) -> `games/lantern-dive/media/ttl-bg-picture.webp`
- Size/ratio: 1024x1024, ratio 0.51
- Prompt: Hand-painted gouache illustration for a calm co-operative deep-sea card game, deep blue and teal water, a small warm golden lantern glow as the only strong warm light, soft rim light, visible gentle brush texture on matte paper, slightly wobbly dark navy ink outline, simple readable silhouette that still works at 40 pixels, rich but not neon colours, centred, plenty of margin, no text. a single ttl bg picture, game art for a board game, no text

## Mainhattan Nightrun (`mainhattan-nightrun`): 31

Style block (in front of every picture prompt): Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers

### bemp-plate: bEmp plate
- Why: look-check finding. Look-check: bEmp plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `bemp-plate.webp` (laptop) -> `games/mainhattan-nightrun/media/bemp-plate.webp`
- Size/ratio: 512x512, ratio 1, transparent (flat white background, we key it)
- Prompt: Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers. a single bEmp plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### bpause-plate: bPause plate
- Why: look-check finding. Look-check: bPause plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `bpause-plate.webp` (laptop) -> `games/mainhattan-nightrun/media/bpause-plate.webp`
- Size/ratio: 512x512, ratio 1, transparent (flat white background, we key it)
- Prompt: Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers. a single bPause plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### dailybtn-plate: dailyBtn plate
- Why: look-check finding. Look-check: dailyBtn plate looks plain on screen | Look-check: dailyBtn plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `dailybtn-plate.webp` (laptop) -> `games/mainhattan-nightrun/media/dailybtn-plate.webp`
- Size/ratio: 512x512, ratio 3.45, transparent (flat white background, we key it)
- Prompt: Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers. a single dailyBtn plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### diffbtn-plate: diffBtn plate
- Why: look-check finding. Look-check: diffBtn plate looks plain on screen | Look-check: diffBtn plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `diffbtn-plate.webp` (laptop) -> `games/mainhattan-nightrun/media/diffbtn-plate.webp`
- Size/ratio: 512x512, ratio 3.48, transparent (flat white background, we key it)
- Prompt: Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers. a single diffBtn plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### gabtn-plate: gaBtn plate
- Why: look-check finding. Look-check: gaBtn plate looks plain on screen | Look-check: gaBtn plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `gabtn-plate.webp` (laptop) -> `games/mainhattan-nightrun/media/gabtn-plate.webp`
- Size/ratio: 512x512, ratio 3.76, transparent (flat white background, we key it)
- Prompt: Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers. a single gaBtn plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### go-dim-plate: go dim plate
- Why: look-check finding. Look-check: go dim plate looks plain on screen | Look-check: go dim plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `go-dim-plate.webp` (laptop) -> `games/mainhattan-nightrun/media/go-dim-plate.webp`
- Size/ratio: 512x512, ratio 3.68, transparent (flat white background, we key it)
- Prompt: Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers. a single go dim plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### labbtn-plate: labBtn plate
- Why: look-check finding. Look-check: labBtn plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `labbtn-plate.webp` (laptop) -> `games/mainhattan-nightrun/media/labbtn-plate.webp`
- Size/ratio: 512x512, ratio 2.01, transparent (flat white background, we key it)
- Prompt: Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers. a single labBtn plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### missing-picture-fx-bullet-needle-webp: missing picture fx-bullet-needle.webp
- Why: look-check finding. Look-check: missing picture fx-bullet-needle.webp looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `missing-picture-fx-bullet-needle-webp.webp` (laptop) -> `games/mainhattan-nightrun/media/missing-picture-fx-bullet-needle-webp.webp`
- Size/ratio: 1024x1024, ratio 1, transparent (flat white background, we key it)
- Prompt: Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers. a single missing picture fx-bullet-needle.webp, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### missing-picture-fx-bullet-rocket-webp: missing picture fx-bullet-rocket.webp
- Why: look-check finding. Look-check: missing picture fx-bullet-rocket.webp looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `missing-picture-fx-bullet-rocket-webp.webp` (laptop) -> `games/mainhattan-nightrun/media/missing-picture-fx-bullet-rocket-webp.webp`
- Size/ratio: 1024x1024, ratio 1, transparent (flat white background, we key it)
- Prompt: Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers. a single missing picture fx-bullet-rocket.webp, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### missing-picture-fx-bullet-shell-webp: missing picture fx-bullet-shell.webp
- Why: look-check finding. Look-check: missing picture fx-bullet-shell.webp looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `missing-picture-fx-bullet-shell-webp.webp` (laptop) -> `games/mainhattan-nightrun/media/missing-picture-fx-bullet-shell-webp.webp`
- Size/ratio: 1024x1024, ratio 1, transparent (flat white background, we key it)
- Prompt: Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers. a single missing picture fx-bullet-shell.webp, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### setbtn-plate: setBtn plate
- Why: look-check finding. Look-check: setBtn plate looks plain on screen | Look-check: setBtn plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `setbtn-plate.webp` (laptop) -> `games/mainhattan-nightrun/media/setbtn-plate.webp`
- Size/ratio: 512x512, ratio 3.28, transparent (flat white background, we key it)
- Prompt: Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers. a single setBtn plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### startbtn-plate: startBtn plate
- Why: look-check finding. Look-check: startBtn plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `startbtn-plate.webp` (laptop) -> `games/mainhattan-nightrun/media/startbtn-plate.webp`
- Size/ratio: 512x512, ratio 3.09, transparent (flat white background, we key it)
- Prompt: Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers. a single startBtn plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### storybtn-plate: storyBtn plate
- Why: look-check finding. Look-check: storyBtn plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `storybtn-plate.webp` (laptop) -> `games/mainhattan-nightrun/media/storybtn-plate.webp`
- Size/ratio: 512x512, ratio 3.68, transparent (flat white background, we key it)
- Prompt: Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers. a single storyBtn plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### title-plate: title plate
- Why: look-check finding. Look-check: title plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `title-plate.webp` (laptop) -> `games/mainhattan-nightrun/media/title-plate.webp`
- Size/ratio: 1024x1024, ratio 0.51
- Prompt: Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers. a single title plate, game art for a board game, no text

### wpbtn-plate: wpBtn plate
- Why: look-check finding. Look-check: wpBtn plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `wpbtn-plate.webp` (laptop) -> `games/mainhattan-nightrun/media/wpbtn-plate.webp`
- Size/ratio: 512x512, ratio 2.82, transparent (flat white background, we key it)
- Prompt: Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers. a single wpBtn plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

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

## Nebula Aces (`nebula-aces`): 1

Style block (in front of every picture prompt): Hand-painted gouache sci-fi illustration for a starfighter duel game, deep indigo space, glowing engine light, clean readable shapes, retro-futurist, rich but not neon colours, no text

### gx-bar-plate: gx bar plate
- Why: look-check finding. Look-check: gx bar plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `gx-bar-plate.webp` (laptop) -> `games/nebula-aces/media/gx-bar-plate.webp`
- Size/ratio: 1024x512, ratio 8.86, transparent (flat white background, we key it)
- Prompt: Hand-painted gouache sci-fi illustration for a starfighter duel game, deep indigo space, glowing engine light, clean readable shapes, retro-futurist, rich but not neon colours, no text. a single gx bar plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

## Rampart & Vine (`rampart-and-vine`): 3

Style block (in front of every picture prompt): Hand-painted gouache illustration for a medieval valley tile-laying game, green fields, stone towers and vines, warm afternoon light, matte paper texture, slightly wobbly dark brown outline, simple readable silhouette, no text

### card-frame: card frame
- Why: look-check finding. Look-check: card frame looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `card-frame.webp` (laptop) -> `games/rampart-and-vine/media/card-frame.webp`
- Size/ratio: 512x1024, ratio 0.68, transparent (flat white background, we key it)
- Prompt: Hand-painted gouache illustration for a medieval valley tile-laying game, green fields, stone towers and vines, warm afternoon light, matte paper texture, slightly wobbly dark brown outline, simple readable silhouette, no text. a single card frame, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### scrim-plate: scrim plate
- Why: look-check finding. Look-check: scrim plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `scrim-plate.webp` (laptop) -> `games/rampart-and-vine/media/scrim-plate.webp`
- Size/ratio: 1024x1024, ratio 0.51
- Prompt: Hand-painted gouache illustration for a medieval valley tile-laying game, green fields, stone towers and vines, warm afternoon light, matte paper texture, slightly wobbly dark brown outline, simple readable silhouette, no text. a single scrim plate, game art for a board game, no text

### top-plate: top plate
- Why: look-check finding. Look-check: top plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `top-plate.webp` (laptop) -> `games/rampart-and-vine/media/top-plate.webp`
- Size/ratio: 1024x512, ratio 7.22, transparent (flat white background, we key it)
- Prompt: Hand-painted gouache illustration for a medieval valley tile-laying game, green fields, stone towers and vines, warm afternoon light, matte paper texture, slightly wobbly dark brown outline, simple readable silhouette, no text. a single top plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

## Sands of Qamar (`sands-of-qamar`): 8

Style block (in front of every picture prompt): Hand-painted gouache illustration for a bazaar-and-palace bidding game, warm sand, copper and lapis blue, lantern light, soft rim light, matte paper texture, slightly wobbly dark brown outline, simple readable silhouette, no text

### dcard-plate: dcard plate
- Why: look-check finding. Look-check: dcard plate looks plain on screen | Look-check: dcard plate looks plain on screen | Look-check: dcard plate looks plain on screen | Look-check: dcard plate looks plain on screen | Look-check: dcard plate looks plain on screen | Look-check: dcard plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `dcard-plate.webp` (laptop) -> `games/sands-of-qamar/media/dcard-plate.webp`
- Size/ratio: 512x512, ratio 4.16, transparent (flat white background, we key it)
- Prompt: Hand-painted gouache illustration for a bazaar-and-palace bidding game, warm sand, copper and lapis blue, lantern light, soft rim light, matte paper texture, slightly wobbly dark brown outline, simple readable silhouette, no text. a single dcard plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### gx-bar-plate: gx bar plate
- Why: look-check finding. Look-check: gx bar plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `gx-bar-plate.webp` (laptop) -> `games/sands-of-qamar/media/gx-bar-plate.webp`
- Size/ratio: 1024x512, ratio 7.5, transparent (flat white background, we key it)
- Prompt: Hand-painted gouache illustration for a bazaar-and-palace bidding game, warm sand, copper and lapis blue, lantern light, soft rim light, matte paper texture, slightly wobbly dark brown outline, simple readable silhouette, no text. a single gx bar plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### gx-drawer-head-plate: gx drawer head plate
- Why: look-check finding. Look-check: gx drawer head plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `gx-drawer-head-plate.webp` (laptop) -> `games/sands-of-qamar/media/gx-drawer-head-plate.webp`
- Size/ratio: 1024x512, ratio 5.96, transparent (flat white background, we key it)
- Prompt: Hand-painted gouache illustration for a bazaar-and-palace bidding game, warm sand, copper and lapis blue, lantern light, soft rim light, matte paper texture, slightly wobbly dark brown outline, simple readable silhouette, no text. a single gx drawer head plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### mi-plate: mi plate
- Why: look-check finding. Look-check: mi plate looks plain on screen | Look-check: mi plate looks plain on screen | Look-check: mi plate looks plain on screen | Look-check: mi plate looks plain on screen | Look-check: mi plate looks plain on screen | Look-check: mi plate looks plain on screen | Look-check: mi plate looks plain on screen | Look-check: mi plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `mi-plate.webp` (laptop) -> `games/sands-of-qamar/media/mi-plate.webp`
- Size/ratio: 512x512, ratio 1.2, transparent (flat white background, we key it)
- Prompt: Hand-painted gouache illustration for a bazaar-and-palace bidding game, warm sand, copper and lapis blue, lantern light, soft rim light, matte paper texture, slightly wobbly dark brown outline, simple readable silhouette, no text. a single mi plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### modal-plate: modal plate
- Why: look-check finding. Look-check: modal plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `modal-plate.webp` (laptop) -> `games/sands-of-qamar/media/modal-plate.webp`
- Size/ratio: 1024x1024, ratio 0.51
- Prompt: Hand-painted gouache illustration for a bazaar-and-palace bidding game, warm sand, copper and lapis blue, lantern light, soft rim light, matte paper texture, slightly wobbly dark brown outline, simple readable silhouette, no text. a single modal plate, game art for a board game, no text

### spot-plate: spot plate
- Why: look-check finding. Look-check: spot plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `spot-plate.webp` (laptop) -> `games/sands-of-qamar/media/spot-plate.webp`
- Size/ratio: 512x512, ratio 0.71, transparent (flat white background, we key it)
- Prompt: Hand-painted gouache illustration for a bazaar-and-palace bidding game, warm sand, copper and lapis blue, lantern light, soft rim light, matte paper texture, slightly wobbly dark brown outline, simple readable silhouette, no text. a single spot plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### tile-blue-plate: tile blue plate
- Why: look-check finding. Look-check: tile blue plate looks plain on screen | Look-check: tile blue plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `tile-blue-plate.webp` (laptop) -> `games/sands-of-qamar/media/tile-blue-plate.webp`
- Size/ratio: 512x512, ratio 0.65, transparent (flat white background, we key it)
- Prompt: Hand-painted gouache illustration for a bazaar-and-palace bidding game, warm sand, copper and lapis blue, lantern light, soft rim light, matte paper texture, slightly wobbly dark brown outline, simple readable silhouette, no text. a single tile blue plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### tile-red-plate: tile red plate
- Why: look-check finding. Look-check: tile red plate looks plain on screen | Look-check: tile red plate looks plain on screen | Look-check: tile red plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `tile-red-plate.webp` (laptop) -> `games/sands-of-qamar/media/tile-red-plate.webp`
- Size/ratio: 512x512, ratio 0.65, transparent (flat white background, we key it)
- Prompt: Hand-painted gouache illustration for a bazaar-and-palace bidding game, warm sand, copper and lapis blue, lantern light, soft rim light, matte paper texture, slightly wobbly dark brown outline, simple readable silhouette, no text. a single tile red plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

## Shipwreck Isle (`shipwreck-isle`): 5

Style block (in front of every picture prompt): Tropical castaway gouache illustration for a co-operative island survival card game, turquoise, sand, jungle green and driftwood colours, soft rim light, matte paper texture, slightly wobbly dark ink outline, simple readable silhouette that works small, centred, plenty of margin, no text

### gx-bar-plate: gx bar plate
- Why: look-check finding. Look-check: gx bar plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `gx-bar-plate.webp` (laptop) -> `games/shipwreck-isle/media/gx-bar-plate.webp`
- Size/ratio: 1024x512, ratio 8.86, transparent (flat white background, we key it)
- Prompt: Tropical castaway gouache illustration for a co-operative island survival card game, turquoise, sand, jungle green and driftwood colours, soft rim light, matte paper texture, slightly wobbly dark ink outline, simple readable silhouette that works small, centred, plenty of margin, no text. a single gx bar plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### gxt-b-button-plate: gxt b button plate
- Why: look-check finding. Look-check: gxt b button plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `gxt-b-button-plate.webp` (laptop) -> `games/shipwreck-isle/media/gxt-b-button-plate.webp`
- Size/ratio: 1024x512, ratio 6.29, transparent (flat white background, we key it)
- Prompt: Tropical castaway gouache illustration for a co-operative island survival card game, turquoise, sand, jungle green and driftwood colours, soft rim light, matte paper texture, slightly wobbly dark ink outline, simple readable silhouette that works small, centred, plenty of margin, no text. a single gxt b button plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### gxt-b-pri-button-plate: gxt b pri button plate
- Why: look-check finding. Look-check: gxt b pri button plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `gxt-b-pri-button-plate.webp` (laptop) -> `games/shipwreck-isle/media/gxt-b-pri-button-plate.webp`
- Size/ratio: 1024x512, ratio 6.29, transparent (flat white background, we key it)
- Prompt: Tropical castaway gouache illustration for a co-operative island survival card game, turquoise, sand, jungle green and driftwood colours, soft rim light, matte paper texture, slightly wobbly dark ink outline, simple readable silhouette that works small, centred, plenty of margin, no text. a single gxt b pri button plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### scen-button-plate: scen button plate
- Why: look-check finding. Look-check: scen button plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `scen-button-plate.webp` (laptop) -> `games/shipwreck-isle/media/scen-button-plate.webp`
- Size/ratio: 1024x512, ratio 2.44, transparent (flat white background, we key it)
- Prompt: Tropical castaway gouache illustration for a co-operative island survival card game, turquoise, sand, jungle green and driftwood colours, soft rim light, matte paper texture, slightly wobbly dark ink outline, simple readable silhouette that works small, centred, plenty of margin, no text. a single scen button plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### char-soldier: Card art, part 2
- Why: missing. Missing: picture not yet made
- Type: painting; priority 3 (missing extra)
- Save as: `char-soldier.webp` (laptop) -> `games-src/rc/art/char-soldier.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Character card picture. We crop media/camp-soldier.webp from this one.
- Prompt: Tropical castaway gouache illustration for a co-operative island survival card game, turquoise, sand, jungle green and driftwood colours, soft rim light, matte paper texture, slightly wobbly dark ink outline, simple readable silhouette that works small, centred, plenty of margin, no text. The Soldier: a weary castaway soldier in a tattered red coat with a flintlock pistol on his belt, no text, letters or numbers

## Short Fuse (`short-fuse`): 9

Style block (in front of every picture prompt): Workshop gouache illustration for a cheerful bomb-defusal crew card game, warm lamplight against cool blueprint blues, brass and copper wire, slightly wobbly dark ink outline, matte paper texture, simple readable silhouette, no text

### gx-bar-plate: gx bar plate
- Why: look-check finding. Look-check: gx bar plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `gx-bar-plate.webp` (laptop) -> `games/short-fuse/media/gx-bar-plate.webp`
- Size/ratio: 1024x512, ratio 8.13, transparent (flat white background, we key it)
- Prompt: Workshop gouache illustration for a cheerful bomb-defusal crew card game, warm lamplight against cool blueprint blues, brass and copper wire, slightly wobbly dark ink outline, matte paper texture, simple readable silhouette, no text. a single gx bar plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### gx-drawer-head-plate: gx drawer head plate
- Why: look-check finding. Look-check: gx drawer head plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `gx-drawer-head-plate.webp` (laptop) -> `games/short-fuse/media/gx-drawer-head-plate.webp`
- Size/ratio: 1024x512, ratio 6.42, transparent (flat white background, we key it)
- Prompt: Workshop gouache illustration for a cheerful bomb-defusal crew card game, warm lamplight against cool blueprint blues, brass and copper wire, slightly wobbly dark ink outline, matte paper texture, simple readable silhouette, no text. a single gx drawer head plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### plate-mine-plate: plate mine plate
- Why: look-check finding. Look-check: plate mine plate looks plain on screen | Look-check: plate mine plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `plate-mine-plate.webp` (laptop) -> `games/short-fuse/media/plate-mine-plate.webp`
- Size/ratio: 512x512, ratio 4.25, transparent (flat white background, we key it)
- Prompt: Workshop gouache illustration for a cheerful bomb-defusal crew card game, warm lamplight against cool blueprint blues, brass and copper wire, slightly wobbly dark ink outline, matte paper texture, simple readable silhouette, no text. a single plate mine plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### plate-plate: plate plate
- Why: look-check finding. Look-check: plate plate looks plain on screen | Look-check: plate plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `plate-plate.webp` (laptop) -> `games/short-fuse/media/plate-plate.webp`
- Size/ratio: 512x512, ratio 5.91, transparent (flat white background, we key it)
- Prompt: Workshop gouache illustration for a cheerful bomb-defusal crew card game, warm lamplight against cool blueprint blues, brass and copper wire, slightly wobbly dark ink outline, matte paper texture, simple readable silhouette, no text. a single plate plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### rp-plate: rp plate
- Why: look-check finding. Look-check: rp plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `rp-plate.webp` (laptop) -> `games/short-fuse/media/rp-plate.webp`
- Size/ratio: 512x512, ratio 11.26, transparent (flat white background, we key it)
- Prompt: Workshop gouache illustration for a cheerful bomb-defusal crew card game, warm lamplight against cool blueprint blues, brass and copper wire, slightly wobbly dark ink outline, matte paper texture, simple readable silhouette, no text. a single rp plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### start-plate: start plate
- Why: look-check finding. Look-check: start plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `start-plate.webp` (laptop) -> `games/short-fuse/media/start-plate.webp`
- Size/ratio: 1024x1024, ratio 0.51
- Prompt: Workshop gouache illustration for a cheerful bomb-defusal crew card game, warm lamplight against cool blueprint blues, brass and copper wire, slightly wobbly dark ink outline, matte paper texture, simple readable silhouette, no text. a single start plate, game art for a board game, no text

### tb-plate: tb plate
- Why: look-check finding. Look-check: tb plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `tb-plate.webp` (laptop) -> `games/short-fuse/media/tb-plate.webp`
- Size/ratio: 1024x1024, ratio 0.55
- Prompt: Workshop gouache illustration for a cheerful bomb-defusal crew card game, warm lamplight against cool blueprint blues, brass and copper wire, slightly wobbly dark ink outline, matte paper texture, simple readable silhouette, no text. a single tb plate, game art for a board game, no text

### tile-crew-plate: tile crew plate
- Why: look-check finding. Look-check: tile crew plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `tile-crew-plate.webp` (laptop) -> `games/short-fuse/media/tile-crew-plate.webp`
- Size/ratio: 512x512, ratio 0.77, transparent (flat white background, we key it)
- Prompt: Workshop gouache illustration for a cheerful bomb-defusal crew card game, warm lamplight against cool blueprint blues, brass and copper wire, slightly wobbly dark ink outline, matte paper texture, simple readable silhouette, no text. a single tile crew plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### tile-mine-plate: tile mine plate
- Why: look-check finding. Look-check: tile mine plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `tile-mine-plate.webp` (laptop) -> `games/short-fuse/media/tile-mine-plate.webp`
- Size/ratio: 512x512, ratio 0.76, transparent (flat white background, we key it)
- Prompt: Workshop gouache illustration for a cheerful bomb-defusal crew card game, warm lamplight against cool blueprint blues, brass and copper wire, slightly wobbly dark ink outline, matte paper texture, simple readable silhouette, no text. a single tile mine plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

## Sunglaze (`sunglaze`): 1

Style block (in front of every picture prompt): Hand-painted gouache illustration for a glazed-tile mosaic workshop game, jewel-bright glaze colours, warm kiln glow, matte paper texture, slightly wobbly dark ink outline, simple readable silhouette, no text

### btn-sm-button-plate: btn sm button plate
- Why: look-check finding. Look-check: btn sm button plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `btn-sm-button-plate.webp` (laptop) -> `games/sunglaze/media/btn-sm-button-plate.webp`
- Size/ratio: 512x512, ratio 1.31, transparent (flat white background, we key it)
- Prompt: Hand-painted gouache illustration for a glazed-tile mosaic workshop game, jewel-bright glaze colours, warm kiln glow, matte paper texture, slightly wobbly dark ink outline, simple readable silhouette, no text. a single btn sm button plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

## The Thornbound Throne (`thornbound`): 7

Style block (in front of every picture prompt): Dark-fairytale court painting in deep green, crimson and tarnished gold, candlelit, painterly brushwork, rich shadows, no text, no lettering, no frame.

### board-plate: board plate
- Why: look-check finding. Look-check: board plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `board-plate.webp` (laptop) -> `games/thornbound/media/board-plate.webp`
- Size/ratio: 1024x1024, ratio 0.71
- Prompt: Dark-fairytale court painting in deep green, crimson and tarnished gold, candlelit, painterly brushwork, rich shadows, no text, no lettering, no frame. a single board plate, game art for a board game, no text

### gx-bar-plate: gx bar plate
- Why: look-check finding. Look-check: gx bar plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `gx-bar-plate.webp` (laptop) -> `games/thornbound/media/gx-bar-plate.webp`
- Size/ratio: 1024x512, ratio 8.86, transparent (flat white background, we key it)
- Prompt: Dark-fairytale court painting in deep green, crimson and tarnished gold, candlelit, painterly brushwork, rich shadows, no text, no lettering, no frame. a single gx bar plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### gx-drawer-head-plate: gx drawer head plate
- Why: look-check finding. Look-check: gx drawer head plate looks plain on screen | Look-check: gx drawer head plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `gx-drawer-head-plate.webp` (laptop) -> `games/thornbound/media/gx-drawer-head-plate.webp`
- Size/ratio: 1024x512, ratio 6.42, transparent (flat white background, we key it)
- Prompt: Dark-fairytale court painting in deep green, crimson and tarnished gold, candlelit, painterly brushwork, rich shadows, no text, no lettering, no frame. a single gx drawer head plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### gxh-ok-button-plate: gxh ok button plate
- Why: look-check finding. Look-check: gxh ok button plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `gxh-ok-button-plate.webp` (laptop) -> `games/thornbound/media/gxh-ok-button-plate.webp`
- Size/ratio: 512x512, ratio 2.04, transparent (flat white background, we key it)
- Prompt: Dark-fairytale court painting in deep green, crimson and tarnished gold, candlelit, painterly brushwork, rich shadows, no text, no lettering, no frame. a single gxh ok button plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### tbtn-button-plate: tbtn button plate
- Why: look-check finding. Look-check: tbtn button plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `tbtn-button-plate.webp` (laptop) -> `games/thornbound/media/tbtn-button-plate.webp`
- Size/ratio: 1024x512, ratio 5.4, transparent (flat white background, we key it)
- Prompt: Dark-fairytale court painting in deep green, crimson and tarnished gold, candlelit, painterly brushwork, rich shadows, no text, no lettering, no frame. a single tbtn button plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### tbtn-story-button-plate: tbtn story button plate
- Why: look-check finding. Look-check: tbtn story button plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `tbtn-story-button-plate.webp` (laptop) -> `games/thornbound/media/tbtn-story-button-plate.webp`
- Size/ratio: 1024x512, ratio 5.4, transparent (flat white background, we key it)
- Prompt: Dark-fairytale court painting in deep green, crimson and tarnished gold, candlelit, painterly brushwork, rich shadows, no text, no lettering, no frame. a single tbtn story button plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### tkey-picture: tkey picture
- Why: look-check finding. Look-check: tkey picture looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `tkey-picture.webp` (laptop) -> `games/thornbound/media/tkey-picture.webp`
- Size/ratio: 1024x1024, ratio 0.51
- Prompt: Dark-fairytale court painting in deep green, crimson and tarnished gold, candlelit, painterly brushwork, rich shadows, no text, no lettering, no frame. a single tkey picture, game art for a board game, no text

## Tidewake (`tidewake`): 5

Style block (in front of every picture prompt): Hand-painted gouache illustration for a sea-tile navigation game with giant sea leviathans, deep teal water, warm lantern light, foam and scales, matte paper texture, slightly wobbly dark navy outline, simple readable silhouette, no text

### button-button-plate: button button plate
- Why: look-check finding. Look-check: button button plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `button-button-plate.webp` (laptop) -> `games/tidewake/media/button-button-plate.webp`
- Size/ratio: 512x512, ratio 3.63, transparent (flat white background, we key it)
- Prompt: Hand-painted gouache illustration for a sea-tile navigation game with giant sea leviathans, deep teal water, warm lantern light, foam and scales, matte paper texture, slightly wobbly dark navy outline, simple readable silhouette, no text. a single button button plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### gx-bar-plate: gx bar plate
- Why: look-check finding. Look-check: gx bar plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `gx-bar-plate.webp` (laptop) -> `games/tidewake/media/gx-bar-plate.webp`
- Size/ratio: 1024x512, ratio 8.86, transparent (flat white background, we key it)
- Prompt: Hand-painted gouache illustration for a sea-tile navigation game with giant sea leviathans, deep teal water, warm lantern light, foam and scales, matte paper texture, slightly wobbly dark navy outline, simple readable silhouette, no text. a single gx bar plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### gx-drawer-head-plate: gx drawer head plate
- Why: look-check finding. Look-check: gx drawer head plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `gx-drawer-head-plate.webp` (laptop) -> `games/tidewake/media/gx-drawer-head-plate.webp`
- Size/ratio: 1024x512, ratio 5.96, transparent (flat white background, we key it)
- Prompt: Hand-painted gouache illustration for a sea-tile navigation game with giant sea leviathans, deep teal water, warm lantern light, foam and scales, matte paper texture, slightly wobbly dark navy outline, simple readable silhouette, no text. a single gx drawer head plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### gxh-ok-button-plate: gxh ok button plate
- Why: look-check finding. Look-check: gxh ok button plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `gxh-ok-button-plate.webp` (laptop) -> `games/tidewake/media/gxh-ok-button-plate.webp`
- Size/ratio: 512x512, ratio 1.99, transparent (flat white background, we key it)
- Prompt: Hand-painted gouache illustration for a sea-tile navigation game with giant sea leviathans, deep teal water, warm lantern light, foam and scales, matte paper texture, slightly wobbly dark navy outline, simple readable silhouette, no text. a single gxh ok button plate, game art for a board game, single object, centred, plain flat white background, no shadow, no text

### start-plate: start plate
- Why: look-check finding. Look-check: start plate looks plain on screen
- Type: painting; priority 1 (look-check)
- Save as: `start-plate.webp` (laptop) -> `games/tidewake/media/start-plate.webp`
- Size/ratio: 1024x1024, ratio 0.51
- Prompt: Hand-painted gouache illustration for a sea-tile navigation game with giant sea leviathans, deep teal water, warm lantern light, foam and scales, matte paper texture, slightly wobbly dark navy outline, simple readable silhouette, no text. a single start plate, game art for a board game, no text

