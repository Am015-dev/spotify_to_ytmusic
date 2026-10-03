// Phone version of the Thornbound Throne online test: 390x844, touch, ?phone=1, relay port 17713. Same modes as p2p-tb.js.
// PW=$(npm root -g)/playwright node net/p2p-tb-phone.js thornbound/game/thornbound.html MODE [games] [seconds]
process.env.PHONE='1';require('./p2p-tb.js');
