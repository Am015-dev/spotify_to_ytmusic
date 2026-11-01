# Sell path for Mainhattan Nightrun at $5 (W298, 31 Oct 2026)

## Verdict
A browser (HTML) project on itch.io cannot be sold. A **Downloadable** project can. So the $5 product is a download: Windows zip, Linux zip, and a universal zip that opens in any browser from the folder. An optional free/donation browser version may sit beside it.

## 1. What itch.io's own pages say (fetched 31 Oct 2026)
| Question | Quote | URL |
|---|---|---|
| Can an HTML5 project be sold? | "Currently all HTML5 games on itch.io are set up to only take payments as donations." | https://itch.io/docs/creators/html5 |
| How do I sell? | "it's possible to sell access to your game by setting its "Kind of Game" to "Downloadable"" | https://itch.io/docs/creators/html5 |
| Could HTML5 become paid? | "If you'd like itch.io to support purchasable HTML5 games then you should get in touch." (not available today) | https://itch.io/docs/creators/html5 |
| Browser limits | "The ZIP file should not contain more than 1,000 individual files after extraction." / "The size of all the extracted content should not be greater than 500MB." / "If your game does not meet the requirements please consider distributing your game as downloadable instead." | https://itch.io/docs/creators/html5 |
| What does a price mean? | "On itch.io, any price you set is the _minimum price_." and "any item that can accept money is automatically "pay what you want"." | https://itch.io/docs/creators/pricing |
| Do free downloads make owners? | "if someone downloads your project for free they do not become an owner!" | https://itch.io/docs/creators/pricing |
| Downloads are served as uploaded | "itch.io lets users download the files exactly as you uploaded them" ; "you can upload any kind of project for any kind of platform" | https://itch.io/docs/creators/faq |
| Does the itch desktop app launch web builds? | "The itch.io app supports installing and launching web games." It looks for `index.html` first, else a top-level `.html` file. | https://itch.io/docs/itch/integrating/platforms/web.html |

Note: the pricing and FAQ quotes above come from a page-to-text summary tool (it quotes, I could not see the raw page); the HTML5 page quotes were returned twice identically. Re-read the three URLs before upload if anything looks different.

**Not established (stopped at what the pages say):** the app page says it launches "web games", but no fetched page says whether it does so for a project whose Kind is Downloadable and whose upload is not ticked "played in the browser". Do not rely on it. That is why the Windows and Linux builds are real desktop apps and the universal zip has PLAY.html (needs no itch app). Page for the app's file detection that I could not fetch: https://itch.io/docs/itch/using/launch (404).
Also not fetched: itch.io's upload size limit for Downloadable files. The itch app quickstart page (https://itch.io/docs/itch/integrating/quickstart.html) says builds can be "up to 30GB" "(the web limit is 2GB)"; the zips below are 112 MB to about 280 MB.

## 2. Exact project settings (owner, in the itch.io dashboard)
1. Create new project. Title `Mainhattan Nightrun`.
2. **Kind of project: Downloadable.** (Not "HTML".)
3. **Pricing: Paid, minimum price $5.00.** Leave the "suggested" donation as you like.
4. Uploads (Upload files), three files, in this order. Do NOT tick "This file will be played in the browser" on any:
   - `Mainhattan-Nightrun-win32-x64.zip` -> tick Windows.
   - `Mainhattan-Nightrun-linux-x64.zip` -> tick Linux.
   - `nightrun-download.zip` -> tick all (Windows, Linux, macOS): works in any browser; README.txt inside says open PLAY.html. This is also the macOS route (no Mac app exists).
5. Description, tags, cover, screenshots, AI-disclosure: `STORE-PAGE.md`, `shots/`.
6. Visibility Draft -> Save -> open the preview link -> buy/download it yourself with a 100% test coupon or as the owner, run each build -> set Public.

## 3. Builds made here (sizes, how tested)
| File | Size | Tested |
|---|---|---|
| `dist/nightrun-web.zip` (browser build, music-blocked) | 112.4 MB, 942 files | itch-style iframe test 23 PASS / 0 FAIL; title, flight, street over http: 0 console errors |
| `dist/nightrun-download.zip` (+PLAY.html, README.txt, file:// shim) | 112.5 MB, 944 files | Chromium from `file://.../PLAY.html`: title, flight, street, 0 console errors, art loads |
| `dist/desktop/Mainhattan-Nightrun-linux-x64.zip` | see HANDOFF-W298.md | REAL LAUNCH under xvfb-run: window opened, title loaded, screenshot taken |
| `dist/desktop/Mainhattan-Nightrun-win32-x64.zip` | see HANDOFF-W298.md | **NOT launched** (no Windows or wine here); built with electron-packager, same app code and game files as the Linux one |
| macOS | none | cannot be built on this Linux machine |

`file://` limits (download zip opened by double-click): the synth music plays but song files do not (browsers cannot fetch files from file:), and the on-foot actor outline pass is skipped. The desktop apps play everything.
Windows note: unsigned .exe; Windows SmartScreen may warn "unknown publisher". Say so on the page.
