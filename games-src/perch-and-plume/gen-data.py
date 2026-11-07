#!/usr/bin/env python3
"""Re-runnable: writes src/data.js (the 120-bird roster, bonus cards, round goals) from the tables below. Original names only.
   python3 games-src/perch-and-plume/gen-data.py"""
import json, pathlib, random
D = pathlib.Path(__file__).resolve().parent
R = random.Random(342)
# (base, habitats, diet pool, nest, egg range, wing size range, power pool, points bias)
BASES = [
 ("Warbler", "F", ["grub"], "bowl", (2, 4), (18, 24), ["tuckDraw", "laySelf", "draw1", "pEgg", None], 0),
 ("Woodpecker", "F", ["grub", "seed"], "cavity", (2, 4), (38, 50), ["cacheS:seed", "gainF:grub", "laySelf", None], 1),
 ("Nuthatch", "F", ["seed", "grub"], "cavity", (2, 4), (20, 27), ["cacheF:seed", "cacheS:seed", "tuckEgg"], 0),
 ("Owl", "FG", ["rodent"], "cavity", (1, 3), (90, 120), ["hunt:75", "huntDie:rodent", None], 3),
 ("Jay", "F", ["seed", "berry"], "bowl", (2, 4), (38, 45), ["cacheS:seed", "allFood:seed", "wFeeder:seed", "gainS:seed"], 1),
 ("Thrush", "FG", ["grub", "berry"], "bowl", (2, 4), (28, 34), ["gainF:berry", "tuckFood:berry", "wFood:berry:2", "laySelf"], 1),
 ("Tanager", "F", ["berry", "grub"], "bowl", (2, 3), (25, 30), ["gainF:berry", "pFood:berry", "wDraw:2"], 1),
 ("Kinglet", "F", ["grub"], "bowl", (3, 5), (15, 18), ["tuckDraw", "flock", "laySelf"], 0),
 ("Treecreeper", "F", ["grub"], "cavity", (2, 4), (17, 21), ["gainF:grub", "draw1", "pTuck:F"], 0),
 ("Vireo", "F", ["grub", "berry"], "bowl", (2, 3), (22, 25), ["tuckDraw", "wDraw:1", None], 1),
 ("Lark", "G", ["seed", "grub"], "ground", (3, 5), (30, 35), ["laySelf", "layNest:ground", "pEgg", "flock"], 0),
 ("Pipit", "G", ["grub"], "ground", (3, 5), (24, 28), ["tuckEgg", "laySelf", "gainF:grub"], 0),
 ("Bunting", "G", ["seed"], "bowl", (2, 4), (20, 24), ["gainF:seed", "flock", "tuckDraw", "allFood:seed"], 0),
 ("Quail", "G", ["seed", "berry"], "ground", (4, 6), (32, 38), ["laySelf", "layNest:ground", "wLaySelf:2"], 0),
 ("Kestrel", "G", ["rodent", "grub"], "cavity", (2, 4), (55, 62), ["hunt:40", "huntDie:rodent", "gainF:rodent"], 2),
 ("Harrier", "GW", ["rodent"], "ground", (1, 3), (100, 120), ["hunt:65", "huntDie:rodent", None], 3),
 ("Meadowlark", "G", ["grub", "seed"], "ground", (2, 4), (36, 40), ["layNest:ground", "pEgg", "wDraw:2"], 1),
 ("Finch", "GF", ["seed"], "bowl", (3, 5), (18, 23), ["tuckDraw", "flock", "gainF:seed", "allDraw"], 0),
 ("Shrike", "G", ["rodent", "grub"], "bowl", (2, 4), (30, 34), ["cacheS:rodent", "hunt:35", "huntDie:grub"], 1),
 ("Dove", "GF", ["seed"], "platform", (1, 3), (42, 48), ["gainF:seed", "pEgg", "wFeeder:seed", None], 1),
 ("Heron", "W", ["fish"], "platform", (2, 4), (130, 170), ["hunt:75", "huntDie:fish", None], 3),
 ("Rail", "W", ["grub", "seed"], "ground", (3, 5), (32, 40), ["laySelf", "tuckEgg", "flock"], 0),
 ("Grebe", "W", ["fish", "grub"], "platform", (2, 4), (55, 70), ["gainF:fish", "pFood:fish", "draw1"], 1),
 ("Teal", "W", ["seed", "grub"], "ground", (4, 6), (55, 62), ["flock", "laySelf", "allDraw"], 1),
 ("Plover", "WG", ["grub"], "ground", (2, 4), (40, 48), ["tuckDraw", "draw1", "wDraw:2"], 0),
 ("Kingfisher", "W", ["fish"], "cavity", (2, 4), (48, 58), ["gainF:fish", "cacheF:fish", "huntDie:fish", "trade"], 1),
 ("Bittern", "W", ["fish", "rodent"], "ground", (2, 4), (100, 115), ["huntDie:fish", "hunt:50", None], 2),
 ("Sandpiper", "W", ["grub"], "ground", (3, 4), (34, 40), ["flock", "tuckDraw", "pTuck:W"], 0),
 ("Tern", "W", ["fish"], "ground", (1, 3), (75, 85), ["gainF:fish", "wFood:fish:2", "cacheS:fish"], 2),
 ("Coot", "W", ["seed", "grub"], "platform", (4, 6), (60, 70), ["laySelf", "layNest:platform", "draw1"], 1),
 ("Swallow", "WG", ["grub"], "bowl", (3, 5), (30, 34), ["flock", "tuckDraw", "pTuck:G", "wPlay:W"], 0),
 ("Crane", "WG", ["seed", "grub"], "ground", (1, 2), (180, 220), ["wPlay:G", "wBonus", None], 4),
 ("Hawk", "FGW", ["rodent"], "platform", (1, 3), (90, 110), ["hunt:75", "huntDie:rodent", "wBonus"], 3),
 ("Wren", "FGW", ["grub"], "star", (3, 5), (14, 18), ["laySelf", "tuckEgg", "pEgg", "wPlay:F"], 0),
 ("Crow", "FGW", ["*"], "platform", (2, 4), (85, 100), ["cacheS:rodent", "trade", "wFeeder:grub", "allDraw"], 1),
 ("Sparrow", "FG", ["seed", "grub"], "star", (3, 5), (20, 23), ["flock", "gainF:seed", "pFood:seed", "layNest:star"], 0),
 ("Waxwing", "FG", ["berry"], "bowl", (2, 4), (27, 30), ["gainF:berry", "wFeeder:berry", "allFood:berry"], 1),
 ("Oriole", "FG", ["berry", "grub"], "bowl", (2, 4), (28, 32), ["wFood:berry:2", "gainS:berry", "wDraw:2"], 2),
 ("Swift", "GW", ["grub"], "star", (2, 3), (36, 42), ["draw1", "tuckDraw", "wPlay:G"], 1),
 ("Egret", "WG", ["fish", "grub"], "platform", (2, 4), (90, 100), ["huntDie:fish", "wLayNest:platform", None], 3),
]
ADJ = ["Amber", "Ashen", "Bramble", "Cinder", "Copper", "Dawn", "Dusk", "Ember", "Fern", "Frost", "Gilded", "Hazel", "Hollow", "Juniper", "Lantern",
       "Marsh", "Mist", "Moss", "Nettle", "Opal", "Pebble", "Pine", "Quill", "Rush", "Rust", "Saffron", "Sedge", "Silver", "Slate", "Sorrel",
       "Thistle", "Tidal", "Umber", "Velvet", "Willow", "Wisp", "Cobalt", "Briar", "Clover", "Larch", "Meadow", "Russet", "Smoke", "Sun", "Storm"]
