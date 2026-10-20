# The Thornbound Throne: first-time player review (round 2)

Reviewer stance: someone who has never seen the original game, on a phone. Build tested: `games/thornbound/index.html` (loaded through Playwright, Google Fonts aborted).
Screenshots: `/tmp/claude-0/-home-user-spotify-to-ytmusic/5a36d2af-8697-5203-aeea-a0f2a3329615/scratchpad/review-tb/` (referred to below as `shots/`). 230 files; every file named below was opened and looked at.

Sessions played
* 390x763 touch (dpr 2): guided first game played to the end (4 rounds, won 17-11), normal 3-player game vs 2 computers for 2 rounds, hot-seat 2 players for 1 round, plus tapping "other things" (throne, rival chip, card pop-up, Rules).
* 375x553 touch: guided round 1. 844x390 touch: guided round 1+. 1366x768 mouse: guided round 1+.
* Console: 0 page errors / 0 console errors in every session. The problems are layout, flow and teaching, not crashes. No stuck state except the unreachable-option cases in P3.

Verdict in one line: the owner is right. The rules engine works; the front door does not teach, the phone layout gives decisions a 152 px window (92 px on a small phone), and the "guided" game is a tooltip layer over the full rulebook instead of a tutorial.

---

## (a) The first 5 minutes, step by step (390x763)

Time column = my running estimate of time since I pressed the first button (slow reading, as a newcomer).

