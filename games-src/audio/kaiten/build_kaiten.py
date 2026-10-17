"""Kaiten Kitchen audio: real CC0 recordings only (Kenney packs + OpenGameArt). No synthesis.
Usage: python3 build_kaiten.py <rawdir> <outdir>
rawdir: Kenney zips unpacked (casino-audio/, impact-sounds/, ...) + mus/ with jazz_slower.wav, fridge2.mp3
Writes <outdir>/{sfx,music}/*.mp3 and report.json; bundle_kaiten.py then writes audio-data.js, MAP.md etc."""
import os, sys, json, numpy as np
from scipy.signal import butter, sosfilt
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'tools'))
import dsp, sfx as SFX
RAW = os.path.abspath(sys.argv[1]); W = os.path.abspath(sys.argv[2]); SFX.RAW = RAW
CA = 'casino-audio/Audio/'; IF = 'interface-sounds/Audio/'; IM = 'impact-sounds/Audio/'; RP = 'rpg-audio/Audio/'; UI = 'ui-audio/Audio/'
s = SFX.s; jg = SFX.jg; J = SFX.J
SPEC = {
 'click':  s(UI + 'click3.ogg', lufs=-20),
 'clink':  s(IM + 'impactGlass_light_001.ogg', mix=[(IM + 'impactTin_medium_002.ogg', 0.012, -7)]),
 'slide':  s(CA + 'card-slide-4.ogg'),
 'pass':   s(CA + 'card-slide-8.ogg', lufs=-18),
 'pick':   s(CA + 'card-place-3.ogg'),
 'cloche': s(RP + 'metalLatch.ogg', mix=[(IM + 'impactTin_medium_000.ogg', 0.05, -5), (CA + 'card-slide-2.ogg', 0.0, -9)], fout=0.1),
 'coin':   s(RP + 'handleCoins2.ogg'),
 'tick':   s(IF + 'tick_002.ogg', lufs=-22),
 'round':  s(J['PIZZI'] + '09.ogg', mix=[(J['PIZZI'] + '04.ogg', 0.30, -4)]),
 'win':    s(J['SAX'] + '07.ogg', mix=[(J['PIZZI'] + '14.ogg', 0.0, -3)], fout=0.4),
 'error':  s(IF + 'error_004.ogg'),
}
for d in ('sfx', 'music'): os.makedirs(os.path.join(W, d), exist_ok=True)
rep = {'sfx': {}, 'music': {}}
for name, spec in SPEC.items():
    y, b, a = SFX.render(spec)
    n = dsp.encode_mp3(y, os.path.join(W, 'sfx', name + '.mp3'), 48)
    rep['sfx'][name] = {'spec': spec, 'dur': round(len(y) / dsp.SR, 3), 'bytes': n, 'lufs': round(a, 1)}
# music: Jazz Slower, similarity-picked loop of ~40-52 s
x = dsp.load(os.path.join(RAW, 'mus', 'jazz_slower.wav'), 1)
a, b, sim = dsp.find_loop(x, 40, 52, a_range=(2.0, 60.0))
y = dsp.seg_loop(x, a, b, 1.5)
y, L0, L1 = dsp.normalise(y, -23, peak_db=-1.0, max_lim_db=3)
n = dsp.encode_mp3(y, os.path.join(W, 'music', 'main.mp3'), 40)
rep['music']['main'] = {'src': 'jazz_slower.wav', 'a': a / 44100, 'b': b / 44100, 'sim': round(sim, 3), 'dur': round(len(y) / 44100, 2), 'bytes': n, 'kbps': 40, 'lufs': round(L1, 1)}
# belt hum: LEGIT Audio fridge drone, steady part, low-passed at 1.1 kHz (warm motor), 1.5 s circular cross-fade loop
x = dsp.load(os.path.join(RAW, 'mus', 'fridge2.mp3'), 1)
x = x[int(2.0 * 44100):int(12.5 * 44100)]
x = sosfilt(butter(2, 1100, 'low', fs=44100, output='sos'), x)
y = dsp.circ_loop(x, 1.5)
y, L0, L1 = dsp.normalise(y, -30, peak_db=-3.0, max_lim_db=3)
n = dsp.encode_mp3(y, os.path.join(W, 'music', 'belt.mp3'), 32)
rep['music']['belt'] = {'src': 'fridge2.mp3', 'a': 2.0, 'b': 12.5, 'sim': 0, 'dur': round(len(y) / 44100, 2), 'bytes': n, 'kbps': 32, 'lufs': round(L1, 1)}
json.dump(rep, open(os.path.join(W, 'report.json'), 'w'), indent=1, default=str)
print(json.dumps({k: {n: (v['bytes'], v['dur']) for n, v in d.items()} for k, d in rep.items()}))
print('total', sum(v['bytes'] for d in rep.values() for v in d.values()))
