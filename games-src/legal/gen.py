# Writes games/credits.html, games/privacy.html and games/terms.html.   python3 games-src/legal/gen.py
# Licence texts are read from the files that ship with the libraries in this repo, so they stay exact.
# Keep the facts here in step with the code: what each page stores, and which outside services see what.
import os, html, datetime
D = os.path.dirname(os.path.abspath(__file__))
SP = os.path.abspath(os.path.join(D, '..'))
OUT = os.path.abspath(os.path.join(SP, '..', 'games'))
def rd(p): return open(os.path.join(SP, p), encoding='utf-8').read().strip()
UPDATED = '4 October 2026'
PIXI = rd('kaiten/vendor/PIXI-LICENSE.txt')
TRYSTERO = 'The MIT License\n\n' + rd('net/TRYSTERO-LICENSE.txt')
MIT_BODY = PIXI.split('\n\n', 2)[2]
THREE = 'The MIT License\n\nCopyright © 2010-2023 three.js authors\n\n' + MIT_BODY
NOBLE = 'The MIT License (MIT)\n\nCopyright (c) 2019 Paul Miller (https://paulmillr.com)\n\n' + MIT_BODY
ofl = rd('thornbound/kit/fonts/OFL-cinzel.txt')
OFL = ofl[ofl.index('-----------------------------------------------------------\nSIL OPEN FONT LICENSE'):].strip()
E = html.escape

HEAD = '''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{title} · Game Night Shelf</title><meta name="description" content="{desc}">
<link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="icons/icon-192.png"><meta name="theme-color" content="#1d1411">
<style>
:root{{--bg:#1d1411;--card:#2b1d17;--ink:#f4ead8;--muted:#bca78c;--brass:#e0a948;--line:#4a3326;color-scheme:dark}}
@media (prefers-color-scheme:light){{:root{{--bg:#efe3cc;--card:#f8f0e0;--ink:#2a1a10;--muted:#6d5640;--brass:#8a5a0e;--line:#d2bb95;color-scheme:light}}}}
*{{box-sizing:border-box}}
body{{margin:0;overflow-wrap:anywhere;background:var(--bg);color:var(--ink);font:17px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;padding:0 16px calc(32px + env(safe-area-inset-bottom,0px))}}
main{{max-width:46em;margin:0 auto}}
nav.top{{display:flex;flex-wrap:wrap;gap:4px 14px;max-width:46em;margin:0 auto;padding:calc(12px + env(safe-area-inset-top,0px)) 0 4px}}
nav.top a,footer a{{color:var(--brass);font-weight:600;display:inline-flex;align-items:center;min-height:44px}}
nav.top a[aria-current]{{color:var(--ink);text-decoration:none}}
h1{{font-size:1.9rem;line-height:1.15;margin:12px 0 4px}}
h2{{font-size:1.25rem;margin:28px 0 6px}}
h3{{font-size:1.02rem;margin:18px 0 4px}}
p,li{{max-width:42em}}
.upd{{color:var(--muted);margin-top:0}}
.box{{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 16px;margin:10px 0}}
table{{border-collapse:collapse;width:100%;font-size:.92rem;margin:8px 0}}
th,td{{text-align:left;vertical-align:top;padding:6px 8px;border-bottom:1px solid var(--line)}}
.tw{{overflow-x:auto}}
details{{background:var(--card);border:1px solid var(--line);border-radius:10px;margin:8px 0}}
summary{{cursor:pointer;padding:10px 14px;min-height:44px;font-weight:600}}
pre{{white-space:pre-wrap;overflow-wrap:anywhere;font:13px/1.45 ui-monospace,Menlo,Consolas,monospace;margin:0;padding:0 14px 14px}}
footer{{max-width:46em;margin:36px auto 0;color:var(--muted);font-size:.9rem;border-top:1px solid var(--line);padding-top:8px}}
a{{color:var(--brass)}}
</style></head><body>
<nav class="top" aria-label="Shelf pages"><a href="./">← Shelf</a><a href="credits.html"{c}>Credits &amp; licences</a><a href="privacy.html"{p}>Privacy</a><a href="terms.html"{t}>Terms</a></nav>
<main>
'''
FOOT = '''</main>
<footer>&copy; 2026 Am015-dev. All rights reserved. Original games inspired by published board games; not affiliated with their designers or publishers. Questions: <a href="suggest.html">the suggestion box</a>.</footer>
<script>if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol))navigator.serviceWorker.register('sw.js',{scope:'./'}).catch(()=>{});</script>
</body></html>
'''
def page(name, title, desc, body):
    cur = {'c': '', 'p': '', 't': ''}; cur[name[0]] = ' aria-current="page"'
    s = HEAD.format(title=E(title), desc=E(desc), **cur) + body + FOOT
    open(os.path.join(OUT, name + '.html'), 'w', encoding='utf-8').write(s)
    print(name + '.html', len(s.encode('utf-8')), 'bytes')

