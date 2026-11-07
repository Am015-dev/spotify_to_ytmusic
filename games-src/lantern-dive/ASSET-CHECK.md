# Lantern Dive: asset check (W347)

Checked 17:18Z to 17:40Z against the source (game/src, head/body/skin, kit, campaign.json), not the built html.

**Counts.** Art manifest: required 17 / delivered 17 / prompted 0 / gaps added 0. Media pictures: required 46 / delivered 39 / prompted 0 / gaps added 7 / not wired 21 (9 campaign portraits plus 12 unused ui-* files). Total: required 63 / delivered 56 / gaps added 7. Music cues: required 10 / present 10 / missing 0.

## Gaps added

| stem | required by | manifest file | prompt file |
|---|---|---|---|
| camp-shallows | campaign.json chapters[0].opponent.portrait | games-src/lantern-dive/art/manifest.json | games-src/next-wave/flow-2d/lantern-dive/prompts-gaps-ratio-1x1.json |
| camp-sand | chapters[1].opponent | same | same |
| camp-power | chapters[2].opponent | same | same |
| camp-tablet | chapters[4].opponent | same | same |
| camp-hum | chapters[5].opponent | same | same |
| camp-shelves | chapters[7].opponent | same | same |
| camp-road | chapters[8].opponent | same | same |

Ratio 1:1, 1024x1024, target games/lantern-dive/media/<stem>.webp.

## Not wired

| file | why |
|---|---|
| camp-brack, camp-nerea, camp-bram, camp-sumi, camp-dag, camp-echo, camp-undertow, camp-maze, camp-lampless (.webp) | Named in campaign.json (cast and chapter portraits), but ui9.js GXC.init passes no artBase and no portrait hook, so the shell never requests them and shows the emoji. Fix needs a code change (artBase: 'media/'), not made here. |
| ui-bubble.webp, ui-bubble-c.webp | No literal name, no family prefix, not in the shell core list. |
| ui-button-cream.webp, ui-button-go.webp, ui-button-power.webp | Only the -c variants are loaded (skin.css, shell core list). |
| ui-node-boss.webp, ui-node-done.webp, ui-node-locked.webp | No load anywhere (ui-node-open is in the shell core list). |
| ui-panel.webp, ui-row.webp, ui-seat-c.webp, ui-trick-pad.webp | Only the -c variants or ui-seat are loaded. |

Candidates to remove after owner review. Nothing was deleted.

## Delivered files

- Art folder (manifest items, all present as .webp): emb0-emb4, back, ping, flare, cmd, drone, diver0-diver4, table, title (17).
- Media, 51 files:
  - back: back-last-light, back-wreck-brass
  - camp (9): brack, bram, dag, echo, lampless, maze, nerea, sumi, undertow
  - card-face (5): coral, kelp, lantern, sunstar, tide
  - end: end-lose, end-win
  - icon: air, cross, heart, tank-empty, tank-full, tick
  - table: table-tunnel-glow, table-tunnel-glow-phone
  - title-phone
  - ui (24): bubble, bubble-c, bubble-tail, button-cream, button-cream-c, button-go, button-go-c, button-power, button-power-c, drawer-head, iconbtn, node-boss, node-done, node-locked, node-open, panel, panel-c, row, row-c, seat, seat-c, topbar, trick-pad, trick-pad-c

## Music

Five slots (tavern, main, fight, victory, defeat), two tracks each, in ui99.js MSLOTS and MTITLE. All 10 files exist in games/lantern-dive/music/: tavern-a/b, main-a/b, fight-a/b, victory-a/b, defeat-a/b. No music gaps.

## Notes

- The 7 new manifest entries point at art/<stem>.webp, which build.py embeds, but the Flow target is media/<stem>.webp. Whoever paints them must also place a copy in art/, or the entries stay unbuilt. This is not a blocker.
- Pose sets (wave8, wave7 lantern states) and wave9 end-*-b/c, wave7 table and card-face-*-b prompts have no code loader. They are not required here.

## Not checked

- Models folder (models/lantern*.webp, used by ui99.js), out of scope for media.
- Sound effects (audio-data.js, the snd table in ui6.js). Music only, as briefed.
- ready.json: not present in media.
