# r3 casual playtest log
D=playtest-shots/r3-9361
002.png | Menu: Guided first game preselected, mission board, Start job 1 big orange | tap Start job 1 | 5 | lots of locked missions below, "Field days" header cut | 3
003-195_722.png | Job intro: cut all 24 wires, fuse 3 misses, me Amber/Teal/Plum(foreman) | Continue | 4 | 3D table tiny, can't read wires on it | 3
004-85_494.png | Place opening info token on one of my wires (3,3,4,4,5,6) | pick 6 (held once, hint says) | 4 | why is it "Plum shows one wire" banner when it's me? | 3
005-304_502.png | Plum thinking, my 6 shows a token | wait | 3 | screenshot lagged the tip that appeared | 3
006.png | Tip: dual cut = tap glowing crewmate wire, say number you hold. Plum solo-cut four 2s | Got it | 4 | where are crewmate wires? only tiny 3D racks | 3
007-55_565.png | My turn: "Tap a crewmate's wire" - Suggest/Twin Probe buttons | Suggest (biggest obvious) | 3 | can't find crewmate wires to tap; table is tiny, no list | 2
008-101_513.png | Suggest picked Plum wire F, "certain 6", Snip say 6 | Snip | 5 | | 3
009-195_678.png | Hit! 6/24 cut | Got it | 5 | | 3
011.png | "You played SNIP!" recap | Continue | 5 | | 3
013.png | 10/24; Teal solo-cut 6s, Plum hit Teal 5 | tap Teal chip to see their rack | 3 | only found rack view by accident via the name chip | 3
014-171_536.png | Zoomed Teal rack: F6 E6 D5 cut, C B A hidden; "sorted low->high from A" but A drawn on right | tap C | 3 | letters read right-to-left, F on left - backward | 3
015-228_195.png | Call a value at Teal C: 3/4/5 | guess 4 (biggest left) | 2 | | 3
017-195_678.png | BUZZ miss - C is 3. Fuse 3->2 (MY fault) | Got it | 4 | | 2
021.png | 14/24, 1s/2s/6s done; Teal hit Plum 1, Plum solo 1s | open Teal rack, hit the revealed 3 | 4 | | 3
022-171_567.png | Teal rack shows my miss token "3" at C | tap C, say 3 | 5 | | 3
025-195_678.png | Hit, 16/24 | Continue | 5 | | 4
027.png | 20/24; crewmates hit MY wires (3s, 4s) - felt passive | Suggest | 4 | | 3
028-101_498.png | Suggest shows 4 = 100% | Snip say 4 | 5 | | 3
031.png | Hit, 22/24 | Continue | 5 | | 3
033.png | DEFUSED! 12 turns, 1 miss (mine), last 5s cut without me | Next job: 2 | 5 | the final 5s got cut off-screen; didn't see who | 3.5
034-93_643.png | Job 2 intro: 34 wires, 2 yellows, I'm foreman with 18 wires on 2 racks | Continue | 4 | where are my yellows? | 3
035-85_494.png | Pick opening token; two stands shown; every value held 2+ | pick 7 | 3 | no yellow wires visible in my hand; hint "once or twice" didn't help | 3
038-55_565.png | My turn; my rack row cut off at right (8 H half visible, stand 2 hidden) | Suggest | 3 | my own wires overflow off-screen; must scroll sideways? | 3
039-101_498.png | Suggest: 8 at 100% | Snip 8 | 5 | | 3
041.png | Same "Both wires are cut" tip again in job 2 | Got it | 4 | repeated tutorial tip | 2
044.png | 6/34; crewmates hit my 8 and 7 | open Teal rack | 4 | | 3
045-196_552.png | Teal rack zoomed - cropped, A and H off-screen; a 7 token at G | pan left | 3 | rack too wide to see all at once | 3
050.png | Hit Teal G=7, all 7s done, 8/34 | Continue | 5 | | 3.5
052.png | Yellows both cut by Teal/Plum; solo-cut tip | Got it | 4 | never saw a yellow wire myself | 3
053-55_585.png | "Solo cut 1" button appeared | tap it (big) | 4 | | 3.5
056.png | 16/34; Teal MISSED on my wire saying 6 -> fuse 2 (TEAL's fault); Plum hit my 6 | Suggest | 4 | which of my wires did Teal point at? no marker I can see in my row | 3
057-101_498.png | Suggest: 2 at 100% | Snip 2 | 5 | | 3
060.png | 22/34, two orange "Solo cut 3 / Solo cut 5" buttons | Solo cut 3 | 5 | big SNIP! burst over the table hides it | 3.5
063.png | 28/34, crewmates hit my 2s and 4s | Solo cut 5 | 5 | /tap?text=Continue timed out (overlay auto-dismissed) | 3
066.png | DEFUSED job 2: 18 turns, 1 miss (Teal's), 14/15 dual hits | stop (2 games done) | 5 | | 3

## Summary
1. Goal: co-op bomb defusal. Everyone has a sorted rack of numbered wires; the crew must cut all wires before 3 misses burn the fuse. On your turn you point at a crewmate's hidden wire and name a value you hold yourself (dual cut): right = both cut, wrong = fuse -1 and their real number is revealed. If you hold all remaining copies of a value you can solo-cut them. Turns rotate foreman -> crewmates (bots).
2. Game 1 (Boot Camp I): WON, 12 turns, 1 miss. Fuse step lost: me (guessed 4 on Teal C, was 3, 017-195_678.png). Recovered by using the revealed 3 + Suggest's "certain" picks. Bots did most of the work (hit my wires repeatedly).
   Game 2 (Boot Camp II): WON, 18 turns, 1 miss. Fuse step lost: Teal (bot) said "6" on my wire and missed (056.png). Won via Suggest 100% calls plus two solo-cut buttons; bots cut both yellows.
3. Confusions: (1) can't find crewmate wires to tap - 3D table tiny, only discovered name chip opens rack (007-55_565.png); (2) rack letters drawn F..A left-to-right while text says "sorted low->high from A" (014-171_536.png); (3) zoomed rack cropped, needs panning (045-196_552.png); (4) my own wire row overflows off right edge, stand 2 never visible during play (038-55_565.png); (5) job 2 says yellows but I had none - never learned how they look (035-85_494.png); (6) Teal missed on "my wire" but no visible marker of which (056.png); (7) opening-token hint "value held once or twice" when everything held 2+ (035-85_494.png); (8) "Plum shows one wire" banner while I'm asked to place mine (004-85_494.png); (9) same tutorial tip repeated in job 2 (041.png); (10) Twin Probe button never explained, ignored it (007-55_565.png).
4. What just happened: 033.png - final 5s got cut and game ended without me seeing who did it; 013.png/027.png - several bot turns resolved between my taps, only a 2-line recap; 060.png - SNIP burst covering table.
5. Too much: bottom panel stacks status line + Suggest/Twin Probe + 3 crew chips + my rack + Job/Foreman chips; recap banners overlap the 3D table (056.png).
6. Hidden: my stand 2 and wire H cut off at right (038-55_565.png); Teal rack ends off-screen (045-196_552.png); mission board list below the fold on menu (002.png).
7. Fun 3/5: Suggest makes it near-autopilot - easy wins but I rarely thought; would press Play once more to see if harder jobs make me reason.
