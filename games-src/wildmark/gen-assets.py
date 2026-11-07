#!/usr/bin/env python3
"""Writes assets.json (every picture slot Wildmark shows) and the Google Flow prompt files in next-wave/flow-2d/wildmark/. Re-run after editing."""
import json, pathlib, collections
D = pathlib.Path(__file__).resolve().parent
STYLE = ("Flat 2D storybook illustration, gouache texture, soft natural light, muted greens, warm creams and gold accents, "
         "clean shapes, gentle outlines, Pacific mountain forest mood, no text, no letters, no numbers, no logos.")
I = []
def add(stem, kind, w, h, ratio, alpha, wave, slot, prompt): I.append(dict(stem=stem, kind=kind, w=w, h=h, ratio=ratio, alpha=alpha, wave=wave, slot=slot, prompt=prompt))
add("title-bg", "bg", 1920, 1080, "16:9", False, 1, "#start .tbox (title and setup panel)", "A wide misty mountain valley at dawn: a river winding through pine forest, a golden meadow, a marsh with reeds, snowy peaks behind; an elk and a hawk small in the distance; calm empty sky in the upper middle.")
add("table-bg", "board", 1920, 1080, "16:9", False, 1, "#board background behind the hex map", "Top-down view of a mossy forest floor with soft pine needles and faint lichen, very low contrast, even texture, darker at the edges, nothing in the centre.")
TER = {"peak": "grey granite mountain slopes with snow patches and small rocks", "forest": "dense dark green conifer canopy seen from above", "meadow": "golden prairie grass with scattered wildflowers seen from above",
       "marsh": "teal wetland with reeds, lily pads and shallow pools seen from above", "river": "clear blue river water with soft ripples and pebbles seen from above"}
for t, p in TER.items(): add("ter-" + t, "board", 512, 512, "1:1", False, 1, "terrain fill of every %s half-hex on the map and in the market" % t, "Seamless square texture tile: " + p + ", evenly lit, no horizon, tileable edges.")
ANI = {"bear": "a brown bear head and shoulders, friendly, facing forward", "elk": "a bull elk head with wide antlers, three-quarter view", "salmon": "a leaping pink-red salmon, side view, curved body",
       "hawk": "a red-tailed hawk with wings spread, seen from below", "fox": "a red fox face with big ears, facing forward", "acorn": "a single glossy acorn with its cap and one small oak leaf"}
for a, p in ANI.items(): add("tok-" + a, "token", 512, 512, "1:1", True, 1, "the round %s token (map, market, score chips)" % a, "One round wooden token, centred, on plain white: " + p + " painted on the token face, thick cream rim.")
CAST = {"ranger": "a young park ranger with a green coat, backpack and a warm smile", "rowan": "an old ward elder with a white beard, a walking staff and a wool cloak", "pip": "a cheerful teenage ranger with freckles and a sprout in the hat band",
        "bram": "a stern broad-shouldered woodsman with a thick moustache and a fur collar"}
for c, p in CAST.items(): add("portrait-" + c, "portrait", 768, 768, "1:1", False, 1, "Story portrait of " + c, "Bust portrait, head and shoulders, plain soft green background: " + p + ".")
CARDS = {"bear": ("Twin Dens", "two brown bears resting side by side outside a den"), "elk": ("Ridge Lines", "a straight line of three elk walking along a ridge"), "salmon": ("River Runs", "a chain of salmon swimming up a winding stream"),
         "hawk": ("Lone Perches", "three hawks each alone on separate distant treetops"), "fox": ("Curious Fox", "a fox sitting among a bear cub, a heron and a hare, looking curious")}
for a, (n, p) in CARDS.items(): add("card-%s-a" % a, "card", 600, 840, "5:7", False, 2, "scoring card %s (cards drawer, rules)" % n, "Portrait card illustration with a cream border: " + p + ".")
MORE = {"sorrel": "a tall meadow keeper with a straw hat and a sheaf of grass", "quill": "a precise surveyor woman with round glasses, a long dark coat and a feather pen", "linnet": "a quick bird-watcher with binoculars and a blue scarf",
        "oake": "an ancient calm forester with bark-brown skin and moss in grey hair", "warden": "a cold figure in an ash-grey hooded cloak holding a smouldering lantern"}
for c, p in MORE.items(): add("portrait-" + c, "portrait", 768, 768, "1:1", False, 2, "Story portrait of " + c, "Bust portrait, head and shoulders, plain soft green background: " + p + ".")
for s, sub in (("b", "a variant scene"), ("c", "a second variant scene"), ("d", "a third variant scene")):
    for a, (n, p) in CARDS.items(): add("card-%s-%s" % (a, s), "card", 600, 840, "5:7", False, 2 if s == "b" else 3, "scoring card %s, set %s (next card sets)" % (n, s.upper()), "Portrait card illustration with a cream border, %s of %s." % (sub, p))
add("result-win", "bg", 1600, 900, "16:9", False, 3, "#rs result panel after a win", "A sunlit valley full of animals: elk in a meadow, bears by a river, hawks overhead, golden evening light.")
add("result-lose", "bg", 1600, 900, "16:9", False, 3, "#rs result panel after a loss", "A quiet valley at dusk with soft rain, a lone fox looking at a distant ridge, calm and hopeful.")
json.dump({"style": STYLE, "items": I}, open(D / "assets.json", "w"), indent=1)
out = D.parent / "next-wave" / "flow-2d" / "wildmark"; out.mkdir(parents=True, exist_ok=True)
groups = collections.defaultdict(dict)
for i in I: groups[(i["wave"], i["w"], i["h"])][i["stem"]] = STYLE + " " + i["prompt"]
for (w, ww, hh), cards in sorted(groups.items()): json.dump({"cards": cards}, open(out / ("prompts-wave%d-ratio-%dx%d.json" % (w, ww, hh)), "w"), indent=1)
print(len(I), "slots;", {w: sum(1 for i in I if i["wave"] == w) for w in (1, 2, 3)})
