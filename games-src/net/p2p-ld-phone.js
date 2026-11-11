// Phone version of the Lantern Dive online test: 390x844 touch contexts, ?phone=1, layout checks of the online badge and lobby.
// PW=<path>/playwright PORT=17792 node net/p2p-ld-phone.js lantern-dive/game/lantern-dive.html SCENARIO
process.env.PHONE='1';require('./p2p-ld.js');
