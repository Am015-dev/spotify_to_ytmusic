# Stitchwise visual diffs (quick check, phone project)

Command: `python3 games-src/scripts/build-all.py --quick stitchwise` after `baselines.sh pull`.

Result: 11/14 pass. Every functional check passes: all 10 `?scn=` scenarios (menu, sw-board, sw-place, sw-advance, sw-income,
sw-leather, sw-zoom, sw-result, sw-torn, story-scene) and the phone ui-audit (A0 B1 C0 D0 E1 F0).

The 3 failures are all the same cause: the ui-baselines branch has NO stitchwise baselines (it holds 12 png files for
rampart-and-vine and sunglaze only). These are missing snapshots, not pixel mismatches, so there is no regression to fix in source.

| Check | File missing in games-src/.baselines | Kind |
|---|---|---|
| visual title (phone) | stitchwise-title-phone.png | first-time baseline |
| visual menu (phone) | stitchwise-menu-phone.png | first-time baseline |
| visual board (phone) | stitchwise-board-phone.png | first-time baseline |

Needed from the owner: `python3 games-src/scripts/build-all.py --approve-visual stitchwise` (records and pushes them to ui-baselines).
Not run here.

Not done in this session: contact sheets (phone and pc), PC ui-audit, turbo full-game runs. Starting the local static server
on :8779 that contact-sheet.js needs was blocked by the permission classifier, so those checks are still open.
