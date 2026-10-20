# Short Fuse: sound map

Event names for the game's `sound.js`. Every event has a sample with the same name, so `sound.js` can map events with a guard at the top of `sfx(name)` and keep its synth as the fallback:

```js
const SF_VOL = { /* the "vol" column below */ };
if (window.GA && GA.has(name)) { GA.play(name, {vol: SF_VOL[name] ?? 1}); return; }  // else fall through to the synth
```

Pack size: `audio-data.js` 1141 KB (31 effects = 311 KB MP3, 2 music loops = 544 KB MP3).

| group | event | sample | source | length | vol | ducks music | notes |
|---|---|---|---|---|---|---|---|
| UI | `click` | `click` | Kenney UI Audio: click3.ogg | 0.08 s | 0.6 |  | button click |
| UI | `hover` | `hover` | Kenney UI Audio: rollover2.ogg | 0.05 s | 0.3 |  | hover tick (optional, quiet; use cooldown 80) |
| UI | `open` | `open` | Kenney Interface Sounds: maximize_006.ogg | 0.38 s | 0.6 |  | popup / panel open |
| UI | `close` | `close` | Kenney Interface Sounds: minimize_006.ogg | 0.37 s | 0.6 |  | popup / panel close |
| UI | `turn` | `turn` | Kenney Music Jingles: jingles_PIZZI16.ogg | 0.46 s | 0.8 |  | "your turn" chime (pizzicato up-flick) |
| Wires | `select` | `select` | Kenney RPG Audio: metalLatch.ogg | 0.22 s | 0.7 |  | wire / tile selected (pliers grip) |
| Wires | `cut` | `cut` | various scissors: garden_shears_01.mp3 + pluck_001.ogg | 0.19 s | 1.0 |  | successful cut: one crisp shear snip + cartoon pip |
| Wires | `double_cut` | `double_cut` | various scissors: garden_shears_01.mp3 + confirmation_003.ogg | 0.74 s | 1.0 |  | double-cut success: snip-snip + bright confirm |
| Wires | `solo_cut` | `solo_cut` | various scissors: garden_shears_02.mp3 + jingles_PIZZI04.ogg | 0.71 s | 1.0 |  | solo cut: snip with a pizzicato flourish |
| Wires | `reveal` | `reveal` | Kenney Casino Audio: card-slide-4.ogg + pluck_002.ogg | 0.46 s | 0.8 |  | wire value revealed |
| Wires | `flip` | `flip` | Kenney Casino Audio: card-place-3.ogg | 0.88 s | 1.2 |  | tile flip |
| Wires | `info` | `info` | Kenney Casino Audio: chip-lay-2.ogg | 0.23 s | 1.2 |  | info token placed |
| Wires | `validate` | `validate` | Kenney Casino Audio: chips-stack-3.ogg + confirmation_002.ogg | 0.59 s | 0.8 |  | validation token (a value fully cut) |
| Wrong cut | `buzzer` | `buzzer` | Kenney Digital Audio: lowRandom.ogg | 0.42 s | 0.8 |  | wrong-cut buzzer alone |
| Wrong cut | `fizz` | `fizz` | Simple Fuse Sound: fuse.ogg | 0.54 s | 0.8 |  | fuse fizz alone (burning fuse) |
| Wrong cut | `wrong` | `wrong` | Kenney Digital Audio: lowRandom.ogg + fuse.ogg | 0.72 s | 1.0 |  | wrong cut = buzzer + fuse fizz in one sample |
| Wrong cut | `tick` | `tick` | Ticking Clock: clock-1.ogg | 0.15 s | 0.8 |  | detonator tick (one step) |
| Wrong cut | `tick_last` | `tick_last` | Ticking Clock: clock-1.ogg + impactSoft_heavy_001.ogg | 0.57 s | 1.0 |  | tense tick + heartbeat thump, for the last life |
| Wrong cut | `dial` | `dial` | Some sounds: gear01.wav | 0.57 s | 0.9 |  | detonator dial advances one notch (lever clunk) |
| Big moments | `boom` | `boom` | Chunky Explosion: chunky_explosion.mp3 + bang_03.ogg + lowFrequency_explosion_000.ogg + sfx100v2_stones_01.ogg | 3.40 s | 1.0 | yes | BOOM: big cartoon explosion, game over |
| Big moments | `phew` | `phew` | 100 CC0 SFX #2: sfx100v2_air_02.ogg + jingles_PIZZI13.ogg | 1.28 s | 0.9 | yes | PHEW: relief exhale + gentle pizzicato |
| Big moments | `win` | `win` | Happy and Sad Tuba Fanfare: fanfarehappy.ogg | 1.82 s | 1.0 | yes | mission win fanfare (comic tuba) |
| Big moments | `lose` | `lose` | Happy and Sad Tuba Fanfare: fanfaresad.ogg | 3.65 s | 1.0 | yes | mission lose sting (sad tuba) |
| Equipment | `gadget` | `gadget` | Some sounds: motorseamless03.wav + beep_02.ogg | 0.71 s | 0.8 |  | equipment used: gadget whirr + beep |
| Equipment | `scanner` | `scanner` | Some sounds: oddscannerseamless.wav | 1.40 s | 0.8 |  | scanner sweep |
| Equipment | `radar` | `radar` | Sonar Ping: sonar_ping.mp3 | 2.00 s | 0.8 |  | radar ping |
| Timer | `clock_loop` | `clock_loop` | Ticking Clock: clock-1.ogg | 4.02 s | 0.6 |  | ticking clock loop, 1 tick/s: GA.loop('clock_loop',{vol:.6}) |
| Timer | `alarm` | `alarm` | 30 CC0 SFX loops: alarm_01.ogg | 1.98 s | 0.8 | yes | timer alarm, 2 s seamless: play once, or GA.loop('alarm') until dismissed |
| Ambience | `hum` | `hum` | Some sounds: spacestationhum01seamless.wav | 7.00 s | 0.4 |  | optional crew-room hum bed: GA.loop('hum',{vol:.4}) |
| Music stingers | `sting_win` | `sting_win` | Kenney Music Jingles: jingles_SAX02.ogg | 0.84 s | 1.0 | yes | short win stinger (sax, rising) for the music layer |
| Music stingers | `sting_lose` | `sting_lose` | Game Over Trumpet SFX: losetrumpet.wav | 1.11 s | 1.0 | yes | short lose stinger (wah-wah trumpet) for the music layer |

