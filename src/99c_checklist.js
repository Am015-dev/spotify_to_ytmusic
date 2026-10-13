// ===== CK: in-game TEST CHECKLIST (Alex 2026-10-08: "I will play, just include a check list inside the game update so I can validate").
// OD_CHECKLIST = items per version; each gets ✅ PASS / ❌ FAIL + an optional note, saved in localStorage 'mho_chk'. "COPY RESULTS" copies
// plain text (version, id, status, note) to paste to the coordinator. Opens from "✔ CHECKLIST" in the ⚙ drawer header and the UPDATES screen.
// The buttons show how many items of the current version are still unanswered. Every deploy adds its own items (newest version first).
const OD_CHECKLIST=[
 {ver:'v90k',id:'rv-scale',area:'garage',text:'rv:2026-10-13 · Ride sizes: every garage ride is the size of its class (car 4-5 m, van 5-6, bus 11-13, truck 8-12, ±20 %) and the minifig driver sits with his head under the roof. 📍 GO measures the 6 worst rides (Service Truck, Race Car 6609, Little Tractor, Fire Chief Car, Sport Convertible, Sightseeing Bus), says the verdict and opens the garage. Auto: qa_dev3/tRvScale.js = RSZ.audit() over all 157 rides, 0 out of class.'},
 {ver:'v90k',id:'no-hollow',area:'city',text:'Frankfurt: drive 1 minute along the main road: every traffic vehicle is a whole car or truck (roof, cab, all 4+ wheels on the road); no hollow red/blue open box. Auto: HCAR has no ld:truck:v3221_1.'},
 {ver:'v90k',id:'shadow',text:'Cars, trees and people have shadows on the ground: a soft dark patch under your car, every traffic car, each person and each tree (📍 GO drops you behind a Frankfurt traffic car).'},
 {ver:'bxT',id:'bx-t-cliff',area:'race',text:'Built-in track CLIFF RUN (📍 GO, also in Race menu): one lap: the cliff jump gives at least 1.5 s air, there is a drop and a banked turn, the road climbs and falls at least 15 m.'},
 {ver:'bxT',id:'bx-t-city',area:'race',text:'Built-in track TWO-LEVEL CITY (📍 GO, also in Race menu): one lap: you cross a bridge over a road and drive that road under it, the water shortcut turns you into a boat, at least 15 m up and down.'},
 {ver:'bxT',id:'bx-t-canyon',area:'race',text:'Built-in track CANYON SPLIT (📍 GO, also in Race menu): the canyon splits into 2 routes (both drivable), you can cut across the rough ground, at least 15 m up and down.'},
 {ver:'bxA',id:'bx-snap',area:'race',text:'TRACK BUILDER: tap START, RAMP UP, STRAIGHT and ✔ PLACE (or tap the green ghost): 3 pieces snap end to end and the road climbs one height level.'},
 {ver:'bxA',id:'bx-jump',area:'race',text:'Builder test CLIFF JUMP (📍 GO): drive off the JUMP at the mountain top: at least 1.5 s in the air, you land upright on the road below.'},
 {ver:'bxA',id:'bx-offroad',area:'race',text:'Builder test OFF-ROAD (📍 GO): leave the road and drive across the grass and hills for 10 s: no invisible wall stops you.'},
 {ver:'bxA',id:'bx-cliff',area:'race',text:'Builder test CLIFF FALL (📍 GO): drive off the end of the mountain road: "OFF THE CLIFF!" and you are back on the road within 2 s.'},
 {ver:'bxA',id:'bx-water',area:'race',text:'Builder test WATER (📍 GO): drive off the road into the lake: the car becomes a boat and keeps going; back on land it is a car again.'},
 {ver:'bxA',id:'bx-bridge',area:'race',text:'Builder test BRIDGE (📍 GO): drive the low road under the bridge, then the bridge road over it (LEGO pillars hold it up, none stand on the low road).'},
 {ver:'bxA',id:'bx-split',area:'race',text:'Builder test SPLIT (📍 GO): at the SPLIT take the left road, then RESPAWN and take the right one: both are drivable.'},
 {ver:'bxA',id:'bx-world',area:'race',text:'Builder test NEW TRACK (📍 GO): the empty builder world is a valley with mountains, a cliff mesa, a river, a lake, rocks and trees: hills fill the view.'},
 {ver:'bxA',id:'bx-elev',area:'race',text:'Builder demo MOUNTAIN JUMP (📍 GO): the track climbs and drops at least 15 m (mountain top to valley).'},
 {ver:'bxA',id:'bx-errors',area:'race',text:'Track builder: build, drive and switch tracks for a few minutes: nothing freezes, no error messages.'},
 {ver:'v90j',id:'ride-fast',area:'garage',text:'Garage → RIDES: tap any ride card: the whole ride stands there within about 1 second (never just wheels or a bare chassis); a LOADING sign shows if it needs longer.'},
 {ver:'v90k',id:'lag',area:'city',text:'Frankfurt and Athens: drive 30 s through busy streets: no stutter from the LEGO props (cones, barriers, trees, rocks). Auto (📍 GO): far props draw the cheap model, near ones the LEGO model, 0 on the wrong one.'},
 {ver:'v90k',id:'fra-net',area:'city',text:'Frankfurt big map: every motorway (A5, A66, A661, A3) has a ramp from a city street; tap 📍 GO (drops you at a ramp start), drive the ramp onto the motorway without a wall or a gap. Auto: one road network, ≤ 10 dead ends, every motorway has a ramp.'},
 {ver:'v90k',id:'park-sit',area:'city',text:'Get out of your car (any ride, e.g. the blue racer): the parked car sits on the road, all 4 tyres touching, not tilted or sunk at the back. Auto: tyre gap ≤ 0.05 m, pitch matches the road.'},
 {ver:'v90j',id:'ck-go',area:'hud',text:'Checklist: items you can\'t reach in a short drive (pizza shop, phone booth, fountain, speedboat, Big Rig, planters, cones, Athens display models, Syntagma palms) have 📍 GO: it drops your car next to the thing (tap again for the next one).'},
 {ver:'v90j',id:'gz-zoom',area:'garage',text:'Garage: the − ⤢ + buttons zoom the car in and out on every tab (RIDES, BUILD, PAINT…); ⤢ goes back to the normal view. Two-finger pinch zooms too.'},
 {ver:'v90j',id:'gz-keys',area:'garage',dev:'pc',text:'PC, garage: the mouse wheel and the + / − / 0 keys zoom; the I key picks a part (like 💧 PICK).'},
 {ver:'v90j',id:'gz-pick',area:'garage',text:'Garage → BUILD → ⋯ MORE → 💧 PICK, then tap a part of the car: the next part you place is the same part, turn and colour.'},
 {ver:'v90j',id:'ck-filter',area:'hud',text:'Checklist: 📱 PHONE / 💻 PC and the GARAGE · RACE · CITY · PEOPLE · HUD chips filter the list; phone and PC answers are kept apart.'},
 {ver:'v90j',id:'ck-fold',area:'hud',text:'While driving, fold the checklist strip (tap the counter): ✅ / ❌ still answer the item shown, with nothing to open or close.'},
 {ver:'v90j',id:'veh21',area:'garage',text:'Garage → RIDES: 21 more: Site Dumper, Outback Racer, Mini Dump Truck, Milk Truck, News Van, Fire Chief Car (6571), Fire Patrol Car, Dig Master Truck, Gas Tanker Cab, Road Rescue Truck, Res-Q Cruiser, Bulldozer (6481), F1 Hauler, Formula Racer, Rescue Patrol Car, Go-Kart, Off-Roader, Farm Tractor (30284), Mini Garbage Truck, Blue Racer, Red Coupe: each complete, on the floor, driver facing forward.'},
 {ver:'v90j',id:'facing',area:'garage',text:'Garage → RIDES → Construction Truck and Tanker Cab: the driver faces the grille and sits at the wheel; drive one: it goes grille-first.'},
 {ver:'v90j',id:'fwd5',area:'city',text:'Drive the Racing Pickup, Tanker Cab, Fire Truck (4208), Classic Patrol and Family Car: each drives forwards, not backwards.'},
 {ver:'v90k',id:'ath-kriezi',go:['ath',2142,-1419],text:'Athens Psyrri: tap 📍 GO, then drive Kriezi street (the short street by Garaz Psyrri) end to end: it is asphalt all the way, no buildings across it, no wall hits.'},
 {ver:'v90j',id:'rd-red',text:'Frankfurt: drive through 3 signal crossings. Cars wait at red in their lane behind the stop line; the middle of the crossing stays clear.'},
 {ver:'v90j',id:'rd-ped',text:'People walk on the pavement and cross only at the zebras (on green, or when no car is coming); cars stop for them.'},
 {ver:'v90j',id:'rd-ath',text:'Athens: drive around the centre for 2 minutes. Streets connect (few dead ends), main roads are wide, and you never have to cut across grass to follow the GPS line.'},
 {ver:'v90j',id:'rd-lanes',text:'Frankfurt wide streets: traffic uses both lanes in each direction; no cars sitting inside each other.'},
 {ver:'v90j',id:'town20',text:'Garage → RIDES: Recycling Truck, Classic Tractor, Pursuit Squad Car, Mobile Crane, Night Patroller, Mobile Police Truck, Hook and Ladder Truck, Sport Convertible, Farm Tractor (6504), Police Patrol, Fire Chief Car (6602), Shovel Tractor, Road Racer, Little Tractor, Race Car (6609), Road and Trail 4x4, Mini Ladder Truck, Rescue SUV, Highway Pickup: each stands on the floor, wheels down, driver in the seat.'},
 {ver:'v90j',id:'tow7638',text:'Garage → RIDES → Tow Truck (7638): now with doors, windscreen and mudguards; drives forwards.'},
 {ver:'v90j',id:'fra-props',text:'Frankfurt: road works have LEGO cones, barriers, a warning light and a STOP sign; rocks are LEGO rocks; none sit on the road.'},
 {ver:'v90j',id:'ath-trees',text:'Athens: pines, olive trees, cypresses and rocks are LEGO pieces; driving stays smooth.'},
 {ver:'v90i',id:'town16',text:'Garage → RIDES: Blaze Commander, Blizzard Blazer, Red Cross Car, Red Devil Racer, Mini Dumper, Rescue Runabout, Landscape Loader, Service Truck, Dump Truck, Fire and Rescue Van, Post Van, Construction Truck, Highway Emergency Van, Bulldozer, TV Studio Van, Pothole Patcher: each looks complete and stands on the platform; drive two.'},
 {ver:'v90i',id:'pin-obj',text:'Phone, story mission: the checklist bar sits below the yellow NEXT objective line, never on top of it.'},
 {ver:'v90i',id:'palms',text:'Athens Syntagma race: the palms stand beside the track on the verge, none on the asphalt.'},
 {ver:'v90i',id:'ath-size',text:'Athens: jump a few times; the car keeps its normal size and stays upright.'},
 {ver:'v90h',id:'gfloor',text:'Garage → RIDES: tap 6 rides in a row (a car, a big truck, a Town set, an OFF-ROAD truck, a WATER boat): after the build-up each one stands on the platform, tyres on the tiles, nothing sunk into the floor, no flat base with tiny wheels.'},
 {ver:'v90h',id:'gpatch',text:'Garage → BUILD on a big ride (Fire Truck, Big Rig): the grey platform has no dark striped patch behind the ride.'},
 {ver:'v90g',id:'rides16',text:'Garage → RIDES: Street Sweeper, Fire Truck (4208), Tow Rig, Recycle Truck, Red Line Racer, Diesel Daredevil, Classic Patrol, Tow Truck (7638), Highway Bike, Z06 Racer, Repair Truck, Tipper Lorry, Sport Coupe, Road Rebel, Trail Ranger, Diesel Dumper: each looks complete; drive two.'},
 {ver:'v90g',id:'racers',text:'Garage → RIDES: the filter chip cycles ALL → OWNED → ★ FAVS → 🏁 RACERS; RACERS shows the five tiny racers (Tiny Patrol, Tiny Muscle, Track Racer, Rally Sprinter, Track Marshal), car-sized on the road.'},
 {ver:'v90g',id:'fra-props',text:'Frankfurt: Pizza To Go shop (a person fits through the door), a phone booth, the LEGO fountain on a lawn, and a speedboat IN the river.'},
 {ver:'v90g',id:'ath-display',text:'Athens: the little lighthouse and the house stand on low display plinths, true LEGO size (not blown up).'},
 {ver:'v90g',id:'bigrig',text:'Frankfurt: drive 2 minutes: the yellow Big Rig appears in traffic only on wide roads and never cuts a kerb or a corner.'},
 {ver:'v90g',id:'land2',text:'Frankfurt planters/dumpsters, Athens street lamps and the Syntagma race palms look like LEGO parts; both cities run as smoothly as before.'},
 {ver:'v90f',id:'town-fwd',text:'Equip Town Roadster, then Ladder Truck: the bonnet/cab points forward and the car drives forwards.'},
 {ver:'v90f',id:'pol-fire',text:'RIDES: Police Truck, Fire Chief Car, Precinct Cruiser, Police 4x4, Fire Engine, Ambulance, Rescue Rig, Town Tow Truck and Hook Wrecker look complete; drive two of them.'},
 {ver:'v90f',id:'w4956',text:'Frankfurt: a LEGO House (4956) stands by a street near the start; a person fits through its door.'},
 {ver:'v90f',id:'land',text:'Frankfurt: trees, street lamps, park fences and crates look like LEGO parts (round/pointed LEGO trees, black lamp posts with yellow lamps, white lattice fences, brown slatted crates); the city runs as smoothly as before.'},
 {ver:'v90f',id:'plow',text:'Drive the Snowplow (the widest ride, ~4.7 m) down a Frankfurt street: it stays in its lane, passes traffic and turns corners without scraping the kerb.'},
 {ver:'v90f',id:'ride-width',text:'Drive the Hot Rod, the Rally S1 and the Sightseeing Bus: none looks squeezed thin; each still sits on the road and steers like before.'},
 {ver:'v90f',id:'truck-size',text:'Garage → RIDES → STREET: drive the Big Rig, Logger and Fire Chief: each is minifig size (truck taller and longer than a traffic car), a LEGO driver sits inside the cab, and it fits through normal streets.'},
 {ver:'v90e',id:'cruiser',text:'Garage → RIDES: Town Cruiser looks complete with its windscreen at the front; the ride pictures on screen appear first, the rest follow.'},
 {ver:'v90e',id:'ct-traffic',text:'Frankfurt and Athens: drive 1 minute. The traffic is LEGO sets (family car, blue-white patrol car, mail van, service van, yellow LEGO taxi, sports cars), all on their wheels on the road.'},
 {ver:'v90e',id:'ct-hit',text:'Bump into a traffic car and a van: the hit happens where the car looks to be (no invisible wall, no driving through it).'},
 {ver:'v90b',id:'ba-open',text:'Open the garage: your car builds itself brick by brick (bottom first) in 2–3 s, then stays complete.'},
 {ver:'v90b',id:'ba-pick',text:'RIDES: pick another street car, then the WATER tab, then an OFF-ROAD ride: each builds itself up; tapping the view mid-build shows it complete at once.'},
 {ver:'v90b',id:'ba-noblock',text:'While a ride is building up you can still tap cards, tabs and BUILD; nothing waits for the animation.'},
 {ver:'v90b',id:'fb-cam',text:'WATER → Power Boat → ✎ BUILD: the whole boat is in view from above and big enough to tap parts on it.'},
 {ver:'v89z',id:'fb-cards',text:'Garage → RIDES → OFF-ROAD and → WATER: every ride card has ✎ BUILD and ▶ GUIDE.'},
 {ver:'v89z',id:'fb-build',text:'WATER → Speedboat → ✎ BUILD: the boat (not the Hot Rod) is in the builder and its name is at the top. Place a part, ROTATE, place another, go back to RIDES: the boat card shows your parts.'},
 {ver:'v89z',id:'fb-guide',text:'OFF-ROAD → Blue Beast → ▶ GUIDE: the guide builds the monster truck step by step (title says Blue Beast). EXIT works.'},
 {ver:'v89z',id:'fb-drive',text:'After editing a boat, SAVE & DRIVE: your street car is unchanged; drive into the river and the boat you built appears.'},
 {ver:'v89w',id:'sc-rides',text:'Garage → RIDES → STREET: Senna GTR, Hyper 16, Demon 18 and Charger 70 each show complete with 4 wheels; SAVE & DRIVE works and they sit on the road.'},
 {ver:'v90d',id:'town79',text:'Garage → RIDES → STREET: Town Roadster, Town Coupe, Ladder Truck and Town Tipper each look complete; equip one and drive: it sits on the road and steers.'},
 {ver:'v90c',id:'cars3',text:'Garage → RIDES → STREET: Race Car 89, Sprint Racer and Racing Pickup each look complete; drive one: it sits on the road and steers.'},
 {ver:'v90c',id:'4x4s',text:'RIDES: Fire Rescue 4x4, Coast Guard 4WD, Bike Hauler, Mining 4x4 and Horse 4WD each look complete; drive one.'},
 {ver:'v90c',id:'work',text:'RIDES: Tipper Truck, Dump Truck, Cement Mixer, Mixer Truck, Cargo Truck, Turbine Hauler, Front Loader and Farm Tractor each look complete; drive one of the 3-axle trucks: wheels on the road, it steers.'},
 {ver:'v90c',id:'thumbs',text:'Garage → RIDES: all ride pictures (now 39 LEGO ones) appear within a few seconds of opening.'},
 {ver:'v90a',id:'lazy',text:'Start the game: it loads at least as fast as before; your equipped ride looks complete at once (also a LEGO ride you equipped earlier).'},
 {ver:'v90a',id:'lazyg',text:'Garage → RIDES: every LEGO ride picture appears within a few seconds; equipping one shows it complete.'},
 {ver:'v90a',id:'recycler',text:'Garage → RIDES → STREET: Recycler (green recycle truck) looks complete; drive it: it sits on the road and steers.'},
 {ver:'v90a',id:'family',text:'RIDES: Family Car looks complete and drives.'},
 {ver:'v90a',id:'w6362',text:'Frankfurt: a red LEGO shop with a blue roof stands by a street near the start; a person fits through its door.'},
 {ver:'v90a',id:'w6360',text:'Athens: a yellow LEGO cottage with a red roof and garden stands by a street near the start; a person fits through its door.'},
 {ver:'v90a',id:'w6374',text:'Frankfurt: a white LEGO Holiday Home with a red roof stands by a street near the start; a person fits through its door.'},
 {ver:'v90a',id:'w4010',text:'Frankfurt: a black and white LEGO police boat sits IN the river (not floating above, not on land).'},
 {ver:'v90a',id:'w6349',text:'Athens: a white LEGO Holiday Villa with a red roof stands by a street near the start; a person fits through its door.'},
 {ver:'v90a',id:'perf',text:'Drive past the LEGO buildings in both cities: no stutter, buildings look solid (no missing walls or roofs).'},
 {ver:'v89y',id:'trucks',text:'Garage → RIDES → STREET: the 9 new trucks/vans (Flatbed, Repair Truck, Logger, Big Rig, Mail Van, Tanker Cab, Service Van, Bin Truck, Snowplow) each show complete; drive two of them: they sit on the road and steer.'},
 {ver:'v89y',id:'rboat',text:'Frankfurt: the blue Speedboat sits IN the river by the bank (not floating above, not on land).'},
 {ver:'v89x',id:'fig-scale',text:'Walk (on foot) up to the Corner Garage, Town Bank and Town House in Frankfurt: a person fits through the doors with headroom; the buildings still stand on their lots, off the road.'},
 {ver:'v89w',id:'ath-light',text:'Athens near the start: the red/white lighthouse stands beside a road; the Summer Cottage and Sidewalk Cafe face the street (not hidden behind houses).'},
 {ver:'v89v',id:'cgarage-world',text:'Frankfurt, near the start (by the Town Bank): the Corner Garage stands on its own lot, white ground floor with green trim, tan flats above, petrol canopy; it does not block a road and you bump off its walls.'},
 {ver:'v89v',id:'cgarage-fps',text:'Drive past the Corner Garage and the Town Bank on the phone: no stutter or slowdown compared with the rest of Frankfurt.'},
 {ver:'v89v',id:'veh-rides',text:'Garage → RIDES → STREET: Race Car (30572), Fire Chief (4914), Patrol Car (4436) and Camper (7639) each show complete with 4 wheels; SAVE & DRIVE works and they sit on the road.'},
 {ver:'v89v',id:'fra-props',text:'Frankfurt near the start: Town House, Burger Stand and Ice Cream Cart stand on lots beside the road, none on the road; you bump off them.'},
 {ver:'v89v',id:'fra-boat',text:'Frankfurt river: a small Motor Boat is moored by the bank, sitting IN the water.'},
 {ver:'v89v',id:'ath-props',text:'Athens near the start: the Summer Cottage and the Sidewalk Cafe stand beside the road, none on the road.'},
 {ver:'v89u',id:'pboat-garage',text:'Garage → RIDES → WATER → Power Boat: the long white hull with red deck, black cockpit and yellow trim shows, with a driver on the front seat.'},
 {ver:'v89u',id:'pboat-drive',text:'Drive the Power Boat on the water: the hull sits IN the water (not floating above it, not sunk), it steers like the other boats.'},
 {ver:'v89t',id:'turbo-garage',text:'Garage → RIDES → Turbo 74: the white 911 Turbo shows with its black whale-tail wing, round headlights and 4 wheels; SAVE & DRIVE works.'},
 {ver:'v89t',id:'turbo-drive',text:'Drive the Turbo 74 for a minute: it sits on the road (no floating), steers like the other cars, nothing falls off.'},
 {ver:'v89s',id:'rally-garage',text:'Garage → RIDES → Rally S1: the white/yellow rally car shows with its wing, curved hood and 4 wheels; SAVE & DRIVE works.'},
 {ver:'v89s',id:'rally-drive',text:'Drive the Rally S1 for a minute: it sits on the road (no floating), steers like the other cars, nothing falls off.'},
 {ver:'v89s',id:'speedboat',text:'RIDES → WATER → Harbour Speedboat, then drive into the river: the red boat with its driver sits in the water.'},
 {ver:'v89s',id:'bank',text:'Frankfurt start: the red/white LEGO bank stands on the grass by the road; driving into it you bump its walls, not thin air.'},
 {ver:'v89s',id:'taxi',text:'RIDES → Yellow Taxi (40468): it looks like the LEGO set and drives normally.'},
 {ver:'v89q',id:'night-blocks',text:'Drive at dusk/night: no pink or white blocks float next to your car or traffic.'},
 {ver:'v89p',id:'night-mem',text:'iPhone: drive 15 min in Frankfurt at dusk/night: no slowdown, no reload.'},
 {ver:'v89o',id:'gar-stop',text:'Drive through Eleni\'s garage ring without stopping: no menu pops up; stop in it: the menu opens.'},
 {ver:'v89o',id:'ath-gb-road',text:'Athens: golden bricks are on roads, not in blocks or on the hill.'},
 {ver:'v89o',id:'plate-gear',text:'Phone: the district name in the top right is fully visible below the ⚙ button, also during a challenge.'},
 {ver:'v89n',id:'ath-mem',text:'iPhone: start in Athens: the city loads in about a minute and the page never reloads while you drive 5 min.'},
 {ver:'v89l',id:'stuck-push',text:'Drive slowly into a stopped car and keep GAS on: within a second it is pushed aside and you can pass.'},
 {ver:'v89l',id:'drift-brake',text:'Phone: at 60 km/h or more, keep GAS on, steer and hold BRAKE for a moment: the car drifts (pink trail, mini-turbo after). A quick BRAKE tap only brakes.'},
 {ver:'v89k',id:'gold-brick',text:'Golden bricks look like a big gold 2×2 LEGO brick at car-roof height (no pole), and you collect it by driving through.'},
 {ver:'v89j',id:'tip-avatar',text:'Oma Hilde\'s tip text never runs under her picture.'},
 {ver:'v89j',id:'walls-pill',text:'Frankfurt: no plain beige walls; the TAP TO OPEN pill doesn\'t cover the speed bar.'},
 {ver:'v89i',id:'perf-thumbs',text:'Garage: part pictures and car cards all show (no blank tiles), and PAINT recolours them.'},
 {ver:'v89i',id:'perf-ctx',text:'iPhone: open and close the garage 3×, then drive: no black screen, no reload.'},
 {ver:'v89h',id:'ath-take2',text:'Athens: stop near traffic, get out and walk up to a car that stops for you (walk round a scooter if one is in front): 🚗 TAKE appears and you drive off with ★1.'},
 {ver:'v89h',id:'ath-fill',text:'Athens: drive 1 to 1.5 km out from the centre and look between the streets: blocks have windows and balconies, no long blank grey or beige walls.'},
 {ver:'v89h',id:'pin-yield',text:'Phone: at the story start Oma Hilde\'s tip is fully readable, and tapping ❚❚ shows the whole PAUSE card (RESUME not covered). The checklist bar comes back afterwards.'},
 {ver:'v89g',id:'ro_start',text:'RACE → Riverbank Rally (or Coast Rally in Athens). You start 8th at the back: you see the whole field ahead on a wide open course, and the big 8TH top-left changes as you pass cars.'},
 {ver:'v89g',id:'ro_route',text:'At a fork, follow the orange arrows onto the dirt SHORTCUT (you turn into a 4×4), or the blue arrows into the water lane (you turn into a boat). Both feel faster than the road.'},
 {ver:'v89g',id:'ro_jump',text:'Jump the creek (Frankfurt) or the olive crest (Athens) at full speed: you fly over and land on the far side.'},
 {ver:'v89g',id:'ro_cliff',text:'Drive off the cliff edge on purpose: you see a real drop to the water, "OFF THE CLIFF!" appears, and you are back on the road within 3 s (tap to respawn at once). You keep your place.'},
 {ver:'v88z',id:'speed',text:'Take a sports car (Hot Rod) onto the Autobahn and hold GAS: the HUD reaches about 230 km/h, BOOST takes it past 260. A 4×4 tops out around 155. Steering feels the same as before.'},
 {ver:'v88z',id:'kreuz',text:'Autobahn west of the city, at the Frankfurter Kreuz: drive under the flyover at full speed, then take the A5 over it. No drop, no sudden stop, no invisible wall.'},
 {ver:'v88z',id:'ramps',text:'Drive along a street to a yellow ramp: it sits in your lane, no traffic queued on it, and you can jump it. Try the ramp on the Eiserner Steg footbridge.'},
 {ver:'v88z',id:'traffic',text:'Frankfurt: a few city buses, fewer police and trucks. Athens: more scooters, fewer taxis. Does the traffic look right?'},
 {ver:'v88z',id:'ath-walls',text:'Athens: drive around Eleni\'s Garage (Psyrri) and a RAMP JUMP pop-up ring. Any invisible walls or getting stuck between buildings?'},
 {ver:'v89f',id:'g13-search',text:'Garage BUILD: type “headlight” in Search parts: the headlight brick shows up; tap + to put it in the TRAY.'},
 {ver:'v89f',id:'g13-turn',text:'Hold a part and turn it on X, Y and Z (⟲ AXES pad, or PC R / T / F), then ✔ PLACE it on the car.'},
 {ver:'v89f',id:'g13-join',text:'SELECT 3 loose parts → JOIN: they become one 🔗 Piece; save it and find it in MY PARTS.'},
 {ver:'v89f',id:'g13-paint',text:'Tap PAINT in the BUILD bar: the colour chips open and the next part uses the colour you tapped.'},
 {ver:'v89e',id:'stream-drive',text:'Drive 2 min fast on the Autobahn and then across Athens: no grey holes or buildings popping in close to you, no stutter.'},
 {ver:'v89e',id:'stream-ios',text:'iPhone: play 10 min in Athens and Frankfurt: the page never reloads or crashes.'},
 {ver:'v89d',id:'jack-take',text:'Get out next to a street, step in front of a slow car or walk up to a parked one: the yellow button reads 🚗 TAKE. Tap it (PC: F).'},
 {ver:'v89d',id:'jack-pull',text:'After TAKE: the driver is pulled out, a "HEY!" bubble shows (not hidden under the cards at the top) and he runs off. Is he as tall as you?'},
 {ver:'v89d',id:'jack-drive',text:'Drive the taken car away: ★1 shows next to the speed, the camera is as far back as with your own car, and the tyres sit on the road.'},
 {ver:'v89d',id:'ath-park',text:'Athens: look for cars parked at the kerb. Walk up to one and tap ENTER to drive it.'},
 {ver:'v89b1',id:'foot-cam',text:'On foot, hold the stick a little to the right for 10 s: you walk a wide curve or straight line, NOT endless circles, and the camera does not keep spinning.'},
 {ver:'v89b1',id:'foot-orbit',text:'On foot, drag on the empty right side of the screen: the camera turns around you (and up/down). Double-tap there: it goes back behind you. Buttons still work.'},
 {ver:'v89a',id:'foot-exit',text:'Drive, then stop and let go of the pedals: BRAKE turns into a yellow 🚪 EXIT. Tap it (PC: F). Your minifig steps out next to the car, the driver seat is empty, the car stays parked.'},
 {ver:'v89a',id:'foot-walk',text:'On foot: drag on the left half of the screen to walk, push far to run; RUN and JUMP work. Walk 30 m along a street: no getting stuck on kerbs, the camera stays behind you and never inside a wall. Your minifig is as tall as the people around.'},
 {ver:'v89a',id:'foot-pc',text:'PC: stop the car, press F (or E) to get out, walk with WASD (Shift runs, Space jumps), press F next to a car to get in.'},
 {ver:'v89a',id:'foot-enter',text:'Walk up to a parked car at the kerb (Frankfurt) or back to your own car: 🚪 ENTER appears. Tap it, drive away 100 m: the car sits on the road, all controls work as before.'},
 {ver:'v88y',id:'gp-canvas',text:'Garage BUILD → MY PARTS → CANVAS: an empty green 32×32 baseplate. Place a few bricks, pinch to zoom and drag with two fingers to move the view, then ← CAR: your car is unchanged.'},
 {ver:'v88y',id:'gp-part',text:'On the canvas: ☝ SELECT your bricks → ⛓ GROUPS → MAKE GROUP → 💾 SAVE PART. Back on the car, MY PARTS → tap the part, tap a spot at the side of the car, ✔ PLACE: it appears on both sides. SAVE & DRIVE, reload: it is still there.'},
 {ver:'v88y',id:'gp-tiles',text:'BUILD → TILES: round, quarter, macaroni, slope, curve and printed tiles look like real LEGO tiles; nothing overlaps the buttons while holding or selecting a part.'},
 {ver:'v88x',id:'ath-dress',text:'Athens: drive along streets for 1 minute: orange trees, green kiosks, parked scooters and bollards line the pavements; more crowds/cafés; smashing one gives a brick burst. Is Athens lively enough?'},
 {ver:'v88x',id:'steg-tower',text:'Frankfurt: drive to the Eiserner Steg (red iron footbridge): the 4 towers at its ends have windows, a door and a red roof (no plain beige pillar).'},
 {ver:'v88x',id:'crowd-car',text:'Look at crowds next to parked cars: nobody stands inside a car.'},
 {ver:'v88w',id:'bricks2x',text:'Drive slowly past houses and shops: walls show LEGO brick rows, low flat roofs show studs, nothing flickers or shimmers. Far away the city looks as before.'},
 {ver:'v88w',id:'world-smooth2',text:'PC and phone: drive 1 minute in Frankfurt and in Athens. ⚙ TUNE → Life → Show FPS: copy the line into the notes (draws about 200 or less). Map icons still float over missions.'},
 {ver:'v88w',id:'ath-popup',text:'Athens: drive along streets for 1–2 minutes: a pop-up challenge ring (RAMP JUMP, DRIFT ZONE…) appears ahead in your lane; drive through it to start.'},
 {ver:'v88v',id:'world-smooth',text:'PC and phone: drive 1 minute fast in Frankfurt and in Athens. It feels smoother than before. ⚙ TUNE → Life → Show FPS: copy the line into the notes (draws should be about 250 or less, tris about 1 M).'},
 {ver:'v88v',id:'world-look',text:'Look far down long streets and from bridges: the far city still looks like the city (same colours, no holes, no flicker). Up close, buildings, trees and cars look exactly as before.'},
 {ver:'v88v',id:'world-cars',text:'Traffic cars look normal up close; far away they look simpler but have the right colour and shape, and no car pops in or out right in front of you.'},
 {ver:'v88u',id:'perf-smooth',text:'The game runs smoothly on PC and phone in Frankfurt and in Athens: drive 1 minute fast through busy streets, no stutter. If it still lags: ⚙ TUNE → Life → turn on "Show FPS" and send a screenshot of the line at the bottom while driving.'},
 {ver:'v88u',id:'perf-pc',text:'Turn on ⚙ TUNE → Life → Show FPS on PC, drive in Frankfurt for 30 s, and copy the line at the bottom left into the notes here.'},
 {ver:'v88u',id:'perf-people',text:'Streets still feel alive but not crowded: a few groups of people ahead, not a crowd everywhere.'},
 {ver:'v88u',id:'perf-pop',text:'The first pop-up ring of a drive appears without a hitch.'},
 {ver:'v88t',id:'sc-rides',text:'Garage RIDES → STREET: a SPEED SERIES row shows Time Coupe, Red Hypercar and Gold Formula; each looks like a LEGO Speed Champions car (8 studs wide, chunky, real parts).'},
 {ver:'v88t',id:'sc-drive',text:'Equip each of the 3 new cars, SAVE & DRIVE: all four tyres sit on the road and it handles like the other normal cars.'},
 {ver:'v88t',id:'sc-guide',text:'▶ GUIDE on each of the 3 new cars plays it step by step (chassis → wheels → nose → sides → cockpit → rear → wing).'},
 {ver:'v88t',id:'sc-traffic',text:'Drive around Frankfurt or Athens: you meet the grey Time Coupe and the red Hypercar in traffic. In a race, some rivals drive the new cars.'},
 {ver:'v88t',id:'sb-pal',text:'In the guide tap ✋ BUILD IT: the next part is already selected (highlighted) in the parts palette, in its colour, and scrolled into view.'},
 {ver:'v88t',id:'sb-onetap',text:'In BUILD IT, one tap on (or near) the green ghost places the part straight away; no second tap or PLACE needed.'},
 {ver:'v88q',id:'pin-fold',text:'Garage RIDES: the checklist shows as a small ✓ chip and does not cover the car; tap it to open. In a race it stays folded during the 3-2-1-GO countdown, then opens again.'},
 {ver:'v88p',id:'life-crowds',text:'Drive 1 minute in Frankfurt and in Athens: at most street corners ahead you see a group of 3-6 people standing together; they turn to look, wave and hop as you come by.'},
 {ver:'v88p',id:'life-dodge',text:'Drive fast past a corner group: the people leap out of the way; nobody stands on the road.'},
 {ver:'v88p',id:'life-stalls',text:'You pass market stalls (striped awnings, fruit boxes) and café tables with umbrellas on the pavements. Drive into one: it bursts into bricks and studs; it does not stop you dead.'},
 {ver:'v88p',id:'life-parked',text:'Parked cars stand half on the kerb on many streets ahead; driving into one slowly bumps you off it, fast smashes it.'},
 {ver:'v88p',id:'pop-ring',text:'While free-roaming, every ~30 s a coloured ring with a sign (RAMP JUMP, DRIFT ZONE, SMASH STREAK, CONE SLALOM) appears on the road ahead in your lane. Only one at a time, no new buttons or panels.'},
 {ver:'v88p',id:'pop-play',text:'Drive through a ring: the objective line shows the challenge, the progress and the seconds left. Finish it: big brick burst and +150 studs. Miss it: a short MISSED message, nothing else.'},
 {ver:'v88p',id:'pop-each',text:'Try all four: the ramp launches you, the drift counts only while drifting, the crates smash, the cones fly when you clip them.'},
 {ver:'v88p',id:'life-fps2',text:'On the phone the game still runs smoothly in a busy street with a pop-up running.'},
 {ver:'v88o',id:'pin-strip',text:'This checklist stays on screen while you drive, race and build: answer with ✅ / ❌, ‹ › to move, tap the counter to fold it to a chip. Steering and gas keep working while you tap it.'},
 {ver:'v88o',id:'clear-base',text:'Garage BUILD → ⋯ MORE → CLEAR on a normal car and on the Bus: only the chassis and wheels stay, with one clean grid and nothing overlapping. UNDO brings the build back.'},
 {ver:'v88o',id:'gx-palette',text:'Garage BUILD (phone): the parts palette shows 2 rows of bigger tiles with names; swipe it sideways to see more. ▾ makes it small again.'},
 {ver:'v88o',id:'gx-chips',text:'Tap the category chips (BRICKS, PLATES, SLOPES…): only those parts show. Pick a few parts, then tap 🕘 RECENT: the parts you just used are first.'},
 {ver:'v88o',id:'gx-fav',text:'Long-press a part tile (right-click on PC): it gets a ★ and shows under ★ FAVS. Long-press again removes it. It is still there after a reload.'},
 {ver:'v88o',id:'gx-make',text:'Tap ☝ SELECT, tap 3–4 parts, then MAKE GROUP: a group "Group 1" appears in the ⛓ GROUPS list. ✎ renames it.'},
 {ver:'v88o',id:'gx-eye',text:'In ⛓ GROUPS tap the 👁 eye: the group disappears and its parts cannot be tapped; tap again to show it. SAVE & DRIVE with it hidden: the car you drive is complete.'},
 {ver:'v88o',id:'gx-ops',text:'Tap a group name: MOVE, COPY, MIRROR and DELETE work on the whole group (UNDO brings a deleted group back).'},
 {ver:'v88o',id:'gx-hideup',text:'Open a big template (Bus), step the LAYER ▼ down and tap HIDE UP: everything above the layer disappears so you can build inside; SHOW UP brings it back.'},
 {ver:'v88n',id:'life-people',text:'Drive 1 minute in Frankfurt: you see people on the pavements most of the time, and some wave both arms as you pass them.'},
 {ver:'v88n',id:'life-traffic',text:'Traffic cars show up on the streets around you (not only far away), including orange and pink street racers; they still do not block the inner lane.'},
 {ver:'v88n',id:'life-pigeons',text:'Drive toward a group of grey pigeons on a pavement: they fly off before you reach them. White gulls circle high above.'},
 {ver:'v88n',id:'life-sky',text:'Look around: red/white flags flap on some rooftops and a LEGO blimp slowly circles over the city (Athens: blue/white flags).'},
 {ver:'v88n',id:'life-boats',text:'Frankfurt: boats sail up and down the Main. Drive the boat into one: you bounce off, you do not pass through it.'},
 {ver:'v88n',id:'life-colours',text:'Frankfurt buildings have bold LEGO colours (red, yellow, blue, green); Athens old-town houses are warm yellow/orange. Nothing looks washed out.'},
 {ver:'v88n',id:'life-fps',text:'On the phone the game runs as smoothly as before in a busy street (no new stutter).'},
 {ver:'v88n',id:'life-knob',text:'⚙ TUNE → Life → "World life (master)" at 0 makes the streets quiet again; at 1.5 they get busier.'},
 {ver:'v88l',id:'sb-open',text:'Garage RIDES: every car card has ▶ GUIDE; tapping it plays that car being built step by step (parts drop in, a parts box on the left, a counter like 1/22 top right).'},
 {ver:'v88l',id:'sb-ctrl',text:'In the guide: ◀ ▶ change the step, PLAY/PAUSE, ×1/×2, the slider jumps; no button covers the car on the phone; EXIT goes back to the garage with your car unchanged.'},
 {ver:'v88l',id:'sb-more',text:'BUILD → ⋯ MORE → BUILD GUIDE works for any car (also the bus or your own build); EXIT returns to BUILD.'},
 {ver:'v88l',id:'sb-diy',text:'In the guide tap ✋ BUILD IT: the next parts show as a green ghost; tapping near it snaps the part in; 💡 PLACE IT places it for you; ✕ before the end restores the car.'},
 {ver:'v88k',id:'su-rides',text:'Garage RIDES → STREET: the row STREET RACER FAMILY shows 4 cars (Orange Street Racer + 3 variations), then TUNER FRIENDS with 3 more.'},
 {ver:'v88k',id:'su-look',text:'Orange Street Racer looks like the LEGO set: orange, open top with blue seats, lime side graphics, grey wing on struts, silver wheels.'},
 {ver:'v88k',id:'su-drive',text:'Equip the Orange Street Racer, SAVE & DRIVE: it drives like the other normal cars (not slow like the bus).'},
 {ver:'v88k',id:'su-tyres',text:'All four tyres of every new car sit on the road, including the Widebody Track Racer and the Black Gold V8 (gold wheels).'},
 {ver:'v88k',id:'su-build',text:'✎ BUILD on a new car: its parts load and you can remove the wing or recolour it.'},
 {ver:'v88i',id:'big-rides',text:'Garage RIDES: the Sightseeing Bus, Box Truck, Stretch Limo and Monster Truck show up and look like LEGO vehicles; equip each one and SAVE & DRIVE.'},
 {ver:'v88i',id:'big-junction',text:'Drive the Bus or the Truck through 3 junctions in Frankfurt: it turns wider than a car but never gets stuck on a corner.'},
 {ver:'v88i',id:'big-feel',text:'A big car picks up speed more slowly than the Hot Rod, and the camera shows the whole vehicle.'},
 {ver:'v88i',id:'big-tyres',text:'All four tyres of each big template sit on the road (no floating, no sinking), including the Monster Truck.'},
 {ver:'v88i',id:'big-build',text:'Garage BUILD on a big template: you can place bricks along the full length and on the roof; the camera shows the whole car.'},
 {ver:'v88i',id:'big-pc-cam',text:'On PC: drive the Bus and the Box Truck; the camera sits above the roof and you can see the road ahead over the vehicle.'},
 {ver:'v88i',id:'big-limo',text:'Drive the Stretch Limo through a few junctions: it turns wider than a car, tyres on the road, nothing stuck.'},
 {ver:'v88i',id:'small-same',text:'Switch back to a normal car: it drives exactly like before.'},
 {ver:'v88h',id:'city-reenter',text:'Leave free roam (menu, a race or garage SAVE & DRIVE), come back, then logbook ALL (TEST) → GO to Hot Drop: the city is fully built around you (road, kerbs, grass, buildings), no floating roofs.'},
 {ver:'v88h',id:'city-far',text:'After coming back to free roam, drive or GO to the far side of town (2+ km): the streets and buildings there are drawn, not a pale empty plane.'},
 {ver:'v88g',id:'turn60',text:'Normal turn at a junction at 50–80 km/h with GAS only: the car turns cleanly where it points, no sliding sideways.'},
 {ver:'v88g',id:'brake-turn',text:'Brake briefly before or in a turn (tap BRAKE, or ↓ while holding ↑ on PC): the car slows down and does NOT start a drift.'},
 {ver:'v88g',id:'drift-gb',text:'Hold GAS + BRAKE together while steering at 80+ km/h for about a second: it still becomes a drift.'},
 {ver:'v88g',id:'phone-thumb',text:'Phone: rest your thumb near the line between GAS and BRAKE and tap BRAKE in a turn: no accidental drift.'},
 {ver:'v88f',id:'steer-turn',text:'Turn left or right at a junction at 60–80 km/h: the car settles straight within about a second, no wobbling.'},
 {ver:'v88f',id:'steer-tap',text:'Tap ◀ or ▶ briefly on a straight road: the car moves over a little, no jerk and no swinging back and forth.'},
 {ver:'v88f',id:'route-follow',text:'Hot Drop (follow Hilde): the yellow route follows the roads, no sudden U-turns, and the top line says "left/right in … m" a few seconds before each turn.'},
 {ver:'v88f',id:'route-zig',text:'Any mission with a route: no random left-right zig-zags through side streets.'},
 {ver:'v88f',id:'build-layer',text:'Garage BUILD: ▲▼ changes the layer; bricks land on the chosen layer and the layers above are see-through.'},
 {ver:'v88f',id:'build-view',text:'Garage BUILD: the TOP / SIDE / 3D buttons switch the view.'},
 {ver:'v88f',id:'map-chips',text:'Map: the legend chips hide and show garages, races and other icons; your choice is still there after you close and reopen the map.'},
 {ver:'v88f',id:'garage-popup',text:'Garage: a CATEGORY / COLOUR / MORE popup closes after you pick, and no buttons hide under each other or under ⚙.'},
 {ver:'v88f',id:'music',text:'Music plays after your first tap (iPhone and the Claude app).'}];
{const KEY='mho_chk',esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
 const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return{}}},save=s=>{try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}};
 const k=it=>it.ver+'/'+it.id;
 // CK2 (Alex 2026-10-13: "separate the checklist pc/phone and also make it easy to approve while playing not open close", "allow some filtering eg
 // garage, race, city, person"): answers are kept per device (📱 PHONE = touch screen, 💻 PC = mouse); an item with dev:'phone'|'pc' (or whose text
 // starts "Phone"/"PC") only shows on that device. AREA chips (GARAGE · RACE · CITY · PEOPLE · HUD) use it.area or words in the text. The filter
 // (mho_chk._f) also drives the pinned strip, whose folded chip keeps ✅ / ❌ so an item is answered with one tap while playing.
 const DEV=(()=>{try{return matchMedia('(pointer:coarse)').matches?'ph':'pc'}catch(e){return'pc'}})(),DEVN={ph:'📱 PHONE',pc:'💻 PC'};
 const devOf=it=>it.dev?(it.dev==='pc'?'pc':'ph'):/^(phone|iphone|touch)\b/i.test(it.text)?'ph':/^(pc|desktop|keyboard|mouse)\b/i.test(it.text)?'pc':'';
 const AREAS=[['all','ALL'],['garage','GARAGE'],['race','RACE'],['city','CITY'],['people','PEOPLE'],['hud','HUD']];
 const AREA_RX={garage:/garage|\brides?\b|\bbuild|paint|showroom|\bkits?\b/i,race:/\brac(e|es|ing)\b|\bcup\b|\blaps?\b|countdown|finish|rival/i,
  city:/frankfurt|athens|\bcity\b|street|road|traffic|\bdriv(e|ing)\b|roam|tree|props?\b|river|boat|jump/i,people:/minifig|pedestrian|people|person|driver|\bnpc|human|giant|statue|\bhost/i,
  hud:/\bhud\b|button|checklist|menu|popup|\bpin\b|objective|screen|minimap|updates|\btext\b/i};
 const areaOf=it=>it.area?[].concat(it.area):Object.keys(AREA_RX).filter(a=>AREA_RX[a].test(it.text));
 const flt=()=>{const f=load()._f||{};return{d:f.d==='pc'||f.d==='ph'?f.d:DEV,a:f.a||'all'}};
 const show=(it,F=flt())=>{const d=devOf(it);return(!d||d===F.d)&&(F.a==='all'||areaOf(it).includes(F.a))};
 const res=(s,it,d=flt().d)=>s[k(it)+'|'+d]||s[k(it)]||{};  // answers from before v90j (no device) count on both devices
 const rset=(s,it,o)=>{const kk=k(it)+'|'+flt().d;s[kk]=Object.assign({},res(s,it),s[kk]||{},o)};
 const cur=()=>OD_CHECKLIST.filter(it=>it.ver===OD_CHECKLIST[0].ver&&show(it));
 // 📍 GO (coordinator v90j: items a 2-min drive never reaches): drops the car on the nearest street facing the thing to check; items with
 // several things step through them on each tap. Another city → the flight there (tap 📍 again after landing). Palms → the Syntagma race.
 // Targets: w = a LEGO world model (LDW.on), p = a street prop type (HUB.props), car = a traffic car kind, race = a track id.
 const GO={'v90k/rv-scale':[{c:'fra',n:'ride scale',fn:()=>RSZ_go()}],'bxT/bx-t-cliff':[{bx:'bx-t-cliff',n:'cliff run'}],'bxT/bx-t-city':[{bx:'bx-t-city',n:'two-level city'}],'bxT/bx-t-canyon':[{bx:'bx-t-canyon',n:'canyon split'}],'bxA/bx-snap':[{bx:'bx-snap',n:'snap test'}],'bxA/bx-jump':[{bx:'bx-jump',n:'cliff jump'}],'bxA/bx-offroad':[{bx:'bx-offroad',n:'off-road'}],'bxA/bx-cliff':[{bx:'bx-cliff',n:'cliff fall'}],'bxA/bx-water':[{bx:'bx-water',n:'water'}],'bxA/bx-bridge':[{bx:'bx-bridge',n:'bridge'}],'bxA/bx-split':[{bx:'bx-split',n:'split'}],'bxA/bx-elev':[{bx:'bx-elev',n:'elevation'}],'bxA/bx-world':[{bx:'bx-world',n:'new track'}],'v90k/park-sit':[{c:'fra',n:'parked car',fn:()=>{if(RO.foot&&RO.foot!=='car')return'📍 Get back in the car first';const q=rfSnap(RO.x,RO.z,400);if(q&&!roamWarp(q[0],q[1],q[2]??RO.h))return'📍 Can\'t jump right now';RO.v=0;setTimeout(()=>{try{if(OF_canExit())OF_exit()}catch(e){}},400);return'📍 PARKED CAR · check its tyres touch the road'}}],'v90k/shadow':[{car:'',c:'fra',n:'traffic car'}],'v90k/fra-net':[{c:'fra',n:'motorway ramp',fn:()=>{const r=AB_netChk();window.__chk.net=r;const Z=AB_AUTO[(goI.net=((goI.net??-1)+1)%Math.max(1,AB_AUTO.length))];if(Z){const[x,z]=Z.pts[0],[x1,z1]=Z.pts[1];roamWarp(x-(x1-x)*.1,z-(z1-z)*.1,Math.atan2(x1-x,z1-z));RO.v=0}return'📍 NET · '+r.comps+' network, '+r.dead+' dead ends, ramps '+Object.entries(r.mw).map(([k,n])=>k+':'+n).join(' ')+(r.ok?' ✅':' ❌')+(Z?' · '+Z.name:'')}}],'v90k/ath-kriezi':[{c:'ath',n:'Kriezi street',fn:()=>{const q=rfSnap(2142,-1419,200);if(!q||!roamWarp(q[0],q[1],q[2]??RO.h))return'📍 Can\'t jump right now';RO.v=0;const r=RD_kriezi();window.__chk.kriezi=r;return'📍 KRIEZI · '+(r.ok?'asphalt, no walls ✅':'FAIL ❌')}}],'v90k/lag':[{get c(){return CID},n:'props LOD',fn:()=>{const r=LDS.chk();window.__chk.lag=r;return'📍 LAG · props near '+r.near+' far '+r.far+' wrong '+r.wrong+(r.wrong?' ❌':' ✅')}}],'v90g/fra-props':[{w:'w6350',n:'Pizza To Go'},{w:'w6613',n:'phone booth'},{w:'w10184f',n:'fountain'},{w:'w1069',n:'speedboat'}],
  'v90g/ath-display':[{w:'w30023',n:'lighthouse'},{w:'w7796',n:'house'}],'v90g/bigrig':[{car:'v3221_1',c:'fra',n:'Big Rig'}],
  'v90g/land2':[{p:'planter',c:'fra',n:'planter'},{p:'dumpster',c:'fra',n:'dumpster'}],'v90i/palms':[{race:'synt',c:'ath',n:'Syntagma race'}],
  'v90j/fra-props':[{p:'cone',c:'fra',n:'cone'},{p:'barrier',c:'fra',n:'barrier'},{p:'clight',c:'fra',n:'warning light'},{p:'sign',c:'fra',n:'STOP sign'},{p:'rock',c:'fra',n:'rock'}],
  'v90j/ath-trees':[{p:'CE_pine',c:'ath',n:'pine'},{p:'CE_olive',c:'ath',n:'olive tree'},{p:'CE_cypress',c:'ath',n:'cypress'},{p:'CE_rock',c:'ath',n:'rock'}]};
 // chk-1 (Alex v90j-beta: "checklist has no GO scenarios"): every item without its own target gets one from its area/text:
 // garage items open the garage (RIDES); Athens items fly to Athens; the rest drive in Frankfurt free roam.
 for(const it of OD_CHECKLIST){if(GO[k(it)])continue;const t=(it.text||'').toLowerCase();
  GO[k(it)]=[(it.area==='garage'||/^garage|garage →|rides →/.test(t))?{gar:1,n:'garage'}:/athens|syntagma|acropolis/.test(t)?{here:1,c:'ath',n:'Athens free roam'}:{here:1,c:'fra',n:'Frankfurt free roam'}]}
 const goI={},goSay=t=>{goI._t=t;try{say('',t,2.2)}catch(e){}};
 const goCity=T=>T.gar?CID:T.c||(T.w&&((LDW_P.find(q=>q.model===T.w)||{}).city))||'fra';
 const goAt=T=>{if(T.w){const E=LDW.on.find(e=>e.id===T.w);return E&&{x:E.x,z:E.z}}
  if(T.p){let b=null,bd=1e18;for(const q of HUB.props||[]){if(q.t!==T.p||q.alive===false)continue;const d=(q.x-RO.x)**2+(q.z-RO.z)**2;if(d>900&&d<bd){bd=d;b=q}}return b&&{x:b.x,z:b.z}}
  if(T.car){const c=(HUB.cars||[]).find(c=>!c.dead&&String(HCAR[c.k]).includes(T.car));return c&&{x:c.x,z:c.z}}return null};
 const goJump=it=>{const L=GO[k(it)];if(!L)return;if(L[0].bx){goI._t=L[0].n;BX_test(L[0].bx);return}const i=goI[k(it)]=((goI[k(it)]??-1)+1)%L.length,T=L[i],c=goCity(T);let st='';try{st=state}catch(e){}
  if(c!==CID){if(st==='roam'&&cityTravel(c)){goSay('✈ Flying to '+(c==='ath'?'Athens':'Frankfurt')+' · tap 📍 again after landing');goI[k(it)]=i-1}else{goI[k(it)]=i-1;goSay('📍 Loading a test drive in '+(c==='ath'?'Athens':'Frankfurt')+'…');setTimeout(()=>{location.href=TQ_url(c,{go:k(it)})},300)}return}
  if(T.fn){if(st!=='roam'||!RO.on){{goI[k(it)]=i-1;goSay('📍 Loading a test drive…');setTimeout(()=>{location.href=TQ_url(c,{go:k(it)})},300)}return}goSay(T.fn());return}
  if(T.gar){if(st!=='roam'||!RO.on){{goI[k(it)]=i-1;goSay('📍 Loading a test drive…');setTimeout(()=>{location.href=TQ_url(c,{go:k(it)})},300)}return}if(RO.ch||RO.sp){try{if(RO.sp)sprintEnd();chAbort()}catch(e){}}gbOpen();goSay('📍 GARAGE');return}
  if(T.here){if(st!=='roam'||!RO.on){{goI[k(it)]=i-1;goSay('📍 Loading a test drive…');setTimeout(()=>{location.href=TQ_url(c,{go:k(it)})},300)}return}goSay('📍 '+T.n.toUpperCase()+' · drive');return}
  if(T.race){if(st!=='roam'||!RO.on){{goI[k(it)]=i-1;goSay('📍 Loading a test drive…');setTimeout(()=>{location.href=TQ_url(c,{go:k(it)})},300)}return}if(RO.ch||RO.sp){try{if(RO.sp)sprintEnd();chAbort()}catch(e){}}roamSavePos();if(CM.on)cmClose();RO.on=false;$('#roam').hidden=true;RO.card=null;
   menuTab='quick';menuTrack=T.race;quickTraffic=false;RO.launching=true;startRace();RO.launching=false;RO.fromRoam=true;return}  // like a roam race marker: back to the city after the race
  if(st!=='roam'||!RO.on){{goI[k(it)]=i-1;goSay('📍 Loading a test drive…');setTimeout(()=>{location.href=TQ_url(c,{go:k(it)})},300)}return}
  if(RO.ch||RO.sp){const nm=((RO.ch&&RO.ch.m&&RO.ch.m.ev&&RO.ch.m.ev.name)||(RO.sp&&RO.sp.e&&RO.sp.e.name)||'the event').toUpperCase();
   if(!(goI._ok>performance.now())){goI._ok=performance.now()+6000;goI[k(it)]=i-1;goSay('📍 This leaves '+nm+' (you can restart it) · tap 📍 again to go');return}
   goI._ok=0;try{if(RO.sp)sprintEnd();chAbort()}catch(e){}}
  if(RO.wk){goSay('📍 Get back in the car first');return}
  const t=goAt(T);if(!t){goSay('📍 No '+T.n+' nearby right now · try again');return}
  let q=rfSnap(t.x,t.z,220)||[t.x+12,t.z+12];if(T.car&&q[2]!=null)q=[q[0]-Math.sin(q[2])*20,q[1]-Math.cos(q[2])*20];const h=Math.atan2(t.x-q[0],t.z-q[1])+(T.car?0:.35);  // .35 rad: the thing sits beside the car, not hidden behind it · a traffic car: 20 m back along its road, not on top of it
  if(roamWarp(q[0],q[1],h))goSay('📍 '+T.n.toUpperCase()+(L.length>1?` · ${i+1}/${L.length}, tap 📍 for the next`:''));else goSay('📍 Can\'t jump right now')};
 const open=()=>{const s=load();return cur().filter(it=>!res(s,it).st).length};
 const st=document.createElement('style');st.textContent=`#odChk{position:fixed;inset:0;z-index:9100;display:flex;align-items:center;justify-content:center;background:rgba(10,14,30,.6);padding:8px;box-sizing:border-box;user-select:none;-webkit-user-select:none}#odChk[hidden]{display:none}
#odChk .cc{width:min(720px,100%);max-height:100%;display:flex;flex-direction:column;background:#0b1626;border:3px solid #3ddc84;border-radius:16px;color:#e8f2fa;font:600 13px system-ui}
#odChk .ch{display:flex;align-items:center;gap:8px;padding:6px 10px;border-bottom:2px solid #1d3550}#odChk .ch b{font:italic 900 20px var(--hud,system-ui)}#odChk .ch small{color:#9fb3c8;font-size:12px}
#odChk .ch button,#odChk .ci button{font:900 13px system-ui;min-width:44px;min-height:44px;border-radius:10px;border:2px solid #4ceaff;background:#12304a;color:#fff;padding:0 10px}#odChk .ch [data-c=copy]{margin-left:auto}body.ckOn #tuG{visibility:hidden}
#odChk .cb{overflow-y:auto;-webkit-overflow-scrolling:touch;padding:4px 10px 10px}#odChk .ci{display:flex;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid #ffffff14;flex-wrap:wrap}
#odChk .ci p{flex:1 1 300px;margin:0;line-height:1.35;font-size:13px}#odChk .ci .pa.on{background:#3ddc84;border-color:#3ddc84;color:#0b1626}#odChk .ci .fa.on{background:#ff4d6d;border-color:#ff4d6d}
#odChk .ci input{flex:1 1 100%;min-height:36px;font:13px system-ui;background:#0d1a2c;color:#fff;border:1px solid #4ceaff55;border-radius:8px;padding:4px 8px;user-select:text;-webkit-user-select:text}
#odChk .msg{color:#ffd12c;font-size:12px}#odChk .cf{display:flex;gap:4px;padding:4px 10px;overflow-x:auto;border-bottom:2px solid #1d3550;flex:none}#odChk .cf i{flex:none;width:8px}
#odChk .cf button{flex:none;min-height:36px;min-width:44px;border-radius:9px;border:2px solid #4ceaff;background:#12304a;color:#fff;font:900 12px system-ui;padding:0 8px}#odChk .cf button.on{background:#ffd12c;border-color:#ffd12c;color:#0b1626}.ckB{font:800 13px system-ui;min-height:44px;border-radius:10px;border:2px solid #3ddc84;background:#10301f;color:#fff;padding:0 10px}`;document.head.appendChild(st);
 const ov=document.createElement('div');ov.id='odChk';ov.hidden=true;document.body.appendChild(ov);
 for(const ev of['touchstart','touchmove','touchend','pointerdown','mousedown','wheel'])ov.addEventListener(ev,e=>e.stopPropagation(),{passive:true});
 for(const ev of['keydown','keyup'])ov.addEventListener(ev,e=>{if(e.target.tagName==='INPUT')e.stopPropagation()});
 const text=()=>{const s=load();return 'Mainhattan Overdrive checklist '+OD_VER+'\n'+OD_CHECKLIST.map(it=>['ph','pc'].filter(d=>!devOf(it)||devOf(it)===d).map(d=>{const r=res(s,it,d);return `${it.ver} ${it.id} ${d==='ph'?'phone':'pc'}: ${r.st||'-'}${r.n?' · '+r.n:''}`}).join('\n')).join('\n')};
 const badge=()=>{try{pinR()}catch(e){}const n=open();document.querySelectorAll('.ckB').forEach(b=>b.textContent='✔ CHECKLIST'+(n?` (${n})`:''))};
 const render=msg=>{const s=load(),v=OD_CHECKLIST[0].ver;let h=`<div class="cc"><div class="ch"><b>TEST CHECKLIST</b><small>${esc(v)} · ${open()} open</small><button data-c="copy">COPY RESULTS</button><button class="x" data-c="x">✕</button></div>`;const F=flt();
  h+=`<div class="cf">${['ph','pc'].map(d=>`<button data-c="d:${d}" class="${F.d===d?'on':''}">${DEVN[d]}</button>`).join('')}<i></i>${AREAS.map(([a,n])=>`<button data-c="a:${a}" class="${F.a===a?'on':''}">${n}</button>`).join('')}</div><div class="cb">${msg?`<div class="msg">${esc(msg)}</div>`:''}`;
  const L=OD_CHECKLIST.filter(it=>show(it,F));if(!L.length)h+=`<div class="msg">Nothing to check for ${DEVN[F.d]} in ${F.a.toUpperCase()}.</div>`;
  for(const it of L){const r=res(s,it,F.d);h+=`<div class="ci" data-k="${esc(k(it))}"><p>${it.ver===v?'':`<small>${esc(it.ver)} · </small>`}${esc(it.text)}</p><button class="pa ${r.st==='PASS'?'on':''}" data-c="PASS">✅ PASS</button><button class="fa ${r.st==='FAIL'?'on':''}" data-c="FAIL">❌ FAIL</button>${GO[k(it)]?'<button class="go" data-c="GO" title="Jump there">📍 GO</button>':''}<input type="text" placeholder="note (optional)" value="${esc(r.n||'')}"></div>`}
  ov.innerHTML=h+'</div></div>';badge()};
 const copy=()=>{const t=text();const done=()=>render('Copied: paste it to the coordinator.');
  const fb=()=>{const a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;left:0;top:0;opacity:0';document.body.appendChild(a);a.select();let ok=false;try{ok=document.execCommand('copy')}catch(e){}a.remove();ok?done():render('Copy blocked here; long-press to select:\n'+t)};
  try{navigator.clipboard.writeText(t).then(done,fb)}catch(e){fb()}};
 ov.addEventListener('click',e=>{if(e.target===ov){ov.hidden=true;document.body.classList.remove('ckOn');return}const b=e.target.closest('button');if(!b)return;const c=b.dataset.c;try{AU.sfx('pick')}catch(er){}
  if(c==='x'){ov.hidden=true;document.body.classList.remove('ckOn')}else if(c==='copy')copy();else if(c==='PASS'||c==='FAIL'){const it=OD_CHECKLIST.find(q=>k(q)===b.closest('.ci').dataset.k),s=load();if(it){rset(s,it,{st:res(s,it).st===c?'':c});save(s)}render()}
  else if(c==='GO'){const it=OD_CHECKLIST.find(q=>k(q)===b.closest('.ci').dataset.k);ov.hidden=true;document.body.classList.remove('ckOn');if(it)setTimeout(()=>goJump(it),50)}
  else if(/^[da]:/.test(c)){const s=load();s._f=Object.assign(flt(),c[0]==='d'?{d:c.slice(2)}:{a:c.slice(2)});s._pin=Object.assign(pst(),{i:0});save(s);render();try{pinR()}catch(er){}}});
 ov.addEventListener('change',e=>{const i=e.target;if(i.tagName!=='INPUT')return;const it=OD_CHECKLIST.find(q=>k(q)===i.closest('.ci').dataset.k),s=load();if(it){rset(s,it,{n:i.value.slice(0,200)});save(s)}});
 window.odChkOpen=()=>{render();ov.hidden=false;document.body.classList.add('ckOn')};
 const mk=()=>{const b=document.createElement('button');b.className='ckB';b.addEventListener('click',e=>{e.stopPropagation();try{if(typeof TU_toggle==='function')TU_toggle(false)}catch(er){}document.getElementById('odUpd')&&(document.getElementById('odUpd').hidden=true);odChkOpen()});return b};
 // ⚙ drawer header (re-rendered on every change) and the UPDATES screen header
 if(typeof TU_render==='function'){const r0=TU_render;TU_render=function(){r0.apply(this,arguments);const th=TU.el&&TU.el.querySelector('.th');if(th&&!th.querySelector('.ckB'))th.appendChild(mk());badge()}}
 if(typeof window.odUpdOpen==='function'){const u0=window.odUpdOpen;window.odUpdOpen=function(){u0.apply(this,arguments);const u=document.querySelector('#odUpd .ub');if(u&&!u.querySelector('.ckB')){const b=mk();b.style.cssText='display:block;margin:8px 0 2px';u.insertBefore(b,u.firstChild)}badge()}}
 // ---- PIN (Alex 2026-10-08: "the checklist should be staying while i am playing the game"): a mini checklist pinned on screen in roam, races,
 // missions and the garage. Expanded: counter (tap = fold to a chip), item text (tap = full panel with notes + COPY RESULTS), ✅ / ❌, ‹ ›.
 // Folded: a "✓ 3/8" chip. It can only be dismissed (✕ on the chip) once every item of the version is answered. State lives in mho_chk._pin.
 // Touches on it never reach the controls under it and it never pauses the game.
 const pst=()=>{const s=load(),v=OD_CHECKLIST[0].ver;let P=s._pin;if(!P||P.v!==v)P={v,i:0,col:0,done:0};return P},psave=P=>{const s=load();s._pin=P;save(s)};
 // the strip walks the items of the newest 3 versions (a small hotfix release must not hide the open items of the release before it)
 const pinItems=()=>{const V=[...new Set(OD_CHECKLIST.map(it=>it.ver))].slice(0,3);return OD_CHECKLIST.filter(it=>V.includes(it.ver)&&show(it))};
 let pinBkOpen=0;const pinBk=()=>{const X=document.getElementById('gbx');return !!X&&!X.hidden&&X.getClientRects().length>0};
 // v88o2 (reviewer): folded in every garage mode (it covered the car preview in RIDES) unless opened there, and during the race GO countdown + first 3 s
 // RF5 (reviewer): folded chip in races, parked under LAP; hidden only while the big FINISH place text shows; on results at the card's top-right corner
 const pinCd=()=>{try{return state==='countdown'||state==='race'||state==='results'}catch(e){return false}},pinRun=()=>{try{return state==='finished'}catch(e){return false}};
 const pin=document.createElement('div');pin.id='odPin';pin.hidden=true;document.body.appendChild(pin);
 for(const ev of['touchstart','touchmove','touchend','pointerdown','pointerup','pointermove','mousedown','mouseup','wheel','dblclick'])pin.addEventListener(ev,e=>e.stopPropagation(),{passive:true});
 const pinR=()=>{const P=pst(),C=pinItems(),s=load(),n=C.length,ans=C.filter(it=>res(s,it).st).length;
  const busy=!ov.hidden||!n||pinRun()||P.done&&ans===n||!!document.querySelector('#gbx.sbDiy')||(()=>{const l=document.getElementById('loading');return l&&!l.hidden&&getComputedStyle(l).display!=='none'})();
  pin.hidden=!!busy;if(busy)return;P.i=Math.max(0,Math.min(n-1,P.i|0));const it=C[P.i],r=res(s,it);let h;const pinBld=pinBk()&&typeof GB_!=='undefined'&&GB_.bk,fold=P.col||(pinBk()&&(!pinBkOpen||pinBld))||pinCd();
  if(fold)h=`<button class="pc" data-p="exp" title="Show the checklist">✓ ${ans}/${n}</button>`+(ans===n?`<button class="px" data-p="done" title="Hide (all answered)">✕</button>`:
   `<p class="pt" data-p="exp" title="${esc(it.text)}">${esc(it.text)}</p><button class="pa ${r.st==='PASS'?'on':''}" data-p="PASS" title="Pass">✅</button><button class="fa ${r.st==='FAIL'?'on':''}" data-p="FAIL" title="Fail">❌</button><button class="pk" data-p="next" title="Skip">›</button>`);
  else h=`<button class="pn" data-p="col" title="Fold"><b>${P.i+1}/${n}</b><small>▴ ${ans}✓</small></button><p data-p="full" title="Open the full checklist (notes, COPY RESULTS)">${esc(it.text)}</p>`+
   `<button class="pa ${r.st==='PASS'?'on':''}" data-p="PASS" title="Pass">✅</button><button class="fa ${r.st==='FAIL'?'on':''}" data-p="FAIL" title="Fail">❌</button>`+
   `${GO[k(it)]?'<button class="pg" data-p="GO" title="Jump there">📍</button>':''}<span class="pv"><button data-p="prev" title="Previous">‹</button><button data-p="next" title="Next">›</button></span>`;
  pin.classList.toggle('col',!!fold);if(pin._h!==h){pin._h=h;pin.innerHTML=h}pinPlace()};
 // garage: sit in the free band between the left column (mode rail, selection / groups panels) and the right column (layer views, side panel)
 const pinPlace=()=>{const X=document.getElementById('gbx'),vis=e=>!!e&&!e.hidden&&e.getClientRects().length>0&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().width>0;
  {const st=(()=>{try{return state}catch(e){return''}})(),at=(x,y)=>{pin.style.transform='none';pin.style.width='';pin.style.left=Math.round(x)+'px';pin.style.top=Math.round(y)+'px'};
   if(st==='countdown'||st==='race'){const l=document.getElementById('lap');if(vis(l)){const r=l.getBoundingClientRect();at(r.left,r.bottom+10);return}}
   if(st==='results'){const c=document.querySelector('#results .card');if(vis(c)){const r=c.getBoundingClientRect();at(r.right-12-pin.offsetWidth,r.top+8);return}}}
  if(!vis(X)){pin.style.left='';pin.style.width='';pin.style.transform='';
   // roam / race / missions: below the objective line (quest tracker, objective pill) when it sits at the top centre
   if(innerWidth>900&&innerHeight>500){const g=document.querySelector('#tuG,#tuB,[id^="tu"][id$="G"]');let t=108;if(vis(g)){const r=g.getBoundingClientRect();if(r.top<160&&r.right>innerWidth-120)t=Math.round(r.bottom)+10}
    pin.style.transform='none';pin.style.left=Math.round(innerWidth-16-pin.offsetWidth)+'px';pin.style.top=t+'px';return}
   const a=pin.getBoundingClientRect();let t=54;for(const e of document.querySelectorAll('#roamArrow,#qTrk,#obj,#m1Next,[id*="Obj"],[class*="Pill"],[class*="pill"]')){if(pin.contains(e)||!vis(e))continue;const r=e.getBoundingClientRect();
    if(r.top<110&&r.bottom<150&&r.right>a.left&&r.left<a.right&&r.height<70)t=Math.max(t,Math.round(r.bottom)+6)}
   pin.style.top=t===54?'':`calc(env(safe-area-inset-top,0px) + ${t}px)`;return}pin.style.top='';let L=0,R=innerWidth;
  for(const q of['#r2R','#gxG','#slBar','#gsBar']){const e=document.querySelector(q);if(vis(e)){const r=e.getBoundingClientRect();if(r.top<120)L=Math.max(L,r.right+6)}}
  for(const q of['#b25 .b25V','#gbx .gbp']){const e=document.querySelector(q);if(vis(e)){const r=e.getBoundingClientRect();if(r.top<120&&r.left>L)R=Math.min(R,r.left-6)}}
  const w=Math.min(340,R-L),x=L+Math.max(0,(R-L-pin.offsetWidth)/2);if(w<200){pin.style.left='';pin.style.width='';pin.style.transform='';return}
  pin.style.transform='none';pin.style.width=P_col()?'':w+'px';pin.style.left=Math.round(P_col()?x:L+(R-L-w)/2)+'px'};
 const P_col=()=>pin.classList.contains('col');
 pin.addEventListener('click',e=>{e.stopPropagation();const b=e.target.closest('[data-p]');if(!b)return;const a=b.dataset.p,P=pst(),C=pinItems(),n=C.length;try{AU.sfx('pick')}catch(er){}
  if(a==='col'){P.col=1;pinBkOpen=0}else if(a==='exp'&&pinBk()&&typeof GB_!=='undefined'&&GB_.bk){psave(P);odChkOpen();pinR();return}else if(a==='exp'){P.col=0;if(pinBk())pinBkOpen=1}else if(a==='done'){P.done=1}else if(a==='prev'){P.i=(P.i-1+n)%n}else if(a==='next'){P.i=(P.i+1)%n}else if(a==='full'){psave(P);odChkOpen();pinR();return}else if(a==='GO'){goJump(C[P.i]);return}
  else if(a==='PASS'||a==='FAIL'){const s=load(),it=C[P.i],was=res(s,it).st===a;rset(s,it,{st:was?'':a});s._pin=P;save(s);
   if(!was){for(let j=1;j<=n;j++){const q=C[(P.i+j)%n];if(!res(s,q).st){P.i=(P.i+j)%n;break}}}}
  psave(P);pinR();badge()});
 {const st2=document.createElement('style');st2.textContent=`#odPin{position:fixed;z-index:8990;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 54px);width:min(340px,calc(100vw - 16px));box-sizing:border-box;display:flex;align-items:center;gap:4px;padding:4px;
 background:rgba(11,22,38,.88);border:2px solid #3ddc84;border-radius:12px;color:#e8f2fa;font:600 12px system-ui;user-select:none;-webkit-user-select:none;touch-action:manipulation;box-shadow:0 2px 0 rgba(0,0,0,.35)}#odPin[hidden]{display:none}
#odPin button{min-height:44px;border-radius:9px;border:2px solid #4ceaff;background:#12304a;color:#fff;font:900 12px system-ui;padding:0;cursor:pointer;flex:none}
#odPin .pn{width:46px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;border-color:#3ddc84}#odPin .pn b{font-size:13px}#odPin .pn small{font-size:12px;color:#9fe8bf;font-weight:800}
#odPin p{flex:1;min-width:0;margin:0;line-height:15px;max-height:30px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;cursor:pointer;font-size:12px}
#odPin .pa,#odPin .fa{width:44px;font-size:17px}#odPin .pg{width:36px;font-size:16px;border-color:#ffd12c}#odPin .pa.on{background:#3ddc84;border-color:#3ddc84}#odPin .fa.on{background:#ff4d6d;border-color:#ff4d6d}
#odPin .pv{display:flex;flex-direction:column;gap:2px}#odPin .pv button{width:28px;min-height:21px;height:21px;font-size:15px;line-height:1}
#odPin.col{width:auto;padding:2px;gap:3px}#odPin.col .pc{padding:0 12px;border-color:#3ddc84;background:#10301f;font-size:13px}#odPin.col .px{width:44px}#odPin.col .pt{flex:0 1 auto;max-width:min(170px,32vw);-webkit-line-clamp:2;font-size:12px}#odPin.col .pa,#odPin.col .fa{width:40px}#odPin.col .pk{width:26px;font-size:15px}
body.ckOn #odPin{display:none}body:has(#npcSay:not([hidden])) #odPin{display:none!important}body:has(#odPin:not([hidden])) #gbx.r2 #gsTip{top:calc(var(--r2hh,52px) + 66px)}`;document.head.appendChild(st2)}
 setInterval(pinR,700);pinR();
 // v89h: the strip never draws over a card (Alex: tip hidden at the start; PAUSE card's RESUME + title covered in roam). While any modal/card
 // v89j: + the first-drive tutorial card, the main menu's CHOOSE ACTIVITY title and garage dropdown lists (same 8 px rule).
 // is open that covers most of the screen or comes within 8 px of the strip's spot, the strip steps aside (body.odYield); it returns when it closes.
 // Races and results keep their own chip placement (RF5: under LAP, inside the results card's top-right corner).
 const YS='#npcSay,#roamPause,#pause,#results,#settings,#chRes,#spRes,#roamPop,#journal,#roamMap,#story,#roamCard,#cmap,#slots,#profile,#gbx,#odChk,#credBox,[role=dialog],.modal,#roamTut,#home .hbar h2,[role=listbox],[role=menu],.r2Pop,.r2Menu,.r2List,.gbDrop';
 let pinBox=null;const yVis=e=>{if(e.hidden||e.closest('[hidden]'))return null;const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity<.05)return null;const r=e.getBoundingClientRect();return r.width>4&&r.height>4?r:null};
 const yieldStep=()=>{try{const P=document.getElementById('odPin');if(!P)return;if(!P.hidden&&(!document.body.classList.contains('odYield')||!pinBox)){const r=P.getBoundingClientRect();if(r.width>4)pinBox={l:r.left,t:r.top,r:r.right,b:r.bottom}}
   let y=false;if(pinBox&&!P.hidden&&!pinCd()&&!pinRun()){const VA=innerWidth*innerHeight;for(const e of document.querySelectorAll(YS)){if(e===P||P.contains(e))continue;const r=yVis(e);if(!r)continue;
     if(r.width*r.height>VA*.4||(r.left<pinBox.r+8&&r.right>pinBox.l-8&&r.top<pinBox.b+8&&r.bottom>pinBox.t-8)){y=true;break}}}
   document.body.classList.toggle('odYield',y)}catch(e){}};
 {const st3=document.createElement('style');st3.textContent='body.odYield #odPin{display:none!important}';document.head.appendChild(st3)}setInterval(yieldStep,120);
 window.__chk={city:id=>{const L=GO[id];return !L?null:L[0].bx?'bx':goCity(L[0])},go:id=>{const it=OD_CHECKLIST.find(q=>k(q)===id);goI._t='';if(it)goJump(it);return goI._t},GO,text,items:OD_CHECKLIST,pin:()=>pinR(),pinSt:()=>pst()}}
