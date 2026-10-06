# python3 tools/a8/mkdbg.py → dbg_v86v.html / dbg_v86w.html in the repo root (live bodies + window.__dbg, local three.js) for tools/a8/measure.sh
import subprocess
for c,name in [('810a5fb','dbg_v86v.html'),('a23e93e','dbg_v86w.html')]:
  s=subprocess.run(['git','show',c+':games/mainhattan-overdrive/index.html'],capture_output=True,text=True).stdout
  j=s.find('>',s.find('<body'))+1;k=s.rfind('</body></html>');s=s[j:k]
  t=s.replace('https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js','/node_modules/three/build/three.module.js').replace('https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/','/node_modules/three/examples/jsm/')
  t=t.replace("window.__mho={","window.__dbg={scene,bloom,FX,composer,renderer,camera,THREE,get WORLD(){return WORLD}};window.__mho={",1)
  open(name,'w').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'+t+'</body></html>')
