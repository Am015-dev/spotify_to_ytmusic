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
gxs += '\n' + '\n'.join([sh('shell', 'shell.js'), sh('shell', 'gx-kit.js'), sh('shell', 'gx-viewport.js'), sh('shell', 'gx-help.js'), sh('shell', 'gx-tutor.js'), sh('shell', 'gx-campaign.js'), sh('audio', 'gameaudio.js'), sh('shell', 'gx-music.js')])
shellcss = sh('shell', 'shell.css') + '\n' + sh('shell', 'gx-kit.css') + '\n' + sh('shell', 'gx-help.css') + '\n' + sh('shell', 'gx-tutor.css') + '\n' + sh('shell', 'gx-campaign.css')
sound = rd(os.path.join(S, 'sound.js')); tutor = rd(os.path.join(S, 'tutor.js')); camp = rd(os.path.join(S, 'camp.js'))
scn = rd(os.path.join(S, 'scn.js'))
# stems that have a picture file right now (games/emberclimb/media or a local media/ folder): the page only requests those, so a missing file never causes a 404
present = set()
for d in (os.path.join(D, 'media'), os.path.join(SP, '..', 'games', 'emberclimb', 'media')):
    if os.path.isdir(d): present |= {os.path.splitext(f)[0] for f in os.listdir(d) if f.endswith('.webp')}
# music files that exist (games/emberclimb/music/<slot>-<a|b>.mp3): only those are registered, so a missing file never causes a 404
mus = set()
for d in (os.path.join(D, 'music'), os.path.join(SP, '..', 'games', 'emberclimb', 'music')):
    if os.path.isdir(d): mus |= {os.path.splitext(f)[0] for f in os.listdir(d) if f.endswith('.mp3')}
vid = set()   # boss intro videos (games/emberclimb/media/boss-<id>.mp4, owner art from owner-art/install.py)
for d in (os.path.join(D, 'media'), os.path.join(SP, '..', 'games', 'emberclimb', 'media')):
    if os.path.isdir(d): vid |= {os.path.splitext(f)[0] for f in os.listdir(d) if f.endswith('.mp4')}
out = rd(os.path.join(S, 'head.html')).replace('/*SHELLCSS*/', shellcss) + rd(os.path.join(S, 'body.html'))
out = out.replace('/*ASSETS*/', 'window.ASSETS=' + json.dumps(json.loads(assets), separators=(',', ':')) + ';window.MEDIA_PRESENT=' + json.dumps(sorted(present)) + ';window.MEDIA_VIDEO=' + json.dumps(sorted(vid)) + ';').replace('/*CORE*/', core.replace('</script', '<\\/script')).replace('/*GXSCN*/', gxs.replace('</script', '<\\/script')).replace('/*SCN*/', scn.replace('</script', '<\\/script')).replace('/*UI*/', (rd(os.path.join(S, 'story.js')) + '\n' + ui).replace('</script', '<\\/script')).replace('/*SOUND*/', 'window.MUSIC_PRESENT=' + json.dumps(sorted(mus)) + ';' + sound).replace('/*HELP*/', rd(os.path.join(S, 'help.js'))).replace('/*TUTOR*/', tutor).replace('/*CAMP*/', 'window.CAMPAIGN=' + json.dumps(json.load(open(os.path.join(D, 'campaign.json'))), separators=(',', ':')) + ';' + camp)
import base64   # shelf menu faces (same block build-all injects; id gx-menu keeps it idempotent)
face = lambda fam, w, f: "@font-face{font-family:'%s';font-weight:%d;font-style:normal;font-display:swap;src:url(data:font/woff2;base64,%s) format('woff2')}" % (fam, w, base64.b64encode(open(os.path.join(SP, 'shell', 'fonts', f), 'rb').read()).decode())
out = out.replace('</head>', '<style id="gx-menu">' + face('Cinzel', 700, 'cinzel-700.woff2') + face('Alegreya Sans', 400, 'alegreya-sans-400.woff2') + face('Alegreya Sans', 700, 'alegreya-sans-700.woff2') + sh('shell', 'gx-menu.css') + '</style>\n</head>', 1)
open(os.path.join(D, 'emberclimb.html'), 'w', encoding='utf-8').write(out)
open(os.path.join(D, 'x.js'), 'w', encoding='utf-8').write('\n'.join(re.findall(r'<script>(.*?)</script>', out, re.S)))
print('emberclimb.html', len(out.encode('utf-8')), 'bytes')
