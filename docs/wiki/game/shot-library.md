# Shot library
Full table: [../../shots/library/INDEX.md](../../shots/library/INDEX.md) (60 views, generated from `docs/shots/library/index.json`; never hand-edit the table).

## Rules
- One canonical view per ID: `docs/shots/library/<city>/<category>/<ID>.jpg`. ID = `<source>_<city>_<category>_<subject>_<nn>`; source = `ref2k` (LEGO 2K Drive reference) | `ours` | `sbs` (side by side); city = `fra` | `ath` | `any`.
- Re-shoot an existing ID with `node tools/shot.js <ID> <url>`; never invent a new name for the same view. Side-by-side builder: `tools/sideBySide.py`.
- Ours shots are 852x393 phone touch (unless the ID says portrait). Categories: environment, freeroam, race, boost, smash, cars, traffic, street-life, hud, popups, reveal, terrain.
- Visual lanes carry the reference image + a number to hit (CLAUDE.md rule 14). Each 2K-quality claim needs a side-by-side shot.
- References are small and for internal comparison only.

## Related
- Gap scores per view: [../../BENCH_2K.md](../../BENCH_2K.md). Golden compare: `tools/golden.js`, `docs/golden/`.
- Proto stretch shots: `docs/shots/proto1`. Reviews with shots: `docs/shots/rev<n>/`.
