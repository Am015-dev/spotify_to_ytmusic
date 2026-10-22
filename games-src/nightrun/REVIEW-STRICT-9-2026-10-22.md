# Nightrun strict ninth review (22 Oct 2026, 01:22-02:05 UTC)

Measured on `590a30c8` (page stamp `d9dfe8c608 · 2026-10-22 01:15 UTC`), a frozen copy of `games/mainhattan-nightrun` served by `python3 -m http.server`.
Headless Chromium, phones 390x763 and 375x553 (DPR 2, touch). 110 screenshots looked at by me (scratchpad only, not committed). No game code changed.
Caveat: headless software rendering runs the real loop at about 1/3 speed (60 s wall = 19-50 s game time); most stage shots use the test hooks (god mode, hand-stepped engine).
Audio was not re-measured this round: section 2 of review 8 stands until someone re-runs it. Same 4 personas, 13 lines, weights and scale as reviews 3-8.

## Headline
**HEADLINE 46.9 / 100** (46.3 before, **+0.6**). Mean of the two harshest: V 46.4 and R 47.4. Panel mean 48.2.
About 30 changes landed and the score barely moved, because most of them added **more things on top of the field** (captions, rule cards, marks, rings) instead of
taking things away. Real wins: the "placeholder" label is gone from the street run, the backdrop under play is darker and calmer (busyness p90 0.0043-0.0082, gate 0.010),
enemy bullets now carry a dark outline and pass the contrast gate everywhere, the hangar ship cards have real art, Flight School is one clear list of 22 drills,
and Legend no longer starts with more hull than Normal (5 = 5, checked in code). What a player sees in the first minute is still: a giant title banner over live fire,
a row of enemies parked under the score bar, white and green full-height beams nobody explained, captions that sit on enemies and on each other, and a ship that is just a ring and a flame for its first seconds.

