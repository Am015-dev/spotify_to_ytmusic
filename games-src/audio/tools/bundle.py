"""Write per-game audio-data.js, MAP.md, credits.html, plus ASSETS.md and licence snapshots."""
import os, sys, json, base64, shutil, re, html
sys.path.insert(0, os.path.dirname(__file__))
import sfx as SFX

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W = os.path.join(ROOT, 'work')
DATE = '2026-09-30'
CC0 = ('CC0 1.0', 'https://creativecommons.org/publicdomain/zero/1.0/')
BY4 = ('CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/')

GAMES = {  # slug: (title, sound.js path relative to SP, storage prefix)
    'sands': ('Sands of Qamar', 'ft/src/sound.js', 'soq'),
    'crown': ('Crown City Smash', 'kot/sound.js', 'ccs'),
    'nebula': ('Nebula Aces', 'xw/sound.js', 'na'),
    'shipwreck': ('Shipwreck Isle', 'rc/sound.js', 'swi'),
    'doorkick': ('Doorkick Dungeon', 'munch/sound.js', 'dkd'),
    'sunglaze': ('Sunglaze', 'azul/game/src/sound.js', 'sgz'),
    'rampart': ('Rampart & Vine', 'carc/game/src/sound.js', 'rv'),
}

KEN = {  # raw folder -> (pack title, page)
    'casino-audio': ('Casino Audio', 'https://kenney.nl/assets/casino-audio'),
    'interface-sounds': ('Interface Sounds', 'https://kenney.nl/assets/interface-sounds'),
    'impact-sounds': ('Impact Sounds', 'https://kenney.nl/assets/impact-sounds'),
    'rpg-audio': ('RPG Audio', 'https://kenney.nl/assets/rpg-audio'),
    'sci-fi-sounds': ('Sci-fi Sounds', 'https://kenney.nl/assets/sci-fi-sounds'),
    'digital-audio': ('Digital Audio', 'https://kenney.nl/assets/digital-audio'),
    'ui-audio': ('UI Audio', 'https://kenney.nl/assets/ui-audio'),
    'music-jingles': ('Music Jingles', 'https://kenney.nl/assets/music-jingles'),
}
OGA = {  # raw sub path prefix -> (title, slug, author, author slug)
    'oga/sfx_loops/': ('30 CC0 SFX loops', '30-cc0-sfx-loops', 'rubberduck', 'rubberduck'),
    'oga/water-splash-slime-sfx/': ('40 CC0 water / splash / slime SFX', '40-cc0-water-splash-slime-sfx', 'rubberduck', 'rubberduck'),
    'oga/sfx_100_v2/': ('100 CC0 SFX #2', '100-cc0-sfx-2', 'rubberduck', 'rubberduck'),
    'oga/100-CC0-SFX_0/': ('100 CC0 SFX', '100-cc0-sfx', 'rubberduck', 'rubberduck'),
    'oga/80-CC0-creature-SFX_0/': ('80 CC0 creature SFX', '80-cc0-creature-sfx', 'rubberduck', 'rubberduck'),
    'oga/monster_-_starninjas/': ('16 Monster Growls', '16-monster-growls', 'StarNinjas', 'starninjas'),
    'oga/fire-1.ogg': ('Fire Crackling', 'fire-crackling', 'AntumDeluge', 'antumdeluge'),
    'oga/wind_background_noise_2.wav': ('Mild Wind Background Noise', 'mild-wind-background-noise', 'Bashar3A', 'bashar3a'),
}
MUSIC = {  # music source -> metadata
    'desert_loop.mp3': dict(title='Desert Loop', author='iamoneabe', url='https://opengameart.org/content/desert-loop', dl='https://opengameart.org/sites/default/files/desert_loop.mp3', lic=CC0, snap='desert-loop'),
    'Funked_Up.mp3': dict(title='Funked Up', author='Joth', url='https://opengameart.org/content/funked-up', dl='https://opengameart.org/sites/default/files/Funked%20Up.mp3', lic=CC0, snap='funked-up'),
    'hostile_fleet_interception.wav': dict(title='Hostile Fleet Interception', author='vitalezzz', url='https://opengameart.org/content/hostile-fleet-interception', dl='https://opengameart.org/sites/default/files/hostile_fleet_interception.wav', lic=CC0, snap='hostile-fleet-interception'),
    'Sea_side_Village.mp3': dict(title='Seaside Village', author='KarateStudios', url='https://opengameart.org/content/seaside-village', dl='https://opengameart.org/sites/default/files/Sea%20side%20Village.mp3', lic=CC0, snap='seaside-village'),
    'the_storm_chasers.wav': dict(title='Storm Chasers', author='Eldritch Grim', url='https://opengameart.org/content/storm-chasers', dl='https://opengameart.org/sites/default/files/the_storm_chasers.wav', lic=CC0, snap='storm-chasers'),
    'The_Old_Tower_Inn.mp3': dict(title='Medieval: The Old Tower Inn', author='RandomMind', url='https://opengameart.org/content/medieval-the-old-tower-inn', dl='https://opengameart.org/sites/default/files/The_Old_Tower_Inn.mp3', lic=CC0, snap='medieval-the-old-tower-inn'),
    'Morning_macleod.mp3': dict(title='Morning', author='Kevin MacLeod', author_url='https://incompetech.com', url='https://incompetech.com/music/royalty-free/index.html?isrc=USUAN2300003', dl='https://incompetech.com/music/royalty-free/mp3-royaltyfree/Morning.mp3', lic=BY4, snap=None),
    'harvestseason.wav': dict(title='Medieval: Harvest Season', author='RandomMind', url='https://opengameart.org/content/medieval-harvest-season', dl='https://opengameart.org/sites/default/files/harvestseason.wav', lic=CC0, snap='medieval-harvest-season'),
}
MACLEOD_LINE = '"Morning" Kevin MacLeod (incompetech.com) Licensed under Creative Commons: By Attribution 4.0 https://creativecommons.org/licenses/by/4.0/'

