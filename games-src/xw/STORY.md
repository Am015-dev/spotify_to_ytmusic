# Nebula Aces: story bible

All words live in two data files: `lore.js` (tutorial prologue, quick-game lines, turn banners) and `campaign.json` (Story mode cast, acts, chapter intro/outro scenes). Edit text there only.

## Cast

- **Marshal Odile Brecken** (`brecken`)
- **Kael Varro** (`kael`)
- **Quill Marren** (`quill`)
- **Drill Wing Flight Officer** (`drill`)
- **"Knifepoint"** (`knife`)
- **Hammer Squadron Lead** (`hammer`)
- **"Hex"** (`hex`)
- **Sorin Vael** (`sorin`)
- **Kira Scald** (`kira`)
- **"Wailer"** (`wailer`)
- **Lord Castigan** (`castigan`)
- **Slate** (tutorial rival, Armada raider, art camp-drill): brash, brags, panics when the plan goes wrong.

## Prologue: Convoy Run (the tutorial, 4 chapters)
Marshal Brecken coaches Kael Varro over the radio while the Armada raider Slate dives on the convoy. Ch 1 Scramble (plan and reveal), Ch 2 First Contact (order, action, shot, defence), Ch 3 Point Blank (stress, target lock, reroll), Ch 4 Convoy Saved (the battle ends). Slate speaks at the evade and stress beats; his portrait replaces Brecken's on those bubbles.

## Story arc (3 acts, 10 chapters)

### Act 1: Convoy Run
Learn to fly, shoot and act on the edge of Sector Nebula-7.

### Act 2: The Ashfall Belt
The Iron Armada sends its bombers and its fastest ace.

### Act 3: The Crown Rift
Break the blockade and face Lord Castigan himself.

- Ch 1 **First Sortie** (act 1): vs Drill Wing Flight Officer. Goal: Fly into range and destroy the lone Drill Wing fighter. Intro: "Varro, the convoy leaves at dawn. Before that, I want you comfortable at the stick."
- Ch 2 **Range Practice** (act 1): vs Drill Wing Flight Officer. Goal: Destroy both enemy fighters before round 12. Intro: "Two drones this time. Get close: at range 1 you roll an extra attack die."
- Ch 3 **Rocks and Locks** (act 1): vs Onyx Squadron Pilot. Goal: Destroy both patrol fighters among the asteroids. Intro: "Asteroids are back. Fly through one and you roll for damage and lose your action."
- Ch 4 **The Knife at the Gate** (act 1, boss): vs "Knifepoint". Goal: Win the core duel: destroy "Knifepoint" and her wingman. Intro: "The convoy is jumping. "Knifepoint" and a wingman are waiting at the gate."
- Ch 5 **Bomber Intercept** (act 2): vs Hammer Squadron Lead. Goal: Destroy the bomber and its escort. Intro: "A Talon Maul bomber is inbound for the convoy, with one escort."
- Ch 6 **Ambush at Veil Station** (act 2): vs "Hex". Goal: Destroy all four ambushers. Intro: "Four Armada fighters wait in the station's shadow. You get a wingman this time."
- Ch 7 **The Red Streak** (act 2, boss): vs Sorin Vael. Goal: Destroy Sorin Vael and both of his wingmen. Intro: "Sorin Vael, the Armada's top ace, flies a Razor interceptor with two wingmen."
- Ch 8 **Toll at the Rift** (act 3): vs Kira Scald. Goal: Destroy the Warden gunship and its two escorts. Intro: "A Warden gunship guards the mouth of the Rift. It shoots from front and rear."
- Ch 9 **Courier Run** (act 3): vs "Wailer". Goal: Destroy all four Armada fighters with Quill Marren still flying. Intro: "I carry the Rift codes. If my courier goes down, the whole run is for nothing."
- Ch 10 **The Dark Lord** (act 3, boss): vs Lord Castigan. Goal: Destroy Lord Castigan and his three escorts. Intro: "Lord Castigan leads in person: two actions every turn, and now a reinforced hull."

## Quick game voice
Intro line: "The Armada hits the convoy lane. Clear the way." Result lines (win, loss, draw) are in `LORE.quick`; a turn banner names whose turn it is (`LORE.turn`).
