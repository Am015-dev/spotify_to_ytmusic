// ---------- OD_CHANGELOG: newest first. EVERY deploy prepends one entry {v, date, items:[{t:'FIXED'|'NEW'|'CHANGED', s:'plain English'}]} (2-4 items).
// W14 steering (city "buggy steering", probe tools/tW14s.js): touch ◀/▶ start at 25% lock and reach full lock in ~0.2 s (was 12% and 0.32 s, yaw t63 up to
// 0.33 s); the unstuck pivot turns at 1.6 rad/s and stops when you steer (was 5 rad/s = 75-90° self-spins after a bump); BRAKE+steer only auto-drifts
// in the city above 125 km/h (was 86 km/h, which the faster city car reaches on every street).
const W14_ST={k0:.25,rk:1.5,hbCity:34.7},W14_PIV=1.6;
// TUNE (tune20): live-tunable driving numbers that used to be inline literals; defaults = the v87w values. Knob table + ?tune=1 drawer: src/99t_tune.js.
const TUNE={life:1,cvFol:0,lvDress:1,lvAthCr:1.5,lvLod:1,wbCarLod:1,wbLoShare:1.35,wbIcon:1,wbNear:70,wbFar:900,wbCell:.06,wbCity:1,wbMerged:1,wbNfc:1,wbFig:260,wbRingCam:6,wbLodD:190,wbLodCell:3,bwOn:1,bwFade:90,bwCourse:.48,bwStud:1,bwStudD:60,bwStudP:1.2,bwStudH:2,bwStudTop:16,bwStudMax:8000,bwCar:1,wbSuperD:700,wbTerr:1,wbLzD:420,wbRuns:1,bwRampSh:70,perfHud:0,lvPed:.8,lvWave:1,lvTraf:1,lvBird:1,lvFlag:1,lvBlimp:1,lvBoat:1,lvFac:1,lvCrowd:.67,lvPark:1,lvPop:1,lvPopGap:28,lvPopRw:1,stAng:.55,stFall:14,stIn:60,stOut:45,stMax:1.35,stSpd:.75,tRet:14,assist:1.5,gripRoad:40,drSlip:1.5,drGrip:.049,drConv:.55,drFill:24,acc:1.15,abTop:1.22,rev:18,bPush:20,bTop:1,bDrain:22,bRegen:4,bashT:2,hop:12,grav:30,camK:1/.15,camY:10,fov:66,fovSpd:14,rSpd:1.2,rub:1,traf:1,carW:1,carL:1,ride:0,
  // fix21 boost FX (TUNE drawer "FX" tab): thruster flame size / length / brightness, boost sparks on/off + count + size, speed lines, screen blur/glow, FOV kick, shake (all ×, 1 = default look)
  fxFlS:1,fxFlL:1,fxFlI:1,fxSpk:1,fxSpkN:1,fxSpkS:1,fxLines:1,fxGlow:1,fxFov:1,fxShake:1,
  // fix21 audio (TUNE drawer AUDIO tab, 98m_music.js): music on/off + volume (0.5 = the old synth level), SFX ×, duck music under dialogue (on/off + how much)
  musOn:1,musVol:.5,sfxVol:1,duckOn:1,duckAmt:.7,
  // drive24 ROUTE (TUNE drawer Route tab, 41_career_quests.js qvAstar/D24_clean): metres added per 90° turn, per U-turn, filler-grid cost ×,
  // narrow-street extra, simplify tolerance (m); turn cue lead (s) + min distance (m); followed cars (98d_drive24.js): corner radius (m), corner grip (m/s²), brake (m/s²), blinker on/off
  rtTurn:110,rtUturn:800,rtGrid:1.35,rtNarrow:.2,rtSimp:3,rtJog:14,stTouchDig:1,asMax:.8,stRampV0:0,stRampRev:0,stHold:.15,stRampFast:0,yrIn:60,tcLead:5,tcMin:90,fvRad:16,fvLat:4.5,fvDec:4,fvBlink:1,
  // drive24 STEER (98d_drive24.js D24_shape, roam only): on/off, ramp time to full lock at 0 and at 100 km/h (s), start fraction, let-go rate (/s), full lock = × grip limit,
  // how fast the car stops turning when the steering eases off (/s; 71_roam_drive.js, was 7-11 like turning in)
  stOn:1,stRampLo:.2,stRampHi:.6,stK0:.05,stRet:12,stLim:1.4,yrOut:45};
