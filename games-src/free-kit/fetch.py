#!/usr/bin/env python3
"""Download the CC0 raw material for the free kit into a cache dir (default /tmp/freekit-cache).
Usage: python3 fetch.py [cache_dir]   then: python3 build-sprites.sh equivalent is done by sprites.py
Sources (all CC0): Poly Haven textures, Kenney packs mirrored on opengameart.org, Quaternius animal packs (opengameart.org)."""
import sys, os, json, subprocess, zipfile
C = sys.argv[1] if len(sys.argv) > 1 else '/tmp/freekit-cache'
os.makedirs(C + '/tex', exist_ok=True); os.makedirs(C + '/x', exist_ok=True)
def curl(u, out): return subprocess.call(['curl', '-s', '-m', '120', '-L', '-o', out, u]) == 0
OGA = 'https://opengameart.org/sites/default/files/'
PACKS = {'kenney_animal_redux': 'kenney_animalPackRedux.zip', 'kenney_boardgame': 'boardgamePack_v2.zip',
         'kenney_cards': 'playing-cards-pack_0.zip', 'kenney_carto': 'cartographypack.zip',
         'kenney_borders': 'kenney_fantasy-ui-borders.zip', 'kenney_icons': 'kenney_board-game-icons.zip',
         'q_animals2': 'Animal%20Pack%20Vol.2%20by%20%40Quaternius.zip', 'q_animals': 'Animals%20Pack%20by%20Quaternius.zip',
         'q_farm': 'Farm%20Animals%20by%20%40Quaternius.zip'}
for k, f in PACKS.items():
    z = f'{C}/{k}.zip'
    if not os.path.exists(z): curl(OGA + f, z)
    d = f'{C}/x/{k}'
    if not os.path.isdir(d): zipfile.ZipFile(z).extractall(d)
TEX = ("brown_planks_03 brown_planks_05 dark_wooden_planks brown_leather fabric_leather_01 rough_linen hessian_230 denim_fabric gingham_check "
       "wool_boucle knitted_fleece floral_jacquard velour_velvet flour castle_wall_slates large_sandstone_blocks mossy_sandstone cliff_side "
       "rock_face forest_ground_04 forest_leaves_04 aerial_grass_rock snow_02 coast_sand_01 dirt_floor brown_mud_dry rusty_metal metal_plate "
       "blue_metal_plate cobblestone_floor_01 brown_floor_tiles bark_brown_01 clay_plaster lichen_rock aerial_rocks_02 rocky_trail grey_plaster_02 "
       "terracotta_floor_tiles damp_sand").split()
for t in TEX:
    o = f'{C}/tex/{t}.jpg'
    if os.path.exists(o): continue
    j = subprocess.run(['curl', '-s', '-m', '20', f'https://api.polyhaven.com/files/{t}'], capture_output=True, text=True).stdout
    try: curl(json.loads(j)['Diffuse']['1k']['jpg']['url'], o)
    except Exception: print('texture failed', t)
print('cache ready', C)
