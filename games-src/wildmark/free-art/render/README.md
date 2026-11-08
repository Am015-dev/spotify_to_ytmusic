# wildmark art v2: how to rebuild

Terrain, tokens, cards and the table are rebuilt here. Portraits, title/result scenes, icon-logo and tok-acorn still come from `../compose.py` (Kenney CC0).

## 1. Terrain (three.js, KayKit Medieval Hexagon Pack, CC0)
```
cd free-art/render
npm install                         # three@0.160 into node_modules/ (gitignored)
git clone --depth 1 https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0 /some/dir
ln -sfn /some/dir/addons/kaykit_medieval_hexagon_pack/Assets/gltf pack     # pack/ is gitignored
PW_MODULE=<path to playwright> CHROME=<path to chromium> node render.js    # all five, or: node render.js forest
```
`render.js` serves `scene.html` locally, loads the pack's glTF tiles/props, lays a pointy-top hex lattice (4 tiles x 6 rows, one exact
period), lights it with a warm sun plus soft PCF shadows and renders an oblique orthographic view. The tilt angle is acos(width/height)
so the period is exactly square and the 1024 px PNG tiles seamlessly (checked: seam difference equals neighbouring-pixel difference).
Tile side walls and cast shadows give the darker rim between tiles. Outputs: `out/<terrain>.png` (gitignored).

## 2. Plates (public domain)
Put one JPEG per animal in `plates/` (gitignored): `elk.jpg fox.jpg bear.jpg hawk.jpg salmon.jpg`. Sources are listed in `../CREDITS.md`
(Wikimedia Commons `Special:FilePath/<title>?width=1600`; Commons rate-limits hard, space requests out).
Crop boxes are in `CROPS` of `build.py`; every plate goes through the same `grade()` curve (muted, parchment white point).

## 3. Compose
```
PLATES=plates python3 build.py            # writes ../ter-*.webp ../tok-*.webp ../card-*.webp ../table-bg.webp
python3 contact.py                         # ../review/contact-v2.webp
cd .. && python3 install.py --force        # copies into games/wildmark/media/
```
`wood.py` draws the walnut plank table (numpy noise, no external input).
