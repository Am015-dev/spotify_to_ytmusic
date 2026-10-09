// ---------- OD_CHANGELOG: newest first. EVERY deploy prepends one entry {v, date, items:[{t:'FIXED'|'NEW'|'CHANGED', s:'plain English'}]} (2-4 items).
// W14 steering (city "buggy steering", probe tools/tW14s.js): touch ◀/▶ start at 25% lock and reach full lock in ~0.2 s (was 12% and 0.32 s, yaw t63 up to
// 0.33 s); the unstuck pivot turns at 1.6 rad/s and stops when you steer (was 5 rad/s = 75-90° self-spins after a bump); BRAKE+steer only auto-drifts
// in the city above 125 km/h (was 86 km/h, which the faster city car reaches on every street).
const W14_ST={k0:.25,rk:1.5,hbCity:34.7},W14_PIV=1.6;
// TUNE (tune20): live-tunable driving numbers that used to be inline literals; defaults = the v87w values. Knob table + ?tune=1 drawer: src/99t_tune.js.
const TUNE={life:1,lvDress:1,lvAthCr:1.5,lvLod:1,wbCarLod:1,wbLoShare:1.35,wbIcon:1,wbNear:70,wbFar:900,wbCell:.06,wbCity:1,wbMerged:1,wbNfc:1,wbFig:260,wbRingCam:6,wbLodD:190,wbLodCell:3,bwOn:1,bwFade:90,bwCourse:.48,bwStud:1,bwStudD:60,bwStudP:1.2,bwStudH:2,bwStudTop:16,bwStudMax:8000,bwCar:1,wbSuperD:700,wbTerr:1,wbLzD:420,wbRuns:1,bwRampSh:70,perfHud:0,lvPed:.8,lvWave:1,lvTraf:1,lvBird:1,lvFlag:1,lvBlimp:1,lvBoat:1,lvFac:1,lvCrowd:.67,lvPark:1,lvPop:1,lvPopGap:28,lvPopRw:1,stAng:.55,stFall:14,stIn:60,stOut:45,stMax:1.35,stSpd:.75,tRet:14,assist:1.5,gripRoad:40,drSlip:1.5,drGrip:.049,drConv:.55,drFill:24,acc:1.15,abTop:1.22,rev:18,bPush:20,bTop:1,bDrain:22,bRegen:4,bashT:2,hop:12,grav:30,camK:1/.15,camY:10,fov:66,fovSpd:14,rSpd:1.2,rub:1,traf:1,carW:1,carL:1,ride:0,
  // fix21 boost FX (TUNE drawer "FX" tab): thruster flame size / length / brightness, boost sparks on/off + count + size, speed lines, screen blur/glow, FOV kick, shake (all ×, 1 = default look)
  fxFlS:1,fxFlL:1,fxFlI:1,fxSpk:1,fxSpkN:1,fxSpkS:1,fxLines:1,fxGlow:1,fxFov:1,fxShake:1,
  // fix21 audio (TUNE drawer AUDIO tab, 98m_music.js): music on/off + volume (0.5 = the old synth level), SFX ×, duck music under dialogue (on/off + how much)
  musOn:1,musVol:.5,sfxVol:1,duckOn:1,duckAmt:.7,
  // drive24 ROUTE (TUNE drawer Route tab, 41_career_quests.js qvAstar/D24_clean): metres added per 90° turn, per U-turn, filler-grid cost ×,
  // narrow-street extra, simplify tolerance (m); turn cue lead (s) + min distance (m); followed cars (98d_drive24.js): corner radius (m), corner grip (m/s²), brake (m/s²), blinker on/off
  rtTurn:110,rtUturn:800,rtGrid:1.35,rtNarrow:.2,rtSimp:3,rtJog:14,stTouchDig:1,asMax:.8,stRampV0:0,stRampRev:0,stHold:.15,stRampFast:0,yrIn:60,tcLead:5,tcMin:90,fvRad:16,fvLat:4.5,fvDec:4,fvBlink:1,
  // drive24 STEER (98d_drive24.js D24_shape, roam only): on/off, ramp time to full lock at 0 and at 100 km/h (s), start fraction, let-go rate (/s), full lock = × grip limit,
  // how fast the car stops turning when the steering eases off (/s; 71_roam_drive.js, was 7-11 like turning in)
  stOn:1,stRampLo:.2,stRampHi:.6,stK0:.05,stRet:12,stLim:1.4,yrOut:45};
const OD_CHANGELOG=[
  {v:'v89a',date:'9 Oct 2026',items:[{t:'NEW',s:'Get out and walk: stop the car and the BRAKE button turns into 🚪 EXIT (PC: F or E). Your minifig steps out and the car stays parked.'},{t:'NEW',s:'On foot: drag anywhere on the left half to walk (push far to run), RUN and JUMP on the right. PC: WASD or arrows, Shift runs, Space jumps.'},{t:'NEW',s:'Walk up to your own car or any parked car and tap 🚪 ENTER (PC: F or E) to drive it. Moving traffic cannot be taken yet.'}]},
  {v:'v88y',date:'9 Oct 2026',items:[{t:'NEW',s:'Garage BUILD → MY PARTS → CANVAS: a big empty 32×32 baseplate to build parts on (two fingers zoom and move the view).'},
   {t:'NEW',s:'Save a group as a part (⛓ GROUPS → 💾 SAVE PART) and add it to any car from MY PARTS; it snaps to the studs and is mirrored to the other side.'},
   {t:'NEW',s:'A TILES tab with 21 real LEGO tiles: flat 1×1 to 2×6, round, quarter-round, macaroni, slope 30, curved 1×3, grille, jumper and printed headlight, number plate and gauge.'}]},
  {v:'v88x',date:'9 Oct 2026',items:[{t:'NEW',s:'Athens is busier: orange trees, kiosks, parked scooters and bollards along the streets, more crowds, cafés and market stalls, and more scooters in traffic. All of it can be smashed.'},{t:'FIXED',s:'The plain beige towers at the Eiserner Steg bridge in Frankfurt are now red sandstone towers with windows, doors and a roof.'},{t:'FIXED',s:'People in street crowds no longer stand inside parked cars.'}]},
  {v:'v88w',date:'9 Oct 2026',items:[{t:'NEW',s:'Buildings up close now show real LEGO brick rows, flat roofs and ledges near you have studs, and traffic cars keep their mirrors, number plates and exhausts.'},{t:'FIXED',s:'Less lag: Frankfurt draws about 195 things per frame instead of 250 (Athens 245 → 205). Map icons and far traffic cars are now drawn together.'},{t:'FIXED',s:'Athens: roadside pop-up challenges (ramp jump, drift zone, slalom, smash streak) now appear on the streets again.'}]},
  {v:'v88v',date:'9 Oct 2026',items:[{t:'FIXED',s:'Less lag: traffic cars far away now use a simple model of the same car, and cars behind you are not drawn (about half the triangles of the city were traffic).'},{t:'FIXED',s:'Less lag: the city far away (beyond ~250 m) is drawn as simple blocks with the same colours. Up close nothing changed. It switches on a few seconds after the city loads, without stutter.'},{t:'CHANGED',s:'Frankfurt now draws about 250 things per frame instead of 435, and about 1 million triangles instead of 2.5 million (Athens 1.6 → 1.0 million).'},{t:'FIXED',s:'Pop-up challenge rings no longer cover the screen as a big arc when the camera reaches them just before your car does.'}]},
  {v:'v88u',date:'9 Oct 2026',items:[{t:'FIXED',s:'Smoother driving in busy streets: the street life no longer re-scans the whole street map many times a frame, and far-away people and cars update less often.'},{t:'CHANGED',s:'Fewer people on the streets (about 74 instead of 97): fewer walkers and 4 corner groups instead of 6.'},{t:'FIXED',s:'No hitch the first time a stall or a pop-up ring appears (its graphics are prepared while the city loads).'},{t:'NEW',s:'⚙ TUNE → Life → Show FPS: a small line with fps, the worst frame, draw calls and triangles, so you can send us a screenshot if it still lags.'}]},
  {v:'v88t',date:'9 Oct 2026',items:[{t:'NEW',s:'3 new Speed-Champions-style cars in RIDES → STREET → SPEED SERIES: Time Coupe, Red Hypercar and Gold Formula (open wheels). Each one has its own ▶ GUIDE.'},{t:'NEW',s:'Time Coupe and Red Hypercar now drive in city traffic; the 6 base racing teams race in street-racer and Speed Series cars in their team colours.'},{t:'CHANGED',s:'BUILD IT (guide): the part you need next is picked for you in the parts palette, in the right colour.'}]},
  {v:'v88q',date:'9 Oct 2026',items:[{t:'CHANGED',s:'The pinned checklist folds to its small chip in the garage (it covered the car) and during the race countdown; tap the chip to open it.'}]},
 {v:'v88p',date:'8 Oct 2026',items:[{t:'NEW',s:'Street corners ahead come alive: groups of people chatting who turn, wave and cheer as you drive up (and leap aside), market stalls, café tables and parked cars on the kerb. Smash a stall for studs.'},{t:'NEW',s:'Roadside pop-up challenges like 2K Drive: a coloured ring appears on the road ahead; drive through it for a RAMP JUMP, DRIFT ZONE, SMASH STREAK or CONE SLALOM. Timer on the objective line, +150 studs and a brick burst if you make it.'},{t:'CHANGED',s:'Traffic and pigeons now show up closer, along the street you are driving.'}]},
  {v:'v88o',date:'8 Oct 2026',items:[{t:'NEW',s:'The test checklist stays on screen while you play: answer each item with ✅ / ❌, ‹ › to move, tap the counter to fold it to a small chip.'},{t:'FIXED',s:'Garage BUILD → CLEAR now leaves one clean chassis with its wheels and a fresh grid (no leftover base, no floating grid). UNDO brings the build back.'},{t:'NEW',s:'Bigger parts palette in BUILD: 2 rows of named tiles, category chips, ★ FAVS (long-press a part) and 🕘 RECENT.'},{t:'NEW',s:'Groups in BUILD: select parts → MAKE GROUP, then 👁 hide/show, move, copy, mirror or delete the whole group. HIDE UP hides the layers above the one you build on.'}]},
 {v:'v88n',date:'8 Oct 2026',items:[{t:'NEW',s:'The cities feel alive: more people on the pavements near you (they wave as you pass), and traffic now drives where you can see it, including the new orange and pink street racers.'},{t:'NEW',s:'Pigeons that scatter when you drive up, gulls circling overhead, flags flapping on the rooftops, a LEGO blimp over each city and boats sailing on the Main.'},{t:'CHANGED',s:'Bolder LEGO colours on the buildings: Frankfurt districts are bright brick colours instead of pale pastels; the Athens old town is warmer.'},{t:'NEW',s:'⚙ TUNE → Life: a "World life" slider (0 = the old quiet city) plus one knob per part.'}]},
  {v:'v88l',date:'8 Oct 2026',items:[{t:'NEW',s:'BUILD GUIDE: tap ▶ GUIDE on any ride in RIDES (or ⋯ MORE → BUILD GUIDE in BUILD) to watch it being built step by step, 1–4 parts per step, with a parts box and a 12/48 counter.'},{t:'NEW',s:'Guide controls: ◀ ▶ step, PLAY/PAUSE, ×1/×2 speed, a step slider and EXIT. Drag to turn the car.'},{t:'NEW',s:'BUILD IT: build it yourself. The next parts glow green as a ghost, tap near them to snap them in (💡 PLACE IT helps). Leaving early keeps your ride as it was.'}]},
  {v:'v88k',date:'8 Oct 2026',items:[{t:'NEW',s:'Orange Street Racer in RIDES: a LEGO street tuner built from the real set\'s parts (open targa top, blue seats, lime side graphics, big grey wing).'},{t:'NEW',s:'Three variations of it: Midnight Street Racer (black and purple), Orange Street GT (hardtop, no wing) and Widebody Track Racer.'},{t:'NEW',s:'Three tuner friends in the same style: Silver Night Tuner, Pink Roadster and Black Gold V8. All 7 open in BUILD and drive like normal cars.'}]},
  {v:'v88i',date:'8 Oct 2026',items:[{t:'NEW',s:'Four big templates in RIDES, built after real LEGO sets: Sightseeing Bus (60407), Box Truck (60440), Stretch Limo (60102) and Monster Truck (60180).'},{t:'CHANGED',s:'BUILD has room for bigger cars: 46 studs long (was 18), 72 plates tall above the chassis (was 48) and a build limit of 250 parts (was 120).'},{t:'NEW',s:'Big cars drive big: they pick up speed more slowly, take wider turns, hit walls and traffic with their real size, and the camera pulls back to show the whole car. Normal-size cars drive exactly as before.'}]},
  {v:'v88h',date:'8 Oct 2026',items:[{t:'FIXED',s:'The city no longer disappears: after leaving free roam (menu, a race, the garage) and coming back, far parts of town used to stay invisible, so you drove on an empty pale plane under floating roofs.'},{t:'NEW',s:'Two checklist items for it (⚙ → CHECKLIST).'}]},
  {v:'v88g',date:'8 Oct 2026',items:[{t:'FIXED',s:'The car no longer slides by itself: tapping BRAKE while holding GAS and steering used to start a drift at once. Now it just brakes.'},{t:'CHANGED',s:'Braking in a turn keeps the back of the car planted; outside a drift the car goes where it points.'},{t:'CHANGED',s:'To drift, use the DRIFT button (X on PC), or hold GAS + BRAKE together for about half a second while steering.'}]},
  {v:'v88f',date:'8 Oct 2026',items:[{t:'FIXED',s:'Steering through turns settles about twice as fast with less wobble, and touch ◀▶ stop steering as soon as you lift your finger.'},{t:'FIXED',s:'Mission routes follow real roads: far fewer left-right zig-zags, no fake U-turn when following Hilde, and the top line warns "left/right in … m" before each turn.'},{t:'NEW',s:'Garage BUILD: ▲▼ layer selector (layers above turn see-through) and TOP / SIDE / 3D views; map legend chips show or hide each kind of icon; garage popups no longer cover buttons.'},{t:'NEW',s:'✔ CHECKLIST (in ⚙ and UPDATES): mark each change PASS or FAIL while you play and copy the results.'}]},
  {v:'v88e',date:'8 Oct 2026',items:[{t:'NEW',s:'Levels matter: your driver level raises top speed, acceleration, handling and health, and the PERKS screen shows your level, XP and stat bars, 2K style.'},{t:'CHANGED',s:'Perk slots now open at level 1, 10 and 20 (was 8 and 16), so slot 2 waits until level 10. New race perks: Handling, Accel, Top Speed and Health Boost.'},{t:'NEW',s:'Level-up card shows what you unlocked; DRIVER tab and PROFILE show a driver card with your level line.'},{t:'FIXED',s:'English everywhere (LOGBOOK, Gold Rush, 3,000 studs); hints no longer sit on top of the logbook or other panels; the logbook lists the mission you are on.'}]},
  {v:'v88d',date:'8 Oct 2026',items:[{t:'FIXED',s:'Music starts on your first tap (the touch fix is for iPhone and the Claude app); the menu track now loads while the game loads.'},{t:'NEW',s:'TEST MODE: unlimited studs, every car, part, kit, paint and perk unlocked, and all missions and side quests open (logbook → ALL (TEST) takes you to any of them).'},{t:'NEW',s:'The ⚙ tuning drawer is on every screen: menu, garage, free roam, races and missions.'}]},
  {v:'v88c',date:'8 Oct 2026',items:[{t:'CHANGED',s:'The garage is one tidy Body Shop: a header with SAVE & DRIVE, five modes on the left (RIDES, BUILD, PAINT, PERKS, DRIVER) and one row of big buttons at the bottom, with your car always in clear view.'},{t:'NEW',s:'PAINT finishes: GLOSS, MATTE, METAL, CHROME and PEARL, saved per car and shown while you drive.'},{t:'FIXED',s:'Building: a placed brick shows on the car right away, the PLACE/TURN/DROP buttons are a slim column that never covers the car, and the build tip only shows in BUILD.'},{t:'NEW',s:'Kits, driver parts, liveries and horns show a picture, with a lock on the ones you still have to earn.'}]},
  {v:'v88b',date:'8 Oct 2026',items:[{t:'FIXED',s:'Your car no longer turns into the off-road buggy when you drive onto grass; it stays your street car (it still becomes a boat on water).'},{t:'FIXED',s:'Oma Hilde\'s tips and the tutorial card now sit in one spot at the top of the screen, never over your car, the boost bar or the buttons.'},{t:'CHANGED',s:'Races start in sunny Brick Day by default, and Athens street lamps are a real 5.5 m in dark iron.'},{t:'NEW',s:'Garage stats show +/− chips and a weight class (Light, Heavy…) instead of numbers.'}]},
  {v:'v88a',date:'8 Oct 2026',items:[{t:'FIXED',s:'Hot Drop speed: holding BOOST in the city now tops out around 150 km/h (it ran away to 210+), and Hilde\'s tow truck and Kaiser drive at believable city speeds.'},{t:'FIXED',s:'No more teleporting goons: rammed cars slide back instead of jumping 10 m, and the two key vans no longer start stacked on each other.'},{t:'CHANGED',s:'Scene cuts, story warps and checkpoint restarts now flash through black instead of popping.'},{t:'FIXED',s:'The mission arrow says what to do (Follow, Ram, Tail, Drift) instead of always "Deliver"; the health text is bigger.'}]},
  {v:'v87z',date:'8 Oct 2026',items:[{t:'NEW',s:'Alex\'s music: menu, garage, race, Frankfurt and Athens each have their own track, crossfading as you switch; it starts on your first tap.'},{t:'CHANGED',s:'The SOUND ON/OFF button mutes the music too, and music dips under dialogue and the boost whoosh.'},{t:'NEW',s:'Tuning drawer (beta): AUDIO tab with music on/off, music and SFX volume, and how much the music ducks.'}]},
  {v:'v87y',date:'8 Oct 2026',items:[{t:'FIXED',s:'Race boost: the flames are small again and sit at the exhaust, turning with the car (they were oversized and floating in races).'},{t:'FIXED',s:'No more stray white sparkles streaking across the screen when you boost in a race; just a few short sparks from the exhaust.'},{t:'NEW',s:'Tuning drawer (beta): new FX tab for the boost look: flame size, length and brightness, sparkles on/off, speed lines, glow, FOV kick and shake.'}]},
  {v:'v87x',date:'7 Oct 2026',items:[{t:'NEW',s:'Tuning drawer for Alex (beta only): tap ⚙ top-right to change steering, grip, speed, boost, camera and car feel with sliders while you drive; SAVE keeps numbered versions and ★ SET picks the one the beta starts with.'},{t:'CHANGED',s:'Nothing changes for normal players: with no saved tuning the car drives exactly like v87w.'}]},
  {v:'v87w',date:'7 Oct 2026',items:[{t:'FIXED',s:'Hot Drop: Oma Hilde\'s tow truck no longer jumps onto your car at the start (the big orange block over the screen); it waits up the road and drives off.'},{t:'FIXED',s:'Races: rival name tags no longer pile up; only the 3 nearest show, stacked neatly.'},{t:'FIXED',s:'City traffic sits on all four tyres (no more floating wheels on sloped roads).'},{t:'CHANGED',s:'Garage: the "drag to rotate" tip no longer covers the GARAGE sign and goes away once you have dragged.'}]},
  {v:'v87v',date:'7 Oct 2026',items:[{t:'NEW',s:'Garage COLLECTION: your cars sorted into Street, Off-road and Water tabs with rarity colours, sort, filter and favourites; tap a card to drive it.'},{t:'NEW',s:'9 ready-made cars inspired by real LEGO sets (wedge supercar, roadster, police car, F1 car, monster truck and more); tap BUILD to open and edit any of them.'}]},
 {v:'v87u',date:'7 Oct 2026',items:[{t:'NEW',s:'Drift to boost: hold GAS and press BRAKE while steering to drift with a pink trail; the drift fills your boost (in races, BRAKE + steer above 60 km/h).'},{t:'NEW',s:'Full boost bar = a big burst and small LEGO thrusters; hold BOOST 2 s for BRICKBASH, which knocks traffic aside. Smashing things adds boost.'},{t:'NEW',s:'Swipe up on GAS to hop (works on water too).'},{t:'FIXED',s:'Plain BRAKE + steer in the city always brakes and never starts a drift.'}]},
 {v:'v87t',date:'7 Oct 2026',items:[{t:'FIXED',s:'Garage builder: you can stack parts much higher (up to 48 plates); a tip tells you when you hit the height limit, and the camera follows tall builds.'},{t:'NEW',s:'SELECT tool: tap a part to move, rotate, recolour, copy or delete it.'},{t:'FIXED',s:'Placed tiles get a yellow outline so you can see them, and taps between studs no longer do nothing.'},{t:'FIXED',s:'No more brick shower over the chassis picker when you start a new build.'}]},
 {v:'v87s',date:'7 Oct 2026',items:[{t:'NEW',s:'Races are wider and faster: 38 m tracks, quicker cars, and the field stays closer together.'},{t:'NEW',s:'Shortcuts: big yellow SHORTCUT signs point to a boat lane through the water or a 4×4 dirt lane.'},{t:'NEW',s:'LEGO "?" bricks give race power-ups: missile, turbo, shield, web, mines and lightning.'},{t:'FIXED',s:'Your car slides along walls instead of crashing into them, and a web hit no longer covers the buttons.'}]},
 {v:'v87r',date:'7 Oct 2026',items:[{t:'CHANGED',s:'Garage on the phone: a lower camera shows the whole LEGO workshop (roller doors, GARAGE signs, mechanics) behind your car.'},{t:'NEW',s:'Bricks pour across the screen when you open or close the builder.'},{t:'NEW',s:'STEP UP / STEP DOWN moves the part you hold a layer up or down, and REDO sits next to UNDO.'},{t:'FIXED',s:'Choose Track on the phone: START RACE no longer covers the Weather and Class rows.'}]},
 {v:'v87q',date:'7 Oct 2026',items:[{t:'CHANGED',s:'Faster car in the city: top speed is about 120 km/h (was 90), with a wider view, lower camera and speed lines when you go fast.'},{t:'FIXED',s:'Steering is steadier: the car no longer spins round by itself after a bump, and the arrow buttons turn the car sooner.'},{t:'FIXED',s:'Braking while steering in the city no longer throws the car into a drift. Hard turns at speed slow you down and keep you on the road.'}]},
 {v:'v87p',date:'7 Oct 2026',items:[{t:'NEW',s:'The garage is now a real LEGO workshop: a grey build platform with blue lights, roller doors, shelves, mechanics, and shadows under your car.'},{t:'NEW',s:'Placing a brick works like 2K Drive: tap to see where it goes (green frame = fits, red = no room), then PLACE, ROTATE or CANCEL. Placed bricks pop in.'},{t:'FIXED',s:'The "New in" bubble shows on the title screen only, so it no longer covers CHOOSE TRACK.'},{t:'NEW',s:'The parts list shows a 3D picture of each brick in your chosen colour.'}]},
 {v:'v87o',date:'7 Oct 2026',items:[{t:'FIXED',s:'Trucks, delivery vans and garbage trucks in the city are solid again: their windows, frame and wheels now match the body, so you no longer see through them.'},{t:'FIXED',s:'Team select shows each team\'s real LEGO race car instead of the old plane drawings.'}]},
 {v:'v87n',date:'7 Oct 2026',items:[{t:'FIXED',s:'Brick builder on phones: part names and toolbar buttons are bigger and easier to read.'},{t:'FIXED',s:'The builder toolbar now fits on one line on phones, so DONE no longer covers the car.'}]},
 {v:'v87m',date:'7 Oct 2026',items:[{t:'FIXED',s:'Cars on the Autobahn sit on the road again: the motorway surface was drawn 25-60 cm too high, so tyres looked sunk into it.'},{t:'FIXED',s:'Red cars are LEGO red again instead of pink. Blue and yellow paint are cleaner too (less pale sky sheen).'}]},
 {v:'v87l',date:'7 Oct 2026',items:[{t:'NEW',s:'NEW BUILD: in the garage tap BUILD YOUR OWN, pick a Speed Champion or Hot Rod chassis, and snap real LEGO parts onto it.'},{t:'NEW',s:'Your build becomes the vehicle "My Build" in RIDES and drives in the city. A build-limit bar shows your parts and weight class.'},{t:'FIXED',s:'Builder: mudguards snap over their tyre, the windscreen no longer doubles, and the car sits higher so taps no longer hit the parts panel.'}]},
 {v:'v87k',date:'7 Oct 2026',items:[{t:'FIXED',s:'Braking to a stop no longer twitches the car sideways or kicks it forward again.'},{t:'FIXED',s:'Bumping a traffic car is softer: no more jumping back. The car gets pushed and brakes to a stop, and you lose only the speed you gave away.'},{t:'CHANGED',s:'The horn now makes nearby cars stop for a moment instead of hopping back.'}]},
 {v:'v87j',date:'7 Oct 2026',items:[{t:'FIXED',s:'Phone garage: the PERKS slots now sit at the top of RIDES, so you see them without scrolling.'},{t:'FIXED',s:'PROFILE shows your perks and the next perk unlock at the top, above your vehicles.'}]},
 {v:'v87i',date:'7 Oct 2026',items:[{t:'NEW',s:'Garage RIDES shows vehicle groups with LEGO 2K rarities (Neat, Cool, Awesome, Super Awesome) and a PERKS row: pick up to 3 perks as your driver level grows.'},{t:'NEW',s:'Two new perks: Tank Mode (tougher, a bit slower) and Glass Cannon (faster, more fragile).'},{t:'NEW',s:'PROFILE button on the title screen: driver level and class, your vehicles, perks and collection.'},{t:'FIXED',s:'The "New in" pop-up no longer covers the garage tabs; garage text is bigger on phones.'}]},
 {v:'v87h',date:'7 Oct 2026',items:[{t:'FIXED',s:'Garage PAINT works: BODY, ACCENT and TRIM now recolour your LEGO car, and you see it in the garage and while driving.'},{t:'CHANGED',s:'Your paint also colours the off-road car and the boat of the same vehicle, and it stays saved.'},{t:'CHANGED',s:'STOCK LOOK puts the original colours back.'}]},
 {v:'v87g',date:'7 Oct 2026',items:[{t:'CHANGED',s:'Richer colours: grass is deep LEGO green and buildings keep their true colours instead of a pale blue sheen.'},{t:'CHANGED',s:'Cars look glossier: shiny paint and glass windows on city traffic.'},{t:'NEW',s:'Big white brick clouds float above the rooftops in a deep blue sky.'}]},
 {v:'v87f',date:'7 Oct 2026',items:[{t:'CHANGED',s:'City SUVs are proper chunky LEGO SUVs now: rounded nose, grille, wheel arches, big windows and roof rails.'},{t:'FIXED',s:'Your boat sits in the water instead of floating above the waves, for every garage set.'},{t:'FIXED',s:'The GAS button lights up clearly while you hold it.'}]},
 {v:'v87e',date:'7 Oct 2026',items:[{t:'FIXED',s:'The crates the getaway van drops are real LEGO crates now, not a big brown box on the road.'},{t:'FIXED',s:'Your car stays crisp and solid in races; the cyan glow no longer washes over it when you SMASH.'},{t:'CHANGED',s:'City trucks keep white cargo boxes and cars keep black windows and trim; only the body is coloured.'}]},
 {v:'v87d',date:'6 Oct 2026',items:[{t:'FIXED',s:'Roads no longer flicker to grass while you drive.'},{t:'CHANGED',s:'Cars cast crisp, car-shaped shadows on the ground.'}]},
 {v:'v87c',date:'6 Oct 2026',items:[{t:'NEW',s:'RIDES tab in the garage: three new vehicle sets, each a street car, an off-road truck and a boat that swap automatically.'},{t:'NEW',s:'Ebbelwoi Express (RARE, 3.000 studs), Poseidon GT (EPIC, 15 stars) and Goldrausch (LEGENDARY, 30 stars).'},{t:'NEW',s:'Upgrades (spoiler, exhausts, wheels, booster) in 3 levels, visible on all three forms in the garage and while driving.'},{t:'FIXED',s:'SMASH! and other hit pop-ups no longer cover the tutorial card.'}]},
 {v:'v87b',date:'6 Oct 2026',items:[{t:'FIXED',s:'Double-tap ◀ or ▶ to SMASH works with a normal thumb double-tap, flashes the arrow and shows SMASH! even when nothing is hit.'},{t:'CHANGED',s:'Races have no civilian traffic blocking the track any more; rivals stay.'},{t:'CHANGED',s:'Cars drive like real cars: they lean in corners and dip under braking, grip runs out gradually, and they slide a little if you brake hard into a turn. Rivals use the same physics.'}]},
 {v:'v87a',date:'6 Oct 2026',items:[{t:'NEW',s:'This UPDATES screen: open it from the title screen or the pause menu to see what changed in each version.'},{t:'NEW',s:'A small "What\'s new" note appears once after each update.'},{t:'CHANGED',s:'Credits now say "Base assets: Kenney (CC0)" next to "3D models by Alex".'}]},
 {v:'v87',date:'6 Oct 2026',items:[{t:'CHANGED',s:'Race tracks are narrower and double-tap ◀/▶ does a sideways SMASH lunge.'},{t:'NEW',s:'Rival health bars: 3 SMASH hits wreck a rival.'},{t:'CHANGED',s:'BOOST is plain boost again; touching cars is just a bump.'},{t:'FIXED',s:'Car shows right after a wreck; faster road/off-road swap; tinted coupé glass.'}]},
 {v:'v86z',date:'6 Oct 2026',items:[{t:'FIXED',s:'Steering works after a crash: the car turns from a standstill and frees itself if wedged.'}]},
 {v:'v86y',date:'6 Oct 2026',items:[{t:'NEW',s:'Your driver is a real LEGO minifig: open-face helmet with a face, hands on its own steering wheel.'},{t:'NEW',s:'8 driver presets plus new faces and hair in the garage DRIVER tab.'},{t:'CHANGED',s:'Credits: 3D models by Alex.'}]},
 {v:'v86x',date:'6 Oct 2026',items:[{t:'FIXED',s:'No more screen shaking at speed; AI cars steer smoothly.'},{t:'CHANGED',s:'Camera sits closer and lower, wider view and speed lines when fast.'},{t:'CHANGED',s:'BOOST is SMASH: it always wrecks what you hit, and refills faster.'}]},
 {v:'v86w',date:'6 Oct 2026',items:[{t:'FIXED',s:'Hill and park grass sits exactly on the ground (was up to 30 cm off).'},{t:'FIXED',s:'Fewer grass patches poking through roads.'}]},
 {v:'v86v',date:'6 Oct 2026',items:[{t:'FIXED',s:'No dark shadow blobs under cars; each tyre has a small soft shadow.'},{t:'FIXED',s:'Every race jump clears at normal top speed without boost (Main river gap shortened).'}]},
 {v:'v86u',date:'6 Oct 2026',items:[{t:'FIXED',s:'No orange glow ball over the car at the top of ramp jumps.'}]},
 {v:'v86t',date:'6 Oct 2026',items:[{t:'FIXED',s:'City ramp jumps are reachable and fly long, soft arcs with no landing damage.'},{t:'FIXED',s:'Tyres rest on the visible asphalt.'}]},
 {v:'v86q',date:'6 Oct 2026',items:[{t:'FIXED',s:'No orange glow ball when the car scrapes walls or bumps.'}]},
 {v:'v86p',date:'6 Oct 2026',items:[{t:'CHANGED',s:'City box trucks look like LEGO: cab windows, grille, ribbed box, mudguards.'}]},
 {v:'v86n',date:'6 Oct 2026',items:[{t:'FIXED',s:'Race opponents no longer fill the screen when they overtake you.'}]},
 {v:'v86m',date:'6 Oct 2026',items:[{t:'FIXED',s:'Jump and start texts in English (JUMP!, START, FINISH).'},{t:'FIXED',s:'Camera never ends up inside the 4×4 after a vehicle swap; the swap burst is smaller.'}]},
 {v:'v86l',date:'6 Oct 2026',items:[{t:'CHANGED',s:'Missions forgive leaving the road (small, eased slowdown).'},{t:'CHANGED',s:'+12 % top speed with a wider view.'},{t:'FIXED',s:'Barrel rolls only in a SMASH; cars only break from a SMASH or above 150 km/h.'}]},
 {v:'v86k',date:'6 Oct 2026',items:[{t:'CHANGED',s:'Races drive like real cars: 0–100 in 4–5 s, real braking, shorter races.'},{t:'FIXED',s:'Tyres on the track, no glow trails or light cones under cars.'},{t:'CHANGED',s:'Lighter race HUD on the phone.'}]},
 {v:'v86j',date:'5 Oct 2026',items:[{t:'FIXED',s:'Race opponents are grounded LEGO cars (no hovering or glow).'},{t:'CHANGED',s:'Car handling has weight: 150 km/h city top speed, real braking distance, smooth wall hits.'},{t:'FIXED',s:'FIRE button is back in races.'}]},
 {v:'v86i',date:'5 Oct 2026',items:[{t:'FIXED',s:'No light columns: objectives are rings on the ground.'},{t:'CHANGED',s:'Thinner Athens crowds.'}]},
 {v:'v86h',date:'5 Oct 2026',items:[{t:'CHANGED',s:'LEGO world pass: true-size studs, grey Athens asphalt, streets follow the hills.'},{t:'FIXED',s:'No pink water; boats sit level in the water with foam.'}]},
 {v:'v86g',date:'5 Oct 2026',items:[{t:'CHANGED',s:'One objective line at a time; TAP TO OPEN prompt sits below the car.'}]},
 {v:'v86f',date:'5 Oct 2026',items:[{t:'CHANGED',s:'Drives like a car: grip steering, camera locked behind.'},{t:'FIXED',s:'Wheels roll and sit on the road; no hover shadow or blue thruster puffs.'},{t:'CHANGED',s:'District names show as small toasts.'}]}];
