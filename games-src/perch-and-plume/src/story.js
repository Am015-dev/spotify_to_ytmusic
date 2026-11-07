// ===================== the game's voice: every story line in one place (edit here). Cast and arc: STORY.md =====================
// Tutorial = the prologue: Aunt Ottilie walks you through your first morning at the Larchwood; Pip, a young birder, wants to fill
// his notebook first. Each step: a story reason + what to do (say), then Ottilie's reaction once it is done (react).
var STORY = {
  cast: { ottilie: { name: 'Aunt Ottilie', color: '#4f7a45', mark: 'O' }, pip: { name: 'Pip', color: '#c9a443', mark: 'P' } },
  tut: {
    setup: { ch: 'Prologue 1 · Dawn in the Larchwood', say: 'Dawn, and your notebook is empty. Pip swears he\'ll fill his first. Here are the birds you\'ve spotted so far.', react: null },
    forest: { say: 'Finches are waking hungry. Your forest row gathers food for them: gain food now.', react: 'Listen to that rustle. The forest gives to those who wait.' },
    die: { say: 'The feeder holds what the woods offer. Your two forest birds let you pick 2 food.', react: 'Two in the basket! An empty feeder simply fills again.' },
    chain: { say: 'See them work? After the forest gave food, each bird there used its power, right to left.', react: 'That chain is your engine. Grow it and every turn gets bigger.' },
    select: { ch: 'Prologue 2 · A visitor', say: 'A bird in your hand wants a home. Playing it is the other kind of turn.', react: null },
    slot: { say: 'It nests in the meadow. Birds take the leftmost free space of a row they live in.', react: null },
    pay: { say: 'Pay its food from the card, plus the egg the space asks for. Any 2 food stand in for 1.', react: 'Welcome home! Its points are in your notebook now.' },
    eggs: { ch: 'Prologue 3 · Nesting time', say: 'The meadow is warm and your birds want to nest. More birds in a row make a bigger action.', react: null },
    egg: { say: 'Put each egg on a bird with room in its nest. Every egg is 1 point.', react: 'Three eggs, three points. A full nest is a happy nest.' },
    draw: { ch: 'Prologue 4 · Rumours at the reeds', say: 'Pip is whispering about rare birds at the wetland. Your wetland row brings new cards.', react: null },
    tray: { say: 'Pick a bird you can see in the tray, or gamble on the deck. The tray refills after you.', react: 'A fine find. Pip is already jealous.' },
    goals: { ch: 'Prologue 5 · The evening count', say: 'At dusk the round goal is judged. Tonight: most birds in your grassland. Most wins the most points.', react: null },
    score: { say: 'At year\'s end: birds + eggs + goals + bonus card + cached food + tucked cards. A tie? Most food left wins.', react: null },
    finish: { say: 'The light is going. Use your last actions your own way, and beat Pip to the count.', react: 'Let\'s see whose notebook is fuller!' }
  },
  tutEnd: { title: 'Your first evening', text: 'Ottilie: "Your last actions are yours. Play a bird, or use a row, and then we count."' },
  tutResult: { win: 'Ottilie: "A fuller notebook than Pip\'s on your very first day. The Larchwood has a new naturalist!"', lose: 'Ottilie: "Pip wins this one, but you know every move now. Tomorrow the year begins."' },
  // Quick game: one flavour line at the start, one result line in the game's voice
  quickIntro: ['A fresh spring morning: fill your notebook before the others do.', 'The feeders are full and the rivals are up early.', 'A new year of birds. Let the best notebook win.'],
  quickResult: { win: 'Your notebook is the talk of the county!', lose: 'Not this year. The birds will be back in spring.', tie: 'Two notebooks, one score. The birds call it a draw.' },
  // Story mode: the loss line for each chapter (the win outro lives in campaign.json), and bosses' last words
  lose: {
    c1: ['ottilie', 'Every naturalist starts somewhere. Try again: birds and eggs are all you need.'],
    c2: ['ottilie', 'The forest needs more birds before it can carry you. Plant three there next time.'],
    c3: ['corvin', 'My eggs stay my eggs. Come back when your nests are fuller.'],
    c4: ['mags', 'Patience, dear. The reeds reward a steady hand.'],
    c5: ['tobias', 'Three at the shore is a crowd. Watch the round goals.'],
    c6: ['ottilie', 'A lean season is hard on everyone. Spend your food on birds that pay back.'],
    c7: ['delphine', 'My fish run was faster. Build your engine early, or not at all.'],
    c8: ['corvin', 'The heath belongs to me. For now.'],
    c9: ['ottilie', 'The Flock never tires. Race them to the goals.'],
    c10: ['barnaby', 'Ten years running! The County Notebook stays with the Quill Collection.']
  },
  bossWin: { c3: ['corvin', 'Hmph. Fine nests. I\'ll see you on the heath.'], c7: ['delphine', 'You out-fished me. Well flown.'], c10: ['barnaby', 'Beaten... by a beginner\'s notebook. Take the County Notebook, you earned it.'] }
};
// a speaking card (portrait + name + line) that appears for a moment and never blocks a tap
function storySay(who, text, ms) {
  if (!text || UI.fast) return;
  var c = STORY.cast[who] || { name: who, color: '#4f7a45', mark: (who || '?')[0].toUpperCase() };
  $$('.saycard').forEach(function (x) { if (x.parentNode) x.parentNode.removeChild(x); });
  var d = document.createElement('div'); d.className = 'saycard'; d.setAttribute('data-volatile', ''); d.setAttribute('role', 'status');
  d.innerHTML = faceHTML(who, c) + '<span class="saytx"><b>' + esc(c.name) + '</b>' + esc(text) + '</span>';
  document.body.appendChild(d);
  setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, ms || 2600);
}
// the speaker's portrait: the picture when it exists (free art or real art), else a coloured disc with an initial
function faceHTML(who, c) { var st = 'portrait-' + who; return '<span class="sayface" style="background:' + (c.color || '#4f7a45') + '">' + (typeof ART !== 'undefined' && ART.have && ART.have[st] ? artHTML(st, 'sayimg') : esc(c.mark || (c.name || '?')[0])) + '</span>'; }
