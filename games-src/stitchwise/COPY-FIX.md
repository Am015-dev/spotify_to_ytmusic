# Stitchwise copy fixes
Game: Stitchwise. Date: 2026-11-08. Source: games-src/stitchwise/src (coach text may be overridden by campaign.json).

## Goal card
The Goal card (ui1.js:186) already states the aim in ONE sentence: "Goal: the most points when both tokens reach the end". Verdict: ok. Only its three bullets (ui1.js:187) are reworded below.

| file:line | old line | new line |
|---|---|---|
| src/ui1.js:61 | `. Tap for their quilt.` | `Tap to see their quilt.` |
| src/ui1.js:63 | `Buttons earned each time a gold spot is passed` | `Buttons paid at each gold spot` |
| src/ui1.js:63 | `Empty squares (gaps), -2 each` | `Empty squares: -2 points each` |
| src/ui1.js:90 | `Gold spot (income) in ` | `Next gold spot in ` |
| src/ui1.js:109 | `Buttons earned at each button spot` | `Buttons paid at each gold spot` |
| src/ui1.js:128 | `rival finished` | `opponent is done` |
| src/ui1.js:128 | `tied, on top` | `tied, arrived last` |
| src/ui1.js:136 | ` Best value on offer.` | ` That was the best option.` |
| src/ui1.js:151 | `Free 1×1 patch! Tap any empty square on your quilt` | `Free 1×1 patch! Tap an empty square.` |
| src/ui1.js:151 | `You passed a leather space on the track. The 1×1 patch is yours, sew it anywhere.` | `You passed a leather space. Sew your free patch anywhere.` |
| src/ui1.js:164 | `Tap a glowing patch, or tap Advance` | `Tap a glowing patch, or Advance` |
| src/ui1.js:164 | `No patch you can buy: tap Advance` | `You cannot buy any patch. Tap Advance.` |
| src/ui1.js:176 | ` points (buttons are money and score)` | ` points (each button is 1 point)` |
| src/ui1.js:178 | `(+7 to the first to fill one; best block ` | `(+7 for the first to fill one; best block ` |
| src/ui1.js:179 | `: paid at each gold spot passed (` | `: paid at each gold spot you pass (` |
| src/ui1.js:187 | `Every square you cover saves 2 points (gaps cost \u22122 each).` | `Each empty square costs you 2 points.` |
| src/ui1.js:187 | `Buttons are points: earn them at gold spots and by Advancing.` | `Each button is worth 1 point.` |
| src/ui1.js:187 | `First to fill a 7\u00D77 block gets +7.` | `Fill a 7\u00D77 block first for +7 points.` |
| src/ui2.js:19 | ` does not fit anywhere on your quilt.` | ` has no room on your quilt.` |
| src/ui2.js:24 | `</b>: tap again to read it.` | `</b>: tap again for details.` |
| src/ui2.js:57 | `That move is not allowed (` | `You cannot do that (` |
| src/ui2.js:63 | ` completed a 7×7 square: +7 bonus!` | ` filled a 7×7 square: +7 bonus!` |
| src/ui2.js:77 | `: gold spot income` | `: from a gold spot` |
| src/ui2.js:86 | ` is still behind on the track, so plays again` | ` is still behind, so plays again` |
| src/ui2.js:86 | `You are still behind on the track: play again` | `You are still behind, so go again` |
| src/ui3.js:8 | `A quilting duel for two. Buy patches, sew them on, run out the clock.` | `A quilting duel for two. Buy patches and fill your quilt.` |
| src/ui3.js:12 | `Against the computer or a friend on this screen` | `Play the computer, or a friend on this screen` |
| src/ui3.js:13 | `A real game; Aunt Wren coaches you as you play` | `A real game with Aunt Wren as your coach` |
| src/ui3.js:21 | `Gentle and a little careless: a good first match` | `Gentle and forgiving. Good for a first game.` |
| src/ui3.js:22 | `Tidy quilts and sensible timing` | `Neat quilts and sensible choices` |
| src/ui3.js:23 | `Looks ahead at your replies. Beats a naive player about 9 in 10` | `Plans ahead. A real challenge.` |
| src/ui3.js:24 | `Pass the screen: both quilts stay in the open` | `Two players, one screen. Both quilts show.` |
| src/ui3.js:41 | `Every time you pass a button spot it pays you ` | `Each gold spot you pass pays you ` |
| src/ui3.js:41 | `It earns no buttons at button spots.` | `It pays nothing at gold spots.` |
| src/ui3.js:46 | `All 33 patches, in every game. Tap one to see it large. Icons: cost in buttons, time, buttons it earns at each button spot.` | `Tap a patch to enlarge. Icons: cost, time, buttons paid.` |
| src/ui3.js:49 | `The player further back on the track takes the turn.` | `Whoever is further back on the track plays.` |
| src/ui3.js:49 | `Finish with the most points. Points are your buttons, plus 7 if you complete a 7×7 square on your quilt, minus 2 for every empty square.` | `Most points wins. Buttons, +7 for a 7×7 square, −2 per empty square.` |
| src/ui3.js:50 | `Look at the three patches just past the neutral marker. Pay the button cost, place it on your quilt (turn and flip it freely, no overlaps), then move your time token forward by its time cost.` | `Pay its cost, place it, move your token.` |
| src/ui3.js:50 | `Move your time token to the space right in front of your opponent’s and take 1 button for every space you moved.` | `Jump just past your rival and take 1 button per space.` |
| src/ui3.js:51 | `If both are on the same space, the one on top (who arrived last) plays.` | `On a tie, whoever arrived last plays.` |
| src/ui3.js:51 | `So a slow, big patch can give your opponent several turns in a row.` | `Big patches can give your opponent several turns.` |
| src/ui3.js:52 | `<h3>Gold spots (income)</h3>` | `<h3>Gold spots</h3>` |
| src/ui3.js:52 | `When your token passes a gold button spot, you earn one button for every button printed on the patches on your quilt.` | `A gold spot pays one button per button on your patches.` |
| src/ui3.js:52 | `Cheap patches with buttons on them early are an engine.` | `Buy patches with buttons early to earn more.` |
| src/ui3.js:53 | `The first player to pass one sews it on immediately, anywhere empty.` | `Whoever passes one first sews it on any empty square.` |
| src/ui3.js:54 | `The first player to fill a full 7×7 block of squares earns 7 bonus points.` | `The first to fill a 7×7 block earns 7 bonus points.` |
| src/ui3.js:55 | `Highest score wins; on a tie, whoever reached the end first.` | `Most points wins. A tie goes to whoever finished first.` |
| src/ui3.js:56 | `<h3>Simplified on purpose</h3>` | `<h3>Rule changes</h3>` |
| src/ui3.js:56 | `Seat 1 (you, in Story and the tutorial) starts; in a Quick game the first player is random.` | `You start in Story and the tutorial. Quick games pick randomly.` |
| src/ui3.js:56 | `A free leather patch is skipped if your quilt has no empty square left.` | `No empty square left? You skip the free leather patch.` |
| src/ui3.js:56 | `Patch costs, times and buttons are our own table; a few values may differ from printed sets.` | `Patch costs, times and buttons are our own numbers.` |
| src/ui3.js:57 | `Gaps of 1 or 2 squares are hard to fill later: keep the edges tidy.` | `Small gaps are hard to fill later. Keep edges tidy.` |
| src/ui3.js:57 | `Time is your real currency. A cheap patch that takes little time is often better than a big one.` | `Time matters most. Quick, cheap patches often beat big ones.` |
| src/ui3.js:57 | `Advance when you are short of buttons, or to get the next turn.` | `Advance when short of buttons, or to take the next turn.` |
| src/ui4.js:9 | `Buttons are your money (you have 5). Tap the glowing long strip: it costs 3.` | `Buttons are money. You have 5. Tap the glowing strip: it costs 3.` |
| src/ui4.js:10 | `Drag it onto your quilt, or tap a square. Empty squares cost 2 points at the end.` | `Drag it onto your quilt. Each empty square costs 2 points.` |
| src/ui4.js:12 | `Whoever is further back on the track plays next. Tap Next and watch Marden.` | `The player further back goes next. Watch Marden play.` |
| src/ui4.js:13 | `Short on buttons? Tap Advance: jump just past Marden and take 1 button per space.` | `Out of buttons? Tap Advance to jump past Marden for buttons.` |
| src/ui4.js:14 | `Passing a gold spot pays the buttons on your patches. Most points when both reach the end wins.` | `Gold spots pay the buttons on your patches. Most points wins.` |
| src/ui4.js:92 | `Tied on points. You reached the end first, so you win the tie-break.` | `Tied on points. You finished first, so you win.` |
| src/ui4.js:92 | ` reached the end first and wins the tie-break, so this is a loss.` | ` finished first and wins the tie, so you lose.` |
| src/ui4.js:95 | `Stars are only earned on a win.` | `You only earn stars for a win.` |
| src/ui4.js:113 | ` fits well and is worth ` | ` fits well and saves ` |
| src/ui4.js:113 | ` points of squares.` | ` points.` |
| src/ui4.js:122 | `Tap one of three patches to buy it, or Advance to earn buttons.` | `Tap a patch to buy it, or Advance for buttons.` |
| src/ui4.js:122 | `Drag it on your quilt, rotate if needed, then Sew it on.` | `Drag it onto your quilt, rotate it, then tap Sew it on.` |
| src/ui4.js:122 | `Tap any empty square for your free 1 by 1 patch.` | `Tap an empty square for your free 1×1 patch.` |
| src/ui4.js:123 | `Buy a patch with buttons, or advance your token to earn buttons.` | `Buy a patch, or Advance to earn buttons.` |
| src/ui4.js:123 | `title: 'Button spots'` | `title: 'Gold spots'` |
| src/ui4.js:123 | `Buttons plus 7 bonus, minus 2 per empty square.` | `Buttons, plus 7 for a 7×7 block, minus 2 per empty square.` |

Note: for the ui2.js:77 row, the old text follows a computed "+N button(s)" prefix, so the result reads "+3 buttons: from a gold spot". Curly quote and ×/− characters are literal in the new lines.

Lines fixed: 70