const OD_VER=OD_CHANGELOG[0].v;
function CR_trackW(w){return Math.min(20,Math.max(14,w*.38))}
var CR_LS=1;const CR_LGV=12;

const CR_SPDCAM={b:2.2,h:.9};
// SMASH feedback: one-shot big hit (no continuous shake)
function CR_smashHit(){const t=performance.now();if(t-(CR_smashHit.t||0)<250)return;CR_smashHit.t=t;shake=Math.max(shake,.75);fovKick=Math.max(fovKick,10);slowmo=Math.max(slowmo,.18);try{AU.sfx('takedown')}catch(e){}try{hitPop('💥 SMASH!','#ffd12c')}catch(e){}}
// city victims tumble for 0.9 s (barrel roll + flight) before they burst into bricks
const _crTQ=new THREE.Quaternion(),_crTE=new THREE.Euler(),_crTS=new THREE.Vector3(1,1,1),_crTP=new THREE.Vector3(),_crTM=new THREE.Matrix4();
function CR_tumbleStart(c,x,z,dx,dz){const f=Math.hypot(dx,dz)||1,rx=x-RO.x,rz=z-RO.z,rl=Math.hypot(rx,rz)||1,v=Math.max(12,Math.abs(RO.v));c.crW={t:0,x,y:c.y,z,h:Math.atan2(dx,dz),vx:Math.sin(RO.vh)*v*.55+rx/rl*6,vz:Math.cos(RO.vh)*v*.55+rz/rl*6,vy:7+v*.08,r:0,p:0,sr:(Math.random()<.5?-1:1)*9,sp:(Math.random()-.5)*5}}
function CR_tumble(c,im,dt){const W=c.crW;if(!W)return false;if(W.t>=.9){c.crW=null;return false}W.t+=dt;W.vy-=22*dt;W.x+=W.vx*dt;W.y=Math.max(c.y-.5,W.y+W.vy*dt);W.z+=W.vz*dt;W.r+=W.sr*dt;W.p+=W.sp*dt;
 _crTQ.setFromEuler(_crTE.set(W.p,W.h,W.r,'YXZ'));_crTM.compose(_crTP.set(W.x,W.y,W.z),_crTQ,_crTS);im.setMatrixAt(c.j,_crTM);if(im.userData.w)im.userData.w.setMatrixAt(c.j,_crTM);if(im.userData.g)im.userData.g.setMatrixAt(c.j,_crTM);return true}
function CR_dodge(s,o){const m=s.crDg||(s.crDg=new Map()),t=typeof raceT!=='undefined'?raceT:performance.now()/1000,e=m.get(o);if(e&&t-e.t<1.5)return e.d;const d=o.x>s.x?-1:1;m.set(o,{d,t});return d}

const CR_TYRE_Y=.03;

// ---- city ramp launch: boost + an arc sized to the takeoff speed on lighter gravity (cleared on landing)
const CR_RG=14,CR_RJM=.74;
function CR_rampLaunch(r){try{if(!r||!(RO.v>3))return;const vb=Math.min(Math.max(RO.v,RO.v*1.12),Math.max(RO.v,CR_VBOOST));RO.v=vb;const kmh=vb*3.6;
 const D=kmh<=140?kmh*CR_RJM:140*CR_RJM+(kmh-140)*.35,T=D/vb,h0=Math.max(0,r.hgt||0);let vy=(CR_RG*T*T/2-h0)/T;vy*=Math.min(1,Math.max(.45,vb/15));
 RO.vy=Math.max(3,Math.min(20,vy));RO.crRJ=1}catch(e){}}

function CR_glowFar(p){try{if(p.distanceToSquared(camera.position)<=14*14)return false;return CR_glowCar(p)}catch(e){return true}}
function CR_glowCar(p){const m=typeof pl!=='undefined'&&pl&&pl.mesh;return !m||p.distanceToSquared(m.position)>8*8}

// one layer of the truck's cargo box: a 6-wide core and side walls of panels with a lighter rib every 3 studs (top layer = rail)
function CR_boxWall(add,sym,W,y){const Rb='#c9ced6';add('B6x21',-3,-10,0,W,y);for(let k=0;k<7;k++){const z=-10+3*k;sym('B1x1',-4,z,0,Rb,y);sym('B1x2',-4,z+1,0,y===12?Rb:W,y)}}

let CR_noGlow=0;
function CR_minBack(){const v=pl&&pl.vmode||'car';return v==='4x4'?5.5:v==='boat'?5:3.5}

const CR_SMASHV=150/3.6;

const ALL_OPEN=true,TEST_MODE=true; // TEST_MODE: Alex's test build (src/99x_test_mode.js): ∞ studs, everything unlocked, all events open, ⚙ everywhere. false = normal game
// R3b: English UI. Numbers were formatted 'de-DE' (3.000 studs reads as 3); one wrapper maps it to en-US (3,000) without touching every module
{const _tls=Number.prototype.toLocaleString;Number.prototype.toLocaleString=function(l,o){return _tls.call(this,l==='de-DE'?'en-US':l,o)}}
import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

