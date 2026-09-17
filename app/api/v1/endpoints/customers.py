from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.api.deps import get_db
from app.models.customer_onu import CustomerONU, ONUStatus
from app.models.odp import ODP
from app.schemas.customer_onu import CustomerONUCreate, CustomerONUUpdate, CustomerONUResponse

router = APIRouter()


@router.get("/onu", response_model=List[CustomerONUResponse])
async def list_customer_onus(
    status_filter: Optional[ONUStatus] = Query(None, alias="status", description="Filter by ONU connection status"),
    odp_id: Optional[int] = Query(None, description="Filter by ODP ID"),
    db: AsyncSession = Depends(get_db)
):
    """Lists ONU/PPPoE customers with connection status, rx_power, and optional filtering."""
    query = select(CustomerONU).options(selectinload(CustomerONU.odp))
    
    if status_filter:
        query = query.where(CustomerONU.status == status_filter)
    if odp_id:
        query = query.where(CustomerONU.odp_id == odp_id)
        
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/onu", response_model=CustomerONUResponse, status_code=status.HTTP_201_CREATED)
async def create_customer_onu(payload: CustomerONUCreate, db: AsyncSession = Depends(get_db)):
    odp = await db.get(ODP, payload.odp_id)
    if not odp:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"ODP with id {payload.odp_id} not found")

    onu = CustomerONU(**payload.model_dump())
    db.add(onu)
    
    # Auto increment used_ports counter on associated ODP
    odp.used_ports += 1
    if odp.used_ports >= odp.total_ports:
        from app.models.odp import ODPStatus
        odp.status = ODPStatus.FULL

    await db.commit()
    await db.refresh(onu)
    return onu


@router.get("/onu/{onu_id}", response_model=CustomerONUResponse)
async def get_customer_onu(onu_id: int, db: AsyncSession = Depends(get_db)):
    onu = await db.get(CustomerONU, onu_id)
    if not onu:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer ONU not found")
    return onu


@router.put("/onu/{onu_id}", response_model=CustomerONUResponse)
async def update_customer_onu(onu_id: int, payload: CustomerONUUpdate, db: AsyncSession = Depends(get_db)):
    onu = await db.get(CustomerONU, onu_id)
    if not onu:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer ONU not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    if "odp_id" in update_data:
        odp = await db.get(ODP, update_data["odp_id"])
        if not odp:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"ODP with id {update_data['odp_id']} not found")

    for field, value in update_data.items():
        setattr(onu, field, value)
        
    await db.commit()
    await db.refresh(onu)
    return onu


@router.delete("/onu/{onu_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer_onu(onu_id: int, db: AsyncSession = Depends(get_db)):
    onu = await db.get(CustomerONU, onu_id)
    if not onu:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer ONU not found")
    
    odp = await db.get(ODP, onu.odp_id)
    if odp and odp.used_ports > 0:
        odp.used_ports -= 1
        from app.models.odp import ODPStatus
        if odp.status == ODPStatus.FULL and odp.used_ports < odp.total_ports:
            odp.status = ODPStatus.ACTIVE

    await db.delete(onu)
    await db.commit()
