# Free assets for browser games

Verified: **2026-09-30**. The licence claims below were checked against each source's own licence, FAQ or LICENSE file on that date, unless the entry is marked otherwise.

- **unverified** means the source's own page could not be fetched (HTTP 403, 502 or a bot wall). The claim then comes from a search-engine snippet of that page or from a third party. Check it yourself before you rely on it.
- This is not legal advice. Licences change, so re-check a page before you ship and save a snapshot (see "Red flags" and the ASSETS.md template).

"Completely free" here means you can use it in a commercial game without paying. Sources are ranked in three tiers:

| Tier | Meaning | Typical licences |
|---|---|---|
| **1** | Public domain. No attribution needed, no conditions. | CC0 1.0, Unlicense, public domain |
| **2** | Permissive, but you must credit the author and/or keep the licence notice. | CC BY 3.0/4.0, OGA-BY, SIL OFL 1.1, MIT, ISC, Apache 2.0 |
| **2-SA** | Like tier 2, but ShareAlike: things you derive from it must use the same licence. That is awkward for closed games. | CC BY-SA, GPL (for art) |
| **3** | A custom "royalty-free" licence. It is free to use, but it has specific bans. | Pixabay, Mixkit, Sketchfab/Fab Standard, Mixamo, Sonniss, BlendKit RF, ShareTextures |
| **Not free** | No commercial use (NC), no changes (ND), or personal use only. | CC BY-NC, CC BY-ND, CC BY-NC-ND |

---

## 1. Decision order (use this first)

1. **Generate it**: Web Audio or ZzFX sounds, ZzFXM or BeepBox music, Three.js procedural geometry, canvas or shader textures. You own the result and there are no files to host.
2. **CC0 packs**: Kenney, Quaternius, KayKit, Poly Haven, ambientCG. No credit is needed, but log the source anyway.
3. **CC BY with credits**: game-icons.net, Kevin MacLeod, Poly Pizza CC BY models, Freesound CC BY. Add each one to the Credits screen.
4. **Avoid tier 3 unless you must.** If you do use one, read its "forbidden" list below. Never use NC, ND or "personal use" assets in anything that might become commercial.

---

## 2. 3D models, textures and HDRIs

