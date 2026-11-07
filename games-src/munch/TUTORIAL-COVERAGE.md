# Tutorial coverage (Doorkick Dungeon)

The tutorial is one real, fixed-deal game (you, Morwen and Grub, against the real engine and the real computer players), played from setup to the result screen.
Four chapters, shown as a pill under the progress bar. Gate: `node tutor-end.js 390x763,1440x860` plays all 26 steps by tapping each spotlit element's centre
(checks elementFromPoint at the centre is not covered by the kit), reaches a real win (level 10 by a monster kill), the result screen and the end card, and asserts every step id below was shown.

Legend: [do] = the player does it, [see] = shown on screen / explained in the step text, [no] = NOT covered (the in-game lightbulb and the Rules drawer cover it).

## Chapter 1: Set up your hero (goal, elf, powers, bucket, ready, sellbtn, sellpick, sellconfirm)
- [x] Goal: first to level 10 .................................... goal [see]
- [x] Last level only from killing a monster ........................ goal [see], last + finalfight [do], finale [see]
- [x] Start: level 1, 4 door + 4 treasure cards, set up before the first door . ready [do], elf [do]
- [x] Play a race card on your hero (races give powers) ............. elf [do]
- [x] Classes: Warrior wins ties, Wizard flees, Thief steals, Cleric vs undead . powers [see] (not played)
- [x] Items add strength, wear automatically ....................... bucket [do]
- [x] Sell items worth 1,000 gold for a level ...................... sellbtn, sellpick, sellconfirm [do]
## Chapter 2: Your first fight (kick, potion, run, bad, end1)
- [x] Kick open the door: a monster means a fight ................... kick [do]
- [x] Strength = level + gear; higher wins; ties go to the monster ... potion, fight text [see]
- [x] One-shot potion adds to your side ............................. potion [do]
- [x] Run away: roll 5 or 6 (Elf +1) ................................ run [do]
- [x] Failed run: Bad Stuff ........................................ bad [see] (lost hat)
- [x] End turn: wear or sell more first ............................ end1 [do]
## Chapter 3: Rivals and special cases (curse, meddle, rivals, kick2, trouble, help, who, fight, win, charity)
- [x] Curses can be played on any rival before their door .......... curse [do]
- [x] Anyone may meddle in someone else's fight (monster boost) ...... meddle [do]
- [x] The computer follows the same rules ............................ rivals [see] (watch Morwen and Grub, step captions)
- [x] A non-monster door card goes to your hand ...................... kick2 [see]
- [x] No monster: look for trouble (fight one from your hand) or loot .. trouble [do] (loot named)
- [x] Ask a rival for help; a helper adds strength; an Elf helps free .... help, who, fight [do]
- [x] Win: +1 level and treasure; Treasure Pile draws 3 .............. win [see]
- [x] Charity: hand limit 5, extras go to the lowest level ............ charity [do]
## Chapter 4: Ending the game (last, finalfight, finale)
- [x] Time skip to level 9 (marked as such), kick a weak monster ....... last [do]
- [x] Beat it: level 10 by a monster kill ends the game ............... finalfight [do]
- [x] Result screen: levels, kills, helps, deaths, curses ............. finale [see]

## NOT covered (honest list; reachable through the lightbulb and the Rules drawer)
- [no] Death and the other players looting your corpse; coming back with 4+4 cards.
- [no] Several monsters in one fight; monster-specific special texts; Undead/Cleric.
- [no] Item slot limits (one headgear, one armor, one footgear, two hands), Big items, race/class/sex item restrictions.
- [no] Halfling double sell price; "can't sell to reach level 10"; go-up-a-level cards stopping at level 9.
- [no] Playing a class or second race (Double Major, Mixed Heritage); Loophole; Uninvited Guest; Level Heist.
- [no] Chapters are labelled but not separately resumable: leaving half way offers "restart" or "exit" (the shared tutorial kit restarts from step 1).
