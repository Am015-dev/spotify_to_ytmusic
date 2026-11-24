#!/usr/bin/env python3
# Generator for cards.json / corps.json. Names, effects and flavor are hand-designed here;
# costs are fitted to the power curve (validate.js --curve) and texts are rendered from the ops.
import json, sys, os
from author_lib import *
TG={'B':'building','S':'space','Sc':'science','Pw':'power','E':'earth','J':'jovian','Pl':'plant','M':'microbe','An':'animal','C':'city'}
cards=[]
def tags(s): return [TG[x] for x in s.split()] if s else []
def add(typ,name,tg,play=None,req=None,vp=None,effect=None,action=None,res=None,flavor=None,text=None,cost=None):
    c={"id":None,"name":name,"type":typ,"cost":0,"tags":tags(tg)}
    if req: c["req"]=req
    c["play"]=play or []
    if effect: c["effect"]=effect
    if action: c["action"]=action
    if res: c["res"]=res
    if vp: c["vp"]=vp
    c["_cost"]=cost; c["_text"]=text; c["flavor"]=flavor
    cards.append(c)
def A(*a,**k): add('auto',*a,**k)
def V(*a,**k): add('active',*a,**k)
def EV(*a,**k): add('event',*a,**k)
VPR=lambda every=1,n=1:{"per":"res","every":every,"n":n}

