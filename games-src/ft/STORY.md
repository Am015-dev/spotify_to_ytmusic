# Sands of Qamar: cast and story arc

All story text lives in two data files: `src/lore.js` (tutorial prologue, result lines, quick-game intro) and `campaign.json` (Story mode: cast, acts, chapter intros and outros). Original names only.

## Cast
- **Hadiya** (guide, 🧓): old tent-keeper of the bazaar, warm and dry. Teaches the prologue and opens Story mode.
- **Farid the Water-Boy** (rival of the prologue and chapter 1, 🧒): wants the throne to pay for a well for his village.
- Story mode cast (see campaign.json): Layla Coin-Counter, Yusra of the Copper Scales (boss), Master Tahir, Sabah the Silk-Seller, Grand Advisor Marwan (boss), Zubaida of the Lamp, Qays and Kamil, Nimr of the Night Roads, Qadira the Uncrowned (final boss).

## Arc in three acts (campaign.json)
1. **The Empty Throne** (chapters 1-3): the Sultan died with no heir. You learn to walk the tribes, bid for order, trade. Boss: Yusra, who weighs everything.
2. **The Bazaar Wars** (chapters 4-6): Crafters, cutpurses and wonder cities crowd the sultanate. Boss: Marwan, the patient Advisor.
3. **Night of the Djinns** (chapters 7-10): the strongest claimants play to win; only one takes the throne. Boss: Qadira the Uncrowned.

## Prologue (tutorial) in four chapters
Each step has a story reason from the guide, then the action, then a reaction (shown as a small portrait card, ~2.5 s). The glow shows where to tap; the words never say "click".
1. **Empty Throne**: the throne is empty, five tribes, bidding for the walk order. Payoff: Farid's first walk wins a djinn.
2. **First Walk**: lift, drop, land on your colour, Traders, claim with a camel, buy at the Stall, sell a set. Payoff: "Thirteen coins. The throne feels closer!"
3. **Rival Moves**: Farid plants a palm with his Advisors; you walk Advisors and a Mason, earn coins, raise a palace.
4. **The Count**: the final count with everything that scores, the other tile gifts, Shadows, how a real game ends.

## Quick game and results
Quick game opens with a banner "Bid for turn order" and one flavour line; each turn opens with a banner ("Your turn" / "<Rival>'s turn"). The result screen opens with a line in the game's voice (win and loss variants in `LORE.win` / `LORE.lose`).

## Limits (honest)
- Story mode outros play on a win only (the shared story kit decides that, `shell/gx-campaign.js`, read-only for this task); a loss shows the voice line on the result screen and returns to the map.
