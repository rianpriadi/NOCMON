import asyncio
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.device import Device, DeviceType, DeviceStatus
from app.models.customer_onu import CustomerONU, ONUStatus
from app.services.telegram import send_telegram_alert

logger = logging.getLogger("nocmon.poller")


async def ping_device_ip(ip_address: str, timeout: int = 2) -> bool:
    """Performs non-blocking ICMP ping check on target IP address using system ping command."""
    try:
        proc = await asyncio.create_subprocess_exec(
            "ping", "-c", "1", "-W", str(timeout), ip_address,
            stdout=asyncio.subprocess.DEVNULL,
            stderr=asyncio.subprocess.DEVNULL
        )
        await asyncio.wait_for(proc.wait(), timeout=timeout + 1)
        return proc.returncode == 0
    except asyncio.TimeoutError:
        logger.warning(f"Ping timeout for IP: {ip_address}")
        return False
    except Exception as e:
        logger.error(f"Ping exception for IP {ip_address}: {e}")
        return False


async def run_icmp_ping_poller(session_factory) -> Dict[str, Any]:
    """Polls all registered devices in the database using async ICMP ping and triggers Telegram alerts on status changes."""
    logger.info("Starting ICMP Ping poller job...")
    online_count = 0
    offline_count = 0

    async with session_factory() as session:
        try:
            result = await session.execute(select(Device))
            devices: List[Device] = result.scalars().all()

            if not devices:
                logger.info("No devices found in DB for ICMP polling.")
                return {"total": 0, "online": 0, "offline": 0}

            # Ping all devices concurrently
            ping_tasks = [ping_device_ip(device.ip_address) for device in devices]
            results = await asyncio.gather(*ping_tasks, return_exceptions=True)

            now_utc = datetime.now(timezone.utc)
            for device, is_online in zip(devices, results):
                if isinstance(is_online, Exception):
                    is_online = False

                previous_status = device.status

                if is_online:
                    device.status = DeviceStatus.ONLINE
                    device.last_seen = now_utc
                    online_count += 1

                    # Trigger recovery alert if previously offline
                    if previous_status == DeviceStatus.OFFLINE:
                        alert_text = (
                            f"✅ <b>RECOVERY NOCMON</b>\n"
                            f"perangkat: <b>{device.name}</b>\n"
                            f"IP: <code>{device.ip_address}</code>\n"
                            f"Tipe: {device.device_type}\n"
                            f"Status: <b>ONLINE</b> kembali."
                        )
                        await send_telegram_alert(alert_text)
                else:
                    device.status = DeviceStatus.OFFLINE
                    offline_count += 1

                    # Trigger alert if previously online
                    if previous_status == DeviceStatus.ONLINE:
                        alert_text = (
                            f"🚨 <b>ALERT NOCMON</b>\n"
                            f"Perangkat: <b>{device.name}</b>\n"
                            f"IP: <code>{device.ip_address}</code>\n"
                            f"Tipe: {device.device_type}\n"
                            f"Status: <b>OFFLINE / DOWN</b>!"
                        )
                        await send_telegram_alert(alert_text)

            await session.commit()
            logger.info(f"ICMP Ping poller completed. Total: {len(devices)}, Online: {online_count}, Offline: {offline_count}")
            return {"total": len(devices), "online": online_count, "offline": offline_count}
        except Exception as e:
            await session.rollback()
            logger.error(f"Error during ICMP Ping poller job: {e}", exc_info=True)
            return {"error": str(e)}


def _fetch_mikrotik_data_sync(ip: str, username: str, password: str, port: int = 8728) -> Dict[str, Any]:
    """Synchronous worker function to communicate with Mikrotik via librouteros API."""
    active_pppoe = []
    interfaces = []
    try:
        from librouteros import connect

        api = connect(host=ip, username=username, password=password, port=port, timeout=5)
        
        # 1. Fetch Active PPPoE Connections (/ppp/active/print)
        try:
            ppp_active_cmd = api.path("ppp", "active")
            active_records = ppp_active_cmd.select("name", "address", "caller-id", "uptime")
            for record in active_records:
                if "name" in record:
                    active_pppoe.append(record["name"])
        except Exception as ppp_err:
            logger.warning(f"Failed to fetch PPPoE active list from Mikrotik {ip}: {ppp_err}")

        # 2. Fetch Interfaces Traffic / Info (/interface/print)
        try:
            iface_cmd = api.path("interface")
            iface_records = iface_cmd.select("name", "type", "running", "disabled", "rx-byte", "tx-byte")
            for iface in iface_records:
                interfaces.append(iface)
        except Exception as iface_err:
            logger.warning(f"Failed to fetch interfaces from Mikrotik {ip}: {iface_err}")

        api.close()
        return {
            "success": True,
            "active_pppoe": active_pppoe,
            "interfaces": interfaces
        }
    except Exception as conn_err:
        logger.warning(f"Failed to connect to Mikrotik API at {ip}:{port} - {conn_err}")
        return {"success": False, "error": str(conn_err)}


async def run_mikrotik_collector(session_factory) -> Dict[str, Any]:
    """Polls Mikrotik devices for active PPPoE users & interface statistics, then updates CustomerONU statuses."""
    logger.info("Starting Mikrotik RouterOS Collector job...")

    async with session_factory() as session:
        try:
            # Query online Mikrotik devices
            result = await session.execute(
                select(Device).where(
                    Device.device_type == DeviceType.MIKROTIK,
                    Device.status == DeviceStatus.ONLINE
                )
            )
            mikrotik_devices: List[Device] = result.scalars().all()

            if not mikrotik_devices:
                logger.info("No online Mikrotik devices found for RouterOS collection.")
                return {"devices_polled": 0}

            all_active_pppoe_users = set()

            for device in mikrotik_devices:
                try:
                    res = await asyncio.to_thread(
                        _fetch_mikrotik_data_sync,
                        device.ip_address,
                        device.username,
                        device.password
                    )
                    if res.get("success"):
                        active_users = res.get("active_pppoe", [])
                        all_active_pppoe_users.update(active_users)
                        logger.info(f"Mikrotik {device.name} ({device.ip_address}): Found {len(active_users)} active PPPoE sessions.")
                except Exception as dev_err:
                    logger.error(f"Error polling Mikrotik device {device.ip_address}: {dev_err}")

            # Update CustomerONU statuses based on collected PPPoE active sessions
            onu_result = await session.execute(select(CustomerONU))
            customer_onus: List[CustomerONU] = onu_result.scalars().all()

            updated_online = 0
            updated_offline = 0

            for onu in customer_onus:
                if onu.pppoe_username in all_active_pppoe_users:
                    if onu.status != ONUStatus.ONLINE:
                        onu.status = ONUStatus.ONLINE
                        updated_online += 1
                else:
                    if onu.status == ONUStatus.ONLINE:
                        onu.status = ONUStatus.OFFLINE
                        updated_offline += 1

            await session.commit()
            logger.info(f"Mikrotik Collector completed. Active PPPoE: {len(all_active_pppoe_users)}, ONUs online: {updated_online}, ONUs offline: {updated_offline}")
            return {
                "devices_polled": len(mikrotik_devices),
                "active_pppoe_sessions": len(all_active_pppoe_users),
                "onus_updated_online": updated_online,
                "onus_updated_offline": updated_offline
            }
        except Exception as e:
            await session.rollback()
            logger.error(f"Error in Mikrotik RouterOS Collector job: {e}", exc_info=True)
            return {"error": str(e)}
