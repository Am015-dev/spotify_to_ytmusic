// Shared helpers for lay.js / lay-phone.js: a human step made only of real clicks/taps on the page's own controls.
exports.stepper = (p, tap, log) => {
  const vis = sel => p.$$(sel).then(async els => { const o = []; for (const e of els) { if (await e.isVisible() && await e.isEnabled()) o.push(e); } return o; });
  const first = async sel => (await vis(sel))[0];
  let nth = 0;
  return async function step() {
    const st = await p.evaluate(() => ({ ph: G.phase, must: iMustAct() && canAct(), job: UI.job, sel: UI.sel, pingSel: UI.pingSel, giveSel: UI.giveSel, tip: !!document.querySelector('#tip [data-a=tipok]'), pass: !!document.querySelector('#pass:not([hidden]) [data-a=takedev]'), rs: !document.querySelector('#rs').hidden }));
    if (st.pass) { await tap('#pass [data-a=takedev]'); return 'pass'; }
    if (st.tip) { await tap('#tip [data-a=tipok]'); return 'tip'; }
    if (!st.must) return null;
    nth++;
    const act = async a => { const b = await first(`#acts [data-a=${a}]`); if (b) { await tap(b); return true; } return false; };
    if (st.ph === 'assign') {
      if (st.job < 0) { const pl = await vis('#pool .jcard'); if (pl.length) { await tap(pl[nth % pl.length]); return 'pool'; } }
      if (await act('take')) return 'take';
      for (const a of ['pass', 'done', 'keep', 'accept', 'yes', 'offer', 'vote', 'decline', 'no']) if (await act(a)) return a;
      const pl = await vis('#pool .jcard'); if (pl.length) { await tap(pl[0]); return 'pool'; }
      return 'stuck-assign';
    }
    if (st.ph === 'distress') { const b = await first('#acts [data-a]'); if (b) { await tap(b); return 'distress'; } return 'stuck-distress'; }
    if (st.ph === 'pass') { if (st.giveSel < 0) { const c = await first('#hand .hc:not(.dim)'); if (c) { await tap(c); return 'give-sel'; } } if (await act('give')) return 'give'; return 'stuck-pass'; }
    if (st.ph === 'predict') { if (await act('predict')) return 'predict'; return 'stuck-predict'; }
    if (st.ph === 'signal') { if (st.pingSel) { if (st.sel < 0) { const c = await first('#hand .hc.pk'); if (c) { await tap(c); return 'ping-card'; } return (await act('noping')) ? 'noping' : 'stuck-ping'; } if (await act('doping')) return 'ping'; } if (await act('nosig')) return 'nosig'; return 'stuck-signal'; }
    if (st.ph === 'play') {
      if (st.pingSel) { if (st.sel < 0) { const c = await first('#hand .hc.pk'); if (c) { await tap(c); return 'ping-card'; } return (await act('noping')) ? 'noping' : 'stuck-ping'; } if (await act('doping')) return 'ping'; }
      const helper = await p.evaluate(() => G.players[G.trick.turn].helper);
      const cs = await vis(helper ? '#opp .dc.can' : '#hand .hc:not(.dim)'); if (!cs.length) return 'no-card';
      if (st.sel >= 0 && await act('playcard')) return 'play';
      await tap(cs[nth % cs.length]); await p.waitForTimeout(120); const s2 = await p.evaluate(() => UI.sel);
      if (s2 >= 0) { if (await act('playcard')) return 'play'; const sc = await first(helper ? `#opp .dc[data-id="${s2}"]` : `#hand .hc[data-id="${s2}"]`); if (sc) { await tap(sc); return 'play'; } }
      return 'tap';
    }
    return null;
  };
};
