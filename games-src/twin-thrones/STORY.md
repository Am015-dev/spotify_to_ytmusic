# Twin Thrones: story bible (W397)

All story text is in ONE data file: `campaign.json` (embedded by build.py as `window.CAMPAIGN`).
- `prologue` = the tutorial: chapters (open/close beats), every step's title/say/react, Pell's lines, the end card.
- `chapters[].intro / outro / outroLose` = Story mode scenes (intro 3 lines: who, stake, twist; outro on a win; outroLose on a loss, played before the result screen).
- `quick.intro` = the one-line flavour shown at the start of a Quick game. The result line (win/loss by points, military, science) is `resultLine()` in `src/ui.js`.
Original names only. Portraits are code-drawn (initial in a coloured disc, `cast.*.emoji/color` in the story kit) until art exists.

## Cast
- **Scribe Ione**: keeper of the old king's records, the guide. Warm, dry, never says "click". Her tag in the captions is "Ione".
- **Pell the Apprentice**: the rival of the prologue and chapter 1. Wants the crown, cheerful, sells cards he should build. Tag "Pell".
- **Orrin of the Quarry**: stone and wonders, gruff (chapters 2, 7). **Warden Brannoc**: the gate, red cards (boss, 3). **Maro the Trader**: every card you free is his gift (4).
- **General Kest**: the pawn (5, 9). **Queen Seren**: the Teal Throne by the river (boss, 6). **Sevra the Sage**: six symbols win (8). **King Vael**: never dead, holds both thrones (final boss, 10).
- **You**: heir of the Gold Throne on the hill.

## Arc (3 acts)
1. **The Pyramid** (chapters 1-3): the old king died, two thrones stand empty (Gold on the hill, Teal by the river); the greater city wears both crowns. Pell wants it, Orrin sells the stone, Brannoc holds the gate.
2. **Open Roads** (4-6): traders, a general, a queen. Mind what you uncover (Maro), count shields (Kest), push the pawn back (Seren).
3. **The Twin Throne** (7-10): rivals read two moves ahead; the Long Library (science); pawn or scrolls only; the twist: King Vael was never dead.

## Prologue (the coached first game)
A scene opens it (Ione, Pell, 3 lines). Then one real duel against Pell (easy) with free moves; Ione's just-in-time bubbles are her voice, the scoring walk is the climax, and the later card closes it. Text: `campaign.json` -> `prologue` (`intro`, `first`, `playon`, `coach`, `later`, `walk`).
