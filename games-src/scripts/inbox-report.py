#!/usr/bin/env python3
"""Asset inbox: measure what each game does with the files still to make, write assets-inbox/<slug>/README.md
(expected names) and games-src/ASSET-INBOX.md (per-game table). Needs games-src/next-wave/expected-assets.json
(made by next-wave.py). Run: python3 games-src/scripts/inbox-report.py

Per expected file (3D source paintings are counted apart, they go to the 3D pipeline, not into media/):
  auto      the game code names this exact file; a missing file already costs nothing (preloader/onerror/css url),
            so dropping the file is enough
  fallback  the code names the file but a plain <img>/src has no onerror nearby: a missing file shows a broken image
  wiring    the file name is not in the game code at all: the file is not shown until code loads it
Reuses wiring_scan.py (the scan of wiring-status.py)."""
import json, os, sys, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import re, subprocess
from wiring_scan import ROOT, text, wired, ref_context, MANUAL

MAN = json.load(open('games-src/next-wave/expected-assets.json', encoding='utf-8'))

def exp_ext(it):
    return os.path.splitext(it['repo_target'] or it['save_as'])[1].lstrip('.').lower() or 'webp'

NR = {e['file'].rsplit('.', 1)[0] for e in json.load(open('games-src/nightrun/assets-manifest.json'))}   # Nightrun: own placeholder pipeline

def exact_ref(g, stem, ext):
    """The file name is spelled out in the game code (or listed in wiring-manual.json): stronger than wired(), which also accepts a built-name prefix."""
    return bool(re.search(re.escape(stem) + r'(?:-c|-k)?\.' + ext, text(g))) or stem in MANUAL.get(g, ())

def classify(it):
    """-> 'auto' | 'fallback' | 'wiring' | 'prefix' (None for 3D source paintings). prefix = only a built-name prefix matches: check by hand."""
    if it['kind'] == 'model3d': return None
    g, stem, ext = it['slug'], it['stem'], exp_ext(it)
    if it['kind'] == 'music': return 'wiring'          # sources for the audio tools, never loaded by name
    if ext == 'mp4': return 'auto' if f'{stem}.mp4' in text(g) else 'wiring'
    if g == 'mainhattan-nightrun' and stem in NR: return 'auto'   # media/ready.json + make-placeholders.py own it
    if it['tag'] == 'poses':
        return 'wiring' if 'poses/' not in text(g) else ('auto' if exact_ref(g, stem, 'webp') else 'wiring')
    if exact_ref(g, stem, 'webp'): return 'fallback' if ref_context(g, stem) == 'img' else 'auto'
    return 'prefix' if wired(g, stem, 'webp') else 'wiring'

def group(it):
    return 'poses' if it['tag'] == 'poses' else 'pics'

def short(it):
    return it['element'] if it['element'] else it['stem']

def main():
    by = collections.defaultdict(list)
    for it in MAN: by[it['slug']].append(it)
    rows, names = [], collections.defaultdict(dict)
    for slug in sorted(by):
        c = collections.defaultdict(collections.Counter); need = collections.defaultdict(list)
        for it in by[slug]:
            k = classify(it)
            if k is None: c['3d']['n'] += 1; continue
            c[group(it)][k] += 1
            if k != 'auto' and group(it) == 'pics' and it['kind'] == 'art': need[k].append(it['stem'])
        rows.append((slug, c, need))
        write_readme(slug, by[slug], {id_: classify(it) for id_, it in ((i['id'], i) for i in by[slug])})
    write_report(rows)


# ---------------------------------------------------------------- where to wire: nearest loaded sibling in the game source
def src_dirs():
    out = subprocess.run([sys.executable, 'games-src/scripts/build-all.py', '--list'], capture_output=True, text=True).stdout
    return {l.split()[0]: l.split('cd ', 1)[1].split(' &&')[0] for l in out.splitlines() if ' cd ' in l or '  cd ' in l}

