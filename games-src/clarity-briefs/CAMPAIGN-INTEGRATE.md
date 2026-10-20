# Add the story campaign to one game

Game: given in your prompt (source folder and preview link). Its clarity pass is finished; build on its current
preview.

1. Read `games-src/shell/CAMPAIGN.md`, `games-src/shell/gx-campaign.js`, your game's `campaign.json`,
   `CAMPAIGN-DESIGN.md` and `CLARITY-REPORT.md`, and `games-src/BRIEF-2d-games.md` (hard rules and Cost rules).
2. Add a **Story** button on the title screen (the first button for new players). Wire `gx-campaign.js` to
   `campaign.json` through the game's build, and implement each chapter's setup, AI level and style, and twist in
   the game's own code. The normal game's rules must stay unchanged.
3. Play chapters 1–3 and one boss yourself with `games-src/scripts/drive-serve.js` at 390x763, and look at every
   screenshot. Then run 1 blind tester subagent (no repo access) on chapters 1–3. Fix what they hit. The bar: they
   understand the goal of each chapter and want to play the next one.
4. Keep the game's existing tests green. Add a test that every chapter can be started and that a scripted or AI
   win marks it beaten.
5. Build, copy to the preview path and run `python3 games-src/scripts/stamp-copyright.py <preview>`. Commit, merge
   `origin/alex/brave-carson-rbpmlk` and push to `alex/brave-carson-rbpmlk` (your game's files and preview only).

Never write an original game's, publisher's or designer's name anywhere. No model identifiers. End with a 5-line
summary and the preview link.
