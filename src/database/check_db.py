import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "127.0.0.1"), "port": int(os.getenv("DB_PORT", 5432)),
    "dbname": os.getenv("DB_NAME", "ownway_db"), "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASS")
}

CITY_DATA = {
    "Istanbul":  {"cost": 1.261, "culture": 5.00, "students": 938607},
    "Izmir":     {"cost": 1.215, "culture": 2.54, "students": 193164},
    "Ankara":    {"cost": 1.125, "culture": 2.69, "students": 346882},
    "Konya":     {"cost": 0.9625,"culture": 1.98, "students": 126426},
    "Antalya":   {"cost": 1.080, "culture": 1.97, "students": 87415},
    "Zonguldak": {"cost": 0.998, "culture": 1.00, "students": 31476},
    "Erzurum":   {"cost": 0.927, "culture": 1.21, "students": 68125},
}

conn = psycopg2.connect(**DB_CONFIG)
cur  = conn.cursor()

cur.execute()
print("Cities tablo yapisi:")
cols = cur.fetchall()
for col in cols:
    print(f"  {col[0]:30s} {col[1]}")

cur.execute()
print("\nMevcut constraints:")
for c in cur.fetchall():
    print(f"  {c[0]:40s} {c[1]}")

cur.execute("SELECT * FROM cities LIMIT 5;")
rows = cur.fetchall()
print(f"\nMevcut kayitlar ({len(rows)} adet):")
for r in rows:
    print(" ", r)

cur.close()
conn.close()
