import json
SOURCES = {
 "S1": "github.com/otac0n/GameTheory  GameTheory.Games.FiveTribes (full C# rules engine, MIT; uses 1st-printing 'Slave' naming; includes Dhenim option)",
 "S2": "github.com/sarahduv/FiveTribes  Assets/Scripts (Unity C# implementation; card text transcribed in Djinn.cs; tile list 'sorted like the image in the manual')",
 "S3": "github.com/spiffycoffee/fivetribes-ai  config.py/tabletop.py/scoring.py (Python AI)",
 "S4": "github.com/F0oocuS/five-tribes  src/assets/stubs/core/*.stub.ts (Ukrainian-edition card text stubs)",
 "S5": "github.com/kavispires/fivetribes  src/constants.js, src/reducers/scorer.js (scorer incl. Artisans/Whims/Thieves)",
 "S6": "github.com/RhialtoTheMarvellous/five-tribes  tiles.js (setup randomizer incl. Artisans/Whims tiles and layouts)",
 "S7": "github.com/mikecowan/GamesGuides  Views/Games/F/FiveTribesGuide.cshtml (fan quick reference incl. all expansions)",
 "S8": "github.com/andyMattick/citiesScoringApp  src/games/five-tribes/domain/{data,scoring}.ts (djinn VP table; names OCR-garbled)",
 "S9": "github.com/eidolonFIRE/Five_Tribes_Calculator  fiveTribes_sim.py",
 "S10": "github.com/leroy9472/MeepleLM  data/rulebooks/part_1/1/157354.md (LLM-generated rules digest; LOW reliability, used only as corroboration)",
 "S11": "BGG XML/JSON metadata cached in GitHub repos (gdapkus/gd-game-lib gameCache/{157354,176677,226828}.json; userid122002/sgoyt game_data/157354.json) - publisher descriptions + official expansion list",
 "W1": "Web-search snippets of retailer/publisher component lists (daysofwonder.com product pages, pandemoniumbooks, meeplegalaxy, miniaturemarket dow8401, chaoscards, tlamagames)",
 "W2": "Web-search snippets of ultraboardgames.com official-rules pages (game-rules.php, the-artisans-of-naqala.php, whims-of-the-sultan.php) and cdn.svc.asmodee.net 8402-FTAN-Rules-EN.pdf snippet",
 "W3": "Web-search snippets of reviews: BGG thread 1387371 'When Five Becomes Six', Zatu Artisans review, Miniature Market review, trictrac, BGG thread 1498113 'Revised Djinns Boaz and Kandicha'",
 "W4": "Web-search snippets for promos: BGG 167309 Dhenim, worthpoint/boardgamegeekstore 'Fakirs & Dhenim', BGG 176234 Wilwit / gameosity, BGG 220551 Galbells / coolstuffinc",
 "W5": "Web-search snippets for Thieves of Naqala (BGG 199310 description, TLAMA, Zatu)",
 "W6": "Web-search snippets re Slaves->Fakirs (BGG thread 1225866, happycardgame, vice, solitaire-masters)",
 "W7": "Web-search snippets of base rules (rulespal/1j1ju rulebook, geekyhobbies) re Fakir use, merchandise sale, end game, ties, double tile control",
}
tiles = [
 {"type":"village","colour":"blue","value":5,"count":5,"action":"place 1 palace (mandatory)","src":["S1","S2","S4","S5","S6"]},
 {"type":"sacred_place","colour":"blue","value":6,"count":4,"action":"optional: pay 2 Elders or 1 Elder+1 Fakir, take 1 of the 3 face-up Djinns","src":["S1","S2","S4","S5","S6"]},
 {"type":"sacred_place","colour":"blue","value":10,"count":1,"action":"as sacred place","src":["S1","S2","S4","S5","S6"]},
 {"type":"sacred_place","colour":"blue","value":12,"count":1,"action":"as sacred place","src":["S1","S2","S4","S5","S6"]},
 {"type":"sacred_place","colour":"blue","value":15,"count":1,"action":"as sacred place","src":["S1","S2","S4","S5","S6"]},
 {"type":"oasis","colour":"red","value":8,"count":6,"action":"place 1 palm tree (mandatory)","src":["S1","S2","S4","S5","S6"]},
 {"type":"small_market","colour":"red","value":6,"count":8,"action":"optional: pay 3 GC, take 1 of the first 3 face-up resource cards","src":["S1","S2","S4","S5","S6"]},
 {"type":"large_market","colour":"red","value":4,"count":4,"action":"optional: pay 6 GC, take 2 of the first 6 face-up resource cards","src":["S1","S2","S4","S5","S6"]},
]
assert sum(t["count"] for t in tiles)==30
meeples = {
 "vizier":{"colour":"yellow","count":16,"kept":True,"src":["S1","S2","S3","S9","W1"]},
 "elder":{"colour":"white","count":20,"kept":True,"src":["S1","S2","S3","S9","W1"]},
 "merchant":{"colour":"green","count":18,"kept":False,"src":["S1","S2","S3","S9","W1"]},
 "builder":{"colour":"blue","count":18,"kept":False,"src":["S1","S2","S3","S9","W1"]},
 "assassin":{"colour":"red","count":18,"kept":False,"src":["S1","S2","S3","S9","W1"]},
 "total":90,
}
resources = [
 {"kind":"ivory","count":2,"src":["S1","S2","S3"]},
 {"kind":"jewels","count":2,"src":["S1","S2","S3"]},
 {"kind":"gold","count":2,"src":["S1","S2","S3"]},
 {"kind":"papyrus","count":4,"src":["S1","S2","S3"]},
 {"kind":"silk","count":4,"src":["S1","S2","S3"]},
 {"kind":"spice","count":4,"src":["S1","S2","S3"]},
 {"kind":"fish","count":6,"src":["S1","S2","S3"]},
 {"kind":"wheat","count":6,"src":["S1","S2","S3"]},
 {"kind":"pottery","count":6,"src":["S1","S2","S3"]},
 {"kind":"fakir","count":18,"note":"named 'Slave' in 1st printing; identical function","src":["S1","S2","S3","W6"]},
]
assert sum(r["count"] for r in resources)==54
E="1 Elder or 1 Fakir"; EE="1 Elder + (1 Elder or 1 Fakir)"
def d(ref,vp,cost,kind,effect,src,exp="base",**kw):
    r={"ref":ref,"vp":vp,"activation_cost":cost,"kind":kind,"effect":effect,"exp":exp,"src":src}; r.update(kw); return r
