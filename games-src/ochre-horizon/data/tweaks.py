# downgrades / upgrades / reqs / tags applied to existing cards
def addreq(n,**k): TW.setdefault(n,{})['req']=R(**k)
TW["Gantry Lease"]={"play":[P('mc',1),P('ti',1)]}
TW["Quiet Money Company"]={"play":[P('mc',4)]}
TW["Terrace Settlement"]={"play":[CITY(),P('mc',1)]}
TW["Tug Fleet Lease"]={"play":[P('ti',1),P('mc',1)]}
TW["Fern Terraces"]={"vp":1}
TW["Shore Town"]={"vp":1}
def C(n): return [c for c in cards if c['name']==n][0]
def addtag(n,s):
    c=C(n)
    for t in tags(s):
        if t not in c['tags']: c['tags'].append(t)
def deltag(n,s):
    c=C(n); c['tags']=[t for t in c['tags'] if t not in tags(s)]
def setreq(n,**k): C(n)['req']=R(**k)
for n in ["Cobalt Trawler","Cargo Pod Foundry","Meadow Rooftops","Reed Bank","Moonshadow Colony","Spiral Habitat","Dune Bazaar","Salvage Charter_","Coil Reactor","Fusion Kettle","Sunmirror Array","Fern Terraces","Tray Garden Rows","Plain Song Archive","Long Table Hall","Heat Siphon Bank","Relay Colony Hall","Gravity Well Museum"]:
    if n.endswith('_'): n="Quiet Cairn"
    addtag(n,'B')
for n in ["Rocket Salvage Yard","Cut Cable Prank","Dry Run Rehearsal","Crater Notebook","Heat Lamp Flyby"]: addtag(n,'E')
for n in ["Peat Bog Reclamation","Ice Garden Terraces","Dewfield Commons"]: deltag(n,'Pl')
for n in ["Spore Bloom Vats","Escort Wing Dock","Greenbelt Nursery"]: addtag(n,'Sc')
for n in ["Storm Skimmer","Kiln of the Long Dusk","Vent Stack"]: addtag(n,'Pw')
for n in ["Seven Day Thaw","Pressure Wave"]: addtag(n,'S')
for n,q in [("Quark Wake Array",{'science':2}),("Radiant Convoy",{'power':2}),("Moon Dock Tolls",{'space':2}),("Gas Bag Fleet",{'jovian':1}),("Jove-class Harvester",{'space':2}),("Storm Skimmer",{'jovian':1}),("Cloud City Spindle",{'jovian':1}),("Weather Control Console",{'science':2}),("Rain Calling Station",{'science':2}),("Deep Ledger Mind",{'science':1})]:
    setreq(n,tags=q)
setreq("Spore Bloom Vats",tmin=-20); setreq("Vent Stack",tmin=-18); setreq("Mulch Kitchen",tmin=-22); setreq("Meadow Rooftops",tmin=-20,cmin=1)
setreq("Basalt Eaters",tmax=-6); setreq("Frost Sabotage",tmax=-4)
setreq("Tray Garden Rows",omin=2); setreq("Sprout Lab",omin=3); setreq("Hydroponic Spindle",omin=4); setreq("Sky Garden Seeding",omin=3)
setreq("Greenbelt Nursery",omin=3,cmin=2); setreq("Reed Bank",tmin=-16,cmin=1); setreq("Fern Terraces",omin=5,cmin=2)
C("Footing Pour")['play']=[G('steel',1)]; C("Footing Pour")['vp']=1
for n in ["Moonshadow Colony","Reed Bank","Storm Skimmer","Crater Rim Pylons"]: C(n)['vp']=1
C("Smoke Fuse Raid")['play']=[RP('steel',1)]
C("Frost Sabotage")['play']=[RP('plant',1),RP('heat',1)]
C("Deep Field Survey")['play']=[DRAW(1),G('mc',2)]
C("Cold Frame Trays")['play']=[G('plant',2)]
C("Dry Run Rehearsal")['play']=[G('mc',4)]
C("Ore Sled Convoy")['play']=[P('steel',1),G('steel',2)]
C("Grid Cathedral")['play']=[PP('mc',1,'tag:power',2)]
C("Plant Press")['action']=[ACT([L('plant',3)],[G('mc',6)])]
C("Jovian Patron Circle")['effect']=[ONTAG('jovian',[G('mc',2)])]
C("Frozen Gift Rock")['play']=[OC(1),G('plant',1)]
C("Heat Lamp Flyby")['play']=[TEMP(1),G('heat',3)]
for n,t in [("Heritage Obelisk","A quiet monument that people stop to look at. Worth 2 victory points."),
 ("Peace Garden Plaza","A shaded plaza where everyone meets. Worth 2 victory points."),
 ("Canal Cathedral","A vaulted hall beside the water. Worth 3 victory points."),
 ("Sky Lantern Sellers","Paper lights over the dunes. Worth 1 victory point."),
 ("Window Moss","Green on every sill. Worth 1 victory point."),
 ("Spore Starter Kit","A jar of hope with a lid. Worth 1 victory point.")]:
    C(n)['_text']=t
