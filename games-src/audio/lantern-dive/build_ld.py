"""Lantern Dive audio: real CC0 recordings only (Kenney packs + OpenGameArt). No synthesis.
Usage: python3 build_ld.py <rawdir> <outdir>
rawdir: Kenney zips unpacked (casino-audio/, impact-sounds/, ...) + mus/ with uw_theme.ogg and uw_pad.ogg (URLs in ASSETS.md)
Writes <outdir>/{sfx,music}/*.mp3 and report.json; bundle_ld.py then writes audio-data.js, MAP.md, credits.html, ASSETS.md."""
import os, sys, json, numpy as np
from scipy.signal import butter, sosfilt
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'tools'))
import dsp, sfx as SFX
RAW = os.path.abspath(sys.argv[1]); W = os.path.abspath(sys.argv[2]); SFX.RAW = RAW
CA = 'casino-audio/Audio/'; IF = 'interface-sounds/Audio/'; IM = 'impact-sounds/Audio/'; RP = 'rpg-audio/Audio/'; UI = 'ui-audio/Audio/'
s = SFX.s; jg = SFX.jg; J = SFX.J
SPEC = {
 'click': s(UI + 'click3.ogg', lufs=-20),
 'play':  s(CA + 'card-place-2.ogg'),
 'slide': s(CA + 'card-slide-3.ogg'),
 'pass':  s(CA + 'card-slide-7.ogg', lufs=-18),
 'take':  s(CA + 'card-fan-1.ogg'),
 'ping':  s(IF + 'bong_001.ogg', mix=[(IM + 'impactGlass_light_000.ogg', 0.0, -8)], lufs=-17, fout=0.25),
 'trick': s(CA + 'chips-handle-3.ogg'),
 'done':  s(IF + 'confirmation_003.ogg', mix=[(IF + 'pluck_001.ogg', 0.05, -4)]),
 'fail':  s(IM + 'impactBell_heavy_003.ogg', rate=0.85, lufs=-20, fout=0.3),
 'deal':  s(CA + 'card-shuffle.ogg', t=1.2, fout=0.2),
 'tick':  s(IF + 'tick_002.ogg', lufs=-22),
 'win':   s(J['STEEL'] + '07.ogg', mix=[(J['PIZZI'] + '14.ogg', 0.0, -3)], fout=0.4),
 'lose':  s(J['SAX'] + '03.ogg', lufs=-19, fout=0.4),
 'error': s(IF + 'error_004.ogg'),
}
for d in ('sfx', 'music'): os.makedirs(os.path.join(W, d), exist_ok=True)
rep = {'sfx': {}, 'music': {}}
for name, spec in SPEC.items():
    y, b, a = SFX.render(spec)
    n = dsp.encode_mp3(y, os.path.join(W, 'sfx', name + '.mp3'), 48)
    rep['sfx'][name] = {'spec': spec, 'dur': round(len(y) / dsp.SR, 3), 'bytes': n, 'lufs': round(a, 1)}
# music: "Underwater Theme" (Spring Spring), similarity-picked loop of ~40-52 s
x = dsp.load(os.path.join(RAW, 'mus', 'uw_theme.ogg'), 1)
a, b, sim = dsp.find_loop(x, 40, 52, a_range=(1.0, 30.0))
y = dsp.seg_loop(x, a, b, 1.5)
y, L0, L1 = dsp.normalise(y, -24, peak_db=-1.0, max_lim_db=3)
n = dsp.encode_mp3(y, os.path.join(W, 'music', 'main.mp3'), 40)
rep['music']['main'] = {'src': 'uw_theme.ogg', 'a': a / 44100, 'b': b / 44100, 'sim': round(sim, 3), 'dur': round(len(y) / 44100, 2), 'bytes': n, 'kbps': 40, 'lufs': round(L1, 1)}
# sea: "Underwater Ambient Pad" (isaiah658), whole 16.7 s clip as a 2 s circular cross-fade loop, low-passed 1.6 kHz so it stays a soft bed
x = dsp.load(os.path.join(RAW, 'mus', 'uw_pad.ogg'), 1)
x = sosfilt(butter(2, 1600, 'low', fs=44100, output='sos'), x)
y = dsp.circ_loop(x, 2.0)
y, L0, L1 = dsp.normalise(y, -30, peak_db=-3.0, max_lim_db=3)
n = dsp.encode_mp3(y, os.path.join(W, 'music', 'sea.mp3'), 32)
rep['music']['sea'] = {'src': 'uw_pad.ogg', 'a': 0.0, 'b': len(x) / 44100, 'sim': 0, 'dur': round(len(y) / 44100, 2), 'bytes': n, 'kbps': 32, 'lufs': round(L1, 1)}
json.dump(rep, open(os.path.join(W, 'report.json'), 'w'), indent=1, default=str)
print(json.dumps({k: {n: (v['bytes'], v['dur']) for n, v in d.items()} for k, d in rep.items()}))
print('total', sum(v['bytes'] for d in rep.values() for v in d.values()))
