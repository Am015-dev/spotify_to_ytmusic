#!/usr/bin/env python3
"""Re-runnable: writes assets.json, ASSETS.md, the Google Flow prompt files and the track layout guides from ONE list below.
   python3 games-src/redline-rally/gen-assets.py"""
import json, os, pathlib
D = pathlib.Path(__file__).resolve().parent; SP = D.parent
STYLE = ("Flat 2D vector game art, top-down view, clean bold shapes with soft cel shading, a warm sunset racing palette of orange, teal, cream and deep navy, "
         "thin dark outlines, no 3D, no photo realism, no text, no letters, no numbers, no logos.")
WHITE = " One single object centred on a flat plain white background, nothing else, no shadow on the ground."
CARS = [("crimson", "deep red"), ("azure", "bright blue"), ("jade", "emerald green"), ("amber", "golden yellow"), ("violet", "royal purple"), ("graphite", "dark grey with a silver stripe")]
DRV = [("kit", "Kit Marlow", "a calm woman in her thirties with a short brown bob and round goggles pushed up on her forehead"),
       ("juno", "Juno Vega", "a grinning young man with a bandana and a gap in his front teeth"),
       ("dax", "Dax Orrin", "a stern broad-shouldered man with a trimmed grey beard and a battered open-face helmet"),
       ("pia", "Pia Rask", "a cheerful woman with a long red ponytail and freckles, wind-swept"),
       ("oto", "Oto Lind", "a quiet tall man with silver-rimmed glasses and a neat white racing cap"),
       ("bex", "Bex Hollis", "a fearless woman with a shaved side, a lightning-bolt scar on her eyebrow and a wide smile")]
I = []
def add(stem, kind, w, h, ratio, alpha, wave, slot, prompt): I.append(dict(stem=stem, kind=kind, w=w, h=h, ratio=ratio, alpha=alpha, wave=wave, slot=slot, prompt=prompt))
# ---- wave 1: the first minute
add("bg-title", "bg", 1080, 1920, "9:16", False, 1, "Title screen background (cover)", "A dramatic sunset view of a racing circuit seen from above at a steep angle, a pack of colourful race cars thundering down a wide straight toward the viewer, long golden shadows, a calm empty sky strip at the top for the logo.")
add("track-sunline", "board", 2000, 1200, "5:3", False, 1, "Sunline Speedway board (cover over the 2000x1200 world; follow games-src/redline-rally/guides/track-sunline.svg)", "Top-down view of a fast closed racing circuit with a long straight along the bottom, wide sweeping corners, grass infield, red and white kerbs on the corners, sandy run-off, a chequered start line on the bottom straight, a few trees and a grandstand beside the straight. Match the loop in the reference outline exactly.")
add("track-hairpin", "board", 2000, 1200, "5:3", False, 1, "Hairpin Hill board (cover over the 2000x1200 world; follow guides/track-hairpin.svg)", "Top-down view of a tight technical racing circuit on a hillside with many hairpin bends and S-curves, rocky grass banks, tyre walls on the tightest corners, red and white kerbs, a chequered start line on the bottom straight, pine trees. Match the loop in the reference outline exactly.")
for cid, nm in CARS:
    add("car-" + cid, "token", 256, 128, "2:1", True, 1, "Race car on the track (contain, nose to the right)", f"A small {nm} open-wheel race car seen straight from above, nose pointing right, a white racing stripe, tiny driver helmet in the cockpit, chunky wheels." + WHITE)
add("card-back", "card", 500, 700, "5:7", False, 1, "Deck and discard piles, opponents' cards (contain)", "The back of a playing card: a deep navy field with a bold orange chevron pattern and a stylised gear-shaped medallion in the centre, cream border.")
for v, d in [(1, "a lone snail-slow road marker cone on a quiet lane"), (2, "a gentle country road winding past a single windmill"), (3, "a brisk open road with motion lines and a flag fluttering"), (4, "a blazing straight with a rocket-fast streak and flames behind a car silhouette")]:
    add(f"card-speed-{v}", "card", 500, 700, "5:7", False, 1, f"Speed card {v} face (cover; the value is drawn by the game)", f"A card illustration: {d}, increasing intensity of speed. Leave the top-left corner area calm so a big number can be placed there later.")
