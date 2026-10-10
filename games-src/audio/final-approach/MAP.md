# Final Approach: sound map

Load order: `gameaudio.js`, `audio-data.js`, then the game. `GA.init({sfx:GA_DATA.sfx, music:GA_DATA.music, key:...})`. Events are mapped in `SND_MAP` (game/src/ui6.js). Nobody has auditioned these by ear: tune per-sound `vol` there.

| sample | reused from | size | use |
|---|---|---|---|
| `click` | nebula/click | 1 KB | buttons |
| `error` | nebula/error | 2 KB | illegal move |
| `dieland` | crown/clack | 4 KB | a die lands in a slot |
| `roll` | crown/shake | 8 KB | dice are rolled behind the screens / a reroll |
| `switch` | nebula/token | 2 KB | gear, flaps or brake switch flips |
| `beep` | nebula/lock | 5 KB | radio call clears a plane |
| `engine` | nebula/engine | 8 KB | engine markers move |
| `whoosh` | crown/whoosh | 9 KB | axis moves |
| `coffee` | rampart/coins | 6 KB | a coffee is used |
| `round` | nebula/turn | 6 KB | round ends, plane advances |
| `win` | nebula/win | 10 KB | safe landing |
| `lose` | nebula/lose | 6 KB | flight lost |
| `alarm` | nebula/stress | 4 KB | warning: axis, fuel or collision close |
| `boom` | nebula/boom | 14 KB | crash |
| `hum` | nebula/engine_loop | 36 KB | cabin engine hum, loop under the music |
| `music.<slot>-a/b` | Treblo files in games/final-approach/music/, fetched when first wanted | tavern = menu, main = flight, fight = last round or boss airport, victory / defeat = end cues |
