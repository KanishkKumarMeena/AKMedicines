from pathlib import Path
import click
from flask import Flask, abort, jsonify, send_from_directory
from marshmallow import ValidationError
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.exceptions import HTTPException

from config import Config, db, mail
from api.routes import api
from background.scheduler import register_commands, start_background_scheduler

FRONTEND_DIST = Path(__file__).resolve().parent.parent / "ak-medicines-ui" / "dist"


def create_app(test_config=None):
    app = Flask(__name__)
    app.config.from_object(Config)
    if test_config:
        app.config.update(test_config)
    db.init_app(app)
    mail.init_app(app)
    app.register_blueprint(api)

    if not app.config.get("TESTING"):
        with app.app_context():
            from dummy import add_dummy_data
            db.create_all()
            add_dummy_data()

    @app.get("/", defaults={"path": ""})
    @app.get("/<path:path>")
    def serve_frontend(path):
        if path.startswith("api/"):
            abort(404)
        if FRONTEND_DIST.exists():
            target = FRONTEND_DIST / path
            if path and target.is_file():
                return send_from_directory(FRONTEND_DIST, path)
            index_file = FRONTEND_DIST / "index.html"
            if index_file.is_file():
                return send_from_directory(FRONTEND_DIST, "index.html")
        return jsonify(status="AK Medicines API is running"), 200

    @app.errorhandler(ValidationError)
    def validation_error(error):
        return jsonify(error="Invalid request.", details=error.messages), 400

    @app.errorhandler(HTTPException)
    def http_error(error):
        db.session.rollback()
        return jsonify(error=error.description), error.code

    @app.errorhandler(SQLAlchemyError)
    def database_error(error):
        db.session.rollback()
        app.logger.exception("Database operation failed.")
        return jsonify(error="Database operation failed."), 500

    @app.cli.command("init-db")
    def init_db():
        db.create_all()
        click.echo("Database tables created.")

    @app.cli.command("dummy-db")
    def dummy_db():
        from dummy import add_dummy_data
        click.echo("Demo data added." if add_dummy_data() else "Database already contains data; dummy data skipped.")

    register_commands(app)

    return app


if __name__ == "__main__":
    app = create_app()
    start_background_scheduler(app)
    app.run(debug=False)
