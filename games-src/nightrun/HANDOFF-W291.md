# W291 phone flight (branch nr/W291-phone-flight from alex/brave-carson-rbpmlk), 31 Oct 2026. Not deployed. Verdict: GATES NOT MET (phone dodger 0/8, shooter 4/8). Readability fixes landed; the dodger gap is NOT a visibility problem.
Logs and shots (not committed): /tmp/w291/out, /tmp/w291/shots (container scratch).
## 1. What kills on phone (flight stage 1, 8 dodger seeds, STEPS=12, one browser; recorder in qa/gauntlet-flight.js, tab: hits[].K/E)
Before (build 3 commits of alex/brave-carson-rbpmlk tip): 142 lives lost = 114 in the wave phase, 28 at the boss (8 seeds, 0 clears). After my render changes + harness re-grab: 144 lost = 112 wave, 32 boss, 0 clears (same profile).
| cause (after run, 144 losses) | n |
|---|---|
| orb-type shot (kind unnamed, r 5-6, ~276 u/s) | 85 |
| needle shot (kind 'n', r 3.2, 306-386 u/s) | 22 (all in the 30-36 s swarm window) |
| nothing within 90 u (beam / area hit, not a tracked bullet) | 29 |
| charger body | 8 |
- Ship position at the hit: always the bottom 20 % of the field (world x 187-214; dodger bot holds x=200); across: middle third of the screen 114, left 21, right 9.
- Shot on screen before impact: 104 of 107 tracked bullets had been in the field >= 1.0 s (3 under 1 s). 50 of 107 first appeared inside the field, 57 entered from outside. So NO shot ambushed the ship with < 0.5 s warning: a spawn telegraph is not needed and was not added.
- When: wave losses cluster at 30-36 s (needle swarm) and 60-65 s (PEAK, 19 of 112), then 5-9 per 5 s; the boss phase has 32.
## 2. Changes (owners in brackets)
- Boss warning: 'WARNUNG' -> 'WARNING' (core/b.js boss entry, waves/stage1fun.js, render/calm.js compare); the chip is 17 css px bold on a 32 px band in red-pink, never below 16 px (render/calm.js CALM.draw).
- Hint line: not drawn on the portrait play field while a boss is up (hud/c.js drawHUDP). It sits at 92-112 px (top third) otherwise; never in the middle third.
- Enemy shots: I changed the orb colour in render/polish.js POL.EB from amber to the danger pink, built it and LOOKED (phone t61 shot): the orbs are STILL amber, so another layer paints them (lead: bulletart.js / ART.hue of fx-bullet-enemy); the edit was reverted, nothing changed for orb colour. Needles are >= 8 css px across on a phone (render/readable.js, r = max(b.r, 4.4 / css px per unit)); they were ~4.6 px.
- Harness: qa/gauntlet-flight.js records per-hit bullet kind/age/origin; NOCTL=1 skips controls; NODASH=1 skips dash; the finger re-grabs in the same tick at the frame edge (the W284 edge-lift artefact) - it did not change the phone dodger result (0/8 before and after).
- Not changed: field edges (W245/W249 exist), waves.js, menus/focus.js, any damage or spawn rule.
## 3. Hit box vs drawn body (measured from code)
Hit circle: 3 world units + the bullet radius (core/b.js: dd < b.r + 3), so ~8 units with a r5 orb. Drawn ship: sheet length 260 px x 0.173 x 1.6 (phone) = ~72 world units long. The white hitbox dot (readable.js dot, SET.hbox) marks the real spot. NOT enlarged: a body-sized box would make phone survival far worse; this is the owner's call (standard shooter convention is a small core).
## 4. Re-measure (STEPS=12 WALL=420, 390x763, CDP touch, FOCUS on, seeds 1-8)
| | before | after |
|---|---|---|
| phone dodger | 0/8 (this run; the brief says 1/8) | 0/8 |
| phone shooter | 5/8 per brief (not re-run before) | 4/8 (s1 2 deaths, s5 1, s6 0, s7 0 cleared) |
| PC dodger | 8/8 per brief | INCOMPLETE: s1 cleared, s2 lost all 4 lives; the rest not finished at the hard stop (see the line at the end if present) |
The PC s2 loss is unexplained: my changes are render-only, W283 showed outcomes vary with wall time between input and step. Treat PC as UNVERIFIED, re-run before merging.
Targets (dodger >= 40 %, shooter >= 60 %) NOT met.
## 5. Strict critic pass (game-look). Shots looked at: phone m2 (t29, empty field), phone m4 (t40), phone boss-time shot (shooter s4), PC m4 (t40). Only 5 of 8 stepped moments per device were taken and the warning/boss frames of the stepped script were not captured (the loop ended at ~61 s); the boss-time shots came from the bots. The needle size change was NOT seen in a shot (no needle on screen): UNVERIFIED. Orb colour: amber, same hue as engine fire and explosions.
Minimum per row (0-10): owner-art 7 | grayscale 5 (enemies dark green-grey on dark buildings) | silhouette 5 (all foes one helicopter shape, ship thin 20 px) | find-the-player 6 | bullets 5 (amber orbs read as fire) | clutter 7 | benchmark 4.
Fix per row below 7: grayscale/silhouette: add a light rim + value lift on enemies only (pure.js ink pass), ships need a wider shape; bullets: find the layer that paints the amber orb and make it the danger pink (see section 2); find-the-player: brighten the ship engine glow on phone; benchmark: art, not code (ART list needed).
## 6. Why the dodger still loses (the real finding)
Bullets are visible >= 1 s and the bot reads exact positions, yet phone dodger 0/8 vs PC 8/8 on the same simulation. Render changes cannot move a bot number. Open leads, in order: (a) PC dodger was 1 clear + 1 four-death loss + 1 clear after 3 deaths in the 3 seeds that finished (alone, one browser): PC is not 8/8 on this build either, so the gap may be partly noise or a build change before my branch; run PC on the untouched tip first. (a) touch input path in core/b.js (ship pull 520 u/s to a cumulative finger target vs 300 u/s keys: overshoot at 12-step decisions); (b) rotMode geometry: boss stops at x=690 vs 790 and enemies at x<=W-92*HK (less lead time), ebCap 18 vs 25; (c) the 30-36 s needle swarm and 60-65 s peak are the scripted kill windows (waves.js, W293 owns). NEXT (one task, sonnet): phone dodger with NODASH=1 and with a key-like input (pull cap 300) to split (a) from (b).
