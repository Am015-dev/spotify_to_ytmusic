# W244: one key light for every flight actor (branch nr/W244-light, flag purelook)
Done: PURL.ink() in parts/render/pure.js is the single ink pass (outline, soft ink shadow down-right, thin warm lit edge upper-left, no blur, pooled canvases). rim() now calls it. Used by the player, every enemy sheet (PURL.foe), the boss (pureboss.js boss()) and pickups (PB.pickups). The shadow is rotated with the actor so it always falls down-right on screen.
Checked: phone + PC shots (dense, boss), perf.js PASS (stage-14 frame p50 11.3 ms, p95 58.5, draw calls p95 204 of 250), visible-test same 2 zoo FAILs as before the change (zoo-efdrone, zoo-einterceptor; the sim never calls render).
Known: pureprobe still FAILs on PW.coin's code-drawn power-up icon (arc/fill/stroke; that call is unchanged, only wrapped); gate pylons and enemy bullets have no ink pass; gold enemies get the lit edge but their flat paint is the art itself.
Not done: 8-random-moment minimums for w227probe/playability-probe, phone fps from playability-load.js, a benchmark side-by-side, the owner's look.
Next: replace PW.coin's code icon with the owner's pickup art; ink the gate pylons; owner look at the pair before any deploy.
Files: games-src/nightrun/parts/render/pure.js, pureboss.js
