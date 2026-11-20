# [NEW2 vellum-shire] report

- Branch shelf/W561-new-estate (from alex/brave-carson-rbpmlk). Not deployed, no shelf card.
- Game: Vellum Shire, illuminated-manuscript look (parchment, gold leaf, ink icons, uncial capitals). You vs computer (Easy/Normal/Hard), also 2 players on one phone.
- Rules and components: full original 2-player game, 5 chapters x 5 rounds; all 164 tiles, 42 goods, 26 lore powers, 8 buildings, 9 estate boards (board 1 standard, "Random boards" = original advanced setup). rules-test asserts every count and rule (171 asserts).
- Nothing simplified in the rules. UI-only: a barge with more new goods kinds than storage keeps the biggest piles; random-board start-keep pick is open in turn order.
- [unverified]: region points for sizes 5-8 and chapter bonuses II-IV (board print, via implementations), ink stall = 4 tiles at 2 players, lore 16/18-21/23 building mapping, start keeps from the plain keep stack.
- Gates: build-all --quick PASS (11 scenarios); --full PASS twice (phone-check 6 sizes, scenarios, rules-test sweep); rules-test full 171/171, Normal beats Easy 27/40, avg 132-138.
- Assets: game-icons.net icons (Delapouite, Lorc, Skoll; CC BY 3.0, credited in Menu > About and THIRD-PARTY.md); fonts Uncial Antiqua, UnifrakturMaguntia, IM Fell English (SIL OFL); own Web Audio sound; code art.
- Not done: story/campaign mode, online play.
- Proof: games-src/vellum-shire/proof/first-3-minutes-375x667.webm + 1-title.png, 2-tutorial.png, 3-choice.png, 4-later.png.
- Cold play (independent agent, verdict as given): "Clear and pleasant to play cold on a phone. Fix the cut-off action text and the header overlap, and default to a stronger computer." Could play: yes; fun 4/5. All points it raised were fixed afterwards (text, header, pops, stall dice, menu jump, short-phone dock, stronger Easy, no dead taps).
