import os

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

try:
    from celery import Celery

    celery = Celery(
        "vulnerax_tasks",
        broker=REDIS_URL,
        backend=REDIS_URL,
        include=["tasks"]
    )

    celery.conf.update(
        task_serializer="json",
        accept_content=["json"],
        result_serializer="json",
        timezone="UTC",
        enable_utc=True,
    )
except (ImportError, Exception):
    # Celery/Redis not available — provide a no-op mock
    # Scans will run inline via asyncio (no task queue)
    class _MockCelery:
        """Minimal mock so `@celery.task(...)` decorators don't crash."""
        def task(self, *args, **kwargs):
            def decorator(func):
                return func
            return decorator

    celery = _MockCelery()

