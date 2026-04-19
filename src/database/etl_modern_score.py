import os
from db_config import DB
import sys
import io
import time
import json
import math
import psycopg2
import requests
import pandas as pd
from dotenv import load_dotenv

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
load_dotenv()



CITY_CONFIG = {
    "İstanbul":  {"lat": 41.0082, "lon": 28.9784, "radius_km": 60},
    "Ankara":    {"lat": 39.9334, "lon": 32.8597, "radius_km": 50},
    "İzmir":     {"lat": 38.4192, "lon": 27.1287, "radius_km": 50},
    "Antalya":   {"lat": 36.8969, "lon": 30.7133, "radius_km": 45},
    "Konya":     {"lat": 37.8746, "lon": 32.4932, "radius_km": 45},
    "Erzurum":   {"lat": 39.9068, "lon": 41.2681, "radius_km": 40},
    "Zonguldak": {"lat": 41.4564, "lon": 31.7987, "radius_km": 35},
}

_TR_UPPER = {
    "ı": "I", "i": "I", "İ": "I",
    "ğ": "G", "Ğ": "G",
    "ü": "U", "Ü": "U",
    "ş": "S", "Ş": "S",
    "ö": "O", "Ö": "O",
    "ç": "C", "Ç": "C",
}

def _norm(s: str) -> str:

    s = str(s or "").strip()
    for src, dst in _TR_UPPER.items():
        s = s.replace(src, dst)
    return s.upper()

CITIES = list(CITY_CONFIG.keys())

W_HOSPITAL   = 0.30   
W_UNIVERSITY = 0.25 
W_TRANSIT    = 0.25   
W_AIRPORT    = 0.20   

OVERPASS_MIRRORS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
]

def _overpass_query_count(lat: float, lon: float, radius_m: int, tags: list) -> str:

    lines = []
    for tag in tags:
        for k, v in tag.items():
            lines.append(f'  node["{k}"="{v}"](around:{radius_m},{lat},{lon});')
            lines.append(f'  way["{k}"="{v}"](around:{radius_m},{lat},{lon});')
            lines.append(f'  relation["{k}"="{v}"](around:{radius_m},{lat},{lon});')
    return "[out:json][timeout:120];\n(\n" + "\n".join(lines) + "\n);\nout count;"

def _overpass_query_exists(lat: float, lon: float, radius_m: int, tags: list) -> str:

    lines = []
    for tag in tags:
        for k, v in tag.items():
            lines.append(f'  node["{k}"="{v}"](around:{radius_m},{lat},{lon});')
            lines.append(f'  way["{k}"="{v}"](around:{radius_m},{lat},{lon});')
            lines.append(f'  relation["{k}"="{v}"](around:{radius_m},{lat},{lon});')
    return "[out:json][timeout:60];\n(\n" + "\n".join(lines) + "\n);\nout 1;"

def fetch_osm(query: str, city: str, label: str, mode: str = "count") -> int:

    for mi, url in enumerate(OVERPASS_MIRRORS):
        for attempt in range(1, 4):
            try:
                resp = requests.post(
                    url,
                    data={"data": query},
                    timeout=120,
                    headers={"User-Agent": "OwnWayModernScore/1.0 (bitirme projesi)"},
                )
                if resp.status_code == 429:
                    wait = attempt * 15
                    print(f"    [429] Rate limit — {wait}s bekleniyor...")
                    time.sleep(wait)
                    continue
                resp.raise_for_status()
                elements = resp.json().get("elements", [])
                if mode == "exists":
                    return 1 if len(elements) > 0 else 0
                else:  # count
                    total = elements[0].get("tags", {}).get("total", 0) if elements else 0
                    return int(total)
            except requests.exceptions.Timeout:
                print(f"    [UYARI] {city}/{label}: timeout (mirror {mi+1}, deneme {attempt})")
                time.sleep(5)
            except requests.exceptions.RequestException as e:
                print(f"    [UYARI] {city}/{label}: {e}")
                time.sleep(5)
        if mi < len(OVERPASS_MIRRORS) - 1:
            print(f"    → Mirror {mi+1} başarısız, mirror {mi+2} deneniyor...")
    print(f"    [HATA] {city}/{label}: tüm mirror'lar başarısız → 0")
    return 0

_CITY_NORM = {_norm(c): c for c in CITIES}

def load_hospital_counts() -> dict:

    counts = {c: 0 for c in CITIES}

    def _add(filepath: str, sheet: str, header: int, city_col: int = 0):

        df = pd.read_excel(filepath, sheet_name=sheet, header=header, dtype=str)
        col_name = df.columns[city_col]
        for val in df[col_name].dropna():
            key = _norm(val)
            if key in _CITY_NORM:
                counts[_CITY_NORM[key]] += 1

    _add("hastane.xlsx",  "Table 1",    header=2, city_col=0)  # Özel (ulusal)
    _add("hastane.xlsx",  "Table 2",    header=0, city_col=0)  # Özel (ek İstanbul)
    _add("hastane1.xlsx", "Hastaneler", header=0, city_col=0)  # Kamu

    return counts

