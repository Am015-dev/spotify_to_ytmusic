# OB · Euro-Skulptur (Willy-Brandt-Platz) rebuild — pOB2.py

Build: `bash reapply.sh pOB2.py` (after pOB1/pOB3 when merged). Module: `ob_euro.js`. Test: `node tOB_euro.js` (BEFORE=1 OUT=… for the unpatched base).

## Anchors replaced (each count = 1)
1. `window.__mho={` → `<ob_euro.js>` + `\nwindow.__mho={` (module inserted at module top level; prepend-only, other patches using the same anchor still match).
2. The whole Euro-Skulptur block in `lmBuildAll`, starting
   `{const L=LM_BY['Euro-Skulptur'],x=L.x,z=L.z;box(3,3,3,x,1.5,z,'#8a8f98');cyl(.4,.4,4,x,5,z,'#8a8f98',8);{con…`
   and ending `…hit(x,z,2,2,17);reg('Euro-Skulptur',17,[x,z+0])}` → 
   `{const L=LM_BY['Euro-Skulptur'],x=L.x,z=L.z,E=OB_euroBuild(bt,BM,x,z);hit(x,z,E.hw,E.hd,E.gy+14);reg('Euro-Skulptur',E.gy+14,[x,z+0])}`

## What changed
- Why it looked weird: the old piece was built at y=0 and the 2×2 m collider made `TR_bldFix` lift only the vertices within ~1.6 m of
  the collider onto the terrain (~21 m there) — the arc/bars/stars got sheared apart. The new base height uses the same rule as
  `TR_bldFix` (max(min, max−0.8) of 9 ground samples over the collider), so its lift is 0 and the piece stays intact.
- New shape (same position, same orientation: glyph in the x/y plane, seen from ±z): stone plinth 5.2×1×3.2 m + step, dark neck,
  blue flat-faced € arc (outer R 4.2, inner 2.85, 1.2 m deep, ~289° open to +x), two yellow bars reaching left past the arc,
  12 yellow five-pointed stars on a 6 m circle in the same plane (EU flag). Total height 13.98 m.
- ONE merged vertex-coloured geometry (mergeGeometries) added to the landmark batch with `BM.plain` → 0 extra draw calls.
- Collider 6.8×4.2 m (hw 3.4, hd 2.1), top gy+14; landmark height `reg` = gy+14.
- New globals: `OB_EURO`, `OB_EURO_HW`, `OB_EURO_HD`, `OB_euroBuild`; debug hook `window.__ob.euro()` → {x,z,gy,min,size,drawCalls,…}
  (Box3.setFromObject on a Mesh around the merged geometry).
