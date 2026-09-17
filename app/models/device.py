from datetime import datetime
from typing import Optional
import enum
from sqlalchemy import String, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class DeviceType(str, enum.Enum):
    MIKROTIK = "Mikrotik"
    OLT = "OLT"


class DeviceStatus(str, enum.Enum):
    ONLINE = "online"
    OFFLINE = "offline"


class Device(Base):
    __tablename__ = "devices"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    ip_address: Mapped[str] = mapped_column(String(45), nullable=False, index=True)
    device_type: Mapped[DeviceType] = mapped_column(
        Enum(DeviceType, native_enum=False),
        nullable=False,
        default=DeviceType.MIKROTIK
    )
    username: Mapped[str] = mapped_column(String(100), nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[DeviceStatus] = mapped_column(
        Enum(DeviceStatus, native_enum=False),
        nullable=False,
        default=DeviceStatus.OFFLINE
    )
    last_seen: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    def __repr__(self) -> str:
        return f"<Device id={self.id} name='{self.name}' ip='{self.ip_address}' type='{self.device_type}'>"
