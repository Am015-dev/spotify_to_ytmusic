# REVIEW_2K_33: boot-r30e (330a5fb + 6bc9823)

2026-10-30 · lane review-r30-7 · built page `out/rv33` (tools/build.sh), phone profile (iPhone UA, 852x393 touch, dpr 2, software GL), real title -> PLAY tap. Old = same build with `?r17w=0&twgwbl=0`.
Probe: `tools/perf/boottoctl.js` copy + Athens seed (the gauntlet's own localStorage seed) + a 10 s post-control sampler (three.js program count, frame gaps, `WBC.busy`) + 1 s shots. Shots in `docs/shots/rev33/`.

## Verdicts
| # | point | verdict |
|---|---|---|
| 1a | 6x PLAY->control faster | **PASS**, but smaller than claimed in Frankfurt |
| 1b | full city at control and +5 s | **PASS** |
| b | 1-px prewarm still compiles every program the start view needs | **PASS** on the player path; probe item below |
| b' | perf/ios-reveal (trunk red) | **FAIL (trunk)**, see "what makes it green" |
| c | deferred far-street merge: pop-in, holes, long frame | **PASS** visually; the "after control" claim is inaccurate |
| d | picnic group between control and +5 s | **FAIL (pre-existing)**: pops in on old too, not this change |
| bar | boot/toControl <= 36 s at 6x, 1x <= 15 s | **YES, fair** (not too loose), with 3 conditions |

## 1. Boot A/B, 6x CPU, PLAY -> control (s)
| city | new (default) | old (`?r17w=0&twgwbl=0`) | median delta |
|---|---|---|---|
| fra | 87.7 · 75.4 · 76.5 · 73.9 (median 76.0) | 84.6 · 78.2 · 83.2 · 78.9 (median 81.1) | **-5.1 s (-6 %)** |
| ath | 105.4 · 114.2 · 110.2 (median 110.2) | 122.2 · 119.3 · 125.8 (median 122.2) | **-12.0 s (-10 %)** |

- Real, both cities. Frankfurt is -5 s, not the claimed -9 s (84.9 -> 75.8 compared a trunk run with a new run). The first new run (87.7 s) was slower than every old run: per-run noise is about ±5 s, so one run per side cannot show a 5 s cut.
- The gauntlet on this build: boot/toControl 76.0 s (worker: 74.8), ath/boot 108.9 s.
- Programs at control: 135 (fra) / 139 (ath) on both sides. Unchanged from control to +10 s in all 14 runs, so nothing linked after control on the player path.

## b. Shader links after reveal
- Player path (title -> PLAY): 0 new three.js programs from control to +10 s, new and old, 14/14 runs. The single 1-px scissored draw compiles what the full renders did.
- `tools/perf1/tIosReveal.js` (the rule-10 probe; it enters with `?test=<city>&lowmem=1&rvl=1`, no iPhone UA):

| run | fra links / long frames | ath links / long frames |
|---|---|---|
| new | 30 / 5 (27 at +0.39 s in a 2.3 s frame, **+3 at +2.7 s** in a 303 ms frame) | 31 / 3 (3.5 s frame) |
| old | 27 / 3 (2.9 s frame) | 31 / 3 (3.6 s frame) |

  Frankfurt has 3 extra links in a second long frame on the new side. Attribution (which flag) is in the addendum below.
- **Why the probe is red on trunk too:** in the probe's `?test=` entry `prew.ran=0, n=-1`: the curtain prewarm never ran. All 27-31 programs link in the first frame after reveal. On the player path (title -> PLAY), the same build links 0 after control. **To make it green:** either the probe boots like a player (title -> PLAY, iPhone UA, as `boottoctl.js` does) and counts links after `ldHide`, or the `?test=` boot runs the same `TWG_run` / `R17_warm` path. The first is a test-tool lane (Sonnet, about 30 min). Per rule 15 it is fixed or deleted; it must not stay red.

## c. Deferred far-street merge
- `WBC.busy` was already 1 at the first frame of control in all 4 sampled new runs, and still 1 at +10.5 s (6x). The merge does not start "after control". It starts on the existing 98wb `roamPost` hook (`setTimeout` 1.5 s), which fires while `TWG_run` still holds the curtain. It runs in 6 ms slices into the first 10+ s of driving (≈ 1.5 s+ on an iPhone by the 7.3x pairing). Old: merged before control (busy never seen). The handoff wording should say "started under the curtain, finished in-game".
- Long frames in the 10 s after control (lab 6x, every frame is 100-500 ms here): max per run, new fra 517 / 567 / 550 / **1450** (at +4.0 s), old fra 883 / 600 / 1000 / 850; new ath 500 / 983 / 900, old ath 567 / 950. No systematic regression. One 1.45 s frame in one new run.
- LOOKED at 0/1/2/3/5/10 s after control, new vs old, both cities (`grid_fra.jpg`, `grid_ath.jpg`: rows new/old, columns 0/2/5/10 s). Far streets identical, no holes, no visible swap when the merge lands. **PASS.**

## d. Picnic group
- `picnic_fra.jpg` (rows new/old, columns 0/1/2/3 s): the teacups ride and picnic blankets appear between 0 and 1 s after control **on both sides**, about 30 m away, in the right third of the view. A pop-in a player sees, but pre-existing (city life spawn), not from this commit. Needs its own bug lane: spawn the life vignettes in view under the curtain.
- Also seen: a dark green hedge block in front of the queue on the new side only (old shows the ice-cream cart). Probably the vignette's random pick; not reproduced in a second run (time).

## Bar: boot/toControl <= 36 s at 6x (+ <= 15 s at 1x)
**Data (Beta perf db, collection `perf`, `kind=="boot"`, 13 docs, 7 from Alex's iPhone):** Frankfurt `bootMs` (page open -> drivable) beta.133 12.3 / 11.8 · beta.142 12.8 / **31.6** · beta.147 12.3 · **beta.151 12.6** (one sample, portrait 402x742, dpr 3, in the Claude app iframe). Athens beta.142 17.5 · beta.147 16.0. No iPhone boot doc after beta.151 (2026-10-22).

**Re-measured here:** beta.151 (live commit ce32c021, `git archive`), the same probe: 6x PLAY->control **74.2 s**, page->drivable **91.9 s** (worker: 73.2 / 90.3). 1x 24.4 / 32.7 s. So the pairing reproduces: **lab 6x ≈ 7.3x the iPhone** on page->drivable; 1x ≈ 2.6x (worker 2.9x).

**Is beta.151 comparable to today?** For the 6x boot, yes: this build is 73.9-87.7 s vs beta.151 74.2 s. Trunk had regressed to ~85 s since beta.151, and this lane brings it back to about beta.151. At 1x this build is **slower** (32.1 vs 24.4 s, one run each; trunk 32-39 s per the handoff). Worth a look, but within the 1x noise the handoff reports.

**Caveats in the derivation:**
1. The ratio is taken on page->drivable (it includes the title load and Alex's pause on the title), but it is applied to PLAY->control. The iPhone's PLAY->control is shorter than 12.6 s, so the true PLAY->control ratio is ≥ 5.9 and probably ≥ 7.2: the lab title takes 15 s at 6x, i.e. about 2 s on the phone, plus Alex's pause. So 36 s is at most about 5 s on the phone. If anything, the bar is a little stricter than stated, not looser.
2. One iPhone sample (beta.151), Frankfurt only, portrait. The spread on other builds is 11.8-12.8 s, with one 31.6 s outlier. Athens is ~1.3x slower on the phone and was not paired.
3. The 1x companion: 15 s x (1/2.6) ≈ 5.8 s on the phone, a little looser than the 6x bar. 1x lab noise is ±3-7 s.

**Verdict: yes, the bar is fair, not too loose.** The old 8 s at 6x ≈ 1.1 s on a phone was not a real target. 36 s needs a 2.1x cut from today (76 s) and matches "drivable within 5 s of PLAY" on Alex's iPhone. Conditions:
- (i) The same 36 s bar for Athens (today 110 s), not a separate looser one.
- (ii) Re-pair on the next iPhone `boot` doc. Add `playMs` (PLAY tap -> drivable) to the beacon so the ratio is measured on the same span.
- (iii) 6x is the gate. Keep 1x <= 15 s as INFO until it is shown to be stable within ±2 s.

## Gates on this build
- `tools/build.sh rv33`: BUILD_OK, page 3.49 MB (under the 3.6 MB cap).
- `node tools/unit/run.js` (with three@0.164.1 installed, so all suites run): 0 FAIL, 5609 pass.
- `TAG=life1,xf1,terrain tools/gate.sh` (fra+ath, phone profile): **PASS 42/42**, errors 0.
- Gauntlet `rev33-boot-r30e` (docs/shots/gauntlet/rev33-boot-r30e/REPORT.md): **9 FAIL / 34**:
  - boot/toControl 76.0 s vs the 8 s bar in code. Against 36 s it would still FAIL.
  - drive/onStreet 78 % (script validity, so drive/hit rows are weak), drive/near 0.9, hit/contact 2/5 ("no car in front" x3).
  - drift/start 2/3 (1 not set up: script), drift/tap 1/3 slid, wall/glance 3/4 (29°: keep 3 %), wall/headon 0/2 (not set up: script).
  - mission/reach (no card in 90 s; also FAIL on world-r30d).
  - jsErrors 0 (REVIEW_2K_32's byteLength red did not reproduce in this run).
  - The worker's run had 7 FAIL. The two extra rows (drift/start, mission/reach) are drive-script rows that already flake on trunk. The diff only touches the boot path, so none of the drive rows come from this commit.

## Summary
330a5fb + 6bc9823: **PASS**. The cut is real (fra -5 s, ath -12 s at 6x, no new programs after control, no visible pop from the merge). Two corrections to the claims: Frankfurt saves 5 s, not 9; the merge starts under the curtain and finishes in-game, not "after control". Open items, not from this commit: the perf/ios-reveal probe path (fix the probe), the teacups/picnic pop-in at ~1 s after control (bug lane), and the 1x boot (24 -> 32 s since beta.151).

## Addendum: which flag adds the 3 Frankfurt reveal links (tIosReveal, fra, one run each)
- `?twgwbl=0` (merge under the curtain, new prewarm): 27 links, 3 long frames, all in the first frame.
- `?r17w=0` (old prewarm, merge deferred): 30 links, 5 long frames, **+3 at +3.0 s (477 ms frame)**.
- Default (both new): 27 / 3 on this rerun; 30 / 5 on the first run.

So the 1-px prewarm is clean. The **deferred far-street merge** sometimes links 3 programs (the merged far-street materials) inside the 3 s window, in a 300-480 ms lab frame (2 of 3 merge-deferred runs). On the player path it did not show (0 new programs, 14/14 runs). It is still a rule-10 regression in the probe metric. The fix is small: when `TWG.wbl` is on, compile the merged meshes' materials under the curtain (`renderer.compile` on one merged material per program, or `PREW_sc(1)` + one draw), or delay the 98wb hook until 3 s after `ldHide`. Until then, point 1/(c) is PASS with this item open (Sonnet, ~30 min).
