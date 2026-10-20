import json,glob,sys,collections
for f in sorted(glob.glob(sys.argv[1]+'/*_log.json')):
  o=json.load(open(f));L=o['log'];
  if not L: continue
  dur=L[-1]['wall']-L[0]['wall'];st=collections.Counter(s['st'] for s in L)
  K={}
  prev=set()
  for i,s in enumerate(L):
    dt=(L[i+1]['wall']-s['wall']) if i+1<len(L) else 0.3
    cur={}
    for e in s['els']: cur[e['key']]=e
    for k,e in cur.items():
      d=K.setdefault(k,{'n':0,'vis':0,'area':0,'road':0,'tc':0,'fast':0,'txt':set()})
      if k not in prev: d['n']+=1
      d['vis']+=dt;d['area']=max(d['area'],e['area']);d['road']=max(d['road'],e['road']);d['tc']=max(d['tc'],e['tc'])
      if s['v']>11: d['fast']+=dt
      if len(d['txt'])<4: d['txt'].add(e['txt'][:45])
    prev=set(cur)
  vmax=max(s['v'] for s in L)
  print(f"== {o['tag']} {o['mode']} dur {dur:.0f}s states {dict(st)} vmax {vmax*3.6:.0f} km/h taps {len(o['taps'])} {collections.Counter(o['taps']).most_common(4)}")
  for k,d in sorted(K.items(),key=lambda kv:-kv[1]['area']*kv[1]['vis']):
    print(f"  {k:22s} shows {d['n']:3d} ({d['n']/dur*60:4.1f}/min) vis {d['vis']:5.0f}s ({d['vis']/dur*100:3.0f}%) area {d['area']:5.1f}% road {d['road']:3d}% tc {d['tc']} fast {d['fast']:4.0f}s | {' / '.join(list(d['txt'])[:3])[:120]}")
