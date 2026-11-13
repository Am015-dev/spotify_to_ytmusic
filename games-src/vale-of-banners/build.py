# Builds vale-of-banners.html (one self-contained file) and x.js (our scripts joined, for node --check). Run from anywhere.
import os, re, json, glob
D = os.path.dirname(os.path.abspath(__file__)); SP = os.path.abspath(os.path.join(D, '..')); REPO = os.path.abspath(os.path.join(SP, '..'))
S = os.path.join(D, 'src'); rd = lambda p: open(p, encoding='utf-8').read()
SLUG = 'vale-of-banners'
# assets.json = every picture slot; only media/<stem>.webp files that exist are listed, so the page never requests a missing file
man = json.load(open(os.path.join(D, 'assets.json'), encoding='utf-8'))
stems = {i['stem'] for i in man['items']}
have = set()
for d in (os.path.join(REPO, 'games', SLUG, 'media'), os.path.join(D, 'media')):
    have |= {os.path.splitext(os.path.basename(f))[0] for f in glob.glob(os.path.join(d, '*.webp'))}
have = sorted(h for h in have if h in stems)
music = sorted(os.path.splitext(os.path.basename(f))[0] for f in glob.glob(os.path.join(REPO, 'games', SLUG, 'music', '*.mp3')))
pre = 'window.VB_ASSETS=' + json.dumps({'items': [{k: i.get(k) for k in ('stem', 'kind', 'w', 'h', 'ratio', 'alpha', 'wave')} for i in man['items']]}, separators=(',', ':')) + ';window.VB_HAVE=' + json.dumps(have) + ';window.VB_MUSIC=' + json.dumps(music) + ';\n'
SH = lambda f: os.path.join(SP, 'shell', f)
SRC = {'gx-scenario.js': SH('gx-scenario.js'), 'scn.js': os.path.join(S, 'scn.js'), 'shell.js': SH('shell.js'), 'gx-kit.js': SH('gx-kit.js'), 'gx-help.js': SH('gx-help.js'),
       'gx-tutor.js': SH('gx-tutor.js'), 'gx-campaign.js': SH('gx-campaign.js'), 'campaign-data.js': None, 'gameaudio.js': os.path.join(SP, 'audio', 'gameaudio.js'),
       'gx-music.js': SH('gx-music.js'), 'data.js': os.path.join(S, 'data.js'), 'engine.js': os.path.join(S, 'engine.js'), 'ai.js': os.path.join(S, 'ai.js'),
       'art.js': os.path.join(S, 'art.js'), 'story.js': os.path.join(S, 'story.js'), 'feel.js': os.path.join(S, 'feel.js'), 'phone.js': os.path.join(S, 'phone.js'), 'ui.js': os.path.join(S, 'ui.js')}
css = rd(SH('shell.css')) + '\n' + rd(SH('gx-kit.css')) + '\n' + rd(SH('gx-campaign.css')) + '\n' + rd(SH('gx-help.css')) + '\n' + rd(SH('gx-tutor.css'))
h = rd(os.path.join(S, 'head.html')).replace('/*SHELL_CSS*/', css)
body = rd(os.path.join(S, 'body.html'))
for f, p in SRC.items():
    tag = '<script src="%s"></script>' % f; assert tag in body, f
    src = ('window.CAMPAIGN = ' + json.dumps(json.load(open(os.path.join(D, 'campaign.json'), encoding='utf-8')), separators=(',', ':'), ensure_ascii=False) + ';') if p is None else rd(p)
    if f == 'data.js': src = pre + src
    body = body.replace(tag, '<script>\n' + src.replace('</script', '<\\/script') + '\n</script>')
out = h + body
open(os.path.join(D, SLUG + '.html'), 'w', encoding='utf-8').write(out)
open(os.path.join(D, 'x.js'), 'w', encoding='utf-8').write('\n'.join(re.findall(r'<script>(.*?)</script>', out, re.S)))
print(SLUG + '.html', len(out.encode('utf-8')), 'bytes;', len(have), 'pictures,', len(music), 'songs present')
