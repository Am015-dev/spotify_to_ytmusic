#!/usr/bin/env bash
# tools/ld/prop_10264.sh : the 10264 Corner Garage as a Frankfurt world prop → src/98ld3_data.js (cga, lower half) + src/98ld4_data.js (cgb, upper half)
# truck + scooter dropped, low-poly meshes (LD_KEEP/LD_MINT), parts hidden from outside culled (ldcull.py), flowers/clips dropped. In game LD_cull (98ld_import.js)
# also drops hidden studs and bevel slivers. Delete both modules first: ld2src skips meshes other data modules hold.
set -euo pipefail; cd "$(dirname "$0")/../.."
LD_KEEP=.2 LD_MINT=48 python3 tools/ld/ld2garage.py ld/omr/10264-1.mpd ld/out/cgarage --drop truck,scooter
python3 tools/ld/ldcull.py ld/out/cgarage.json ld/out/cgarage_c.json .3 ld32607,ld24866,ld4735
python3 - <<'P'
import json
R=json.load(open('ld/out/cgarage_c.json'));B=sorted(R['bricks'],key=lambda b:(b['y'],b['x'],b['z']));h=len(B)//2
for n,part in (('a',B[:h]),('b',B[h:])):
    S=dict(R);S['bricks']=part;used={b['t'].split('@')[0] for b in part};S['meshes']={k:v for k,v in R['meshes'].items() if k in used};json.dump(S,open('ld/out/cgarage_%s.json'%n,'w'))
P
rm -f src/98ld3_data.js src/98ld4_data.js
python3 tools/ld/ld2src.py --out src/98ld3_data.js cga=ld/out/cgarage_a.json
python3 tools/ld/ld2src.py --out src/98ld4_data.js cgb=ld/out/cgarage_b.json
