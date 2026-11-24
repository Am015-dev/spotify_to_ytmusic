// shared helper for the Sands UI proof: reach a real mid-game position (bids played, your move) and add one of every build mark.
exports.midgame = async function (p) {
  await p.waitForFunction(() => typeof G !== 'undefined' && G && G.phase === 'bid', null, { timeout: 25000 });
  await p.waitForTimeout(1200);
  return p.evaluate(() => {
    let n = 0; while (G.phase === 'bid' && n++ < 20) { const s = sideToAct(); const m = validMoves(s); if (!m.length) break; performMove(m[0], s); }
    const pick = k => G.board.filter(t => t.k === k && !t.block && t.camel == null && t.tent == null).map(t => t.i);
    const ox = pick('oasis')[0], sh = pick('sacred'), vi = pick('village')[0], st = pick('small')[0], ba = pick('large')[0];
    const me = G.pl[0], rv = G.pl[1];
    me.el = 1; me.fk = 0; me.dj = ['wahha', 'zarifa']; me.used = { wahha: 1 };     // 1 Sage only: cannot summon yet
    claimTile(me, ox, 'camel'); placePalm(me, ox); placePalm(me, ox);               // Oasis: camel + 2 palms
    claimTile(me, sh[0], 'camel'); placePalace(me, sh[0]);                           // Shrine: camel + palace
    claimTile(rv, vi, 'camel'); placePalace(rv, vi); placePalm(rv, vi);              // Hamlet: rival camel + palace + palm
    claimTile(me, st, 'camel');                                                       // Bazaar Stall: camel only
    UI.fx = []; UI.fxSeen = 0; render();
    return { ox, sh, vi, st, ba };
  });
};
