# W269 phone frame rate after W264 (branch nr/W269-fps, from nr/W264-start + alex/brave-carson-rbpmlk)

## Cause (flight)
W264 moved the 59 weapon and fusion pictures from boot to a drip (2 at a time, one every 400 ms) that started 12 s into a run (weapons/wpx.js). It decoded them in the middle of play. Sampling frames every 10 s on the phone profile: W264 delivered about 20% fewer frames between 11 s and 32 s (193/239/240 frames per 10 s against 181/299/259/268 on the base), and 483 frames and p50 16.7 ms after the drip had finished (42 s). The base decodes the same pictures at boot, where nobody plays.
## Fix (weapons/wpx.js, one owner)
The drip now runs only when nothing is played or loaded: 8 s after page load, not while a stage veil or the street hold is up, not during a stage or the street, but on the title, hub, pause and pit stop. Pictures still load on demand through the lazy ART.bm proxy (hangar icons), so nothing stalls. Start times are untouched (the change only removes work from play): not re-timed in this run.
## Street
Not reproduced: base and W264 street were the same within noise here (see table), so the earlier 43 vs 57 fps was not found. Pictures loaded on first draw (footart.js FA._pic -> FA._load -> AFX.fixFoot flood fill) are still the suspect for hitches in play; not changed, no evidence.
## Measurements (phone 390x763 DPR 3, 4x CPU, this container has no GPU and is very noisy; 45 s runs, NOT the 90 s x 5 asked for: the 40-minute stop did not allow it)
flight (fps / p50 / p95 / p99 ms), alternating runs:
- base 37.8/16.7/50.1/100, 20.7/49.9/83.3/150
- W264 19.6/50/83.4/200, 23.2/33.4/83.3/150
- fixed 36.5/16.8/66.6/100, 24.7/33.3/66.7/150
street (1 run each): base 27.9/33.3/99.9/150, W264 28.1/33.3/100/167, fixed 27.5/33.3/100/167.
The run-to-run spread (base alone: 37.8 vs 20.7 fps) is bigger than any difference, so "fixed within 5% of base" is NOT shown by these runs. The 10 s frame sampling above (same page, same phone profile) is the evidence for the cause. Re-measure on a quieter machine: 5 alternating 90 s runs per build with `NOPROFILE=1 node benchmark/playability-probe.js flight|street phone <url> 90`.
The probe's fps used to count the 12 s profiling seconds as well (inflated by (secs+12)/secs); it now takes frames before profiling and divides by the summed frame times. NOPROFILE=1 skips the profile.
## Tests (fixed build)
- preload-test: all PASS (once; not 3 of 3 for time).
- streetsong-test: 1 of 3 PASS, 2 FAIL. Cause of the flake (not a test race, as W264 said): in the failing runs the first sample, 0.5 s after FOOT.start, has no song playing at all (AU.cur null), because the song is no longer waited for and the synth starts only when the file is missing AND later; a silent gap of about 0.5 s or more at street start. Test left strict. Fix to make next: start the street1 beat/synth bed at FOOT.start (street3.js ssFoot) so there is never silence while the file loads. The test now prints its samples.
## Not done
Real-input checks (touch and mouse/keyboard start FLIGHT and ON FOOT from the title with a loading message), 5x90 s matrix, start-time re-timing, simhunt, guard.py.
