# Inbox: perch-and-plume

Drop finished pictures (png, jpg or webp, 1024 px or larger), music/sound (mp3, wav) or boss clips (mp4) in this folder, then run `python3 games-src/scripts/ingest-assets.py` from the repo root. Names are matched without caring about case, `_` vs `-`, `(1)` suffixes or png/webp.
Originals move to `done/` (not committed). Run with `--check` first to see what would happen without writing anything.

The **Wired** column says what happens after the drop: `auto` = shows up in the game, `fallback` = shows up, but the game needs a fallback for the missing-file case (script lists it), `wiring` = a code change is still needed.

## Pictures (the to-make list) (186)

| Name | Size | Ratio | Transparent | What it is | Wired |
|---|---|---|---|---|---|
| `bg-map.webp` | 1920x1080 | 16:9 | no | Story map background (cover) | fallback |
| `bg-result.webp` | 1080x1920 | 9:16 | no | Result screen background (cover) | fallback |
| `bg-title.webp` | 1080x1920 | 9:16 | no | Title screen background (cover; the logo sits in the calm top third) | fallback |
| `bird-amber-coot.webp` | 512x512 | 1:1 | no | Bird card picture: Amber Coot (cover, square art box on the card) | fallback |
| `bird-amber-lark.webp` | 512x512 | 1:1 | no | Bird card picture: Amber Lark (cover, square art box on the card) | fallback |
| `bird-amber-pipit.webp` | 512x512 | 1:1 | no | Bird card picture: Amber Pipit (cover, square art box on the card) | fallback |
| `bird-amber-teal.webp` | 512x512 | 1:1 | no | Bird card picture: Amber Teal (cover, square art box on the card) | fallback |
| `bird-ashen-bittern.webp` | 512x512 | 1:1 | no | Bird card picture: Ashen Bittern (cover, square art box on the card) | fallback |
| `bird-ashen-sandpiper.webp` | 512x512 | 1:1 | no | Bird card picture: Ashen Sandpiper (cover, square art box on the card) | fallback |
| `bird-bramble-crow.webp` | 512x512 | 1:1 | no | Bird card picture: Bramble Crow (cover, square art box on the card) | fallback |
| `bird-bramble-dove.webp` | 512x512 | 1:1 | no | Bird card picture: Bramble Dove (cover, square art box on the card) | fallback |
| `bird-briar-woodpecker.webp` | 512x512 | 1:1 | no | Bird card picture: Briar Woodpecker (cover, square art box on the card) | fallback |
| `bird-cinder-egret.webp` | 512x512 | 1:1 | no | Bird card picture: Cinder Egret (cover, square art box on the card) | fallback |
| `bird-cinder-kinglet.webp` | 512x512 | 1:1 | no | Bird card picture: Cinder Kinglet (cover, square art box on the card) | fallback |
| `bird-clover-bittern.webp` | 512x512 | 1:1 | no | Bird card picture: Clover Bittern (cover, square art box on the card) | fallback |
| `bird-clover-waxwing.webp` | 512x512 | 1:1 | no | Bird card picture: Clover Waxwing (cover, square art box on the card) | fallback |
| `bird-cobalt-grebe.webp` | 512x512 | 1:1 | no | Bird card picture: Cobalt Grebe (cover, square art box on the card) | fallback |
| `bird-cobalt-kestrel.webp` | 512x512 | 1:1 | no | Bird card picture: Cobalt Kestrel (cover, square art box on the card) | fallback |
| `bird-cobalt-tern.webp` | 512x512 | 1:1 | no | Bird card picture: Cobalt Tern (cover, square art box on the card) | fallback |
| `bird-copper-hawk.webp` | 512x512 | 1:1 | no | Bird card picture: Copper Hawk (cover, square art box on the card) | fallback |
| `bird-copper-oriole.webp` | 512x512 | 1:1 | no | Bird card picture: Copper Oriole (cover, square art box on the card) | fallback |
| `bird-copper-thrush.webp` | 512x512 | 1:1 | no | Bird card picture: Copper Thrush (cover, square art box on the card) | fallback |
| `bird-copper-warbler.webp` | 512x512 | 1:1 | no | Bird card picture: Copper Warbler (cover, square art box on the card) | fallback |
| `bird-dawn-tanager.webp` | 512x512 | 1:1 | no | Bird card picture: Dawn Tanager (cover, square art box on the card) | fallback |
| `bird-dusk-dove.webp` | 512x512 | 1:1 | no | Bird card picture: Dusk Dove (cover, square art box on the card) | fallback |
| `bird-dusk-harrier.webp` | 512x512 | 1:1 | no | Bird card picture: Dusk Harrier (cover, square art box on the card) | fallback |
| `bird-dusk-vireo.webp` | 512x512 | 1:1 | no | Bird card picture: Dusk Vireo (cover, square art box on the card) | fallback |
| `bird-ember-lark.webp` | 512x512 | 1:1 | no | Bird card picture: Ember Lark (cover, square art box on the card) | fallback |
| `bird-ember-meadowlark.webp` | 512x512 | 1:1 | no | Bird card picture: Ember Meadowlark (cover, square art box on the card) | fallback |
| `bird-ember-nuthatch.webp` | 512x512 | 1:1 | no | Bird card picture: Ember Nuthatch (cover, square art box on the card) | fallback |
| `bird-fern-shrike.webp` | 512x512 | 1:1 | no | Bird card picture: Fern Shrike (cover, square art box on the card) | fallback |
| `bird-fern-thrush.webp` | 512x512 | 1:1 | no | Bird card picture: Fern Thrush (cover, square art box on the card) | fallback |
| `bird-fern-woodpecker.webp` | 512x512 | 1:1 | no | Bird card picture: Fern Woodpecker (cover, square art box on the card) | fallback |
| `bird-gilded-jay.webp` | 512x512 | 1:1 | no | Bird card picture: Gilded Jay (cover, square art box on the card) | fallback |
| `bird-gilded-kingfisher.webp` | 512x512 | 1:1 | no | Bird card picture: Gilded Kingfisher (cover, square art box on the card) | fallback |
| `bird-gilded-owl.webp` | 512x512 | 1:1 | no | Bird card picture: Gilded Owl (cover, square art box on the card) | fallback |
| `bird-gilded-shrike.webp` | 512x512 | 1:1 | no | Bird card picture: Gilded Shrike (cover, square art box on the card) | fallback |
| `bird-gilded-sparrow.webp` | 512x512 | 1:1 | no | Bird card picture: Gilded Sparrow (cover, square art box on the card) | fallback |
| `bird-gilded-treecreeper.webp` | 512x512 | 1:1 | no | Bird card picture: Gilded Treecreeper (cover, square art box on the card) | fallback |
| `bird-hazel-nuthatch.webp` | 512x512 | 1:1 | no | Bird card picture: Hazel Nuthatch (cover, square art box on the card) | fallback |
| `bird-hazel-owl.webp` | 512x512 | 1:1 | no | Bird card picture: Hazel Owl (cover, square art box on the card) | fallback |
| `bird-hazel-quail.webp` | 512x512 | 1:1 | no | Bird card picture: Hazel Quail (cover, square art box on the card) | fallback |
| `bird-hazel-warbler.webp` | 512x512 | 1:1 | no | Bird card picture: Hazel Warbler (cover, square art box on the card) | fallback |
| `bird-hollow-bunting.webp` | 512x512 | 1:1 | no | Bird card picture: Hollow Bunting (cover, square art box on the card) | fallback |
| `bird-hollow-hawk.webp` | 512x512 | 1:1 | no | Bird card picture: Hollow Hawk (cover, square art box on the card) | fallback |
| `bird-hollow-tanager.webp` | 512x512 | 1:1 | no | Bird card picture: Hollow Tanager (cover, square art box on the card) | fallback |
| `bird-juniper-waxwing.webp` | 512x512 | 1:1 | no | Bird card picture: Juniper Waxwing (cover, square art box on the card) | fallback |
| `bird-lantern-bittern.webp` | 512x512 | 1:1 | no | Bird card picture: Lantern Bittern (cover, square art box on the card) | fallback |
| `bird-lantern-heron.webp` | 512x512 | 1:1 | no | Bird card picture: Lantern Heron (cover, square art box on the card) | fallback |
| `bird-lantern-kingfisher.webp` | 512x512 | 1:1 | no | Bird card picture: Lantern Kingfisher (cover, square art box on the card) | fallback |
| `bird-lantern-owl.webp` | 512x512 | 1:1 | no | Bird card picture: Lantern Owl (cover, square art box on the card) | fallback |
| `bird-lantern-plover.webp` | 512x512 | 1:1 | no | Bird card picture: Lantern Plover (cover, square art box on the card) | fallback |
| `bird-larch-harrier.webp` | 512x512 | 1:1 | no | Bird card picture: Larch Harrier (cover, square art box on the card) | fallback |
| `bird-larch-sandpiper.webp` | 512x512 | 1:1 | no | Bird card picture: Larch Sandpiper (cover, square art box on the card) | fallback |
| `bird-larch-tanager.webp` | 512x512 | 1:1 | no | Bird card picture: Larch Tanager (cover, square art box on the card) | fallback |
| `bird-marsh-quail.webp` | 512x512 | 1:1 | no | Bird card picture: Marsh Quail (cover, square art box on the card) | fallback |
| `bird-marsh-vireo.webp` | 512x512 | 1:1 | no | Bird card picture: Marsh Vireo (cover, square art box on the card) | fallback |
| `bird-marsh-woodpecker.webp` | 512x512 | 1:1 | no | Bird card picture: Marsh Woodpecker (cover, square art box on the card) | fallback |
| `bird-meadow-oriole.webp` | 512x512 | 1:1 | no | Bird card picture: Meadow Oriole (cover, square art box on the card) | fallback |
| `bird-mist-dove.webp` | 512x512 | 1:1 | no | Bird card picture: Mist Dove (cover, square art box on the card) | fallback |
| `bird-mist-rail.webp` | 512x512 | 1:1 | no | Bird card picture: Mist Rail (cover, square art box on the card) | fallback |
| `bird-moss-jay.webp` | 512x512 | 1:1 | no | Bird card picture: Moss Jay (cover, square art box on the card) | fallback |
| `bird-moss-quail.webp` | 512x512 | 1:1 | no | Bird card picture: Moss Quail (cover, square art box on the card) | fallback |
| `bird-nettle-coot.webp` | 512x512 | 1:1 | no | Bird card picture: Nettle Coot (cover, square art box on the card) | fallback |
| `bird-nettle-grebe.webp` | 512x512 | 1:1 | no | Bird card picture: Nettle Grebe (cover, square art box on the card) | fallback |
| `bird-nettle-oriole.webp` | 512x512 | 1:1 | no | Bird card picture: Nettle Oriole (cover, square art box on the card) | fallback |
| `bird-opal-kestrel.webp` | 512x512 | 1:1 | no | Bird card picture: Opal Kestrel (cover, square art box on the card) | fallback |
| `bird-pebble-bunting.webp` | 512x512 | 1:1 | no | Bird card picture: Pebble Bunting (cover, square art box on the card) | fallback |
| `bird-pebble-crow.webp` | 512x512 | 1:1 | no | Bird card picture: Pebble Crow (cover, square art box on the card) | fallback |
| `bird-pebble-harrier.webp` | 512x512 | 1:1 | no | Bird card picture: Pebble Harrier (cover, square art box on the card) | fallback |
| `bird-pebble-swift.webp` | 512x512 | 1:1 | no | Bird card picture: Pebble Swift (cover, square art box on the card) | fallback |
| `bird-pebble-treecreeper.webp` | 512x512 | 1:1 | no | Bird card picture: Pebble Treecreeper (cover, square art box on the card) | fallback |
| `bird-pine-finch.webp` | 512x512 | 1:1 | no | Bird card picture: Pine Finch (cover, square art box on the card) | fallback |
| `bird-pine-meadowlark.webp` | 512x512 | 1:1 | no | Bird card picture: Pine Meadowlark (cover, square art box on the card) | fallback |
| `bird-pine-teal.webp` | 512x512 | 1:1 | no | Bird card picture: Pine Teal (cover, square art box on the card) | fallback |
| `bird-pine-tern.webp` | 512x512 | 1:1 | no | Bird card picture: Pine Tern (cover, square art box on the card) | fallback |
| `bird-quill-sandpiper.webp` | 512x512 | 1:1 | no | Bird card picture: Quill Sandpiper (cover, square art box on the card) | fallback |
| `bird-rush-pipit.webp` | 512x512 | 1:1 | no | Bird card picture: Rush Pipit (cover, square art box on the card) | fallback |
| `bird-rush-plover.webp` | 512x512 | 1:1 | no | Bird card picture: Rush Plover (cover, square art box on the card) | fallback |
| `bird-russet-meadowlark.webp` | 512x512 | 1:1 | no | Bird card picture: Russet Meadowlark (cover, square art box on the card) | fallback |
| `bird-russet-swift.webp` | 512x512 | 1:1 | no | Bird card picture: Russet Swift (cover, square art box on the card) | fallback |
| `bird-rust-nuthatch.webp` | 512x512 | 1:1 | no | Bird card picture: Rust Nuthatch (cover, square art box on the card) | fallback |
| `bird-rust-swallow.webp` | 512x512 | 1:1 | no | Bird card picture: Rust Swallow (cover, square art box on the card) | fallback |
| `bird-saffron-coot.webp` | 512x512 | 1:1 | no | Bird card picture: Saffron Coot (cover, square art box on the card) | fallback |
| `bird-saffron-crane.webp` | 512x512 | 1:1 | no | Bird card picture: Saffron Crane (cover, square art box on the card) | fallback |
| `bird-saffron-heron.webp` | 512x512 | 1:1 | no | Bird card picture: Saffron Heron (cover, square art box on the card) | fallback |
| `bird-saffron-kestrel.webp` | 512x512 | 1:1 | no | Bird card picture: Saffron Kestrel (cover, square art box on the card) | fallback |
| `bird-saffron-rail.webp` | 512x512 | 1:1 | no | Bird card picture: Saffron Rail (cover, square art box on the card) | fallback |
| `bird-saffron-sparrow.webp` | 512x512 | 1:1 | no | Bird card picture: Saffron Sparrow (cover, square art box on the card) | fallback |
| `bird-sedge-egret.webp` | 512x512 | 1:1 | no | Bird card picture: Sedge Egret (cover, square art box on the card) | fallback |
| `bird-sedge-finch.webp` | 512x512 | 1:1 | no | Bird card picture: Sedge Finch (cover, square art box on the card) | fallback |
| `bird-silver-bunting.webp` | 512x512 | 1:1 | no | Bird card picture: Silver Bunting (cover, square art box on the card) | fallback |
| `bird-silver-treecreeper.webp` | 512x512 | 1:1 | no | Bird card picture: Silver Treecreeper (cover, square art box on the card) | fallback |
| `bird-silver-waxwing.webp` | 512x512 | 1:1 | no | Bird card picture: Silver Waxwing (cover, square art box on the card) | fallback |
| `bird-slate-crane.webp` | 512x512 | 1:1 | no | Bird card picture: Slate Crane (cover, square art box on the card) | fallback |
| `bird-slate-crow.webp` | 512x512 | 1:1 | no | Bird card picture: Slate Crow (cover, square art box on the card) | fallback |
| `bird-slate-jay.webp` | 512x512 | 1:1 | no | Bird card picture: Slate Jay (cover, square art box on the card) | fallback |
| `bird-slate-pipit.webp` | 512x512 | 1:1 | no | Bird card picture: Slate Pipit (cover, square art box on the card) | fallback |
| `bird-slate-shrike.webp` | 512x512 | 1:1 | no | Bird card picture: Slate Shrike (cover, square art box on the card) | fallback |
| `bird-slate-wren.webp` | 512x512 | 1:1 | no | Bird card picture: Slate Wren (cover, square art box on the card) | fallback |
| `bird-smoke-crane.webp` | 512x512 | 1:1 | no | Bird card picture: Smoke Crane (cover, square art box on the card) | fallback |
| `bird-sorrel-finch.webp` | 512x512 | 1:1 | no | Bird card picture: Sorrel Finch (cover, square art box on the card) | fallback |
| `bird-storm-kingfisher.webp` | 512x512 | 1:1 | no | Bird card picture: Storm Kingfisher (cover, square art box on the card) | fallback |
| `bird-storm-sparrow.webp` | 512x512 | 1:1 | no | Bird card picture: Storm Sparrow (cover, square art box on the card) | fallback |
| `bird-storm-wren.webp` | 512x512 | 1:1 | no | Bird card picture: Storm Wren (cover, square art box on the card) | fallback |
| `bird-sun-kinglet.webp` | 512x512 | 1:1 | no | Bird card picture: Sun Kinglet (cover, square art box on the card) | fallback |
| `bird-sun-plover.webp` | 512x512 | 1:1 | no | Bird card picture: Sun Plover (cover, square art box on the card) | fallback |
| `bird-thistle-swallow.webp` | 512x512 | 1:1 | no | Bird card picture: Thistle Swallow (cover, square art box on the card) | fallback |
| `bird-tidal-swallow.webp` | 512x512 | 1:1 | no | Bird card picture: Tidal Swallow (cover, square art box on the card) | fallback |
| `bird-tidal-vireo.webp` | 512x512 | 1:1 | no | Bird card picture: Tidal Vireo (cover, square art box on the card) | fallback |
| `bird-tidal-warbler.webp` | 512x512 | 1:1 | no | Bird card picture: Tidal Warbler (cover, square art box on the card) | fallback |
| `bird-tidal-wren.webp` | 512x512 | 1:1 | no | Bird card picture: Tidal Wren (cover, square art box on the card) | fallback |
| `bird-umber-lark.webp` | 512x512 | 1:1 | no | Bird card picture: Umber Lark (cover, square art box on the card) | fallback |
| `bird-umber-swift.webp` | 512x512 | 1:1 | no | Bird card picture: Umber Swift (cover, square art box on the card) | fallback |
| `bird-velvet-kinglet.webp` | 512x512 | 1:1 | no | Bird card picture: Velvet Kinglet (cover, square art box on the card) | fallback |
| `bird-velvet-rail.webp` | 512x512 | 1:1 | no | Bird card picture: Velvet Rail (cover, square art box on the card) | fallback |
| `bird-velvet-teal.webp` | 512x512 | 1:1 | no | Bird card picture: Velvet Teal (cover, square art box on the card) | fallback |
| `bird-velvet-tern.webp` | 512x512 | 1:1 | no | Bird card picture: Velvet Tern (cover, square art box on the card) | fallback |
| `bird-velvet-thrush.webp` | 512x512 | 1:1 | no | Bird card picture: Velvet Thrush (cover, square art box on the card) | fallback |
| `bird-willow-egret.webp` | 512x512 | 1:1 | no | Bird card picture: Willow Egret (cover, square art box on the card) | fallback |
| `bird-willow-grebe.webp` | 512x512 | 1:1 | no | Bird card picture: Willow Grebe (cover, square art box on the card) | fallback |
| `bird-wisp-hawk.webp` | 512x512 | 1:1 | no | Bird card picture: Wisp Hawk (cover, square art box on the card) | fallback |
| `bird-wisp-heron.webp` | 512x512 | 1:1 | no | Bird card picture: Wisp Heron (cover, square art box on the card) | fallback |
| `board-mat.webp` | 1600x960 | 5:3 | no | Your habitat mat behind the three rows (cover) | fallback |
| `bonus-angler.webp` | 500x700 | 5:7 | no | Bonus card picture: River Angler (cover) | fallback |
| `bonus-bargain.webp` | 500x700 | 5:7 | no | Bonus card picture: Bargain Watcher (cover) | fallback |
| `bonus-berry-picker.webp` | 500x700 | 5:7 | no | Bonus card picture: Berry Picker (cover) | fallback |
| `bonus-big-wings.webp` | 500x700 | 5:7 | no | Bonus card picture: Broad Wings (cover) | fallback |
| `bonus-bowl-keeper.webp` | 500x700 | 5:7 | no | Bonus card picture: Bowl Keeper (cover) | fallback |
| `bonus-brood.webp` | 500x700 | 5:7 | no | Bonus card picture: Full Nests (cover) | fallback |
| `bonus-flock-friend.webp` | 500x700 | 5:7 | no | Bonus card picture: Flock Friend (cover) | fallback |
| `bonus-ground-keeper.webp` | 500x700 | 5:7 | no | Bonus card picture: Ground Keeper (cover) | fallback |
| `bonus-grub-digger.webp` | 500x700 | 5:7 | no | Bonus card picture: Grub Digger (cover) | fallback |
| `bonus-hoarder.webp` | 500x700 | 5:7 | no | Bonus card picture: Pantry Keeper (cover) | fallback |
| `bonus-hollow-keeper.webp` | 500x700 | 5:7 | no | Bonus card picture: Hollow Keeper (cover) | fallback |
| `bonus-ledge-keeper.webp` | 500x700 | 5:7 | no | Bonus card picture: Ledge Keeper (cover) | fallback |
| `bonus-marsh.webp` | 500x700 | 5:7 | no | Bonus card picture: Marsh Walker (cover) | fallback |
| `bonus-mouser.webp` | 500x700 | 5:7 | no | Bonus card picture: Field Mouser (cover) | fallback |
| `bonus-prairie.webp` | 500x700 | 5:7 | no | Bonus card picture: Prairie Walker (cover) | fallback |
| `bonus-seed-saver.webp` | 500x700 | 5:7 | no | Bonus card picture: Seed Saver (cover) | fallback |
| `bonus-small-wings.webp` | 500x700 | 5:7 | no | Bonus card picture: Little Wings (cover) | fallback |
| `bonus-woodland.webp` | 500x700 | 5:7 | no | Bonus card picture: Woodland Walker (cover) | fallback |
| `card-back.webp` | 500x700 | 5:7 | no | Bird deck and the backs of opponents' cards (cover) | fallback |
| `food-any.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Any-food cost icon on bird cards (contain) | fallback |
| `food-berry.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | berry food token and die face (contain) | fallback |
| `food-fish.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | fish food token and die face (contain) | fallback |
| `food-grub.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | grub food token and die face (contain) | fallback |
| `food-gs.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Grub-or-seed die face (contain) | fallback |
| `food-rodent.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | rodent food token and die face (contain) | fallback |
| `food-seed.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | seed food token and die face (contain) | fallback |
| `fx-chain-spark.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Spark when a brown power fires in a chain (contain) | fallback |
| `fx-egg-pop.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Pop when an egg is laid (contain) | fallback |
| `fx-food-pop.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Pop when food is gained (contain) | fallback |
| `goal-birds-F.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Round goal tile: Birds in your forest (contain) | fallback |
| `goal-birds-G.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Round goal tile: Birds in your grassland (contain) | fallback |
| `goal-birds-W.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Round goal tile: Birds in your wetland (contain) | fallback |
| `goal-eggs-F.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Round goal tile: Eggs in your forest (contain) | fallback |
| `goal-eggs-G.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Round goal tile: Eggs in your grassland (contain) | fallback |
| `goal-eggs-W.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Round goal tile: Eggs in your wetland (contain) | fallback |
| `goal-nest-bowl.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Round goal tile: Bowl nests with an egg (contain) | fallback |
| `goal-nest-cavity.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Round goal tile: Cavity nests with an egg (contain) | fallback |
| `goal-nest-ground.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Round goal tile: Ground nests with an egg (contain) | fallback |
| `goal-nest-platform.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Round goal tile: Platform nests with an egg (contain) | fallback |
| `goal-sets.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Round goal tile: Full egg sets (1 per row) (contain) | fallback |
| `goal-total.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Round goal tile: Birds in play (contain) | fallback |
| `nest-bowl.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | bowl nest icon on bird cards (contain) | fallback |
| `nest-cavity.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | cavity nest icon on bird cards (contain) | fallback |
| `nest-ground.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | ground nest icon on bird cards (contain) | fallback |
| `nest-platform.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | platform nest icon on bird cards (contain) | fallback |
| `nest-star.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | star nest icon on bird cards (contain) | fallback |
| `portrait-barnaby.webp` | 512x512 | 1:1 | no | Portrait: Lord Barnaby Quill, final boss (cover) | fallback |
| `portrait-corvin.webp` | 512x512 | 1:1 | no | Portrait: Corvin Ashdown, boss of act 1 (cover) | fallback |
| `portrait-delphine.webp` | 512x512 | 1:1 | no | Portrait: Delphine Reedly, boss of act 2 (cover) | fallback |
| `portrait-mags.webp` | 512x512 | 1:1 | no | Portrait: Mags, the retired postmistress (cover) | fallback |
| `portrait-ottilie.webp` | 512x512 | 1:1 | no | Portrait: Aunt Ottilie, the guide (cover) | fallback |
| `portrait-pip.webp` | 512x512 | 1:1 | no | Portrait: Pip, a young birder (cover) | fallback |
| `portrait-tobias.webp` | 512x512 | 1:1 | no | Portrait: Tobias, the photographer (cover) | fallback |
| `portrait-you.webp` | 512x512 | 1:1 | no | Portrait: You, the young naturalist (cover) | fallback |
| `row-forest.webp` | 1600x320 | 5:1 | no | The forest row strip behind five bird slots (cover) | fallback |
| `row-grassland.webp` | 1600x320 | 5:1 | no | The grassland row strip behind five bird slots (cover) | fallback |
| `row-wetland.webp` | 1600x320 | 5:1 | no | The wetland row strip behind five bird slots (cover) | fallback |
| `token-egg.webp` | 256x256 | 1:1 | yes (flat white background, we key it) | Egg on a bird card (contain) | fallback |
| `ui-cube.webp` | 128x128 | 1:1 | yes (flat white background, we key it) | Action cube left this round (contain) | fallback |
| `ui-feeder.webp` | 512x512 | 1:1 | yes (flat white background, we key it) | Birdfeeder tray behind the five food dice (contain) | fallback |
| `ui-tray.webp` | 768x256 | 3:1 | yes (flat white background, we key it) | The face-up bird tray (contain) | fallback |
| `ui-trophy.webp` | 512x512 | 1:1 | yes (flat white background, we key it) | Winner's rosette on the result screen (contain) | fallback |
