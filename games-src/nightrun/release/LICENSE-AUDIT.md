# Licence audit for COMMERCIAL sale ($5, itch.io): Mainhattan Nightrun

Date 31 Oct 2026. Scope: everything inside `dist/nightrun-web.zip` (built from `games/mainhattan-nightrun`). Sources: repo files (`games-src/FREE-ASSETS.md`, `music-treblo/README.md`, `ASSET-POLICY.md`), a scan of the built `index.html`, and public terms where I could read them. I am not a lawyer; BLOCKERs are things the owner must confirm with his own account records before taking money.

## Verdict: 2 BLOCKERs (both music), nothing else blocks the sale

| # | Item | Files | Licence / source | $5 sale allowed? |
|---|---|---|---|---|
| 1 | Game code, canvas renderer, Web Audio synth, all sound effects made in code | `index.html`, `sw.js` | Owner's own code. No third-party JS library found in the build (scanned for howler, pako, three, pixi, phaser, tone, zzfx, jsfxr, seedrandom, jszip, opentype: no hits). Copyright line already stamped by `stamp-copyright.py`. | Yes |
| 2 | Painted art: ships, enemies, bosses, backgrounds, icons, key art | `media/*.webp`, `media/anim/**`, `media/foot/**`, `icons/*.png` | The owner's own art (made by the owner with image-generation tools per `ASSET-POLICY.md`). Owner says it is his; the repo holds no third-party art. | Yes, per the owner. NOTE: itch.io asks creators to disclose generative-AI use; tick it. Keep the generation records (prompts, account, dates). |
| 3 | Font Chakra Petch (500, 700) | loaded at run time from `fonts.googleapis.com` / `fonts.gstatic.com` | SIL Open Font License 1.1 (Cadson Demak). Commercial use and embedding allowed; selling the font on its own is not. | Yes. Notice in `THIRD-PARTY-LICENSES.md`. |
| 4 | Font Share Tech Mono | same | SIL OFL 1.1 (Carrois Apostrophe). | Yes. Same notice. |
| 5 | Music, older set: `menu, stage1-3, boss, boss2, endless, endless2, athina, athina2, boss3` (11 files) | `music/*.mp3` (34 MB) | **BLOCKER A.** The repo does not record which service made them or on which plan. `music-treblo/README.md` says "log it like the existing Suno tracks", which suggests Suno. `games-src/FREE-ASSETS.md` line 128 records that Suno's free/Basic plan is "lawful, personal and non-commercial purposes" only, and paid plans assign ownership. | **UNKNOWN until the owner confirms** the service and that the tracks were generated while on a paid plan (Suno Pro or Premier) or are otherwise cleared for commercial use. If they came from a free plan: not allowed, replace them. |
| 6 | Music, polish pack: district cues, boss cues, fever cues, street cues, stingers (37 files) | `media/mp-*.mp3` | **BLOCKER B.** Made on treblo.com on the owner's account (`music-treblo/README.md`: "Under Treblo's Terms of Service, section 8, the user owns the outputs"). I could not open the Treblo terms from this environment (HTTP 403), so I cannot confirm the clause or whether it depends on a paid plan. | **UNVERIFIED.** Owner: open Treblo's terms, confirm commercial use of outputs on the plan used, save a copy (PDF/screenshot with date) in a private folder. |
| 7 | Nothing else third-party | | No CC/MIT art, no photos, no sample packs, no stock sounds found in `games/mainhattan-nightrun`. Repo-level `LICENSE-spotify2ytmusic` belongs to a different project in this repo and is NOT in the zip. | n/a |

## Not licence issues, but the owner should know before selling

- `media/anim-boss*.webp`, `music-treblo/*.mp3` (83 source files, 4 per cue) and the Lab/test tools are repo-only or dev-only; the zip leaves out 108 media files the game never loads (list: `DROPPED-FILES.txt`). The title screen still shows a **LAB** button (developer viewer). Decide whether buyers should see it (it is in the game's text, so W295 owns that).
- The title line "FRANKFURT AM MAIN · 2099 · KURIERFLUG 404" and the district names are real place names; place names are not protected, but check the key art contains no real company logos before the store page goes up (I did not see any in the five shots I looked at).
- Third-party network use: Google Fonts is requested over HTTPS at run time (visible in the iframe test). The game falls back to the system font if the request fails. If you want zero third-party requests (privacy wording on the store page, EU visitors), self-host the two fonts later; this is a non-blocking improvement.

## What I could not check

- Whether any painted sprite accidentally imitates a recognisable third-party character: this needs a person looking at all the art, not a script.
- The exact wording of Suno's and Treblo's current terms (Suno: only the repo's own note; Treblo: page blocked).
