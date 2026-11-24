# VISUAL-R14: contact-sheet audit of every live game (24 Nov 2026, 16:10-16:25 UTC)

Method: `contact-sheet.js <slug> phone|pc` (402x874, 1366x768) on a local build of `games/` for each live game, every ?scn= cell.
Games with no ?scn= scenarios (gloamwar, meadowfold, ochre-horizon, onyx-atelier, via-tessera, wickdeep) also got a Playwright shot:
start, press Play, tap the board (`r14/noscn-phone.jpg`, `noscn-pc.jpg`). Skipped as instructed: mainhattan-overdrive, deep-signal,
mainhattan-nightrun. Sheets: `games-src/orch/r14/<slug>-<phone|pc>.jpg`.
File hint = `games/<slug>/`, then the owning module from that game's MODULES.md (`games-src/scripts/find.sh --maps`).
Scores: 0-10, judged against UI-BAR.md. "cell" = contact-sheet cell label.

Note on the auto-flags: almost every PC flag reads `offscreen "How to play" / "Menu" / "×"`. Those are closed slide-in panels parked
off-screen, so they are noise. The script should skip `visibility:hidden` and transformed-out panels, otherwise real flags get buried.

## The 5 worst

### 1. kaiten-kitchen: 3/10 (looks like a wireframe)
1. kk-board, kk-uibar (both sizes): the main board is a beige wallpaper with three "Nothing served yet" rows. The belt is invisible and
   the dishes are tiny `+3` / `+6` / `end` circle chips with no food art. Fix: draw the belt as a real conveyor band and the dishes as
   plates with food art, at least 64px. Hint: board render + belt css.
2. kk-board pc: the right dock is a dashed empty box, and the area under the board (about 35% of the screen) is plain dark.
   Fix: put the dock at full height (turn, line, last 3 events) and let the board fill the height.
3. menu pc: the left half shows the board, the right half is a dark void. Fix: the layout must not depend on the panel being open.
4. kk-art: the menu panel opens with a "Tap a glowing card" bubble stuck over its header. Fix: hide coach bubbles while a panel is open.

### 2. shipwreck-isle: 3/10 (baseline for W730's overhaul)
1. si-board, rc-uibar, si-art (both): the island is a grid of flat navy hexes with a "?" on each, on a flat navy background. No terrain
   art, so it reads as a placeholder. Fix: painted hex tiles (beach, jungle, rock) and a sea texture, with face-down tiles drawn as
   textured backs, not "?". Hint: hex render.
2. si-board pc: the hex numbers are drawn behind the "?" ("?13", "?4") and the result is unreadable. Fix: show one label per hex, in a corner.
3. si-board phone and pc: an empty column of 3-4 dark squares sits on the right edge of the board (placeholder slots).
   Fix: remove them, or fill them with the item or weather they stand for.
4. si-board phone: the "8 beach" chip is clipped inside the hex ("8 :each"). Pawn names break mid-word ("Carpente/r"), and
   "Hammer and Nails" is under 10px. Fix: `white-space:nowrap`, shorter labels, 13px minimum.
5. story-scene: the speaker portrait is a letter "T" placeholder. Fix: wire a portrait (owner art first, free art only for empty slots).
6. si-zoom: the card list shows the "Card list" title twice, with a Bickering popup on top that repeats the row underneath.
   Fix: one title, and expand the row in place.
7. start: the Play button is a small secondary chip on the left. Below it are 4 option rows and 4 secondary buttons. Breaks UI-BAR 7.
   Fix: one big primary Play button.
8. si-board pc: the right dock is mostly empty parchment between the instruction line and the pawns. Fix: size the dock to its content.

### 3. onyx-atelier: 3/10
1. noscn phone (board): a dozen labelled chips ("Jewels", "Patrons", "Favours", "Gem board", "Your race", "Your gems", "Refill") sit on
   top of the gems and cards, and the lesson box covers half the gem board. Breaks UI-BAR 10. Fix: one bubble at a time, placed next
   to its target with an arrow. Hint: lesson/coach module.
2. noscn pc: the board is a narrow centre column with about 70% of the screen black. Gems are about 18px and labels are 8-10px.
   Fix: a real wide layout (board left, market right), with gems at least 40px.
3. Top HUD: rows of "0/20 pts" counters and gem pips at 9-10px, which looks like a spreadsheet. Fix: show the scores on the player
   pieces and keep one race bar.