_SRC = {}
def src_lines(slug, sdir):
    if slug in _SRC: return _SRC[slug]
    res = []
    for dp, dn, fn in os.walk(sdir):
        dn[:] = [d for d in dn if d not in ('node_modules', 'data', 'media', 'models', 'music', '.git')]
        for f in fn:
            if not f.endswith(('.js', '.html', '.css', '.json', '.py')): continue
            fp = os.path.join(dp, f)
            try:
                if os.path.getsize(fp) > 2_000_000: continue
                res.append((fp, open(fp, errors='ignore').read().split('\n')))
            except OSError: pass
    _SRC[slug] = res; return res

def find_line(slug, sdir, stem):
    for fp, ls in src_lines(slug, sdir):
        for n, l in enumerate(ls, 1):
            if stem in l and ('media' in l or '.webp' in l or "'" + stem in l): return f'{fp}:{n}'
    return ''

def first_media(slug, sdir):
    for fp, ls in src_lines(slug, sdir):
        for n, l in enumerate(ls, 1):
            if re.search(r"media/[A-Za-z0-9_$\{}'+.-]+\.webp|'media/'", l): return f'{fp}:{n}'
    return ''

def spots(slug, stems, sdirs):
    """-> lines 'family (n files): copy the load of <sibling> at <file:line>' for the stems that are not in the code."""
    sdir = sdirs.get(slug)
    if not sdir: return [f'- no build entry for `{slug}` (own pipeline, see its hand-off notes)']
    have = sorted(os.path.splitext(f)[0] for f in os.listdir(f'games/{slug}/media') if f.endswith('.webp') and not f.endswith(('-c.webp', '-k.webp'))) if os.path.isdir(f'games/{slug}/media') else []
    fam = collections.defaultdict(list)
    for st in stems:
        seg = st.split('-'); fam['-'.join(seg[:2]) + '-*' if len(seg) > 2 else seg[0] + '-*'].append(st)
    out = []
    for k, v in sorted(fam.items(), key=lambda kv: -len(kv[1]))[:14]:
        pre = k[:-1]
        sib = [h for h in have if h.startswith(pre)] or [h for h in have if h.startswith(pre.split('-')[0] + '-')]
        spot, used = '', ''
        for h in sib[:8]:
            spot = find_line(slug, sdir, h)
            if spot: used = h; break
        out.append(f"- `{k}` ({len(v)}: {', '.join(v[:4])}{' ...' if len(v) > 4 else ''}): " + (f"copy the load of `{used}` at `{spot}`" if spot else 'no loaded sibling: add the load beside the first `media/` load, ' + (f"`{first_media(slug, sdir)}`" or f'in `{sdir}`')))
    return out

def tr(it):
    return 'yes (flat white background, we key it)' if it['transparent'] else ('yes (cut-out from flat background)' if it['tag'] == 'poses' else 'no')

def write_readme(slug, items, cls):
    d = f'assets-inbox/{slug}'; os.makedirs(d, exist_ok=True)
    L = [f'# Inbox: {slug}', '',
         f'Drop finished pictures (png, jpg or webp, 1024 px or larger), music/sound (mp3, wav) or boss clips (mp4) in this folder, then run '
         f'`python3 games-src/scripts/ingest-assets.py` from the repo root. Names are matched without caring about case, `_` vs `-`, `(1)` suffixes or png/webp.',
         'Originals move to `done/` (not committed). Run with `--check` first to see what would happen without writing anything.', '',
         'The **Wired** column says what happens after the drop: `auto` = shows up in the game, `fallback` = shows up, but the game needs a fallback for the missing-file case (script lists it), `wiring` = a code change is still needed.', '']
    sections = [('Pictures (the to-make list)', [i for i in items if i['kind'] in ('art', 'video') and not i['tag']]),
                ('Wave 7 pictures', [i for i in items if i['kind'] == 'art' and i['tag'] == 'art']),
                ('Pose sets (flat background, we cut them out; name = character-pose)', [i for i in items if i['tag'] == 'poses']),
                ('Music and sounds (sources for the audio tools)', [i for i in items if i['kind'] == 'music']),
                ('3D source paintings (go to the 3D pipeline, kept in `models-src/`)', [i for i in items if i['kind'] == 'model3d'])]
    for title, its in sections:
        if not its: continue
        L += [f'## {title} ({len(its)})', '', '| Name | Size | Ratio | Transparent | What it is | Wired |', '|---|---|---|---|---|---|']
        for i in sorted(its, key=lambda x: x['stem']):
            nm = i['save_as'] if i['kind'] != 'model3d' else i['stem'] + '.png'
            L.append(f"| `{nm}` | {i['size'] or '-'} | {i['ratio'] or '-'} | {tr(i) if i['kind'] in ('art',) else '-'} | {short(i).replace('|', '/')} | {cls[i['id']] or '3D'} |")
        L.append('')
    open(f'{d}/README.md', 'w', encoding='utf-8').write('\n'.join(L))