| Source | What it has | Licence | Attribution? | Commercial OK? | Licence URL | Notes |
|---|---|---|---|---|---|---|
| **Kenney** | Low-poly 3D kits, 2D, UI, audio, fonts | CC0 (tier 1) | No. Optional credit "Kenney". | Yes | https://kenney.nl/support (each asset page also says "License: Creative Commons CC0") | "Do not use our logo, as it is reserved for official projects by our studio." Asset pages ship GLB/FBX/OBJ. |
| **Quaternius** | Low-poly characters (rigged and animated), nature, buildings, weapons, vehicles | CC0 (tier 1) | No | Yes | https://quaternius.com/faq.html | FAQ: "All models are under the CC0 License", with modification allowed. The files use texture atlases, so they are cheap to render. |
| **KayKit (Kay Lousberg)** | Low-poly dungeon, city, space, character and animation packs (FBX/GLTF/OBJ) | CC0 (tier 1) | No | Yes | https://kaylousberg.itch.io/kaykit-dungeon-pack (the licence text is on each itch.io pack page) | Page text: "Free for personal and commercial use, no attribution required. (CC0 Licensed)". It adds a request, not a licence term: "please don't resell unmodified copies or claim them as your own." kaylousberg.com showed a bot wall, so the itch.io page was checked instead. Some packs have paid "Extra" tiers; check which tier you downloaded. |
| **Poly Haven** | HDRIs, PBR textures, 3D models | CC0 (tier 1) | No | Yes, including redistribution | https://polyhaven.com/license | "You can redistribute them … or even in a product you sell." The site's logos and renders are not CC0. The public API has separate API Terms. |
| **ambientCG** | PBR materials, HDRIs, some models | CC0 (tier 1) | No | Yes | https://docs.ambientcg.com/license/ | CC0 covers the asset files and the preview renders. "You can include the raw files in your project." |
| **ShareTextures** | PBR textures, some models | "Custom CC0" with restrictions (really **tier 3**) | No | Yes | https://www.sharetextures.com/p/license | Forbids redistributing assets on other websites, in plugins or in collections without written permission. Forbids automated downloads and hotlinking. "CC0 only applies to assets downloaded directly from our site." |
| **3DTextures.me** | PBR textures | CC0 (tier 1) | No | Yes | https://3dtextures.me/about/ | "All textures on this site are licensed as CC0." |
| **Poly Pizza** | 10,000+ low-poly models (includes the old Google Poly archive) | Per model: CC0 (tier 1) or CC BY 4.0 (tier 2) | CC BY models: yes | Yes | https://poly.pizza/faq (**unverified**: the site returns 403 to fetchers) | According to search snippets, each model is labelled CC0 or CC BY, and you can filter by licence. The per-model "credits" pages give the attribution text. Check the label on each model. |
| **Sketchfab (free downloads)** | Very large, mixed-quality library | Per model: CC0, CC BY, CC BY-SA, CC BY-ND, CC BY-NC | CC BY*: yes, credit the author **and Sketchfab** | Only CC0, CC BY and CC BY-SA | https://sketchfab.com/blogs/community/refine-downloadable-model-searches-with-new-license-filters/ and https://sketchfab.com/developers/download-api/guidelines | Use the Licenses filter (CC0, or CC BY). Download-API guidelines: "the Creative Commons license and attribution must follow the asset everywhere it is used." The store closed on 2024-10-22 and sales moved to Fab. Free downloads remain for now, but Sketchfab promised "plenty of notice before" free download support ends (https://sketchfab.com/blogs/community/sketchfab-update-what-you-need-to-know-now-that-fabs-live/). Many free models show real vehicles, weapons or characters; see Red flags. |
| **Sketchfab/Fab "Standard" licence** | Paid store assets, and free Fab assets under Standard | Custom royalty-free (tier 3) | Not required | Yes, inside a finished project | https://sketchfab.com/licenses ; Fab: https://www.fab.com/eula (**403 to fetchers**, terms from search snippet) | **Forbids:** using the asset "in a way that allows others to use or access the 3D asset as a stand-alone file" (no sub-licensing or resale); derivatives "too similar" to the asset; any use infringing IP, trademark or publicity rights; promoting "alcoholic beverages, tobacco, gambling, weapons or explosives"; claiming you created it. Fab Standard adds: content tagged **NoAI** may not be used in datasets for, the development of, or as training input to generative AI. **Browser-game catch:** any GLB you serve can be downloaded from the page, which may count as "access … as a stand-alone file". Avoid it for web games. "Editorial" assets allow no commercial use at all. |
| **OpenGameArt 3D** | Mixed 2D, 3D and audio | Per asset: CC0, CC BY 3.0/4.0, CC BY-SA 3.0/4.0, OGA-BY 3.0/4.0, GPL 2.0/3.0 | Everything except CC0 | Yes (all of these allow it) | https://opengameart.org/content/faq | CC0-only search: https://opengameart.org/art-search-advanced?field_art_licenses_tid%5B%5D=4 (tid 4 = CC0, checked). OGA-BY is CC BY without the anti-DRM clause. CC BY-SA and GPL are ShareAlike. The FAQ says CC BY and BY-SA may conflict with DRM platforms (iOS, consoles). |
| **BlendKit (formerly BlenderKit), free plan** | Models, materials, HDRIs inside Blender | Two licences: **Royalty Free** (tier 3) or **CC0** (tier 1) | No for both | Yes | https://www.blendkit.com/docs/licenses/ | Royalty Free "allows commercial use without mentioning the author, but doesn't allow for re-sale of the asset in the same form (eg. a 3D model sold as a 3D model or part of assetpack or game level on a marketplace)." Which assets are in the free plan was not verified. It needs an account and the Blender add-on. Prefer the assets marked CC0. |
| **Khronos glTF Sample Assets** | Reference glTF/GLB test and showcase models | **Per model.** Counted on 2026-09-30: 138 CC0 credits, 105 CC BY 4.0, plus some that are **CC BY-NC 4.0, the SCEA Shared Source licence, a Cryengine Limited Licence, the Poser EULA, the Adobe Stock licence, and trademarked logos** | Depends on the model | Only for the CC0 and CC BY models | https://github.com/KhronosGroup/glTF-Sample-Assets (see `Models/<Name>/README.md` → "Legal") | **Surprise:** the classic **DamagedHelmet** includes a CC BY-NC 4.0 original, so it is not OK commercially. **Sponza** uses a Cryengine licence and **Duck** uses SCEA. FlightHelmet is CC0. Fox is CC0 plus CC BY. CesiumMan carries a Cesium trademark. Read each README. |
| **Mixamo (Adobe)** | Auto-rigging, characters, mocap animations | Custom royalty-free (tier 3). Needs an Adobe ID. | No | Yes, in games and films | https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html (**403 to fetchers**, terms from search snippets of that FAQ) | **Forbids:** redistributing characters or animations as standalone assets; "blueprints, templates, or asset packages for video game engines which redistribute character or animation raw files as the product"; selling on 3D stock or asset stores; **training machine-learning models**; bulk downloading for ML. Shipping them inside a game is fine. |
| **Smithsonian Open Access 3D** | Scanned museum objects | CC0 for items marked CC0 | No | Yes | https://www.si.edu/openaccess/faq (**unverified**: 403) | Check the CC0 badge on each item. |

---

## 3. Music

