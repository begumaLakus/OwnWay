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

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", line_buffering=True)
load_dotenv()



CITIES = ["İstanbul", "Ankara", "İzmir", "Antalya", "Konya", "Erzurum", "Zonguldak"]

W_LIBRARY = 0.15
W_SPORTS  = 0.15
W_CINEMA  = 0.20
W_MALL    = 0.15
W_FOOD    = 0.20
W_STADIUM = 0.15

OVERPASS_MIRRORS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
]

def _overpass_area_query_count(city: str, tags: list) -> str:

    lines = []
    for tag in tags:
        for k, v in tag.items():
            lines.append(f'  node["{k}"="{v}"](area.searchArea);')
            lines.append(f'  way["{k}"="{v}"](area.searchArea);')
            lines.append(f'  relation["{k}"="{v}"](area.searchArea);')

    return (
        f'[out:json][timeout:180];\n'
        f'area["name"="{city}"]["admin_level"="4"]->.searchArea;\n'
        f'(\n' + '\n'.join(lines) + '\n);\n'
        f'out count;'
    )

def fetch_osm_count(query: str, city: str, label: str) -> int:

    for mi, url in enumerate(OVERPASS_MIRRORS):
        for attempt in range(1, 4):
            try:
                resp = requests.post(
                    url,
                    data={"data": query},
                    timeout=180,
                    headers={"User-Agent": "OwnWaySocialScore/1.0 (bitirme projesi)"},
                )
                if resp.status_code == 429:
                    wait = attempt * 20
                    print(f"    [429] Rate limit — {wait}s bekleniyor...", flush=True)
                    time.sleep(wait)
                    continue
                resp.raise_for_status()
                try:
                    data = resp.json()
                except json.JSONDecodeError:
                    print(f"    [UYARI] {city}/{label}: JSON çözümleme hatası (mirror {mi+1})", flush=True)
                    time.sleep(10)
                    continue

                elements = data.get("elements", [])
                total = elements[0].get("tags", {}).get("total", 0) if elements else 0
                return int(total)
            except requests.exceptions.Timeout:
                print(f"    [UYARI] {city}/{label}: timeout (mirror {mi+1}, deneme {attempt})", flush=True)
                time.sleep(10)
            except requests.exceptions.RequestException as e:
                print(f"    [UYARI] {city}/{label}: istek hatası (mirror {mi+1})", flush=True)
                time.sleep(10)
        if mi < len(OVERPASS_MIRRORS) - 1:
            print(f"    → Mirror {mi+1} başarısız, mirror {mi+2} deneniyor...", flush=True)

    print(f"    [HATA] {city}/{label}: tüm mirror'lar başarısız → 0", flush=True)
    return 0

TAGS_LIBRARY = [{"amenity": "library"}]
TAGS_SPORTS  = [{"leisure": "sports_centre"}]
TAGS_CINEMA  = [{"amenity": "cinema"}, {"amenity": "theatre"}]
TAGS_MALL    = [{"shop": "mall"}]
TAGS_FOOD    = [{"amenity": "restaurant"}, {"amenity": "cafe"}]
TAGS_STADIUM = [{"leisure": "stadium"}]

def collect_social_data() -> dict:

    data = {}
    print("\n" + "═" * 62)
    print("  📡 OSM VERİ TOPLAMA  (OpenStreetMap Overpass API | admin_level=4)")
    print("═" * 62)

    for city in CITIES:
        print(f"\n  🏙  {city}...")

        q_lib = _overpass_area_query_count(city, TAGS_LIBRARY)
        c_lib = fetch_osm_count(q_lib, city, "kütüphane")
        print(f"    📚 Kütüphane: {c_lib:,}")
        time.sleep(5)

        q_spo = _overpass_area_query_count(city, TAGS_SPORTS)
        c_spo = fetch_osm_count(q_spo, city, "spor tesisi")
        print(f"    🏋️ Spor Tesisi: {c_spo:,}")
        time.sleep(5)

        q_cin = _overpass_area_query_count(city, TAGS_CINEMA)
        c_cin = fetch_osm_count(q_cin, city, "sinema/tiyatro")
        print(f"    🎬 Sinema/Tiyatro: {c_cin:,}")
        time.sleep(5)

        q_mal = _overpass_area_query_count(city, TAGS_MALL)
        c_mal = fetch_osm_count(q_mal, city, "AVM")
        print(f"    🛒 AVM: {c_mal:,}")
        time.sleep(5)

        q_foo = _overpass_area_query_count(city, TAGS_FOOD)
        c_foo = fetch_osm_count(q_foo, city, "restoran/kafe")
        print(f"    🍽️ Rest. & Kafe: {c_foo:,}")
        time.sleep(5)

        q_sta = _overpass_area_query_count(city, TAGS_STADIUM)
        c_sta = fetch_osm_count(q_sta, city, "stadyum")
        print(f"    🏟️ Stadyum: {c_sta:,}")
        time.sleep(5)

        data[city] = {
            "library_count": c_lib,
            "sports_count":  c_spo,
            "cinema_count":  c_cin,
            "mall_count":    c_mal,
            "food_count":    c_foo,
            "stadium_count": c_sta
        }

    return data

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