4. Start (pc): the menu buttons are small (about 11px text) in a large Art-Deco frame. Fix: scale the frame and buttons up at 1366 wide.

### 4. short-fuse: 4/10
1. sf-art (both): the Settings/Menu panel opens BLANK. Phone shows only the "TIPS" and "LEARN" headings; PC shows an empty cream sheet.
   Fix: the panel content is not rendering, so check the panel builder for this scenario.
2. sf-zoom pc: a tall empty blue strip covers the left 30% of the board (an empty zoom card). Fix: render the zoomed wire, or keep the
   card closed.
3. story-scene pc: the dialogue card has no body text, just a portrait and buttons. Fix: the text node is empty at desktop width.
4. sf-board phone: the middle 40% is empty blueprint between the two face-down rival stands. Rival chips and the top bar chips
   ("Job 1 Setup Your pick", "You 0 Teal 0 Plum 0") are under 11px. Fix: bigger rival stands, 13px chips.

### 5. crown-city-smash: 4/10
1. cc-board (phone): the top 40% of the screen is an empty orange sunburst, and the city cards below it carry about 6px text.
   Fix: move the city and the monster up into that space at twice the size.
2. cc-dice-end, cc-end-turn, cc-zoom (both): dice show blank faces (white squares with dots or nothing), so the result is unreadable.
   Fix: dice must always show a face icon. Hint: dice render state after resolve.
3. cc-board pc: the dice tray is a full-width green bar with 6 tiny dice at its left end. Below it, 5 "0 cards" empty slots form a
   placeholder row. The top-left player list is 8-9px. Fix: centre the dice at 56px or more, hide empty card slots, 16px text at pc width.

## Next worst (4/10)

### sands-of-qamar: 4/10
1. sq-art (both): a literal orange "Name" placeholder is printed across the board. Fix: wire the tile or tribe name, or drop the label.
2. start (phone): the title is cut off by the right edge ("Sands of Qam"). Fix: smaller font or a wrap at 402px wide.
3. sq-board: a wall of 30 identical small tiles with 8px meeples, and the score track drawn as a table ("1st 18 / 2nd 12 ...").
   Fix: bigger tiles with the meeples drawn on them, and the score track as a path around the board.
4. sq-board pc: the right column is three stacked micro-lists (goods, players, standings) at 8-9px. Fix: 16px text, and show only the essentials.

### nebula-aces: 4/10
1. nb-tail pc: the coach bubble is an empty cream box with no text. Fix: fill it, or don't show it.
2. nb-board (both): the ship is about 20px, under a fan of white manoeuvre squares and the hand pointer, and the
   "Tap your ship to plan its move" label is half covered. Fix: bigger ships, the dial opened beside the ship, the label above the dock.
3. nb-art: ship stat chips are empty coloured bars (red, green, olive) with no text. Fix: label them or remove them.
4. nb-board pc: the board is a narrow framed column with empty nebula on both sides. Fix: widen the arena to the screen.

## The rest (best last)

### doorkick-dungeon: 5/10
1. dk-diary (both): the diary panel is a blank parchment with no entries. Fix: render the log lines (or "No events yet").
2. dk-zoom pc: an empty tall parchment strip covers the right of the board. Fix: render the card inside.
3. dk-win-* (both): the win screen is a stats table (Level/Kills/Helps/Deaths/Cursed), mostly zeros. Breaks UI-BAR 5. Fix: hero portrait,
   one line, 3 highlights.
4. dk-board pc: a huge empty wooden table with small cards, and the player strip at about 9px. Fix: cards at least 20% of board height.

### emberclimb: 5/10
1. ec-split, ec-split-two (phone): the boss's purple tentacle art is drawn over the hand of cards and the enemies. Fix: put the board art
   behind the cards (z-index) and clip it to the stage.
2. All fights: a row of empty circle placeholders (relic slots) at the top and in the bottom strip. Fix: hide empty slots.
3. pc (all cells): the right quarter is a dark dock with tiny text and 3 empty circles. ec-rest and ec-map are mostly empty wood, and the
   map nodes are faint with no visible paths. Fix: draw path lines and bigger nodes, and size the dock to its content.
4. ec-shop pc: items are greyed out with small art, plus a big empty circle "relic" placeholder. Fix: full-colour items, no empty frame.

