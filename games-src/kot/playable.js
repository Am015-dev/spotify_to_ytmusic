// ===== Playable pass (W386, 7 Nov 2026): a newcomer can follow every turn. Presentation only, the rules never change. =====
// 1) every die says what it is (word under the face)   2) a big "Your turn" / "<Rival>'s turn" banner when the turn changes
// 3) the one line on the board says what to do now, with the roll number   4) a rival's turn reads as short captions, one per step
(function () {
  const $ = id => document.getElementById(id);
  const quiet = () => { try { return typeof tutOn === 'function' && tutOn() } catch (e) { return false } };
  // ---- 1) dice captions
  const LAB = { '1': 'STAR', '2': 'STAR', '3': 'STAR', E: 'ENERGY', H: 'HEAL', C: 'HIT', C2: 'HIT ×2', E2: 'ENERGY ×2', O: 'OUCH' };
  function dieLabels() {
    const di = $('dice'); if (!di || !(typeof G!=='undefined'&&G)) return;
    di.querySelectorAll('.die[data-die]').forEach(b => { const d = G.dice[+b.dataset.die]; if (!d) return; const l = LAB[d.f] || ''; if (b.dataset.lab !== l) { b.dataset.lab = l; b.dataset.f = d.f } });
  }
  try { new MutationObserver(dieLabels).observe($('dice') || document.body, { childList: true, subtree: !$('dice') }) } catch (e) { }
  // ---- 2) turn banner
  let key = '', hideT = 0;
  function banner() {
    if (!(typeof G!=='undefined'&&G) || G.winner || UI.intro || quiet()) return;
    const k = G.gid + '/' + G.tid + '/' + G.active; if (k === key) return; key = k;
    let el = $('ccbanner'); if (!el) { el = document.createElement('div'); el.id = 'ccbanner'; el.setAttribute('aria-live', 'polite'); document.body.appendChild(el) }
    const p = cur(), me = typeof humanTurn === 'function' && humanTurn();
    el.style.setProperty('--bc', MONS[p.m].c);
    el.className = me ? 'me' : 'rival';
    el.innerHTML = me ? '<b>YOUR TURN</b><span>Roll the dice</span>' : `<b>${esc(mname(p))}’s turn</b><span>Watch what it does</span>`;
    void el.offsetWidth; el.classList.add('on'); clearTimeout(hideT); hideT = setTimeout(() => el.classList.remove('on'), me ? 1100 : 900);
  }
  // ---- 3) + 4) the line on the board (board.js bfLineText passes its text through here)
  const turnLogs = () => { const n0 = (typeof RECAP !== 'undefined' && RECAP.turnN) || 0; return G.log.filter(l => l.n > n0 && l.s === G.active) };
  window.ppLine = function (t) {
    try {
      if (!(typeof G !== 'undefined' && G) || G.winner || UI.intro || UI.choice || quiet()) return t;
      const p = cur();
      if (!humanTurn() && !(NET.on && G.pl[G.active].human)) {
        const ev = turnLogs()[0]; const s = ev ? String(ev.t).replace(/\s+/g, ' ') : '';
        if (G.phase === 'roll' && !s) return `${mname(p)} is rolling the dice…`;
        return s ? (s.length > 64 ? s.slice(0, 61) + '…' : s) : `${mname(p)} is thinking…`;
      }
      if (humanTurn() && G.phase === 'roll' && G.dice.length) { const tot = rerollsOf(p) + 1, n = Math.min(tot, Math.max(1, tot - G.rolls)); return `Roll ${n} of ${tot} · ${t}` }
      if (humanTurn() && G.phase === 'buy') return 'Buy phase · ' + t;
    } catch (e) { }
    return t;
  };
  window.ppAfter = function () { banner(); dieLabels(); if (typeof bfLine === 'function') bfLine() };
  window.addEventListener('load', () => setTimeout(dieLabels, 300));
})();
