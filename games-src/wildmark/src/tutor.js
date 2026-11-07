/* Wildmark tutorial (shell/gx-tutor.js): a staged 3-turn solo valley. The market is fixed each turn so every rule comes up on cue:
   take a pair, place a tile, settle a token, keystone acorn, turn a split tile, a bear pair scoring, sweeping three tokens, an acorn free pick. */
var TUT_GAME = 'wildmark', TUT_SEED = 11;
function tutOn() { return window.GXT && GXT.active() && UI.mode === 'tutorial'; }
function tutAct(x) { if (!tutOn()) return true; return GXT.act(Object.assign({ type: 'tap' }, x)); }
function tutTok(a, slot) { var old = G.market.toks[slot]; if (old) G.bag[old]++; G.bag[a]--; G.market.toks[slot] = a; }
function tutTile(t, slot) { G.market.tiles[slot] = Object.assign({ id: 900 + slot + G.seats[0].done * 4 }, t); }
UI.tut = {};
function tutFix() {
  if (UI.mode !== 'tutorial' || !G || G.over || G.stage !== 'pick') return;
  var n = G.seats[0].done, T = UI.tut; if (T['t' + n]) return; T['t' + n] = 1;
  if (n === 0) { tutTile({ t: ['forest'], a: ['bear'], key: true }, 0); tutTok('bear', 0); tutTok('elk', 1); tutTok('hawk', 2); tutTok('salmon', 3); }
  if (n === 1) { tutTile({ t: ['forest', 'meadow'], a: ['bear', 'fox'], key: false }, 1); tutTok('fox', 0); tutTok('bear', 1); tutTok('hawk', 2); tutTok('salmon', 3); }
  if (n === 2) { tutTok('elk', 0); tutTok('elk', 1); tutTok('elk', 2); tutTok('fox', 3); tutTile({ t: ['river'], a: ['salmon'], key: true }, 2); }
  render();
}
function tq(sel) { return function () { var e = document.querySelector(sel); return e && e.getBoundingClientRect().width && !e.disabled ? e : null; }; }
function tcell(fn) { return function () { var c = fn(); if (!c) return null; var e = document.querySelector('#map [data-c="' + c + '"]'); return e && e.getBoundingClientRect().width ? e : null; }; }
function tbear() { var env = G.seats[0].env; for (var c in env) if (env[c].tok === 'bear') return c; return null; }
function tspotNear() { var b = tbear(); if (!b) return null; var sp = WM.spots(G.seats[0].env); var n = WM.nb(b).filter(function (x) { return sp.indexOf(x) >= 0; }); return n[0] || null; }
function tpick() { return G && G.stage === 'pick' && !G.over && $('#pass').hidden; }
function tutSteps() {
  return [
    { id: 'goal', title: 'Welcome, ranger', say: 'Grow a valley for 20 turns. Animals in patterns and big habitats score. This practice lasts 3 turns.', target: tq('#map'), wait: null, ready: function () { return tpick() && G.seats[0].done === 0; } },
    { id: 'cards', title: 'Animal cards', say: 'Each animal scores its own pattern. Your points per animal show here.', target: tq('#cards'), wait: null, ready: function () { return tpick(); } },
    { id: 'take', title: 'Take a pair', say: 'Each column is a tile with a token. Tap the forest tile with the bear.', target: tq('#mk .mt[data-i="0"]'), also: tq('#mk .mk[data-i="0"]'), wait: { type: 'tap', match: function (a) { return a.what === 'take' && a.i === 0; } }, ready: function () { return tpick() && G.seats[0].done === 0; } },
    { id: 'spot', title: 'Place the tile', say: 'Tiles go next to your valley. Tap a glowing spot.', target: tq('#map .spot'), wait: { type: 'tap', match: function (a) { return a.what === 'spot'; } }, ready: function () { return G.stage === 'tile' && !UI.ghost; } },
    { id: 'ok', title: 'Confirm', say: 'Happy with it? Tap Place.', target: tq('#okB'), wait: { type: 'tap', match: function (a) { return a.what === 'ok'; } }, ready: function () { return G.stage === 'tile' && !!UI.ghost; } },
    { id: 'tok', title: 'Settle the bear', say: 'Tokens go on tiles that show that animal. Tap the new tile.', target: tcell(function () { return G.hold && G.hold.at; }), wait: { type: 'tap', match: function (a) { return a.what === 'tok' && a.c === G.hold.at; } }, ready: function () { return G.stage === 'tok'; } },
    { id: 'acorn', title: 'A keystone acorn', say: 'Gold rim means keystone: an animal there earns an acorn. Acorns are 1 point, or a power.', target: tq('#acorn'), wait: null, ready: function () { return tpick() && G.seats[0].done === 1; } },
    { id: 'take2', title: 'Another bear', say: 'Bears score in pairs. Take the split tile with the second bear.', target: tq('#mk .mt[data-i="1"]'), also: tq('#mk .mk[data-i="1"]'), wait: { type: 'tap', match: function (a) { return a.what === 'take' && a.i === 1; } }, ready: function () { return tpick() && G.seats[0].done === 1; } },
    { id: 'spot2', title: 'Next to the bear', say: 'Place it beside your first bear.', target: tcell(tspotNear), wait: { type: 'tap', match: function (a) { return a.what === 'spot' && a.c === tspotNear(); } }, ready: function () { return G.stage === 'tile' && !UI.ghost && !!tspotNear(); } },
    { id: 'rot', title: 'Turn the tile', say: 'Split tiles have two terrains. Turn it so matching edges touch.', target: tq('#rotB'), wait: { type: 'tap', match: function (a) { return a.what === 'rot'; } }, ready: function () { return G.stage === 'tile' && !!UI.ghost; } },
    { id: 'ok2', title: 'Place it', say: 'Matching edges join habitats: 1 point per tile in your largest group. Tap Place.', target: tq('#okB'), wait: { type: 'tap', match: function (a) { return a.what === 'ok'; } }, ready: function () { return G.stage === 'tile' && !!UI.ghost; } },
    { id: 'tok2', title: 'Make a pair', say: 'Put the bear on the new tile. Watch the pair light up!', target: tcell(function () { return G.hold && G.hold.at; }), wait: { type: 'tap', match: function (a) { return a.what === 'tok' && a.c === G.hold.at; } }, ready: function () { return G.stage === 'tok'; } },
    { id: 'pair', title: 'Twin Dens', say: 'Two bears side by side score as a pair. More pairs score much more.', target: tq('#cards .cc[data-card="bear"]'), wait: null, ready: function () { return tpick() && G.seats[0].done === 2; } },
    { id: 'sweep', title: 'Crowded market', say: 'Three matching tokens? Sweep them away for new ones, once per turn.', target: tq('#w3B'), wait: { type: 'tap', match: function (a) { return a.what === 'w3'; } }, ready: function () { return tpick() && G.seats[0].done === 2 && !!document.querySelector('#w3B'); } },
    { id: 'free', title: 'Spend an acorn', say: 'An acorn lets you take any tile with any token. Tap Acorn: free pick.', target: tq('#freeB'), wait: { type: 'tap', match: function (a) { return a.what === 'freeB'; } }, ready: function () { return tpick() && G.used3 && !UI.free; } },
    { id: 'freet', title: 'Any tile', say: 'Take the river keystone.', target: tq('#mk .mt[data-i="2"]'), wait: { type: 'tap', match: function (a) { return a.what === 'freet' && a.i === 2; } }, ready: function () { return tpick() && !!UI.free && UI.free.ti == null; } },
    { id: 'freek', title: 'Any token', say: 'Now take any token you like.', target: tq('#mk'), wait: { type: 'tap', match: function (a) { return a.what === 'freek' && a.i !== 2; } }, ready: function () { return tpick() && !!UI.free && UI.free.ti === 2; } },
    { id: 'spot3', title: 'Your choice', say: 'Place it anywhere that glows, then tap Place.', target: tq('#map .spot'), wait: { type: 'tap', match: function (a) { return a.what === 'spot'; } }, ready: function () { return G.stage === 'tile' && !UI.ghost; } },
    { id: 'ok3', title: 'Place', say: 'Tap Place.', target: tq('#okB'), wait: { type: 'tap', match: function (a) { return a.what === 'ok'; } }, ready: function () { return G.stage === 'tile' && !!UI.ghost; } },
    { id: 'tok3', title: 'Settle or return', say: 'Settle the token on a glowing tile, or return it if it would spoil a pattern.', target: function () { return document.querySelector('#map .tgt') || tq('#backB')(); }, also: tq('#backB'), wait: { type: 'tap', match: function (a) { return a.what === 'tok' || a.what === 'back'; } }, ready: function () { return G.stage === 'tok'; } },
    { id: 'end', title: 'Season over', say: 'Animals, habitats and acorns add up. A real season lasts 20 turns.', target: tq('#rs .rbig'), wait: null, ready: function () { return G.over && !$('#rs').hidden; } }
  ];
}
function storyOpen() { if (!window.GXC) return; if (window.GXT && !GXT.isDone(TUT_GAME)) tutStart({ prologue: true }); else GXC.open(); }
function tutLeave() { UI.mode = 'quick'; UI.tutor = false; }
function tutStart(o) {
  if (!window.GXT) return; o = o && o.prologue ? o : null;
  var first = window.CAMPAIGN && CAMPAIGN.chapters[0];
  GXT.start({
    game: TUT_GAME, steps: tutSteps(), story: !!(window.CAMPAIGN && window.GXC), endTitle: 'You know the rules',
    endText: o ? 'Take, place, settle, sweep, acorns. Now the Story begins.' : 'Take, place, settle, sweep, acorns. The lightbulb helps any time.',
    endButtons: o && first ? [{ id: 'chapter', label: 'Start region 1' }] : null,
    setup: function () { try { GX.close(); } catch (e) { } if (window.GXC && GXC.close) try { GXC.close(); } catch (e) { } UI.mode = 'tutorial'; UI.tut = {}; UI.prefs.played = 1; savePrefs(); newGame({ np: 1, humans: 1, seed: TUT_SEED, turns: 3 }); UI.mode = 'tutorial'; tutFix(); },
    onDone: function (r) { tutLeave(); var c = r && r.choice; $('#rs').hidden = true; if (c === 'chapter' && first) { showTitle(); GXC.play(first.id); } else if (c === 'story' && window.GXC) { showTitle(); GXC.open(); } else { UI.sv = 'setup'; showTitle(); } },
    onExit: function () { tutLeave(); UI.sv = 'title'; showTitle(); }
  });
}
