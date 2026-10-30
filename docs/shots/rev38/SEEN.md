# rev38 shots: what I saw (852x393, iPhone UA, touch, PLAY path; top = parent 8b3eca7~1, bottom = trunk e52b69e)
- cmp-fra_f0 (first frame after reveal, 2 rAF after RVL.st=1): same sky blue, brick clouds, buildings, road, tree colours. Sun and shadows are the same. In BOTH builds the player car and the GAS button are not drawn yet. This was already on the parent, so the diff did not cause it.
- cmp-fra_f1 (+1.5 s): identical. Glossy red car with the same reflections and paint, GAS shown. No black or flat car.
- cmp-ath_f0: trunk is better. The car and GAS are already on screen, and the camera is on the chase heading (TWG_late's roamCam snap). The parent's first frame has no car yet. Colours match: the mean RGB drop comes from the car covering the road, not from a tint change.
- cmp-ath_f1 (+1.5 s): identical paint, sky, buildings and shadows in both builds.
- upd.png: UPDATES screen on the built page, 15 entries, newest v90m-beta.164 marked current. The "What's new" toast exists (#odNew) and opening the screen sets mho_seenVer.