/* ============================================================ 0 · utils */
const $=s=>document.querySelector(s);
const V3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t;
const mod=(a,n)=>((a%n)+n)%n;
function mul(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const R=mul(20990);const rr=(a,b)=>a+R()*(b-a);
const CK=['mho_season','mho_flags','mho_roam','mho_riv','mho_career','mho_prof','mho_story','mho_perks','mho_garage','mho_stars','mho_build','mho_packs','mho_gbown','mho_adapt','mho_disc','mho_log','mho_pstat','mho_city','mho_qpos','mho_enc','mho_sq'];let SLOT=1;try{SLOT=+(localStorage.getItem('mho_slot')||1)||1}catch(e){}
const CID=(()=>{try{return localStorage.getItem('mho_city@'+SLOT)==='ath'?'ath':'fra'}catch(e){return 'fra'}})(),CITYK=['mho_roam','mho_disc','mho_packs','mho_pick','mho_story','mho_qpos','mho_enc','mho_sq'];
const skey=k=>{const K=CID!=='fra'&&CITYK.includes(k)?k+'.'+CID:k;return CK.includes(k)?K+'@'+SLOT:K};
const _SC=new Map();try{const SP=Storage.prototype,w=(f,g)=>function(...a){g(a);return f.apply(this,a)};SP.setItem=w(SP.setItem,a=>_SC.delete(String(a[0])));SP.removeItem=w(SP.removeItem,a=>_SC.delete(String(a[0])));SP.clear=w(SP.clear,()=>_SC.clear())}catch(e){}
const _scGet=K=>{let c=_SC.get(K);if(!c){c={r:localStorage.getItem(K)};_SC.set(K,c)}return c};
const store={get(k,d){try{const c=_scGet(skey(k));return c.r==null?d:JSON.parse(c.r)}catch(e){return d}},peek(k,d){try{const c=_scGet(skey(k));if(c.r==null)return d;if(!('v' in c))c.v=JSON.parse(c.r);return c.v}catch(e){return d}},set(k,v){try{const K=skey(k),r=JSON.stringify(v);localStorage.setItem(K,r);_SC.set(K,{r})}catch(e){}}};
const BOOTF=(()=>{let r=null;try{r=sessionStorage.getItem('mho_boot');sessionStorage.removeItem('mho_boot')}catch(e){}try{const l=localStorage.getItem('mho_boot');if(l!=null){localStorage.removeItem('mho_boot');r=r||l}}catch(e){}try{const o=r&&JSON.parse(r);return o&&o.go&&Math.abs(Date.now()-o.t)<120000?o:null}catch(e){return null}})();
{const lo=document.getElementById('loading');if(lo)lo.textContent=CID==='ath'?'BUILDING ATHENS…':'BUILDING FRANKFURT…';if(BOOTF){const el=document.getElementById('ld2'),st=document.getElementById('ldStep'),F=document.getElementById('ldFly');if(el){el.hidden=false;el.classList.remove('out')}if(st)st.textContent=BOOTF.arrive?'✈ Landing in '+(CID==='ath'?'Athens':'Frankfurt'):'Loading your save';if(F&&BOOTF.arrive){F.hidden=false;document.getElementById('ldFa').textContent=BOOTF.from==='ath'?'ATH':'FRA';document.getElementById('ldFb').textContent=CID==='ath'?'ATH':'FRA'}}}
try{if(!localStorage.getItem('mho_migr')){for(const k of CK){const v=localStorage.getItem(k);if(v!=null&&localStorage.getItem(k+'@1')==null)localStorage.setItem(k+'@1',v)}localStorage.setItem('mho_migr','1')}}catch(e){}
const fmt=t=>{if(!isFinite(t))return'--:--.-';const m=Math.floor(t/60),s=t-m*60;return String(m).padStart(2,'0')+':'+s.toFixed(1).padStart(4,'0')};
const fmt2=t=>{if(!isFinite(t))return'--:--.--';const m=Math.floor(t/60),s=t-m*60;return String(m).padStart(2,'0')+':'+s.toFixed(2).padStart(5,'0')};
const ord=n=>n+(n%100>=11&&n%100<=13?'TH':['TH','ST','ND','RD'][n%10]||'TH');
const pad2=n=>String(n).padStart(2,'0');

/* ============================================================ 1 · data */
const S=0.62;                         // city footprint scale (x, z)
let W=48,HALF=W/2,MARGIN=HALF-3.2;  // road width (metres)
const CR_RK=.47,BASE_TOP=120*CR_RK;
const CLASSES=[{id:'rookie',name:'Rookie',mul:.72,ai:[.9,.98]},{id:'pro',name:'Pro',mul:.86,ai:[.94,1.02]},{id:'elite',name:'Elite',mul:1,ai:[.98,1.06]},{id:'master',name:'Master',mul:1.08,ai:[1,1.08],hide:1},{id:'legend',name:'Legend',mul:1.15,ai:[1.03,1.11],hide:1}];
const TEAMS=[
 {id:'kronos',name:'Kronos Finanz',desc:'Bank money. Balanced to the cent.',a:'#f2c10f',b:'#1b1c3a',c:'#ffffff',glow:'#ffd84a',trail:'#ff58d6',c1:'#f5c20c',c2:'#ffd84a',top:1,acc:1,han:1,hull:1,unlock:0},
 {id:'aeppler',name:'Äppler Motorsport',desc:'Sachsenhausen garage. Brutal launch.',a:'#2cc070',b:'#f2c14e',c:'#0d2b1c',glow:'#8dffb8',trail:'#9dff3a',c1:'#36d17a',c2:'#8dffb8',top:.97,acc:1.13,han:.99,hull:.92,unlock:0},
 {id:'helix',name:'Helix Aerodyn',desc:'Sharpest turn-in on the grid.',a:'#e8f3ff',b:'#1a8fd0',c:'#ff3b55',glow:'#5ff0ff',trail:'#3fdcff',c1:'#22e4ff',c2:'#9ff4ff',top:.97,acc:1,han:1.13,hull:.95,unlock:0},
 {id:'nordend',name:'Nordend Kinetik',desc:'Armoured freight pilots. Unbothered.',a:'#ff7a1c',b:'#2a2f38',c:'#ffd12c',glow:'#ff9a4a',trail:'#ff7a2a',c1:'#ff7a1c',c2:'#ffac66',top:.98,acc:.95,han:.97,hull:1.3,unlock:0},
 {id:'zeil',name:'Zeil Syndikat',desc:'Street racers. Top speed, thin skin.',a:'#e5177f',b:'#f5c20c',c:'#1b1c3a',glow:'#ff4fd8',trail:'#ff58d6',c1:'#ff2d95',c2:'#ff7ac0',top:1.06,acc:.96,han:.95,hull:.88,unlock:4},
 {id:'ostend',name:'Ostend Voltaic',desc:'EZB data couriers. Quick, fragile.',a:'#7a3cff',b:'#19d3c5',c:'#ffffff',glow:'#c46bff',trail:'#59f5ff',c1:'#9b5cff',c2:'#c9a2ff',top:1.03,acc:1.05,han:1.03,hull:.84,unlock:9},
 {id:'v_rossi',name:'Fulmine Rosso',desc:'Rossi’s spear. Fastest thing in the Bankenviertel.',a:'#e01e2b',b:'#1b1c22',c:'#ffffff',glow:'#ff4a3a',trail:'#ff5a2d',c1:'#ff3b3b',c2:'#ff8a7a',top:1.07,acc:1.01,han:.97,hull:.9,unlock:0,own:'ROSSI',rival:'ROSSI',kit:'spike'},
 {id:'v_weber',name:'Mainschiff',desc:'Weber’s river cruiser. Calm, stable, tough.',a:'#1d5fd6',b:'#e8f3ff',c:'#0d1b33',glow:'#5fb0ff',trail:'#3f9bff',c1:'#2f7bff',c2:'#9fc8ff',top:1.01,acc:1,han:1.06,hull:1.15,unlock:0,own:'WEBER',rival:'WEBER',kit:'twin'},
 {id:'v_moreau',name:'Lame de Nuit',desc:'Moreau’s blade wing. Carves the towers.',a:'#1a1a2e',b:'#c9a2ff',c:'#ffffff',glow:'#c46bff',trail:'#c46bff',c1:'#8c55ff',c2:'#d9b8ff',top:1.03,acc:1.02,han:1.16,hull:.88,unlock:0,own:'MOREAU',rival:'MOREAU',kit:'blade'},
 {id:'v_okafor',name:'Piste Bulldozer',desc:'Okafor’s plough. Rams first, asks never.',a:'#f2a20c',b:'#2a2f38',c:'#111111',glow:'#ffb84a',trail:'#ff9a2a',c1:'#ffb020',c2:'#ffd27a',top:.97,acc:.97,han:.95,hull:1.5,unlock:0,own:'OKAFOR',rival:'OKAFOR',kit:'ram'},
 {id:'v_ferreira',name:'Míssil Verde',desc:'Ferreira’s launcher. Twin rocket pods, brutal launch.',a:'#16a34a',b:'#f5c20c',c:'#0b2010',glow:'#5dffb0',trail:'#5dffb0',c1:'#22c55e',c2:'#9dffc8',top:1.02,acc:1.09,han:1,hull:.95,unlock:0,own:'FERREIRA',rival:'FERREIRA',kit:'pods'},
 {id:'v_celik',name:'Mayın',desc:'Çelik’s minelayer. Armoured tail.',a:'#7a1020',b:'#d0d4dc',c:'#ff2a3a',glow:'#ff3b55',trail:'#ff2a3a',c1:'#c0182f',c2:'#ff7a8a',top:1,acc:1,han:1,hull:1.25,unlock:0,own:'ÇELIK',rival:'ÇELIK',kit:'mine'},
 {id:'v_brandt',name:'Voltwerk',desc:'Brandt’s coil racer. Instant launch.',a:'#0ea5b7',b:'#0b1220',c:'#e8fbff',glow:'#4ceaff',trail:'#4ceaff',c1:'#22d3ee',c2:'#a5f3fc',top:1.02,acc:1.15,han:1.05,hull:.9,unlock:0,own:'BRANDT',rival:'BRANDT',kit:'coil'},
 {id:'v_naka',name:'Kage Rail',desc:'Nakamura’s sniper. Pure top speed, paper hull.',a:'#f4f4f5',b:'#18181b',c:'#e11d48',glow:'#ff4f7a',trail:'#ff2d55',c1:'#fafafa',c2:'#ff8aa5',top:1.09,acc:1,han:1,hull:.82,unlock:0,own:'NAKAMURA',rival:'NAKAMURA',kit:'sniper'},
 {id:'v_kaiser',name:'Kaiserkrone',desc:'The champion’s machine. Best at everything.',a:'#111111',b:'#f5c20c',c:'#ffffff',glow:'#ffd12c',trail:'#ffd12c',c1:'#f5c20c',c2:'#ffe27a',top:1.1,acc:1.08,han:1.07,hull:1.12,unlock:0,own:'SKYCUP',rival:'KAISER',kit:'crown'},
 {id:'v_taxi',name:'Taxi Turbo',desc:'A Frankfurt ivory taxi with a jet engine. Heavy.',a:'#efe6c8',b:'#1b1c22',c:'#f5c20c',glow:'#ffd84a',trail:'#ffd12c',c1:'#efe6c8',c2:'#fff6d8',top:1,acc:1.06,han:.98,hull:1.3,unlock:0,cost:25000,kit:'heavy'},
 {id:'v_ebbel',name:'Ebbelwoi Express',desc:'Sachsenhausen speed wagon. Quick and grippy.',a:'#8bc34a',b:'#6d2c1a',c:'#ffd12c',glow:'#c6ff6a',trail:'#9dff3a',c1:'#8bc34a',c2:'#d4ff9a',top:1.05,acc:1.06,han:1.06,hull:.95,unlock:0,cost:45000,kit:'twin'}];
const PERKS=[{id:'refill',icon:'⛽',name:'Nitro Refill',d:'+35 boost every time you pick up an item',flag:'ROSSI'},{id:'shield',icon:'🛡',name:'Long Shield',d:'Shields last almost twice as long',flag:'WEBER'},
 {id:'drift',icon:'🌀',name:'Drift Master',d:'Drift turbos charge 35% faster',flag:'MOREAU'},{id:'heal',icon:'🔧',name:'Scrap Heal',d:'Every KO repairs 30 hull',flag:'OKAFOR'},
 {id:'armor',icon:'🧱',name:'Missile Armour',d:'Missiles and rail shots do half damage',flag:'FERREIRA'},{id:'mines',icon:'🧹',name:'Sweeper',d:'Immune to mines and oil slicks',flag:'ÇELIK'},
 {id:'empwreck',icon:'⚡',name:'EMP Payback',d:'Getting wrecked fires an EMP at everyone near you',flag:'BRANDT'},{id:'rail',icon:'🎯',name:'Long Shot',d:'Rail range +60%, rockets fire 4',flag:'NAKAMURA'},
 {id:'start',icon:'🎁',name:'Loaded Start',d:'Start every race holding an item',lvl:4},{id:'slip',icon:'💨',name:'Slipstream',d:'Near misses give double boost',lvl:12},
 {id:'luck',icon:'🍀',name:'Lucky Box',d:'Item boxes treat you as two places further back',lvl:18},{id:'crown',icon:'👑',name:'Kaiser’s Crown',d:'+3% top speed',flag:'SKYCUP'}];
let PK=new Set();
function perkUnlocked(p){return p.flag?!!flags()[p.flag]:carStat().lvl>=p.lvl}
function perkReq(p){return p.flag?(p.flag==='SKYCUP'?'win the Sky Cup':'beat '+PD[p.flag].full):'driver level '+p.lvl}
function perkSlots(){const l=carStat().lvl;return l>=16?3:l>=8?2:1}
function perkEq(){return CR_perkAdd(perkEq0())}function perkEq0(){return store.get('mho_perks',[]).filter(id=>{const p=PERKS.find(q=>q.id===id);return p&&perkUnlocked(p)}).slice(0,perkSlots())}
function perkSet(){const s=new Set(perkEq());if(carStat().lvl>=10)s.add('_lock');return s}
function garOwned(){return store.get('mho_garage',[])}
function teamLocked(t){return t.unlock>medalPts()||(t.own&&!flags()[t.own])||(t.cost&&!garOwned().includes(t.id))}
function vehOf(p){const v=TEAMS.find(t=>t.rival===p);return v?Object.assign({},v,{top:1,acc:1,han:1,hull:1}):null}
function pickItem(s){const act=ships.filter(o=>!o.eliminated),n=act.length||1;let p=n>1?clamp(((s.place||Math.ceil(n/2))-1)/(n-1),0,1):.5;if(s.isPlayer&&PK.has('luck'))p=Math.min(1,p+2/Math.max(1,n-1));
  const W={turbo:1,shield:1.2-p*.6,mines:1.1-p*.8,oil:1-p*.6,wall:.9-p*.6,rockets:1,rail:.8,emp:.8,missile:.35+p*.9,tornado:.25+p*.9,magnet:.15+p*1.1,storm:p>.55?(p-.4)*1.4:0};
  let tot=0;for(const k in W)tot+=Math.max(0,W[k]);let r=R()*tot;for(const k in W){r-=Math.max(0,W[k]);if(r<=0)return k}return 'turbo'}
// ---------- Garage builder: parts, paint, livery pattern, number, horn (2K-style)
const GB_PARTS={nose:[['none','Stock nose',null,{}],['shark','Shark jaw',{pack:0},{top:1.01,hull:1.02}],['plough','Plough blade',{cost:2500,stars:12},{hull:1.1,top:.98}],['prongs','Twin prongs',{pack:3},{top:1.02,han:.99}],['duck','Duck bill',{pack:6},{han:1.03,top:.99}],['drill','Drill nose',{pack:9},{hull:1.05,acc:1.01}],['spike','Spear nose',null,{top:1.02,hull:.97}],['ram','Ram bar',{quest:'q_walls'},{hull:1.15,top:.98}]],
  wing:[['none','Stock wings',null,{}],['delta','Delta wings',{cost:2000,stars:8},{top:1.02,han:.99}],['bi','Biplane wings',{pack:2},{han:1.05,top:.98}],['stub','Stubby wings',null,{acc:1.02,han:.99}],['gull','Gull wings',{pack:5},{han:1.03}],['jets','Wing jets',{pack:8},{top:1.03,hull:.97}],['blade','Blade wings',{flag:'MOREAU'},{han:1.05,hull:.97}]],
  rear:[['none','Stock tail',null,{}],['spoiler','Big spoiler',{cost:1800,stars:5},{han:1.04,top:.99}],['fins','Tri fins',{pack:2},{han:1.02}],['nozzle','Jet nozzle',{pack:11},{acc:1.05,hull:.97}],['stacks','Exhaust stacks',{pack:5},{acc:1.03}],['twin','Twin booms',null,{han:1.03}],['pods','Rocket pods',{flag:'FERREIRA'},{acc:1.04}],['mine','Armoured tail',{flag:'ÇELIK'},{hull:1.08,acc:.98}]],
  side:[['none','Clean flanks',null,{}],['skirts','Side skirts',{cost:1500},{han:1.03}],['cannons','Side cannons',{pack:4},{hull:1.04,top:.99}],['bricks','Brick stacks',{pack:1},{hull:1.06,acc:.99}],['tubes','Neon tubes',{pack:7},{}],['floats','Pontoons',{pack:10},{hull:1.03,han:1.02}]],
  roof:[['none','Clean roof',null,{}],['coil','Tesla coils',{flag:'BRANDT'},{acc:1.04}],['sniper','Rail barrel',{flag:'NAKAMURA'},{top:1.03,hull:.96}],['heavy','Cargo rack',{quest:'q_taxi'},{hull:1.12,acc:.97}],['crown','Kaiser crown',{flag:'SKYCUP'},{top:1.02,acc:1.02,han:1.02,hull:1.02}],['antenna','Antenna',null,{}],['siren','Police lights',{pack:1},{}],['sfin','Shark fin',{pack:0},{han:1.02}],['flag','Frankfurt flag',{cost:1200},{}],['dish','Radar dish',{pack:8},{acc:1.01}],['pilot','Minifig pilot',{pack:11},{}]]};
const GB_COLS=['#e01e2b','#ff7a1c','#ffd12c','#36d17a','#22c5e4','#2f7bff','#8c55ff','#ff2d95','#ffffff','#9aa3b0','#2a2f38','#111111','#f5c20c','#d8dde4'],GB_NEON=['#ff2d95','#22e4ff','#ffd12c','#5dffb0','#c46bff','#ff5a2d','#ffffff'];
const GB_PATS=[['racing','Racing'],['plain','Plain'],['stripes','Stripes'],['flames','Flames'],['checker','Checker'],['split','Split'],['camo','Camo'],['bolt','Lightning',{pack:3}],['hex','Hexagons',{pack:6}],['dots','Polka dots',{cost:800}],['bricks','LEGO bricks',{pack:9}],['zebra','Zebra',{pack:10}],['sunset','Sunset',{cost:1600,stars:10}],['circuit','Circuit board',{pack:7}]];
const GB_HORNS=[['classic','Classic beep',null],['train','S-Bahn chime',{pack:4}],['goose','Angry goose',{cost:900}],['duck','Rubber duck',{quest:'q_ball'}],['bells','Wedding bells',{quest:'q_wedding'}],['fanfare','Stunt fanfare',{quest:'q_stunt'}],['truck','Cider truck',{quest:'q_cider'}]];
const gbOwn=()=>store.get('mho_gbown',[]),packs=()=>store.get('mho_packs',[]);
function gbReq(r,id){if(!r)return true;if(r.pack!=null)return packs().includes(r.pack);if(r.cost)return gbOwn().includes(id);if(r.flag)return !!flags()[r.flag];if(r.quest)return (roamSave().otg[r.quest]||0)>=1;if(r.stars)return Object.values(store.get('mho_stars',{})).reduce((a,b)=>a+b,0)>=r.stars;return true}
function gbReqTxt(r){return r.pack!=null?'find Brick Pack '+(r.pack+1):r.cost?(r.stars&&totStars()<r.stars?'needs '+r.stars+' ★ · then '+r.cost.toLocaleString('de-DE')+' studs':'buy · '+r.cost.toLocaleString('de-DE')+' studs'):r.flag?(r.flag==='SKYCUP'?'win the Sky Cup':'beat '+PD[r.flag].full.split(' ').pop()):r.quest?'quest: '+(QUESTS.find(q=>q.id===r.quest)||{}).name:r.stars+' ★'}
const gbBuild=()=>store.get('mho_build',null);
function gbTeam(base,b){if(!b||!b.on)return base;const t=Object.assign({},base,{a:b.a,b:b.b,c:b.c,glow:b.glow,trail:b.trail,c1:b.a,c2:b.b,pat:b.pat,num:b.num,kit:null,kits:Object.values(b.parts||{}).filter(k=>k&&k!=='none')});
  for(const cat in GB_PARTS){const p=GB_PARTS[cat].find(x=>x[0]===(b.parts||{})[cat]);if(p)for(const k in p[3])t[k]=(t[k]||1)*p[3][k]}
  t.id='cu_'+[b.a,b.b,b.c,b.glow,b.trail,b.pat,b.num,t.kits.join('-')].join('').replace(/[^a-z0-9]/gi,'');return t}
const playerTeam=()=>gbTeam(TEAMS[teamIdx],gbBuild());
function hornPlay(){const b=gbBuild(),h=(b&&b.horn)||'classic',A=AU,a=A.a;if(!a)return;const t=a.currentTime,F=A.fx;
  if(h==='classic'){A.osc(t,'square',415,.35,.14,F);A.osc(t,'square',523,.35,.1,F)}else if(h==='duck'){A.osc(t,'sawtooth',900,.12,.16,F,500);A.osc(t+.16,'sawtooth',900,.14,.16,F,450)}
  else if(h==='bells'){[1047,1319,1568,2093].forEach((f,i)=>A.osc(t+i*.12,'sine',f,.6,.12,F))}else if(h==='train'){[659,523,587,392].forEach((f,i)=>A.osc(t+i*.22,'sine',f,.3,.14,F))}else if(h==='goose'){for(let i=0;i<3;i++)A.osc(t+i*.18,'sawtooth',520-i*40,.14,.15,F,300)}else if(h==='fanfare'){[523,659,784,1047].forEach((f,i)=>A.osc(t+i*.1,'triangle',f,i===3?.45:.12,.16,F))}else{A.osc(t,'sawtooth',110,.9,.16,F);A.osc(t,'sawtooth',138,.9,.12,F);A.osc(t,'sawtooth',165,.9,.1,F)}
  if(state==='roam')for(const c of HUB.cars)if(Math.hypot(c.x-RO.x,c.z-RO.z)<40)c.hitT=Math.max(c.hitT||0,1.5)}
const GB={d:null,tab:'parts',r:null,sc:null,cam:null,mesh:null,rot:.6,raf:0,drag:null};
function gbOpen(){const cur=gbBuild(),base=TEAMS[teamIdx];GB.d=cur?JSON.parse(JSON.stringify(cur)):{on:true,a:base.a,b:base.b,c:base.c,glow:base.glow,trail:base.trail,pat:'racing',num:Math.floor(R()*90+10),parts:{nose:'none',wing:'none',rear:'none',roof:'none',side:'none'},horn:'classic'};GB.d.on=true;if(!(GB.d.bricks&&GB.d.bricks.length)){GB.d.bricks=CR_DEF().map(b=>({...b}));GB.d.bp=1}
  $('#gbx').hidden=false;if(!GB.r){const cvs=$('#gbC');GB.r=new THREE.WebGLRenderer({canvas:cvs,antialias:true,alpha:true});GB.r.outputColorSpace=THREE.SRGBColorSpace;GB.r.toneMapping=THREE.ACESFilmicToneMapping;GB.sc=new THREE.Scene();GB.sc.add(new THREE.HemisphereLight(0xe8ecff,0x40384a,1.6));const d=new THREE.DirectionalLight(0xffffff,2.4);d.position.set(5,9,6);GB.sc.add(d);const d2=new THREE.DirectionalLight(0x88ccff,1);d2.position.set(-6,3,-5);GB.sc.add(d2);
    const fl=new THREE.Mesh(new THREE.CylinderGeometry(9,9,.3,48),new THREE.MeshStandardMaterial({color:0x1b2440,roughness:.6}));fl.position.y=-.4;GB.sc.add(fl);const rg=new THREE.Mesh(new THREE.TorusGeometry(9,.08,6,64),neonMat('#22e4ff',2));rg.rotation.x=Math.PI/2;rg.position.y=-.2;GB.sc.add(rg);GB.cam=new THREE.PerspectiveCamera(35,1,.1,100);
    cvs.addEventListener('pointerdown',e=>{GB.drag=e.clientX;cvs.setPointerCapture(e.pointerId)});cvs.addEventListener('pointermove',e=>{if(GB.drag!=null){GB.rot+=(e.clientX-GB.drag)*.01;GB.drag=e.clientX}});cvs.addEventListener('pointerup',()=>GB.drag=null)}
  gbRender();gbLoop()}
function gbLoop(){if($('#gbx').hidden)return;const cvs=$('#gbC'),w=cvs.clientWidth,h=cvs.clientHeight;if(cvs.width!==Math.round(w*DPR2())){GB.r.setPixelRatio(DPR2());GB.r.setSize(w,h,false);GB.cam.aspect=w/h;GB.cam.updateProjectionMatrix()}
  if(GB.drag==null)GB.rot+=.004;GB.cam.position.set(Math.sin(GB.rot)*21,8,Math.cos(GB.rot)*21);GB.cam.lookAt(0,-.6,0);GB.r.render(GB.sc,GB.cam);GB.raf=requestAnimationFrame(gbLoop)}
// R1: garage stats read like 2K: a chip −3…+3 per stat (relative to the team's base car, 1 step ≈ 4 %) and a weight class from the brick count
function R1_chip(v,b0){const dd=(v/(b0||1)-1)*100;return Math.sign(dd)*Math.min(3,Math.round(Math.abs(dd)/4))}
const R1_WT=[[0,'SUPER LIGHT'],[40,'LIGHT'],[70,'MEDIUM'],[110,'HEAVY'],[160,'SUPER HEAVY'],[230,'MASSIVE']];
function R1_weight(n){let w=R1_WT[0][1];for(const[k,nm]of R1_WT)if(n>=k)w=nm;return w}
function gbRender(){const d=GB.d,t=gbTeam(TEAMS[teamIdx],d);if(GB.mesh)GB.sc.remove(GB.mesh);GB.mesh=shipMesh(t);GB.mesh.userData.boat.visible=false;GB.mesh.userData.wheels.visible=false;GB.mesh.userData.shield.visible=false;for(const rb of GB.mesh.userData.ribbons)rb.scale.z=4;GB.sc.add(GB.mesh);
  const base=TEAMS[teamIdx],bar=(n,k)=>{const c=R1_chip(t[k],base[k]);return`<div class="r1C"><span>${n}</span><i>${[-3,-2,-1,1,2,3].map(j=>`<b class="${j<0?(c<=j?'dn':''):(c>=j?'up':'')}"></b>`).join('')}</i><em class="${c>0?'up':c<0?'dn':''}">${c>0?'+'+c:c<0?'−'+(-c):'±0'}</em></div>`};
  $('#gbStats').innerHTML=`<h4>${base.name} · #${d.num} <span class="r1W">${R1_weight((d.bricks||[]).length)}</span></h4>`+bar('TOP SPEED','top')+bar('ACCEL','acc')+bar('GRIP','han')+bar('HULL','hull');
  const B=$('#gbBody');let h='';const sw=(key,list,lock)=>`<div class="gbSw">${list.map(c=>{const lk=lock&&lock(c);return`<button ${lk?'disabled title="'+lk+'"':''} data-k="${key}" data-v="${c}" class="${d[key]===c?'on':''}" style="--c:${c}">${lk?'🔒':''}</button>`}).join('')}</div>`;
  if(GB.tab==='parts'){for(const cat in GB_PARTS){h+=`<h5>${{nose:'NOSE',wing:'WINGS',rear:'REAR',roof:'ROOF',side:'FLANKS'}[cat]}</h5><div class="gbRow">`;for(const[id,nm,req,mod]of GB_PARTS[cat]){const ok=gbReq(req,id),buy=!ok&&req&&req.cost&&!(req.stars&&totStars()<req.stars),fx=Object.entries(mod).map(([k,v])=>`${{top:'top',acc:'acc',han:'grip',hull:'hull'}[k]} ${v>1?'+':''}${Math.round((v-1)*100)}%`).join(' · ');h+=`<button class="gbP ${d.parts[cat]===id?'on':''}" ${ok||buy?'':'disabled'} ${buy?`data-buy="${id}" data-cost="${req.cost}"`:''} data-cat="${cat}" data-id="${id}"><b>${ok?'':buy?'🛒 ':'🔒 '}${nm}</b><small>${ok?(fx||'—'):gbReqTxt(req)}</small></button>`}h+='</div>'}h=`<div class="gbInfo">🟡 ${season().cr.toLocaleString('de-DE')} studs · 📦 Brick Packs ${packs().length}/12 found in the city</div>`+h}
  else if(GB.tab==='paint'){const prem=c=>(c==='#f5c20c'||c==='#d8dde4')&&!gbReq({stars:25})?'25 ★ needed':'';h+=`<h5>BODY</h5>${sw('a',GB_COLS,prem)}<h5>ACCENT</h5>${sw('b',GB_COLS,prem)}<h5>TRIM</h5>${sw('c',GB_COLS,prem)}<h5>GLOW</h5>${sw('glow',GB_NEON)}<h5>EXHAUST TRAIL</h5>${sw('trail',GB_NEON)}<h5>LIVERY</h5><div class="gbRow">${GB_PATS.map(([id,nm,req])=>{const ok=gbReq(req,'pat_'+id),buy=!ok&&req&&req.cost;return`<button class="gbP ${d.pat===id?'on':''}" ${ok||buy?'':'disabled'} ${buy?`data-buy="pat_${id}" data-cost="${req.cost}"`:''} data-pat="${id}"><b>${ok?'':buy?'🛒 ':'🔒 '}${nm}</b>${ok?'':`<small>${gbReqTxt(req)}</small>`}</button>`}).join('')}</div><h5>RACE NUMBER</h5><div class="gbRow"><button class="gbP" data-num="-1"><b>−</b></button><button class="gbP on"><b>#${d.num}</b></button><button class="gbP" data-num="1"><b>+</b></button></div>`}
  else{h+=`<h5>HORN · press H while driving${TOUCH.on?' (or 📯)':''}</h5><div class="gbRow">${GB_HORNS.map(([id,nm,req])=>{const ok=gbReq(req,'horn_'+id),buy=!ok&&req&&req.cost;return`<button class="gbP ${d.horn===id?'on':''}" ${ok||buy?'':'disabled'} ${buy?`data-buy="horn_${id}" data-cost="${req.cost}"`:''} data-horn="${id}"><b>${ok?'':buy?'🛒 ':'🔒 '}${nm}</b><small>${ok?'tap to try':gbReqTxt(req)}</small></button>`}).join('')}</div>`}
  B.innerHTML=h;document.querySelectorAll('#gbx .gbTabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===GB.tab));
  B.querySelectorAll('button').forEach(b=>b.onclick=()=>{const s=b.dataset;if(s.buy){const S2=season(),c=+s.cost;if(S2.cr<c){b.querySelector('small').textContent='need '+(c-S2.cr).toLocaleString('de-DE')+' more studs';AU.sfx('bump');return}S2.cr-=c;saveSeason(S2);const o=gbOwn();o.push(s.buy);store.set('mho_gbown',o);AU.sfx('brick')}if(s.k){d[s.k]=s.v}else if(s.cat){d.parts=d.parts||{};d.parts[s.cat]=s.id}else if(s.pat){d.pat=s.pat}else if(s.num){d.num=(d.num+ +s.num+100)%100}else if(s.horn){d.horn=s.horn;const keep=store.get('mho_build',null);store.set('mho_build',d);hornPlay();store.set('mho_build',keep);return}else return;AU.sfx('pick');gbRender()})}
function gbClose(save){cancelAnimationFrame(GB.raf);$('#gbx').hidden=true;if(save){store.set('mho_build',GB.d);AU.sfx('brick');if(state==='roam'){roamSavePos();enterRoam()}else if(state==='menu')refreshAttract&&refreshAttract()}if(RO.card&&RO.card.kind==='garage')roamOpen(RO.card)}
// extra livery patterns + race number on top of the stock design
function liveryPat(t,g){const W=512,col=t.b;if(t.pat==='plain'){g.fillStyle=t.a;g.fillRect(0,0,W,W)}
  else if(t.pat==='stripes'){g.fillStyle=t.a;g.fillRect(0,0,W,W);g.fillStyle=col;g.fillRect(W*.2,0,W*.1,W);g.fillRect(W*.34,0,W*.1,W);g.fillStyle=t.c;g.fillRect(W*.315,0,W*.012,W)}
  else if(t.pat==='flames'){g.fillStyle=t.a;g.fillRect(0,0,W,W);g.fillStyle=col;for(let i=0;i<7;i++){const y=i*76;g.beginPath();g.moveTo(0,y);g.quadraticCurveTo(W*.35,y+20,W*.55,y+38);g.quadraticCurveTo(W*.3,y+50,0,y+70);g.fill()}g.fillStyle=t.c;for(let i=0;i<7;i++){const y=i*76+14;g.beginPath();g.moveTo(0,y);g.quadraticCurveTo(W*.2,y+14,W*.33,y+24);g.quadraticCurveTo(W*.18,y+34,0,y+42);g.fill()}}
  else if(t.pat==='checker'){g.fillStyle=t.a;g.fillRect(0,0,W,W);g.fillStyle=col;const s=32;for(let y=0;y<W;y+=s)for(let x=0;x<W;x+=s)if((x/s+y/s)%2)g.fillRect(x,y,s,s)}
  else if(t.pat==='split'){g.fillStyle=t.a;g.fillRect(0,0,W/2,W);g.fillStyle=col;g.fillRect(W/2,0,W/2,W);g.fillStyle=t.c;g.fillRect(W/2-4,0,8,W)}
  else if(t.pat==='camo'){g.fillStyle=t.a;g.fillRect(0,0,W,W);const r=mul(7);for(let i=0;i<40;i++){g.fillStyle=i%2?col:t.c;g.globalAlpha=.85;g.beginPath();g.ellipse(r()*W,r()*W,20+r()*50,12+r()*30,r()*3,0,7);g.fill()}g.globalAlpha=1}
  else if(t.pat==='bolt'){g.fillStyle=t.a;g.fillRect(0,0,W,W);g.fillStyle=col;for(const y0 of[60,300]){g.beginPath();g.moveTo(0,y0);g.lineTo(W*.4,y0+20);g.lineTo(W*.32,y0+60);g.lineTo(W,y0+90);g.lineTo(W*.5,y0+70);g.lineTo(W*.58,y0+36);g.closePath();g.fill()}}
  else if(t.pat==='hex'){g.fillStyle=t.a;g.fillRect(0,0,W,W);g.strokeStyle=col;g.lineWidth=5;const r=28;for(let y=0,row=0;y<W+r;y+=r*1.5,row++)for(let x=row%2?r*.87:0;x<W+r;x+=r*1.74){g.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3+Math.PI/6;g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}g.closePath();g.stroke()}}
  else if(t.pat==='dots'){g.fillStyle=t.a;g.fillRect(0,0,W,W);g.fillStyle=col;for(let y=0;y<W;y+=48)for(let x=(y/48)%2*24;x<W;x+=48){g.beginPath();g.arc(x,y,13,0,7);g.fill()}}
  else if(t.pat==='bricks'){g.fillStyle=t.a;g.fillRect(0,0,W,W);g.strokeStyle=col;g.lineWidth=4;for(let y=0,r=0;y<W;y+=32,r++){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();for(let x=r%2*32;x<W;x+=64){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+32);g.stroke()}}}
  else if(t.pat==='zebra'){g.fillStyle=t.a;g.fillRect(0,0,W,W);g.fillStyle=col;for(let i=0;i<14;i++){g.beginPath();g.moveTo(i*40,0);g.quadraticCurveTo(i*40+40,W*.5,i*40-10,W);g.lineTo(i*40+12,W);g.quadraticCurveTo(i*40+58,W*.5,i*40+18,0);g.fill()}}
  else if(t.pat==='sunset'){const gr=g.createLinearGradient(0,0,0,W);gr.addColorStop(0,t.a);gr.addColorStop(.6,col);gr.addColorStop(1,t.c);g.fillStyle=gr;g.fillRect(0,0,W,W)}
  else if(t.pat==='circuit'){g.fillStyle=t.a;g.fillRect(0,0,W,W);g.strokeStyle=col;g.fillStyle=col;g.lineWidth=4;const r=mul(11);for(let i=0;i<26;i++){let x=r()*W,y=r()*W;g.beginPath();g.moveTo(x,y);for(let k=0;k<3;k++){if(k%2)x+=(r()-.5)*160;else y+=(r()-.5)*160;g.lineTo(x,y)}g.stroke();g.beginPath();g.arc(x,y,7,0,7);g.fill()}}
  if(t.num!=null){g.fillStyle='#ffffff';g.beginPath();g.arc(W*.62,W*.5,46,0,7);g.fill();g.fillStyle='#111';g.font='italic 900 54px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText(String(t.num),W*.62,W*.5+2)}}
function kitParts(k,m,paint,trim,dark,team){const B=(mat,w,h,d,x,y,z,rx=0,ry=0,rz=0)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);m.add(o);return o};const gl=neonMat(team.glow,2.5);
  if(k==='spike'){const c=new THREE.Mesh(new THREE.ConeGeometry(.45,4,10),trim);c.rotation.x=-Math.PI/2;c.position.set(0,.2,-6.4);m.add(c);for(const sd of[-1,1])B(paint,.14,2.6,1.4,sd*2.2,1.4,3.6,-.4)}
  else if(k==='ram'){B(dark,7.2,1.1,.7,0,-.1,-5.2);for(const sd of[-1,0,1])B(trim,.5,1.5,.5,sd*2.4,.1,-5.5);B(gl,6.4,.18,.2,0,.5,-5.6)}
  else if(k==='blade'){for(const sd of[-1,1])B(paint,4.6,.12,2.2,sd*7.4,.1,2.6,0,sd*.25,sd*-.12)}
  else if(k==='twin'){for(const sd of[-1,1]){B(trim,.6,.6,5.6,sd*1.6,.6,5.2);B(paint,.12,2,1.6,sd*1.6,1.6,7.2,-.3)}B(paint,3.8,.12,1.2,0,2.4,7.4)}
  else if(k==='pods'){for(const sd of[-1,1]){const c=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,3,10),trim);c.rotation.x=Math.PI/2;c.position.set(sd*4.4,.55,.6);m.add(c);for(const r of[-.22,.22])B(gl,.18,.18,.2,sd*4.4+r,.55+r,-.95)}}
  else if(k==='mine'){for(const sd of[-1,1]){B(dark,1.2,1.2,1.6,sd*1.8,.4,4.6);B(neonMat('#ff2a3a',3),.5,.5,.1,sd*1.8,.4,5.45)}}
  else if(k==='coil'){for(let i=0;i<3;i++){const t=new THREE.Mesh(new THREE.TorusGeometry(.9,.14,6,16),gl);t.position.set(0,1.3,.6+i*1.1);m.add(t)}}
  else if(k==='sniper'){const c=new THREE.Mesh(new THREE.CylinderGeometry(.2,.28,7,10),dark);c.rotation.x=Math.PI/2;c.position.set(0,1.25,-2.4);m.add(c);B(gl,.12,.12,6.4,0,1.5,-2.4)}
  else if(k==='heavy'){B(paint,6.6,.9,4,0,.75,.8);B(neonMat('#ffd12c',2.5),2.2,.4,.8,0,1.4,.2)}
  else if(k==='shark'){B(paint,3.4,.5,2.2,0,-.15,-5.6);for(let i=-3;i<=3;i++){const c=new THREE.Mesh(new THREE.ConeGeometry(.16,.5,4),neonMat('#ffffff',1.6));c.rotation.x=Math.PI;c.position.set(i*.42,-.4,-6.5);m.add(c)}}
  else if(k==='plough'){B(dark,8,1.8,.4,0,.1,-6,-.35);B(neonMat('#ffd12c',2.4),8.1,.2,.42,0,-.7,-6.1,-.35)}
  else if(k==='prongs'){for(const sd of[-1,1]){const c=new THREE.Mesh(new THREE.CylinderGeometry(.18,.32,4.4,8),trim);c.rotation.x=Math.PI/2;c.position.set(sd*1.5,0,-7);m.add(c);B(gl,.25,.25,.25,sd*1.5,0,-9.2)}}
  else if(k==='duck'){B(neonMat('#ff9a1c',1.3),3.6,.35,2.6,0,-.05,-6.6)}
  else if(k==='drill'){const c=new THREE.Mesh(new THREE.ConeGeometry(1,3.6,8),trim);c.rotation.x=-Math.PI/2;c.position.set(0,.1,-7.2);m.add(c);for(let i=0;i<3;i++){const t=new THREE.Mesh(new THREE.TorusGeometry(.75-i*.2,.08,4,14),gl);t.position.set(0,.1,-6.2-i*.9);m.add(t)}}
  else if(k==='delta'){for(const sd of[-1,1]){const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(sd*8,3);sh.lineTo(0,5);const g2=new THREE.Mesh(new THREE.ShapeGeometry(sh),paint);g2.material.side=THREE.DoubleSide;g2.rotation.x=-Math.PI/2;g2.position.set(sd*1.5,.15,4);m.add(g2)}}
  else if(k==='bi'){for(const y of[.1,2.2])for(const sd of[-1,1])B(paint,5,.12,1.8,sd*5.4,y,1.8);for(const sd of[-1,1])B(trim,.14,2.1,.14,sd*6.8,1.15,1.8)}
  else if(k==='stub'){for(const sd of[-1,1])B(paint,2.4,.3,2.4,sd*4.6,.15,1.6)}
  else if(k==='gull'){for(const sd of[-1,1])B(paint,5.2,.14,2.2,sd*5.6,1.1,2.2,0,0,sd*.42)}
  else if(k==='jets'){for(const sd of[-1,1]){const c=new THREE.Mesh(new THREE.CylinderGeometry(.6,.45,2.6,10),dark);c.rotation.x=Math.PI/2;c.position.set(sd*6.4,-.2,2.6);m.add(c);B(gl,.7,.7,.12,sd*6.4,-.2,3.95)}}
  else if(k==='spoiler'){for(const sd of[-1,1])B(trim,.2,1.6,.5,sd*2.4,1.4,6.4);B(paint,6.4,.2,1.6,0,2.3,6.6,-.15)}
  else if(k==='fins'){for(const a of[-.6,0,.6])B(paint,.14,2.4,2,Math.sin(a)*1.4,1.5,6.6,0,0,a)}
  else if(k==='nozzle'){const c=new THREE.Mesh(new THREE.CylinderGeometry(1.1,.8,2.2,12,1,true),dark);c.rotation.x=Math.PI/2;c.position.set(0,.5,7);m.add(c);const f=new THREE.Mesh(new THREE.CircleGeometry(.85,12),neonMat(team.trail,3));f.position.set(0,.5,8.05);m.add(f)}
  else if(k==='stacks'){for(const sd of[-1,1])for(const z of[4.6,5.6]){const c=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,2.2,8),neonMat('#c0c6d0',.8));c.position.set(sd*2.3,1.5,z);m.add(c)}}
  else if(k==='skirts'){for(const sd of[-1,1]){B(dark,.4,.6,9,sd*3.3,-.5,.6);B(gl,.1,.12,8.6,sd*3.52,-.5,.6)}}
  else if(k==='cannons'){for(const sd of[-1,1]){const c=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,3.4,10),dark);c.rotation.x=Math.PI/2;c.position.set(sd*3.4,.6,-1);m.add(c)}}
  else if(k==='bricks'){const cs=[team.a,team.b,'#ffd12c'];for(const sd of[-1,1])for(let i=0;i<3;i++){const mm=new THREE.MeshStandardMaterial({color:cs[i%3],roughness:.4});B(mm,1.3,.7,1.9,sd*3.6,.0+i*.72,1.2);for(const zz of[-.45,.45]){const s2=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,.22,10),mm);s2.position.set(sd*3.6,.45+i*.72,1.2+zz);m.add(s2)}}}
  else if(k==='tubes'){for(const sd of[-1,1]){const c=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,7,8),neonMat(team.glow,3.2));c.rotation.x=Math.PI/2;c.position.set(sd*3.1,.4,.8);m.add(c)}}
  else if(k==='floats'){for(const sd of[-1,1]){const c=new THREE.Mesh(new THREE.CapsuleGeometry(.6,6,4,10),trim);c.rotation.x=Math.PI/2;c.position.set(sd*3.8,-.7,.8);m.add(c)}}
  else if(k==='antenna'){const c=new THREE.Mesh(new THREE.CylinderGeometry(.05,.08,4,6),dark);c.position.set(1,3,3);m.add(c);B(gl,.3,.3,.3,1,5,3)}
  else if(k==='siren'){B(dark,2.6,.3,.7,0,1.55,.6);B(neonMat('#ff2a3a',3.2),1.1,.45,.6,-.7,1.9,.6);B(neonMat('#2a7bff',3.2),1.1,.45,.6,.7,1.9,.6)}
  else if(k==='sfin'){const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(3,0);sh.lineTo(2.4,2.6);const f=new THREE.Mesh(new THREE.ShapeGeometry(sh),paint);f.material.side=THREE.DoubleSide;f.rotation.y=-Math.PI/2;f.position.set(0,1.3,2);m.add(f)}
  else if(k==='flag'){const c=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,4.2,6),dark);c.position.set(-1.2,3.2,4.6);m.add(c);B(new THREE.MeshStandardMaterial({color:'#e01e2b'}),.06,.7,2,-1.2,4.9,5.6);B(new THREE.MeshStandardMaterial({color:'#ffffff'}),.06,.7,2,-1.2,4.2,5.6)}
  else if(k==='dish'){const c=new THREE.Mesh(new THREE.SphereGeometry(1.1,12,8,0,Math.PI*2,0,Math.PI/3),trim);c.material.side=THREE.DoubleSide;c.rotation.x=-.9;c.position.set(0,2.2,3);m.add(c);B(dark,.2,1,.2,0,1.6,3.2)}
  else if(k==='pilot'){const f=minifig(team.a);f.scale.setScalar(.55);f.position.set(0,1.1,.4);m.add(f)}
  else if(k==='crown'){for(let i=0;i<5;i++){const c=new THREE.Mesh(new THREE.ConeGeometry(.35,1.6,6),neonMat('#ffd12c',2.6));c.position.set((i-2)*.9,1.9,1.2);m.add(c)}for(const sd of[-1,1])B(paint,.16,3,2.2,sd*5.8,1.4,3.6,-.3)}}
