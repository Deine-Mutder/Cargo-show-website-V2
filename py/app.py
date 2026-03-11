from pathlib import Path
import sys
from datetime import datetime

PROJECT_ROOT = Path(__file__).resolve().parent
SRC_DIR = PROJECT_ROOT / "src"

if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

print(f"[NOODLE APP] starting from: {PROJECT_ROOT} at {datetime.now().isoformat(timespec='seconds')}")

from noodle_telemetry.main import run  # noqa: E402


if __name__ == "__main__":
    run()
