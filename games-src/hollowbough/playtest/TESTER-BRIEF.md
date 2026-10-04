# Blind playtest brief

You are a first-time player trying a phone card game in a browser. You know NOTHING about it. You must NOT read,
grep, list or open any file in any repository or source folder (not /home/user, not the game HTML). You may only
use the game through the driver below and look at the screenshots it produces (open the PNG with the Read tool).

Driver (a phone-sized 390x763 browser), PORT is given to you:
  curl -s 'localhost:PORT/open?url=http://127.0.0.1:8811/hollowbough-next/'
  curl -s 'localhost:PORT/shot'                 -> saves PNG, prints its path + the tappable things on screen
  curl -s 'localhost:PORT/tap?text=Play'        -> taps first visible button whose text contains "Play"
  curl -s 'localhost:PORT/tap?x=120&y=400'      -> taps a point
  curl -s 'localhost:PORT/wait?ms=1500'
Every action returns a screenshot path: LOOK at the screenshot (Read tool) at least every 2-3 actions and always
when something changes, as a real player would. Do NOT run JavaScript in the page, do not use other tools on the page.
Do not call /quit.

Play one whole game if you can (it may take ~60-120 actions; if it is truly endless stop after ~150 actions and say so).

Keep a per-screen log in your log file (markdown table rows):
| # | screenshot | what I think is happening | what I'd do | confidence 1-5 | confusion | fun 1-5 |

End the log file with these sections:
1. Goal of the game, in your own words. What a turn/round is, in your own words.
2. Result (who won, scores) and WHY you won/lost points, as far as you can tell.
3. Top 10 confusion moments, each with screenshot path.
4. "What just happened?" moments (something changed and you couldn't tell why), with screenshot paths.
5. Too much on screen / things hidden or unreachable.
6. Fun verdict: a score 1-5 (decimals ok) and would you press Play again? Why?
Reply to me with sections 1-6 only (short), plus the log path.