# ---------------- AUTO: economy ----------------
A("Orbital Pension","E",[P('mc',2)],flavor="Retire early. Retire high.")
A("Dune Bazaar","E",[P('mc',1),G('mc',6)])
A("Telex Exchange","E",[PP('mc',1,'tag:earth',2)],flavor="Prices travel faster than ships.")
A("Cargo Wheel Depot","S",[P('mc',3)])
A("Moonlit Ledger","J E",[P('mc',3)],flavor="Debts accrue in low gravity.")
A("Cinder Dividend","B",[P('mc',1),P('steel',1)])
A("Ration Contract","",[P('mc',2),G('mc',3)])
A("Gantry Lease","S B",[P('mc',2),P('ti',1)])
A("Silver Monsoon Trade","E",[P('mc',4)])
A("Salvage Charter","",[P('mc',1),G('steel',3),G('ti',1)])
A("Quiet Money Company","",[P('mc',5)],flavor="Nobody remembers who signed.")
A("Brass Telegraph","E S",[P('mc',2),DRAW(1)])
A("Almanac Press","Sc E",[PP('mc',1,'tag:science',2)])
A("Harbor Fees","",[P('mc',4)],req=R(cmin=3),flavor="Every tide pays a toll.")
A("Nightshift Stamping","B",[P('mc',2),P('steel',1)])
A("Freight Concession","S",[P('mc',1),P('ti',1)])
A("Estate Sale","",[G('mc',10)])
A("Survey Syndicate","Sc",[P('mc',2),G('mc',5)])
# ---------------- AUTO: steel / titanium ----------------
A("Basalt Hauler","B",[P('steel',1)])
A("Tin Roof Foundry","B",[P('steel',2)])
A("Ore Sled Convoy","B",[P('steel',1),G('steel',3)])
A("Ice-Rail Smelter","B Pw",[P('steel',2),P('energy',-1)],flavor="Runs hot, runs loud.")
A("Cobalt Trawler","S",[P('ti',1)])
A("Hollow Rock Rig","S",[P('ti',2),P('energy',-1)])
A("Tug Fleet Lease","S E",[P('ti',1),P('mc',2)])
A("Pit Wall Crawlers","B",[P('steel',3)])
A("Rimstone Works","B",[P('steel',2),P('mc',1)])
A("Slag Heap Mill","B",[P('steel',1),P('heat',2)])
A("Cargo Pod Foundry","S",[P('ti',3)])
# ---------------- AUTO: plants / energy / heat ----------------
A("Tray Garden Rows","Pl",[P('plant',1)])
A("Hydroponic Spindle","Pl B",[P('plant',2),P('energy',-1)])
A("Mulch Kitchen","Pl",[P('plant',1),G('plant',3)])
A("Greenbelt Nursery","Pl",[P('plant',2)],req=R(omin=3))
A("Sprout Lab","Sc Pl",[P('plant',1),DRAW(1)])
A("Fern Terraces","Pl",[P('plant',3)],req=R(omin=5))
A("Sunmirror Array","Pw",[P('energy',1)])
A("Dish Farm","Pw",[P('energy',2)])
A("Thermal Pile","Pw B",[P('energy',3)])
A("Coil Reactor","Pw Sc",[P('energy',2),P('mc',1)])
A("Vent Stack","B",[P('heat',3)])
A("Ember Cellars","B",[P('heat',2),P('energy',1)])
A("Glasshouse Furnace","B Pl",[P('heat',2),P('plant',1)])
A("Magma Tap","Pw B",[P('heat',3),P('energy',1)],req=R(tmin=-14))
A("Salt Pan Boilers","B",[P('heat',4)])
A("Static Orchard","Pw Pl",[P('energy',1),P('plant',1)])
A("Fusion Kettle","Pw Sc",[P('energy',4)],flavor="Pocket sun, mind the lid.")
# ---------------- AUTO: global raisers ----------------
A("Hot Wire Barrage","S",[TEMP(1),G('heat',3)])
A("Dry Ice Delivery","S",[OC(1)])
A("Slow Comet Harpoon","S",[OC(1),G('plant',2)])
A("Wind Chime Towers","Pw",[OXY(1),P('energy',1)])
A("Cloud Seeding Needles","Sc",[OC(1),P('mc',1)])
A("Thaw Beam","S Pw",[TEMP(2)])
A("Crater Lake Fill","",[OC(2)])
A("Polar Melt Plan","",[TEMP(2),P('heat',1)])
A("Respirator Dunes","Pl",[OXY(2)])
A("Aerial Kelp Sheets","Pl",[OXY(1),P('plant',1)],req=R(tmin=-18))
A("Basin Flood Gates","B",[OC(1),P('steel',1)])
A("Sunken Pump Choir","B Pw",[OC(2),P('energy',-1)],req=R(cmin=2))
A("Mirror Tilt Program","S Sc",[TEMP(2),P('energy',-1)],flavor="One degree, with feeling.")
A("Cold Front Anvil","",[TEMP(1),OC(1)])
A("Spring Line Taps","B",[OC(1),G('steel',2)])
A("Orchard Fog Engine","Pl Pw",[OXY(2),P('energy',-1)])
# ---------------- AUTO: tiles ----------------
A("Hab Ring Ochre-1","B C",[CITY(),P('mc',2),P('energy',-1)])
A("Terrace Settlement","B C",[CITY(),P('mc',2)])
A("Moonshadow Colony","S C",[CITY(),P('ti',1)])
A("Meadow Rooftops","Pl",[GREEN(),G('plant',2)])
A("Reed Bank","Pl",[GREEN(),P('plant',1)],req=R(tmin=-16))
A("Sand Orchard","Pl",[GREEN()])
A("Fault Line Dome","C B",[CITY('volcanic'),P('heat',2)])
A("Isolated Outpost","B",[SPEC('isolated'),P('mc',2)])
A("Lantern Quarter","C",[CITY(),G('mc',6)])
A("Ridge Arboretum","Pl",[GREEN(),P('mc',1)],req=R(omin=4))
A("Spiral Habitat","C S",[CITY(),P('mc',3),P('energy',-1)])
A("Shore Town","C B",[CITY('nextToOwn'),P('mc',2),G('steel',2)])
# ---------------- AUTO: VP / monuments ----------------
A("Heritage Obelisk","B",[],vp=2)
A("Founders' Mural","",[G('mc',4)],vp=2)
A("Beacon Spire","B",[P('mc',1)],vp=3)
A("Plain Song Archive","Sc",[P('mc',1)],vp=2)
A("Peace Garden Plaza","Pl",[],vp=2,req=R(omin=4))
A("Gravity Well Museum","S E",[G('mc',3)],vp=2)
A("Canal Cathedral","B",[],vp=3,req=R(cmin=3))
A("Sunrise Observatory","Sc B",[P('mc',2)],vp=2)
A("Prospect Monument","B E",[G('steel',3)],vp=3)
A("Long Table Hall","C",[P('mc',2)],vp=2)
# ---------------- AUTO: rival pressure ----------------
A("Spiteful Tariffs","E",[RP('mc',2)])
A("Cut Cable Prank","S",[RP('energy',1),RP('mc',1)])
A("Smoke Fuse Raid","S",[RP('steel',2)])
A("Ore Pirates","S J",[RP('ti',1),G('ti',2)])
A("Frost Sabotage","",[RP('plant',1),RP('heat',2)])
A("Contract Buyout","E",[RP('mc',3),L('mc',3)])
# ---------------- AUTO: science / draw ----------------
A("Pocket Almanac","Sc",[DRAW(2)])
A("Deep Field Survey","Sc S",[DRAW(1),G('mc',4)])
A("Notebook Exchange","Sc E",[DRAW(1,'science')],flavor="Margins full of sums.")
A("Core Sample Vault","Sc B",[DRAW(2),P('steel',1)])
A("Analog Computer Bank","Sc",[P('mc',1),DRAW(2)])
A("Light-Speed Mail","Sc S",[G('mc',8)])
A("Orrery Wheel","Sc",[P('mc',2),DRAW(1)])
A("Library Moon","Sc J",[DRAW(2),P('mc',1)],req=R(tags={'science':2}))
A("Dust Spectrograph","Sc",[P('mc',3)],req=R(tags={'science':3}))
A("Probe Relay Chain","Sc S",[P('ti',2),P('mc',1)],req=R(tags={'science':2}))
A("Signal Decoder","Sc",[DRAW(3)],req=R(tags={'science':2}))
# ---------------- AUTO: jovian / power / tag-scaling ----------------
A("Cloud City Spindle","J C",[CITY('offmap:cloud'),P('mc',2)],vp=1,flavor="Postcards from 40 km up.")
A("Jove-class Harvester","J S",[P('ti',1),P('mc',2)])
A("Storm Skimmer","J S",[P('energy',3)])
A("Ringside Habitat","J",[P('mc',3)],vp=1)
A("Gas Bag Fleet","J S",[PP('mc',1,'tag:jovian',1)],flavor="Each hull a little moon.")
A("Moon Dock Tolls","J",[G('mc',2),PP('mc',1,'tag:space',3)])
A("Magnetosphere Choir","J Pw",[P('energy',2)],vp=2)
A("Radiant Convoy","Pw S",[PP('mc',1,'tag:power',2)])
A("Substation Network","Pw",[PP('energy',1,'tag:building',3)])
A("Grid Cathedral","Pw",[PP('mc',1,'tag:power',1)],req=R(tags={'power':2}))
# ---------------- AUTO: life w/ VP ----------------
A("Lichen Carpet Works","Pl M",[P('plant',1)],vp=1,req=R(tmin=-18),flavor="Rust turns to green.")
A("Spore Bloom Vats","M",[P('plant',1),G('plant',3)],vp=1)
A("Reedcutter Camps","Pl",[P('mc',2),P('plant',1)],req=R(omin=5),vp=1)
A("Hardwood Stands","Pl B",[P('plant',2),P('mc',2)],req=R(omin=8),vp=2)
A("Dewfield Commons","Pl",[P('plant',2)],req=R(cmin=4),vp=1)
A("Peat Bog Reclamation","Pl",[P('plant',1),P('heat',1)],req=R(cmin=2),vp=1)
A("Moth Orchard Rows","An Pl",[P('mc',2)],vp=1,req=R(omin=6))
A("Snowline Ranch","An",[P('plant',1)],vp=1,req=R(tmax=-8))
A("Thin Air Nesting Cliffs","An",[P('mc',2)],vp=2,req=R(omax=5),flavor="They like it sparse.")
A("Ice Garden Terraces","Pl",[P('plant',1),G('plant',2)],vp=1,req=R(tmax=-10))
# ---------------- AUTO: negative-trade / misc ----------------
A("Heat Trade Bureau","E",[P('energy',-1),P('mc',4)])
A("Windfall Mortgage","",[P('mc',-2),G('mc',22)],flavor="Pay later, laugh now.")
A("Cold Cargo Ledger","",[P('heat',-2),P('mc',3)],req=R(tmin=-10))
A("Ballast Tanks","B S",[P('steel',1),P('ti',1)])
A("Workshop Overtime","B",[P('mc',-1),P('steel',3)])
A("Drillcore Lease","B",[P('plant',1),P('steel',1),P('heat',1)])
A("Switchback Roads","B",[P('mc',1),G('steel',4)])
A("Airlock Annex","B S",[P('steel',1),P('mc',1),DRAW(1)])
A("Stargazer Bursary","",[P('mc',2),G('plant',3)])
A("Rare Earth Haul","E",[G('ti',3),G('steel',3)])
A("Gravity Sling Lease","S",[G('ti',4)])
A("Crater Rim Pylons","Pw B",[P('energy',2),P('steel',1)],req=R(tmin=-10))
A("Foundry Under Glass","B Pl",[P('steel',1),P('plant',1)])
A("Backup Ice Mine","B",[G('steel',4),P('heat',1)])

