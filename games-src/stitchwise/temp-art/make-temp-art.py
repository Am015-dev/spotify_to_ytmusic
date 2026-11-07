#!/usr/bin/env python3
"""Temporary art for Stitchwise, drawn by code (original, no third-party pictures, nothing copied). Writes <stem>.webp for the slots in ../assets.json.
The owner's Flow pictures replace any of them by dropping a file with the same stem (no code change).
    python3 games-src/stitchwise/temp-art/make-temp-art.py            # writes into games-src/stitchwise/temp-art/media/
Deploy copy step (orchestrator): copy temp-art/media/*.webp to games/stitchwise/media/ (skip any stem the owner already delivered)."""
import pathlib, math, random
from PIL import Image, ImageDraw, ImageFilter
D = pathlib.Path(__file__).resolve().parent; OUT = D / "media"; OUT.mkdir(exist_ok=True)
PAL = [((192, 82, 122), (250, 232, 238)), ((224, 168, 46), (255, 244, 200)), ((42, 138, 128), (225, 245, 240)), ((74, 134, 184), (232, 242, 250)), ((200, 85, 61), (252, 232, 220)), ((107, 142, 78), (236, 245, 226)),
       ((138, 91, 166), (240, 230, 248)), ((217, 138, 61), (255, 236, 210)), ((63, 111, 160), (225, 235, 248)), ((176, 72, 106), (250, 225, 232)), ((90, 154, 106), (230, 245, 232))]
