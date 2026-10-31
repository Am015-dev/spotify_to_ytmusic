#!/usr/bin/env python3
"""Build the itch.io web zip for Mainhattan Nightrun.

  python3 games-src/nightrun/release/package.py            # build.py, then zip -> release/dist/nightrun-web.zip
  python3 games-src/nightrun/release/package.py --no-build # reuse games/mainhattan-nightrun as it is

itch.io HTML5 limits (https://itch.io/docs/creators/html5, read 31 Oct 2026): <= 1000 files after extraction,
<= 500 MB extracted, <= 200 MB per file, <= 240 chars per path, UTF-8 case-sensitive names, index.html in the zip.
The game folder has 1098 files, so files the game can never fetch are left OUT OF THE ZIP ONLY (the repo keeps them):
  1. media/foot/<who>-<pose>.webp not listed in media/ready.json   (footart.js FA._pic loads a foot picture only if FA._rd has it, and FA._rd = ready.json)
  2. media/poses/*                                                  (no code names this folder)
  3. media/{kit,wp,abup,char}-*.webp not listed in ready.json       (every draw goes through ART.isReal(id) = ready.json; hangar/upgrades.js, weapons, abup, story)
The list is written to release/DROPPED-FILES.txt on every run so it can be reviewed.
"""
import json, os, re, subprocess, sys, zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
GAME = os.path.join(ROOT, 'games', 'mainhattan-nightrun')
DIST = os.path.join(HERE, 'dist')
OUT = os.path.join(DIST, 'nightrun-web.zip')
MAX_FILES, MAX_TOTAL, MAX_ONE, MAX_PATH = 1000, 500 * 1024 * 1024, 200 * 1024 * 1024, 240
GATED = re.compile(r'^media/(kit|wp|abup|char)-[^/]+\.webp$')


def droppable(rel, ready):
    if rel.startswith('media/foot/'):
        return rel[len('media/'):] not in ready
    if rel.startswith('media/poses/'):
        return True
    if GATED.match(rel):
        return rel[len('media/'):] not in ready
    return False


def main():
    if '--no-build' not in sys.argv:
        subprocess.check_call([sys.executable, os.path.join(ROOT, 'games-src', 'nightrun', 'parts', 'build.py')])
    ready = set(json.load(open(os.path.join(GAME, 'media', 'ready.json'))))
    keep, dropped = [], []
    for d, _, fs in os.walk(GAME):
        for f in fs:
            p = os.path.join(d, f)
            rel = os.path.relpath(p, GAME).replace(os.sep, '/')
            (dropped if droppable(rel, ready) else keep).append(rel)
    keep.sort(); dropped.sort()
    os.makedirs(DIST, exist_ok=True)
    if os.path.exists(OUT):
        os.remove(OUT)
    with zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        z.write(os.path.join(GAME, 'index.html'), 'index.html')   # first entry
        for rel in keep:
            if rel != 'index.html':
                z.write(os.path.join(GAME, rel), rel)
    open(os.path.join(HERE, 'DROPPED-FILES.txt'), 'w').write(
        '# left out of nightrun-web.zip only (%d files, %.1f MB); still in the repo\n' % (len(dropped), sum(os.path.getsize(os.path.join(GAME, r)) for r in dropped) / 1e6)
        + '\n'.join(dropped) + '\n')
    # verify against the itch.io limits
    with zipfile.ZipFile(OUT) as z:
        infos = [i for i in z.infolist() if not i.is_dir()]
    total = sum(i.file_size for i in infos)
    big = max(i.file_size for i in infos)
    longest = max(len(i.filename) for i in infos)
    names = [i.filename for i in infos]
    ok = (len(infos) <= MAX_FILES and total <= MAX_TOTAL and big <= MAX_ONE and longest <= MAX_PATH
          and names[0] == 'index.html' and all(n == n.encode('utf8').decode('utf8') for n in names))
    print('files %d (limit %d) | extracted %.1f MB (limit 500) | biggest %.1f MB (limit 200) | longest path %d (limit 240) | zip %.1f MB | dropped %d'
          % (len(infos), MAX_FILES, total / 1048576, big / 1048576, longest, os.path.getsize(OUT) / 1048576, len(dropped)))
    print('PASS itch limits' if ok else 'FAIL itch limits')
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
