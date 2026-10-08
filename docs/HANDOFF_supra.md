# HANDOFF supra (alex/od-supra, PR #72 draft → alex/od-bigcars), v88k
- Code: src/98su_supra.js (ORDER after 98bc_bigcars.js). SU_car(o) generator; SU_T 7 templates (fam 1 = 77260 + 3 variations, fam 2 = tuner friends); wLG gold-rim wheel; SU_rows() groups RIDES STREET (default sort/filter only).
- v88k OD_CHANGELOG entry + 5 OD_CHECKLIST items (su-*). No new TUNE knobs.
- Research: docs/research/SUPRA.md (booklet 6649353.pdf read from rendered pages; sets + URLs).
- Shots: su/gar (garage ×7 + build), su/drive (Frankfurt, side, tyres). Gap 0.03 m, 0 errors. Look-dev: `node su/thumbs.js <url> su/th [ids]`.
- REVIEW sent 9bb7f93a (2026-10-08). After PASS: merge CURRENT live (garux v88j may be live → keep v88k entry on top), tools/build.sh v88k, git add -f out/v88k (+tune.json, music), DEPLOY msg to coordinator session_017iH3DB4VyxwKSdMwsco4Ut.

## 2026-10-08 18:45 UTC: v88k DONE
- Reviewer PASS (9bb7f93a). Live was still v88i (base = live byte for byte, checked). out/v88k built + pushed at 8e55f227; DEPLOY sent to the coordinator.
- Reviewer optional polish (do with the next car batch): dark sill under the doors (lime stripe makes the flank flat/busy), visible windscreen frame (77260 has an orange-framed screen), card names truncated ("Orange Street …").

## NEXT: v88l BUILD GUIDE (coordinator spec, Alex's own request)
Spec: ▶ BUILD GUIDE button in RIDES/BUILD for any template; plays the build step by step in the garage (1–4 parts per step, drop-in animation, parts callout, "12/48" counter);
controls ◀ ▶, ▶/❚❚ autoplay, ×1/×2, EXIT, buttons ≥44 px, never over the car at 852×393; "Build it yourself" mode = next part as a ghost, player places it in BUILD.
Works for every template; no stored order → derive bottom-up by layer. Checklist items, QUICK review, DEPLOY v88l.
Coordinator refs: study brick-viewer (Apache-2.0) + three.js LDrawLoader (MIT) for step parsing ("0 STEP"), step list, previous steps dimmed, per-step camera framing, slider UI;
LEGO Builder app UX (parts callout, new parts highlighted, rotate/zoom, counter). LDraw OMR / Rebrickable models only as reference (check licences); never ship the LDraw part library (3.6 MB cap).
Record what was reused + licences in docs/research/SUPRA.md and credits.
Design notes (not started):
- Data = LDraw MPD idea: a part list split by "0 STEP" → for us a template array [t,x,z,r,c,y] plus `A.steps=[end index of each step]` (a property on the array, so every consumer of the plain array stays unchanged).
  SU_car already emits parts in booklet order (chassis → wheels/arches → nose → flanks → cabin → rear deck → wing); add a `step()` call between groups. G9_sc / BC_* get the same markers.
- Fallback order for templates without steps (and for "My Build"): sort by y, then z (nose first), then x; group 1–4 parts per step by same type/colour/layer.
- Player: reuse GB_attach for each prefix of the part list (or toggle mesh visibility per part via userData.gbM); dim earlier steps (material opacity/colour mul), new parts drop from +1.5 m with ease-out; camera = GB_cam framing the step's bbox.
- Build-it-yourself: GB ghost (GB_.ghost) set to the next part's type/rot/colour at its cell; accept when GB_add lands the same t/x/z/r/y.
- Standing order after v88l: Speed-Champions batches of 2–3 cars per release (companion sets 77252, 77256, 77261, 77262 first), and make AI traffic + rivals use them.