NOTE = {
    'click': 'UI click', 'hover': 'hover tick', 'confirm': 'confirm', 'error': 'cancel / error buzz', 'open': 'popup open',
    'close': 'popup close', 'turn': 'turn-start sting', 'levelup': 'level-up sting', 'level': 'level-up sting', 'win': 'win fanfare', 'lose': 'lose sting',
    'bad': 'bad move / error', 'dice': 'dice roll on a tray', 'shake': 'dice shaken in the hand', 'clack': 'single die clack',
    'coins': 'coin pouch / handful of coins', 'shuffle': 'card shuffle', 'flip': 'card flip', 'deal': 'card deal',
    'meeple': 'wooden meeple placed', 'tile': 'thick board tile placed', 'place': 'piece / tile placed',
    'roar': 'monster growl', 'whoosh': 'whoosh', 'rain': 'rain loop', 'fire': 'fire crackle loop', 'wind': 'wind loop',
    'engine_loop': 'engine hum loop', 'thunder': 'thunder clap', 'splash': 'water splash', 'chop': 'wood chop',
}


def src_meta(src):
    if src.startswith('oga/'):
        for k, (title, slug, au, aus) in OGA.items():
            if src.startswith(k):
                return dict(title=title, url='https://opengameart.org/content/' + slug, author=au,
                            author_url='https://opengameart.org/users/' + aus, lic=CC0, snap=slug, kind='OpenGameArt')
    pack = src.split('/')[0]
    title, url = KEN[pack]
    return dict(title='Kenney ' + title, url=url, author='Kenney (Kenney Vleugels)', author_url='https://kenney.nl', lic=CC0, snap=pack, kind='Kenney')


def events(path):
    t = open(os.path.join(os.path.dirname(ROOT), path)).read()
    return re.findall(r"case '([a-zA-Z0-9_]+)'", t)


def b64(p):
    return base64.b64encode(open(p, 'rb').read()).decode()


