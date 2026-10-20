#!/usr/bin/env python3
"""Asset inbox ingest: finished pictures / clips / music dropped in assets-inbox/<game-slug>/ -> the game folders.

  python3 games-src/scripts/ingest-assets.py [--check] [--slug S ...] [--no-wiring]

Per file: (a) match the name to the to-make list (games-src/next-wave/expected-assets.json, made by next-wave.py; case, '_' vs '-',
'(1)' / 'copy' suffixes and png/jpg/webp are forgiven; a real near miss only gets a hint), (b) crop/resize to the target size and write
webp, keying a flat background to transparent where the list says transparent (cutout.py; pose sets go through cutout.py as one set),
(c) write games/<slug>/media/<name>.webp (poses: media/poses/), (d) move the original to assets-inbox/<slug>/done/, (e) print PASS / WARN
per file, (f) refresh the wiring lists and print per game: dropped N, auto-wired N, needs wiring code M (names).
--check changes nothing on disk (no write, no move, no subprocess that writes).
Music/sound (mp3, wav, ogg) is copied to its audio source folder (games-src/audio/<game>/treblo/<name>[-a|-b].<ext>) for the audio tools.
3D source paintings (png) are kept in assets-inbox/<slug>/models-src/; a .glb goes to games/<slug>/models/.
Reuses: next-wave.py (list), wiring_scan.py + wiring-status.py (wired?), cutout.py (keying), inbox-report.py (classes, code spots)."""
import argparse, difflib, importlib.util, json, os, re, shutil, subprocess, sys, time
from collections import defaultdict
from PIL import Image
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE)); os.chdir(ROOT)
INBOX = 'assets-inbox'
IMG = ('.png', '.jpg', '.jpeg', '.webp'); AUD = ('.mp3', '.wav', '.ogg'); VID = ('.mp4', '.webm')
ALIAS = {'thornbound-throne': 'thornbound'}
POSE_RE = r'^(.*)-[^-]+$'

def load_mod(name, file):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, file)); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m

def norm(fn):
    s = os.path.splitext(os.path.basename(fn))[0].lower().strip()
    s = re.sub(r'\s*\(\d+\)$', '', s); s = re.sub(r'[\s_-]*-?\s*copy( \d+)?$', '', s)
    return re.sub(r'-+', '-', re.sub(r'[\s_]+', '-', s)).strip('-')

def dims(it, w, h):
    """Target (W, H) or None. size '512x512' -> exact; a lone number is the longest side, ratio from the input."""
    m = re.match(r'(\d+)x(\d+)$', it.get('size') or '')
    if m: return int(m[1]), int(m[2])
    m = re.match(r'(\d+)$', it.get('size') or '')
    return (int(m[1]), round(int(m[1]) * h / w)) if m and w >= h else ((round(int(m[1]) * w / h), int(m[1])) if m else None)

def has_alpha(im, frac=0.01):
    if im.mode != 'RGBA': return False
    a = np.array(im.getchannel('A')); return (a < 250).mean() >= frac

def expected():
    by = defaultdict(dict)
    for it in json.load(open('games-src/next-wave/expected-assets.json', encoding='utf-8')):
        by[it['slug']][norm(it['stem'])] = it
    nr = 'games-src/nightrun/assets-manifest.json'      # Nightrun's own list (sizes), same inbox
    if os.path.exists(nr):
        for e in json.load(open(nr)):
            stem = e['file'].rsplit('.', 1)[0]; k = norm(stem)
            if k not in by['mainhattan-nightrun']:
                by['mainhattan-nightrun'][k] = dict(id='mainhattan-nightrun:' + stem, slug='mainhattan-nightrun', kind='art', stem=stem, element=e.get('group', ''), save_as=e['file'],
                    repo_target=f"games/mainhattan-nightrun/media/{e['file']}", size=f"{e['w']}x{e['h']}", ratio='', transparent=e.get('kind') != 'fx' or e.get('bg') == 'white', tag='')       # fx: light on a black square stays RGB; bg 'white' (solid objects) is keyed to transparent
    return by

class Out:
    def __init__(s): s.lines = []; s.stat = defaultdict(lambda: dict(dropped=0, ok=0, warn=0, fail=0, wired=[], names=[]))
    def say(s, lvl, slug, name, msg):
        print(f'{lvl:5} {slug}/{name}: {msg}'); s.lines.append((lvl, slug, name, msg))

def key_image(im, why):
    """Flat background -> transparent through cutout.py. Returns (RGBA, note) or (im, note) when it cannot."""
    try:
        co = load_mod('cutout', 'cutout.py')
    except Exception as e:                      # scipy/numpy missing
        return im, f'cannot key ({type(e).__name__}); pip install scipy'
    out, info = co.matte(im.convert('RGB'), key='auto')
    return out, f"keyed {info['kind']} background"

