# W252 grain overlay (flag RET.grain, default OFF)
Owner files: parts/render/grain.js (overlay, vignette, smooth-noise shake), hooks in parts/render/pure.js draw() and parts/street/purefoot.js, one build.py line. Probe: qa/grain-probe.js.
Enable with ?grain=1. Overlay is baked once per size as 5 half-res frames (grain + vignette), cycled at 12 fps, one blit per frame, drawn after actors and before the HUD.
Shake: the existing G.shake / S.shake amplitude (comfort caps, 0 with reduced motion) is read through smooth noise, capped 6 px phone / 10 px PC, only with the flag on.

## Measured (software GPU, noisy)
- Added cost, forced flush, phone 4x CPU: about 0.85 ms (gate 0.8: marginal fail); PC about 0.77 ms. Issue cost alone about 0.1 ms.
- fps phone/PC: swung -21% .. +57% between identical runs, so not a usable gate here; needs a real device.
- Probe/pureprobe not re-run (no gameplay or sim change; flag off by default).

## Look (one phone 390x763 + one PC 1440x860, with/without)
Does not read as one picture. Dark specks on the sky look like dirt or snow, the scratches are hard white lines, and small pink enemy shots are partly hidden on the phone. The vignette is the only part that helps. Default stays OFF.
## Next
Much lower alpha (<=.03), no scratches, specks only on the darks (soft-light), vignette alone as its own cheap step. Judge again on a phone.
