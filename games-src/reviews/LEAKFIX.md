# LEAKFIX: original-name leaks in source, data and built games

Branch `shelf/W594-name-leaks` (from `alex/brave-carson-rbpmlk`). Scope: the leaks listed in `games-src/reviews/COPYAUDIT.md` "Hard-rule leaks to fix first". Leak strings are not written in this file; only paths and counts.

## What changed per game

| Game (slug) | Commit | Change | Build (`build-all.py --quick`) |
|---|---|---|---|
| thornbound | `d21e2f1d` | Removed the 4 `original_faction` fields in `games-src/thornbound/cards.json`. No code read them. | PASS (1/1; scenarios 12/12) |
| hollowbough | `56b52aed` | Renamed the 90 leaked card keys (`role`, `linked`, `requires_cards` values) in cards.json, game/src, game/cover.js, game/keymap.json, gen-data.py, kit, tests, to slugs of our own card names (dangling `linked` partners got `<name>_pair` ids). Rule-table expectations in `logic-test.js` re-sorted, since pair names are sorted alphabetically. Own-id roles (e.g. `special_<our name>`) and art filenames were left alone. | PASS (13/13 scenarios). logic-test 217/217 and rules-test 108/108, same as before. |
| shipwreck-isle (rc) | `dd7fc8c9` | Replaced 214 leaked `ref:'…'` ids in cards-adv.js, cards-ev.js, data.js, scen.js with neutral ids (`event-NNN`, `adv-NNN`, `mystery-NNN`, `scen-N`). Nothing reads these ids. | PASS (8/8 own checks). Warning only: a clipped-text note. rules-test 28/28 same as before. |
| iron-meridian | `c1908935` | Ticket `ref` label relabelled (the old label named the original base map) (30 tickets, `map-usa.json`). | No build target exists (not in build-all). Valid JSON checked. |
| crown-city-smash (kot) | none | `AUDIT-PRODUCT.md:37` does not contain any original name, so nothing was changed there. The real monster mapping is in `kot/rules-notes.md` (line 1 and the monster-mapping section). That file was out of the listed scope and is NOT changed. | not run (no edits) |
| lantern-dive | none | `tasks-ref.json` does not exist in the repo, so there was nothing to fix. The name is only mentioned in `AUDIT-RULES.md` and `rules-notes.md` (text). | not run (no edits) |
| tidewake | none | `tiles.json` has no `ref` fields. The `ref` hits in `kit/` and `game/ui4.js` are code refs, not data. Not checked by a name scan. | not run (no edits) |

## Leaks still present (not edited)

- Docs and notes (`*.md`, `kit/demo-src.html` text, `game/rules-test.js` and `logic-test.js` test titles, `cards.json` notes): original names remain in prose. Fixing them needs wording decisions.
- Display labels with original names, such as the hollowbough labels in `game/src/ui2.js`. Changing them changes player-facing wording, so they were left.
- Hollowbough art filenames (an art filename in `game/src/ui1.js` that carries an original card name). Owner art is not to be rewired.
- `kot/rules-notes.md` (see above) and `iron-meridian/rules-notes.md` line 1 ("original game" label).

## Built files under games/ that still contain original-name strings (counts)

Counts are literal matches of the base commit's leak strings (word-bounded, text files only), so generic words can add hits. They are per file, summed across the leak sources. Folder totals:

| games/ folder | hits |
|---|---|
| `games/hollowbough` | 680 |
| `games/shipwreck-isle` | 232 |
| `games/doorkick-dungeon` | 231 |
| `games/mainhattan-nightrun` | 193 |
| `games/short-fuse` | 190 |
| `games/thornbound` | 124 |
| `games/vale-of-banners` | 99 |
| `games/sands-of-qamar` | 98 |
| `games/rampart-and-vine` | 89 |
| `games/lantern-dive` | 80 |
| `games/asset-viewer` | 75 |
| `games/mainhattan-overdrive` | 75 |
| `games/crown-city-smash` | 69 |
| `games/nebula-aces` | 67 |
| `games/emberclimb` | 62 |
| `games/next-wave.html` | 59 |
| `games/perch-and-plume` | 54 |
| `games/tidewake` | 53 |
| `games/final-approach` | 49 |
| `games/vinegrave` | 43 |
| `games/sunglaze` | 37 |
| `games/facelift.html` | 36 |
| `games/cauldron-fair` | 33 |
| `games/wildmark` | 31 |
| `games/kaiten-kitchen` | 28 |
| `games/deep-signal` | 25 |
| `games/twin-thrones` | 25 |
| `games/look` | 18 |
| `games/stitchwise` | 17 |
| `games/missing.html` | 15 |
| `games/index.html` | 9 |
| `games/redline-rally` | 9 |
| `games/reference.html` | 9 |
| `games/updates.json` | 2 |
| `games/classic.html` | 1 |

Per file:

| file | hits |
|---|---|
| `games/asset-viewer/flow.json` | 73 |
| `games/asset-viewer/manifest.json` | 1 |
| `games/asset-viewer/review-tips.js` | 1 |
| `games/cauldron-fair/index.html` | 33 |
| `games/classic.html` | 1 |
| `games/crown-city-smash/index.html` | 69 |
| `games/deep-signal/index.html` | 25 |
| `games/doorkick-dungeon/cards.html` | 2 |
| `games/doorkick-dungeon/index.html` | 229 |
| `games/emberclimb/index.html` | 62 |
| `games/facelift.html` | 36 |
| `games/final-approach/index.html` | 49 |
| `games/hollowbough/cards.html` | 48 |
| `games/hollowbough/index.html` | 584 |
| `games/hollowbough/offline.json` | 48 |
| `games/index.html` | 9 |
| `games/kaiten-kitchen/index.html` | 28 |
| `games/lantern-dive/index.html` | 80 |
| `games/look/needs-art.json` | 9 |
| `games/look/report.json` | 9 |
| `games/mainhattan-nightrun/index.html` | 158 |
| `games/mainhattan-nightrun/media/assets-index.json` | 35 |
| `games/mainhattan-overdrive/index.html` | 56 |
| `games/mainhattan-overdrive/models/lx.js` | 5 |
| `games/mainhattan-overdrive/xc/98b2_builder2.js` | 11 |
| `games/mainhattan-overdrive/xc/99c7_rev5fix.js` | 1 |
| `games/mainhattan-overdrive/xc/99c9_collide.js` | 1 |
| `games/mainhattan-overdrive/xc/99c_checklist.js` | 1 |
| `games/missing.html` | 15 |
| `games/nebula-aces/index.html` | 67 |
| `games/next-wave.html` | 59 |
| `games/perch-and-plume/index.html` | 54 |
| `games/rampart-and-vine/index.html` | 89 |
| `games/redline-rally/index.html` | 9 |
| `games/reference.html` | 9 |
| `games/sands-of-qamar/index.html` | 95 |
| `games/sands-of-qamar/offline.json` | 3 |
| `games/shipwreck-isle/index.html` | 232 |
| `games/short-fuse/index.html` | 190 |
| `games/stitchwise/index.html` | 17 |
| `games/sunglaze/index.html` | 37 |
| `games/thornbound/cards.html` | 4 |
| `games/thornbound/index.html` | 120 |
| `games/tidewake/index.html` | 53 |
| `games/twin-thrones/index.html` | 25 |
| `games/updates.json` | 2 |
| `games/vale-of-banners/index.html` | 99 |
| `games/vinegrave/index.html` | 43 |
| `games/wildmark/index.html` | 31 |

These built files were NOT changed. Nothing under `games/` was edited or committed. Rebuilding and deploying the fixed games would clear the hits for those folders.
