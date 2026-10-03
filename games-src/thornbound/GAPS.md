# GAPS - what is still missing for a faithful The Thornbound Throne

Base-game multiplayer is essentially COMPLETE (rules from the official rulebook; all faction decks, tactics, favours, locations and 51 Kingdom Cards read from the publisher's public card library). The gaps are below, most important first.

## 1. Solo mode (Simulacrum) - BLOCKING for a faithful solo mode
Missing: the official solo rulebook (BGG file 311489, 19 MB PDF "Solo Mode Rulebook"; also on Scribd 953409639). Needed items: Simulacrum setup (which board, decks, how many cards); full round procedure per Phase for the Sim; Ambition cards (all, with their region/suit priorities, arrows, "false" ones); Scheme/Plan cards (all, with Supporter/faction-card placement, Clash marker orders, Fog); Fog marker rules; Tier (Gold/Silver/Bronze) of each Sim faction card and copy counts of the 11 faces seen; bid-token strengths and how the Sim spends them; Sim rewards per Clash win and its Autumn Govern/Journey rewards; rule for the Sim's Favour, Heralds, Lore; how the Sim "wins" (is it simply more Influence after N rounds); the Forge deck (60 faces = 30 double-sided cards, TOKC_FORGECARDS1-60 in the publisher library); Heat scale scoring; the 5 preset Simulacra; trophies. Source: physical Solo Rulebook + Simulacrum box components (Ambition, Scheme/Plan, Fog, Forge, Sim faction cards, Sim board). If the user owns the Simulacrum material, photos/scans of: the solo rulebook (all pages), every Ambition and Scheme card face + back, Forge cards, Sim board, bid token sheet would close this.
Interim: documented in cards.json `solo` (24 Threat cards complete; 11 Sim card faces partial). Suggest shipping the game with 2-4 player hot-seat/AI first, and an invented-but-labelled Sim later.

## 2. Small unknowns in the base game (non-blocking, all marked ASSUMPTION)
- Printed starting Hand Size on each Player Board (assumed 6). Source: Player Board photo (top-left Hand Size marker arrow) or rulebook p.7 diagrams.
- Trait icon naming: shield = Invulnerable, helmet = Resilient, map = Pathfinder (inferred). Source: Rules Reference Sheet (trait/icon legend) or rulebook p.40-43 glyph font.
- Votes = gavel icon and Lore = scroll icon: inferred from card text; very high confidence.
- Necropolis exact shuffle/draw flow ("Shuffle your Discard Pile and draw up to three cards") and Grand Joust / Dead King's Gaze edge wording: need the FAQ or a rules reference sheet.
- Interaction details a rulebook FAQ would cover: Herald removed by Retreat vs Herald Reward timing; Deploy tokens counting as "Influence in Supply" (rulebook says no); what "Your Supply" means for Supporters on the Dead Lamp-style card; whether Wax Pretender can copy a Favour that needs the disc's use; ordering of "before claiming rewards" triggers. Source: BGG rules forum / the "Reference Sheets" (2 included in the box) / Teaching Guide / Strategy Guide (BGG thread 3584123).
- Number of Influence tokens vs. Reserve being unlimited: use proxies (stated).
- Player-count restrictions: a search snippet says 2p = Nobility+Clans and 3p without Gathering; not in the rulebook text I read. If the user owns the game, check the Teaching Guide / box back for per-count recommendations.
- Faction card flavour-based Heir/etc. names are intentionally not captured (new original names used).

## 3. Not in scope (but present in publisher library)
Wild Kingdom expansion: 15 extra Kingdom Cards, Aeronauts (4), Legendary Creatures (4), Whispering Tower tile, 20 Boon tokens, night-side Map tiles ("Other_NightMap*"). Songs of Home expansion also exists. If wanted, source = Wild Kingdom rulebook (Scribd 951820709 / 1009694711).

## 4. Art/assets
No publisher art is included or needed; the game needs original art. Card layouts are described only via data fields.

## 5. Verification debt
- Basic decks were verified numerically for Clans (all 14) and Nobility (cards 5-8, 13-14) plus all four Heirs; the rulebook says all four are identical. If spare time: view remaining Uprising/Gathering basic cards (cards 1-12) to confirm.
- Votes/Lore icon counts on Advanced cards were read from images at reduced resolution; re-verify against the physical cards (cards.json -> factions.*.site_of_power[].votes / lore).
