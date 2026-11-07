# Deep Signal: Story design (the Logbook of the Lanternfish)

**Premise.** The research submarine *Lanternfish* follows a faint signal down a deep ocean trench. Each dive is a mission in the
logbook; the crew (You, Captain Ines, Bram, Kito, Odile; with two players a small drone joins) must win the right cards for the right
crew mate. The signal grows stronger with every logged dive until the crew reaches its source.

**Structure.** The 50-mission logbook IS the campaign: `campaign.json` holds 50 chapters in 3 acts on the shared campaign map
(`shell/gx-campaign.js`), progress saved in `localStorage['gns-campaign-deep-signal']`. Chapter n opens when n-1 is beaten.
Every chapter is the real rules with that mission's twist (more tasks, order tokens, special rules). Act 1 has hints on; acts 2-3
use the stronger crew (more simulations per card).

| act | missions | title | boss (last mission of the act) |
|---|---|---|---|
| 1 | 1-16 | The Shallows | 16 The Warden of the Trench: silent running (no signals), 3 tasks, one numbered |
| 2 | 17-33 | The Warden's Gate | 33 The Gatekeeper Swarm: the captain hands out 5 tasks, dead zone |
| 3 | 34-50 | The Signal's Heart | 50 The Source: silent running, 7 tasks, the final-seal task last |

Mission 1 is the guided tutorial (gx-tutor) when played from the Story; the end card continues the logbook and logs mission 1.

**Difficulty curve.** Tasks grow from 1 to 9; order tokens appear at mission 3 (numbers), 7 (final seal Ω), 14 (arrows);
special rules are introduced one at a time in act 1 (no-trick diver 5, sonar 1 must win 9, captain decides 11, every sonar wins 13,
dead zone 14, silence 16) and combined later (dead zone + jammed relay 44, captain shares + dead zone 46).

**Stars.** 1) complete the mission, 2) no flare used, 3) at most two crew signals. After two losses the kit offers
"easier": the crew thinks harder (hard level) and the first flare is free (at most 2 stars).

**Special rules (twists), all implemented in `src/engine.js`:**
- `notrick` the captain picks a crew member (asking yes/no) who must win no tricks; `onetrick` exactly one trick.
- `decide` the captain asks who wants the tasks and gives them all to one crew member (not the captain).
- `dist` the captain hands out the tasks one at a time, keeping the split even.
- `dead` a signal shows the card but not highest/only/lowest; `nocomm` no signals; `late2`/`late3` signals from trick 2/3.
- `sonar1` Sonar 1 must win a trick; `sonars` every sonar card must win its own trick.

## All 50 missions
| # | title | tasks | tokens | special |
|---|---|---|---|---|
| 1 | First Dive | 1 | - | - |
| 2 | Two Lights | 2 | - | - |
| 3 | In Order | 2 | 1 2 | - |
| 4 | Three Echoes | 3 | - | - |
| 5 | The Fever Watch | 0 | - | notrick |
| 6 | Steady Hands | 3 | 1 2 | - |
| 7 | Last Word | 3 | Ω | - |
| 8 | Count Down | 3 | 1 2 3 | - |
| 9 | The Faint Ping | 1 | - | sonar1 |
| 10 | Four Lanterns | 4 | - | - |
| 11 | Captain's Call | 1 | - | decide |
| 12 | Final Seal | 4 | Ω | - |
| 13 | Every Ping Answers | 0 | - | sonars |
| 14 | Static Shelf | 4 | > >> >>> | dead |
| 15 | By the Book | 4 | 1 2 3 4 | - |
| 16 | The Hushed Trench | 3 | 1 | nocomm |
| 17 | Chosen Diver | 2 | - | decide |
| 18 | Jammed Relay | 5 | - | late2 |
| 19 | Pressure Rising | 5 | 1 | - |
| 20 | Lone Catch | 2 | - | onetrick |
| 21 | Twin Beacons | 5 | 1 2 | - |
| 22 | Fair Shares | 4 | - | dist |
| 23 | Arrows in the Dark | 5 | > >> | - |
| 24 | Dead Water | 5 | - | dead |
| 25 | Slow Burn | 5 | Ω | late3 |
| 26 | Out of the Loop | 2 | - | notrick |
| 27 | Three Steps Down | 6 | 1 2 3 | - |
| 28 | Split the Haul | 6 | - | dist |
| 29 | Follow the Arrows | 5 | > >> >>> >>>> | - |
| 30 | Smallest Voice | 5 | - | sonar1 |
| 31 | Bookends | 6 | 1 2 Ω | - |
| 32 | The Murk | 6 | - | dead |
| 33 | The Warden's Gate | 5 | - | dist-dead |
| 34 | Into the Rift | 7 | - | - |
| 35 | Clockwork | 7 | 1 2 | - |
| 36 | One and Only | 3 | - | onetrick |
| 37 | Long Silence | 7 | - | late3 |
| 38 | The Last Lock | 7 | Ω | - |
| 39 | Shadow Arrows | 7 | > >> | dead |
| 40 | Even Keel | 8 | - | dist |
| 41 | Quarantine | 5 | - | notrick |
| 42 | Cascade | 8 | 1 2 3 | - |
| 43 | Deep Bloom | 8 | - | - |
| 44 | Ghost Relay | 8 | - | dead-late2 |
| 45 | Five Seals | 8 | 1 2 3 4 5 | - |
| 46 | Blind Shares | 8 | - | dist-dead |
| 47 | The Last Lantern | 9 | Ω | - |
| 48 | The Captain's Wager | 3 | - | decide |
| 49 | Riptide Arrows | 9 | > >> >>> | dead |
| 50 | The Signal's Heart | 7 | Ω | nocomm |
