#!/usr/bin/env python3
"""Re-runnable: writes assets.json, ASSETS.md, the Flow prompt files, music cues and ASSET-CHECK.md from ONE list.   python3 games-src/stitchwise/gen-assets.py"""
import json, re, pathlib, collections
D = pathlib.Path(__file__).resolve().parent; SP = D.parent
PATCH_DEF = re.findall(r"\['([^']+)', '([^']+)', (\d+), (\d+), (\d+)\]", (D / "src/data.js").read_text())
STYLE = ("Flat 2D hand-stitched quilting illustration, soft woven cotton textures, a warm palette of teal, rose, mustard, cream and deep navy, "
         "thin dark stitched outlines, no 3D, no photo realism, no text, no letters, no numbers, no logos.")
WHITE = " One single object centred on a flat plain white background, nothing else, no shadow on the ground."
FAB = ["red and white gingham", "navy blue with small white polka dots", "mustard yellow with thin cream stripes", "soft green with tiny white daisies", "dusty rose with a diamond lattice pattern",
 "teal with a white wave pattern", "terracotta with cream cross-stitch", "sky blue with white clouds", "plum purple with gold stars", "cream linen with a blue leaf print",
 "forest green tartan", "coral pink with white hearts", "indigo with white paisley", "sunflower yellow with brown seeds pattern", "mint green with white stripes", "burgundy with a cream floral vine",
 "pale grey with navy triangles", "orange with a white zigzag", "lavender with small white tulips", "olive green with mustard dots", "denim blue with orange stitching", "rose pink with grey chevrons",
 "brown with cream feathers", "turquoise with yellow flowers", "charcoal with white pinstripes", "peach with teal scallops", "red with a white snowflake pattern", "blue and white checkerboard",
 "yellow with red cherries", "green with cream leaves and acorns", "magenta with gold diamonds", "teal and cream herringbone", "navy with a red and gold sunburst"]
CAST = [("wren", "Aunt Wren", "a kindly old woman with silver hair in a bun, round glasses on a chain and a measuring tape around her neck", 1, "guide"),
        ("poppy", "Dame Poppy", "a smiling plump woman in a yellow apron with flowers in her grey hair", 1, "opponent"),
        ("tilly", "Tilly Thimble", "a young seamstress with pigtails, freckles and a thimble on every finger", 2, "opponent"),
        ("fernsby", "Granny Fernsby", "a stern elderly woman with white hair, a green shawl and a prize ribbon pinned to her chest", 3, "boss"),
        ("odette", "Odette Loom", "a sharp-eyed middle-aged woman with a purple scarf and a ball of yarn tucked under her arm", 2, "opponent"),
        ("bram", "Bram Seam", "a bearded burly man in a brown waistcoat holding a huge pair of scissors", 2, "opponent"),
        ("marguerite", "Marguerite Bodkin", "an elegant woman with a red velvet jacket, a gold needle brooch and a calm half-smile", 3, "boss"),
        ("ivo", "Ivo Selvage", "a lean man with a blue scarf, pince-nez glasses and a pencil behind his ear", 2, "opponent"),
        ("hester", "Hester Pinwheel", "a cheerful woman in an orange dress with pinwheels pinned to her hat", 2, "opponent"),
        ("tobias", "Tobias Quillon", "a quiet tall man with neat grey hair, a feather quill in his pocket and a tidy green cardigan", 2, "opponent"),
        ("aurelia", "Queen Aurelia", "a regal woman with a crown made of golden thimbles and a purple robe stitched with tiny patches", 3, "boss")]
