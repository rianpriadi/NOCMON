import json
from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from geoalchemy2.shape import to_shape

from app.api.deps import get_db
from app.models.odp import ODP, ODPStatus
from app.models.fiber_cable import FiberCable
from app.schemas.odp import ODPCreate, ODPResponse

router = APIRouter()


@router.get("/odps")
async def get_odps_geojson(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """Returns all ODP points as GeoJSON FeatureCollection for map visualization."""
    result = await db.execute(select(ODP))
    odps = result.scalars().all()

    features = []
    for odp in odps:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [odp.longitude, odp.latitude]
            },
            "properties": {
                "id": odp.id,
                "code": odp.code,
                "status": odp.status.value if hasattr(odp.status, "value") else str(odp.status),
                "used_ports": odp.used_ports,
                "total_ports": odp.total_ports,
                "created_at": odp.created_at.isoformat() if odp.created_at else None,
                "updated_at": odp.updated_at.isoformat() if odp.updated_at else None
            }
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }


@router.get("/cables")
async def get_cables_geojson(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """Returns all fiber cable paths as GeoJSON FeatureCollection using ST_AsGeoJSON from PostGIS."""
    # Use PostGIS ST_AsGeoJSON function for fast geometry conversion
    stmt = select(FiberCable, func.ST_AsGeoJSON(FiberCable.geometry).label("geojson_str"))
    result = await db.execute(stmt)
    rows = result.all()

    features = []
    for cable, geojson_str in rows:
        try:
            geometry_dict = json.loads(geojson_str) if geojson_str else None
        except Exception:
            geom_shape = to_shape(cable.geometry) if cable.geometry else None
            geometry_dict = {
                "type": "LineString",
                "coordinates": list(geom_shape.coords) if geom_shape else []
            }

        features.append({
            "type": "Feature",
            "geometry": geometry_dict,
            "properties": {
                "id": cable.id,
                "name": cable.name,
                "core_capacity": cable.core_capacity,
                "created_at": cable.created_at.isoformat() if cable.created_at else None,
                "updated_at": cable.updated_at.isoformat() if cable.updated_at else None
            }
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }


@router.post("/odp", response_model=ODPResponse, status_code=status.HTTP_201_CREATED)
async def create_odp_point(payload: ODPCreate, db: AsyncSession = Depends(get_db)):
    """Creates a new ODP point record with latitude and longitude coordinates."""
    existing = await db.execute(select(ODP).where(ODP.code == payload.code))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"ODP code '{payload.code}' already exists")

    odp = ODP(**payload.model_dump())
    db.add(odp)
    await db.commit()
    await db.refresh(odp)
    return odp