### final-approach: 5/10
1. fa-board, fa-buttons (both): the cockpit is a grid of small slots labelled "Gear 1-2", "Flap 3-4", "Brake", "Coffee", at 9-10px.
   That reads as a spreadsheet. Fix: bigger slots and fewer labels; put the meaning on the slot art.
2. fa-art phone: the menu panel runs past its frame and "Info" is cut at the bottom. Fix: make the panel scroll, with a 16px inset.
3. fa-log (both): a full-height parchment holds 3 lines. Fix: size it to the content.
4. fa-brief / fa-zoom: an empty checkbox column is printed down the clipboard's left margin. Fix: remove the decorative boxes.
5. Two big empty pale-blue/grey pill slots at the bottom (dice trays) look like placeholders. Fix: show the dice or "Roll to fill".

### hollowbough: 5/10
1. ui-rivals phone: the panel is completely empty. ui-log (both): a full-screen parchment with one line. Fix: render the rivals, and size the log.
2. pc: the "My city" grid is a dark empty area at the top right. Text everywhere is 8-10px at 1366 wide. Fix: 16px minimum at pc width.
3. Resource row and goals are number tables. Fix: icons with big numbers, and goals as cards.

### stitchwise: 5/10
1. sw-result: "You win" with -132 vs -150, and both quilts drawn empty (no patches). Fix: show the placed quilts, and explain or avoid
   negative totals in the headline.
2. Time track: dense 9px dots and the caption "Pass = income ..." at about 9px. Fix: 13px, or show it once in the lesson.
3. pc: the middle column (opponent quilt plus track) is cramped between two panels. Fix: give the track a full-width row.

### twin-thrones: 5/10
1. tt-board phone: card names and costs about 7px. The pyramid has many empty dark slots. Fix: 13px names, and hide fully-taken slots.
2. "Your city: built cards land here" dashed placeholder strip. Fix: show the built cards, or hide the strip until the first build.
3. tt-result: a small card on an empty dark field, with a flat hex placeholder picture. Fix: real end art, scaled up.

### vinegrave: 5/10
1. vg-board: the desaturated grey photo card art reads as low contrast. The resource row "coins compasses tablets arrows jewels" is a
   table at 9px. Fix: warmer art grade, and icons with 16px numbers.
2. menu pc: the board is missing (empty map, bottom bar only). Fix: render the board under the menu.
3. vg-result: a score grid of 8 stat cells per player, which looks like a spreadsheet. Fix: total plus 3 highlights.

### wildmark: 5/10
1. wm-board (both): the valley is 3 tiny hexes in a vast dark painting. Fix: zoom the valley to fill the stage at the start.
2. wm-result: a score table with "no pairs yet" in every cell. Fix: one line per player, and hide the zero rows.
3. Top bar animal counters at about 9px. Fix: 13px, and fewer counters.

### lantern-dive: 5/10
1. ld-board (both): the stage is about 80% empty dark water around one "Predict (secret)" card. The Pass button is a tiny chip in the
   middle. Fix: trick area and job cards larger and central, Pass as a real secondary button.
2. Opponent chips: "10 cards / 0 tricks" at 9px. Fix: 13px, shown on the avatar.

### gloamwar: 5/10
1. noscn phone: the map labels collide with the army tokens, and the faction box (top right: troops/regions) is 9px stacked text.
   The turn label covers map text at the bottom. Fix: label halos and a collision offset, and one compact faction chip.
2. The tutorial box sits in the middle of the map, covering the target. Fix: a bubble beside the lantern (UI-BAR 10).
3. Start: plain cream page, small buttons, and a two-primary-button start (UI-BAR 7).

### wickdeep: 5/10
1. Start pc: a small pixel-font title screen in the middle of a dark page, with button text about 8px. Fix: scale it up 2x at pc width.
2. Pre-game panel: "Secret goals" buttons at 9px. Fix: 13px.

### rampart-and-vine: 5/10
1. start / ui-start (both): 6 empty option boxes with no labels (the quick-game segmented controls). Fix: wire the labels.
2. rv-art: a small blank white panel at the top right of the board. Fix: render its content or remove it.
3. rv-help: a 5-step numbered list (breaks UI-BAR 5). Fix: one rule per tap, at the target.