B3=["S1","S2","S4"]; B4=["S1","S2","S4","S8"]
djinns = [
 d("Al-Amin",5,None,"endgame","At final scoring, every 2 Fakir cards you hold count as 1 wild merchandise card of any type you choose.",B4+["S3"]),
 d("Anun-Nak",8,E,"activated","Pick an empty tile (no camel, meeple, palm tree or palace) and put 3 meeples drawn at random from the bag on it.",B4),
 d("Ba'al",6,None,"passive","Whenever anyone acquires a Djinn you gain coins: 1 if you took it, 2 if an opponent did.",B4),
 d("Boaz",6,None,"passive","Assassins cannot kill the Elders and Viziers you have in front of you. (Artisans revised card also protects your Artisans.)",B4,revised_in="artisans"),
 d("Bouraq",6,E,"activated","Put 1 palace on any Village tile.",B4),
 d("Echidna",4,EE,"activated","This turn, your Builders earn double coins.",B4),
 d("Enki",8,E,"activated","Put 1 palm tree on any Oasis tile.",B4),
 d("Hagis",10,E,"activated_modifier","When you would place a palace this turn, you may put it on a tile adjacent to the intended tile instead.",B4),
 d("Haurvatat",8,None,"endgame","Each palm tree on your tiles scores 5 instead of 3.",B4),
 d("Iblis",8,E,"activated_modifier","This turn your Assassins kill 2 meeples on the same tile, or 2 Elders/Viziers (any mix) from the same opponent.",B4,aliases=["Ibus (S1)","Jbus (S8)"]),
 d("Jafaar",6,None,"endgame","Each Vizier you hold scores 3 instead of 1 (the per-opponent majority bonus is unchanged).",B4),
 d("Kandicha",6,None,"passive","When your Assassins kill: a Merchant -> draw the top resource card of the draw pile; a Builder -> gain the coins that Builder would have earned; an Elder/Vizier -> keep it in front of you instead of removing it. (Artisans revised card: killing an Artisan -> keep it and also take a random item.)",B4,revised_in="artisans"),
 d("Kumarbi",6,"1 or more Fakirs","activated","When bidding for turn order, each Fakir you discard lets you take a spot while paying the price of the spot 1 step cheaper (N Fakirs = N steps).",B4),
 d("Lamia",10,E,"activated_modifier","When you would place a palm tree this turn, you may put it on a tile adjacent to the intended tile instead.",B4),
 d("Leta",4,EE,"activated","Take control of 1 empty tile (no camel, meeple, palm tree or palace) with one of your camels.",B4),
 d("Marid",6,None,"passive","Whenever a meeple is dropped on a tile you control during a move, gain coins: 1 if the move is yours, 2 if an opponent's.",B3+["S8"]),
 d("Monkir",6,None,"passive","Whenever a palace is placed, gain coins: 1 if you placed it, 2 if an opponent did.",["S1","S2","S8"],conflict="S4 lists 5 VP; S3 VP distribution (4x4,1x5,10x6,5x8,2x10) only fits Monkir=6"),
 d("Nekir",6,None,"passive","Whenever Assassins kill, gain coins: 1 if they were your Assassins, 2 if an opponent's.",B4),
 d("Shamhat",6,None,"endgame","Each Elder you hold scores 4 instead of 2.",B4),
 d("Sibittis",4,EE,"activated","Look at the top 3 cards of the Djinn draw pile, keep 1, discard the other 2.",B4),
 d("Sloar",8,"1 Fakir","activated","Take the top card of the resource draw pile.",B4,aliases=["Sidar (S8, garbled)"]),
 d("Utug",4,EE,"activated","Take control, with one of your camels, of a tile that has only meeples on it (no camel, palm tree or palace).",B4),
 # promos
 d("Dhenim",6,None,"passive","Whenever anyone acquires Viziers you gain coins: 1 if you took them, 2 if an opponent did.",["S1","W4","S11"],exp="promo:dhenim",note="S1 pays per Vizier; W4 wording 'when takes one or more viziers' suggests once per acquisition - see disputed"),
 d("Wilwit",None,None,"endgame","At game end, +5 VP for every Djinn you own (including this one).",["W4","S11"],exp="promo:wilwit",note="printed VP not found"),
 d("Galbells",0,None,"passive","Whenever another player ends their move on a market tile, you take the top card of the resource draw pile.",["W4","S11"],exp="promo:galbells",note="0 VP from a single snippet only"),
 # artisans
 d("Geb",None,None,"endgame","Each Precious Item you own scores +3 VP.",["S5","W3"],exp="artisans",note="printed VP not found"),
 d("Ptah",None,None,"endgame","Each Artisan you hold scores +2 VP.",["S5","W3"],exp="artisans",note="printed VP not found"),
]
base_vps=sorted(x["vp"] for x in djinns if x["exp"]=="base")
assert len(base_vps)==22 and base_vps==sorted([4]*4+[5]+[6]*10+[8]*5+[10]*2), base_vps
data = {
 "sources": SOURCES,
 "board":{"cols":6,"rows":5,"meeples_per_tile":3,"src":["S1","S2","S3","S10"]},
 "tiles": tiles,
 "meeples": meeples,
 "resources": resources,
 "resource_row_face_up":{"value":9,"src":["S1","S2","S10"]},
 "djinn_row_face_up":{"value":3,"src":["S1","S2","S10"]},
 "djinns": djinns,
 "djinn_purchase_cost":{"value":"2 Elders, or 1 Elder + 1 Fakir (returned to bag / discarded)","src":["S1","S10"]},
 "components_base":{
   "tiles":30,"meeples":90,"djinn_cards":22,"resource_cards":54,"palm_trees":12,"palaces":10,
   "gold_coins":{"total":96,"denominations":"48 x '5' and 48 x '1' (per W1 single snippet)","note":"unverified second source"},
   "player_sets":"2 sets of 11 camels + 2 turn markers, 2 sets of 8 camels + 1 turn marker (W1); in 3-4p use 8 camels each",
   "starting_coins_per_player":{"value":50,"src":["S2","S3","S10"]},
   "tracks":["bid order track","turn order track"],
   "src":["W1","S11"]},
 "camels":{"2p":11,"3p":8,"4p":8,"5p_whims":8,"src":["S1","S2","S10","W1"]},
 "turn_markers":{"2p":2,"3p+":1,"src":["S2","S10","W1"]},
 "bidding":{"turn_order_track_costs":[0,0,0,1,3,5,8,12,18],
   "zero_spaces_rule":"up to 3 players may bid 0; a later 0-bidder takes the front 0 spot, pushing earlier 0-bidders back (plays after)",
   "play_order":"highest-cost occupied spot plays first ... last 0-spot last",
   "five_player_track":"Whims track has two spots each for 1, 3 and 5 GC that work like the 0 spots (full cost list not verified)",
   "src":["S1","S2","W2"]},
 "scoring":{
   "coins":"1 VP per GC",
   "vizier_each":1,"vizier_majority_bonus":"10 VP for each opponent with strictly fewer Viziers",
   "elder_each":2,"palm_tree_each":3,"palace_each":5,
   "tile":"printed tile value for each tile you control",
   "djinn":"printed VP",
   "merchandise_suit_values":[1,3,7,13,21,30,40,50,60],
   "merchandise_note":"index n-1 = value of a suit of n DIFFERENT merchandise cards (max 9). Split cards into suits; Fakirs never count. Same table is used for the optional sale for GC at the end of each turn.",
   "tie":"no tiebreaker; tied players share the victory",
   "src":{"table":["S1","S2","S3","S5","S8","S9","S10"],"vizier_bonus":["S1","S2","S5","S8","S10"],"others":["S1","S2","S3","S8"],"tie":["W7","S10"]}},
 "expansions":{
  "artisans":{
   "bgg_id":176677,"year":2015,
   "components":{"tiles":6,"workshop_tiles":3,"specialized_market_tiles":2,"chasm_tiles":1,"purple_artisans":15,"tents":4,"item_markers":18,"mountains":6,"djinn_cards":4,"new_djinns":["Geb","Ptah"],"revised_djinns":["Boaz","Kandicha"],"scoring_pad":1,"summary_sheets":4,"src":["W1","W2","S6","S7"]},
   "tiles":[
     {"type":"workshop","colour":"blue","value":5,"count":3,"action":"optional: pay 1 Artisan or 2 Fakirs, take the top item of the item pile","mountains":"2 mountains on 2 of its sides","src":["S5","S6","S7","W2"]},
     {"type":"specialized_market","colour":"red","value":10,"count":2,"action":"optional: pay 4 GC, take any 1 face-up resource card","src":["S5","S6","W2","S10"]},
     {"type":"chasm","colour":None,"value":None,"count":1,"action":"impassable; never holds meeples","src":["S6","S7","S10"]}],
   "board":"6x6: the 6 new tiles + 10 random base tiles form the central 4x4, remaining 20 base tiles the border",
   "board_src":["S6","S7"],
   "artisan_tribe_action":"keep the Artisans; draw as many items as Artisans taken, keep 1 face-down, discard the rest face up",
   "artisan_scoring":"2 VP each, or 3 VP each if no player has more Artisans than you",
   "artisan_src":["W3","S10","S7"],
   "tent":"once per game, when you take control of a tile you may place your tent instead of a camel; tent scores tile value + 1 VP per red-valued tile in the 3x3 around it incl. its own",
   "tent_src":["W2","S5","S10"],
   "mountains":"block meeple movement between the two tiles; ignored for Assassin range and Builder/tent adjacency; Flying Carpet ignores them",
   "mountains_src":["S7","S10","W3"],
   "items":{
     "total":18,
     "precious":[{"ref":"jewelry (name approx.)","vp":5},{"ref":"treasure (name approx.)","vp":7},{"ref":"crown (name approx.)","vp":9}],
     "precious_src":["S5"],
     "precious_counts":"UNKNOWN",
     "magic":[
       {"ref":"Flying Carpet","effect":"drop the last meeple of your move on any tile of your choice; ignores mountains"},
       {"ref":"Fabulous Lamp","effect":"take an extra Djinn (exact condition unverified)"},
       {"ref":"Enchanted Flute","effect":"move up to 5 meeples from adjacent tiles onto a chosen tile (details unverified)"},
       {"ref":"Burning Scimitar","effect":"kill 2 meeples; if a tile is emptied you take control of it"},
       {"ref":"Tempest Talisman","effect":"move one camel to an empty tile"},
       {"ref":"Horn of Plenty","effect":"draw 9 new resource cards and arrange them in any order (details unverified)"}],
     "magic_src":["W3"],
     "magic_counts":"UNKNOWN",
     "use":"magic items: any time on your turn incl. the turn gained, max 1 item per turn, then discarded; precious items: scored at end, no effect",
     "use_src":["S7","S10","W2"]},
   "revised_djinns":{"Boaz":"also protects Artisans","Kandicha":"killing an Artisan: keep it and take a random item","src":["W3"]}},
  "sultan":{
   "bgg_id":226828,"year":2017,
   "components":{"tiles":6,"fabulous_cities":5,"great_lake":1,"meeples":15,"meeple_mix":"3 of each base colour (no purple)","camels_5th_player":8,"tent":1,"turn_marker":1,"whim_cards":22,"djinn_cards":2,"tracks":"1 bid order track + 1 turn order track for 5 players","gold_coins_value5":42,"scoring_pad":1,"summary_sheet":1,"src":["W1","S7"]},
   "tiles":[
     {"type":"fabulous_city","value":"5+","count":5,"colour_split":{"blue":3,"red":2},"action":"take the Whim card lying on it (if any) into your hand","src":["S5","S6","S7"]},
     {"type":"great_lake","value":None,"count":1,"action":"impassable, never holds meeples; each palm tree/palace on an orthogonally or diagonally adjacent tile scores double (6 / 10)","src":["S6","S7","W2","S10","S5"]}],
   "fabulous_city_scoring":{"cities_controlled":[1,2,3,4,5],"vp":[5,20,45,80,125],"src":["S5","S7","S10"]},
   "board":"base+Whims 6x6 (36 tiles); base+Artisans+Whims 6x7 (inner 4x5 = 6 Artisans tiles + 14 random base/Whims tiles)","board_src":["S6","S7"],
   "setup":"shuffle Whim cards (some removed - which ones unverified), deal 1 face-up on each Fabulous City; refill empty cities at clean-up",
   "setup_src":["W2","S7","S10"],
   "whim_cards":"UNKNOWN (22 cards; effects/fulfilment rules not recovered)",
   "djinns":"UNKNOWN (2 cards; names/effects not recovered)"},
  "thieves":{
   "bgg_id":199310,"year":2016,
   "components":{"thief_cards":6,"djinn_cards":1,"src":["W5","S7"]},
   "rules":"reveal 1 random thief at setup; at a Sacred Place you may buy the thief instead of a Djinn for the same cost; a thief is tied to a tribe colour - when you do that tribe's action you may activate+discard it: every opponent discards the listed thing, then you claim one of the discarded things; cannot acquire and use a thief on the same turn; effects that refer to Djinns do not apply to thieves; refill the thief at clean-up. The djinn makes its owner immune to thieves.",
   "rules_src":["W5","S7"],
   "thieves":[
     {"colour":"red","opponents_discard":"1 camel from a tile (tile control lost)","you_claim":"1 of those tiles, using one of your camels"},
     {"colour":"blue","opponents_discard":"1 palm tree or palace","you_claim":"1 palm tree or palace, placed on any tile"},
     {"colour":"green","opponents_discard":"2 resource cards","you_claim":"2 of the discarded resource cards"},
     {"colour":"yellow","opponents_discard":"1 Vizier","you_claim":"1 of the discarded Viziers"},
     {"colour":"white","opponents_discard":"1 Djinn","you_claim":"1 of the discarded Djinns"},
     {"colour":"purple","opponents_discard":"1 precious or magic item","you_claim":"1 of the discarded items"}],
   "thieves_src":["S7"],
   "djinn":"UNKNOWN name/VP; effect: owner is protected from thief effects (W5)",
   "thief_vp":"UNKNOWN (S5 has a 'thieves points' category, suggesting thief cards may carry VP)"},
  "promos":[
   {"ref":"Dhenim","bgg_id":167309,"year":2014,"content":"1 djinn card; also sold as 'Fakirs & Dhenim' pack with replacement Fakir cards for 1st-printing owners","src":["S11","W4","S1"]},
   {"ref":"Wilwit","bgg_id":176234,"year":2015,"content":"1 djinn card (International TableTop Day 2015)","src":["S11","W4"]},
   {"ref":"Galbells","bgg_id":220551,"year":2017,"content":"1 djinn card (Dice Tower 2017 crowdfunding promo)","src":["S11","W4"]}]
 }
}
json.dump(data, open('data.json','w'), indent=1, ensure_ascii=False)
print("ok", len(djinns))
