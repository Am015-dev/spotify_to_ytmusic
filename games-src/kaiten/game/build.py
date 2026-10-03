# Builds kaiten.html (one self-contained file) and x.js (all our scripts joined, for node --check).
# All paths are repo-relative (this file lives in games-src/kaiten/game/).
import re, os, sys
D = os.path.dirname(os.path.abspath(__file__))
SP = os.path.abspath(os.path.join(D, '..', '..'))   # games-src
KT = os.path.abspath(os.path.join(D, '..'))         # games-src/kaiten
def rd(p): return open(p, encoding='utf-8').read()
parts = sorted(f for f in os.listdir(os.path.join(D, 'src')) if re.match(r'ui\d+\.js$', f))
ui = ''.join(rd(os.path.join(D, 'src', f)) for f in parts)
open(os.path.join(D, 'ui.js'), 'w', encoding='utf-8').write(ui)
audio = os.path.join(SP, 'audio', 'kaiten', 'audio-data.js')
SRC = {'shell.js': os.path.join(SP, 'shell', 'shell.js'), 'perfhud.js': os.path.join(SP, 'perf', 'perfhud.js'), 'gameaudio.js': os.path.join(SP, 'audio', 'gameaudio.js'),
       'kit.js': os.path.join(KT, 'kit', 'kit.js'), 'data.js': os.path.join(D, 'src', 'data.js'), 'engine.js': os.path.join(D, 'src', 'engine.js'), 'ai.js': os.path.join(D, 'src', 'ai.js'), 'ui.js': os.path.join(D, 'ui.js'),
       'trystero.min.js': os.path.join(SP, 'net', 'trystero.min.js'), 'netroom.js': os.path.join(SP, 'net', 'netroom.js'), 'netstrip.js': os.path.join(D, 'src', 'netstrip.js'), 'net.js': os.path.join(D, 'src', 'net.js')}
if os.path.exists(audio): SRC['audio-data.js'] = audio
else: print('NOTE: audio-data.js missing, silent build', file=sys.stderr)
ORDER = ['shell.js', 'perfhud.js', 'trystero.min.js', 'netroom.js', 'kit.js', 'data.js', 'engine.js', 'ai.js', 'netstrip.js', 'gameaudio.js', 'audio-data.js', 'net.js', 'ui.js']
h = rd(os.path.join(D, 'head.html')).replace('/*SHELL_CSS*/', rd(os.path.join(SP, 'shell', 'shell.css')))
body = rd(os.path.join(D, 'body.html'))
if 'audio-data.js' in SRC: body = body.replace('<script src="ui.js"></script>', '<script src="audio-data.js"></script>\n<script src="ui.js"></script>')
for f in ORDER:
    tag = '<script src="%s"></script>' % f
    if f not in SRC: continue
    assert tag in body, f
    src = rd(SRC[f]).replace('</script', '<\\/script')
    body = body.replace(tag, '<script>\n' + src + '\n</script>')
out = h + body
open(os.path.join(D, 'kaiten.html'), 'w', encoding='utf-8').write(out)
js = '\n'.join(re.findall(r'<script>(.*?)</script>', out, re.S))
open(os.path.join(D, 'x.js'), 'w', encoding='utf-8').write(js)
print('kaiten.html', len(out.encode('utf-8')), 'bytes')