def calculate_social_scores(raw_data: dict) -> dict:

    print("\n" + "═" * 62)
    print("  🔢 SKOR HESAPLAMA")
    print(f"  Ağırlıklar: Ktp({W_LIBRARY*100:.0f}%) | Spor({W_SPORTS*100:.0f}%) | "
          f"Snm({W_CINEMA*100:.0f}%) | AVM({W_MALL*100:.0f}%) | Ymk({W_FOOD*100:.0f}%) | Std({W_STADIUM*100:.0f}%)")
    print("═" * 62)

    lib_norm = log_min_max({c: raw_data[c]["library_count"] for c in CITIES})
    spo_norm = log_min_max({c: raw_data[c]["sports_count"] for c in CITIES})
    cin_norm = log_min_max({c: raw_data[c]["cinema_count"] for c in CITIES})
    mal_norm = log_min_max({c: raw_data[c]["mall_count"] for c in CITIES})
    foo_norm = log_min_max({c: raw_data[c]["food_count"] for c in CITIES})
    sta_norm = log_min_max({c: raw_data[c]["stadium_count"] for c in CITIES})

    print(f"\n  {'Şehir':<14} {'Ktp%':>5} {'Spr%':>5} {'Snm%':>5} {'A%':>5} {'Ymk%':>5} {'St%':>5} │ {'⭐ Yıldız':>10}")
    print("  " + "─" * 53 + "┤" + "─" * 13)

    results = {}
    for city in CITIES:
        l = lib_norm[city]
        s = spo_norm[city]
        c = cin_norm[city]
        m = mal_norm[city]
        f = foo_norm[city]
        t = sta_norm[city] # stadium

        raw = (l * W_LIBRARY + s * W_SPORTS + c * W_CINEMA + 
               m * W_MALL + f * W_FOOD + t * W_STADIUM)
        stars = round(1.0 + (raw / 100.0) * 4.0, 2)
        bar   = "★" * int(stars) + "☆" * (5 - int(stars))

        print(f"  {city:<14} {l:>5.0f} {s:>5.0f} {c:>5.0f} {m:>5.0f} {f:>5.0f} {t:>5.0f} │ {stars:>6.2f}  {bar}")

        results[city] = {
            "library_count": raw_data[city]["library_count"],
            "sports_count":  raw_data[city]["sports_count"],
            "cinema_count":  raw_data[city]["cinema_count"],
            "mall_count":    raw_data[city]["mall_count"],
            "food_count":    raw_data[city]["food_count"],
            "stadium_count": raw_data[city]["stadium_count"],

            "library_norm": l,
            "sports_norm":  s,
            "cinema_norm":  c,
            "mall_norm":    m,
            "food_norm":    f,
            "stadium_norm": t,

            "social_score": stars,
        }

    best  = max(results, key=lambda c: results[c]["social_score"])
    worst = min(results, key=lambda c: results[c]["social_score"])
    print(f"\n  🏆 En yüksek: {best} ({results[best]['social_score']:.2f} ⭐)")
    print(f"  ⚠️  En düşük:  {worst} ({results[worst]['social_score']:.2f} ⭐)")

    return results

def db_write(scores: dict) -> None:

    print("\n" + "═" * 62)
    print("  🗄  VERİTABANI GÜNCELLEME")
    print("═" * 62)

    with psycopg2.connect(**DB) as conn, conn.cursor() as cur:
        try:
            cur.execute("ALTER TABLE cities ADD COLUMN IF NOT EXISTS social_score NUMERIC(4,2);")
            conn.commit()
            print("  ✓ social_score sütunu kontrol edildi\n")
        except psycopg2.errors.InsufficientPrivilege:
            conn.rollback()
            print("  ⚠️  ALTER TABLE yetkisi yok — sütun önceden oluşturulmuş olmalı.\n")

        cur.execute("SELECT id, city_name FROM cities;")
        existing = {name: cid for cid, name in cur.fetchall()}

        updated = 0
        for city, data in sorted(scores.items()):
            score = data["social_score"]
            if city in existing:
                cur.execute(
                    "UPDATE cities SET social_score = %s WHERE id = %s;",
                    (score, existing[city])
                )
                status = "UPDATE"
            else:
                cur.execute(
                    "INSERT INTO cities (city_name, social_score) VALUES (%s, %s);",
                    (city, score)
                )
                status = "INSERT"
            print(f"  {status:6}  {city:<14}  social_score = {score:.2f}")
            updated += 1

        conn.commit()

        cur.execute("SELECT id, city_name, social_score FROM cities WHERE city_name = ANY(%s) ORDER BY social_score DESC NULLS LAST;", (list(scores.keys()),))

        print(f"\n  ─── Veritabanı Doğrulama ─────────────────────────────")
        print(f"  {'id':>3}  {'Şehir':<14}  {'social_score':>12}  Bar")
        print("  " + "─" * 40)
        for row in cur.fetchall():
            s   = float(row[2]) if row[2] else 0.0
            bar = "★" * int(s) + "☆" * (5 - int(s))
            print(f"  {row[0]:>3}  {row[1]:<14}  {s:>12.2f}  {bar}")
        print(f"\n  ✅ {updated} satır güncellendi")

def main():
    print("\n" + "█" * 62)
    print("  OwnWay — Social Score ETL")
    print("  Şehirler: " + ", ".join(CITIES))
    print("  Alan Sınırı: admin_level=4 (İl Sınırı)")
    print("  Normalizasyon: Log-Min-Max  |  Çıktı: 1.0 – 5.0 ⭐")
    print("█" * 62)

    raw_data = collect_social_data()
    with open("social_raw_data.json", "w", encoding="utf-8") as f:
        json.dump(raw_data, f, ensure_ascii=False, indent=2)
    print("\n  → social_raw_data.json kaydedildi")

    scores = calculate_social_scores(raw_data)
    with open("social_scores.json", "w", encoding="utf-8") as f:
        json.dump(scores, f, ensure_ascii=False, indent=2)
    print("  → social_scores.json kaydedildi")

    try:
        db_write(scores)
        print("\n  ✅ ETL başarıyla tamamlandı.")
    except psycopg2.Error as e:
        print(f"\n  [DB HATA] {e}")

if __name__ == "__main__":
    main()
