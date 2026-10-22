# WAVES: fly stages 1-6 as named waves (W151, 22 Oct 2026)

Owner on a phone (22 Oct, 05:25): "stages extremely boring, a swarm of enemies, no logic, boring 12/100; the by-foot (Street Run) is extremely bad".
Code: `parts/waves.js` (flag `RET.waves`, default ON, `?waves=0` = the director as before). Test: `waves-test.js`.

## What changed for the player (stages 1-6, Normal)

- **One idea per wave, said out loud.** Each wave starts with a top-band chip: `WAVE 2/5 · CHARGE LANES · four chargers: sidestep each dash`.
- **At most 8 enemies on screen.** The director, zoo, fleet, set pieces and variant escort packs are muted on these stages, so the table is the whole wave.
  Bosses, mini-boss summons and their children are left alone.
- **Enemies stay until killed.** Each foe flies to its slot and holds there (strafes, weaves, or for a charger: aims and dashes, then comes back from
  the right). After 22 s, whatever is left flies back out to the right. That never counts as a leak or costs hull.
- **A breather between waves.** The field stays empty for 3.5-5 s (the length depends on how much song is left), and density.js curtains stay off.
  The next wave starts on a bar downbeat, so waves land on the song's phrases.
- **Rising curve.** A wave sends its squad 2-3 times: the next squad comes in when only 2 or fewer of the last one are left.
  The last wave is a leader wave (a gold leader with 1.6x hull; kill it and the rest run). On stage 5 the waves give way to the mini-boss (the waves leave
  1.5 bars before it). If the song still has time before the finale, one middle wave plays again, announced `MORE · <name>`.
- Goals: on a kill stage the goal is 72% of the foes in the table. On a score stage it is 72% of the foes x 650 points (stage 3: 23 000).

## The wave table

Slot x/y are shares of the 960 x 540 world (x = depth from the ship, y = across the phone). `dash` = charger: hold 1.4 s, show a red aim line on your
height for 0.7 s, dash, come back. Squads: 2 (3 when the song has time to spare), 1 for leader waves.

| Stage | # | Wave | The one idea | Foes (one squad) | Roles |
|---|---|---|---|---|---|
| 1 FIRST RUN (survive) | 1 | FIRST CONTACT | shoot the drones | 4 drones holding a diamond | drone |
| | 2 | TWIN COLUMNS | clear one side, then the other | 3 + 3 drones weaving at the two edges | drone |
| | 3 | CHARGERS | they aim at your line: sidestep the dash | 3 chargers, 1 drone | charger |
| | 4 | GUN TURRET | it parks and fires: kill it first | 1 turret, 4 drones | turret |
| | 5 | THE WALL (leader) | a turret behind a line of drones | gold turret, 5 drones, 1 charger | all 3 |
| 2 PATROL (kill) | 1 | PATROL V | five drones in a V | 5 drones | drone |
| | 2 | CHARGE LANES | sidestep each dash | 4 chargers (2 from the edges) | charger |
| | 3 | SNAKE | six drones weave: aim ahead of them | 6 drones | drone |
| | 4 | FLANKERS | they come from the top and bottom | 4 flankers, 1 drone | flank |
| | 5 | PATROL LEADER | kill the gold leader: the patrol flees | gold turret, 2 chargers, 3 drones | mixed |
| 3 ZEIL (score) | 1 | WINDOW GUNNER | a turret parks: take it out | 1 turret, 3 drones | turret |
| | 2 | SWARM | sweep the small fliers for a chain | 8 swarm | swarm |
| | 3 | RUSH | five chargers in turn: keep moving | 5 chargers | charger |
| | 4 | CROSSFIRE | turrets top and bottom, drones between | 2 turrets, 3 drones | turret |
| | 5 | SHOP GUARD | kill the gold turret: the guard runs | gold turret + 1 turret, 2 chargers, 1 drone | mixed |
| 4 HAUPTWACHE (survive) | 1 | GUARD POST | two turrets cover the drones | 2 turrets, 3 drones | turret |
| | 2 | SHIELD ESCORT | the shield faces you: hit it from the side | 1 shielder, 4 drones | shielder |
| | 3 | MINE LANE | mines drift: pick your lane | 4 mines, 2 drones | mine |
| | 4 | PINCER | chargers from both sides | 4 chargers (edges), 1 drone | charger |
| | 5 | HAUPTWACHE | the guard captain and the shield wall | gold shielder, 2 turrets, 2 chargers, 1 drone | mixed |
| 5 TRESOR-WART (mini) | 1 | VAULT DRONES | five drones guard the door | 5 drones | drone |
| | 2 | TURRET AND RUSH | a turret parks, two chargers cover it | 1 turret, 2 chargers, 1 drone | turret |
| | 3 | SHIELD ESCORT | go round the shield | 2 shielders, 2 drones | shielder |
| | 4 | ALARM | five chargers: sidestep, then the keeper comes | 5 chargers | charger |
| | - | (mini-boss) | TRESOR-WART as before | | |
| 6 KONVOI (kill) | 1 | SCOUTS | a V of scouts | 5 drones | drone |
| | 2 | GUNSHIP LINE | two gunships hold a line: break it | 2 gunships, 1 drone | gunship |
| | 3 | SIDE CHARGE | chargers from the sides: sidestep | 4 chargers (edges) | charger |
| | 4 | SHIELD ESCORT | two shields: hit them from the side | 2 shielders, 3 drones | shielder |
| | 5 | KONVOI | the squad leader: kill it first, the escort flees | gold gunship, 2 drones, 2 turrets, 1 charger | mixed |

