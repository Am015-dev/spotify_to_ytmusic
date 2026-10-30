# HANDOFF size-r30k
- Page 3,517,352 B -> 3,440,760 B (76.6 KB saved; size-headroom needs < 3.5e6, now 59 KB spare).
- Moved 245 old OD_CHANGELOG entries (beyond the 15 the UPDATES screen shows) from src/10_core2.js to docs/OD_CHANGELOG_archive.md. No code or GO moved, no player-visible change.
- Deploys still prepend to OD_CHANGELOG; trim to ~15 entries (append the dropped ones to the archive) when the page nears the cap again.
- Gates: unit 0 FAIL (5342 pass); tools/gate.sh on the built page (phone profile, TAG=why,life1,xf1,terrain, fra+ath): PASS 78/78, 0 errors.
