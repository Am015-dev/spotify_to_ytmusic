# Nightrun Story, Hard and the song switch (how it works)

Source parts: `parts/story.js` (stages, stage select, result, Hard toggle), hooks in `a.js` (song switch), `b.js` (bosses, difficulty), `c.js` (HUD, flow).
Build: `python3 games-src/nightrun/parts/build.py`.

- **Song switch** (`AU.switchTo` / `AU.xfade` in `a.js`): wait for a bar line of the playing song, start the new song one bar early (mid-file, so its first beat lands on that bar line), equal-power crossfade over that bar. `NR.sw` logs old/new beat position at every switch; both must be whole bars. Mini-bosses and SEK-ADLER keep the stage song and get a drum layer (`AU.intense`); district bosses 2 and 3 switch to `boss`, the final boss to `boss2`; after a boss the next stage song returns on the next bar.
- **Story**: 12 stages (`STAGES`), per-stage level `TUNE.lv` drives bullet speed, enemy HP, extra waves, elites, heal drops, boss HP. Stars: clear, PERFECT count (`perf`), no hull lost. Progress and per-stage upgrade snapshots live in `localStorage` key `mnr_story`. `?all=1` opens every stage, a 1 s long press on the title does it permanently.
- **Balance**: `story-sim.js` plays stages headless in the real page (`?sim=1`: no audio, page stepped by hand). Re-tune `TUNE.lv` after any change: `RUNS=50 node games-src/nightrun/story-sim.js`.
- **Sweep**: `ONLY=story,switch` runs the stage-select / goal / result / boss-music checks; the full sweep includes them.
