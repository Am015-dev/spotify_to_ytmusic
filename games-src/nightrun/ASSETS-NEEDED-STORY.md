# Assets needed: the campaign story (parts/storydata.js, parts/saga.js)

No new art was made (ASSET-POLICY.md). Until a file exists, the story card shows a flat dashed box labelled with the file id.
Drop the file into `assets-inbox/` (ingest-assets.py); `ART.isReal` picks it up, nothing else to wire.

| id | size | frames | facing | used in | Flow prompt |
|---|---|---|---|---|---|
| char-halde.webp | 256x256 | 1 | 3/4 left, head and shoulders | story cards (speaker DIREKTORIN HALDE, chair of Kronos Bank, the antagonist) | Portrait of a cold corporate bank chairwoman in her fifties, silver undercut, high-collar black suit with a thin red neon trim, Frankfurt 2099 cyberpunk, painted comic style, dark violet background, rim light magenta, matches the existing Nightrun cast portraits |

Reused stills (no new file needed):

- LUMEN (the mechanic) speaks with `char-mechanic.webp`. The older `char-lumen.webp` (the city AI of the first tale draft) is not used while RET.story is on.
- WREN uses `char-ally.webp`, VEX `char-rival.webp`, ODA `char-dispatch.webp`, the courier `char-courier.webp`.
- Bosses speak with their boss stills `boss-<name>.webp` (all ten exist).
- Scene backgrounds are the district backdrops `bg-<district>(-phone).webp`.
