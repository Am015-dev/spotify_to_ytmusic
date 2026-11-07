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


## Round 2b (orchestrator correction + audit W340)
Found -> fixed (played at 390x763 and 1440x860 with real taps for title / Story / tutorial; full climbs driven through the real render path, 2 per size, no errors):
- Audit A (text size): hand cards showed 6-8 px text on phone -> hand cards use `--hw`, name 13 px (16 px PC), cost and key number >= 13 px, card body text only on the lifted card; HP bars 13 px; chips and titles 16 px at PC width; placeholder labels first name only.
- Audit B (contrast): card title bars darkened, HP bar fill darkened, placeholder labels get a flat dark backing.
- Audit F (title buttons): the title now has exactly one big primary button (Guide on a first launch, Story afterwards); Quick game and How to play are small. Top bar is at most 4 buttons (empty potion slots are no longer buttons; Relics, Deck, Sound, How to play and Leave moved into a Menu).
- Lifted card went off-screen at the left edge and covered its neighbours' names -> shifted inside the screen and lifted higher.
- Title tutorial button text overlapped (b/span) -> stacked layout.
- Dead end: no way to leave a fight -> Menu > Leave run / Leave chapter.
- Story mode (shared `gx-campaign.js` + css, `campaign.json`, `CAMPAIGN-DESIGN.md`, `src/camp.js`): 9 chapters in 3 acts, chapter 1 is the guided first fight, hero + starting relic + short map + guardian per chapter, stars, easier offer, saved progress by the kit. Engine options `floors`, `boss`, `relic`, `hpPct`. Bot win rates per chapter in CAMPAIGN-DESIGN.md.
- Title: Story / Quick game / How to play (Quick game = hero pick, 1 or 2 heroes).
- Results: `build-all.py --quick` scenarios 11/14, only the 3 visual snapshot rows missing (expected); independent audit (`ui-audit.spec.js`) result in the worker report.

Not done / next (honest):
- Shell chrome of the old games (`shell.js` board shell with dock, `gx-kit.js` menu with settings/stats, `gx-menu.css` title layout, `gx-help.js` help drawer) is NOT adopted; this game keeps its own title, menu and a plain rules overlay. Adopting it means moving the DOM into `.gx-app/.gx-board`; needs its own round.
- Audit E may still flag the Sound toggle and "How to play" as dead buttons (both do change the DOM when tapped manually); the kit's tutor "Next" button is flagged on the campaign guide surface (shared kit).
- Campaign unlocks (portraits, card backs) are empty; no painted cast portraits (emoji used).

## Tests
- `node rules-test.js 300`: PASS. `node bal.js 200`: table above.
- `NODE_PATH=/opt/node-tools/node_modules node smoke.js`: PASS (phone + PC).
- `NODE_PATH=/opt/node-tools/node_modules node tutor-test.js`: PASS (all 7 steps by real taps at 390x763 and 1440x860, end card, no page errors, hand fonts and bounds). Shots in `shots/` (gitignored): `phone-fight2.png`, `pc-fight2.png`.
- `build-all.py --quick emberclimb`: see the worker report.

## Not done / next
- Music music-picker drawer needs `shell.js` (not inlined here): `GXMUS.open()` is not wired to a button.
- Guide has no rotation or leave-and-return test yet.
- Placeholder art still in use; real art needs no code.
