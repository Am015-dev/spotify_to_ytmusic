# Sound settings file (Lab > SOUND > EXPORT)

The Lab SOUND page saves every sound, jingle, music effect, the effects volume and the song picks in this browser (localStorage `nr_snd`).
**EXPORT** downloads `nightrun-sound-settings.json` and copies the same text to the clipboard ("Copied" appears under the buttons).
**IMPORT** takes pasted text (the box) or **IMPORT FILE**; the text is checked first and applied at once. A bad file changes nothing and says why.

```json
{
 "format": "nightrun-sound-settings",
 "version": 1,
 "on":    { "hurt": true, "s_perfect": false, "m_duck": false },
 "vol":   1,
 "off":   false,
 "music": { "title": "boss2", "street": "stage3", "d1": "endless2", "b0": "boss3" }
}
```

- `on`: one true/false per row of the SOUND page (ids = first column of `SNDT` in `parts/audio/puremusic.js`; `s_*` jingles, `m_*` music effects, `f_*` on foot, `heart`... power-up sounds). true = it plays.
- `vol`: effects volume, 0 to 2. `off`: true = all effects off.
- `music`: song per place. Places: `title` (title screen and menus), `street` (on-foot stage), `d0`, `d1`, ... (flight district, in the order of `DISTRICTS`; the game normally rotates a pool of songs there), `b0 b1 b2 b3 b6` (boss number). Value = a song name from `music/tracks.json` (`menu`, `stage1`, `d1a`, `boss-d1`, ...). A missing place plays the game's own song.
- `?musiclab=0` ignores the picks (old behaviour). `?pure=0` ignores the whole sound gate.

To make a settings file the new default for everyone: copy its `on` map into the fourth column of `SNDT` and its `music` map into a default table in `SND.cfg.music`; `qa/soundlab-test.js` shows the round trip.
