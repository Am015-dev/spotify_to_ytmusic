"""Build per-game SFX MP3s from the downloaded CC0 packs.

Each spec: src (path under raw/), optional ss/t (seconds), mix=[(src, offset_s, gain_db)],
lufs (target, default -16), loop (seconds of circular cross-fade, loop kept untrimmed),
fin/fout (fades in seconds), rate (resample factor, >1 = higher pitch).
"""
import os, sys, json, numpy as np
sys.path.insert(0, os.path.dirname(__file__))
import dsp

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, 'raw')
OUT = os.path.join(ROOT, 'work', 'sfx')
KBPS = 64

CA = 'casino-audio/Audio/'; IF = 'interface-sounds/Audio/'; IM = 'impact-sounds/Audio/'
RP = 'rpg-audio/Audio/'; SF = 'sci-fi-sounds/Audio/'; DG = 'digital-audio/Audio/'; UI = 'ui-audio/Audio/'
J = {'PIZZI': 'music-jingles/Audio/Pizzicato jingles/jingles_PIZZI', 'NES': 'music-jingles/Audio/8-Bit jingles/jingles_NES',
     'HIT': 'music-jingles/Audio/Hit jingles/jingles_HIT', 'STEEL': 'music-jingles/Audio/Steel jingles/jingles_STEEL',
     'SAX': 'music-jingles/Audio/Sax jingles/jingles_SAX'}
O = 'oga/'


def jg(fam, n):
    return {'src': f"{J[fam]}{n:02d}.ogg"}


def s(src, **kw):
    d = {'src': src}; d.update(kw); return d


def common(fam, win=2, lose=1, turn=6, level=10):
    return {
        'click': s(UI + 'click3.ogg', lufs=-20),
        'hover': s(UI + 'rollover2.ogg', lufs=-24),
        'confirm': s(IF + 'confirmation_001.ogg'),
        'error': s(IF + 'error_006.ogg'),
        'open': s(IF + 'maximize_006.ogg', lufs=-19),
        'close': s(IF + 'minimize_006.ogg', lufs=-19),
        'turn': jg(fam, turn),
        'levelup': jg(fam, level),
        'win': jg(fam, win),
        'lose': jg(fam, lose),
    }


GAMES = {}

g = common('PIZZI')
g.update({
    'bad': s(IF + 'error_006.ogg'),
    'pick': s(CA + 'card-slide-1.ogg'),
    'drop': s(CA + 'card-place-1.ogg'),
    'take': s(CA + 'card-fan-1.ogg'),
    'camel': s(IM + 'impactWood_heavy_000.ogg'),
    'coins': s(RP + 'handleCoins.ogg'),
    'kill': s(RP + 'knifeSlice.ogg'),
    'djinn': s(DG + 'powerUp3.ogg', lufs=-17),
    'build': s(IM + 'impactPlank_medium_000.ogg'),
    'bid': s(CA + 'chips-stack-1.ogg'),
    'round': jg('PIZZI', 8),
    'meeple': s(IM + 'impactWood_light_000.ogg'),
    'tile': s(RP + 'bookPlace1.ogg'),
    'shuffle': s(CA + 'card-shuffle.ogg', t=1.4, fout=0.25),
    'flip': s(CA + 'card-slide-5.ogg'),
})
GAMES['sands'] = g

g = common('NES', win=12, lose=11, turn=5, level=3)
g.update({
    'bad': s(IF + 'error_006.ogg'),
    'dice': s(CA + 'dice-throw-1.ogg'),
    'shake': s(CA + 'dice-shake-2.ogg', t=1.0, fout=0.2),
    'clack': s(CA + 'die-throw-4.ogg'),
    'smash': s(IM + 'impactPunch_heavy_000.ogg', mix=[(O + 'sfx_100_v2/sfx100v2_stones_01.ogg', 0.04, -5)]),
    'crumble': s(SF + 'explosionCrunch_002.ogg', mix=[(O + 'sfx_100_v2/sfx100v2_stones_02.ogg', 0.1, -3)]),
    'hurt': s(IM + 'impactPunch_medium_000.ogg'),
    'roar': s(O + 'monster_-_starninjas/monster.6.ogg'),
    'heal': s(DG + 'powerUp2.ogg', lufs=-17),
    'star': s(DG + 'threeTone1.ogg', lufs=-17),
    'energy': s(DG + 'zap1.ogg', lufs=-17),
    'whoosh': s(O + 'sfx_100_v2/sfx100v2_air_02.ogg'),
    'stomp': s(IM + 'impactSoft_heavy_000.ogg', mix=[(SF + 'lowFrequency_explosion_001.ogg', 0.0, -4)]),
    'ko': s(SF + 'explosionCrunch_004.ogg'),
    'mindbug': s(DG + 'zapThreeToneDown.ogg', lufs=-17),
    'evolve': s(DG + 'powerUp1.ogg', lufs=-17),
    'buy': s(RP + 'handleCoins2.ogg'),
})
GAMES['crown'] = g

