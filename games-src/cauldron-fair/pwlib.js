// Shared Playwright helpers for lay.js / lay-phone.js / px-test.js (not shipped).
const fs = require('fs'), path = require('path');
const PW = require(process.env.PW || 'playwright');
const html = fs.readFileSync(path.join(__dirname, 'cauldron-fair.html'));
const L = {};
L.PW = PW; L.html = html;
L.launch = () => PW.chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
L.page = async (b, W, H, o) => {
  o = o || {}; const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: !!o.mobile, hasTouch: !!o.touch });
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  const p = await ctx.newPage(); p.setDefaultTimeout(30000); p.errs = [];
  p.on('pageerror', e => p.errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load/.test(m.text())) p.errs.push(m.text()); });
  p.ctx = ctx; return p;
};
// one human action through the page's own buttons (dispatched clicks, for speed). Returns 'over' | 'did' | 'wait'.
L.autoStep = p => p.evaluate(() => {
  const q = s => [...document.querySelectorAll(s)].filter(b => !b.disabled && !b.closest('[hidden]'));
  const click = e => e.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  if (G && G.phase === 'over' && !document.querySelector('#rs').hidden) return 'over';
  if (!document.querySelector('#rs').hidden) {
    const take = q('#rs [data-a=take]')[0]; if (take) { click(take); return 'did'; }
    const cont = q('#rs [data-a=rscont]')[0]; if (cont) { click(cont); return 'did'; }
    const buy = q('#rs [data-a=shopbuy]')[0]; if (buy) { const s = q('#rs [data-a=shopsel]')[0]; if (s) click(s); click(buy); return 'did'; }
    const o = q('#rs .dec [data-a=mv]')[0]; if (o) { click(o); return 'did'; }
    return 'wait';
  }
  const tip = q('#pc [data-a=tipok]')[0]; if (tip) { click(tip); return 'did'; }
  const take = q('#pc [data-a=take]')[0]; if (take) { click(take); return 'did'; }
  const acts = q('#acts [data-a=mv],#qbox [data-a=mv]');
  if (acts.length) { const d = acts.find(b => /Draw/.test(b.textContent)), s = acts.find(b => /^Stop/.test(b.textContent.trim())); click(d && s ? (Math.random() < .75 ? d : s) : acts[0]); return 'did'; }
  return 'wait';
});
L.playTo = async (p, until, max) => { for (let k = 0; k < (max || 4000); k++) { const r = await L.autoStep(p); if (r === 'over') return 'over'; if (until && await p.evaluate(until)) return 'cond'; if (r === 'wait') await p.waitForTimeout(40); } return 'timeout'; };
L.myTurn = async p => { for (let k = 0; k < 200; k++) { const s = await p.evaluate(() => !!document.querySelector('#acts .drawb') || (G && G.phase === 'over') || !document.querySelector('#rs').hidden || !document.querySelector('#pc').hidden); if (s) return true; await p.waitForTimeout(120); } return false; };
module.exports = L;