## 1. What a player sees (shots quoted)
| Screen | Seen |
|---|---|
| HOME (np-00-a) | Clean, real backdrop art, 4 tiles. Still 3 info strips above the tiles (status, "Next:", STORY), build stamp shown, red dot on TRAINING. PLAY subtitle wraps "Stage 1 · FIRST RUN · / ARCADE". |
| First 60 s, new player (np-03..60-a/b) | PLAY goes straight into stage 1: good (no 25 s of story cards any more). At game 1.7 s the title banner "1 · FIRST RUN / Deliver the data. Stay alive." covers the middle 25% of the field while 5 enemies already fire (np-03-a). Ship sprite missing at start: only a grey ring, a dot and a pink flame (np-03-a, school-shoot-0-b). Captions come one per few seconds: "PINK RING ON AN ENEMY = it attacks soon", "RINGS ON YOUR SHIP: dash when they meet = PERFECT", "NUMBER ON A BUTTON = charges left" (no number is visible on any button), "CHAIN: pass close to bullets..." printed **on top of** "KEEP MOVING" and a second caption = unreadable garble (np-20-a); "CHAIN" on top of "PERFECT" (np-25-b). A player who does not move dies at ~30 s game time on 375x553 (np-40-b); the next tap landed in HANGAR > UPGRADES with "Need 7 more" on every card: the first thing after the first death is a shop you cannot afford. |
| Stage 1 at 10-20 s (np-20-a) | 7 enemies in a row at the very top, half under the score / hull band; 3 full-height translucent white columns plus a red full-height line through the ship; "+206" score pop-ups; 18 enemy bullets. This is the stage meant to teach. |
| Stages 3 / 6 / 10 / 14 / 20 (st*-a/b) | Title banner over the field on every stage start (st10-early-a "10 · EISERNER STEG", st14-early-b "14 · FLOTTE", st20-early-a "20 · SIGNAL BOX"), each with live bullets crossing it. "MARK AT THE TOP EDGE = danger comes in there" caption drawn on top of enemies (st20-early-a, leg10-early-a). St 3 mid: two unexplained circles (green ring with a line, purple double ring ~120 css px), 3 red ">" flank chevrons, score 00000000 at 28 s (st3-mid-a). St 6 late (375x553): a ~10 css px **solid white full-height beam**, a green full-height lane with a teal wash, two columns of grey ">" chevrons, no enemy visible (st6-late-b). St 10 late (375x553): enemy formation sits inside the HUD band (y < 100 css px), red full-height line, two pink dashed lanes with ">" triangles, a green column: 5 overlays, 0 words (st10-late-b). Small pink vertical bars beside enemies (st14-early-b). |
| Legend st 10 (leg10-*) | Same banner, same caption, plus 4 cyan laser spokes from a turret. Looks busier than Normal at the start, the same after 25 s (8 vs 2 enemy bullets on screen at t 26-28 s). |
| Boss / endless (end-w10-a, boss8-*) | Endless wave-1 boss: "ARMOUR HOLDS" label, "NEXT WAVE" text drawn across the boss, a large teal outlined rectangle on the right with no label, "TAP: use SLOW now" chip, a 4th button SLOW appears. **The endless run never left wave 0**: a centred auto-firing ship (god mode) met the boss at 81 s and after 519 s the boss had lost 48 of 364 hp. A player who does not know the armour rule is stuck forever; there is no fail-safe. The scripted stage-8 boss did not spawn in my run (bossNow hook), so stage-boss feel is not re-scored. |
| Flight School (school-*) | List is good (22 drills, NEXT DRILL on top). In a drill: "Standing still is dangerous!", "DEMO 2", AGAIN, SKIP and SKIP DEMO = 3 skip-like buttons at once (school-dodge-6-a). The shoot drill on 375x553 plays the district banner "BANKENVIERTEL" clipped at the left edge across the drill (school-shoot-0-b). The demo counter climbs (DEMO 7 after 6 s). |
| Street Run (street-*-a) | Label gone, hero sprite and drone sprite are real art. Backdrop is still flat purple rectangles; an enemy sits cut off at the left edge; no visible shots although the bot fires; bottom 30% is the control pad. |
| Hangar (hangar-*, missions-a) | 6 tabs now (was 10): better. Cards have real ship art. Currency: header cyan ♦, RECOMMENDED yellow ♦, every BUY a purple hex gem: 3 glyphs for one currency; settings header "2.400", hangar "2400". Forge: weapon icon still a pink "PU" disc; inventory cells "SLOT 2", "NO CORE", "NO" (clipped word). |
| Settings (settings-a) | DATA tab clipped at the right edge again; 127 buttons/inputs in the panel; HUD defaults MINIMAL (good). |
| 375x553 | DASH / EMP / pause sit in a column right of a narrowed field; captions and banners keep the 390 px layout and clip (school-shoot-0-b). |

## 2. Orchestrator's claims, verified
| Claim | Verdict |
|---|---|
| Title banner covers the middle of the field during action | **TRUE**, every stage start, both phones (st10-early-a, st14-early-b). `c.js` L60-66 draws it at H/2-58, 96 px tall, 54 px font; `CALM.small` does not apply to stage titles. |
| "BUBBLE SHIELD" / "READY" overlap at the ship | Not seen in my frames; **the same bug is real** with other words: CHAIN + KEEP MOVING + a caption garbled (np-20-a), CHAIN + PERFECT (np-25-b). One label queue at the ship is missing. |
| Enemies spawn hidden under the top score bar | **TRUE** (np-20-a, st10-late-b, st14-early-b): rows park at y 30-100 css px under the 70 px HUD band. |
| Enemy bullet contrast stage 10 worst-10% ~1.9:1 | **Not reproduced by the gate**: legible-test (hand-stepped, 3 frames) gives st 10 worst-10% 5.50, st 14 16.1, st 20 12.1, boss 7.4, endless 10 16.2; all PASS. Bullets read well in my shots (orange core, dark outline). The 1.9 likely came from live frames with beams / washes behind the bullet (st6-late-b, st10-late-b): the gate does not render those layers. Enemies are the weak part: boss-scene enemy median 3.50, endless 10 p25 2.89, st 20 p25 1.34. |
| Pink bars and sideways labels beside enemies | Pink bars **TRUE** (st14-early-b); small white "<" ticks beside most enemies (np-10-a) unexplained. |
| Street Run backdrop flat placeholder blocks | **TRUE** (street-0-a, street-20-a). Asset item, see the end. |

