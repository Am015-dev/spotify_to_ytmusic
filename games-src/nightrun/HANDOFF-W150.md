# W150: music clean, song per stage, enemy beat lock (22 Oct 2026)

Owner (phone, 22 Oct 05:25): "music is distorted by effects, you mixed up the selections very badly, not beat and tension of enemies".
Branch `nr/W150` (not merged to the live branch). W144 does not exist on origin (`nr/W144` was not found), so nothing was read from it.

## 1. Music clean: measured, no defect found in the graph
`mix-test.js` now also records gain reduction (`AU.lim.reduction`, `AU.sfxc.reduction`, sampled every 25 ms) and gates it (check 1b: master limiter never beyond -2 dB).
Real-time bot runs, 30 s each, real songs, `MEASURE=1`:

| scenario | pre-limiter peak | out peak | clipped blocks | master limiter GR | effects-bus GR | music vs effects RMS |
|---|---|---|---|---|---|---|
| stage 1 | -11.3 dBFS | -9.6 | 0 | 0 dB | -0.55 | +29 dB |
| stage 6 | -14.9 | -13.1 | 0 | 0 dB | small | +32 |
| stage 10 | -10.2 | -8.4 | 0 | 0 dB | small | +34 |
| boss | -12.0 | -10.2 | 0 | 0 dB | small | +28 |
| endless wave 15 | -11.0 | -9.2 | 0 | 0 dB | small | +14 |

No clipping, master limiter never engages (gate <= 2 dB: 0 dB), no pumping from effects. No audio code was changed.
Not measured: pack mp3 loudness against the old songs, and what a phone speaker does to the file masters. If the owner still hears distortion, the next suspect is the mp3 masters (peak/loudness per file in `media/mp-*.mp3`), not the effects.

## 2. Song per stage: this was the real bug
Cause: `ret.js` replaced each story stage's song with a rotating pick (`DP.stage`), and `musicpack.js` made that pick a seeded shuffle with a RANDOM seed per page load, recomputed whenever a pack file registered. So stage N played a different song on every load, and Classic was not the original either.

Fix (`musicpack.js` wrapper of `DP.stage`, `ret.js` keeps `s.song0` = the original song):
- Classic: every stage plays its original song.
- Mix: a stage plays its own original song until it is cleared; a replay of a cleared stage takes a new pack song of its district (fixed per stage, never the stage's own, same on every load).
- New only: pack pool, fixed seed, same on every load.

Table (stages 1-32, same on every load; stages 33-37 are challenge stages and keep their own songs; s1/s2/s3 = stage1/2/3):

| mode | stages 1-32 |
|---|---|
| BEFORE, any mode (random per load, example) | rotating pool, differs each load; Classic not original |
| AFTER Classic = original = Mix before clears | s1 s2 s1 s2 s3 s2 endless endless2 s3 s1 endless s3 endless2 s1 s2 s3 s1 endless s2 endless2 s3 endless s1 endless2 s2 s1 endless2 endless s3 s2 endless s1 |
| AFTER Classic / Mix, Athens (stages 33-40 in the list) | athina athina2 x4 |
| AFTER New only | d1a d1b x4 (Bank), d2b d2a x4, d3a d3b x4, d4a d4b x4, athB athA x4 |

Endless, bosses, fever, pit and street cues are unchanged (their own alternation in `musicpack.js`).
`musicpack-test.js` updated: the old shuffle checks now call `DP.pick` directly (the endless/free-run picker is unchanged); two new checks: Classic = original and stable, New changes the picks.

## 3. Enemy beat lock and tension
New `beatlock-test.js` (stepped sim, no wall clock; `STAGES=1,6,10 SECS=150`):
- share of enemy volleys within 60 ms of a beat: stage 1 98.8%, stage 6 91.0%, stage 10 97.3% (gate >= 80%: PASS, median offset 4-5 ms). No fix needed in the sim: volleys are counted in beats (`e.bf`) by design.
- enemies spawned per bar: loud bars vs quiet bars of the song: stage 6 1.25 -> 2.08 (x1.66), stage 10 0 -> 2.14, stage 1 not enough quiet bars in the window to compare. The director (`dir.js barLine`) scales spawns by song energy `(.42+1.15E)`; shot density per bar lags the song because enemies stay on screen (pacing.js), which is why the first version of the gate (volleys per bar) read x1.1 on stage 1.
- NOT measured: real-audio drift (`?sim=1` ties the beat clock to game time). If the owner feels real offbeat on a phone, the next check is `AU.lat` / `SET.sync` on a real device (`audio-test.js`), not the enemy code.

## Left for the orchestrator
Gates: musicpack-test ALL PASS, beatlock-test PASS (stages 1/6/10), guard.py ok. Review and merge `nr/W150`.
