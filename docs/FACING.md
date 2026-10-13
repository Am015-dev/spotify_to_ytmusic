# facing-1 audit (2026-10-13): ride facing + driver facing/seat, every LDraw ride

Alex: "in some cars the driver sits wrong direction and cars drive backwards" (shots/alex_bug_driver_backwards.png = 6652 Construction Truck).
Scope: 126 rides = live v90i (alex/od-models ce5cbb2b) + the unreleased ones on alex/od-mdl-veh (4e5d807).

## Root causes
**B, driver (95 of 97 rides with a driver were wrong).** `SZ_add` (src/98sz_ride_scale.js) took the minifig's yaw from the 'stw' brick: stw r 2 → drvM r 2.
But drvM at r 2 faces **+z, the rear** (r 0 faces -z = every ride's front; same as the hand-built cars' 'drv' r 0). So on every normal ride the driver
sat with his back to the steering wheel, looking at the bed/boot. The 3 "OK" ones before (625 6524 6581: stw r 1 / free R) had the other bug: r 0 but
placed 2 studs IN FRONT of the wheel. Fix: the driver always faces -z, one stud behind the wheel (hands at the wheel); an old drvM in a saved garage copy is replaced.

**A, ride facing (5 rides drove backwards): 1991 Racing Pickup, 3180 Tanker Cab, 4208 Fire Truck, 621 Classic Patrol, 6633 Family Car.** Their LDraw front is
-x; the converter yaw came from the SIZE rule (w > d → --yaw 1), which is right only for +x fronts, so the grille ended up at +z (the back). Fix:
`tools/ld/ldfront.py` reads the front from the parts (steering wheel ahead of the seat, clear/yellow lights at one end and red at the other, grille,
windscreen) and `tools/ld/vehcv.sh` auto mode takes its yaw (size rule = fallback when no part gives a cue; a manual yaw that disagrees prints WARN).
The 5 converted modules are turned 180 deg at load (`LD_FACE` + `LD_turn` in src/98ld_import.js; saved garage copies are turned once, marker 'fcT').
Signal in the data that confirms it: the tilted steering stand 'stw@100' has r 2 on all 92 forward rides and r 0 on exactly these 5.

