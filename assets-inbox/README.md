# Asset inbox

Drop finished pictures here and they appear in the games with as little manual work as possible.
One folder per game: `assets-inbox/<game-slug>/`, each with a `README.md` listing the expected file names
(name, size, ratio, transparent or not, what it is). Those lists come from the to-make list (`games/next-wave.html`).

## For the owner: 3 steps
1. **Drop** the files into `assets-inbox/<game-slug>/` (png, jpg or webp at 1024 px or larger; mp3/wav for music; mp4 for boss clips).
   Names are forgiven: case, `_` instead of `-`, a `(1)` suffix, png instead of webp. A real typo only gets a hint and the file stays.
2. **Run** `python3 games-src/scripts/ingest-assets.py` (add `--check` first to see what would happen without changing anything).
   It crops/resizes to the target size, converts to webp, keys a flat white or green background to transparent where needed,
   writes the file into `games/<slug>/media/`, moves your original to `done/` and prints PASS / WARN per file plus, per game,
   how many files are `auto-wired` and how many `need wiring code`.
3. **Tell the orchestrator** "inbox ready". WARN lines are things to look at (wrong ratio, too small, background had to be keyed); nothing is lost.

## For the orchestrator
1. `python3 games-src/scripts/ingest-assets.py` (it also runs `wiring-status.py` and `inbox-report.py`). Read the WARN lines and the per-game summary.
2. Files that need wiring code are listed with the code spot to copy (nearest loaded sibling in the game source). Hand them to the game's fixer, one worker per game.
3. Deploy the affected games in ONE `build-all.py --deploy <slugs>` call (only games whose code changed; a media-only drop for a game that already loads the name needs a deploy of that game too, since `games/<slug>/media/` is published from the repo). Then commit the new media files and push.

## Notes
- 3D source paintings go to `assets-inbox/<slug>/models-src/` (3D pipeline); a `.glb` goes to `games/<slug>/models/`.
- Music/sound go to `games-src/audio/<game>/treblo/` as sources for the audio tools (`-a` / `-b` versions).
- Mainhattan Nightrun uses the same inbox; the script then runs its `make-placeholders.py` so `media/ready.json` stays right.
- Originals (`done/`, `models-src/`, loose pictures) are git-ignored on purpose. Mainhattan Overdrive is not part of this.
- What each game does with each name today: `games-src/ASSET-INBOX.md` (regenerate with `python3 games-src/scripts/inbox-report.py`).
