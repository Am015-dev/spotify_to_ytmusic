"""Serve the model viewer and save Keep/Redo votes to viewer/votes.json (POST /votes).
Run: C:\\Miniforge3\\python.exe viewer\\serve.py   ->  http://127.0.0.1:8765/"""
import json, os
import mimetypes
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote

V = Path(__file__).parent
GA = Path(os.environ.get("GAME_ASSETS", V.parent)).resolve()
FULL = ("flow-2d", "flow-3d", "flow-covers", "flow-video")  # only these folders are readable through /full/
REPO = (Path(os.environ.get("CROWN_REPO", r"C:\Users\kourisa\crown-media\repo")) / "games").resolve()  # /repo/<game>/media/<file>: painted game art, read-only
IMG = {".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"}
# frames share one origin, so one frame's saved game would open every other frame on the same screen: give each its own memory storage
FRESH = (b"<script>(()=>{const M=()=>{const d=new Map;return{getItem:k=>d.has(k)?d.get(k):null,setItem:(k,v)=>d.set(k,String(v)),"
         b"removeItem:k=>d.delete(k),clear:()=>d.clear(),key:i=>[...d.keys()][i]??null,get length(){return d.size}}};"
         b"for(const s of['localStorage','sessionStorage'])try{Object.defineProperty(window,s,{value:M(),configurable:true})}catch(e){}"
         b"HTMLMediaElement.prototype.play=function(){return Promise.resolve()};})();</script>")
# the Windows registry often maps these wrongly (.js as text/plain breaks module scripts)
for ext, t in ((".js", "text/javascript"), (".mjs", "text/javascript"), (".webp", "image/webp"), (".glb", "model/gltf-binary"),
               (".wasm", "application/wasm"), (".mp3", "audio/mpeg"), (".ogg", "audio/ogg"), (".json", "application/json")):
    mimetypes.add_type(t, ext)


