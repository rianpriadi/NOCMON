import asyncio
import logging
from datetime import datetime, timezone
from sqlalchemy import select, delete
from geoalchemy2.shape import from_shape
from shapely.geometry import LineString

from app.core.database import AsyncSessionLocal
from app.models.device import Device, DeviceType, DeviceStatus
from app.models.odp import ODP, ODPStatus
from app.models.fiber_cable import FiberCable
from app.models.customer_onu import CustomerONU, ONUStatus

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nocmon.seed")


async def seed_data():
    """Populates PostgreSQL/PostGIS database with initial dummy NOCMON data."""
    logger.info("Starting NOCMON database seed process...")

    async with AsyncSessionLocal() as session:
        try:
            # Clear existing data to avoid conflict
            await session.execute(delete(CustomerONU))
            await session.execute(delete(FiberCable))
            await session.execute(delete(ODP))
            await session.execute(delete(Device))
            await session.commit()
            logger.info("Cleared existing database records.")

            now_utc = datetime.now(timezone.utc)

            # 1. Insert Devices
            device1 = Device(
                name="Mikrotik Core Center",
                ip_address="127.0.0.1",
                device_type=DeviceType.MIKROTIK,
                username="admin",
                password="secretpassword",
                status=DeviceStatus.ONLINE,
                last_seen=now_utc
            )
            device2 = Device(
                name="OLT GPON Utama",
                ip_address="10.10.10.1",
                device_type=DeviceType.OLT,
                username="admin",
                password="oltpassword",
                status=DeviceStatus.ONLINE,
                last_seen=now_utc
            )
            session.add_all([device1, device2])
            await session.flush()
            logger.info("Seeded Devices: Mikrotik Core Center, OLT GPON Utama")

            # 2. Insert ODP Points
            odp1 = ODP(
                code="ODP-PRK-01",
                latitude=-6.2088,
                longitude=106.8456,
                total_ports=8,
                used_ports=2,
                status=ODPStatus.ACTIVE
            )
            odp2 = ODP(
                code="ODP-PRK-02",
                latitude=-6.2120,
                longitude=106.8500,
                total_ports=8,
                used_ports=8,
                status=ODPStatus.FULL
            )
            odp3 = ODP(
                code="ODP-PRK-03",
                latitude=-6.2160,
                longitude=106.8550,
                total_ports=16,
                used_ports=1,
                status=ODPStatus.MAINTENANCE
            )
            session.add_all([odp1, odp2, odp3])
            await session.flush()
            logger.info("Seeded ODP Points: ODP-PRK-01 (active), ODP-PRK-02 (full), ODP-PRK-03 (maintenance)")

            # 3. Insert Fiber Cable LineString (Spatial GIS Geometry)
            # Line connecting ODP-PRK-01 -> ODP-PRK-02 -> ODP-PRK-03
            cable_line = LineString([
                (106.8456, -6.2088),
                (106.8500, -6.2120),
                (106.8550, -6.2160)
            ])
            wkb_cable = from_shape(cable_line, srid=4326)

            cable1 = FiberCable(
                name="Jalur Backbone Fiber PRK-01 -> PRK-03",
                geometry=wkb_cable,
                core_capacity=24
            )
            session.add(cable1)
            await session.flush()
            logger.info("Seeded Fiber Cable: Jalur Backbone Fiber PRK-01 -> PRK-03 (LineString PostGIS)")

            # 4. Insert Customer ONUs
            onu1 = CustomerONU(
                name="Pelanggan Budi Santoso",
                pppoe_username="budi_prk01",
                odp_id=odp1.id,
                port_number=1,
                rx_power=-19.5,
                status=ONUStatus.ONLINE
            )
            onu2 = CustomerONU(
                name="Pelanggan Siti Rahma",
                pppoe_username="siti_prk01",
                odp_id=odp1.id,
                port_number=2,
                rx_power=-21.2,
                status=ONUStatus.ONLINE
            )
            onu3 = CustomerONU(
                name="Pelanggan Agus Wijaya",
                pppoe_username="agus_prk02",
                odp_id=odp2.id,
                port_number=1,
                rx_power=-24.0,
                status=ONUStatus.ONLINE
            )
            onu4 = CustomerONU(
                name="Pelanggan PT FastNet",
                pppoe_username="pt_fastnet",
                odp_id=odp2.id,
                port_number=2,
                rx_power=-18.2,
                status=ONUStatus.ONLINE
            )
            onu5 = CustomerONU(
                name="Pelanggan Toko Serba Ada",
                pppoe_username="toko_serba",
                odp_id=odp3.id,
                port_number=1,
                rx_power=-29.8,
                status=ONUStatus.LOS
            )
            session.add_all([onu1, onu2, onu3, onu4, onu5])

            await session.commit()
            logger.info("Seeded 5 Customer ONUs successfully!")
            logger.info("✨ Database seeding completed cleanly!")
        except Exception as e:
            await session.rollback()
            logger.error(f"Failed to seed database: {e}", exc_info=True)


if __name__ == "__main__":
    asyncio.run(seed_data())
