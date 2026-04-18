import os
from db_config import DB
import sys
import io
import time
import json
import math
import psycopg2
import requests
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

W_GREEN = round(40 / 70, 4)   # 0.5714
W_WATER = round(30 / 70, 4)   # 0.4286

OVERPASS_MIRRORS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
]

GREEN_TAGS = [
    {"leisure": "park"},
    {"leisure": "garden"},
    {"leisure": "nature_reserve"},
    {"landuse": "forest"},
    {"landuse": "grass"},
    {"landuse": "meadow"},
    {"natural": "wood"},
    {"natural": "scrub"},
    {"natural": "heath"},
]

WATER_TAGS = [
    {"natural": "water"},
    {"natural": "wetland"},
    {"waterway": "river"},
    {"waterway": "stream"},
    {"waterway": "canal"},
    {"natural": "bay"},
    {"natural": "beach"},
    {"natural": "coastline"},
    {"landuse": "reservoir"},
    {"water": "lake"},
    {"water": "river"},
]

def build_overpass_query(lat: float, lon: float, radius_m: int, tags: list) -> str:

    lines = []
    for tag in tags:
        for k, v in tag.items():
            lines.append(f'  node["{k}"="{v}"](around:{radius_m},{lat},{lon});')
            lines.append(f'  way["{k}"="{v}"](around:{radius_m},{lat},{lon});')
            lines.append(f'  relation["{k}"="{v}"](around:{radius_m},{lat},{lon});')
    return "[out:json][timeout:120];\n(\n" + "\n".join(lines) + "\n);\nout count;"

def fetch_osm_count(query: str, city_name: str, category: str) -> int:

    for mirror_idx, mirror_url in enumerate(OVERPASS_MIRRORS):
        for attempt in range(1, 4):
            try:
                resp = requests.post(
                    mirror_url,
                    data={"data": query},
                    timeout=120,
                    headers={"User-Agent": "OwnWayNatureScore/1.0 (bitirme projesi)"},
                )
                if resp.status_code == 429:
                    wait = attempt * 10
                    print(f"    [429] Rate limit — {wait}s bekleniyor...")
                    time.sleep(wait)
                    continue
                resp.raise_for_status()
                total = (
                    resp.json()
                    .get("elements", [{}])[0]
                    .get("tags", {})
                    .get("total", 0)
                )
                if mirror_idx > 0:
                    print(f"      → Mirror {mirror_idx + 1} başarılı")
                return int(total)
            except requests.exceptions.Timeout:
                print(f"    [UYARI] {city_name} {category}: timeout "
                      f"(mirror {mirror_idx + 1}, deneme {attempt})")
                time.sleep(5)
            except requests.exceptions.RequestException as e:
                print(f"    [UYARI] {city_name} {category}: {e}")
                time.sleep(5)

        if mirror_idx < len(OVERPASS_MIRRORS) - 1:
            print(f"    → Mirror {mirror_idx + 1} başarısız, "
                  f"mirror {mirror_idx + 2} deneniyor...")

    print(f"    [HATA] {city_name} {category}: tüm mirror'lar başarısız, 0 atanıyor.")
    return 0

def fetch_green_count(city: str, cfg: dict) -> int:

    radius_m = cfg["radius_km"] * 1000
    query    = build_overpass_query(cfg["lat"], cfg["lon"], radius_m, GREEN_TAGS)
    count    = fetch_osm_count(query, city, "yeşil alan")
    print(f"    🌳 {city}: {count:,} yeşil alan unsuru")
    return count

def fetch_water_count(city: str, cfg: dict) -> int:

    radius_m = cfg["radius_km"] * 1000
    query    = build_overpass_query(cfg["lat"], cfg["lon"], radius_m, WATER_TAGS)
    count    = fetch_osm_count(query, city, "su unsurları")
    print(f"    💧 {city}: {count:,} su unsuru")
    time.sleep(3)   # Overpass sunucu saygı gecikmesi
    return count

def collect_all_raw_data() -> dict:

    raw_data = {}
    print("\n" + "═" * 60)
    print("  📡 VERİ TOPLAMA  (OpenStreetMap Overpass API)")
    print("═" * 60)

    for city, cfg in CITY_CONFIG.items():
        print(f"\n  🏙  {city} işleniyor...")

        green = fetch_green_count(city, cfg)
        time.sleep(5)   # Rate limit önlemi

        water = fetch_water_count(city, cfg)
        time.sleep(5)

        raw_data[city] = {"green_count": green, "water_count": water}

    return raw_data

def log_min_max_normalize(values: dict) -> dict:

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

