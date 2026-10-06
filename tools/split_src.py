#!/usr/bin/env python3
"""One-off (re-runnable) splitter: live split page body + km.js -> src/ modules.
Usage: python3 tools/split_src.py <overdrive.html (split body, as in out/<ver>/)> <km.js> [srcdir]
Each module is a contiguous run of whole lines; concatenating src/ORDER reproduces the input byte for byte.
A module starts at the first line that starts with its marker (searched after the previous module's start)."""
import sys, os
body, km = sys.argv[1], sys.argv[2]
out = sys.argv[3] if len(sys.argv) > 3 else 'src'
# (file, marker = prefix of the module's first line). First module starts at line 0.
MODS = [
 ('00_page.html',          None),
 ('02_data_json.html',     '<script type="importmap">'),
 ('10_core.js',            '+<script type="module">'),   # '+' = the line AFTER this one
 ('20_race_world.js',      '/* ============================================================ 6 · world */'),
 ('30_race.js',            '/* ============================================================ 8 · traffic */'),
 ('40_hud_input_menu.js',  '/* ============================================================ 13 · HUD */'),
 ('41_career_quests.js',   '/* ---------------- CAREER = FREE ROAM'),
 ('50_kenney_data.js',     '/* ================================================================ FREE-ROAM FRANKFURT'),
 ('51_city_net.js',        '// ---------- Kenney CC0 models'),
 ('52_terrain_data.js',    'const TR_DATA='),
 ('53_terrain_roads.js',   "const TR_EX="),
 ('60_city_build.js',      '// ---------- build the map'),
 ('70_roam_world.js',      '// distance culling for the big city'),
 ('71_roam_drive.js',      '// ---- track deck as a drivable road in free roam'),
 ('72_roam_map_loop_boot.js', '// ---- map'),
 ('80_story_m1.js',        '// ===== M1 "the first 30 minutes are a game"'),
 ('81_story_ath_m2_m3.js', '// ===== ATC: Athens campaign'),
 ('85_audio_feel_sp_otg.js', '/* ============================================================ AU · adaptive music'),
 ('90_fixes_cv_ju.js',     '// ===== OB (owner bugs): burst cause log'),
 ('92_garage_builder.js',  '// ===== GB: LEGO brick builder'),
 ('93_cars_lego.js',       '// ---------- presets (built through the same snapping rules'),
 ('94_garage_ui.js',       '// ---------- builder scene'),
 ('95_drive_flow.js',      '// DR probe (measurement only'),
 ('96_scale_qa.js',        '/* ===== SC · real-world scale'),
 ('97_art.js',             '// ==== ART step 5'),
 ('98_garage_driver.js',   '// ---------- GAR1:'),
 ('99_api.js',             'window.__mho={'),
]
s = open(body, encoding='utf8', newline='').read()
L = s.split('\n'); L = [l + '\n' for l in L[:-1]] + ([L[-1]] if L[-1] else [])
starts = [0]; i = 0
for f, m in MODS[1:]:
    nx = m.startswith('+'); m = m.lstrip('+')
    i = next((k for k in range(i + 1, len(L)) if L[k].startswith(m)), None)
    if nx and i is not None: i += 1
    assert i is not None, f'marker not found for {f}: {m!r}'
    starts.append(i)
starts.append(len(L))
os.makedirs(os.path.join(out, 'assets'), exist_ok=True)
for (f, _), a, b in zip(MODS, starts, starts[1:]):
    t = ''.join(L[a:b]); open(os.path.join(out, f), 'w', encoding='utf8', newline='').write(t)
    print(f'{f:24s} lines {a+1:5d}-{b:5d}  {len(t.encode()):8d} B')
open(os.path.join(out, 'ORDER'), 'w').write(''.join(f + '\n' for f, _ in MODS))
open(os.path.join(out, 'assets', 'km.js'), 'wb').write(open(km, 'rb').read())
