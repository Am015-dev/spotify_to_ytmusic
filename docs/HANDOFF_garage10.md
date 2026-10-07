# Garage worker 10 handoff (2026-10-07)

## Slice 1: branch alex/od-garage9 (PR #58), release v87t
- src = live v87s (alex/od-race15 85b52fc; verify_live IDENTICAL to brave-carson 32cc26f) merged with garage 9's slice 1.
- Two changes since a9d4911:
  - OD_CHANGELOG v87t entry.
  - `98v_garage_stack.js`: the phone toolbar uses `flex-wrap:nowrap`, and the brick chip shows a short weight tag ("🧱81/120 SH").
- Evidence:
  - Drive tyre gap 0.03 m ×4, ERR [] (`t4/g9/drive1/`, a9d4911 src).
  - g9fu PASS (`t4/g9/fu/`).
  - stack 12/12/12 on v87t with a 1-row toolbar (`t4/g9/stack_v87t/`).
  - Story load in 10 s (`t4/g9/ld_v87t.log`).
- Reviewer:
  - FAILs so far: the toolbar wrap and the stale base. Both are fixed in 63937c1.
  - QUICK re-review sent at 63937c1. Check whether the PASS has arrived.
  - On PASS: if live is still v87s (32cc26f), send the coordinator `DEPLOY alex/od-garage9 <head> out/v87t ...`.
  - If live moved: merge the new live src branch, bump the version and its changelog entry, then `tools/build.sh <ver>` and commit `out/<ver>/`.
- Split pair: `out/v87t/overdrive.html` + `km.js` (committed).

## Test notes (new)
- **`?fast=1` hangs story loading at 0% forever, also on live v87r** (`t4/g10ld.js`). Drive tests must run on the normal `local_dbg.html`; story load takes ~10 s and the whole nb drive ~15 min.
- `t4/nb.js` now waits up to 12 min for loading and logs `wait i state`.
- GitHub pushes returned 500 for ~10 min (16:50–17:05Z), then worked again. Retry before assuming it's broken.

## Slice 2: branch alex/od-garage9b (PR #59), NOT started by me beyond tooling
Read `docs/HANDOFF_garage9.md` (slice 2 section) first. Everything listed there is still to do.
- **Iteration tool (new):** `t4/g9iter.js` + the test-only hook `src/test/g9iter.js` (`window.__g9ev`, local builds only; pushed at 6a9adca).
  - `node t4/g9iter.js http://127.0.0.1:8766/wt_s2/local_dbg.html t4/g9/iter` boots once; wait for `ready.txt`.
  - Then write `t4/g9/iter/req.js` with an object literal, e.g. `{bianco:{A:G9_sc({...})}, beast:{A:CR_monster({...}),ry:2.35}}`.
  - It renders each variant at 640×400 into `t4/g9/iter/<name>.png` and writes `done.txt`.
  - Iterating needs no rebuild or reboot. Stop it with `touch t4/g9/iter/quit`.
  - Build wt_s2 first: `cd wt_s2 && tools/build.sh s2 --local`.
- **Weak templates, my read vs the refs** (`docs/shots/garage9/ref/`):
  - **Bianco (76908 Countach):** needs a low flat nose that slopes up to the screen, a lower roof (ws6 at y5, roof at y10 instead of 11), and wide angular rear haunches. Try `s31` (Slope 33 3×1) along the hood. Check the slope rotation first with a test render.
  - **Racer (31100):** the ref has a big grey engine block with an air scoop behind an open cockpit, a white centre hood stripe, twin round headlights, and a big white rear wing. Ours: the engine barely reads (`eng` at y4 is hidden by the side bricks). Raise `eng` to y5–6 and add a `scoop` on top; use a `wing` (not `spoiler`) in white.
  - **Beast (60402):** `CR_monster` reads as a pickup with a police bar.
    - Write a custom `G9_mt`: `wXL` wheels outside the body; body raised (chassis at y≥4); dark blue (#0d2a6b) with azure (#36aebf) panels; black roof plate; `roll` bar behind the cab; `scoop` on the hood; yellow `bigl` headlights; black `bump` front and back; azure `flame` on the flanks.
    - Drop the `bar`.
  - **All roofs:** the T6x2 at y11 sits like a "hat" over ws6. Try a flush roof (T6x3 at y11 that covers the screen top) or drop it to y10.
- Then: re-render all 9 (`t4/g9tpl.js`) → side-by-sides vs the refs → collection test `t4/g9col.js` (12 px text, ≤5 bar buttons) → drive with a template equipped (`nb.js`-style, tyre gap ≤0.05 m) and with an off-road form mixed in → REVIEW → merge the current live src → DEPLOY.
- Worktrees (git-excluded): `wt_s2/` (slice 2), `wt_old/` (v87r, 5c23efb), `wt_live/` (od-race15 = v87s). The server at :8766 serves the repo root.