| Source | What it has | Licence | Attribution? | Commercial OK? | Licence URL | Notes |
|---|---|---|---|---|---|---|
| **Kenney audio packs** | Music Jingles (85 files), RPG, UI, Casino, Sci-fi, Impact, Voiceover packs | CC0 (tier 1) | No | Yes | https://kenney.nl/assets/music-jingles (page says "License: Creative Commons CC0") | Jingles and stingers, not long loops. |
| **OpenGameArt music (CC0 filter)** | Loops, chiptune, orchestral | CC0 under the filter; otherwise CC BY, BY-SA, OGA-BY or GPL | CC0: no | Yes | https://opengameart.org/content/faq | Filter by Music plus licence CC0 (tid 4). Some uploads are re-uploads by people other than the author; see Red flags. |
| **Freesound (CC0 filter)** | Mostly SFX and ambience, some music loops | Per sound: **CC0**, **CC BY** (3.0/4.0), **CC BY-NC**, or legacy **Sampling+** | CC BY: yes | CC0 and CC BY: yes. **NC: no.** | https://freesound.org/help/faq/ | Filter by licence "Creative Commons 0". Freesound's attribution format: `"sound1" by user1 (http://freesound.org/s/soundID/) licensed under CCBY 4.0`. Since **July 2026** uploaders can set extra "Generative AI preferences". These only matter for AI training, not for using a sound in a game. |
| **Incompetech / Kevin MacLeod** | About 2,000 tracks, every genre | **CC BY 4.0** (tier 2), or a paid Standard licence for no-credit use | **Yes** | Yes | https://incompetech.com/music/royalty-free/licenses/ and https://incompetech.com/music/royalty-free/faq.html | Required credit: `"Title" Kevin MacLeod (incompetech.com) Licensed under Creative Commons: By Attribution 4.0 https://creativecommons.org/licenses/by/4.0/`. Very recognisable music. |
| **Pixabay Music and SFX** | Large stock music and SFX library | Pixabay Content Licence (tier 3) | No | Yes | https://pixabay.com/service/license-summary/ and https://pixabay.com/service/terms/ (**both return 403 to curl**; WebFetch read them) | **Forbids:** selling or distributing content "on a Standalone basis" (unchanged, including as NFTs or files); using it "as part of a trade-mark, design-mark, trade-name, business name or service mark" (no logos or sound logos); commercial use of content that shows trademarks or brands, especially on merchandise; misleading use or implied endorsement. **Content ID:** some contributors register tracks with YouTube Content ID, so a trailer can get claimed. Pixabay gives a licence certificate for disputes (https://pixabay.com/blog/posts/how-to-clear-a-youtube-content-id-claim-with-a-pix-190/). AI training by licensees: **not stated on the summary page (unverified)**. |
| **Mixkit (Envato)** | Free stock music and SFX | Mixkit "Stock Music Free" / "Sound Effects Free" licences (tier 3) | No ("appreciated but not required") | Yes. The SFX page lists video games among allowed uses (search snippet). | https://mixkit.co/license/ and https://mixkit.co/terms/ | The licence text sits inside a JavaScript modal the fetcher could not read, so it is **partly unverified**. Terms forbid: selling copies "without first altering them by applying human skill and effort, and incorporating other elements"; making items available to third parties; using items "to build a similar or competitive product or service". |
| **Free Music Archive** | Indie music, per-track CC licences | Per track: CC BY, BY-SA, BY-ND, BY-NC, BY-NC-SA, BY-NC-ND, CC0 and others | Almost always | **Only CC0, CC BY and CC BY-SA** | https://freemusicarchive.org/License_Guide | FMA "cannot license original work to you". The artist sets the licence. Many tracks are NC or ND. The guide notes that syncing music to picture counts as a derivative, which ND forbids. |
| **FreePD** | Was public-domain music | **Closed** | n/a | n/a | https://freepd.com/ | **Surprise:** the site now says "FreePD.com is now permanently closed", 2008–2025. Copies of FreePD tracks on other sites cannot be checked against the original. |
| **Tabletop Audio** | 10-minute RPG ambiences and music | **CC BY-NC-ND 4.0** | Yes | **No** | https://tabletopaudio.com/about.html | **Not free for games.** "All of the 10 minute ambiences on this site are licensed under a Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License". SoundPad sounds are excluded even from that. Commercial use needs a separate deal. |
| **Musopen** | Public-domain classical recordings and scores | Per recording: public domain / CC0, or CC BY-SA | CC0: no. BY-SA: yes. | Yes | https://musopen.org/faq/ (**unverified**: 403) | Search snippets say a free account can download 5 files a day. The composition may be public domain while the *recording* is not. Use only recordings marked PD or CC0. |
| **YouTube Audio Library** | Music and SFX for YouTube videos | YouTube's own licence, or CC BY for some tracks | CC tracks: yes | **For YouTube videos only** | https://support.google.com/youtube/answer/3376882 | The help page covers use in YouTube videos only ("won't be claimed … through the Content ID system"). Use outside YouTube (games, websites) is **not granted**. Do not use it in games except CC BY tracks, and then verify each track's licence. |
| **Wikimedia Commons** | Public-domain and CC recordings | Per file | Per file | Per file | https://commons.wikimedia.org/wiki/Commons:Free_media_resources/Music | Only files marked PD or CC0 are tier 1. |

---

## 4. Sound effects

| Source | What it has | Licence | Attribution? | Commercial OK? | Licence URL | Notes |
|---|---|---|---|---|---|---|
| **Kenney** | Interface (100 files), Impact, RPG, Sci-fi, Digital, UI, Casino, Voiceover | CC0 (tier 1) | No | Yes | https://kenney.nl/assets/interface-sounds | Best first stop for UI clicks and hits. |
| **Freesound** | Huge library of field recordings and Foley | CC0 / CC BY / CC BY-NC | CC BY: yes | Not NC | https://freesound.org/help/faq/ | Filter to CC0. Mixing rules: a CC BY sound cannot be re-released as CC0. |
| **Sonniss #GameAudioGDC bundles** | Professional WAV libraries; 2026 bundle about 7.5 GB; archive of 200+ GB | Custom royalty-free (tier 3) | No | Yes | https://sonniss.com/gdc-bundle-license/ | **Forbids:** supplying the sounds "as sound effects to any other person" (no redistributing raw files); selling "any of the sound effects as they come"; modifying them "with intent to claim authorship"; **training AI** ("expressly prohibited"). You may share them inside your own team. Files are huge WAVs; convert them to short MP3 or OGG clips. |
| **jsfxr / sfxr.me** | Browser generator for retro SFX | Code: **Unlicense** (public domain) | No | Yes | https://github.com/chr15m/jsfxr (UNLICENSE file) | The licence covers the code. The README makes no explicit statement about who owns the sounds (**unverified**). A sound you make from your own parameters is generally yours. `sfxr.toWave(sound).dataURI` gives a WAV data URI. |
| **ZzFX** | 1 KB JS sound synth | **MIT** | Keep the MIT notice in the code | Yes | https://github.com/KilledByAPixel/ZzFX/blob/master/LICENSE | The sound is generated at runtime from your parameter array, so there is no third-party audio file. No explicit output clause (**unverified**), but the only input is numbers you chose. |
| **Mixkit / Pixabay SFX** | Stock SFX | Tier 3 (see Music) | No | Yes | see above | Same bans as their music. |

