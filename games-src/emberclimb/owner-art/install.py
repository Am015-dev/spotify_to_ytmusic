#!/usr/bin/env python3
"""Owner art first: reuse the owner's doorkick-dungeon pictures and boss videos in emberclimb under emberclimb stems.
Source: games/doorkick-dungeon/media (owner-made). Target: games/emberclimb/media/<stem>.webp|.mp4.
Owner art beats the free-kit art (free-art/install.py), so this runs AFTER it and overwrites those stems.
Video stills come from ffmpeg: t=0.1 s is the empty room (backgrounds), t=4.5 s is the monster (portraits, square crop).
Usage: python3 install.py [--dry]"""
import os, sys, shutil, subprocess, json
here = os.path.dirname(os.path.abspath(__file__))
root = os.path.normpath(os.path.join(here, '..', '..', '..', 'games'))
src, dst = os.path.join(root, 'doorkick-dungeon', 'media'), os.path.join(root, 'emberclimb', 'media')
dry = '--dry' in sys.argv
# stem <- (source file, how): copy = as is; still:T = video frame at T s (cover); face:T = video frame at T s, centre square
MAP = {
    'bg-title': ('title-phone.webp', 'copy'), 'bg-title-wide': ('title.webp', 'copy'),
    'bg-map': ('table-tavern-phone.webp', 'copy'), 'bg-map-wide': ('table-tavern.webp', 'copy'),
    'bg-reward': ('table-golden-vault.webp', 'copy'), 'bg-victory': ('end-win.webp', 'copy'), 'bg-defeat': ('end-lose.webp', 'copy'),
    'card-back': ('back-door.webp', 'copy'),
    'cast-guide': ('camp-hobb.webp', 'copy'), 'cast-rival': ('camp-grub.webp', 'copy'),
    'cast-merchant': ('camp-tansy.webp', 'copy'), 'cast-healer': ('camp-pip.webp', 'copy'), 'cast-teller': ('camp-morwen.webp', 'copy'),
    'bg-battle-1': ('doorkick-skygrif-boss.mp4', 'still:0.1'), 'bg-battle-2': ('doorkick-pharaoh-boss.mp4', 'still:0.1'),
    'bg-battle-3': ('doorkick-tentacles-boss.mp4', 'still:0.1'), 'bg-elite': ('doorkick-dread-boss.mp4', 'still:0.1'),
    'bg-boss-mire-behemoth': ('doorkick-tentacles-boss.mp4', 'still:0.1'), 'bg-boss-ashen-wraith': ('doorkick-dread-boss.mp4', 'still:0.1'),
    'bg-boss-gate-colossus': ('doorkick-wyrm-boss.mp4', 'still:0.1'), 'bg-boss-ember-tyrant': ('doorkick-inferno-boss.mp4', 'still:0.1'),
    'bg-boss-tomb-king': ('doorkick-pharaoh-boss.mp4', 'still:0.1'), 'bg-boss-skyclaw': ('doorkick-skygrif-boss.mp4', 'still:0.1'),
    'enemy-mire-behemoth': ('doorkick-tentacles-boss.mp4', 'face:4.5'), 'enemy-ashen-wraith': ('doorkick-dread-boss.mp4', 'face:4.5'),
    'enemy-gate-colossus': ('doorkick-wyrm-boss.mp4', 'face:4.5'), 'enemy-ember-tyrant': ('doorkick-inferno-boss.mp4', 'face:4.5'),
    'enemy-tomb-king': ('doorkick-pharaoh-boss.mp4', 'face:4.5'), 'enemy-skyclaw': ('doorkick-skygrif-boss.mp4', 'face:4.5'),
    'boss-mire-behemoth': ('doorkick-tentacles-boss.mp4', 'video'), 'boss-ashen-wraith': ('doorkick-dread-boss.mp4', 'video'),
    'boss-gate-colossus': ('doorkick-wyrm-boss.mp4', 'video'), 'boss-ember-tyrant': ('doorkick-inferno-boss.mp4', 'video'),
    'boss-tomb-king': ('doorkick-pharaoh-boss.mp4', 'video'), 'boss-skyclaw': ('doorkick-skygrif-boss.mp4', 'video'),
}
def ff(*a): subprocess.run(['ffmpeg', '-loglevel', 'error', '-y'] + list(a), check=True)
n = 0
for stem, (f, how) in MAP.items():
    s = os.path.join(src, f)
    if not os.path.exists(s): print('MISSING source', f); continue
    if dry: n += 1; continue
    if how == 'copy': shutil.copyfile(s, os.path.join(dst, stem + '.webp'))
    elif how == 'video': shutil.copyfile(s, os.path.join(dst, stem + '.mp4'))
    else:
        k, t = how.split(':'); vf = 'crop=ih:ih:(iw-ih)/2:0,scale=480:480' if k == 'face' else 'scale=854:-2'
        ff('-ss', t, '-i', s, '-frames:v', '1', '-vf', vf, '-c:v', 'libwebp', '-quality', '80', os.path.join(dst, stem + '.webp'))
    n += 1
json.dump({k: v[0] for k, v in MAP.items()}, open(os.path.join(here, 'map.json'), 'w'), indent=1)
print(f'emberclimb owner art: installed {n} of {len(MAP)} stems from doorkick-dungeon')
