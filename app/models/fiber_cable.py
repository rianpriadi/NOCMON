from typing import Any
from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column
from geoalchemy2 import Geometry

from app.models.base import Base


class FiberCable(Base):
    __tablename__ = "fiber_cables"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    # GeoAlchemy2 LineString geometry (WGS84 lat/lon coordinate SRID 4326)
    geometry: Mapped[Any] = mapped_column(
        Geometry(geometry_type='LINESTRING', srid=4326, spatial_index=True),
        nullable=False
    )
    core_capacity: Mapped[int] = mapped_column(Integer, nullable=False, default=12)

    def __repr__(self) -> str:
        return f"<FiberCable id={self.id} name='{self.name}' core_capacity={self.core_capacity}>"
