# Vinegrave R4 fix (W365, 7 Nov 2026): REVIEW-R3 found -> fixed

Tested with the temporary art installed locally (temp-art.js -> webp in games/vinegrave/media, not committed).

| R3 item | Found | Fixed |
|---|---|---|
| Bug 1 / Top 1 (no art, initials) | Card faces showed 2-letter initials | Code-drawn card face: type colour frame, inner frame line, type glyph (coin item / compass artifact / travel icon starter / guardian Dread). PC also shows the type ribbon under the name row. Phone: the picture box (about 48x38) cannot hold a name at 13px without clipping, so it shows the glyph on the type colour; tapping opens the large card with name and text. No initials anywhere (hand, market, All cards thumbnails). Painted card/title art is still owner work. |
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

## Gate results (final build)
- build-all --quick vinegrave PASS; rules-test PASS (200 AI games); smoke phone + pc PASS (reached result, 0 errors).
- AI gate: Hard 96% (74.4 vs 30.6), Normal 85% vs bot, PASS; Hard vs Normal head to head: Hard wins 80% over 100 games (re-run).
- Story stage 1 (real taps 390x763 + 844x390, clicks 1440x860; moves played by script, result buttons tapped): loss -> "Stage lost" + goal + Try again restarts stage 1 and records the loss; win -> stars shown = stars stored (3/3), best score saved; 0 page errors (24/24 checks).
- Guardian moment at normal speed (phone): card shows with rays + shake + roar, closes after 1.7 s, it is your turn with the card gone.
- ui-audit (local server, temporary art present): phone A0 B0 C0 D0 E0 F0; pc A0 B0 C0 D0 E0 F0; phone-s A0 B3 C0 D0 E0 F0.
  The 3 phone-s B hits ("a hidden ruin..." in How to play, "Master volume" in Menu, Story map node "8") are text scrolled out of view inside
  a scrolling drawer/map at 375x553: the audit keeps any text whose rect crosses the viewport and clamps its box to the screen edge (spec lines 40/97),
  so it measures the drawer frame instead of the hidden text. The text itself is dark on cream (34,25,13 on 243,234,210, about 14:1). Fix belongs in the audit spec.

## Remaining
- phone-s B: audit-side (see above). Story stage 2 not replayed (engine unchanged; the reviewer won it).
- Painted art (cards, ruins, title, guardians) is owner work; tutor bubble sync (bug 15) and Story best:null are shell work.