I = []
def add(stem, kind, w, h, ratio, alpha, wave, slot, prompt): I.append(dict(stem=stem, kind=kind, w=w, h=h, ratio=ratio, alpha=alpha, wave=wave, slot=slot, prompt=prompt))
add("bg-title", "bg", 1080, 1920, "9:16", False, 1, "Title screen background (cover)", "A cosy quilting room seen from the front: a wooden table covered with colourful fabric patches, spools of thread, a pincushion and a window with warm evening light, plenty of calm empty space in the upper half.")
add("bg-table", "bg", 1080, 1920, "9:16", False, 1, "Board background behind the quilt (cover)", "A deep navy wool tablecloth seen from above with faint stitched border lines and soft vignette, completely empty in the middle, calm and dark enough for coloured quilts to stand out.")
add("quilt-frame", "board", 900, 900, "1:1", False, 1, "Quilt board 9x9 (cover; the grid is drawn over it)", "A square cream cotton quilting mat seen from above with a wide wooden frame and a faint nine by nine grid of dotted stitch lines, empty in the middle.")
add("track-frame", "board", 1600, 400, "4:1", False, 1, "Time track strip behind the 54 spaces (cover)", "A long narrow strip of cream ribbon-trimmed felt with small stitched notches along it, seen from above, empty.")
add("token-me", "token", 128, 128, "1:1", True, 1, "Your time token (contain)", "A single round teal wooden spool top with white thread wound around it, seen from above." + WHITE)
add("token-opp", "token", 128, 128, "1:1", True, 1, "Opponent time token (contain)", "A single round terracotta wooden spool top with white thread wound around it, seen from above." + WHITE)
add("icon-button", "icon", 128, 128, "1:1", True, 1, "Button currency icon (contain)", "A single golden sewing button with four holes and crossed thread, seen from above." + WHITE)
add("icon-hourglass", "icon", 128, 128, "1:1", True, 1, "Time cost icon (contain)", "A single small wooden sand timer with cream sand." + WHITE)
add("patch-leather", "token", 256, 256, "1:1", True, 1, "Single leather patch square (cover)", "A single square brown leather patch with cream stitched edges." + WHITE)
for i, (n, sh, c, t, inc) in enumerate(PATCH_DEF):
    add("fabric-%02d" % (i + 1), "token", 256, 256, "1:1", False, 1 if i < 12 else 2, "Fabric of the patch '%s' (square seamless tile, cover over the patch)" % n, "A seamless square fabric swatch seen straight from above: %s, soft cotton weave, no border, fills the whole picture." % FAB[i])
for stem, name, desc, wave, role in CAST:
    add("portrait-" + stem, "portrait", 512, 512, "1:1", False, 1 if stem in ("wren", "poppy") else wave if role == "boss" else 2, "%s portrait (story map, intro and result screen, cover)" % name, "Bust portrait of %s, %s, friendly storybook style, plain warm background." % (name, desc))
add("bonus-tile", "token", 256, 256, "1:1", True, 2, "7x7 bonus tile (contain)", "A single large round felt rosette in gold and cream with ribbon tails." + WHITE)
add("torn-square", "token", 256, 256, "1:1", True, 2, "Torn quilt square for the Moth Season story stage (cover)", "A single square of fabric with a ragged moth-eaten hole in the middle showing the dark table behind." + WHITE)
add("bg-map", "bg", 1080, 1920, "9:16", False, 3, "Story map background (cover)", "A painted map of a countryside with three fairgrounds, striped tents and bunting, winding paths between them, empty open areas for markers.")
add("result-win", "bg", 1080, 1920, "9:16", False, 3, "Win result background (cover)", "A cheerful fairground at golden hour with bunting and a first-prize rosette on a quilt hung on a line, empty centre.")
add("result-lose", "bg", 1080, 1920, "9:16", False, 3, "Loss result background (cover)", "A quiet fairground at dusk with lanterns being lit and a half-finished quilt on a frame, calm and warm, empty centre.")
add("fx-sparkle", "fx", 256, 256, "1:1", True, 3, "Sparkle at the button-income moment (contain)", "A single bright four-point golden sparkle with tiny sewing-thread curls." + WHITE)
add("fx-stitch", "fx", 256, 256, "1:1", True, 3, "Stitch flourish when a patch is sewn on (contain)", "A single short curved line of cream running stitches with a needle and thread tail." + WHITE)
add("icon-bonus", "icon", 128, 128, "1:1", True, 3, "Bonus 7 icon (contain)", "A single small gold rosette ribbon." + WHITE)
add("icon-leather", "icon", 128, 128, "1:1", True, 3, "Leather patch space icon on the track (contain)", "A single small brown leather square with cream stitches." + WHITE)
add("ui-offer-card", "ui", 400, 320, "5:4", True, 3, "Patch offer card background (contain)", "A single cream paper tag card with a stitched border and a small hole with string at the top." + WHITE)
stems = [i["stem"] for i in I]; assert len(stems) == len(set(stems))
json.dump({"style": STYLE, "items": I}, open(D / "assets.json", "w"), indent=1)
# Flow prompt files
out = SP / "next-wave" / "flow-2d" / "stitchwise"; out.mkdir(parents=True, exist_ok=True)
for f in out.glob("prompts-*.json"): f.unlink()
grp = collections.defaultdict(list)
for i in I: grp[(i["wave"], i["ratio"])].append(i)
fa = lambda r: {"9:16": "9:16", "1:1": "1:1", "4:1": "16:9", "5:4": "4:3"}.get(r, "1:1")
for (wave, ratio), items in sorted(grp.items()):
    name = "prompts-wave%d-ratio-%s.json" % (wave, ratio.replace(":", "x"))
    json.dump({"wave": wave, "ratio": ratio, "flow_aspect": fa(ratio), "style": STYLE, "notes": "stitchwise 2D wave %d, ratio %s. Paste with the Flow aspect given; the ingest script crops/resizes to the exact size. Save each result as <stem>.webp or .png. No text in any picture." % (wave, ratio),
               "meta": {"game": "stitchwise", "count": len(items)}, "cards": {i["stem"]: STYLE + " " + i["prompt"] for i in items}}, open(out / name, "w"), indent=1)