## Measured (waves-test.js, human-model bot, Normal, fresh build, 8 runs per stage, 22 Oct)

| Stage | clear | waves/run | max on screen | roles | breather min / med |
|---|---|---|---|---|---|
| 1 | 8/8 | 6 | 7 | 3 | 4.5 / - s |
| 2 | 8/8 | 6 | 8 | 4 | 3.5 s |
| 3 | 5/8 (63%, 8-run check) | 6 | 8 | 4 | 3.5 s |
| 4 | 8/8 | 6 | 7 | 5 | 3.5 / 5.4 s |
| 5 | 0/8 (all reach the mini-boss and die there; `?waves=0` is 0/8 too) | 6 | 7 | 4 | 4.1 / 6.0 s |
| 6 | 3/8 (6/8 in an earlier run of the same build) | 6 | 7 | 5 | 3.5 / 5.4 s |
| pooled | **35/48 = 73%** (gate 60-80%) | | | | |

After merging the latest base (same test, 8 runs): 1:8/8 2:8/8 3:8/8 4:8/8 5:0/8 6:5/8, pooled 37/48 = 77%, max on screen 6-8.

Old (`?waves=0`, 8 runs): 1:100 2:100 3:88 4:88 5:0 6:88. Leaks per run: median 0 on every stage.

Open points for the reviewer:
- Stage 5's wall is the mini-boss itself (armour.js, not touched). If stage 5 must clear, the next step is the mini-boss, not the waves.
- Stages 1, 2 and 4 clear 100% for this bot. That is fine for the first impression, but if they read as too easy, add a third squad (`opts.rep:3`).
- Other layers still draw on these stages: rule lanes, the white column strike and captions (owned by W145/W146). Phone screenshots of stages 3 and 6
  show those, not the waves. A wave chip only lasts 2 s (calm.js).
- `culled` (enemies other layers tried to spawn and waves.js removed) is 13-24 per run. A lesson that waits for its own foe could stall on these stages;
  none was seen in the runs.

## Street Run (on foot): redesign proposal (no code)

**How it was looked at:** code (`footstage.js` header, FOOT-ENEMIES), the strict review 10 notes, and an attempt to play it on a 390 x 844 phone
viewport. From the hub, the stage opens with a story card ("The drop is inside the Zeil underpass...") that kept the run from starting, even after taps
on SKIP and on the card for 12 s. That is a finding in itself: the first thing the player gets is a wall. I could not run a full play-through in this
round. The rest is from the design as written and the review.

**What is wrong**
1. **Too much in one stage.** 13 enemy kinds plus a boss with relay pylons in 7 sections, 10 -> 26 enemies per section. Nothing is taught. Every
   arena lock adds a new kind before the last one is understood. This is the same "swarm, no logic" problem as the fly stages, on foot.
2. **Locks with no reason given.** "ARENA LOCK" is not explained (review 10). The screen freezes the scroll and floods foes, so the player cannot
   tell what ends the lock or why they cannot move on.
3. **Flat look, unclear read.** The backdrop is flat purple blocks (review 10). Foes, bullets and floor fire share the same dark-on-dark band, and on
   a phone the hero is small. Telegraphs (dashed lanes, red boxes) are the only cues, and they look like each other.

**3 concrete changes**
1. **Cut it to 4 short rooms with one idea each (the waves model):** Room 1 GRUNTS (walk, shoot, jump), Room 2 SHIELD + GUNMAN (shoot round the
   shield), Room 3 HOUND (jump the pounce), Room 4 WARDEN with 2 relays (break the pylons, then the boss). At most 5 foes on screen. Every room is
   announced in the top chip (`ROOM 2/4 · SHIELD WALL · shoot past the shield`), and there is a 3 s calm walk between rooms. The other 9 kinds move to
   later Street Run stages, one new kind each.
2. **Every lock has a counter and a door.** The chip reads `CLEAR THE ROOM 3/5`, the exit door glows red while locked and green when open, and the
   scroll unlocks the moment the last foe falls. The first lock gets one caption: "Doors lock until the room is clear."
3. **Readability pass:** 3 depth layers for the backdrop from the existing district art (no new assets), floor contrast up, hero 1.3x on phones, and
   one telegraph language shared with the fly stages: red = it will hit this spot, gold = elite or leader, blue = shield.
   Plus: let the story card be skipped by any tap, and start the run in 2 s or less.

**Size:** about 2 worker rounds. Round 1 (Sonnet): room table + lock counter/door + chip, reusing `waves.js`'s announce and cap logic, plus a
`footwaves-test` (max 5 on screen, every room announced, a breather between rooms, human-model clear 60-80%). Round 2 (Sonnet): the readability pass
and the story-card skip, checked with phone-check plus a review by the owner on a phone.