const PILOTS=['VOSS','KAYA','LINDQVIST','OKAFOR','BRANDT','NAKAMURA','FERREIRA','ADLER','ROSSI','WEBER','ÇELIK','MOREAU'];
// rival pilots: rating r (0 weakest … 1 champion), personality drives aggression, weapon use and radio lines
const PDL=[{n:'ROSSI',full:'Luca Rossi',flag:'🇮🇹',team:'zeil',style:'showman',r:.05},{n:'WEBER',full:'Jana Weber',flag:'🇩🇪',team:'nordend',style:'clean',r:.12},
 {n:'MOREAU',full:'Inès Moreau',flag:'🇫🇷',team:'helix',style:'clean',r:.2},{n:'OKAFOR',full:'Tunde Okafor',flag:'🇳🇬',team:'aeppler',style:'aggressor',r:.28},
 {n:'FERREIRA',full:'Rui Ferreira',flag:'🇵🇹',team:'ostend',style:'gunner',r:.36},{n:'ÇELIK',full:'Deniz Çelik',flag:'🇹🇷',team:'zeil',style:'aggressor',r:.45},
 {n:'BRANDT',full:'Ole Brandt',flag:'🇩🇪',team:'nordend',style:'gunner',r:.53},{n:'NAKAMURA',full:'Aoi Nakamura',flag:'🇯🇵',team:'helix',style:'clean',r:.62},
 {n:'LINDQVIST',full:'Saga Lindqvist',flag:'🇸🇪',team:'ostend',style:'showman',r:.7},{n:'ADLER',full:'Max Adler',flag:'🇩🇪',team:'aeppler',style:'gunner',r:.8},
 {n:'KAYA',full:'Elif Kaya',flag:'🇹🇷',team:'kronos',style:'aggressor',r:.9},{n:'VOSS',full:'Mira Voss',flag:'🇩🇪',team:'kronos',style:'clean',r:1}];
