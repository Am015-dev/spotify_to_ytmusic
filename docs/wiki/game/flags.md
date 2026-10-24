# Feature flags
Inventory and decisions live in [../../FLAGS.md](../../FLAGS.md); do not copy the table.

## How flags work
- `OD_FLAG('name')` (`src/10_core.js`) reads `?name=1`; `OD_FLAG('cl.key')` reads `?cl=key[,key]`. `?cl=off` / `?name=0` always wins.
- `OD_PREVIEW=true` (set by `tools/build.sh <ver> --preview`) turns every default-OFF flag ON, so Alex plays new work the same day (CLAUDE.md rule 11). A new default-OFF flag MUST go through `OD_FLAG`.
- A default-OFF flag lives at most 1 day, then ships ON or is deleted. Shipped-ON features keep a kill switch.

## Current flags (see FLAGS.md for state)
`?cl=core`, `?cl=studs`, `?cl=smash` (`src/99cl_loop.js`, `src/99cl_studs.js`), `?gloss` (`src/98gc_glossy.js`, ON), `?xf=0` kill switch, `?life=0` kill switch, `?proto=1` (`src/98pr_proto.js`), `?soab` (pending delete), `?test=`, `?lowmem=auto`, `?fast=1` (test build only).

## Known issues
- Flags that failed two lanes are deleted, not parked (climb, t9e, bx): [../../HANDOFF_let-cars-climb-r22e17.md](../../HANDOFF_let-cars-climb-r22e17.md), [../../HANDOFF_preview-flags-r22e28.md](../../HANDOFF_preview-flags-r22e28.md).
See [build-and-deploy.md](build-and-deploy.md).
