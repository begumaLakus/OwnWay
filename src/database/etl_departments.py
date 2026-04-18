import sys, io, os, psycopg2
from db_config import DB
import pandas as pd
from dotenv import load_dotenv

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
load_dotenv()



_TR_MAP = {
    "i": "I", "ı": "I", "İ": "I",
    "ğ": "G", "Ğ": "G",
    "ü": "U", "Ü": "U",
    "ş": "S", "Ş": "S",
    "ö": "O", "Ö": "O",
    "ç": "C", "Ç": "C",
}

def _norm(s: str) -> str:

    s = str(s or "").strip()
    for src, dst in _TR_MAP.items():
        s = s.replace(src, dst)
    return s.upper()

def clean_int(val) -> int:
    try:
        if pd.isna(val) or str(val).strip() == '-': return 0
        cleaned = str(val).split(',')[0].replace('.', '').replace(' ', '').strip()
        return int(cleaned) if cleaned else 0
    except:
        return 0

def clean_float(val) -> float:
    try:
        if pd.isna(val) or str(val).strip() == '-': return 0.0
        cleaned = str(val).replace('.', '').replace(',', '.').strip()
        return float(cleaned)
    except:
        return 0.0

def load_and_write():
    print("\n" + "═" * 60)
    print("  OwnWay — Departments ETL (Bölümler)")
    print("═" * 60)

    df = pd.read_excel('bolum.xlsx')

    uni_map = {}
    with psycopg2.connect(**DB) as conn, conn.cursor() as cur:
        cur.execute("SELECT id, uni_name FROM universities;")
        for uni_id, uni_name in cur.fetchall():
            uni_map[_norm(uni_name)] = uni_id

        print(f"  ✓ Veritabanından {len(uni_map)} üniversite yüklendi.")

        cur.execute("DELETE FROM departments;")
        print("  ✓ `departments` tablosu sıfırlandı.")

        insert_data = []
        skipped = 0

        for idx, row in df.iterrows():
            uni_raw   = row.iloc[0]
            dept_name = str(row.iloc[1]).strip()
            base_rank = clean_int(row.iloc[2])
            base_score= clean_float(row.iloc[3])
            language  = str(row.iloc[4]).strip()
            quota     = clean_int(row.iloc[5])
            male_c    = clean_int(row.iloc[6])
            female_c  = clean_int(row.iloc[7])

            if pd.isna(uni_raw) or not str(uni_raw).strip():
                continue

            uni_key = _norm(uni_raw)
            uni_id = uni_map.get(uni_key)

            if not uni_id:
                print(f"  [UYARI] Veritabanında eşleşmeyen üniversite: '{uni_raw}' -> '{uni_key}'")
                skipped += 1
                continue

            insert_data.append((
                uni_id, dept_name, base_rank, base_score,
                language, quota, female_c, male_c
            ))

        if insert_data:
            from psycopg2.extras import execute_values
            query = "INSERT INTO departments (uni_id, dept_name, base_rank, base_score, language, quota, female_student_count, male_student_count) VALUES %s"
            execute_values(cur, query, insert_data)
            conn.commit()
            print(f"  ✅ Başarıyla {len(insert_data)} bölüm eklendi. ({skipped} atlandı)\n")
        else:
            print("  ⚠️ Veri eklenemedi, insert listesi boş.")

if __name__ == '__main__':
    load_and_write()