UNIVERSITY_TAGS = [
    {"amenity": "university"},
]

TRANSIT_TAGS = [
    {"railway": "subway"},
    {"railway": "tram"},
    {"railway": "light_rail"},
]

AIRPORT_TAGS = [
    {"aeroway": "aerodrome"},
]

def fetch_university_count(city: str, cfg: dict) -> int:

    radius_m = cfg["radius_km"] * 1000
    query    = _overpass_query_count(cfg["lat"], cfg["lon"], radius_m, UNIVERSITY_TAGS)
    count    = fetch_osm(query, city, "üniversite", mode="count")
    print(f"    🎓 {city}: {count} üniversite unsuru")
    time.sleep(4)
    return count

def fetch_transit_exists(city: str, cfg: dict) -> int:

    radius_m = cfg["radius_km"] * 1000
    query    = _overpass_query_exists(cfg["lat"], cfg["lon"], radius_m, TRANSIT_TAGS)
    exists   = fetch_osm(query, city, "metro/tramvay", mode="exists")
    label    = "VAR ✓" if exists else "YOK ✗"
    print(f"    🚇 {city}: metro/tramvay {label}")
    time.sleep(4)
    return exists

def fetch_airport_exists(city: str, cfg: dict) -> int:

    radius_m = cfg["radius_km"] * 1000
    query    = _overpass_query_exists(cfg["lat"], cfg["lon"], radius_m, AIRPORT_TAGS)
    exists   = fetch_osm(query, city, "havalimanı", mode="exists")
    label    = "VAR ✓" if exists else "YOK ✗"
    print(f"    ✈️  {city}: havalimanı {label}")
    time.sleep(4)
    return exists

def collect_osm_data() -> dict:

    osm = {}
    print("\n" + "═" * 62)
    print("  📡 OSM VERİ TOPLAMA  (OpenStreetMap Overpass API)")
    print("═" * 62)
    for city, cfg in CITY_CONFIG.items():
        print(f"\n  🏙  {city}...")
        osm[city] = {
            "university_count": fetch_university_count(city, cfg),
            "transit_exists":   fetch_transit_exists(city, cfg),
            "airport_exists":   fetch_airport_exists(city, cfg),
        }
        time.sleep(5)
    return osm

def log_min_max(values: dict) -> dict:

    log_vals = {}
    for k, v in values.items():
        if v is not None and not math.isnan(float(v)):
            log_vals[k] = math.log(float(v) + 1)

    if not log_vals:
        return {k: 50.0 for k in values}

    lo, hi = min(log_vals.values()), max(log_vals.values())
    span   = hi - lo

    avg_log  = sum(log_vals.values()) / len(log_vals)
    avg_norm = ((avg_log - lo) / span * 100.0) if span > 0 else 50.0

    normalized = {}
    for city in values:
        if city not in log_vals:
            normalized[city] = round(avg_norm, 2)
        elif span == 0:
            normalized[city] = 50.0
        else:
            normalized[city] = round((log_vals[city] - lo) / span * 100.0, 2)
    return normalized

def binary_to_100(values: dict) -> dict:

    return {k: 100.0 if v else 0.0 for k, v in values.items()}

def calculate_modern_scores(hospitals: dict, osm: dict) -> dict:

    print("\n" + "═" * 62)
    print("  🔢 SKOR HESAPLAMA")
    print(f"  Ağırlıklar: Hastane %{W_HOSPITAL*100:.0f} | "
          f"Üniversite %{W_UNIVERSITY*100:.0f} | "
          f"Metro/Tram %{W_TRANSIT*100:.0f} | "
          f"Havalimanı %{W_AIRPORT*100:.0f}")
    print("═" * 62)

    hosp_norm    = log_min_max({c: hospitals[c] for c in CITIES})
    uni_norm     = log_min_max({c: osm[c]["university_count"] for c in CITIES})
    transit_norm = binary_to_100({c: osm[c]["transit_exists"] for c in CITIES})
    airport_norm = binary_to_100({c: osm[c]["airport_exists"] for c in CITIES})

    print(f"\n  {'Şehir':<14} {'Hstne%':>7} {'Üniv%':>7} "
          f"{'Metro':>6} {'Hvlmn':>6} │ {'⭐ Yıldız':>10}  Bar")
    print("  " + "─" * 47 + "┤" + "─" * 13)

    results = {}
    for city in CITIES:
        h  = hosp_norm[city]
        u  = uni_norm[city]
        t  = transit_norm[city]
        a  = airport_norm[city]
        raw = h * W_HOSPITAL + u * W_UNIVERSITY + t * W_TRANSIT + a * W_AIRPORT
        stars = round(1.0 + (raw / 100.0) * 4.0, 2)
        bar   = "★" * int(stars) + "☆" * (5 - int(stars))

        t_lbl = "✓" if osm[city]["transit_exists"] else "✗"
        a_lbl = "✓" if osm[city]["airport_exists"] else "✗"
        print(f"  {city:<14} {h:>7.1f} {u:>7.1f} "
              f"{'  '+t_lbl:>6} {'  '+a_lbl:>6} │ {stars:>6.2f}    {bar}")

        results[city] = {
            "hospital_count":    hospitals[city],
            "university_count":  osm[city]["university_count"],
            "transit_exists":    osm[city]["transit_exists"],
            "airport_exists":    osm[city]["airport_exists"],
            "hospital_norm":     h,
            "university_norm":   u,
            "transit_norm":      t,
            "airport_norm":      a,
            "modern_score":      stars,
        }

    best  = max(results, key=lambda c: results[c]["modern_score"])
    worst = min(results, key=lambda c: results[c]["modern_score"])
    print(f"\n  🏆 En yüksek: {best} ({results[best]['modern_score']:.2f} ⭐)")
    print(f"  ⚠️  En düşük:  {worst} ({results[worst]['modern_score']:.2f} ⭐)")

    return results

