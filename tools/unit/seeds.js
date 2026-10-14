'use strict';
// Seeded breaks for `node tools/unit/run.js --selftest`: UT_SEED=<seed> corrupts ONE input in lib.js / the suite; the named check must print FAIL.
module.exports=[
 {seed:'credits',expect:'FAIL page/credits-made'},
 {seed:'allopen',expect:'FAIL page/all-open'},
 {seed:'changelog',expect:'FAIL changelog/top-items|FAIL changelog/tag-0-0'},
 {seed:'checklist',expect:'FAIL checklist/unique-keys'},
];
