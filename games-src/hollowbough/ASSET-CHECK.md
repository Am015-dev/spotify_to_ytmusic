# Hollowbough asset check (W347)

Counts: art required 125 (cards and places 88, media 37) / delivered 124 / prompted 0 / gaps added 1 / not wired 13 (media files). Music cues: required 10 / present 10 / missing 0.

Basis: `game/src/data.js` (48 cards, 11 forest, 8 basic, 4 basic events, 16 special events, haven); `campaign.json` cast (6 portraits); media the code loads in `src/ui1.js`, `ui2.js`, `ui10.js`, `ui13.js`; the shared `gx-skin.js` core list (the game calls `GXSK.init({})`) and the `gx-skin.css` rules under `html.sk`; music slots `MSLOTS` in `src/ui13.js`.

## Gaps added

| stem | required by | manifest file | prompt file |
|---|---|---|---|
| haven | Barter Burrow place: drawn by the code (SVG fallback in `ui10.js` spotArt), one per game | `games-src/hollowbough/art/manifest.json` (items) | `games-src/next-wave/flow-2d/hollowbough/prompts-gaps-ratio-1x1.json` |

Size: 1:1, 1024 px. The painted place art in `art/` is 160x160 for forest and event places, and haven sits in that row. The target is `art/haven.webp` (the file `build.py` reads), not `media/`.

**Wiring note (code, not changed here):** `tileFace()` in `src/ui2.js` passes key `''` for the haven tile and the detail view uses `haven:`, so `paintedHref` never looks up `haven`. The new picture is built into `HB_ART` but is not shown until the game passes key `haven`.

## Not wired (media files with no use in the source)

| file | why |
|---|---|
| ui-bubble.webp | only ui-bubble-c is referenced (gx-skin.css) |
| ui-bubble-tail.webp | no reference in shell or game |
| ui-button-cream.webp | only the -c variant is referenced |
| ui-button-go.webp | only the -c variant is referenced |
| ui-button-power.webp | only the -c variant is referenced |
| ui-iconbtn-k.webp | no reference (-k variant) |
| ui-node-boss-k.webp | no reference (-k variant; gx-skin.css uses the plain name) |
| ui-node-done-k.webp | no reference (-k variant; gx-skin.css uses the plain name) |
| ui-node-locked-k.webp | no reference (-k variant; gx-skin.css uses the plain name) |
| ui-node-open-k.webp | no reference (-k variant; gx-skin.css uses the plain name) |
| ui-panel.webp | only ui-panel-c is referenced |
| ui-row.webp | no reference (named only in a gx-skin.css comment) |
| ui-row-c.webp | no reference |

The shell CSS also names `story-map`, `ui-star-on/off` and `ui-act-banner-c`, but only under the `sk-map`, `sk-stars` and `sk-banner` classes, which this game never sets. They are not in media, so they are not required.

## Delivered files

- art/ (card and place pictures, 87, all in manifest.json): architect, bard, barge_toad, basic_amber_weep, basic_berry_patch, basic_dewberry_nook, basic_gossip_glade, basic_kindling_glen, basic_pebble_bank, basic_resin_pool, basic_twig_heap, bev_elders_council, bev_harvest_gathering, bev_wanderers_moot, bev_wayfarers_fair, castle, cemetery, chapel, chip_sweep, clock_tower, courthouse, crane, doctor, dungeon, ever_tree, fair_grounds, farm, fool, forest_barter_stump, forest_berry_thicket, forest_bumper_bramble, forest_echoing_meadow, forest_foragers_crossing, forest_meadow_bazaar, forest_mixed_glade, forest_postbag_clearing, forest_quarry_burrow, forest_rummage_hollow, forest_sapwell_copse, general_store, historian, husband, inn, innkeeper, judge, king, lookout, mine, miner_mole, monastery, monk, palace, peddler, post_office, postal_pigeon, queen, ranger, resin_refinery, ruins, school, sev_acorn_bandits_seized, sev_change_of_proprietors, sev_commencement_of_pupils, sev_counsel_for_scoundrels, sev_gilded_shrine_vault, sev_grand_hollow_games, sev_grand_market_scheme, sev_hurry_scurry_dash, sev_lost_parchments_unearthed, sev_marsh_fever_remedy, sev_night_of_sparklers, sev_pilgrims_trail, sev_resident_minstrel, sev_toll_holiday, sev_vigil_of_remembrance, sev_wingborne_healers, shepherd, shopkeeper, storehouse, teacher, theater, twig_barge, undertaker, university, wanderer, wife, woodcarver

- media/ (wired, 37): icon-berry, icon-pebble, icon-resin, icon-twig; table-woodland, table-woodland-phone, table-frostwood, table-elderheart; back-default, back-meadow, back-sprout, back-frost; title, title-phone, mat, bench, end-win, end-lose; ui-season-wheel, ui-topbar, ui-drawer-head, ui-iconbtn, ui-panel-c, ui-button-power-c, ui-button-cream-c, ui-button-go-c, ui-node-open, ui-node-done, ui-node-locked, ui-node-boss, ui-bubble-c; camp-hazel, camp-bramble, camp-fern, camp-quill, camp-thistle, camp-grimbeard

## Music cues

Required (slots Menu, Game, Fight, Victory, Defeat, two tracks each): tavern-a, tavern-b, main-a, main-b, fight-a, fight-b, victory-a, victory-b, defeat-a, defeat-b. All 10 are in `games/hollowbough/music/`. Music gaps: none.

## Not checked

- Sound effects (`GA_DATA.sfx`, `games-src/audio/hollowbough`): outside the music scope of this brief.
- Picture quality, ratios and the approved state of delivered files.
- Built html and `games/hollowbough/media/ready.json` (not present): not read.
