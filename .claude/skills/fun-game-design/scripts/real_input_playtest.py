"""Template: real-input playtest for a single-file HTML canvas game.
Usage: python real_input_playtest.py /path/to/game.html
Adapt the marked steps. Drive the game ONLY through real mouse/touch/keyboard input.
"""
import asyncio, sys
from playwright.async_api import async_playwright

CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'  # adjust if needed

async def main(path):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME)
        pg = await b.new_page(viewport={'width': 390, 'height': 800}, device_scale_factor=2, has_touch=True)
        errors = []
        pg.on('pageerror', lambda e: errors.append(str(e)))
        await pg.goto('file://' + path); await pg.wait_for_timeout(800)
        await pg.screenshot(path='/tmp/pt_title.png')
        # 1) Enter the game the way a player does, e.g. await pg.click('#playB')
        # 2) Count taps needed before the player can act (dialogue walls):
        taps = 0
        #    while await pg.evaluate("()=>dlgOn") and taps < 40:
        #        await pg.mouse.click(195, 720); taps += 1; await pg.wait_for_timeout(150)
        # 3) Map logical canvas coords to screen coords for scaled canvases:
        #    t = await pg.evaluate("()=>({S,OX,OY})"); scr = lambda x,y:(t['OX']+x*t['S'], t['OY']+y*t['S'])
        # 4) Play each scene with real drags/taps, reading state only to decide:
        #    await pg.mouse.move(*scr(x0,y0)); await pg.mouse.down()
        #    await pg.mouse.move(*scr(x1,y1), steps=10); await pg.mouse.up()
        # 5) Assert completion and take a screenshot per scene.
        print({'taps_before_control': taps, 'errors': errors})
        await b.close()

if __name__ == '__main__':
    asyncio.run(main(sys.argv[1]))
