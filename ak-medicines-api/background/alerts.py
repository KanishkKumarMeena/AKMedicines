from flask import current_app, render_template
from flask_mail import Message

from config import mail
from inventory import low_stock_alerts


def send_stock_alerts():
    alerts = low_stock_alerts()
    if not alerts:
        return 0
    if not current_app.config["ADMIN_EMAIL"] or not current_app.config["MAIL_DEFAULT_SENDER"]:
        raise RuntimeError("Set ADMIN_EMAIL and MAIL_DEFAULT_SENDER before sending alerts.")
    
    message = Message("AK Medicines: stock alerts", recipients=[current_app.config["ADMIN_EMAIL"]])
    message.body = "\n".join(f"{item['name']}: {item['current_stock']} units (minimum {item['min_threshold']})" for item in alerts)
    message.html = render_template("stock_alert.html", alerts=alerts)
    mail.send(message)
    return len(alerts)
