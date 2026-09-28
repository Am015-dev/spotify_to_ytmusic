# Nebula Aces: rules notes

A browser adaptation of the mechanics of *Star Wars: X-Wing Miniatures Game* (1st edition, 2012; BGG 103885). Every name, ship design, card text and piece of art is original, for copyright reasons. The numbers and rules follow the 1st-edition game.

**Sources:**
- Ship, pilot, upgrade and damage-deck numbers come from `guidokessels/xwing-data`.
- Template geometry comes from the 1e Tabletop Simulator mod (`tjakubo2/xwing_traj`) and the Vassal module code.
- Rules text comes from a transcribed 1e rules summary.

The official FFG PDFs and BoardGameGeek were blocked by the network proxy, so the rulebook wasn't read directly. Tags: **[confirmed]** means two sources agree; **[H]** means my interpretation; **[orig]** means an original design.

## Geometry [confirmed]
- **[G1] Play area:** 914 mm square. Bases are 40 mm (small) and 80 mm (large).
- **[G2] Range bands:** 100 mm each (range 1 = 0–100, 2 = 100–200, 3 = 200–300), measured closest point to closest point. For attacks, the distance is to the closest part of the target that lies inside the arc.
- **[G3] Templates:**
  - Straights are 40 mm × speed.
  - Banks are 45° arcs with centreline radius 80 / 130 / 180 mm.
  - Turns are 90° arcs with radius 35 / 62.5 / 90 mm.
  - A K-turn is the straight of the same speed, then a 180° rotation.
- **[G4] Moving along a template:** the rear-edge midpoint of the base follows the template centreline, with the heading tangent to it. That's how partial moves (backing up) are placed.
- **[R14] Firing arcs (1st edition):**
  - Small base: the lines start 2.95 mm inside the front corners and open to 80.9°.
  - Large base: 3.95 mm inside, 84.05°.
  - A turret covers 360°. An auxiliary arc adds the mirrored rear arc.
- **[G5] Barrel roll:** the speed-1 template against the side of the base. **[H]** The ship may end flush forward, centred or flush back (±10 mm), because the 2012 wording on sliding is unclear.

## Round [confirmed]
1. **Plan:** every ship's dial is set secretly. The computer never reads a human's dials. Hot-seat shows a pass-the-device screen between players.
2. **Activation:**
   - Ships go in ascending pilot skill; on a tie, the side with initiative goes first.
   - Each ship reveals and executes its maneuver: red gives 1 stress, green removes 1.
   - It then performs one action.
3. **Combat:**
   - Ships go in descending pilot skill, and each may attack once.
   - Ships with equal pilot skill fire simultaneously: a ship destroyed by an equal-skill attacker still fires.
4. **End:** unused focus and evade tokens are removed. Target locks and stress stay.
- **[R9] Initiative:** the side with fewer squad points has it (ties are random). **[H]** In the 2012 book the lower side *has* initiative; later tournament rules let it choose.

## Maneuvers
- **[R4] Stress:** a stressed ship can't perform actions. If it reveals a red maneuver, the opponent picks any non-red maneuver for it. The computer always picks the worst one for that ship, even when a human is the opponent. **[H: automated choice]**
- **[R5] Bumping:** a ship that would end overlapping another moves back along its template until it just touches, then skips its action. A bumped K-turn doesn't rotate. Touching ships can't attack each other.
- **[R6] Edge:** any part of the base outside the play area destroys the ship.
- **[R7] Asteroids:**
  - There are 6 asteroids. **[H]** They're placed randomly, beyond range 2 of the edges and beyond range 1 of each other (1e players place them alternately). Their shapes are original irregular polygons 44–80 mm across. **[orig]**
  - If the template or the final base overlaps an asteroid, the ship skips its action and rolls 1 attack die per asteroid: a hit deals 1 damage, a crit deals 1 critical.
  - A ship whose base is on an asteroid can't attack.
  - An attack whose line crosses an asteroid is obstructed: +1 defence die.

