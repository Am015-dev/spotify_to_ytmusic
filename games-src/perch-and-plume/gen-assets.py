#!/usr/bin/env python3
"""Re-runnable: writes assets.json, ASSETS.md and the Google Flow prompt files from the roster (src/data.js) and the list below.
   python3 games-src/perch-and-plume/gen-assets.py"""
import json, pathlib, re
D = pathlib.Path(__file__).resolve().parent; SP = D.parent
DATA = json.loads(re.search(r'var PP_DATA = (\{.*?\});\n', (D / 'src' / 'data.js').read_text(), re.S).group(1))
STYLE = ("Flat 2D naturalist field-guide illustration, soft gouache and watercolour texture, clean shapes, gentle cel shading, warm parchment cream, moss green, "
         "ochre and slate-blue palette, thin warm-brown outlines, no 3D, no photo realism, no text, no letters, no numbers, no logos.")
WHITE = " One single object centred on a flat plain white background, nothing else, no ground shadow."
HABW = {'F': 'a mossy forest branch with leaves', 'G': 'tall golden meadow grass and wildflowers', 'W': 'reeds at the edge of calm blue water'}
COL = {'Warbler': 'olive and lemon yellow', 'Woodpecker': 'black and white with a red cap', 'Nuthatch': 'blue-grey back and rusty belly', 'Owl': 'mottled brown and cream with round amber eyes',
       'Jay': 'bright blue and white with a crest', 'Thrush': 'warm brown with a speckled cream breast', 'Tanager': 'scarlet with black wings', 'Kinglet': 'tiny olive with a golden crown stripe',
       'Treecreeper': 'streaky brown with a thin curved bill', 'Vireo': 'soft green-grey with white eye-rings', 'Lark': 'sandy streaked brown with a small crest', 'Pipit': 'buff and streaked brown',
       'Bunting': 'chestnut and cream with a stubby bill', 'Quail': 'plump speckled brown with a curled head plume', 'Kestrel': 'rusty orange back with slate-blue wings', 'Harrier': 'pale grey with black wingtips',
       'Meadowlark': 'yellow breast with a black V bib', 'Finch': 'rose-red head and streaked body', 'Shrike': 'grey with a black bandit mask', 'Dove': 'soft fawn-grey with a pink sheen',
       'Heron': 'tall slate-grey with long legs and a dagger bill', 'Rail': 'secretive brown with a long red bill', 'Grebe': 'dark body with golden ear tufts', 'Teal': 'small duck with a green eye patch',
       'Plover': 'sandy back with a black neck ring', 'Kingfisher': 'electric blue back and orange belly', 'Bittern': 'striped tawny, neck stretched upward', 'Sandpiper': 'speckled grey-brown on thin legs',
       'Tern': 'white with a black cap and forked tail', 'Coot': 'charcoal black with a white bill shield', 'Swallow': 'glossy navy back and long forked tail', 'Crane': 'tall grey with a red crown patch',
       'Hawk': 'brown back with a russet tail', 'Wren': 'tiny round brown with a cocked tail', 'Crow': 'glossy black, clever eye', 'Sparrow': 'chestnut and grey streaked',
       'Waxwing': 'silky fawn with a crest and yellow tail tip', 'Oriole': 'flame orange and black', 'Swift': 'sooty brown with long sickle wings', 'Egret': 'pure white with lacy plumes'}
I = []
def add(stem, kind, w, h, ratio, alpha, wave, slot, prompt): I.append(dict(stem=stem, kind=kind, w=w, h=h, ratio=ratio, alpha=alpha, wave=wave, slot=slot, prompt=prompt))
TUTOR = []   # birds the tutorial and the first minute show: wave 1
try: TUTOR = json.loads((D / 'tutor-birds.json').read_text())
except Exception: pass
# ---- wave 1: the first minute
add("bg-title", "bg", 1080, 1920, "9:16", False, 1, "Title screen background (cover; the logo sits in the calm top third)", "A sunrise view over a naturalist's field station: a wooden bird feeder on a post in the foreground, a forest edge on the left, a golden meadow in the middle and a reed-fringed lake on the right, small birds flying in a soft pale sky, calm empty sky in the top third.")
add("board-mat", "board", 1600, 960, "5:3", False, 1, "Your habitat mat behind the three rows (cover)", "A top-down view of an old wooden field-guide desk mat divided into three soft horizontal bands: a green forest band at the top, a golden grassland band in the middle and a blue-green wetland band at the bottom, each band empty and calm with faint leaf, grass and ripple patterns.")
for k, (hab, d) in enumerate([("forest", "deep green woodland moss, ferns and dappled light"), ("grassland", "golden meadow grass with small wildflowers"), ("wetland", "blue-green reeds, lily pads and gentle ripples")]):
    add("row-" + hab, "board", 1600, 320, "5:1", False, 1, f"The {hab} row strip behind five bird slots (cover)", f"A wide calm horizontal strip of {d}, seen from above, soft and low in detail so cards on top stay readable.")
