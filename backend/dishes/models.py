from . import db
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from flask import current_app
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    verified = db.Column(db.Boolean, default=False)

    dishes = db.relationship('Dishes', backref='user', lazy=True)
    orders = db.relationship('Orders', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    @staticmethod
    def generate_verification_token(email):
        serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
        return serializer.dumps(email, salt=current_app.config['SECURITY_PASSWORD_SALT'])

    @staticmethod
    def verify_verification_token(token, expiration=3600):
        serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
        try:
            email = serializer.loads(token, salt=current_app.config['SECURITY_PASSWORD_SALT'], max_age=expiration)
        except (SignatureExpired, BadSignature):
            return None
        return email

order_dishes = db.Table('order_dishes',
    db.Column('order_id', db.Integer, db.ForeignKey('orders.id'), primary_key=True),
    db.Column('dish_id', db.Integer, db.ForeignKey('dishes.id'), primary_key=True),
    db.Column('quantity', db.Integer, nullable=False),
    db.Column('price_at_order_time', db.Float, nullable=False)
)

class Dishes(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    dish_name = db.Column(db.String(45), nullable=False, unique=True)
    price = db.Column(db.Float, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    def as_dict(self):
        return {"id": self.id, "dish_name": self.dish_name, "price": self.price}

class Orders(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_time = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    dishes = db.relationship('Dishes', secondary=order_dishes, backref=db.backref('orders', lazy='dynamic'))
