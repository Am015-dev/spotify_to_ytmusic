# Deep Signal rules notes (own words)

Co-operative trick taking for 2-5 players; everyone wins or loses together.

## Components
- 40 cards: four colours (Coral, Kelp, Tide, Amber) ranked 1-9, plus four Sonar trumps 1-4.
- 36 task cards, one per coloured card (no sonar tasks). Order tokens 1-5, arrows > >> >>> >>>>, and the final seal Ω.
- One signal (radio) token per player; a flare (distress signal) per mission.

## Setup and play
- Deal all cards: 5 players 8 each, 4 players 10, 3 players 14/13/13 (the last card of the long hand is never played).
- 2 players: each gets 13; the drone gets 7 stacks of 2 (bottom hidden, top face up). The captain's seat plays for the drone;
  a stack's hidden card turns up when its top is played. If the drone holds Sonar 4 it leads, and seat 0 plays for it.
- The holder of Sonar 4 is captain and leads the first trick.
- Tasks: reveal the mission's task cards; starting with the captain, each player takes one in turn until all are taken.
  The first tasks drawn carry the mission's tokens.
- Follow the led colour if you can; otherwise play anything. A sonar wins (highest sonar); else the highest card of the led colour.
  The winner leads next.
- A task is done when its owner wins the trick that holds its card. If anyone else wins it, the mission fails at once.
- Tokens: 1-5 = that exact place in the order tasks are done; arrows = relative order among arrow tasks; Ω = the last task.
  Tasks done in the same trick are ordered in the most favourable way.
- Signals: once per mission, before a trick starts (no card led yet), a player may show one coloured card from hand, saying it is
  their highest, only or lowest of that colour. The card stays in hand and is played normally. No sonars.
- Flare: before the first trick the crew may pass one non-sonar card each, all left or all right. It costs the "No flare" star.

## Confirmed vs guessed
- Confirmed (base rules): deck, deal, captain, follow suit, trumps, task drafting, token meanings, signal positions, one signal
  each, no sonar signals, flare before the first trick, drone rules for 2 players, special mission types (silence/dead zone,
  captain decides, captain distributes evenly, one player wins no tricks).
- Guessed / simplified: a 3-player game ends when the short hands run out (the leftover card is never played; a task on it
  fails); simultaneous completions use the most favourable order; the flare passes one card per crew member (the drone does
  not pass); "captain decides" gives every task of that mission to one crew member; the 50 missions are original (same kinds
  of rules and growth, not copies).

## Rulebook cross-check (7 Nov 2026, addendum 2)
Checked against an online rules summary (https://lehi-innovation.github.io/boardgame-rules/rules/the-crew-the-quest-for-planet-nine/)
and the published rulebook/FAQ search results (rulebook PDFs found online, rulespal FAQ):
- Signals: once per mission, never during a trick, no trumps, top = highest / middle = only / bottom = lowest: matches.
- Dead zone: card shown, position not given: matches (`'?'`). Disrupted communication for the first tricks: matches `late2`/`late3`.
- Distress signal: allowed only BEFORE any communication; everyone passes one non-trump card the same way; +1 attempt:
  MISMATCH FIXED. The engine allowed a flare after signals; now `canFlare` requires no signal yet, and the game offers
  "Dive on / Send a flare" right after the draft, before any crew signal (the star replaces the attempt count).
- 3 players: one card stays unplayed: matches.
- Captain's decision (all tasks to one other player) and captain's distribution (yes/no questions, even split): match.
- Order tokens: numbers strict, arrows relative, Ω last: match.
- Card counts (40 cards, 36 task cards, tokens) checked against the components list of the same pages; no print-and-play art was used.
