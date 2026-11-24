// Wickdeep campaign: the party between scenarios (XP, levels, new cards, perks, gold, items, unlocked scenarios). No DOM; saves to localStorage.
(function (g) {
  'use strict';
  var D = g.WDD, KEY = 'wickdeep-camp-v1';
  var C = {};
  C.load = function () { try { var s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } };
  C.save = function (c) { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) { } };
  C.clear = function () { try { localStorage.removeItem(KEY); } catch (e) { } };
  C.newCamp = function (classes, diff) {
    return { v: 1, party: classes.map(function (cls) { return { cls: cls, xp: 0, gold: 30, picked: [], hand: D.defaultHand(cls), perks: [], checks: 0, items: [] }; }),
      done: {}, tries: {}, unlocked: [1], shop: D.SHOP_START.slice(), diff: diff || 0, history: [] };
  };
  C.lvl = function (h) { return D.levelFor(h.xp); };
  C.perksEarned = function (h) { return (C.lvl(h) - 1) + Math.floor(h.checks / 3); };
  C.perksLeft = function (h) { return Math.max(0, Math.min(D.HERO[h.cls].perks.length, C.perksEarned(h)) - h.perks.length); };
  C.cardPending = function (h) { return h.picked.length < C.lvl(h) - 1; };
  C.levelChoices = function (h) {
    var L = C.lvl(h);
    return D.HERO[h.cls].cards.filter(function (c) { return typeof c[2] === 'number' && c[2] <= L && h.picked.indexOf(c[0]) < 0; }).map(function (c) { return c[0]; });
  };
  function power(id) { var c = D.CARD[id]; return (c.top + ' ' + c.bot).replace(/[^0-9 ]/g, ' ').split(/\s+/).filter(Boolean).reduce(function (s, x) { return s + (+x); }, 0) + (typeof c.lvl === 'number' ? c.lvl * 2 : 0); }
  C.pickCard = function (h, id) {
    if (h.picked.indexOf(id) >= 0) return null;
    h.picked.push(id);
    // the new card goes into the hand in place of the weakest card you carry
    var worst = null, wp = 1e9; h.hand.forEach(function (c) { var p = power(c); if (p < wp) { wp = p; worst = c; } });
    if (worst) h.hand[h.hand.indexOf(worst)] = id;
    return worst;
  };
  C.pool = function (h) { return D.cardPool(h.cls, C.lvl(h), h.picked); };
  C.toggleHand = function (h, id) {
    var i = h.hand.indexOf(id), H = D.HERO[h.cls].hand;
    if (i >= 0) { if (h.hand.length > 0) h.hand.splice(i, 1); }
    else if (h.hand.length < H) h.hand.push(id);
    return h.hand.length === H;
  };
  C.takePerk = function (h, idx) { if (C.perksLeft(h) <= 0 || h.perks.indexOf(idx) >= 0) return false; h.perks.push(idx); return true; };
  C.slotsUsed = function (h, slot) { return h.items.filter(function (id) { var s = D.ITEM_BY[id].slot; return slot === 'hand' ? (s === 'hand' ? 1 : s === 'two' ? 2 : 0) : s === slot; }).reduce(function (a, id) { var s = D.ITEM_BY[id].slot; return a + (slot === 'hand' && s === 'two' ? 2 : 1); }, 0); };
  C.slotMax = function (h, slot) { return slot === 'hand' ? 2 : slot === 'small' ? Math.ceil(C.lvl(h) / 2) : 1; };
  C.canBuy = function (c, h, id) {
    var it = D.ITEM_BY[id]; if (!it) return 'no such item';
    if (h.items.indexOf(id) >= 0) return 'already owned';
    if (h.gold < it.cost) return 'not enough gold';
    var slot = it.slot === 'two' ? 'hand' : it.slot, need = it.slot === 'two' ? 2 : 1;
    if (C.slotsUsed(h, slot) + need > C.slotMax(h, slot)) return 'no free ' + (slot === 'hand' ? 'hand' : slot) + ' slot';
    return '';
  };
  C.buy = function (c, h, id) { var why = C.canBuy(c, h, id); if (why) return why; h.gold -= D.ITEM_BY[id].cost; h.items.push(id); return ''; };
  C.sell = function (c, h, id) { var i = h.items.indexOf(id); if (i < 0) return; h.items.splice(i, 1); h.gold += Math.floor(D.ITEM_BY[id].cost / 2); };
  C.available = function (c) { return c.unlocked.filter(function (id) { return !c.done[id]; }); };
  C.goalsFor = function (seed) {   // two goals to choose from
    var n = D.GOAL.length, a = seed % n, b = (a + 1 + (Math.floor(seed / n) % (n - 1))) % n;
    return [D.GOAL[a].id, D.GOAL[b].id];
  };
  C.partyFor = function (c, goals) {
    return c.party.map(function (h, i) { return { cls: h.cls, lvl: C.lvl(h), cards: h.hand.slice(), perks: h.perks.slice(), items: h.items.slice(), goal: goals ? goals[i] : null }; });
  };
  // apply a finished scenario. Returns a summary for the result screen.
  C.result = function (c, scId, done) {
    var sc = D.SCEN[scId], out = { won: done.won, heroes: [], unlocked: [], shop: [], items: [] };
    c.tries[scId] = (c.tries[scId] || 0) + 1;
    done.res.forEach(function (r, i) {
      var h = c.party[i]; if (!h) return;
      var before = C.lvl(h), gold = r.gold + (done.won && sc.reward ? (sc.reward.gold || 0) : 0);
      h.xp += r.xp; h.gold += gold;
      var goal = r.goal && D.GOAL_BY[r.goal], gotGoal = !!(done.won && goal && goal.test(r));
      if (gotGoal) h.checks++;
      out.heroes.push({ cls: h.cls, xp: r.xp, gold: gold, goal: goal ? goal.n : null, gotGoal: gotGoal, lvlUp: C.lvl(h) > before, lvl: C.lvl(h) });
    });
    (done.items || []).forEach(function (t) {
      var i = +t.id.slice(1), h = c.party[i]; if (!h) return;
      if (h.items.indexOf(t.item) < 0 && !C.canBuy(c, Object.assign({}, h, { gold: 999 }), t.item)) { h.items.push(t.item); out.items.push(t.item); }
      else { h.gold += Math.floor(D.ITEM_BY[t.item].cost / 2); }
      if (c.shop.indexOf(t.item) < 0) c.shop.push(t.item);
    });
    if (done.won) {
      c.done[scId] = true;
      (sc.unlock || []).forEach(function (u) { if (c.unlocked.indexOf(u) < 0) { c.unlocked.push(u); out.unlocked.push(u); } });
      ((sc.reward && sc.reward.items) || []).forEach(function (it) { if (c.shop.indexOf(it) < 0) { c.shop.push(it); out.shop.push(it); } });
    }
    c.history.push({ sc: scId, won: done.won, round: done.round });
    return out;
  };
  C.finished = function (c) { return !!c.done[25]; };
  g.WDC = C;
})(typeof window !== 'undefined' ? window : globalThis);
