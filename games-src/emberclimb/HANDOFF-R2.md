# Emberclimb round 2 (W337, branch shelf/W337-emberclimb)

## What changed
1. **Rules cross-check**: `rules-notes.md` (new) marks each number VERIFIED / CHANGED / UNCHECKED. The rulebook could not be opened here, so UNCHECKED lines were left alone. `rules-test.js` re-run: PASS (300 games).
2. **Balance** (bot, solo, RUNS=200 each, seeds 5000-5199, `node bal.js 200`, one run each, no sweeps):

| hero | before | after |
|---|---|---|
| Warrior | 43% | 43% |
| Rogue | 48% | 49% |
| Automaton | 61% | 59% |
| Monk | 20% | 35% |

   (The earlier handoff quoted warrior ~40 / monk ~16; the table is this session's measurement before and after.)
   Monk: the bot now respects Wrath (doubles incoming damage in its block need, avoids entering Wrath under heavy threat, leaves it when it can); Prayer Beads adds a Calm Spark card (0 cost, +1 energy, exhaust); Inner Peace draws 3 (official); Palm Flurry, Pressure Point, Third Eye tuned; HP 72 -> 76.
   Automaton: Meteor Strike 24, Glacier Core 6 (official), Core Breach 10, Barrier Pulse 7, HP 75 -> 72. Rogue: Toxic Vial 5 (official).
   Monk sits at the low edge (35%): the next lever is a smarter stance policy in `src/ai.js`, not more card buffs.
3. **Phone hand** (390x763): hand cards use their own size (`--hw`, 21vw); name, cost and key number (damage / block / poison, big on the picture) render at 11 / 13 / 14 px or more; whole hand inside the screen (measured by `tutor-test.js`). Tap-hold (0.45 s) on a hand card opens the full card big; tap anywhere closes it.
4. **fx-fire-burst** slot: drawn on burn damage at turn end, on any hit made by a hero or an enemy that has Strength, and on Strength gains. Same `A(stem)` slot loader, no new asset.
5. **First-game guide** (`src/tutor.js`, shared `gx-tutor.js`, `gx-viewport.js`, help + tutor css inlined by `build.py`): 7 steps (intent, energy, attack, block, end turn, finish, pick a reward). Offered as the first button on a first launch and from Rules; staged fight is never saved (`EC_NOSAVE`).
6. **Sound** (`src/sound.js`): synthesized card play / hit / hurt / block / buff / heal / win / lose, mute toggle in the top bar and title (saved). Music through `gameaudio.js` + `gx-music.js`, slots menu, map, fight, boss, victory, defeat; silent until `games/emberclimb/music/<slot>-<a|b>.mp3` exist (build lists present files, so no 404s). Cues: `games-src/next-wave/music/emberclimb/cues-wave1.json` (6 cues x versions a and b).

## Tests
- `node rules-test.js 300`: PASS. `node bal.js 200`: table above.
- `NODE_PATH=/opt/node-tools/node_modules node smoke.js`: PASS (phone + PC).
- `NODE_PATH=/opt/node-tools/node_modules node tutor-test.js`: PASS (all 7 steps by real taps at 390x763 and 1440x860, end card, no page errors, hand fonts and bounds). Shots in `shots/` (gitignored): `phone-fight2.png`, `pc-fight2.png`.
- `build-all.py --quick emberclimb`: see the worker report.

## Not done / next
- Music music-picker drawer needs `shell.js` (not inlined here): `GXMUS.open()` is not wired to a button.
- Guide has no rotation or leave-and-return test yet.
- Placeholder art still in use; real art needs no code.