# ---------------- ACTIVE: res cards ----------------
V("Dust Lichen Mats","M Pl",action=[ACT([],[ADD(1)])],res='microbe',vp=VPR(2),req=R(tmax=-4),flavor="Greener by inches.")
V("Ice Mold Cultures","M",action=[ACT([],[ADD(1)])],res='microbe',vp=VPR(3),req=R(tmax=-10))
V("Brine Yeast Casks","M B",action=[ACT([],[ADD(1)])],res='microbe',vp=VPR(2))
V("Salt Flat Culture","M",action=[ACT([],[ADD(1)])],res='microbe',vp=VPR(2),req=R(cmin=1))
V("Cinder Moss Beds","M Pl",effect=[ONTAG('plant',[ADD(1)])],res='microbe',vp=VPR(3))
V("Cloud Spore Drifts","M J",effect=[ONTAG('jovian',[ADD(1)])],res='microbe',vp=VPR(2))
V("Basalt Eaters","M",action=[ACT([USE(2)],[P('plant',1)])],res='microbe',vp=VPR(3),play=[ADD(2)],flavor="Slow, patient, hungry.")
V("Warm Vent Colony","M",action=[ACT([],[ADD(1)]),ACT([USE(3)],[TR(1)])],res='microbe',req=R(tmin=-12))
V("Mirror Algae Rafts","M Pl",action=[ACT([],[ADD(1)])],res='microbe',vp=VPR(2),req=R(cmin=2))
V("Frostbite Bacteria","M S",effect=[ONTAG('event',[ADD(1)])],res='microbe',vp=VPR(2))
V("Kestrel Perches","An",action=[ACT([],[ADD(1)])],res='animal',vp=VPR(1),req=R(omin=8))
V("Dust Hare Burrows","An",action=[ACT([],[ADD(1)])],res='animal',vp=VPR(1),req=R(omin=7))
V("Pond Skimmers","An",action=[ACT([],[ADD(1)])],res='animal',vp=VPR(1),req=R(cmin=3,omin=5))
V("Ridge Goat Herds","An Pl",action=[ACT([],[ADD(1)]),ACT([USE(1)],[G('plant',3)])],res='animal',vp=VPR(2),req=R(omin=6))
V("Orbit Moth Hatchery","An S",effect=[ONTAG('space',[ADD(1)])],res='animal',vp=VPR(2),req=R(omin=5))
V("Trellis Songbirds","An",action=[ACT([],[ADD(1)])],res='animal',vp=VPR(1),req=R(omin=10))
V("Salt Marsh Waders","An",action=[ACT([],[ADD(1)])],res='animal',vp=VPR(1),req=R(cmin=4),flavor="Long legs, longer patience.")
V("Pack Hunters of Rim Basin","An",action=[ACT([],[ADD(1)])],res='animal',vp=VPR(1),req=R(omin=9),play=[RR('plant',3)])
V("Canopy Gliders","An Pl",action=[ACT([USE(2)],[P('mc',2)])],res='animal',vp=VPR(2),play=[ADD(2)],req=R(omin=11))
V("Lab Glass Archive","Sc",action=[ACT([],[ADD(1)])],res='science',vp=VPR(2))
V("Deep Ledger Mind","Sc",action=[ACT([USE(1)],[DRAW(1)])],res='science',play=[ADD(1)],vp=1)
V("Quark Wake Array","Sc S",effect=[ONTAG('science',[ADD(1)])],res='science',vp=VPR(3))
V("Escort Wing Dock","S",action=[ACT([L('energy',1)],[ADD(1)])],res='fighter',vp=VPR(1),flavor="Small ships, big opinions.")
# ---------------- ACTIVE: other effects ----------------
V("Rocket Union Hall","S",effect=[DISC(2,'space')])
V("Forge Guild Charter","B",effect=[DISC(2,'building')])
V("Lab Credit Line","Sc",effect=[DISC(2,'science')])
V("Terminal Discount Desk","",effect=[DISC(1)])
V("Earthside Broker","E",effect=[DISC(3,'earth')])
V("Deepwell Titanium Rig","S",effect=[EFF('tiVal',n=1)])
V("Slagworks Cartel","B",effect=[EFF('steelVal',n=1)])
V("Thin Rule Waiver","Sc",effect=[EFF('reqSlack',n=2)],flavor="Minor print, major relief.")
V("Greenery Cooperative","Pl",effect=[EFF('greenCost',n=7)])
V("Heat Exchange Desk","Pw",effect=[EFF('heatAsMc')])
V("City Fund Office","C",effect=[EFF('stdDisc',n=4,which='city')])
V("Tide Tax Office","",effect=[ONTILE('ocean',[G('mc',2)],any=True)])
V("Boomtown Clerk","C",effect=[ONTILE('city',[G('mc',3)],any=True)])
V("Grove Bonus Board","Pl",effect=[ONTILE('greenery',[G('mc',2)])])
V("Big Ticket Rebates","",effect=[EFF('onPay',min=20,do=[G('mc',4)])])
V("Jovian Patron Circle","J",effect=[ONTAG('jovian',[G('mc',3)])],vp=1)
V("Earth Dispatch Bureau","E",effect=[ONTAG('earth',[G('mc',2)])])
V("Rocket Salvage Yard","S",effect=[ONTAG('space',[G('mc',2)])])
V("Overclock Foundry","B Pw",action=[ACT([L('energy',2)],[G('steel',4)])])
V("Heat Siphon Bank","Pw",action=[ACT([L('heat',4)],[G('mc',6)])])
V("Plant Press","Pl B",action=[ACT([L('plant',3)],[G('mc',7)])])
V("Titanium Hammer Works","B S",action=[ACT([L('ti',1)],[G('mc',5)])])
V("Weather Control Console","Sc Pw",action=[ACT([L('energy',3)],[TEMP(1)])])
V("Rain Calling Station","Sc",action=[ACT([L('energy',4)],[OC(1)])],vp=1)
V("Kiln of the Long Dusk","B",action=[ACT([L('heat',8)],[TR(1)]),ACT([],[G('heat',2)])])
V("Seedling Printer","Pl Sc",action=[ACT([L('mc',3)],[G('plant',4)])])
V("Idea Foundry","Sc",action=[ACT([L('mc',2)],[DRAW(1)])])
V("Thruster Bar","S",action=[ACT([L('ti',2)],[TEMP(1)])])
V("Arc Welder Collective","B Pw",action=[ACT([L('energy',1)],[G('steel',2)])])
V("Dowsing Lab","Sc",action=[ACT([L('energy',1)],[G('heat',4)]),ACT([],[G('mc',1)])])
V("Quiet Observatory","Sc S",action=[ACT([],[G('mc',2)])],vp=1)
V("Windmill Cluster","Pw",action=[ACT([],[G('energy',2)])])
V("Relay Colony Hall","C S",action=[ACT([],[G('mc',2),G('plant',1)])],vp=1)