def main():
    sfxr = json.load(open(os.path.join(W, 'sfx_report.json')))
    musr = json.load(open(os.path.join(W, 'music_report.json')))
    sizes = {}
    asset_rows = {}  # source -> dict(meta, outputs set, changes set)

    def addrow(src, meta, out, change):
        r = asset_rows.setdefault(src, dict(meta=meta, outs=[], changes=set()))
        r['outs'].append(out); r['changes'].add(change)

    for slug, (title, sjs, prefix) in GAMES.items():
        d = os.path.join(ROOT, slug); os.makedirs(d, exist_ok=True)
        files = sfxr[slug]['files']
        mus = [m for m in musr if m['game'] == slug]
        parts = ['/* audio-data.js for %s - generated by audio/tools/bundle.py. Licences: see audio/ASSETS.md */' % title,
                 'const GA_DATA={sfx:{']
        sfx_bytes = 0
        for name in files:
            p = os.path.join(W, 'sfx', slug, name + '.mp3'); sfx_bytes += os.path.getsize(p)
            parts.append('%s:"%s",' % (json.dumps(name), b64(p)))
        parts.append('},music:{')
        mus_bytes = 0
        for m in mus:
            p = os.path.join(W, 'music', m['file']); mus_bytes += os.path.getsize(p)
            parts.append('%s:"%s",' % (json.dumps(m['name']), b64(p)))
        parts.append('}};')
        js = '\n'.join(parts) + '\n'
        open(os.path.join(d, 'audio-data.js'), 'w').write(js)
        sizes[slug] = dict(n_sfx=len(files), sfx_mp3=sfx_bytes, n_music=len(mus), music_mp3=mus_bytes, js=len(js))

        # --- asset rows
        for name, f in files.items():
            sp = f['spec']
            ch = 'trimmed silence, ' if not sp.get('loop') else 'circular cross-fade loop (%.1f s), ' % sp['loop']
            if 't' in sp: ch += 'cut to %.1f s, ' % sp['t']
            if sp.get('mix'): ch += 'layered, '
            ch += 'normalised (~%d LUFS target, -1 dBFS peak limit), mono MP3 64 kbps' % sp.get('lufs', -16)
            addrow(sp['src'], src_meta(sp['src']), f'{slug}/{name}', ch)
            for m in sp.get('mix', []):
                addrow(m[0], src_meta(m[0]), f'{slug}/{name} (layer)', 'layered under another sound, ' + ch.split(', ', 1)[-1])
        for m in mus:
            mm = dict(MUSIC[m['src']]); mm['kind'] = 'music'
            addrow(m['src'], mm, f"{slug}/music.{m['name']}", f"{m['loop']}; normalised to -18 LUFS; {m['enc']} MP3")

        # --- MAP.md
        ev = events(sjs)
        L = [f'# {title}: sound map', '',
             f'Event names come from `{sjs}` (the `case` labels in `sfx()`). Every event has a sample with the same name, '
             'so the integration can be a one-line guard at the top of `sfx(name)`:', '',
             '```js', "if (window.GA && GA.has(name)) { GA.play(name" + (", {rate: SND.pitch || 1}" if slug in ('crown', 'doorkick') else "") + "); return; }  // else fall through to the synth", '```', '',
             '| event | sample | source | length | notes |', '|---|---|---|---|---|']
        for e in ev:
            f = files.get(e)
            if not f:
                L.append(f'| `{e}` | none | keep synth | | |'); continue
            sp = f['spec']; mt = src_meta(sp['src'])
            srcs = os.path.basename(sp['src']) + ''.join(' + ' + os.path.basename(m[0]) for m in sp.get('mix', []))
            note = NOTE.get(e, '')
            if slug == 'sunglaze' and e == 'wall': note = 'call with `{rate: 1 + 0.06*(n-1)}` to keep the rising-count feel'
            L.append(f"| `{e}` | `{e}` | {mt['title']}: {srcs} | {f['dur']:.2f} s | {note} |")
        extra = [n for n in files if n not in ev]
        L += ['', '## Extra samples (not in sound.js yet)', '', '| sample | source | length | suggested use |', '|---|---|---|---|']
        for n in extra:
            f = files[n]; sp = f['spec']; mt = src_meta(sp['src'])
            srcs = os.path.basename(sp['src']) + ''.join(' + ' + os.path.basename(m[0]) for m in sp.get('mix', []))
            use = NOTE.get(n, n)
            if n in ('rain', 'fire', 'wind', 'engine_loop'): use += ' - start with `GA.loop(\'%s\',{vol:.5})`, stop with `GA.stopLoop(\'%s\')`' % (n, n)
            L.append(f"| `{n}` | {mt['title']}: {srcs} | {f['dur']:.2f} s | {use} |")
        L += ['', '## Music', '', '| name | track | length | loop | encoding |', '|---|---|---|---|---|']
        for m in mus:
            mm = MUSIC[m['src']]
            L.append(f"| `{m['name']}` | \"{mm['title']}\" by {mm['author']} ({mm['lic'][0]}) | {m['dur']:.1f} s | {m['loop']} | {m['enc']}, {m['bytes']//1024} KB |")
        first = mus[0]['name'] if mus else 'main'
        L += ['', '## Wiring', '',
              f"- Load order in the build: `gameaudio.js`, then this `audio-data.js`, then the game. Call once: `GA.init({{sfx:GA_DATA.sfx, music:GA_DATA.music, key:'{prefix}'}})`.",
              f"- Music: call `GA.music('{first}')` where `musicStart()` runs, and let the synth loop return early while `GA.playing()` is truthy. `GA.music(null)` in `musicStop()`.",
              f"- Toggles: in `toggleSound()` / `toggleMusic()` also call `GA.setSfx(SND.on)` / `GA.setMusic(SND.music)`; after `GA.init` sync once with the game's own `{prefix}_snd` / `{prefix}_mus` values.",
              '- Ducking: `win lose levelup level boom ko thunder roar smash stomp door death crit crumble` duck the music automatically; pass `{duck:true}` for others.',
              '- Until decoding finishes (first gesture + a few ms) or if it fails, `GA.has()` is false and the synth keeps playing, so nothing goes silent.']
        if slug == 'shipwreck':
            L.append("- Moods: `GA.music('calm')` by day, `GA.music('storm')` for storm/night events; `GA.music()` cross-fades between them.")
        if slug == 'nebula':
            L.append("- `engine` is a 1 s one-shot for the maneuver; `engine_loop` is an optional quiet bed during movement animations.")
        open(os.path.join(d, 'MAP.md'), 'w').write('\n'.join(L) + '\n')

        # --- credits.html
        used_src = set()
        for f in files.values():
            used_src.add(src_meta(f['spec']['src'])['title']); [used_src.add(src_meta(m[0])['title']) for m in f['spec'].get('mix', [])]
        by = []; thanks = []
        for m in mus:
            mm = MUSIC[m['src']]
            if mm['lic'] == BY4:
                by.append(f'<li>Music: &ldquo;{html.escape(mm["title"])}&rdquo; by <a href="{mm["author_url"]}">{mm["author"]}</a> (incompetech.com), '
                          f'source <a href="{mm["url"]}">incompetech.com</a>, licensed under <a href="{BY4[1]}">Creative Commons: By Attribution 4.0</a>. '
                          f'Modified: cut to a {m["dur"]:.0f} s seamless loop, loudness-normalised, re-encoded to MP3.'
                          f'<br><small>{html.escape(MACLEOD_LINE)}</small></li>')
            else:
                thanks.append(f'<li>Music: &ldquo;{html.escape(mm["title"])}&rdquo; by {html.escape(mm["author"])} (<a href="{mm["url"]}">OpenGameArt</a>, CC0)</li>')
        ken = sorted(t for t in used_src if t.startswith('Kenney'))
        oga = sorted(t for t in used_src if not t.startswith('Kenney'))
        if ken:
            thanks.append('<li>Sound effects: ' + ', '.join(html.escape(k.replace('Kenney ', '')) for k in ken) + ' by <a href="https://kenney.nl">Kenney</a> (CC0)</li>')
        for t in oga:
            k = [v for v in OGA.values() if v[0] == t][0]
            thanks.append(f'<li>Sound effects: &ldquo;{html.escape(t)}&rdquo; by {html.escape(k[2])} (<a href="https://opengameart.org/content/{k[1]}">OpenGameArt</a>, CC0)</li>')
        C = [f'<!-- Credits snippet for {title}. Paste into the in-game Credits / Rules popup. Generated {DATE}. -->',
             '<section class="credits-audio">', '<h3>Audio</h3>']
        if by:
            C += ['<p>Used under Creative Commons Attribution:</p>', '<ul>'] + by + ['</ul>']
        C += ['<p>With thanks to these public-domain (CC0) creators:</p>', '<ul>'] + thanks + ['</ul>',
              '<p><small>All sounds were trimmed, loudness-normalised and converted to MP3 for this game.</small></p>', '</section>']
        open(os.path.join(d, 'credits.html'), 'w').write('\n'.join(C) + '\n')

    # --- ASSETS.md
    A = ['# Audio assets licence log', '',
         f'Checked {DATE}. Every licence was read on the source page (snapshots in `licence-snapshots/`); Kenney zips also contain `License.txt` (CC0). '
         'No NC, ND, SA, Pixabay or other custom licences are used. Only one non-CC0 item: Kevin MacLeod "Morning" (CC BY 4.0, Sunglaze).', '',
         '"Used as" lists the output samples (`<game>/<name>`, sfx unless marked `music.`).', '',
         '| file | source page | author | licence | licence URL | date checked | changes | used as |', '|---|---|---|---|---|---|---|---|']
    for src in sorted(asset_rows, key=lambda s: (asset_rows[s]['meta']['kind'] != 'music', s)):
        r = asset_rows[src]; m = r['meta']
        fname = os.path.basename(src) if not m.get('kind') == 'Kenney' else src.split('/', 1)[0] + '/' + src.split('/Audio/')[-1]
        ch = '; '.join(sorted(r['changes']))
        if len(r['changes']) > 1:
            ch = 'per output: ' + ch
        A.append(f"| `{fname}` | [{m['title']}]({m['url']}) | {m['author']} | {m['lic'][0]} | {m['lic'][1]} | {DATE} | {ch} | {', '.join(r['outs'])} |")
    A += ['', '## Credit lines', '', 'CC BY 4.0 (required, shown in Sunglaze credits):', '', '    ' + MACLEOD_LINE, '',
          'Modified: cut to a seamless loop, loudness-normalised, re-encoded.', '',
          'CC0 (optional thanks, shown in every game): Kenney; rubberduck, StarNinjas, AntumDeluge, Bashar3A (OpenGameArt sound effects); '
          'iamoneabe, Joth, vitalezzz, KarateStudios, Eldritch Grim, RandomMind (OpenGameArt music).', '',
          '## Download URLs (music)', '']
    for k, m in MUSIC.items():
        A.append(f"- {m['title']}: {m['dl']}")
    A += ['', 'Kenney zips: the "Continue without donating" link on each asset page (kenney.nl/media/pages/assets/<pack>/.../kenney_<pack>.zip).', '']
    open(os.path.join(ROOT, 'ASSETS.md'), 'w').write('\n'.join(A) + '\n')

    # --- licence snapshots
    sd = os.path.join(ROOT, 'licence-snapshots'); os.makedirs(sd, exist_ok=True)
    for r in asset_rows.values():
        s = r['meta'].get('snap')
        if not s: continue
        for cand in [os.path.join(ROOT, 'raw', 'oga', s + '.html'), os.path.join(ROOT, 'raw', s + '.html')]:
            if os.path.exists(cand): shutil.copy(cand, os.path.join(sd, os.path.basename(cand)))
        lt = os.path.join(ROOT, 'raw', s, 'License.txt')
        if os.path.exists(lt): shutil.copy(lt, os.path.join(sd, s + '-License.txt'))
    json.dump(sizes, open(os.path.join(W, 'sizes.json'), 'w'), indent=1)
    for k, v in sizes.items():
        print(f"{k:10s} sfx {v['n_sfx']:2d} = {v['sfx_mp3']/1024:6.1f} KB mp3 | music {v['n_music']} = {v['music_mp3']/1024:7.1f} KB | audio-data.js {v['js']/1024:7.1f} KB")


if __name__ == '__main__':
    main()
