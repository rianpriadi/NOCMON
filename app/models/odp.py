from typing import List, TYPE_CHECKING
import enum
from sqlalchemy import String, Float, Integer, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.customer_onu import CustomerONU


class ODPStatus(str, enum.Enum):
    ACTIVE = "active"
    FULL = "full"
    MAINTENANCE = "maintenance"


class ODP(Base):
    __tablename__ = "odps"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    total_ports: Mapped[int] = mapped_column(Integer, nullable=False, default=8)
    used_ports: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    status: Mapped[ODPStatus] = mapped_column(
        Enum(ODPStatus, native_enum=False),
        nullable=False,
        default=ODPStatus.ACTIVE
    )

    customer_onus: Mapped[List["CustomerONU"]] = relationship("CustomerONU", back_populates="odp", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<ODP id={self.id} code='{self.code}' status='{self.status}'>"
