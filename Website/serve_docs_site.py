from __future__ import annotations

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent
SITE_DIR = ROOT / "site"
PORT = 8000


def main() -> None:
    if not SITE_DIR.exists():
        raise SystemExit("Build the site first with: python build_docs_site.py")

    handler = partial(SimpleHTTPRequestHandler, directory=str(SITE_DIR))
    server = ThreadingHTTPServer(("127.0.0.1", PORT), handler)
    print(f"Serving Vibe docs at http://127.0.0.1:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