# music cues
mu = SP / "next-wave" / "music" / "stitchwise"; mu.mkdir(parents=True, exist_ok=True)
json.dump({"game": "stitchwise", "wave": 1, "slots": [
 {"slot": "tavern", "file": "music/tavern-a.mp3", "use": "Title and Story map", "cue": "Warm acoustic folk, fingerpicked guitar and soft fiddle, relaxed 88 bpm, cosy quilting circle, loopable, no vocals"},
 {"slot": "main", "file": "music/main-a.mp3", "use": "During a game", "cue": "Gentle pizzicato strings and light marimba, thoughtful and tidy, 96 bpm, loopable, no vocals"},
 {"slot": "fight", "file": "music/fight-a.mp3", "use": "Last third of the time track and boss stages", "cue": "Same palette as main but brisker, 116 bpm, hand claps and woodblock, loopable, no vocals"},
 {"slot": "victory", "file": "music/victory-a.mp3", "use": "Win result (plays once)", "cue": "Bright short fanfare of brass band and glockenspiel, 8 seconds, no vocals"},
 {"slot": "defeat", "file": "music/defeat-a.mp3", "use": "Loss result (plays once)", "cue": "Gentle wistful solo accordion, 8 seconds, hopeful ending, no vocals"}]}, open(mu / "cues-wave1.json", "w"), indent=1)
# ASSETS.md
L = ["# Stitchwise: pictures (2D only)", "", "Every picture is a named slot. `media/<stem>.webp` fills it with no code change; until then a code-drawn placeholder shows. Manifest: `assets.json` (re-made by `gen-assets.py`, which also writes the Flow prompts in `games-src/next-wave/flow-2d/stitchwise/` and the music cues in `games-src/next-wave/music/stitchwise/cues-wave1.json`).", "", "Style block (in front of every prompt): " + STYLE, ""]
for w, t in [(1, "first minute"), (2, "every remaining rules piece"), (3, "polish")]:
    its = [i for i in I if i["wave"] == w]
    L += ["## Wave %d (%s): %d pictures" % (w, t, len(its)), "", "| stem | kind | size | ratio | alpha | slot |", "|---|---|---|---|---|---|"]
    L += ["| %s | %s | %dx%d | %s | %s | %s |" % (i["stem"], i["kind"], i["w"], i["h"], i["ratio"], "yes" if i["alpha"] else "no", i["slot"]) for i in its] + [""]
L += ["## Three drop-in steps", "", "1. Put finished files in `assets-inbox/stitchwise/` named `<stem>.png` or `.webp` (the stem is in the table).", "2. Run `python3 games-src/scripts/ingest-assets.py` (`--check` for a dry run): it resizes to the slot size and writes `games/stitchwise/media/<stem>.webp`.", "3. Tell the orchestrator: one `build-all.py --deploy stitchwise` lists the new files (no code change).", "",
      "Music: drop `tavern-a.mp3`, `main-a.mp3`, `fight-a.mp3`, `victory-a.mp3`, `defeat-a.mp3` into `games/stitchwise/music/`; the Music picker plays them. Silent until the files exist.", "Register for the owner's laptop list: `python3 games-src/stitchwise/register-assets.py`."]