FOODS = ["grub", "seed", "fish", "berry", "rodent"]
names, birds = set(), []
def nm(base):
    while True:
        a = R.choice(ADJ); n = a + " " + base
        if n not in names: names.add(n); return n
per = [3] * len(BASES)   # 40 bases x 3 = 120 birds
for bi, (base, hab, diet, nest, er, wr, pows, bias) in enumerate(BASES):
    for k in range(per[bi]):
        pw = pows[k % len(pows)] if k < len(pows) else R.choice(pows)
        ncost = R.choice([1, 1, 2, 2, 2, 3]) if bias < 3 else R.choice([2, 3, 3])
        if diet == ["*"]: cost = ["*"] * ncost
        else:
            cost = [R.choice(diet) for _ in range(ncost)]
            if ncost >= 2 and R.random() < .25: cost[-1] = "*"
            if ncost == 1 and len(diet) > 1 and R.random() < .35: cost = ["|".join(diet[:2])]
        h = hab
        if len(hab) > 1 and R.random() < .3: h = hab[0]
        eggs = R.randint(*er); ws = R.randint(*wr)
        pts = max(0, min(9, ncost + bias + R.choice([0, 0, 1, -1]) + (2 if pw is None else 0) + (1 if eggs <= 2 else 0) - (1 if len(h) == 3 else 0)))
        kind = None; x = None
        if pw:
            parts = pw.split(":"); kind = parts[0]; x = parts[1:] if len(parts) > 1 else []
        birds.append({"id": "", "n": nm(base), "h": h, "c": cost, "p": pts, "nest": nest, "e": eggs, "ws": ws, "pw": kind, "x": x or []})
for b in birds:
    b["id"] = b["n"].lower().replace(" ", "-")
