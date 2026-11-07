# Builds emberclimb.html (one self-contained file) and x.js (our scripts joined, for node --check). Run from games-src/emberclimb/.
import os, json, re
D = os.path.dirname(os.path.abspath(__file__)); S = os.path.join(D, 'src')
rd = lambda p: open(p, encoding='utf-8').read()
core = '\n'.join(rd(os.path.join(S, f)) for f in ('data.js', 'engine.js', 'ai.js'))
open(os.path.join(D, 'core.js'), 'w', encoding='utf-8').write(core + '\nif (typeof module !== "undefined") module.exports = EC;\n')
assets = rd(os.path.join(D, 'assets.json')) if os.path.exists(os.path.join(D, 'assets.json')) else '{"items":[]}'
ui = rd(os.path.join(S, 'ui.js'))
SP = os.path.abspath(os.path.join(D, '..'))
gxs = rd(os.path.join(SP, 'shell', 'gx-scenario.js'))
sh = lambda *p: rd(os.path.join(SP, *p))
# shared kits inlined (no local copies): viewport + tutor (+ their css), audio helper and music slots
gxs += '\n' + '\n'.join([sh('shell', 'gx-viewport.js'), sh('shell', 'gx-tutor.js'), sh('audio', 'gameaudio.js'), sh('shell', 'gx-music.js')])
shellcss = sh('shell', 'gx-help.css') + '\n' + sh('shell', 'gx-tutor.css')
sound = rd(os.path.join(S, 'sound.js')); tutor = rd(os.path.join(S, 'tutor.js'))
scn = rd(os.path.join(S, 'scn.js'))
# stems that have a picture file right now (games/emberclimb/media or a local media/ folder): the page only requests those, so a missing file never causes a 404
present = set()
for d in (os.path.join(D, 'media'), os.path.join(SP, '..', 'games', 'emberclimb', 'media')):
    if os.path.isdir(d): present |= {os.path.splitext(f)[0] for f in os.listdir(d) if f.endswith('.webp')}
# music files that exist (games/emberclimb/music/<slot>-<a|b>.mp3): only those are registered, so a missing file never causes a 404
mus = set()
for d in (os.path.join(D, 'music'), os.path.join(SP, '..', 'games', 'emberclimb', 'music')):
    if os.path.isdir(d): mus |= {os.path.splitext(f)[0] for f in os.listdir(d) if f.endswith('.mp3')}
out = rd(os.path.join(S, 'head.html')).replace('/*SHELLCSS*/', shellcss) + rd(os.path.join(S, 'body.html'))
out = out.replace('/*ASSETS*/', 'window.ASSETS=' + json.dumps(json.loads(assets), separators=(',', ':')) + ';window.MEDIA_PRESENT=' + json.dumps(sorted(present)) + ';').replace('/*CORE*/', core.replace('</script', '<\\/script')).replace('/*GXSCN*/', gxs.replace('</script', '<\\/script')).replace('/*SCN*/', scn.replace('</script', '<\\/script')).replace('/*UI*/', ui.replace('</script', '<\\/script')).replace('/*SOUND*/', 'window.MUSIC_PRESENT=' + json.dumps(sorted(mus)) + ';' + sound).replace('/*TUTOR*/', tutor)
open(os.path.join(D, 'emberclimb.html'), 'w', encoding='utf-8').write(out)
open(os.path.join(D, 'x.js'), 'w', encoding='utf-8').write('\n'.join(re.findall(r'<script>(.*?)</script>', out, re.S)))
print('emberclimb.html', len(out.encode('utf-8')), 'bytes')
