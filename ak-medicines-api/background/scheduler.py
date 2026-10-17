import atexit

import click
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.schedulers.blocking import BlockingScheduler

from background.alerts import send_stock_alerts


def run_alert_job(app):
    with app.app_context():
        try:
            send_stock_alerts()
        except Exception:
            app.logger.exception("Stock alert email failed.")


def add_alert_job(scheduler, app):
    scheduler.add_job(
        run_alert_job,
        "interval",
        args=[app],
        hours=app.config["ALERT_INTERVAL_HOURS"],
        max_instances=1,
        coalesce=True,
    )


def start_background_scheduler(app):
    scheduler = BackgroundScheduler(timezone="UTC")
    add_alert_job(scheduler, app)
    scheduler.start()
    atexit.register(scheduler.shutdown)
    return scheduler


def register_commands(app):
    @app.cli.command("send-alerts")
    def send_alerts():
        click.echo(f"Sent alerts for {send_stock_alerts()} medicines.")

    @app.cli.command("run-scheduler")
    def run_scheduler():
        scheduler = BlockingScheduler(timezone="UTC")
        add_alert_job(scheduler, app)
        click.echo("Stock alert scheduler started.")
        try:
            scheduler.start()
        except (KeyboardInterrupt, SystemExit):
            pass
