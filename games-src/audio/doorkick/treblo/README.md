# Doorkick Dungeon: Treblo music sources (2026-10-08)

Ten instrumental tracks: five cues, two versions (a/b) of each. They were generated on treblo.com (model v3, Advanced mode: Styles = Auto with the prompt, Lyrics = None, so no vocals) from the prompts in `games-src/munch/MUSIC-PROMPTS.txt`.

These files are **sources**: the original WAVs re-encoded to MP3 at 160 kbps. They are not game-ready.

**Pick one version per cue by ear (the owner decides).** Then run them through `../../tools/music.py`, which cuts a loop with a cross-fade, normalises to -18 LUFS and encodes 96 kbps MP3. Copy the chosen files into the `raw/mus` folder on Linux first.

| file | length | Treblo title |
|---|---|---|
| `defeat-a.mp3` | 1:42 | The Wandering Fools' Lament - O Woe, My Broken Lute |
| `defeat-b.mp3` | 2:31 | The Wandering Fools' Lament - Two Notes and a Shrug |
| `fight-a.mp3` | 1:55 | Brawl at the Dragon's Rest - Taiko and Tumble |
| `fight-b.mp3` | 3:07 | Brawl at the Dragon's Rest - Fiddle Fists and Bassoon Blows |
| `main-a.mp3` | 0:48 | Sneak About the Stone Corridor - Tiptoe Through the Trapdoor |
| `main-b.mp3` | 2:07 | Sneak About the Stone Corridor - The Curious Little Dungeon |
| `tavern-a.mp3` | 2:05 | The Hearth Before the Quest - Six Copper Cups |
| `tavern-b.mp3` | 2:40 | The Hearth Before the Quest - Tavern of the Lazy Lantern |
| `victory-a.mp3` | 2:51 | The King's Return - Tavern of the Golden Stag |
| `victory-b.mp3` | 2:24 | The King's Return - Fanfare for the Merry Company |

## What each cue is for
- **tavern**: menu / title loop (new, `music.tavern`)
- **main**: in-game loop (replaces `The_Old_Tower_Inn.mp3` as `music.main`)
- **fight**: fight vs a level 12+ monster (new, `music.fight`)
- **victory**: win screen cue (new, `music.victory`): cut a 15-20 s section with a fade-out
- **defeat**: lose screen cue (new, `music.defeat`): cut an 8-12 s section with a fade-out
- `main-a` is only 48 s long. `main-b` (2:07) is the safer pick for a loop.

## Suggested `music.py` TRACKS lines
After copying the chosen versions to `raw/mus`:
```python
    ('doorkick', 'tavern', 'tavern-a.mp3', (60, 100)),
    ('doorkick', 'main', 'main-b.mp3', (72, 110)),
    ('doorkick', 'fight', 'fight-a.mp3', (45, 75)),
```
Victory and defeat are not loops. Cut them with ffmpeg, for example:
`ffmpeg -i victory-b.mp3 -t 18 -af "afade=t=out:st=15:d=3,loudnorm=I=-18" -b:a 96k doorkick_victory.mp3`
Keep the existing sax stingers until short stingers exist. Treblo makes full songs, not sub-2-second effects.

## Licence (add to `../../ASSETS.md`)
- Generated with Treblo (treblo.com) by the project owner's account, 2026-10-08.
- Treblo Terms of Service, section 8 (Output): the user owns the Outputs, and Treblo assigns its rights to the user. The commercial-use limits in the rest of the terms "do not limit Your use of Your Outputs".
- Outputs may not be unique, and Treblo gives no warranty about whether a track can be copyrighted.
- No third-party samples were used. The prompts are our own and name no artists or works.

## Short menu loops (2026-10-09)
Shorter alternatives for the menu/title screen (Doorkick has no tavern cue, so these are short `main` loops), generated with Treblo's Duration Control (max 1:00, which Treblo treats as a guide). Anything longer was trimmed to 58 s with a fade-out, so loop these with a short crossfade.

| file | length | note |
|---|---|---|
| `main-short-a.mp3` | 0:58 | trimmed from 90 s, 3 s fade-out |
| `main-short-b.mp3` | 0:46 | as generated |
