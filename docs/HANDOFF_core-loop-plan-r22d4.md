# HANDOFF core-loop-plan-r22d4 (WHY_NOT_2K gap 9)
- NEW docs/PLAN_CORE_LOOP.md: Frankfurt core box x[-1100,470] z[-720,800] (1.57x1.52 km: Altstadt, Innenstadt, Bankenviertel, Main quays, 3 road bridges, 13 landmarks); one loop drive -> smash -> studs -> event markers -> new car.
- Found in code: smash gate 45/28 km/h too strict (98sm2_smash2.js:5,10), stud decay streetMul kills the loop at ~min 3 (71_roam_drive.js:134), stud trails gappy (70_roam_world.js:255), markers open cards (71:214), TEST_MODE makes studs worthless.
- Parked behind ALL_OPEN (nothing deleted): Athens, 8 menu modes, story, builder, on foot -> menu MORE / big map. One flag object CL (?cl=core,smash,...|all), default OFF.
- 8 SONNET lanes: L1 core-zone, L2 smash-everything, L3 stud-flow, L4 core-events, L5 beacon-minimap, L6 car-ladder, L7 menu-scope, L8 loop5 session GO (gate to flip ?cl=all ON). Each has files, GO why/*, 852x393 shot, 2K ref.
- Left: L2 car hits wait for the traffic-brain build (gap 3); budget (gap 2) separate. Docs-only commit, no build needed.
