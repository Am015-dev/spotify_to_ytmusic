import re,sys,os
P='/home/user/spotify_to_ytmusic/games-src/nightrun/parts/'
IDX={f:r for r,_,fs in os.walk(P) for f in fs}   # basename -> folder (parts/<module>/<file>); names are unique across folders, build order below is unchanged
rd=lambda n:open(os.path.join(IDX[n],n),encoding='utf8').read()
def rep(s,a,b,cnt=1):
    assert s.count(a)>=1,('missing',a[:60])
    return s.replace(a,b) if cnt==0 else s.replace(a,b,cnt)
bg=rd('bg.js'); dr=rd('draw.js'); b=rd('b.js')   # (the old string patches are baked into bg.js and draw.js)
# ART.ANIM (parts/art.js): every strip sheet in media/anim as [frames,fps,w,h,anchorX,anchorY,body] (bosses and on-foot actors keep the bottom-centre anchor, everything else is centred), smoothing.json, and sprite-calib.json (make-sprite-calib.py)
FOOTWHO=set('kai grunt gunman shield bruiser knife sniper drone turret mech warden jetpack hound flamer ninja medic'.split())   # on-foot actors keep the bottom-centre anchor (feet)
def _anim():
    import json
    R='/home/user/spotify_to_ytmusic/';md=R+'games/mainhattan-nightrun/media/anim/';sd=R+'games-src/anims/mainhattan-nightrun/sheets/';s={}
    for who in sorted(os.listdir(md)):
        for f in sorted(os.listdir(md+who)):
            if not f.endswith('-strip.webp'):continue
            j=json.load(open(sd+who+'/'+f[:-5]+'.json',encoding='utf8'));ax,ay=j['anchor'] if who.startswith('boss-') or who in FOOTWHO else (j['w']/2,j['h']/2)
            s[who+'/'+f[:-11]]=[j['frames'],j['fps'],j['w'],j['h'],ax,ay,j.get('body') or 0]   # [6] body: px of the standing height (sheets json), 0 = none
    sm=json.load(open(sd+'smoothing.json',encoding='utf8'));sm.pop('_note',None)
    return json.dumps({'s':s,'sm':sm,'c':json.load(open(R+'games-src/nightrun/sprite-calib.json',encoding='utf8'))},separators=(',',':'))