class H(SimpleHTTPRequestHandler):
    def end_headers(self):  # never let the browser reuse an old page, manifest or model after a rebuild
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        if self.path.split("?")[0] == "/flow.json":  # live Flow budget + batches (flow_status.py)
            import flow_status
            body = json.dumps(flow_status.build()).encode()
            self.send_response(200); self.send_header("Content-Type", "application/json"); self.end_headers()
            return self.wfile.write(body)
        if self.path.split("?")[0] == "/lanes.json":  # Flow lane status from logs/WORKING_*.txt
            import pipeline_api
            body = json.dumps(pipeline_api.lanes()).encode()
            self.send_response(200); self.send_header("Content-Type", "application/json"); self.end_headers()
            return self.wfile.write(body)
        if self.path.split("?")[0] == "/anims.json":  # Flow animation clips: flow-video/<game>/<name>.webm (alpha) + .mp4 source
            out = []
            for w in sorted((GA / "flow-video").glob("*/*.webm")):
                m, s = w.with_suffix(".mp4"), w.with_name(w.stem + "-sheet.jpg")
                out.append({"game": w.parent.name, "name": w.stem, "webm": f"full/flow-video/{w.parent.name}/{w.name}",
                            "mp4": f"full/flow-video/{w.parent.name}/{m.name}" if m.exists() else None,
                            "sheet": f"full/flow-video/{w.parent.name}/{s.name}" if s.exists() else None,
                            "kb": w.stat().st_size // 1024, "t": int(w.stat().st_mtime)})
            body = json.dumps(out).encode()
            self.send_response(200); self.send_header("Content-Type", "application/json"); self.end_headers()
            return self.wfile.write(body)
        if self.path.startswith("/full/"):  # full-size Flow images for the Asset Board lightbox
            f = (GA / unquote(self.path[6:].split("?")[0])).resolve()
            if f.suffix.lower() not in (".jpg", ".png", ".webm", ".mp4") or not any(f.is_relative_to(GA / r) for r in FULL) or not f.is_file():
                return self.send_error(404)
            ctype = {".jpg": "image/jpeg", ".png": "image/png", ".webm": "video/webm", ".mp4": "video/mp4"}[f.suffix.lower()]
            self.send_response(200); self.send_header("Content-Type", ctype)
            self.end_headers()
            return self.wfile.write(f.read_bytes())
        if self.path.startswith("/repo/"):
            f = (REPO / unquote(self.path[6:].split("?")[0])).resolve()
            if f.suffix.lower() not in IMG or not f.is_relative_to(REPO) or f.parent.name != "media" or not f.is_file():
                return self.send_error(404)
            self.send_response(200); self.send_header("Content-Type", IMG[f.suffix.lower()]); self.end_headers()
            return self.wfile.write(f.read_bytes())
        if self.path.startswith("/game/"):  # the real games (repo games/), read-only, for screens.html
            f = (REPO / unquote(self.path[6:].split("?")[0])).resolve()
            if f.is_dir(): f = f / "index.html"
            if not f.is_relative_to(REPO) or not f.is_file(): return self.send_error(404)
            body = f.read_bytes()
            if f.suffix == ".html" and "fresh=1" in self.path:  # screens.html: every frame starts as a first visit
                body = body.replace(b"<head>", b"<head>" + FRESH, 1)
            self.send_response(200); self.send_header("Content-Type", mimetypes.guess_type(f.name)[0] or "application/octet-stream")
            self.end_headers()
            return self.wfile.write(body)
        if self.path.split("?")[0] == "/tables.json":  # painted table backgrounds per game, for screens.html
            t = {g.name: sorted(p.name for p in (g / "media").glob("table-*.webp")) for g in REPO.iterdir() if (g / "media").is_dir()}
            body = json.dumps(t).encode()
            self.send_response(200); self.send_header("Content-Type", "application/json"); self.end_headers()
            return self.wfile.write(body)
        return super().do_GET()

    def do_POST(self):
        if self.path in ("/votes2d/bulk", "/run"):  # [{key, v, note}, ...] | {"jobs": ["game|prompts-x.json|1:1", ...]}
            import pipeline_api
            try:
                d = json.loads(self.rfile.read(min(int(self.headers.get("Content-Length", 0)), 400_000)))
                res = pipeline_api.bulk(d) if self.path == "/votes2d/bulk" else pipeline_api.run(d.get("jobs"))
            except (ValueError, AttributeError, TypeError, OSError) as e:
                body = json.dumps({"error": str(e)}).encode()
                self.send_response(400); self.send_header("Content-Type", "application/json"); self.end_headers()
                return self.wfile.write(body)
            body = json.dumps(res).encode()
            self.send_response(200); self.send_header("Content-Type", "application/json"); self.end_headers()
            return self.wfile.write(body)
        if self.path == "/votes2d":  # one 2D Keep/Redo change: {"key": "game/name", "v": "ok"|"redo"|null, "note": "..."}
            import votes2d
            try:
                d = json.loads(self.rfile.read(min(int(self.headers.get("Content-Length", 0)), 4096)))
                body = json.dumps(votes2d.apply(d.get("key", ""), d.get("v"), d.get("note", ""))).encode()
            except (ValueError, AttributeError, TypeError): return self.send_error(400)
            self.send_response(200); self.send_header("Content-Type", "application/json"); self.end_headers()
            return self.wfile.write(body)
        if self.path != "/votes": return self.send_error(404)
        body = self.rfile.read(int(self.headers.get("Content-Length", 0)))
        votes = json.loads(body)  # {"game/name": "ok"|"drop"|"redo"}; reject anything else
        if not isinstance(votes, dict) or not all(v in ("ok", "drop", "redo") for v in votes.values()): return self.send_error(400)
        (V / "votes.json").write_text(json.dumps(votes, indent=1, sort_keys=True))
        self.send_response(204); self.end_headers()


ThreadingHTTPServer(("127.0.0.1", 8765), partial(H, directory=str(V))).serve_forever()
