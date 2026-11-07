/* Wildmark tutorial (shell/gx-tutor.js): a staged 1-turn solo valley, 6 steps. The market is fixed each turn so every rule comes up on cue:
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
  // READABLE: 7 short steps, each makes the player DO one action once (powers like sweeps and acorns live in the help drawer)
  return [
    { id: 'cards', title: 'How you score', say: 'Each animal scores its own pattern. Tap a card any time to see it.', target: tq('#cards'), wait: null, ready: function () { return tpick() && G.seats[0].done === 0; } },
    { id: 'take', title: 'Take a pair', say: 'Tap the forest tile with the bear. You get the tile and the animal under it.', target: tq('#mk .mt[data-i="0"]'), also: tq('#mk .mk[data-i="0"]'), wait: { type: 'tap', match: function (a) { return a.what === 'take' && a.i === 0; } }, ready: function () { return tpick() && G.seats[0].done === 0; } },
    { id: 'spot', title: 'Place the tile', say: 'Tap a glowing spot next to your valley.', target: tq('#map .spot'), wait: { type: 'tap', match: function (a) { return a.what === 'spot'; } }, ready: function () { return G.stage === 'tile' && !UI.ghost; } },
    { id: 'ok', title: 'Confirm', say: 'Tap Place.', target: tq('#okB'), wait: { type: 'tap', match: function (a) { return a.what === 'ok'; } }, ready: function () { return G.stage === 'tile' && !!UI.ghost; } },
    { id: 'tok', title: 'Settle the bear', say: 'Tap the new tile: it shows a bear. Gold rim = keystone, so you also earn an acorn.', target: tcell(function () { return G.hold && G.hold.at; }), wait: { type: 'tap', match: function (a) { return a.what === 'tok' && a.c === G.hold.at; } }, ready: function () { return G.stage === 'tok'; } },
    { id: 'end', title: 'You can play', say: 'That was one turn. A real season is 20 turns: animals, joined terrain and acorns add up.', target: tq('#rs .rbig'), wait: null, ready: function () { return G.over && !$('#rs').hidden; } }
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
    setup: function () { try { GX.close(); } catch (e) { } if (window.GXC && GXC.close) try { GXC.close(); } catch (e) { } UI.mode = 'tutorial'; UI.tut = {}; UI.prefs.played = 1; savePrefs(); newGame({ np: 1, humans: 1, seed: TUT_SEED, turns: 1 }); UI.mode = 'tutorial'; tutFix(); },
    onDone: function (r) { tutLeave(); var c = r && r.choice; $('#rs').hidden = true; if (c === 'chapter' && first) { showTitle(); GXC.play(first.id); } else if (c === 'story' && window.GXC) { showTitle(); GXC.open(); } else { UI.sv = 'setup'; showTitle(); } },
    onExit: function () { tutLeave(); UI.sv = 'title'; showTitle(); }
  });
}
