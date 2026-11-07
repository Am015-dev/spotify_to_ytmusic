# Nebula Aces asset check (W347)

Checked 17:18Z to about 17:40Z against the source in `games-src/xw/` (test, sweep, geotest, bf-test, boot-test, tutor-test, clarity-test, playtest and shots files skipped) and the shared shell it embeds (`games-src/shell/gx-skin.css`, `gx-skin.js`, `gx-campaign.js`). Art is in `games/nebula-aces/media/`; music in `games/nebula-aces/music/`.

Counts: art required 50 / delivered 50 / prompted 0 / gaps added 0 / not wired 13. Music cues: required 10 / present 10 / missing 0.

No art gaps: every picture the code loads already has a file, so no Flow gap prompts were needed. The art manifest `games-src/xw/art/manifest.json` was created to name the 50 required stems (no art/ folder is read by `build.py`; checked by grep).

## Gaps added

None.

## Required art (all DELIVERED and wired)

| Group | Stems | Loaded by |
|---|---|---|
| Portraits (11) | camp-brecken, camp-kael, camp-quill, camp-drill, camp-knife, camp-hammer, camp-hex, camp-sorin, camp-kira, camp-wailer, camp-castigan | `campaign.json` cast.*.portrait |
| Ships (9) | ship-anvil, ship-needle, ship-razor, ship-warden, ship-maul, ship-herald, ship-hauler, ship-keel, ship-kestrel | `media.js` HULLART and SHIPF, preloaded in `boot()` |
| Table, title, end, arena (8) | arena-floor, table-nebula7, table-default, table-default-phone, title, title-phone, end-win, end-lose | `media.js` artVars and skin, `camp.js` endArt |
| Icons (5) | icon-focus, icon-evade, icon-lock, icon-shield, icon-hull | `media.js` GXSK sets, `skin.css` |
| Move cards (3) | ui-move-card-white, ui-move-card-green, ui-move-card-red | `media.js` GXSK sets, `skin.css` |
| UI (14) | ui-button-cream-c, ui-button-go-c, ui-button-power-c, ui-panel-c, ui-row, ui-bubble-tail, ui-bubble-c, ui-topbar, ui-iconbtn, ui-drawer-head, ui-node-open, ui-node-done, ui-node-locked, ui-node-boss | `skin.css`, `media.js` (tail), shared `gx-skin.js` core list and `gx-skin.css` (topbar, iconbtn, drawer-head, buttons, panel, node-*, bubble-c) |

Notes:
- Ships: `data.js` SHIPS has only two hulls (lancer, talon). The painted ship per faction comes from `media.js` SHIPF; the other hull paintings come from HULLART. keel, kestrel and hauler have no hull in the game yet; they are preloaded but never shown.
- Shared shell extras that `xw` does not switch on (`story-map`, `ui-star-on`, `ui-star-off`, `ui-act-banner-c`) are not required: `GXSK.init` in `media.js` passes only `dark` and `sets`.
- Pilot ids in `data.js` PILOTS have no art loader, so there is no pilot portrait slot.

## Not wired (files exist, nothing loads them)

| File | Why |
|---|---|
| back-default | No loader: no `back-` stem in the source or shell. |
| back-rift-crown | No loader (same as above). |
| ui-bubble | Only named in a comment in `gx-skin.css`; the coach bubble uses ui-bubble-c and ui-bubble-tail. |
| ui-button-cream | Only named in a comment in `gx-skin.css`; the buttons use ui-button-cream-c. |
| ui-button-go | No loader; the buttons use ui-button-go-c. |
| ui-button-power | No loader; the buttons use ui-button-power-c. |
| ui-panel | Only named in a comment in `gx-skin.css`; dialogs use ui-panel-c. |
| ui-row-c | No loader. |
| ui-iconbtn-k | No loader (the -k family has no reference in any source file). |
| ui-node-open-k | No loader (same). |
| ui-node-done-k | No loader (same). |
| ui-node-locked-k | No loader (same). |
| ui-node-boss-k | No loader (same). |

These 13 are not required by the game. Remove them or wire them in a later round; do not count them as delivered art.

## Delivered files

All 63 files in `games/nebula-aces/media/` (no `ready.json`; no zero-size files):
- Required, wired (50): listed in the "Required art" table above.
- Not wired (13): listed in the "Not wired" table above.

## Prompt-only stems (not loaded by the game)

These appear in `games-src/next-wave/flow-2d/nebula-aces/prompts-wave*.json` but have no file in media and no loader. They are not required, and the prompt files were not changed.

- Pose sets: brecken-idle/win/lose/talk; castigan-idle/win/lose/praise/shock/taunt; drill-idle/win/lose; hammer-idle/win/lose; hex-idle/win/lose; kael-idle/win/lose/talk; kira-idle/win/lose; knife-idle/win/lose/praise/shock/taunt; quill-idle/win/lose; sorin-idle/win/lose/praise/shock/taunt; wailer-idle/win/lose.
- Ship poses: lancer-idle, lancer-bank-left, lancer-bank-right, lancer-hit, lancer-wreck; talon-idle, talon-bank-left, talon-bank-right, talon-hit, talon-wreck.
- Alternate end/back/table/bar art: end-win-b, end-win-c, end-lose-b, end-lose-c, back-red-streak, back-veil-station, table-asteroid-belt, table-asteroid-belt-phone, table-red-rift, table-red-rift-phone, table-veil-station, table-veil-station-phone, gx-bar-plate.

## Music

Cues named in `media.js` SLOTS (two songs per slot, as `<slot>-a` and `<slot>-b` per `gx-music.js`):

| Slot | Cues | Present |
|---|---|---|
| tavern (Menu) | tavern-a, tavern-b | yes |
| main (Battle) | main-a, main-b | yes |
| fight (Boss fight) | fight-a, fight-b | yes |
| victory (Victory) | victory-a, victory-b | yes |
| defeat (Defeat) | defeat-a, defeat-b | yes |

Missing: none. No music prompt or manifest change.

## Not checked

- Shared shell files `gx-campaign.css`, `gx-help.css` and `gx-tutor.css` were searched with grep for stem names only; nothing was found there.
- Nothing else left at the stop.
