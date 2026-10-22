#!/usr/bin/env python3
"""deadfns.py analyze "<cov glob>" : merged V8 coverage (written by qa/covhook.js: NODE_OPTIONS="--require qa/covhook.js" COVDIR=<dir> node <test>) ->
dead function DECLARATIONS that nothing else references (name occurs nowhere in the code corpus except in its own body and in other deleted functions).
env: HTML=<built page the coverage ran on> (default a fresh NR_OUT build), CLS=1 lists dead sites per candidate, ALL=1 includes candidates that are still referenced.
Skips lab*.js (Lab menus stay), choices.js (build2), fleet.js (fleetArr), layout.js (layoutStrip). Written for CONSOLIDATION-PLAN.md step 7."""
import json,glob,os,re,sys,collections
import tempfile,subprocess
R=os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'../../..'))+'/'; P=R+'games-src/nightrun/parts/'
SKIP={'lab.js','labassets.js','labfull.js','choices.js','fleet.js','layout.js','sw.js'}   # Lab menus stay; default-OFF flags build2 / fleetArr / layoutStrip
order=[o for o in dict.fromkeys(re.findall(r"rd\(['\"]([A-Za-z0-9]+\.js)['\"]\)",open(P+'build.py').read())) if o!='sw.js']+['bg.js','draw.js','b.js']
order=list(dict.fromkeys(order))
parts={f:open(os.path.join(r,f),encoding='utf8').read() for r,_,fs in os.walk(P) for f in fs if f.endswith('.js')}
# merged coverage
acc=collections.defaultdict(lambda:collections.defaultdict(int)); 
for f in glob.glob(sys.argv[2]):
    for k,d in json.load(open(f)).items():
        k=k.rsplit('#',1)[1]
        for fk,c in d.items(): acc[k][fk]+=c
big=max(acc,key=int)
HT=os.environ.get('HTML')
if not HT:
    HT=tempfile.mkdtemp()+'/index.html'; subprocess.run(['python3',P+'build.py'],env={**os.environ,'NR_OUT':HT},check=True,stdout=subprocess.DEVNULL)
html=open(HT,encoding='utf8').read()
L=int(big); src=None
for m in re.finditer(r'<script[^>]*>',html):
    e=html.find('</script>',m.end())
    c=html[m.end():e]
    if len(c.encode('utf-16-le'))//2==L: src=c
assert src,'script not found'
fns=[]  # (a,b,name)
src16=src.encode('utf-16-le')
for fk,c in acc[big].items():
    rng,name=fk.split('|',1); a,b=map(int,rng.split('-'))
    if not name or c: continue
    t=src16[2*a:2*b].decode('utf-16-le')
    if re.match(r'(async\s+)?function\s+'+re.escape(name)+r'\s*\(',t): fns.append((a,b,name))
# locate each in a part
cand=[]
for a,b,name in fns:
    t=src[a:b]; hit=[f for f,s in parts.items() if s.count(t)==1]
    tot=sum(s.count(t) for s in parts.values())
    if len(hit)==1 and tot==1 and hit[0] not in SKIP: cand.append((hit[0],parts[hit[0]].find(t),name,t))
# corpus
corp={}
for base in (R+'games-src/nightrun',R+'games-src/scripts'):
    for dp,dn,fn in os.walk(base):
        if 'node_modules' in dp: continue
        for f in fn:
            if f.endswith(('.js','.html','.py','.sh','.json')) and f not in('fingerprints.json','asset-coverage.json','assets-manifest.json','sprite-calib.json'):
                p=os.path.join(dp,f)
                try: corp[p]=open(p,encoding='utf8').read()
                except Exception: pass
names={c[2] for c in cand}
def cnt(name,text): return len(re.findall(r'(?<![\w$])'+re.escape(name)+r'(?![\w$])',text))
tot={n:sum(cnt(n,t) for t in corp.values()) for n in names}
alive=set(names); byname=collections.defaultdict(list)
for c in cand: byname[c[2]].append(c)
# a name defined twice (two dead decls) shares refs: handled since tot counts both bodies
changed=True
while changed:
    changed=False
    for n in list(alive):
        inside=sum(cnt(n,c[3]) for m in alive for c in byname[m] )   # occurrences inside bodies of everything still deleted (incl. itself)
        # but nested bodies double count: cand bodies can contain each other; use outermost only
        outer=[c for m in alive for c in byname[m]]
        # drop bodies nested in other bodies of same part
        keep=[]
        for c in outer:
            if not any(o is not c and o[0]==c[0] and o[1]<=c[1] and c[1]+len(c[3])<=o[1]+len(o[3]) for o in outer): keep.append(c)
        inside=sum(cnt(n,c[3]) for c in keep)
        if tot[n]-inside>0: alive.discard(n); changed=True
dele=[c for c in cand if c[2] in alive]
keep=[c for c in dele if not any(o is not c and o[0]==c[0] and o[1]<=c[1] and c[1]+len(c[3])<=o[1]+len(o[3]) for o in dele)]
per=collections.defaultdict(lambda:[0,0,[]])
for f,off,n,t in keep: q=per[f];q[0]+=1;q[1]+=len(t.encode());q[2].append(n)
if sys.argv[1]=='analyze':
    print('dead-by-coverage declarations',len(fns),'candidates in parts',len(cand),'orphaned',len(keep),'bytes',sum(v[1] for v in per.values()))
    for f,v in sorted(per.items(),key=lambda x:-x[1][1]): print(f'{f:16}{v[0]:4} fns {v[1]/1024:6.1f} KB  '+','.join(v[2][:6]))

if os.environ.get('CLS'):
    # all function ranges (with counts) in script coordinates (utf16->python index conversion: ignore, parts mostly BMP)
    rngs=[]
    for fk,c in acc[big].items():
        rg,nm=fk.split('|',1); a,b=map(int,rg.split('-')); rngs.append((a,b,c,nm))
    rngs.sort()
    # map part text -> script offset: find part in src
    base={}
    for f,s in parts.items():
        i=src.find(s)
        if i>=0: base[f]=i
    def inner(pos):
        best=None
        for a,b,c,nm in rngs:
            if a<=pos<b and (best is None or b-a<best[1]-best[0]): best=(a,b,c,nm)
        return best
    rep=[]
    for c in cand:
        n=c[2]; f=c[0]
        if n in alive: continue
        s=parts[f]; sites=[]
        if f not in base: continue
        for m in re.finditer(r'(?<![\w$])'+re.escape(n)+r'(?![\w$])',s):
            pos=base[f]+m.start()
            if c[1]<=m.start()<c[1]+len(c[3]): continue
            i=inner(pos); sites.append((i[2]==0,i[3],pos))
        other=sum(cnt(n,t) for p,t in corp.items() if os.path.basename(p)!=f or '/parts/' not in p)
        rep.append((n,f,len(c[3]),other,sites))
    dead_only=[r for r in rep if os.environ.get('ALL') or (r[3]==0 and r[4] and all(s[0] for s in r[4]))]
    print('candidates',len(rep),'only referenced in same part from dead-site',len(dead_only),'bytes',sum(r[2] for r in dead_only))
    for r in sorted(dead_only,key=lambda r:-r[2])[:34]: print(r[0],r[1],r[2],[('D:' if s[0] else 'L:')+(s[1] or '<anon>') for s in r[4]][:5],'ext',r[3])