| # | Screen / what it asks | What I understood | Problem | Shot |
|---|---|---|---|---|
| 0 | Title. One paragraph: "An area-control card game for 2 to 4. Win clashes in three regions, place your Herald where you will be, and hold the most Influence when the last round ends." Big gold "Guided first game", then "Play online (free, peer to peer)", then a setup form. | "Hold the most Influence" = points, I think. "Area-control", "Clashes", "Herald" mean nothing yet. | No story, no factions, 12+ buttons in one scroll (page is 1187 px tall in a 763 px window), "Start game" and "How to play" are below the fold. Online is the 2nd most prominent button for a person who has never played. | `shots/01-title.png`, `shots/40-title-bottom.png` |
| 1 (0:10) | Guided game opens. A 55%-of-screen map, then a tip card: "BIDS: Each round starts with a secret bid. Tap a hand card for its details, or use the suggested button. The strongest bid chooses first. Whatever Kingdom Card you take sits on your board with your bid card tucked under it." Buttons Got it / Hide tips. | Nothing. Which player am I? Why bid? "Kingdom Card" is not on screen anywhere. | The tip hides the decision AND the hand. Map has no labels for locations on phone, the score ring around the board is unlabeled numbers (0,5,10 ... 35). Header "1/4 Bids" is cryptic (round 1 of 4, step "Bids"). | `shots/02-guided-first.png` |
| 2 (0:25) | "CHOOSE YOUR BID. Pick one card from your hand as a secret bid. Its Strength is your bid. Suggestion: Rampart Engine (strength 5). [Bid Rampart Engine (5)] [Great Road]". Hand: 10, 8, 5, 5, 5, 2. | I think a bigger number wins something. I do NOT know what I am bidding FOR. The suggestion is 5 while I hold a 10 and an 8, with no reason. "Great Road" button: unknown. | Suggestion text is clipped by the button row (its bottom half is cut). No "why". | `shots/03-guided-bid.png` |
| 3 | Tapped the 10 card: large pop-up "HEIR OF THE LONG DUSK, 1 vote - 1 lore, Pathfinder, Resilient. Autumn: Rally (self)... If Eliminated it goes to your Discard Pile instead of the Lost Pile." "Suggested instead: Rampart Engine." | Nothing; every noun is jargon. | The pop-up covers the hand. The suggestion again has no reason. | `shots/04-card-popup.png` |
| 4 (0:50) | Bids revealed (nice screen): Heath 6, me 5, "Highest bid chooses first". | I lost the bid. I see I lost, I don't know what it costs me. | Does not say what winning gives. | `shots/05-after-bid.png` |
| 5 | Question: "SET EVERY OPPONENT'S BIDDING STRENGTH TO 0 THIS ROUND?" Buttons: "Use Crown's Edict (then it is Exhausted)" / "Keep it". | Complete confusion. A power I never heard of is offered after the bids are already revealed. The heading and the text below it say the same thing twice. | The first button is cut off at the dock edge; "Keep it" is not visible at all (dock shows 152 of 240 px). Tactics were never introduced. Taking the suggested option changed nothing visible. | `shots/06-edict.png` |
| 6 (1:20) | Tip "YOUR BID: Take a Kingdom Card from the Great Road, steal one a rival holds (you need a strictly higher bid than their occupying card) or take your card back." | Not understood ("occupying card"). | Another full-screen tip. | `shots/07-greatroad-or-next.png` |
| 7 | "...resolve your Bid (Rampart Engine, Strength 5). Suggestion: Take Monarch's Seal-Ring from the Great Road". One card shown with a 5-line text ("On acquire: increase Hand Size by 1; ... Active Heir, gain 1 influence"). A second Great Road card is below the fold. | I tap "Take (recommended)". | Auto-scroll hid the title; 2nd card unreachable without scrolling. No confirmation that I now own the card or where it lives. | `shots/08-greatroad.png` |
| 8 (2:00) | Tip "HERALDS... A bluff is fine: place it where you do NOT plan to win, or where you do." | The sentence says nothing. | The one hint about Herald is self-cancelling. | `shots/09-after-take.png` |
| 9 | "PLACE YOUR HERALD. Suggestion: Moss Altar." six buttons: Spire Court +1 The Uplands, etc. | I do not know what Herald, Moss Altar or "+1" are, or where those places are (map labels absent on phone). | The only reason given (pop-up after tapping): "No rival Herald is here yet, so your swing is a clean +1" and "move up to three cards to the bottom of your Deck" (the map's +2 Cairn Field is skipped without comment). It never says the Herald only pays if I WIN a clash there. | `shots/10-herald.png`, `shots/11-herald-popup.png` |
| 10 (2:40) | "PLAY A FACE-DOWN CARD: card 1 of 3, for The Uplands. Suggestion: Heir of the Long Dusk at The Uplands." Then 2 more screens. | I now guess: strongest total in a region wins it. Never stated. | The suggestion puts my 10 in The Uplands while my Herald is in The Sinks: the two suggestions contradict each other, and nothing explains that they should agree. The rival's three face-down cards appear instantly on the map (green backs). | `shots/13-place.png`, `shots/14-place2.png`, `shots/15-after-place.png` |
| 11 (3:30) | "YOUR ACTIONS: Spring actions. Suggestion: Place 2 Supporters on The Sinks. Send Supporters (+1 Strength each in a region; lost in Winter)", then rows of buttons 1..5 per region, a Tactic button ("Doctrine of Masonry: your Supporters give 2 Strength...") and "End my Spring actions" at the very bottom. | "Supporter" is a new word, never introduced. The menu is 429 px tall in a 152 px window. I see the first title and a row of half-cut cream stubs. | Buttons clipped to blank stubs. The suggested action has no button of its own: I must find the "2" in the Sinks row. After pressing the Tactic nothing on screen changed (silent). "End my Spring actions" is three scrolls away. | `shots/16-spring.png`, `shots/17b-spring-scroll1.png`, `shots/17c-spring-scroll2.png`, `shots/18-after-supp.png`, `shots/19-after-tactic.png` |
| 12 (4:30) | Spring ends and the game plays the whole clash resolution: clash markers I/II/III appear, my Uplands 10 beats Heath's 0 and I am already asked "CLAIM A LOCATION" with my influence already at 1 (Seal-Ring bonus, never announced). Tip "WINNING: ... A Herald there is a swing of +1 for you and -1 for each rival Herald." | "I won the first clash." I do not see the reveal before the choice. | The reveal card comes AFTER I pick the location (see 13). Dock text "Clash in The Uplands: Gilded (you) 10 = 10, Heath 0 = 0" is cryptic. | `shots/20-after-spring.png`, `shots/21-location.png` |
| 13 | Pick "Thornwild: +1 and journey with one card that is Active or in Hand" (suggested, no reason). Next question "Journey with one Active or hand card?" with a heading that shows only "CARD?" and the first option cut to a 2 px sliver. Suggestion "Journey with Pasture Lancers (+1 Lore)". | I'm asked to discard a card with no idea what it buys. | The dock text says nothing about the card being lost for the game ("goes to the Lost Pile" appears only in the Autumn menu text). No explanation of "Lore". A 5-point card was chosen for me as "recommended". Heading broken ("CARD?"). | `shots/22-after-loc.png`, `shots/23-after-journey.png` |
| 14 (5:30) | Clash reveal card: nice big 10 v 0 cards, "Gilded (you) +2". Then it overlays "Continue" on top of the result text. | I finally see a clash. | The Continue button overlaps the sentence "Gilded (you) wins. Gilded (you) 10 - Heath 0" and the log lines; the crown/laurel overlaps the "CLASH I" title. | `shots/23-after-journey.png`, `shots/24-next.png`, `shots/24b-settled.png` |
| 15-17 | Clash II, III repeat the pattern. Moss Altar asks "CHOOSE UP TO THREE ACTIVE OR HAND CARDS TO PUT AT THE BOTTOM OF YOUR DECK (FIRST CHOSEN GOES UNDER FIRST)" in a 3-line all-caps heading plus a repeat of the same sentence under it; the card choices are below the fold behind "Choose none". Clash II explanation: "8 = 12 ... Heathbound Clans uses Open Waterways." | I learned: I won 12 v 10 because of my 2 Supporters (+2 each thanks to the Doctrine). That is explained nowhere. | Same overlapping Continue; the choose-cards list is unreachable except through "Choose none". | `shots/26-moss.png`, `shots/27-clash2res.png`, `shots/28-clash3.png`, `shots/29-clash3res.png` |
| 18 (8:00) | Autumn actions: "Suggestion: Rally (self): Heir of the Long Dusk returns to your hand". "Journey: send Scullery Hands away for 1 Lore (it goes to the Lost Pile)". | Not understood. | The suggested button is below the fold; heading clipped at the top. | `shots/30-autumn.png`, `shots/32-after-autumn.png` |
| 19 | "END OF ROUND 1: Gilded (you) +6 total 6, Heath 0." | Finally: 6 to 0 means I am ahead. This is the first time I clearly know I am winning. | The map behind still shows Round 1 (old cards, I/II/III markers) while the header already says "2/4 Bids". | `shots/32-after-autumn.png` |

How long before I understood what I am trying to win: I read "hold the most Influence" on the title at second 0, but in play the word "Influence" appears only as a tiny "0 inf" chip. The first moment the game made "points = Influence, win = more than rival" concrete was the end-of-round table, about 8 minutes in. I did not know WHY I was bidding or placing until about round 2 clash 1 (about 11 minutes).

Round 2 (guided, autopilot following suggestions, reading all screens): the suggested bid was Estate Wardens (3) while holding 10 and 9; Heath bid 9. Suggested Keeper of the Sluice (6) to The Uplands, where Heath had 8 + 4 Supporters = 19 v my 6. I lost two clashes but won the round on Cairn Field/Herald luck. A newcomer cannot learn from this: no explanation of a loss ("Strength in The Sinks: You 2, Heath 5" is in the log only). Round 2 shots: `shots/g-r2-03.png` (Spring, 11/11 buttons clipped), `shots/g-r2-06.png` (clash reveal), `shots/g-r2-11.png` (Site-buy list covered by "Choose none"). End of the game: `shots/34-gameover.png` ("You win the throne! 17 / 11": no recap of what won it).

Normal game vs 2 computers (defaults: 3 players, 5 rounds, Full tips): same flow with extra seat. Observations: `shots/81-normal-first.png`, `shots/n-r1-11.png`, `shots/n-r1-12.png` (an opponent's effect made me "discard 1 card to fit their hand size" mid-Spring while the dock only said "Waiting for the others. Heath is deciding."), `shots/n-r1-22.png` (Ossuary list under "Choose none"), `shots/n-r2-28.png`, `shots/n-r2-34.png` (my Influence dropped 3 -> 2 and the dock showed only the last three log lines, so I never saw the steal), `shots/n-r1-05.png`.

Hot-seat (2 players, 1 round): `shots/100b-hot-setup-bottom.png`, `shots/h-r1-01.png` (pass screen is clear and good), `shots/h-r1-05.png`, `shots/102-hot-clashorder.png`, `shots/h-r1-20.png`. No hidden-information leak found (I checked the viewing seat and card owners at the clash-order step). Problems: players are called "Player 1 (Gilded Court)" in text but "Gilded" / "Heath" on chips; the clash-order question is 990 px tall in a 152 px window (6 of 6 buttons clipped); a tip pop-up appears again for each seat.

Other newcomer actions tried
* Tapped the throne: "THE KINGDOM" page with Great Road thumbnails (52x74 px, icons only), Councils text (Coin/Whispers/Pledges) with no link to why I care. `shots/90-tap-throne.png`.
* Tapped a rival chip: a page with "Doctrine of Tempests, Open Waterways, Site of Power: Verse-Keeper (2), Torchbearer Raiders (3)..." and a faction blurb ("Mobility, momentum and overwhelming force..."), i.e. the faction story exists but is reachable only here, mid-game. `shots/92-tap-rival.png`.
* Tapped "Rules" (book icon): a good numbered list but 2773 px of dense text (about 4.5 screens), no pictures, no "your first round" part; the goal paragraph is OK. `shots/42-rules-ingame.png`.
* Pressed "How to play" on the title screen: nothing visible happens (P1).

Per-viewport dock window (height available for the decision): 1366x768: 417 px. 390x763: 152 px (274 px for a few screens). 844x390: 177 px. 375x553: 92 px.

---

## (b) Problem list, ordered by severity

Severity: S1 blocks understanding or play, S2 clearly broken, S3 confusing, S4 polish.

### S1

**P1. "How to play" on the title screen does nothing visible (all sizes).** The Rules drawer opens at z-index 41 behind the title screen (z-index 60). `elementFromPoint` at the centre returns the title box. A first-time player's only route to instructions from the front door is dead. Shots: `shots/41-rules.png` (drawer open, screen unchanged), `shots/71-desk-howto.png`. Fix: give `.gx-drawer` a z-index above `#start`, or close the title and open the drawer; also add a visible "How to play in 2 minutes" card on the title (see section c).

**P2. The decision area is 152 px tall on a 390x763 phone and 92 px at 375x553; most menus are clipped or need hidden scrolling.** The square map takes 57% of the screen at all times. Evidence: Edict question (2/2 buttons clipped) `shots/06-edict.png`; Spring action menu (11 of 11 buttons clipped, 429 px of content) `shots/16-spring.png`, `shots/g-r2-03.png`; Autumn menu `shots/30-autumn.png`; clash order in hot-seat (990 px, 6/6 clipped) `shots/h-r1-15.png`; bid screen at 375x553 where the suggestion text is covered by the buttons `shots/s-r1-02.png`. The "Supporters 1/2/3/4/5" grid is cut to blank cream stubs. Fix: on phones make the map collapsible (tap to shrink to a 30% strip during questions, or show map and question as two alternating screens), put the primary recommended button first and pinned, make the "dock" its own scroll panel with a visible scrollbar/fade and never auto-scroll past the heading.

**P3. A sticky "Choose none" button sits on top of the option list, and options become untappable.** Moss Altar, Ossuary, Site-of-Power purchase and similar list questions: the first card options are hidden behind the button row. At 375x553 Playwright reports "div.btnrow intercepts pointer events" for the recommended option; at scrollTop 0/60/300/9999 options 0 and 1 are off-screen or covered, option 0 is tappable only in a narrow scroll window. Shots: `shots/26-moss.png`, `shots/52-s553-shrine.png`, `shots/53-s553-sitebuy.png`, `shots/n-r1-22.png`, `shots/l-r1-18.png` (landscape), `shots/g-r2-11.png`. Net effect: a newcomer can only choose "none". Fix: place the action row below the list (not sticky overlay), or render options as a normal flow list with the "Choose none" row at the end, and reserve bottom padding equal to the sticky row.

**P4. No explanation of what you are trying to do or why you take each action.** The game starts with a bid, which a newcomer cannot connect to winning. The goal "most Influence at the end" appears on the title only; in play the score is "0 inf" in a chip and an unlabeled ring on the map. Nothing links "Strength" -> "highest total wins the region" -> "winner picks a place and gains Influence". Fix: section (c).

**P5. Suggestions give no reasons and contradict each other.** Observed: bid 5 while holding 10 and 8 (`shots/03-guided-bid.png`); round 2 bid 3 holding 10 and 9; round 3 suggestion "Decoy Pennon (strength 0)" (`g-r3-13.png`); Herald at Moss Altar (+1) then Heir 10 at The Uplands (`shots/10-herald.png`, `shots/13-place.png`); suggestion "Journey with Pasture Lancers" which permanently loses a card; Autumn "Rally (self)". Only the Herald pop-up explains itself, and its reason ("clean +1", "move cards to bottom of deck") ignores that the Herald pays only if you win that clash. Fix: every starred suggestion carries one plain sentence ("Bid 5: you keep your 10 and 8 safe for the clashes"). In a guided game, scripted suggestions chosen for teaching, not strength.

### S2

**P6. Overlapping "Continue" on the clash result card.** On `shots/24-next.png`, `shots/27-clash2res.png`, `shots/29-clash3res.png`, `shots/24b-settled.png` the Continue button covers the result sentence and the log lines, and the laurel/crown overlaps the "CLASH I" title. Fix: put Continue in a reserved footer row; shorten the log lines list to a collapsible.

**P7. Question headings are broken or duplicated.** "CARD?" (`shots/22-after-loc.png`: auto-scroll left the heading cut), "GOES UNDER FIRST)." (`shots/l-r1-18.png`), same sentence as heading and body ("Set every opponent's bidding strength to 0 this round?", "Moss Altar: choose up to three Active or hand cards..." in all caps) (`shots/06-edict.png`, `shots/26-moss.png`). Fix: one short heading, one body; don't preserve scroll offset between questions (reset `#main.scrollTop=0`).

**P8. The "step list under the map" the Rules page promises does not exist on phone.** `#road` is `display:none` at phone width (it exists on desktop: "Round 1 of 4, step 1 of 7: Bids, Heralds, Cards, Spring, Clashes, Autumn, Winter", `shots/73-desk-bid.png`). The Rules text: "The step list under the map always shows where you are in the round". On phone the player has only "1/4 Bids". Fix: show a 7-dot tracker in the top bar with the step name.

**P9. Location names are absent from the phone map** (`shots/02-guided-first.png`) but shown on desktop (`shots/73-desk-bid.png`). The player must match "Moss Altar" in a button to an unnamed picture. Fix: names under each location on phone too (12px, with outline), or number the locations and show the number on the buttons.

**P10. Silent effects.** The Seal-Ring +1 Influence on a win, the Tactic "Doctrine of Masonry" (no visible change after pressing it), "Heathbound Clans uses Open Waterways", "Lantern uses Midnight Pressure" making me discard a card (`shots/n-r1-12.png`) are announced only in tiny log lines or not at all. A drop from 3 to 2 Influence (Herald steal) is only in the log (`shots/n-r2-34.png`; the dock shows the last 3 lines only). Fix: a toast per effect: "You lose 1 Influence: Heath's Herald was at Cairn Field and Heath won there."

**P11. Too many forced tip cards.** Each new phase inserts a full-dock tip with "Got it / Hide tips" before the decision: first bid takes about 9 taps and 6 screens before the first herald is placed. Tips are generic ("Think about which region your rivals are weakest in") and they hide the thing they discuss. Fix: attach one-sentence callouts to the real element (arrow + highlight on the map), show only the first time a concept appears.

**P12. Order of reveal vs choice.** In the guided game the clash is resolved and I choose the location BEFORE the reveal card is shown (`shots/21-location.png` then `shots/23-after-journey.png`). A newcomer does not know why they just won. Fix: show the clash card, then "You won The Uplands: choose a place".

### S3

**P13. Jargon never defined where it appears.** Kingdom Card, Great Road, Herald, Supporter, Clash, Influence, Lore, Tactic, Exhausted, Occupy, Eliminated, Lost Pile, Journey, Govern, Council, Site of Power, Favour, Attrition, Pathfinder/Resilient/Invulnerable, Rally, Ambush, Retreat, Flank, Deadly, Order Track. Examples: `shots/04-card-popup.png`, `shots/23-after-journey.png`, `shots/30-autumn.png`, `shots/92-tap-rival.png`. Fix: tap-a-term glossary (underlined words open a one-line definition) and renaming where possible: Supporter -> "Follower token (+1 in the first fight)", Journey -> "Quest: spend a card for Lore", Lore -> "Scrolls".

**P14. The first game has 15+ concepts in round 1.** Bid, Great Road, Kingdom Card, Edict (Tactic), Herald, Location rewards, hidden cards, Supporters, Doctrine, Day/Night abilities, Journey/Lore, Autumn actions. The professional pattern is one concept per round. Fix: staged guided game (section c).

**P15. The guided game's opponent plays 0, 0, 10 in round 1** (all three clashes won by me; `shots/05-after-bid.png`, `shots/29-clash3res.png`), so I never feel a clash being close, and in round 2 it suddenly stacks 4 Supporters for 19 (`shots/g-r2-06.png`). Fix: scripted opponent hands for rounds 1-2.

**P16. The hand disappears for many questions on phone** (claim a location `shots/21-location.png`, Great Road resolution `shots/08-greatroad.png`, Herald list `shots/10-herald.png` show no hand strip). Cards in hand are needed to decide. Fix: always keep the hand strip visible or add a "Hand" peek button.

**P17. Header "1/4 Bids" and the board's gold numbers (0-35) are unexplained.** The ring around the map is the score track; the tokens (crown, green) at the top are the players' Influence. `shots/32-after-autumn.png` shows my crown at the right edge covering the "10" label (`shots/g-r2-11.png`). Fix: label "Score" with each player's coloured name next to their token.

**P18. Faction choice has no information.** "Your side: Gilded Court / Heathbound Clans / Lantern Rising / Pale Choir" just names. The descriptions exist in the code (rival chip text: "Mobility, momentum and overwhelming force...") but are shown only mid-game. `shots/40-title-bottom.png`.

**P19. Setup form is too large for the title.** Mode (3 buttons with no label), Players + Length on one wrapping row, Your side, per-seat difficulty dropdowns, Guide level, Start game, How to play, in one 1187 px page (`shots/01-title.png`, `shots/40-title-bottom.png`). "Play online (free, peer to peer)" competes with the Guided button.

**P20. Rules text is a wall.** 2773 px, one paragraph per phase, reads like the rulebook (`shots/42-rules-ingame.png`, `shots/43-rules-ingame-scrolled.png`). No pictures, no "your first round" step list, no card anatomy diagram.

### S4

**P21.** Icon-only top buttons on phone (Board, Log, Rules, Menu: 44x44 each with no label) (`shots/02-guided-first.png`); desktop has labels.
**P22.** A stray red dot under the Moss Altar option on `shots/25-clash2.png` (unlabeled Herald marker).
**P23.** Map card slots are about 17 px wide on phone; the numbers are readable but card names are not (`shots/15-after-place.png`).
**P24.** "Hand 5/7" after taking the Seal-Ring: hand size changes with no explanation; later hand size shrinks (Attrition message appears only at the end of round 4 `shots/33-end.png`).
**P25.** The game over screen is only "You win the throne! 17 / 11" with two buttons: no recap of how the points came (`shots/34-gameover.png`).
**P26.** Desktop dock is mostly empty above the hand (417 px area, 3 lines of text) while the board is capped at 700 px: wasted space at 1366x768 (`shots/73-desk-bid.png`). Desktop otherwise worked.
**P27.** Hot-seat naming mismatch ("Player 1 (Gilded Court)" in text, "Gilded" on chip), tips repeat each seat (`shots/h-r1-05.png`).

---

## What a professional adaptation does that ours lacks (concretely)

1. A calm title: logo, one line, three buttons: "Learn to play" / "Play" / "Rules". Ours has 12+ controls and 1187 px of form on the first screen, and the dead "How to play" button (P1, P19).
2. Faction cards: one card per faction with a 2-sentence story ("The Gilded Court holds the old castle and bids for loyalty with gold"), a playstyle line, difficulty and "Choose this if you enjoy: patient planning / swarming rivals / tricks". Ours: four names (P18).
3. One decision at a time with a stage. Ours shows the whole dock with up to 17 buttons (Spring menu), and the map never gives way to the decision (P2).
4. A tutorial that teaches in the order of play with fixed hands, not a tooltip layer over the full game (P4, P11, P14, P15).
5. Reasons: each hint says why in one sentence ("Play your 10 here: this region pays +2 and nobody else has anything big"). Ours: only a label or none (P5).
6. Cause-and-effect feedback after each result, "You lose 1 Influence because...", with animation of the thing that changed (P10, P12).
7. Labels on the board: names, score, who is who, step tracker (P8, P9, P17).
8. A glossary and a one-page "round at a glance" (P13, P20).

---

## (c) Proposed guided first game script

Rules for the script: fixed hands and a scripted computer in rounds 1 and 2; during the tutorial the player sees only the controls of the current step; each step has one button; all numbers use "points" until the word Influence is introduced as "Influence (points)". Two rounds (about 6 minutes), then the real game with more features unlocked and the tip layer on "light".

Setup before step 1: player is the Gilded Court (blue-gold), rival Heath. Rival is shown as a small card "Heath, the Heathbound Clans: fast and hits hard". 2 players, 3 rounds in total (round 1 and 2 scripted, round 3 free with suggestions).

| Step | What is shown | The one thing the player does | The one sentence that explains why |
|---|---|---|---|
| 1 Goal | Full-screen card: crown + the throne, Heath's banner. Score bar "You 0 - Heath 0 points". | Tap "Show me the map". | "Whoever has the most Influence points after 3 rounds takes the throne." |
| 2 The map | Map with the 6 locations named and 3 regions glowing in turn. | Tap the glowing Region (the Uplands). | "Each round you fight for 3 regions; whoever has the strongest total in a region wins it and gets points." |
| 3 Cards | Hand reduced to 3 cards (10, 5, 2), the numbers circled. | Tap the card 10. | "The big number is a card's Strength: bigger beats smaller." |
| 4 Place | The Uplands slot glows. | Drag/tap "Play here" on the 10. | "Cards go face-down so your rival cannot see them." |
| 5 Place others | The other regions glow; card 5 and 2 offered. | Place the 5 on the Sinks, the 2 on the Tablelands. | "You put one card in every region; keep your best where the prize is biggest." |
| 6 Reveal | Clash card, 10 vs 3 (scripted). Highlight difference. | Tap "Flip". | "10 beats 3, so you win the Uplands." |
| 7 Reward | Two places in the Uplands: Spire Court +1, Thornwild +1 with their one-line effects greyed. | Tap "Thornwild (+1 point)". | "The winner picks a place in that region and takes its points." |
| 8 Lose one | Sinks: 5 vs 7 (scripted). Show "Heath 7 wins, +1 for Heath". | Tap Continue. | "Losing a region is fine, you only need more points in total." |
| 9 Round summary | Score bar animates: You 2, Heath 1. | Tap "Next round". | "You are ahead by 1 point. After the last round the higher score wins." |
| 10 Herald (round 2) | Herald figure appears and Gleaning Meadow pulses. Only one Herald on screen. | Tap Cairn Field (+2) to put your Herald there. | "Your Herald is a bet: if you win in that region at that place you get +1 extra, and each rival Herald there loses 1." |
| 11 Play cards | Hand 10, 8, 4 (scripted). Hint "your Herald is at Cairn Field (the Tablelands): play your best card there". | Place 10 on the Tablelands. | "Put your biggest card where your Herald is." |
| 12 Supporters | A row of 3 small tokens. | Tap "Send 2 Followers to the Sinks". | "Each follower adds +1 Strength in the first fight there, and goes home after the round." |
| 13 Rival bluff | Heath's Herald also at Cairn Field (scripted). | Tap Continue. | "Heralds are public so you can guess what the rival wants." |
| 14 Results | Three clash cards, one by one with the total broken down: "8 + 2 followers = 10". | Tap Flip for each. | "Add up the card plus followers to get the total." |
| 15 Steal | The win at Cairn Field: "+2 place, +1 Herald, Heath -1". | Tap "Claim Cairn Field". | "A correct Herald guess is a 2-point swing." |
| 16 Bid (optional, round 3) | Now introduce the bid screen alone, with only 2 cards in the Great Road. | Tap the suggested bid (with a reason line). | "A bid before each round lets you grab a special card (Kingdom Card) that bends the rules; keep it for the third round." |
| 17 Real game | Unlock Autumn (cards for Lore) and Tactics only when the player first meets them, each with the same two-line format. | Tap "Play round 3 your way". | "Now you know the loop: bid, bet with your Herald, place cards, add up, take points." |

Notes for the implementer: step list shown in the top bar ("1 Bid, 2 Herald, 3 Cards, 4 Fight, 5 Score"); arrows and highlights on the real map; the tutorial hides the sections not yet taught (Kingdom Cards, Tactics, Journey, Govern). Always show the score bar with player names beside the tokens.

---

## (d) Top 8 fixes

1. Make "How to play" actually open (z-index bug P1) and put a "How to play in 2 minutes" step list, with the goal and the round loop on a single card, on the title.
2. Replace the "Guided first game" with the scripted 2-round tutorial in (c): fixed hands, scripted rival, one concept per step, one button per step, a reason sentence per step.
3. Fix the phone layout: the decision panel needs at least 300 px. Make the map collapsible or shrink it to a strip while a question is open; reset scroll at each question; pin the recommended button; no clipped buttons (P2, P7). Target 390x763 and 375x553.
4. Remove the sticky "Choose none" overlay; list options in normal flow with the action row after them (P3, P6 Continue overlap).
5. Every suggestion gets a "why" sentence, and scripted suggestions must be coherent (bid, Herald and cards agree), with the Herald reason stating that it only pays if you win there (P5).
6. Put names, score and step on the phone map: location names, a labeled score ring or bar, the 7-step tracker in the top bar (P8, P9, P17).
7. Introduce terms once and show effects: tap-a-term glossary, plain-word renames (Supporter, Journey, Lore), toasts for every automatic gain/loss and for steals (P10, P13).
8. Calm title and faction cards: three main buttons (Learn / Play / Rules), faction cards with a short story and "choose this if you enjoy..." line, and move online/hot-seat/difficulty behind a "More ways to play" step (P18, P19).

---

## Appendix: per-viewport facts
* 390x763: no horizontal scroll (scrollWidth 390); title page scrolls internally (1187 px); dock 152 px typical; hand cards 56x80 (tap target ok); all top icons 44x44.
* 375x553: map 280 px square, dock 92 px, suggestions overlapped by the buttons (`shots/s-r1-02.png`), option lists unreachable (`shots/52-s553-shrine.png`, `shots/53-s553-sitebuy.png`).
* 844x390: map left, dock right (177 px), mostly fine, but the same overlap on Moss Altar (`shots/l-r1-18.png`) and the clash order needs 703 px of scroll (`shots/l-r1-11.png`, tip over the question).
* 1366x768 mouse: works; step tracker and location names visible; "How to play" dead (`shots/71-desk-howto.png`); dock mostly empty.
