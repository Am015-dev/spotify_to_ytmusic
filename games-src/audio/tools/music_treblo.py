#!/usr/bin/env python3
"""Game-ready music from the Treblo sources (ffmpeg only).
  python3 music_treblo.py <src-dir with tavern|main|fight|victory|defeat -a|-b.mp3> <out-dir> [--caps tavern=60,main=100]
Loops (tavern, main, fight): at most 150 s (or the --caps value per slot; a decoded loop is ~21 MB per minute of memory), the last 2 s cross-faded into the first 2 s so the wrap is seamless.
Cues: victory 18 s, defeat 11 s, 0.4 s fade-in, 3 s fade-out. All normalised to -18 LUFS, 96 kbps MP3."""
import os, subprocess, sys, tempfile

def dur(f):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).decode())

def run(a):
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error'] + a, check=True)

def main(src, out, caps=None):
    caps = caps or {}
    os.makedirs(out, exist_ok=True)
    for slot in ('tavern', 'main', 'fight', 'victory', 'defeat'):
        for v in 'ab':
            f = os.path.join(src, f'{slot}-{v}.mp3'); o = os.path.join(out, f'{slot}-{v}.mp3')
            norm = 'loudnorm=I=-18:TP=-1.5:LRA=11'
            if slot in ('victory', 'defeat'):
                n = 18 if slot == 'victory' else 11
                run(['-i', f, '-t', str(n), '-af', f'afade=t=in:d=0.4,afade=t=out:st={n-3}:d=3,{norm}', '-ar', '44100', '-b:a', '96k', o])
            else:
                L = min(dur(f), float(caps.get(slot, 150))); X = 2.0
                fc = (f'[0:a]atrim=0:{X},asetpts=PTS-STARTPTS[h];[0:a]atrim={L-X}:{L},asetpts=PTS-STARTPTS[t];'
                      f'[0:a]atrim={X}:{L-X},asetpts=PTS-STARTPTS[m];[t][h]acrossfade=d={X}:c1=qsin:c2=qsin[x];[x][m]concat=n=2:v=0:a=1,{norm}[o]')
                run(['-i', f, '-filter_complex', fc, '-map', '[o]', '-ar', '44100', '-b:a', '96k', o])
            print(o, round(dur(o), 1), 's', os.path.getsize(o) // 1024, 'KB')

if __name__ == '__main__':
    caps = {}
    if '--caps' in sys.argv: caps = dict(kv.split('=') for kv in sys.argv[sys.argv.index('--caps') + 1].split(','))
    main(sys.argv[1], sys.argv[2], caps)