assert len({b["id"] for b in birds}) == len(birds)
BONUS = [
 ("small-wings", "Little Wings", "Birds with wings under 30 cm across", {"t": "ws", "lt": 30}, [[4, 3], [6, 7]]),
 ("big-wings", "Broad Wings", "Birds with wings over 65 cm across", {"t": "ws", "gt": 65}, [[4, 3], [6, 7]]),
 ("bowl-keeper", "Bowl Keeper", "Bowl-nest birds holding at least 1 egg", {"t": "nestEgg", "n": "bowl"}, "1"),
 ("hollow-keeper", "Hollow Keeper", "Cavity-nest birds holding at least 1 egg", {"t": "nestEgg", "n": "cavity"}, "1"),
 ("ground-keeper", "Ground Keeper", "Ground-nest birds holding at least 1 egg", {"t": "nestEgg", "n": "ground"}, "1"),
 ("ledge-keeper", "Ledge Keeper", "Platform-nest birds holding at least 1 egg", {"t": "nestEgg", "n": "platform"}, "1"),
 ("angler", "River Angler", "Birds that eat fish", {"t": "eats", "f": "fish"}, [[2, 3], [4, 8]]),
 ("seed-saver", "Seed Saver", "Birds that eat seed", {"t": "eats", "f": "seed"}, [[2, 3], [4, 8]]),
 ("mouser", "Field Mouser", "Birds that eat rodents", {"t": "eats", "f": "rodent"}, [[2, 3], [4, 8]]),
 ("berry-picker", "Berry Picker", "Birds that eat berries", {"t": "eats", "f": "berry"}, [[2, 3], [4, 8]]),
 ("grub-digger", "Grub Digger", "Birds that eat grubs", {"t": "eats", "f": "grub"}, [[3, 3], [5, 7]]),
 ("woodland", "Woodland Walker", "Birds that live only in the forest", {"t": "only", "h": "F"}, [[3, 3], [5, 7]]),
 ("prairie", "Prairie Walker", "Birds that live only in the grassland", {"t": "only", "h": "G"}, [[3, 3], [5, 7]]),
 ("marsh", "Marsh Walker", "Birds that live only in the wetland", {"t": "only", "h": "W"}, [[3, 3], [5, 7]]),
 ("bargain", "Bargain Watcher", "Birds worth 3 points or less", {"t": "pts", "le": 3}, "1"),
 ("brood", "Full Nests", "Birds holding 4 or more eggs", {"t": "eggs", "ge": 4}, "3"),
 ("hoarder", "Pantry Keeper", "Birds whose power caches food", {"t": "power", "k": ["cacheS", "cacheF", "huntDie"]}, [[2, 3], [4, 7]]),
 ("flock-friend", "Flock Friend", "Birds whose power tucks cards", {"t": "power", "k": ["tuckDraw", "tuckEgg", "tuckFood", "flock", "hunt", "pTuck"]}, [[2, 3], [4, 7]]),
]
GOALS = [
 ("birds-F", "Birds in your forest", {"t": "birds", "h": 0}), ("birds-G", "Birds in your grassland", {"t": "birds", "h": 1}), ("birds-W", "Birds in your wetland", {"t": "birds", "h": 2}),
 ("eggs-F", "Eggs in your forest", {"t": "eggsIn", "h": 0}), ("eggs-G", "Eggs in your grassland", {"t": "eggsIn", "h": 1}), ("eggs-W", "Eggs in your wetland", {"t": "eggsIn", "h": 2}),
 ("nest-bowl", "Bowl nests with an egg", {"t": "nestEgg", "n": "bowl"}), ("nest-cavity", "Cavity nests with an egg", {"t": "nestEgg", "n": "cavity"}),
 ("nest-ground", "Ground nests with an egg", {"t": "nestEgg", "n": "ground"}), ("nest-platform", "Platform nests with an egg", {"t": "nestEgg", "n": "platform"}),
 ("sets", "Full egg sets (1 per row)", {"t": "sets"}), ("total", "Birds in play", {"t": "total"}),
]
out = {"birds": birds, "bonus": [dict(id=a, n=b, txt=c, test=d, sc=e) for a, b, c, d, e in BONUS], "goals": [dict(id=a, n=b, test=c) for a, b, c in GOALS]}
js = "// GENERATED by gen-data.py (do not edit by hand): 120 original birds, bonus cards, round goals.\nvar PP_DATA = " + json.dumps(out, separators=(",", ":")) + ";\nif (typeof module !== 'undefined') module.exports = PP_DATA;\n"
(D / "src" / "data.js").write_text(js)
from collections import Counter
print("birds", len(birds), "powers", Counter(b["pw"] for b in birds).most_common(8), "pts avg", sum(b["p"] for b in birds) / len(birds))
