# Builds ../sands.html (one self-contained file) and x.js (all our scripts joined, for node --check). Run from this folder.
import re, os
D = os.path.dirname(os.path.abspath(__file__))
SP = os.path.abspath(os.path.join(D, '..', '..'))   # games-src
def rd(p): return open(p, encoding='utf-8').read()
h = rd(os.path.join(D, 'head.html')); b = rd(os.path.join(D, 'body.html'))
css = rd(os.path.join(D, 'board.css')) + rd(os.path.join(SP, 'shell', 'gx-campaign.css'))
h = h.replace('</style>', css + '\n</style>', 1)
SRC = {'shell.js': os.path.join(SP, 'shell', 'shell.js'), 'gx-viewport.js': os.path.join(SP, 'shell', 'gx-viewport.js'),
       'gx-campaign.js': os.path.join(SP, 'shell', 'gx-campaign.js'), 'gameaudio.js': os.path.join(SP, 'audio', 'gameaudio.js'),
       'audio-data.js': os.path.join(SP, 'audio', 'sands', 'audio-data.js'), 'trystero.min.js': os.path.join(SP, 'net', 'trystero.min.js'),
       'netroom.js': os.path.join(SP, 'net', 'netroom.js')}
CAMP = 'window.CAMPAIGN=' + rd(os.path.join(D, '..', 'campaign.json')).strip() + ';'
ORDER = ['shell.js', 'gx-viewport.js', 'gx-campaign.js', 'campaign-data.js', 'gameaudio.js', 'audio-data.js', 'trystero.min.js', 'netroom.js',
         'data.js', 'djinns.js', 'engine.js', 'ai.js', 'rules-html.js', 'story.js', 'sound.js', 'net.js', 'ui.js', 'ui2.js', 'ui3.js']
for f in ORDER:
    tag = f'<script src="{f}"></script>'; assert tag in b, f
    src = CAMP if f == 'campaign-data.js' else rd(SRC.get(f, os.path.join(D, f)))
    b = b.replace(tag, '<script>\n' + src.replace('</script', '<\\/script') + '\n</script>')
assert '<script src=' not in b
out = h + b
open(os.path.join(D, '..', 'sands.html'), 'w', encoding='utf-8').write(out)
big = ('trystero.min.js', 'gameaudio.js', 'audio-data.js', 'netroom.js', 'shell.js', 'gx-viewport.js', 'gx-campaign.js', 'campaign-data.js')
js = '\n'.join(rd(SRC.get(f, os.path.join(D, f))) if f not in ('campaign-data.js',) else CAMP for f in ORDER if f not in ('trystero.min.js', 'audio-data.js'))
open(os.path.join(D, 'x.js'), 'w', encoding='utf-8').write(js)
print(len(out))