### cauldron-fair: 6/10
1. cf-art, cf-board, cf-ui pc: the board shows an empty fairground and the cauldron is missing (it appears only in cf-draw). Fix: always
   draw the cauldron at pc width.
2. cf-zoom pc: "Points after day" shows dark empty rings as placeholders. Fix: fill them, or show a summary.
3. Phone cauldron ring numbers are about 9px and the ring overlaps the tents. Bottom HUD reads "chips in the bag 7 white / next chip
   explodes 0%" as a table. Fix: bigger ring numbers, risk shown as a gauge.

### perch-and-plume: 6/10
1. pc left column: lists at 8-9px ("Fern's board", round goals). Fix: 16px at pc width, and collapse them.
2. pp-result (both): the score table floats over the painting. Fix: a parchment card with the total plus 3 highlights.

### redline-rally: 6/10
1. rr-board phone: the control panel is a stack of 8-10px labels ("move 4", "Stress", tabs, "Engine heat").
   Fix: 13px, and drop the duplicate tags.
2. The story-scene portrait is a "C" placeholder. Fix: wire a portrait.
3. pc standings are tiny at the bottom right. Fix: 16px.

### tidewake: 6/10
1. tw-board phone: the "Quick: your junk is blocked" alert is red text on pink, and crowded. Fix: dark ink on cream, one line.
2. "Since your last move" is a numbered log on the main screen (UI-BAR 5). Fix: last 3 events, no numbering.
3. tw-zoom pc: a full-height cream panel with one paragraph. Fix: size it to the content.

### vale-of-banners: 6/10
1. A dark portrait painting behind the market tiles hurts contrast and looks odd. Fix: a neutral table texture.
2. Bottom panel: empty dashed placeholder boxes. vb-result is a score table. Fix: hide empty boxes, and a highlight end card.

### via-tessera: 6/10
1. Start: the menu floats over an unloaded dark map with stray HUD buttons (an empty circle and a "?"). Fix: load the map art first,
   or hide the HUD.
2. Board phone: the "Rival: Builder" chip covers the clipped "…aying..." status text. Fix: one status chip.
3. Card row overlaps the bottom of the map. Fix: reserve the dock height.

### meadowfold: 6/10
1. pc: a small hex grid in a huge empty green field, with the animal cards tiny at the top left. Fix: scale the board and cards for width.
2. Start: about 11px option text ("Game options: vs computer, easy..."). Fix: 13px.

### ochre-horizon: 6/10 (only start and corporation pick seen)
1. pc corp pick: the HUD behind it shows rows of empty "0" placeholder tiles. Fix: dim or hide the HUD behind the modal.
2. Phone corp pick: fine. It needs ?scn= scenarios so the board can be audited.

### thornbound: 6/10
1. menu pc: the whole background is blank black behind the goal modal (board not drawn). Fix: render the board under it.
2. tb-zoom pc: the card panel runs off the bottom of the screen. tb-throne text runs past the parchment's right edge.
   Fix: max-height plus scroll, and a 16px inset.
3. menu (phone): a numbered how-to list (UI-BAR 5). The "Purse empty / Veil empty / Bond empty" row looks like a spreadsheet.

### sunglaze: 7/10
1. The "Middle" label on the centre pot is clipped by a factory disc. On pc the salmon empty disc overlaps the bottom factory.
   Fix: spacing in the factory ring.
2. The rival name "Tamsin" floats alone, right-aligned, under the portrait grid on start. Fix: put it under the selected portrait.

## Patterns across the shelf (fix once in the shared shell)
- Empty panels: diary, log, rivals, settings and zoom open blank or as a tall empty parchment in doorkick, hollowbough, short-fuse,
  final-approach, tidewake and thornbound. The shared panel component should size to its content and show an empty-state line.
- Placeholder portraits ("T", "C" letters) in story scenes: shipwreck-isle, redline-rally.
- PC layout = phone layout with dead space: kaiten, emberclimb, lantern-dive, nebula-aces, onyx-atelier, meadowfold, wickdeep.
- End screens as stat tables: doorkick, vinegrave, wildmark, perch, vale, stitchwise.
- Tiny text (8-10px) at 1366 wide almost everywhere. UI-BAR 1 asks for 16px, so the shell should raise the base font at >= 1024px.
- contact-sheet.js offscreen flags are noise. Ignore hidden panels so real flags stand out.
