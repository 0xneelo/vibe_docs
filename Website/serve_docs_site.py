from __future__ import annotations

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent
SITE_DIR = ROOT / "site"
PORT = 8000


class SpaHandler(SimpleHTTPRequestHandler):
    def do_GET(self) -> None:
        requested = self.path.split("?", 1)[0].split("#", 1)[0]
        target = SITE_DIR / requested.lstrip("/")

        if requested in {"", "/"}:
            self.path = "/index.html"
        elif not target.exists() and "." not in Path(requested).name:
            self.path = "/index.html"

        return super().do_GET()


def main() -> None:
    if not SITE_DIR.exists():
        raise SystemExit("Build the site first with: python build_docs_site.py")

    handler = partial(SpaHandler, directory=str(SITE_DIR))
    server = ThreadingHTTPServer(("127.0.0.1", PORT), handler)
    print(f"Serving whitepaper site at http://127.0.0.1:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