add("card-heat", "card", 500, 700, "5:7", False, 1, "Heat card face (cover)", "A card illustration: a glowing red-hot engine block venting orange flames and shimmering heat haze, dark smoky background.")
add("card-stress", "card", 500, 700, "5:7", False, 1, "Stress card face (cover)", "A card illustration: a wobbling, shaking steering wheel with purple lightning sparks around it and a blur of scattered road lines, tense dark violet background.")
add("ui-gear-dial", "ui", 512, 160, "16:5", True, 1, "Gear panel background behind the four gear buttons (contain)", "A wide dashboard strip: a brushed-metal gear shifter gate with four evenly spaced round sockets in a row, small rivets, a soft glow." + WHITE)
add("portrait-kit", "portrait", 512, 512, "1:1", False, 1, "Your driver portrait on the result screen (cover)", "Head-and-shoulders portrait of " + DRV[0][2] + ", wearing a race suit with a collar, confident look, bright flat backdrop.")
# ---- wave 2: every other piece the rules need
for did, nm, desc in DRV[1:]:
    add("portrait-" + did, "portrait", 512, 512, "1:1", False, 2, f"{nm} rival portrait on the result screen (cover)", f"Head-and-shoulders portrait of {desc}, wearing a race suit with a collar, bright flat backdrop.")
for k, (n, d) in enumerate([("engine", "a polished engine with a small turbo"), ("tyres", "a stack of three fresh racing tyres"), ("aero", "a swooping rear wing and front splitter")]):
    add(f"card-upgrade-back-{n}", "card", 500, 700, "5:7", False, 2, f"Upgrade deck back: {n} (not used by the base rules; reserved)", f"The back of a card: a cream field with a bold teal border and in the centre {d} drawn as a clean emblem.")
add("ui-engine-tray", "ui", 512, 192, "8:3", True, 2, "Engine tray behind the heat counter (contain)", "A shallow metal tray with six round recesses in two rows, each recess glowing faintly orange." + WHITE)
add("icon-heat", "icon", 128, 128, "1:1", True, 2, "Heat icon in the hand panel (contain)", "A single orange and yellow flame drop, simple bold shape." + WHITE)
add("icon-stress", "icon", 128, 128, "1:1", True, 2, "Stress icon (contain)", "A single violet zigzag lightning bolt inside a small circle." + WHITE)
add("icon-gear", "icon", 128, 128, "1:1", True, 2, "Gear icon (contain)", "A single chunky steel cog wheel with eight teeth." + WHITE)
add("ui-corner-sign", "ui", 256, 256, "1:1", True, 2, "Corner speed-limit sign on the track (contain; the limit number is drawn by the game)", "A round road sign with a thick red ring and an empty white centre, on a short grey post seen from above." + WHITE)
# ---- wave 3: polish
add("bg-podium", "bg", 1080, 1920, "9:16", False, 3, "Result screen background (cover)", "A cheerful top-down view of a three-step podium on a red carpet with confetti and streamers, spotlights from the corners, a calm centre.")
add("ui-trophy", "ui", 512, 512, "1:1", True, 3, "Winner trophy on the result screen (contain)", "A single golden racing trophy cup with two handles and a small steering wheel on the front." + WHITE)
add("ui-flag-checkered", "ui", 512, 384, "4:3", True, 3, "Chequered flag over the start line (contain)", "A single waving chequered black and white flag on a thin pole." + WHITE)
add("fx-heat-flame", "fx", 512, 384, "4:3", True, 3, "Pop when a corner burns heat (contain)", "A single burst of orange and yellow flame with small sparks." + WHITE)
add("fx-spinout-smoke", "fx", 512, 384, "4:3", True, 3, "Pop when a car spins out (contain)", "A single swirling puff of grey tyre smoke with two curved black skid marks." + WHITE)
add("fx-slipstream-streaks", "fx", 512, 384, "4:3", True, 3, "Pop for a slipstream jump (contain)", "A single set of five bright cyan air streaks curving back like wind lines." + WHITE)
add("fx-boost-flare", "fx", 512, 384, "4:3", True, 3, "Pop for a boost (contain)", "A single bright yellow starburst flare with a blue core." + WHITE)
add("icon-lap", "icon", 128, 128, "1:1", True, 3, "Lap counter icon (reserved)", "A single looping arrow forming a circle with a tiny flag." + WHITE)
add("icon-place", "icon", 128, 128, "1:1", True, 3, "Race position icon (reserved)", "A single small podium with three steps." + WHITE)
for x in I: x['prompt'] = x['prompt']
man = {"style": STYLE, "items": I}
(D / "assets.json").write_text(json.dumps(man, indent=1) + "\n")
# ---- Flow prompt files
out = SP / "next-wave" / "flow-2d" / "redline-rally"; out.mkdir(parents=True, exist_ok=True)
for w in (1, 2, 3):
    items = [i for i in I if i['wave'] == w]
    (out / f"prompts-wave{w}.json").write_text(json.dumps({"cards": {i['stem']: STYLE + " " + i['prompt'] for i in items}}, indent=1) + "\n")
    ratios = sorted({i['ratio'] for i in items})
    if len(ratios) > 1:
        for r in ratios:
            tag = "wide" if (lambda a, b: a >= b)(*map(int, r.split(':'))) else "tall"
            sub = {i['stem']: STYLE + " " + i['prompt'] for i in items if i['ratio'] == r}
            (out / f"prompts-wave{w}-ratio-{r.replace(':', 'x')}.json").write_text(json.dumps({"ratio": r, "cards": sub}, indent=1) + "\n")
