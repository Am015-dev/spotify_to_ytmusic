# Build and deploy
Entry: `tools/build.sh <ver> [--local] [--preview]`; HOW-TO-WORK: [../../../HOW-TO-WORK.md](../../../HOW-TO-WORK.md).

## Key files
- `src/ORDER` (module order = execution order; every src/*.js|*.html must be in ORDER or `src/MODELS`), `src/LAZY` (modules packed to `xc/<name>.js`, evaluated after drivable by `src/10z_lazy.js`), `src/MAP.md` (one line per module).
- `tools/build.sh` -> `out/<ver>/`: `overdrive.html`, `index.html`, `km.js`, `models.js` + `models/*.js` (~150 per-car chunks), `xc/*.js`, `tune.json`, `music/*.mp3`, `PUBLISH_FILES.txt`. `--preview` flips `OD_PREVIEW` ([flags.md](flags.md)).
- `tools/deploy.sh <outdir> "<msg>"`: clones live branch `alex/brave-carson-rbpmlk`, writes `games/mainhattan-overdrive/`, pushes, polls the URL until served.
- Splitters: `tools/split_km.py`, `tools/split_src.py`, `tools/lazy/pack.js`; model chunks `tools/ld/mkmodels.py`; extra packs `tools/{as,lx,xf,qa}/pack.sh`.

## Invariants
- Concatenation only (no minify). Page < 3.6 MB (lint_meta). Never deploy an unsplit build.
- `ALL_OPEN=true`, credits "Made with ❤ by Alex" / "3D models by Alex" (deploy.sh checks both).
- Every deploy prepends an `OD_CHANGELOG` entry (`src/10_core.js`).
- Coordinator deploys, then republishes the Beta artifact with ALL files listed in `out/<ver>/PUBLISH_FILES.txt` (km.js, models.js, tune.json, every models/*.js, every xc/*.js, music/*.mp3). Missing files broke garage cars (beta.158) and music before.
- Beta artifact: claude.ai/artifact/P6zT2b2SwfHYguRTtb67Ug (CLAUDE.md). Preview = same set from `out/<ver>-preview/`.

## Persistent chunk cache (fastload-r24g)
- Every lazy file (xc/*, models/*, models/{as,lx,xf,qa}.js, tune.json, music) and km.js load via `FST_js/FST_get/FST_json` (core in the page head, `src/02_data_json.html`; `src/10zf_fastload.js`): Cache API, else IndexedDB, else plain network; cache name `odfc-<FSTV>` (FSTV = version + content hash, set by build.sh); old versions deleted at idle; `?fc=0` off. Read-ahead (lazy chunk `src/98zq_fastload_ahead.js`): equipped car + next 3 + menu/city music. GO `perf/fastload`; measure `node tools/perf/fastload.js out/<ver>`. Not stored: index.html, models.js (sync tags). [HANDOFF](../../HANDOFF_fastload-r24g.md)

## Known bugs / history
- Deploy-side file loss: [../../HANDOFF_garage-cars-r22e35.md](../../HANDOFF_garage-cars-r22e35.md), [../../HANDOFF_coordinator_0e.md](../../HANDOFF_coordinator_0e.md).
- Cost per lane: [../../COST_LEDGER.md](../../COST_LEDGER.md). Old rules: [../../LESSONS_and_old_rules.md](../../LESSONS_and_old_rules.md).
Next: [tests-and-gates.md](tests-and-gates.md).
