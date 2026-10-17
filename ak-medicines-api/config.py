import os
from pathlib import Path

from dotenv import load_dotenv
from flask_mail import Mail
from flask_sqlalchemy import SQLAlchemy

# so that it doesn't load env from the frond end folder and overwrites it.
load_dotenv(Path(__file__).with_name(".env"))


db = SQLAlchemy()
mail = Mail()


class Config:
    SQLALCHEMY_DATABASE_URI = os.environ["DATABASE_URL"]
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    MAIL_SERVER = os.getenv("MAIL_SERVER", "localhost")
    MAIL_PORT = int(os.getenv("MAIL_PORT", "587"))
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "true").lower() == "true"
    MAIL_USE_SSL = os.getenv("MAIL_USE_SSL", "false").lower() == "true"
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.getenv("MAIL_DEFAULT_SENDER")
    ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
    ALERT_INTERVAL_HOURS = int(os.getenv("ALERT_INTERVAL_HOURS", "6"))