def save(im, stem, q=80): im.save(OUT / (stem + ".webp"), "WEBP", quality=q, method=6)
def fabric(i, S=256):
    a, b = PAL[i % len(PAL)]; kind = i % 8; im = Image.new("RGB", (S, S), a); d = ImageDraw.Draw(im); n = 8
    if kind == 0:   # gingham
        for k in range(0, S, S // n * 2): d.rectangle([k, 0, k + S // n, S], fill=tuple((x + y) // 2 for x, y in zip(a, b)))
        for k in range(0, S, S // n * 2): d.rectangle([0, k, S, k + S // n], fill=tuple((x + y) // 2 for x, y in zip(a, b)))
    elif kind == 1: # polka dots
        for y in range(16, S, 48):
            for x in range(16 + (y // 48 % 2) * 24, S, 48): d.ellipse([x - 8, y - 8, x + 8, y + 8], fill=b)
    elif kind == 2: # stripes
        for k in range(0, S, 32): d.rectangle([k, 0, k + 12, S], fill=b)
    elif kind == 3: # diamonds
        for y in range(0, S, 64):
            for x in range(0, S, 64): d.polygon([(x + 32, y + 8), (x + 56, y + 32), (x + 32, y + 56), (x + 8, y + 32)], outline=b, width=4)
    elif kind == 4: # cross stitch
        for y in range(8, S, 32):
            for x in range(8, S, 32): d.line([x, y, x + 14, y + 14], fill=b, width=4); d.line([x + 14, y, x, y + 14], fill=b, width=4)
    elif kind == 5: # waves
        for y in range(16, S, 40): d.line([(x, y + 8 * math.sin(x / 14)) for x in range(0, S + 1, 4)], fill=b, width=5)
    elif kind == 6: # triangles
        for y in range(0, S, 48):
            for x in range(0, S, 48): d.polygon([(x, y + 40), (x + 20, y + 4), (x + 40, y + 40)], fill=b)
    else:           # plaid
        for k in range(24, S, 64): d.rectangle([k, 0, k + 14, S], fill=b); d.rectangle([0, k, S, k + 14], fill=b)
        for k in range(24, S, 64): d.line([k + 7, 0, k + 7, S], fill=a, width=2)
    rnd = random.Random(i)
    for _ in range(700): x, y = rnd.randrange(S), rnd.randrange(S); d.point((x, y), fill=tuple(max(0, c - 14) for c in im.getpixel((x, y))))   # woven grain
    return im
def rgba(S): return Image.new("RGBA", (S, S), (0, 0, 0, 0))
def circle_token(col, S=128):
    im = rgba(S); d = ImageDraw.Draw(im); d.ellipse([6, 6, S - 6, S - 6], fill=col, outline=(255, 255, 255, 255), width=5)
    for r in range(18, 56, 9): d.ellipse([S / 2 - r, S / 2 - r, S / 2 + r, S / 2 + r], outline=(255, 255, 255, 190), width=3)
    return im
def button(S=128):
    im = rgba(S); d = ImageDraw.Draw(im); d.ellipse([6, 6, S - 6, S - 6], fill=(224, 168, 46, 255), outline=(122, 84, 16, 255), width=6); d.ellipse([24, 24, S - 24, S - 24], outline=(122, 84, 16, 255), width=4)
    for dx, dy in [(-12, -12), (12, -12), (-12, 12), (12, 12)]: d.ellipse([S / 2 + dx - 5, S / 2 + dy - 5, S / 2 + dx + 5, S / 2 + dy + 5], fill=(90, 58, 8, 255))
    return im
def hourglass(S=128):
    im = rgba(S); d = ImageDraw.Draw(im); c = (58, 42, 24, 255)
    d.rectangle([22, 10, 106, 20], fill=c); d.rectangle([22, 108, 106, 118], fill=c); d.polygon([(30, 20), (98, 20), (68, 64), (98, 108), (30, 108), (60, 64)], outline=c, width=6)
    d.polygon([(46, 30), (82, 30), (64, 56)], fill=(200, 85, 61, 255)); d.polygon([(44, 100), (84, 100), (64, 78)], fill=(200, 85, 61, 255)); return im
def leather(S=256):
    im = Image.new("RGBA", (S, S), (138, 90, 58, 255)); d = ImageDraw.Draw(im); rnd = random.Random(5)
    for _ in range(1500): x, y = rnd.randrange(S), rnd.randrange(S); d.point((x, y), fill=(112, 70, 44, 255))
    d.rectangle([22, 22, S - 22, S - 22], outline=(240, 217, 176, 255), width=5)
    for k in range(22, S - 22, 20): d.line([k, 14, k + 10, 14], fill=(240, 217, 176, 255), width=4); d.line([k, S - 14, k + 10, S - 14], fill=(240, 217, 176, 255), width=4)
    return im
def rosette(S=256, gold=(224, 168, 46, 255)):
    im = rgba(S); d = ImageDraw.Draw(im); c = S // 2
    d.polygon([(c - 50, c + 20), (c - 20, S - 6), (c, c + 70), (c + 20, S - 6), (c + 50, c + 20)], fill=(200, 85, 61, 255))
    for k in range(16): a = k * math.pi / 8; d.ellipse([c + 78 * math.cos(a) - 26, c - 30 + 78 * math.sin(a) - 26, c + 78 * math.cos(a) + 26, c - 30 + 78 * math.sin(a) + 26], fill=gold, outline=(122, 84, 16, 255), width=3)
    d.ellipse([c - 56, c - 86, c + 56, c + 26], fill=(255, 244, 200, 255), outline=(122, 84, 16, 255), width=4); d.ellipse([c - 26, c - 56, c + 26, c - 4], fill=gold); return im
def torn(S=256):
    im = rgba(S); d = ImageDraw.Draw(im); d.rectangle([8, 8, S - 8, S - 8], fill=(150, 138, 120, 255)); rnd = random.Random(9); pts = []
    for k in range(18): a = k * math.pi / 9; r = 56 + rnd.randrange(30); pts.append((S / 2 + r * math.cos(a), S / 2 + r * math.sin(a)))
    d.polygon(pts, fill=(36, 30, 24, 255)); d.rectangle([8, 8, S - 8, S - 8], outline=(70, 60, 48, 255), width=5); return im
def sparkle(S=256):
    im = rgba(S); d = ImageDraw.Draw(im); c = S // 2; d.polygon([(c, 10), (c + 22, c - 22), (S - 10, c), (c + 22, c + 22), (c, S - 10), (c - 22, c + 22), (10, c), (c - 22, c - 22)], fill=(255, 226, 120, 255), outline=(224, 168, 46, 255), width=5); return im
def stitch(S=256):
    im = rgba(S); d = ImageDraw.Draw(im)
    for k in range(6): x = 24 + k * 36; d.line([x, 150 - 24 * math.sin(k / 1.4), x + 22, 140 - 24 * math.sin((k + .6) / 1.4)], fill=(250, 240, 220, 255), width=9)
    d.line([200, 120, 236, 70], fill=(230, 230, 230, 255), width=5); return im
def card(w=400, h=320):
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im); d.rounded_rectangle([6, 6, w - 6, h - 6], 24, fill=(255, 250, 236, 255), outline=(205, 185, 143, 255), width=6)
    for k in range(20, w - 20, 22): d.line([k, 20, k + 11, 20], fill=(205, 185, 143, 255), width=4); d.line([k, h - 20, k + 11, h - 20], fill=(205, 185, 143, 255), width=4)
    return im
def frame(w, h, wood=(122, 90, 58), inner=(241, 229, 200), grid=0):
    im = Image.new("RGB", (w, h), wood); d = ImageDraw.Draw(im); m = int(min(w, h) * .03); d.rectangle([m, m, w - m, h - m], fill=inner)
    if grid:
        s = (w - 2 * m) / grid
        for k in range(1, grid): d.line([m + k * s, m, m + k * s, h - m], fill=(190, 172, 130), width=2); d.line([m, m + k * s, w - m, m + k * s], fill=(190, 172, 130), width=2)
    return im
def cloth(w, h, base, line):
    im = Image.new("RGB", (w, h), base); d = ImageDraw.Draw(im)
    for k in range(60, w, 120): d.line([k, 0, k, h], fill=line, width=2)
    for k in range(60, h, 120): d.line([0, k, w, k], fill=line, width=2)
    return im.filter(ImageFilter.GaussianBlur(0.6))
for i in range(33): save(fabric(i), "fabric-%02d" % (i + 1))
save(circle_token((42, 138, 128, 255)), "token-me", 85); save(circle_token((200, 85, 61, 255)), "token-opp", 85); save(button(), "icon-button", 85); save(hourglass(), "icon-hourglass", 85)
save(leather(), "patch-leather"); save(rosette(), "bonus-tile"); save(rosette(128), "icon-bonus", 85); save(torn(), "torn-square"); save(sparkle(), "fx-sparkle", 85); save(stitch(), "fx-stitch", 85); save(card(), "ui-offer-card", 85)
lea = leather(128).resize((128, 128)); save(lea, "icon-leather", 85)
save(frame(900, 900, grid=9), "quilt-frame", 82); save(frame(1600, 400, (150, 110, 70), (246, 232, 200), grid=0), "track-frame", 82)
save(cloth(1080, 1920, (36, 54, 78), (48, 68, 94)), "bg-table", 75); save(cloth(1080, 1920, (40, 60, 90), (56, 78, 108)), "bg-title", 75)
print(len(list(OUT.glob("*.webp"))), "files,", sum(f.stat().st_size for f in OUT.glob("*.webp")) // 1024, "KB")
