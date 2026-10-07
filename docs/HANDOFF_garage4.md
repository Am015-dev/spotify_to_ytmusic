# Garage worker 4 handoff (2026-10-07)

Brief: Alex's "garage not like 2K Drive / paint does not work / no build from a wireframe / no groups, perks or profile". Plan: `docs/GARAGE2K_PLAN.md`.
Coordinator: session_017iH3DB4VyxwKSdMwsco4Ut. Reviewer: session_01Y6FYerWwxv43FuKUcaUT4v. Draft PR #52 (tracking only).

## Branches
- `alex/od-garage4` (repo dir): **slice 1 = paint fix**. New module `src/98g_garage_paint.js` (ORDER after 98_garage_driver.js).
  - Root cause: the PAINT tab only set the old ship colours `d.a/b/c`, but LEGO cars render the brick colours.
  - Fix: the BODY/ACCENT/TRIM roles = the 1st/2nd/3rd most-used brick colours (frame black last, wheels skipped). The street bricks are tagged `b.pr` and painted in place. The 4×4/boat recolour comes through a `GAR_apply` wrapper from `mho_gar.pa[set]`. `CR_VC` 'gar|' keys are cleared on change.
  - Test: `t4/paint2.js <url> <out> [desk]` (no `?fast=1`: fast mode never redraws the garage canvas).
  - Shots are in `docs/shots/garage4_paint/`. REVIEW sent for aff8449 (QUICK). Next step on PASS: changelog → `out/<ver>` → DEPLOY.
- `alex/od-garage4-s2` (worktree `/home/user/odg4s2`, served on :8767): **slices 2 and 3**, stacked on slice 1. Not reviewed yet.
  - `src/98p_garage_perks.js`:
    - 2K rarity names (Neat/Cool/Awesome/Super Awesome) and vehicle groups on the set cards.
    - A PERKS row in RIDES with 1–3 slots (same `mho_perks` store and rules as the pause card).
    - New perks Tank Mode (lvl 3: hull ×1.3, top −3 %) and Glass Cannon (lvl 14: top +4 %, hull ×0.8), applied in race through a `setupRace` wrapper. Verified with `t4/pkrace.js`.
    - Garage text is ≥ 12 px.
  - `src/98q_profile.js`:
    - Extends the existing pause-menu `profileOpen`: portrait, VEHICLES card (rarity, owned, upgrades), PERKS slots plus the next unlock, and a COLLECTION grid.
    - Adds 👤 PROFILE to the title `#topBtns`.
    - Hides the `#odNew` bubble while the garage or profile is open (it covered the phone garage tabs).
  - Tests: `t4/perks.js`, `t4/prof.js` (`XP` is seeded by an init script). Shots were looked at; no errors.
  - Ship as the next version after slice 1: rebase onto slice 1's deploy commit, then QUICK review.

## Version
The graphics worker may take v87g: use the next free version and check `git log -1 origin/alex/brave-carson-rbpmlk -- games/mainhattan-overdrive/index.html` first.
Before DEPLOY: if live has moved, re-split src (`tools/split_src.py`), re-apply my modules (they are new files plus ORDER lines), and run `tools/build.sh <ver>`.

## Next: slice 4, build from a chassis (plan §4)
Add NEW BUILD in the BRICKS tab: type → chassis (8-wide SC: T6x16 + wL×4 + drvL; 6-wide classic; off-road wXL), a bare frame, a build-limit bar of 350 parts, the weight class, and a "MY BUILD" 5th set in RIDES.
Code to read: `92_garage_builder.js` (GB_PC, GB_scanBase, bp) and `94_garage_ui.js` (toolbar `#gbBkT`, the `bp` action = blank baseplate).
