# Bomb Busters: rules notes for implementation

These notes restate the rules of *Bomb Busters* (Hisashi Hayashi, Cocktail Games / Pegasus Spiele, 2024, BGG id 413246) in our own words, for a faithful browser build. Mechanics and numbers are exact where marked **[C]** (confirmed from a primary source: rulebook, official FAQ, or the printed card faces). Points marked **[G]** are our interpretation; they are all listed again in the "Confirmed vs. guessed" section at the end. Source keys such as RB, FAQ and CARD are defined in `sources.md`.

Original card and component names appear only as `ref` values in the JSON files. Here we use our own working names with the reference in brackets the first time a card is named.

---

## 0. Game facts (BGG and other listings)

| Field | Value | Source |
|---|---|---|
| Players | 2 to 5 (box). Some listings mention a 1-player variant (one person runs 2 stands); it is not in the rulebook | BGG listing via search snippet, Board Game Oracle, axross doc |
| Play time | about 30 min per mission | BGG snippet, Board Game Oracle |
| Age | 10+ | Board Game Oracle |
| Weight | 2.0 / 5 (2.01) | BGG snippet, Board Game Oracle |
| Mechanics | Communication Limits, Cooperative Game, Deduction, Memory, Once-Per-Game Abilities, Real-Time, Scenario/Mission/Campaign Game, Sudden Death Ending | Board Game Oracle (BGG mirror), BGG snippet |
| Category | Deduction | Board Game Oracle |
| Designer / artist | Hisashi Hayashi / Dom2D (Dominique Ferland) | RB credits |
| Campaign | 66 numbered missions: 8 in the open box, 58 in 5 sealed "surprise" boxes | RB, CARD 8/19/30/42/54 |

The BGG page itself returns 403 to automated fetches and the XML API now needs a token, so the BGG numbers come from search snippets and a BGG-data mirror. **[C-ish: two consistent secondary sources]**

---

## 1. Components

### 1.1 Base box (counts from the rulebook component list) [C]

