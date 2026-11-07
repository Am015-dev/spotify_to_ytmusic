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

## Temporary pictures (until the Flow art arrives)
37 pictures (game-icons glyphs on code-drawn card, task, portrait and token shapes) rendered from game-icons.net by `temp-art/make.js` into `temp-art/<stem>.webp`; `python3 games-src/deep-signal/temp-art/install.py` copies them into `games/deep-signal/media/` (never over a finished picture).
Licence: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/), source https://game-icons.net via https://github.com/game-icons/icons; credit kept in the game (Menu > About).

| stem | icon | author |
|---|---|---|
| icon-signal | delapouite/radio-tower | Delapouite |
| token-signal | delapouite/radio-tower | Delapouite |
| icon-flare | delapouite/torch | Delapouite |
| token-captain | delapouite/ship-wheel | Delapouite |
| icon-trick | delapouite/stack | Delapouite |
| icon-silence | delapouite/silenced | Delapouite |
| icon-deadzone | delapouite/fog | Delapouite |
| icon-jammed | lorc/static | Lorc |
| icon-decide | lorc/pointing | Lorc |
| icon-share | delapouite/card-exchange | Delapouite |
| icon-notrick | lorc/gas-mask | Lorc |
| icon-onetrick | lorc/fishing-hook | Lorc |
| icon-sonar-goal | lorc/radar-sweep | Lorc |
| fx-ping | lorc/sonic-shout | Lorc |
| logo-emblem | delapouite/diving-helmet | Delapouite |
| boss-warden | delapouite/lighthouse | Delapouite |
| boss-swarm | lorc/tornado | Lorc |
| boss-source | lorc/spiral-shell | Lorc |
| card-coral | delapouite/coral | Delapouite |
| card-kelp | lorc/curled-leaf | Lorc |
| card-tide | lorc/wave-crest | Lorc |
| card-amber | lorc/sun | Lorc |
| card-sonar | lorc/radar-sweep | Lorc |
| card-back | delapouite/periscope | Delapouite |
| task-coral | delapouite/coral | Delapouite |
| task-kelp | lorc/curled-leaf | Lorc |
| task-tide | lorc/wave-crest | Lorc |
| task-amber | lorc/sun | Lorc |
| portrait-you | delapouite/diving-helmet | Delapouite |
| portrait-ines | delapouite/captain-hat-profile | Delapouite |
| portrait-bram | lorc/spanner | Lorc |
| portrait-kito | delapouite/headphones | Delapouite |
| portrait-odile | delapouite/stethoscope | Delapouite |
| portrait-drone | delapouite/periscope | Delapouite |
| token-final | lorc/anchor | Lorc |
| token-order | code-drawn disc | own code |
| token-relative | code-drawn disc | own code |

Not used: print-and-play or workshop scans of the original cards (publisher art), and kenney.nl (blocked by the network proxy here).

Wiring: card faces, task cards and portraits use `data-art` on the card / avatar; title, table, emblem, stamp, buttons and tokens also carry `data-art`. Boss portraits feed the Story cast.
