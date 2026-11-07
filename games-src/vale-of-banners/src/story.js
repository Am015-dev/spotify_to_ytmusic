/* Vale of Banners: every line of narrative for the tutorial prologue, Quick game and Story losses lives here (edit freely).
   Story chapter intros, win outros and boss taunt/praise live in campaign.json (the shared campaign kit reads them). STORY.md = cast + arc. */
window.VSTORY = {
  guide: { name: 'Old Odo', title: 'the reeve', color: '#7a5c3e', initial: 'O' },
  rival: { name: 'Tobin Reed', title: 'the neighbour', color: '#2e6fb8', initial: 'T' },
  /* tutorial prologue: step id -> title, say (story reason + what to do, <=2 short lines), react (after the action) */
  tut: {
    hi:     { t: 'Prologue · Spring', say: 'The old lord is gone. Whoever builds the finest estate by harvest flies the banner of the Vale.', react: 'Tobin Reed wants it too. Let us beat him to it.' },
    take:   { t: 'Prologue · Timber', say: 'Your two dice are your two hands today. That glowing stall matches your first die: claim its tile.' },
    take2:  { t: 'Prologue · Timber', say: 'Take it home before Tobin does. It waits in your storage, three spaces.', react: 'Into the barn. Good.' },
    pick:   { t: 'Prologue · A beacon', say: 'Folk need a light to find your land. Your Beacon Tower is ready in storage.' },
    cell:   { t: 'Prologue · A beacon', say: 'Raise it on its own colour, with your other die\'s number, touching your keep.', react: 'A light on the hill! +4, and the valley knows your name.' },
    end:    { t: 'Prologue · Dusk', say: 'Both hands spent. Let the day end and see what Tobin does.', react: 'Watch him. Every steward plays the same rules.' },
    white:  { t: 'Market day', say: 'The banner track sets who goes first. The white die sent today\'s goods to its stall.', react: 'Carts are rolling in. Time to trade.' },
    sell:   { t: 'Market day', say: 'Your barn holds two crates marked 3, and you rolled a 3. Carry them to market. (Barns hold 3 kinds.)' },
    sell2:  { t: 'Market day', say: 'Sell the lot: 2 points a crate and a silver coin.', react: '+4 and a silver! Coin opens the back lane.' },
    wk:     { t: 'Market day', say: 'Nothing else fits your last die. Hire hands instead: any die buys 2 workers.', react: 'Two strong backs. Each one can nudge a die.' },
    end2:   { t: 'Market day', say: 'A good day\'s trade. Rest now.', react: 'Tobin sold nothing. Patience pays.' },
    bend:   { t: 'The keep', say: 'A keep is for sale, one pip off your die. A worker will nudge it (6 and 1 touch).' },
    bend2:  { t: 'The keep', say: 'Spend the worker and take the keep.', react: 'One worker spent, one keep gained.' },
    keep:   { t: 'The keep', say: 'Stone walls bring a spare hand. Your keep waits in storage.' },
    keepc:  { t: 'The keep', say: 'Set it where it glows. A keep grants one free action, any number.', react: 'Walls up! Use that free action now.' },
    free:   { t: 'The keep', say: 'The Moot Hall is in the market. The free action can fetch it.' },
    free2:  { t: 'The keep', say: 'Take it for nothing.', react: 'Free! Tobin will be furious.' },
    buy:    { t: 'The back lane', say: 'The back lane sells to anyone with 2 silver, once a turn, no die needed. That lore scroll is cheap.' },
    buy2:   { t: 'The back lane', say: 'Buy the scroll.', react: 'Old knowledge, new tricks.' },
    end3:   { t: 'The keep', say: 'A fine day\'s work. End it.', react: 'Tomorrow we chain.' },
    hall:   { t: 'The moot', say: 'A Moot Hall gathers the village to build twice. (Never two of one building in a quarter.)' },
    hallc:  { t: 'The moot', say: 'Raise the hall where it glows. Then build again at once, any number.', react: 'The hall is full! Build again, quick.' },
    chain:  { t: 'The moot', say: 'Your lore scroll is next in line.' },
    chainc: { t: 'The moot', say: 'Shelve it where it glows. Lore bends one rule for you all game.', react: 'Chain! Two builds from one die.' },
    mine:   { t: 'The mine', say: 'Silver sleeps under the hill. Your mine pays a coin at every season\'s end.' },
    minec:  { t: 'The mine', say: 'Dig where it glows. It fills a whole region: size points plus the spring bonus.', react: 'Region done! +11. Early regions pay best.' },
    end4:   { t: 'The mine', say: 'Rest. One day of spring is left.', react: 'Tobin is worried. I can tell.' },
    pas:    { t: 'Harvest eve', say: 'Sheep for the meadow. Pastures score every animal of that kind in the field.' },
    pas2:   { t: 'Harvest eve', say: 'Bring them home. (A full barn makes you drop a tile.)', react: 'A flock for next year.' },
    wk5:    { t: 'Harvest eve', say: 'Last hands for hire: every 2 workers are a point at the end.', react: 'All hands on deck.' },
    end5:   { t: 'Harvest eve', say: 'End the day. The season closes, the mine pays, and the Vale counts.', react: 'The bells ring. Count it all!' },
    result: { t: 'The harvest moot', say: '+1 per silver, crate, 2 workers, lore. Ties: fuller estate, then further back.', win: 'The banner is yours, steward. This is only the start.', lose: 'Tobin by a whisker. Next spring, we take it back.' }
  },
  endTitle: 'The banner is raised',
  endText: 'Spring is done and you know every trade of the Vale. The real valley waits.',
  /* Quick game: one flavour line at the start, one result line */
  quickIntro: ['A new spring in the Vale. Raise your banner before harvest.', 'Five seasons, two dice a day. The finest estate wins the Vale.', 'Rival stewards eye the same valley. Build fast, build well.'],
  quickWin: 'The Vale cheers your banner from every hill.',
  quickLose: 'Your banner flies lower this year. Next spring, then.',
  soloWin: 'Every space built. The Vale has never seen an estate like it.',
  soloLose: 'Gaps remain in your estate. The Vale waits for next year.',
  /* Story: a loss outro per chapter (wins use campaign.json outro) */
  storyLose: {
    c1: { who: 'odo', text: 'Tobin got there first. Again, steward: build from your edges.' },
    c2: { who: 'odo', text: 'Crates rot in barns. Sell when the die says so, and try again.' },
    c3: { who: 'cass', text: 'The river is mine, little steward. Come back when you can fill a region.' },
    c4: { who: 'odo', text: 'Keeps and halls want chaining. One build should pull the next.' },
    c5: { who: 'marla', text: 'Grass and patience, steward. You had neither today.' },
    c6: { who: 'hask', text: 'Stone first, steward. You built straw. Try me again.' },
    c7: { who: 'marla', text: 'The wool price beat you. Sell more often next time.' },
    c8: { who: 'hask', text: 'My workers bent every die. Finish your regions first, or lose again.' },
    c9: { who: 'odo', text: 'Without the back lane every tile must count. Plan, then take.' },
    c10: { who: 'ivo', text: 'Everything has a price, steward. Today it was your estate.' }
  }
};
