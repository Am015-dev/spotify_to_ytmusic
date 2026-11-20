// F2 desktop layout (owner request, 20 Nov 2026): on a wide mouse screen (>= 1100 x 600, not the phone layout) the game uses the width:
// the monsters sit in a left panel, the board stays in the centre, and the cards for sale join the right panel. The phone layout is untouched.
// It moves the existing panels (#monswrap, #marketwrap) instead of copying them, so every render function keeps writing to the same elements.
const DESK = { on: false };
function deskWant() { return innerWidth >= 1100 && innerHeight >= 600 && !document.documentElement.classList.contains('ph') }
function deskApply() {
  const main = document.querySelector('.gx-main'), board = document.querySelector('.gx-board'), body = document.getElementById('dockbody'), root = document.documentElement;
  if (!main || !board || !body) return; const want = deskWant();
  if (want && !DESK.on) {
    let left = document.getElementById('ccleft'); if (!left) { left = document.createElement('aside'); left.id = 'ccleft'; left.setAttribute('aria-label', 'Monsters'); left.innerHTML = '<h2>Monsters</h2>' }
    main.insertBefore(left, board); DESK.mons = document.getElementById('monswrap'); DESK.monsHome = DESK.mons.parentElement; left.appendChild(DESK.mons);
    DESK.mkt = document.getElementById('marketwrap'); DESK.mktHome = DESK.mkt.parentElement; DESK.mkt.insertAdjacentHTML('afterbegin', '<h2 class="ccmh">Cards for sale</h2>'); body.appendChild(DESK.mkt);
    DESK.on = true; root.classList.add('cc-desk')
  } else if (!want && DESK.on) {
    DESK.monsHome.appendChild(DESK.mons); const h = DESK.mkt.querySelector('.ccmh'); if (h) h.remove(); DESK.mktHome.appendChild(DESK.mkt);
    const left = document.getElementById('ccleft'); if (left) left.remove(); DESK.on = false; root.classList.remove('cc-desk')
  }
  const game = !!(typeof G !== 'undefined' && G && !UI.info); root.classList.toggle('cc-game', DESK.on && game);
  if (DESK.on && game) try { renderScore() } catch (e) {}
}
// the two drawers whose content now lives on screen: flash the panel instead of opening an empty drawer
function deskFlash(id) { const el = document.getElementById(id === 'dr-mons' ? 'ccleft' : 'marketwrap'); if (!el) return; el.classList.remove('ccflash'); void el.offsetWidth; el.classList.add('ccflash') }
addEventListener('click', e => { if (!DESK.on) return; const t = e.target.closest && e.target.closest('[data-gx="dr-mons"],[data-gx="dr-market"]'); if (!t) return;
  e.preventDefault(); e.stopPropagation(); try { if (GX.open) GX.close() } catch (x) {} deskFlash(t.dataset.gx) }, true);
if (typeof GX !== 'undefined' && GX.show) { const _gs = GX.show; GX.show = function (id) { if (DESK.on && (id === 'dr-mons' || id === 'dr-market')) { deskFlash(id); return } return _gs.apply(GX, arguments) } }
{ const _rd = render; render = function () { const r = _rd.apply(this, arguments); try { deskApply() } catch (e) {} return r } }
addEventListener('resize', () => { try { deskApply() } catch (e) {} });
deskApply();
