# garage-18 handoff (2026-10-10). Branch alex/od-garage18 (= od-models 4ff6f48 / v90g + fix). Version v90h (agreed with build-9; build-9 builds v90i on top).

## Done
- Audit of every ride (STREET / OFF-ROAD / WATER), phone 852×393, real touch: `g18/audit.js` (env SHARD=i/n), sheet `g18/sheet.py`, grids `tools/grid.py`.
  Findings, root causes and numbers: `docs/GARAGE_AUDIT.md`. Before sheet `docs/shots/g18_before.jpg`; after grids `docs/shots/garage18/GRID*.jpg`.
- `src/98gf_garage_floor.js` (tag GF_, in ORDER after 98ba): platform measured on the ride at rest (not mid build-up); a wheel-less ride → its lowest
  point; no bare-chassis plate under LDraw rides with their own tyres (3180).
- `src/98s_garage_studio.js`: rim 3 cm under the tiles (dark dithered floor patch = z-fighting). rescue-1 and veh-2 are told.
- OD_CHANGELOG v90h + checklist items gfloor / gpatch.

## Open
- 60083 Snowplow: blade 7 cm below the tyre line (model data); tyres on the floor.
- Alex's "I see errors": 0 console errors in all runs (Chromium only). Needs an iPhone screen recording if it persists.
- Frankfurt/Athens drive shots for v90h were not taken (tools/ld/tDrive.js <url> <out> tools/ld/ls_rally.json fra|ath); the fix touches only the garage.
- World "dark patch" (v90g phone_fra_drive2): judged not the garage path (roam cars cast no shadows, ART6); no repro here (roam is not headless).
