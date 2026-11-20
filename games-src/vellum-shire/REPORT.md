# [NEW2 vellum-shire] report

- Branch shelf/W561-new-estate (from alex/brave-carson-rbpmlk). Not deployed, no shelf card.
- Game: Vellum Shire, illuminated-manuscript look (parchment, gold leaf, ink icons, uncial capitals). You vs computer (Easy/Normal/Hard), also 2 players on one phone.
- Rules and components: full original 2-player game, 5 chapters x 5 rounds; all 164 tiles, 42 goods, 26 lore powers, 8 buildings, 9 estate boards (board 1 standard, "Random boards" = original advanced setup). rules-test asserts every count and rule (171 asserts).
- Nothing simplified in the rules. Barge overflow is now the player's choice (F1). Random-board start-keep pick is open in turn order.
- [unverified]: region points for sizes 5-8 and chapter bonuses II-IV (board print, via implementations), ink stall = 4 tiles at 2 players, lore 16/18-21/23 building mapping, start keeps from the plain keep stack.
- Gates: build-all --quick PASS (11 scenarios); --full PASS twice (phone-check 6 sizes, scenarios, rules-test sweep); rules-test full 171/171, Normal beats Easy 27/40, avg 132-138.
- Assets: game-icons.net icons (Delapouite, Lorc, Skoll; CC BY 3.0, credited in Menu > About and THIRD-PARTY.md); fonts Uncial Antiqua, UnifrakturMaguntia, IM Fell English (SIL OFL); own Web Audio sound; code art.
- Not done: story/campaign mode, online play.
- Proof: games-src/vellum-shire/proof/first-3-minutes-375x667.webm + 1-title.png, 2-tutorial.png, 3-choice.png, 4-later.png.
- Cold play (independent agent, verdict as given): "Clear and pleasant to play cold on a phone. Fix the cut-off action text and the header overlap, and default to a stronger computer." Could play: yes; fun 4/5. All points it raised were fixed afterwards (text, header, pops, stall dice, menu jump, short-phone dock, stronger Easy, no dead taps).

## F1 fixes (strict review R100)
- Stopper fixed: when no spot fits a die, the worker button glows with a "tap" badge and the line says "Nothing fits: tap the glowing worker for +2 workers". Hint says the same, and a new tutorial step teaches it (20 steps). Scenario vs-stuck.
- Taps >= 44 px at 375x667 and 375x553: stall tiles 44x44, storage 44x46 (now a column beside the estate), dice/workers/silver 44x44. Estate hexes 44x51 at 667. At 553 the estate zooms (hexes 44x51): a tap on it zooms in and selects the space you hit, it zooms on its own when only spaces glow, and "▲ Stalls" goes back. It zooms out when you pick a die.
- Storage full shows on the first tap ("Storage full: tap a stored tile to drop"). Scenario vs-full. Two dice of the same number give one choice, not two.
- Red worker badges explained ("Red number = workers needed to turn the die") until you first use one. Buttons say "uses 1 worker". The tile's effect shows before "Do it" at every size. The selected stall tile is highlighted.
- "Rival's estate" banner each time the view switches, plus a red frame on the rival's board. The rival's line says what it gained, e.g. "(+4 points)". One toggle button (Rival ▸ / ◂ You) instead of two tabs. The unlabelled ⇥ button is hidden on phones.
- Lore 1 text now says "the same building more than once" (the engine already allowed any number, as in the original).
- Barge overflow: the player chooses which goods kinds to keep, as in the original (one "Keep Grain" button per choice). The computer searches the same choices.
- Computer: Hard beat Normal 51/80 (fresh seeds), Hard beat Easy 33/40, Normal beat Easy 24/40 (rules-test gauntlet 31/40). Hint = Hard's pick: a hint-follower beats Easy about 3 in 4. AI noise now comes from a seeded generator, so test runs repeat.
- Tools: measure.js (tap sizes), ai-duel.js (level vs level).
