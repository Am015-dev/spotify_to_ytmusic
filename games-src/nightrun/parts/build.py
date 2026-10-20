import re,sys,os
P='/home/user/spotify_to_ytmusic/games-src/nightrun/parts/'
rd=lambda n:open(P+n,encoding='utf8').read()
def rep(s,a,b,cnt=1):
    assert s.count(a)>=1,('missing',a[:60])
    return s.replace(a,b) if cnt==0 else s.replace(a,b,cnt)
bg=rd('bg.js'); dr=rd('draw.js'); b=rd('b.js')   # (the old string patches are baked into bg.js and draw.js)
# bg patches
# (the beat pulse no longer flashes the backdrop: it lives on the screen edges and the ship ring, see parts/fx.js)
# draw patches
out=rd('head.html')+rd('a.js')+"\n"+rd('songs.js')+"\n"+bg+"\n"+b+"\n"+dr+"\n"+rd('garage.js')+"\n"+rd('shop.js')+"\n"+rd('fx.js')+"\n"+rd('power.js')+"\n"+rd('story.js')+"\n"+rd('map.js')+"\n"+rd('athens.js')+"\n"+rd('dir.js')+"\n"+rd('paths.js')+"\n"+rd('upgrades.js')+"\n"+rd('up2.js')+"\n"+rd('perks2.js')+"\n"+rd('strategy.js')+"\n"+rd('athens2.js')+"\n"+rd('art.js')+"\n"+rd('ai.js')+"\n"+rd('meta.js')+"\n"+rd('ret.js')+"\n"+rd('fxwave.js')+"\n"+rd('flavor.js')+"\n"+rd('footart.js')+"\n"+rd('footen.js')+"\n"+rd('foot.js')+"\n"+rd('leak.js')+"\n"+rd('zoo.js')+"\n"+rd('formations.js')+"\n"+rd('stagescripts.js')+"\n"+rd('scale.js')+"\n"+rd('powerups.js')+"\n"+rd('flow.js')+"\n"+rd('tale.js')+"\n"+rd('stats.js')+"\n"+rd('feedback.js')+"\n"+rd('lab.js')+"\n"+rd('labassets.js')+"\n"+rd('shapes.js')+"\n"+rd('hud.js')+"\n"+rd('uikit.js').replace('__BOSSANIM__',open('/home/user/spotify_to_ytmusic/games/mainhattan-nightrun/media/anim-boss.json').read().replace('\n','').replace(' ',''))+"\n"+rd('lagfix.js')+"\n"+rd('g.js')+"\n"+rd('wpx.js')+"\n"+rd('fair.js')+"\n"+rd('hard.js')+"\n"+rd('armour.js')+"\n"+rd('reward.js')+"\n"+rd('bossmoves.js')+"\n"+rd('bossvis.js')+"\n"+rd('powlevels.js')+"\n"+rd('abilities.js')+"\n"+rd('counter.js')+"\n"+rd('timing.js')+"\n"+rd('h.js')+"\n"+rd('fun.js')+"\n"+rd('tut.js')+"\n"+rd('title.js')+"\n"+rd('cp.js')+"\n"+rd('fs.js')+"\n"+rd('readable.js')+"\n"+rd('c.js')
OUT=os.environ.get('NR_OUT','/home/user/spotify_to_ytmusic/games/mainhattan-nightrun/index.html')   # NR_OUT=<file> builds somewhere else (tests); default is the deploy path
open(OUT,'w',encoding='utf8').write(out)
if 'NR_OUT' not in os.environ:   # media/assets-index.json for the Lab ASSETS tab (labassets.js): the manifest plus every other media file, so the tab never goes stale
    import json
    _md='/home/user/spotify_to_ytmusic/games/mainhattan-nightrun/media/'
    _mf=json.load(open('/home/user/spotify_to_ytmusic/games-src/nightrun/assets-manifest.json',encoding='utf8'))
    _in={e['file'] for e in _mf}
    json.dump({'manifest':_mf,'extra':sorted(f for f in os.listdir(_md) if f.endswith('.webp') and f not in _in)},open(_md+'assets-index.json','w',encoding='utf8'),separators=(',',':'))
print(len(out))
import subprocess,hashlib
if 'NR_OUT' not in os.environ:   # B30: the service worker carries a hash of the page, so every deploy is a new worker and new cache names
    open(os.path.join(os.path.dirname(OUT),'sw.js'),'w',encoding='utf8').write(rd('sw.js').replace('__BUILD__',hashlib.sha1(out.encode('utf8')).hexdigest()[:10]))
if 'NR_OUT' not in os.environ:subprocess.run(['python3','/home/user/spotify_to_ytmusic/games-src/scripts/stamp-copyright.py',OUT],check=True)
