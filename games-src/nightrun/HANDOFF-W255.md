# HANDOFF W255: fps + backdrop fix (branch nr/W255-fix, from nr/W254-look, not deployed)
Files: parts/render/pure.js, parts/render/pureboss.js only.
## 1. Phone fps - cause
W244 ink pass: PURL.ink ran ~18 canvas ops per actor per frame; pickups (pureboss.js pickups) inked uncached every frame was the biggest part (base pureboss.js alone restored fps; removing pickup ink restored it).
Fix: PURL.ink(..., ck) caches the finished inked image per sheet frame (key = sheet key, frame + crossfade step via PURL.fk, scale, rotation in 1/12 rad, lit); 8M px pool. Used by enemies, player rim and pickups; boss stays uncached. Enemy ink box is now the tight sheet size, not a square.
fps (my script scratchpad/fps.js, 390x763 dpr2, 4x CPU, rAF over 10 s, alternating, sandbox absolute numbers differ from yours):
base 27.5 / 34.8 / 32.2; new 36.6 / 36.2 / 33.9 (JS per frame base ~16 ms, new ~9 ms). Before the fix: new ~23-31 vs base ~36. Noise about +-20%.
Not run: playability-load.js (measures load only).
## 2. Backdrop
Removed the phone rooftop side strips (vtile and its call); the scrolling sky (pan) stays. Backdrop pixel change t14->t98 (diff>12, 390x763): before 32.5 %, after 40.0 % (gate 25 %). Looked at the shots: one continuous city, no second picture.
Shots (/tmp/claude-0/-home-user-spotify-to-ytmusic/18599658-53ee-53e2-8778-db87648c19cc/scratchpad/shots): before-2s/10s/dense, after-2s/10s/dense, *-bg-t14/t98 .png
## 3. streetsim RUNS=12 (new vs base)
Street code is untouched by W255; differences come from W243/W248 merged in W254.
new fails: nearest clear 25-40 (67%, base 42% also fails), kill order (75 vs 67; base passes 75 vs 42), W243 dodge 65+-8 (75%), threat peak and cover hits (base fails these too). Passes W243 gfirst 75%, melee gates. W196 stand-still FAILS 20.6% (base 18.0% passes); seed==realtime fails (base fails too).
Logs: /tmp/claude-0/-home-user-spotify-to-ytmusic/18599658-53ee-53e2-8778-db87648c19cc/scratchpad/ss-new.md, /tmp/claude-0/-home-user-spotify-to-ytmusic/18599658-53ee-53e2-8778-db87648c19cc/scratchpad/ss-base.md
Next: owner/W248 owns street balance: nearest bot clears too easily (67%), so kill order no longer separates.
