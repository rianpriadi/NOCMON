from typing import Optional, TYPE_CHECKING
import enum
from sqlalchemy import String, Integer, Float, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.odp import ODP


class ONUStatus(str, enum.Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    LOS = "los"  # Loss of Signal


class CustomerONU(Base):
    __tablename__ = "customer_onus"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    pppoe_username: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    odp_id: Mapped[int] = mapped_column(Integer, ForeignKey("odps.id", ondelete="CASCADE"), nullable=False)
    port_number: Mapped[int] = mapped_column(Integer, nullable=False)
    rx_power: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # Signal power in dBm
    status: Mapped[ONUStatus] = mapped_column(
        Enum(ONUStatus, native_enum=False),
        nullable=False,
        default=ONUStatus.OFFLINE
    )

    odp: Mapped["ODP"] = relationship("ODP", back_populates="customer_onus")

    def __repr__(self) -> str:
        return f"<CustomerONU id={self.id} name='{self.name}' pppoe='{self.pppoe_username}' status='{self.status}'>"
