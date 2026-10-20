// ===================== part 9: Story mode (campaign.json + the shared chapter kit gx-campaign.js) =====================
// A chapter is a real logbook dive with its own crew and (at most) one twist. The twists exist only here; the normal rules never change.
UI.camp = null;
function campTw(def) { return (def && def.twist && def.twist.id) || ''; }
function campOk(g) { return !!(g && g.phase === 'over' && g.result && g.result.ok); }
function campMetrics(g) {
  const mine = g.tasks.filter(t => t.owner === 0).length, pings = g.pings.filter(p => p.seat === 0).length;
  return { won: campOk(g), attempts: g.att, flare: g.distress ? 1 : 0, pings, myJobs: mine };
}
function campIsWon(g, def) {
  if (!campOk(g)) return false; const t = def.twist;
  if (t && t.id === 'no-flare' && g.distress) return false;
  if (t && t.id === 'air-limit' && g.att > (t.param || 4)) return false;
  return true;
}
// twist limit already broken: no point retrying this dive
function campDead(g, def) {
  const t = def && def.twist; if (!t) return false;
  if (t.id === 'no-flare') return !!g.distress; if (t.id === 'air-limit') return g.att >= (t.param || 4); return false;
}
function campStart(def) {
  const s = def.setup || {}, t = def.twist || null, mates = (t && t.id === 'rookie-mates' ? t.param : s.mates) || 'normal';
  let np = s.np || 4; if (t && t.id === 'big-team') np = t.param || 5;
  const o = { camp: def, np, kind: 'log', mission: s.mission || 1, seats: [0, 1, 2, 3], lv: [mates, mates, mates, mates], level: 'normal', timer: !!((t && t.id === 'clock-on') || s.timer) };
  UI.seed = s.seed != null ? s.seed : null;
  newGame('vs', o);
  UI.camp = def;
  UI.coach.level = def.hints ? 'full' : 'off'; render();
  try { toast('Goal: ' + def.goal.text); } catch (e) { }
}
function campFinish() { try { GXC.finish(G); } catch (e) { console.error(e); } }
// Story starts with the staged tutorial (Chapter 0) until it has been finished once; then it goes straight to the chapter map
function campOpen() { if (typeof GXC === 'undefined') return; closeRS(); if (typeof GXT !== 'undefined' && typeof tutStart === 'function' && !GXT.isDone('lantern-dive')) tutStart({ prologue: true }); else GXC.open(); }
function campOn() { return !!(UI.camp && typeof GXC !== 'undefined' && GXC.active()); }
// result footer inside a story chapter (called from showResult)
function campResult(box, ok) {
  const def = UI.camp, won = campIsWon(G, def), dead = campDead(G, def), bt = h('div.cbtns');
  if (def.twist && def.twist.text) box.append(h('p.sm', def.twist.text));
  if (ok && !won) box.append(h('p', 'The boss rule was broken, so the chapter is not won.'));
  if (!won && !dead) bt.append(h('button.btn.go', { 'data-a': 'retrysame', type: 'button' }, 'Try again (same jobs)'));
  bt.append(h('button.btn' + (won || dead ? '.go' : '.alt'), { 'data-a': 'campfin', type: 'button' }, won ? 'Continue the story' : 'Leave the dive'));
  bt.append(h('button.btn.alt', { 'data-a': 'rsclose', type: 'button' }, 'Look at the table'));
  box.append(bt);
}
{ const _ng = newGame; newGame = function (mode, o) { if (!(o && o.camp)) UI.camp = null; return _ng.apply(this, arguments); }; }
function campLine() {
  try {
    if (typeof GXC === 'undefined' || !window.CAMPAIGN) return '';
    const p = GXC.progress(), ch = window.CAMPAIGN.chapters, n = ch.filter(c => p.ch[c.id] && p.ch[c.id].beaten).length;
    return n ? n + ' of ' + ch.length + ' chapters done' : 'Ten chapters, three bosses';
  } catch (e) { return ''; }
}
function campInit() {
  if (typeof GXC === 'undefined' || !window.CAMPAIGN) return;
  GXC.init({
    game: 'lantern-dive', headButtons: () => { const b = document.createElement('button'); b.type = 'button'; b.className = 'gxc-ib'; b.textContent = 'Tutorial'; b.setAttribute('aria-label', 'Replay the tutorial'); b.addEventListener('click', () => { GXC.close(); tutStart(); }); return [b]; }, data: window.CAMPAIGN, startChapter: campStart, isWon: campIsWon, metrics: campMetrics,
    onExit: () => { UI.camp = null; showStart(); },
    scores: g => g.players.map(() => 0), seats: g => g.players.map((p, i) => ({ name: i === 0 ? 'You' : p.name, me: i === 0, ai: p.ai || undefined }))
  });
}
campInit();