def write_report(rows):
    tot = collections.Counter(); L = [
        '# Asset inbox: what each game does when a finished file arrives', '',
        'Generated by `python3 games-src/scripts/inbox-report.py` (rerun after `next-wave.py` / `wiring-status.py`). Drop files in `assets-inbox/<game>/` and run `python3 games-src/scripts/ingest-assets.py`; see `assets-inbox/README.md`.', '',
        'Class per expected file (heuristic scan of the game source, same scan as `wiring-status.py`):',
        '- **auto**: the code names this exact file and a missing file is harmless today (preloader / onerror / css background): dropping the file is enough.',
        '- **fallback**: the code names the file but a plain `<img>`/src has no `onerror` close by: the file is picked up, but a missing one would show a broken image (a fallback is needed).',
        '- **prefix?**: only a built-name prefix of the code matches (`media/hex-` + key): the loader may or may not ask for this exact name; check the spot.',
        '- **wiring**: the file name is not in the game code: the file arrives but nothing shows it until code is added.', '',
        '| Game | Pictures auto | fallback | prefix? | wiring | Poses auto | wiring | Music/sound | 3D source |', '|---|---:|---:|---:|---:|---:|---:|---:|---:|']
    for slug, c, need in rows:
        p, q = c['pics'], c['poses']
        L.append(f"| {slug} | {p['auto']} | {p['fallback']} | {p['prefix']} | {p['wiring']} | {q['auto']} | {q['wiring'] + q['fallback'] + q['prefix']} | {sum(1 for i in MAN if i['slug'] == slug and i['kind'] == 'music')} | {c['3d']['n']} |")
        for k in ('auto', 'fallback', 'prefix', 'wiring'): tot['p' + k] += p[k]; tot['q' + k] += q[k]
    L.append(f"| **Total** | {tot['pauto']} | {tot['pfallback']} | {tot['pprefix']} | {tot['pwiring']} | {tot['qauto']} | {tot['qwiring'] + tot['qfallback'] + tot['qprefix']} | {sum(1 for i in MAN if i['kind']=='music')} | {sum(1 for i in MAN if i['kind']=='model3d')} |")
    L += ['', 'Pictures = the 109-item to-make list plus wave 7 art (incl. boss clip). Poses = wave 7 pose sets (cut out to `media/poses/`). Music/sound items are sources for the audio tools (always a manual step). Mainhattan Overdrive is excluded.', '',
          '## Pictures that need a fallback or wiring code (per game)', '']
    for slug, c, need in rows:
        if not (need['fallback'] or need['wiring'] or need['prefix']): continue
        L.append(f"- **{slug}**" + (f" fallback ({len(need['fallback'])}): " + ', '.join(f'`{n}`' for n in need['fallback'][:40]) if need['fallback'] else '') +
                 (f"; wiring ({len(need['wiring'])}): " + ', '.join(f'`{n}`' for n in need['wiring'][:40]) + (' ...' if len(need['wiring']) > 40 else '') if need['wiring'] else ''))
    sd = src_dirs()
    L += ['', '## Where to wire (nearest loaded sibling in the game source, per game)', '', 'Pictures only. `prefix?` and `wiring` names; copy the load of the sibling and add the new names. Pose sets: no game loads `media/poses/` yet (design decision first, see below).', '']
    for slug, c, need in rows:
        st = need['wiring'] + need['prefix']
        if not st: continue
        L += [f'### {slug}', ''] + spots(slug, st, sd) + ['']
    open('games-src/ASSET-INBOX.md', 'w', encoding='utf-8').write('\n'.join(L) + '\n')
    print('\n'.join(L[:30]))

if __name__ == '__main__': main()
