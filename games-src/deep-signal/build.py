# Builds deep-signal.html (one self-contained file) and x.js (all scripts joined, for node --check). Shared kit files are inlined from ../shell.
import os, re, json, glob
D = os.path.dirname(os.path.abspath(__file__)); SP = os.path.abspath(os.path.join(D, '..')); REPO = os.path.abspath(os.path.join(SP, '..'))
S = os.path.join(D, 'src'); SH = os.path.join(SP, 'shell')
rd = lambda p: open(p, encoding='utf-8').read()
man = json.load(open(os.path.join(D, 'assets.json'), encoding='utf-8'))
stems = {i['stem'] for i in man['items']}
media = os.path.join(REPO, 'games', 'deep-signal', 'media')
have = sorted(h for h in (os.path.splitext(os.path.basename(f))[0] for f in glob.glob(os.path.join(media, '*.webp'))) if h in stems)
music = sorted(os.path.splitext(os.path.basename(f))[0] for f in glob.glob(os.path.join(REPO, 'games', 'deep-signal', 'music', '*.mp3')))
pre = ('window.DS_MISSIONS=' + json.dumps(json.load(open(os.path.join(D, 'missions-full.json'), encoding='utf-8')), separators=(',', ':'), ensure_ascii=False) + ';\n'
       + 'window.DS_ASSETS=' + json.dumps({'items': [{k: i[k] for k in ('stem', 'kind', 'w', 'h', 'ratio', 'alpha', 'wave')} for i in man['items']]}, separators=(',', ':')) + ';\n'
       + 'window.DS_HAVE=' + json.dumps(have) + ';window.DS_MUSIC=' + json.dumps(music) + ';\n'
       + 'window.CAMPAIGN=' + json.dumps(json.load(open(os.path.join(D, 'campaign.json'), encoding='utf-8')), separators=(',', ':'), ensure_ascii=False) + ';\n')
SRC = {'gx-scenario.js': os.path.join(SH, 'gx-scenario.js'), 'scn.js': os.path.join(S, 'scn.js'), 'shell.js': os.path.join(SH, 'shell.js'), 'gx-kit.js': os.path.join(SH, 'gx-kit.js'),
       'gx-viewport.js': os.path.join(SH, 'gx-viewport.js'), 'gx-help.js': os.path.join(SH, 'gx-help.js'), 'gx-tutor.js': os.path.join(SH, 'gx-tutor.js'),
       'gameaudio.js': os.path.join(SP, 'audio', 'gameaudio.js'), 'gx-music.js': os.path.join(SH, 'gx-music.js'), 'gx-campaign.js': os.path.join(SH, 'gx-campaign.js'),
       'data.js': None, 'engine.js': os.path.join(S, 'engine.js'), 'ai.js': os.path.join(S, 'ai.js'), 'art.js': os.path.join(S, 'art.js'), 'ui.js': os.path.join(S, 'ui.js'), 'tutor.js': os.path.join(S, 'tutor.js')}
css = '\n'.join(rd(os.path.join(SH, f)) for f in ('shell.css', 'gx-kit.css', 'gx-help.css', 'gx-tutor.css', 'gx-campaign.css', 'gx-menu.css'))
h = rd(os.path.join(S, 'head.html')).replace('/*SHELL_CSS*/', css)
body = rd(os.path.join(S, 'body.html'))
for f, p in SRC.items():
    tag = '<script src="%s"></script>' % f; assert tag in body, f
    src = (pre if p is None else rd(p)).replace('</script', '<\\/script')
    body = body.replace(tag, '<script>\n' + src + '\n</script>')
out = h + body
open(os.path.join(D, 'deep-signal.html'), 'w', encoding='utf-8').write(out)
open(os.path.join(D, 'x.js'), 'w', encoding='utf-8').write('\n'.join(re.findall(r'<script>(.*?)</script>', out, re.S)))
print('deep-signal.html', len(out.encode('utf-8')), 'bytes;', len(have), 'pictures,', len(music), 'music files present')