---

## 5. 2D sprites, icons and emoji

| Source | What it has | Licence | Attribution? | Commercial OK? | Licence URL | Notes |
|---|---|---|---|---|---|---|
| **Kenney 2D** | Sprites, tiles, UI packs, pixel art, board-game pieces | CC0 (tier 1) | No | Yes | https://kenney.nl/support | |
| **OpenGameArt 2D** | Huge pixel-art and tile library | Per asset (see 3D row) | Except CC0 | Yes | https://opengameart.org/content/faq | Use the CC0 filter. |
| **game-icons.net** | 4,000+ monochrome SVG game icons | **CC BY 3.0** (tier 2) | **Yes** | Yes | https://game-icons.net/about.html | Suggested credit: "Icons made by {author}. Available on https://game-icons.net". Credit each icon's author (Lorc, Delapouite and others). |
| **Lucide** | UI icons (SVG) | **ISC**; icons derived from Feather are **MIT** | Keep the licence notice | Yes | https://github.com/lucide-icons/lucide/blob/main/LICENSE | Both only require the copyright notice in copies, for example in a LICENSES file or the Credits. |
| **Tabler Icons** | 5,000+ UI icons | **MIT** | Keep the notice | Yes | https://github.com/tabler/tabler-icons/blob/main/LICENSE | |
| **Heroicons** | UI icons | **MIT** | Keep the notice | Yes | https://github.com/tailwindlabs/heroicons/blob/master/LICENSE | |
| **Twemoji (jdecked fork)** | Emoji SVG and PNG | Graphics **CC BY 4.0**; code MIT | **Yes** | Yes | https://github.com/jdecked/twemoji (LICENSE-GRAPHICS) | README: the project "will accept a mention in a project README or an 'About' section or footer". |
| **OpenMoji** | Emoji and extra icons | **CC BY-SA 4.0** (tier 2-SA) | **Yes** | Yes | https://openmoji.org/faq/ | **ShareAlike:** if you modify the emoji, your changes must be CC BY-SA 4.0. Suggested credit: "All emojis designed by OpenMoji – the open-source emoji and icon project. License: CC BY-SA 4.0". |
| **Kenney Fonts** | 11 pixel and display fonts | CC0 | No | Yes | https://kenney.nl/assets/kenney-fonts | |

---

## 6. Fonts

| Source | What it has | Licence | Attribution? | Commercial OK? | Licence URL | Notes |
|---|---|---|---|---|---|---|
| **Google Fonts** | 1,800+ families | Mostly **SIL OFL 1.1**; some **Apache 2.0**; Ubuntu family **UFL** (tier 2) | Keep the licence file with the font. No on-screen credit needed. | Yes, including self-hosting, embedding and bundling in games | https://fonts.google.com/faq and each font's "License" tab | OFL: you may bundle, embed and modify the font, but you may not sell the font by itself. A modified font must drop its Reserved Font Name. In an artifact, embed a WOFF2 subset as a data URI or a supporting file. Google Fonts *stylesheets* are allowed by the artifact CSP; a self-contained file is still safer. |

---

## 7. Generators and procedural tools