# ---------------- EVENTS ----------------
EV("Frozen Gift Rock","S",[OC(1),G('plant',3)])
EV("Sleet Barrage","S",[TEMP(2)])
EV("Ice Bolide Strike","S",[OC(2)])
EV("Meteor Swarm Tax","S E",[RP('mc',2),G('mc',6)])
EV("Prospector's Rush","E",[G('steel',5),G('ti',2)])
EV("Quick Tide","",[OC(1)])
EV("Cargo Drop","E",[G('mc',8)])
EV("Salt Wind Storm","",[RR('plant',4)])
EV("Dust Devil Season","",[RR('plant',3),RP('plant',1)])
EV("Heat Lamp Flyby","S",[TEMP(1),G('heat',6)])
EV("Seed Rain","Pl",[G('plant',8)])
EV("Spore Cloud Burst","M",[OXY(1),G('plant',3)])
EV("Rogue Moonlet","S J",[OC(2),RP('mc',1)],vp=1)
EV("Pitch Day","E",[G('mc',12),DRAW(1)])
EV("Lightning Harvest","Pw",[G('energy',8),G('heat',3)])
EV("Cold Call","E",[RP('mc',3)])
EV("Fuel Siphon","",[RP('energy',2),G('energy',3)])
EV("Rail Gun Salvo","S",[RP('steel',3),RP('ti',1)])
EV("Sunburst Relief","Sc",[TEMP(1),DRAW(1)])
EV("Seven Day Thaw","",[TEMP(3)])
EV("Mist Brigade","S",[OC(1),DRAW(1)])
EV("Probe Lottery","Sc",[DRAW(3)])
EV("Delta Burst","S",[OC(1),TEMP(1)],vp=1)
EV("Aurora Night","S",[OXY(1),G('mc',5)])
EV("Spring Festival","",[G('mc',6),G('plant',4)])
EV("Comet Tug Run","S",[OC(1),G('ti',3)])
EV("Orbital Blackout","S",[RP('energy',2),RP('mc',2)])
EV("Tailwind Package","E S",[G('ti',3),DRAW(1)])
EV("Pressure Wave","",[OXY(2)])
EV("Lava Burp","",[TEMP(2),RR('plant',2)],req=R(tmin=-14))
EV("Sky Garden Seeding","Pl",[GREEN()])
EV("Public Works Sweep","B",[G('steel',8)])
EV("Dust Bowl Lesson","Sc",[DRAW(2),G('plant',4)])
EV("Ring Shepherd Strike","S J",[TEMP(2),G('ti',2)],vp=1)
EV("Parade of Lanterns","E",[G('mc',10)],vp=1)
EV("Last Light Treaty","E",[TR(1),G('mc',3)])
EV("Orchard Frost","",[RR('plant',5)],req=R(tmax=0))
EV("Seep Wells Opening","Sc",[OC(1),P('plant',1)])
EV("Pole Mirror Burst","S Pw",[TEMP(1),P('heat',2)])
EV("Big Hail Season","S",[OC(3)])
EV("Meridian Windfall","E",[P('mc',2)],flavor="Quiet pay day.")
EV("Contraband Sweep","",[RP('mc',2),RR('steel',3)])


