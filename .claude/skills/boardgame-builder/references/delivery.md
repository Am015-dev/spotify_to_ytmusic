# Delivering and hosting

## claude.ai artifact
- **Each game** is its own artifact, published from its built HTML.
- **The Game Night Shelf** is one artifact that hosts each game as a supporting file (`<slug>/index.html`) and shows them in an iframe. It also hosts `reference.html` and `covers/*.jpg`.
- **Read before you republish.** Always `read` the live artifact before republishing, and merge in changes another session may have made, such as the shelf entry for a game built elsewhere. A publish over an unread version is refused.
- **What works where:**
  - On claude.ai only the `room` capability works for online play. Crown City keeps its claude.ai rooms there.
  - Peer-to-peer play needs the relays, so it's meant for the GitHub Pages copy.

## GitHub Pages (free; the best way for people to play)
- **Workflow:** `.github/workflows/pages.yml` uploads `games/` with `actions/upload-pages-artifact` and `actions/deploy-pages`.
  - Trigger it on push to `main` **and** the working branch, plus `workflow_dispatch`, if the user doesn't want merges to main.
- **The repo owner must do two things once.** A workflow token can't do them:
  1. Settings → Pages → Source: **GitHub Actions**.
  2. Settings → Environments → `github-pages` → add the working branch under Deployment branches.
  - Until then the deploy fails with "Get Pages site failed … Not Found". Say so once on the PR rather than re-running it.
- The repo must be public for free Pages.
- After every push, check the site: `curl` each game path for 200, and load it in Playwright through the proxy with 0 page errors.

## The shelf
- **Covers** are real screenshots: 960×540 JPG at about 100 KB, cropped so the game's best moment shows. Drawn canvas placeholders were called "old and ugly".
  - For a 3D game you can't start in the slow sandbox, hide the menu overlay and shoot the attract or background scene.
- **Every game the user owns belongs on both shelves,** including ones made in other sessions. Take the latest standalone artifact as the source; the copy inside the shelf can be stale.
- **Keep the chips honest:** "Online with friends" only on games that have it. The shelf text says every *board* game is online.

## Repository layout
- `games/`: the finished pages, served by Pages.
- `games-src/`: the sources and the `build.py` for each game, plus shared modules (`shell/`, `perf/`, `audio/`, `net/`), test scripts, briefs and a README. Every build reproduces `games/` byte for byte.
- **Never commit:**
  - research data with real card texts;
  - raw audio downloads;
  - `node_modules`;
  - absolute scratch paths. Grep for them before each commit.
