#!/usr/bin/env python3
"""Owner control panel: static files + a tiny reply API. Local only (127.0.0.1)."""
import http.server, json, os, datetime, threading

SP = os.path.dirname(os.path.abspath(__file__))
INBOX = os.path.join(SP, 'inbox.jsonl')
LOCK = threading.Lock()


class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=SP, **k)

    def log_message(self, *a):
        pass

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def _json(self, code, obj):
        b = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def do_GET(self):
        if self.path.startswith('/api/inbox'):
            rows = []
            if os.path.exists(INBOX):
                for line in open(INBOX):
                    try:
                        rows.append(json.loads(line))
                    except Exception:
                        pass
            return self._json(200, rows[-50:])
        rng = self.headers.get('Range')
        path = self.translate_path(self.path)
        if rng and rng.startswith('bytes=') and os.path.isfile(path):
            return self._range(path, rng)
        return super().do_GET()

    def _range(self, path, rng):
        # Byte ranges let the browser seek and scrub in videos.
        size = os.path.getsize(path)
        a, _, b = rng[6:].split(',')[0].partition('-')
        try:
            if a == '':
                start, end = max(0, size - int(b)), size - 1
            else:
                start = int(a)
                end = min(int(b), size - 1) if b else size - 1
        except ValueError:
            start, end = 0, size - 1
        if start >= size or start > end:
            self.send_response(416)
            self.send_header('Content-Range', 'bytes */%d' % size)
            self.end_headers()
            return
        self.send_response(206)
        self.send_header('Content-Type', self.guess_type(path))
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Content-Range', 'bytes %d-%d/%d' % (start, end, size))
        self.send_header('Content-Length', str(end - start + 1))
        self.end_headers()
        with open(path, 'rb') as f:
            f.seek(start)
            left = end - start + 1
            while left > 0:
                chunk = f.read(min(65536, left))
                if not chunk:
                    break
                try:
                    self.wfile.write(chunk)
                except (BrokenPipeError, ConnectionResetError):
                    return
                left -= len(chunk)

    def do_POST(self):
        if not self.path.startswith('/api/reply'):
            return self._json(404, {'error': 'not found'})
        n = int(self.headers.get('Content-Length') or 0)
        if n > 20000:
            return self._json(413, {'error': 'too long'})
        try:
            body = json.loads(self.rfile.read(n) or b'{}')
        except Exception:
            return self._json(400, {'error': 'bad json'})
        row = {
            'at': datetime.datetime.now(datetime.UTC).strftime('%Y-%m-%dT%H:%M:%SZ'),
            'kind': str(body.get('kind', 'message'))[:40],
            'about': str(body.get('about', ''))[:120],
            'answer': str(body.get('answer', ''))[:40],
            'text': str(body.get('text', ''))[:4000],
        }
        with LOCK, open(INBOX, 'a') as f:
            f.write(json.dumps(row) + '\n')
        return self._json(200, {'ok': True, 'row': row})


if __name__ == '__main__':
    http.server.ThreadingHTTPServer(('127.0.0.1', 8765), H).serve_forever()