## Combat [confirmed]
- **[R1] Attack die:** 3 hit, 1 crit, 2 focus, 2 blank. **[R2] Defence die:** 3 evade, 2 focus, 3 blank.
- **Range bonuses:** range 1 gives +1 attack die and range 3 gives +1 defence die, for primary weapons only.
- **Tokens:** focus turns every focus result into a hit (attack) or an evade (defence). An evade token adds one evade result. A target lock rerolls any attack dice.
- **Cancelling:** evades cancel hits before crits.
- **[R12] Damage:** shields absorb first. Then hits are dealt face-down damage cards and crits face-up cards. A ship is destroyed when its damage reaches its hull (a *Hull Rupture* card counts 2).
- **[H] Modifying the attack dice:** in 1e the defender may modify the attack dice first. The core set has no such effects, so only the attacker modifies them here.

## Damage deck (33 cards; names and texts are original [orig]; effects follow 1e)
- 7 × Hull Rupture (counts 2 damage).
- 2 each of:
  - Flash Blindness (next attack rolls no dice);
  - Cockpit Fire (roll each combat phase; repairable);
  - Shattered Canopy (pilot skill 0 from the next round);
  - Engine Stutter (turns are red);
  - Sensor Blackout (no action-bar actions; repair roll);
  - Wounded Pilot (ignore the pilot ability and Talents);
  - Secondary Blast (roll at once);
  - Hull Breach (roll after each red maneuver);
  - Munitions Jam (lose a secondary weapon);
  - Buckled Frame (−1 agility; repair roll);
  - Concussed Pilot (1 damage after overlapping a ship or asteroid);
  - Thruster Flare (1 stress);
  - Weapon Glitch (−1 primary; repair roll).
- Each card has a Ship or Pilot trait, matching the original deck.

## Core set content (original names, 1e numbers)
- **Lancer heavy fighter:** 3 attack, 2 agility, 3 hull, 2 shields. Actions: focus and target lock. Its dial matches the heavy fighter's dial exactly.
- **Talon light fighter:** 2 attack, 3 agility, 3 hull, 0 shields. Actions: focus, barrel roll and evade.
- **Pilots:** 10, each keeping the original pilot skill, points and ability:
  - Kael Varro (8, 28): focus → evade when defending.
  - Tomas Brink (5, 25): friends at range 1 can't be attacked if the attacker could attack him. This is the 2012 wording, without the later once-per-game errata.
  - Ember Squadron Pilot (4, 23).
  - Cadet Pilot (2, 21).
  - "Knifepoint" (7, 17): +1 attack die at range 1.
  - "Hex" (6, 16): attackers can't spend focus or reroll.
  - "Nightjar" (5, 15): free focus after a green maneuver.
  - Onyx Squadron Pilot (4, 14).
  - Slate Squadron Pilot (3, 13).
  - Drill Wing Pilot (1, 12).
- **Upgrades:**
  - Plasma Torpedoes (4): attack 4 at range 2–3; needs and spends a target lock; one focus becomes a crit.
  - Mech "Tinker" (4): +1 shield after a green maneuver.
  - Mech "Juke" (3): action, +1 agility this round.
  - Iron Will (1): Pilot-trait crits are discarded.
  - Deadshot Focus (3): action; one focus becomes a crit and the others become hits.
- **Battle sizes:**
  - **Core duel:** the core-set learning battle, Kael Varro with torpedoes and Tinker (36 points) against "Knifepoint" and a Slate pilot (30 points).
  - **Skirmish 60** and **Standard 100:** random legal squadrons, with each unique name used at most once.

## Expansions: waves 1–3 (toggle on the start screen) [confirmed numbers; names, texts and ship designs are original]

**Ships (10 new classes; first-edition stats and dials):**
- **Wave 1:** Anvil assault bomber (2/1/5/3; focus, target lock) and Talon Prime (2/3/3/2; focus, target lock, barrel roll, evade). More Lancer and Talon pilots.
- **Wave 2:**
  - Needle interceptor (2/3/2/2; boost, evade).
  - Razor interceptor (3/3/3/0; barrel roll, boost, evade).
  - Longhaul freighter: large base, **360° primary turret**, 3/1/8/5. The generic pilot has 2/1/6/4.
  - Warden gunship: large base, **front and rear arcs**, 3/2/6/4.