# ---------------- cheap fillers (cost <= 6) ----------------
A("Bolt Cutter Crew","B E",[G('steel',3)])
A("Footing Pour","B",[G('steel',2),G('mc',2)])
A("Tent Row Pricing","E",[P('mc',1)])
A("Crater Notebook","Sc",[DRAW(1),G('mc',2)])
A("Cold Frame Trays","Pl B",[G('plant',3)],req=R(tmin=-20))
A("Dry Run Rehearsal","Sc",[G('mc',5)],req=R(tags={'science':2}))
A("Patch Panel Brigade","Pw B",[G('energy',4)])
A("Slow Boil Pans","B",[G('heat',3)],vp=1,flavor="Patience, then steam.")
A("Vent Pan Collectors","Pw",[G('energy',2)],vp=1)
A("Fog Catcher Nets","Pl",[G('plant',3)],req=R(cmin=1))
A("Pale Sky Parcel","E",[G('mc',2)],vp=1)
A("Thin Air Bracing","B",[G('steel',2)],req=R(omax=6))
A("Wellhead Tinkers","B Pw",[G('heat',4)],req=R(tmin=-14))
A("Sky Lantern Sellers","E",[],vp=1,flavor="Paper stars over the dunes.")
A("Window Moss","M",[],vp=1)
A("Quiet Cairn","B",[G('steel',1)],vp=1,flavor="Someone stacked these for luck.")
A("Council Annex","C B",[G('mc',3)],req=R(cities=1))
A("Hedgerow Planting","Pl",[G('plant',3)],req=R(greeneries=1))
A("Salvage Sweep","S",[G('steel',1)],vp=1)
A("Allotment Credit","E Pl",[G('mc',4)],req=R(prod={'plant':1}))
A("Spore Starter Kit","M",[],vp=1)
A("Rail Spur Survey","S Sc",[G('ti',1)],req=R(tags={'science':2}))
EV("Chalk Line Surveyors","Sc",[DRAW(1),G('mc',2)])
EV("Memorial Flyby","S",[G('mc',2)],vp=1)
EV("Founders' Day Fireworks","E",[G('mc',2)],vp=1)
EV("Static Prank","Pw",[RP('energy',1)])


