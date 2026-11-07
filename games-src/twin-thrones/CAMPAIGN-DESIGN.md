# Twin Thrones campaign: The Crowns

Data: `campaign.json` (shelf id `twin-thrones`, 10 chapters, 3 acts, validated with `GXC.validate`). Wired in `src/ui.js` (`campInit`, `campStart`, `campIsWon`, `campMetrics`).

## Premise
Scribe Ione teaches a new ruler the pyramid; then a warden, a queen and finally King Vael, who holds both thrones, are out-built one duel at a time.

## Rivals
| Rival | Chapters | Level | Twist |
|---|---|---|---|
| Pell the Apprentice | c1 (tutorial first, hints on) | easy | none |
| Orrin of the Quarry / Unbowed | c2, c7 | easy, hard | none |
| Warden Brannoc (boss, act 1) | c3 | easy | extra-coins 5 |
| Maro the Trader | c4 | normal | none |
| General Kest | c5, c9 | normal, hard | none |
| Queen Seren (boss, act 2) | c6 | normal | head-start 2 (pawn starts 2 steps toward you) |
| Sevra the Sage | c8 | hard | none |
| King Vael (final boss) | c10 | hard | extra-coins 8 |

## Difficulty curve and goals
Act 1 easy with the suggested-card glow (hints): win, win with 40+ points, boss with coins. Act 2 normal: win; c5 win with the pawn on your side; boss with a pawn head start. Act 3 hard: win; win with 60 points; c9 win by military or science only; final boss rich.
Twists are applied in `newGame` (coins, `G.mil`). `isWon` handles the custom goals; stars use `metrics` (won, score, margin). Chapter 1 runs the guided first game (GXT) before the duel, and the map has a Tutorial button.
