from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.device import DeviceType, DeviceStatus


class DeviceBase(BaseModel):
    name: str
    ip_address: str
    device_type: DeviceType = DeviceType.MIKROTIK
    username: str
    status: DeviceStatus = DeviceStatus.OFFLINE
    last_seen: Optional[datetime] = None


class DeviceCreate(DeviceBase):
    password: str


class DeviceUpdate(BaseModel):
    name: Optional[str] = None
    ip_address: Optional[str] = None
    device_type: Optional[DeviceType] = None
    username: Optional[str] = None
    password: Optional[str] = None
    status: Optional[DeviceStatus] = None
    last_seen: Optional[datetime] = None


class DeviceResponse(DeviceBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
