import asyncpg
import asyncio
import logging
from config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

_pool = None


async def get_pool():
    global _pool
    if _pool is None:
        max_retries = 15
        retry_delay = 2
        
        for attempt in range(max_retries):
            try:
                logger.info(f"Connecting to database (attempt {attempt + 1}/{max_retries})...")
                _pool = await asyncpg.create_pool(
                    host=settings.pg_host,
                    port=settings.pg_port,
                    user=settings.pg_user,
                    password=settings.pg_password,
                    database=settings.pg_name,
                    min_size=2,
                    max_size=10,
                )
                logger.info("Database connection established successfully!")
                break
            except (ConnectionRefusedError, asyncpg.exceptions.CannotConnectNowError, OSError) as e:
                if attempt < max_retries - 1:
                    logger.warning(f"Database not ready, retrying in {retry_delay}s... ({e})")
                    await asyncio.sleep(retry_delay)
                else:
                    logger.error(f"Failed to connect to database after {max_retries} attempts")
                    raise
    return _pool


async def close_pool():
    global _pool
    if _pool:
        await _pool.close()
        _pool = None
