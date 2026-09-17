from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.deps import get_db
from app.models.customer_onu import CustomerONU
from app.models.odp import ODP
from app.schemas.customer_onu import CustomerONUCreate, CustomerONUUpdate, CustomerONUResponse

router = APIRouter()


@router.get("/", response_model=List[CustomerONUResponse])
async def list_customer_onus(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CustomerONU))
    return result.scalars().all()


@router.post("/", response_model=CustomerONUResponse, status_code=status.HTTP_201_CREATED)
async def create_customer_onu(payload: CustomerONUCreate, db: AsyncSession = Depends(get_db)):
    # Verify foreign key ODP exists
    odp = await db.get(ODP, payload.odp_id)
    if not odp:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"ODP with id {payload.odp_id} does not exist")

    onu = CustomerONU(**payload.model_dump())
    db.add(onu)
    
    # Auto-increment used_ports in ODP if within capacity
    odp.used_ports += 1
    if odp.used_ports >= odp.total_ports:
        from app.models.odp import ODPStatus
        odp.status = ODPStatus.FULL

    await db.commit()
    await db.refresh(onu)
    return onu


@router.get("/{onu_id}", response_model=CustomerONUResponse)
async def get_customer_onu(onu_id: int, db: AsyncSession = Depends(get_db)):
    onu = await db.get(CustomerONU, onu_id)
    if not onu:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer ONU not found")
    return onu


@router.put("/{onu_id}", response_model=CustomerONUResponse)
async def update_customer_onu(onu_id: int, payload: CustomerONUUpdate, db: AsyncSession = Depends(get_db)):
    onu = await db.get(CustomerONU, onu_id)
    if not onu:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer ONU not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    if "odp_id" in update_data:
        odp = await db.get(ODP, update_data["odp_id"])
        if not odp:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"ODP with id {update_data['odp_id']} does not exist")

    for field, value in update_data.items():
        setattr(onu, field, value)
        
    await db.commit()
    await db.refresh(onu)
    return onu


@router.delete("/{onu_id}", status_code=status.HTTP_204_NO_CONTENT)
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