# ---------------- CORPORATIONS ----------------
corps=[
 {"id":"c00","name":"Open Charter","beginner":True,"freeCards":True,"tags":[],"mc":42,"start":[DRAW(10)],"text":"Plain start: 42 credits and 10 cards, all free to keep. No special power.","flavor":"A good first day on Ochre."},
 {"id":"c01","name":"Sunward Lanterns","tags":["space"],"mc":48,"start":[P('energy',1)],"effect":[DISC(2,'space')],"text":"Start with 1 energy production. Your space cards cost 2 less.","flavor":"Every launch lights a window."},
 {"id":"c02","name":"Sandstitch Guild","tags":["building"],"mc":36,"start":[G('steel',6),P('steel',1)],"effect":[EFF('steelVal',n=1)],"text":"Start with 6 steel and 1 steel production. Your steel is worth 1 more.","flavor":"We stitch the dunes together."},
 {"id":"c03","name":"Verdigris Works","tags":["plant","microbe"],"mc":36,"start":[P('plant',2),G('plant',3)],"effect":[EFF('greenCost',n=7)],"text":"Start with 2 plant production and 3 plants. Greeneries cost you only 7 plants.","flavor":"Rust first, then green."},
 {"id":"c04","name":"Tidewater Charter","tags":[],"mc":46,"start":[P('mc',2)],"effect":[ONTILE('ocean',[G('mc',2)],any=True)],"text":"Start with 2 credit production. Each time anyone places an ocean, gain 2 credits.","flavor":"Rain is a business."},
 {"id":"c05","name":"Brightwater Exchange","tags":["earth"],"mc":46,"start":[P('mc',2)],"effect":[ONTAG('earth',[G('mc',2)])],"text":"Start with 2 credit production. Each time you play an earth tag, gain 2 credits.","flavor":"Ours is the voice on the radio."},
 {"id":"c06","name":"Ironbloom Reactors","tags":["power"],"mc":38,"start":[P('energy',2),P('heat',1)],"effect":[EFF('heatAsMc')],"text":"Start with 2 energy and 1 heat production. Heat counts as credits for you.","flavor":"Cold nights, warm ledgers."},
 {"id":"c07","name":"Orrery Collective","tags":["science"],"mc":40,"start":[DRAW(3)],"effect":[EFF('reqSlack',n=1)],"text":"Draw 3 extra cards. Global requirements are 1 easier for you.","flavor":"Measure twice, launch once."},
 {"id":"c08","name":"Cometline Salvage","tags":["space","jovian"],"mc":35,"start":[G('ti',3),P('ti',1)],"effect":[EFF('tiVal',n=1)],"text":"Start with 3 titanium and 1 titanium production. Your titanium is worth 1 more.","flavor":"We tow what others fear."},
 {"id":"c09","name":"Ranger Collective","tags":["animal"],"mc":41,"start":[DRAW(2,'animal'),P('plant',1)],"effect":[ONTAG('animal',[ADD(1,'any','animal')])],"text":"Start with 1 plant production and 2 animal cards. Each time you play an animal tag, add an animal anywhere.","flavor":"The wild comes with a badge."},
 {"id":"c10","name":"Deepglass Mining Co.","tags":["building"],"mc":40,"start":[G('steel',2)],"effect":[EFF('onPay',min=18,do=[G('steel',3)])],"text":"Start with 2 steel. Each time you play a card costing 18 or more, gain 3 steel.","flavor":"Big jobs leave big piles."},
 {"id":"c11","name":"Moonrise Board","tags":["city"],"mc":40,"start":[CITY(),P('mc',1)],"effect":[EFF('stdDisc',n=4,which='city')],"text":"Start with a free city and 1 credit production. City standard project costs 4 less.","flavor":"Home is where the dome is."},
 {"id":"c12","name":"Grey Harbor Syndicate","tags":["earth"],"mc":52,"start":[],"action":[ACT([L('mc',3)],[RP('mc',1)])],"text":"Action: pay 3 credits and your rival loses 1 credit production.","flavor":"Nothing personal. Everything profitable."},
]
DELETE={"Terminal Discount Desk_"}
for n in ["Arc Welder Collective","Dowsing Lab","Windmill Cluster","Thruster Bar","Idea Foundry","Seedling Printer","Earth Dispatch Bureau","Frostbite Bacteria",
 "Estate Sale","Freight Concession","Slag Heap Mill","Rimstone Works","Static Orchard","Salt Pan Boilers","Cold Cargo Ledger","Light-Speed Mail","Orrery Wheel","Backup Ice Mine","Foundry Under Glass","Drillcore Lease","Airlock Annex","Gravity Sling Lease","Switchback Roads","Heat Trade Bureau","Sunken Pump Choir",
 "Cargo Wheel Depot","Silver Monsoon Trade","Brass Telegraph","Survey Syndicate","Nightshift Stamping","Hollow Rock Rig","Pit Wall Crawlers","Dish Farm","Ember Cellars","Glasshouse Furnace","Wind Chime Towers","Cloud Seeding Needles","Thaw Beam","Sand Orchard","Spring Line Taps","Isolated Outpost","Cold Front Anvil","Core Sample Vault","Ballast Tanks","Workshop Overtime","Rare Earth Haul","Lantern Quarter","Sleet Barrage","Pitch Day","Tailwind Package","Public Works Sweep"]:
    DELETE.add(n)
