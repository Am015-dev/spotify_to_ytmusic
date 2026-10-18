# Next wave: everything still to make, with prompts

Generated 2026-10-18 by `python3 games-src/scripts/next-wave.py` (rerun after look-check and wiring-status). Page: https://am015-dev.github.io/spotify_to_ytmusic/next-wave.html

- Replaces `MISSING-ASSETS.md` as the to-make list. Same sources deduped by game + file name: missing items, facelift elements still plain, and the look-check reviewer's findings (`games/look/needs-art.json`).
- Laptop prompt files (copy `games-src/next-wave/flow-2d` and `flow-3d` into game-assets): `flow-2d/<game>/prompts-wave6[-wide|-43|-34|-tall].json`, same `{"cards": {name: prompt}}` schema, one file per ratio. Card prompts are bare like the earlier waves (the runner puts the game's style block in front); the style block sits in the file under `style`.
- Music and sound cues: `games-src/next-wave/music/<game>/cues-wave6.json` (2 versions a and b of each, no vocals).
- Every picture prompt: our own names, no text, letters or numbers in the picture; a UI piece is one object on a plain flat white background. Make at 1024 px or larger; we crop and convert.

**Total 399**: paintings 390, 3D source paintings 0, music/sound 8, video 1.

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

## Mainhattan Nightrun (`mainhattan-nightrun`): 319

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

### fx-boom-boss-a: Effects (wave 8): fx-boom-boss-a
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-boom-boss-a.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-boom-boss-a.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Giant boss explosion A: a huge orange-white fireball with a shockwave ring. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A giant boss explosion: huge orange-white fireball, a thick expanding shockwave ring and flying embers, centred, on a pure solid black background, centred, 512x512, soft transparent-friendly edges, no characters, no text, no letters.

### fx-boom-boss-b: Effects (wave 8): fx-boom-boss-b
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-boom-boss-b.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-boom-boss-b.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Giant boss explosion B: a cold magenta-cyan energy implosion-then-burst. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A giant boss explosion in cold colours: a magenta and cyan energy blast with a bright white core, a ring and long streaking sparks, centred, on a pure solid black background, centred, 512x512, soft transparent-friendly edges, no characters, no text, no letters.

### fx-boom-debris: Effects (wave 8): fx-boom-debris
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-boom-debris.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-boom-debris.webp`
- Size/ratio: 512x512, ratio 1:1, transparent (flat white background, we key it)
- Note: A cluster of 6 metal debris pieces (plates, bolts) with a hot orange edge, scattered, as a sprite sheet-free single picture. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A scatter of six torn metal fragments and plates with glowing orange edges, in a ring around the centre, on a plain flat white background, centred, 512x512, soft transparent-friendly edges, no characters, no text, no letters.

### fx-boom-ground-dust: Effects (wave 8): fx-boom-ground-dust
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-boom-ground-dust.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-boom-ground-dust.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Soft dust and smoke puff for ground explosions, lit from within. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A soft puff of grey-orange dust and smoke lit by a fiery glow, centred, rising slightly, on a pure solid black background, centred, 512x512, soft transparent-friendly edges, no characters, no text, no letters.

### fx-boom-large-electric: Effects (wave 8): fx-boom-large-electric
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-boom-large-electric.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-boom-large-electric.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Explosion, large, electric look. Burst centred, fills the square, fades to black at the edges. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A large, dramatic explosion with a shockwave ring: cyan-white electric blast with crackling lightning arcs, centred burst filling the square, on a pure solid black background, centred, 512x512, soft transparent-friendly edges, no characters, no text, no letters.

### fx-boom-large-fire: Effects (wave 8): fx-boom-large-fire
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-boom-large-fire.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-boom-large-fire.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Explosion, large, fire look. Burst centred, fills the square, fades to black at the edges. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A large, dramatic explosion with a shockwave ring: orange-yellow fire with a white-hot core and black-red smoke edges, centred burst filling the square, on a pure solid black background, centred, 512x512, soft transparent-friendly edges, no characters, no text, no letters.

### fx-boom-large-plasma: Effects (wave 8): fx-boom-large-plasma
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-boom-large-plasma.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-boom-large-plasma.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Explosion, large, plasma look. Burst centred, fills the square, fades to black at the edges. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A large, dramatic explosion with a shockwave ring: magenta-violet plasma blast with a glowing ring and drifting energy sparks, centred burst filling the square, on a pure solid black background, centred, 512x512, soft transparent-friendly edges, no characters, no text, no letters.

### fx-boom-medium-electric: Effects (wave 8): fx-boom-medium-electric
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-boom-medium-electric.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-boom-medium-electric.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Explosion, medium, electric look. Burst centred, fills the square, fades to black at the edges. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A medium explosion for a gunship or a mine: cyan-white electric blast with crackling lightning arcs, centred burst filling the square, on a pure solid black background, centred, 512x512, soft transparent-friendly edges, no characters, no text, no letters.

### fx-boom-medium-fire: Effects (wave 8): fx-boom-medium-fire
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-boom-medium-fire.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-boom-medium-fire.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Explosion, medium, fire look. Burst centred, fills the square, fades to black at the edges. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A medium explosion for a gunship or a mine: orange-yellow fire with a white-hot core and black-red smoke edges, centred burst filling the square, on a pure solid black background, centred, 512x512, soft transparent-friendly edges, no characters, no text, no letters.

### fx-boom-medium-plasma: Effects (wave 8): fx-boom-medium-plasma
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-boom-medium-plasma.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-boom-medium-plasma.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Explosion, medium, plasma look. Burst centred, fills the square, fades to black at the edges. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A medium explosion for a gunship or a mine: magenta-violet plasma blast with a glowing ring and drifting energy sparks, centred burst filling the square, on a pure solid black background, centred, 512x512, soft transparent-friendly edges, no characters, no text, no letters.

### fx-boom-small-electric: Effects (wave 8): fx-boom-small-electric
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-boom-small-electric.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-boom-small-electric.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Explosion, small, electric look. Burst centred, fills the square, fades to black at the edges. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A small, quick explosion for a drone: cyan-white electric blast with crackling lightning arcs, centred burst filling the square, on a pure solid black background, centred, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-boom-small-fire: Effects (wave 8): fx-boom-small-fire
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-boom-small-fire.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-boom-small-fire.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Explosion, small, fire look. Burst centred, fills the square, fades to black at the edges. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A small, quick explosion for a drone: orange-yellow fire with a white-hot core and black-red smoke edges, centred burst filling the square, on a pure solid black background, centred, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-boom-small-plasma: Effects (wave 8): fx-boom-small-plasma
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-boom-small-plasma.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-boom-small-plasma.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Explosion, small, plasma look. Burst centred, fills the square, fades to black at the edges. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A small, quick explosion for a drone: magenta-violet plasma blast with a glowing ring and drifting energy sparks, centred burst filling the square, on a pure solid black background, centred, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-eb-aim-line: Effects (wave 8): fx-eb-aim-line
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-eb-aim-line.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-eb-aim-line.webp`
- Size/ratio: 256x32, ratio 8:1
- Note: A dashed red warning line, tileable. Wide 256x32 picture; we crop and convert.
- Prompt: A thin red warning aim line made of glowing dashes, horizontal, tileable left to right, on a pure solid black background, tileable left to right, 256x32, soft transparent-friendly edges, no characters, no text, no letters.

### fx-eb-bomb: Effects (wave 8): fx-eb-bomb
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-eb-bomb.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-eb-bomb.webp`
- Size/ratio: 256x256, ratio 1:1, transparent (flat white background, we key it)
- Note: A round black bomb with a glowing orange fuse spark, seen from the side. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A round black cyberpunk bomb with an orange glowing band and a sparking fuse, seen from the side, on a plain flat white background, centred, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-eb-heal-ring: Effects (wave 8): fx-eb-heal-ring
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-eb-heal-ring.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-eb-heal-ring.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: A green healing ring with small plus signs drifting around it, soft glow. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A soft green healing aura ring with tiny glowing plus shapes around it, circular, centred, filling the square, on a pure solid black background, centred, 512x512, soft transparent-friendly edges, no characters, no text, no letters.

### fx-eb-laser-sweep: Effects (wave 8): fx-eb-laser-sweep
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-eb-laser-sweep.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-eb-laser-sweep.webp`
- Size/ratio: 512x64, ratio 8:1
- Note: A wide sweeping boss laser, bright white core, red edges, horizontal and tileable. Wide 512x64 picture; we crop and convert.
- Prompt: A wide boss laser beam, a white core and red-orange edges with small energy ripples, horizontal, tileable left to right, on a pure solid black background, tileable left to right, 512x64, soft transparent-friendly edges, no characters, no text, no letters.

### fx-eb-mine: Effects (wave 8): fx-eb-mine
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-eb-mine.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-eb-mine.webp`
- Size/ratio: 256x256, ratio 1:1, transparent (flat white background, we key it)
- Note: A spiked lime-green mine with a red blinking light. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A round spiked proximity mine in dark metal with lime-green glowing lights and a small red blinking light, seen from above, on a plain flat white background, centred, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-eb-plasma: Effects (wave 8): fx-eb-plasma
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-eb-plasma.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-eb-plasma.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: A lime-pink plasma ball with a swirling core, round, centred. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A round enemy plasma ball, a swirling lime-green and hot pink core with a dark outline ring and a soft glow, centred, on a pure solid black background, centred, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-eb-rocket-trail: Effects (wave 8): fx-eb-rocket-trail
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-eb-rocket-trail.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-eb-rocket-trail.webp`
- Size/ratio: 512x128, ratio 4:1
- Note: Smoke-fire trail, bright at the right (head) end, fading to the left. Wide 512x128 picture; we crop and convert.
- Prompt: A rocket exhaust trail, white-yellow at the right end fading through orange to dark red smoke at the left end, horizontal, on a pure solid black background, facing right, pointing to the right, 512x128, soft transparent-friendly edges, no characters, no text, no letters.

### fx-eb-shield-bubble: Effects (wave 8): fx-eb-shield-bubble
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-eb-shield-bubble.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-eb-shield-bubble.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: A cyan energy bubble, hexagon pattern, brighter at the rim, empty centre, facing right. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A glowing cyan energy shield bubble, a faint hexagon pattern, bright rim, transparent dark centre, a circle filling the square, on a pure solid black background, centred, 512x512, soft transparent-friendly edges, no characters, no text, no letters.

### fx-eb-shockwave-ring: Effects (wave 8): fx-eb-shockwave-ring
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-eb-shockwave-ring.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-eb-shockwave-ring.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: A thin bright expanding ring, red-orange, even thickness, centred. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A thin bright red-orange shockwave ring with a soft glow, perfectly circular, centred, filling the square, on a pure solid black background, centred, 512x512, soft transparent-friendly edges, no characters, no text, no letters.

### fx-eb-sniper-beam: Effects (wave 8): fx-eb-sniper-beam
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-eb-sniper-beam.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-eb-sniper-beam.webp`
- Size/ratio: 256x64, ratio 4:1
- Note: Tileable red-lime laser line, bright core, soft glow, horizontal, stretched to the player. Wide 256x64 picture; we crop and convert.
- Prompt: A thin horizontal sniper laser line, a bright red-white core and a soft red glow, tileable left to right, on a pure solid black background, tileable left to right, 256x64, soft transparent-friendly edges, no characters, no text, no letters.

### fx-ft-arc: Effects (wave 8): fx-ft-arc
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-ft-arc.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-ft-arc.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: On-foot arc gun projectile, facing right, centred. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: An on-foot arc gun projectile: a short jagged cyan lightning bolt with a white core, facing right, centred, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-ft-arc-hit: Effects (wave 8): fx-ft-arc-hit
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-ft-arc-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-ft-arc-hit.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: On-foot arc gun impact burst, centred. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: An impact effect for the on-foot arc gun: a cyan electric burst with branching arcs, centred, on a pure solid black background, centred, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-ft-arc-muzzle: Effects (wave 8): fx-ft-arc-muzzle
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-ft-arc-muzzle.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-ft-arc-muzzle.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: On-foot arc gun muzzle flash pointing right, base at the left-centre edge. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A muzzle flash for the on-foot arc gun: a cyan electric crackle, starting at the left-centre edge and pointing right, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-ft-blood-spark: Effects (wave 8): fx-ft-blood-spark
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-ft-blood-spark.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-ft-blood-spark.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: A neutral cyber spark burst: cyan-white sparks and a few small circuit-pattern fragments. No blood, no gore. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A neutral cyber hit spark: a burst of cyan and white sparks with a few small glowing circuit fragments, no blood, no gore, centred, on a pure solid black background, centred, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-ft-dust: Effects (wave 8): fx-ft-dust
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-ft-dust.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-ft-dust.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: A low puff of dust lit by neon from the side. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A low puff of dust and steam from the ground, softly lit by pink and teal neon, centred, flat bottom, on a pure solid black background, centred, 512x512, soft transparent-friendly edges, no characters, no text, no letters.

### fx-ft-flame: Effects (wave 8): fx-ft-flame
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-ft-flame.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-ft-flame.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: On-foot flamethrower projectile, facing right, centred. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: An on-foot flamethrower projectile: a short ball of orange-red fire with a yellow core, licking tail, facing right, centred, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-ft-flame-hit: Effects (wave 8): fx-ft-flame-hit
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-ft-flame-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-ft-flame-hit.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: On-foot flamethrower impact burst, centred. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: An impact effect for the on-foot flamethrower: a splash of burning orange flame with embers, centred, on a pure solid black background, centred, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-ft-flame-muzzle: Effects (wave 8): fx-ft-flame-muzzle
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-ft-flame-muzzle.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-ft-flame-muzzle.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: On-foot flamethrower muzzle flash pointing right, base at the left-centre edge. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A muzzle flash for the on-foot flamethrower: a roaring orange flame cone, starting at the left-centre edge and pointing right, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-ft-grenade: Effects (wave 8): fx-ft-grenade
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-ft-grenade.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-ft-grenade.webp`
- Size/ratio: 256x256, ratio 1:1, transparent (flat white background, we key it)
- Note: A round cyberpunk grenade with a glowing green band and a pin ring, side view. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A round cyberpunk hand grenade in dark metal with a glowing green band and a small pin ring, side view, on a plain flat white background, centred, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-ft-mg-bullet: Effects (wave 8): fx-ft-mg-bullet
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-ft-mg-bullet.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-ft-mg-bullet.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: On-foot machine gun projectile, facing right, centred. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: An on-foot machine gun projectile: a thin orange tracer bullet streak, long and narrow, facing right, centred, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-ft-mg-hit: Effects (wave 8): fx-ft-mg-hit
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-ft-mg-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-ft-mg-hit.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: On-foot machine gun impact burst, centred. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: An impact effect for the on-foot machine gun: a quick orange spark spray, centred, on a pure solid black background, centred, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-ft-mg-muzzle: Effects (wave 8): fx-ft-mg-muzzle
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-ft-mg-muzzle.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-ft-mg-muzzle.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: On-foot machine gun muzzle flash pointing right, base at the left-centre edge. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A muzzle flash for the on-foot machine gun: a stuttering orange flash with side sparks, starting at the left-centre edge and pointing right, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-ft-pistol-bullet: Effects (wave 8): fx-ft-pistol-bullet
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-ft-pistol-bullet.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-ft-pistol-bullet.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: On-foot pistol projectile, facing right, centred. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: An on-foot pistol projectile: a small yellow-white tracer bullet with a short streak, facing right, centred, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-ft-pistol-hit: Effects (wave 8): fx-ft-pistol-hit
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-ft-pistol-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-ft-pistol-hit.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: On-foot pistol impact burst, centred. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: An impact effect for the on-foot pistol: a small yellow spark burst, centred, on a pure solid black background, centred, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-ft-pistol-muzzle: Effects (wave 8): fx-ft-pistol-muzzle
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-ft-pistol-muzzle.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-ft-pistol-muzzle.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: On-foot pistol muzzle flash pointing right, base at the left-centre edge. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A muzzle flash for the on-foot pistol: a small yellow-white flash, starting at the left-centre edge and pointing right, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-ft-rocket: Effects (wave 8): fx-ft-rocket
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-ft-rocket.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-ft-rocket.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: On-foot rocket launcher projectile, facing right, centred. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: An on-foot rocket launcher projectile: a small rocket glowing white-orange with a bright exhaust flame, side view, facing right, centred, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-ft-rocket-hit: Effects (wave 8): fx-ft-rocket-hit
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-ft-rocket-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-ft-rocket-hit.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: On-foot rocket launcher impact burst, centred. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: An impact effect for the on-foot rocket launcher: a bright orange explosion burst with a ring, centred, on a pure solid black background, centred, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-ft-rocket-muzzle: Effects (wave 8): fx-ft-rocket-muzzle
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-ft-rocket-muzzle.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-ft-rocket-muzzle.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: On-foot rocket launcher muzzle flash pointing right, base at the left-centre edge. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A muzzle flash for the on-foot rocket launcher: a fiery backblast cone and smoke glow, starting at the left-centre edge and pointing right, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-ft-shield-hit: Effects (wave 8): fx-ft-shield-hit
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-ft-shield-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-ft-shield-hit.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: A blue hex ripple with a bright flash at the centre. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A blue energy shield hit: a bright white-blue flash with a hexagon ripple spreading out from it, centred, on a pure solid black background, centred, 512x512, soft transparent-friendly edges, no characters, no text, no letters.

### fx-ft-shotgun-hit: Effects (wave 8): fx-ft-shotgun-hit
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-ft-shotgun-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-ft-shotgun-hit.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: On-foot shotgun impact burst, centred. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: An impact effect for the on-foot shotgun: a small yellow dot burst with tiny sparks, centred, on a pure solid black background, centred, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-ft-shotgun-muzzle: Effects (wave 8): fx-ft-shotgun-muzzle
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-ft-shotgun-muzzle.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-ft-shotgun-muzzle.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: On-foot shotgun muzzle flash pointing right, base at the left-centre edge. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A muzzle flash for the on-foot shotgun: a wide cone of yellow sparks, starting at the left-centre edge and pointing right, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-ft-shotgun-pellet: Effects (wave 8): fx-ft-shotgun-pellet
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-ft-shotgun-pellet.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-ft-shotgun-pellet.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: On-foot shotgun projectile, facing right, centred. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: An on-foot shotgun projectile: a small round hot yellow pellet with a short glowing tail, facing right, centred, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-pw-bomb-pulse: Effects (wave 8): fx-pw-bomb-pulse
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-pw-bomb-pulse.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-pw-bomb-pulse.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: A big electric-blue pulse ring with crackling edges. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A large electric blue-white pulse ring with crackling lightning on its edge, circular, centred, filling the square, on a pure solid black background, centred, 512x512, soft transparent-friendly edges, no characters, no text, no letters.

### fx-pw-crescendo-glow: Effects (wave 8): fx-pw-crescendo-glow
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-pw-crescendo-glow.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-pw-crescendo-glow.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: A warm gold glow made of rising arcs, soft, centred. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A warm golden glow made of three nested rising arcs, soft, centred, filling the square, on a pure solid black background, centred, 512x512, soft transparent-friendly edges, no characters, no text, no letters.

### fx-pw-echo-ghost: Effects (wave 8): fx-pw-echo-ghost
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-pw-echo-ghost.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-pw-echo-ghost.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: A cyan ghost of a small ship shot with a trailing echo, facing right. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A translucent cyan ghost bolt with two fading echo copies behind it, facing right, centred, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-pw-fever-aura: Effects (wave 8): fx-pw-fever-aura
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-pw-fever-aura.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-pw-fever-aura.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: A flame-like magenta-orange aura, rising flames, centred. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A fiery magenta and orange aura with rising flame tongues, centred, soft, filling the square, on a pure solid black background, centred, 512x512, soft transparent-friendly edges, no characters, no text, no letters.

### fx-pw-level-up: Effects (wave 8): fx-pw-level-up
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-pw-level-up.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-pw-level-up.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: A rising golden burst, a ring and light rays pointing up. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A rising golden level-up burst: a ring with light rays and small up arrows of light, centred, on a pure solid black background, centred, 512x512, soft transparent-friendly edges, no characters, no text, no letters.

### fx-pw-magnet-field: Effects (wave 8): fx-pw-magnet-field
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-pw-magnet-field.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-pw-magnet-field.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: A blue-violet pulse ring with inward-curving field lines. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A blue-violet magnetic pulse: a glowing ring with curved field lines flowing inwards, circular, centred, on a pure solid black background, centred, 512x512, soft transparent-friendly edges, no characters, no text, no letters.

### fx-pw-nova-ring: Effects (wave 8): fx-pw-nova-ring
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-pw-nova-ring.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-pw-nova-ring.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: A magenta energy ring, thick and bright, empty centre, soft outer glow. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A thick glowing magenta-pink energy ring with a white inner edge, circular, empty centre, soft outer glow, filling the square, on a pure solid black background, centred, 512x512, soft transparent-friendly edges, no characters, no text, no letters.

### fx-pw-pickup-glow: Effects (wave 8): fx-pw-pickup-glow
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-pw-pickup-glow.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-pw-pickup-glow.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: A soft round white-gold glow with 4 tiny sparkles, centred. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A soft round white-gold glow with four tiny sparkle stars around it, centred, on a pure solid black background, centred, 512x512, soft transparent-friendly edges, no characters, no text, no letters.

### fx-pw-shield-bubble: Effects (wave 8): fx-pw-shield-bubble
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-pw-shield-bubble.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-pw-shield-bubble.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: A pale blue-white energy bubble around the ship, hex pattern, bright rim. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A pale blue-white energy bubble, a faint hexagon pattern, bright rim, almost transparent centre, a circle filling the square, on a pure solid black background, centred, 512x512, soft transparent-friendly edges, no characters, no text, no letters.

### fx-pw-wingmate-trail: Effects (wave 8): fx-pw-wingmate-trail
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-pw-wingmate-trail.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-pw-wingmate-trail.webp`
- Size/ratio: 256x64, ratio 4:1
- Note: A short golden engine trail, bright at the right end, fading left. Wide 256x64 picture; we crop and convert.
- Prompt: A short golden-yellow engine trail for a small drone, bright at the right end fading to nothing at the left, horizontal, on a pure solid black background, facing right, pointing to the right, 256x64, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-arc-bullet: Effects (wave 8): fx-w-arc-bullet
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-arc-bullet.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-arc-bullet.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Arc Chain: the shot, facing right, centred. Painted colour matches the weapon colour #8fe9ff. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A game projectile for the weapon Arc Chain: a jagged cyan lightning bolt segment with forks and a white core, horizontal, facing right, centred, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-arc-hit: Effects (wave 8): fx-w-arc-hit
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-arc-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-arc-hit.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Arc Chain impact burst, centred. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: An impact effect for the weapon Arc Chain: a branching cyan electric burst with a bright white centre, centred, on a pure solid black background, centred, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-arc-muzzle: Effects (wave 8): fx-w-arc-muzzle
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-arc-muzzle.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-arc-muzzle.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Arc Chain muzzle flash at the gun, pointing right, base at the left-centre edge. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A muzzle flash for the weapon Arc Chain: a small crackle of cyan electric sparks, the flash starting at the left-centre edge and pointing right, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-beat-bullet: Effects (wave 8): fx-w-beat-bullet
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-beat-bullet.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-beat-bullet.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Beat Cannon: the shot, facing right, centred. Painted colour matches the weapon colour #ffe14d. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A game projectile for the weapon Beat Cannon: a heavy round yellow cannon shell glowing white-hot, a pulsing shockwave arc around its front and a thick gold trail, facing right, centred, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-beat-hit: Effects (wave 8): fx-w-beat-hit
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-beat-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-beat-hit.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Beat Cannon impact burst, centred. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: An impact effect for the weapon Beat Cannon: a heavy yellow explosion flash with a bold shockwave ring, centred, on a pure solid black background, centred, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-beat-muzzle: Effects (wave 8): fx-w-beat-muzzle
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-beat-muzzle.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-beat-muzzle.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Beat Cannon muzzle flash at the gun, pointing right, base at the left-centre edge. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A muzzle flash for the weapon Beat Cannon: a big gold muzzle blast with a speed ring, the flash starting at the left-centre edge and pointing right, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-disc-bullet: Effects (wave 8): fx-w-disc-bullet
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-disc-bullet.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-disc-bullet.webp`
- Size/ratio: 256x256, ratio 1:1, transparent (flat white background, we key it)
- Note: Ricochet Disc: the shot, facing right, centred. Painted colour matches the weapon colour #ff7a45. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A game projectile for the weapon Ricochet Disc: a round razor-edged orange disc with a notched rim, spinning, motion arcs around it, facing right, centred, on a plain flat white background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-disc-hit: Effects (wave 8): fx-w-disc-hit
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-disc-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-disc-hit.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Ricochet Disc impact burst, centred. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: An impact effect for the weapon Ricochet Disc: an orange spark shower from a bounce, a bright flash ring, centred, on a pure solid black background, centred, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-disc-muzzle: Effects (wave 8): fx-w-disc-muzzle
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-disc-muzzle.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-disc-muzzle.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Ricochet Disc muzzle flash at the gun, pointing right, base at the left-centre edge. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A muzzle flash for the weapon Ricochet Disc: a small orange spark flash, the flash starting at the left-centre edge and pointing right, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-drone-bullet: Effects (wave 8): fx-w-drone-bullet
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-drone-bullet.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-drone-bullet.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Echo Drone: the shot, facing right, centred. Painted colour matches the weapon colour #e6a8ff. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A game projectile for the weapon Echo Drone: a lilac echo pulse bolt with two fainter copies trailing behind it, facing right, centred, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-drone-hit: Effects (wave 8): fx-w-drone-hit
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-drone-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-drone-hit.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Echo Drone impact burst, centred. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: An impact effect for the weapon Echo Drone: a lilac ripple with a ghost ring, centred, on a pure solid black background, centred, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-drone-muzzle: Effects (wave 8): fx-w-drone-muzzle
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-drone-muzzle.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-drone-muzzle.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Echo Drone muzzle flash at the gun, pointing right, base at the left-centre edge. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A muzzle flash for the weapon Echo Drone: a lilac double-ring flash, the flash starting at the left-centre edge and pointing right, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-flame-bullet: Effects (wave 8): fx-w-flame-bullet
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-flame-bullet.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-flame-bullet.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Flame Arc: the shot, facing right, centred. Painted colour matches the weapon colour #ff5a2d. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A game projectile for the weapon Flame Arc: a short licking jet of orange-red flame flying right, yellow core, ember sparks, facing right, centred, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-flame-hit: Effects (wave 8): fx-w-flame-hit
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-flame-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-flame-hit.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Flame Arc impact burst, centred. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: An impact effect for the weapon Flame Arc: a small burning fireball splash with embers, centred, on a pure solid black background, centred, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-flame-muzzle: Effects (wave 8): fx-w-flame-muzzle
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-flame-muzzle.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-flame-muzzle.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Flame Arc muzzle flash at the gun, pointing right, base at the left-centre edge. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A muzzle flash for the weapon Flame Arc: a roaring orange-red flame burst, the flash starting at the left-centre edge and pointing right, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-frost-bullet: Effects (wave 8): fx-w-frost-bullet
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-frost-bullet.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-frost-bullet.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Frost Beam: the shot, facing right, centred. Painted colour matches the weapon colour #9fe8ff. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A game projectile for the weapon Frost Beam: an icy pale-blue beam segment with ice crystals along it, white-blue glow, facing right, centred, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-frost-hit: Effects (wave 8): fx-w-frost-hit
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-frost-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-frost-hit.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Frost Beam impact burst, centred. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: An impact effect for the weapon Frost Beam: a frozen burst of ice crystals and a pale-blue ring, centred, on a pure solid black background, centred, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-frost-muzzle: Effects (wave 8): fx-w-frost-muzzle
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-frost-muzzle.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-frost-muzzle.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Frost Beam muzzle flash at the gun, pointing right, base at the left-centre edge. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A muzzle flash for the weapon Frost Beam: a frosty pale-blue puff with snow sparkles, the flash starting at the left-centre edge and pointing right, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-laser-bullet: Effects (wave 8): fx-w-laser-bullet
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-laser-bullet.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-laser-bullet.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Laser Lance: the shot, facing right, centred. Painted colour matches the weapon colour #7dffd8. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A game projectile for the weapon Laser Lance: a long thin mint-green laser lance segment, a razor-bright white core and a soft mint halo, fading at both ends, facing right, centred, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-laser-hit: Effects (wave 8): fx-w-laser-hit
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-laser-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-laser-hit.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Laser Lance impact burst, centred. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: An impact effect for the weapon Laser Lance: a mint-green ring and a bright flash where a beam pierces through, centred, on a pure solid black background, centred, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-laser-muzzle: Effects (wave 8): fx-w-laser-muzzle
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-laser-muzzle.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-laser-muzzle.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Laser Lance muzzle flash at the gun, pointing right, base at the left-centre edge. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A muzzle flash for the weapon Laser Lance: a narrow mint flare shooting right with a ring at the barrel, the flash starting at the left-centre edge and pointing right, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-mine-bullet: Effects (wave 8): fx-w-mine-bullet
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-mine-bullet.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-mine-bullet.webp`
- Size/ratio: 256x256, ratio 1:1, transparent (flat white background, we key it)
- Note: Mine Layer: the shot, facing right, centred. Painted colour matches the weapon colour #c08aff. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A game projectile for the weapon Mine Layer: a round purple proximity mine with a blinking glow and little spikes, facing right, centred, on a plain flat white background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-mine-hit: Effects (wave 8): fx-w-mine-hit
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-mine-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-mine-hit.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Mine Layer impact burst, centred. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: An impact effect for the weapon Mine Layer: a purple blast with a ring and floating shards, centred, on a pure solid black background, centred, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-mine-muzzle: Effects (wave 8): fx-w-mine-muzzle
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-mine-muzzle.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-mine-muzzle.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Mine Layer muzzle flash at the gun, pointing right, base at the left-centre edge. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A muzzle flash for the weapon Mine Layer: a soft purple drop-ring flash, the flash starting at the left-centre edge and pointing right, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-orbit-bullet: Effects (wave 8): fx-w-orbit-bullet
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-orbit-bullet.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-orbit-bullet.webp`
- Size/ratio: 256x256, ratio 1:1, transparent (flat white background, we key it)
- Note: Orbit Blades: the shot, facing right, centred. Painted colour matches the weapon colour #b6ff5a. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A game projectile for the weapon Orbit Blades: a single curved lime-green energy blade (crescent) with a glowing edge, facing right, centred, on a plain flat white background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-orbit-hit: Effects (wave 8): fx-w-orbit-hit
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-orbit-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-orbit-hit.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Orbit Blades impact burst, centred. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: An impact effect for the weapon Orbit Blades: a lime-green slash mark with sparks, centred, on a pure solid black background, centred, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-orbit-muzzle: Effects (wave 8): fx-w-orbit-muzzle
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-orbit-muzzle.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-orbit-muzzle.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Orbit Blades muzzle flash at the gun, pointing right, base at the left-centre edge. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A muzzle flash for the weapon Orbit Blades: a quick lime-green swish of light, the flash starting at the left-centre edge and pointing right, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-pulse-bullet: Effects (wave 8): fx-w-pulse-bullet
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-pulse-bullet.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-pulse-bullet.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Pulse Spread: the shot, facing right, centred. Painted colour matches the weapon colour #ff8ad8. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A game projectile for the weapon Pulse Spread: a short fat pink energy pellet with a hot white core and a small comet tail, facing right, centred, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-pulse-hit: Effects (wave 8): fx-w-pulse-hit
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-pulse-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-pulse-hit.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Pulse Spread impact burst, centred. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: An impact effect for the weapon Pulse Spread: a pink starburst impact with short spikes and sparkles, centred, on a pure solid black background, centred, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-pulse-muzzle: Effects (wave 8): fx-w-pulse-muzzle
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-pulse-muzzle.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-pulse-muzzle.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Pulse Spread muzzle flash at the gun, pointing right, base at the left-centre edge. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A muzzle flash for the weapon Pulse Spread: a small pink star-shaped muzzle flash fanning to the right, the flash starting at the left-centre edge and pointing right, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-rail-bullet: Effects (wave 8): fx-w-rail-bullet
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-rail-bullet.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-rail-bullet.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Rail Sniper: the shot, facing right, centred. Painted colour matches the weapon colour #ff3d6a. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A game projectile for the weapon Rail Sniper: a very bright crimson-white rail bolt, long and needle-sharp, with a thin trail, facing right, centred, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-rail-hit: Effects (wave 8): fx-w-rail-hit
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-rail-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-rail-hit.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Rail Sniper impact burst, centred. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: An impact effect for the weapon Rail Sniper: a crimson pierce flash with a hard white spike, centred, on a pure solid black background, centred, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-rail-muzzle: Effects (wave 8): fx-w-rail-muzzle
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-rail-muzzle.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-rail-muzzle.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Rail Sniper muzzle flash at the gun, pointing right, base at the left-centre edge. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A muzzle flash for the weapon Rail Sniper: a crimson flash with a shock ring, the flash starting at the left-centre edge and pointing right, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-shell-bullet: Effects (wave 8): fx-w-shell-bullet
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-shell-bullet.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-shell-bullet.webp`
- Size/ratio: 256x256, ratio 1:1, transparent (flat white background, we key it)
- Note: Shrapnel Shell: the shot, facing right, centred. Painted colour matches the weapon colour #ffa94d. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A game projectile for the weapon Shrapnel Shell: a stubby orange shell with a bright tip and a small flame, fragments of light flying off it, facing right, centred, on a plain flat white background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-shell-hit: Effects (wave 8): fx-w-shell-hit
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-shell-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-shell-hit.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Shrapnel Shell impact burst, centred. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: An impact effect for the weapon Shrapnel Shell: an orange burst of flying fragments, centred, on a pure solid black background, centred, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-shell-muzzle: Effects (wave 8): fx-w-shell-muzzle
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-shell-muzzle.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-shell-muzzle.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Shrapnel Shell muzzle flash at the gun, pointing right, base at the left-centre edge. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A muzzle flash for the weapon Shrapnel Shell: an orange cone of flame and sparks, the flash starting at the left-centre edge and pointing right, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-storm-bullet: Effects (wave 8): fx-w-storm-bullet
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-storm-bullet.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-storm-bullet.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Storm Cell: the shot, facing right, centred. Painted colour matches the weapon colour #fff06a. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A game projectile for the weapon Storm Cell: a crackling yellow electric storm ball with small lightning arcs around it, facing right, centred, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-storm-hit: Effects (wave 8): fx-w-storm-hit
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-storm-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-storm-hit.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Storm Cell impact burst, centred. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: An impact effect for the weapon Storm Cell: a yellow lightning burst with arcs, centred, on a pure solid black background, centred, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-storm-muzzle: Effects (wave 8): fx-w-storm-muzzle
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-storm-muzzle.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-storm-muzzle.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Storm Cell muzzle flash at the gun, pointing right, base at the left-centre edge. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A muzzle flash for the weapon Storm Cell: a yellow spark burst, the flash starting at the left-centre edge and pointing right, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-swarm-bullet: Effects (wave 8): fx-w-swarm-bullet
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-swarm-bullet.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-swarm-bullet.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Homing Swarm: the shot, facing right, centred. Painted colour matches the weapon colour #ffb020. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A game projectile for the weapon Homing Swarm: a small amber homing missile seen from the side, glowing exhaust flame and a short smoke-glow trail behind it, facing right, centred, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-swarm-hit: Effects (wave 8): fx-w-swarm-hit
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-swarm-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-swarm-hit.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Homing Swarm impact burst, centred. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: An impact effect for the weapon Homing Swarm: a small amber fireball with a ring of tiny sparks, centred, on a pure solid black background, centred, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-swarm-muzzle: Effects (wave 8): fx-w-swarm-muzzle
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-swarm-muzzle.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-swarm-muzzle.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Homing Swarm muzzle flash at the gun, pointing right, base at the left-centre edge. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A muzzle flash for the weapon Homing Swarm: a puff of amber flame and sparks, the flash starting at the left-centre edge and pointing right, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-wave-bullet: Effects (wave 8): fx-w-wave-bullet
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-wave-bullet.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-wave-bullet.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Plasma Wave: the shot, facing right, centred. Painted colour matches the weapon colour #5b8cff. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A game projectile for the weapon Plasma Wave: a big crescent blue plasma wave front curving to the right, white-blue edge, soft glow, facing right, centred, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-wave-hit: Effects (wave 8): fx-w-wave-hit
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-wave-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-wave-hit.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Plasma Wave impact burst, centred. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: An impact effect for the weapon Plasma Wave: a blue plasma splash ring with droplets of light, centred, on a pure solid black background, centred, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-wave-muzzle: Effects (wave 8): fx-w-wave-muzzle
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-wave-muzzle.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-wave-muzzle.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Plasma Wave muzzle flash at the gun, pointing right, base at the left-centre edge. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A muzzle flash for the weapon Plasma Wave: a blue plasma ripple ring, the flash starting at the left-centre edge and pointing right, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-well-bullet: Effects (wave 8): fx-w-well-bullet
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-well-bullet.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-well-bullet.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Gravity Well: the shot, facing right, centred. Painted colour matches the weapon colour #7a4dff. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A game projectile for the weapon Gravity Well: a swirling violet orb with an inward spiral, dark centre and bright rim, facing right, centred, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-well-hit: Effects (wave 8): fx-w-well-hit
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-well-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-well-hit.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Gravity Well impact burst, centred. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: An impact effect for the weapon Gravity Well: a violet implosion ring with sparks pulled in, centred, on a pure solid black background, centred, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-w-well-muzzle: Effects (wave 8): fx-w-well-muzzle
- Why: new weapons and fusions. Effects asset wave 8 (owner, 18 Oct 2026)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-w-well-muzzle.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-w-well-muzzle.webp`
- Size/ratio: 256x256, ratio 1:1
- Note: Gravity Well muzzle flash at the gun, pointing right, base at the left-centre edge. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: A muzzle flash for the weapon Gravity Well: a violet swirl opening to the right, the flash starting at the left-centre edge and pointing right, on a pure solid black background, facing right, pointing to the right, 256x256, soft transparent-friendly edges, no characters, no text, no letters.

### fx-bullet-needle: Enemy bullet effects
- Why: missing + new weapons and fusions. Missing: picture not yet made | Existing core effect (listed so the whole set is visible)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-bullet-needle.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-bullet-needle.webp`
- Size/ratio: 256x64, ratio 4:1
- Note: Light on a black background (added on screen).
- Prompt: Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers. a thin fast lime-yellow energy needle pointing RIGHT with a short fading tail, light on black, no text, letters or numbers

### fx-bullet-rocket: Enemy bullet effects
- Why: missing + new weapons and fusions. Missing: picture not yet made | Existing core effect (listed so the whole set is visible)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-bullet-rocket.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-bullet-rocket.webp`
- Size/ratio: 256x128, ratio 2:1
- Note: Light on a black background (added on screen).
- Prompt: Painted neon cyberpunk game icon, dark gunmetal bezel ring with glowing cyan, magenta and amber neon accents, crisp dark outline, same painted look as the other Nightrun garage icons, single centred object, transparent background, no text, no letters, no numbers. a glowing missile flying RIGHT, pale blue-white body, red nose, orange exhaust flame trailing left, light on black, no text, letters or numbers

### fx-bullet-shell: Enemy bullet effects
- Why: missing + new weapons and fusions. Missing: picture not yet made | Existing core effect (listed so the whole set is visible)
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

### foot/bg-far: On-foot street stage: foot/bg-far
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/bg-far.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/bg-far.webp`
- Size/ratio: 2048x1024, ratio 2:1, transparent (flat white background, we key it)
- Note: 2:1 landscape, transparent. a distant skyline of dark purple tower silhouettes with many small lit windows (cyan and amber), antenna lights, haze at the base; the sky above the towers is flat plain white (to be cut out); the towers stand on the bottom edge. Must tile seamlessly left to right. The street line (where feet stand) is at 80% of the height. Wide 2048x1024 picture; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Side-view background layer for a run-and-gun game, 2048x1024 landscape, seamless horizontal tiling: a distant skyline of dark purple tower silhouettes with many small lit windows (cyan and amber), antenna lights, haze at the base; the sky above the towers is flat plain white (to be cut out); the towers stand on the bottom edge. No characters, no text, no letters., single object, centred, plain flat white background, no shadow

### foot/bg-floor: On-foot street stage: foot/bg-floor
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/bg-floor.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/bg-floor.webp`
- Size/ratio: 2048x1024, ratio 2:1, transparent (flat white background, we key it)
- Note: 2:1 landscape, transparent. the street surface as a flat strip at the very bottom fifth: dark wet asphalt with a pavement edge, dashed road markings and neon puddle reflections in magenta and teal; the upper four fifths are flat plain white (to be cut out). Must tile seamlessly left to right. The street line (where feet stand) is at 80% of the height. Wide 2048x1024 picture; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Side-view background layer for a run-and-gun game, 2048x1024 landscape, seamless horizontal tiling: the street surface as a flat strip at the very bottom fifth: dark wet asphalt with a pavement edge, dashed road markings and neon puddle reflections in magenta and teal; the upper four fifths are flat plain white (to be cut out). No characters, no text, no letters., single object, centred, plain flat white background, no shadow

### foot/bg-mid: On-foot street stage: foot/bg-mid
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/bg-mid.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/bg-mid.webp`
- Size/ratio: 2048x1024, ratio 2:1, transparent (flat white background, we key it)
- Note: 2:1 landscape, transparent. mid-distance city buildings, dark violet with big neon signs in magenta, cyan and amber, lit windows, fire escapes; everything above the roofs is flat plain white (to be cut out); buildings stand on the bottom edge. Must tile seamlessly left to right. The street line (where feet stand) is at 80% of the height. Wide 2048x1024 picture; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Side-view background layer for a run-and-gun game, 2048x1024 landscape, seamless horizontal tiling: mid-distance city buildings, dark violet with big neon signs in magenta, cyan and amber, lit windows, fire escapes; everything above the roofs is flat plain white (to be cut out); buildings stand on the bottom edge. No characters, no text, no letters., single object, centred, plain flat white background, no shadow

### foot/bg-near: On-foot street stage: foot/bg-near
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/bg-near.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/bg-near.webp`
- Size/ratio: 2048x1024, ratio 2:1, transparent (flat white background, we key it)
- Note: 2:1 landscape, transparent. foreground street props along the bottom edge only: lamp posts with warm glowing lamps, rubbish bins, rolled-down shop shutters with neon trim, wet reflections; the rest of the picture is flat plain white (to be cut out). Must tile seamlessly left to right. The street line (where feet stand) is at 80% of the height. Wide 2048x1024 picture; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Side-view background layer for a run-and-gun game, 2048x1024 landscape, seamless horizontal tiling: foreground street props along the bottom edge only: lamp posts with warm glowing lamps, rubbish bins, rolled-down shop shutters with neon trim, wet reflections; the rest of the picture is flat plain white (to be cut out). No characters, no text, no letters., single object, centred, plain flat white background, no shadow

### foot/bg-sky: On-foot street stage: foot/bg-sky
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/bg-sky.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/bg-sky.webp`
- Size/ratio: 2048x1024, ratio 2:1, transparent (flat white background, we key it)
- Note: 2:1 landscape, opaque. the night sky over a rainy cyberpunk Frankfurt: dark violet at the top to magenta-teal haze at the horizon, low rain clouds, a pale pink moon, a few stars; NO buildings, NO ground; the bottom edge glows magenta. Must tile seamlessly left to right. The street line (where feet stand) is at 80% of the height. Wide 2048x1024 picture; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Side-view background layer for a run-and-gun game, 2048x1024 landscape, seamless horizontal tiling: the night sky over a rainy cyberpunk Frankfurt: dark violet at the top to magenta-teal haze at the horizon, low rain clouds, a pale pink moon, a few stars; NO buildings, NO ground; the bottom edge glows magenta. No characters, no text, no letters., single object, centred, plain flat white background, no shadow

### foot/bruiser-crouch: On-foot street stage: foot/bruiser-crouch
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/bruiser-crouch.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/bruiser-crouch.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Bruiser, heavy, pose: crouched low behind cover, knees deeply bent, body leaning forward, weapon held ready. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Bruiser, heavy), crouched low behind cover, knees deeply bent, body leaning forward, weapon held ready. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/bruiser-crouch-shoot: On-foot street stage: foot/bruiser-crouch-shoot
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/bruiser-crouch-shoot.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/bruiser-crouch-shoot.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Bruiser, heavy, pose: crouched low and aiming the weapon straight forward, muzzle flash at the tip. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Bruiser, heavy), crouched low and aiming the weapon straight forward, muzzle flash at the tip. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/bruiser-die: On-foot street stage: foot/bruiser-die
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/bruiser-die.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/bruiser-die.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Bruiser, heavy, pose: collapsing backwards, nearly horizontal in the air, weapon dropping from the hand. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Bruiser, heavy), collapsing backwards, nearly horizontal in the air, weapon dropping from the hand. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/bruiser-fall: On-foot street stage: foot/bruiser-fall
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/bruiser-fall.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/bruiser-fall.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Bruiser, heavy, pose: falling down, legs dangling slightly apart, arms raised, clothes pulled upward. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Bruiser, heavy), falling down, legs dangling slightly apart, arms raised, clothes pulled upward. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/bruiser-hit: On-foot street stage: foot/bruiser-hit
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/bruiser-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/bruiser-hit.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Bruiser, heavy, pose: flinching from a hit: head and chest thrown back, arms flung out, pained face. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Bruiser, heavy), flinching from a hit: head and chest thrown back, arms flung out, pained face. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/bruiser-idle: On-foot street stage: foot/bruiser-idle
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/bruiser-idle.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/bruiser-idle.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Bruiser, heavy, pose: standing relaxed in a ready stance, weapon held low, weight on both feet. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Bruiser, heavy), standing relaxed in a ready stance, weapon held low, weight on both feet. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/bruiser-jump: On-foot street stage: foot/bruiser-jump
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/bruiser-jump.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/bruiser-jump.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Bruiser, heavy, pose: jumping up, knees tucked, one arm up, weapon arm forward. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Bruiser, heavy), jumping up, knees tucked, one arm up, weapon arm forward. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/bruiser-melee: On-foot street stage: foot/bruiser-melee
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/bruiser-melee.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/bruiser-melee.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Bruiser, heavy, pose: swinging the weapon in a hard forward attack, body lunging, motion trail. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Bruiser, heavy), swinging the weapon in a hard forward attack, body lunging, motion trail. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/bruiser-run-a: On-foot street stage: foot/bruiser-run-a
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/bruiser-run-a.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/bruiser-run-a.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Bruiser, heavy, pose: running, mid-stride with the FRONT leg stretched forward and the back leg pushing off, leaning forward, arms swinging (contact frame of a run cycle). Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Bruiser, heavy), running, mid-stride with the FRONT leg stretched forward and the back leg pushing off, leaning forward, arms swinging (contact frame of a run cycle). Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/bruiser-run-b: On-foot street stage: foot/bruiser-run-b
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/bruiser-run-b.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/bruiser-run-b.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Bruiser, heavy, pose: running, the OPPOSITE stride to the first running frame: back leg passing under the body, other leg bent up (passing frame of a run cycle), leaning forward. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Bruiser, heavy), running, the OPPOSITE stride to the first running frame: back leg passing under the body, other leg bent up (passing frame of a run cycle), leaning forward. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/bruiser-shoot: On-foot street stage: foot/bruiser-shoot
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/bruiser-shoot.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/bruiser-shoot.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Bruiser, heavy, pose: standing and aiming the weapon straight forward with a stiff arm, muzzle flash at the tip. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Bruiser, heavy), punching the cyber arm straight forward, a cyan shockwave ring at the fist. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/drone-die: On-foot street stage: foot/drone-die
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/drone-die.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/drone-die.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Drone, hover gun, pose: collapsing backwards, nearly horizontal in the air, weapon dropping from the hand. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Drone, hover gun), exploding in a fireball, pieces and sparks flying, falling. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/drone-hit: On-foot street stage: foot/drone-hit
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/drone-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/drone-hit.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Drone, hover gun, pose: flinching from a hit: head and chest thrown back, arms flung out, pained face. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Drone, hover gun), flashing white from a hit, rotors wobbling. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/drone-idle: On-foot street stage: foot/drone-idle
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/drone-idle.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/drone-idle.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Drone, hover gun, pose: standing relaxed in a ready stance, weapon held low, weight on both feet. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Drone, hover gun), hovering in place, rotors blurred, red eye glowing. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/drone-shoot: On-foot street stage: foot/drone-shoot
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/drone-shoot.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/drone-shoot.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Drone, hover gun, pose: standing and aiming the weapon straight forward with a stiff arm, muzzle flash at the tip. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Drone, hover gun), firing its gun forward, muzzle flash, eye flaring white. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/grunt-crouch: On-foot street stage: foot/grunt-crouch
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/grunt-crouch.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/grunt-crouch.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Grunt, street thug, pose: crouched low behind cover, knees deeply bent, body leaning forward, weapon held ready. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Grunt, street thug), crouched low behind cover, knees deeply bent, body leaning forward, weapon held ready. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/grunt-crouch-shoot: On-foot street stage: foot/grunt-crouch-shoot
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/grunt-crouch-shoot.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/grunt-crouch-shoot.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Grunt, street thug, pose: crouched low and aiming the weapon straight forward, muzzle flash at the tip. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Grunt, street thug), crouched low and aiming the weapon straight forward, muzzle flash at the tip. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/grunt-die: On-foot street stage: foot/grunt-die
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/grunt-die.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/grunt-die.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Grunt, street thug, pose: collapsing backwards, nearly horizontal in the air, weapon dropping from the hand. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Grunt, street thug), collapsing backwards, nearly horizontal in the air, weapon dropping from the hand. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/grunt-fall: On-foot street stage: foot/grunt-fall
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/grunt-fall.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/grunt-fall.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Grunt, street thug, pose: falling down, legs dangling slightly apart, arms raised, clothes pulled upward. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Grunt, street thug), falling down, legs dangling slightly apart, arms raised, clothes pulled upward. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/grunt-hit: On-foot street stage: foot/grunt-hit
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/grunt-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/grunt-hit.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Grunt, street thug, pose: flinching from a hit: head and chest thrown back, arms flung out, pained face. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Grunt, street thug), flinching from a hit: head and chest thrown back, arms flung out, pained face. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/grunt-idle: On-foot street stage: foot/grunt-idle
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/grunt-idle.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/grunt-idle.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Grunt, street thug, pose: standing relaxed in a ready stance, weapon held low, weight on both feet. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Grunt, street thug), standing relaxed in a ready stance, weapon held low, weight on both feet. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/grunt-jump: On-foot street stage: foot/grunt-jump
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/grunt-jump.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/grunt-jump.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Grunt, street thug, pose: jumping up, knees tucked, one arm up, weapon arm forward. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Grunt, street thug), jumping up, knees tucked, one arm up, weapon arm forward. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/grunt-melee: On-foot street stage: foot/grunt-melee
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/grunt-melee.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/grunt-melee.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Grunt, street thug, pose: swinging the weapon in a hard forward attack, body lunging, motion trail. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Grunt, street thug), swinging the weapon in a hard forward attack, body lunging, motion trail. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/grunt-run-a: On-foot street stage: foot/grunt-run-a
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/grunt-run-a.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/grunt-run-a.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Grunt, street thug, pose: running, mid-stride with the FRONT leg stretched forward and the back leg pushing off, leaning forward, arms swinging (contact frame of a run cycle). Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Grunt, street thug), running, mid-stride with the FRONT leg stretched forward and the back leg pushing off, leaning forward, arms swinging (contact frame of a run cycle). Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/grunt-run-b: On-foot street stage: foot/grunt-run-b
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/grunt-run-b.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/grunt-run-b.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Grunt, street thug, pose: running, the OPPOSITE stride to the first running frame: back leg passing under the body, other leg bent up (passing frame of a run cycle), leaning forward. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Grunt, street thug), running, the OPPOSITE stride to the first running frame: back leg passing under the body, other leg bent up (passing frame of a run cycle), leaning forward. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/grunt-shoot: On-foot street stage: foot/grunt-shoot
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/grunt-shoot.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/grunt-shoot.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Grunt, street thug, pose: standing and aiming the weapon straight forward with a stiff arm, muzzle flash at the tip. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Grunt, street thug), hurling the steel pipe forward with a straight throwing arm (pipe in mid-air in front of the hand). Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/gunman-crouch: On-foot street stage: foot/gunman-crouch
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/gunman-crouch.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/gunman-crouch.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Gunman, gang shooter, pose: crouched low behind cover, knees deeply bent, body leaning forward, weapon held ready. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Gunman, gang shooter), crouched low behind cover, knees deeply bent, body leaning forward, weapon held ready. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/gunman-crouch-shoot: On-foot street stage: foot/gunman-crouch-shoot
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/gunman-crouch-shoot.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/gunman-crouch-shoot.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Gunman, gang shooter, pose: crouched low and aiming the weapon straight forward, muzzle flash at the tip. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Gunman, gang shooter), crouched low and aiming the weapon straight forward, muzzle flash at the tip. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/gunman-die: On-foot street stage: foot/gunman-die
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/gunman-die.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/gunman-die.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Gunman, gang shooter, pose: collapsing backwards, nearly horizontal in the air, weapon dropping from the hand. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Gunman, gang shooter), collapsing backwards, nearly horizontal in the air, weapon dropping from the hand. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/gunman-fall: On-foot street stage: foot/gunman-fall
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/gunman-fall.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/gunman-fall.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Gunman, gang shooter, pose: falling down, legs dangling slightly apart, arms raised, clothes pulled upward. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Gunman, gang shooter), falling down, legs dangling slightly apart, arms raised, clothes pulled upward. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/gunman-hit: On-foot street stage: foot/gunman-hit
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/gunman-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/gunman-hit.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Gunman, gang shooter, pose: flinching from a hit: head and chest thrown back, arms flung out, pained face. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Gunman, gang shooter), flinching from a hit: head and chest thrown back, arms flung out, pained face. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/gunman-idle: On-foot street stage: foot/gunman-idle
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/gunman-idle.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/gunman-idle.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Gunman, gang shooter, pose: standing relaxed in a ready stance, weapon held low, weight on both feet. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Gunman, gang shooter), standing relaxed in a ready stance, weapon held low, weight on both feet. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/gunman-jump: On-foot street stage: foot/gunman-jump
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/gunman-jump.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/gunman-jump.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Gunman, gang shooter, pose: jumping up, knees tucked, one arm up, weapon arm forward. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Gunman, gang shooter), jumping up, knees tucked, one arm up, weapon arm forward. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/gunman-melee: On-foot street stage: foot/gunman-melee
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/gunman-melee.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/gunman-melee.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Gunman, gang shooter, pose: swinging the weapon in a hard forward attack, body lunging, motion trail. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Gunman, gang shooter), swinging the weapon in a hard forward attack, body lunging, motion trail. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/gunman-run-a: On-foot street stage: foot/gunman-run-a
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/gunman-run-a.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/gunman-run-a.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Gunman, gang shooter, pose: running, mid-stride with the FRONT leg stretched forward and the back leg pushing off, leaning forward, arms swinging (contact frame of a run cycle). Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Gunman, gang shooter), running, mid-stride with the FRONT leg stretched forward and the back leg pushing off, leaning forward, arms swinging (contact frame of a run cycle). Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/gunman-run-b: On-foot street stage: foot/gunman-run-b
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/gunman-run-b.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/gunman-run-b.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Gunman, gang shooter, pose: running, the OPPOSITE stride to the first running frame: back leg passing under the body, other leg bent up (passing frame of a run cycle), leaning forward. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Gunman, gang shooter), running, the OPPOSITE stride to the first running frame: back leg passing under the body, other leg bent up (passing frame of a run cycle), leaning forward. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/gunman-shoot: On-foot street stage: foot/gunman-shoot
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/gunman-shoot.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/gunman-shoot.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Gunman, gang shooter, pose: standing and aiming the weapon straight forward with a stiff arm, muzzle flash at the tip. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Gunman, gang shooter), standing and aiming the weapon straight forward with a stiff arm, muzzle flash at the tip. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/kai-crouch: On-foot street stage: foot/kai-crouch
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/kai-crouch.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/kai-crouch.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Kai, the courier (hero), pose: crouched low behind cover, knees deeply bent, body leaning forward, weapon held ready. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Kai, the courier (hero)), crouched low behind cover, knees deeply bent, body leaning forward, weapon held ready. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/kai-crouch-shoot: On-foot street stage: foot/kai-crouch-shoot
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/kai-crouch-shoot.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/kai-crouch-shoot.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Kai, the courier (hero), pose: crouched low and aiming the weapon straight forward, muzzle flash at the tip. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Kai, the courier (hero)), crouched low and aiming the weapon straight forward, muzzle flash at the tip. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/kai-die: On-foot street stage: foot/kai-die
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/kai-die.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/kai-die.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Kai, the courier (hero), pose: collapsing backwards, nearly horizontal in the air, weapon dropping from the hand. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Kai, the courier (hero)), collapsing backwards, nearly horizontal in the air, weapon dropping from the hand. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/kai-fall: On-foot street stage: foot/kai-fall
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/kai-fall.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/kai-fall.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Kai, the courier (hero), pose: falling down, legs dangling slightly apart, arms raised, clothes pulled upward. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Kai, the courier (hero)), falling down, legs dangling slightly apart, arms raised, clothes pulled upward. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/kai-hit: On-foot street stage: foot/kai-hit
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/kai-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/kai-hit.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Kai, the courier (hero), pose: flinching from a hit: head and chest thrown back, arms flung out, pained face. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Kai, the courier (hero)), flinching from a hit: head and chest thrown back, arms flung out, pained face. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/kai-idle: On-foot street stage: foot/kai-idle
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/kai-idle.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/kai-idle.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Kai, the courier (hero), pose: standing relaxed in a ready stance, weapon held low, weight on both feet. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Kai, the courier (hero)), standing relaxed in a ready stance, weapon held low, weight on both feet. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/kai-jump: On-foot street stage: foot/kai-jump
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/kai-jump.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/kai-jump.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Kai, the courier (hero), pose: jumping up, knees tucked, one arm up, weapon arm forward. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Kai, the courier (hero)), jumping up, knees tucked, one arm up, weapon arm forward. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/kai-melee: On-foot street stage: foot/kai-melee
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/kai-melee.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/kai-melee.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Kai, the courier (hero), pose: swinging the weapon in a hard forward attack, body lunging, motion trail. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Kai, the courier (hero)), swinging the weapon in a hard forward attack, body lunging, motion trail. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/kai-run-a: On-foot street stage: foot/kai-run-a
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/kai-run-a.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/kai-run-a.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Kai, the courier (hero), pose: running, mid-stride with the FRONT leg stretched forward and the back leg pushing off, leaning forward, arms swinging (contact frame of a run cycle). Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Kai, the courier (hero)), running, mid-stride with the FRONT leg stretched forward and the back leg pushing off, leaning forward, arms swinging (contact frame of a run cycle). Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/kai-run-b: On-foot street stage: foot/kai-run-b
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/kai-run-b.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/kai-run-b.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Kai, the courier (hero), pose: running, the OPPOSITE stride to the first running frame: back leg passing under the body, other leg bent up (passing frame of a run cycle), leaning forward. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Kai, the courier (hero)), running, the OPPOSITE stride to the first running frame: back leg passing under the body, other leg bent up (passing frame of a run cycle), leaning forward. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/kai-shoot: On-foot street stage: foot/kai-shoot
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/kai-shoot.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/kai-shoot.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Kai, the courier (hero), pose: standing and aiming the weapon straight forward with a stiff arm, muzzle flash at the tip. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Kai, the courier (hero)), standing and aiming the weapon straight forward with a stiff arm, muzzle flash at the tip. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/knife-crouch: On-foot street stage: foot/knife-crouch
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/knife-crouch.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/knife-crouch.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Knife, gang runner, pose: crouched low behind cover, knees deeply bent, body leaning forward, weapon held ready. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Knife, gang runner), crouched low behind cover, knees deeply bent, body leaning forward, weapon held ready. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/knife-crouch-shoot: On-foot street stage: foot/knife-crouch-shoot
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/knife-crouch-shoot.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/knife-crouch-shoot.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Knife, gang runner, pose: crouched low and aiming the weapon straight forward, muzzle flash at the tip. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Knife, gang runner), crouched low and aiming the weapon straight forward, muzzle flash at the tip. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/knife-die: On-foot street stage: foot/knife-die
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/knife-die.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/knife-die.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Knife, gang runner, pose: collapsing backwards, nearly horizontal in the air, weapon dropping from the hand. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Knife, gang runner), collapsing backwards, nearly horizontal in the air, weapon dropping from the hand. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/knife-fall: On-foot street stage: foot/knife-fall
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/knife-fall.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/knife-fall.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Knife, gang runner, pose: falling down, legs dangling slightly apart, arms raised, clothes pulled upward. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Knife, gang runner), falling down, legs dangling slightly apart, arms raised, clothes pulled upward. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/knife-hit: On-foot street stage: foot/knife-hit
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/knife-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/knife-hit.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Knife, gang runner, pose: flinching from a hit: head and chest thrown back, arms flung out, pained face. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Knife, gang runner), flinching from a hit: head and chest thrown back, arms flung out, pained face. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/knife-idle: On-foot street stage: foot/knife-idle
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/knife-idle.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/knife-idle.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Knife, gang runner, pose: standing relaxed in a ready stance, weapon held low, weight on both feet. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Knife, gang runner), standing relaxed in a ready stance, weapon held low, weight on both feet. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/knife-jump: On-foot street stage: foot/knife-jump
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/knife-jump.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/knife-jump.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Knife, gang runner, pose: jumping up, knees tucked, one arm up, weapon arm forward. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Knife, gang runner), jumping up, knees tucked, one arm up, weapon arm forward. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/knife-melee: On-foot street stage: foot/knife-melee
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/knife-melee.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/knife-melee.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Knife, gang runner, pose: swinging the weapon in a hard forward attack, body lunging, motion trail. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Knife, gang runner), swinging the weapon in a hard forward attack, body lunging, motion trail. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/knife-run-a: On-foot street stage: foot/knife-run-a
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/knife-run-a.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/knife-run-a.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Knife, gang runner, pose: running, mid-stride with the FRONT leg stretched forward and the back leg pushing off, leaning forward, arms swinging (contact frame of a run cycle). Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Knife, gang runner), running, mid-stride with the FRONT leg stretched forward and the back leg pushing off, leaning forward, arms swinging (contact frame of a run cycle). Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/knife-run-b: On-foot street stage: foot/knife-run-b
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/knife-run-b.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/knife-run-b.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Knife, gang runner, pose: running, the OPPOSITE stride to the first running frame: back leg passing under the body, other leg bent up (passing frame of a run cycle), leaning forward. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Knife, gang runner), running, the OPPOSITE stride to the first running frame: back leg passing under the body, other leg bent up (passing frame of a run cycle), leaning forward. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/knife-shoot: On-foot street stage: foot/knife-shoot
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/knife-shoot.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/knife-shoot.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Knife, gang runner, pose: standing and aiming the weapon straight forward with a stiff arm, muzzle flash at the tip. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Knife, gang runner), throwing the knife forward with a straight throwing arm (knife in mid-air in front of the hand). Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/mech-die: On-foot street stage: foot/mech-die
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/mech-die.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/mech-die.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Mech, walker, pose: collapsing backwards, nearly horizontal in the air, weapon dropping from the hand. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Mech, walker), exploding, torso breaking apart, fireball and sparks. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/mech-hit: On-foot street stage: foot/mech-hit
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/mech-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/mech-hit.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Mech, walker, pose: flinching from a hit: head and chest thrown back, arms flung out, pained face. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Mech, walker), flashing white from a hit, staggered. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/mech-idle: On-foot street stage: foot/mech-idle
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/mech-idle.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/mech-idle.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Mech, walker, pose: standing relaxed in a ready stance, weapon held low, weight on both feet. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Mech, walker), standing, slight sway, cannon lowered. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/mech-shoot: On-foot street stage: foot/mech-shoot
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/mech-shoot.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/mech-shoot.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Mech, walker, pose: standing and aiming the weapon straight forward with a stiff arm, muzzle flash at the tip. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Mech, walker), firing the arm cannon forward, big muzzle flash, braced legs. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/pk-bomb: On-foot street stage: foot/pk-bomb
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/pk-bomb.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/pk-bomb.webp`
- Size/ratio: 128x128, ratio 1:1, transparent (flat white background, we key it)
- Note: Square 128x128 pickup icon, transparent, same painted look as the pk-*.webp icons: a round black bomb with a lit fuse on a dark round bezel with a neon rim. Paint at 1024x1024. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. A single game pickup icon: a round black bomb with a lit fuse on a dark round gunmetal bezel with a glowing neon rim, centred, flat plain white background, 1024x1024, no text, no letters.

### foot/pk-damage: On-foot street stage: foot/pk-damage
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/pk-damage.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/pk-damage.webp`
- Size/ratio: 128x128, ratio 1:1, transparent (flat white background, we key it)
- Note: Square 128x128 pickup icon, transparent, same painted look as the pk-*.webp icons: a red damage-boost fist or flame glyph on a dark round bezel with a neon rim. Paint at 1024x1024. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. A single game pickup icon: a red damage-boost fist or flame glyph on a dark round gunmetal bezel with a glowing neon rim, centred, flat plain white background, 1024x1024, no text, no letters.

### foot/pk-heal: On-foot street stage: foot/pk-heal
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/pk-heal.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/pk-heal.webp`
- Size/ratio: 128x128, ratio 1:1, transparent (flat white background, we key it)
- Note: Square 128x128 pickup icon, transparent, same painted look as the pk-*.webp icons: a green health cross on a dark round bezel with a neon rim. Paint at 1024x1024. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. A single game pickup icon: a green health cross on a dark round gunmetal bezel with a glowing neon rim, centred, flat plain white background, 1024x1024, no text, no letters.

### foot/pk-magnet: On-foot street stage: foot/pk-magnet
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/pk-magnet.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/pk-magnet.webp`
- Size/ratio: 128x128, ratio 1:1, transparent (flat white background, we key it)
- Note: Square 128x128 pickup icon, transparent, same painted look as the pk-*.webp icons: a purple horseshoe magnet on a dark round bezel with a neon rim. Paint at 1024x1024. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. A single game pickup icon: a purple horseshoe magnet on a dark round gunmetal bezel with a glowing neon rim, centred, flat plain white background, 1024x1024, no text, no letters.

### foot/pk-shield: On-foot street stage: foot/pk-shield
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/pk-shield.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/pk-shield.webp`
- Size/ratio: 128x128, ratio 1:1, transparent (flat white background, we key it)
- Note: Square 128x128 pickup icon, transparent, same painted look as the pk-*.webp icons: a glowing blue energy shield badge on a dark round bezel with a neon rim. Paint at 1024x1024. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. A single game pickup icon: a glowing blue energy shield badge on a dark round gunmetal bezel with a glowing neon rim, centred, flat plain white background, 1024x1024, no text, no letters.

### foot/pk-slow: On-foot street stage: foot/pk-slow
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/pk-slow.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/pk-slow.webp`
- Size/ratio: 128x128, ratio 1:1, transparent (flat white background, we key it)
- Note: Square 128x128 pickup icon, transparent, same painted look as the pk-*.webp icons: a grey-blue snail or hourglass slow-time glyph on a dark round bezel with a neon rim. Paint at 1024x1024. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. A single game pickup icon: a grey-blue snail or hourglass slow-time glyph on a dark round gunmetal bezel with a glowing neon rim, centred, flat plain white background, 1024x1024, no text, no letters.

### foot/pk-speed: On-foot street stage: foot/pk-speed
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/pk-speed.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/pk-speed.webp`
- Size/ratio: 128x128, ratio 1:1, transparent (flat white background, we key it)
- Note: Square 128x128 pickup icon, transparent, same painted look as the pk-*.webp icons: a green speed boost lightning bolt arrow on a dark round bezel with a neon rim. Paint at 1024x1024. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. A single game pickup icon: a green speed boost lightning bolt arrow on a dark round gunmetal bezel with a glowing neon rim, centred, flat plain white background, 1024x1024, no text, no letters.

### foot/pk-weapon-arc: On-foot street stage: foot/pk-weapon-arc
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/pk-weapon-arc.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/pk-weapon-arc.webp`
- Size/ratio: 128x128, ratio 1:1, transparent (flat white background, we key it)
- Note: Square 128x128 pickup icon, transparent, same painted look as the pk-*.webp icons: an arc gun with blue lightning on a dark round bezel with a neon rim. Paint at 1024x1024. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. A single game pickup icon: an arc gun with blue lightning on a dark round gunmetal bezel with a glowing neon rim, centred, flat plain white background, 1024x1024, no text, no letters.

### foot/pk-weapon-flame: On-foot street stage: foot/pk-weapon-flame
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/pk-weapon-flame.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/pk-weapon-flame.webp`
- Size/ratio: 128x128, ratio 1:1, transparent (flat white background, we key it)
- Note: Square 128x128 pickup icon, transparent, same painted look as the pk-*.webp icons: a flamethrower with a flame on a dark round bezel with a neon rim. Paint at 1024x1024. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. A single game pickup icon: a flamethrower with a flame on a dark round gunmetal bezel with a glowing neon rim, centred, flat plain white background, 1024x1024, no text, no letters.

### foot/pk-weapon-hmg: On-foot street stage: foot/pk-weapon-hmg
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/pk-weapon-hmg.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/pk-weapon-hmg.webp`
- Size/ratio: 128x128, ratio 1:1, transparent (flat white background, we key it)
- Note: Square 128x128 pickup icon, transparent, same painted look as the pk-*.webp icons: a heavy machine gun on a dark round bezel with a neon rim. Paint at 1024x1024. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. A single game pickup icon: a heavy machine gun on a dark round gunmetal bezel with a glowing neon rim, centred, flat plain white background, 1024x1024, no text, no letters.

### foot/pk-weapon-rocket: On-foot street stage: foot/pk-weapon-rocket
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/pk-weapon-rocket.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/pk-weapon-rocket.webp`
- Size/ratio: 128x128, ratio 1:1, transparent (flat white background, we key it)
- Note: Square 128x128 pickup icon, transparent, same painted look as the pk-*.webp icons: a rocket launcher with a rocket on a dark round bezel with a neon rim. Paint at 1024x1024. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. A single game pickup icon: a rocket launcher with a rocket on a dark round gunmetal bezel with a glowing neon rim, centred, flat plain white background, 1024x1024, no text, no letters.

### foot/pk-weapon-shotgun: On-foot street stage: foot/pk-weapon-shotgun
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/pk-weapon-shotgun.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/pk-weapon-shotgun.webp`
- Size/ratio: 128x128, ratio 1:1, transparent (flat white background, we key it)
- Note: Square 128x128 pickup icon, transparent, same painted look as the pk-*.webp icons: a pump shotgun on a dark round bezel with a neon rim. Paint at 1024x1024. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. A single game pickup icon: a pump shotgun on a dark round gunmetal bezel with a glowing neon rim, centred, flat plain white background, 1024x1024, no text, no letters.

### foot/sc-barrel: On-foot street stage: foot/sc-barrel
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/sc-barrel.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/sc-barrel.webp`
- Size/ratio: 256x256, ratio 1:1, transparent (flat white background, we key it)
- Note: Square 256x256 street prop, transparent, side view, base on the bottom edge: a dented green chemical barrel with a hazard stripe. Paint at 1024x1024. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. A single street prop for a side-view game: a dented green chemical barrel with a hazard stripe. Side view, the base touching the bottom edge, flat plain white background, 1024x1024, no text, no letters.

### foot/sc-crate: On-foot street stage: foot/sc-crate
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/sc-crate.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/sc-crate.webp`
- Size/ratio: 256x256, ratio 1:1, transparent (flat white background, we key it)
- Note: Square 256x256 street prop, transparent, side view, base on the bottom edge: a stacked wooden shipping crate with metal corners. Paint at 1024x1024. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. A single street prop for a side-view game: a stacked wooden shipping crate with metal corners. Side view, the base touching the bottom edge, flat plain white background, 1024x1024, no text, no letters.

### foot/sc-door: On-foot street stage: foot/sc-door
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/sc-door.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/sc-door.webp`
- Size/ratio: 256x256, ratio 1:1, transparent (flat white background, we key it)
- Note: Square 256x256 street prop, transparent, side view, base on the bottom edge: a steel service door with an amber warning light above it. Paint at 1024x1024. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. A single street prop for a side-view game: a steel service door with an amber warning light above it. Side view, the base touching the bottom edge, flat plain white background, 1024x1024, no text, no letters.

### foot/sc-neon-sign: On-foot street stage: foot/sc-neon-sign
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/sc-neon-sign.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/sc-neon-sign.webp`
- Size/ratio: 256x256, ratio 1:1, transparent (flat white background, we key it)
- Note: Square 256x256 street prop, transparent, side view, base on the bottom edge: a wall-mounted neon sign board with an abstract magenta and cyan glyph (no letters). Paint at 1024x1024. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. A single street prop for a side-view game: a wall-mounted neon sign board with an abstract magenta and cyan glyph (no letters). Side view, the base touching the bottom edge, flat plain white background, 1024x1024, no text, no letters.

### foot/sc-vending: On-foot street stage: foot/sc-vending
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/sc-vending.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/sc-vending.webp`
- Size/ratio: 256x256, ratio 1:1, transparent (flat white background, we key it)
- Note: Square 256x256 street prop, transparent, side view, base on the bottom edge: a street vending machine glowing cyan, with a lit window of drinks (no text). Paint at 1024x1024. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. A single street prop for a side-view game: a street vending machine glowing cyan, with a lit window of drinks (no text). Side view, the base touching the bottom edge, flat plain white background, 1024x1024, no text, no letters.

### foot/shield-crouch: On-foot street stage: foot/shield-crouch
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/shield-crouch.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/shield-crouch.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Shield, riot cop, pose: crouched low behind cover, knees deeply bent, body leaning forward, weapon held ready. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Shield, riot cop), crouched low behind cover, knees deeply bent, body leaning forward, weapon held ready. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/shield-crouch-shoot: On-foot street stage: foot/shield-crouch-shoot
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/shield-crouch-shoot.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/shield-crouch-shoot.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Shield, riot cop, pose: crouched low and aiming the weapon straight forward, muzzle flash at the tip. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Shield, riot cop), crouched low and aiming the weapon straight forward, muzzle flash at the tip. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/shield-die: On-foot street stage: foot/shield-die
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/shield-die.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/shield-die.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Shield, riot cop, pose: collapsing backwards, nearly horizontal in the air, weapon dropping from the hand. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Shield, riot cop), collapsing backwards, nearly horizontal in the air, weapon dropping from the hand. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/shield-fall: On-foot street stage: foot/shield-fall
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/shield-fall.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/shield-fall.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Shield, riot cop, pose: falling down, legs dangling slightly apart, arms raised, clothes pulled upward. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Shield, riot cop), falling down, legs dangling slightly apart, arms raised, clothes pulled upward. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/shield-hit: On-foot street stage: foot/shield-hit
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/shield-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/shield-hit.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Shield, riot cop, pose: flinching from a hit: head and chest thrown back, arms flung out, pained face. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Shield, riot cop), flinching from a hit: head and chest thrown back, arms flung out, pained face. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/shield-idle: On-foot street stage: foot/shield-idle
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/shield-idle.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/shield-idle.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Shield, riot cop, pose: standing relaxed in a ready stance, weapon held low, weight on both feet. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Shield, riot cop), standing relaxed in a ready stance, weapon held low, weight on both feet. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/shield-jump: On-foot street stage: foot/shield-jump
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/shield-jump.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/shield-jump.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Shield, riot cop, pose: jumping up, knees tucked, one arm up, weapon arm forward. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Shield, riot cop), jumping up, knees tucked, one arm up, weapon arm forward. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/shield-melee: On-foot street stage: foot/shield-melee
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/shield-melee.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/shield-melee.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Shield, riot cop, pose: swinging the weapon in a hard forward attack, body lunging, motion trail. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Shield, riot cop), swinging the weapon in a hard forward attack, body lunging, motion trail. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/shield-run-a: On-foot street stage: foot/shield-run-a
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/shield-run-a.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/shield-run-a.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Shield, riot cop, pose: running, mid-stride with the FRONT leg stretched forward and the back leg pushing off, leaning forward, arms swinging (contact frame of a run cycle). Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Shield, riot cop), running, mid-stride with the FRONT leg stretched forward and the back leg pushing off, leaning forward, arms swinging (contact frame of a run cycle). Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/shield-run-b: On-foot street stage: foot/shield-run-b
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/shield-run-b.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/shield-run-b.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Shield, riot cop, pose: running, the OPPOSITE stride to the first running frame: back leg passing under the body, other leg bent up (passing frame of a run cycle), leaning forward. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Shield, riot cop), running, the OPPOSITE stride to the first running frame: back leg passing under the body, other leg bent up (passing frame of a run cycle), leaning forward. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/shield-shoot: On-foot street stage: foot/shield-shoot
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/shield-shoot.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/shield-shoot.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Shield, riot cop, pose: standing and aiming the weapon straight forward with a stiff arm, muzzle flash at the tip. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Shield, riot cop), thrusting the baton forward from behind the riot shield (a shield bash), shield held forward. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/sniper-crouch: On-foot street stage: foot/sniper-crouch
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/sniper-crouch.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/sniper-crouch.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Sniper, rooftop marksman, pose: crouched low behind cover, knees deeply bent, body leaning forward, weapon held ready. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Sniper, rooftop marksman), crouched low behind cover, knees deeply bent, body leaning forward, weapon held ready. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/sniper-crouch-shoot: On-foot street stage: foot/sniper-crouch-shoot
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/sniper-crouch-shoot.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/sniper-crouch-shoot.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Sniper, rooftop marksman, pose: crouched low and aiming the weapon straight forward, muzzle flash at the tip. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Sniper, rooftop marksman), crouched low and aiming the weapon straight forward, muzzle flash at the tip. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/sniper-die: On-foot street stage: foot/sniper-die
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/sniper-die.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/sniper-die.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Sniper, rooftop marksman, pose: collapsing backwards, nearly horizontal in the air, weapon dropping from the hand. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Sniper, rooftop marksman), collapsing backwards, nearly horizontal in the air, weapon dropping from the hand. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/sniper-fall: On-foot street stage: foot/sniper-fall
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/sniper-fall.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/sniper-fall.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Sniper, rooftop marksman, pose: falling down, legs dangling slightly apart, arms raised, clothes pulled upward. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Sniper, rooftop marksman), falling down, legs dangling slightly apart, arms raised, clothes pulled upward. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/sniper-hit: On-foot street stage: foot/sniper-hit
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/sniper-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/sniper-hit.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Sniper, rooftop marksman, pose: flinching from a hit: head and chest thrown back, arms flung out, pained face. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Sniper, rooftop marksman), flinching from a hit: head and chest thrown back, arms flung out, pained face. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/sniper-idle: On-foot street stage: foot/sniper-idle
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/sniper-idle.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/sniper-idle.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Sniper, rooftop marksman, pose: standing relaxed in a ready stance, weapon held low, weight on both feet. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Sniper, rooftop marksman), standing relaxed in a ready stance, weapon held low, weight on both feet. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/sniper-jump: On-foot street stage: foot/sniper-jump
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/sniper-jump.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/sniper-jump.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Sniper, rooftop marksman, pose: jumping up, knees tucked, one arm up, weapon arm forward. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Sniper, rooftop marksman), jumping up, knees tucked, one arm up, weapon arm forward. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/sniper-melee: On-foot street stage: foot/sniper-melee
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/sniper-melee.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/sniper-melee.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Sniper, rooftop marksman, pose: swinging the weapon in a hard forward attack, body lunging, motion trail. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Sniper, rooftop marksman), swinging the weapon in a hard forward attack, body lunging, motion trail. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/sniper-run-a: On-foot street stage: foot/sniper-run-a
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/sniper-run-a.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/sniper-run-a.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Sniper, rooftop marksman, pose: running, mid-stride with the FRONT leg stretched forward and the back leg pushing off, leaning forward, arms swinging (contact frame of a run cycle). Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Sniper, rooftop marksman), running, mid-stride with the FRONT leg stretched forward and the back leg pushing off, leaning forward, arms swinging (contact frame of a run cycle). Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/sniper-run-b: On-foot street stage: foot/sniper-run-b
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/sniper-run-b.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/sniper-run-b.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Sniper, rooftop marksman, pose: running, the OPPOSITE stride to the first running frame: back leg passing under the body, other leg bent up (passing frame of a run cycle), leaning forward. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Sniper, rooftop marksman), running, the OPPOSITE stride to the first running frame: back leg passing under the body, other leg bent up (passing frame of a run cycle), leaning forward. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/sniper-shoot: On-foot street stage: foot/sniper-shoot
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/sniper-shoot.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/sniper-shoot.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Sniper, rooftop marksman, pose: standing and aiming the weapon straight forward with a stiff arm, muzzle flash at the tip. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Sniper, rooftop marksman), standing and aiming the weapon straight forward with a stiff arm, muzzle flash at the tip. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/turret-die: On-foot street stage: foot/turret-die
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/turret-die.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/turret-die.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Turret, street gun, pose: collapsing backwards, nearly horizontal in the air, weapon dropping from the hand. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Turret, street gun), blowing up in a fireball, dome flying off, smoke. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/turret-hit: On-foot street stage: foot/turret-hit
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/turret-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/turret-hit.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Turret, street gun, pose: flinching from a hit: head and chest thrown back, arms flung out, pained face. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Turret, street gun), flashing white from a hit, sparks. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/turret-idle: On-foot street stage: foot/turret-idle
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/turret-idle.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/turret-idle.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Turret, street gun, pose: standing relaxed in a ready stance, weapon held low, weight on both feet. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Turret, street gun), standing still, barrel slightly raised, a small red light blinking. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/turret-shoot: On-foot street stage: foot/turret-shoot
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/turret-shoot.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/turret-shoot.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Turret, street gun, pose: standing and aiming the weapon straight forward with a stiff arm, muzzle flash at the tip. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Turret, street gun), firing the barrel forward, muzzle flash, small recoil. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/warden-attack2: On-foot street stage: foot/warden-attack2
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/warden-attack2.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/warden-attack2.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Warden, corporate enforcer (boss), pose: overhead slam: both hands raising the energy blade above the head, then bringing it down hard, motion trail (draw the strike moment). Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Warden, corporate enforcer (boss)), overhead slam: both hands raising the energy blade above the head, then bringing it down hard, motion trail (draw the strike moment). Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/warden-crouch: On-foot street stage: foot/warden-crouch
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/warden-crouch.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/warden-crouch.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Warden, corporate enforcer (boss), pose: crouched low behind cover, knees deeply bent, body leaning forward, weapon held ready. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Warden, corporate enforcer (boss)), crouched low behind cover, knees deeply bent, body leaning forward, weapon held ready. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/warden-crouch-shoot: On-foot street stage: foot/warden-crouch-shoot
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/warden-crouch-shoot.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/warden-crouch-shoot.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Warden, corporate enforcer (boss), pose: crouched low and aiming the weapon straight forward, muzzle flash at the tip. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Warden, corporate enforcer (boss)), crouched low and aiming the weapon straight forward, muzzle flash at the tip. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/warden-die: On-foot street stage: foot/warden-die
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/warden-die.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/warden-die.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Warden, corporate enforcer (boss), pose: collapsing backwards, nearly horizontal in the air, weapon dropping from the hand. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Warden, corporate enforcer (boss)), collapsing backwards, nearly horizontal in the air, weapon dropping from the hand. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/warden-enrage: On-foot street stage: foot/warden-enrage
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/warden-enrage.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/warden-enrage.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Warden, corporate enforcer (boss), pose: enraged roar, arms wide, red cracks of glowing energy across the armour, a red aura around the body. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Warden, corporate enforcer (boss)), enraged roar, arms wide, red cracks of glowing energy across the armour, a red aura around the body. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/warden-fall: On-foot street stage: foot/warden-fall
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/warden-fall.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/warden-fall.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Warden, corporate enforcer (boss), pose: falling down, legs dangling slightly apart, arms raised, clothes pulled upward. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Warden, corporate enforcer (boss)), falling down, legs dangling slightly apart, arms raised, clothes pulled upward. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/warden-hit: On-foot street stage: foot/warden-hit
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/warden-hit.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/warden-hit.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Warden, corporate enforcer (boss), pose: flinching from a hit: head and chest thrown back, arms flung out, pained face. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Warden, corporate enforcer (boss)), flinching from a hit: head and chest thrown back, arms flung out, pained face. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/warden-idle: On-foot street stage: foot/warden-idle
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/warden-idle.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/warden-idle.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Warden, corporate enforcer (boss), pose: standing relaxed in a ready stance, weapon held low, weight on both feet. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Warden, corporate enforcer (boss)), standing relaxed in a ready stance, weapon held low, weight on both feet. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/warden-jump: On-foot street stage: foot/warden-jump
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/warden-jump.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/warden-jump.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Warden, corporate enforcer (boss), pose: jumping up, knees tucked, one arm up, weapon arm forward. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Warden, corporate enforcer (boss)), jumping up, knees tucked, one arm up, weapon arm forward. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/warden-melee: On-foot street stage: foot/warden-melee
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/warden-melee.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/warden-melee.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Warden, corporate enforcer (boss), pose: swinging the weapon in a hard forward attack, body lunging, motion trail. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Warden, corporate enforcer (boss)), slashing the energy blade in a wide arc, motion trail. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/warden-run-a: On-foot street stage: foot/warden-run-a
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/warden-run-a.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/warden-run-a.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Warden, corporate enforcer (boss), pose: running, mid-stride with the FRONT leg stretched forward and the back leg pushing off, leaning forward, arms swinging (contact frame of a run cycle). Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Warden, corporate enforcer (boss)), running, mid-stride with the FRONT leg stretched forward and the back leg pushing off, leaning forward, arms swinging (contact frame of a run cycle). Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/warden-run-b: On-foot street stage: foot/warden-run-b
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/warden-run-b.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/warden-run-b.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Warden, corporate enforcer (boss), pose: running, the OPPOSITE stride to the first running frame: back leg passing under the body, other leg bent up (passing frame of a run cycle), leaning forward. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Warden, corporate enforcer (boss)), running, the OPPOSITE stride to the first running frame: back leg passing under the body, other leg bent up (passing frame of a run cycle), leaning forward. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### foot/warden-shoot: On-foot street stage: foot/warden-shoot
- Why: new weapons and fusions. On-foot street stage art (placeholders drawn in code until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `foot/warden-shoot.webp` (laptop) -> `games/mainhattan-nightrun/media/foot/warden-shoot.webp`
- Size/ratio: 1024x1024, ratio 1:1, transparent (flat white background, we key it)
- Note: Facing RIGHT, full body, feet at the bottom edge, transparent background (we cut the white out), 1024x1024. Same character as Warden, corporate enforcer (boss), pose: standing and aiming the weapon straight forward with a stiff arm, muzzle flash at the tip. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size. Same character as the reference (Warden, corporate enforcer (boss)), leaning forward and firing a gold energy bolt from the blade held out, flash at the tip. Keep the same design, colours, proportions and painted style as the reference. 1024x1024, flat plain white background, character facing right, full body, feet near the bottom edge, no text, no letters, no logos.

### ship-drift-armed: Ship weapon mounts: ship-drift-armed
- Why: new weapons and fusions. New weapons and fusions: OPTIONAL: the Drift ship with both weapon slots filled; replaces the mounts in the WEAPONS sheet and Garage preview when present
- Type: painting; priority 3 (missing extra)
- Save as: `ship-drift-armed.webp` (laptop) -> `games/mainhattan-nightrun/media/ship-drift-armed.webp`
- Size/ratio: 512x256, ratio 2:1, transparent (flat white background, we key it)
- Note: Drift ship, same pose and painted style as ship-drift.webp, with four small neutral guns fitted (two on top, two below), nose pointing RIGHT. 512x256, transparent. Paint at 2048x1024 or larger, we convert. Wide 512x256 picture; we crop and convert.
- Prompt: the Drift spaceship seen from the side, nose pointing right, fitted with four small neutral guns, two above and two below the hull, painted neon cyberpunk look like the existing ship sprites, no text, letters or numbers, transparent background, single object, centred, plain flat white background, no shadow

### ship-ec-armed: Ship weapon mounts: ship-ec-armed
- Why: new weapons and fusions. New weapons and fusions: OPTIONAL: the Echo ship with both weapon slots filled; replaces the mounts in the WEAPONS sheet and Garage preview when present
- Type: painting; priority 3 (missing extra)
- Save as: `ship-ec-armed.webp` (laptop) -> `games/mainhattan-nightrun/media/ship-ec-armed.webp`
- Size/ratio: 512x256, ratio 2:1, transparent (flat white background, we key it)
- Note: Echo ship, same pose and painted style as ship-ec.webp, with four small neutral guns fitted (two on top, two below), nose pointing RIGHT. 512x256, transparent. Paint at 2048x1024 or larger, we convert. Wide 512x256 picture; we crop and convert.
- Prompt: the Echo spaceship seen from the side, nose pointing right, fitted with four small neutral guns, two above and two below the hull, painted neon cyberpunk look like the existing ship sprites, no text, letters or numbers, transparent background, single object, centred, plain flat white background, no shadow

### ship-hv-armed: Ship weapon mounts: ship-hv-armed
- Why: new weapons and fusions. New weapons and fusions: OPTIONAL: the Half-time Heavy ship with both weapon slots filled; replaces the mounts in the WEAPONS sheet and Garage preview when present
- Type: painting; priority 3 (missing extra)
- Save as: `ship-hv-armed.webp` (laptop) -> `games/mainhattan-nightrun/media/ship-hv-armed.webp`
- Size/ratio: 512x256, ratio 2:1, transparent (flat white background, we key it)
- Note: Half-time Heavy ship, same pose and painted style as ship-hv.webp, with four small neutral guns fitted (two on top, two below), nose pointing RIGHT. 512x256, transparent. Paint at 2048x1024 or larger, we convert. Wide 512x256 picture; we crop and convert.
- Prompt: the Half-time Heavy spaceship seen from the side, nose pointing right, fitted with four small neutral guns, two above and two below the hull, painted neon cyberpunk look like the existing ship sprites, no text, letters or numbers, transparent background, single object, centred, plain flat white background, no shadow

### ship-lancer-armed: Ship weapon mounts: ship-lancer-armed
- Why: new weapons and fusions. New weapons and fusions: OPTIONAL: the Lancer ship with both weapon slots filled; replaces the mounts in the WEAPONS sheet and Garage preview when present
- Type: painting; priority 3 (missing extra)
- Save as: `ship-lancer-armed.webp` (laptop) -> `games/mainhattan-nightrun/media/ship-lancer-armed.webp`
- Size/ratio: 512x256, ratio 2:1, transparent (flat white background, we key it)
- Note: Lancer ship, same pose and painted style as ship-lancer.webp, with four small neutral guns fitted (two on top, two below), nose pointing RIGHT. 512x256, transparent. Paint at 2048x1024 or larger, we convert. Wide 512x256 picture; we crop and convert.
- Prompt: the Lancer spaceship seen from the side, nose pointing right, fitted with four small neutral guns, two above and two below the hull, painted neon cyberpunk look like the existing ship sprites, no text, letters or numbers, transparent background, single object, centred, plain flat white background, no shadow

### ship-nova-armed: Ship weapon mounts: ship-nova-armed
- Why: new weapons and fusions. New weapons and fusions: OPTIONAL: the Nova ship with both weapon slots filled; replaces the mounts in the WEAPONS sheet and Garage preview when present
- Type: painting; priority 3 (missing extra)
- Save as: `ship-nova-armed.webp` (laptop) -> `games/mainhattan-nightrun/media/ship-nova-armed.webp`
- Size/ratio: 512x256, ratio 2:1, transparent (flat white background, we key it)
- Note: Nova ship, same pose and painted style as ship-nova.webp, with four small neutral guns fitted (two on top, two below), nose pointing RIGHT. 512x256, transparent. Paint at 2048x1024 or larger, we convert. Wide 512x256 picture; we crop and convert.
- Prompt: the Nova spaceship seen from the side, nose pointing right, fitted with four small neutral guns, two above and two below the hull, painted neon cyberpunk look like the existing ship sprites, no text, letters or numbers, transparent background, single object, centred, plain flat white background, no shadow

### ship-std-armed: Ship weapon mounts: ship-std-armed
- Why: new weapons and fusions. New weapons and fusions: OPTIONAL: the Courier ship with both weapon slots filled; replaces the mounts in the WEAPONS sheet and Garage preview when present
- Type: painting; priority 3 (missing extra)
- Save as: `ship-std-armed.webp` (laptop) -> `games/mainhattan-nightrun/media/ship-std-armed.webp`
- Size/ratio: 512x256, ratio 2:1, transparent (flat white background, we key it)
- Note: Courier ship, same pose and painted style as ship-std.webp, with four small neutral guns fitted (two on top, two below), nose pointing RIGHT. 512x256, transparent. Paint at 2048x1024 or larger, we convert. Wide 512x256 picture; we crop and convert.
- Prompt: the Courier spaceship seen from the side, nose pointing right, fitted with four small neutral guns, two above and two below the hull, painted neon cyberpunk look like the existing ship sprites, no text, letters or numbers, transparent background, single object, centred, plain flat white background, no shadow

### ship-swg-armed: Ship weapon mounts: ship-swg-armed
- Why: new weapons and fusions. New weapons and fusions: OPTIONAL: the Swing ship with both weapon slots filled; replaces the mounts in the WEAPONS sheet and Garage preview when present
- Type: painting; priority 3 (missing extra)
- Save as: `ship-swg-armed.webp` (laptop) -> `games/mainhattan-nightrun/media/ship-swg-armed.webp`
- Size/ratio: 512x256, ratio 2:1, transparent (flat white background, we key it)
- Note: Swing ship, same pose and painted style as ship-swg.webp, with four small neutral guns fitted (two on top, two below), nose pointing RIGHT. 512x256, transparent. Paint at 2048x1024 or larger, we convert. Wide 512x256 picture; we crop and convert.
- Prompt: the Swing spaceship seen from the side, nose pointing right, fitted with four small neutral guns, two above and two below the hull, painted neon cyberpunk look like the existing ship sprites, no text, letters or numbers, transparent background, single object, centred, plain flat white background, no shadow

### ship-syn-armed: Ship weapon mounts: ship-syn-armed
- Why: new weapons and fusions. New weapons and fusions: OPTIONAL: the Syncopator ship with both weapon slots filled; replaces the mounts in the WEAPONS sheet and Garage preview when present
- Type: painting; priority 3 (missing extra)
- Save as: `ship-syn-armed.webp` (laptop) -> `games/mainhattan-nightrun/media/ship-syn-armed.webp`
- Size/ratio: 512x256, ratio 2:1, transparent (flat white background, we key it)
- Note: Syncopator ship, same pose and painted style as ship-syn.webp, with four small neutral guns fitted (two on top, two below), nose pointing RIGHT. 512x256, transparent. Paint at 2048x1024 or larger, we convert. Wide 512x256 picture; we crop and convert.
- Prompt: the Syncopator spaceship seen from the side, nose pointing right, fitted with four small neutral guns, two above and two below the hull, painted neon cyberpunk look like the existing ship sprites, no text, letters or numbers, transparent background, single object, centred, plain flat white background, no shadow

### ship-tri-armed: Ship weapon mounts: ship-tri-armed
- Why: new weapons and fusions. New weapons and fusions: OPTIONAL: the Triplet ship with both weapon slots filled; replaces the mounts in the WEAPONS sheet and Garage preview when present
- Type: painting; priority 3 (missing extra)
- Save as: `ship-tri-armed.webp` (laptop) -> `games/mainhattan-nightrun/media/ship-tri-armed.webp`
- Size/ratio: 512x256, ratio 2:1, transparent (flat white background, we key it)
- Note: Triplet ship, same pose and painted style as ship-tri.webp, with four small neutral guns fitted (two on top, two below), nose pointing RIGHT. 512x256, transparent. Paint at 2048x1024 or larger, we convert. Wide 512x256 picture; we crop and convert.
- Prompt: the Triplet spaceship seen from the side, nose pointing right, fitted with four small neutral guns, two above and two below the hull, painted neon cyberpunk look like the existing ship sprites, no text, letters or numbers, transparent background, single object, centred, plain flat white background, no shadow

### wpmount-arc: Ship weapon mounts: wpmount-arc
- Why: new weapons and fusions. New weapons and fusions: On the ship (in the run, the WEAPONS sheet, the Garage preview) at the hardpoint of slot 1 or 2 when Arc Chain is equipped (a coloured circle/triangle until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `wpmount-arc.webp` (laptop) -> `games/mainhattan-nightrun/media/wpmount-arc.webp`
- Size/ratio: 256x128, ratio 2:1, transparent (flat white background, we key it)
- Note: Arc Chain mount: ONE small attachment (gun, pod, hub or rack) seen from the side, nose pointing RIGHT, centred, accent colour #8fe9ff. 256x128, transparent. Paint at 1024x512 or larger, we convert. Wide 256x128 picture; we crop and convert.
- Prompt: a small spaceship weapon attachment for arc chain, side view, muzzle pointing right, compact single part, accent glow #8fe9ff, centred, painted neon cyberpunk look like the existing ship sprites, no text, letters or numbers, transparent background, single object, centred, plain flat white background, no shadow

### wpmount-beat: Ship weapon mounts: wpmount-beat
- Why: new weapons and fusions. New weapons and fusions: On the ship (in the run, the WEAPONS sheet, the Garage preview) at the hardpoint of slot 1 or 2 when Beat Cannon is equipped (a coloured circle/triangle until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `wpmount-beat.webp` (laptop) -> `games/mainhattan-nightrun/media/wpmount-beat.webp`
- Size/ratio: 256x128, ratio 2:1, transparent (flat white background, we key it)
- Note: Beat Cannon mount: ONE small attachment (gun, pod, hub or rack) seen from the side, nose pointing RIGHT, centred, accent colour #ffe14d. 256x128, transparent. Paint at 1024x512 or larger, we convert. Wide 256x128 picture; we crop and convert.
- Prompt: a small spaceship weapon attachment for beat cannon, side view, muzzle pointing right, compact single part, accent glow #ffe14d, centred, painted neon cyberpunk look like the existing ship sprites, no text, letters or numbers, transparent background, single object, centred, plain flat white background, no shadow

### wpmount-disc: Ship weapon mounts: wpmount-disc
- Why: new weapons and fusions. New weapons and fusions: On the ship (in the run, the WEAPONS sheet, the Garage preview) at the hardpoint of slot 1 or 2 when Ricochet Disc is equipped (a coloured circle/triangle until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `wpmount-disc.webp` (laptop) -> `games/mainhattan-nightrun/media/wpmount-disc.webp`
- Size/ratio: 256x128, ratio 2:1, transparent (flat white background, we key it)
- Note: Ricochet Disc mount: ONE small attachment (gun, pod, hub or rack) seen from the side, nose pointing RIGHT, centred, accent colour #ff7a45. 256x128, transparent. Paint at 1024x512 or larger, we convert. Wide 256x128 picture; we crop and convert.
- Prompt: a small spaceship weapon attachment for ricochet disc, side view, muzzle pointing right, compact single part, accent glow #ff7a45, centred, painted neon cyberpunk look like the existing ship sprites, no text, letters or numbers, transparent background, single object, centred, plain flat white background, no shadow

### wpmount-drone: Ship weapon mounts: wpmount-drone
- Why: new weapons and fusions. New weapons and fusions: On the ship (in the run, the WEAPONS sheet, the Garage preview) at the hardpoint of slot 1 or 2 when Echo Drone is equipped (a coloured circle/triangle until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `wpmount-drone.webp` (laptop) -> `games/mainhattan-nightrun/media/wpmount-drone.webp`
- Size/ratio: 256x128, ratio 2:1, transparent (flat white background, we key it)
- Note: Echo Drone mount: ONE small attachment (gun, pod, hub or rack) seen from the side, nose pointing RIGHT, centred, accent colour #e6a8ff. 256x128, transparent. Paint at 1024x512 or larger, we convert. Wide 256x128 picture; we crop and convert.
- Prompt: a small spaceship weapon attachment for echo drone, side view, muzzle pointing right, compact single part, accent glow #e6a8ff, centred, painted neon cyberpunk look like the existing ship sprites, no text, letters or numbers, transparent background, single object, centred, plain flat white background, no shadow

### wpmount-flame: Ship weapon mounts: wpmount-flame
- Why: new weapons and fusions. New weapons and fusions: On the ship (in the run, the WEAPONS sheet, the Garage preview) at the hardpoint of slot 1 or 2 when Flame Arc is equipped (a coloured circle/triangle until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `wpmount-flame.webp` (laptop) -> `games/mainhattan-nightrun/media/wpmount-flame.webp`
- Size/ratio: 256x128, ratio 2:1, transparent (flat white background, we key it)
- Note: Flame Arc mount: ONE small attachment (gun, pod, hub or rack) seen from the side, nose pointing RIGHT, centred, accent colour #ff5a2d. 256x128, transparent. Paint at 1024x512 or larger, we convert. Wide 256x128 picture; we crop and convert.
- Prompt: a small spaceship weapon attachment for flame arc, side view, muzzle pointing right, compact single part, accent glow #ff5a2d, centred, painted neon cyberpunk look like the existing ship sprites, no text, letters or numbers, transparent background, single object, centred, plain flat white background, no shadow

### wpmount-frost: Ship weapon mounts: wpmount-frost
- Why: new weapons and fusions. New weapons and fusions: On the ship (in the run, the WEAPONS sheet, the Garage preview) at the hardpoint of slot 1 or 2 when Frost Beam is equipped (a coloured circle/triangle until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `wpmount-frost.webp` (laptop) -> `games/mainhattan-nightrun/media/wpmount-frost.webp`
- Size/ratio: 256x128, ratio 2:1, transparent (flat white background, we key it)
- Note: Frost Beam mount: ONE small attachment (gun, pod, hub or rack) seen from the side, nose pointing RIGHT, centred, accent colour #9fe8ff. 256x128, transparent. Paint at 1024x512 or larger, we convert. Wide 256x128 picture; we crop and convert.
- Prompt: a small spaceship weapon attachment for frost beam, side view, muzzle pointing right, compact single part, accent glow #9fe8ff, centred, painted neon cyberpunk look like the existing ship sprites, no text, letters or numbers, transparent background, single object, centred, plain flat white background, no shadow

### wpmount-laser: Ship weapon mounts: wpmount-laser
- Why: new weapons and fusions. New weapons and fusions: On the ship (in the run, the WEAPONS sheet, the Garage preview) at the hardpoint of slot 1 or 2 when Laser Lance is equipped (a coloured circle/triangle until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `wpmount-laser.webp` (laptop) -> `games/mainhattan-nightrun/media/wpmount-laser.webp`
- Size/ratio: 256x128, ratio 2:1, transparent (flat white background, we key it)
- Note: Laser Lance mount: ONE small attachment (gun, pod, hub or rack) seen from the side, nose pointing RIGHT, centred, accent colour #7dffd8. 256x128, transparent. Paint at 1024x512 or larger, we convert. Wide 256x128 picture; we crop and convert.
- Prompt: a small spaceship weapon attachment for laser lance, side view, muzzle pointing right, compact single part, accent glow #7dffd8, centred, painted neon cyberpunk look like the existing ship sprites, no text, letters or numbers, transparent background, single object, centred, plain flat white background, no shadow

### wpmount-mine: Ship weapon mounts: wpmount-mine
- Why: new weapons and fusions. New weapons and fusions: On the ship (in the run, the WEAPONS sheet, the Garage preview) at the hardpoint of slot 1 or 2 when Mine Layer is equipped (a coloured circle/triangle until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `wpmount-mine.webp` (laptop) -> `games/mainhattan-nightrun/media/wpmount-mine.webp`
- Size/ratio: 256x128, ratio 2:1, transparent (flat white background, we key it)
- Note: Mine Layer mount: ONE small attachment (gun, pod, hub or rack) seen from the side, nose pointing RIGHT, centred, accent colour #c08aff. 256x128, transparent. Paint at 1024x512 or larger, we convert. Wide 256x128 picture; we crop and convert.
- Prompt: a small spaceship weapon attachment for mine layer, side view, muzzle pointing right, compact single part, accent glow #c08aff, centred, painted neon cyberpunk look like the existing ship sprites, no text, letters or numbers, transparent background, single object, centred, plain flat white background, no shadow

### wpmount-orbit: Ship weapon mounts: wpmount-orbit
- Why: new weapons and fusions. New weapons and fusions: On the ship (in the run, the WEAPONS sheet, the Garage preview) at the hardpoint of slot 1 or 2 when Orbit Blades is equipped (a coloured circle/triangle until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `wpmount-orbit.webp` (laptop) -> `games/mainhattan-nightrun/media/wpmount-orbit.webp`
- Size/ratio: 256x128, ratio 2:1, transparent (flat white background, we key it)
- Note: Orbit Blades mount: ONE small attachment (gun, pod, hub or rack) seen from the side, nose pointing RIGHT, centred, accent colour #b6ff5a. 256x128, transparent. Paint at 1024x512 or larger, we convert. Wide 256x128 picture; we crop and convert.
- Prompt: a small spaceship weapon attachment for orbit blades, side view, muzzle pointing right, compact single part, accent glow #b6ff5a, centred, painted neon cyberpunk look like the existing ship sprites, no text, letters or numbers, transparent background, single object, centred, plain flat white background, no shadow

### wpmount-pulse: Ship weapon mounts: wpmount-pulse
- Why: new weapons and fusions. New weapons and fusions: On the ship (in the run, the WEAPONS sheet, the Garage preview) at the hardpoint of slot 1 or 2 when Pulse Spread is equipped (a coloured circle/triangle until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `wpmount-pulse.webp` (laptop) -> `games/mainhattan-nightrun/media/wpmount-pulse.webp`
- Size/ratio: 256x128, ratio 2:1, transparent (flat white background, we key it)
- Note: Pulse Spread mount: ONE small attachment (gun, pod, hub or rack) seen from the side, nose pointing RIGHT, centred, accent colour #ff8ad8. 256x128, transparent. Paint at 1024x512 or larger, we convert. Wide 256x128 picture; we crop and convert.
- Prompt: a small spaceship weapon attachment for pulse spread, side view, muzzle pointing right, compact single part, accent glow #ff8ad8, centred, painted neon cyberpunk look like the existing ship sprites, no text, letters or numbers, transparent background, single object, centred, plain flat white background, no shadow

### wpmount-rail: Ship weapon mounts: wpmount-rail
- Why: new weapons and fusions. New weapons and fusions: On the ship (in the run, the WEAPONS sheet, the Garage preview) at the hardpoint of slot 1 or 2 when Rail Sniper is equipped (a coloured circle/triangle until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `wpmount-rail.webp` (laptop) -> `games/mainhattan-nightrun/media/wpmount-rail.webp`
- Size/ratio: 256x128, ratio 2:1, transparent (flat white background, we key it)
- Note: Rail Sniper mount: ONE small attachment (gun, pod, hub or rack) seen from the side, nose pointing RIGHT, centred, accent colour #ff3d6a. 256x128, transparent. Paint at 1024x512 or larger, we convert. Wide 256x128 picture; we crop and convert.
- Prompt: a small spaceship weapon attachment for rail sniper, side view, muzzle pointing right, compact single part, accent glow #ff3d6a, centred, painted neon cyberpunk look like the existing ship sprites, no text, letters or numbers, transparent background, single object, centred, plain flat white background, no shadow

### wpmount-shell: Ship weapon mounts: wpmount-shell
- Why: new weapons and fusions. New weapons and fusions: On the ship (in the run, the WEAPONS sheet, the Garage preview) at the hardpoint of slot 1 or 2 when Shrapnel Shell is equipped (a coloured circle/triangle until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `wpmount-shell.webp` (laptop) -> `games/mainhattan-nightrun/media/wpmount-shell.webp`
- Size/ratio: 256x128, ratio 2:1, transparent (flat white background, we key it)
- Note: Shrapnel Shell mount: ONE small attachment (gun, pod, hub or rack) seen from the side, nose pointing RIGHT, centred, accent colour #ffa94d. 256x128, transparent. Paint at 1024x512 or larger, we convert. Wide 256x128 picture; we crop and convert.
- Prompt: a small spaceship weapon attachment for shrapnel shell, side view, muzzle pointing right, compact single part, accent glow #ffa94d, centred, painted neon cyberpunk look like the existing ship sprites, no text, letters or numbers, transparent background, single object, centred, plain flat white background, no shadow

### wpmount-storm: Ship weapon mounts: wpmount-storm
- Why: new weapons and fusions. New weapons and fusions: On the ship (in the run, the WEAPONS sheet, the Garage preview) at the hardpoint of slot 1 or 2 when Storm Cell is equipped (a coloured circle/triangle until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `wpmount-storm.webp` (laptop) -> `games/mainhattan-nightrun/media/wpmount-storm.webp`
- Size/ratio: 256x128, ratio 2:1, transparent (flat white background, we key it)
- Note: Storm Cell mount: ONE small attachment (gun, pod, hub or rack) seen from the side, nose pointing RIGHT, centred, accent colour #fff06a. 256x128, transparent. Paint at 1024x512 or larger, we convert. Wide 256x128 picture; we crop and convert.
- Prompt: a small spaceship weapon attachment for storm cell, side view, muzzle pointing right, compact single part, accent glow #fff06a, centred, painted neon cyberpunk look like the existing ship sprites, no text, letters or numbers, transparent background, single object, centred, plain flat white background, no shadow

### wpmount-swarm: Ship weapon mounts: wpmount-swarm
- Why: new weapons and fusions. New weapons and fusions: On the ship (in the run, the WEAPONS sheet, the Garage preview) at the hardpoint of slot 1 or 2 when Homing Swarm is equipped (a coloured circle/triangle until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `wpmount-swarm.webp` (laptop) -> `games/mainhattan-nightrun/media/wpmount-swarm.webp`
- Size/ratio: 256x128, ratio 2:1, transparent (flat white background, we key it)
- Note: Homing Swarm mount: ONE small attachment (gun, pod, hub or rack) seen from the side, nose pointing RIGHT, centred, accent colour #ffb020. 256x128, transparent. Paint at 1024x512 or larger, we convert. Wide 256x128 picture; we crop and convert.
- Prompt: a small spaceship weapon attachment for homing swarm, side view, muzzle pointing right, compact single part, accent glow #ffb020, centred, painted neon cyberpunk look like the existing ship sprites, no text, letters or numbers, transparent background, single object, centred, plain flat white background, no shadow

### wpmount-wave: Ship weapon mounts: wpmount-wave
- Why: new weapons and fusions. New weapons and fusions: On the ship (in the run, the WEAPONS sheet, the Garage preview) at the hardpoint of slot 1 or 2 when Plasma Wave is equipped (a coloured circle/triangle until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `wpmount-wave.webp` (laptop) -> `games/mainhattan-nightrun/media/wpmount-wave.webp`
- Size/ratio: 256x128, ratio 2:1, transparent (flat white background, we key it)
- Note: Plasma Wave mount: ONE small attachment (gun, pod, hub or rack) seen from the side, nose pointing RIGHT, centred, accent colour #5b8cff. 256x128, transparent. Paint at 1024x512 or larger, we convert. Wide 256x128 picture; we crop and convert.
- Prompt: a small spaceship weapon attachment for plasma wave, side view, muzzle pointing right, compact single part, accent glow #5b8cff, centred, painted neon cyberpunk look like the existing ship sprites, no text, letters or numbers, transparent background, single object, centred, plain flat white background, no shadow

### wpmount-well: Ship weapon mounts: wpmount-well
- Why: new weapons and fusions. New weapons and fusions: On the ship (in the run, the WEAPONS sheet, the Garage preview) at the hardpoint of slot 1 or 2 when Gravity Well is equipped (a coloured circle/triangle until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `wpmount-well.webp` (laptop) -> `games/mainhattan-nightrun/media/wpmount-well.webp`
- Size/ratio: 256x128, ratio 2:1, transparent (flat white background, we key it)
- Note: Gravity Well mount: ONE small attachment (gun, pod, hub or rack) seen from the side, nose pointing RIGHT, centred, accent colour #7a4dff. 256x128, transparent. Paint at 1024x512 or larger, we convert. Wide 256x128 picture; we crop and convert.
- Prompt: a small spaceship weapon attachment for gravity well, side view, muzzle pointing right, compact single part, accent glow #7a4dff, centred, painted neon cyberpunk look like the existing ship sprites, no text, letters or numbers, transparent background, single object, centred, plain flat white background, no shadow

### fx-fuse-arc-beat: Weapon fusions: fx-fuse-arc-beat
- Why: new weapons and fusions. New weapons and fusions: FUSION banner on the WEAPONS sheet when Arc Chain + Beat Cannon are equipped (a split ring with initials until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-fuse-arc-beat.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-fuse-arc-beat.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Fusion "Thunder Drum": Arc Chain fused with Beat Cannon. Painted look on black, light on black (drawn additively). Paint at 1024 px or larger, we convert to 512x512. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a fusion emblem: a forked cyan lightning bolt leaping between three glowing nodes, electric sparks meeting a heavy golden shell with a pulsing shockwave ring, thick yellow plasma core, the two colours (electric cyan and golden yellow) braided into one glowing crest, painted neon energy art, light on a pure black background, centred, no text, letters or numbers

### fx-fuse-arc-disc: Weapon fusions: fx-fuse-arc-disc
- Why: new weapons and fusions. New weapons and fusions: FUSION banner on the WEAPONS sheet when Arc Chain + Ricochet Disc are equipped (a split ring with initials until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-fuse-arc-disc.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-fuse-arc-disc.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Fusion "Storm Quoit": Arc Chain fused with Ricochet Disc. Painted look on black, light on black (drawn additively). Paint at 1024 px or larger, we convert to 512x512. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a fusion emblem: a forked cyan lightning bolt leaping between three glowing nodes, electric sparks meeting an orange razor-edged disc bouncing between two angled neon walls, sparks at each bounce, the two colours (electric cyan and orange) braided into one glowing crest, painted neon energy art, light on a pure black background, centred, no text, letters or numbers

### fx-fuse-arc-laser: Weapon fusions: fx-fuse-arc-laser
- Why: new weapons and fusions. New weapons and fusions: FUSION banner on the WEAPONS sheet when Arc Chain + Laser Lance are equipped (a split ring with initials until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-fuse-arc-laser.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-fuse-arc-laser.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Fusion "Volt Spear": Arc Chain fused with Laser Lance. Painted look on black, light on black (drawn additively). Paint at 1024 px or larger, we convert to 512x512. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a fusion emblem: a forked cyan lightning bolt leaping between three glowing nodes, electric sparks meeting one long piercing mint-green beam of light with a bright core, cutting through the dark, the two colours (electric cyan and mint green) braided into one glowing crest, painted neon energy art, light on a pure black background, centred, no text, letters or numbers

### fx-fuse-arc-mine: Weapon fusions: fx-fuse-arc-mine
- Why: new weapons and fusions. New weapons and fusions: FUSION banner on the WEAPONS sheet when Arc Chain + Mine Layer are equipped (a split ring with initials until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-fuse-arc-mine.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-fuse-arc-mine.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Fusion "Static Field": Arc Chain fused with Mine Layer. Painted look on black, light on black (drawn additively). Paint at 1024 px or larger, we convert to 512x512. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a fusion emblem: a forked cyan lightning bolt leaping between three glowing nodes, electric sparks meeting a spiked violet mine with a pulsing core and a faint blast ring, drifting, the two colours (electric cyan and violet) braided into one glowing crest, painted neon energy art, light on a pure black background, centred, no text, letters or numbers

### fx-fuse-arc-orbit: Weapon fusions: fx-fuse-arc-orbit
- Why: new weapons and fusions. New weapons and fusions: FUSION banner on the WEAPONS sheet when Arc Chain + Orbit Blades are equipped (a split ring with initials until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-fuse-arc-orbit.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-fuse-arc-orbit.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Fusion "Halo Spark": Arc Chain fused with Orbit Blades. Painted look on black, light on black (drawn additively). Paint at 1024 px or larger, we convert to 512x512. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a fusion emblem: a forked cyan lightning bolt leaping between three glowing nodes, electric sparks meeting three lime-green curved blades spinning in a ring around a small glowing core, motion arcs, the two colours (electric cyan and lime green) braided into one glowing crest, painted neon energy art, light on a pure black background, centred, no text, letters or numbers

### fx-fuse-arc-pulse: Weapon fusions: fx-fuse-arc-pulse
- Why: new weapons and fusions. New weapons and fusions: FUSION banner on the WEAPONS sheet when Arc Chain + Pulse Spread are equipped (a split ring with initials until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-fuse-arc-pulse.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-fuse-arc-pulse.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Fusion "Fork Flash": Arc Chain fused with Pulse Spread. Painted look on black, light on black (drawn additively). Paint at 1024 px or larger, we convert to 512x512. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a fusion emblem: a forked cyan lightning bolt leaping between three glowing nodes, electric sparks meeting a fan of pink energy bolts spreading from a small ship nose, magenta and white glow, the two colours (electric cyan and hot pink) braided into one glowing crest, painted neon energy art, light on a pure black background, centred, no text, letters or numbers

### fx-fuse-arc-swarm: Weapon fusions: fx-fuse-arc-swarm
- Why: new weapons and fusions. New weapons and fusions: FUSION banner on the WEAPONS sheet when Arc Chain + Homing Swarm are equipped (a split ring with initials until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-fuse-arc-swarm.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-fuse-arc-swarm.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Fusion "Chain Hornets": Arc Chain fused with Homing Swarm. Painted look on black, light on black (drawn additively). Paint at 1024 px or larger, we convert to 512x512. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a fusion emblem: a forked cyan lightning bolt leaping between three glowing nodes, electric sparks meeting a cluster of small amber missiles curving with glowing trails toward unseen targets, the two colours (electric cyan and amber) braided into one glowing crest, painted neon energy art, light on a pure black background, centred, no text, letters or numbers

### fx-fuse-beat-disc: Weapon fusions: fx-fuse-beat-disc
- Why: new weapons and fusions. New weapons and fusions: FUSION banner on the WEAPONS sheet when Beat Cannon + Ricochet Disc are equipped (a split ring with initials until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-fuse-beat-disc.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-fuse-beat-disc.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Fusion "Bass Ricochet": Beat Cannon fused with Ricochet Disc. Painted look on black, light on black (drawn additively). Paint at 1024 px or larger, we convert to 512x512. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a fusion emblem: a heavy golden shell with a pulsing shockwave ring, thick yellow plasma core meeting an orange razor-edged disc bouncing between two angled neon walls, sparks at each bounce, the two colours (golden yellow and orange) braided into one glowing crest, painted neon energy art, light on a pure black background, centred, no text, letters or numbers

### fx-fuse-beat-laser: Weapon fusions: fx-fuse-beat-laser
- Why: new weapons and fusions. New weapons and fusions: FUSION banner on the WEAPONS sheet when Beat Cannon + Laser Lance are equipped (a split ring with initials until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-fuse-beat-laser.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-fuse-beat-laser.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Fusion "Kick Lance": Beat Cannon fused with Laser Lance. Painted look on black, light on black (drawn additively). Paint at 1024 px or larger, we convert to 512x512. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a fusion emblem: a heavy golden shell with a pulsing shockwave ring, thick yellow plasma core meeting one long piercing mint-green beam of light with a bright core, cutting through the dark, the two colours (golden yellow and mint green) braided into one glowing crest, painted neon energy art, light on a pure black background, centred, no text, letters or numbers

### fx-fuse-beat-mine: Weapon fusions: fx-fuse-beat-mine
- Why: new weapons and fusions. New weapons and fusions: FUSION banner on the WEAPONS sheet when Beat Cannon + Mine Layer are equipped (a split ring with initials until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-fuse-beat-mine.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-fuse-beat-mine.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Fusion "Subwoofer Trap": Beat Cannon fused with Mine Layer. Painted look on black, light on black (drawn additively). Paint at 1024 px or larger, we convert to 512x512. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a fusion emblem: a heavy golden shell with a pulsing shockwave ring, thick yellow plasma core meeting a spiked violet mine with a pulsing core and a faint blast ring, drifting, the two colours (golden yellow and violet) braided into one glowing crest, painted neon energy art, light on a pure black background, centred, no text, letters or numbers

### fx-fuse-beat-orbit: Weapon fusions: fx-fuse-beat-orbit
- Why: new weapons and fusions. New weapons and fusions: FUSION banner on the WEAPONS sheet when Beat Cannon + Orbit Blades are equipped (a split ring with initials until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-fuse-beat-orbit.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-fuse-beat-orbit.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Fusion "Metronome Ring": Beat Cannon fused with Orbit Blades. Painted look on black, light on black (drawn additively). Paint at 1024 px or larger, we convert to 512x512. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a fusion emblem: a heavy golden shell with a pulsing shockwave ring, thick yellow plasma core meeting three lime-green curved blades spinning in a ring around a small glowing core, motion arcs, the two colours (golden yellow and lime green) braided into one glowing crest, painted neon energy art, light on a pure black background, centred, no text, letters or numbers

### fx-fuse-beat-pulse: Weapon fusions: fx-fuse-beat-pulse
- Why: new weapons and fusions. New weapons and fusions: FUSION banner on the WEAPONS sheet when Beat Cannon + Pulse Spread are equipped (a split ring with initials until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-fuse-beat-pulse.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-fuse-beat-pulse.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Fusion "Drop Fan": Beat Cannon fused with Pulse Spread. Painted look on black, light on black (drawn additively). Paint at 1024 px or larger, we convert to 512x512. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a fusion emblem: a heavy golden shell with a pulsing shockwave ring, thick yellow plasma core meeting a fan of pink energy bolts spreading from a small ship nose, magenta and white glow, the two colours (golden yellow and hot pink) braided into one glowing crest, painted neon energy art, light on a pure black background, centred, no text, letters or numbers

### fx-fuse-beat-swarm: Weapon fusions: fx-fuse-beat-swarm
- Why: new weapons and fusions. New weapons and fusions: FUSION banner on the WEAPONS sheet when Beat Cannon + Homing Swarm are equipped (a split ring with initials until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-fuse-beat-swarm.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-fuse-beat-swarm.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Fusion "Bomblet Choir": Beat Cannon fused with Homing Swarm. Painted look on black, light on black (drawn additively). Paint at 1024 px or larger, we convert to 512x512. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a fusion emblem: a heavy golden shell with a pulsing shockwave ring, thick yellow plasma core meeting a cluster of small amber missiles curving with glowing trails toward unseen targets, the two colours (golden yellow and amber) braided into one glowing crest, painted neon energy art, light on a pure black background, centred, no text, letters or numbers

### fx-fuse-disc-laser: Weapon fusions: fx-fuse-disc-laser
- Why: new weapons and fusions. New weapons and fusions: FUSION banner on the WEAPONS sheet when Ricochet Disc + Laser Lance are equipped (a split ring with initials until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-fuse-disc-laser.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-fuse-disc-laser.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Fusion "Mirror Lance": Ricochet Disc fused with Laser Lance. Painted look on black, light on black (drawn additively). Paint at 1024 px or larger, we convert to 512x512. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a fusion emblem: an orange razor-edged disc bouncing between two angled neon walls, sparks at each bounce meeting one long piercing mint-green beam of light with a bright core, cutting through the dark, the two colours (orange and mint green) braided into one glowing crest, painted neon energy art, light on a pure black background, centred, no text, letters or numbers

### fx-fuse-disc-mine: Weapon fusions: fx-fuse-disc-mine
- Why: new weapons and fusions. New weapons and fusions: FUSION banner on the WEAPONS sheet when Ricochet Disc + Mine Layer are equipped (a split ring with initials until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-fuse-disc-mine.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-fuse-disc-mine.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Fusion "Pinball Grave": Ricochet Disc fused with Mine Layer. Painted look on black, light on black (drawn additively). Paint at 1024 px or larger, we convert to 512x512. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a fusion emblem: an orange razor-edged disc bouncing between two angled neon walls, sparks at each bounce meeting a spiked violet mine with a pulsing core and a faint blast ring, drifting, the two colours (orange and violet) braided into one glowing crest, painted neon energy art, light on a pure black background, centred, no text, letters or numbers

### fx-fuse-disc-orbit: Weapon fusions: fx-fuse-disc-orbit
- Why: new weapons and fusions. New weapons and fusions: FUSION banner on the WEAPONS sheet when Ricochet Disc + Orbit Blades are equipped (a split ring with initials until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-fuse-disc-orbit.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-fuse-disc-orbit.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Fusion "Saw Carousel": Ricochet Disc fused with Orbit Blades. Painted look on black, light on black (drawn additively). Paint at 1024 px or larger, we convert to 512x512. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a fusion emblem: an orange razor-edged disc bouncing between two angled neon walls, sparks at each bounce meeting three lime-green curved blades spinning in a ring around a small glowing core, motion arcs, the two colours (orange and lime green) braided into one glowing crest, painted neon energy art, light on a pure black background, centred, no text, letters or numbers

### fx-fuse-disc-pulse: Weapon fusions: fx-fuse-disc-pulse
- Why: new weapons and fusions. New weapons and fusions: FUSION banner on the WEAPONS sheet when Ricochet Disc + Pulse Spread are equipped (a split ring with initials until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-fuse-disc-pulse.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-fuse-disc-pulse.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Fusion "Rain Bounce": Ricochet Disc fused with Pulse Spread. Painted look on black, light on black (drawn additively). Paint at 1024 px or larger, we convert to 512x512. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a fusion emblem: an orange razor-edged disc bouncing between two angled neon walls, sparks at each bounce meeting a fan of pink energy bolts spreading from a small ship nose, magenta and white glow, the two colours (orange and hot pink) braided into one glowing crest, painted neon energy art, light on a pure black background, centred, no text, letters or numbers

### fx-fuse-disc-swarm: Weapon fusions: fx-fuse-disc-swarm
- Why: new weapons and fusions. New weapons and fusions: FUSION banner on the WEAPONS sheet when Ricochet Disc + Homing Swarm are equipped (a split ring with initials until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-fuse-disc-swarm.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-fuse-disc-swarm.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Fusion "Boomerang Bees": Ricochet Disc fused with Homing Swarm. Painted look on black, light on black (drawn additively). Paint at 1024 px or larger, we convert to 512x512. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a fusion emblem: an orange razor-edged disc bouncing between two angled neon walls, sparks at each bounce meeting a cluster of small amber missiles curving with glowing trails toward unseen targets, the two colours (orange and amber) braided into one glowing crest, painted neon energy art, light on a pure black background, centred, no text, letters or numbers

### fx-fuse-laser-mine: Weapon fusions: fx-fuse-laser-mine
- Why: new weapons and fusions. New weapons and fusions: FUSION banner on the WEAPONS sheet when Laser Lance + Mine Layer are equipped (a split ring with initials until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-fuse-laser-mine.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-fuse-laser-mine.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Fusion "Tripwire Beam": Laser Lance fused with Mine Layer. Painted look on black, light on black (drawn additively). Paint at 1024 px or larger, we convert to 512x512. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a fusion emblem: one long piercing mint-green beam of light with a bright core, cutting through the dark meeting a spiked violet mine with a pulsing core and a faint blast ring, drifting, the two colours (mint green and violet) braided into one glowing crest, painted neon energy art, light on a pure black background, centred, no text, letters or numbers

### fx-fuse-laser-orbit: Weapon fusions: fx-fuse-laser-orbit
- Why: new weapons and fusions. New weapons and fusions: FUSION banner on the WEAPONS sheet when Laser Lance + Orbit Blades are equipped (a split ring with initials until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-fuse-laser-orbit.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-fuse-laser-orbit.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Fusion "Lantern Spin": Laser Lance fused with Orbit Blades. Painted look on black, light on black (drawn additively). Paint at 1024 px or larger, we convert to 512x512. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a fusion emblem: one long piercing mint-green beam of light with a bright core, cutting through the dark meeting three lime-green curved blades spinning in a ring around a small glowing core, motion arcs, the two colours (mint green and lime green) braided into one glowing crest, painted neon energy art, light on a pure black background, centred, no text, letters or numbers

### fx-fuse-laser-pulse: Weapon fusions: fx-fuse-laser-pulse
- Why: new weapons and fusions. New weapons and fusions: FUSION banner on the WEAPONS sheet when Laser Lance + Pulse Spread are equipped (a split ring with initials until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-fuse-laser-pulse.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-fuse-laser-pulse.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Fusion "Needle Storm": Laser Lance fused with Pulse Spread. Painted look on black, light on black (drawn additively). Paint at 1024 px or larger, we convert to 512x512. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a fusion emblem: one long piercing mint-green beam of light with a bright core, cutting through the dark meeting a fan of pink energy bolts spreading from a small ship nose, magenta and white glow, the two colours (mint green and hot pink) braided into one glowing crest, painted neon energy art, light on a pure black background, centred, no text, letters or numbers

### fx-fuse-laser-swarm: Weapon fusions: fx-fuse-laser-swarm
- Why: new weapons and fusions. New weapons and fusions: FUSION banner on the WEAPONS sheet when Laser Lance + Homing Swarm are equipped (a split ring with initials until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-fuse-laser-swarm.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-fuse-laser-swarm.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Fusion "Hunter Needles": Laser Lance fused with Homing Swarm. Painted look on black, light on black (drawn additively). Paint at 1024 px or larger, we convert to 512x512. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a fusion emblem: one long piercing mint-green beam of light with a bright core, cutting through the dark meeting a cluster of small amber missiles curving with glowing trails toward unseen targets, the two colours (mint green and amber) braided into one glowing crest, painted neon energy art, light on a pure black background, centred, no text, letters or numbers

### fx-fuse-mine-orbit: Weapon fusions: fx-fuse-mine-orbit
- Why: new weapons and fusions. New weapons and fusions: FUSION banner on the WEAPONS sheet when Mine Layer + Orbit Blades are equipped (a split ring with initials until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-fuse-mine-orbit.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-fuse-mine-orbit.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Fusion "Satellite Mines": Mine Layer fused with Orbit Blades. Painted look on black, light on black (drawn additively). Paint at 1024 px or larger, we convert to 512x512. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a fusion emblem: a spiked violet mine with a pulsing core and a faint blast ring, drifting meeting three lime-green curved blades spinning in a ring around a small glowing core, motion arcs, the two colours (violet and lime green) braided into one glowing crest, painted neon energy art, light on a pure black background, centred, no text, letters or numbers

### fx-fuse-mine-pulse: Weapon fusions: fx-fuse-mine-pulse
- Why: new weapons and fusions. New weapons and fusions: FUSION banner on the WEAPONS sheet when Mine Layer + Pulse Spread are equipped (a split ring with initials until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-fuse-mine-pulse.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-fuse-mine-pulse.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Fusion "Seed Spray": Mine Layer fused with Pulse Spread. Painted look on black, light on black (drawn additively). Paint at 1024 px or larger, we convert to 512x512. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a fusion emblem: a spiked violet mine with a pulsing core and a faint blast ring, drifting meeting a fan of pink energy bolts spreading from a small ship nose, magenta and white glow, the two colours (violet and hot pink) braided into one glowing crest, painted neon energy art, light on a pure black background, centred, no text, letters or numbers

### fx-fuse-mine-swarm: Weapon fusions: fx-fuse-mine-swarm
- Why: new weapons and fusions. New weapons and fusions: FUSION banner on the WEAPONS sheet when Mine Layer + Homing Swarm are equipped (a split ring with initials until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-fuse-mine-swarm.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-fuse-mine-swarm.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Fusion "Hive Mines": Mine Layer fused with Homing Swarm. Painted look on black, light on black (drawn additively). Paint at 1024 px or larger, we convert to 512x512. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a fusion emblem: a spiked violet mine with a pulsing core and a faint blast ring, drifting meeting a cluster of small amber missiles curving with glowing trails toward unseen targets, the two colours (violet and amber) braided into one glowing crest, painted neon energy art, light on a pure black background, centred, no text, letters or numbers

### fx-fuse-orbit-pulse: Weapon fusions: fx-fuse-orbit-pulse
- Why: new weapons and fusions. New weapons and fusions: FUSION banner on the WEAPONS sheet when Orbit Blades + Pulse Spread are equipped (a split ring with initials until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-fuse-orbit-pulse.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-fuse-orbit-pulse.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Fusion "Comet Crown": Orbit Blades fused with Pulse Spread. Painted look on black, light on black (drawn additively). Paint at 1024 px or larger, we convert to 512x512. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a fusion emblem: three lime-green curved blades spinning in a ring around a small glowing core, motion arcs meeting a fan of pink energy bolts spreading from a small ship nose, magenta and white glow, the two colours (lime green and hot pink) braided into one glowing crest, painted neon energy art, light on a pure black background, centred, no text, letters or numbers

### fx-fuse-orbit-swarm: Weapon fusions: fx-fuse-orbit-swarm
- Why: new weapons and fusions. New weapons and fusions: FUSION banner on the WEAPONS sheet when Orbit Blades + Homing Swarm are equipped (a split ring with initials until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-fuse-orbit-swarm.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-fuse-orbit-swarm.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Fusion "Wasp Halo": Orbit Blades fused with Homing Swarm. Painted look on black, light on black (drawn additively). Paint at 1024 px or larger, we convert to 512x512. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a fusion emblem: three lime-green curved blades spinning in a ring around a small glowing core, motion arcs meeting a cluster of small amber missiles curving with glowing trails toward unseen targets, the two colours (lime green and amber) braided into one glowing crest, painted neon energy art, light on a pure black background, centred, no text, letters or numbers

### fx-fuse-pulse-swarm: Weapon fusions: fx-fuse-pulse-swarm
- Why: new weapons and fusions. New weapons and fusions: FUSION banner on the WEAPONS sheet when Pulse Spread + Homing Swarm are equipped (a split ring with initials until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `fx-fuse-pulse-swarm.webp` (laptop) -> `games/mainhattan-nightrun/media/fx-fuse-pulse-swarm.webp`
- Size/ratio: 512x512, ratio 1:1
- Note: Fusion "Pollen Burst": Pulse Spread fused with Homing Swarm. Painted look on black, light on black (drawn additively). Paint at 1024 px or larger, we convert to 512x512. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a fusion emblem: a fan of pink energy bolts spreading from a small ship nose, magenta and white glow meeting a cluster of small amber missiles curving with glowing trails toward unseen targets, the two colours (hot pink and amber) braided into one glowing crest, painted neon energy art, light on a pure black background, centred, no text, letters or numbers

### wp-arc: Weapons: wp-arc
- Why: new weapons and fusions. New weapons and fusions: WEAPONS sheet card for Arc Chain (an animated vector demo until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `wp-arc.webp` (laptop) -> `games/mainhattan-nightrun/media/wp-arc.webp`
- Size/ratio: 256x256, ratio 1:1, transparent (flat white background, we key it)
- Note: Arc Chain weapon card icon: a forked cyan lightning bolt leaping between three glowing nodes, electric sparks. Square, transparent, painted neon look. Paint at 1024 px or larger, we convert to 256x256. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a game icon of a forked cyan lightning bolt leaping between three glowing nodes, electric sparks, centred single subject on a dark gunmetal bezel, painted neon cyberpunk look, no text, letters or numbers, single object, centred, plain flat white background, no shadow

### wp-beat: Weapons: wp-beat
- Why: new weapons and fusions. New weapons and fusions: WEAPONS sheet card for Beat Cannon (an animated vector demo until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `wp-beat.webp` (laptop) -> `games/mainhattan-nightrun/media/wp-beat.webp`
- Size/ratio: 256x256, ratio 1:1, transparent (flat white background, we key it)
- Note: Beat Cannon weapon card icon: a heavy golden shell with a pulsing shockwave ring, thick yellow plasma core. Square, transparent, painted neon look. Paint at 1024 px or larger, we convert to 256x256. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a game icon of a heavy golden shell with a pulsing shockwave ring, thick yellow plasma core, centred single subject on a dark gunmetal bezel, painted neon cyberpunk look, no text, letters or numbers, single object, centred, plain flat white background, no shadow

### wp-disc: Weapons: wp-disc
- Why: new weapons and fusions. New weapons and fusions: WEAPONS sheet card for Ricochet Disc (an animated vector demo until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `wp-disc.webp` (laptop) -> `games/mainhattan-nightrun/media/wp-disc.webp`
- Size/ratio: 256x256, ratio 1:1, transparent (flat white background, we key it)
- Note: Ricochet Disc weapon card icon: an orange razor-edged disc bouncing between two angled neon walls, sparks at each bounce. Square, transparent, painted neon look. Paint at 1024 px or larger, we convert to 256x256. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a game icon of an orange razor-edged disc bouncing between two angled neon walls, sparks at each bounce, centred single subject on a dark gunmetal bezel, painted neon cyberpunk look, no text, letters or numbers, single object, centred, plain flat white background, no shadow

### wp-laser: Weapons: wp-laser
- Why: new weapons and fusions. New weapons and fusions: WEAPONS sheet card for Laser Lance (an animated vector demo until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `wp-laser.webp` (laptop) -> `games/mainhattan-nightrun/media/wp-laser.webp`
- Size/ratio: 256x256, ratio 1:1, transparent (flat white background, we key it)
- Note: Laser Lance weapon card icon: one long piercing mint-green beam of light with a bright core, cutting through the dark. Square, transparent, painted neon look. Paint at 1024 px or larger, we convert to 256x256. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a game icon of one long piercing mint-green beam of light with a bright core, cutting through the dark, centred single subject on a dark gunmetal bezel, painted neon cyberpunk look, no text, letters or numbers, single object, centred, plain flat white background, no shadow

### wp-mine: Weapons: wp-mine
- Why: new weapons and fusions. New weapons and fusions: WEAPONS sheet card for Mine Layer (an animated vector demo until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `wp-mine.webp` (laptop) -> `games/mainhattan-nightrun/media/wp-mine.webp`
- Size/ratio: 256x256, ratio 1:1, transparent (flat white background, we key it)
- Note: Mine Layer weapon card icon: a spiked violet mine with a pulsing core and a faint blast ring, drifting. Square, transparent, painted neon look. Paint at 1024 px or larger, we convert to 256x256. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a game icon of a spiked violet mine with a pulsing core and a faint blast ring, drifting, centred single subject on a dark gunmetal bezel, painted neon cyberpunk look, no text, letters or numbers, single object, centred, plain flat white background, no shadow

### wp-orbit: Weapons: wp-orbit
- Why: new weapons and fusions. New weapons and fusions: WEAPONS sheet card for Orbit Blades (an animated vector demo until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `wp-orbit.webp` (laptop) -> `games/mainhattan-nightrun/media/wp-orbit.webp`
- Size/ratio: 256x256, ratio 1:1, transparent (flat white background, we key it)
- Note: Orbit Blades weapon card icon: three lime-green curved blades spinning in a ring around a small glowing core, motion arcs. Square, transparent, painted neon look. Paint at 1024 px or larger, we convert to 256x256. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a game icon of three lime-green curved blades spinning in a ring around a small glowing core, motion arcs, centred single subject on a dark gunmetal bezel, painted neon cyberpunk look, no text, letters or numbers, single object, centred, plain flat white background, no shadow

### wp-pulse: Weapons: wp-pulse
- Why: new weapons and fusions. New weapons and fusions: WEAPONS sheet card for Pulse Spread (an animated vector demo until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `wp-pulse.webp` (laptop) -> `games/mainhattan-nightrun/media/wp-pulse.webp`
- Size/ratio: 256x256, ratio 1:1, transparent (flat white background, we key it)
- Note: Pulse Spread weapon card icon: a fan of pink energy bolts spreading from a small ship nose, magenta and white glow. Square, transparent, painted neon look. Paint at 1024 px or larger, we convert to 256x256. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a game icon of a fan of pink energy bolts spreading from a small ship nose, magenta and white glow, centred single subject on a dark gunmetal bezel, painted neon cyberpunk look, no text, letters or numbers, single object, centred, plain flat white background, no shadow

### wp-swarm: Weapons: wp-swarm
- Why: new weapons and fusions. New weapons and fusions: WEAPONS sheet card for Homing Swarm (an animated vector demo until this exists)
- Type: painting; priority 3 (missing extra)
- Save as: `wp-swarm.webp` (laptop) -> `games/mainhattan-nightrun/media/wp-swarm.webp`
- Size/ratio: 256x256, ratio 1:1, transparent (flat white background, we key it)
- Note: Homing Swarm weapon card icon: a cluster of small amber missiles curving with glowing trails toward unseen targets. Square, transparent, painted neon look. Paint at 1024 px or larger, we convert to 256x256. Paint at 1024x1024 or larger; we crop and convert.
- Prompt: a game icon of a cluster of small amber missiles curving with glowing trails toward unseen targets, centred single subject on a dark gunmetal bezel, painted neon cyberpunk look, no text, letters or numbers, single object, centred, plain flat white background, no shadow

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

