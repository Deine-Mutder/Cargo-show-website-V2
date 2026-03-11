from pathlib import Path

PACKAGE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = PACKAGE_DIR.parents[1]
DATA_DIR = PROJECT_ROOT / "data"
ETS2_DB = DATA_DIR / "ets2_cargo.db"
HEAVY_DB = DATA_DIR / "heavy_cargo.db"
