import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = (
        f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
        f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SECRET_KEY = os.getenv('SECRET_KEY')
    JWT_TOKEN_LOCATION = ['cookies']
    JWT_ACCESS_COOKIE_PATH = '/'
    JWT_REFRESH_COOKIE_PATH = '/dishes/refresh'
    JWT_COOKIE_SECURE = False  # Set to True in production with HTTPS
    JWT_COOKIE_CSRF_PROTECT = False  # Optional, can be enabled for more security
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=2)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)

    MAIL_SERVER = 'smtp.gmail.com' 
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.getenv('USER_EMAIL')
    MAIL_PASSWORD = os.getenv('USER_APP')
    MAIL_DEFAULT_SENDER = MAIL_USERNAME
    SECURITY_PASSWORD_SALT = os.getenv('USER_SALT')
