// Phone version of the Cauldron Fair online test: 390x844 touch contexts, ?phone=1, layout checks of the online badge.
// PW=<path>/playwright PORT=17792 node net/p2p-cf-phone.js cauldron-fair/cauldron-fair.html SCENARIO
process.env.PHONE='1';require('./p2p-cf.js');
