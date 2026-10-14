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
 {seed:'model-hollow',expect:'FAIL models/ride-(bricks|fill)-v6'},
 {seed:'model-color',expect:'FAIL models/colour-index-v6'},
 {seed:'dmg-sqrt',expect:'FAIL dmg/(50kmh-is-15pct|100kmh-formula)'},
 {seed:'dmg-light',expect:'FAIL dmg/below-25'},
 {seed:'traf-burst',expect:'FAIL traffic/(59kmh-no-burst|40kmh-hurts-not-bursts)'},
 {seed:'tyre',expect:'FAIL settle/CR_TYRE_Y-gap-under-5cm'},
 {seed:'cam-clear',expect:'FAIL camera/(sees-road-over-roof|ride-fills)'},
 {seed:'stick',expect:'FAIL stick/angle-decreases-with-speed'},
 {seed:'track-grade',expect:'FAIL tracks-pieces/grade-<=22pct-up'},
 {seed:'track-rail',expect:'FAIL tracks-rails/(rail-height|rail-continuous)'},
];
