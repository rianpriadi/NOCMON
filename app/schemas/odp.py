from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.odp import ODPStatus


class ODPBase(BaseModel):
    code: str
    latitude: float
    longitude: float
    total_ports: int = 8
    used_ports: int = 0
    status: ODPStatus = ODPStatus.ACTIVE


class ODPCreate(ODPBase):
    pass


class ODPUpdate(BaseModel):
    code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    total_ports: Optional[int] = None
    used_ports: Optional[int] = None
    status: Optional[ODPStatus] = None


class ODPResponse(ODPBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
