# Living room: third-party assets

Everything below is **CC0 1.0** (public domain) from **Poly Haven** (https://polyhaven.com, licence https://polyhaven.com/license, snapshot in `licence-snapshots/`, per-asset metadata in `licence-snapshots/info/`). Downloaded 2026-10-03 through the Poly Haven API (`https://api.polyhaven.com/files/<id>`, files from `dl.polyhaven.org`; all hosts reachable). Credit is not required; authors are listed as thanks. Nothing from ambientCG or Kenney was needed.

| Asset | Source URL | Author | Licence | Used for | Changes |
|---|---|---|---|---|---|
| Television 01 (model, 2k) | https://polyhaven.com/a/Television_01 | Gabriel Radić | CC0 | The 1970s CRT TV in the room image (`room-back-*.webp`). The live TV screen is an HTML element laid over its glass. | The texture contained a "VTECH" logo plate and a side label; both were painted over with the panel colour (`render/assets/models/Television_01/textures/..._nologo.jpg`). |
| Modern Wooden Cabinet (model) | https://polyhaven.com/a/modern_wooden_cabinet | Patrik Pangerl | CC0 | TV console under the TV (`room-back-*.webp`) | Scaled to about 1 m wide |
| Modern Coffee Table 01 (model) | https://polyhaven.com/a/modern_coffee_table_01 | Amin | CC0 | Coffee table (`room-front-*.webp`) | Scaled, rotated |
| Mid Century Lounge Chair (model) | https://polyhaven.com/a/mid_century_lounge_chair | Kuutti Siitonen | CC0 | Armchair at the right (`room-front-*.webp`) | Scaled, rotated |
| Vintage Suitcase (model) | https://polyhaven.com/a/vintage_suitcase | Maximilian Schuster | CC0 | The "Saves & offline" object, `suitcase.webp` | Scaled |
| Potted Plant 02 (model) | https://polyhaven.com/a/potted_plant_02 | Rico Cilliers | CC0 | Plant on the top shelf, `plant.webp` | Scaled |
| Wood Floor (texture, 2k) | https://polyhaven.com/a/wood_floor | Dimitrios Savva | CC0 | Floor in the room render | none |
| Beige Wall 002 (texture, 2k) | https://polyhaven.com/a/beige_wall_002 | Dimitrios Savva, Rico Cilliers | CC0 | Plaster wall and wainscot in the room render | Desaturated and lightened to a cream (`Diffuse_cream.jpg`) |
| Walnut Veneer (texture, 2k) | https://polyhaven.com/a/walnut_veneer | Jenelle van Heerden | CC0 | Wainscot rails and skirting in the render; `wood.webp` (512 px) is the bookcase wood | Downscaled for `wood.webp` |
| Velour Velvet (texture, 2k) | https://polyhaven.com/a/velour_velvet | colormass, Rico Cilliers | CC0 | Rug in the render (with a drawn border); `velour.webp` (256 px) is the curtains | Darkened and bordered for the rug |
| Brown Photostudio 02 (HDRI, 1k) | https://polyhaven.com/a/brown_photostudio_02 | Sergej Majboroda | CC0 | Image-based light for the renders only (not shipped) | none |

## Generated files (games/room/)
`room-back-day.webp`, `room-back-night.webp` (1920x1200, whole stage), `room-front-day.webp`, `room-front-night.webp` (transparent, cropped), `suitcase.webp`, `plant.webp`, `wood.webp`, `velour.webp`. Total is about 0.3 MB.

## How they are made (offline, not part of the page)
`render/fetch.py` downloads the models and textures, `render/scene.html` (three.js 0.158 from `games-src/node_modules`, GLTFLoader, RGBELoader) builds the room, `render/render.js` renders it in headless Chromium (SwiftShader) and `render/make.py` crops and encodes WebP. One level camera (1.45 m high, 5 m from the wall, off-axis frustum so verticals stay vertical) is used for every layer so furniture shares one floor; 1 m at the wall plane is 25.71 stage em. Run `cd games-src/room/render && python3 fetch.py model Television_01 modern_wooden_cabinet modern_coffee_table_01 mid_century_lounge_chair vintage_suitcase potted_plant_02 && python3 fetch.py tex wood_floor beige_wall_002 walnut_veneer velour_velvet && python3 fetch.py hdri brown_photostudio_02` then `python3 patch_textures.py` and `python3 make.py`. `render/assets/` and `render/out/` are git-ignored (about 60 MB of sources).
The positions of the live TV screen (13.8 x 10.5 em at 3.49, 49.9) and knobs are measured from the render (`meta.screen`, `meta.knobs` in `render/out/meta-*.json`).