const BOSS_TEAM={id:'shadow',name:'Schattenwerk',desc:'Nobody knows who pays for it.',a:'#16121c',b:'#ff1e3c',c:'#ffffff',glow:'#ff2a4a',trail:'#ff1e3c',c1:'#ff1e3c',c2:'#ff6a7a',top:1.04,acc:1.06,han:1.05,hull:1.4,unlock:0};
const PD=Object.fromEntries([...PDL,{n:'KAISER',full:'Vex Kaiser',flag:'🏴',team:'shadow',style:'aggressor',r:1}].map(p=>[p.n,p]));
const teamOf=pd=>pd.team==='shadow'?BOSS_TEAM:TEAMS.find(t=>t.id===pd.team)||TEAMS[0];
// LEGO-2K-style world events: beat rivals one-on-one for their flags, 5 flags open the Grand Arena boss race
const SIG={boost:'Turbo burst',shield:'Iron shield',missile:'Homing missiles',mines:'Mine trail',emp:'EMP pulse',rail:'Rail sniper',ram:'Battering ram'};
const RIVAL_EV=[{p:'ROSSI',track:'grand',mood:'brick',sig:'boost',line:'Show me what you have, rookie!'},{p:'WEBER',track:'hafen',mood:'dawn',sig:'shield',line:'Clean racing on the river. Ready?'},
 {p:'MOREAU',track:'sky',mood:'fog',sig:'boost',line:'Up in the towers you will lose me.'},{p:'OKAFOR',track:'fraport',mood:'night',sig:'ram',line:'The piste is MY yard.'},
 {p:'FERREIRA',track:'hafen',mood:'storm',sig:'missile',line:'Locking on…'},{p:'ÇELIK',track:'grand',mood:'storm',sig:'mines',line:'Watch where you drive.'},
 {p:'BRANDT',track:'fraport',mood:'dawn',sig:'emp',line:'Systems ready. Are yours?'},{p:'NAKAMURA',track:'sky',mood:'night',sig:'rail',line:'One shot is all I need.'}];
const BOSS_EV={p:'KAISER',track:'grand',mood:'storm',sig:'boss',need:5,line:'Flags? Cute. The Sky Cup is mine. It always will be.'};
const flagsR=()=>store.peek('mho_flags',{}),flags=()=>store.get('mho_flags',{});
const BOSS_LINES=['Rules are for rookies.','Did you see that? No? Good.','Shortcut privileges, sorry!','The Sky Cup is MINE.','Catch me if you can. You cannot.'];
function radioLine(s,line){const p=PD[s.pid];const el=$('#radio');if(!el||!p)return;el.querySelector('img').src=avatar(p.n);el.querySelector('b').textContent=`${p.flag} ${p.n}${p.n==='KAISER'||p.n==='DRAKOS'?' · BOSS':''}`;el.querySelector('span').textContent=line;el.classList.add('on');clearTimeout(radioT);radioT=setTimeout(()=>el.classList.remove('on'),2800)}
function worldCfg(ev){const boss=ev===BOSS_EV||!!ev.boss,td=TRACK_DEFS.find(t=>t.id===ev.track);return{type:'race',laps:boss?3:Math.max(2,td.laps-1),traffic:boss?10:14,items:true,aggr:boss?.4:(ev.sig==='ram'?.45:.15),track:ev.track,mood:ev.mood,world:ev,rival:boss?null:ev.p,boss}}
function sigTick(s){if(!s.sig||s.dead>0||s.eliminated||state!=='race'||!pl)return;s.sigT=(s.sigT??rr(4,7))-H;const ahead=tdd(s.dist,pl.dist)>0,gap=Math.abs(tdd(s.dist,pl.dist));
  if(s.sig==='boss'){if(!ahead&&gap>30)s.v=Math.max(s.v,pl.v*.98);if(s.sigT<=0){s.sigT=rr(6,9);if(ahead&&gap<120){s.item='mines';useItem(s)}else if(gap<40){s.item='emp';useItem(s)}else s.boost=2.5;if(R()<.5){const BL=s.pid==='DRAKOS'?DRAKOS_LINES:BOSS_LINES;radioLine(s,BL[Math.floor(R()*BL.length)])}}return}
  if(s.sigT>0)return;s.sigT=rr(7,11);const k=s.sig;
  if(k==='boost'||k==='ram'){s.boost=2.2;if(k==='ram')s.attackT=1.4}else if(k==='shield')s.shield=3;
  else if(k==='mines'){if(!ahead)return;s.item='mines';useItem(s)}else if(k==='missile'||k==='rail'){if(ahead)return;s.item=k;useItem(s)}else if(k==='emp'){if(gap>40)return;s.item='emp';useItem(s)}
  if(near(s))feed(`${s.pid} · ${SIG[k].toUpperCase()}`,0,'#ff7ac0')}
const STYLE_NAME={clean:'Clean racer',aggressor:'Aggressor',gunner:'Gunner',showman:'Showman'};
const TAUNT={aggressor:{gloat:['Out of my way, rookie.','Stay down.','That is how we drive here.'],hurt:['You will pay for that.','Cheap shot!','See you next lap…'],pass:['Too slow!','Coming through!','Move!']},
 clean:{gloat:['Sorry, racing incident.','Nothing personal.'],hurt:['Hey! Keep it clean!','Was that necessary?'],pass:['Inside line, thanks.','Better luck next corner.']},
 gunner:{gloat:['Target down.','Lock, fire, done.'],hurt:['Lucky shot.','Systems hit. I will remember.'],pass:['Watch your six.','Missiles warm.']},
 showman:{gloat:['Did you get that on camera?','Style points!'],hurt:['Ouch, the paint!','My sponsors saw that.'],pass:['Smile for the crowd!','Ciao!']}};
const NEM_LINES=['Again? I have been waiting for you.','This time you are mine.','Not you again.','Remember me?'];
const LEAGUES=[{name:'Rookie Cup',sh:'Rookie',cls:'rookie'},{name:'Main Series',sh:'Main',cls:'pro'},{name:'Elite Series',sh:'Elite',cls:'elite'},{name:'Master Series',sh:'Master',cls:'master'},{name:'Mainhattan Grand Prix',sh:'Grand Prix',cls:'legend'}];
const RND_NAMES=['Opening Round','Pure Speed','Eliminator','Contact Sport','Grand Final'];
const SPTS=[25,18,15,12,10,8,6,4],SCRED=[5000,3500,2600,2000,1500,1100,800,600],UPC=[4000,8000,14000,22000,32000],UPS=[0,6,15,28,45];
const UPG=[{k:'eng',name:'Engine',fx:'+3% top speed'},{k:'thr',name:'Thrusters',fx:'+6% acceleration'},{k:'han',name:'Handling',fx:'+4% grip'},{k:'arm',name:'Armour',fx:'+10% hull'}];
// Four circuits through one Frankfurt. cp: [x, height, z, sector] (x/z scaled by S). Jumps are found on the built track:
// river = where the road crosses the Main inside [xmin,xmax]; pit/sky = a gap of ±half metres around the sample nearest `at`.
const TRACK_DEFS=[
 {id:'grand',name:'Mainhattan Grand Prix',short:'Grand Prix',laps:3,tunnel:'U-BAHN · HAUPTWACHE',
  desc:'The full city: the Bankenviertel canyon, the Zeil, the EZB, the broken Flößerbrücke, the U-Bahn and the Messe.',
  cp:[[-600,4,-120,'BANKENVIERTEL'],[-600,4,-300,'BANKENVIERTEL'],[-560,6,-800,'BANKENVIERTEL'],[-350,10,-1050,'ESCHENHEIMER TOR'],[100,8,-1100,'ZEIL'],[600,8,-1080,'ZEIL'],
 [1000,14,-950,'KONSTABLERWACHE'],[1400,26,-700,'OSTEND'],[1650,30,-350,'OSTEND · EZB'],[1650,40,150,'OSTEND · EZB'],[1550,55,600,'FLÖSSERBRÜCKE'],[1300,45,1000,'SACHSENHAUSEN'],
 [800,20,1100,'SACHSENHAUSEN'],[300,10,1050,'MUSEUMSUFER'],[-100,12,950,'MUSEUMSUFER'],[-300,22,600,'EISERNER STEG'],[-300,0,100,'RÖMERBERG'],[-450,-30,-150,'U-BAHN TUNNEL'],
 [-800,-30,-300,'U-BAHN TUNNEL'],[-1150,-5,-350,'WESTEND'],[-1550,5,-450,'MESSE'],[-1900,10,-300,'MESSE'],[-2050,12,50,'FESTHALLE'],[-1800,8,300,'GALLUS'],[-1300,4,300,'GLEISFELD'],
 [-900,4,300,'HAUPTBAHNHOF'],[-680,4,260,'HAUPTBAHNHOF'],[-600,4,100,'BANKENVIERTEL']],
  jumps:[{id:'main',name:'MAIN',kind:'river',xmin:0,xmax:9e9,jw:70,msg:'INTO THE MAIN'},{id:'gleis',name:'GLEISFELD',kind:'pit',at:[-1110,300],half:32,floor:-12,style:'rail',msg:'INTO THE RAIL YARD'}],clear:[]},
 {id:'hafen',name:'Westhafen Loop',short:'Westhafen',laps:3,tunnel:'',
  desc:'A harbour circuit with a splash: dive off the flyover into the Main, race the river as a boat over waves and boost rings, then ramp back onto the road.',
  cp:[[-650,6,390,'WESTHAFEN'],[-1000,6,400,'WESTHAFEN'],[-1350,8,370,'WESTHAFEN · KRANE'],[-1650,12,300,'GUTLEUT'],[-1830,16,150,'GUTLEUT'],[-1800,22,-50,'GALLUS'],
   [-1550,28,-150,'GALLUS'],[-1250,32,-110,'MAINZER LANDSTRASSE'],[-1080,34,60,'MAINZER LANDSTRASSE'],[-1050,36,300,'HAFEN-FLYOVER'],[-1062,30,420,'HAFEN-FLYOVER'],[-1120,9,540,'MAIN · RAMPE'],[-1270,-6.6,615,'MAIN · WASSER'],[-1550,-6.6,640,'MAIN · WASSER'],[-1790,-6.6,610,'MAIN · WASSER'],[-1960,-6.6,640,'MAIN · WASSER'],[-2000,-6.6,700,'MAIN · WASSER'],
   [-1950,4,790,'NIEDERRAD · RAMPE'],[-1700,16,870,'NIEDERRAD'],[-1330,24,900,'NIEDERRAD'],[-980,28,880,'NIEDERRAD'],[-700,22,980,'SACHSENHAUSEN WEST'],[-420,24,900,'SACHSENHAUSEN WEST'],[-330,30,700,'FRIEDENSBRÜCKE'],[-400,20,470,'FRIEDENSBRÜCKE'],[-480,10,390,'WESTHAFEN']],
  jumps:[],clear:[[-1480,250,-760,440,'harbour']]},
 {id:'fraport',name:'Fraport Nachtflug',short:'Fraport',laps:4,tunnel:'',
  desc:'Flat out around the runway while jets land over your head. Long straights, an off-road piste through the Nordwestbahn construction site and a jump over the A5.',
  cp:[[-1900,5,1150,'TERMINAL 1'],[-2400,5,1130,'VORFELD'],[-2950,7,1120,'VORFELD'],[-3180,1.2,1250,'NORDWESTBAHN · PISTE'],[-3270,1.2,1390,'NORDWESTBAHN · PISTE'],[-3200,1.2,1530,'NORDWESTBAHN · PISTE'],[-2950,18,1760,'STARTBAHN WEST'],
   [-2450,16,1820,'STARTBAHN WEST'],[-1950,14,1790,'CARGO CITY'],[-1550,12,1680,'CARGO CITY'],[-1330,10,1470,'A5 · JUMP'],[-1380,8,1260,'GATEWAY GARDENS'],[-1600,6,1160,'TERMINAL 2']],
  jumps:[{id:'a5',name:'A5',kind:'pit',at:[-1440,1575],half:32,floor:-12,style:'autobahn',msg:'ONTO THE A5'}],clear:[[-3000,1270,-1650,1670,'runway']]},
 {id:'sky',name:'Skyline Spiral',short:'Skyline',laps:5,tunnel:'',gates:true,
  desc:'An elevated ring through the towers, up to 130 m high. Light gates, a dive into the Gallus and a gap between two skyscrapers.',
  cp:[[-300,60,-300,'TAUNUSANLAGE'],[-280,80,-600,'COMMERZBANK'],[-400,110,-950,'ESCHENHEIMER TURM'],[-700,130,-1100,'OPERNPLATZ'],[-1100,120,-1150,'WESTEND'],[-1300,100,-900,'WESTEND'],
   [-1250,90,-600,'MESSE-NORD'],[-1050,70,-420,'MAINZER LANDSTRASSE'],[-900,40,-200,'GALLUS-TAL'],[-650,20,-100,'BANKENVIERTEL'],[-450,40,-150,'TAUNUSANLAGE']],
  jumps:[{id:'turm',name:'HOCHHAUS',kind:'sky',at:[-900,-1125],half:36,msg:'INTO THE STREET'}],clear:[]},
 {id:'nord',name:'Nordend Nordschleife',short:'Nordschleife',laps:3,tunnel:'',
  desc:'A long, hilly run through the north: up the Bornheimer Hang to the Lohrberg viewpoint, down through Seckbach and a jump over the rail cutting.',
  cp:[[0,4,-1300,'NORDEND'],[500,6,-1350,'NORDEND'],[850,14,-1500,'BORNHEIM'],[950,26,-1800,'BORNHEIMER HANG'],[750,40,-2050,'LOHRBERG'],[350,48,-2150,'LOHRBERG · AUSSICHT'],[0,42,-2000,'LOHRBERG'],
   [-200,30,-1750,'SECKBACH'],[-500,24,-1950,'SECKBACH'],[-850,34,-2100,'HUTHPARK'],[-1100,20,-1850,'HUTHPARK'],[-1000,10,-1550,'PREUNGESHEIM'],[-650,6,-1450,'PREUNGESHEIM'],[-350,4,-1250,'NORDEND']],
  jumps:[{id:'gleis2',name:'BAHNEINSCHNITT',kind:'pit',at:[-1050,-1700],half:32,floor:-12,style:'rail',msg:'OVER THE RAILS'}],clear:[]},
 {id:'sachs',name:'Sachsenhausen Twister',short:'Twister',laps:4,tunnel:'',
  desc:'Short and twisty south of the Main: cider lanes, up the Lerchesberg to the Goetheturm and back through the Stadtwald. Drift every corner.',
  cp:[[200,6,1250,'SACHSENHAUSEN'],[600,8,1200,'SCHWEIZER STRASSE'],[900,12,1330,'LERCHESBERG'],[1000,24,1550,'LERCHESBERG'],[800,30,1760,'GOETHETURM'],[450,34,1810,'GOETHETURM'],[250,20,1620,'STADTWALD'],
   [-50,14,1760,'STADTWALD'],[-400,10,1720,'OBERRAD'],[-600,6,1480,'OBERRAD'],[-450,8,1250,'MÜHLBERG'],[-150,6,1150,'ÄPPELWOI-GASSE']],
  jumps:[],clear:[]}];
const TDF=TRACK_DEFS.slice();// the Frankfurt circuits: menus, career map and the Frankfurt daily use only these
// Athens circuits on real streets: cp = [e, n, height, sector] with e/n in metres from Monastiraki square (Nominatim), mapped per circuit x=(e-e0)*k, z=-(n-n0)*k
const ATH_TRACKS=[
 {id:'akro',city:'ath',name:'Akropolis Circuit',short:'Akropolis',laps:3,tunnel:'',mood:'athens',map:[1.6,0,-300],
  desc:'Around the sacred rock: Dionysiou Areopagitou under the Parthenon, down Apostolou Pavlou to Thiseio, a jump over the ISAP line, Ermou to Monastiraki and back through Plaka.',
  cp:[[250,-745,14,'DIONYSIOU AREOPAGITOU'],[40,-712,18,'DIONYSIOU AREOPAGITOU'],[-160,-690,22,'ODEON HERODES ATTICUS'],[-300,-668,24,'AREOPAGUS'],[-355,-612,28,'AREOPAGUS'],[-285,-560,36,'THEORIAS CLIMB'],[-205,-535,41,'PROPYLAEA HAIRPIN'],[-140,-508,44,'PROPYLAEA HAIRPIN'],[-140,-458,44,'PROPYLAEA HAIRPIN'],[-245,-445,39,'PROPYLAEA HAIRPIN'],[-380,-440,28,'APOSTOLOU PAVLOU'],[-500,-250,10,'APOSTOLOU PAVLOU'],
   [-555,-60,4,'THISEIO'],[-520,110,4,'THISEIO'],[-330,135,4,'ERMOU'],[-140,100,4,'ERMOU'],[40,60,4,'MONASTIRAKI'],[245,-15,4,'MITROPOLEOS'],[440,-80,6,'MITROPOLI'],[520,-230,8,'PLAKA'],[470,-420,12,'PLAKA · ADRIANOU'],
   [460,-600,14,'LYSICRATES'],[430,-735,14,'ACROPOLIS MUSEUM']],
  jumps:[{id:'isap',name:'ISAP',kind:'pit',at:[-552,-20],half:32,floor:-12,style:'rail',msg:'OVER THE ISAP LINE'}],clear:[]},
 {id:'synt',city:'ath',name:'Syntagma Sprint Loop',short:'Syntagma',laps:3,tunnel:'ΥΠΟΓΕΙΑ · OMONIA',mood:'athens',map:[1,700,200],
  desc:'Downtown sprint: Panepistimiou past the Academy, Syntagma and the Parliament, Amalias by the National Garden, Vasilissis Olgas, up to Kolonaki and back to Omonia.',
  cp:[[560,600,4,'PANEPISTIMIOU'],[730,350,4,'PANEPISTIMIOU'],[880,100,6,'SYNTAGMA'],[880,-110,6,'SYNTAGMA · PARLIAMENT'],[860,-290,8,'AMALIAS'],[760,-440,8,'AMALIAS · ZAPPEION'],[700,-560,8,"HADRIAN'S ARCH"],
   [860,-690,8,'VASILISSIS OLGAS'],[1060,-760,8,'VASILISSIS OLGAS'],[1220,-640,10,'IRODOU ATTIKOU'],[1320,-330,12,'MAXIMOS MANSION'],[1320,-110,12,'IRODOU ATTIKOU'],[1400,30,12,'KOLONAKI'],[1290,230,16,'SKOUFA'],
   [1080,520,12,'SKOUFA'],[870,760,8,'AKADIMIAS'],[600,1000,-6,'AKADIMIAS'],[340,1020,-24,'OMONIA · UNDERPASS'],[300,880,-24,'OMONIA · UNDERPASS'],[420,780,-8,'PANEPISTIMIOU']],
  jumps:[{id:'metro',name:'METRO',kind:'pit',at:[650,470],half:32,floor:-12,style:'rail',msg:'OVER THE METRO WORKS'}],clear:[]},
 {id:'kifi',city:'ath',name:'Kifisias Night Run',short:'Kifisias',laps:2,tunnel:'ΥΠΟΓΕΙΑ · AMBELOKIPI',mood:'athdusk',map:[.6,4500,2800],
  desc:'Evening run up Leoforos Kifisias to Chalandri: the Ambelokipi underpass, Psychiko and Filothei, back through Cholargos and down Mesogeion with a jump over the Periferiaki Ymittou.',
  cp:[[2960,1205,-12,'ALEXANDRAS · UNDERPASS'],[3158,1160,-28,'AMBELOKIPI · UNDERPASS'],[3330,1390,-28,'AMBELOKIPI · UNDERPASS'],[3533,1668,-6,'KIFISIAS'],[3696,2035,12,'PANORMOU FLYOVER'],[3813,2388,24,'KATECHAKI FLYOVER'],
   [4049,2652,18,'KIFISIAS FLYOVER'],[4237,2940,6,'FAROS FLYOVER'],[4425,3229,2,'FAROS PSYCHIKOU'],[4797,3759,10,'FILOTHEI'],[5232,4373,16,'KIFISIAS · FILOTHEI'],[5554,4889,16,'CHALANDRI'],[6000,4780,16,'CHALANDRI'],[6300,4600,16,'PLATEIA CHALANDRIOU'],
   [6150,4100,14,'CHOLARGOS'],[5800,3500,12,'CHOLARGOS'],[5400,2900,10,'ETHNIKI AMYNA'],[5100,2480,8,'MESOGEION'],[4500,1975,6,'MESOGEION · KATECHAKI'],[3900,1520,6,'MESOGEION'],[3400,1150,4,'MESOGEION'],
   [3061,990,4,'ATHENS TOWER'],[2860,820,4,'AMBELOKIPI'],[2650,900,4,'AMBELOKIPI'],[2700,1120,4,'ALEXANDRAS']],
  jumps:[{id:'ymit',name:'PERIFERIAKI',kind:'pit',at:[4560,2020],half:32,floor:-12,style:'autobahn',msg:'OVER THE PERIFERIAKI YMITTOU'}],clear:[]},
 {id:'pana',city:'ath',name:'Panathenaic Stadium Finale',short:'Kallimarmaro',laps:3,tunnel:'',mood:'golden',map:[.9,1000,200],stadium:[1325,-880],
  desc:'The finale: start inside the marble Kallimarmaro, out along Olgas and Amalias, Mitropoleos, Athinas to Omonia, Panepistimiou, Vasilissis Sofias to the Hilton and Konstantinou back into the stadium for the hairpin.',
  cp:[[1265,-820,4,'PANATHENAIC STADIUM'],[1265,-750,4,'KALLIMARMARO'],[1215,-690,4,'KALLIMARMARO'],[1110,-715,4,'VASILISSIS OLGAS'],[960,-745,6,'VASILISSIS OLGAS'],[720,-600,6,'AMALIAS'],[850,-330,6,'AMALIAS'],
   [800,-150,6,'SYNTAGMA'],[600,-100,4,'MITROPOLEOS'],[330,-45,4,'MITROPOLEOS'],[90,40,4,'MONASTIRAKI'],[120,330,4,'ATHINAS'],[170,640,4,'ATHINAS · VARVAKIOS'],[190,860,4,'OMONIA'],[300,930,4,'OMONIA'],
   [440,790,4,'PANEPISTIMIOU'],[680,440,6,'PANEPISTIMIOU'],[890,120,8,'SYNTAGMA'],[1100,-10,10,'VASILISSIS SOFIAS'],[1520,-80,12,'VASILISSIS SOFIAS'],[1900,25,12,'EVANGELISMOS'],[2150,30,12,'HILTON'],[2280,-80,12,'HILTON'],
   [2140,-200,10,'VAS. KONSTANTINOU'],[1844,-200,8,'VAS. KONSTANTINOU'],[1560,-460,6,'VAS. KONSTANTINOU'],[1440,-600,4,'KALLIMARMARO'],[1385,-720,4,'PANATHENAIC STADIUM'],[1385,-870,4,'PANATHENAIC STADIUM'],
   [1367,-922,4,'SPHENDONE'],[1325,-942,4,'SPHENDONE'],[1283,-922,4,'SPHENDONE'],[1265,-870,4,'PANATHENAIC STADIUM']],
  jumps:[{id:'athinas',name:'ATHINAS',kind:'pit',at:[135,420],half:32,floor:-12,style:'rail',msg:'OVER THE METRO'}],clear:[]}];
