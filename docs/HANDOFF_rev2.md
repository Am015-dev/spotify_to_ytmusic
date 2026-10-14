# HANDOFF rev-2 → rev-3 (bug hunter, 2026-10-14)

Read docs/HANDOFF_rev1.md first (method, sweep tools, lanes). This adds what rev-2 learned.

## Done (pushed to alex/od-int2)
- 122f96ba: RV14_reset before every rv14 GO and after the hud/race checks; cam-refit restores your ride before its verdict (park-sit after rv14: PASS).
- e475c590: monkey STUCK → rv15/rv-stuck-* (8 GOs, spawn → real KeyW 3 s game time → ≥ 5 m, 16/16 PASS P+L). Root cause: LIFE set pieces + Athens AD props cut speed every
  contact frame at any angle → LIFE_slide / AD_hit slide on glancing hits. #roamPrompt in phone landscape → left column above TAP TAP.
- The portrait card/HUD/garage fixes are xform-1's (2dd177ee); rev-2's duplicates were dropped.

## Open (owners told or coordinator asked to forward: cam-2, life-2, art-3 sessions were INACTIVE)
- rv-cam-refit portrait intermittent: bus keeps 6.4 m (cam lane).
- rv-ath-fest fails after a drive in the same page: crates −0.31 m vs roof (art-4's check, roof from sibling bbox).
- rv-hill-spawn landscape Königstein tyre gap 0.07–0.16 m, intermittent (foot/terr).
- test-1 monkey never closes cards (RO.card.close does not exist) → false stuck at the Athens start (✈ Flights card blocks gas). test-1 told.
- Not started: sweep of the newest build (beta.51+). qa_rv3/fra|ath has a partial beta.42 sweep (stale).

## Tools added (tools/rv/)
- hot.py <build dir> <out dir>: hot copy (window.__hot) of any build. Build current src: tools/build.sh rvtest --local (7 s).
- probe.js <url> <city> <w> <h> <js file> [shot]: boot ?test=city&draw=0, run js (may be async) in module scope, print JSON, optional shot. Touch + mobile context.
- qaprobe.js <url> <city> <js>: same via window.__qa.ev; use __qa.step(n) for fixed-step sim (headless real time stalls: speed repeats between samples).
  After __qa.step, call __qa.live() before any screenshot or it is black.
- stuck.js <url> <city> <spots.json>: 8 headings per spot, fixed-step gas 3 s, nearest collider ahead.
- whystuck.js <url> <monkey.json>: replays every monkey stuck record; names the function that cut RO.v (setter trap on RO.v + stack). The best root-cause tool.

## Gotchas
- `kill $(pgrep -f X)` / pkill can kill your own shell (exit 144): find pids with `ps -eo pid,args | grep "^ *[0-9]* node rvd"`.
- The local alex/od-int2 in the main clone was stale (remote history rewritten); work detached in a worktree and push HEAD:alex/od-int2.
- Rebase conflicts in src/99c_checklist.js are always the one-line GO map: take HEAD's line, re-insert your entries after `const GO={`.
- Several lanes push the same rv fixes at once: fetch and check `git log origin/alex/od-int2 -- src/99rv_review.js` before starting a fix.
- src/99_api.js ends in </script> on purpose (new Function() check fails; build is the real check). lx code: node --check src/assets/lx/code.js.
- int-5 = session_01E4VvRXCv89qkKrh9WxLtxR builds from git automatically.
