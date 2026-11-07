# Kaiten Kitchen: asset check (W347)

Checked from source: `game/src/*.js`, `game/head.html`, `game/skin.css`, `kit/kit.js` + `kit/parts/*.js`,
`campaign.json`, `../shell/gx-skin.js`, `../shell/gx-skin.css`, `../shell/gx-campaign.js`. Built html not read.
Files checked: `art/manifest.json` (22 items), `games/kaiten-kitchen/media/` (50 files), `games/kaiten-kitchen/music/` (10 files).

## Counts
- Art required: 59 (manifest items 22 + media stems 37) / delivered 59 / prompted 0 / gaps added 0 / not wired 12
- Music cues: required 10 / present 10 / missing 0

## Gaps added
None. Every required picture is delivered, so no manifest entry or Flow prompt file was added.

## Decisions
- chef-suzu: not added. Suzu is never a seat. The kit draws chef portraits only for `KIT.PLAYERS` (Mina, Taro, Odile, Kofi, Pip, seats 0-4). Suzu's picture is the campaign portrait `camp-suzu.webp`, which is delivered.
- Shell core files (`gx-skin.js` core list) are required because `GXSK.init` loads them on every start: ui-topbar, ui-iconbtn, ui-panel-c, ui-button-power-c, ui-drawer-head, ui-button-cream-c, ui-button-go-c, ui-node-open.
- Not required: ui-act-banner-c, ui-star-on/off, story-map (their `banner`, `stars`, `map` options are not set).

## Not wired
Delivered in media/ but never loaded by source, CSS or shell. Report only, nothing deleted.

| file | why |
|---|---|
| title-phone.webp | no reference in game source or CSS |
| ui-bubble.webp | shell and game CSS use only ui-bubble-c |
| ui-button-cream.webp | game and shell CSS use only the -c variant |
| ui-button-go.webp | game and shell CSS use only the -c variant |
| ui-button-power.webp | game and shell CSS use only the -c variant |
| ui-panel.webp | shell and game CSS use only ui-panel-c |
| ui-row.webp | game CSS uses only ui-row-c |
| ui-nametag-gold-c.webp | nametags load only the plain file (ui2.js, GXSK sets) |
| ui-nametag-green-c.webp | same |
| ui-nametag-purple-c.webp | same |
| ui-nametag-red-c.webp | same |
| ui-nametag-teal-c.webp | same |

## Delivered files
- Manifest art (`art/<id>.webp`, 22): tempura, sashimi, dumpling, roll1, roll2, roll3, salmon, squid, egg, wasabi, wasabi-nigiri, chop, pudding, back, belt, counter, title, chef-mina, chef-taro, chef-odile, chef-kofi, chef-pip.
- Card backs (`back-<unlock>`, 3): back-lunch-belt, back-custard, back-golden.
- Tables (`table-<unlock>`, 2): table-dinner-counter, table-midnight-belt.
- Campaign portraits (`camp-<id>`, 6): camp-suzu, camp-mina, camp-pip, camp-kofi, camp-odile, camp-taro.
- Counter icons (`icon-<n>`, 4): icon-cup, icon-paste, icon-plate, icon-star.
- Results and screens (4): end-win, end-lose, stage, belt (also manifest).
- Shell and skin UI (19): ui-topbar, ui-iconbtn, ui-panel-c, ui-drawer-head, ui-button-power-c, ui-button-cream-c, ui-button-go-c, ui-row-c, ui-bubble-c, ui-bubble-tail, ui-node-open, ui-node-done, ui-node-locked, ui-node-boss, ui-nametag-red, ui-nametag-teal, ui-nametag-gold, ui-nametag-purple, ui-nametag-green.
- Not wired (12): see table above.

## Music cues (`music/`)
All 10 present: tavern-a, tavern-b (menu); main-a, main-b (game); fight-a, fight-b (last round); victory-a, victory-b; defeat-a, defeat-b.
Not checked: the `belt` loop and the sound effects (`GA.play`), which are not music cues.

## Not checked
- Nothing left over at the hard stop.