# ---- layout guides (reference outlines for the two board pictures) from tracks
import subprocess
(D / "guides").mkdir(exist_ok=True)
js = r"""const fs=require('fs'),vm=require('vm');const c=vm.createContext({});['data','track'].forEach(f=>vm.runInContext(fs.readFileSync('%s/src/'+f+'.js','utf8'),c));
for(const id of Object.keys(vm.runInContext('TK',c))){const t=vm.runInContext('TK["'+id+'"]',c);let d='M'+t.dense.map(p=>p[0].toFixed(0)+' '+p[1].toFixed(0)).join('L')+'Z';
let k=t.list.map(q=>{const a=t.at(q.idx*t.seg);return '<circle cx="'+a.x.toFixed(0)+'" cy="'+a.y.toFixed(0)+'" r="34" fill="#fff" stroke="#d8281d" stroke-width="8"/>'}).join('');
fs.writeFileSync('%s/guides/track-'+id+'.svg','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 1200" width="2000" height="1200"><rect width="2000" height="1200" fill="#2f7a46"/><path d="'+d+'" fill="none" stroke="#333" stroke-width="124" stroke-linejoin="round"/><path d="'+d+'" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="22 26"/>'+k+'</svg>');}""" % (D, D)
subprocess.run(["node", "-e", js], check=True)
# ---- ASSETS.md
L = ["# Redline Rally: pictures (2D only)", "", "Every picture is a named slot. `media/<stem>.webp` fills it with no code change; until then a code-drawn placeholder shows. Manifest: `assets.json` (re-made by `gen-assets.py`).", "",
     "Style block (in front of every prompt): " + STYLE, ""]
for w in (1, 2, 3):
    L += [f"## Wave {w} ({'first minute' if w == 1 else 'every remaining piece' if w == 2 else 'polish'}): {sum(1 for i in I if i['wave'] == w)} pictures", "", "| stem | size | ratio | alpha | slot |", "|---|---|---|---|---|"]
    L += [f"| {i['stem']} | {i['w']}x{i['h']} | {i['ratio']} | {'yes' if i['alpha'] else 'no'} | {i['slot']} |" for i in I if i['wave'] == w]; L.append("")
L += ["## How to drop the finished pictures in (3 steps)", "", "1. Generate each wave in Google Flow with `games-src/next-wave/flow-2d/redline-rally/prompts-waveN.json` (use the `-ratio-` files when a wave mixes sizes). For the two tracks, give Flow `guides/track-*.svg` as the layout reference. Save each picture as `<stem>.png` (or .webp).",
      "2. Put the files in `assets-inbox/redline-rally/` and run `python3 games-src/scripts/ingest-assets.py` (`--check` first = dry run). It writes `games/redline-rally/media/<stem>.webp`.",
      "3. Tell the orchestrator; run `build-all.py --deploy redline-rally`. Nothing else: the page lists the files in `media/` at build time and draws them at the slot's size and aspect.", "",
      "Fit rules: `bg` and `board` kinds are cover (cropped to fill), everything else is contain (never stretched). Card values, corner limits and names are drawn by the game on top, so no text or numbers inside any picture.", ""]
(D / "ASSETS.md").write_text("\n".join(L))
print(len(I), "items:", {w: sum(1 for i in I if i['wave'] == w) for w in (1, 2, 3)})