def lic(summary, text): return '<details><summary>%s</summary><pre>%s</pre></details>\n' % (summary, E(text))

GOOGLE_FONTS = ['Alegreya', 'Alegreya SC', 'Alegreya Sans', 'Bangers', 'Chakra Petch', 'Chivo', 'Chivo Mono', 'Cinzel', 'Cinzel Decorative',
                'Cormorant Garamond', 'Exo 2', 'IM Fell English', 'IM Fell English SC', 'Lilita One', 'Marcellus SC', 'Nunito', 'Orbitron',
                'Rammetto One', 'Reem Kufi', 'Share Tech Mono']
CC0_AUTHORS = ['Kenney (kenney.nl): Casino Audio, Digital Audio, Impact Sounds, Interface Sounds, Music Jingles, RPG Audio, Sci-fi Sounds and UI Audio packs',
               'rubberduck (OpenGameArt, "100 CC0 SFX" collections)', 'RandomMind', 'Joth', 'KarateStudios', 'iamoneabe', 'vitalezzz', 'Eldritch Grim',
               'AntumDeluge', 'StarNinjas', 'Bashar3A', 'stereoscopic', 'Tozan', 'Spring Spring', 'Indieteur', 'cynicmusic', 'yd', 'Pro Sensory',
               'LEGIT Audio', 'isaiah658']

credits = '''<h1>Credits &amp; licences</h1>
<p class="upd">Last updated {u}</p>
<p>The games, their rules engines, computer players, pictures, names and texts on this shelf were made for the Game Night Shelf. They use the open-source libraries, fonts and sounds below. Their licences ask us to show these notices, and we are glad to thank the people behind them.</p>

<h2>Software libraries</h2>
<div class="tw"><table><thead><tr><th>Library</th><th>Used for</th><th>Licence</th></tr></thead><tbody>
<tr><td>three.js (three.js authors)</td><td>The 3D tables in the 3D games</td><td>MIT</td></tr>
<tr><td>PixiJS (Mathew Groves, Chad Engler and contributors)</td><td>The painted 2D tables (for example Kaiten Kitchen)</td><td>MIT</td></tr>
<tr><td>Trystero (Dan Motzenbecker)</td><td>Online play: browsers find each other and talk directly</td><td>MIT</td></tr>
<tr><td>noble-secp256k1 (Paul Miller), bundled inside Trystero</td><td>Signing the meeting messages online play uses</td><td>MIT</td></tr>
</tbody></table></div>
{three}{pixi}{tryst}{noble}

<h2>Fonts</h2>
<p>Every font on the shelf is licensed under the <b>SIL Open Font License 1.1</b>. Fonts loaded from Google Fonts: {gf}. The copyright holders of each font are named in its font files and on its Google Fonts page.</p>
<p>Fonts built into a game file: <b>Cinzel</b> (Natanael Gama) and <b>EB Garamond</b> (Georg Duffner, Octavio Pardo), in The Thornbound Throne.</p>
{ofl}

<h2>Sounds and music</h2>
<h3>Attribution required (CC BY 4.0)</h3>
<div class="box"><p>"Morning" Kevin MacLeod (incompetech.com)<br>Licensed under Creative Commons: By Attribution 4.0<br><a href="https://creativecommons.org/licenses/by/4.0/">https://creativecommons.org/licenses/by/4.0/</a><br>Used as the main music in Sunglaze; cut to a loop and loudness-normalised.</p></div>
<h3>Public domain (CC0 1.0): no attribution required, thank you anyway</h3>
<p>Every other sound effect and music track is released under <a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0 1.0</a>. We trimmed, layered and normalised them. Made by:</p>
<ul>{cc0}</ul>

<h2>Pictures</h2>
<p>All board, card, token and cover art is original to the shelf: drawn in code, or painted by generators in the source repository. No pictures from any published game are used.</p>

<h2>The games themselves</h2>
<p>The games are original adaptations inspired by published board games: the names, texts and pictures are our own, and the shelf is not affiliated with, endorsed by or connected to the designers or publishers of those games. The shelf's own code and art are &copy; 2026 Am015-dev, all rights reserved; see the LICENSE file in the source repository.</p>
'''.format(u=UPDATED, three=lic('three.js licence (MIT)', THREE), pixi=lic('PixiJS licence (MIT)', PIXI), tryst=lic('Trystero licence (MIT)', TRYSTERO),
           noble=lic('noble-secp256k1 licence (MIT)', NOBLE), gf=', '.join(GOOGLE_FONTS), ofl=lic('SIL Open Font License 1.1 (full text)', OFL),
           cc0=''.join('<li>%s</li>' % E(a) for a in CC0_AUTHORS))

