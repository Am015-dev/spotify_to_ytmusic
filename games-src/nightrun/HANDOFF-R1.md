# R1: sprite re-ingest + one body scale (22 Oct 2026), branch nr/R1

## Done
- All 287 strips (`<act>-strip.webp`) from `games-src/anims/mainhattan-nightrun/sheets/` copied over `games/mainhattan-nightrun/media/anim/`, including the earlier S5 exports. They total 126.1 Mpx.
- `build.py`: each ART.ANIM entry is now `[frames,fps,w,h,anchorX,anchorY,body]`, read from the sheet json. `sprite-calib.json` was regenerated with `make-sprite-calib.py`: the boss cells changed, so with the old widths the bosses would have been drawn about 1.5x too big.
- `art.js` `ART.bsc(m,h)` = h / body, or h / cell height when a sheet has no body. footDraw uses it: one scale per character, feet on the cell bottom, no alpha bbox.
- The flag `RET.bodyscale` is set in `streetfeel.js`, because RET does not exist yet when `art.js` runs. `?bodyscale=0` gives the old rule.
- Under bodyscale:
  - `streetfeel` FEEL.BODY correction is off.
  - `footq` no longer shrinks the crouch cell (CR).
  - The crouchshoot muzzle was re-measured (FEEL.MZB). The other muzzles keep MZ: same 256 px body, feet on the cell bottom.
- Grounded bosses (anim-boss.json `move:'ground'`): with bodyscale, the cell bottom sits on the road line (`e._dh/2`). Flying bosses keep their placement.

## Scale table (game units per sheet px = game height / body)
| sheet | in game | metres | body px | cell h | game h | h implied by metres (Kai 64 = 1.8 m) | scale | old rule on new cells |
|---|---|---|---|---|---|---|---|---|
| kai | Kai | 1.8 | 256 | 326 | 64 | 64 | 0.2500 | 0.1963 |
| knife | rusher / knife | 1.75 | 256 | 260 | 64 | 62 | 0.2500 | 0.2462 |
| gunman | gunner / gunman | 1.8 | 256 | 259 | 64 | 64 | 0.2500 | 0.2471 |
| bruiser | heavy 80 / bigheavy 90 / bruiser 80 | 2.0 | 256 | 275 | 80 | 71 | 0.3125 | 0.2909 |
| grunt | grunt | 1.85 | 256 | 262 | 62 | 66 | 0.2422 | 0.2366 |
| shield | shield | 2.0 | 256 | 257 | 66 | 71 | 0.2578 | 0.2568 |
| sniper | sniper | 1.85 | 256 | 286 | 64 | 66 | 0.2500 | 0.2238 |
| drone | drone | 0.6 | 256 | 404 | 22 | 21 | 0.0859 | 0.0545 |
| turret | turret | 1.6 | 256 | 350 | 40 | 57 | 0.1562 | 0.1143 |
| mech | mech | 3.2 | 256 | 313 | 100 | 114 | 0.3906 | 0.3195 |
| warden | warden (street boss) | 2.2 | 256 | 309 | 130 | 78 | 0.5078 | 0.4207 |

FEEL.H and the foot.js heights are unchanged: they are also hit boxes, so changing them is a balance call for the owner. Where the metres disagree:
- heavy: 80 by design (1.25 x Kai); the metres imply 71.
- warden: 130 (2 x Kai); the metres imply 78.
- turret: 40; the metres imply 57.

Flight bosses keep one scale per boss: drawn width / idle body width, the same for every state.

## Left / notes
- The Lab viewers (`footview.js`, `lab2.js`, `footlab.js`) were not edited because L5 owns them. They draw through ART.footDraw, so they get the new rule. footlab passes h = canvas height - 50 as the body height, so a cell taller than the body (Kai 326 vs 256) can reach the top edge of the viewer: a raised sword or smoke may clip there.
- `streetfeel-test.js` still measures body height as cell h x sc and uses FEEL.MZ. It needs updating to body x sc and MZB.
- messe-waechter and zentral-ice are grounded in the sheets but `move:'air'` in anim-boss.json, so they still hover in game.
- On PC (1440x860), the Lab flight play test leaves tresor-wart, hoplite and talos at ENTERS (y = -172; SPR.boss never runs). SPR.boss never runs there, so the new draw rule cannot be involved (not re-run with ?bodyscale=0). On the phone they enter and stand on the road.
