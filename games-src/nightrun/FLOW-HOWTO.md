# Google Flow: step by step, with the frames we already have

What you do in Flow is generate short clips from our frames. What we do afterwards (extract frames, cut the background, build the strip, wire it
into the game) is on our side; you only upload, generate, download.

## One-time setup
1. Open Google Flow (labs.google/flow), start a New project, name it "Nightrun frames".
2. Pick the mode "Frames to Video" (the dropdown next to Text to Video). Choose the highest quality model offered; first-and-last-frame needs a
   model that supports it (Veo 3.1 does; check the model list in settings).
3. Set the aspect ratio 1:1 if offered (our frames are square on white), clip length the shortest available (about 8 s is the usual minimum).

## For every pair of frames (example: Kai idle 1 -> 2)
1. Click the + in the prompt box, upload kai-idle-1.png as the START frame.
2. Click the second + , upload kai-idle-2.png as the END frame.
3. Paste this prompt (same every time):
   > Two key poses of the same character are given as the first and last frame. Create the smooth in-between motion only, slow and gentle: 3 intermediate poses, same character design, same colours, same outline weight, same camera, same scale, same plain white background. No new details, no style change, no zoom, no pan, no cut, no text.
4. Generate. Pick the take where the face, jacket and backpack keep the same design for the whole clip. Discard takes where the character changes.
5. Download the video (original quality, not a GIF) and name it kai-idle-1-2.mp4. Repeat for 2-3, 3-4 and 4-1.
6. Send the four videos to the repo owner session (or drop them in games-src/nightrun/incoming/flow/).

## What happens next (not your job)
- Frames are cut from the video at 12-16 fps (ffmpeg), the white is cut out (cutout.py), every frame is aligned to the foot anchor, and the strip
  is rebuilt as 4 originals + the new in-betweens, in order. Originals stay pixel-identical.
- The game plays it, and we send you before/after shots.

## Which actions to do first, and the limit of this method
- The existing Kai idle frames are almost the same pose (slight breathing). In-betweening nearly identical poses adds little. So:
  - For IDLE: ask for a bigger gentle motion in one clip instead (text prompt with kai-idle-1.png as the start frame): "same character, slow breathing idle, shoulders rise and fall, weapon hand relaxed, jacket and satchel settle slightly, seamless loop, same plain white background". Keep the first frame equal to the original.
  - For RUN, HIT, MELEE, DASH, JUMP and the boss ATTACK: poses differ a lot, so pair in-betweening works best. Start with run (6 frames -> 6 pairs).
- Flow cannot output transparent video; that is why every input has a plain white background.
- Flow does not export single frames; we extract them from the downloaded video.

## Pass checks (we run them)
First/last frames identical to the originals; neighbouring-frame silhouette overlap >= 85%; colour drift < 6 per channel; foot line within 2 px; no fringe.