| Component | Count | Notes |
|---|---|---|
| Wire tiles | 70 | see 1.2 |
| Tile stands (racks) | 5 | |
| Board with a detonator dial | 1 | Has a 1–12 validation track with marker slots between the numbers, a row of equipment slots and a spot for the mission card (bottom left) |
| Equipment cards | 12 | values 1–12, one each (section 6) |
| Character cards | 5 | 1 "Captain" + 4 others, all with the Double Detector (section 7) |
| Mission cards (large) | 8 | missions 1–8 |
| Info tokens | 26 | 2 per value 1–12 (24) + 2 "yellow" tokens [C: RB count + FAQ "the 2 existing tokens"] |
| Validation tokens | 12 | one per value |
| Markers | 7 | 4 yellow + 3 red; one face blank, the other face shows "?" |
| "=" token | 1 | for the equal-pair equipment (#12) |
| "≠" token | 1 | for the different-pair equipment (#1) |
| Surprise boxes | 5 | missions 9–19, 20–30, 31–42, 43–54, 55–66 |
| Resealable bags | 8 | |
| Hero standee | 1 | used only in mission 66 |
| Rulebook | 1 | has 3 blank spots (A, B, C) where rule stickers from the boxes are stuck later |

### 1.2 Wire tiles [C]

| Colour | Count | Printed values | In-game value |
|---|---|---|---|
| Blue | 48 | 1–12, 4 copies each | its number |
| Red | 11 | 1.5, 2.5, … 11.5 (one each) | just "red" |
| Yellow | 11 | 1.1, 2.1, … 11.1 (one each) | just "yellow" |

The decimals exist only so that a stand can be sorted: a red 7.5 sits between the 7s and the 8s, and a yellow 7.1 sits just after the 7s. Once play starts, every red counts as the same value "red" and every yellow as the same value "yellow". A red 7.5 is never "a 7" (for example, the radar equipment ignores it). [C: RB, FAQ #8]

### 1.3 Components found in the surprise boxes (from card faces) [C unless noted]

| Component | Count | First used | Notes |
|---|---|---|---|
| Mission cards | 58 (9–66) | | |
| Number cards | 12 (values 1–12) | M9 | box 9–19 |
| Sequence card | 1, two-sided: side A = "cut 2" icon, side B = "cut 4" icon | M9 (A), M16 (B) | box 9–19 |
| Extra equipment: yellow-unlock card | 1 | from M9 (rule sticker A) | unlocks when a pair of yellows is cut |
| Extra equipment: double-number cards 2-2, 3-3, 9-9, 10-10, 11-11 | 5 | from M55 (rule sticker C) | unlock when all 4 wires of that value are cut |
| New character cards | 4 (personal items: radar, swap, triple probe, two-value probe) | from M31 (rule sticker B) | non-captains may swap their character for one of these |
| "X" (unsorted) tokens | ≥5 [G count] | M20 | one per stand is needed, so ≥5 with 5 stands |
| Even/odd tokens | 2 kinds: "even" (2/4/6/8/10/12) and "odd" (1/3/5/7/9/11). Count unknown, at least enough for 1 per player plus failures [G] | M21 | |
| ×1 / ×2 / ×3 count tokens | 3 kinds, count unknown [G] | M24 | the ×1 token is also used by equipment 2-2 |
| Constraint cards | 12 (A–L) | M31 | section 8.2 |
| Challenge cards | 10 (numbered 1–10) | M55 | section 8.3 |
| Oxygen tokens | ≥30 [G: M63 with 5 players hands out 30] | M44 | |
| Robot standee ("Nano") | 1 | M43 | walks along the 1–12 validation track |
| Bunker card | 1, two-sided (2 floors of 3×4 squares) | M66 | |
| Rule stickers | 3 (A, B, C) | | A: yellow-unlock equipment joins the pile from M9 in missions with yellow wires. B: from M31, non-captains may use the new characters. C: from M55, the double-number equipment joins the pile and needs all 4 wires of its value cut |

The exact contents of each box and the token counts are not printed anywhere we could reach. The "first used" column is inferred from the mission cards. [G for per-box allocation]

---

## 2. Detonator dial [C: card art + 2 independent implementations]

The dial is a 7-segment wheel. Going clockwise toward the skull, the segments are: an extra purple segment (back-arrow and warning icon), then the 5-player, 4-player, 3-player and 2-player segments, then a blank segment, then the **skull**.

Model it as an integer "fuse" counter:

* **Start = number of players** (2..5). Missions 41, 55, 60 and 62 start at **1**. Mission 51 starts one step further away (players + 1; with 5 players that is the purple segment, 6).
* Each "advance" step does fuse −= 1. **At fuse = 0 the bomb explodes.** So with N players the team survives N−1 advances, and the Nth one ends the game.
* "Move back" steps do fuse += 1. The maximum is 6, the purple segment. **[G]**: we assume nothing can go past 6, and that ordinary missions cap at 5 as the TTS script does. The card text never says whether the rewind equipment can go past the starting segment, so allow it up to 6.

This agrees with the Tabletop Simulator script (Brawlboxgaming): position = player count, −1 per mistake, 0 = "KABOOM", missions 41/55/60/62 set to 1, mission 51 with 5 players set to 6. The bdiffuser repository uses max = player count, which is the same thing. A review's phrase "as many mistakes as players" is consistent if "mistakes" counts the fatal one.

---

## 3. Setup (base game; missions override)

1. **Pick a mission.** Missions get harder as the numbers rise. Play them in order (recommended, not required). Missions 1–3 are novice, 4–7 intermediate, and 8 is the exam; beating 8 opens box 9–19. [C]
2. **Captain.** Random for the first mission. After that the role passes **to the left** before every new mission, and also before a retry after a failure. [C] The Captain takes the Captain character card. Everyone else picks any other character card and lays it face up. [C]
3. The Captain reads the mission card and places it, rules side up, at the bottom left of the board. [C]
4. **Stands per player** [C: RB table + quick reference + BRDGMZ]:

   | Players | Captain | Each other player |
   |---|---|---|
   | 2 | 2 stands | 2 stands |
   | 3 | 2 stands | 1 stand |
   | 4 | 1 stand | 1 stand |
   | 5 | 1 stand | 1 stand |

   So there are always 4 or 5 stands: 2p = 4 stands, 3p = 4 stands, 4p = 4 stands, 5p = 5 stands.
5. **Build the wire pool** [C]:
   * Blue: all 48, except missions 1–3 (M1 uses values 1–6 = 24 tiles, M2 1–8 = 32, M3 1–10 = 40).
   * Red/yellow, "x N": draw N tiles of that colour at random. Turn the matching markers **blank side up** on the board slots for those values, so their sort values are public. Then shuffle the tiles in face down.
   * Red/yellow, "N out of M": draw M tiles of that colour at random and show them. Place M markers **"?" side up** on their slots. Shuffle the M tiles face down, put N of them into the pool unseen, and set the other M−N aside unseen. Everyone knows the M candidate values but not which N are in play.
   * Some missions restrict which values can be drawn (M2: yellow from 1.1–7.1; M3: red from 1.5–9.5; M46: yellows fixed at 5.1/6.1/7.1/8.1).
   * The 7 markers (3 red + 4 yellow) cap what the board can show. M54 uses all 11 reds but does not mark them.
6. **Deal** all wires face down, round-robin **per stand**, as evenly as possible. Some stands get one more tile. [C] We deal starting at the Captain's (first) stand and going clockwise. **[G]**: the start point for the extra tiles is not specified.
7. **Sort**: each player stands their tiles facing themselves, in ascending order left to right (using decimals for red/yellow). A player with 2 stands sorts each stand separately. **The two stands together are one "hand"** for every rule, equipment and info purpose. [C]
8. **Board**: draw at random as many equipment cards as there are players and place them in slots in the "locked" position (pushed down). This is the only equipment available for the mission. Set the dial for the player count. Put all info tokens and the 12 validation tokens in the supply. [C] Most missions add "if equipment X is drawn, discard it and draw a replacement" (section 9). For which extra cards join the random pile, see section 6.3.
9. **Opening info**: starting with the Captain and going clockwise, each player places **one** info token of their choice face up in front of one of **their own blue wires**, showing that wire's true value. The yellow info token may not be used here. A player with 2 stands still places only one token, in front of the stand and wire of their choice. [C]

---

## 4. Turn structure [C]

* The Captain goes first, then play goes clockwise.
* On their turn the active player **must** take exactly one action: **Dual Cut**, **Solo Cut**, or **Reveal Reds**. Missions add special actions, and some missions allow or force skipping.
* A player whose stands are empty is skipped for the rest of the mission. [C]
* A player who revealed their reds is out (M3 card: "they will not take any more actions that mission"). [C]

### 4.1 Dual Cut [C]

1. The active player must hold at least one uncut wire of value V (V is 1–12 or "yellow"). They point at **one specific uncut wire on a teammate's stand** and announce "this is V".
   * You may never name "red".
   * **Deliberate wrong guesses are legal** (FAQ). They still cost a dial step.
   * If you name a value you do not hold, that is a mistake. The FAQ suggests a house ruling: make the player cut another value they do hold and also advance the dial. For a digital build, simply **forbid naming a value you do not hold** (enforce in the UI).
2. **Success** (the wire is V): the teammate lays that wire face up in front of its position on the stand (it keeps its slot, so the gap stays visible). Then the active player lays one of their own V wires face up in the same way, choosing which one if they have several. 2 wires of V are now cut.
3. **Failure**:
   * If the pointed wire is **red**, the bomb explodes and the mission is lost.
   * Otherwise (blue or yellow), the dial advances 1, **and** the teammate places an info token showing the wire's **real** value in front of it: a number token for blue, the yellow token for yellow.
   * The active player never reveals which of their own wires they meant to cut.
4. After any cut, if all 4 wires of a value are now cut, place that value's validation token on the board track. [C] It is only a reminder, but several missions key off it (M54, M57; challenges 4 and 8).

### 4.2 Solo Cut [C]

* Allowed only if **every remaining uncut wire of value V in the whole game is in the active player's hand** (across both stands is fine).
* Possible counts: all **4** (none of V cut yet) or the last **2** (2 already cut). Never 3 (FAQ). With 3 in hand, wait until one is cut by a dual cut.
* The wires go face up in place. It cannot fail.
* Yellow works the same way: with 4 yellows in play, you may solo-cut 4, or the last 2. With only 2 yellows, a player holding both may solo-cut them.
* (Equipment 9-9 lets a player solo-cut a pair that is not the last.)

### 4.3 Reveal Reds [C]

* Allowed only when **all** of the active player's uncut wires are red. They are laid face up. They do not explode, and the player is finished.
* The rulebook says the action "can only occur" then. The M3 card says a player in that position at the start of their turn **must** reveal, and M18/M51 repeat it. Implement it as **forced**: at the start of a turn, a hand that is all red is revealed automatically. **[C]**
* Revealed reds count as "done" for the win check.

### 4.4 Yellow wires [C]

* Yellows are cut like blues (dual or solo) under the shared value "yellow". To dual-cut a yellow you must hold one; point at a teammate's wire and say "yellow".
* A failed cut on a yellow wire (someone said a number but it was yellow) gets the **yellow info token**.
* The dual/triple/super detector variants may **not** name yellow (FAQ and card text). The two-value probe (#10) **may** include yellow as one of its two values.

---

## 5. Win and loss [C]

* **Win**: every stand is empty, meaning every blue and yellow wire is cut and every red has been revealed. Some missions add wires outside the stands (M43 robot's wires must also be cut).
* **Loss**: a red wire is cut (pointed at in a failed dual cut, or other mission triggers), **or** the dial reaches the skull (fuse 0), **or** a mission-specific explosion (timer runs out, mission explode clauses, the robot reaching 12 in M53, and so on).
* After a loss the Captain role passes left and the mission is replayed. Missions are replayable: the deal is new every time. [C]

---

## 6. Equipment

Full card data is in `equipment.json`.

### 6.1 General rules [C]

* There is one face-up equipment card per player, drawn at random at setup (missions 3+; missions 1–2 have none).
* Each card shows an **unlock value** in its top-left corner. The card becomes usable the moment the **first 2 wires of that value have been cut** (any pair, by anyone). Slide it up to show its check mark.
* Each card works **once per mission**. Turn it face down after use.
* Unless the card says otherwise, **anyone can use it at any time, even off-turn**, and one player may use several cards in a row.
* Timing labels printed on the cards:
  * "any time"
  * "on your turn"
  * "at the start of your turn" (the stabiliser, #9)
  * "instant" (the lightning icon on 3-3, 10-10 and the yellow card): the effect fires **immediately when the card unlocks** **[G: inferred from the icon; it has no other trigger]**
* Combination: the two-value probe (#10) can be stacked with the double, triple or super detector to name 2 values against several wires. [C]

### 6.2 Base cards 1–12 [C card text + FAQ]

| # | Our name (ref) | Timing | Effect |
|---|---|---|---|
| 1 | Unequal Tag (ref "Label ≠") | any time | Put the ≠ token between 2 adjacent wires (of your own, [G]) that have different values. One of them may already be cut. Two reds or two yellows always count as equal, so they can never be tagged ≠. Only one ≠ token exists. |
| 2 | Handsets (ref "Walkie-Talkies") | any time | Wire swap: you give one of your uncut wires face down to a teammate; that teammate gives you one of theirs face down; each inserts the new wire into sorted position. A 2-stand player puts the incoming wire on the stand the outgoing wire left. Any uncut wire may be swapped, red and yellow included. Everyone sees which slot each wire left and entered. An info token travels with its wire (FAQ), except in M24, where it is discarded (FAQ). You may not ask for a particular value. |
| 3 | Triple Probe (ref "Triple Detector") | your turn | As the Double Detector, but point at 3 wires on one teammate's stand. Not "yellow". |
| 4 | Sticky Note (ref "Post-It") | any time | Put a true info token in front of one of **your own blue** wires. |
| 5 | Full Scan (ref "Super Detector") | your turn | As the Double Detector, but the target is a teammate's **entire** stand. Not "yellow". |
| 6 | Rewind (ref "Rewinder") | any time | Dial back 1 space. |
| 7 | Recharge (ref "Emergency Batteries") | any time | Turn 1 or 2 **used** character cards face up again; their personal item can be used once more this mission. |
| 8 | Sweep (ref "General Radar") | any time | Name a number 1–12. Every player (including you) says "yes" if they have at least one **uncut blue** wire of that value. 2-stand players answer per stand. Do not say how many or where. Red/yellow never count. |
| 9 | Damper (ref "Stabilizer") | start of your turn | Turn it face down before a dual cut this turn. If that cut fails, the dial does not move; if it hits a red, the bomb does not explode. On a wrong non-red wire the teammate still places the info token. On a red wire no info token is placed (FAQ). |
| 10 | Two-Value Probe (ref "X or Y ray") | your turn | During a dual cut, name **2 values** (yellow allowed) for one wire. You must hold both values. If the wire is either one, the cut succeeds and you cut your matching wire, which shows teammates you also hold the other value. The values need not be consecutive (FAQ). |
| 11 | Coffee Break (ref "Coffee Mug") | your turn | Skip your turn and choose (alone, without discussion) who goes next; play then continues clockwise from that player. |
| 12 | Equal Tag (ref "Label =") | any time | Put the = token between 2 of **your** adjacent wires with the same value. One may already be cut. Any 2 yellows or any 2 reds count as the same. |

### 6.3 Campaign cards [C card text + rule stickers]

| Unlock | Our name (ref) | Timing | Effect | Joins the random pile |
|---|---|---|---|---|
| a yellow pair cut | Hidden Compartment (ref "False Bottom") | instant | Draw 2 more equipment cards and add them to the mission. They may unlock at once if their values are already cut. | from M9, **only in missions that use yellow wires** |
| all four 2s cut | Lone Tag (ref "Single Wire Label") | any time | Place a ×1 token in front of one of your blue wires (cut or uncut): that value appears only once on that stand, counting cut wires. | from M55 |
| all four 3s cut | Supply Drop (ref "Emergency Drop") | instant | All used equipment cards turn face up and can be used again this mission. | from M55 |
| all four 9s cut | Express Pass (ref "Fast Pass Card") | your turn | Solo-cut 2 identical wires from your hand even if they are not the last of that value. | from M55 |
| all four 10s cut | Vaporiser (ref "Disintegrator") | instant | Draw a random info token from the supply and reveal it. Every player cuts all their remaining wires of that value. [G: if the yellow token or an exhausted value comes up, redraw] | from M55 |
| all four 11s cut | Hook Line (ref "Grappling Hook") | any time | Point at a teammate's wire and take it unseen into your hand in sorted position (a 2-stand player chooses the stand, per FAQ). Everyone sees where it came from and went. | from M55 |

Double-number unlock rule: "4 wires of the same value have to be cut". [C sticker C]

---

## 7. Characters [C]

* Every character card carries one **personal item**, usable **once per mission**. Turn the card face down when used. The recharge equipment (#7) restores it.
* **Base 5 cards** (one is marked Captain): all have the **Double Detector**.
* **4 new cards** (from M31, for non-captains only), each with a personal copy of an equipment effect, once per mission:
  * radar (#8, "any time")
  * handsets/swap (#2, "any time")
  * triple probe (#3)
  * two-value probe (#10)

  Rules follow the matching equipment card. Several missions ban the two-value-probe character (M44, 45, 47, 49, 51, 54, 59, 63, 65). M58 bans all new characters.

**Double Detector** (the base personal item) [C RB + FAQ]:

* During a dual cut, name a number value (1–12 only, never yellow or red) and point at **2 wires on the same stand** of one teammate. The wires need not be adjacent. If the teammate has 2 stands, both wires must be on one stand.
* **Success** if at least one of the two is V. If both are V, the teammate picks which one to cut and says nothing more. The active player cuts one of their own V wires.
* **Failure** (neither is V): the dial advances 1 and the teammate puts **one** info token in front of **one** of the two wires (their choice).
* **Red**: if exactly one of the two is red, there is no explosion. The teammate must place the info token on the **non-red** wire, and must not reveal the red. If **both** are red, the bomb explodes.
* Triple and full-scan versions follow the same logic. Our reading **[G]**: explode only if every pointed wire is red; on a failure the teammate tags one non-red wire. For the full scan, a failure can only happen if the stand holds no V, so the teammate tags any non-red wire.

---

## 8. Mission-introduced subsystems

These are summaries. The per-mission details are in `missions.json`.

### 8.1 Number cards and the Sequence card

* Number cards: 12 cards, values 1–12. Missions use them as targets, gates, decks, hands and so on.
* Sequence card: side A means "2 wires of this value must be cut before moving on". Side B means "all 4 must be cut".

### 8.2 Constraint cards (A–L) [C card faces]

| Card | Restriction while it applies |
|---|---|
| A | You may only cut even values |
| B | You may only cut odd values |
| C | You may only cut values 1–6 |
| D | You may only cut values 7–12 |
| E | You may only cut values 4–9 |
| F | You may not cut values 4–9 |
| G | You may not use equipment cards or your own personal item |
| H | When your cut, or a cut aimed at your hand, fails, no info token is placed and the value is not revealed. You may not cut a wire that has an info token in front of it. The sticky-note equipment (#4) may not be used |
| I | You may not cut the right-most wire (highest) of a teammate's stand |
| J | You may not cut the left-most wire (lowest) of a teammate's stand |
| K | You may not Solo Cut |
| L | If your cut fails, the dial advances 2 instead of 1 |

**[G]**:

* How yellow interacts with A–F: yellow has no number, so we treat it as violating A–E and as allowed under F. No source covers this.
* What "cut" means for I/J: read it as the teammate's wire you point at in a dual cut.
* Constraints never apply to Reveal Reds (stated on M32, 37, 57, 61). [C]

### 8.3 Challenge cards (1–10) [C card faces]

Completing a challenge discards it and moves the dial back 1 (M55, M60).

1. Instead of a normal action, a player points at a teammate's wire and says "red". If it is not red, the bomb explodes. (If it is red, the wire is cut/revealed and the challenge is met; [G] for what happens to the red tile: treat it as revealed.)
2. 4 players in a row (consecutive turns) each cut an even value.
3. On some stand, the uncut wires form only isolated pairs: groups of exactly 2 adjacent uncut wires, separated by cut wires (the picture shows 1-1 and 3-4, so the two wires of a pair need not match).
4. The first 3 validation tokens placed have values summing to 18.
5. 2 players in a row each perform a Solo Cut.
6. On a single stand, at least 5 uncut wires are each isolated (both neighbours cut, or at a stand end).
7. 3 players in a row cut consecutive values, ascending or descending (for example 8-9-10 or 5-4-3).
8. When this card is drawn, place 2 face-up Number cards on it. Met if the first 2 validation tokens placed are on exactly those two values.
9. Some stand holds only uncut odd blue wires, at least 6 of them; red and yellow are ignored.
10. On a single stand at least 7 wires are cut, but the wire at each end (left-most and right-most) is still uncut.

### 8.4 Token replacements

* **Even/odd tokens** (M21, M33) replace all info tokens: at setup, on failures and with the sticky note. A failure on a yellow wire shows… **[G]**: use the normal yellow info token.
* **×1/×2/×3 tokens** (M24, M40): "this value appears 1/2/3 times on this stand, counting cut wires". A ×2 or ×3 token may sit on any of the wires of that value. These tokens never go in front of a red wire. With the sticky note they may tag a cut wire.
* **X tokens** (M20, M35): mark the one unsorted wire at the far right of a stand. No equipment or personal item can target or detect that wire.

### 8.5 Oxygen (M44, 49, 54, 63)

Paying oxygen is a precondition for attempting a cut. Each mission uses its own economy; see the per-mission entries. Being unable to pay means skipping the turn and advancing the dial 1. If you can pay, you must play (FAQ M54/63). Voluntary passing is allowed in M44 and M49, and costs 1 dial step (FAQ).

### 8.6 Robot (M43, 53, 59)

A standee moves along the 1–12 board track, or along a line of Number cards in M59. See each mission.

---

## 9. Communication rules [C]

**Forbidden**:

* talking about the wires in your hand, or hinting at their values;
* recalling information from earlier turns (for example "remember the token on X");
* stating guesses or deductions aloud.

**Allowed at any time**:

* general strategy;
* whether and when to use equipment;
* reminding each other of special rules;
* telling a teammate to use their Double Detector or other gear.

The info tokens, the face-up cut wires, the validation tokens and the board markers are the shared memory. In a digital build, show them permanently; the board state is public anyway.

Mission overrides:

* M25: numbers may not be spoken. A slip advances the dial 1.
* M44, 49, 63: no speaking at all; a thumbs-up sign means "I need oxygen".
* M50: nobody may share memorised token info.
* M10, 45: shout-to-act real-time turns.
* M42: audio stunts.

---

## 10. Every exact number (quick list)

* Wires: 48 blue (1–12 ×4); 11 red (x.5); 11 yellow (x.1). Total 70.
* Stands: 5. Hands: 2p = 2+2 stands, 3p = 2+1+1, 4p = 1 each, 5p = 1 each.
* Equipment in play = number of players (2–5).
* Info tokens: 26 (2 × 1–12, 2 yellow). Validation tokens: 12. Markers: 3 red + 4 yellow. One = token and one ≠ token.
* Dial: start = player count; explode at 0; maximum 6.
* Unlock: base equipment after 2 wires of its value; double-number equipment after 4; the yellow-unlock card after 2 yellows.
* Missions: 66. Training 1–8 (base box). Boxes: 9–19 (11 missions), 20–30 (11), 31–42 (12), 43–54 (12), 55–66 (12).
* Audio missions: 19, 30, 42, 54, 66.
* Timers: M10 15 min (2p 12 min); M19 has about 668 s of real play: the audio claims 15 min, then skips from 10 to 5 min; M30 phases of 20 s, then 15 s, then 2 min; M54 10 min.
* Robot deal: 2p 5 wires, 3–4p 4, 5p 3 (M43).
* Oxygen:
  * M44: 2 per player in the reserve. Costs: 1–4 = 1, 5–8 = 2, 9–12 = 3.
  * M49: per player, 2p 7, 3p 6, 4p 5, 5p 4. Cost = value, given to a teammate.
  * M54: per player, 2p 9, 3p 6, 4p 3, 5p 2. Depth costs as M44; +1 each per validation token.
  * M63: the Captain holds 2p 14, 3p 18, 4p 24, 5p 30. Cost = value, paid to the reserve.

---

## 11. Confirmed vs. guessed

Confirmed means taken from the rulebook (RB), the official Pegasus FAQ of 11 July 2025, or the printed card faces (CARD, read from scans of every mission card front and back, all equipment, character, constraint and challenge cards, the bunker card and the rule stickers). Mission audio was machine-transcribed (AUDIO); see the mission notes for its reliability.

### Confirmed (high confidence)

* All component counts in the base box.
* Wire values and counts; the sort-only decimals.
* Setup steps; the stands table; equipment count = players; the opening info token rule.
* Dual, solo and reveal-red mechanics; yellow handling; the failure consequences.
* Equipment unlock (2 wires) and once-per-mission use; the timing labels on cards.
* All 18 equipment texts.
* The Double Detector details, including the red cases (FAQ).
* All constraint texts (A–L) and challenge texts (1–10).
* The rule stickers A/B/C.
* Communication rules; win/loss.
* All 66 missions' setup icons, 2-player adjustments and rule text (CARD).
* The dial segment layout (CARD art for M41/M55/M60/M62).

### Guessed or unverified (implement as configurable)

1. **Dial arithmetic** (start = N, explode at 0, max 6). We are fairly sure: the card art and the TTS implementation agree, and one review agrees loosely. The rulebook text itself never states the count.
2. **Where dealing starts** and who gets the extra tiles when the deal is uneven.
3. **"Instant" equipment** fires automatically when it unlocks.
4. **Triple and full-scan red handling** (explode only if all pointed wires are red; the teammate tags a non-red wire on failure). This extends the Double Detector FAQ.
5. **The ≠ tag goes on the user's own wires.** The card does not say "your", unlike the = card.
6. **Vaporiser** (10-10) when the drawn token is yellow, or a value with no wires left: redraw.
7. **Constraint vs. yellow** (A–F). Yellow has no number.
8. **Even/odd token on a yellow failure** (we use the yellow token).
9. **Surprise-box token counts** (X, even/odd, ×1–3, oxygen) and which box holds what.
10. **The Reveal Reds action as forced at the start of a turn** in all missions. The rulebook wording only says "can only occur"; three cards say "must".
11. **Naming a value you do not hold**: forbidden in the UI. The FAQ only suggests a house penalty.
12. **Challenge 1** when the wire is red: assume it counts as revealed.
13. **The dial cannot go above 6, or above the starting segment.** Untested.
14. **Several mission-level ambiguities**, listed in each mission's `gaps` field in `missions.json`.
