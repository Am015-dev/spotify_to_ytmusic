# UI bar: every screen, every size (owner, 14 Oct 2026: "all games are sloppy", "unreadable", "ugly")

Applies to EVERY surface: title/start screen, top bar, each top-bar panel (menu, rules, diary/log, rivals, settings), side dock,
campaign map, chapter/boss intros, board, hand, end/win/lose screen. At 5 sizes: 375x553, 390x763, 768x1024, 1366x768, 1920x1080
(Playwright projects phone-s, phone, tablet, pc, wide).

1. Text: >= 13px on phones, >= 16px at >= 1024px wide (bars, chips, labels, log lines included). Dark ink on light / light on dark,
   axe colour-contrast AA. No pale-brown-on-parchment.
2. Inset: 16px between text and any panel edge; nothing flush to an edge. Text and icons never on painted frame art (gems, borders).
3. One button style per role: primary (one per screen), secondary, icon. No mixed art, no squeezed or stretched button art.
4. Top bar: at most 5 buttons (hint, diary, rules, menu + one game action). Sound, music, speed, pause, graphics, new game live in Menu.
   Nothing overlaps the game title (move the LAB badge).
5. Say it once: each event told once (full text only in the diary); ONE instruction line on the board (<= 8 words); no numbered
   step lists to read; no box that repeats a number shown elsewhere (show it on the piece/hero).
6. Panels fit their content: no tall empty parchment. Side docks show only: whose turn, the one line, the main action, last 3 events.
7. Start screen: title in one style, tagline, ONE big primary button, one "Quick game" row (options as segmented controls in one style),
   Continue only when a save exists; How to play / music go to the top bar; no character roster.
8. Wide screens get a real layout, not the phone one stretched: cards and art at their natural aspect ratio (never stretched),
   the main card/piece large (>= 20% of board height), decks/discards/labels fully inside the board and readable.
9. Nothing cut by the screen edge or an overflow:hidden parent; no text spilling out of its chip.

Proof: `?scn=menu` passes at all 5 projects (`SCN_SLUGS=<slug> node_modules/.bin/playwright test --project=phone-s --project=phone
--project=tablet --project=pc --project=wide -g menu`). Where the test cannot see a rule (5, 6, 7), check it in the DOM with a small
?scn= check of your own. No screenshots.
