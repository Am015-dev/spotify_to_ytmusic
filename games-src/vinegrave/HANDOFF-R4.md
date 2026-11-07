# Vinegrave R4 fix (W365, 7 Nov 2026): REVIEW-R3 found -> fixed

Tested with the temporary art installed locally (temp-art.js -> webp in games/vinegrave/media, not committed).

| R3 item | Found | Fixed |
|---|---|---|
| Bug 1 / Top 1 (no art, initials) | Card faces showed 2-letter initials | Code-drawn card face: type colour frame, type glyph (coin item / compass artifact / travel icon starter / guardian Dread), full name, type ribbon (PC). No initials anywhere (hand, market, All cards thumbnails). Painted card/title art still owner work. |
| Bug 2 / Top 3 (Story loss) | Loss showed "Continue the story" | Story result: "Stage lost" banner, goal + reason, Try again (primary, records the loss and restarts the stage), Story map; win shows "Stage won!", stars animated, goals ticked, cast praise/taunt line. |
| Bug 3 (stage 1 too hard) | Easy rival beat a normal-level player | Stage 1 rival plays a gentler 'novice' level (more noise): normal-level player wins 84% (was 71% vs easy), 59 vs 24.5 avg. |
| Bug 4 / Top 2 (guardian card lingers) | Card stayed into the next turn | Card closes after 1.8 s, the turn waits 2.7 s, a tap closes it, and it is force-closed when your turn starts. |
| Top 2 (fun/juice) | Discovery/guardian felt like a ledger | Discovered ruin bursts with light; guardian wake: dimmed board, rotating rays, bigger portrait, board shake, deeper roar; Overcome: gold rays + fanfare; guardian stands big and pulsing on its ruin. Result banner + stars pop. |
| Bug 5 (toasts over ruins) | Toasts covered the top ruin row | Toasts sit over the dock header, never the board. |
| Bug 6 (grammar) | "You discovers", "1 points", "1 coins" | Conjugated "You discover/tame"; point/coin/compass singular in card text, labels and All cards. |
| Bug 7 (PC labels clipped) | "Ruin", "Cam" | Labels sit centred above their row. |
| Bug 8 (guardian over name) | Badge hid the ruin name | Name drawn above the guardian (PC); guardian centred and big on phone. |
| Bug 9 (Menu tabs overflow) | Accessibility chip overlapped | Section chips wrap. |
| Bug 10 (hint finger over card) | Finger covered cost and name | Finger points below the target. |
| Bug 11 (All cards thumbnails) | Icons through initials | Initials gone (new card face). |
| Bug 12 (-2 start) | Never explained | Guided round step 1 explains the two Dread cards (-1 each). |
| Bug 13 (header leaf overlap) | Leaf over "Stage" | Icon and stage text spaced. |
| Bug 14 (best null) | Story best never saved | Game records best per stage (vinegrave-camp-best) and writes it into gns-campaign-vinegrave after every finish (the shared Story code never sets best: orchestrator may fix in shell). |
| Bug 15 (tutor title/text) | Not confirmed on screen by the reviewer | NOT fixed: not reproduced in the time box; it lives in the shared tutor code (shell, off limits). |
| Title (audit F) | Two primary-looking buttons | Secondary renamed "Start a game" (skip the guided round). |

## Gate results
- build-all --quick vinegrave PASS; rules-test PASS (200 AI games); smoke phone + pc PASS (reached result, 0 errors).
- AI gate: Hard 96%, Normal 85% vs bot, PASS; Hard vs Normal head to head 80% (unchanged engine/AI apart from the new novice level).
- Story (real taps 390x763 + 844x390, clicks 1440x860): stage 1 loss -> "Stage lost" + Try again restarts stage 1, loss recorded; win -> stars shown = stars stored (3/3), best saved. 0 page errors.
- ui-audit (local server, art present), last run before the final CSS tweak: phone A0 B1 F0; phone-s A0 B6 F0; pc A14 F0 (A = 13px row labels / 11px ribbon, raised to 16px in the last commit, not re-audited).

## Remaining
- Re-run ui-audit after the last commit (pc A, phone-s B contrast on "Overcome"/"Master volume" and busy card-name backgrounds).
- Stage 2 not re-played this round (engine unchanged; reviewer won it); Quick full game covered by smoke only.
- Painted art (cards, ruins, title, guardians) is owner work; tutor bubble sync (bug 15) is shell work.