const ATH_TH={akro:{w:38,bank:.35,mood:'athgold',road:'marble',wall:['#efe4cc','#b5643c'],tree:'olive',neo:.55,haz:'drum',traf:.6},
 synt:{w:60,bank:.5,mood:'athnoon',road:'tram',wall:['#f6f3ec','#0d5eaf'],tree:'palm',neo:.32,haz:'tram',traf:1},
 kifi:{w:52,bank:.5,mood:'athnight',road:'asph',wall:['#c8d0d8','#ff2d95'],tree:'plane',neo:.04,office:.55,villa:1,neon:1,traf:1.8},
 pana:{w:46,bank:.6,mood:'athdusk',road:'marble',wall:['#f8f5ee','#d8b86a'],tree:'cypress',neo:.1,fire:1,traf:.8}};
for(const t of ATH_TRACKS)Object.assign(t,ATH_TH[t.id]);
const athW=(t,e,n)=>[(e-t.map[1])*t.map[0],-(n-t.map[2])*t.map[0]];// real e,n → race world x,z for an Athens circuit
for(const t of ATH_TRACKS){t.cp=t.cp.map(([e,n,y,nm])=>{const[x,z]=athW(t,e,n);return[x/S,y,z/S,nm]});for(const j of t.jumps){const[x,z]=athW(t,...j.at);j.at=[x/S,z/S]}TRACK_DEFS.push(t)}
const ATH_IDS=ATH_TRACKS.map(t=>t.id),isAthT=id=>ATH_IDS.includes(id);
// Athens tracks open with the city: in Athens, after 4 Frankfurt flags, or with the preview flag
const athOpen=()=>{if(ALL_OPEN||CID==='ath')return true;try{if(localStorage.getItem('mho_athpre')==='1')return true}catch(e){}const F=flagsR();return RIVAL_EV.filter(e=>F[e.p]).length>=4};
// Athens rivals race the circuits from the World tab; Drakos waits in the Kallimarmaro
const ATH_PD=[{n:'PAPPAS',full:'Yiannis Pappas',flag:'🇬🇷',team:'zeil',style:'showman',r:.1},{n:'LAMBROU',full:'Katerina Lambrou',flag:'🇬🇷',team:'kronos',style:'clean',r:.25},{n:'KOSTA',full:'Dimitra Kosta',flag:'🇬🇷',team:'ostend',style:'aggressor',r:.4},
 {n:'VLACHOS',full:'Leonidas Vlachos',flag:'🇬🇷',team:'nordend',style:'aggressor',r:.55},{n:'ANTONIOU',full:'Marios Antoniou',flag:'🇬🇷',team:'helix',style:'gunner',r:.7},{n:'GALANI',full:'Sofia Galani',flag:'🇬🇷',team:'aeppler',style:'clean',r:.85}];
for(const p of ATH_PD)PD[p.n]=PD[p.n]||p;PD.DRAKOS=PD.DRAKOS||{n:'DRAKOS',full:'Thanos Drakos',flag:'🏴',team:'shadow',style:'aggressor',r:1};
const ATH_TRK_EV=[{p:'PAPPAS',track:'akro',mood:'athens',sig:'boost',line:'Welcome to Athens! Try to keep up under the Parthenon.'},{p:'LAMBROU',track:'synt',mood:'athens',sig:'shield',line:'I know every lane from Omonia to Syntagma.'},
 {p:'KOSTA',track:'akro',mood:'golden',sig:'mines',line:'Plaka is my delivery zone. Mind the parcels.'},{p:'VLACHOS',track:'synt',mood:'athdusk',sig:'ram',line:'Trolleys do not brake. Neither do I.'},
 {p:'ANTONIOU',track:'pana',mood:'golden',sig:'missile',line:'Kolonaki money buys the best missiles.'},{p:'GALANI',track:'kifi',mood:'athdusk',sig:'rail',line:'Kifisias at night is a rally stage. My stage.'}];
const ATH_BOSS_EV={p:'DRAKOS',track:'pana',mood:'athdusk',sig:'boss',need:5,boss:1,line:'A tourist in my stadium? The Akropolis Cup never leaves my hands.'};
const DRAKOS_LINES=['Athens belongs to the Schattenwerk.','Enjoy the view of the Parthenon. From behind.','My stadium, my rules.','The Akropolis Cup is MINE.','Go home, tourist.'];
const athNF=F=>ATH_TRK_EV.filter(e=>F[e.p]).length;
let TRK=TRACK_DEFS[0],CP=TRK.cp;
// Light and weather presets. sky: top/mid/horizon/below-horizon colours (linear), sun glow, stars, milky band, moon, clouds
const MOODS=[
 {id:'night',wet:0.55,name:'Neon Night',de:'Nacht',top:[.016,.012,.05],mid:[.07,.04,.17],hor:[.30,.10,.34],gnd:[.03,.02,.06],sun:[0,0,0],star:1,band:1,moon:1,cloud:0,
  fog:'#1c1030',fogD:.00042,hemi:['#6a5ab0','#180e2c',.6],key:['#c9d2ff',.45,[-400,600,-300]],exp:1.12,bloom:[.95,.6],win:1,rain:[1200,.22,140,.3],road:[.42,.3,1],env:.8,lamps:1},
 {id:'dawn',wet:0.18,name:'Dawn',de:'Morgengrauen',top:[.05,.08,.22],mid:[.38,.28,.4],hor:[1.15,.5,.28],gnd:[.07,.05,.07],sun:[1.6,.72,.3],star:.25,band:.15,moon:.35,cloud:0,
  fog:'#8a6450',fogD:.00030,hemi:['#e8c8b0','#3a2030',1.05],key:['#ffb070',1.45,[700,170,-900]],exp:1.0,bloom:[.7,.55],win:.5,rain:[0,0,0,0],road:[.38,.3,1.2],env:1.15,lamps:.35},
 {id:'storm',wet:1.15,name:'Storm',de:'Gewitter',top:[.008,.01,.02],mid:[.03,.035,.06],hor:[.09,.08,.14],gnd:[.02,.02,.03],sun:[0,0,0],star:0,band:0,moon:0,cloud:1,
  fog:'#151b2b',fogD:.00072,hemi:['#4a5a80','#10141c',.5],key:['#9fb0ff',.3,[-300,600,-200]],exp:1.16,bloom:[1.0,.6],win:1.1,rain:[2400,.4,240,1.6],road:[.14,.62,1.7],env:.75,lamps:1,lightning:true},
 {id:'fog',wet:0.45,name:'Fog',de:'Nebel',top:[.05,.045,.1],mid:[.13,.1,.2],hor:[.24,.18,.3],gnd:[.12,.09,.17],sun:[0,0,0],star:.12,band:.08,moon:.3,cloud:0,
  fog:'#6a5b80',fogD:.0021,hemi:['#8a7aa8','#2a2036',.85],key:['#c9d2ff',.3,[-400,600,-300]],exp:1.08,bloom:[1.3,.85],win:.9,rain:[500,.1,90,.2],road:[.3,.35,1],env:.8,lamps:1.3}];
MOODS.push({id:'brick',wet:0,name:'Brick Day',de:'Sonnig',top:[.07,.33,.98],mid:[.30,.60,1.0],hor:[.80,.90,1.0],gnd:[.34,.40,.30],sun:[2.4,2.2,1.8],star:0,band:0,moon:0,cloud:0,
  fog:'#d6e6f8',fogD:.0002,hemi:['#fff8ee','#6f8a52',.8],key:['#fff2dc',2.5,[500,800,300]],exp:.98,bloom:[.03,.4],win:0,rain:[0,0,0,0],road:[.6,.1,.6],env:.4,lamps:0});
if(CID==='ath')MOODS.push({...MOODS.find(m=>m.id==='brick'),id:'athens',name:'Attic Sun',de:'Attische Sonne',sun:[2.7,2.35,1.7],hor:[.98,.9,.76],mid:[.36,.62,.98],top:[.09,.36,.96],gnd:[.42,.40,.30],fog:'#efe2c8',hemi:['#fff4e0','#9a8a5a',.8],key:['#fff0d6',2.6,[500,800,300]]});
MOODS.push({id:'day',wet:0,name:'Day',de:'Tag',top:[.16,.38,.92],mid:[.42,.64,1.0],hor:[.92,.9,.86],gnd:[.32,.32,.3],sun:[2.6,2.3,1.8],star:0,band:0,moon:0,cloud:0,
  fog:'#c4d8ee',fogD:.0003,hemi:['#fff6ea','#6b6458',.8],key:['#fff2dc',2.5,[400,700,250]],exp:.98,bloom:[.04,.45],win:0,rain:[0,0,0,0],road:[.6,.1,.6],env:1.1,lamps:0});
MOODS.push({id:'golden',wet:0,name:'Golden Hour',de:'Abendsonne',top:[.10,.22,.62],mid:[.38,.48,.86],hor:[1.0,.72,.52],gnd:[.3,.28,.26],sun:[1.1,.75,.42],star:0,band:0,moon:0,cloud:0,
  fog:'#d8c4c0',fogD:.00022,hemi:['#e8ecff','#7a6a5a',1.35],key:['#ffe2c0',2.4,[600,430,-500]],exp:1.0,bloom:[.3,.5],win:.35,rain:[0,0,0,0],road:[.55,.15,.7],env:1.0,lamps:.4});
const ATHM=(()=>{const b=MOODS.find(m=>m.id==='brick'),A=MOODS.find(m=>m.id==='athens')||{...b,id:'athens',name:'Attic Sun',de:'Attische Sonne',sun:[2.7,2.35,1.7],hor:[.98,.9,.76],mid:[.36,.62,.98],top:[.09,.36,.96],gnd:[.42,.40,.30],fog:'#efe2c8',hemi:['#fff4e0','#9a8a5a',.8],key:['#fff0d6',2.6,[500,800,300]]};
 const D={...b,id:'athdusk',name:'Attic Dusk',de:'Abenddämmerung',top:[.04,.05,.17],mid:[.32,.26,.42],hor:[1.0,.5,.28],gnd:[.07,.05,.06],sun:[1.5,.62,.24],star:.4,band:.12,moon:.6,fog:'#7a5a4a',fogD:.00036,hemi:['#e0c0a0','#3a2830',.9],key:['#ffb07a',1.2,[700,160,-900]],exp:1.06,bloom:[.8,.55],win:.85,road:[.4,.28,1.1],env:1,lamps:1};
 const G={...b,id:'athgold',name:'Attic Gold',de:'Goldenes Licht',top:[.12,.26,.66],mid:[.45,.52,.8],hor:[1.05,.74,.45],gnd:[.3,.26,.2],sun:[1.5,.95,.45],fog:'#e2c49a',fogD:.00042,hemi:['#ffe2b8','#7a5a38',1.05],key:['#ffcf90',2.3,[600,380,-500]],exp:.94,bloom:[.32,.5],win:.15,lamps:.2,env:1},
 N2={...b,id:'athnoon',name:'Attic Noon',de:'Mittag',top:[.05,.3,.98],mid:[.34,.6,1],hor:[.95,.95,.92],gnd:[.42,.42,.38],sun:[3,2.8,2.4],fog:'#f2f0ea',fogD:.00032,hemi:['#ffffff','#a09880',1.55],key:['#ffffff',3.3,[200,1000,150]],exp:1.02,bloom:[.12,.4],win:0,lamps:0},
 K={...MOODS.find(m=>m.id==='night'),id:'athnight',name:'Attic Night',de:'Athener Nacht',wet:.25,top:[.01,.012,.04],mid:[.03,.035,.09],hor:[.17,.1,.2],gnd:[.02,.02,.03],fog:'#151628',fogD:.00042,hemi:['#5a6aa0','#141020',.6],key:['#c9d2ff',.42,[-400,600,-300]],exp:1.15,bloom:[.9,.6],win:1,rain:[0,0,0,0],road:[.36,.34,1.1],env:.8,lamps:1};
 if(CID==='ath')MOODS.push(D,G,N2,K);return[A,D,G,N2,K]})();
let MOOD=MOODS[0];
const RIVER=[450*S,750*S];
const BRANDS=[['KRONOS BANK','IHR LEBEN. UNSERE ZINSEN.','#f5c20c','#ff2d95'],['HELIX FINANZ','SCHULDEN SIND FREIHEIT','#22e4ff','#8c55ff'],['ÄPPLER','EBBELWOI 3.0','#36d17a','#ffd12c'],['VANTA-X','NEURAL LINK · 0% ZINS','#ff2d95','#22e4ff'],
 ['DATENHAFEN','DEINE DATEN, UNSER HAFEN','#8c55ff','#4ceaff'],['NORDEND','FREIGHT · 24/7','#ff7a1c','#ffd12c'],['NEUROWARE','THINK FASTER','#4ceaff','#ff2d95'],['MESSE 2099','ALLES IST ZU VERKAUFEN','#ffd12c','#ff3b55']];
const VSIGNS=['HOTEL','BAR','KIOSK','SPÄTI','ZEIL','APFELWEIN','IMBISS','U-BAHN','NEON','CASINO','SUSHI','DATEN'];
const ITEMS={emp:{name:'EMP',col:'#4ceaff'},rail:{name:'RAIL GUN',col:'#e8f3ff'},turbo:{name:'TURBO',col:'#ffc23d'},rockets:{name:'ROCKETS',col:'#ff5a2d'},missile:{name:'MISSILE',col:'#c15bff'},mines:{name:'MINES',col:'#ff2a3a'},shield:{name:'SHIELD',col:'#31f5c4'},tornado:{name:'TORNADO',col:'#b48cff'},wall:{name:'BRICK WALL',col:'#ff8a3c'},storm:{name:'STORM',col:'#fff27a'},magnet:{name:'MAGNET',col:'#ff3b6b'},oil:{name:'OIL SLICK',col:'#5dffb0'}};
const ITEM_KEYS=Object.keys(ITEMS);
const ICON={};function itemIcon(k){if(ICON[k])return ICON[k];const[c,g]=cv(96,96),col=ITEMS[k].col;g.translate(48,48);g.lineCap=g.lineJoin='round';g.shadowColor=col;g.shadowBlur=14;g.strokeStyle=col;g.fillStyle=col;g.lineWidth=6;
  const P=(pts)=>{g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath()};
  if(k==='turbo'){for(const o of[-14,6])P([[o-12,-22],[o+10,0],[o-12,22],[o-4,0]]),g.fill()}
  else if(k==='rockets'){for(const o of[-20,0,20]){P([[o,-30],[o+7,-16],[o+7,18],[o-7,18],[o-7,-16]]);g.fill();g.fillStyle='#ffd27a';P([[o-5,20],[o,32],[o+5,20]]);g.fill();g.fillStyle=col}}
  else if(k==='missile'){g.rotate(-.6);P([[0,-34],[9,-18],[9,20],[16,30],[-16,30],[-9,20],[-9,-18]]);g.fill();g.rotate(.6);g.lineWidth=3;g.beginPath();g.arc(20,-20,12,0,7);g.moveTo(20,-36);g.lineTo(20,-4);g.moveTo(4,-20);g.lineTo(36,-20);g.stroke()}
  else if(k==='mines'){g.beginPath();g.arc(0,0,18,0,7);g.fill();for(let i=0;i<8;i++){const a=i*Math.PI/4;g.beginPath();g.moveTo(Math.cos(a)*16,Math.sin(a)*16);g.lineTo(Math.cos(a)*30,Math.sin(a)*30);g.stroke()}g.fillStyle='#fff';g.beginPath();g.arc(-5,-5,5,0,7);g.fill()}
  else if(k==='shield'){P([[0,-34],[28,-22],[24,12],[0,34],[-24,12],[-28,-22]]);g.globalAlpha=.35;g.fill();g.globalAlpha=1;g.stroke()}
  else if(k==='emp'){g.lineWidth=4;for(const r of[14,26,36]){g.globalAlpha=r===36?.5:1;g.beginPath();g.arc(0,0,r,0,7);g.stroke()}g.globalAlpha=1;P([[4,-16],[-8,3],[1,3],[-4,16],[8,-3],[-1,-3]]);g.fillStyle='#fff';g.fill()}
  else if(k==='rail'){g.lineWidth=5;g.beginPath();g.moveTo(-34,0);g.lineTo(34,0);g.stroke();g.lineWidth=2;g.strokeStyle='#fff';for(let x=-30;x<=30;x+=12){g.beginPath();g.ellipse(x,0,4,13,0,0,7);g.stroke()}}
  else if(k==='tornado'){g.lineWidth=5;for(let i=0;i<5;i++){g.beginPath();g.ellipse((i%2?4:-4),-26+i*13,30-i*5,6,0,0,7);g.stroke()}}
  else if(k==='wall'){for(let r=0;r<3;r++)for(let i=-1;i<2;i++){const x=i*22+(r%2?11:0)-11;if(x>30)continue;g.fillRect(x-10,-30+r*21,20,17)}}
  else if(k==='storm'){P([[8,-38],[-16,4],[-2,4],[-10,38],[18,-8],[3,-8],[14,-38]]);g.fill()}
  else if(k==='magnet'){g.lineWidth=13;g.beginPath();g.moveTo(-20,-30);g.lineTo(-20,2);g.arc(0,2,20,Math.PI,0,true);g.lineTo(20,-30);g.stroke();g.fillStyle='#fff';g.fillRect(-27,-36,14,11);g.fillRect(13,-36,14,11)}
  else if(k==='oil'){g.beginPath();g.ellipse(0,14,32,14,0,0,7);g.fill();g.fillStyle='#fff';g.globalAlpha=.6;g.beginPath();g.ellipse(-10,10,8,3,0,0,7);g.fill();g.globalAlpha=1;g.fillStyle=col;for(const[x,y]of[[-14,-20],[10,-28]]){g.beginPath();g.arc(x,y,7,0,7);g.fill()}}
  return ICON[k]=c.toDataURL()}
let itemSpinUntil=0,itemShown='';
const EVENTS=[
 {id:'e1',mood:'night',name:'After Hours',sub:'Rookie · 3 laps',type:'race',cls:'rookie',laps:3,traffic:16,items:true,aggr:0,
  goal:'Your first night shift. Win the race. Boost refills as you drive (drifts and air fill it faster), then hold <b>Shift</b>. Keep speed up for the two jumps.',med:'place',m:[1,3,5]},
 {id:'e2',mood:'dawn',name:'Rush Hour',sub:'Pro · 2 laps · no weapons',type:'race',cls:'pro',laps:2,traffic:46,items:false,aggr:0,
  goal:'No weapons on this run. Boost refills as you drive; drifts and air fill it faster. SMASH rivals into the walls.',med:'place',m:[1,2,4]},
 {id:'e3',mood:'fog',name:'Bridge Closed',sub:'Pro · time attack · 1 lap',type:'tt',cls:'pro',laps:1,traffic:10,items:false,aggr:0,
  goal:'The Flößerbrücke is down. Jump the Main, then the rail yard. Beat the clock: <b>gold 1:03 · silver 1:07 · bronze 1:12</b>.',med:'time',m:[63,67,72]},
 {id:'e4',mood:'storm',name:'Last Train',sub:'Pro · eliminator',type:'elim',cls:'pro',laps:99,traffic:12,items:true,aggr:.2,
  goal:'Every 20 seconds the craft in last place is shut down. Be the last one flying.',med:'place',m:[1,2,3]},
 {id:'e5',mood:'night',name:'Takedown Frenzy',sub:'Pro · 2 laps · takedowns',type:'race',cls:'pro',laps:2,traffic:16,items:true,aggr:.35,
  goal:'Pin rivals against the wall, ram them while boosting, or barrel-roll into them. <b>Takedowns</b>: gold 5 · silver 3 · bronze 1. You must finish.',med:'takedowns',m:[5,3,1]},
 {id:'e6',mood:'storm',name:'Night Finale',sub:'Elite · 3 laps · aggressive rivals',type:'race',cls:'elite',laps:3,traffic:18,items:true,aggr:.45,
  goal:'The final. Elite speed and rivals who sideswipe. Win it.',med:'place',m:[1,2,3]}];

