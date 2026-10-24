W207 enemy ship art: stage 1, a busy moment (pc.webp 1440x860, phone.webp 390x763; stepped play, WebP q82).
Reference frame of a well-regarded modern side-scrolling shoot-'em-up: https://store.steampowered.com/app/1361510
Ours: every enemy and the carrier hull draw their own sheet, engine flame always, volley clip on each shot, death clip on each kill. Ships are still small and the scene still reads as layers next to the reference; the owner's score stands, no worker score claimed.
Gates (qa/shipart-probe.js, x200 stepped, stages 1-45): 0 kinds with another kind's or a fallback image, volley on 100% of shots, death on 100% of kills (gate pylons and the ground walker have no volley/death/any sheet from the owner and are listed). Simhunt: same 2 severe kinds with the flag on and off; guard.py ok.

Wave data (orchestrator audit follow-up): stage 1 now also fields flank (bar 5), swarm (9), interceptor (13), bomber (34) and sniper (37) from the existing kinds and sheets (roles F/W/I/O/N in slice.js; fleet kinds spawn through WV.spawn). The recoloured copies of edrone (leader) and ecarrier are gone: the leader is the same sheet, larger. Stage-1 probe x3 seeds: all five met, own sheet 100%, volley 100%, death 100%; simhunt stage 1: 0 severe (flag-off baseline has 1). Bars 21-27 are replaced by the carrier set piece, so nothing was placed there.

game-look "Check before reporting", per row, next to the reference frame:
- SHIPS: every kind now draws its own sheet with flame, volley and death, but they are small against the reference and the sheets are lit in their own style (outline weight and light direction differ between kinds); the carrier hull now reads as a ship. Still looks pasted next to the background.
- BULLETS: not touched. All enemy shots are still the same orange orb image, so they do not differ per enemy (rule 17d is open; the audit lists the unused fx-bullet-needle/shell/rocket and fx-eb-* sheets).
- ENVIRONMENT: not touched. One busy backdrop still as bright and busy as the ships, no depth haze; reads as layers.
- FEEL: death and volley clips now play every time; explosions are still one boom sheet for every kind and kill feedback is unchanged.
Honest summary: the ship row is better, the other three rows are as bad as before; this is not a pass of the one-shot pair.
