# Nebula Aces: rules notes

A browser adaptation of the mechanics of the original game (1st edition, 2012). Every name, ship design, card text and piece of art is original, for copyright reasons. The numbers and rules follow the 1st-edition game.

**Sources:**
- Ship, pilot, upgrade and damage-deck numbers come from an open-source data set (source kept in the private research repo).
- Template geometry comes from a 1e Tabletop Simulator mod and a Vassal module's code (sources kept in the private research repo).
- Rules text comes from a transcribed 1e rules summary.

The original publisher's official PDFs and the board-game catalogue site were blocked by the network proxy, so the rulebook wasn't read directly. Tags: **[confirmed]** means two sources agree; **[H]** means my interpretation; **[orig]** means an original design.

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
- **[G5] Barrel roll:** the speed-1 template against the side of the base, anywhere along it (Rules Reference wording).
  - Small base: the template's short end touches the side, so the centre moves 80 mm sideways and may slide up to ±10 mm fore/aft.
  - Large base: the template's long edge touches the side, so the centre moves 100 mm sideways, sliding up to ±20 mm. Large ships can barrel roll (only through Snap Roll in waves 1–3).
  - **[H]** The slide is offered in 5 steps per side (flush forward, half, centred, half, flush back) rather than continuously.

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
- **[R9] Initiative:** the side with fewer squad points has it. On a tie one player rolls an attack die: on a hit or crit that player chooses who has initiative, otherwise the other player chooses (asked of a human; the computer takes it). Later tournament rules let the lower side choose; this uses the 2012 rule.
- **Winning:** destroy every enemy ship. If both sides' last ships are destroyed at the same time, the side with initiative wins [confirmed, 1e rulebook].
- **Round limit:** 1e has none (tournaments use a clock). A safety cap of 100 rounds stops a game that can't end; it is then decided on points destroyed. No test game has come near it.

## Setup [27]
1. **Initiative** is settled first (above).
2. **Asteroids:** the players take turns placing the 6 asteroids, the initiative player first (tournament order; the core booklet has one fixed faction start). Each must be beyond range 2 of every edge and beyond range 1 of every other asteroid (tournament spacing rule).
   - **[H]** A human places each asteroid on one of 25 grid spots (5 × 5 over the legal centre area); the computer places its own at a random legal spot. Shapes are original irregular polygons 44–80 mm across **[orig]**.
3. **Deployment:** ships are placed one at a time in ascending pilot skill, the initiative player first on ties, each entirely within range 1 of its own edge.
   - **[H]** A human picks one of 9 positions along the edge; ships face straight at the enemy (1e allows any facing). The computer uses evenly spaced positions.

## Maneuvers
- **[R4] Stress:** a stressed ship can't perform actions, not even free ones. If it reveals a red maneuver, the opponent picks any non-red maneuver on its dial: a human opponent is asked; the computer picks the one that is worst for that ship.
  - **Order at reveal [H]:** the ship's own "when you reveal" choices (bomb drop, bank switch, Navigator, Adrenaline Rush) come first, then the stressed-red check on the result. So a stressed ship can use Adrenaline Rush on a red maneuver, as the card is usually played.
  - **Maneuver colour:** cards that make maneuvers green (R2-type mech, Copilot Nib) apply first, then Engine Stutter makes turns red, then Adrenaline Rush makes red white **[H: order]**. The dial in the planning screen shows these effective colours.
- **[R5] Bumping:** a ship that would end overlapping another moves back along its template until it just touches, then skips its action. A bumped K-turn doesn't rotate. Touching ships can't attack each other.
- **[R6] Edge:** any part of the base outside the play area destroys the ship.
- **[R7] Asteroids:**
  - There are 6 asteroids, placed during setup (above).
  - If the template or the final base overlaps an asteroid, the ship skips its action and rolls 1 attack die per asteroid: a hit deals 1 damage, a crit deals 1 critical.
  - A ship whose base is on an asteroid can't attack.
  - An attack whose line crosses an asteroid is obstructed: +1 defence die.

