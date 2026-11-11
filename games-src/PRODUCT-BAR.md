# The product bar: what a paid board-game app has (Oct 2026)

The question: what is missing between our free browser games and a game people would pay for? Measure
each game against the published digital adaptations people buy on phones and Steam, and against the best
game on our own shelf (Kaiten Kitchen). Each item below is something those apps all have. Score each area
0–5 (0 = missing, 3 = present but rough, 5 = as good as a paid app) with evidence.

## A. The game itself
1. **Complete rules.** Every mode, variant, scenario and player count in the base box. Check the engine
   against the game's own `rules-notes.md`; list anything missing or simplified.
2. **No rule bugs** a careful player would notice (play a few full games yourself, read the log).
3. **Computer players** at several levels that feel like people: no silly moves, no stalls, sensible speed.

## B. Learning the game
4. **Interactive tutorial**: a guided first game that teaches one idea per step, with "why".
5. **Always know what to do**: a line that says what to do now, a step/round tracker, legal moves highlighted.
6. **Rules in the app**: a short version first, then the full rules, searchable or well sectioned.
7. **Component reference**: every card / tile / token / power / mission listed with picture, text and count,
   reachable in two taps from the game, plus "tap or long-press any card to read it big".
8. **Glossary / tooltips** for game words.

## C. Playing comfortably
9. **Undo** (where the rules allow it, at least for your own unconfirmed choices) and confirmation before
   anything irreversible.
10. **History**: a readable log, last-turn summary ("what did the others just do?"), end-of-game breakdown.
11. **Settings**: sound/music volume, animation speed, AI speed, text size, colour-blind-safe mode, left/right
    hand, language-ready text (no text baked into pictures).
12. **Save and resume** that survives a reload, an app switch on iPhone, and a new version of the game.

## D. Playing with friends
13. **Online**: invite link, rejoin after a refresh or lost signal, a seat taken over by the computer and
    handed back, a host leaving, clear "waiting for X" states, emotes or quick chat.
14. **Asynchronous play** (take your turn later) — note if absent; it needs a server.
15. **Hot-seat** with pass-the-device screens where information is hidden.

## E. Look, sound and feel
16. **Art**: one consistent painted style, no placeholder-looking pieces, readable at phone size.
17. **Motion**: pieces visibly move between places, results are shown (not only logged), nothing jumps.
18. **Sound**: real samples, a balanced mix, music, haptics on phones where supported.
19. **Phone layout**: no clipping, overlaps or page scroll at real iPhone sizes, safe areas, big tap targets.

## F. Quality
20. **Speed**: first screen fast, smooth on an older phone, file size, battery.
21. **Accessibility**: contrast, labels for screen readers, not relying on colour alone, keyboard on desktop.
22. **Robustness**: no console errors, no dead buttons, recovers from errors, works offline.

## G. Product and store readiness (suite level)
23. **Consistency across the suite**: the same menu, settings, reference, help and end screens in every game.
24. **Identity**: profile name/avatar, statistics, achievements, a home screen that remembers recent games.
25. **Store needs**: icons, store screenshots, privacy policy, terms, credits/licences page, age rating,
    crash/analytics reporting (opt-in), payments or unlock (needs a server), app wrapper (PWA, iOS/Android).
26. **Legal**: who owns what. Faithful adaptations of published games can be shared free among friends,
    but **selling them needs a licence from the publisher** (the professional apps all have one), or the
    game must be redesigned enough to be our own. Flag anything that would block selling.

## Report format
For each game write `games-src/<folder>/AUDIT-PRODUCT.md`:
- A score table for areas A–F (0–5 each, one line of evidence each).
- A **problem list** ranked by severity: **P0** (blocks paying users: broken, missing core feature),
  **P1** (clearly below a paid app), **P2** (polish). Each with: what you saw, where (screenshot path or
  `file:line`), a proposed fix, effort (S < 1 h, M < 1 day, L > 1 day), and **[shared]** if the same fix
  would apply to every game (put it in the shared shell rather than per game).
- The top 5 fixes that would add the most value for the effort.
Keep it factual and short. Use the game's own names only; never write the original game's, publisher's or
designer's name in the public repo.
