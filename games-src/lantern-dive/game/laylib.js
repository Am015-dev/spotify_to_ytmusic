// Shared helpers for lay.js / lay-phone.js: a human step made only of real clicks/taps on the page's own controls.
// hand cards fan out and overlap: a real finger taps the visible left part of a card, not its (covered) centre
exports.posFor = async x => (typeof x !== 'string' && await x.evaluate(e => e.matches && e.matches('#hand .hc')).catch(() => false)) ? { position: { x: 8, y: 40 } } : {};
exports.stepper = (p, tap, log) => {
  // selectors, not element handles: the page re-renders its hand and panels whenever anything changes, so a handle goes stale between looking and tapping
  const cnt = sel => p.locator(sel + ':visible:not([disabled])').count();
  const at = (sel, n) => sel + ':visible:not([disabled]) >> nth=' + n;
  const first = async sel => (await cnt(sel)) ? at(sel, 0) : null;
  let nth = 0, bad = 0;
  // a 'stuck' answer is only reported when it repeats (the DOM can lag one render behind the engine for a moment)
  return async function step() { const r = await step0(); if (r && /^stuck|^no-card/.test(r)) { if (++bad < 30) { await p.waitForTimeout(100); return null; } } else bad = 0; return r; };
  async function step0() {
    const st = await p.evaluate(() => ({ ph: G.phase, must: iMustAct() && canAct(), job: UI.job, sel: UI.sel, pingSel: UI.pingSel, giveSel: UI.giveSel, tip: !!document.querySelector('#tip [data-a=tipok]'), pass: !!document.querySelector('#pass:not([hidden]) [data-a=takedev]'), rs: !document.querySelector('#rs').hidden }));
    if (st.pass) { await tap('#pass [data-a=takedev]'); return 'pass'; }
    if (st.tip) { await tap('#tip [data-a=tipok]'); return 'tip'; }
    if (!st.must) return null;
    nth++;
    const act = async a => { const b = await first('#acts [data-a=' + a + ']'); if (b) { await tap(b); return true; } return false; };
    if (st.ph === 'assign') {
      if (st.job < 0) { const n = await cnt('#pool .jcard'); if (n) { await tap(at('#pool .jcard', nth % n)); return 'pool'; } }
      if (await act('take')) return 'take';
      for (const a of ['pass', 'done', 'keep', 'accept', 'yes', 'offer', 'vote', 'decline', 'no']) if (await act(a)) return a;
      const n = await cnt('#pool .jcard'); if (n) { await tap(at('#pool .jcard', 0)); return 'pool'; }
      return 'stuck-assign';
    }
    if (st.ph === 'distress') { const b = await first('#acts [data-a]'); if (b) { await tap(b); return 'distress'; } return 'stuck-distress'; }
    if (st.ph === 'pass') { if (st.giveSel < 0) { const n = await cnt('#hand .hc:not(.dim)'); if (n) { await tap(at('#hand .hc:not(.dim)', 0)); return 'give-sel'; } } if (await act('give')) return 'give'; return 'stuck-pass'; }
    if (st.ph === 'predict') { if (await act('predict')) return 'predict'; return 'stuck-predict'; }
    if (st.ph === 'signal') { if (st.pingSel) { if (st.sel < 0) { const n = await cnt('#hand .hc.pk'); if (n) { await tap(at('#hand .hc.pk', 0)); return 'ping-card'; } return (await act('noping')) ? 'noping' : 'stuck-ping'; } if (await act('doping')) return 'ping'; } if (await act('nosig')) return 'nosig'; return 'stuck-signal'; }
    if (st.ph === 'play') {
      if (st.pingSel) { if (st.sel < 0) { const n = await cnt('#hand .hc.pk'); if (n) { await tap(at('#hand .hc.pk', 0)); return 'ping-card'; } return (await act('noping')) ? 'noping' : 'stuck-ping'; } if (await act('doping')) return 'ping'; }
      const helper = await p.evaluate(() => G.players[G.trick.turn].helper);
      const cs = helper ? '#opp .dc.can' : '#hand .hc:not(.dim)', n = await cnt(cs); if (!n) return 'no-card';
      if (st.sel >= 0 && await act('playcard')) return 'play';
      await tap(at(cs, nth % n)); await p.waitForTimeout(120); const s2 = await p.evaluate(() => UI.sel);
      if (s2 >= 0) { if (await act('playcard')) return 'play'; const sc = helper ? `#opp .dc[data-id="${s2}"]` : `#hand .hc[data-id="${s2}"]`; await tap(sc); return 'play'; }
      return 'tap';
    }
    return null;
  }
};