## Music

| name | track | length | loop | encoding | use |
|---|---|---|---|---|---|
| `main` | "Spy Loop" by wipics (CC0) | 25.3 s | cut 0.006s-25.271s (16 bars, the author tail of silence removed), 10 ms equal-power seam | stereo 96 kbps, 296 KB | light cartoon spy groove, 16 bars at 152 bpm |
| `tension` | "Spy Loop" by wipics (CC0) | 21.1 s | the main loop time-stretched to 1.2x tempo (rubberband, pitch kept), 21.05 s | stereo 96 kbps, 247 KB | same groove 1.2x faster (pitch kept), for dial near 0 / timer low |

## Wiring

- Load order in the build: `gameaudio.js`, then this `audio-data.js`, then the game. Call once:
  `GA.init({sfx:GA_DATA.sfx, music:GA_DATA.music, key:'sf', duck:["boom", "phew", "win", "lose", "alarm", "sting_win", "sting_lose"]})`.
  Pass this `duck` list: the default list does not know `phew`, `alarm` or the `sting_*` names.
- Ducking: a ducked sample drops the music bus to 35 % for the sample's length, then it recovers over 0.6 s. Pass `{duck:true}` to duck any other call.
- Music: `GA.music('main')` at mission start. Switch to `GA.music('tension',{fade:1})` when the detonator dial is 1 step from the end, a timer is under ~30 s, or the crew is on its last life; switch back with `GA.music('main',{fade:1.5})` if it recovers. `GA.music(null)` at mission end.
- End of mission: `GA.music(null,{fade:.4})`, then `boom` + `lose` (or `sting_lose`), or `phew` + `win` (or `sting_win`). `win`/`lose` are the full comic tuba cues; `sting_win`/`sting_lose` are the shorter music stingers, for a results screen or when the effects are muted but music is on.
- Wrong cut: play `wrong` (buzzer + fizz in one), then `dial` ~250 ms later (`GA.play('dial',{at:.25})`). Use `tick_last` instead of `tick` while only one life is left.
- Timer missions: `GA.loop('clock_loop',{vol:.6})` while the timer runs (1 tick/s, so it reads as a real clock); `GA.stopLoop('clock_loop')` and `GA.play('alarm')` at 0 (or `GA.loop('alarm',{vol:.7})` until the player dismisses it).
- Ambience: `GA.loop('hum',{vol:.4})` on the crew-room / lobby screen, `GA.stopLoop('hum',{fade:1.5})` when the mission starts.
- Suggested defaults: `sfxVol 0.8`, `musVol 0.45` (the loop is busy; keep it under the snips). `hover`: pass `{cooldown:80}`.
- Repeated events: `cut`, `tick`, `flip` and `info` sound fine with the default 4 % pitch/volume jitter; pass `{jitter:0}` for `turn`, the stingers and `boom`.
- Toggles: `GA.setSfx(on)` / `GA.setMusic(on)` from the game's sound / music buttons; after `GA.init` sync once with the game's stored `sf_snd` / `sf_mus` values.
- Until decoding finishes (first gesture + a few ms) or if it fails, `GA.has()` is false and the synth keeps playing, so nothing goes silent.
