import subprocess, os, io, json, sys
from PIL import Image
R='/home/user/spotify_to_ytmusic'; OUT=os.path.dirname(os.path.abspath(__file__))
# (section key, worker label, what, [(branch, folder)])
SECT=[
 ('releases','Integrator (build-7, build-9)','Release shots per version',[('od-models','v90i'),('od-garage18','v90g'),('od-city','v90f'),('od-city','v90e'),('od-city','v90d'),('od-city','v90c'),('od-city','v90a')]),
 ('garage','Garage (garage-17, garage-18)','Rides on the garage stage, floor audit',[('od-garage18',''),('od-city','garage17b'),('od-city','garage17')]),
 ('veh','Vehicles (build-1…8, veh-2)','LEGO City/Town rides converted from LDraw',[('od-mdl-veh','veh')]),
 ('size','Ride size (size-1)','True minifig scale, Snowplow lane, drivers',[('od-models','size1')]),
 ('rescue','Rescue (rescue-1)','Skipped models brought back',[('od-models','rescue')]),
 ('city','City buildings (city-1, city-2, city-3)','LEGO modular buildings, old vs new',[('od-city','city3'),('od-city','city3/fx'),('od-city','city2'),('od-city','city1')]),
 ('land','Landscape (land-1, land-2, land-3)','Trees, lamps, palms, props before/after',[('od-mdl-land','land'),('od-mdl-land','land/ath')]),
 ('world','World props (build-6)','Houses, lighthouse, bank and other world models',[('od-city','mdlw')]),
 ('models','Model pipeline (models-1…3)','First LDraw conversions, doors',[('od-city','models3'),('od-city','models3/door'),('od-city','models2'),('od-city','models1')]),
 ('taxi','Taxi 40468 (taxi-14…16)','Taxi built from the LEGO PDF instructions',[('od-city','taxi40468'),('od-city','taxi40468/s3'),('od-city','taxi40468/s2'),('od-city','taxi40468/r1'),('od-city','taxi40468/pdf')]),
]
data=[]; n=0
for key,who,what,srcs in SECT:
  groups=[]
  for br,fo in srcs:
    path='docs/shots'+('/'+fo if fo else '')
    names=subprocess.run(['git','-C',R,'ls-tree','--name-only','origin/alex/'+br,path+'/'],capture_output=True,text=True).stdout.split()
    names=[x for x in names if x.lower().endswith(('.png','.jpg','.jpeg'))]
    if fo=='' : names=[x for x in names if 'g18' in x or 'garage18' in x]
    items=[]
    for p in sorted(names):
      raw=subprocess.run(['git','-C',R,'show','origin/alex/'+br+':'+p],capture_output=True).stdout
      try: im=Image.open(io.BytesIO(raw)).convert('RGB')
      except Exception: continue
      im.thumbnail((1000,1000))
      rel=f"img/{key}/{(fo or 'root').replace('/','_')}__{os.path.splitext(os.path.basename(p))[0]}.jpg"
      os.makedirs(os.path.join(OUT,os.path.dirname(rel)),exist_ok=True)
      im.save(os.path.join(OUT,rel),quality=74)
      items.append({'src':rel,'name':os.path.splitext(os.path.basename(p))[0],'path':f'{br}:{p}'}); n+=1
    if items: groups.append({'folder':fo or 'garage18','items':items})
  data.append({'key':key,'who':who,'what':what,'groups':groups})
json.dump(data,open(os.path.join(OUT,'data.json'),'w'))
print(n,'images')
