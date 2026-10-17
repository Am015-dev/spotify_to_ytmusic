# Free game assets: skill reference

Licences verified 2026-09-30. Full research, tables and code: `FREE-ASSETS.md`. This is not legal advice. "unverified" means the source's own page could not be fetched.

## Decision order
1. **Generate it procedurally first.** Web Audio or ZzFX (MIT) for SFX; ZzFXM (MIT) or BeepBox (MIT) for music; Three.js primitives, `CanvasTexture`, shaders and `RoomEnvironment` for visuals. You own the result and there are no files to host.
2. **CC0 packs next.** No credit needed: Kenney, Quaternius, KayKit, Poly Haven, ambientCG.
3. **CC BY with credits.** Add a TASL line to the Credits screen for every asset.
4. **Avoid restricted licences** (tier 3 custom "royalty-free"). **Never** use NC, ND or "personal use" assets.
5. Log every asset in `ASSETS.md` at download time: file, source URL, author, licence, date, licence URL, snapshot, changes.

## Tiers
- **1 (CC0/PD):** no conditions.
- **2 (CC BY, OGA-BY, OFL, MIT, ISC, Apache):** credit the author or keep the notice.
- **2-SA (CC BY-SA, GPL art, OpenMoji):** derivatives must use the same licence. Use unmodified.
- **3 (custom):** read what it forbids.

## Top sources by category
**3D models**
- Kenney: CC0. Don't use the Kenney logo. https://kenney.nl/support
- Quaternius: CC0, rigged characters. https://quaternius.com/faq.html
- KayKit: CC0 ("please don't resell unmodified copies"). https://kaylousberg.itch.io/kaykit-dungeon-pack
- Poly Pizza: CC0 or CC BY 4.0 per model; check the label (unverified, site returns 403).
- Sketchfab: filter to CC0 or CC BY; credit the author and Sketchfab. Skip NC/ND and "Standard".
- Khronos glTF samples: per model. **DamagedHelmet includes CC BY-NC, Sponza uses a Cryengine licence, Duck uses SCEA.** FlightHelmet is CC0.
- OpenGameArt: CC0 filter https://opengameart.org/art-search-advanced?field_art_licenses_tid%5B%5D=4

**Textures and HDRIs**
- Poly Haven: CC0, redistribution allowed. https://polyhaven.com/license
- ambientCG: CC0. https://docs.ambientcg.com/license/
- 3DTextures.me: CC0.
- ShareTextures: "custom CC0". No redistribution on other sites or in collections; CC0 only if downloaded from their site. Treat as tier 3.