## 3. Scores (same lines, weights and scale; first 30 min / hour 3)
| # | Line | W | V | R | M | P |
|---|---|---|---|---|---|---|
| 1 | Core feel | 14 | 5.2/4.6 | 5.2/4.6 | 5.6/5.1 | 5.6/5.1 |
| 2 | Variety | 16 | 6.0/5.5 | 6.3/5.8 | 6.5/6.3 | 6.3/6.0 |
| 3 | Bosses | 8 | 4.6/4.0 | 4.6/4.0 | 5.0/4.5 | 5.0/4.5 |
| 4 | Difficulty | 10 | 5.0/4.4 | 5.2/4.6 | 5.3/4.7 | 5.2/4.6 |
| 5 | Build depth | 8 | 4.6/3.8 | 4.5/3.6 | 5.0/4.0 | 4.8/3.8 |
| 6 | Music / beat | 8 | 4.0/3.5 | 3.8/3.5 | 4.3/3.8 | 4.3/3.8 |
| 7 | Readability | 8 | 4.6/4.2 | 4.8/4.3 | 4.8/4.3 | 4.8/4.3 |
| 8 | Audio (not re-measured) | 4 | 2/2 | 2/2 | 2.5/2 | 3/2 |
| 9 | Onboarding | 6 | 5.4 | 5.4 | 5.2 | 5.6 |
| 10 | Progression | 8 | 5.0/4.2 | 5.0/4.0 | 5.2/4.3 | 5.0/4.0 |
| 11 | On-foot | 3 | 3.8/3.3 | 3.8/3.3 | 4.0/3.5 | 3.5/3.0 |
| 12 | Touch | 5 | 5.5 | 6.5 | 6.5 | 5.5 |
| 13 | Polish | 2 | 4.0/3.4 | 4.2/3.6 | 4.3/3.6 | 4.0/3.4 |
| | **Weighted 30 / h3** | | 48.9/43.9 | 50.0/44.8 | 52.4/47.6 | 51.4/46.1 |
| | **Reviewer** | | **46.4** | **47.4** | 50.0 | 48.8 |
- Up: onboarding (+0.6: no story wall, captions exist), readability (+0.3-0.6: calmer backdrop, outlined bullets), polish (placeholder label gone). Down: bosses (-0.4: endless boss that plain fire cannot break, NEXT WAVE drawn over it).
- V: "It tells me what the pink ring means while three white beams I was never told about cross my ship, and the stage name is in my face while I'm being shot."
- R: "Legend is fair now on hull, but the first boss in endless just stands there forever if I don't know the trick."
- M: "Hangar is finally 6 tabs. Three different gems for one currency."
- P: "Every fix added a layer. Count the overlays on st10-late-b: five, and not one word."