privacy = '''<h1>Privacy</h1>
<p class="upd">Last updated {u}</p>
<div class="box"><p><b>In short:</b> no account, no ads, no tracking, no analytics and no cookies of our own. Your saves, settings and statistics stay in your browser on this device. A few outside services see your IP address when you use certain features; they are all listed below.</p></div>

<h2>Who runs the shelf</h2>
<p>The Game Night Shelf is a free, non-commercial hobby project by Am015-dev, published on GitHub Pages. You can reach the maker through <a href="suggest.html">the suggestion box</a>.</p>

<h2>What is stored on your device</h2>
<p>The games use your browser's local storage and, if you choose offline play, its cache. Nothing of this is sent to us.</p>
<div class="tw"><table><thead><tr><th>What</th><th>Why</th></tr></thead><tbody>
<tr><td>Saved games, one per game (for example <code>hb_save1</code>)</td><td>So you can continue where you stopped</td></tr>
<tr><td>Game settings (sound, speed, guide level, graphics)</td><td>So each game remembers your choices</td></tr>
<tr><td>Shared settings <code>gns-prefs</code>: volumes, animation and computer speed, text size, colour-blind help, left-handed layout, reduce motion, vibration</td><td>Set once, used by every game</td></tr>
<tr><td>Results, statistics and achievements: <code>gns-results</code>, <code>gns-stats</code>, <code>gns-ach</code>, <code>gns-achdef</code>, <code>gns-saves</code></td><td>The "Stats &amp; achievements" panel and the Continue row on the shelf</td></tr>
<tr><td>How often you opened each game and your shelf trophies (<code>room_plays</code>, <code>room_trophies</code>), the last game you played, list or room view</td><td>The living-room shelf</td></tr>
<tr><td>Your online name (<code>gns-name</code>) and a random player code (<code>gns-uid</code>)</td><td>Online play: lets a game recognise you when you rejoin a room</td></tr>
<tr><td>Copies of the shelf and of the games you download (browser cache, through a service worker)</td><td>Playing without internet, and faster start-up</td></tr>
</tbody></table></div>
<p>To delete all of it, clear this site's data in your browser settings. The <a href="sync.html">Saves &amp; Offline</a> page shows what is stored, lets you remove downloaded games and lets you move your saves to another device yourself.</p>

<h2>Outside services and what they see</h2>
<h3>GitHub Pages (hosting)</h3>
<p>The pages are served by GitHub. Like any web server, GitHub receives your IP address, browser type and the pages you request, and may keep these in its server logs. See GitHub's privacy statement.</p>
<h3>Google Fonts</h3>
<p>Most pages load their lettering from Google Fonts (<code>fonts.googleapis.com</code> and <code>fonts.gstatic.com</code>). Your browser then sends Google your IP address, browser type and the address of the page. If the fonts cannot load (for example offline), the pages use your device's own fonts.</p>
<h3>Online play and save transfer</h3>
<p>Online games and the device-to-device save transfer connect browsers directly (WebRTC). To find each other:</p>
<ul>
<li><b>Public Nostr relays</b>, run by third parties, pass short connection messages between the players' browsers. They see your IP address and an encrypted connection offer with a scrambled room tag. They do not see your game, your moves or your name.</li>
<li><b>STUN servers</b> from Google (<code>stun.l.google.com</code>) and Cloudflare (<code>stun.cloudflare.com</code>) tell your browser its public address. They see your IP address.</li>
<li><b>The other players</b> in your room see your online name, and their browsers connect to yours directly, so they can learn your IP address, as with any direct connection.</li>
</ul>
<p>Nothing is sent to these services unless you host or join an online game, or use the save transfer.</p>
<h3>Suggestion box</h3>
<p>The <a href="suggest.html">suggestion box</a> sends what you write (your message, and your name and email only if you give them) through the form service Web3Forms (<code>api.web3forms.com</code>), which emails it to the maker. Web3Forms receives your IP address and the message. Your email is used only to reply to you. Ask through the suggestion box and your message will be deleted.</p>
<h3>Ko-fi</h3>
<p>The "Support on Ko-fi" link opens Ko-fi's own site only when you tap it. Nothing is shared before that.</p>

<h2>Children</h2>
<p>The shelf asks nobody for personal details, and nothing about players is collected by us, so it is suitable for families. Online play shows the name a player types; younger players should use a nickname.</p>

<h2>Changes</h2>
<p>If what is stored or shared changes, this page will say so, with a new date at the top.</p>
'''.format(u=UPDATED)