def calculate_nature_scores(raw_data: dict) -> dict:

    print("\n" + "═" * 60)
    print(f"  🔢 NORMALİZASYON VE SKOR HESAPLAMA")
    print(f"     Ağırlıklar: Yeşil={W_GREEN:.4f} ({W_GREEN*100:.1f}%),"
          f" Su={W_WATER:.4f} ({W_WATER*100:.1f}%)")
    print(f"     Çıktı Ölçeği: 1.0 – 5.0 ⭐")
    print("═" * 60)

    green_raw = {c: d["green_count"] for c, d in raw_data.items()}
    water_raw = {c: d["water_count"] for c, d in raw_data.items()}

    green_norm = log_min_max_normalize(green_raw)
    water_norm = log_min_max_normalize(water_raw)

    results = {}
    print(f"\n  {'Şehir':<14} {'Yeşil%':>8} {'Su%':>8} │ {'⭐ YILDIZ':>10}")
    print("  " + "─" * 40 + "┤" + "─" * 11)

    for city in raw_data:
        g        = green_norm[city]
        w        = water_norm[city]
        raw_100  = g * W_GREEN + w * W_WATER          # 0–100 arası ara değer
        stars    = round(1.0 + (raw_100 / 100.0) * 4.0, 2)  # 1.0–5.0

        results[city] = {
            "green_score":  g,
            "water_score":  w,
            "nature_score": stars,
            "raw": raw_data[city],
        }
        star_bar = "★" * int(stars) + "☆" * (5 - int(stars))
        print(f"  {city:<14} {g:>8.1f} {w:>8.1f} │ {stars:>5.2f}  {star_bar}")

    best  = max(results, key=lambda c: results[c]["nature_score"])
    worst = min(results, key=lambda c: results[c]["nature_score"])
    print(f"\n  🏆 En yüksek: {best} ({results[best]['nature_score']:.2f} ⭐)")
    print(f"  ⚠️  En düşük:  {worst} ({results[worst]['nature_score']:.2f} ⭐)")

    return results

def db_write_nature_scores(scores: dict) -> None:

    print("\n" + "═" * 60)
    print("  🗄  VERİTABANI GÜNCELLEME")
    print("═" * 60)

    with psycopg2.connect(**DB) as conn, conn.cursor() as cur:

        try:
            cur.execute("ALTER TABLE cities ADD COLUMN IF NOT EXISTS nature_score NUMERIC(4,2);")
            conn.commit()
            print("  ✓ nature_score sütunu kontrol edildi\n")
        except psycopg2.errors.InsufficientPrivilege:
            conn.rollback()
            print("  ⚠️  ALTER TABLE yetkisi yok — sütun önceden oluşturulmuş olmalı.\n")

        cur.execute("SELECT id, city_name FROM cities;")
        existing = {name: cid for cid, name in cur.fetchall()}

        updated = 0
        for city, data in sorted(scores.items()):
            ns = data["nature_score"]
            if city in existing:
                cur.execute(
                    "UPDATE cities SET nature_score = %s WHERE id = %s;",
                    (ns, existing[city])
                )
                status = "UPDATE"
            else:
                cur.execute(
                    "INSERT INTO cities (city_name, nature_score) VALUES (%s, %s);",
                    (city, ns)
                )
                status = "INSERT"
            print(f"  {status:6}  {city:<14}  nature_score = {ns:.2f}")
            updated += 1

        conn.commit()

        cur.execute("SELECT id, city_name, nature_score FROM cities WHERE city_name = ANY(%s) ORDER BY nature_score DESC NULLS LAST;", (list(scores.keys()),))

        print(f"\n  ─── Veritabanı Doğrulama ────────────────────")
        print(f"  {'id':>3}  {'Şehir':<14}  {'nature_score':>12}")
        print("  " + "─" * 35)
        for row in cur.fetchall():
            score_str = f"{row[2]:.2f}" if row[2] is not None else "─"
            print(f"  {row[0]:>3}  {row[1]:<14}  {score_str:>12}")
        print(f"\n  ✓ {updated} satır güncellendi")

def main():
    print("\n" + "█" * 60)
    print("  OwnWay — Nature Score ETL")
    print("  Şehirler: " + ", ".join(CITY_CONFIG.keys()))
    print(f"  Kaynak  : OpenStreetMap Overpass API")
    print(f"  Ağırlık : Yeşil Alan %{W_GREEN*100:.1f}  |  Su Unsurları %{W_WATER*100:.1f}")
    print(f"  Ölçek   : 1.0 – 5.0 ⭐ (yıldız)")
    print("█" * 60)

    raw_data = collect_all_raw_data()

    with open("nature_raw_data.json", "w", encoding="utf-8") as f:
        json.dump(raw_data, f, ensure_ascii=False, indent=2)
    print("\n  → nature_raw_data.json kaydedildi")

    scores = calculate_nature_scores(raw_data)

    with open("nature_scores.json", "w", encoding="utf-8") as f:
        json.dump(scores, f, ensure_ascii=False, indent=2)
    print("  → nature_scores.json kaydedildi")

    try:
        db_write_nature_scores(scores)
        print("\n  ✅ ETL başarıyla tamamlandı.")
    except psycopg2.Error as e:
        print(f"\n  [DB HATA] {e}")
        print("  → Skorlar nature_scores.json dosyasına kaydedildi.")
        print("  → DB'ye manuel yüklemek için:")
        for city, data in sorted(scores.items()):
            ns = data["nature_score"]
            print(f"     UPDATE cities SET nature_score = {ns}"
                  f" WHERE city_name = '{city}';")

if __name__ == "__main__":
    main()
