import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "127.0.0.1"), "port": int(os.getenv("DB_PORT", 5432)),
    "dbname": os.getenv("DB_NAME", "ownway_db"), "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASS")
}

conn = psycopg2.connect(**DB_CONFIG)
cur  = conn.cursor()

# ── Tablo yapısı ────────────────────────────────────────────
cur.execute("""
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'departments'
    ORDER BY ordinal_position;
""")
print("departments tablo yapisi:")
cols = cur.fetchall()
for col in cols:
    print(f"  {col[0]:30s} {col[1]}")

# ── Kısıt (constraint) listesi ──────────────────────────────
cur.execute("""
    SELECT constraint_name, constraint_type
    FROM information_schema.table_constraints
    WHERE table_name = 'departments';
""")
print("\nMevcut constraints:")
for c in cur.fetchall():
    print(f"  {c[0]:40s} {c[1]}")

# ── Örnek kayıtlar ──────────────────────────────────────────
cur.execute("SELECT * FROM departments LIMIT 5;")
rows = cur.fetchall()
print(f"\nMevcut kayitlar ({len(rows)} adet):")
for r in rows:
    print(" ", r)

# ── Özet sayım ──────────────────────────────────────────────
cur.execute("""
    SELECT
        (SELECT COUNT(*) FROM departments)    AS total_departments,
        (SELECT COUNT(*) FROM universities)   AS total_universities,
        (SELECT COUNT(DISTINCT uni_id) FROM departments) AS unis_with_depts,
        (SELECT COUNT(*) FROM departments WHERE uni_id IS NULL) AS orphan_depts;
""")
row = cur.fetchone()
print(f"\nÖzet:")
print(f"  Toplam bölüm       : {row[0]}")
print(f"  Toplam üniversite  : {row[1]}")
print(f"  Bölümü olan üni    : {row[2]}")
print(f"  Üniversitesiz bölüm: {row[3]}")

cur.close()
conn.close()
