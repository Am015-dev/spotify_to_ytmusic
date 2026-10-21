# Nightrun: pictures for the arsenal power-ups (parts/arsenal.js)

12 pickup icons for the new power-ups. Until a picture exists the game draws a simple code shape (triangle / circle / mini shape, `PW.glyph`).
Hand-in steps are the same as in `ASSETS-NEEDED-2.md`: save under the exact id into `assets-inbox/mainhattan-nightrun/`, run
`python3 games-src/scripts/ingest-assets.py`, then `python3 games-src/nightrun/parts/build.py`.

**Wiring:** `A` = auto-wired: `PW.coin` draws `ART.sp('pk-<id>')` when the picture is in `media/ready.json` (pickup, HUD chip, HUD list, stored-charge badge).
**Background:** object on a flat plain WHITE background. No text, letters or numbers. Paint at 2x or larger. Style line as in `ASSETS-NEEDED-2.md`.

| id | size | bg | prio | wired | where | picture |
|---|---|---|---|---|---|---|
| `pk-bubble` | 64x64 | white | 2 | A | PW.coin, BUBBLE SHIELD (defensive, stored charge) | A glassy cyan soap-bubble shield with a highlight. |
| `pk-stasis` | 64x64 | white | 2 | A | PW.coin, STASIS FIELD (defensive) | A pale teal ring with a frozen hourglass Z-shape inside. |
| `pk-gwell` | 64x64 | white | 2 | A | PW.coin, GRAVITY WELL (defensive) | A violet spiral swirling into a dark core. |
| `pk-splint` | 64x64 | white | 2 | A | PW.coin, SPLINTER (offensive) | An amber shot breaking into three shards. |
| `pk-lance` | 64x64 | white | 2 | A | PW.coin, LANCE BURST (offensive) | A white-blue spear tip piercing a small shield plate. |
| `pk-hornet` | 64x64 | white | 2 | A | PW.coin, HORNETS (offensive) | Two small orange missiles curving inward. |
| `pk-ovd` | 64x64 | white | 2 | A | PW.coin, OVERDRIVE (offensive) | A red double chevron with a heat glow under it. |
| `pk-empr` | 64x64 | white | 2 | A | PW.coin, EMP CHARGE (utility) | An amber ring with a lightning bolt. |
| `pk-dashr` | 64x64 | white | 3 | A | PW.coin, DASH REFUND (utility, stored charge) | A cyan arrow with a circular return loop. |
| `pk-zone` | 64x64 | white | 3 | A | PW.coin, NEON ZONE (utility) | A magenta target ring, double circle. |
| `pk-decoy` | 64x64 | white | 3 | A | PW.coin, DECOY DRONE (utility) | A lime-green dart drone silhouette. |
| `pk-glass` | 64x64 | white | 3 | A | PW.coin, GLASS CANNON (risky) | A pink cracked crystal diamond. |

## Pilot classes (parts/classes.js, Garage tab PILOT)

5 class portraits-as-icons and 30 skill-node icons. Until a picture exists the PILOT tab draws a code shape (`clsSvg`: triangle, ring, bar, diamond, dot).
**Wiring:** `N` = not wired yet: `CLSUI.draw` would swap `clsSvg(...)` for `ART.sp('<id>')` once the picture is in `media/ready.json`. Same hand-in steps and background as above.

| id | size | bg | prio | wired | where | picture |
|---|---|---|---|---|---|---|
| `cls-gunner` | 64x64 | white | 2 | N | PILOT card GUNNER | An orange heavy cannon ship nose, three muzzle flashes. |
| `cls-ghost` | 64x64 | white | 2 | N | PILOT card GHOST | A pale cyan ship outline fading into a motion trail. |
| `cls-warden` | 64x64 | white | 2 | N | PILOT card WARDEN | A teal ship behind a tall curved shield plate. |
| `cls-tinker` | 64x64 | white | 2 | N | PILOT card TINKER | A yellow ship with a wrench arm and floating gears. |
| `cls-gambler` | 64x64 | white | 2 | N | PILOT card GAMBLER | A magenta ship over two neon dice. |
| `node-<node id>` | 48x48 | white | 3 | N | PILOT skill tree, 30 nodes: g1-g6, h1-h6, w1-w6, t1-t6, b1-b6 | One simple glyph in the class colour per node (name in `classes.js` `T`). |
