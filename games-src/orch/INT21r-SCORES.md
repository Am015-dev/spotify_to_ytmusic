# INT21r critic scores (24 Nov 2026, ~18:10 UTC)
Order: Readability / Game-not-spreadsheet / Layout / Finish / First-minute. Gate: every row >= 7 on phone AND pc. Strict; unsure = 6.
Sheets: games-src/<game dir>/proof/int21r-{phone,pc}-sheet.jpg. Baselines missing for these games (snapshot title/menu/board only failures in build-all --quick).
No CRITIC-R15.md rubric exists on shelf/R15-critic (sheets only), so the task rubric was used. Live comparison not run: no game passes, so "not worse than live" is moot.

| game | phone | pc | verdict | top defect |
|---|---|---|---|---|
| doorkick-dungeon | 6/7/6/6/7 | 5/6/6/6/7 | HOLD | Start/tutorial cells: top 65% blank wood (phone); PC tiny text, dimmed boss cells, empty diary panel |
| vinegrave | 5/6/6/5/6 | 5/6/6/7/7 | HOLD | Phone menu/start: blank panel, only hand strip; spreadsheet-like HUD, text <12px |
| wildmark | 6/8/6/8/8 | 5/7/6/7/8 | HOLD | Phone top bar clips "Lessons"; PC animal-count labels ~9px, empty season-log column |
| vale-of-banners | 6/8/7/6/7 | 6/8/7/7/7 | HOLD | Phone start screen half empty; side-panel text under 12px/16px |
| stitchwise | 6/5/6/5/6 | 5/5/6/5/6 | HOLD | Empty quilt grids read as spreadsheet; broken image box on PC result card |
| emberclimb | 5/6/6/4/6 | 5/5/5/4/6 | HOLD | Placeholder blank card art (Garrick, Ember Shrine, map nodes); PC right panel nearly empty |
| lantern-dive | 6/6/6/6/6 | 5/6/4/5/6 | HOLD | PC hand cards fall below the fold in art/menu cells; "The lantern" broken-image alt text on start |
| sands-of-qamar | 4/5/6/5/6 | 4/5/6/5/6 | HOLD | Broken-image alt text in HUD (coins/camels); tiny dense tile grid |
| meadowfold | n/a | n/a | HOLD | No ?scn= scenarios: only the start card is provable, PC width change unproven |

Not merged (per orchestrator): W745 shell, W750, W751, perch files from W747.
Note: W752 also edits shared games-src/shell/gx-scenario-tutor.{js,css}; other games pick it up on their next build, so include it in the later all-games build.
Flagged cells (new build, phone/pc): doorkick 25/24, vinegrave 8/8, wildmark 8/0, vale 6/6, stitchwise 11/11, emberclimb 3/12, lantern-dive 0/7, sands 2/11.
