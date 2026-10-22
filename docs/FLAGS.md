# Feature flags (default-OFF inventory, 2026-10-22, lane preview-flags-r22e28)

Rule 11: a default-OFF flag lives at most 1 day, then it ships ON or is deleted. Shipped-ON features keep their `?x=0` kill switch.

## Preview build
`tools/build.sh <ver> --preview` writes `out/<ver>-preview/` with `const OD_PREVIEW=true` (src/10_core.js). Every flag resolved through `OD_FLAG('name')` is ON there; an explicit `?name=0` (or `?cl=off`) still wins. It prints the list of flags it turned on (now: `cl.core cl.studs gloss td`). A new default-OFF flag MUST be read through `OD_FLAG('name')` (or `OD_FLAG('cl.key')` for `?cl=key`) so the preview picks it up.
Publishing the preview is the coordinator's job (same chunks as the normal Beta artifact, from `out/<ver>-preview/`).

## Table

| Flag | Added | Default | Last result (doc) | Decision |
|---|---|---|---|---|
| `?clb` climb window | 2026-10-22 r22e17 | OFF | r22e18: slides -24 % (bar -40 %), hill+offroad slides worse (0.14 -> 0.35/min), yJump 2 -> 29. Two lanes failed (HANDOFF_let-cars-climb-r22e17, HANDOFF_climb-r2-r22e18) | **DELETED** (code, GO clb/climb, ORDER entry). Target needs a design plan before another try. |
| `?t9e` Athens bowl ease | 2026-10-22 r22e14 | OFF | r22e16: trap sum -36 % from one seed, `invisible` worse (8.5 vs 6.7/h). Two lanes failed | **DELETED** (TR9_EASE/EK/EON) |
| `?bx` bowl rocking exit | 2026-10-22 r22e14 | OFF | same A/B as t9e | **DELETED** (ESC.rock.bx) |
| `?t8f` hill fade near roads | terr-8 (2026-10) | OFF | HANDOFF_terr8: pits 96 -> 95, ath steep worse with a blend; nobody owns it | **DELETED** (TR8_fadeRoads + call) |
| `?sfj` speed-streak shimmer | speed-boost-feel r22e4 | OFF | never measured; re-composites the layer every other frame (phone cost) | **DELETED** (SF.jit) |
| `?gloss` glossy car paint | glossy-cars r22e5 / r22e10 | OFF | r22e10: phone hue +1.0 deg, sat -2.5 %, val +2.3 %; same programs, no extra draw calls; no review pass recorded yet | **ON-candidate, needs review** (in the preview) |
| `?cl=core` Frankfurt core zone | cl-L1 (2026-10-22) | OFF | HANDOFF_cl-L1: props 2.4x denser inside, 10 cars within 150 m of spawn; x1.5 prop add not done | **ON-candidate, needs review** (in the preview) |
| `?cl=studs` stud trail | cl-L3 (2026-10-22) | OFF | HANDOFF_cl-L3: 638 studs collected, gap 8 m, counter 14 px; trails thin head-on | **ON-candidate, needs review** (in the preview) |
| `?td=1` Takedown race | raceG (2026-10) | OFF | HANDOFF_raceG: built + GO; waits for a release reviewer to play it | **ON-candidate, needs review** (in the preview) |
| `?cl=smash` | cl-L2 / smash-look r22e22 | **ON** in Frankfurt | shipped beta.154 | shipped ON, kill switch `?cl=nosmash` / `?cl=off` |
| `?soab=1` typed-column HUB.bld | ios-r18w (2026-10-20) | OFF | HANDOFF_perf: no heap gain (171.9 vs 175.7 MB; old rows still alive) | **DELETE, pending**: module 98so_bld + GO perf/bld-soa in 99c7_rev5fix; own lane, no owner |
| `?t6m=1` terr-6 grass fit | terr-6 / terr-7 | OFF | HANDOFF_terr7: boot regression, gap/pit GOs failed | **DELETE, pending**: tied to the QTC v5/v6 dumps (needs a QTC re-dump), own lane |
| `?t7g=0` kill switch | terr-7 | ON (kill switch) | shipped | keep as kill switch |
| `?r17pose`, `?r17m` start-life pose / report | perf r17 | OFF | HANDOFF_perf: pose cannot see the unstreamed tower | **DELETE, pending**: 98bp_warmall + 2 GOs |
| `?bhs=1` boot split | perf-r14c | OFF | HANDOFF_perf / REVIEW_2K_19-20: boot-time experiment, no owner | **DELETE, pending**: 6 modules |
| `?clped=1`, `?clnosp=1` | cl-L1 | OFF | test/debug toggles under `?cl=core` | keep (not features; only matter under `cl=core`) |
| debug toggles `dbg`, `lkdiag`, `gfxt`, `soabdbg`, `fps`, `lazytr`, `warm`, `intro`, `fs`, `xcall`, `simp`, `rvl`, `iosmem`, `gov`, `yld`, `c3`, `cvf`, `drevhang`, `tune` | various | OFF / test | diagnostics or shipped-ON kill switches | out of scope: not features, not in the preview |

"DELETE, pending" means the decision is made but the removal touches 2+ modules, a QTC dump or a GO, so it is its own lane rather than part of this one; it must not wait past 2026-10-23.
KEEP-1-DAY: none. No lane is running on a default-OFF flag right now.
