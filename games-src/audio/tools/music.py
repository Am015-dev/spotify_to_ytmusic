"""Build one loopable music MP3 per game (two moods for Shipwreck)."""
import os, sys, json, numpy as np
sys.path.insert(0, os.path.dirname(__file__))
import dsp

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, 'raw', 'mus')
OUT = os.path.join(ROOT, 'work', 'music')
MAXB = 1.5 * 1024 * 1024

# (game, name, source, mode)  mode: 'asis' = author-made seamless loop; (lo, hi) = find loop of that length
TRACKS = [
    ('sands', 'main', 'desert_loop.mp3', 'asis'),
    ('crown', 'main', 'Funked_Up.mp3', 'asis'),
    ('nebula', 'main', 'hostile_fleet_interception.wav', (92, 118)),
    ('shipwreck', 'calm', 'Sea_side_Village.mp3', (60, 72)),
    ('shipwreck', 'storm', 'the_storm_chasers.wav', (55, 80)),
    ('doorkick', 'main', 'The_Old_Tower_Inn.mp3', (72, 100)),
    ('sunglaze', 'main', 'Morning_macleod.mp3', (105, 122)),
    ('rampart', 'main', 'harvestseason.wav', (80, 120)),
]


def main():
    os.makedirs(OUT, exist_ok=True)
    rep = []
    for game, name, src, mode in TRACKS:
        x = dsp.load(os.path.join(RAW, src), 2)
        info = {'game': game, 'name': name, 'src': src, 'src_dur': round(len(x) / dsp.SR, 2)}
        if mode == 'asis':
            y = x; info['loop'] = 'author loop, unchanged'
        else:
            lo, hi = mode
            a, b, sim = dsp.find_loop(x, lo, hi, a_range=(1.0, 40.0))
            y = dsp.seg_loop(x, a, b, 1.5)
            info['loop'] = f'cut {a/dsp.SR:.2f}s-{b/dsp.SR:.2f}s, 1.5 s equal-power cross-fade (similarity {sim:.3f})'
            info['a'] = a / dsp.SR; info['b'] = b / dsp.SR
        y, L0, L1 = dsp.normalise(y, -18, peak_db=-1.0, max_lim_db=3)
        dur = len(y) / dsp.SR
        p = os.path.join(OUT, f'{game}_{name}.mp3')
        sz = dsp.encode_mp3(y, p, 96, ch=2); enc = 'stereo 96 kbps'
        if sz > MAXB:
            sz = dsp.encode_mp3(y.mean(axis=1), p, 80, ch=1); enc = 'mono 80 kbps'
        info.update(dur=round(dur, 2), lufs_in=round(L0, 1), lufs_out=round(L1, 1), bytes=sz, enc=enc, file=os.path.basename(p))
        rep.append(info)
        print(info)
    json.dump(rep, open(os.path.join(ROOT, 'work', 'music_report.json'), 'w'), indent=1)


if __name__ == '__main__':
    main()
