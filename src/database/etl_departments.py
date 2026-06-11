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
    print(f"  ✓ Excel'den {len(df)} satır okundu.")

    uni_map = {}
    with psycopg2.connect(**DB) as conn, conn.cursor() as cur:
        cur.execute("SELECT id, uni_name FROM universities;")
        for uni_id, uni_name in cur.fetchall():
            uni_map[_norm(uni_name)] = uni_id

        print(f"  ✓ Veritabanından {len(uni_map)} üniversite yüklendi.")

        insert_data = []
        skipped_rows = []   # (uni_raw, dept_name) — eşleşmeyen satırlar

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
                skipped_rows.append((str(uni_raw).strip(), dept_name))
                continue

            insert_data.append((
                uni_id, dept_name, base_rank, base_score,
                language, quota, female_c, male_c
            ))

        # ── Atlanmış satırları raporla ──────────────────────────
        if skipped_rows:
            print(f"\n  ⚠️  {len(skipped_rows)} satır atlandı (üniversite eşleşmedi):")
            # Üniversite bazında grupla
            from collections import defaultdict
            by_uni = defaultdict(list)
            for uni_raw, dept_name in skipped_rows:
                by_uni[uni_raw].append(dept_name)
            for uni_raw, depts in sorted(by_uni.items()):
                norm_key = _norm(uni_raw)
                print(f"    ✗ '{uni_raw}' (normalize: '{norm_key}') → {len(depts)} bölüm atlandı")
                for d in depts[:3]:            # ilk 3 bölümü göster
                    print(f"        • {d}")
                if len(depts) > 3:
                    print(f"        ... ve {len(depts)-3} bölüm daha")
            print()

        if not insert_data:
            print("  ⚠️  Eklenecek veri yok. Tablo değiştirilmedi.")
            return

        # ── UPSERT: mevcut kayıtları güncelle, yenilerini ekle ──
        # DELETE + INSERT yerine INSERT ... ON CONFLICT kullan.
        # Bunun için (uni_id, dept_name) çiftine UNIQUE kısıtı olması gerekir.
        # Yoksa önce ekle, ardından eski fazladan kayıtları temizle.
        from psycopg2.extras import execute_values

        # Unique kısıt var mı kontrol et
        cur.execute("""
            SELECT 1 FROM information_schema.table_constraints
            WHERE table_name = 'departments'
              AND constraint_type = 'UNIQUE'
              AND constraint_name LIKE '%uni_id%dept_name%'
            LIMIT 1;
        """)
        has_unique = cur.fetchone() is not None

        if has_unique:
            # Güvenli UPSERT yolu
            query = """
                INSERT INTO departments
                    (uni_id, dept_name, base_rank, base_score, language,
                     quota, female_student_count, male_student_count)
                VALUES %s
                ON CONFLICT (uni_id, dept_name) DO UPDATE SET
                    base_rank            = EXCLUDED.base_rank,
                    base_score           = EXCLUDED.base_score,
                    language             = EXCLUDED.language,
                    quota                = EXCLUDED.quota,
                    female_student_count = EXCLUDED.female_student_count,
                    male_student_count   = EXCLUDED.male_student_count
            """
            execute_values(cur, query, insert_data)
            conn.commit()
            print(f"  ✅ UPSERT: {len(insert_data)} bölüm eklendi/güncellendi. "
                  f"({len(skipped_rows)} atlandı)\n")
        else:
            # UNIQUE kısıt yoksa: DELETE + INSERT (eski davranış ama loglu)
            print("  ℹ️  UNIQUE kısıt bulunamadı → DELETE + INSERT uygulanıyor.")
            cur.execute("DELETE FROM departments;")
            print("  ✓ `departments` tablosu sıfırlandı.")
            query = (
                "INSERT INTO departments "
                "(uni_id, dept_name, base_rank, base_score, language, "
                "quota, female_student_count, male_student_count) VALUES %s"
            )
            execute_values(cur, query, insert_data)
            conn.commit()
            print(f"  ✅ {len(insert_data)} bölüm eklendi. ({len(skipped_rows)} atlandı)\n")

if __name__ == '__main__':
    load_and_write()
