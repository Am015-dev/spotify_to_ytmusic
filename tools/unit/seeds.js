'use strict';
// Seeded breaks for `node tools/unit/run.js --selftest`: UT_SEED=<seed> corrupts ONE input in lib.js / the suite; the named check must print FAIL.
module.exports=[
 {seed:'credits',expect:'FAIL page/credits-made'},
 {seed:'allopen',expect:'FAIL page/all-open'},
 {seed:'changelog',expect:'FAIL changelog/top-items|FAIL changelog/tag-0-0'},
 {seed:'checklist',expect:'FAIL checklist/unique-keys'},
 {seed:'fra-dead',expect:'FAIL roads-fra/deadend-arterial|FAIL roads-fra/deadend-main|FAIL roads-fra/deadend-ring|FAIL roads-fra/coords-finite'},
 {seed:'fra-zero',expect:'FAIL roads-fra/no-zero-length-edge'},
 {seed:'ath-zero',expect:'FAIL roads-ath/no-zero-length-edge'},
];
