#!/usr/bin/env python3
"""Rewrite ../CREDITS.md. Usage: python3 credits.py bear,elk,...   (animals whose plate came from the plate sources)"""
import sys, os
H = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
have = set(sys.argv[1].split(',')) if len(sys.argv) > 1 else set()
C = 'https://commons.wikimedia.org/wiki/File:'
SRC = {
 'elk': ('John Woodhouse Audubon / John James Audubon, "The Viviparous Quadrupeds of North America" (1845-48), plate "American Elk (Cervus canadensis)"', C + 'American_Elk_(Cervus_Canadensis)_from_the_viviparous_quadrupeds_of_North_America_(1845)_illustrated_by_John_Woodhouse_Audubon_(1812-1862).jpg'),
 'fox': ('J. W. Audubon / J. J. Audubon, "The Viviparous Quadrupeds of North America", plate "American Red-Fox (Vulpes fulvus)"', C + 'American_Red-Fox_(Vulpes_Fulvus)_from_the_viviparous_quadrupeds_of_North_America_(1845)_illustrated_by_John_Woodhouse_Audubon_(1812-1862).jpg'),
 'bear': ('J. W. Audubon / J. J. Audubon, "The Viviparous Quadrupeds of North America", plate of the American black bear (Wikimedia Commons)', 'https://commons.wikimedia.org/ (title recorded in render/plates-source.txt)'),
 'hawk': ('John James Audubon, "The Birds of America" (1827-38), plate "Red-tailed Hawk"', C + 'Red-tailed_Hawk_(Audubon).jpg'),
 'salmon': ('Period fish plate, 19th century (US government fisheries print, public domain), Wikimedia Commons', C + 'Chinook_Salmon_Adult_Male.jpg'),
}
L = ['# Free art credits: wildmark', '',
 'No picture contains text. No publisher, designer or original-game name or logo is used.', '',
 '## Sources', '', '| Source | Author | Licence | URL |', '|---|---|---|---|',
 '| Medieval Hexagon Pack (glTF tiles and nature props) | Kay Lousberg (KayKit) | CC0 1.0 | https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0 |',
 '| three.js r160 (renderer, MIT, build tool only) | mrdoob and contributors | MIT | https://threejs.org |']
for a in ('bear', 'elk', 'salmon', 'hawk', 'fox'):
    if a in have: L.append(f'| {SRC[a][0]} | Audubon (or period engraver) | Public domain (published before 1900) | {SRC[a][1]} |')
L += ['| Hexagon Pack, Animal Pack Redux, Toon Characters 1, Fantasy UI Borders (files still made by compose.py: portraits, title/result scenes, icon-logo, tok-acorn) | Kenney (www.kenney.nl) | CC0 1.0 | https://kenney.nl/assets |', '',
 '## Per file', '', '| File | Source |', '|---|---|']
L += [f'| ter-{t}.webp | KayKit Medieval Hexagon Pack, rendered with three.js (render/render.js), seamless, shaded tile rims |' for t in ('forest', 'peak', 'meadow', 'marsh', 'river')]
for a in ('bear', 'elk', 'salmon', 'hawk', 'fox'):
    who = 'public-domain plate (see Sources), cropped, one shared parchment grade' if a in have else 'earlier Kenney Animal Pack Redux composite (plate not yet fetched)'
    L.append(f'| tok-{a}.webp | {who} |')
    for s in 'abcd': L.append(f'| card-{a}-{s}.webp | KayKit terrain render + ' + ('public-domain plate (see Sources)' if a in have else 'Kenney animal (plate not yet fetched)') + ' |')
L += ['| table-bg.webp | procedural walnut planks (render/wood.py), no third-party input |',
      '| tok-acorn, portrait-*, title-bg, result-*, icon-logo | unchanged, Kenney CC0 packs via compose.py |']
open(os.path.join(H, 'CREDITS.md'), 'w').write('\n'.join(L) + '\n')
print('pass credits')
