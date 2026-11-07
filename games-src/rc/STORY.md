# Shipwreck Isle: story (cast, arc, where the text lives)

All story text lives in ONE data file each: **campaign.json** (cast, 3 acts, chapter intros and outros, bosses) and the tutorial prologue
strings in **tutor.js** (`tutSteps()`, one `title`/`say` per step id). Edit those; nothing else holds story words. Original names only.

## Cast (already portraits in `campaign.json` `cast`)
- **The Cook**: the guide of the tutorial prologue. Warm, practical, a little bossy: "Don't gamble with our carpenter."
- **The Carpenter**: slow, dry humour, builds the shelter. **Friday** and the dog: helpers. **The Explorer**, **The Soldier**: join in act 2/3.
- **Ada**: the stranded shipmate (act 2 reveal, act 3 rescue). **The Ship's Log**: narrator, speaks the intro and outro of every chapter.
- Rivals (the scenario threats, they speak before and after): Gnawing Hunger, The Long Rain, The Night Prowlers, The Empty Horizon (boss),
  The Whispering Fog, The Altar Shadows, The Grey Shroud (boss), The Autumn Gale, The Lean Season, The Undertow (boss).

## Arc, 3 acts (see CAMPAIGN-DESIGN.md for the chapter table)
1. **Washed Ashore** (c1-c4): the *Gull's Wake* breaks on the reef. Eat, shelter, explore, signal fire. A ship turns, but a grey fog closes in.
2. **The Hexed Isle** (c5-c7): the fog is a curse; five crosses at the dark temple. When it lifts, Ada is seen on a rock offshore.
3. **The Way Home** (c8-c10): signal through the gale, last the lean season in a real home, rescue Ada, sail home.

## Tutorial prologue (Chapter 0): "The first two days"
The Cook walks the player through day 1 and day 2 of c1. Each step is: a story reason (why we do this), the glowing action, and a reaction in
the next bubble ("Good, no dice. Now me."; "Ouch. ... Tomorrow we build a shelter, I promise."; "Dry and safe: the shelter spared us every wound.").
Chapter beats: **Day 1** opens with "Our ship is gone" (goal) and pays off with "Ouch... I promise" (first night, wounds).
**Day 2** opens with the morning event ("Day two. <card> rolls in") and pays off with "Dry and safe" and "The road" (what the real game asks).
The end card says "We survived two days. The ship's log is open: now the Story begins." and its button starts chapter 1 (intro scene: the Log, the Cook,
the Carpenter; outro: "Three nights, three meals, nobody lost.").

## Quick game
One-line flavour in the game's voice is the first journal line of the day (`flavor.js`); the result line is the Log's outro on win/loss.
Not yet done: a dedicated Quick-game intro line on the title and a loss/win variant of each chapter outro beyond what `campaign.json` has.