- **Wave 3:**
  - Keel strike fighter (3/1/3/5).
  - Kestrel courier (1/2/4/1; a 5-column dial with no K-turn).
  - Talon Maul bomber (2/2/6/0).
  - Herald shuttle: large base, 3/1/5/5, with a red **full stop** (speed 0) maneuver.

**Pilots:** 47 more, 57 in all, each with its first-edition pilot skill, cost and ability.

**Upgrades:** 57 in all. They include:
- turrets, cannons, torpedoes and missiles (including the two-shot, splash, ion and uncancellable-hit weapons);
- quake charges, plasma bombs and contact mines;
- crew, systems, talents, mechs, 4 ship titles and 4 modifications.

Every ship has 1 modification slot; ships with a title card also get a title slot.

**Rules that come with them:**
- **Ion:** an ionised ship flies a white straight 1 instead of its dial. A large ship needs 2 ion tokens [R15].
- **Turrets and rear arcs** use the 1e arc shapes. **Large bases:** 80 mm, same templates, no barrel roll.
- **Bombs:** dropped behind the ship with the straight-1 template. Quake charges and plasma bombs detonate at the end of activation (range 1). A contact mine detonates when a base or template touches it (3 attack dice).
- **Defender first:** the defender may modify the attack dice before the attacker does (1e order), for the jamming array and Slippery.
- **Your choices:** optional reveal-time effects (bomb drops, the gunship pilot's bank switch, Navigator, Adrenaline, early warning sensors), Take the Heat and Inquisitor Vell are **asked** of human players. The computer decides them for its own ships.
- **[H] Automated choices:** where an ability needs a choice the rules give no other time for, the engine picks for everyone. That covers which friendly ship gets a passed focus, lock, pilot-skill boost or free action, and which card the "choose 1 of 3" pilot deals.

**Squad builder:** choose "Custom squads" to build both sides (100 points, unique names once, slots per pilot, title slots added by titles), or randomize. Lists are remembered in the browser.

## Not in this version
- The core-set scenario missions, waves 4+ (the Void Syndicate faction, cloaking, epic ships), and online play.

## Computer players and balance (headless self-play)
- **Planning:** dials are secret, so each computer ship scores every maneuver on its dial against sampled guesses of the enemy's maneuvers. The score weighs expected damage dealt against damage received, plus penalties for asteroids, bumps, the board edge and stress.
  - Normal draws 6 samples per enemy.
  - Hard draws 14 samples and also looks one move further ahead.
  - Easy adds noise.
- **Tuning:** the planning weights were tuned with the gauntlet. Lowering the "fear of return fire" weight from 1.25 to 0.8, scaled down for tougher ships, stopped heavy fighters running from swarms.
- **Core duel, Normal vs Normal:** 30–30 over 60 games. Average length is about 9–10 rounds (2–20).
- **Standard 100 (random squadrons), Normal vs Normal:** the Iron Armada won 37–23 (62%) over 60 games. Its swarms of about 7 light fighters beat 4 heavy fighters, consistent with early-1e experience, where light-fighter swarms were strong. I kept the numbers faithful rather than tune the rules.
- **Hard vs Normal (core duel, current weights):** Hard scored 66 wins to 54 over 120 games (55%, 95% interval 46–64%). The SPRT says "keep playing", so **Hard is not proven stronger than Normal**.
  - An earlier build showed 72%, but the later fix to Normal's timidity closed most of that gap. The two sets of results can't be pooled.
- **All expansions, Standard 100, Normal vs Normal:** Compact 26 wins, Armada 34 (43/57%) over 60 games; about 10–14 rounds per game. Ships left the mat about 0.7 times a game, mostly through legal forced moves (ion drift, and the opponent picking a stressed ship's maneuver).
- **Expansion coverage:** every expansion pilot and upgrade was forced into computer battles (2–3 each) with 0 errors. The effect counters show the weapons, bombs, mines, turrets, ion, dice modifiers, Redline, Snap Roll, Sabotage and the gunners all firing. A few rarely come up (Hairpin, the range-1 torpedo, Pack Tactics).
- **Tests:** 0 errors and 0 invariant violations across all gauntlet runs. The random clicker played solo and hot-seat games at both sizes (0 rejected moves), and full animated games ran in Chromium at desktop and phone size.
