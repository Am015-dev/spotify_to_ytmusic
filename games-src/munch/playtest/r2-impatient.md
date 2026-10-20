# Playtest r2 - impatient persona (Doorkick Dungeon, me = "Pip" vs 3 computers, Normal)
Shots in /tmp/claude-0/-home-user-spotify-to-ytmusic/61aa2836-4f6e-5746-8b8d-f8a3978c0560/scratchpad/playtest/r2-9344/

| step | screenshot | what I think is happening | what I'd do | conf | confusion | fun |
|---|---|---|---|---|---|---|
| 1 | 002-open.png | Menu. Teach toggle was ON (green tick). | turned it OFF, Start | 5 | none, nice | 3 |
| 2 | 004-104_729.png | Header says "Grub's turn", my panel says "Pip". Who am I? | wait | 2 | Name mismatch: top bar shows Morwen/Grub/Tansy, I am a 4th hero "Pip" not in the bar | 2 |
| 3 | 005-wait.png | Setup phase, big "Play suggested cards (5)" | tap it | 4 | Which of the 4 players is the highlighted one? | 3 |
| 4 | 006-148_572.png | It played Dwarf, Porter, Rapier, Shiv, a level potion. Strength 1->2 | Ready | 3 | Rapier +3 shown greyed and strength stayed 2; why? | 3 |
| 5 | 010-wait.png | Prompt to curse Tansy before her door | cursed her w/ Utterly Rotten Hex | 3 | "Tansy is level with you" - unexplained consequence; she went to Lv3 then Lv1 | 4 |
| 6 | 013-wait.png | My turn, hint button "Play suggested card (1)" | tapped it | 2 | It SOLD both of my +3 weapons for a level. I did not know that was what it would do | 2 |
| 7 | 015-195_572.png | Kicked door: Family Tree Hex curse, lost Dwarf. Offered "Fight Sock Slurper from hand" | fight from hand | 3 | Why can I fight from hand? | 3 |
| 8 | 017-195_653.png | A computer added Barfabunny to my fight: 3 vs 7 | play Tiny -5 on it | 4 | Fight panel is tiny, "strength 1/6" labels under monsters ambiguous | 4 |
| 9 | 020-195_572.png | Computer played Genius +5 on Sock Slurper, I lose, 11% run | run | 4 | Loss felt unfair but readable | 3 |
| 10 | 021-195_572.png | Caught: lost a level, hand discarded (Bad Stuff x2) | end turn | 4 | Banner covers board | 2 |
| 11 | 028-wait.png | Morwen fighting 9 vs 8, I hold Furious +5 | boosted Morwen's monster (spite) | 4 | Hint says "Morwen is ahead of you: boost monster" - good hint | 4 |
| 12 | 041-wait.png | Grub fighting, tie 4 vs 4 "Grub wins" | let it be | 3 | Ties go to hero, not said | 3 |
| 13 | 050.png | Kicked Rotten Luck curse, lost level -> Lv1 | end turn | 4 | none | 2 |
| 14 | 056-195_572.png | Drew Warrior; 7 cards in hand, buttons cut off at bottom | loot | 3 | Fight buttons list runs off screen | 2 |
| 15 | 060.png | Hand limit 7 vs 5, "you are the lowest level" so must discard | discard 2 | 3 | Tap card -> sheet -> Discard: 2 taps per card; sheet layout moves (Discard at y=535 vs 470) so my second tap missed | 2 |
| 16 | 068-195_572.png | Turbo Slugs 4 vs my 1, run away "impossible" | Ask for help | 2 | Why impossible? (Cleric? not explained) | 2 |
| 17 | 070-wait.png | Help panel: lists each hero, strength, "will say yes for N". Very clear | offer 0 to Grub | 5 | none | 5 |
| 18 | 077-wait.png | Victory +1 level +2 treasures (Grub helped). Hand 7/5 again | discard | 4 | none | 4 |
| 19 | 088-wait.png | Opponent escaped; I can "Stick them" with Sticky Paste | stick | 4 | fun - back-stabbing | 5 |
| 20 | 091-195_572.png | Tax Collector curse; had Ring of Undoing: "Cancel the curse" | cancel | 5 | none (nice moment) | 5 |
| 21 | 105-195_572.png | Pharaoh Wrappington 16 vs my 2; run away (sure) because Cleric/undead | run away | 4 | "Class power: tap a card in hand to turn undead" is tiny grey text | 3 |
| 22 | 109.png | Escaped w/ no penalty. End. Morwen Lv5 leading, me Lv2 | stop (action budget of time) | - | - | 3 |