## 4. Defects (repro = shot / stage / time / phone)
| id | sev | defect | repro |
|---|---|---|---|
| E01 | S1 | Stage title banner (96 px band, 54 px font) over the field mid-action, 2-4 s | any stage start, st10-early-a, 2.5 s, both phones |
| E02 | S1 | Ship sprite not drawn at stage start: ring + dot + flame only | np-03-a (game 1.7 s), leg10-early-a, school-shoot-0-b |
| E03 | S1 | Full-height white beam / green lane / red line / teal wash with no caption | st6-late-b, st10-late-b, np-20-a (375x553 and 390x763) |
| E04 | S1 | Enemies park inside the HUD band (y < 100 css px), behind score / hull | np-20-a 10 s, st10-late-b 59 s, st14-early-b |
| E05 | S1 | Endless boss armour: plain fire does ~0.1 hp/s, wave counter stays 0 for 9+ min; no hint beyond "ARMOUR HOLDS" | endless, Normal, centred auto-fire, boss at 81 s |
| E06 | S2 | Ship labels stack: CHAIN / KEEP MOVING / caption garble; CHAIN / PERFECT | np-20-a 10 s, np-25-b |
| E07 | S2 | Captions drawn on top of enemies and action ("MARK AT THE TOP EDGE" on a formation) | st20-early-a, leg10-early-a 2.5 s |
| E08 | S2 | "NUMBER ON A BUTTON = charges left" while no number is visible on DASH / EMP | np-25-b, st3-mid-a |
| E09 | S2 | DASH / EMP buttons are icons with no words on 390x763 (the words exist in the DOM only on 375x553) | any stage, a vs b |
| E10 | S2 | Unexplained rings (green ring + line, purple double ring ~120 css px), grey and red ">" chevron rows | st3-mid-a, st6-late-b |
| E11 | S2 | "NEXT WAVE" drawn across the boss; unlabeled teal rectangle on the right | end-w10-a |
| E12 | S2 | First death leads to HANGAR > UPGRADES where every card says "Need 7 more" | new player, 375x553, death ~30 s, one tap |
| E13 | S2 | Drill screen: AGAIN + SKIP + SKIP DEMO at once; DEMO counter climbs; banner clipped | school-dodge-6-a, school-shoot-0-b |
| E14 | S2 | Three currency glyphs (cyan ♦, yellow ♦, purple hex) and two formats ("2.400" / "2400") | hangar-ships-a, missions-a, settings-a |
| E15 | S2 | Forge weapon icon still "PU" disc; inventory "NO CORE" / "NO" clipped | hangar-forge-b |
| E16 | S3 | Small pink vertical bars and white "<" ticks beside enemies, unexplained | st14-early-b, np-10-a |
| E17 | S3 | Settings DATA tab clipped at the right; 127 controls in the panel | settings-a |
| E18 | S3 | Score 00000000 at 28 s on stage 3 with auto-fire (no kills credited or shown) | st3-mid-a |
| E19 | S3 | HOME: 3 info strips, build stamp, PLAY subtitle orphan "ARCADE" | np-00-a |
| E20 | S3 | Street run: flat blocks, enemy cut off at the left edge, no visible shots | street-20-a |
| E21 | S3 | Enemy contrast: boss scene median 3.50, endless 10 p25 2.89, st 20 p25 1.34 | legible-test default look |
| E22 | S4 | stage-8 `bossNow` hook did not bring the boss within 23 s (test hook only) | shots.js boss scene |

