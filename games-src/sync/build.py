# Builds games/sync.html (one self-contained page) from sync-src.html: inlines trystero + netroom (the same peer-to-peer
# transport the games use), the QR encoder, and the game list with each game's real file size.
# All paths are repo-relative (this file lives in games-src/sync/). Re-run after rebuilding a game so the "About N MB" labels stay right.
import os, re, json
D = os.path.dirname(os.path.abspath(__file__))
SP = os.path.abspath(os.path.join(D, '..'))        # games-src
GM = os.path.abspath(os.environ.get('GNS_GAMES') or os.path.join(SP, '..', 'games'))   # GNS_GAMES=<dir> builds against a copy of games/ (used by room/add-new-games.py)
def rd(p): return open(p, encoding='utf-8').read()
# same list as GAMES in games/classic.html: id, name, src, cover (the sizes are measured here)
LIST = [('crown','Crown City Smash','crown-city-smash/index.html','covers/crown.jpg'),
 ('nebula','Nebula Aces','nebula-aces/index.html','covers/nebula.jpg'),
 ('doorkick','Doorkick Dungeon','doorkick-dungeon/index.html','covers/doorkick.jpg'),
 ('shipwreck','Shipwreck Isle','shipwreck-isle/index.html','covers/shipwreck.jpg'),
 ('sands','Sands of Qamar','sands-of-qamar/index.html','covers/sands.jpg'),
 ('sunglaze','Sunglaze','sunglaze/index.html','covers/sunglaze.jpg'),
 ('rampart','Rampart & Vine','rampart-and-vine/index.html','covers/rampart.jpg'),
 ('shortfuse','Short Fuse (preview)','short-fuse/index.html','covers/short-fuse.jpg'),
 ('tidewake','Tidewake (preview)','tidewake/index.html','covers/tidewake.jpg'),
 ('hollowbough','Hollowbough (preview)','hollowbough/index.html','covers/hollowbough.jpg'),
 ('thornbound','The Thornbound Throne (preview)','thornbound/index.html','covers/thornbound.jpg'),
 ('kaiten','Kaiten Kitchen (preview)','kaiten-kitchen/index.html','covers/kaiten.jpg'),
 ('lantern','Lantern Dive (preview)','lantern-dive/index.html','covers/lantern.jpg'),
 ('cauldron','Cauldron Fair (preview)','cauldron-fair/index.html','covers/cauldron.jpg'),
 ('approach','Final Approach (preview)','final-approach/index.html','covers/approach.jpg'),
 ('mainhattan','Mainhattan Nightrun','mainhattan-nightrun/index.html','covers/nightrun.jpg'),
 ('overdrive','Mainhattan Overdrive','mainhattan-overdrive/index.html','covers/overdrive.jpg')]
games = []
for i, n, s, c in LIST:
    f = os.path.join(GM, s)
    games.append({'id': i, 'name': n, 'src': s, 'cover': c, 'bytes': os.path.getsize(f) if os.path.exists(f) else 0})
def js(p): return rd(p).replace('</script', '<\\/script')
out = rd(os.path.join(D, 'sync-src.html'))
for mark, path in (('/*TRYSTERO*/', os.path.join(SP, 'net', 'trystero.min.js')), ('/*NETROOM*/', os.path.join(SP, 'net', 'netroom.js')), ('/*QR*/', os.path.join(D, 'qr.js'))):
    assert mark in out, mark
    out = out.replace(mark, js(path))
assert '/*GAMES*/[]' in out
out = out.replace('/*GAMES*/[]', json.dumps(games, separators=(',', ':')))
open(os.path.join(GM, 'sync.html'), 'w', encoding='utf-8').write(out)
open(os.path.join(D, 'x.js'), 'w', encoding='utf-8').write('\n'.join(re.findall(r'<script>(.*?)</script>', out, re.S)))
print('sync.html', len(out.encode('utf-8')), 'bytes')
