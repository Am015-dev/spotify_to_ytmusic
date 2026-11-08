# G8 gameplay review (strict), 8 Nov 2026

Reviewer G8. I scored by `GAMEPLAY-RUBRIC.md` and changed no game code.
Builds: `doorkick-dungeon` from `shelf/W502-doorkick-gameplay` @ 7d4bfabe (`games-src/munch/build.py`), `hollowbough` from
`shelf/W482-hollowbough` @ f1e3476d (`games-src/hollowbough/game/build.py`). Each built page was served next to its `games/<slug>/media`.
I played with Playwright real touch (`page.touchscreen.tap` and CDP touch drags), isMobile, at 390x844 and 375x667.
I checked the rules against the published rulebooks online (notes kept outside the repo).
Screenshots are in `games-src/reviews/G8-shots/`.

How I played: a new player who taps whatever glows. In the tutorial I tapped the spotlight ring or Next. In real games I took the game's own lightbulb
suggestion (from where it points, to where it points) and otherwise pressed the obvious button. No engine calls made moves, and AI speed was left at default.

---

## 1. doorkick-dungeon: 5.8, FAIL

| # | Row | Score |
|---|-----|------:|
| 1 | Rules fidelity | 7 |
| 2 | Tutorial teaches | 7 |
| 3 | First 10 seconds | 6 |
| 4 | Turn clarity | 5 |
| 5 | Phone play | 5 |
| 6 | AI and pacing | 6 |
| 7 | Feel | 7 |
| 8 | Bugs | 3 |
| | **Total** | **5.8 FAIL** |

What I played:
- Tutorial: 27/27 steps at both sizes, 0 console errors.
- Real games (vs computer, 4 heroes, Normal), three attempts by touch:
  - At 7 min I was level 3 against a rival on 5 (the run ended stuck, see 8a).
  - A second run ended stuck at 3 min (see 8a).
  - In the third, after 10 min I was at level 9 of 10 with a rival on 8. Then it stuck again (8a).
- None reached the result screen. The 10-minute run shows the race is close and a new player can get near a win.

Rules check: these match the published turn:
- kick the door; a door curse hits at once;
- fight or run (5+, and an elf gets +1);
- a monster gives levels and treasure; Bad Stuff;
- look for trouble or loot, skipped after a fight;
- charity down to 5, extras to the lowest level;
- sell 1,000 gold for a level, but never the winning level;
- anyone may meddle; help in exchange for treasure;
- the dead are looted.
I found no missing core rule.

Findings:

| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 8 (possible stopper) | In 2 of 3 games I tapped an equipped item chip, which opened the card panel. Then for 60+ taps I tried the panel's × and End turn. | The card panel (Brave Bucket, Wall-Sized Shield) stayed over the action bar. End turn (`end` was a legal move) could not be reached and the turn never moved: once at level 9/10 in the post-fight phase, once in a "loot one card from Tansy's body" pick. I could not confirm in the time cap whether the × tap is dead or my driver tapped a hidden "Got it". The builder must reproduce it: open an item panel during your own post-fight phase, tap ×, then End turn. | `G8-shots/dk-play-lv9-panel-stuck-390.jpg` |
| 8 | Game 1, a rival's fight while I was a Thief. I tapped Let it be. | The state did not change over 40 polls (the backstab/pass prompt stayed). This happened while other panels were open, so it is not proven. | (stuck shot overwritten; see log notes above) |
| 4 | Looked at my hand in combat and in the gear phase | Fanned hand cards show as blank gold or brown faces. Only the last card's face is readable, so I could not see what I held. | `G8-shots/dk-tut-02-390.jpg`, `G8-shots/dk-play-09-390.jpg` |
| 4 | Read card names in the hand strip | Names are cut mid-word: "Gargant", "Litigatio Lizards", "Swashbu Shield", "Backstai Shiv", monster "Hairy Hat-...". | `G8-shots/dk-tut-12-390.jpg`, `G8-shots/dk-tut-14-390.jpg` |
| 4 | A rival kicked a curse (Career Crisis) | The big "CURSED!" banner and its text sit over MY item strip and are cut off ("With no class"). It reads as if I was cursed. | `G8-shots/dk-play-09-390.jpg` |
| 2/1 | Tutorial step 11 "Too strong: run!" | The text says "5 or 6 escapes", but the button says "Run 50%" (correct for the elf's +1, which means 4+). The tutorial teaches the wrong number for the hero it just made an elf. | `G8-shots/dk-tut-12-390.jpg` |
| 5 | Tutorial step 10 at 375x667 | The 3D door-kick animation covers the fight: the monster is hidden, Run/Help show through the door, and "+1 Lv" is cut at the left edge. | `G8-shots/dk-tut-12-375.jpg` |
| 5 | Tutorial start | A big floating "+2 Lv +2 Lv" sits over the top bar and the Skip tutorial button. | `G8-shots/dk-01-tut.jpg` |
| 5 | Fight screen | The strength badge covers "Pip (You)". The "went into Grub's ha…" caption is cut. | `G8-shots/dk-tut-14-390.jpg`, `G8-shots/dk-tut-22-390.jpg` |
| 3 | Quick game at 390x844 | The Start button is below the fold, so the panel must be scrolled. The game then opens with a 4-bullet "How to win" card and an 8-card gear phase. | `G8-shots/dk-g00-quick.jpg` |
| 6 | Watched computer turns | The rivals play sensibly and every step is shown, but each rival turn takes about 15-20 s. A game is more than 10 min with 4 heroes, and the door deck ran 78 to 24 in about 5 min. | `G8-shots/dk-play-late-390.jpg` |
| 7 | Whole game | Strong painted art, door kick, dice, CURSED banner and floating levels. This feels like a game. | `G8-shots/dk-00-open.jpg`, `G8-shots/dk-play-05-390.jpg` |

---

## 2. hollowbough: 6.9, FAIL

| # | Row | Score |
|---|-----|------:|
| 1 | Rules fidelity | 8 |
| 2 | Tutorial teaches | 8 |
| 3 | First 10 seconds | 7 |
| 4 | Turn clarity | 6 |
| 5 | Phone play | 6 |
| 6 | AI and pacing | 7 |
| 7 | Feel | 6 |
| 8 | Bugs | 7 |
| | **Total** | **6.9 FAIL** |

What I played:
- Tutorial: 27/27 steps at both sizes, 0 errors.
- Two full games vs computer (Normal), both by touch drag and tap, both to the result screen with 0 errors and 0 stuck states:
  - 390x844: I won 38-35 (101 s, 20 drags, 58 taps).
  - 375x667: I won 57-30 (96 s, 16 drags, 72 taps).

Rules check: these match the rulebook:
- seasons: start with 2 workers; Spring +1 and green cards pay; Summer +1 and draw 2 meadow cards; Autumn +2 and green cards pay;
- 8 meadow cards, a 15-card city, a hand of 8;
- shared and unshared places;
- forest places;
- basic and special events;
- Haven (2 cards for 1 good);
- Journey in Autumn only;
- a free critter on its paired building;
- the Inn;
- purple bonus points and the tie-break.

Findings:

| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 4 | Spring, after placing on a card that lets you repeat a place | The header reads only "Repeat a place?" (cut), the whole board greys out, and one button says "Do not use Dewdrop Belfry". There is no line saying what to tap or why. | `G8-shots/hb-play-020-390.jpg` |
| 4 | Autumn, discard step | The header instruction is cut: "Tap cards to discard, ...". | `G8-shots/hb-play-040-390.jpg` |
| 4 | Opened Goals | Special events read "Goal · ? points". The "?" is never explained, and the names are cut ("Vigil of Remembra", "Resident Minstrel"). | `G8-shots/hb-play-040-390.jpg` |
| 4 | "Pick a resource." | Four icon-only buttons, with no words and no reason for the pick. | `G8-shots/hb-play-040-375.jpg` |
| 5 | City and hand at 375x667 | Card names are cut: "Lorewoo College", "Gildenfe Court", "Slate Schoolmar", "Goodwi Vole". | `G8-shots/hb-play-mid-375.jpg` |
| 5 | Scored points | The floating "+1 … points" overlaps the score bar and reads as garbled "+1 c●llpoints". | `G8-shots/hb-play-mid-390.jpg` |
| 5 | Goals tab | Grey text on grey cards, about 13 px. Hard to read. | `G8-shots/hb-play-040-390.jpg` |
| 7 | Main board | The places are a grid of identical discs, each with a text label ("1 resin, 1 card"). It reads more like a menu than a forest. Meeple drags and point fly-ups help. | `G8-shots/hb-play-mid-390.jpg` |
| 7 | Result screen | It shows a static picture and two totals only. There is no per-category breakdown, so a new player cannot see why they won or lost. | `G8-shots/hb-play-result-390.jpg` |
| 6 | Whole game | The rival plays briskly and sensibly. A new player who follows the lightbulb wins (38-35, 57-30), which may be a little easy on Normal. A whole year takes under 2 min. | `G8-shots/hb-play-result-375.jpg` |
| 2 | Tutorial | 27 one-line steps, one tap each, in rule order, covering every core rule, then "Play a real game". Good, and much clearer than the version rejected before. | `G8-shots/hb-tut-02-390.jpg`, `G8-shots/hb-tut-end-390.jpg` |
| 3 | First screen | A painted goal card: "Most points after Autumn wins", then Start. Clear. | `G8-shots/hb-play-first-390.jpg` |

---

## Not tested
Online play, hot-seat and story mode. Doorkick was not played to a result at 375x667 (only the tutorial was played at that size).
