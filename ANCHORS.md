# JU anchors

## Replaced strings (pJU1.py)
| # | anchor | count | what happens |
|---|---|---|---|
| 1 | `window.__mho={` | 1 | `ju.js` is inserted right before it (module scope, after m1/m2/m3/… so it wraps their wrappers) |

That is the only text replacement. base.html is not edited.

## Functions ju.js wraps (reassigned at module scope, `f=(g=>function(...){…g(...)…})(f)` style)
| function | why |
|---|---|
| `frame` | hit-stop gate (the frame clock stands still, sim dt = 0); `__ju.hold` for tests; resets the landing squash outside roam |
| `roamStep` | feedback clock, drift tier pacing + tier cue + payout, near miss at city speed, air bonus + landing squash, stud trail |
| `roamCam` (wraps M1's wrapper) | camera height/pull at speed, look-ahead yaw, FOV curve and impact punch, speed blur and speed lines inside mission caps |
| `comboAdd`, `comboStep` | combo pulse per link, cash-out pop |
| `debris` | big brick sprays (n ≥ 18, size ≥ 1) trigger hit-stop |
| `AU.sfx`, `AU.engine` | `takedown` sfx triggers hit-stop; wind by roam speed + one low rumble loop |
| `feed`, `say`, `studGain` | passive event counters for tJU.js (no behaviour change) |

Globals added: `JU`, `JU_C`, `JU_TC`, `JU_*` functions, `window.__ju` (test API), DOM `#juPop` + one `<style>` (made on the first pop).
Fields added on existing objects: `c.jpa` on traffic cars (near-miss pass tracking), `c.fv0/c.fh0` (test freeze only), `AU.juR` (rumble gain).
