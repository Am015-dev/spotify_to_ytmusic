# M3 (chapters 3 + 4 + Kaiser finale) — merge anchors

Base: `base.html` of `alex/overdrive-devkit` (already contains m1.js). Patch order: `pM31.py` (only patch). Rebuild: `./reapply.sh pM31.py` → `REAPPLY_OK`.

## Exact-string replacements (R(old,new))
| # | patch | anchor (old string, exact) | what happens |
|---|---|---|---|
| 1 | pM31.py | `window.__mho={` | the whole of `m3.js` is inserted immediately **before** this string (after m1.js, which it depends on). Nothing else changes. |

No HTML/CSS anchors: the touch 🚀 button `#tM3` is created at runtime inside `#touch` (class `tbtn`).

## Runtime re-bindings (no text anchors; they depend on these names staying reassignable `function`/`let` bindings)
m3.js wraps, and falls straight through for everything that is not an M3 mission:
`M1_marks, M1_next, M1_done, M1_rivalStep, M1_clear, M1_restore, M1_goon, M1_setup, M1_hooks, M1_stage, M1_hint` (m1.js) and
`qvTgt, qvHud, qvMiniQ, qvLand, qvTick` (base, already wrapped by m1.js; m3 wraps on top).
It adds keys to m1's objects: `M1_DEF` (9 missions), `M1_SC` (5 scenes), `M1_END` (duel3, duel4, kaiser), `M1_WHO` (Ferreira, Çelik, Brandt,
Nakamura, Weber, police radio), `M1_GK` (`police`, `kaiser` goon kinds).

## Save state / gate (contract with the chapter-2 module)
- Gate: `M1.s.M2_done` (the `mho_m1` per-slot, per-city store). Chapter 2 must set it truthy when chapter 2 is complete and call `M1_save()`.
- M3 progress lives in `M1.s.M3 = {step 0..9, hop, shock, crown, intro}`.
- Rewards write `mho_flags`: FERREIRA, ÇELIK (duel 3), BRANDT, NAKAMURA (duel 4), SKYCUP (finale; base shows its epilogue + Kaiser-crown part).
- Dev unlock: `__m3.unlock()` or `?m3dev` in the page URL (sets `M2_done`, `wpn`, `step≥4`).

New globals: `M3`, `M3_*`, `window.__m3` (also `__mho.m3`). Key: **G** = Rocket Hop (unused by base/m1).
