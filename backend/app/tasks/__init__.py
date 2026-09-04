"""
Celery background tasks for asynchronous processing.
"""

from celery import Celery

celery_app = Celery(
    "gemelo_digital",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
    include=["app.tasks.background_tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600 * 4,  # 4 hours
    task_soft_time_limit=3600 * 3,  # 3 hours
)
