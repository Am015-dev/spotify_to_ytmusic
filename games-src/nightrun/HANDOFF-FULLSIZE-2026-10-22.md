# Nightrun full-size asset ingest (laptop, 22 Oct 2026): state for the Linux worker

**Nothing is committed or pushed.** The ingest output sits uncommitted in the laptop repo (`C:\Users\kourisa\crown-media\repo`, branch `alex/brave-carson-rbpmlk` at f543554d): 315 files changed under `games/mainhattan-nightrun/media` (231 in the media root, 55 in `foot/`, 1 in `poses/`, 28 new files). `media/ready.json` grew from 182 to 447 entries.

## What was delivered
- 309 full-size originals (1024 px or more, byte-identical to the Flow sources, no thumbnails) were placed in `assets-inbox/mainhattan-nightrun/` and ingested. Result: 0 FAIL. Map: `TALON_assets/logs/nr_inbox_map.md`.
- The 5 street layers `foot/bg-sky|far|mid|near|floor` were built separately by `TALON_assets/nr_street_layers.py`:
  - All five are 2048x1024.
  - Sky is opaque.
  - The other four are white-keyed (the prompts asked for flat white), scaled to the full width and bottom-anchored.
  - Ingest could not handle them: it keys by corner colour (bg-mid failed), it keys the opaque sky, and it fits transparent art scaled down and centred.

## Blocking regression: do not ship as is
**Test:** phone 390x763, entry path copied from `foot-test.js`, `FOOT.start('zeil')`.

**Symptoms:**
- With the new `ready.json`, Kai is **not drawn** on the street stage.
- After 15 s, `FQ.miss` = `{kai: 1308, grunt: 300}`. The `footq.js` box() path keeps hitting "has sheets: still decoding, draw nothing".
- On the live site (182-entry `ready.json`, CDN), Kai is drawn from his sheets after 3.5 s.
- Locally Kai is also drawn when `ready.json` fails to parse (nothing in it loads).
- Not the cause:
  - Taking out `foot/kai-crouch.webp` alone does NOT fix it.
  - Taking out all 55 new `foot/` entries (392 entries left) does NOT fix it either: after 15 s, `FQ.miss` = `{kai: 1222, grunt: 341}`.
- So the cause is in the other 210 new entries or files, or in the sheer load. Check `ART.anim` decode order and budget against the number of images `ready.json` makes the page fetch.
- Screenshots of the stage also time out (page under heavy load).
- Measured on the laptop while other jobs ran. Re-measure on a quiet machine.

**Painted street layers are not drawn:** all 5 load (no HTTP errors), but `FA.bg` is never called by the current street engine (`bgCalls: {}`), so the stage still shows the flat mock blocks. This needs wiring code.

**Ingest "needs wiring code" (25):** event-boss-warning, event-level-clear, event-new-record, kit-* and others; see `TALON_assets/logs/nr_ingest_run.txt`.

## Still missing (no full-size source anywhere on the laptop): 77 ids
| group | count | ids |
|---|---|---|
| ach | 30 | ach-* |
| fl | 12 | billboard, captive, chest, crate, lamp, medal-*, secret, sign |
| pk | 12 | bubble, dashr, decoy, empr, glass, gwell, hornet, lance, ovd, splint, stasis, zone |
| en | 8 | bomber, carrier, healer, kamikaze, minelayer, shielder, sniper, splitter |
| spr | 3 | en-gtank, en-gturret, en-gwalker |
| plates | 12 | bemp, bpause, dailybtn, diffbtn, gabtn, go-dim, labbtn, setbtn, startbtn, storybtn, title, wpbtn |

There are also 62 register ids that ingest cannot match by name (30 of them have laptop originals: eship-*, foot-*-sheet, foot/kai-* extra frames, spr-en-gate/turret parts, strip-ship-*-bank).
