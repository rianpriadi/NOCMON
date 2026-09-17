from fastapi import APIRouter

from app.api.v1.endpoints import devices, odps, fiber_cables, customer_onus, gis, customers

api_router = APIRouter()

api_router.include_router(devices.router, prefix="/devices", tags=["Devices"])
api_router.include_router(gis.router, prefix="/gis", tags=["GIS & Map"])
api_router.include_router(customers.router, prefix="/customers", tags=["Customers"])
api_router.include_router(odps.router, prefix="/odps", tags=["ODPs"])
api_router.include_router(fiber_cables.router, prefix="/fiber-cables", tags=["Fiber Cables"])
api_router.include_router(customer_onus.router, prefix="/customer-onus", tags=["Customer ONUs"])
