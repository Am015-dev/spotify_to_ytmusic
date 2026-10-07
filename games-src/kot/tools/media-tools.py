#!/usr/bin/env python3
"""Crown City Smash media helper (no AI).
  media-tools.py grid  cast-grid.png          split a 3x3 character sheet into 9 square 512px webp portraits
  media-tools.py video clip.mp4 crown-ch4-boss  compress to H.264 720x1280, <=1.5 MB, no audio, into media/
  media-tools.py manifest                      rewrite media.json from the files that exist
Outputs go to games/crown-city-smash/ (portraits) and games/crown-city-smash/media/ (clips)."""
import json, subprocess, sys, shutil
from pathlib import Path
from PIL import Image
import numpy as np

REPO = Path(__file__).resolve().parents[3]
OUT = REPO / "games" / "crown-city-smash"
MEDIA = OUT / "media"
CAST = ["dot", "voltusk", "squidrik", "magmaw", "shroomhulk", "boltbox", "glacyx", "cortexa", "bramblebat"]
CLIPS = [f"crown-ch{i}-intro" for i in range(1, 11)] + ["crown-ch4-boss", "crown-ch7-boss", "crown-ch10-boss", "crown-win"]

def bands(mask, n):
    """n longest runs of True along a 1-D mask (after closing tiny holes) -> [(start, end)]"""
    m = mask.copy(); k = max(2, len(m) // 200)
    runs, s = [], None
    for i, v in enumerate(list(m) + [False]):
        if v and s is None: s = i
        if not v and s is not None: runs.append((s, i)); s = None
    merged = []
    for r in runs:
        if merged and r[0] - merged[-1][1] < k: merged[-1] = (merged[-1][0], r[1])
        else: merged.append(r)
    merged = sorted(merged, key=lambda r: r[1] - r[0], reverse=True)[:n]
    return sorted(merged) if len(merged) == n else None

def split_grid(path):
    im = Image.open(path).convert("RGB"); a = np.asarray(im).astype(int); h, w = a.shape[:2]
    edge = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]]); bg = np.median(edge, axis=0)
    diff = np.abs(a - bg).sum(axis=2) > 60
    cols = diff.sum(axis=0) > h * 0.01; rows = diff.sum(axis=1) > w * 0.01
    bc, br = bands(cols, 3), bands(rows, 3)
    if not bc or not br:
        print("could not find gutters; using equal thirds")
        bc = [(i * w // 3, (i + 1) * w // 3) for i in range(3)]; br = [(i * h // 3, (i + 1) * h // 3) for i in range(3)]
    else:
        print("gutters found: cols", bc, "rows", br)
    OUT.mkdir(parents=True, exist_ok=True); made = []
    for r in range(3):
        for c in range(3):
            x0, x1 = bc[c]; y0, y1 = br[r]
            cell = im.crop((x0, y0, x1, y1)); ca = np.asarray(cell).astype(int)
            m = np.abs(ca - bg).sum(axis=2) > 60; ys, xs = np.where(m)
            if len(xs): cell = cell.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
            s = int(max(cell.size) * 1.08); sq = Image.new("RGB", (s, s), tuple(int(v) for v in bg))
            sq.paste(cell, ((s - cell.width) // 2, (s - cell.height) // 2))
            name = f"camp-{CAST[r * 3 + c]}.webp"
            sq.resize((512, 512), Image.LANCZOS).save(OUT / name, "WEBP", quality=82, method=6); made.append(name)
    print("wrote", ", ".join(made)); write_manifest()

def compress(src, key):
    if not shutil.which("ffmpeg"): sys.exit("ffmpeg is missing; install it or send a smaller MP4 (720x1280, under 1.5 MB)")
    MEDIA.mkdir(parents=True, exist_ok=True); dst = MEDIA / (key + ".mp4")
    vf = "scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2:color=0x0b0618,setsar=1"
    for crf in (26, 28, 30, 32, 34, 36):
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-an", "-vf", vf, "-c:v", "libx264", "-profile:v", "main",
                        "-pix_fmt", "yuv420p", "-crf", str(crf), "-preset", "slow", "-movflags", "+faststart", str(dst)], check=True)
        kb = dst.stat().st_size / 1024; print(f"crf {crf}: {kb:.0f} KB")
        if kb <= 1536: break
    else: print("WARNING: still over 1.5 MB at the highest compression")
    write_manifest(); print("wrote", dst)

def write_manifest():
    MEDIA.mkdir(parents=True, exist_ok=True)
    clips = [k for k in CLIPS if (MEDIA / (k + ".mp4")).exists()]
    pics = [f"camp-{n}.webp" for n in CAST if (OUT / f"camp-{n}.webp").exists()]
    (MEDIA / "media.json").write_text(json.dumps({"clips": clips, "portraits": pics}) + "\n")
    print("media.json:", len(clips), "clips,", len(pics), "portraits")

if __name__ == "__main__":
    a = sys.argv[1:]
    if a[:1] == ["grid"] and len(a) == 2: split_grid(a[1])
    elif a[:1] == ["video"] and len(a) == 3: compress(a[1], a[2])
    elif a[:1] == ["manifest"]: write_manifest()
    else: sys.exit(__doc__)
