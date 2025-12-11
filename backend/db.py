import mysql.connector
from mysql.connector import pooling
from config import Config

_pool = pooling.MySQLConnectionPool(
    pool_name=Config.DB_POOL_NAME,
    pool_size=Config.DB_POOL_SIZE,
    pool_reset_session=True,
    host=Config.DB_HOST,
    database=Config.DB_NAME,
    user=Config.DB_USER,
    password=Config.DB_PASS,
    charset="utf8mb4",
    use_unicode=True,
)

def get_conn():
    return _pool.get_connection()
