# Vinegrave Story: "The Vines of Vinegrave"

**Premise.** An overgrown island hides a temple under a thousand vines. You join the veteran guide Pell Ardent and cross three
regions, racing rival expeditions to the temple. Every stage is the real game (5 rounds unless a twist says otherwise) with one
change: a stronger rival, a handicap, or a goal.

Story opens with the guided round (tutorial = stage 0, offered on first launch and before stage 1), then the map.

| # | Act | Stage | Rival (AI) | Twist (campaign only) | Goal | Why it's there |
|---|-----|-------|-----------|------------------------|------|----------------|
| 1 | 1 Mangrove Coast | First Footprints | Tamsin Reed (easy) | none | Win | First real game, hints on |
| 2 | 1 | Under the Roots | Tamsin (easy) | none | Win + discover 2 ruins | Teaches discovering (the centrepiece) |
| 3 | 1 boss | The Captain's Cove | Captain Ines Quell (easy) | `woken 2`: two ruins start discovered with a guardian awake | Win | Teaches overcoming guardians |
| 4 | 2 Deep Green | The Scholar's Wager | Dr Okoro Bell (normal) | none | Win with 35+ | Research track |
| 5 | 2 | Three Camps | Okoro + Mira (normal, 3 players) | none | Win | Crowded board, blocked sites |
| 6 | 2 | Storm Season | Mira Holt (normal) | `storm 1`: a plane costs 3 coins | Win | Plan travel with cards |
| 7 | 2 boss | The Sallow Twins | twins (normal, 3 players) | `rich 2`: each twin starts with +2 coins and compasses | Win | Boss with a head start |
| 8 | 3 Highlands | Race the Rains | Mira (hard) | `short 4`: 4 rounds | Win | Tempo |
| 9 | 3 | The Old Warden | solo vs Vane's crew (rival deck, hard) | `shrewd 1`: rival starts with 3 points | Beat the rival alone | Solo mode in the story |
| 10 | 3 boss | Vane's Gambit | Dr Aurel Vane + Mira (hard, 3 players) | `head 3`: rivals start on research row 3 | Win | Final boss |

Curve: act 1 easy AI with hints, act 2 normal, act 3 hard and every act-3 stage has a twist. Each act's first stage has no twist.
After 2 losses a stage offers "Make it a bit easier" (one AI level down, twist off, at most 2 stars). Stars: win, then a score
or skill target (guardians overcome, ruins discovered, temple reached, margin). Unlocks are cosmetic (portraits, a title).
Twists are implemented in `src/engine.js` `applyTwist()`; extra twists ready for later: `dread N`, `idols N`.
