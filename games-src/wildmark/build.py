# Builds wildmark.html (one self-contained file) and x.js (all scripts joined, for node --check). Shared shell files are inlined read-only from games-src/shell/.
import os, re, json, glob
D = os.path.dirname(os.path.abspath(__file__)); SP = os.path.abspath(os.path.join(D, '..')); REPO = os.path.abspath(os.path.join(SP, '..'))
S = os.path.join(D, 'src'); SH = os.path.join(SP, 'shell')
rd = lambda p: open(p, encoding='utf-8').read()
# assets.json = every picture slot; media/<stem>.webp files that exist are listed so the page never requests a missing file
man = json.load(open(os.path.join(D, 'assets.json'), encoding='utf-8'))
stems = {i['stem'] for i in man['items']}
media = os.path.join(REPO, 'games', 'wildmark', 'media')
have = sorted(h for h in (os.path.splitext(os.path.basename(f))[0] for f in glob.glob(os.path.join(media, '*.webp'))) if h in stems)
music = sorted(os.path.splitext(os.path.basename(f))[0] for f in glob.glob(os.path.join(REPO, 'games', 'wildmark', 'music', '*.mp3')))
pre = 'window.WM_ASSETS=' + json.dumps({'items': [{k: i[k] for k in ('stem', 'kind', 'w', 'h', 'ratio', 'alpha', 'wave')} for i in man['items']]}, separators=(',', ':')) + ';window.WM_HAVE=' + json.dumps(have) + ';window.WM_MUSIC=' + json.dumps(music) + ';\n'
SRC = {'gx-scenario.js': os.path.join(SH, 'gx-scenario.js'), 'scn.js': os.path.join(S, 'scn.js'), 'shell.js': os.path.join(SH, 'shell.js'), 'gx-kit.js': os.path.join(SH, 'gx-kit.js'),
       'gx-viewport.js': os.path.join(SH, 'gx-viewport.js'), 'gx-help.js': os.path.join(SH, 'gx-help.js'), 'gx-tutor.js': os.path.join(SH, 'gx-tutor.js'), 'gx-campaign.js': os.path.join(SH, 'gx-campaign.js'),
       'campaign-data.js': None, 'gameaudio.js': os.path.join(SP, 'audio', 'gameaudio.js'), 'gx-music.js': os.path.join(SH, 'gx-music.js'),
       'data.js': os.path.join(S, 'data.js'), 'engine.js': os.path.join(S, 'engine.js'), 'cards.js': os.path.join(S, 'cards.js'), 'ai.js': os.path.join(S, 'ai.js'), 'art.js': os.path.join(S, 'art.js'), 'ui.js': os.path.join(S, 'ui.js'),
       'help.js': os.path.join(S, 'help.js'), 'tutor.js': os.path.join(S, 'tutor.js'), 'campaign.js': os.path.join(S, 'campaign.js')}
css_shell = rd(os.path.join(SH, 'shell.css')) + '\n' + rd(os.path.join(SH, 'gx-kit.css'))
css_game = '\n'.join(rd(os.path.join(SH, f)) for f in ('gx-campaign.css', 'gx-help.css', 'gx-tutor.css')) + '\n' + rd(os.path.join(S, 'skin.css'))
h = rd(os.path.join(S, 'head.html')).replace('/*SHELL_CSS*/', css_shell).replace('/*GAME_CSS*/', css_game)
body = rd(os.path.join(S, 'body.html'))
for f, p in SRC.items():
    tag = '<script src="%s"></script>' % f; assert tag in body, f
    if f == 'campaign-data.js': src = 'window.CAMPAIGN = ' + json.dumps(json.load(open(os.path.join(D, 'campaign.json'), encoding='utf-8')), separators=(',', ':'), ensure_ascii=False) + ';'
    else: src = rd(p)
    if f == 'data.js': src = pre + src
    body = body.replace(tag, '<script>\n' + src.replace('</script', '<\\/script') + '\n</script>')
out = h + body
open(os.path.join(D, 'wildmark.html'), 'w', encoding='utf-8').write(out)
open(os.path.join(D, 'x.js'), 'w', encoding='utf-8').write('\n'.join(re.findall(r'<script>(.*?)</script>', out, re.S)))
print('wildmark.html', len(out.encode('utf-8')), 'bytes;', len(have), 'pictures present;', len(music), 'music files')
