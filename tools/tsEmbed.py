#!/usr/bin/env python3
# tsEmbed.py: put the authored stunt tracks (docs/tracks2/<id>.json, in the cup order below) into src/98ts_track_stunts.js between the TS_TRACKS markers
import json,re,os
ORDER=['main_river_jump','messe_skyline','taunus_drop','akropolis_hill_drop','piraeus_harbour_boats','lykavittos_loop']
L=[]
for n in ORDER:
  p=f'docs/tracks2/{n}.json'
  if os.path.exists(p):L.append(json.load(open(p)))
p='src/98ts_track_stunts.js';s=open(p).read()
a=s.index('/*TS_TRACKS*/');b=s.index('/*/TS_TRACKS*/')
s=s[:a]+'/*TS_TRACKS*/'+json.dumps(L,ensure_ascii=False,separators=(',',':'))+s[b:]
open(p,'w').write(s);print('embedded',len(L),[t['name'] for t in L])