| Tool | Tool licence | Is the output yours? | Source | Notes |
|---|---|---|---|---|
| **Web Audio API** (oscillators, noise, filters) | Browser API | Yes. You write the synthesis code. | https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API | No files at all. Best for beeps, whooshes and ambience. |
| **ZzFX** | MIT (2019 Frank Force) | Yes in practice (your parameters). No explicit clause. | https://github.com/KilledByAPixel/ZzFX | Load from `https://cdn.jsdelivr.net/npm/zzfx@1.3.2/ZzFX.js` (checked; it exports `zzfx`, `ZZFX` and `ZZFXSound`). |
| **ZzFXM** | MIT (2020 Keith Clark) | The song data you write is yours. Its song format has `author` and `license` fields for your own licence. | https://github.com/keithclark/ZzFXM | Tiny tracker music renderer that uses ZzFX instruments. The demo songs in the repo belong to their authors; check their `license` field. |
| **jsfxr** | Unlicense | Yes in practice | https://github.com/chr15m/jsfxr | Presets: pickupCoin, laserShoot, explosion, powerUp, hitHurt, jump, blipSelect and others. |
| **BeepBox** | MIT (2012-2024 John Nesky) | Yes. The FAQ says BeepBox does not claim ownership of songs made with it (seen in a search snippet; beepbox.co/faq.html returned 502, so **unverified**). | https://github.com/johnnesky/beepbox/blob/main/LICENSE.md | Export WAV or MP3, or keep the song URL. |
| **Bosca Ceoil / Bosca Ceoil Blue** | Blue: **MIT** (2025 Yuri Sizov). Original: licence file not found (**unverified**). | Yours (no claim found) | https://github.com/YuriSizov/boscaceoil-blue | Simple tracker; exports WAV. |
| **LMMS** | GPL-2.0 (software) | Your compositions are yours. The GPL covers the program, not your songs. The licences of bundled samples and presets were **not verified** (the FAQ page moved to docs.lmms.io and has no licence section). | https://github.com/LMMS/lmms (LICENSE.txt) | Prefer your own samples or CC0 ones. |
| **Blender** | GPL-3.0-or-later | **Yes.** Blender FAQ: "Any creation you make as an artist with Blender is your sole property"; .blend files are "program output, and the sole copyright of the user". | https://www.blender.org/support/faq/ and https://www.blender.org/about/license/ | Export GLB with the glTF exporter (it can apply Draco). Only Blender itself and Python add-ons you distribute are bound by the GPL. |
| **Three.js procedural geometry** | MIT (three.js authors) | Yes (your code) | https://github.com/mrdoob/three.js/blob/dev/LICENSE | Primitives, `ExtrudeGeometry`, `LatheGeometry`, `CanvasTexture` and noise shaders need no asset files. |
| **Material Maker** | MIT | Yours (no claim found; **unverified** explicit clause) | https://github.com/RodZill4/material-maker | Node-based procedural PBR textures; export PNG maps. |
| **Wave Function Collapse** (mxgmn) | MIT (2016 Maxim Gumin) | The algorithm output inherits the **licence of the input tiles or sample**. | https://github.com/mxgmn/WaveFunctionCollapse | Feed it CC0 tiles (Kenney) or your own. The repo's sample bitmaps are not all the author's own work. |

### AI generators (risky: read this)

- **Copyright status is uncertain.** The US Copyright Office (Part 2 report, 2025-01-29) says prompts alone do not give enough human control for copyright. Purely AI-generated output may therefore be **uncopyrightable**: anyone may copy it, and you may not be able to stop them. Human edits, selection and arrangement can be protected. Report: https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf . Other countries differ.
- **The tool's terms decide what you may do.** Two examples, checked 2026-09-30:
  - **Meshy (3D) free plan:** "Meshy owns all right, title, and interest … in and to the Customer Output" and gives free users the output under **CC BY 4.0**, "as long as the free plan customer provides appropriate credit to Meshy". So commercial use is allowed with credit, but Meshy owns the output and your free-plan outputs are not private. Paid plans: you own the output. Terms last updated 2026-09-19: https://www.meshy.ai/terms-of-use
  - **Suno (music) free/Basic plan:** outputs are for "lawful, personal and non-commercial purposes" only, so **not usable in a commercial game**. Paid plans assign ownership to you. https://suno.com/terms
  - **Stable Audio Open 1.0** (open weights, runs locally): Stability AI Community Licence. "You own any outputs … to the extent permitted by applicable law". Commercial use is free for organisations under USD 1M annual revenue. It was trained on CC0, CC BY and Sampling+ audio from Freesound and FMA. https://stability.ai/community-license-agreement and https://huggingface.co/stabilityai/stable-audio-open-1.0
- Other risks: output may closely copy training data (melodies, logos, characters); terms change often; some stores (for example Steam) ask you to disclose AI use. Log the tool, version, plan, prompt, date and a copy of the terms in ASSETS.md.

---

## 8. Red flags

1. **"Free for personal use"** or "non-commercial": this is not free for a game you might ever sell, add ads to, or put on a monetised portal. Common on font and "free 3D model" sites.
2. **NC or ND licences** (CC BY-NC, BY-ND, BY-NC-SA, BY-NC-ND): NC bans commercial use. ND bans changes, and trimming or looping a track is arguably a change. Examples found: **Tabletop Audio (BY-NC-ND)**, many FMA tracks, Freesound BY-NC sounds, **Khronos DamagedHelmet (includes BY-NC)**, Meshy community non-3D content (BY-NC).
3. **ShareAlike** (BY-SA, GPL art, OpenMoji): allowed commercially, but derivatives must use the same licence. Keep SA assets unmodified and list them separately.
4. **Ripped or re-uploaded game assets**: sprites or models from commercial games (Nintendo, Pokémon, Mario sprites, Sonic, and so on) re-uploaded to asset sites or Sketchfab with a "CC0" or "free" label. The uploader cannot license what they do not own. Also watch for uploads by people who are not the author: OpenGameArt accepts them, and ShareTextures warns that "CC0 only applies to assets downloaded directly from our site."
5. **Licences change and sites close.** FreePD closed in 2025. The Sketchfab store closed in 2024 and free downloads may end. Freesound added AI preferences in 2026. Kenney, Poly Haven and others could change terms for future uploads. **Record the date, URL, licence and a snapshot** (save the licence page as PDF or HTML, or an archive.org link) in ASSETS.md when you download.
6. **Trademarks inside "free" models**: real cars (Ferrari, Porsche), real guns (Glock, AK brand marks), logos, famous characters. A CC0 licence covers the *model's copyright* only, not the trademark, trade dress or character rights. Sketchfab's own licence says you "may not use the 3D asset in a way that violates anyone's intellectual property rights (e.g., copyrights, trademarks…)". Use generic designs.
7. **"Royalty-free" does not mean free.** It means no per-use royalties, and may still mean a one-time fee or a restrictive custom licence. Read what the licence forbids.
8. **Platform-bound licences**: YouTube Audio Library tracks are for YouTube videos, not games.
9. **Browser games expose files.** Every GLB or MP3 you ship can be downloaded. Licences that forbid access "as a stand-alone file" (Sketchfab/Fab Standard) or redistribution of raw files are shaky for web delivery. CC0 and CC BY have no such problem.