terms = '''<h1>Terms of use</h1>
<p class="upd">Last updated {u}</p>
<div class="box"><p><b>In short:</b> play for free, for fun, and be kind online. The games are offered as they are, without any promise.</p></div>
<h2>Using the games</h2>
<ul>
<li>The games are free to play in your browser, for your own private, non-commercial use. There is no account, no purchase and no subscription.</li>
<li>Please don't copy, sell or republish the games, their code, pictures or texts. They are &copy; 2026 Am015-dev, all rights reserved, except for the open-source parts listed on <a href="credits.html">Credits &amp; licences</a>, which keep their own licences.</li>
<li>The games are original adaptations inspired by published board games. They are not affiliated with, endorsed by or connected to those games' designers or publishers. If you hold rights in one of those games and have a concern, please write through <a href="suggest.html">the suggestion box</a> and it will be looked at promptly.</li>
</ul>
<h2>Playing online</h2>
<ul>
<li>Online games connect you directly to the people you invite. Only share invite codes and links with people you want to play with.</li>
<li>Choose an online name that is not offensive and does not pretend to be someone else.</li>
<li>There is no moderation or chat history kept by us, because nothing passes through our own servers. Leave a room if someone behaves badly.</li>
</ul>
<h2>No warranty</h2>
<p>The shelf is a hobby project provided "as is" and "as available". Games can have bugs, saves can be lost (for example when the browser clears its storage), and online play depends on outside services that can be down. As far as the law allows, the maker is not liable for any loss or damage from using the shelf.</p>
<h2>Your data</h2>
<p>See the <a href="privacy.html">privacy page</a> for what is stored on your device and which outside services see what.</p>
<h2>Changes</h2>
<p>These terms may change as the shelf grows; the date at the top shows the latest version.</p>
'''.format(u=UPDATED)

page('credits', 'Credits & licences', 'Open-source libraries, fonts and sounds used by the Game Night Shelf, with their licences.', credits)
page('privacy', 'Privacy', 'What the Game Night Shelf stores on your device and which outside services see what.', privacy)
page('terms', 'Terms of use', 'Plain-language terms for playing the Game Night Shelf games.', terms)