(D / "ASSETS.md").write_text("\n".join(L) + "\n")
print(len(I), "slots;", {w: sum(1 for i in I if i["wave"] == w) for w in (1, 2, 3)})
# ASSET-CHECK.md: every id the rules, campaign.json and the code use has a stem in assets.json AND a Flow prompt
camp = json.load(open(D / "campaign.json"))
code = "".join(p.read_text() for p in sorted((D / "src").glob("*.js")))
used_in_code = sorted(set(re.findall(r"(?:artBg|artHas|artImg|artUrl)\([^)]*?'([a-z0-9-]+)'", code)))
req = collections.OrderedDict()
for i, (n, sh, c, t, inc) in enumerate(PATCH_DEF): req["fabric-%02d" % (i + 1)] = "patch: " + n
for k, v in camp["cast"].items(): req["portrait-" + k] = "character: " + v["name"]
for k, why in [("bg-title", "title screen"), ("bg-table", "board background"), ("quilt-frame", "9x9 quilt board"), ("track-frame", "time track board"), ("token-me", "your time token"), ("token-opp", "opponent time token"),
               ("icon-button", "button currency"), ("icon-hourglass", "time cost"), ("patch-leather", "leather patch (5 on the track)"), ("bonus-tile", "7x7 bonus tile"), ("torn-square", "story twist: torn squares"),
               ("bg-map", "story map"), ("result-win", "win result"), ("result-lose", "loss result"), ("fx-sparkle", "income moment"), ("fx-stitch", "sewing flourish"), ("icon-bonus", "bonus icon"), ("icon-leather", "leather space"), ("ui-offer-card", "offer card")]: req[k] = why
inj = {i["stem"] for i in I}; prompted = set()
for f in out.glob("prompts-*.json"): prompted |= set(json.load(open(f))["cards"])
gaps = [k for k in req if k not in inj or k not in prompted]; code_gaps = [s for s in used_in_code if s not in inj]
boss = [c["opponent"]["cast"] for c in camp["chapters"] if c["boss"]]
M = ["# Stitchwise: ASSET-CHECK", "", "Every distinct card/tile/piece/character/boss/board/background/icon id that the rules, campaign.json and the code use, and whether it has a stem in `assets.json` and a Flow prompt (`games-src/next-wave/flow-2d/stitchwise/`).", "",
     "**required %d / prompted %d / gaps %d**" % (len(req), len([k for k in req if k in prompted]), len(gaps)), "",
     "- patches: %d (rules) -> fabric-01..fabric-33" % len(PATCH_DEF), "- characters in campaign.json: %d (%d bosses: %s)" % (len(camp["cast"]), len(boss), ", ".join(boss)), "- boards: quilt-frame, track-frame; backgrounds: bg-title, bg-table, bg-map, result-win, result-lose",
     "- stems the code asks for (artHas/artBg/artImg/artUrl): %s; not in assets.json: %s" % (", ".join(used_in_code) or "(patch fabrics and portraits are built from ids)", code_gaps or "none"), "- assets.json has %d slots (extras beyond the required list: %s)" % (len(inj), sorted(inj - set(req)) or "none"), "",
     "| id | what | in assets.json | Flow prompt | wave |", "|---|---|---|---|---|"]
byst = {i["stem"]: i for i in I}
for k, why in req.items(): M.append("| %s | %s | %s | %s | %s |" % (k, why, "yes" if k in inj else "NO", "yes" if k in prompted else "NO", byst[k]["wave"] if k in byst else "-"))
M += ["", "Wired (a dropped file shows with no code change): bg-title, bg-table, quilt-frame, track-frame, token-me, token-opp, icon-button, icon-hourglass, patch-leather, torn-square, result-win, result-lose, every fabric-NN (patch tiles, offers, reference) and every portrait-* (Story map/intro/boss card).", "Slot named and prompted but nothing draws it yet (wave 3 polish, needs a small wiring pass): bonus-tile, bg-map, fx-sparkle, fx-stitch, icon-bonus, icon-leather, ui-offer-card.", "", "Music cues: `games-src/next-wave/music/stitchwise/cues-wave1.json` lists a cue for each gx-music slot: " + ", ".join(s["slot"] for s in json.load(open(mu / "cues-wave1.json"))["slots"]) + "."]
(D / "ASSET-CHECK.md").write_text("\n".join(M) + "\n"); print("ASSET-CHECK required", len(req), "prompted", len([k for k in req if k in prompted]), "gaps", len(gaps), gaps, code_gaps)
