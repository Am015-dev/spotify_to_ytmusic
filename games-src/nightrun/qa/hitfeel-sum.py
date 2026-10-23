import json,sys,statistics as st
d=json.load(open(sys.argv[1]));n=len(d)
def agg(bot):
    R=[r for r in d if bot=='all' or r['bot']==bot]
    H=sum(r['dbg']['q']['hits'] for r in R);kn=sum(r['dbg']['q']['kn'] for r in R);knN=sum(r['dbg']['q']['knN'] for r in R)
    hist={}
    for r in R:
        for k,v in r['dbg']['q']['hist'].items():hist[int(k)]=hist.get(int(k),0)+v
    byW={}
    for r in R:
        for w,v in r['dbg']['q']['byW'].items():
            b=byW.setdefault(w,[0,0]);b[0]+=v['n'];b[1]+=v['ok']
    ks=[x for r in R for x in r['dbg']['q']['kills']]
    wh=sum(1 for r in R for s in r['dbg']['shakes'] if s[1]=='other')
    k35=[x for r in R for x in r['dbg']['q']['k35']]
    clr=sum(r['clear'] for r in R)
    return R,H,kn,knN,hist,byW,ks,wh,k35,clr
for bot in ['dodge','nearest','gfirst','all']:
    R,H,kn,knN,hist,byW,ks,wh,k35,clr=agg(bot)
    if not R:continue
    print(f"[{bot}] runs {len(R)} clear {clr}/{len(R)} hits/run {H/len(R):.0f}  hit-stop frames hist {dict(sorted(hist.items()))}")
    print("   by weapon (hits, in 2-8f):",{w:tuple(v) for w,v in byW.items()})
    ok=sum(v for k,v in hist.items() if 2<=k+1<=8)
    print(f"   hits with 2-8 frames (probe value+1) {100*ok/max(H,1):.1f}%  | foe knocked back >5u {100*kn/max(knN,1):.1f}% ({kn}/{knN}) | kills {len(ks)}, kill frames>=5: {sum(1 for x in ks if x>=5)}")
    print(f"   whiff shakes/run {wh/len(R):.1f} | Kai knock over 0.35s: median {st.median(k35) if k35 else '-'} max {max(k35) if k35 else '-'} n {len(k35)}")