---

## 9. Attribution

### TASL: Title, Author, Source, Licence

For each CC BY asset give:
- **T**itle of the work (linked to its page if possible)
- **A**uthor's name or username (linked to their profile)
- **S**ource URL
- **L**icence name, linked to the licence deed
- and whether you changed it ("modified: recoloured, cropped, trimmed")

Examples:

```
"Oak Tree" by someartist (https://poly.pizza/u/someartist), CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/) - scaled and recoloured
"Sneaky Snitch" Kevin MacLeod (incompetech.com) Licensed under Creative Commons: By Attribution 4.0 https://creativecommons.org/licenses/by/4.0/
"crossed-swords" icon by Lorc, https://game-icons.net, CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
"door_close.wav" by user1 (https://freesound.org/s/12345/), CC BY 4.0
```

CC's guide: https://wiki.creativecommons.org/wiki/Best_practices_for_attribution . Put credits where players can reach them: a Credits screen, reachable from the main menu. For web games, also put a `CREDITS` block in the page source or a `credits.txt` supporting file.

### In-game Credits screen template

```
CREDITS

Game design & code ........ <Your name>

3D MODELS
  Kenney (kenney.nl) ........................ CC0
  Quaternius (quaternius.com) ............... CC0
  "Oak Tree" by someartist - poly.pizza/m/xxxx - CC BY 4.0 - recoloured

TEXTURES & LIGHTING
  Poly Haven (polyhaven.com) - "<HDRI name>" - CC0
  ambientCG (ambientcg.com) - "PavingStones036" - CC0

MUSIC
  "<Title>" Kevin MacLeod (incompetech.com)
  Licensed under Creative Commons: By Attribution 4.0
  https://creativecommons.org/licenses/by/4.0/

SOUND EFFECTS
  Kenney Interface Sounds - CC0
  "<sound>" by <user> - freesound.org/s/<id>/ - CC BY 4.0
  Additional sounds generated with ZzFX (MIT, Frank Force)

ICONS & FONTS
  Icons by Lorc and Delapouite - game-icons.net - CC BY 3.0
  <Font name> - Google Fonts - SIL Open Font License 1.1

LIBRARIES
  three.js - MIT - (c) 2010-2026 three.js authors
  ZzFX - MIT - (c) 2019 Frank Force

CC0 assets need no credit; they are listed as thanks.
Full licence texts: see LICENSES / credits.txt
```

For MIT, ISC, OFL and Apache code or fonts, the requirement is to **include the copyright and licence notice** with the copy. In a single HTML file, a comment block at the top of the embedded library, plus the Credits line, is enough.

---

## 10. ASSETS.md licence log (template)

Keep this file next to the game source. Add a row at download time, not at release time.

```markdown
# ASSETS.md - licence log for <game name>

Rules: tier 1 = CC0/PD, tier 2 = BY/OFL/MIT, tier 2-SA = ShareAlike, tier 3 = custom royalty-free.
No NC / ND / personal-use assets. Snapshot = saved copy of the licence page (PDF/HTML) or archive.org link.

| File in game | Asset / pack | Source URL | Author | Licence (+ version) | Tier | Credit needed? | Downloaded | Licence URL | Snapshot | Changes made |
|---|---|---|---|---|---|---|---|---|---|---|
| models/tree.glb | Nature Kit / tree_oak | https://kenney.nl/assets/nature-kit | Kenney | CC0 1.0 | 1 | No | 2026-09-30 | https://kenney.nl/support | snapshots/kenney-support-2026-09-30.pdf | Draco-compressed, scaled |
| audio/theme.mp3 | "Title" | https://incompetech.com/... | Kevin MacLeod | CC BY 4.0 | 2 | Yes (text in Credits) | 2026-09-30 | https://incompetech.com/music/royalty-free/licenses/ | snapshots/incompetech-2026-09-30.html | Trimmed to 60 s loop, 96 kbps |
| (runtime) | coin SFX | generated | me | own work (ZzFX MIT) | 1 | No | 2026-09-30 | https://github.com/KilledByAPixel/ZzFX | - | params: [,,1675,...] |
| textures/ground.jpg | "Ground054" | https://ambientcg.com/a/Ground054 | ambientCG | CC0 1.0 | 1 | No | 2026-09-30 | https://docs.ambientcg.com/license/ | - | 1K resize |

## AI-generated assets
| File | Tool + version | Plan | Prompt | Date | Terms URL + snapshot | Human edits |
|---|---|---|---|---|---|---|

## Licence changes seen
| Date | Source | What changed | Action |
|---|---|---|---|
| 2025 | FreePD | Site closed | Do not use FreePD mirrors |
```

---

## 11. Hosting assets in claude.ai artifacts

### Rules

- The artifact page's CSP only lets **scripts** load from cdnjs.cloudflare.com, cdn.jsdelivr.net/npm, unpkg.com, cdn.tailwindcss.com and code.jquery.com (stylesheets from Google Fonts). **Images, audio, models and `fetch()` calls to other hosts are blocked**, and that includes the raw GitHub or Poly Haven URLs of an asset.
- So an asset must either be:
  1. **embedded** in the page as a `data:` URI or base64 string, or
  2. **published as the artifact's own supporting file** (the `files` map when publishing) and loaded with a **relative URL** such as `models/tree.glb` (no leading slash).
