import json,statistics as S
R=[json.loads(l) for l in open('raw.jsonl')]
bad=[r for r in R if 'fatal' in r]; print("fatal runs:",len(bad),[(r['build'],r['round'],r['fatal'][:60]) for r in bad])
print("\n## fps (60 s after 5 s warm-up; rounds r1/r2/r3 -> median [spread=(max-min)/median])")
print("| cell | metric | base | integrated | integ vs base |\n|---|---|---|---|---|")
for m in('flight','street'):
 for d in('phone','pc'):
  for k,lab in(('fpsMed','fps median'),('p95','p95 ms'),('p99','p99 ms'),('longtasks','long tasks >50ms'),('alive','alive at end')):
   v={b:[r[k] for r in sorted(R,key=lambda r:r['round']) if r.get('kind')=='fps' and r['mode']==m and r['dev']==d and r['build']==b and k in r] for b in('base','integ')}
   if not v['base'] or not v['integ']: continue
   if k=='alive': print(f"| {m} {d} | {lab} | {v['base']} | {v['integ']} | |");continue
   f=lambda a:f"{'/'.join(str(x) for x in a)} -> {S.median(a):.1f} [{100*(max(a)-min(a))/S.median(a):.0f}%]"
   print(f"| {m} {d} | {lab} | {f(v['base'])} | {f(v['integ'])} | {100*(S.median(v['integ'])/S.median(v['base'])-1):+.1f}% |")
print("\n## cold start ms (median / max)")
print("| dev | metric | base | integrated |\n|---|---|---|---|")
for d in('phone','pc'):
 for k in('dcl','title','startToPlay'):
  c=lambda b:[r[k] for r in R if r.get('kind')=='cold' and r['dev']==d and r['build']==b and k in r]
  if c('base') and c('integ'): print(f"| {d} | {k} | {S.median(c('base')):.0f} / {max(c('base'))} (n={len(c('base'))}) | {S.median(c('integ')):.0f} / {max(c('integ'))} (n={len(c('integ'))}) |")