def fit_save(im, it, target, dest, check, transparent):
    """Crop (opaque) or trim+fit (transparent) to the target ratio, downscale to the target size, save webp. Returns (size, note)."""
    w, h = im.size; notes = []
    if target:
        tw, th = target
        if transparent:
            bb = im.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
            if bb: im = im.crop(bb)
            sc = min(tw / im.width, th / im.height, 1.0); iw, ih = max(1, round(im.width * sc)), max(1, round(im.height * sc))
            canvas = Image.new('RGBA', (tw, th), (0, 0, 0, 0)); canvas.paste(im.resize((iw, ih), Image.LANCZOS), ((tw - iw) // 2, (th - ih) // 2)); im = canvas
        else:
            r, tr = im.width / im.height, tw / th
            if abs(r / tr - 1) > 0.01:
                if r > tr: nw = round(im.height * tr); x = (im.width - nw) // 2; im = im.crop((x, 0, x + nw, im.height))
                else: nh = round(im.width / tr); y = (im.height - nh) // 2; im = im.crop((0, y, im.width, y + nh))
            if im.width > tw: im = im.resize((tw, th), Image.LANCZOS)
    elif max(im.size) > 1024:
        sc = 1024 / max(im.size); im = im.resize((round(im.width * sc), round(im.height * sc)), Image.LANCZOS)
    if not check:
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        im.save(dest, 'WEBP', quality=92, method=6, exact=transparent)
    return im.size

def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--check', action='store_true', help='dry run: report only, change nothing')
    ap.add_argument('--slug', action='append', help='only these inbox folders')
    ap.add_argument('--no-wiring', action='store_true', help='skip wiring-status.py / inbox-report.py after the run')
    a = ap.parse_args()
    EXP = expected(); out = Out(); ir = None
    todo = defaultdict(list)      # slug -> [(path, filename)]
    if not os.path.isdir(INBOX): print('no assets-inbox/ folder'); return 0
    for d in sorted(os.listdir(INBOX)):
        p = os.path.join(INBOX, d)
        slug = ALIAS.get(d, d)
        if os.path.isdir(p) and slug in EXP and (not a.slug or slug in a.slug or d in a.slug):
            for f in sorted(os.listdir(p)):
                fp = os.path.join(p, f)
                if os.path.isfile(fp) and f.lower() != 'readme.md' and not f.startswith('.'): todo[slug].append((fp, f))
        elif os.path.isfile(p) and not a.slug and d.lower().endswith(IMG + AUD + VID + ('.glb',)):
            hits = [s for s in EXP if norm(d) in EXP[s]]       # loose file in the inbox root: find its game
            if len(hits) == 1: todo[hits[0]].append((p, d))
            else: out.say('WARN', '(root)', d, 'put the file in assets-inbox/<game>/ ' + ('(name fits ' + ', '.join(hits) + ')' if hits else '(name not in the to-make list)'))
    if not todo and not out.lines: print('inbox is empty: nothing to do'); return 0
    posesets = defaultdict(list)  # (slug, character) -> [(fp, it, src)]
    for slug, files in sorted(todo.items()):
        names = EXP[slug]; st = out.stat[slug]
        for fp, f in files:
            ext = os.path.splitext(f)[1].lower(); k = norm(f); st['dropped'] += 1
            it = names.get(k)
            if not it and ext in AUD:                            # music: name or name-a / name-b
                base = re.sub(r'-[ab]$', '', k); it = names.get(base)
            if not it:
                close = difflib.get_close_matches(k, list(names), n=2, cutoff=0.8)
                out.say('WARN', slug, f, 'unknown name, not in the to-make list' + (f"; did you mean {' or '.join(names[c]['save_as'] for c in close)}?" if close else '')); st['warn'] += 1; continue
            try:
                res = handle(slug, fp, f, ext, k, it, a.check, posesets)
            except Exception as e:
                out.say('FAIL', slug, f, f'{type(e).__name__}: {e}'); st['fail'] += 1; continue
            lvl = 'PASS' if not res['warn'] else 'WARN'
            if not (res.get('queued') and not res['warn']): out.say(lvl, slug, f, ('-> ' + res['dest'] if res['dest'] else '') + (' [' + res['info'] + ']' if res['info'] else '') + ''.join(' | ' + w for w in res['warn']))
            st['ok' if not res['warn'] else 'warn'] += 1
            if (res['dest'] or res.get('queued')) and it['stem'] not in st['names']: st['names'].append(it['stem'])
            if not a.check and res['done']: move_done(fp)
    # pose sets: one cutout.py run per character (shared scale and feet line)
    for (slug, ch), items in sorted(posesets.items()):
        files = [fp for fp, it, f in items]; dest = f'games/{slug}/media/poses'
        if a.check:
            for fp, it, f in items: out.say('PASS', slug, f, f'(check) pose of {ch}: would be cut out into {dest}/{it["stem"]}.webp')
            continue
        os.makedirs(dest, exist_ok=True)
        # cutout.py names the output after the input file, so stage copies under the published names
        stage = os.path.join(INBOX, slug, '.stage-' + ch); os.makedirs(stage, exist_ok=True)
        for fp, it, f in items: shutil.copy(fp, os.path.join(stage, it['stem'] + os.path.splitext(fp)[1].lower()))
        r = subprocess.run([sys.executable, os.path.join(HERE, 'cutout.py'), *sorted(os.path.join(stage, x) for x in os.listdir(stage)), '--out', dest, '--size', '512', '--one-set'], capture_output=True, text=True)
        shutil.rmtree(stage, ignore_errors=True)
        try: os.remove(os.path.join(dest, 'contact-sheet.png'))     # cutout.py's review sheet, not a game file
        except OSError: pass
        for fp, it, f in items:
            ok = r.returncode == 0 and os.path.exists(f'{dest}/{it["stem"]}.webp')
            out.say('PASS' if ok else 'FAIL', slug, f, f'-> {dest}/{it["stem"]}.webp [pose set {ch}, cut out]' if ok else 'cutout failed: ' + (r.stderr or r.stdout)[-160:])
            if ok:
                move_done(fp); out.stat[slug]['ok'] += 1
                if it['stem'] not in out.stat[slug]['names']: out.stat[slug]['names'].append(it['stem'])
            else: out.stat[slug]['fail'] += 1
    summary(out, a)
    return 1 if any(l[0] == 'FAIL' for l in out.lines) else 0

def move_done(fp):
    d = os.path.join(os.path.dirname(fp), 'done'); os.makedirs(d, exist_ok=True)
    dst = os.path.join(d, os.path.basename(fp))
    if os.path.exists(dst): dst = os.path.splitext(dst)[0] + time.strftime('-%H%M%S') + os.path.splitext(dst)[1]
    shutil.move(fp, dst)

def handle(slug, fp, f, ext, k, it, check, posesets):
    r = dict(dest='', info='', warn=[], done=True)
    kind = it['kind']
    if kind == 'model3d':
        if ext == '.glb':
            dest = f"games/{slug}/models/{it['stem']}.glb"
            if not check: os.makedirs(os.path.dirname(dest), exist_ok=True); shutil.copy(fp, dest)
            r['dest'] = dest; r['info'] = 'model, the code names it by hand'
        else:
            dest = f"{INBOX}/{slug}/models-src/{it['stem']}{ext}"
            if not check: os.makedirs(os.path.dirname(dest), exist_ok=True); shutil.copy(fp, dest)
            r['dest'] = dest; r['info'] = '3D source painting kept for the 3D pipeline, not a game file'; r['done'] = True
        return r
    if kind == 'music':
        if ext not in AUD: r['warn'].append('music item but the file is not mp3/wav/ogg'); r['done'] = False; return r
        suf = re.search(r'-([ab])$', k); name = it['stem'] + (f'-{suf[1]}' if suf else '') + ext
        dest = os.path.join(os.path.dirname(it['repo_target']), name)
        if not check: os.makedirs(os.path.dirname(dest), exist_ok=True); shutil.copy(fp, dest)
        r['dest'] = dest; r['info'] = 'audio source: pick a/b by ear, then run the audio tool (games-src/audio/tools/music_treblo.py)'
        if not suf: r['warn'].append('no -a / -b version in the name')
        return r
    if kind == 'video' or ext in VID:
        dest = it['repo_target']
        if ext not in VID: r['warn'].append('a clip is expected (mp4)'); r['done'] = False; return r
        if ext != '.mp4': r['warn'].append('expected mp4')
        if not check: os.makedirs(os.path.dirname(dest), exist_ok=True); shutil.copy(fp, dest)
        r['dest'] = dest; return r
    if ext not in IMG:
        r['warn'].append(f'a picture is expected (png/jpg/webp), got {ext}'); r['done'] = False; return r
    im = Image.open(fp); im.load()
    im = im.convert('RGBA') if im.mode in ('RGBA', 'LA', 'P') else im.convert('RGB')
    w, h = im.size; target = dims(it, w, h)
    need_t = bool(it['transparent']) or it['tag'] == 'poses'
    if os.path.splitext(f)[0] != it['stem']: r['info'] = f"name fixed to {it['stem']}"
    tmax = max(target) if target else 1024
    if max(w, h) < 1024 and max(w, h) < 2 * tmax: r['warn'].append(f'too small: {w}x{h} px, make it 1024 px or larger')
    if target:
        rt = target[0] / target[1]; ri = w / h
        if abs(ri / rt - 1) > 0.08: r['warn'].append(f'wrong ratio: {w}x{h} ({ri:.2f}), wanted {target[0]}x{target[1]} ({rt:.2f}); {"fitted" if need_t else "centre-cropped"}')
    if it['tag'] == 'poses':
        ch = re.sub(POSE_RE, r'\1', it['stem'])
        posesets[(slug, ch)].append((fp, it, f)); r['queued'] = True; r['done'] = False; r['info'] = (r['info'] + ' ' if r['info'] else '') + 'pose, cut out with the set'
        if has_alpha(im): r['info'] += ' (already transparent)'
        return r
    if slug == 'mainhattan-nightrun' and it['stem'].startswith('fx-') and not need_t and not has_alpha(im):   # light effect: the game keys the black square at load, so the corners must be pure black
        a = np.array(im.convert('RGB')); n = max(2, min(a.shape[0], a.shape[1]) // 16); cor = np.concatenate([a[:n, :n].reshape(-1, 3), a[:n, -n:].reshape(-1, 3), a[-n:, :n].reshape(-1, 3), a[-n:, -n:].reshape(-1, 3)])
        if cor.max(axis=1).mean() > 40: r['warn'].append('light effect must be on a pure solid black background (the corners are not black), repaint on black')
    if need_t:
        if has_alpha(im): r['info'] = (r['info'] + ' ' if r['info'] else '') + 'already transparent'
        else:
            im, note = key_image(im, slug)
            if not has_alpha(im): r['warn'].append('not transparent and could not key it: ' + note); r['done'] = False; return r      # (was: crashed in fit_save)
            else: r['warn'].append(f'not transparent as delivered: {note}, check the edges')
    dest = it['repo_target'] or f"games/{slug}/media/{it['stem']}.webp"
    size = fit_save(im, it, target, dest, check, need_t)
    r['dest'] = dest; r['info'] = (r['info'] + ' ' if r['info'] else '') + f'{w}x{h} -> {size[0]}x{size[1]}' + (' alpha' if need_t else '')
    return r

def summary(out, a):
    print('\n' + ('CHECK (nothing was written or moved)' if a.check else 'DONE'))
    names_all = defaultdict(list)
    if out.stat and not a.no_wiring:
        ir = load_mod('inbox_report', 'inbox-report.py')
    for slug, st in sorted(out.stat.items()):
        wired, need, n3d = [], [], 0
        for n in st['names']:
            it = next((x for x in ir.MAN if x['slug'] == slug and x['stem'] == n), None) if not a.no_wiring else None
            if it and it['kind'] == 'model3d': n3d += 1; continue
            c = ir.classify(it) if it else None
            if c is None and it is None and not a.no_wiring:    # nightrun-manifest-only names: its placeholder pipeline loads them
                c = 'auto' if slug == 'mainhattan-nightrun' else 'wiring'
            (wired if c == 'auto' else need).append(n)
        print(f"  {slug:22} dropped {st['dropped']:3}  ok {st['ok']:3}  warn {st['warn']:3}  fail {st['fail']:3}  auto-wired {len(wired):3}  needs wiring code {len(need):3}" + (f"  3D sources kept {n3d}" if n3d else '') + (f": {', '.join(need[:12])}{' ...' if len(need) > 12 else ''}" if need else ''))
        names_all[slug] = need
    if a.check or not out.stat: return
    ingested = {s for s, st in out.stat.items() if st['names']}
    if 'mainhattan-nightrun' in ingested and os.path.exists('games-src/nightrun/make-placeholders.py'):
        r = subprocess.run([sys.executable, 'games-src/nightrun/make-placeholders.py'], capture_output=True, text=True)   # updates media/ready.json (its own pipeline)
        print('  nightrun: make-placeholders.py run (media/ready.json updated)')
        for ln in r.stdout.splitlines():
            if ln.startswith('REFUSED'): print('  ' + ln)
        g = subprocess.run([sys.executable, 'games-src/nightrun/placeholder_guard.py'], capture_output=True, text=True)   # no placeholder picture in ready.json
        print('  nightrun: placeholder_guard.py ' + ('ok' if g.returncode == 0 else 'FAILED:\n' + g.stdout[-600:]))
    if a.no_wiring: return
    for cmd in ('wiring-status.py', 'inbox-report.py'):
        r = subprocess.run([sys.executable, os.path.join(HERE, cmd)], capture_output=True, text=True)
        print(f'  {cmd}: ' + ('ok' if r.returncode == 0 else 'failed: ' + (r.stderr or '')[-120:]))
    sd = ir.src_dirs()
    for slug, need in names_all.items():
        if need:
            print(f'\n  WIRING NEEDED in {slug} (code spots):')
            for l in ir.spots(slug, need, sd): print('   ' + l)

if __name__ == '__main__': sys.exit(main())
