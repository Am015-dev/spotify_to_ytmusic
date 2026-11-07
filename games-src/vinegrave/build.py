# Builds vinegrave.html (one self-contained file) and x.js (all scripts joined, for node --check). Shelf shell copied from cauldron-fair's build:
# shell.js + gx-kit + gx-viewport + gx-help + gx-tutor + gx-campaign (+ campaign.json) + gx-music + gameaudio, inlined from games-src/shell (never copied).
import os, re, json, glob
D = os.path.dirname(os.path.abspath(__file__)); SP = os.path.abspath(os.path.join(D, '..')); REPO = os.path.abspath(os.path.join(SP, '..'))
S = os.path.join(D, 'src')
rd = lambda p: open(p, encoding='utf-8').read()
parts = sorted((f for f in os.listdir(S) if re.match(r'ui\d+\.js$', f)), key=lambda f: int(re.findall(r'\d+', f)[0]))
open(os.path.join(D, 'ui.js'), 'w', encoding='utf-8').write(''.join(rd(os.path.join(S, f)) for f in parts))
# picture slots: assets.json lists every slot; media/<stem>.webp files that exist are listed so the page never requests a missing file
man = json.load(open(os.path.join(D, 'assets.json'), encoding='utf-8'))
stems = {i['stem'] for i in man['items']}
media = os.path.join(REPO, 'games', 'vinegrave', 'media')
have = sorted(h for h in (os.path.splitext(os.path.basename(f))[0] for f in glob.glob(os.path.join(media, '*.webp'))) if h in stems)
mus = sorted(os.path.splitext(os.path.basename(f))[0] for f in glob.glob(os.path.join(REPO, 'games', 'vinegrave', 'music', '*.mp3')))
pre = 'window.VG_ASSETS=' + json.dumps({'items': [{k: i[k] for k in ('stem', 'kind', 'w', 'h', 'ratio', 'alpha', 'wave')} for i in man['items']]}, separators=(',', ':')) + ';window.VG_HAVE=' + json.dumps(have) + ';window.VG_MUSIC=' + json.dumps(mus) + ';\n'
SH = lambda f: os.path.join(SP, 'shell', f)
SRC = {'gx-scenario.js': SH('gx-scenario.js'), 'scn.js': os.path.join(S, 'scn.js'), 'shell.js': SH('shell.js'), 'gx-kit.js': SH('gx-kit.js'), 'gx-viewport.js': SH('gx-viewport.js'),
       'gx-help.js': SH('gx-help.js'), 'gx-tutor.js': SH('gx-tutor.js'), 'gx-campaign.js': SH('gx-campaign.js'), 'campaign-data.js': None, 'gameaudio.js': os.path.join(SP, 'audio', 'gameaudio.js'),
       'gx-music.js': SH('gx-music.js'), 'data.js': os.path.join(S, 'data.js'), 'engine.js': os.path.join(S, 'engine.js'), 'ai.js': os.path.join(S, 'ai.js'), 'art.js': os.path.join(S, 'art.js'), 'ui.js': os.path.join(D, 'ui.js')}
css = '\n'.join(rd(SH(f)) for f in ('shell.css', 'gx-kit.css', 'gx-campaign.css', 'gx-help.css', 'gx-tutor.css')) + '\n' + rd(os.path.join(S, 'style.css'))
h = rd(os.path.join(S, 'head.html')).replace('/*CSS*/', css)
body = rd(os.path.join(S, 'body.html'))
for f, p in SRC.items():
    tag = '<script src="%s"></script>' % f; assert tag in body, f
    if f == 'campaign-data.js': src = 'window.CAMPAIGN = ' + json.dumps(json.load(open(os.path.join(D, 'campaign.json'), encoding='utf-8')), separators=(',', ':'), ensure_ascii=False) + ';'
    else: src = rd(p)
    if f == 'data.js': src = pre + src
    body = body.replace(tag, '<script>\n' + src.replace('</script', '<\\/script') + '\n</script>')
out = h + body
open(os.path.join(D, 'vinegrave.html'), 'w', encoding='utf-8').write(out)
open(os.path.join(D, 'x.js'), 'w', encoding='utf-8').write('\n'.join(re.findall(r'<script>(.*?)</script>', out, re.S)))
print('vinegrave.html', len(out.encode('utf-8')), 'bytes;', len(have), 'pictures present;', len(mus), 'music files')
