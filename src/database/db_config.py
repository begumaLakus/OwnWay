import os
from dotenv import load_dotenv

load_dotenv()

DB = dict(
    host     = os.getenv("DB_HOST", "127.0.0.1"),
    port     = int(os.getenv("DB_PORT", 5432)),
    dbname   = os.getenv("DB_NAME", "ownway_db"),
    user     = os.getenv("DB_USER"),
    password = os.getenv("DB_PASS"),
)
