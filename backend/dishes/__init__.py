from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from config import Config
from flask_cors import CORS
from flask_mail import Mail
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
migrate = Migrate()
mail = Mail()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    allowed_origins = ["http://localhost:5173"]
    CORS(app, origins=allowed_origins, supports_credentials=True)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)
    jwt.init_app(app)

    from .routes import bp as routes_bp
    app.register_blueprint(routes_bp)

    return app
