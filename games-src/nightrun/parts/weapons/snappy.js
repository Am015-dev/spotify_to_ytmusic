// PURPOSE: your shots fly fast: every player bullet leaves at 1.8x speed with a longer streak
// FLAG: snappy (?snappy=0 = the old 900 px/s shots)
// TEST: fingerprint-test (state changes: shots hit sooner), qa/loadgate.js
/* ---------- SNAPPY: owner, 22 Oct 2026: "the bullets are so slow fired". Player shots left at 520-1150 units/s (most at 900: 1.4 s to cross the field).
   Each new player bullet is sped up once by K (homing ones by KH so they still turn), and its drawn streak is 1.5x longer. ---------- */
if(RET.snappy===undefined)RET.snappy=!/[?&]snappy=0/.test(location.search);
const SNAP=window.SNAP={K:1.8,KH:1.35,n:0,
  tick(){if(!RET.snappy||!G||!G.pb)return;for(const b of G.pb){if(b._sn)continue;b._sn=1;const k=b.hk?this.KH:this.K;b.vx*=k;b.vy*=k;if(b.len)b.len*=1.5;this.n++;}}};
NR.on('tick',()=>SNAP.tick());