## How the audit decides (tools/ld/tFacing.js dump → tools/ld/facing.py)
Front (ride frame, front must be -z): stand r (6), wheel ahead of the minifig seat (3), clear/yellow lights at one end (2), red lights at the other (2),
grille/headlight bricks (1), windscreen ahead of the wheel (1), cab ahead of the middle (1); x-axis votes flag a ride turned 90 deg (none found).
21 rides with weak/contradicting cues (racers' rear vents, no lights) were judged from the g_34 garage shot (VIS in facing.py): all front OK.
Driver: drvM r 0 = faces -z; "in seat" = the wheel within -0.5..0.7 units ahead of the figure's knees and centred on it (x within 0.7).
Rides with "none" have no steering wheel in the set (Speed Champions sets, racers with closed canopies, a few trucks): no driver is drawn, unchanged.

## Result: before → after
front: before 121 OK + 5 BACK → after 126/126 OK · driver facing: before 95 BACK + 3 misplaced (625 6524 6581: in front of the wheel) → after 97/97 OK + the 6522 bike rider turned forward (no wheel; shot 6522_after) · driver in seat: 0/97 → 97/97

Shots: docs/shots/facing/GRID.jpg (113 tiles: bug ride + 5 turned before/after, bike, 3 drive shots with cos(travel, ride front) = 1, 97 changed rides, 5 unchanged controls). Drive check: tools/ld/tFacingDrive.js (keyboard gas; SIM=1 steps roam physics, headless loop too slow).

| id | ride | front OK? | driver facing OK? | driver in seat? |
|---|---|---|---|---|
| t_v1029_1 | Milk Truck (1029) | OK → OK | BACK → OK | NO → OK |
| t_v1517_1 | Race Car 89 (1517) | OK → OK | BACK → OK | NO → OK |
| t_v1572_1 | Tow Rig (1572) | OK → OK | BACK → OK | NO → OK |
| t_v1991_1 | Racing Pickup (1991) | BACK → OK | BACK → OK | NO → OK |
| t_v20011_1 | Mini Garbage Truck (20011) | OK → OK | none → none | none → none |
| t_v30283_1 | Off-Roader (30283) | OK → OK | none → none | none → none |
| t_v30284_1 | Farm Tractor (30284) | OK → OK | none → none | none → none |
| t_v30313_1 | Bin Truck (30313) | OK → OK | BACK → OK | NO → OK |
| t_v3056_1 | Go-Kart (3056) | OK → OK | BACK → OK | NO → OK |
| t_v30572_1 | Race Car (30572) | OK → OK | none → none | none → none |
| t_v31027_1 | Blue Racer (31027) | OK → OK | none → none | none → none |
| t_v3179_1 | Repair Truck (3179) | OK → OK | BACK → OK | NO → OK |
| t_v3180_1 | Tanker Cab (3180) | BACK → OK | BACK → OK | NO → OK |
| t_v3221_1 | Big Rig (3221) | OK → OK | BACK → OK | NO → OK |
| t_v4200_1 | Mining 4x4 (4200) | OK → OK | BACK → OK | NO → OK |
| t_v4206_2 | Recycling Truck (4206) | OK → OK | BACK → OK | NO → OK |
| t_v4208_1 | Fire Truck (4208) | BACK → OK | BACK → OK | NO → OK |
| t_v4433_1 | Bike Hauler (4433) | OK → OK | BACK → OK | NO → OK |
| t_v4434_1 | Tipper Truck (4434) | OK → OK | BACK → OK | NO → OK |
| t_v4436_1 | Patrol Car (4436) | OK → OK | BACK → OK | NO → OK |
| t_v4914_1 | Fire Chief (4914) | OK → OK | BACK → OK | NO → OK |
| t_v60017_1 | Flatbed (60017) | OK → OK | BACK → OK | NO → OK |
| t_v60018_1 | Mixer Truck (60018) | OK → OK | BACK → OK | NO → OK |
| t_v60054_1 | Service Van (60054) | OK → OK | BACK → OK | NO → OK |
| t_v60059_1 | Logger (60059) | OK → OK | BACK → OK | NO → OK |
| t_v60083_1 | Snowplow (60083) | OK → OK | BACK → OK | NO → OK |
| t_v604_1 | Town Roadster (604) | OK → OK | none → none | none → none |
| t_v606_1 | Town Coupe (606) | OK → OK | none → none | none → none |
| t_v620_1 | Ladder Truck (620) | OK → OK | none → none | none → none |
| t_v621_1 | Classic Patrol (621) | BACK → OK | BACK → OK | NO → OK |
| t_v622_1 | Town Tipper (622) | OK → OK | none → none | none → none |
| t_v623_1 | Town Cruiser (623) | OK → OK | BACK → OK | NO → OK |
| t_v625_1 | Classic Tractor (625) | OK → OK | OK → OK | NO → OK |
| t_v6354_1 | Pursuit Squad Car (6354) | OK → OK | BACK → OK | NO → OK |
| t_v6361_1 | Mobile Crane (6361) | OK → OK | BACK → OK | NO → OK |
| t_v6430_1 | Night Patroller (6430) | OK → OK | BACK → OK | NO → OK |
| t_v6431_1 | Road Rescue Truck (6431) | OK → OK | BACK → OK | NO → OK |
| t_v6450_1 | Mobile Police Truck (6450) | OK → OK | BACK → OK | NO → OK |
| t_v6470_1 | Mini Dump Truck (6470) | OK → OK | BACK → OK | NO → OK |
| t_v6473_1 | Res-Q Cruiser (6473) | OK → OK | BACK → OK | NO → OK |
| t_v6480_1 | Hook and Ladder Truck (6480) | OK → OK | BACK → OK | NO → OK |
| t_v6481_1 | Bulldozer (6481) | OK → OK | BACK → OK | NO → OK |
| t_v6484_1 | F1 Hauler (6484) | OK → OK | BACK → OK | NO → OK |
| t_v6484_1b | Formula Racer (6484) | OK → OK | BACK → OK | NO → OK |
| t_v6501_1 | Sport Convertible (6501) | OK → OK | BACK → OK | NO → OK |
| t_v6503_1 | Sprint Racer (6503) | OK → OK | BACK → OK | NO → OK |
| t_v6504_1 | Farm Tractor (6504) | OK → OK | BACK → OK | NO → OK |
| t_v6505_1 | Fire Chief Car (6505) | OK → OK | BACK → OK | NO → OK |
| t_v6506_1 | Precinct Cruiser (6506) | OK → OK | BACK → OK | NO → OK |
| t_v6507_1 | Mini Dumper (6507) | OK → OK | BACK → OK | NO → OK |
| t_v6509_1 | Red Devil Racer (6509) | OK → OK | BACK → OK | NO → OK |
| t_v6511_1 | Rescue Runabout (6511) | OK → OK | BACK → OK | NO → OK |
| t_v6512_1 | Landscape Loader (6512) | OK → OK | none → none | none → none |
| t_v6514_1 | Trail Ranger (6514) | OK → OK | BACK → OK | NO → OK |
| t_v6521_1 | Repair Truck (6521) | OK → OK | BACK → OK | NO → OK |
| t_v6522_1 | Highway Bike (6522) | OK → OK | BACK → none | none → none |
| t_v6523_1 | Red Cross Car (6523) | OK → OK | BACK → OK | NO → OK |
| t_v6524_1 | Blizzard Blazer (6524) | OK → OK | OK → OK | NO → OK |
| t_v6525_1 | Blaze Commander (6525) | OK → OK | BACK → OK | NO → OK |
| t_v6526_1 | Red Line Racer (6526) | OK → OK | BACK → OK | NO → OK |
| t_v6527_1 | Tipper Lorry (6527) | OK → OK | BACK → OK | NO → OK |
| t_v6530_1 | Sport Coupe (6530) | OK → OK | BACK → OK | NO → OK |
| t_v6532_1 | Diesel Dumper (6532) | OK → OK | BACK → OK | NO → OK |
| t_v6533_1 | Police 4x4 (6533) | OK → OK | BACK → OK | NO → OK |
| t_v6535_1 | Site Dumper (6535) | OK → OK | BACK → OK | NO → OK |
| t_v6545_1 | Rescue Patrol Car (6545) | OK → OK | BACK → OK | NO → OK |
| t_v6550_1 | Outback Racer (6550) | OK → OK | BACK → OK | NO → OK |
| t_v6553_1 | News Van (6553) | OK → OK | BACK → OK | NO → OK |
| t_v6571_1 | Fire Chief Car (6571) | OK → OK | BACK → OK | NO → OK |
| t_v6571_1b | Fire Patrol Car (6571) | OK → OK | BACK → OK | NO → OK |
| t_v6581_1 | Dig Master Truck (6581) | OK → OK | OK → OK | NO → OK |
| t_v6594_1 | Gas Tanker Cab (6594) | OK → OK | none → none | none → none |
| t_v6600_1 | Police Patrol (6600) | OK → OK | none → none | none → none |
| t_v6602_1 | Fire Chief Car (6602) | OK → OK | none → none | none → none |
| t_v6603_1 | Shovel Tractor (6603) | OK → OK | BACK → OK | NO → OK |
| t_v6605_1 | Road Racer (6605) | OK → OK | BACK → OK | NO → OK |
| t_v6607_1 | Service Truck (6607) | OK → OK | BACK → OK | NO → OK |
| t_v6608_1 | Little Tractor (6608) | OK → OK | BACK → OK | NO → OK |
| t_v6609_1 | Race Car (6609) | OK → OK | BACK → OK | NO → OK |
| t_v6633_1 | Family Car (6633) | BACK → OK | BACK → OK | NO → OK |
| t_v6643_1 | Fire Engine (6643) | OK → OK | BACK → OK | NO → OK |
| t_v6644_1 | Road Rebel (6644) | OK → OK | BACK → OK | NO → OK |
| t_v6648_2 | Dump Truck (6648) | OK → OK | none → none | none → none |
| t_v6650_1 | Fire and Rescue Van (6650) | OK → OK | BACK → OK | NO → OK |
| t_v6651_1 | Post Van (6651) | OK → OK | BACK → OK | NO → OK |
| t_v6652_1 | Construction Truck (6652) | OK → OK | BACK → OK | NO → OK |
| t_v6653_1 | Highway Emergency Van (6653) | OK → OK | BACK → OK | NO → OK |
| t_v6656_1 | Town Tow Truck (6656) | OK → OK | BACK → OK | NO → OK |
| t_v6658_1 | Bulldozer (6658) | OK → OK | BACK → OK | NO → OK |
| t_v6660_1 | Hook Wrecker (6660) | OK → OK | BACK → OK | NO → OK |
| t_v6661_1 | TV Studio Van (6661) | OK → OK | BACK → OK | NO → OK |
| t_v6666_1 | Ambulance (6666) | OK → OK | BACK → OK | NO → OK |
| t_v6667_1 | Pothole Patcher (6667) | OK → OK | BACK → OK | NO → OK |
| t_v6668_1 | Recycle Truck (6668) | OK → OK | BACK → OK | NO → OK |
| t_v6669_1 | Diesel Daredevil (6669) | OK → OK | BACK → OK | NO → OK |
| t_v6670_1 | Rescue Rig (6670) | OK → OK | BACK → OK | NO → OK |
| t_v6675_1 | Road and Trail 4x4 (6675) | OK → OK | BACK → OK | NO → OK |
| t_v6753_1b | Red Coupe (6753) | OK → OK | none → none | none → none |
| t_v6911_1_Ladder_Truck | Mini Ladder Truck (6911) | OK → OK | none → none | none → none |
| t_v6911_1_Rescue_SUV | Rescue SUV (6911) | OK → OK | none → none | none → none |
| t_v7242_1 | Street Sweeper (7242) | OK → OK | BACK → OK | NO → OK |
| t_v7347_1 | Highway Pickup (7347) | OK → OK | none → none | none → none |
| t_v75870_1 | Z06 Racer (75870) | OK → OK | none → none | none → none |
| t_v75878_1 | Hyper 16 (75878) | OK → OK | none → none | none → none |
| t_v75892_1 | Senna GTR (75892) | OK → OK | none → none | none → none |
| t_v75893_1a | Demon 18 (75893) | OK → OK | none → none | none → none |
| t_v75893_1b | Charger 70 (75893) | OK → OK | none → none | none → none |
| t_v7611_1 | Tiny Patrol (7611) | OK → OK | none → none | none → none |
| t_v7612_1 | Tiny Muscle (7612) | OK → OK | none → none | none → none |
| t_v7613_1 | Track Racer (7613) | OK → OK | none → none | none → none |
| t_v7630_1 | Front Loader (7630) | OK → OK | BACK → OK | NO → OK |
| t_v7631_1 | Dump Truck (7631) | OK → OK | BACK → OK | NO → OK |
| t_v7634_1 | Farm Tractor (7634) | OK → OK | BACK → OK | NO → OK |
| t_v7635_1 | Horse 4WD (7635) | OK → OK | BACK → OK | NO → OK |
| t_v7638_1 | Tow Truck (7638) | OK → OK | BACK → OK | NO → OK |
| t_v7639_1 | Camper (7639) | OK → OK | BACK → OK | NO → OK |
| t_v7731_1 | Mail Van (7731) | OK → OK | BACK → OK | NO → OK |
| t_v7733_1 | Cargo Truck (7733) | OK → OK | BACK → OK | NO → OK |
| t_v7737_1 | Coast Guard 4WD (7737) | OK → OK | BACK → OK | NO → OK |
| t_v7743_1 | Police Truck (7743) | OK → OK | BACK → OK | NO → OK |
| t_v7747_1 | Turbine Hauler (7747) | OK → OK | BACK → OK | NO → OK |
| t_v7942_1 | Fire Rescue 4x4 (7942) | OK → OK | BACK → OK | NO → OK |
| t_v7990_1 | Cement Mixer (7990) | OK → OK | BACK → OK | NO → OK |
| t_v7991_1 | Recycler (7991) | OK → OK | BACK → OK | NO → OK |
| t_v8120_1 | Rally Sprinter (8120) | OK → OK | none → none | none → none |
| t_v8121_1 | Track Marshal (8121) | OK → OK | none → none | none → none |
