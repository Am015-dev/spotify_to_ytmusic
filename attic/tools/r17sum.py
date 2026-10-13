# r17sum.py bench.txt… : per-track means of the review numbers (pack gap 15/30/60 s, overtakes, walls/min, wall clearance, tyre rays)
import json,sys,collections
for fn in sys.argv[1:]:
  R=collections.defaultdict(list)
  for l in open(fn):
    d=json.loads(l.split(' ',1)[1]);R[d['track'].split('|')[0]].append(d)
  print('==',fn)
  for k,v in R.items():
    m=lambda f:round(sum(f(x) for x in v)/len(v),2)
    pk={t:round(sum(x['pack'].get(t,0) for x in v)/len(v)) for t in ['t15','t30','t60']}
    ty=[x['tyreRay'].get('road') for x in v if x['tyreRay'].get('road')]
    print(k,'wall/min',m(lambda x:x['wallPerMin']),'pack',pk,'overtakes',m(lambda x:x['overtakes']),'plChg',m(lambda x:x['plPlaceChanges']),'place',[x['place'] for x in v],
      'clrMin',[x['wallClearMinPerLap'] for x in v],'clrP10',m(lambda x:x['wallClearP10'] or 0),'clrMed',m(lambda x:x['wallClearMed'] or 0),
      'tyreRoad p50/min',[(t['p50'],t['min']) for t in ty],'avgKmh',m(lambda x:x['avgKmh']),'top',m(lambda x:x['topKmh']),'raceSec',m(lambda x:x['raceSec']),'err',sum(len(x['errors']) for x in v))
