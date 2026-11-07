#!/usr/bin/env python3
"""Writes campaign.json (Story: A Naturalist's Year). python3 games-src/perch-and-plume/gen-campaign.py"""
import json, pathlib
D = pathlib.Path(__file__).resolve().parent
cast = {
 "ottilie": {"name": "Aunt Ottilie", "portrait": "portrait-ottilie.webp", "emoji": "🧓", "color": "#4f7a45"},
 "pip": {"name": "Pip", "portrait": "portrait-pip.webp", "emoji": "🔭", "color": "#c9a443"},
 "mags": {"name": "Mags", "portrait": "portrait-mags.webp", "emoji": "👒", "color": "#b8423a"},
 "tobias": {"name": "Tobias", "portrait": "portrait-tobias.webp", "emoji": "📷", "color": "#3f8193"},
 "corvin": {"name": "Corvin Ashdown", "portrait": "portrait-corvin.webp", "emoji": "🐦‍⬛", "color": "#2a2a33"},
 "delphine": {"name": "Delphine Reedly", "portrait": "portrait-delphine.webp", "emoji": "🎣", "color": "#2f6f8f"},
 "barnaby": {"name": "Lord Barnaby Quill", "portrait": "portrait-barnaby.webp", "emoji": "🧐", "color": "#7a5a32"}}
def opp(c, lvl, pers, taunt=None, praise=None, style="standard"):
    o = {"name": cast[c]["name"], "portrait": cast[c]["portrait"], "emoji": cast[c]["emoji"], "cast": c, "personality": pers, "aiLevel": lvl, "aiStyle": style}
    if taunt: o["taunt"] = taunt; o["praise"] = praise
    return o
def stars(a, b):
    return [{"text": "Meet the goal", "test": {"k": "won"}}, a, b]