- **Size budgets**: **16 MB per page** (embedded data: URIs count towards it), **15 MB per binary supporting file**, **64 MB per publish** (at most 255 files per publish; a version may hold up to 511 files and 256 MB, uploaded over several publishes). Base64 adds about 33%, so a 16 MB page holds about 11–12 MB of raw embedded data at most. Keep embedded assets small; put big ones in supporting files.
- **Decoders:** Draco and KTX2/Basis decoders fetch `.wasm` and `.js` files at runtime. Whether those fetches may go to jsdelivr under the artifact CSP is **unverified**; fetches to other hosts are documented as blocked. The safe route is to publish the decoder files as supporting files and point the loader at a relative path. The **meshopt** decoder is a plain ES module with its WASM inlined, so it loads through a normal `import` from jsdelivr. That makes meshopt the easiest compression to use in artifacts.
- Browsers block audio until a user gesture. Call `audioContext.resume()` on the first click or key press.

### Formats that load well in Three.js

| Asset | Use | Why / notes |
|---|---|---|
| Models | **GLB** (binary glTF) with `GLTFLoader` | One file holding meshes, materials, textures and animations; PBR matches Three.js. Convert FBX or OBJ in Blender. |
| Mesh compression | **meshopt** (`EXT_meshopt_compression`, via `gltfpack` or `gltf-transform meshopt`) or **Draco** (`KHR_draco_mesh_compression`) | Both cut geometry 5–10x. Meshopt also compresses animation and decodes faster; see the decoder note above. |
| Textures | **KTX2 / Basis Universal** (`KTX2Loader`) for big scenes; **JPG** (colour) and **PNG** (alpha, normals) for small games; WebP is supported too | KTX2 stays compressed on the GPU and saves VRAM, but needs the transcoder. For a small game, 512–1024 px JPG/WebP is simplest. |
| Environment lighting | **.hdr** (`RGBELoader` in r158) or **.exr** (`EXRLoader`); or a **tone-mapped JPG equirect** | Poly Haven 1K HDR files are about 1.5 MB. A JPG is 10x smaller but has no high dynamic range (weaker reflections and highlights). For stylised games, use a 1K HDR or just `RoomEnvironment` (procedural, zero bytes). In newer Three.js the loader was renamed `HDRLoader`; that path does **not** exist in 0.158 (checked). |
| Tooling | `gltf-transform optimize in.glb out.glb --compress meshopt --texture-compress webp` | https://gltf-transform.dev (CLI flags from memory: **unverified**, see `gltf-transform --help`). |

Paths checked on jsdelivr for **three@0.158.0** (HTTP 200): `build/three.module.js`, `examples/jsm/loaders/GLTFLoader.js`, `DRACOLoader.js`, `KTX2Loader.js`, `RGBELoader.js`, `EXRLoader.js`, `examples/jsm/libs/meshopt_decoder.module.js`, `examples/jsm/libs/draco/gltf/draco_decoder.wasm`, `examples/jsm/libs/basis/basis_transcoder.wasm`. `GLTFLoader.js` imports the bare specifier `'three'`, so you **need an importmap**, or a bundled `+esm` build.

### Audio formats (from caniuse data, fetched 2026-09-30)

| Format | Chrome / Edge | Firefox | Safari macOS | Safari iOS | Verdict |
|---|---|---|---|---|---|
| **MP3** | Yes | Yes (since 22) | Yes | Yes | **Safest single format.** |
| **Ogg Vorbis (.ogg)** | Yes | Yes | **Only 18.4+**. 14.1–18.3 had the Vorbis codec but **not the Ogg container**. | **Only 18.4+** | Smaller than MP3 at equal quality, but breaks on older Apple devices. |
| **Opus** | Yes | Yes | WebM container from 17.4/17.5; full support needs macOS 15.4 | 18.4+ | Best compression; same Safari caveat. |
| **AAC / M4A** | Yes | Partial: MP4 container only, and only if the OS has the codec | Yes | Yes | Fine on Apple, less reliable on Linux Firefox. |
| **WAV** | Yes | Yes | Yes | Yes | Uncompressed and huge. Only for tiny clips, or generated at runtime. |

Rule: **ship MP3** (mono, 64–96 kbps for SFX and 96–128 kbps for music loops), or OGG with an MP3 fallback. Better still, generate SFX with ZzFX and ship no files. Sources: https://caniuse.com/ogg-vorbis , https://caniuse.com/opus , https://caniuse.com/mp3 , https://caniuse.com/aac

### Snippet 1: load a GLB from a relative artifact file (importmap + jsdelivr three@0.158)

```html
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/"
  }
}
</script>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
// Optional Draco: publish the decoder files as supporting files, then:
// import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
// const draco = new DRACOLoader().setDecoderPath('decoders/draco/'); // relative artifact path

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
camera.position.set(2, 2, 4);
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2));

const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);
// loader.setDRACOLoader(draco);

// 'models/tree.glb' is published with the artifact as a supporting file
const gltf = await loader.loadAsync('models/tree.glb');
scene.add(gltf.scene);
camera.lookAt(0, 0.5, 0);
renderer.setAnimationLoop(() => renderer.render(scene, camera));
</script>
```

