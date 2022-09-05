import django

django.setup()

import structlog

from sefaria.settings import MULTISERVER_ENABLED
from sefaria.system.multiserver.monitor import MultiServerMonitor
from sefaria.system.scheduler.scheduler import run_background_scheduler

logger = structlog.get_logger(__name__)


if __name__ == "__main__":
    if not MULTISERVER_ENABLED:
        logger.error("MULTISERVER_ENABLED is not set.  Exiting")
        exit()
    sched = run_background_scheduler()
    sched.print_jobs()

    monitor = MultiServerMonitor()
    monitor.listen()