cards[:]=[c for c in cards if c['name'] not in DELETE]
# TWEAKS: name -> dict(tags='+B', req=..., vp=..., cost=..., play=...)
TW={}
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'tweaks.py')).read()) if os.path.exists(os.path.join(os.path.dirname(os.path.abspath(__file__)),'tweaks.py')) else None
byname={c['name']:c for c in cards}
for n,t in TW.items():
    c=byname[n]
    if 'tags' in t: c['tags']=tags(t['tags'])
    if 'req' in t: c['req']=t['req']
    if 'vp' in t: c['vp']=t['vp']
    if 'play' in t: c['play']=t['play']
    if 'cost' in t: c['_cost']=t['cost']
    if 'text' in t: c['_text']=t['text']
# ---------------- finalize ----------------
def finalize():
    for i,c in enumerate(cards):
        c['id']='p%03d'%(i+1)
        v=curve_value(c)
        cost=c['_cost'] if c['_cost'] is not None else int(max(0,min(45,math.floor(v-3+0.5))))
        c['cost']=cost
        c['text']=c['_text'] or text_for(c)
        if not c['flavor']: c.pop('flavor')
        del c['_cost'],c['_text']
        if not c.get('tags') and False: pass
finalize()
if __name__=='__main__':
    from collections import Counter
    print(len(cards),Counter(c['type'] for c in cards))
    tc=Counter(t for c in cards for t in c['tags']); print(dict(tc))
    print('notag',sum(1 for c in cards if c['type']!='event' and not c['tags']),'vp',sum(1 for c in cards if c.get('vp')))
    print('res',Counter(c.get('res') for c in cards))
    rc=Counter(k for c in cards for k in c.get('req',{})); print('req',dict(rc))
    bands={'0-6':0,'7-12':0,'13-19':0,'20-29':0,'30-45':0}
    for c in cards:
        x=c['cost']; bands['0-6' if x<=6 else '7-12' if x<=12 else '13-19' if x<=19 else '20-29' if x<=29 else '30-45']+=1
    print(bands)
    long=[(c['name'],len(c['text'].split())) for c in cards if len(c['text'].split())>18]; print('long',long)
    if '--write' in sys.argv:
        json.dump(corps,open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'corps.json'),'w'),indent=1,ensure_ascii=False)
        json.dump(cards,open(os.path.join(os.path.dirname(__file__),'cards.json'),'w'),indent=1,ensure_ascii=False)
