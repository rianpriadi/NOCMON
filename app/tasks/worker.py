import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.core.database import AsyncSessionLocal
from app.services.poller import run_icmp_ping_poller, run_mikrotik_collector

logger = logging.getLogger("nocmon.worker")

# Initialize global AsyncIOScheduler
scheduler = AsyncIOScheduler()


async def job_icmp_ping_wrapper():
    """Wrapper job for ICMP Ping poller with session factory passed in."""
    try:
        await run_icmp_ping_poller(AsyncSessionLocal)
    except Exception as e:
        logger.error(f"Scheduled ICMP Ping job error: {e}", exc_info=True)


async def job_mikrotik_collector_wrapper():
    """Wrapper job for Mikrotik RouterOS collector with session factory passed in."""
    try:
        await run_mikrotik_collector(AsyncSessionLocal)
    except Exception as e:
        logger.error(f"Scheduled Mikrotik Collector job error: {e}", exc_info=True)


def start_scheduler():
    """Registers poller jobs and starts the AsyncIOScheduler background worker."""
    if not scheduler.running:
        # Schedule ICMP ping every 30 seconds
        scheduler.add_job(
            job_icmp_ping_wrapper,
            trigger=IntervalTrigger(seconds=30),
            id="icmp_ping_job",
            name="ICMP Ping Poller",
            replace_existing=True,
            max_instances=1
        )

        # Schedule Mikrotik collector every 60 seconds (1 minute)
        scheduler.add_job(
            job_mikrotik_collector_wrapper,
            trigger=IntervalTrigger(seconds=60),
            id="mikrotik_collector_job",
            name="Mikrotik RouterOS Collector",
            replace_existing=True,
            max_instances=1
        )

        scheduler.start()
        logger.info("APScheduler worker started successfully (ICMP Ping: 30s, Mikrotik Collector: 60s).")


def shutdown_scheduler():
    """Gracefully shuts down the background scheduler worker."""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("APScheduler worker stopped.")
