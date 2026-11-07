# Story: The Deeds of Vinemoor (cast and arc)

All text is data: tutorial and Quick lines in `game/src/story.js`; chapters (intro and outro scenes, rivals, twists) in `campaign.json`.
Original names only.

## Cast
- **Garnet** (you, red): a settler with a cart of tiles and seven followers.
- **Old Tamsin** (guide, portrait camp-tamsin): teaches in the prologue and in chapter 1, warm and dry.
- **Hob the Carter** (rival in the tutorial and chapter 1): friendly, careless, wants the land for his carts.
- Chapter rivals: Wren Ashlar (builder), Mabry Furrow (farmer), Brother Quill (boss, quiet priory keeper), Ferro the Boatman,
  Dulcie Tapwell (tavern), Reeve Ostrand (boss, market), Isolde of Lilac Hall (envoy), Corvin Blackmere, the Sable Baron (final boss).

## Arc in three acts
1. **The Empty Valley** (chapters 1-4): Garnet lays the first roads, towns, fields and priories; Hob, Wren and Mabry compete; Brother Quill
   guards the old priory and starts with points from old deeds.
2. **River and Market** (5-7): the river brings Ferro's ferry, Dulcie's tavern and Reeve Ostrand's market; goods and masons enter.
3. **The Sable Claim** (8-10): Isolde's envoy and Corvin's gambit lead to the Sable Baron, who claims the whole valley.

## Prologue (the tutorial)
Old Tamsin lends Garnet a seat at the first deed-table; Hob wants the deeds too. Four chapters: 1 Your first turn, 2 Roads and scoring,
3 Special cases, 4 Ending the game. It ends "The deeds are yours": Hob wants a rematch (Story: "Hob is waiting at the first fence").

## Quick game
One line when it starts ("The deeds of Vinemoor are up for grabs. Out-build <rival>.") and a result line on the result card (win, loss, tie).

## Not done
Loss variants of the Story outros: the shared campaign kit (`shell/gx-campaign.js`) plays the outro scene only after a win; changing it is a
shared-kit change, left for the orchestrator.
