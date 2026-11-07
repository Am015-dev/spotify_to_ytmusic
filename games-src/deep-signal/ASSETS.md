# Deep Signal pictures

47 named slots in `assets.json` (wave 1: 19, wave 2: 16, wave 3: 12). Each fills `games/deep-signal/media/<stem>.webp`; until a file exists the game draws a tidy placeholder.

| wave | what | stems |
|---|---|---|
| 1 | first minute: title, table, emblem, 5 card faces, card back, 4 task cards, 6 portraits | bg-title, bg-table, logo-emblem, card-coral, card-kelp, card-tide, card-amber, card-sonar, card-back, task-coral, task-kelp, task-tide, task-amber, portrait-you, portrait-ines, portrait-bram, portrait-kito, portrait-odile, portrait-drone |
| 2 | every other piece the rules need: order/arrow/final tokens, signal, captain, rule icons | token-order, token-relative, token-final, token-signal, token-captain, icon-flare, icon-signal, icon-trick, icon-deadzone, icon-silence, icon-jammed, icon-decide, icon-share, icon-notrick, icon-onetrick, icon-sonar-goal |
| 3 | polish: stamps, ping, story map and act banners, boss portraits, result screens | stamp-complete, stamp-lost, fx-ping, bg-map, banner-act1, banner-act2, banner-act3, boss-warden, boss-swarm, boss-source, result-complete, result-lost |

Prompts: `games-src/next-wave/flow-2d/deep-signal/prompts-waveN-ratio-WxH.json` (style block + subject, 2D only, no text in pictures).

## Drop in finished pictures (3 steps)
1. Save the files as `<stem>.png/.webp` in `assets-inbox/deep-signal/`.
2. Run `python3 games-src/scripts/ingest-assets.py deep-signal` (resizes to the slot and writes `games/deep-signal/media/<stem>.webp`; see PLAYBOOK "Finished pictures from the owner").
3. Rebuild: `python3 games-src/scripts/build-all.py deep-signal`. build.py lists the files present; no code changes.

Wiring: card faces, task cards and portraits use `data-art` on the card / avatar; title, table, emblem, stamp, buttons and tokens also carry `data-art`. Boss portraits feed the Story cast.
