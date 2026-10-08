// lowgfx.js: "minimum graphics" test mode for the software-GL cloud boxes. Harness side only: the game is not changed.
// CSS size, HUD layout, tap coordinates, physics and input timing stay as they are; only the number of pixels drawn drops.
//   const G = require('./lowgfx');            // G.parse(process.argv, process.env) -> 'min' | 'normal'
//   browser = await chromium.launch({ args: G.launchArgs(gfx) });
//   ctx = await browser.newContext(G.contextOpts(gfx, { phone: true, width: 852, height: 393 }));
//   await ctx.addInitScript(G.initScript(gfx));            // before the first goto
//   await G.seed(page, gfx)                                // after localStorage.clear(), before the reload
// Use gfx=min for metric / input / layout runs. Use normal for the final reviewer screenshots (the owner judges the look).
const BASE = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
const MIN_DPR = 0.35;           // drawing buffer = CSS size x 0.35 (852x393 -> ~298x138), CSS box unchanged
const MIN_SET = { q: 'low', res: 'std', dres: 'off', fx: 'low', perf: false };  // keys of the game's own mho_set

exports.parse = (argv, env) => {
  const a = (argv || []).find(x => /^--gfx=/.test(x));
  const v = (a && a.split('=')[1]) || (env && env.GFX) || 'normal';
  if (v !== 'min' && v !== 'normal') throw new Error('gfx must be min or normal, got ' + v);
  return v;
};
exports.launchArgs = gfx => BASE.concat(gfx === 'min' ? ['--disable-gpu-vsync', '--disable-frame-rate-limit', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] : []);
// device scale factor 1 in min mode (normal phone runs use 3: a 2556x1179 buffer)
exports.contextOpts = (gfx, o) => {
  o = o || {};
  const w = o.width || 852, h = o.height || 393;
  if (!o.phone) return { viewport: { width: o.width || 1440, height: o.height || 900 } };
  return { viewport: { width: w, height: h }, deviceScaleFactor: gfx === 'min' ? 1 : (o.dsf || 3), isMobile: true, hasTouch: true };
};
// the game derives its WebGL pixel ratio from devicePixelRatio (the only use of it); overriding it shrinks every buffer, CSS stays the same
exports.initScript = gfx => gfx !== 'min' ? '' :
  `(()=>{try{Object.defineProperty(window,'devicePixelRatio',{get:()=>${MIN_DPR},configurable:true})}catch(e){}})();`;
// settings the game stores itself (SET in localStorage 'mho_set'): lowest quality tier, no dynamic-resolution surprises
exports.seed = (page, gfx) => gfx !== 'min' ? Promise.resolve() :
  page.evaluate(s => { const k = 'mho_set'; let o = {}; try { o = JSON.parse(localStorage.getItem(k) || '{}') } catch (e) {} localStorage.setItem(k, JSON.stringify(Object.assign(o, s))) }, MIN_SET);
exports.MIN_DPR = MIN_DPR; exports.MIN_SET = MIN_SET;
