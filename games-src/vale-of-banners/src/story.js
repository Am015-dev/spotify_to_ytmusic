/* Vale of Banners: every line of narrative for the tutorial prologue, Quick game and Story losses lives here (edit freely).
   Story chapter intros, win outros and boss taunt/praise live in campaign.json (the shared campaign kit reads them). STORY.md = cast + arc. */
window.VSTORY = {
  guide: { name: 'Old Odo', title: 'the reeve', color: '#7a5c3e', initial: 'O' },
  rival: { name: 'Tobin Reed', title: 'the neighbour', color: '#2e6fb8', initial: 'T' },
  tut: { result: { win: 'You beat Tobin. Well played.', lose: 'Tobin won this one. Try a real game.' } },

  /* coached first game (tutorial): each rule is explained the first time it matters; unseen ones go on the "later" card */
  coach: {
    preview: { say: 'Gold +N shows the points. 2/4 shows how full that region gets.', later: 'Glowing spaces show points (+N) or region progress (2/4).' },
    turnover: { say: 'Two dice, two actions. That is a whole turn.', later: 'A turn is two actions, one per die.' },
    build:   { say: 'Now build it on a glowing space next to your land.', later: 'Build on a matching colour and number, next to your land.' },
    end:     { say: 'Both dice used. Tap End turn.', later: 'Tap End turn when both dice are used.' },
    rival:   { say: 'Tobin\'s turn now. Watch what he takes.', later: 'The banner track decides who goes first.' },
    white:   { say: 'The dashed die is not yours: it puts new goods on its stall.', later: 'The white die puts each round\'s goods on its stall.' },
    sell:    { say: 'You can sell! Tap your goods, then Sell.', later: 'Sell all goods of one number with that die. Points plus 1 silver.' },
    kinds:   { say: 'You can hold three kinds of goods. Sell before a fourth.', later: 'You hold at most 3 kinds of goods.' },
    workers: { say: 'Workers! A tile\'s button spends them to bend a die by one.', later: 'A worker turns a die up or down by one. 6 and 1 touch.' },
    bend:    { say: 'Some tiles are one off your dice. Tap one: its button spends a worker.', later: 'A worker changes a die by one to reach a tile or space.' },
    back:    { say: 'You have 2 silver. Tap a back-lane tile, then Buy. No die.', later: 'Back lane: once a turn, a tile for 2 silver, no die.' },
    keep:    { say: 'A keep! One free action, any number: tap any glowing tile.', later: 'Keep (dark green): one free action, any number.' },
    bld:     { say: 'Buildings work the moment you build them.', later: 'Buildings (tan) work at once. No two the same in one region.' },
    hall:    { say: 'Moot Hall: tap a stored tile, then a glowing space. Free.', later: 'Moot Hall: build again straight away, any number.' },
    lore:    { say: 'Lore changes one rule for you. Tap it to read.', later: 'Lore (yellow): changes one rule for you all game.' },
    mine:    { say: 'A mine pays 1 silver after every season.', later: 'Mine (grey): 1 silver after each season.' },
    pas:     { say: 'Pastures score every animal of that kind in its meadow.', later: 'Pasture (light green): points for each animal of that kind in its meadow.' },
    barge:   { say: 'A barge grabs all goods from one stall: tap the glowing goods.', later: 'Barge (blue): take all goods from one stall, move up the track.' },
    region:  { say: 'Region full! Bigger ones pay more, and early pays extra.', later: 'Fill an outlined region to score. Early regions pay extra.' },
    colour:  { say: 'You filled every space of one colour. Bonus points!', later: 'First and second to fill a whole colour get a bonus.' },
    discard: { say: 'Storage is full. Tap a stored tile, then Throw this away.', later: 'Storage holds 3 tiles. A fourth means throwing one away.' },
    season:  { say: 'Season over. Mines pay out now.', later: 'A season is 5 rounds. The game ends after the last one.' }
  },
  coachGood: { chain: 'Two builds from one die. Nice.', region: 'Lovely. That filled a region.' },
  coachPoor: { workers: 'You could have built there. Tiles beat workers.' },
  coachRival: { region: 'Tobin filled a region. He goes for small ones.', sell: 'Tobin sold goods. That also gave him silver.', chain: 'Tobin built twice in one go.' },
  endTitle: 'You know how to play',
  endText: 'That was the whole game. Ready for a real one?',
  /* Quick game: one flavour line at the start, one result line */
  quickIntro: ['New season. Build fast.', 'Five seasons. Best estate wins.', 'Your rival wants the same tiles.'],
  /* result lines by margin (N = 'X points'): close <= 8, clear <= 25, big beyond */
  quickWin: { close: 'Won by just N. Well played.', clear: 'Won by N. Well played.', big: 'A big win, by N.' },
  quickLose: { close: 'Close one: just N short. Try again?', clear: 'Lost by N. Follow the ★ Best hint next time.', big: 'A clear loss, N behind. Try a gentler rival, or follow ★ Best.' },
  soloWin: 'Every space built. Well played.',
  soloLose: 'A few gaps left. Try again?',
  /* Story: a loss outro per chapter (wins use campaign.json outro) */
  storyLose: {
    c1: { who: 'odo', text: 'Tobin got there first. Try again, and build from your edges.' },
    c2: { who: 'odo', text: 'Crates rot in barns. Sell when the die says so, and try again.' },
    c3: { who: 'cass', text: 'The river is mine, little steward. Come back when you can fill a region.' },
    c4: { who: 'odo', text: 'Keeps and halls want chaining. One build should pull the next.' },
    c5: { who: 'marla', text: 'Grass and patience, steward. You had neither today.' },
    c6: { who: 'hask', text: 'Stone first, steward. You built straw. Try me again.' },
    c7: { who: 'marla', text: 'The wool price beat you. Sell more often next time.' },
    c8: { who: 'hask', text: 'My workers bent every die. Finish your regions first.' },
    c9: { who: 'odo', text: 'Without the back lane every tile must count. Plan, then take.' },
    c10: { who: 'ivo', text: 'Everything has a price, steward. Today it was your estate.' }
  }
};