**Music**
- Kenney Music Jingles: CC0.
- OpenGameArt and Freesound: use the CC0 filter.
- Kevin MacLeod / Incompetech: CC BY 4.0. Credit: `"Title" Kevin MacLeod (incompetech.com) Licensed under Creative Commons: By Attribution 4.0 https://creativecommons.org/licenses/by/4.0/`
- Musopen: PD/CC0 or BY-SA per recording (unverified, 403).
- FMA: per track; only CC0, BY and BY-SA are OK.
- **Not OK:** Tabletop Audio (CC BY-NC-ND 4.0); YouTube Audio Library (YouTube videos only); FreePD (**closed 2025**; mirrors can't be checked).

**SFX**
- Kenney audio packs: CC0.
- Freesound: CC0 or CC BY; skip BY-NC.
- jsfxr (Unlicense) and ZzFX (MIT): generated at runtime.
- Sonniss GDC bundles: tier 3. No redistributing raw files, **no AI training**. Huge WAVs; convert before use.

**2D and icons**
- Kenney 2D: CC0.
- game-icons.net: **CC BY 3.0**. Credit "Icons made by {author}. Available on https://game-icons.net".
- Lucide (ISC, some icons MIT), Tabler (MIT), Heroicons (MIT): keep the notice.
- Twemoji graphics: CC BY 4.0. OpenMoji: **CC BY-SA 4.0**.

**Fonts**
- Google Fonts: OFL 1.1 or Apache 2.0 (Ubuntu: UFL). Bundle with the licence file; don't sell the font by itself.
- Kenney Fonts: CC0.

**Tools** (you own your output)
- Blender (GPL): "Any creation you make … is your sole property".
- LMMS (GPL-2.0): bundled sample licences unverified.
- Bosca Ceoil Blue: MIT.
- Material Maker: MIT.
- WFC (MIT): the output inherits the input tiles' licence.

**Tier 3 bans, in brief**
- **Pixabay:** no standalone redistribution; not in a trademark or logo; no commercial use of branded content; Content ID claims possible.
- **Mixkit:** no reselling unaltered items; no competing service.
- **Sketchfab/Fab Standard:** no stand-alone file access; no weapons/alcohol/tobacco/gambling promotion; Fab NoAI items not for generative-AI training.
- **Mixamo:** no raw-file redistribution or asset packs; no ML training.
- **BlenderKit Royalty Free:** no resale "as a 3D model or part of assetpack or game level".
- **Sonniss:** no redistribution; no AI training.

**AI generators: flag the risk.** Purely AI output may be uncopyrightable (US Copyright Office, Jan 2025). Tool terms rule:
- Meshy free plan: Meshy owns the output and gives it to you under CC BY 4.0 (credit Meshy).
- Suno free plan: non-commercial only, so not usable.
- Stable Audio Open: you own the output; free commercial use under USD 1M revenue.
- Log the tool, plan, prompt, date and a terms snapshot.

## Embedding rules for claude.ai artifacts
- The CSP allows **scripts** only from cdnjs, jsdelivr (npm), unpkg, cdn.tailwindcss.com and code.jquery.com. **Images, audio, models and fetches to other hosts are blocked.**
- So embed assets as `data:` or base64 (decode with `atob`, not `fetch`), or publish them as **supporting files** and load them with **relative URLs** (`models/x.glb`, no leading slash).
- Budgets: **16 MB per page** (data: URIs count; base64 adds about 33%), **15 MB per binary file**, **64 MB per publish** (255 files per publish).
- Three.js: use an **importmap** (`three` → `https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js`, `three/addons/` → `.../examples/jsm/`), because GLTFLoader imports the bare `'three'`.
- Models: **GLB + GLTFLoader**. Prefer **meshopt** (`three/addons/libs/meshopt_decoder.module.js`, a plain module with inlined WASM). Draco and KTX2 decoders fetch wasm, so publish them as supporting files and use `setDecoderPath('decoders/draco/')` / `setTranscoderPath(...)`.
- Textures: 512–1024 px JPG or WebP (PNG for alpha); KTX2 only for big scenes.
- Environment: 1K `.hdr` via `RGBELoader` (the r158 name; `HDRLoader` doesn't exist in 0.158), a JPG equirect, or procedural `RoomEnvironment`.
- Audio: **MP3 is safe everywhere.** OGG Vorbis and Opus work in Safari/iOS **only from 18.4** (earlier Safari lacked the Ogg container). AAC/M4A is unreliable in Firefox. Call `ctx.resume()` on the first gesture.
- Minimal patterns:
  - `loader.setMeshoptDecoder(MeshoptDecoder); await loader.loadAsync('models/tree.glb')`
  - embedded: `await loader.parseAsync(b64ToArrayBuffer(B64), '')`
  - `await ctx.decodeAudioData(b64ToArrayBuffer(B64))`, then play with `createBufferSource()`
  - `import { zzfx, ZZFX } from 'https://cdn.jsdelivr.net/npm/zzfx@1.3.2/ZzFX.js'; zzfx(...[,,537,.02,.02,.22,1,1.59,-6.98,4.97])`

## Attribution rule
- Every non-CC0 asset gets a **TASL** credit: **T**itle, **A**uthor (linked), **S**ource URL, **L**icence (linked), plus "modified: …" if you changed it.
  - Example: `"Oak Tree" by someartist (poly.pizza/u/someartist), CC BY 4.0 - recoloured`
- Put the credits on an in-game **Credits** screen reachable from the menu. Also put a credits block in the page source.
- MIT, ISC, OFL and Apache: keep the copyright and licence notice with the code or font.
- List CC0 packs as thanks. It is optional, but it helps later audits.

## Red flags
- "Free for personal use" or "non-commercial": not free.
- **NC** means no commercial use. **ND** means no changes, and trimming or looping counts. Examples: Tabletop Audio, many FMA tracks, Freesound BY-NC, DamagedHelmet.
- **SA** (BY-SA, OpenMoji, GPL art): derivatives must be relicensed the same way.
- **Ripped or re-uploaded** commercial game assets labelled "CC0" or "free". Uploads by someone other than the author. Get assets from the original site.
- **Licences change and sites close** (FreePD 2025, Sketchfab store 2024). Record the date, URL and a snapshot of the licence page.
- **Trademarks** in "free" models (real cars, guns, logos, famous characters). CC0 covers copyright only, not trademarks. Use generic designs.
- "Royalty-free" is not the same as free or CC0. **Platform-bound** licences (YouTube Audio Library) don't cover games.
- Web games expose every file, so avoid licences that ban "stand-alone file" access (Sketchfab/Fab Standard).

## Single-file builds (how the shelf games are built)
- The games inline the **UMD** `three.min.js` (r158) into one HTML file with no importmap. The UMD build has **no GLTFLoader or RGBELoader**. To load models, either:
  - port the loader's `examples/jsm` source into a plain script that attaches to `THREE.*` (strip imports and exports, as was done for RoomEnvironment and the post-processing passes), or
  - switch that game to the module build with an importmap (see above).
- Embed small assets (under about 1–2 MB total) as base64 in the build (`build.py` reads the file and writes `const B64_X="..."`). Publish bigger ones as supporting files next to the page and fetch them with relative URLs.
- The jsdom tests have no WebGL, audio decoding or network, so guard asset loading and keep the procedural fallback working.
- Add every asset to the game's `ASSETS.md` and its credits to the in-game Rules/Credits popup.