add("ui-feeder", "ui", 512, 512, "1:1", True, 1, "Birdfeeder tray behind the five food dice (contain)", "A round wooden bird-feeder tray with a raised rim and a little roof post, seen from above at a slight angle." + WHITE)
add("card-back", "card", 500, 700, "5:7", False, 1, "Bird deck and the backs of opponents' cards (cover)", "The back of a playing card: a cream field with a moss-green border, a circular laurel wreath and a single feather in the centre.")
for f, d in [("grub", "a plump pink-brown grub curled in a C shape"), ("seed", "a small bundle of golden wheat seeds"), ("fish", "a small silver-blue fish"), ("berry", "a cluster of three red berries on a twig"), ("rodent", "a small grey field mouse sitting up")]:
    add("food-" + f, "token", 256, 256, "1:1", True, 1, f"{f} food token and die face (contain)", f"A round wooden token with {d} painted on it." + WHITE)
add("token-egg", "token", 256, 256, "1:1", True, 1, "Egg on a bird card (contain)", "A single small speckled pale-blue bird egg." + WHITE)
CAST = [("ottilie", "Aunt Ottilie, the guide", "a kind elderly naturalist woman with silver hair in a bun, round spectacles and a field notebook"),
        ("pip", "Pip, a young birder", "an eager teenage boy with messy hair, oversized binoculars and a green scarf"),
        ("mags", "Mags, the retired postmistress", "a cheerful plump woman in her sixties with a sun hat full of feathers"),
        ("tobias", "Tobias, the photographer", "a lanky young man with a camera strap, beanie and a patient smile"),
        ("corvin", "Corvin Ashdown, boss of act 1", "a sharp-featured man in a black coat with a raven-feather pin and a sly grin"),
        ("delphine", "Delphine Reedly, boss of act 2", "a confident woman in waders and a blue oilskin jacket, braided hair, holding a fishing net"),
        ("barnaby", "Lord Barnaby Quill, final boss", "a grand old gentleman with a white moustache, tweed suit and a magnifying glass"),
        ("you", "You, the young naturalist", "a young naturalist of any gender with a satchel, a pencil behind the ear and a curious smile")]
for cid, slot, d in CAST:
    add("portrait-" + cid, "portrait", 512, 512, "1:1", False, 1, f"Portrait: {slot} (cover)", f"Head-and-shoulders portrait of {d}, soft field background.")
birds = DATA['birds']
first = [b for b in birds if b['id'] in TUTOR] + [b for b in birds if b['id'] not in TUTOR]
for k, b in enumerate(first):
    base = b['n'].split(' ')[-1]; adj = b['n'].split(' ')[0].lower()
    add("bird-" + b['id'], "card", 512, 512, "1:1", False, 1 if k < 14 else 2, f"Bird card picture: {b['n']} (cover, square art box on the card)",
        f"A single {base.lower()} perched on {HABW[b['h'][0]]}, plumage {COL.get(base, 'natural colours')} with a hint of {adj} tones, side view, the whole bird visible.")
# ---- wave 2: every remaining piece the rules need
for bc in DATA['bonus']:
    add("bonus-" + bc['id'], "card", 500, 700, "5:7", False, 2, f"Bonus card picture: {bc['n']} (cover)", f"A small painted vignette for a naturalist's bonus goal: {bc['txt'].lower()}, shown as a tidy arrangement of field-guide sketches.")
for g in DATA['goals']:
    add("goal-" + g['id'], "icon", 256, 256, "1:1", True, 2, f"Round goal tile: {g['n']} (contain)", f"A round tile icon showing {g['n'].lower()} as a simple emblem." + WHITE)
for n, d in [("bowl", "a neat woven cup-shaped nest"), ("cavity", "a round hole in a tree trunk"), ("ground", "a shallow scrape in sand with pebbles"), ("platform", "a flat stick platform"), ("star", "a golden star made of twigs")]:
    add("nest-" + n, "icon", 128, 128, "1:1", True, 2, f"{n} nest icon on bird cards (contain)", f"A single small icon of {d}." + WHITE)