def db_write(scores: dict) -> None:

    print("\n" + "═" * 62)
    print("  🗄  VERİTABANI GÜNCELLEME")
    print("═" * 62)

    with psycopg2.connect(**DB) as conn, conn.cursor() as cur:

        try:
            cur.execute("ALTER TABLE cities ADD COLUMN IF NOT EXISTS modern_score NUMERIC(4,2);")
            conn.commit()
            print("  ✓ modern_score sütunu kontrol edildi\n")
        except psycopg2.errors.InsufficientPrivilege:
            conn.rollback()
            print("  ⚠️  ALTER TABLE yetkisi yok — sütun önceden oluşturulmuş olmalı.\n")

        cur.execute("SELECT id, city_name FROM cities;")
        existing = {name: cid for cid, name in cur.fetchall()}

        updated = 0
        for city, data in sorted(scores.items()):
            ms = data["modern_score"]
            if city in existing:
                cur.execute(
                    "UPDATE cities SET modern_score = %s WHERE id = %s;",
                    (ms, existing[city])
                )
                status = "UPDATE"
            else:
                cur.execute(
                    "INSERT INTO cities (city_name, modern_score) VALUES (%s, %s);",
                    (city, ms)
                )
                status = "INSERT"
            print(f"  {status:6}  {city:<14}  modern_score = {ms:.2f}")
            updated += 1

        conn.commit()

        cur.execute("SELECT id, city_name, modern_score FROM cities WHERE city_name = ANY(%s) ORDER BY modern_score DESC NULLS LAST;", (list(scores.keys()),))

        print(f"\n  ─── Veritabanı Doğrulama ─────────────────────────────")
        print(f"  {'id':>3}  {'Şehir':<14}  {'modern_score':>12}  Bar")
        print("  " + "─" * 40)
        for row in cur.fetchall():
            s   = float(row[2]) if row[2] else 0.0
            bar = "★" * int(s) + "☆" * (5 - int(s))
            print(f"  {row[0]:>3}  {row[1]:<14}  {s:>12.2f}  {bar}")
        print(f"\n  ✅ {updated} satır güncellendi")

def main():
    print("\n" + "█" * 62)
    print("  OwnWay — Modern Score ETL")
    print("  Şehirler: " + ", ".join(CITIES))
    print("  Bileşenler: Hastane %30 | Üniversite %25 | Metro %25 | Havalimanı %20")
    print("  Normalizasyon: Log-Min-Max (sayısal) | Binary 0/100 (varlık)")
    print("  Çıktı: 1.0 – 5.0 ⭐")
    print("█" * 62)

    print("\n" + "═" * 62)
    print("  🏥 HASTANE VERİSİ  (Excel)")
    print("═" * 62)
    hospitals = load_hospital_counts()
    print(f"\n  {'Şehir':<14} {'Toplam Hastane':>14}")
    print("  " + "─" * 30)
    for city in sorted(hospitals):
        print(f"  {city:<14} {hospitals[city]:>14}")

    osm = collect_osm_data()

    raw_out = {c: {"hospital_count": hospitals[c], **osm[c]} for c in CITIES}
    with open("modern_raw_data.json", "w", encoding="utf-8") as f:
        json.dump(raw_out, f, ensure_ascii=False, indent=2)
    print("\n  → modern_raw_data.json kaydedildi")

    scores = calculate_modern_scores(hospitals, osm)

    with open("modern_scores.json", "w", encoding="utf-8") as f:
        json.dump(scores, f, ensure_ascii=False, indent=2)
    print("  → modern_scores.json kaydedildi")

    try:
        db_write(scores)
        print("\n  ✅ ETL başarıyla tamamlandı.")
    except psycopg2.Error as e:
        print(f"\n  [DB HATA] {e}")
        print("  → Skorlar modern_scores.json dosyasına kaydedildi.")
        print("  → DB'ye manuel yüklemek için:")
        for city, data in sorted(scores.items()):
            ms = data["modern_score"]
            print(f"     UPDATE cities SET modern_score = {ms}"
                  f" WHERE city_name = '{city}';")

if __name__ == "__main__":
    main()