The same model embedded in the page as base64 (for small models):

```js
const TREE_GLB_B64 = 'Z2xURgIAAAA...';            // base64 of the .glb file
function b64ToArrayBuffer(b64) {
  const bin = atob(b64), u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return u8.buffer;
}
const gltf = await loader.parseAsync(b64ToArrayBuffer(TREE_GLB_B64), '');
scene.add(gltf.scene);
```

To make the base64: `base64 -w0 tree.glb > tree.b64` (Linux) or `base64 -i tree.glb` (macOS).

### Snippet 2: play audio from an embedded data URI with Web Audio `decodeAudioData`

```js
const ctx = new AudioContext();
// Resume on first user gesture (autoplay policy)
addEventListener('pointerdown', () => ctx.resume(), { once: true });
addEventListener('keydown', () => ctx.resume(), { once: true });

// Paste the base64 of an MP3 (safest across browsers). Keep it short.
const MUSIC_DATA_URI = 'data:audio/mpeg;base64,SUQzBAAAAAAA...';

function dataUriToArrayBuffer(uri) {
  const b64 = uri.slice(uri.indexOf(',') + 1);
  const bin = atob(b64), u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return u8.buffer;
}
// atob avoids fetch(), so the CSP connect-src rule never matters.

const musicBuffer = await ctx.decodeAudioData(dataUriToArrayBuffer(MUSIC_DATA_URI));

function play(buffer, { loop = false, volume = 1 } = {}) {
  const src = ctx.createBufferSource();
  const gain = ctx.createGain();
  src.buffer = buffer; src.loop = loop; gain.gain.value = volume;
  src.connect(gain).connect(ctx.destination);
  src.start();
  return src;                       // call src.stop() to stop it
}
document.querySelector('#start').onclick = () => play(musicBuffer, { loop: true, volume: 0.5 });

// For a supporting file instead of a data URI (relative URL, same origin):
// const buf = await ctx.decodeAudioData(await (await fetch('audio/theme.mp3')).arrayBuffer());
```

### Snippet 3: minimal ZzFX sound effects

```html
<button id="b">Play</button>
<script type="module">
import { zzfx, ZZFX } from 'https://cdn.jsdelivr.net/npm/zzfx@1.3.2/ZzFX.js';
// ZzFX (MIT, (c) 2019 Frank Force) creates its AudioContext at import; unlock it on a gesture.
const unlock = () => ZZFX.audioContext.resume();
addEventListener('pointerdown', unlock, { once: true });

// Parameter arrays from the ZzFX README examples. Design your own at https://killedbyapixel.github.io/ZzFX/
const SFX = {
  gameOver: [,,925,.04,.3,.6,1,.3,,6.27,-184,.09,.17],
  heart:    [,,537,.02,.02,.22,1,1.59,-6.98,4.97],
  drum:     [,,129,.01,,.15,,,,,,,,5],
};
document.querySelector('#b').onclick = () => zzfx(...SFX.heart);
</script>
```

Zero-dependency alternative with plain Web Audio (a "blip"):

```js
function blip(ctx, freq = 660, dur = 0.08) {
  const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
  o.type = 'square'; o.frequency.setValueAtTime(freq, t);
  o.frequency.exponentialRampToValueAtTime(freq * 2, t + dur);
  g.gain.setValueAtTime(0.2, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur);
}
```

---

## 12. Licence pages used (checked 2026-09-30)

Kenney https://kenney.nl/support · Quaternius https://quaternius.com/faq.html · KayKit https://kaylousberg.itch.io/kaykit-dungeon-pack · Poly Haven https://polyhaven.com/license · ambientCG https://docs.ambientcg.com/license/ · ShareTextures https://www.sharetextures.com/p/license · 3DTextures.me https://3dtextures.me/about/ · Poly Pizza https://poly.pizza/faq (unverified) · Sketchfab https://sketchfab.com/licenses , https://sketchfab.com/developers/download-api/guidelines · Fab https://www.fab.com/eula (unverified, via search) · OpenGameArt https://opengameart.org/content/faq · BlendKit https://www.blendkit.com/docs/licenses/ · Khronos https://github.com/KhronosGroup/glTF-Sample-Assets · Mixamo https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html (unverified, via search) · Freesound https://freesound.org/help/faq/ · Incompetech https://incompetech.com/music/royalty-free/licenses/ · Pixabay https://pixabay.com/service/license-summary/ · Mixkit https://mixkit.co/license/ , https://mixkit.co/terms/ · FMA https://freemusicarchive.org/License_Guide · FreePD https://freepd.com/ · Tabletop Audio https://tabletopaudio.com/about.html · Musopen https://musopen.org/faq/ (unverified) · YouTube Audio Library https://support.google.com/youtube/answer/3376882 · Sonniss https://sonniss.com/gdc-bundle-license/ · game-icons https://game-icons.net/about.html · Lucide/Tabler/Heroicons LICENSE files on GitHub · Twemoji https://github.com/jdecked/twemoji · OpenMoji https://openmoji.org/faq/ · Google Fonts https://fonts.google.com/faq · ZzFX/ZzFXM/jsfxr/BeepBox/Bosca Ceoil Blue/LMMS/Material Maker/WFC/three.js LICENSE files on GitHub · Blender https://www.blender.org/support/faq/ · Meshy https://www.meshy.ai/terms-of-use · Suno https://suno.com/terms · Stability https://stability.ai/community-license-agreement
