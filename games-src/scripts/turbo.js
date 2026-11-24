// TURBO for tests (owner, 24 Nov): run a game ~100x faster than a human. Never play at human pace in tests.
// usage (Playwright, CommonJS):  const {turbo, budget} = require('./turbo');  const ctx = await browser.newContext({...}); await turbo(ctx);
//   const stop = budget(60000, 'my test');   // hard stop: throws/exits if the whole test runs longer than 60 s
//   page.waitForTimeout is forbidden: use `await tick(page, ms)` which advances game time instead: tick = page.evaluate(()=>window.__turboAdvance(ms))
// What it does: before any game script runs it (1) divides every setTimeout/setInterval delay by SPEED (default 100, min 0),
// (2) makes requestAnimationFrame fire immediately (~0-1 ms) and performance.now/Date.now run SPEED x faster,
// (3) injects CSS that kills transitions/animations, (4) mutes audio (no real-time sound waits). Game logic is unchanged.
const SPEED = +(process.env.TURBO || 100);
async function turbo(ctx, speed = SPEED) {
  await ctx.addInitScript(`(${function (S) {
    var ost = window.setTimeout, osi = window.setInterval, t0 = performance.now(), d0 = Date.now(), pn = performance.now.bind(performance), dn = Date.now.bind(Date);
    window.setTimeout = function (f, ms) { var a = [].slice.call(arguments, 2); return ost(function () { f.apply(null, a); }, Math.max(0, (ms || 0) / S)); };
    window.setInterval = function (f, ms) { var a = [].slice.call(arguments, 2); return osi(function () { f.apply(null, a); }, Math.max(1, (ms || 0) / S)); };
    window.requestAnimationFrame = function (f) { return ost(function () { f(performance.now()); }, 1); };
    window.cancelAnimationFrame = function (id) { clearTimeout(id); };
    performance.now = function () { return t0 + (pn() - t0) * S; };
    Date.now = function () { return d0 + (dn() - d0) * S; };
    window.__turboAdvance = function (ms) { return new Promise(function (r) { ost(r, Math.max(1, ms / S)); }); };
    document.addEventListener('DOMContentLoaded', function () { var s = document.createElement('style'); s.textContent = '*,*::before,*::after{animation-duration:.001s!important;animation-delay:0s!important;transition-duration:.001s!important;transition-delay:0s!important;scroll-behavior:auto!important}'; document.head.appendChild(s); });
    try { var AC = window.AudioContext || window.webkitAudioContext; if (AC) { AC.prototype.resume = function () { return Promise.resolve(); }; } HTMLMediaElement.prototype.play = function () { return Promise.resolve(); }; } catch (e) {}
  }})(${speed})`);
}
function budget(ms, label) { var t = setTimeout(function () { console.error('TEST BUDGET EXCEEDED (' + ms + ' ms): ' + (label || '') + ' - tests must run at machine speed'); process.exit(3); }, ms); return function () { clearTimeout(t); }; }
async function tick(page, ms) { return page.evaluate(function (m) { return window.__turboAdvance ? window.__turboAdvance(m) : null; }, ms); }
module.exports = { turbo, budget, tick };