## 5. Ranked top-15 fixes
| # | Problem | Fix | Measurable gate | Owner file (WHERE.md) | Size | Tier |
|---|---|---|---|---|---|---|
| 1 | E01 title banner over action | Stage title to the top band as a one-line chip (<= 28 px tall) for 2 s, or show it on a pre-stage card before enemies spawn | no banner pixels in the middle 60% of the field while `G.en.length>0`; hud-cover style test | c.js L60-66 (banner), calm.js `CALM.small` | S | Sonnet |
| 2 | E03/E10/E16 unexplained overlays | Inventory every overlay drawn in a stage (beams, lanes, rings, chevrons, bars, ticks); each gets a caption on first show or is removed; white beam max 60% alpha, tinted | overlay-inventory test: 0 overlay kinds without a caption id; max white-pixel column <= 4 css px | readable.js, flankers.js, calm.js, explain.js | M | Opus |
| 3 | E04 enemies under HUD | Clamp formation rest y below the HUD band (>= band + enemy r) on every phone | 0 enemies with y-r < band for > 0.5 s across st 1-20 sweep | formations.js `fmSide`, layout.js | S | Sonnet |
| 4 | E05 endless boss stall | Armour breaks on plain fire after N s (soft timer) or a caption names the answer the first time ("DASH THROUGH / beat shots break armour"); endless boss max 90 s | centred auto-fire bot clears endless boss in <= 120 s; endless reaches wave 10 with the human bot | armour.js `B2X`, endramp.js | M | Sonnet |
| 5 | E06/E07 label pile-up | One label queue near the ship (one at a time, 0.8 s min gap); captions placed in free space away from enemies and bullets | 0 text boxes overlapping each other or an enemy rect in 60 s of st 1, 3, 10 | explain.js, fun.js, h.js | M | Sonnet |
| 6 | E02 invisible ship at start | Draw the ship sprite from frame 1 (no fade-in from nothing) | ship sprite alpha >= 0.9 at t = 0.1 s, st 1 and drills | art.js (ship draw), sprites | S | Haiku |
| 7 | E09/E08 buttons without words | Word labels under DASH / EMP / SLOW on every phone, charge number visible, or drop the caption | ui-audit: every in-stage button has visible text; caption only if number shown | h.js / layout.js (buttons), explain.js | S | Haiku |
| 8 | E12 death leads to a shop you cannot afford | After a first-session death: RETRY big, hangar only when something is affordable | new-player script: after death, first visible primary button = RETRY | hub.js, reward.js | S | Haiku |
| 9 | E11 boss text clutter | No wave text while a boss is up; label or remove the teal rectangle | 0 non-boss text over the boss rect | bossvis.js `BV.over`, h.js | S | Haiku |
| 10 | E21 enemy contrast weak | Light rim on enemies on dark districts; boss-scene enemy median >= 4.5 | legible-test enemy median >= 4.5 every scene, p25 >= 3 | legible.js `LGB`, foeart.js | M | Sonnet |
| 11 | E14 currency glyphs | One glyph (one colour) and one number format everywhere | text scan: 1 currency glyph, no "2.400" style | garage.js, abup.js, settings (ret.js) | S | Haiku |
| 12 | E13 drill buttons | Drill bar: AGAIN + SKIP only; demo plays once; no district banner in drills | school-full-test + 1 shot check of button count <= 2 | tut.js, schoolfull.js | S | Haiku |
| 13 | E15 forge placeholders | Use existing weapon icons for the forge cells; fix clipped cell labels | 0 "PU" text in forge DOM; no clipped label (scrollWidth > clientWidth) | forgeui.js `FGU`, inventory.js | S | Haiku |
| 14 | E17/E19 menu leftovers | DATA tab fits at 375; HOME: one info strip, stamp in PROFILE; PLAY subtitle one line | ui-align-test at 375 and 390; no tab overflow | title.js, hub.js, settings part | S | Haiku |
| 15 | Audio carry-over (review 8 D01-D04) | Re-measure first; if still muffled / ducked / ticking, apply review 8 fixes 1-3 | review 8 audio table: SFX - music RMS <= -6 dB, ducks <= 5 / 40 s | a.js, layers / sting parts | M | Sonnet |

## Assets for the owner (separate, not code)
- Street Run: sky + street backgrounds (3 layers per section) to replace the flat purple blocks; HUD panel frame; Warden arena.
- Forge / hybrid weapon icons (24 hybrids) to replace the "PU" disc.
- Optional: per-district clean play backdrops (already dimmed; art would let us drop the dim).
- Sound pack items from review 8 (soft beat shot, 3-4 hit variants, quiet pickup, 1-2 booms).

## Reproduce
Scratchpad scripts (not committed): `shots.js` (scenes newplayer, stages, legend, boss, endless, street, school, menus; `ONLY=` / `VP=a|b`), `q.js` (hull per difficulty, endless boss timer).
Contrast: `NODE_PATH=$(npm root -g) node games-src/nightrun/legible-test.js <frozen index.html>` (ALL PASS, numbers above). Tests run one at a time.
