# [FIXED3 short-fuse] report

Branch shelf/W570-short-fuse-strict, code commit 269717d7 (pushed, not deployed, no PR). The report trigger was refused, so this file is the report.

## Gates
- --quick: 9/9 scenarios. --full once: phone-check + quick sweep passed (lab WARN: lab rows != scenarios, pre-existing).
- rules-test 101/101, logic-test 157/157, gauntlet 22/24 wins, 0 errors/stalls. 1 helper (cold tester). No infinite animations added. games/lab.html restored, not committed.

## Changed
1. Wire hint labels ("2·4", "3-5", "≠4") are 15px on a dark pill, also in compact phone rows. Tapping a non-pick crew wire shows its full clue list (wiretips.js).
2. Double match says "Two of your 4s match: tap one to cut".
3. Phone top strip: one row (turn chip + scores); job/turn/action chips hidden under 640px; one row from 640px up.
4. Your turn: "Your turn: tap one of Teal's wires" on a yellow line.
5. PC: 2-3 crewmates side by side in one row (tbl.js + table.css), my stand big at the bottom, keys 1-9/Y/Enter.

Known gaps: PC centre still mostly empty and stands wrap to 2 rows; not every PC control audited for clickability; the 1920x1080 shot was not viewed by me; the 3-min webm skips the tutorial.

## Cold-play verdict (independent subagent, as-is)
Could play: yes, no real stuck points. Phone by touch: finished the 17-step tutorial, job 1 (24 wires, clean) and job 2 (34/34, 1 miss). PC by mouse: job 1 only up to 4/24 cut, then stopped, so the PC report is thin.
Fun 3.5/5. Would play again: yes, probably a few more jobs.
Confused: "Tap your red: never say red or point at one" (tutorial says tap the red wire, then warns never name it); tutorial says "his third wire" about Plum and prompts jump between "tap a glowing wire" and "tap your number"; after the tutorial, job 1 gives no hint which wires are safe; AI turns happen off-screen so after "Plum is thinking" several cuts appear and it can't tell who did what.
Text/layout: home tagline nearly invisible (pale on cream/orange); "Play" label dark brown on brown; Goal card shows an empty maroon circle; Defused card has a big empty dark-blue band at the top partly under the header buttons; on phone the tutorial bubble covers the top HUD/fuse/instruction on steps 1-2; job 2 on phone cramped, top of Teal stand slid under the header, stand tags tiny; fuse "+2"/"Fuse -1" popups overlap the job counter numbers; on PC the hand sits at the very bottom edge of 768px.
Phone vs PC: phone felt better (clear tutorial, big targets); PC has lots of empty space but is easier to read.

## Proof (games-src/short-fuse/proof/)
first-3-min-375x667.webm, f3-job2-375x667.png, f3-job2-375x553.png, f3-job2-1366x768.png, f3-job2-1920x1080.png
