# On-foot benchmark: street level (owner, 23 Oct 2026: "use this game for on foot benchmark, save the screenshots in the project so you don't have to repeat")

Reference screenshots of the street (ON FOOT) level. Compare new work against these files instead of taking a fresh set
for every review. Retake one only when that screen really changed, and replace the file here in the same commit.

| File | Build | What it shows |
|---|---|---|
| (see ../STREET-BAR.md for the bar these are judged against) | | |
| 4-street-start-{phone,pc}.webp | beta.169 live | street right after the loading veil, nobody steering |
| 5-street-20s-{phone,pc}.webp | beta.169 live | 20 s later, nobody steering (Kai was hit 4 times on PC) |
| street-running-{phone,pc}-camera-old.webp | beta.171 | after 7 s holding RIGHT, old camera: Kai pinned near the right edge (312 / 739 units from the left) |
| street-running-{phone,pc}-camera-NEW.webp | beta.171 ?cam2=1 | same, new leading camera: Kai about a third in (112 / 229 units), steam from a road grate |

Phone = 390x763, PC = 1440x860. Retake: `node games-src/nightrun/qa/benchshots.js games-src/nightrun games-src/nightrun/benchmark/street`
(after `python3 games-src/nightrun/parts/build.py`). Then convert the PNGs to WebP (quality 82) and delete the PNGs.