add("ui-tray", "ui", 768, 256, "3:1", True, 2, "The face-up bird tray (contain)", "A long shallow wooden tray with three card-sized recesses in a row, seen from above." + WHITE)
add("ui-cube", "icon", 128, 128, "1:1", True, 2, "Action cube left this round (contain)", "A single small painted wooden cube in warm amber." + WHITE)
# ---- wave 3: polish
add("bg-result", "bg", 1080, 1920, "9:16", False, 3, "Result screen background (cover)", "An evening view of a cosy field station table with an open sketchbook, a lantern, binoculars and a few feathers, calm centre.")
add("ui-trophy", "ui", 512, 512, "1:1", True, 3, "Winner's rosette on the result screen (contain)", "A single green and gold rosette ribbon with a feather in the middle." + WHITE)
add("fx-chain-spark", "fx", 256, 256, "1:1", True, 3, "Spark when a brown power fires in a chain (contain)", "A single soft golden burst of light with tiny feathers." + WHITE)
add("fx-egg-pop", "fx", 256, 256, "1:1", True, 3, "Pop when an egg is laid (contain)", "A single small egg with a sparkle and two curved motion lines." + WHITE)
add("fx-food-pop", "fx", 256, 256, "1:1", True, 3, "Pop when food is gained (contain)", "A single small burst of seeds and berries flying outward." + WHITE)
add("bg-map", "bg", 1920, 1080, "16:9", False, 3, "Story map background (cover)", "An old hand-drawn naturalist's map of three regions: a larch forest, a salt marsh and high meadows, with a dotted path linking them, calm parchment.")
man = {"style": STYLE, "items": I}
(D / "assets.json").write_text(json.dumps(man, indent=1) + "\n")
out = SP / "next-wave" / "flow-2d" / "perch-and-plume"; out.mkdir(parents=True, exist_ok=True)
for f in out.glob("prompts-wave*.json"): f.unlink()
for w in (1, 2, 3):
    items = [i for i in I if i['wave'] == w]
    for r in sorted({i['ratio'] for i in items}):
        sub = {i['stem']: STYLE + " " + i['prompt'] for i in items if i['ratio'] == r}
        a, b = r.split(':')
        (out / f"prompts-wave{w}-ratio-{a}x{b}.json").write_text(json.dumps({"ratio": r, "cards": sub}, indent=1) + "\n")
L = ["# Perch & Plume: pictures (2D only)", "", "Every picture the game shows is a named slot. `games/perch-and-plume/media/<stem>.webp` fills it with no code change (the build lists the files that exist; the page never asks for a missing one). Until then a tidy code-drawn placeholder shows at the same size and aspect. Manifest: `assets.json` (re-made by `gen-assets.py`).", "",
     "Style block (in front of every prompt): " + STYLE, ""]
for w in (1, 2, 3):
    L += [f"## Wave {w} ({'first minute' if w == 1 else 'every remaining card and piece' if w == 2 else 'polish'}): {sum(1 for i in I if i['wave'] == w)} pictures", "", "| stem | size | ratio | alpha | slot |", "|---|---|---|---|---|"]
    L += [f"| {i['stem']} | {i['w']}x{i['h']} | {i['ratio']} | {'yes' if i['alpha'] else 'no'} | {i['slot']} |" for i in I if i['wave'] == w]; L.append("")
L += ["## How to drop the finished pictures in (3 steps)", "",
      "1. Generate each wave in Google Flow with `games-src/next-wave/flow-2d/perch-and-plume/prompts-waveN-ratio-WxH.json` (one file per wave and aspect ratio). Save each picture as `<stem>.png` (or .webp).",
      "2. Put the files in `assets-inbox/perch-and-plume/` and run `python3 games-src/scripts/ingest-assets.py` (`--check` first = dry run). It writes `games/perch-and-plume/media/<stem>.webp` (PLAYBOOK \"Finished pictures from the owner\").",
      "3. Rebuild (`python3 games-src/scripts/build-all.py --quick perch-and-plume`): the build lists the present files and the page draws them in their slots (cover or contain, never stretched).", "",
      "Registration for the asset inbox: `python3 games-src/perch-and-plume/register-assets.py` (orchestrator, at merge time)."]
(D / "ASSETS.md").write_text("\n".join(L) + "\n")
print("assets", len(I), {w: sum(1 for i in I if i['wave'] == w) for w in (1, 2, 3)})
