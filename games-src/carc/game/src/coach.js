// ---------- the coached first game (owner ADDENDUM 4): a real game with free legal moves from turn 1.
// A fixed deck only makes sure the needed situations come up (a banner town, roads, priories). Tamsin (guide) and Hob (rival) speak just in time,
// one small bubble at a time, never blocking input (taps pass through; Got it / the cross close it). No forced taps at all.
// Every rule is explained the first time it matters (GXCOACH.explained). At the end the score is walked through rule by rule with the real numbers,
// then a "Things you will meet later" card lists the rules that did not come up. Text: story.js (STORY.coach, STORY.coachEnd, STORY.coachLater).
window.GXCOACH = { running: false, explained: [], done: false, later: [] };
// tile ids (index into data.js TT): road, bend, town edge, banner bridge, priories, junctions, corner towns ... 30 tiles, about 15 minutes
const COACH_DECK = [31, 29, 7, 21, 1, 9, 29, 31, 0, 13, 21, 3, 18, 15, 19, 29, 31, 14, 23, 28, 9, 20, 21, 29, 3, 13, 18, 31, 29, 21];
(function () {
  let queue = [], cur = null, timer = 0;
  const cb = () => document.getElementById('coach');
  function ensureUI() {
    if (cb()) return cb();
    const d = document.createElement('div'); d.id = 'coach'; d.setAttribute('data-coach', '');
    d.innerHTML = '<div class="cbub" hidden><img class="cpic" alt=""><div class="ctxt"><b></b><span></span></div><button type="button" class="cok">Got it</button></div>';
    (document.getElementById('board') || document.body).appendChild(d);
    d.querySelector('.cok').addEventListener('click', e => { e.stopPropagation(); closeBubble(); });
    return d;
  }
  function showNext() {
    if (cur || !queue.length || !UI.coach) return;
    cur = queue.shift(); const d = ensureUI(), b = d.querySelector('.cbub'), c = STORY[cur.who];
    b.querySelector('.cpic').src = c.img; b.querySelector('b').textContent = c.name; b.querySelector('span').textContent = cur.text;
    b.style.setProperty('--cc', c.col); b.hidden = false; b.classList.remove('cin'); void b.offsetWidth; b.classList.add('cin');
    clearTimeout(timer); timer = setTimeout(closeBubble, 6500 + cur.text.length * 45);
  }
  function closeBubble() {
    clearTimeout(timer); const d = cb(); if (d) d.querySelector('.cbub').hidden = true; cur = null; setTimeout(showNext, 350);
  }
  function say(id, ctx) {
    if (!UI.coach || GXCOACH.explained.includes(id)) return; const def = STORY.coach[id]; if (!def) return;
    GXCOACH.explained.push(id);
    queue.push({ who: def.who, text: typeof def.t === 'function' ? def.t(ctx || {}) : def.t }); if (queue.length > 3) queue.splice(0, queue.length - 3);
    showNext();
  }
  window.coachSay = say;
  const featName = t => /priory/.test(t) ? 'priory' : /town/.test(t) ? 'town' : /field/.test(t) ? 'field' : 'road';
  window.coachTick = function () {   // after every render: situations that matter now
    if (!UI.coach || !G || G.over) return; ensureUI();
    if (myTurn('place')) { say('goal'); say('match'); say('preview'); if (TT[G.cur.t].C.some(c => c.p)) say('banner'); if (tilesLeft() <= 2) say('last'); }
    if (myTurn('fig')) { say('follower'); if (P(G.cur.p).sup.f === 0) say('nofig'); }
  };
  window.coachFx = function (f) {   // one engine event (called from playFx)
    if (!UI.coach || !G) return;
    if (f.t === 'fig') {
      const lf = lastFig(), ty = lf ? lf.ty : 'road', who = lf ? lf.p : -1;
      if (who === 0) say('claim_' + ty); else say('one_owner');
    } else if (f.t === 'discard') say('discard');
    else if (f.t === 'score') {
      const d = f.x, F = G.fd[d.r]; if (!F) return; const ty = F.ty === 'C' ? 'town' : F.ty === 'M' ? 'priory' : F.ty === 'R' ? 'road' : 'field'; if (ty === 'field') return;
      const mine = (d.fs || []).some(q => q[0] === 0), iWin = (d.win || []).includes(0);
      const ctx = { pts: d.pts, n: ty === 'priory' ? 0 : (F.tiles || []).length, pen: F.pen || 0 };
      if (d.win && d.win.length > 1) say('tie');
      else if (mine && !iWin) say('majority');
      else if (iWin) say('score_' + ty, ctx);
      else say('rival_score', ctx);
      if (iWin === false && !mine) say('rival_score', ctx);
    }
  };
  // ----- the end: final scoring walked through rule by rule with the real numbers, then "things you will meet later"
  window.coachEnd = function () {
    if (!UI.coach || !G || !G.over) return; closeBubble(); queue = [];
    const me = P(0), hob = P(1), E = STORY.coachEnd, win = G.over.win, ex = GXCOACH.explained;
    const pages = [['road', E.road({ a: me.sc.road, b: me.end.road })], ['town', E.town({ a: me.sc.town, b: me.end.town })], ['priory', E.priory({ a: me.sc.priory, b: me.end.priory })], ['field', E.field({ b: me.end.field })],
      ['total', E.total({ me: me.score, hob: hob.score, win: win.length === 1 && win[0] === 0, tie: win.length > 1 })]];
    let i = 0;
    const later = ['tie', 'majority', 'discard', 'banner', 'score_road', 'score_town', 'score_priory'].filter(k => !ex.includes(k)).concat(['river', 'inns', 'goods']);
    const shown = later.slice(0, 3);   // the card shows three short lines at most; every rule is also in How to play
    GXCOACH.later = later;
    const card = html => { const m = document.getElementById('modal'); m.innerHTML = '<div class="scrim"><div class="card coachcard" role="dialog" aria-label="Score summary">' + html + '</div></div>'; return m; };
    const finish = pro => {
      GXCOACH.done = true; GXCOACH.running = false; try { GXT.markDone(TUT_GAME); } catch (e) { }
      const first = window.CAMPAIGN && window.CAMPAIGN.chapters && window.CAMPAIGN.chapters[0];
      document.getElementById('modal').innerHTML = ''; const c = cb(); if (c) c.remove(); coachLeave(true);
      if (pro && first && typeof GXC !== 'undefined') GXC.play(first.id); else showStart();
    };
    const pro = !!UI.coachPro;
    const showLater = () => {
      const m = card('<h2>' + STORY.coachEnd.later + '</h2><ul class="clater">' + shown.map(k => '<li>' + STORY.coachLater[k] + '</li>').join('') + '</ul><button class="btn big" data-a="cgo">' + (pro ? 'Start chapter 1' : 'Play a real game') + '</button>');
      GXCOACH.done = true; m.querySelector('[data-a=cgo]').onclick = () => finish(pro);
    };
    const show = () => {
      if (i >= pages.length) return showLater();
      const [k, t] = pages[i]; const guide = STORY.guide;
      const m = card('<div class="cwalk"><img class="cpic" src="' + guide.img + '" alt=""><div><b>' + guide.name + '</b><p>' + t.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</p></div></div><div class="cstep">' + (i + 1) + ' / ' + pages.length + '</div><button class="btn big" data-a="cnext">' + (i === pages.length - 1 ? 'Continue' : 'Next') + '</button>');
      m.querySelector('[data-a=cnext]').onclick = () => { i++; show(); };
    };
    show();
  };
  window.coachLeave = function (quiet) {
    clearTimeout(timer); queue = []; cur = null; const d = cb(); if (d) d.remove();
    UI.coach = false; GXCOACH.running = false;
    if (quiet) { try { tutLeave(); } catch (e) { } return; }
    try { tutLeave(); } catch (e) { } showStart();
  };
  window.coachStart = function (o) {
    const pro = !!(o && o.prologue); try { GXC.close(); } catch (e) { }
    closeMenu(); UI.camp = null; UI.tut = false; UI.coach = true; UI.coachPro = pro; queue = []; cur = null;
    GXCOACH.explained = []; GXCOACH.done = false; GXCOACH.running = true; GXCOACH.later = [];
    beginGame({ np: 2, seats: ['human', 'ai'], lv: ['normal', 'easy'], ex: {}, seed: 11, stack: COACH_DECK.slice() });
    if (G && G.pl[1]) { G.pl[1].nm = STORY.rival.name; render(); }
    ensureUI(); setTimeout(() => { try { coachTick(); } catch (e) { } }, 400);
  };
})();
