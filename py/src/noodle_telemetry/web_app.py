from __future__ import annotations

import json
import threading
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from noodle_telemetry.data.repository import CargoRepository


def _write_payload(web_dir: Path) -> None:
    cargos = CargoRepository().list_all()
    payload = {
        "cargos": [
            {
                "id": c.cargo_id,
                "name": c.name,
                "supports_lowloader": c.supports_lowloader,
                "supports_flatbed": c.supports_flatbed,
                "source": c.source_db,
            }
            for c in cargos
        ]
    }
    (web_dir / "data.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def run_web_app() -> None:
    project_root = Path(__file__).resolve().parents[2]
    web_dir = project_root / "web"
    _write_payload(web_dir)

    class Handler(SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(web_dir), **kwargs)

    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    host, port = server.server_address
    url = f"http://{host}:{port}/index.html"

    print(f"[NOODLE APP] Web UI running at {url}")
    print("[NOODLE APP] Controls: Left/Right arrow = trailer switch, click dropdown = cargo select")

    threading.Timer(0.4, lambda: webbrowser.open(url)).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