## Combat [confirmed]
- **[R1] Attack die:** 3 hit, 1 crit, 2 focus, 2 blank. **[R2] Defence die:** 3 evade, 2 focus, 3 blank.
- **Range bonuses:** range 1 gives +1 attack die and range 3 gives +1 defence die, for primary weapons only.
- **Tokens:** focus turns every focus result into a hit (attack) or an evade (defence). An evade token adds one evade result. A target lock lets the attacker reroll any attack dice it chooses.
- **Rerolls:** the player chooses which dice to reroll (up to the card's limit), and a die can be rerolled only once per attack. A die changed by the Jamming Array can't be rerolled.
- **Cancelling:** evades cancel hits before crits.
- **[R12] Damage:** shields absorb first. Then hits are dealt face-down damage cards and crits face-up cards. A ship is destroyed when its damage reaches its hull (a *Hull Rupture* card counts 2).
- **Modifying the attack dice:** the defender modifies the attack dice first (Slippery, Jamming Array), then the attacker; then the defence dice are rolled and modified.
- **A hit:** an attack hits if at least one hit or crit is left after cancelling. An ion hit counts as a hit (it cancels its dice after dealing its damage), so gunners don't fire again after it and a Stealth Device is lost.
- **Destroyed ships:** a ship is destroyed as soon as its damage reaches its hull; its damage cards go to the discard pile and locks on it are removed.

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

## Core set content (our names, 1e numbers)
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
- **Turrets and rear arcs** use the 1e arc shapes. The Warden gunship's rear (auxiliary) arc is for its primary weapon only; its cannons, missiles and torpedoes fire from the front arc. A turret ship's *firing arc* (for "Shiv") is its front arc. **Large bases:** 80 mm, same templates.
- **Bombs:** dropped behind the ship with the straight-1 template. Quake charges and plasma bombs detonate at the end of the Activation phase (range 1). A plasma bomb deals its faceup card straight to the ship, past its shields. A contact mine detonates when a base or template touches it (3 attack dice).
- **One of each action per round:** a ship can't perform the same action twice in a round, including free actions (a free focus, Wing Leader's or Lark Castellan's gift, Tarn Vessor's move, Snap Roll's barrel roll, Redline).
- **Target locks:** acquiring a lock replaces the old one. With Fire-Control Tech a ship keeps 2 (1 per enemy); a new lock replaces the older one **[H]**, and the tech's second lock on a different ship is optional. Brannoc Dale's friend and the Tracking Computer *acquire* locks (not an action), so stress doesn't stop them.
- **Unique characters:** a pilot and a crew card of the same character (three such characters in the original sets) share one name, so only one of them can be in a squadron.

**Every optional choice is the player's.** Human players are asked (through the same question mechanism the tests drive); the computer decides for its own ships with the heuristics in `ai.js`. That covers:
- reveal-time choices (Early Warning Sensors, bomb drops, Bram Voss's bank switch, Navigator, Adrenaline), the opponent's pick for a stressed ship, the Spotter's peek;
- which dice to reroll (target lock, Horace Venn, "Wailer", Krell Tavish, Iveth Sarn, Captain Joren, Flight Instructor) and which die Slippery forces;
- free actions (Nightjar, Lark Castellan and his chosen ship, Wing Leader's ship, Tarn Vessor, Redline), Snap Roll's lock removal;
- who gets a passed token or boost (Garrick Dray, Kellan Stroud, Colonel Varek, Quill Marren, Pack Tactics, Brannoc Dale and its lock), Juno Arlen's extra die, Captain Orrin taking a friend's stress;
- paying a lock cost with focus (Snapshot Eye), Fire-Control Tech's second lock, the Tracking Computer, Take the Heat, Inquisitor Vell, the gunners' bonus attack and its target, Varn Kessik's damage-card choice, Brakk, Munitions Jam's weapon, Mech "Scrapper".

**What is still interpreted or simplified [H]:**
- **Damage outside attacks:** Brakk, the Munitions Jam weapon and a flipped Saboteur card are asked only for damage from attacks. For damage from asteroids, bombs, mines, fire and similar, the owner's choice is made by the computer heuristic (Brakk is kept for a nasty faceup card or a killing blow).
- **Captain Orrin:** a human is asked at the next safe point (after the maneuver, action, dice step or attack in which the stress arrived), not in the middle of dealing damage.
- **Sorin Vael** always takes the focus token: the card says "may", but there is no downside. Mech "Tinker" always recovers the shield for the same reason.
- **After-attack order:** automatic effects, then the second Swarm Missiles attack (against the same ship), then the Tracking Computer, Inquisitor Vell, Tarn Vessor's move, and last a gunner's bonus attack. With Swarm Missiles the optional after-attack effects are offered once, after the second attack.
- **Redline** is offered only in the ship's own action step, not after free actions granted at other times.
- **Wing Leader** chooses a friendly ship, and the chosen ship can't use Wing Leader itself (no chains).
- **Early Warning Sensors:** the computer never uses it (it keeps its action for after the move).
- **Tomas Brink** uses the 2012 wording, without the later once-per-game errata.

**Squad builder:** choose "Custom squads" to build both sides (100 points, unique names once, slots per pilot, title slots added by titles), or randomize. Lists are remembered in the browser.

## Not in this version
- The core-set scenario missions, waves 4+ (the Void Syndicate faction, cloaking, epic ships), and online play.

## Computer players and balance (headless self-play)
- **Planning:** dials are secret, so each computer ship scores every maneuver on its dial against sampled guesses of the enemy's maneuvers. The score weighs expected damage dealt against damage received, plus penalties for asteroids, bumps, the board edge and stress.
  - Normal draws 6 samples per enemy.
  - Hard draws 14 samples and also looks one move further ahead.
  - Easy adds noise.
- **Tuning:** the planning weights were tuned with the gauntlet. Lowering the "fear of return fire" weight from 1.25 to 0.8, scaled down for tougher ships, stopped heavy fighters running from swarms.
- **Choices:** the computer makes every optional choice itself (`ai.js`): which dice to reroll (blanks, and focus it can't convert), who gets a passed token or lock (a friend with a shot that hasn't fired), Brakk (kept for a nasty crit or a killing blow), Captain Orrin (takes stress only while unstressed), Tarn Vessor's move (only if clearly safer), and so on. It uses a Spotter's peek when choosing its action.
- **Results after the rules fix pass (Normal vs Normal, 60 games each):**
  - **Core duel:** Free Compact 40, Iron Armada 20; 12.5 rounds on average (3–27). The pre-fix build gives 43–17 on the same test, so the heavy fighter's edge was already there. The "30–30" recorded earlier came from an older build and no longer holds.
  - **All expansions, Standard 100:** Compact 33, Armada 27; 11.4 rounds on average (4–18).
- **Hard vs Normal:** an older measurement (55%, not significant) was taken before the fix pass and has not been re-run.
- **Tests (fix pass):** 0 errors, 0 invariant violations and 0 stalls in both 60-game gauntlets. `cover.js` forced every pilot with an ability and every upgrade into computer battles with 0 errors. `coverh.js` played hot-seat games through `validMoves`/`performMove`, with every pilot and upgrade forced in, and got 0 errors and 0 rejected moves; every question type came up. `unit.js` has 27 targeted rule checks (including the effects the computer rarely triggers: Swarm Missiles, the Burst Missiles splash, Snapshot Eye, Krell Tavish, Major Rhane, Rapid Blaster, Saboteur). The DOM clicker (`trace.js`) played solo and hot-seat games (0 rejected), and Playwright games ran in Chromium at desktop and phone size with no console errors.