/* ============================================================ 2 · renderer & post */
const canvas=$('#c');
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:false,stencil:true,powerPreference:'high-performance'})}catch(e){$('#loading').textContent='THIS BROWSER CANNOT RUN WEBGL';throw e}
renderer.debug.checkShaderErrors=false;renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=1.12;
const scene=new THREE.Scene();
const FOGC=new THREE.Color('#1c1030');scene.fog=new THREE.FogExp2(FOGC,0.00042);
const camera=new THREE.PerspectiveCamera(64,1,.4,9000);scene.add(camera);
let lowGfx=matchMedia('(pointer:coarse)').matches;
// adaptive difficulty: rating -1..1 moves after each race; AI pace = setting x (1 +- 6%)
const adaptR=()=>store.get('mho_adapt',0),adaptMul=()=>SET.adapt==='off'?1:1+.06*adaptR(),diffMul=()=>({relaxed:.93,normal:1,hard:1.06}[SET.diff]||1)*adaptMul();
function adaptAfter(place,n,margin){if(n<2)return;let d=place===1?(margin>4?.3:.15):place<=3?.05:place>=Math.max(4,Math.ceil(n*.6))?-.25:-.1;const r=clamp(adaptR()+d,-1,1);store.set('mho_adapt',+r.toFixed(2));return r}
const SET_DEF={cc:'full',perf:false,dres:lowGfx?'on':'off',res:lowGfx?'sharp':'auto',thr:'city',q:lowGfx?'med':'high',fx:'full',fov:'normal',camd:'normal',vol:.8,mus:.6,sfx:.9,diff:'normal',adapt:'on',rcam:'chase',steer:'normal',units:'kph',touch:'buttons',assist:'on',tiltInv:'off',sens:3};
const SET=Object.assign({},SET_DEF,store.get('mho_set',{}));if(!SET.thrV){SET.thr='city';SET.thrV=1}SET.touch='buttons';const thrEff=()=>SET.thr==='city'?(state==='roam'?'pedal':'auto'):SET.thr;const saveSet=()=>store.set('mho_set',SET);
const fxK=()=>({full:1,reduced:.4,off:0})[SET.fx];let rainScale=1;
const rt=new THREE.WebGLRenderTarget(16,16,{type:THREE.HalfFloatType,stencilBuffer:true,samples:SET.q==='high'?4:0});
const composer=new EffectComposer(renderer,rt);
composer.addPass(new RenderPass(scene,camera));
const SCRUB=new ShaderPass({uniforms:{tDiffuse:{value:null}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform sampler2D tDiffuse;varying vec2 vUv;float ok(float x){return (x>=0.&&x<=256.)?x:(x>256.?256.:0.);}void main(){vec4 c=texture2D(tDiffuse,vUv);gl_FragColor=vec4(ok(c.r),ok(c.g),ok(c.b),1.);}'});
composer.addPass(SCRUB);
// only what is brighter than 1.0 in HDR blooms: unlit neon (toneMapped:false, colour pushed above 1), road glow lines, engine cores
const bloom=new UnrealBloomPass(new THREE.Vector2(512,512),.95,.6,1.0);composer.addPass(bloom);
// grade (HDR, before tone mapping) · radial speed blur with RGB split · vignette · grain · flash
const FX=new ShaderPass({defines:{TAPS:lowGfx?5:9},uniforms:{tDiffuse:{value:null},uSpeed:{value:0},uBoost:{value:0},uCA:{value:0},uTime:{value:0},uFlash:{value:0},uHit:{value:0},uMirror:{value:0}},
  vertexShader:'varying vec2 vUv0;void main(){vUv0=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`uniform sampler2D tDiffuse;uniform float uSpeed,uBoost,uCA,uTime,uFlash,uHit,uMirror;varying vec2 vUv0;
  float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
  vec3 grade(vec3 c){c=c*vec3(1.03,1.0,.99);c=max(c,0.);float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,1.3);c=(c-.18)*1.1+.18;return max(c,0.);}
  void main(){vec2 vUv=vec2(uMirror>.5?1.-vUv0.x:vUv0.x,vUv0.y);vec2 d=vUv-vec2(.5,.47);vec2 dq=vec2(d.x,d.y*.62);float r=length(dq)*1.35;float edge=smoothstep(.1,.85,r);
    float k=(uSpeed*uSpeed*.05+uBoost*.05)*edge;float ab=.0011*(.3+uSpeed*.7+uBoost)*r+uCA*r*r;
    vec3 col=vec3(0.);if(k*length(d)<.0004)col=vec3(texture2D(tDiffuse,vUv+d*ab).r,texture2D(tDiffuse,vUv).g,texture2D(tDiffuse,vUv-d*ab).b);else{for(int i=0;i<TAPS;i++){float t=float(i)/float(TAPS-1);vec2 uv=vUv-d*k*t;col+=vec3(texture2D(tDiffuse,uv+d*ab).r,texture2D(tDiffuse,uv).g,texture2D(tDiffuse,uv-d*ab).b);}col/=float(TAPS);}
    col=grade(col);col*=1.-.32*smoothstep(.28,1.,r*1.3)-uBoost*.12*smoothstep(.4,1.,r);col+=uHit*vec3(.32,0.,.05)*smoothstep(.45,1.,r);
    col+=uFlash*vec3(.5,.6,.9)*.3;col+=(h(vUv*vec2(1733.,997.)+uTime)-.5)*.018;gl_FragColor=vec4(col,1.);}`});
composer.addPass(FX);{const bs=bloom.setSize.bind(bloom);bloom.setSize=(w,h)=>bs(Math.max(64,Math.round(w*(lowGfx?.5:1))),Math.max(64,Math.round(h*(lowGfx?.5:1))))}
composer.addPass(new OutputPass());
const SPRSCALE={value:400};
const pFov=f=>{const a=camera.aspect;return a<.9?Math.min(100,f*(1+.5*Math.min(1,(.9-a)/.45))):f};
const DPR2=()=>Math.min(devicePixelRatio||1,2);
// dynamic resolution: average frame time >22 ms over 2 s steps the pixel ratio down (floor .75), <15 ms steps it back up
const DRES={s:1,t:0,n:0,sum:0,sq:0,skip:0};function dresStep(ms){if(SET.dres!=='on'||paused||document.hidden||!(state==='roam'||state==='race'||state==='countdown')||ms>150||ms<=0){DRES.t=DRES.n=DRES.sum=DRES.sq=0;return}DRES.t+=ms;DRES.sum+=ms;DRES.sq+=ms*ms;DRES.n++;if(DRES.t<2000)return;const a=DRES.sum/DRES.n,sd=Math.sqrt(Math.max(0,DRES.sq/DRES.n-a*a)),cap30=Math.abs(a-33.3)<3&&sd<4;DRES.t=DRES.n=DRES.sum=DRES.sq=0;if(DRES.skip>0){DRES.skip--;return}
  // a steady ~33 ms is the browser's 30 fps cap (iOS low power mode), not the GPU struggling: keep the resolution
  const s=a>22&&!cap30?Math.max(.6,DRES.s-.15):a<15||cap30&&DRES.s<1?Math.min(1,DRES.s+.1):DRES.s;if(s!==DRES.s){const p0=renderer.getPixelRatio();DRES.s=s;resize();if(renderer.getPixelRatio()===p0&&a>22)DRES.s=s+.15;DRES.skip=1}}
function resize(){const w=innerWidth,h=innerHeight;const cap={std:1.5,sharp:2,max:3}[SET.res]||{low:1,med:1.5,high:2}[SET.q],bud=lowGfx?3.4e6:2.8e6;let pr=Math.min(devicePixelRatio||1,cap);if(w*h*pr*pr>bud)pr=Math.sqrt(bud/(w*h));if(SET.dres==='on'&&DRES.s<1)pr=Math.max(Math.min(pr,1),pr*DRES.s);renderer.setPixelRatio(pr);renderer.setSize(w,h,false);composer.setPixelRatio(pr);composer.setSize(w,h);bloom.resolution.set(w*pr/2,h*pr/2);SPRSCALE.value=h*pr*.5/Math.tan(THREE.MathUtils.degToRad(34));camera.aspect=w/h;camera.updateProjectionMatrix()}
addEventListener('resize',resize);resize();
const hemi=new THREE.HemisphereLight(0x6a5ab0,0x180e2c,.6);scene.add(hemi);
const moonL=new THREE.DirectionalLight(0xc9d2ff,.45);moonL.position.set(-400,600,-300);scene.add(moonL);
const shipKey=new THREE.PointLight(0xe4ecff,70,40,2);scene.add(shipKey);
const glowCol=(hex,k=2.2)=>new THREE.Color(hex).multiplyScalar(k);            // HDR colour for bloomed neon
const neonMat=(hex,k=2.2,extra={})=>new THREE.MeshBasicMaterial({color:glowCol(hex,k),toneMapped:false,...extra});

/* ============================================================ 3 · sky */
const SKY_VS='varying vec3 vD;void main(){vD=normalize(position);vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_Position.z=gl_Position.w;}';
const SKY_FS=`varying vec3 vD;uniform float uT,uStar,uBand,uMoon,uLit,uCloud;uniform vec3 uTop,uMid,uHor,uGround,uSun;
float hash(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*n3(p);p*=2.03;a*=.5;}return s;}
float stars(vec3 d,float K,float th){vec3 p=d*K;vec3 id=floor(p);vec3 f=fract(p)-.5;float h=hash(id);if(h<th)return 0.;vec3 o=vec3(hash(id+1.3),hash(id+2.7),hash(id+4.1))-.5;float r=length(f-o*.6);float w=fwidth(r)*1.5+.02;return smoothstep(w+.06,.0,r)*(.5+.5*sin(uT*(1.5+h*3.)+h*40.))*(h-th)/(1.-th);}
void main(){vec3 d=normalize(vD);float h=d.y;vec3 top=uTop,mid=uMid,hor=uHor;
  vec3 c=mix(hor,mid,smoothstep(0.,.16,h));c=mix(c,top,smoothstep(.1,.7,h));if(h<0.)c=mix(hor,uGround,smoothstep(0.,.07,-h));
  if(h>0.){float bd=dot(d,normalize(vec3(.35,.55,-.76)))*3.2;float band=exp(-bd*bd);float dust=fbm(d*6.);c+=vec3(.16,.09,.28)*band*(.4+dust)*smoothstep(0.,.25,h)*uBand;
    float st=stars(d,95.,.93)+stars(d,190.,.965)*.7;c+=vec3(1.,.95,1.)*st*1.6*smoothstep(0.,.18,h)*uStar;
    vec3 md=normalize(vec3(-.42,.62,-.66));float sd=dot(d,md);float disc=smoothstep(.99958,.9997,sd);float cr=fbm(d*180.);c+=(vec3(.95,.93,1.)*disc*(1.6-cr*.8)+vec3(.55,.6,1.)*(pow(max(sd,0.),900.)*.5+pow(max(sd,0.),60.)*.07))*uMoon;}
  vec3 sn=normalize(vec3(.6,.06,-.8));float sg=max(dot(d,sn),0.);c+=uSun*(pow(sg,48.)*2.+pow(sg,5.)*.3)*smoothstep(-.06,.12,h);
  if(uCloud>0.){float cl=smoothstep(.42,.78,fbm(d*vec3(2.4,5.,2.4)+vec3(uT*.012,0.,uT*.02)))*smoothstep(-.02,.2,h)*uCloud;c=mix(c,vec3(.035,.04,.06)+vec3(.5,.55,.8)*uLit*.6,cl*.85);}
  c+=vec3(.45,.5,.8)*uLit*.35*smoothstep(-.1,.4,h);
  gl_FragColor=vec4(c,1.);}`;
const V=(r,g,b)=>new THREE.Vector3(r,g,b);
const SKYU={uT:{value:0},uTop:{value:V(.016,.012,.05)},uMid:{value:V(.07,.04,.17)},uHor:{value:V(.30,.10,.34)},uGround:{value:V(.03,.02,.06)},uSun:{value:V(0,0,0)},uStar:{value:1},uBand:{value:1},uMoon:{value:1},uLit:{value:0},uCloud:{value:0}};
const skyMat=new THREE.ShaderMaterial({vertexShader:SKY_VS,fragmentShader:SKY_FS,uniforms:SKYU,side:THREE.BackSide,depthWrite:false,fog:false,extensions:{derivatives:true}});
const sky=new THREE.Mesh(new THREE.SphereGeometry(8000,48,24),skyMat);sky.frustumCulled=false;sky.renderOrder=-1;scene.add(sky);sky.onBeforeRender=(r,sc,cam)=>{sky.position.copy(cam.position);sky.updateMatrixWorld()};
// reflections: a prefiltered environment of the sky plus a ring of neon so metal and wet road pick up the city colours
const ENVSC=new THREE.Scene();(function(){const env=ENVSC;env.add(new THREE.Mesh(new THREE.SphereGeometry(100,32,16),new THREE.ShaderMaterial({vertexShader:SKY_VS,fragmentShader:SKY_FS,uniforms:SKYU,side:THREE.BackSide,depthWrite:false})));
  const cols=['#ff2d95','#22e4ff','#ffb46a','#8c55ff','#4ceaff'];for(let i=0;i<40;i++){const a=i/40*Math.PI*2,h=rr(4,26);const m=new THREE.Mesh(new THREE.BoxGeometry(rr(4,10),h,1),new THREE.MeshBasicMaterial({color:glowCol(cols[i%5],rr(.6,1.6))}));m.position.set(Math.cos(a)*80,h/2-8,Math.sin(a)*80);m.lookAt(0,m.position.y,0);env.add(m)}
})();
let ENVD=true;const ENVC=new Map();function buildEnv(){ENVD=false;const id=MOOD.id;let t=ENVC.get(id);if(!t){const pm=new THREE.PMREMGenerator(renderer);t=pm.fromScene(ENVSC,.02).texture;pm.dispose();ENVC.set(id,t)}scene.environment=t;if(ENVC.size>3)for(const[k,o]of ENVC)if(o!==t){o.dispose();ENVC.delete(k);break}}
scene.environmentIntensity=.8;
let lightningT=6,litV=0;
function applyMood(id){const m=MOODS.find(x=>x.id===id)||ATHM.find(x=>x.id===id)||MOODS[0];const changed=m!==MOOD;MOOD=m;const U=SKYU;
  U.uTop.value.set(...m.top);U.uMid.value.set(...m.mid);U.uHor.value.set(...m.hor);U.uGround.value.set(...m.gnd);U.uSun.value.set(...m.sun);U.uStar.value=m.star;U.uBand.value=m.band;U.uMoon.value=m.moon;U.uCloud.value=m.cloud;U.uLit.value=0;
  scene.fog.color.set(m.fog);scene.fog.density=m.fogD;hemi.color.set(m.hemi[0]);hemi.groundColor.set(m.hemi[1]);hemi.intensity=m.hemi[2];moonL.color.set(m.key[0]);moonL.intensity=m.key[1];moonL.position.set(...m.key[2]);
  renderer.toneMappingExposure=m.exp;bloom.strength=m.bloom[0];bloom.radius=m.bloom[1];scene.environmentIntensity=m.env;applyMoodMaterials();if(changed||!scene.environment)ENVD=true}
function applyMoodMaterials(){const m=MOOD;if(typeof GLASS!=='undefined')for(const g of GLASS)g.emissiveIntensity=m.win;
  if(MAT.road&&MAT.road.isMeshStandardMaterial){MAT.road.roughness=m.road[0];MAT.road.metalness=m.road[1];MAT.road.envMapIntensity=m.road[2]}
  if(MAT.pool)MAT.pool.opacity=.24*m.lamps;if(MAT.athB)MAT.athB.emissiveIntensity=m.win*.9;if(MAT.athM)MAT.athM.emissiveIntensity=m.win*.42;if(MAT.athMtn)MAT.athMtn.color.set(m.fog).lerp(new THREE.Color(m.lamps>.5?'#07080e':'#8292aa'),.42);for(const sl of(typeof searchlights!=='undefined'?searchlights:[]))sl.g.visible=m.id!=='dawn';
  if(typeof rain!=='undefined'&&rain){rain.geometry.setDrawRange(0,Math.round(m.rain[0]*(typeof rainScale==='number'?rainScale:1))*2);rain.material.opacity=m.rain[1];rain.visible=m.rain[0]>0}}

/* ============================================================ 4 · textures */
/* Some browsers (privacy/anti-fingerprinting modes, some GPU drivers, embedded web views) refuse or corrupt 2D-canvas
   uploads to WebGL, which turns every texture black. At boot we render a known canvas colour through each upload path
   and keep the first path that reads back correctly; if none does, textures fall back to each canvas's base colour. */
function cv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');const fr=g.fillRect.bind(g);
  g.fillRect=(x,y,W,H)=>{if(c._base===undefined&&x<=0&&y<=0&&W>=w&&H>=h&&typeof g.fillStyle==='string')c._base=g.fillStyle;fr(x,y,W,H)};return[c,g]}
const TEXV=[{canvas:1,mip:1,name:'canvas'},{canvas:1,mip:0,name:'canvas, no mipmaps'},{mip:1,name:'pixel copy'},{mip:0,name:'pixel copy, no mipmaps'},{half:1,mip:0,name:'float pixel copy'}];
let TEXMODE=0;
const s2l=x=>x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4);
function dataTex(d,w,h,v,srgb){let t;
  if(v.half){const a=new Uint16Array(d.length);for(let i=0;i<d.length;i++){const x=d[i]/255;a[i]=THREE.DataUtils.toHalfFloat(srgb&&(i&3)!==3?s2l(x):x)}t=new THREE.DataTexture(a,w,h,THREE.RGBAFormat,THREE.HalfFloatType)}
  else{t=new THREE.DataTexture(new Uint8Array(d),w,h);if(srgb)t.colorSpace=THREE.SRGBColorSpace}
  t.flipY=true;return t}
function mkTex(c,v,srgb){let t;
  if(v.none){const col=new THREE.Color();let a=0;if(c._base&&c._base!=='transparent'){try{col.setStyle(c._base,THREE.SRGBColorSpace);a=255}catch(e){}}
    t=new THREE.DataTexture(new Uint8Array([col.r*255,col.g*255,col.b*255,a].map(Math.round)),1,1);if(srgb)t.colorSpace=THREE.SRGBColorSpace}
  else if(v.canvas){t=new THREE.CanvasTexture(c);if(srgb)t.colorSpace=THREE.SRGBColorSpace}
  else{t=dataTex(c.getContext('2d').getImageData(0,0,c.width,c.height).data,c.width,c.height,v,srgb);t.userData.src=c;t.userData.srgb=srgb}
  t.generateMipmaps=!!v.mip&&!v.none;t.minFilter=t.generateMipmaps?THREE.LinearMipmapLinearFilter:THREE.LinearFilter;t.magFilter=THREE.LinearFilter;t.needsUpdate=true;return t}
function texProbe(v){const[c,g]=cv(16,16);g.fillStyle='#ff8000';g.fillRect(0,0,16,16);const t=mkTex(c,v,true);
  const sc=new THREE.Scene(),cam=new THREE.OrthographicCamera(-1,1,1,-1,0,1),m=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({map:t,toneMapped:false}));sc.add(m);
  const rt=new THREE.WebGLRenderTarget(4,4);renderer.setRenderTarget(rt);renderer.render(sc,cam);renderer.setRenderTarget(null);const px=new Uint8Array(64);renderer.readRenderTargetPixels(rt,0,0,4,4,px);
  rt.dispose();t.dispose();m.material.dispose();m.geometry.dispose();let ok=true;for(let i=0;i<64;i+=4)if(!(px[i]>200&&px[i+1]>20&&px[i+1]<120&&px[i+2]<45))ok=false;return ok}
TEXMODE=TEXV.length;{let gk='';try{const gl=renderer.getContext(),x=gl.getExtension('WEBGL_debug_renderer_info');gk=(x?gl.getParameter(x.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER))+'|'+navigator.userAgent}catch(e){}let hit=false;try{hit=gk&&localStorage.getItem('mho_texprobe')===gk}catch(e){}
  if(hit)TEXMODE=0;else{for(let i=0;i<TEXV.length;i++){let ok=false;try{ok=texProbe(TEXV[i])}catch(e){}if(ok){TEXMODE=i;break}}if(TEXMODE===0&&gk)try{localStorage.setItem('mho_texprobe',gk)}catch(e){}}}
{const f=new URLSearchParams(location.search).get('texmode');if(f!==null)TEXMODE=+f}
const TEXVAR=TEXV[TEXMODE]||{none:1,name:'solid colours'};console.info('[overdrive] texture path:',TEXVAR.name);
function tex(c,rep=true,srgb=true){const t=mkTex(c,TEXVAR,srgb);if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping}t.anisotropy=8;return t}
function refreshTex(t){const c=t.userData.src;if(c&&t.isDataTexture){const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data,a=t.image.data;
    if(a instanceof Uint16Array){for(let i=0;i<d.length;i++){const x=d[i]/255;a[i]=THREE.DataUtils.toHalfFloat(t.userData.srgb&&(i&3)!==3?s2l(x):x)}}else a.set(d)}
  if(!TEXVAR.none)t.needsUpdate=true}
// glows and shadows are computed straight into pixel data so they never depend on the canvas path
function radial(stops,sz=128){const st=stops.map(([o,col])=>{const n=col.match(/[\d.]+/g).map(Number);return[o,n[0],n[1],n[2],n[3]??1]});const d=new Uint8Array(sz*sz*4);
  for(let y=0;y<sz;y++)for(let x=0;x<sz;x++){const r=Math.min(1,Math.hypot(x+.5-sz/2,y+.5-sz/2)/(sz/2));let k=0;while(k<st.length-2&&r>st[k+1][0])k++;const A=st[k],B=st[k+1]||A,f=B[0]>A[0]?Math.min(1,Math.max(0,(r-A[0])/(B[0]-A[0]))):0;
    const i=(y*sz+x)*4;for(let j=0;j<3;j++)d[i+j]=A[1+j]+(B[1+j]-A[1+j])*f;d[i+3]=255*(A[4]+(B[4]-A[4])*f)}
  const v=TEXVAR.none||TEXVAR.canvas?{mip:1}:TEXVAR;const t=dataTex(d,sz,sz,v,true);t.generateMipmaps=!!v.mip;t.minFilter=t.generateMipmaps?THREE.LinearMipmapLinearFilter:THREE.LinearFilter;t.magFilter=THREE.LinearFilter;t.needsUpdate=true;return t}
const GLOW=radial([[0,'rgba(255,255,255,1)'],[.22,'rgba(255,255,255,.55)'],[1,'rgba(255,255,255,0)']]);
const FLARE=radial([[0,'rgba(255,255,255,1)'],[.08,'rgba(255,255,255,.9)'],[.25,'rgba(255,255,255,.25)'],[1,'rgba(255,255,255,0)']]);
const SHADOW=radial([[0,'rgba(0,0,0,.85)'],[.55,'rgba(0,0,0,.45)'],[1,'rgba(0,0,0,0)']]);
// road: navy hex plates, glowing hex outlines and circuit traces, rumble strips, edge lines, centre dash (one tile = W × W)
function roadTex(){const Z=512,[c,g]=cv(Z,Z),[e,ge]=cv(Z,Z);const r=mul(11);g.fillStyle='#0a0b2a';g.fillRect(0,0,Z,Z);ge.fillStyle='#000';ge.fillRect(0,0,Z,Z);
  const rows=10,hh=Z/rows,rad=hh/Math.sqrt(3),hex=(ctx,x,y,rd)=>{ctx.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3;ctx.lineTo(x+Math.cos(a)*rd,y+Math.sin(a)*rd)}ctx.closePath()};
  for(let col=-1;col*1.5*rad<Z+rad;col++)for(let row=-1;row<=rows;row++){const x=col*1.5*rad,y=row*hh+(col&1?hh/2:0);const sh=r();
    hex(g,x,y,rad-1.5);g.fillStyle=`rgb(${11+sh*9|0},${12+sh*10|0},${44+sh*22|0})`;g.fill();g.strokeStyle='#1d2c78';g.lineWidth=3;g.stroke();
    const mg=r()<.05;hex(ge,x,y,rad-1.5);ge.strokeStyle=mg?'rgba(255,62,200,.75)':'rgba(22,200,255,.42)';ge.lineWidth=mg?3:2.2;ge.stroke();
    if(r()<.08){hex(ge,x,y,rad*.52);ge.strokeStyle='rgba(22,200,255,.6)';ge.lineWidth=2;ge.stroke()}}
  for(let i=0;i<26;i++){let x=40+r()*(Z-80),y=r()*Z;ge.strokeStyle='rgba(76,234,255,.28)';ge.lineWidth=2;ge.beginPath();ge.moveTo(x,y);for(let k=0;k<4;k++){if(k%2)x+=(r()-.5)*90;else y+=(r()-.5)*120;ge.lineTo(x,y)}ge.stroke();ge.fillStyle='rgba(76,234,255,.6)';ge.fillRect(x-2.5,y-2.5,5,5)}
  for(let y=0;y<Z;y+=32){const a=(y/32)%2?'#ff2d95':'#ffffff';for(const x of[0,Z-13]){g.fillStyle=a;g.fillRect(x,y,13,32);ge.fillStyle=a;ge.globalAlpha=.55;ge.fillRect(x,y,13,32);ge.globalAlpha=1}}
  for(const x of[24,Z-29]){g.fillStyle='#dff6ff';g.fillRect(x,0,5,Z);ge.fillStyle='rgba(191,244,255,.85)';ge.fillRect(x,0,5,Z)}
  for(let y=0;y<Z;y+=128){g.fillStyle='#e8f6ff';g.fillRect(Z/2-3,y,6,64);ge.fillStyle='rgba(255,255,255,.6)';ge.fillRect(Z/2-3,y,6,64)}
  return[tex(c),tex(e)]}
// wall face: dark panels with seams, chevrons pointing along the direction of travel (one tile = 25 m)
function wallTex(beam){const[c,g]=cv(1024,128),[e,ge]=cv(1024,128);const gr=g.createLinearGradient(0,0,0,128);gr.addColorStop(0,'#2a3160');gr.addColorStop(1,'#141833');g.fillStyle=gr;g.fillRect(0,0,1024,128);ge.fillStyle='#000';ge.fillRect(0,0,1024,128);
  for(let x=0;x<1024;x+=128){g.fillStyle='#0b0e22';g.fillRect(x,0,3,128);g.fillStyle='rgba(120,150,255,.25)';g.fillRect(x+3,0,1,128)}
  for(let x=10;x<1024;x+=64){ge.fillStyle=beam;g.fillStyle=beam;for(const ctx of[g,ge]){ctx.globalAlpha=ctx===g?.5:1;ctx.beginPath();ctx.moveTo(x,26);ctx.lineTo(x+16,26);ctx.lineTo(x+40,64);ctx.lineTo(x+16,102);ctx.lineTo(x,102);ctx.lineTo(x+24,64);ctx.closePath();ctx.fill();ctx.globalAlpha=1}}
  return[tex(c),tex(e)]}
// glass tower facade and a matching window map (lit panes toggle during the race)
function facadeTex(){const[c,g]=cv(256,512);const cols=16,rows=36,cw=256/cols,ch=512/rows;
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const X=x*cw,Y=y*ch;if(y%6===5){g.fillStyle='#10152c';g.fillRect(X,Y,cw,ch);continue}
    const gr=g.createLinearGradient(0,Y,0,Y+ch);gr.addColorStop(0,'#3a5c9a');gr.addColorStop(.25,'#1f3462');gr.addColorStop(1,'#142347');g.fillStyle=gr;g.fillRect(X+1,Y+1,cw-2,ch-2);g.fillStyle='rgba(180,210,255,.18)';g.fillRect(X+1,Y+1,cw-2,2)}
  g.fillStyle='#10152c';g.fillRect(0,0,3,3);return tex(c)}
const WIN_CELLS=[];function windowTex(seed,pal){const r=mul(seed);const[c,g]=cv(256,512);g.fillStyle='#000';g.fillRect(0,0,256,512);const cols=16,rows=36,cw=256/cols,ch=512/rows;const cells=[];
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){if(y%6===5)continue;const cell=[x*cw+4,y*ch+4,cw-8,ch-7];cells.push(cell);if(r()<.3){g.fillStyle=pal[Math.floor(r()*pal.length)];g.globalAlpha=.45+r()*.55;g.fillRect(...cell);g.globalAlpha=1}}
  const t=tex(c);WIN_CELLS.push({g,t,cells,pal,r});return t}
function streetTex(){const[c,g]=cv(512,512),[e,ge]=cv(512,512);g.fillStyle='#0c0a18';g.fillRect(0,0,512,512);ge.fillStyle='#000';ge.fillRect(0,0,512,512);const r=mul(5);
  for(let i=0;i<3000;i++){g.fillStyle=`rgba(90,80,140,${r()*.08})`;g.fillRect(r()*512,r()*512,2,2)}
  g.fillStyle='#16132a';for(const p of[96,352]){g.fillRect(p-22,0,44,512);g.fillRect(0,p-22,512,44)}
  for(const p of[96,352])for(let k=0;k<512;k+=36){ge.fillStyle='rgba(255,180,106,.9)';ge.fillRect(p-24,k,4,4);ge.fillRect(p+20,k+18,4,4);ge.fillRect(k,p-24,4,4);ge.fillRect(k+18,p+20,4,4)}
  for(let i=0;i<40;i++){ge.fillStyle=['#ff2d95','#22e4ff','#8c55ff'][i%3];ge.globalAlpha=.7;ge.fillRect(r()*512,r()*512,3,3)}ge.globalAlpha=1;return[tex(c),tex(e)]}
function billboardTex([name,tag,c1,c2]){const[c,g]=cv(512,256);const gr=g.createLinearGradient(0,0,512,256);const d=new THREE.Color(c1).multiplyScalar(.35);gr.addColorStop(0,'#'+d.getHexString());gr.addColorStop(1,c1);g.fillStyle=gr;g.fillRect(0,0,512,256);
  g.fillStyle='rgba(0,0,0,.18)';for(let y=0;y<256;y+=4)g.fillRect(0,y,512,1);g.fillStyle=c2;g.fillRect(0,0,512,8);g.fillRect(0,248,512,8);
  g.save();g.translate(70,128);g.strokeStyle='#fff';g.lineWidth=9;g.beginPath();g.moveTo(-36,-36);g.lineTo(36,36);g.moveTo(36,-36);g.lineTo(-36,36);g.stroke();g.strokeStyle=c2;g.lineWidth=4;g.strokeRect(-46,-46,92,92);g.restore();
  g.fillStyle='#fff';let fs=76;g.font=`italic 900 ${fs}px "Arial Black",system-ui,sans-serif`;while(g.measureText(name).width>370&&fs>30){fs-=4;g.font=`italic 900 ${fs}px "Arial Black",system-ui,sans-serif`}g.fillText(name,132,128);
  g.fillStyle=c2;g.font='italic 800 22px system-ui,sans-serif';g.fillText(tag,134,170);return tex(c,false)}
function vSignTex(txt,col){const[c,g]=cv(128,512);g.fillStyle='#05030c';g.fillRect(0,0,128,512);const n=[...txt].length,step=Math.min(84,470/n);g.font=`italic 900 ${Math.min(80,step*.95)}px system-ui,sans-serif`;g.textAlign='center';g.textBaseline='middle';
  g.shadowColor=col;g.shadowBlur=18;g.fillStyle=col;[...txt].forEach((ch,i)=>g.fillText(ch,64,256-(n-1)*step/2+i*step));g.shadowBlur=0;g.fillStyle='#fff';g.globalAlpha=.5;[...txt].forEach((ch,i)=>g.fillText(ch,64,256-(n-1)*step/2+i*step));g.globalAlpha=1;
  g.strokeStyle=col;g.lineWidth=5;g.strokeRect(6,6,116,500);g.lineWidth=2;g.strokeRect(14,14,100,484);return tex(c,false)}
function textTex(txt,col,w=1024,h=128){const[c,g]=cv(w,h);g.fillStyle='rgba(3,10,20,.92)';g.fillRect(0,0,w,h);let fs=h*.62;g.font=`italic 900 ${fs}px system-ui,sans-serif`;while(g.measureText(txt).width>w*.9){fs-=4;g.font=`italic 900 ${fs}px system-ui,sans-serif`}
  g.textAlign='center';g.textBaseline='middle';g.shadowColor=col;g.shadowBlur=14;g.fillStyle=col;g.fillText(txt,w/2,h/2+2);g.shadowBlur=0;g.strokeStyle=col;g.lineWidth=4;g.strokeRect(2,2,w-4,h-4);return tex(c,false)}
function padTex(kind){const[c,g]=cv(128,256);if(kind==='boost'){g.fillStyle='rgba(0,0,0,0)';for(let i=0;i<4;i++){const y=220-i*60;g.fillStyle=`rgba(255,${190+i*15},60,${.5+i*.15})`;g.beginPath();g.moveTo(10,y);g.lineTo(64,y-44);g.lineTo(118,y);g.lineTo(118,y+16);g.lineTo(64,y-28);g.lineTo(10,y+16);g.fill()}}
  else{g.strokeStyle='#4ceaff';g.lineWidth=8;g.strokeRect(8,8,112,240);g.fillStyle='rgba(76,234,255,.18)';g.fillRect(8,8,112,240);g.font='italic 900 90px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff';g.fillText('?',64,130)}return tex(c,false)}
function hazardTex(){const[c,g]=cv(256,64);for(let i=-2;i<12;i++){g.fillStyle=i%2?'#111':'#ffc23d';g.beginPath();g.moveTo(i*28,0);g.lineTo(i*28+28,0);g.lineTo(i*28+60,64);g.lineTo(i*28+32,64);g.fill()}return tex(c,false)}
function liveryTex(t){const[c,g]=cv(512,512);g.fillStyle=t.a;g.fillRect(0,0,512,512);if(t.pat&&t.pat!=='racing'){liveryPat(t,g);return tex(c,false)}
  const sd=g.createLinearGradient(0,0,512,0);sd.addColorStop(0,'rgba(0,0,0,0)');sd.addColorStop(.25,'rgba(0,0,0,0)');sd.addColorStop(.5,'rgba(0,0,0,.42)');sd.addColorStop(.75,'rgba(0,0,0,.2)');sd.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=sd;g.fillRect(0,0,512,512);
  g.fillStyle=t.b;g.fillRect(512*.19,0,512*.12,512);g.fillStyle=t.c;g.fillRect(512*.246,0,512*.008,512);
  g.fillStyle=t.b;for(let y=90;y<420;y+=70){g.beginPath();g.moveTo(512*.02,y);g.lineTo(512*.12,y+26);g.lineTo(512*.02,y+52);g.lineTo(512*.02,y+38);g.lineTo(512*.08,y+26);g.lineTo(512*.02,y+14);g.fill();g.beginPath();g.moveTo(512*.48,y);g.lineTo(512*.38,y+26);g.lineTo(512*.48,y+52);g.lineTo(512*.48,y+38);g.lineTo(512*.42,y+26);g.lineTo(512*.48,y+14);g.fill()}
  g.fillStyle=t.b;g.globalAlpha=.85;g.fillRect(512*.68,0,512*.14,512);g.globalAlpha=1;
  const r=mul(t.id.length*97);g.strokeStyle='rgba(0,0,0,.18)';for(let i=0;i<40;i++){const x=r()*512,y=r()*512;g.lineWidth=r()*2;g.beginPath();g.moveTo(x,y);g.lineTo(x+r()*4,y+20+r()*50);g.stroke()}
  g.fillStyle=t.c;g.font='italic 900 40px system-ui';g.save();g.translate(512*.62,300);g.rotate(Math.PI/2);g.fillText(t.name.split(' ')[0].toUpperCase(),0,0);g.restore();if(t.num!=null){t=Object.assign({},t,{pat:'racing'});liveryPat(t,g)}return tex(c,false)}
function wingTex(t){const[c,g]=cv(256,256);g.fillStyle=t.a;g.fillRect(0,0,256,256);g.fillStyle=t.b;for(let i=0;i<3;i++){g.save();g.translate(128,128);g.rotate(-.9);g.fillRect(-200,-60+i*48,400,22);g.restore()}g.fillStyle=t.c;g.fillRect(0,240,256,16);return tex(c)}

/* ============================================================ 5 · track data */
function buildTrackData(){
  const pts=CP.map(p=>V3(p[0]*S,p[1],p[2]*S));
  const curve=new THREE.CatmullRomCurve3(pts,true,'centripetal',.5);
  const L0=curve.getLength(),N=Math.round(L0/2),ds=L0/N,sp=curve.getSpacedPoints(N);
  const P=new Float32Array(N*3),T=new Float32Array(N*3),Rv=new Float32Array(N*3),U=new Float32Array(N*3),K=new Float32Array(N),B=new Float32Array(N),SEC=new Array(N);
  const tan=[];for(let i=0;i<N;i++){const a=sp[(i-1+N)%N],b=sp[(i+1)%N];tan.push(b.clone().sub(a).normalize())}
  let k=new Float32Array(N);const w=4;
  for(let i=0;i<N;i++){const t1=tan[(i-w+N)%N],t2=tan[(i+w)%N];k[i]=Math.atan2(t1.x*t2.z-t1.z*t2.x,t1.x*t2.x+t1.z*t2.z)/(2*w*ds)}
  const smooth=(a,r)=>{const o=new Float32Array(N);for(let i=0;i<N;i++){let s=0;for(let j=-r;j<=r;j++)s+=a[(i+j+N)%N];o[i]=s/(2*r+1)}return o};
  k=smooth(smooth(k,8),8);let b=new Float32Array(N);for(let i=0;i<N;i++)b[i]=clamp(k[i]*42,-.26,.26)*(TRK.bank||1);b=smooth(b,20);
  const Y=V3(0,1,0),fr=V3(),rt=V3(),up=V3();
  for(let i=0;i<N;i++){const p=sp[i],t=tan[i];fr.crossVectors(t,Y).normalize();rt.copy(fr).multiplyScalar(Math.cos(b[i])).addScaledVector(Y,-Math.sin(b[i]));up.crossVectors(rt,t).normalize();
    P.set([p.x,p.y,p.z],i*3);T.set([t.x,t.y,t.z],i*3);Rv.set([rt.x,rt.y,rt.z],i*3);U.set([up.x,up.y,up.z],i*3);K[i]=k[i];B[i]=b[i];
    let bi=0,bd=1e9;for(let j=0;j<CP.length;j++){const d=(CP[j][0]*S-p.x)**2+(CP[j][2]*S-p.z)**2+((CP[j][1]-p.y)*6)**2;if(d<bd){bd=d;bi=j}}SEC[i]=CP[bi][3]}
  const td={N,ds,L:N*ds,P,T,R:Rv,U,K,B,SEC,rev:false};
  const J=[];for(const js of TRK.jumps){
    if(js.kind==='river'){let a=-1,bb=-1;for(let i=0;i<N;i++){const x=P[i*3],z=P[i*3+2];if(x>=js.xmin*S&&x<=js.xmax*S&&z>RIVER[0]-4&&z<RIVER[1]+4){if(a<0)a=i;bb=i}}if(a>=0){let s0=a*ds,s1=bb*ds;if(js.jw&&s1-s0>js.jw){const c=(s0+s1)/2;s0=c-js.jw/2;s1=c+js.jw/2}J.push({...js,s0,s1,floor:-6.5})}}
    else{let gi=0,gd=1e9;for(let i=0;i<N;i++){const d=(P[i*3]-js.at[0]*S)**2+(P[i*3+2]-js.at[1]*S)**2;if(d<gd){gd=d;gi=i}}
      J.push({...js,s0:gi*ds-js.half,s1:gi*ds+js.half,floor:js.kind==='sky'?P[gi*3+1]-40:js.floor})}}
  td.jumps=J;return td}
function reverseTrack(f){const N=f.N,o={N,ds:f.ds,L:f.L,P:new Float32Array(N*3),T:new Float32Array(N*3),R:new Float32Array(N*3),U:new Float32Array(N*3),K:new Float32Array(N),B:new Float32Array(N),SEC:new Array(N),rev:true};
  for(let i=0;i<N;i++){const j=(N-i)%N;for(let c=0;c<3;c++){o.P[i*3+c]=f.P[j*3+c];o.T[i*3+c]=-f.T[j*3+c];o.R[i*3+c]=-f.R[j*3+c];o.U[i*3+c]=f.U[j*3+c]}o.K[i]=-f.K[j];o.B[i]=-f.B[j];o.SEC[i]=f.SEC[j]}
  o.jumps=f.jumps.map(j=>({...j,s0:f.L-j.s1,s1:f.L-j.s0}));return o}
let TF=buildTrackData(),TD=TF,TRACKS={fwd:TF,rev:null};
function frameAt(td,s,o){s=mod(s,td.L);const f=s/td.ds,i=Math.floor(f)%td.N,j=(i+1)%td.N,a=f-Math.floor(f),A=i*3,Bj=j*3;
  o.p.set(lerp(td.P[A],td.P[Bj],a),lerp(td.P[A+1],td.P[Bj+1],a),lerp(td.P[A+2],td.P[Bj+2],a));
  o.t.set(lerp(td.T[A],td.T[Bj],a),lerp(td.T[A+1],td.T[Bj+1],a),lerp(td.T[A+2],td.T[Bj+2],a)).normalize();
  o.r.set(lerp(td.R[A],td.R[Bj],a),lerp(td.R[A+1],td.R[Bj+1],a),lerp(td.R[A+2],td.R[Bj+2],a)).normalize();
  o.u.set(lerp(td.U[A],td.U[Bj],a),lerp(td.U[A+1],td.U[Bj+1],a),lerp(td.U[A+2],td.U[Bj+2],a)).normalize();
  o.k=lerp(td.K[i],td.K[j],a);o.i=i;return o}
const mkF=()=>({p:V3(),t:V3(),r:V3(),u:V3(),k:0,i:0});
const kAt=(td,s)=>td.K[Math.floor(mod(s,td.L)/td.ds)%td.N];
function yAt(td,s){const f=mod(s,td.L)/td.ds,i=Math.floor(f)%td.N,j=(i+1)%td.N;return lerp(td.P[i*3+1],td.P[j*3+1],f-Math.floor(f))}
function jumpAt(td,s){const m=mod(s,td.L);for(const j of td.jumps)if(m>=j.s0&&m<=j.s1)return j;return null}
const WATER_Y=-5.5,isWater=(td,s)=>!TRK.city&&yAt(td,s)<WATER_Y;
const isDirt=(td,s)=>{const q=td.SEC[Math.floor(mod(s,td.L)/td.ds)%td.N];return !!q&&q.includes('PISTE')};
const inGapF=s=>!!jumpAt(TF,s)||isWater(TF,s)||isDirt(TF,s);
const HCELL=60,hash=new Map();
function indexTrack(){hash.clear();for(let i=0;i<TF.N;i+=2){const x=TF.P[i*3],z=TF.P[i*3+2],key=Math.floor(x/HCELL)+','+Math.floor(z/HCELL);if(!hash.has(key))hash.set(key,[]);hash.get(key).push(x,z,TF.P[i*3+1],i)}}
indexTrack();
// another part of the circuit passing above/below this point (flyovers): used to keep pylons and gantries clear
const crossAt=(p,test)=>nearTrack(p.x,p.z,HALF+10,y=>test(y-p.y));
function nearTrack(x,z,r,test){const c0=Math.floor((x-r)/HCELL),c1=Math.floor((x+r)/HCELL),d0=Math.floor((z-r)/HCELL),d1=Math.floor((z+r)/HCELL);
  for(let a=c0;a<=c1;a++)for(let b=d0;b<=d1;b++){const arr=hash.get(a+','+b);if(!arr)continue;for(let k=0;k<arr.length;k+=4)if((!test||test(arr[k+2],arr[k+3]))&&(arr[k]-x)**2+(arr[k+1]-z)**2<r*r)return true}return false}
function nearestTrackDist(x,z,r){let best=1e9;const c0=Math.floor((x-r)/HCELL),c1=Math.floor((x+r)/HCELL),d0=Math.floor((z-r)/HCELL),d1=Math.floor((z+r)/HCELL);
  for(let a=c0;a<=c1;a++)for(let b=d0;b<=d1;b++){const arr=hash.get(a+','+b);if(!arr)continue;for(let k=0;k<arr.length;k+=4){const d=(arr[k]-x)**2+(arr[k+1]-z)**2;if(d<best)best=d}}return Math.sqrt(best)}

