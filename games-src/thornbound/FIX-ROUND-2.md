# The Thornbound Throne: fix round, stage 2 (Oct 2026)

Preview: `games/thornbound-new/index.html` (rebuilt in place, stamped). Live `games/thornbound/` untouched.

## What changed
- **Shared kit** (`game/src/ui8.js`, `src/refdata.js`, build.py): "Cards" reference (162 entries: 76 faction cards, 51 Kingdom Cards,
  16 Tactics, 4 Favour powers, 6 locations, 3 Councils, 6 box pieces; search, chips, "In this game", big view; "Read it in the card list"
  from card, Kingdom Card and location pop-ups). Shared Menu replaces the old one (guide level, sound, music, graphics, save, new game,
  online lobby all kept; computer speed and animations from the kit). Developer tools only with `?dev=1`. Undo for hidden cards and
  Supporters (sealed when the decision passes or anything is revealed; off online). Bids now need "Confirm bid". "Since your turn" strip.
  `GNS.result` + 10 achievements, `GNS.saved`, offline service worker, About with credits/privacy/terms. Colour-blind marks on rival
  chips, Herald dots, Supporter discs and the end chart. Text size scales the dock, pop-ups and drawers.
- **P1 fixes:** guided round 1 now teaches what it says (the easy Court keeps its Tactics and optional actions in round 1; the
  newcomer's bid wins, takes the Kingdom Card that makes the Heir Deadly, and wins Cairn Field with the Herald: 6–0 after round 1);
  Spring/Day/Autumn tips; own board at a glance on your chip (KC, Supporters, Tactics, Lore); full end breakdown (every source, Herald
  steals, leftover Lore) plus an Influence-per-round chart, also on online clients (netstrip sends the public `src:` counters at the end);
  2-player balance note on faction cards; "not in this version" note (solo, advanced setup); settings reachable from the title; save
  version check; desktop setup start row pinned.

## Tests (final build)
| Test | Result |
|---|---|
| rules-test.js | 114 passed, 0 failed |
| hidden-test.js | passed (0 leaks; control cheater caught 1096/1745) |
| net-strip-test.js | 16 games, 4665 copies: 0 poison / move / structural / unlisted leaks |
| click.js (10 configs incl. guided, hot-seat, phone) | 10 games, 0 errors, 0 hidden-info violations |
| lay.js 1366x768, 1920x1080, 768x1024, 1100x700 | PROBLEMS 0 |
| lay-phone.js 390x844, 390x763, 390x664, 375x553, 412x780, 844x390, 750x342 | 0 problems at every size |
| kit-shots.js 390x763, 375x553, 844x390, 1366x768 | PROBLEMS 0 |
| net/p2p-tb.js full / leave+rejoin, p2p-tb-phone.js | games finished, pages agree, 0 packet leaks, 0 invariant failures |

Screenshots: `game/shots/kit/` (gitignored).

## Left
- Art is still the code-drawn kit (no painted Pixi table); map on 375x553 stays ~150 px during list questions.
- No solo mode / advanced setup; host leaving ends an online game; no emotes; relay failures show no timeout message (shared netroom).
- 2-player faction balance unchanged (Court ~63%).
