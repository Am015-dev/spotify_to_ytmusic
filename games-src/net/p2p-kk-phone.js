// Phone version of the Kaiten Kitchen online test: 390x844 touch contexts, ?phone=1, layout checks of the online badge.
// PW=<path>/playwright PORT=17785 node net/p2p-kk-phone.js kaiten/game/kaiten.html SCENARIO
process.env.PHONE='1';require('./p2p-kk.js');
