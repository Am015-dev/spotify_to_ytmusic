// Phone version of the Hollowbough online test: 390x844 touch contexts, ?phone=1, layout checks of the online badge.
// PW=$(npm root -g)/playwright PORT=17785 node net/p2p-hb-phone.js hollowbough/game/hollowbough.html SCENARIO
process.env.PHONE='1';require('./p2p-hb.js');
