from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.deps import get_db
from app.models.odp import ODP
from app.schemas.odp import ODPCreate, ODPUpdate, ODPResponse

router = APIRouter()


@router.get("/", response_model=List[ODPResponse])
async def list_odps(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ODP))
    return result.scalars().all()


@router.post("/", response_model=ODPResponse, status_code=status.HTTP_201_CREATED)
async def create_odp(payload: ODPCreate, db: AsyncSession = Depends(get_db)):
    # Check if ODP code already exists
    existing = await db.execute(select(ODP).where(ODP.code == payload.code))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ODP code already exists")
    
    odp = ODP(**payload.model_dump())
    db.add(odp)
    await db.commit()
    await db.refresh(odp)
    return odp


@router.get("/{odp_id}", response_model=ODPResponse)
async def get_odp(odp_id: int, db: AsyncSession = Depends(get_db)):
    odp = await db.get(ODP, odp_id)
    if not odp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="ODP not found")
    return odp


@router.put("/{odp_id}", response_model=ODPResponse)
async def update_odp(odp_id: int, payload: ODPUpdate, db: AsyncSession = Depends(get_db)):
    odp = await db.get(ODP, odp_id)
    if not odp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="ODP not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(odp, field, value)
        
    await db.commit()
    await db.refresh(odp)
    return odp


@router.delete("/{odp_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_odp(odp_id: int, db: AsyncSession = Depends(get_db)):
    odp = await db.get(ODP, odp_id)
    if not odp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="ODP not found")
    await db.delete(odp)
    await db.commit()
