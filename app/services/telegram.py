import logging
from typing import Optional
import httpx

from app.core.config import settings

logger = logging.getLogger("nocmon.telegram")


async def send_telegram_alert(message: str, bot_token: Optional[str] = None, chat_id: Optional[str] = None) -> bool:
    """Sends an async Telegram alert notification message to specified NOC Chat ID."""
    token = bot_token or settings.TELEGRAM_BOT_TOKEN
    target_chat = chat_id or settings.TELEGRAM_CHAT_ID

    if not token or not target_chat:
        logger.info(f"[SIMULATED TELEGRAM ALERT] (Token/ChatID not configured): {message}")
        return False

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": target_chat,
        "text": message,
        "parse_mode": "HTML",
        "disable_web_page_preview": True
    }

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(url, json=payload)
            if response.status_code == 200:
                logger.info("Telegram alert sent successfully.")
                return True
            else:
                logger.error(f"Telegram API error ({response.status_code}): {response.text}")
                return False
    except Exception as e:
        logger.error(f"Failed to send Telegram alert: {e}")
        return False
