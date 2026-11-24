# Hollowbough owner art: wiring status

Owner Flow art in `art/` (88 .webp). `game/build.py` embeds it as `HB_ART`, keyed by `art/manifest.json` `items`.
The game looks a card's painting up by its data id (`card.key`, from `cards.json` `role`).

## What broke
`art/manifest.json` (items and size) was keyed by the first-draft card ids (architect, bard, castle ...).
The id rename pass (commit e942bab2 per the orchestrator lead; not verifiable here, the clone is shallow) changed
every card id in `cards.json`/`data.js` to the current ones (master_lathwright ...), but the manifest kept the
old keys. So `paintedHref(card.key)` found nothing and every card fell back to the drawn vector icon.
Places and events were not hit: their ids (forest_*, basic_*, bev_*, sev_*) were mapped through `game/keymap.json`
and still match. The elderheart tree painting (`ui13.js`, `HB_ART.elderheart_oak`) and the haven plate
(`paintedHref('cranny_market')`) used new ids too, so they were also empty.
Not found in the shallow history: any emoji-removal or credits-removal pass that touched art wiring (f2150b52 is not present locally).

## Fix
Re-keyed `art/manifest.json` items and size to the current card ids. No files renamed, no code changed.

## Result (Playwright, built page, `HBKit.paintedHref`)
| group | before | after |
|---|---|---|
| 48 card types (hand, city, zoom, cards.html) | 0 / 48 | 48 / 48 |
| 39 places and events (forest, basic, bev, sev) | 39 / 39 | 39 / 39 |
| elderheart tree painting, haven plate | missing | shown |

## Card -> art file
| card | id | art file | before | after |
|---|---|---|---|---|
| Master Lathwright | master_lathwright | art/architect.webp | none | painted |
| Ballad Finch | ballad_finch | art/bard.webp | none | painted |
| Reedpunt Toad | reedpunt_toad | art/barge_toad.webp | none | painted |
| Tinder Chipmunk | tinder_chipmunk | art/chip_sweep.webp | none | painted |
| Poultice Badger | poultice_badger | art/doctor.webp | none | painted |
| Mudpie Jester | mudpie_jester | art/fool.webp | none | painted |
| Chronicle Owl | chronicle_owl | art/historian.webp | none | painted |
| Goodman Vole | goodman_vole | art/husband.webp | none | painted |
| Hostler Hedgehog | hostler_hedgehog | art/innkeeper.webp | none | painted |
| Gavel Marten | gavel_marten | art/judge.webp | none | painted |
| Bramble Sovereign | bramble_sovereign | art/king.webp | none | painted |
| Echo Mole | echo_mole | art/miner_mole.webp | none | painted |
| Brother Moss | brother_moss | art/monk.webp | none | painted |
| Haggle Magpie | haggle_magpie | art/peddler.webp | none | painted |
| Parcel Dove | parcel_dove | art/postal_pigeon.webp | none | painted |
| Thistle Regent | thistle_regent | art/queen.webp | none | painted |
| Trailwarden Fox | trailwarden_fox | art/ranger.webp | none | painted |
| Crook Shrew | crook_shrew | art/shepherd.webp | none | painted |
| Tallyshop Mouse | tallyshop_mouse | art/shopkeeper.webp | none | painted |
| Slate Schoolmarm | slate_schoolmarm | art/teacher.webp | none | painted |
| Hollow Sexton | hollow_sexton | art/undertaker.webp | none | painted |
| Footsore Drifter | footsore_drifter | art/wanderer.webp | none | painted |
| Goodwife Vole | goodwife_vole | art/wife.webp | none | painted |
| Whittle Beaver | whittle_beaver | art/woodcarver.webp | none | painted |
| Stonecrown Keep | stonecrown_keep | art/castle.webp | none | painted |
| Mossgrave Glade | mossgrave_glade | art/cemetery.webp | none | painted |
| Candlewick Shrine | candlewick_shrine | art/chapel.webp | none | painted |
| Dewdrop Belfry | dewdrop_belfry | art/clock_tower.webp | none | painted |
| Mosswood Assize | mosswood_assize | art/courthouse.webp | none | painted |
| Pulley Lift | pulley_lift | art/crane.webp | none | painted |
| Thornhold Cells | thornhold_cells | art/dungeon.webp | none | painted |
| Elderheart Oak | elderheart_oak | art/ever_tree.webp | none | painted |
| Midsummer Green | midsummer_green | art/fair_grounds.webp | none | painted |
| Bramble Allotment | bramble_allotment | art/farm.webp | none | painted |
| Cranny Market | cranny_market | art/general_store.webp | none | painted |
| Lantern Rest | lantern_rest | art/inn.webp | none | painted |
| Spyglass Perch | spyglass_perch | art/lookout.webp | none | painted |
| Flintpit | flintpit | art/mine.webp | none | painted |
| Quietstone Cloister | quietstone_cloister | art/monastery.webp | none | painted |
| Gildenfern Court | gildenfern_court | art/palace.webp | none | painted |
| Dovecote Depot | dovecote_depot | art/post_office.webp | none | painted |
| Amber Still | amber_still | art/resin_refinery.webp | none | painted |
| Toppled Hall | toppled_hall | art/ruins.webp | none | painted |
| Acorn Academy | acorn_academy | art/school.webp | none | painted |
| Hoard Cellar | hoard_cellar | art/storehouse.webp | none | painted |
| Glowworm Playhouse | glowworm_playhouse | art/theater.webp | none | painted |
| Kindling Raft | kindling_raft | art/twig_barge.webp | none | painted |
| Lorewood College | lorewood_college | art/university.webp | none | painted |

## Left for the owner
- `manifest.json` still lists `haven` with no `haven.webp` (no such file). The haven plate reuses the Cranny Market painting. Owner may supply a haven painting.
- Every one of the 88 art files is wired (87 via manifest, 1 unused: none). No leftover files.
- `game/tutor-test.js` fails on the pre-fix build too (first menu option check); unrelated to art.
