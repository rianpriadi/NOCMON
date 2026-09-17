from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.customer_onu import ONUStatus


class CustomerONUBase(BaseModel):
    name: str
    pppoe_username: str
    odp_id: int
    port_number: int
    rx_power: Optional[float] = None
    status: ONUStatus = ONUStatus.OFFLINE


class CustomerONUCreate(CustomerONUBase):
    pass


class CustomerONUUpdate(BaseModel):
    name: Optional[str] = None
    pppoe_username: Optional[str] = None
    odp_id: Optional[int] = None
    port_number: Optional[int] = None
    rx_power: Optional[float] = None
    status: Optional[ONUStatus] = None


class CustomerONUResponse(CustomerONUBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
