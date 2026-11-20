# NAMESCAN: player-visible original-name audit (2026-11-20)

Question: after the LEAKFIX noise, what original-game text can a player actually see on the live site?
No original names are written in this file. Hits are given by file, element kind, count and category only.

## Method
- Scanned built `games/*.html` (shell pages), `games/<slug>/index.html`, `cards.html`, `preview.html` and game `.json` files. Skipped `mainhattan-*` and `deep-signal`.
- Extracted what the UI can show: HTML text nodes and `title`/`aria-label`/`alt`/`placeholder`/`content` attributes, plus every string literal in inline `<script>` (card names, tutorial/help/coach text, log lines, labels). JS and HTML comments were scanned separately (hidden).
- Matched against a private term list (kept outside the repo, never committed) of: original titles, publishers, designers, and authored card/character/scenario names for each game's original, taken from the COPYAUDIT mapping plus my own knowledge. A first pass with a wide list gave ~1,000 literal matches; reading each in context showed almost all are our own names, or generic English words. Those were dropped.
- Severity: HIGH = original title, publisher or designer visible. MED = an authored name of the original visible (exact). LOW = only in hidden data or comments. GEN = a generic rules or component word that the original also uses (not a leak by itself, listed so the owner can decide).
- Limits: the term list comes from memory, not a database. It cannot prove a clean result for names it does not contain. Rows below are the confirmed visible matches.

## Ranked result (worst first)

| # | Game | HIGH | MED | LOW | GEN (not counted) | Where |
|---|---|---|---|---|---|---|
| 1 | shipwreck-isle | 0 | 5 distinct names, ~49 occurrences | 0 | ~75 | `index.html` JS string literals (character picker, portrait alt text, story lines, card text, log lines); `cards.html` 4 `<em>` labels |
| 2 | redline-rally | 0 | 1 (a title word used as the core mechanic term, 13 literals) | 0 | ~25 (4 named manoeuvres) | `index.html` JS literals: tutorial chapter titles, coach text, rules list `<b>` items |
| 3 | twin-thrones | 0 | 3 exact card names (one occurrence each) | 0 | ~10 | `index.html` JS literals in the card data table |
| 4 | crown-city-smash | 0 | 0 to 3, uncertain (3 lone one-word card names that are common words) | 0 | ~6 | `index.html` JS literals in the card pool |
| 5 | nebula-aces | 0 | 2 damage or upgrade card names, probably identical | 0 | 0 | `index.html` JS literals in the damage deck table |
| 6 | perch-and-plume | 0 | 1 (a feeder term) | 0 | ~11 (3 habitat names) | `index.html` one `div[aria-label]`; habitat names in JS literals |
| 7 | wildmark | 0 | 0 | 0 | ~36 (the 5 animal names) | `index.html` JS literals: scoring card help, tutorial |
| 8 | sands-of-qamar | 0 | 0 | 0 | ~13 (card-type word shown as `<h2>`, button, 2 aria-labels) | `index.html` HTML text and attributes |
| 9 | vinegrave | 0 | 0 | 0 | ~35 (item/relic/research words) | `index.html` JS literals |
| 10 | kaiten-kitchen | 0 | 0 | 0 | ~35 (a food type, a menu word) | `index.html`, `preview.html` |
| 11 | vale-of-banners | 0 | 0 | 0 | ~30 (resource and building words) | `index.html` JS literals |
| 12 | short-fuse, lantern-dive, hollowbough, tidewake, emberclimb, cauldron-fair, final-approach, thornbound, stitchwise, sunglaze, rampart-and-vine, doorkick-dungeon | 0 | 0 | 0 | 0 to ~10 each | All matches checked in context are our own names or common words |
| 13 | shell pages (`index`, `classic`, `facelift`, `missing`, `reference`, `credits`, `terms`, `privacy`, `suggest`, ...) and `asset-viewer` | 0 | 0 | 0 | 0 | See note 3 |

## Notes
1. HIGH is zero everywhere: no original title, publisher or designer string was found in anything a player can see. A 3-letter publisher abbreviation matched four built files, but only inside base64 data (false positive).
2. LOW is zero: no distinctive original names were found in comments or hidden data in the built output (LEAKFIX already removed the `ref` ids).
3. `suggest.html` shows the name of a third-party game database website twice (user-facing "paste a link" help). That is a website, not an original game, publisher or designer. Owner may want to keep or drop it. The legal pages (`terms`, `privacy`, `classic`, `index`) say "original games inspired by published board games" with no names: fine.
4. Fix order if the owner wants zero exact matches: (a) shipwreck-isle: rename the four character roles and the companion character in `rc/` source, then rebuild; (b) twin-thrones: rename the 3 exact card names in `twin-thrones/src/data.js`; (c) redline-rally: consider replacing the core term and 4 manoeuvre names in tutorial and rules text; (d) nebula-aces: reword 2 damage-deck names; (e) perch-and-plume: rename the feeder label. GEN rows are rules vocabulary (animals, habitats, food types) and need no change unless the owner wants stricter separation.
5. The earlier literal-count totals in LEAKFIX are mostly generic words; this audit shows the true player-visible risk is about 60 exact-name occurrences, concentrated in one game.
