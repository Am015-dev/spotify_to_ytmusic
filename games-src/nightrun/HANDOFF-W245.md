# W245 clean flight field
Changed: parts/waves/slice.js (no wave banner under purelook; the decision is still logged), parts/render/pure.js (shards one mint hue, no hex/ring fallback icon,
player bolts dropped above y 12 and faded past 70% width and 40-65% of the width away from the ship), parts/hud/multhud.js (multiplier caption 4 s under purelook, was 12 s).
Phone dense shot: marks before ~7 (banner, caption, gold rings, stray bolts) -> after 1 (caption, in the HUD strip). PC: 7 -> 2.
Gates: visible-test fails only zoo-einterceptor (median 1.4 s < 2): same on the untouched branch. pureprobe: boss fight renders; its one FAIL (player rim fillRect) predates this change.
Not done: no 8-moment minimum run (no w227probe on this branch); enemy-shot size already done in readable.js. Still cluttering: PC caption for 4 s, power-up pickup pictures, orange orbs in dense waves.
