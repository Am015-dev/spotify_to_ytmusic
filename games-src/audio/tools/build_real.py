"""Build Hollowbough + Thornbound packs from real CC0 recordings (Kenney + OpenGameArt).
Usage: python3 build_real.py <rawdir> <workdir>   (rawdir holds the Kenney zips unpacked + mus/ with the OGA tracks)
Same processing as sfx.py/music.py: trim, loudness-normalise, mono 64 kbps SFX; music = similarity-picked loop with 1.5 s equal-power cross-fade."""
import os, sys, json, subprocess, numpy as np
sys.path.insert(0, os.path.dirname(__file__))
import dsp, sfx as SFX
RAW = os.path.abspath(sys.argv[1]); W = os.path.abspath(sys.argv[2])
SFX.RAW = RAW
CA = 'casino-audio/Audio/'; IF = 'interface-sounds/Audio/'; IM = 'impact-sounds/Audio/'; RP = 'rpg-audio/Audio/'; UI = 'ui-audio/Audio/'
s = SFX.s; jg = SFX.jg
J = SFX.J

GAMES = {
 'hollowbough': {
   'click': s(UI + 'click3.ogg', lufs=-20),
   'place': s(CA + 'card-place-2.ogg'),
   'flip': s(CA + 'card-slide-6.ogg'),
   'twig': s(IM + 'impactWood_light_000.ogg', mix=[(IM + 'impactWood_light_003.ogg', 0.09, -2)]),
   'resin': s(IF + 'drop_001.ogg'),
   'pebble': s(IM + 'impactMining_001.ogg', mix=[(IM + 'impactMining_003.ogg', 0.1, -3)]),
   'berry': s(IF + 'pluck_002.ogg'),
   'worker': s(IM + 'impactWood_light_001.ogg'),
   'season': jg('PIZZI', 7),
   'event': jg('PIZZI', 3),
   'tally': s(IF + 'tick_002.ogg', lufs=-22),
   'score': s(IF + 'confirmation_002.ogg'),
   'turn': jg('PIZZI', 6),
   'fanfare': s(J['PIZZI'] + '02.ogg', mix=[(J['SAX'] + '07.ogg', 0.5, -2)], fout=0.4),
   'lose': jg('PIZZI', 1),
   'error': s(IF + 'error_004.ogg'),
 },
 'thornbound': {
   'click': s(IF + 'click_002.ogg', lufs=-20),
   'place': s(CA + 'card-shove-2.ogg', mix=[(IM + 'impactSoft_heavy_000.ogg', 0.0, -6)]),
   'flip': s(CA + 'card-slide-7.ogg'),
   'clash': s(IM + 'impactMetal_heavy_001.ogg', mix=[(IM + 'impactPunch_heavy_000.ogg', 0.0, -3)]),
   'win': jg('STEEL', 3),
   'influence': s(RP + 'handleCoins.ogg'),
   'herald': s(RP + 'footstep03.ogg', mix=[(RP + 'metalClick.ogg', 0.12, -6)]),
   'bid': s(RP + 'handleCoins2.ogg'),
   'bell': s(IM + 'impactBell_heavy_000.ogg', fout=0.8),
   'fanfare': s(J['STEEL'] + '07.ogg', mix=[(J['HIT'] + '15.ogg', 0.0, -3)], fout=0.4),
   'lose': jg('STEEL', 1),
   'error': s(IF + 'error_006.ogg'),
 }}
# slug -> list of (name, source file in rawdir/mus, loop range seconds, mono kbps)
MUSIC = {
 'hollowbough': [('spring', 'celtic.mp3', (12, 15), 32), ('summer', 'village_square.ogg', (12, 15), 32),
                 ('autumn', 'northumberland.mp3', (12, 15), 32), ('winter', 'long_winter.mp3', (12, 15), 32)],
 'thornbound': [('main', 'dark_forest.mp3', (20, 26), 40), ('tense', 'dungeon002.ogg', (14, 18), 40)],
}
LU = {'hollowbough': -23, 'thornbound': -20}

def enc(x, path, kbps, sr=32000):
    x = np.clip(x, -1, 1).astype(np.float32)
    subprocess.run([dsp.FF, '-v', 'error', '-y', '-f', 'f32le', '-ar', '44100', '-ac', '1', '-i', '-', '-ar', str(sr), '-c:a', 'libmp3lame', '-b:a', f'{kbps}k', '-ac', '1', path], input=x.tobytes(), check=True)
    return os.path.getsize(path)

rep = {}
for slug in GAMES:
    sd = os.path.join(W, slug, 'sfx'); md = os.path.join(W, slug, 'music'); os.makedirs(sd, exist_ok=True); os.makedirs(md, exist_ok=True)
    rep[slug] = {'sfx': {}, 'music': {}}
    for name, spec in GAMES[slug].items():
        y, b, a = SFX.render(spec)
        n = dsp.encode_mp3(y, os.path.join(sd, name + '.mp3'), 48 if slug == 'hollowbough' else 64)
        rep[slug]['sfx'][name] = {'spec': spec, 'dur': round(len(y) / dsp.SR, 3), 'bytes': n, 'lufs': round(a, 1)}
    for name, src, (lo, hi), kb in MUSIC[slug]:
        x = dsp.load(os.path.join(RAW, 'mus', src), 1)
        a, b, sim = dsp.find_loop(x, lo, hi, a_range=(1.0, min(40.0, len(x) / 44100 - hi - 4)))
        y = dsp.seg_loop(x, a, b, 1.5)
        y, L0, L1 = dsp.normalise(y, LU[slug], peak_db=-1.0, max_lim_db=3)
        n = enc(y, os.path.join(md, name + '.mp3'), kb)
        rep[slug]['music'][name] = {'src': src, 'a': a / 44100, 'b': b / 44100, 'sim': round(sim, 3), 'dur': round(len(y) / 44100, 2), 'bytes': n, 'kbps': kb, 'lufs': round(L1, 1)}
        print(slug, name, rep[slug]['music'][name])
    print(slug, 'sfx bytes', sum(v['bytes'] for v in rep[slug]['sfx'].values()))
json.dump(rep, open(os.path.join(W, 'report.json'), 'w'), indent=1, default=str)
