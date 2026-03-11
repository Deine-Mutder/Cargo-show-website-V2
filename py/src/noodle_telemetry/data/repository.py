import sqlite3
from pathlib import Path

from noodle_telemetry.config import ETS2_DB, HEAVY_DB
from noodle_telemetry.domain.models import Cargo


LOWLOADER_HINTS = ("tieflader", "tiefbett", "lowloader")
FLATBED_HINTS = ("planenauflieger", "flachbett", "flatbed", "plattform", "platform")


class CargoRepository:
    def list_all(self) -> list[Cargo]:
        cargos: list[Cargo] = []
        cargos.extend(self._load_db(ETS2_DB))
        cargos.extend(self._load_db(HEAVY_DB))
        return cargos

    def _load_db(self, db_path: Path) -> list[Cargo]:
        if not db_path.exists():
            return []

        with sqlite3.connect(db_path) as conn:
            conn.row_factory = sqlite3.Row
            rows = conn.execute("SELECT * FROM cargo ORDER BY id ASC").fetchall()

        parsed: list[Cargo] = []
        for row in rows:
            trailer_1 = (row["trailer1"] if "trailer1" in row.keys() else row["t1"]) or ""
            trailer_2 = (row["trailer2"] if "trailer2" in row.keys() else row["t2"]) or ""

            support_lowloader = self._contains_hint(trailer_1, LOWLOADER_HINTS) or self._contains_hint(trailer_2, LOWLOADER_HINTS)
            support_flatbed = self._contains_hint(trailer_1, FLATBED_HINTS) or self._contains_hint(trailer_2, FLATBED_HINTS)

            if not support_lowloader and not support_flatbed:
                support_lowloader = True
                support_flatbed = True

            parsed.append(
                Cargo(
                    cargo_id=int(row["id"]),
                    name=str(row["name"]),
                    supports_lowloader=support_lowloader,
                    supports_flatbed=support_flatbed,
                    source_db=db_path.name,
                )
            )

        return parsed

    @staticmethod
    def _contains_hint(value: str, hints: tuple[str, ...]) -> bool:
        text = value.strip().lower()
        return any(hint in text for hint in hints)
