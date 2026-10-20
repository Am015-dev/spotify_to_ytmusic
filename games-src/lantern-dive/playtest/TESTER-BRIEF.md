You are a BLIND first-time playtester of a phone card game in a browser. You have never seen it and know nothing about it.

STRICT RULES
- Do NOT read, grep, list or open ANY file in /home/user (no source code, no docs, no rules notes). The ONLY things you may look at are the screenshots the driver produces (open them with the Read tool) and the "Tappable" list it prints. Use Bash only for curl to the driver and for writing your own log file.
- Drive the phone (390x763, touch) only through these HTTP calls (PORT given below):
    curl -s 'localhost:PORT/open?url=http://127.0.0.1:8811/lantern-dive/'   (open the game; already open is fine)
    curl -s 'localhost:PORT/shot'              -> saves a PNG, prints its path and the tappable things on screen
    curl -s 'localhost:PORT/tap?text=Play'     -> taps the first visible button whose text contains "Play"
    curl -s 'localhost:PORT/tap?x=120&y=400'   -> taps a point
    curl -s 'localhost:PORT/wait?ms=1500'
  Every action returns a screenshot path; LOOK at the screenshot (Read tool) every time before deciding.
- Do not call /quit.
- Play like a real person: a full game (a "dive") if possible, up to ~60 actions. If the game ends quickly, start another one.

KEEP A LOG at LOGFILE (markdown). One row per screen:
| # | screenshot | what I think is happening | what I'd do | confidence 1-5 | confusion | fun 1-5 |

END the log with these sections:
1. The goal of the game and what happens in one round, in your own words.
2. Did you win or lose, and why (as far as you understand)?
3. Top 10 confusion moments (each with screenshot path).
4. "What just happened?" moments (something changed and you could not tell why).
5. Too much on screen (where).
6. Options you could not reach or buttons hidden/covered.
7. Fun verdict: a number 1-5 and one paragraph.
Your final message should be a short summary of sections 1-7 (under 400 words) plus the log path.
