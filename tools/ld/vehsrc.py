#!/usr/bin/env python3
"""Vehicle lane (alex/od-mdl-veh): one LDraw OMR vehicle -> its own module src/98ld_v_<set>.js = LD data + RIDES preset.
usage: python3 tools/ld/vehsrc.py <set> <ld/out json> "<Ride name>" <KIND> <perk> [top acc han]
The module goes in src/ORDER after 98ld_import.js (it registers its meshes in GB_PC like 98ld_import.js does for the base data)."""
import sys, os, re, json, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..', '..')
st, js, name, kind, perk = sys.argv[1:6]; top, acc, han = (sys.argv[6:9] + ['1.03', '1.03', '1.03'])[:3]
mid = 'v' + st.replace('-', '_'); out = os.path.join(ROOT, 'src', '98ld_v_%s.js' % st)
subprocess.check_call([sys.executable, os.path.join(HERE, 'ld2src.py'), '--out', out, '%s=%s' % (mid, js)])
R = json.load(open(js)); mpd = os.path.join(ROOT, 'ld', 'omr', R['model'])
au = re.search(r'^0 Author:\s*(.+)$', open(mpd, errors='replace').read(), re.M); au = au.group(1).strip() if au else ''
s = open(out).read().replace('%s ' % R['model'], '%s %s' % (R['model'], au), 1).replace('"by":""', '"by":%s' % json.dumps(au), 1)
keys = sorted(set(re.findall(r'"(ld\w+)":\{"n"', s)))
setno = st.split('-')[0]
s += ("for(const k of %s){const D=LD_MESH[k];if(!GB_PC[k]){GB_PC[k]={n:D.n.replace(/^~/,''),w:D.w,d:D.d,h:D.h,cat:'LDraw',ic:'◆',hide:1,s:D.s.some(q=>!q[3])};G13_ID[k]=D.id}}\n" % json.dumps(keys)
      + "{const R=GAR_set('rod'),L=n=>JSON.parse(JSON.stringify(R.load[n]));\n"
      + " GAR_SETS.push({id:'t_%s',n:%s,tier:'c',req:null,car:()=>LD_br('%s'),off:R.off,boat:R.boat,tpl:1,ref:'%s',forms:['car'],\n" % (mid, json.dumps('%s (%s)' % (name, setno)), mid, setno)
      + "  load:{car:{name:%s,k:%s,st:{top:%s,acc:%s,han:%s,hull:1},w:'Medium',perk:'%s'},'4x4':L('4x4'),boat:L('boat')}})}\n" % (json.dumps(name.upper()), json.dumps(kind), top, acc, han, perk))
open(out, 'w').write(s); print('VEH_OK', out, os.path.getsize(out), 'B id t_%s' % mid)
