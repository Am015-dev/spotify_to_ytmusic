# COLD review: cauldron-fair (branch shelf/W586-cauldron-strict, 234fb54c)

Played as a newcomer from a quick build (`--quick`), served locally. Phone = Chromium touch 375x667, PC = 1366x768 mouse.
Driven by scripts, so I did not feel real hesitation or fat-finger problems. My bot never shopped in the full games, so the market was only seen in the tutorial.

## Could I play it?
- **Phone: yes.** Menu is clear (Learn in 5 minutes / Play / table size / rivals). The tutorial is 30 steps and took about 40 s of taps. Every step had a glowing ring on the thing to tap and a short bubble. It ends with "You know the basics: Play a real game". A full 9-day game against one computer rival took about 70 s with a dumb bot.
- **PC: yes.** Days 1-3 played fine. Board on the left, sidebar on the right with bag, odds ("0 of 9 chips would explode"), fortune card and Draw/Stop.
- No page errors in the console on either size.

## Fun: 3 of 5
Push-your-luck with the meter is simple and tense. "Stop here: score this space; a ruby on it pays one" explains stopping well. I lost 20 to 50 because my bot never shopped, which also shows the rival's lead snowballs fast if you do not buy.
What keeps it from a 4: the day-summary screens and the waiting on later days happen a lot, and the board is busy (see below).

## Would I play again?
Probably once or twice more, to learn the shop. Not yet sure it pulls me back.

## What confused me
- The goal is told twice: in the tutorial's first bubble and again on the goal card of a real game.
- Board numbers: every space shows two numbers (a large one plus a small one in a brown tag). A newcomer cannot tell which is which until the tutorial explains it. On PC the stacked double labels look like a rendering error.
- Rat fortunes (Rat Bribe, Rat Bounty) and Swap Stall appear with no preview of what a rat is. Day 9 "Rat Bribe: back up to 2, rubies each" was a three-way choice I did not understand.
- After I stopped, the screen sometimes showed the rival's cauldron with a big green "Back to your cauldron" button. A human would work it out, but it made my bot stall once.

## What felt slow
- After you stop, you wait ("Waiting for others...", "Odo is choosing") with nothing to do, roughly 5-10 s per day on later days.
- The tutorial's forced explosion on step 9 takes about 4 s before Next appears.

## Broken or clipped
- Phone, day 1 fortune choice: the options sit at the very bottom, and on 375x667 the second option is partly under the screen edge until the panel finishes sliding.
- PC: the "15 VP 35" tile at the bottom of the board is partly covered by the Do-Over toast, and the toast overlaps the "Your turn" bar.
- End screen on phone is a scroll: the text says who won, but the winner banner and play-again buttons were below the fold in my screenshot.
- Phone tutorial bubble covers the thing it describes a few times (the stalls step).

## 404 list on load (all under /cauldron-fair/)
- media/bag-moss.webp
- media/bag-ember.webp
- media/end-win.webp
- media/end-lose.webp
- media/table-phone.webp
- media/title-phone.webp
- media/ui-topbar.webp
- media/ui-iconbtn.webp
- media/ui-panel-c.webp
- media/ui-button-power-c.webp
- media/ui-button-cream-c.webp
- media/ui-button-go-c.webp
- media/ui-drawer-head.webp
- media/ui-node-open.webp
- models/chip.webp
- models/bag.webp

Do they matter? These came from a quick build whose output folder holds only index.html, so they may be missing only here. The page still showed a title scene, board and buttons on phone, and I saw no broken-image icons, so there is a fallback. If the live site has the same 404s, the end win/lose art and phone title/table art may be missing. Check on the live build.
