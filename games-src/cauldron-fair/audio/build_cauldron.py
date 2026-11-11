"""Cauldron Fair audio: real CC0 recordings only (Kenney packs + OpenGameArt). No synthesis.
Usage: python3 build_cauldron.py <rawdir> <outdir>
rawdir: Kenney zips unpacked, oga/ (rubberduck packs unpacked) and mus/Loop_Market_Day.wav.
Writes <outdir>/{sfx,music}/*.mp3 and report.json; bundle_cauldron.py then writes audio-data.js, MAP.md etc."""
import os, sys, json
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'audio', 'tools'))
import dsp, sfx as SFX
RAW = os.path.abspath(sys.argv[1]); W = os.path.abspath(sys.argv[2]); SFX.RAW = RAW
CA = 'casino-audio/Audio/'; IF = 'interface-sounds/Audio/'; IM = 'impact-sounds/Audio/'; RP = 'rpg-audio/Audio/'; UI = 'ui-audio/Audio/'; SF = 'sci-fi-sounds/Audio/'
A100 = 'oga/100-CC0-SFX_0/'; WS = 'oga/water-splash-slime-sfx/'; LP = 'oga/sfx_loops/'
s = SFX.s; J = SFX.J
SPEC = {
 'click':  s(UI + 'click3.ogg', lufs=-20),
 'draw':   s(RP + 'handleSmallLeather.ogg', lufs=-18),
 'plop':   s(A100 + 'plop_01.ogg'),
 'splash': s(WS + 'splash_02.ogg', lufs=-17),
 'boom':   s(SF + 'explosionCrunch_001.ogg', mix=[(A100 + 'explosion.ogg', 0.0, -8)], lufs=-14, fout=0.3),
 'flask':  s(IM + 'impactGlass_light_000.ogg', mix=[(WS + 'bubble_01.ogg', 0.08, -4)]),
 'ruby':   s(IM + 'impactGlass_light_003.ogg', mix=[(J['PIZZI'] + '14.ogg', 0.02, -6)], lufs=-17),
 'coin':   s(RP + 'handleCoins2.ogg'),
 'tick':   s(IF + 'tick_002.ogg', lufs=-22),
 'die':    s(CA + 'die-throw-2.ogg'),
 'page':   s(RP + 'bookFlip2.ogg', lufs=-19),
 'round':  s(J['PIZZI'] + '09.ogg', mix=[(J['PIZZI'] + '04.ogg', 0.30, -4)]),
 'win':    s(J['SAX'] + '07.ogg', mix=[(J['PIZZI'] + '14.ogg', 0.0, -3)], fout=0.4),
 'error':  s(IF + 'error_004.ogg'),
 'buy':    s(RP + 'handleCoins.ogg', mix=[(CA + 'chip-lay-2.ogg', 0.0, -3)]),
 'bubble': s(WS + 'bubble_02.ogg', lufs=-20),
 'pass':   s(CA + 'card-slide-8.ogg', lufs=-18),
}
for d in ('sfx', 'music'): os.makedirs(os.path.join(W, d), exist_ok=True)
rep = {'sfx': {}, 'music': {}}
for name, spec in SPEC.items():
    y, b, a = SFX.render(spec)
    n = dsp.encode_mp3(y, os.path.join(W, 'sfx', name + '.mp3'), 48)
    rep['sfx'][name] = {'spec': spec, 'dur': round(len(y) / dsp.SR, 3), 'bytes': n, 'lufs': round(a, 1)}
# music: Market Day (a loop by RandomMind), similarity-picked loop
x = dsp.load(os.path.join(RAW, 'mus', 'Loop_Market_Day.wav'), 1)
tot = len(x) / 44100
a, b, sim = dsp.find_loop(x, min(40, tot * 0.5), min(60, tot * 0.9), a_range=(0.5, max(1.0, tot * 0.4)))
y = dsp.seg_loop(x, a, b, 1.5)
y, L0, L1 = dsp.normalise(y, -23, peak_db=-1.0, max_lim_db=3)
n = dsp.encode_mp3(y, os.path.join(W, 'music', 'main.mp3'), 40)
rep['music']['main'] = {'src': 'Loop_Market_Day.wav', 'a': a / 44100, 'b': b / 44100, 'sim': round(sim, 3), 'dur': round(len(y) / 44100, 2), 'bytes': n, 'kbps': 40, 'lufs': round(L1, 1)}
# bubbling: rubberduck "water boiling" loop, circular cross-fade
spec = s(LP + 'water_boiling.ogg', loop=1.0, lufs=-30)
y, b, a = SFX.render(spec)
n = dsp.encode_mp3(y, os.path.join(W, 'sfx', 'bubbling.mp3'), 32)
rep['sfx']['bubbling'] = {'spec': spec, 'dur': round(len(y) / dsp.SR, 3), 'bytes': n, 'lufs': round(a, 1)}
json.dump(rep, open(os.path.join(W, 'report.json'), 'w'), indent=1, default=str)
print(json.dumps({k: {n: (v['bytes'], v['dur']) for n, v in d.items()} for k, d in rep.items()}))
print('total', sum(v['bytes'] for d in rep.values() for v in d.values()))
