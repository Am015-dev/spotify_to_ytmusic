# shared patch helper
import sys
F='overdrive.html'
s=open(F).read()
def R(a,b,n=1):
    global s
    c=s.count(a)
    if c!=n: sys.exit(f'COUNT {c} != {n} for: {a[:90]!r}')
    s=s.replace(a,b)
def between(a,b):
    i=s.index(a);j=s.index(b,i);return i,j
def save():
    open(F,'w').write(s)
    t=s.replace('https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js','/node_modules/three/build/three.module.js').replace('https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/','/node_modules/three/examples/jsm/')
    open('local.html','w').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'+t+'</body></html>')
    import re;m=re.search(r'<script type="module">(.*?)</script>',s,re.S);open('chk.mjs','w').write(m.group(1))
    t2=t.replace("window.__mho={","window.__dbg={scene,bloom,FX,composer,renderer,camera,THREE,get WORLD(){return WORLD},GY:(x,z)=>groundY(x,z),get RO(){return RO},get CTL(){return CTL},get PL(){return pl},GA:(x,z,y)=>groundAt(x,z,y),get NB(){return typeof SC_S!=='undefined'?SC_S.nb:0},SS:()=>{try{studSync()}catch(e){}},get CS(){return typeof CITY_S!=='undefined'?CITY_S:null},get JN(){return typeof JUNC!=='undefined'?JUNC:null},SR:c=>setupRace(c),RS:(tab,trk,cl)=>{if(tab!=null)menuTab=tab;if(trk)menuTrack=trk;if(cl)userCls=CLASSES.find(c=>c.id===cl);startRace()},get TRK(){return TRACK_DEFS.map(t=>t.id)},get RAMPS(){return RO.ramps.map(r=>({x:r.x,z:r.z,h:r.h,len:r.len,hgt:r.hgt,w:r.w}))},get RC(){return RC},get TD(){return TD},get SH(){return ships},get ST(){return state}};window.__mho={",1)
    open('local_dbg.html','w').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'+t2+'</body></html>')
