# TEXT-PATCH (for the later UI pass; edit texts.js / ui.js, not done here)

Engine now: teams are 4, 6 or 8 players only (newGame rounds 2/3 up to 4 and 5/7 down to 4/6); Maelstrom-destroyed tiles leave the game; Rogue Wave / Maelstrom drawn at set-up count toward the 6/5/4 starting tiles.

## texts.js (rules drawer)

OLD: It destroys whatever it enters, leviathans included. It does not count towards the minimum of three.
NEW: It destroys whatever it enters, leviathans included. A current it destroys leaves the game for good (it does not go back to the pile), along with any junks on it. It does not count towards the minimum of three.

OLD: <b>Easy solo:</b> one junk; destroyed tiles are discarded, not recycled. <i>Our goal:</i> survive 24 turns, or play out the whole pile if that happens first.
NEW: <b>Easy solo:</b> one junk; destroyed tiles are discarded, not recycled. <i>Our variant:</i> start with four leviathans and survive 24 turns, or play out the whole pile if that happens first.

OLD: <b>Teams:</b> four or more captains in two teams (every other seat).
NEW: <b>Teams:</b> four, six or eight captains in two equal teams (every other seat).

(set-up paragraph, if one exists; else add to the Maelstrom/Wave bullets) NEW sentence: "A Rogue Wave or Maelstrom drawn while the starting leviathans are placed counts as one of the 6, 5 or 4 starting tiles."

In the "our guesses" list, optionally add: <li>Easy solo starts with four leviathans (our variant).</li>

## ui.js / ui4.js start screen (and net.js lobby)
- Teams: allow only np 4, 6, 8. Replace `if(s.variant==='teams'&&s.np<4)s.np=4` (ui.js:365, ui4.js:160) with `if(s.variant==='teams'&&![4,6,8].includes(s.np))s.np=s.np<4?4:s.np%2?s.np-1:s.np`; same coercion in the n/np computations at ui.js:343,380 / ui4.js:138,175, and make the player-count stepper step by 2 while Teams is selected.
- net.js:56 `s.variant==='teams'?4:2` -> clamp teams to an even count in {4,6,8} (e.g. `if(teams&&np%2)np--` after the min/max).
- Start-screen variant hint for Teams: "4, 6 or 8 captains". For Easy solo: "4 leviathans, 24 turns (our variant)".
