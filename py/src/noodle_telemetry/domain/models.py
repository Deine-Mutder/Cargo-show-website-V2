from dataclasses import dataclass
from enum import Enum


class TrailerKind(str, Enum):
    LOWLOADER = "lowloader"
    FLATBED = "flachbett"


@dataclass(frozen=True)
class Cargo:
    cargo_id: int
    name: str
    supports_lowloader: bool
    supports_flatbed: bool
    source_db: str

    def supports(self, trailer: TrailerKind) -> bool:
        if trailer == TrailerKind.LOWLOADER:
            return self.supports_lowloader
        return self.supports_flatbed
