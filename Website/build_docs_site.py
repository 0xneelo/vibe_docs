from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent


def run_step(command: list[str]) -> None:
    print(f"→ {' '.join(command)}")
    subprocess.run(command, cwd=ROOT, check=True)


def build_site() -> None:
    if shutil.which("python") is None:
        raise SystemExit("Python is required to generate docs data.")

    if shutil.which("npm") is None:
        raise SystemExit(
            "npm is required to build the Vite site. Install Node.js/npm and then rerun this command."
        )

    run_step([sys.executable, "scripts/generate_docs_data.py"])
    run_step(["npm", "install"])
    run_step(["npm", "run", "build"])
    print(f"Built site into {ROOT / 'site'}")


if __name__ == "__main__":
    build_site()
