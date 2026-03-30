from __future__ import annotations

import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent


def run(script_name: str) -> None:
    script_path = ROOT / script_name
    print(f"Running {script_path.name}")
    subprocess.run([sys.executable, str(script_path)], check=True)


def main() -> int:
    run("generate_docs_data.py")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
