# Builds perch-and-plume.html (one self-contained file) and x.js (all scripts joined, for node --check).
# Shared shelf parts are inlined from ../shell/ (read-only, never copied): shell, gx-kit, gx-viewport, gx-help, gx-tutor, gx-campaign, gx-music, gx-scenario.
import os, re, json, glob
D = os.path.dirname(os.path.abspath(__file__)); SP = os.path.abspath(os.path.join(D, '..')); REPO = os.path.abspath(os.path.join(SP, '..'))
S = os.path.join(D, 'src'); SH = os.path.join(SP, 'shell')
rd = lambda p: open(p, encoding='utf-8').read()
# assets.json = every picture slot; only media/<stem>.webp files that exist are listed, so the page never requests a missing file
man = json.load(open(os.path.join(D, 'assets.json'), encoding='utf-8'))
stems = {i['stem'] for i in man['items']}
media = os.path.join(REPO, 'games', 'perch-and-plume', 'media')
have = sorted(h for h in (os.path.splitext(os.path.basename(f))[0] for f in glob.glob(os.path.join(media, '*.webp'))) if h in stems)
music = sorted(os.path.basename(f) for f in glob.glob(os.path.join(REPO, 'games', 'perch-and-plume', 'music', '*.mp3')))
pre = ('window.PP_ASSETS=' + json.dumps({'items': [{k: i[k] for k in ('stem', 'kind', 'w', 'h', 'ratio', 'alpha', 'wave')} for i in man['items']]}, separators=(',', ':'))
       + ';window.PP_HAVE=' + json.dumps(have) + ';window.PP_MUSIC=' + json.dumps(music) + ';\n')
camp = 'window.CAMPAIGN=' + json.dumps(json.load(open(os.path.join(D, 'campaign.json'), encoding='utf-8')), separators=(',', ':'), ensure_ascii=False) + ';\n'
UI = ['render.js', 'turnui.js', 'story.js', 'coach.js', 'flow.js', 'screens.js', 'shelfkit.js', 'tutor.js']   # the game's own UI, in load order
SRC = [('gx-scenario.js', os.path.join(SH, 'gx-scenario.js')), ('scn.js', os.path.join(S, 'scn.js')), ('shell.js', os.path.join(SH, 'shell.js')), ('gx-kit.js', os.path.join(SH, 'gx-kit.js')),
       ('gx-viewport.js', os.path.join(SH, 'gx-viewport.js')), ('gx-help.js', os.path.join(SH, 'gx-help.js')), ('gx-tutor.js', os.path.join(SH, 'gx-tutor.js')), ('gx-campaign.js', os.path.join(SH, 'gx-campaign.js')),
       ('gameaudio.js', os.path.join(SP, 'audio', 'gameaudio.js')), ('gx-music.js', os.path.join(SH, 'gx-music.js')),
       ('data.js', os.path.join(S, 'data.js')), ('engine.js', os.path.join(S, 'engine.js')), ('ai.js', os.path.join(S, 'ai.js')), ('art.js', os.path.join(S, 'art.js'))] + [(f, os.path.join(S, f)) for f in UI]
css = '\n'.join(rd(os.path.join(SH, f)) for f in ('shell.css', 'gx-kit.css', 'gx-help.css', 'gx-tutor.css', 'gx-campaign.css'))
h = rd(os.path.join(S, 'head.html')).replace('/*SHELL_CSS*/', css)
body = rd(os.path.join(S, 'body.html'))
js = []
for f, p in SRC:
    src = rd(p)
    if f == 'data.js': src = pre + camp + src
    js.append('<script>\n' + src.replace('</script', '<\\/script') + '\n</script>')
body = body.replace('<!--SCRIPTS-->', '\n'.join(js))
out = h + body
open(os.path.join(D, 'perch-and-plume.html'), 'w', encoding='utf-8').write(out)
open(os.path.join(D, 'x.js'), 'w', encoding='utf-8').write('\n'.join(re.findall(r'<script>(.*?)</script>', out, re.S)))
print('perch-and-plume.html', len(out.encode('utf-8')), 'bytes;', len(have), 'pictures present;', len(music), 'music files')