CH = [
 dict(id="c1", act=1, title="First Feathers", boss=False,
      intro=[["ottilie", "Spring in the Larchwood! Your field notebook is empty. Let's fill it."], ["ottilie", "Use a row each turn, play birds, and let their powers work for you."], ["pip", "I'm Pip! I'll keep you company. I'm still learning too."]],
      outro=[["ottilie", "Thirty points in your first year. The larches approve."]],
      opponent=opp("pip", "easy", "Cheerful. Plays whatever he holds."), setup={"players": 2}, twist=None,
      goal={"type": "score", "value": 30, "winNotNeeded": True, "text": "Score 30 points or more (winning not needed)."},
      stars=stars({"text": "Score 45 or more", "test": {"k": "score", "op": ">=", "v": 45}}, {"text": "Win the year", "test": {"k": "won"}})),
 dict(id="c2", act=1, title="A Busy Forest", boss=False,
      intro=[["ottilie", "A full forest feeds the whole notebook. More birds there means more food."], ["pip", "I'll race you to the birdfeeder!"]],
      outro=[["ottilie", "Listen to that canopy chatter. Your engine is growing."]],
      opponent=opp("pip", "easy", "Cheerful. Grabs the dice he likes."), setup={"players": 2}, twist=None,
      goal={"type": "custom", "k": "forest", "value": 3, "winNotNeeded": True, "text": "End with 3 or more birds in your forest."},
      stars=stars({"text": "Score 45 or more", "test": {"k": "score", "op": ">=", "v": 45}}, {"text": "Win the year", "test": {"k": "won"}})),
 dict(id="c3", act=1, title="Corvin's Egg Hoard", boss=True,
      intro=[["ottilie", "Corvin Ashdown collects eggs the way a magpie collects spoons."], ["corvin", "Four eggs in my basket before you even begin. Do try to keep up."]],
      outro=[["ottilie", "You beat Corvin at his own game. The marsh is calling us next."]],
      opponent=opp("corvin", "easy", "Sly and greedy. Lays eggs every chance he gets.", "My basket overflows, as always.", "Hmph. Your nests were fuller than mine."),
      setup={"players": 2}, twist={"id": "boss-eggs", "param": 4, "text": "Boss rule: Corvin starts 4 points ahead."},
      goal={"type": "win", "value": None, "text": "Win the year."},
      stars=stars({"text": "Lay 12 or more eggs", "test": {"k": "eggs", "op": ">=", "v": 12}}, {"text": "Win by 10 or more", "test": {"k": "margin", "op": ">=", "v": 10}})),
 dict(id="c4", act=2, title="Reed Beds", boss=False,
      intro=[["ottilie", "Summer on the Saltmarsh. Fish, reeds and long evenings."], ["mags", "Thirty years of sorting post taught me patience, dear. And counting."]],
      outro=[["mags", "Well delivered! You'd have made a fine postmistress."]],
      opponent=opp("mags", "normal", "Patient and tidy. Chases the round goals."), setup={"players": 2}, twist=None,
      goal={"type": "win", "value": None, "text": "Win the year."}, stars=stars({"text": "Score 55 or more", "test": {"k": "score", "op": ">=", "v": 55}}, {"text": "Earn 10+ goal points", "test": {"k": "goals", "op": ">=", "v": 10}})),
 dict(id="c5", act=2, title="Three at the Shore", boss=False,
      intro=[["ottilie", "The shore is crowded today. Two rivals, one birdfeeder."], ["tobias", "Mind if I join? I only want photos. Mostly."]],
      outro=[["tobias", "Got a great shot of you winning. Framing it."]],
      opponent=opp("mags", "normal", "Patient and tidy."), setup={"players": 3, "extra": [{"name": "Tobias", "face": "tobias", "lvl": "normal"}]}, twist=None,
      goal={"type": "win", "value": None, "text": "Win against both rivals."}, stars=stars({"text": "Score 55 or more", "test": {"k": "score", "op": ">=", "v": 55}}, {"text": "Win by 5 or more", "test": {"k": "margin", "op": ">=", "v": 5}})),
 dict(id="c6", act=2, title="A Lean Season", boss=False,
      intro=[["ottilie", "A storm spoiled our stores. You start with less food this time."], ["tobias", "Bad light, bad luck. Let's see what you can do."]],
      outro=[["ottilie", "Even a lean season can sing if you plan it well."]],
      opponent=opp("tobias", "normal", "Calm. Collects big birds slowly."), setup={"players": 2}, twist={"id": "lean-start", "param": 2, "text": "Twist: you start with 2 fewer food."},
      goal={"type": "win", "value": None, "text": "Win the year."}, stars=stars({"text": "Score 50 or more", "test": {"k": "score", "op": ">=", "v": 50}}, {"text": "Play 10 or more birds", "test": {"k": "birds", "op": ">=", "v": 10}})),
 dict(id="c7", act=2, title="Delphine's Fish Run", boss=True,
      intro=[["ottilie", "Delphine Reedly runs the marsh like a fishing fleet."], ["delphine", "My forest already has a feeder bird working. You'll need more than luck."]],
      outro=[["delphine", "The tide turned. Fair winds, naturalist."], ["ottilie", "Autumn now. The high meadows, and Lord Quill's collection."]],
      opponent=opp("delphine", "normal", "Efficient. Builds a food engine early.", "The marsh rewards the prepared.", "You out-fished me. Well done."),
      setup={"players": 2}, twist={"id": "boss-bird", "param": 1, "text": "Boss rule: Delphine starts with a feeder bird in her forest."},
      goal={"type": "margin", "value": 5, "text": "Win by 5 points or more."}, stars=stars({"text": "Score 60 or more", "test": {"k": "score", "op": ">=", "v": 60}}, {"text": "Win by 15 or more", "test": {"k": "margin", "op": ">=", "v": 15}})),
 dict(id="c8", act=3, title="Wind on the Heath", boss=False,
      intro=[["ottilie", "Autumn on the High Meadows. The rivals play their best now."], ["corvin", "I've learned a few tricks since spring. Have you?"]],
      outro=[["corvin", "Again? Fine. But Lord Quill won't be so kind."]],
      opponent=opp("corvin", "hard", "Sly. Plans every egg."), setup={"players": 2}, twist=None,
      goal={"type": "win", "value": None, "text": "Win the year."}, stars=stars({"text": "Score 60 or more", "test": {"k": "score", "op": ">=", "v": 60}}, {"text": "Win by 10 or more", "test": {"k": "margin", "op": ">=", "v": 10}})),
 dict(id="c9", act=3, title="The Rival Flock", boss=False,
      intro=[["ottilie", "No people today: just the Rival Flock, wild birds that take dice and race you for goals."], ["ottilie", "Beat their count over the whole year."]],
      outro=[["ottilie", "Even the wild flock bowed to your notebook."]],
      opponent=opp("tobias", "hard", "The wild flock: steady, takes dice, lays eggs."), setup={"players": 2, "solo": True}, twist=None,
      goal={"type": "win", "value": None, "text": "Beat the Rival Flock."}, stars=stars({"text": "Score 60 or more", "test": {"k": "score", "op": ">=", "v": 60}}, {"text": "Win by 10 or more", "test": {"k": "margin", "op": ">=", "v": 10}})),
 dict(id="c10", act=3, title="The Quill Collection", boss=True,
      intro=[["ottilie", "Lord Barnaby Quill has won the County Notebook nine years running."], ["barnaby", "Three extra birds in hand, a seat at my table, and Mags keeping score. Charming."], ["mags", "I'm only here for the cake, dear."]],
      outro=[["barnaby", "Extraordinary. The County Notebook is yours."], ["ottilie", "A full year, three regions, one remarkable naturalist. I'm so proud."]],
      opponent=opp("barnaby", "hard", "Grand and exacting. Hunts bonus cards.", "Nine years and counting, young one.", "Ten years was greedy. Well earned."),
      setup={"players": 3, "extra": [{"name": "Mags", "face": "mags", "lvl": "hard"}]}, twist={"id": "boss-cards", "param": 3, "text": "Boss rule: Lord Quill starts with 3 extra birds in hand."},
      goal={"type": "win", "value": None, "text": "Win the County Notebook."}, stars=stars({"text": "Score 65 or more", "test": {"k": "score", "op": ">=", "v": 65}}, {"text": "Win by 10 or more", "test": {"k": "margin", "op": ">=", "v": 10}})),
]
chapters = []
for c in CH:
    d = dict(c); d["intro"] = [{"who": w, "text": t} for w, t in c["intro"]]; d["outro"] = [{"who": w, "text": t} for w, t in c["outro"]]
    d["hints"] = c["act"] == 1
    lv = c["opponent"]["aiLevel"]; down = {"hard": "normal", "normal": "easy", "easy": "easy"}[lv]
    d["easier"] = {"aiLevel": down, "twist": None, "setup": {}, "maxStars": 2, "text": "The rivals play more gently" + (" and the boss rule is off." if c["twist"] else ".")}
    d["unlock"] = [{"type": "portrait", "id": c["opponent"]["cast"], "text": c["opponent"]["name"] + "'s portrait"}] if c["boss"] else []
    if c["id"] == "c3": d["unlock"].append({"type": "act", "id": "2", "text": "Act 2: Summer on the Saltmarsh"})
    if c["id"] == "c7": d["unlock"].append({"type": "act", "id": "3", "text": "Act 3: Autumn on the High Meadows"})
    chapters.append(d)
camp = {"game": "perch-and-plume", "title": "A Naturalist's Year", "version": 1, "cast": cast,
        "acts": [{"act": 1, "title": "Spring in the Larchwood", "blurb": "Learn the rows and start your engine."},
                 {"act": 2, "title": "Summer on the Saltmarsh", "blurb": "Sharper rivals and round goals that matter."},
                 {"act": 3, "title": "Autumn on the High Meadows", "blurb": "The best collectors, playing their best."}],
        "twists": [{"id": "boss-eggs", "where": "setup", "how": "the boss starts param points ahead"},
                   {"id": "boss-bird", "where": "setup", "how": "the boss starts with a feeder bird in the forest"},
                   {"id": "boss-cards", "where": "setup", "how": "the boss starts with param extra birds in hand"},
                   {"id": "boss-food", "where": "setup", "how": "the boss starts with param extra food"},
                   {"id": "lean-start", "where": "setup", "how": "you start with param fewer food"}],
        "chapters": chapters}
(D / "campaign.json").write_text(json.dumps(camp, indent=1, ensure_ascii=False) + "\n")
print("chapters", len(chapters))
