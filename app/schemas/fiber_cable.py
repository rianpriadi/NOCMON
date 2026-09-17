from datetime import datetime
from typing import Optional, List, Any, Dict, Union
from pydantic import BaseModel, ConfigDict, Field


class FiberCableBase(BaseModel):
    name: str
    core_capacity: int = 12


class LineStringGeoJSON(BaseModel):
    type: str = "LineString"
    coordinates: List[List[float]]  # e.g. [[106.816667, -6.200000], [106.820000, -6.205000]]


class FiberCableCreate(FiberCableBase):
    geometry: Union[LineStringGeoJSON, Dict[str, Any], List[List[float]]] = Field(
        ...,
        description="GeoJSON LineString geometry dict or list of coordinate pairs [[lon, lat], ...]"
    )


class FiberCableUpdate(BaseModel):
    name: Optional[str] = None
    geometry: Optional[Union[LineStringGeoJSON, Dict[str, Any], List[List[float]]]] = None
    core_capacity: Optional[int] = None


class FiberCableResponse(FiberCableBase):
    id: int
    geometry: Any
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