Waiting for computer between my turns took 2-3 waits (~15-25 s) every time; "Let X go on" prompts also block, and one wait stalled until I tapped it.

## 1. Goal and one turn
First hero to Lv10 wins; last level only from killing a monster. A turn: set up (play race/class/gear), optionally curse/boost others, kick the door: monster = fight (add cards, ask help, or run), curse = hit you, other card = goes to hand; if no monster, loot a card or fight a monster from hand. Then end turn and discard down to hand limit. Other players can wreck your fights with +5s and curses.

## 2. Fights
- Fight 1 (Sock Slurper+Barfabunny, turn 3): LOST. I weakened one monster, but a computer played Genius +5, I had no cards left (also my gear had been auto-sold). Run chance 11%, caught, lost a level.
- Fight 2 (Turbo Slugs 4 vs me 1): WON only because Grub helped for 0 treasures. Run was "impossible".
- Fight 3 (Pharaoh 16 vs 2): did not fight, ran away automatically (sure). 
- No kills by my own strength all game.

## 3. Top 10 confusion moments
1. r2-9344/004-104_729.png Header "Grub's turn" while my hero is "Pip" and top bar lacks me.
2. r2-9344/014-195_572.png "Play suggested card" sold my two +3 weapons for a level without warning.
3. r2-9344/006-148_572.png Rapier shown grey, strength not +3 (equipping vs carried?).
4. r2-9344/068-195_572.png "Run away (impossible)" with no reason.
5. r2-9344/060.png Hand limit 5 while hint earlier said Dwarf lets you hold 6; "you are the lowest level" rule oddly stated.
6. r2-9344/082-wait.png Discard flow changes layout; second tap lands on wrong thing.
7. r2-9344/056-195_572.png Fight-from-hand buttons off-screen, overlapping hand cards.
8. r2-9344/012-284_604.png Curse Tansy: she gained a level the same moment (3) then dropped to 1; cause unclear.
9. r2-9344/105-195_572.png Cleric turn-undead tip is faint grey text.
10. r2-9344/088-wait.png "Grub rolled 5+3=8 made it (needed 5)" - roll bonus origin unclear.

## 4. "What just happened?"
- 012 -> 013: Tansy Lv 2 -> 3 -> 1 while my Porter ended in the discard; I never saw the full sequence (only a "While you waited" summary).
- 014: strength 2 -> 3 and level 2 -> 3 from selling gear - only explained after the fact.
- 015: Dwarf vanished from my panel via Family Tree Hex; strength dropped silently.
- 066: Morwen jumped 3 -> 4 -> 5 -> Lv5 fast (selling items); I could not see why.
- 090: Grub's "Stick them" result: no visible outcome shown.

## 5. Too much on screen
Fight screen: monster card, two number badges, strength labels, side discard pile cards, banner text and hint box all at once. Hint box + log + button stack at bottom is long (text cut at screen bottom, e.g. 013). Hand fan overlaps card names.

## 6. Hidden / cut off
- "Fight X from your hand" buttons beyond first 2-3 are off-screen (056: Uranium Wyrm button at y=763).
- "While you waited" log is cut off at bottom (013).
- My own hero is not in the top player bar (only 3 shown of 4).
- Discard dialog Discard button position moves.

## 7. Fun verdict
3 out of 5. Ask-for-help panel, Ring of Undoing, and sticky paste backstabs are great, but auto-suggest selling my gear, repeated curse losses, long computer waits and the opaque run/cleric rules made it feel like others play and I watch. I would press Play again, but mostly to see if I could win a fight on my own.
