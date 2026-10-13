# chk-1 handoff (2026-10-13)
- src/99c_checklist.js: every OD_CHECKLIST item now has a 📍 GO. Items without an explicit target get one from area/text:
  garage items → open the garage ({gar}), Athens items → fly to / drive Athens ({here,c:'ath'}), rest → Frankfurt roam.
- tools/tChkGo.js <url> <outdir>: counts items with GO, taps GO on every item, 3 result shots + list shot.
- Left: no Home save / Home cars / nitro items exist on alex/od-models (no branch has them) → add those items + specific spawns
  (sports car 30 m before Home garage, Post Van on a straight, garage on ride 1991) when their code lands. Garage GO opens RIDES
  but does not select a specific ride yet.
