# Lantern Dive: story (W390)

Single data file for Story mode text: `campaign.json` (cast, 3 acts, per-chapter `intro` / `outro` scenes). The tutorial prologue lines live in `game/src/ui12.js` (`tutSteps()`, one `say` per step).

## Cast
- **Chief Ottilie Brack** (`brack`)
- **Nerea** (`nerea`)
- **Bram** (`bram`)
- **Sumi** (`sumi`)
- **Dag** (`dag`)
- **Echo** (`echo`)
- **The Grey Undertow** (`undertow`)
- **The Thousand Turns** (`maze`)
- **The Lampless One** (`lampless`)

Guide: **Chief Ottilie Brack** runs Saltmere Base and teaches the prologue. Rival with a reason: **Dag** (new too, wants the first-trick job and teases you) and **Sumi** (finds the carved stones that start the story).

## Arc

### Act 1: The Bay
Learn to dive as a team: one job each, one trick at a time.

- **1. Training Day**: Welcome to Saltmere Base. Before you dive for real, one small job in the bay.
- **2. Stones in the Net**: Two jobs this time. The Commander picks first, then each diver in turn.
- **3. Five Chambers**: The base is ours now. Check all five chambers before we move in.
- **4. The Grey Undertow** (boss): The stones lead to an old wreck, and a grey current wraps around it.

### Act 2: The Carved Wreck
The tablets point to a wreck, and the wreck points somewhere deeper.

- **5. The Inscription**: The tablet is carved in signs nobody knows. One diver should study it alone.
- **6. Whispers**: The base radio answered the tablet's pattern. Something down there is listening.
- **7. The Thousand Turns** (boss): The tunnels fork again and again, and the radio drops out every few metres.

### Act 3: The Drowned Road
Follow the paved sea floor to the place the carvings warned about.

- **8. The Sunken Archive**: At the start of the road: rooms full of stone shelves. Nobody we know built them.
- **9. The Paved Road**: The road runs on into the dark. Fourteen points of jobs, the biggest load yet.
- **10. The Lampless One** (boss): Lanterns. So many little lanterns. Down here they all go out.

## Prologue (tutorial) beats
Brack opens ("Saltmere Bay"), Dag claims the first-trick job and teases, the first try fails on purpose ("Net snags!"), the second try frees the nets, Sumi grins at the Lantern, Brack signs the logbook; the end card leads into chapter 1 (the carved stones). Exact lines: see TUTORIAL-COVERAGE.md.

## Not done (time box)
- Loss variants of chapter outros (campaign.json has win outros only; a loss variant needs a small story-UI change).
- Quick game flavour intro and result line in the game's voice.
- Tutorial text still lives in ui12.js, not in campaign.json.
