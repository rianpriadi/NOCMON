from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from shapely.geometry import LineString, shape
from geoalchemy2.shape import from_shape, to_shape

from app.api.deps import get_db
from app.models.fiber_cable import FiberCable
from app.schemas.fiber_cable import FiberCableCreate, FiberCableUpdate, FiberCableResponse

router = APIRouter()


def parse_geometry_input(geom_input: Any) -> Any:
    """Converts GeoJSON dict, LineString object, or list of [lon, lat] pairs to WKB geometry for GeoAlchemy2."""
    if isinstance(geom_input, dict):
        # GeoJSON object
        geom_obj = shape(geom_input)
    elif hasattr(geom_input, "coordinates"):
        geom_obj = LineString(geom_input.coordinates)
    elif isinstance(geom_input, list):
        geom_obj = LineString(geom_input)
    else:
        raise ValueError("Invalid geometry format for LineString")

    if not isinstance(geom_obj, LineString):
        raise ValueError("Geometry must be a LineString")

    return from_shape(geom_obj, srid=4326)


def format_cable_response(cable: FiberCable) -> dict:
    geom_shape = to_shape(cable.geometry) if cable.geometry else None
    return {
        "id": cable.id,
        "name": cable.name,
        "core_capacity": cable.core_capacity,
        "geometry": {
            "type": "LineString",
            "coordinates": list(geom_shape.coords) if geom_shape else []
        },
        "created_at": cable.created_at,
        "updated_at": cable.updated_at
    }


@router.get("/", response_model=List[FiberCableResponse])
async def list_fiber_cables(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FiberCable))
    cables = result.scalars().all()
    return [format_cable_response(c) for c in cables]


@router.post("/", response_model=FiberCableResponse, status_code=status.HTTP_201_CREATED)
async def create_fiber_cable(payload: FiberCableCreate, db: AsyncSession = Depends(get_db)):
    try:
        wkb_geometry = parse_geometry_input(payload.geometry)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid geometry: {str(e)}")

    cable = FiberCable(
        name=payload.name,
        core_capacity=payload.core_capacity,
        geometry=wkb_geometry
    )
    db.add(cable)
    await db.commit()
    await db.refresh(cable)
    return format_cable_response(cable)


@router.get("/{cable_id}", response_model=FiberCableResponse)
async def get_fiber_cable(cable_id: int, db: AsyncSession = Depends(get_db)):
    cable = await db.get(FiberCable, cable_id)
    if not cable:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fiber cable not found")
    return format_cable_response(cable)


@router.put("/{cable_id}", response_model=FiberCableResponse)
async def update_fiber_cable(cable_id: int, payload: FiberCableUpdate, db: AsyncSession = Depends(get_db)):
    cable = await db.get(FiberCable, cable_id)
    if not cable:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fiber cable not found")
    
    if payload.name is not None:
        cable.name = payload.name
    if payload.core_capacity is not None:
        cable.core_capacity = payload.core_capacity
    if payload.geometry is not None:
        try:
            cable.geometry = parse_geometry_input(payload.geometry)
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid geometry: {str(e)}")

    await db.commit()
    await db.refresh(cable)
    return format_cable_response(cable)


@router.delete("/{cable_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_fiber_cable(cable_id: int, db: AsyncSession = Depends(get_db)):
    cable = await db.get(FiberCable, cable_id)
    if not cable:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fiber cable not found")
    await db.delete(cable)
    await db.commit()