g = common('HIT', win=15, lose=9, turn=3, level=11)
g.update({
    'bad': s(IF + 'error_006.ogg'),
    'laser': s(SF + 'laserSmall_000.ogg'),
    'ion': s(DG + 'phaserUp1.ogg', lufs=-17),
    'torp': s(SF + 'laserLarge_000.ogg'),
    'engine': s(SF + 'thrusterFire_000.ogg', t=1.0, fin=0.12, fout=0.4),
    'roll': s(O + 'sfx_100_v2/sfx100v2_air_01.ogg', t=1.1, fout=0.4),
    'shield': s(SF + 'forceField_000.ogg'),
    'hull': s(SF + 'impactMetal_000.ogg'),
    'crit': s(SF + 'explosionCrunch_000.ogg'),
    'boom': s(SF + 'lowFrequency_explosion_000.ogg', mix=[(SF + 'explosionCrunch_002.ogg', 0.0, -3)]),
    'miss': s(O + 'sfx_100_v2/sfx100v2_air_03.ogg'),
    'dice': s(CA + 'dice-throw-2.ogg'),
    'token': s(CA + 'chip-lay-1.ogg'),
    'lock': s(DG + 'threeTone2.ogg', lufs=-18),
    'stress': s(IF + 'error_003.ogg'),
    'rock': s(IM + 'impactMining_000.ogg'),
    'engine_loop': s(SF + 'spaceEngineLow_000.ogg', loop=0.5, lufs=-22),
})
GAMES['nebula'] = g

g = common('STEEL', win=3, lose=1, turn=6, level=10)
g.update({
    'dice': s(CA + 'dice-throw-3.ogg'),
    'wound': s(IM + 'impactPunch_medium_001.ogg'),
    'heal': jg('STEEL', 4),
    'build': s(IM + 'impactWood_heavy_001.ogg', mix=[(IM + 'impactPlank_medium_001.ogg', 0.18, -2)]),
    'chop': s(RP + 'chop.ogg'),
    'explore': s(IM + 'footstep_grass_000.ogg', mix=[(IM + 'footstep_grass_002.ogg', 0.28, 0)]),
    'fight': s(IM + 'impactPunch_heavy_001.ogg', mix=[(RP + 'knifeSlice.ogg', 0.0, -4)]),
    'event': s(CA + 'card-slide-3.ogg'),
    'thunder': s(O + 'sfx_100_v2/sfx100v2_thunder_01.ogg', t=3.8, fout=1.2),
    'night': jg('STEEL', 14),
    'round': jg('STEEL', 8),
    'good': jg('STEEL', 10),
    'bad': jg('STEEL', 5),
    'mystery': jg('STEEL', 13),
    'place': s(IM + 'impactWood_light_001.ogg'),
    'splash': s(O + 'water-splash-slime-sfx/splash_02.ogg'),
    'rain': s(O + 'sfx_loops/rain.ogg', loop=0.3, lufs=-22),
    'fire': s(O + 'fire-1.ogg', loop=0.3, lufs=-22),
    'wind': s(O + 'wind_background_noise_2.wav', ss=6.0, t=6.0, loop=1.2, lufs=-24),
})
GAMES['shipwreck'] = g

