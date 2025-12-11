import os


class Config:
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_NAME = os.getenv("DB_NAME", "car_booking")
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASS = os.getenv("DB_PASS", "")
    DB_POOL_NAME = "carpool_pool"
    DB_POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "5"))

    SECRET_KEY = os.getenv("SECRET_KEY", "change-me")
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"  # set to "None" + HTTPS if cross-site
    SESSION_COOKIE_SECURE = False      # set True when serving over HTTPS