ANIM=_anim()
# bg patches
# (the beat pulse no longer flashes the backdrop: it lives on the screen edges and the ship ring, see parts/fx.js)
# draw patches
out=rd('head.html')+rd('a.js')+"\n"+rd('songs.js')+"\n"+bg+"\n"+b+"\n"+dr+"\n"+rd('garage.js')+"\n"+rd('shop.js')+"\n"+rd('fx.js')+"\n"+rd('power.js')+"\n"+rd('story.js')+"\n"+rd('map.js')+"\n"+rd('athens.js')+"\n"+rd('dir.js')+"\n"+rd('paths.js')+"\n"+rd('upgrades.js')+"\n"+rd('up2.js')+"\n"+rd('perks2.js')+"\n"+rd('strategy.js')+"\n"+rd('art.js').replace('__ANIM__',ANIM)+"\n"+rd('ai.js')+"\n"+rd('meta.js')+"\n"+rd('ret.js')+"\n"+rd('fxwave.js')+"\n"+rd('arthooks.js')+"\n"+rd('flavor.js')+"\n"+rd('footart.js')+"\n"+rd('footen.js')+"\n"+rd('foot.js')+"\n"+rd('footstage.js')+"\n"+rd('streetlook.js')+"\n"+rd('footq.js')+"\n"+rd('leak.js')+"\n"+rd('zoo.js')+"\n"+rd('formations.js')+"\n"+rd('stagescripts.js')+"\n"+rd('remix.js')+"\n"+rd('variants.js')+"\n"+rd('scale.js')+"\n"+rd('powerups.js')+"\n"+rd('flow.js')+"\n"+rd('musicpack.js')+"\n"+rd('storydata.js')+"\n"+rd('tale.js')+"\n"+rd('stats.js')+"\n"+rd('feedback.js')+"\n"+rd('lab.js')+"\n"+rd('labassets.js')+"\n"+rd('labfull.js')+"\n"+rd('shapes.js')+"\n"+rd('hud.js')+"\n"+rd('uikit.js').replace('__BOSSANIM__',open('/home/user/spotify_to_ytmusic/games/mainhattan-nightrun/media/anim-boss.json').read().replace('\n','').replace(' ',''))+"\n"+rd('lagfix.js')+"\n"+rd('g.js')+"\n"+rd('wpx.js')+"\n"+rd('fair.js')+"\n"+rd('hard.js')+"\n"+rd('react.js')+"\n"+rd('armour.js')+"\n"+rd('reward.js')+"\n"+rd('choices.js')+"\n"+rd('bossmoves.js')+"\n"+rd('bossvis.js')+"\n"+rd('powlevels.js')+"\n"+rd('abilities.js')+"\n"+rd('forge.js')+"\n"+rd('inventory.js')+"\n"+rd('forgeui.js')+"\n"+rd('forgeone.js')+"\n"+rd('counter.js')+"\n"+rd('timing.js')+"\n"+rd('visible.js')+"\n"+rd('grit.js')+"\n"+rd('density.js')+"\n"+rd('bossplay.js')+"\n"+rd('rules.js')+"\n"+rd('novelty.js')+"\n"+rd("anticamp.js")+"\n"+rd("holdline.js")+"\n"+rd("pacing.js")+"\n"+rd("bite.js")+"\n"+rd('flankers.js')+"\n"+rd('foeart.js')+"\n"+rd('fleet.js')+"\n"+rd('endramp.js')+"\n"+rd('bandclear.js')+"\n"+rd('legend.js')+"\n"+rd('h.js')+"\n"+rd('fun.js')+"\n"+rd('tut.js')+"\n"+rd('lessons.js')+"\n"+rd('saga.js')+"\n"+rd('title.js')+"\n"+rd('cp.js')+"\n"+rd('fs.js')+"\n"+rd('readable.js')+"\n"+rd('bulletart.js')+"\n"+rd('legible.js')+"\n"+rd('arsenal.js')+"\n"+rd('abup.js')+"\n"+rd('zonehint.js')+"\n"+rd('econfit.js')+"\n"+rd('comfort.js')+"\n"+rd('classes.js')+"\n"+rd('saves.js')+"\n"+rd('stamp.js')+"\n"+rd('polish.js')+"\n"+rd('diet.js')+"\n"+rd('mix.js')+"\n"+rd('hub.js')+"\n"+rd('layout.js')+"\n"+rd('school.js')+"\n"+rd('schoolfull.js')+"\n"+rd('tidy.js')+"\n"+rd('menufix.js')+"\n"+rd('explain.js')+"\n"+rd('calm.js')+"\n"+rd('waves.js')+"\n"+rd('nocaps.js')+"\n"+rd('c.js')
PARTS_EXTRA=[]   # new parts: append one line PARTS_EXTRA.append('<file>.js') below; they go in just before c.js (the game start)
PARTS_EXTRA.append('slice.js')
PARTS_EXTRA.append('puremusic.js')
PARTS_EXTRA.append('soundlab.js')
PARTS_EXTRA.append('footsfx.js')
PARTS_EXTRA.append('cleanlook.js')
PARTS_EXTRA.append('street2.js')
PARTS_EXTRA.append('steadysong.js')
PARTS_EXTRA.append('snappy.js')
PARTS_EXTRA.append('lazyart.js')
PARTS_EXTRA.append('artfix.js')
PARTS_EXTRA.append('ui2.js')
PARTS_EXTRA.append('bossfix.js')
PARTS_EXTRA.append('streetfeel.js')
PARTS_EXTRA.append('alive.js')
PARTS_EXTRA.append('lit.js')
PARTS_EXTRA.append('hangar2.js')
PARTS_EXTRA.append('footlab.js')
PARTS_EXTRA.append('street3.js')
PARTS_EXTRA.append('hangar3.js')
PARTS_EXTRA.append('footview.js')
PARTS_EXTRA.append('lab2.js')
PARTS_EXTRA.append('lab3.js')
PARTS_EXTRA.append('streethard.js')
PARTS_EXTRA.append('preload.js')
PARTS_EXTRA.append('focus.js')
PARTS_EXTRA.append('stage1fun.js')
PARTS_EXTRA.append('streetboss.js')
PARTS_EXTRA.append('streetfoe.js')
PARTS_EXTRA.append('pcbright.js')
PARTS_EXTRA.append('multhud.js')
PARTS_EXTRA.append('streetcombo.js')
PARTS_EXTRA.append('streetmelee.js')
PARTS_EXTRA.append('streetreach.js')
PARTS_EXTRA.append('streetguard.js')
PARTS_EXTRA.append('streetcounter.js')
out=out[:out.rindex(rd('c.js'))]+''.join(rd(p)+"\n" for p in PARTS_EXTRA)+rd('c.js')
OUT=os.environ.get('NR_OUT','/home/user/spotify_to_ytmusic/games/mainhattan-nightrun/index.html')   # NR_OUT=<file> builds somewhere else (tests); default is the deploy path
import hashlib,datetime
_h=hashlib.sha1(out.encode('utf8')).hexdigest()[:10]   # the stamp is filled in AFTER hashing, so it is the same hash that names the service worker caches
out=out.replace('__STAMP__',_h+' '+datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M UTC'))
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
    open(os.path.join(os.path.dirname(OUT),'sw.js'),'w',encoding='utf8').write(rd('sw.js').replace('__BUILD__',_h))
if 'NR_OUT' not in os.environ:subprocess.run(['python3','/home/user/spotify_to_ytmusic/games-src/scripts/stamp-copyright.py',OUT],check=True)
