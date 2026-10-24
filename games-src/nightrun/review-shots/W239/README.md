# W239 flight review frames (seed 1; PC 1440x860, phone 390x763; the boss 6 s into the fight)

Sheet for comparison: games/mainhattan-nightrun/media/anim-boss-tresor-wart.webp (mean sRGB luma .261, idle frames .20-.29).

1. Boss as painted. pureboss.js no longer runs the 'B' value-lift pass (lift 3 on PC, 1.8 on phone), tint or rim; what is left is a normal-blend dark shadow behind it, the 60 ms hit flash and a <= 20% soft vignette on the backdrop behind it (drawn before the boss, never on its pixels).
   - pc-boss: it reads as the sheet's dark gunmetal-violet vault with its gold trim; the pale lavender-white box is gone. Mean sRGB luma on screen .29 (sheet .261, +.029; without the vignette the same probe read .305). The probe's boss mask drops pixels that barely differ from a dark backdrop, so the number leans bright by a few hundredths.
   - Boss contrast vs the local backdrop (WCAG, 6 px ring): PC 1.65-1.77, phone 3.38. PC stays below 3 and the vignette barely moves it (1.75 -> 1.77): the ring is lit by the city's own windows and rail lights, 20% off the backdrop cannot reach 3. The boss is readable by its outline and trim, not by a luminance gap.
   - The W231 gate "boss mean luminance within +-.08 of the strongest foe" (now -.32) and "boss contrast >= 3" fail on PC by design: they ask for the lifted look the owner rejected. Every other W233/W236 gate passes (player contrast >= foes, white <= 2.5%, overlap, banners, card).
   - phone-boss: the phone boss is a different, cyan-lit machine; crisp and dark, with the orange shot over it. Not changed beyond losing the lift.
2. Ship under the HUD. The score / multiplier panel and the HULL panel now fade to 35% while the ship's box overlaps them (the pixels under the panel are copied before the HUD and laid back over it, so the ship shows through whichever HUD layout draws it). PC seed 2 now passes the player gate (player - strongest foe +0.19 at its worst).
   - pc-ship-under-score: the ship is visible through the faded panel, but it is a dim purple shape on a dark backdrop, not crisp; the ship's own contrast there is low, the fade only stops the panel hiding it.
