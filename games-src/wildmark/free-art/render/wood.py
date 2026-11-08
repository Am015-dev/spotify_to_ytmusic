"""Procedural walnut plank table (numpy + PIL). Low contrast so the board reads on top."""
import numpy as np
from PIL import Image, ImageFilter

def noise(w, h, scale, rng):
    s = rng.random((h // scale + 2, w // scale + 2))
    return np.asarray(Image.fromarray((s * 255).astype('uint8')).resize((w, h), Image.BICUBIC)).astype(float) / 255

def wood(W=1920, H=1080, seed=4):
    rng = np.random.default_rng(seed)
    out = np.zeros((H, W, 3))
    plank_h = 150
    base = np.array([74, 50, 34], float)
    y = 0; k = 0
    while y < H:
        ph = min(plank_h + int(rng.integers(-20, 20)), H - y)
        w = W
        # stretched noise = long grain along x
        g = np.zeros((ph, w))
        for sc, amp in ((4, .5), (16, .3), (64, .2)):
            n = noise(w // 24 + 8, ph // 1 + 8, 1, rng) if False else None
            small = rng.random((ph // sc + 2, w // (sc * 14) + 2))
            g += amp * np.asarray(Image.fromarray((small * 255).astype('uint8')).resize((w, ph), Image.BICUBIC)).astype(float) / 255
        # rings: sinusoid warped by low frequency noise
        warp = np.asarray(Image.fromarray((rng.random((ph // 40 + 2, w // 300 + 2)) * 255).astype('uint8')).resize((w, ph), Image.BICUBIC)).astype(float) / 255
        yy = np.arange(ph)[:, None] + warp * 90
        rings = (np.sin(yy * (0.22 + 0.05 * rng.random())) * .5 + .5)
        tone = .55 * g + .25 * rings + .20 * rng.random()
        tone = (tone - tone.mean()) / (tone.std() + 1e-6)
        shade = 1 + .07 * tone + (rng.random() - .5) * .10          # plank-to-plank variation
        plank = base[None, None, :] * shade[:, :, None]
        plank[:, :, 0] *= 1.02
        out[y:y + ph] = plank
        out[y:y + 2] *= .72                                          # gap between planks
        out[y + 2:y + 4] *= .9
        # butt joint
        jx = int(rng.integers(300, W - 300)); out[y:y + ph, jx:jx + 2] *= .75
        y += ph; k += 1
    im = Image.fromarray(np.clip(out, 0, 255).astype('uint8'))
    # soft vignette + faint warm light from upper left
    yy, xx = np.mgrid[0:H, 0:W]
    v = 1 - .22 * (((xx - W * .45) / W) ** 2 + ((yy - H * .45) / H) ** 2) * 2.2
    a = np.asarray(im).astype(float) * v[:, :, None]
    return Image.fromarray(np.clip(a, 0, 255).astype('uint8'))

if __name__ == '__main__':
    wood().save('out/table.png')