g = common('SAX', win=2, lose=1, turn=6, level=10)
g.update({
    'dice': s(CA + 'dice-throw-1.ogg'),
    'clack': s(CA + 'die-throw-1.ogg'),
    'smash': s(IM + 'impactMetal_heavy_000.ogg', mix=[(RP + 'knifeSlice2.ogg', 0.0, -3)]),
    'sword': s(RP + 'drawKnife2.ogg'),
    'hurt': s(IM + 'impactPunch_heavy_002.ogg'),
    'roar': s(O + '80-CC0-creature-SFX_0/monster_04.ogg'),
    'door': s(O + '100-CC0-SFX_0/slam_02.ogg', mix=[(RP + 'doorOpen_2.ogg', 0.12, -3)]),
    'creak': s(RP + 'creak1.ogg'),
    'level': jg('SAX', 10),
    'bad': jg('SAX', 5),
    'death': jg('SAX', 1),
    'curse': s(DG + 'phaserDown3.ogg', lufs=-17, mix=[(O + 'sfx_100_v2/sfx100v2_air_02.ogg', 0.0, -2)]),
    'whoosh': s(O + 'sfx_100_v2/sfx100v2_air_02.ogg'),
    'coins': s(RP + 'handleCoins.ogg'),
    'deal': s(CA + 'card-slide-2.ogg'),
    'flip': s(CA + 'card-place-4.ogg'),
    'shuffle': s(CA + 'card-shuffle.ogg', t=1.4, fout=0.25),
})
del g['levelup']  # 'level' is the game's own name for it
GAMES['doorkick'] = g

g = common('PIZZI')
g.update({
    'bad': s(IF + 'error_006.ogg'),
    'select': s(IM + 'impactPlate_light_000.ogg'),
    'take': s(CA + 'chips-collide-1.ogg', mix=[(IM + 'impactPlate_light_001.ogg', 0.05, -4)]),
    'place': s(IM + 'impactPlate_light_002.ogg'),
    'clack': s(IM + 'impactPlate_light_003.ogg'),
    'wall': s(IM + 'impactPlate_medium_000.ogg', mix=[(IF + 'glass_001.ogg', 0.04, -3)]),
    'floor': s(IM + 'impactPlate_heavy_000.ogg'),
    'sun': jg('PIZZI', 16),
    'round': jg('PIZZI', 8),
    'refill': s(CA + 'chips-handle-5.ogg'),
    'score': jg('PIZZI', 10),
})
GAMES['sunglaze'] = g

g = common('PIZZI', level=12)
g.update({
    'bad': s(IF + 'error_006.ogg'),
    'place': s(RP + 'bookPlace1.ogg'),
    'fig': s(IM + 'impactWood_light_002.ogg'),
    'score': jg('PIZZI', 10),
    'home': s(IM + 'impactWood_light_004.ogg', lufs=-18),
    'goods': s(RP + 'handleCoins2.ogg'),
    'coins': s(RP + 'handleCoins.ogg'),
    'story': jg('PIZZI', 13),
})
GAMES['rampart'] = g


def render(spec):
    x = dsp.load(os.path.join(RAW, spec['src']))
    if 'ss' in spec:
        x = x[int(spec['ss'] * dsp.SR):]
    if 'rate' in spec:
        n = int(len(x) / spec['rate']); x = np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x)
    for src, off, gdb in spec.get('mix', []):
        y = dsp.load(os.path.join(RAW, src)) * 10 ** (gdb / 20)
        o = int(off * dsp.SR); n = max(len(x), o + len(y)); z = np.zeros(n); z[:len(x)] += x; z[o:o + len(y)] += y; x = z
    if spec.get('loop'):
        if 't' in spec:
            x = x[:int((spec['t'] + spec['loop']) * dsp.SR)]
        x = dsp.circ_loop(x, spec['loop'])
    else:
        x = dsp.trim(x)
        if 't' in spec:
            x = x[:int(spec['t'] * dsp.SR)]
        if spec.get('fin'):
            n = int(spec['fin'] * dsp.SR); x[:n] *= np.linspace(0, 1, n)
        if spec.get('fout'):
            x = dsp.fade_out(x, spec['fout'])
    y, before, after = dsp.normalise(x, spec.get('lufs', -16))
    return y, before, after


def main(only=None):
    report = {}
    for game, sp in GAMES.items():
        if only and game not in only:
            continue
        d = os.path.join(OUT, game); os.makedirs(d, exist_ok=True)
        tot = 0; rows = {}
        for name, spec in sp.items():
            y, b, a = render(spec)
            p = os.path.join(d, name + '.mp3')
            sz = dsp.encode_mp3(y, p, KBPS)
            tot += sz
            rows[name] = {'spec': spec, 'dur': round(len(y) / dsp.SR, 3), 'lufs_in': round(b, 1), 'lufs_out': round(a, 1), 'bytes': sz}
        report[game] = {'total': tot, 'files': rows}
        print(f"{game:10s} {len(sp):3d} sounds {tot/1024:7.1f} KB")
    json.dump(report, open(os.path.join(ROOT, 'work', 'sfx_report.json'), 'w'), indent=1)


if __name__ == '__main__':
    main(sys.argv[1:])
