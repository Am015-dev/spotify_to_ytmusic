// PURPOSE: economy fit: hours to finish back to 9-13 h
// FLAG: none (always on)
// TEST: none
/* ---------- econfit.js: economy back to 9-13 h (Strict review 7, task 5). After pacing (stages ~90 s) the Neon per hour went up and the full
   garage got new buyable layers (abup upgrades, forge merges) that RET.totalCost did not count. Only prices change: the weapon / perk scales (RET.wk, RET.tk),
   are x ECF.k (abup 90-140 and forge 120 Neon stay), and RET.totalCost now counts abup + the 24 forge merges. Neon per kill (RET.nk), armour.js and hard.js are untouched.
   Flag RET.econfit, default ON; ?econfit=0 = the prices as they were. Daily / weekly modes pay the same as before (no price or reward change there).
   Early game: the first weapon upgrade costs ~13 Neon, the first 3 stages pay 52+64+76 (econ-test). ---------- */
const ECF=window.ECF={k:1.05,wk:RET.wk,tk:RET.tk};
ECF.apply=function(){const k=this.k;RET.wk=this.wk*k;RET.tk=this.tk*k;};
ECF.apply();
