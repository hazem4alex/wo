#!/usr/bin/env python3
"""
Import area.csv, office.csv, consumer.csv into the database.
Run from project root: python3 scripts/import_csv.py
"""

import csv, io, sys, os, re
from datetime import datetime

try:
    import psycopg2
    import psycopg2.extras
except ImportError:
    print("Installing psycopg2-binary...")
    os.system("pip3 install psycopg2-binary -q")
    import psycopg2
    import psycopg2.extras

# --- Config ---
# Reads DATABASE_URL from environment. Set it via:
#   export DATABASE_URL="postgresql://user:password@host:port/dbname"
# or include it in a .env file (not committed).
DB_URL = os.environ.get("DATABASE_URL")
if not DB_URL:
    print("ERROR: DATABASE_URL environment variable is not set.")
    print("Set it with: export DATABASE_URL='postgresql://...'")
    sys.exit(1)

AREA_CSV    = os.environ.get("AREA_CSV", "/Users/Hazem/Desktop/WO/area.csv")
OFFICE_CSV  = os.environ.get("OFFICE_CSV", "/Users/Hazem/Desktop/WO/office.csv")
CONSUMER_CSV = os.environ.get("CONSUMER_CSV", "/Users/Hazem/Desktop/WO/consumer.csv")

def read_utf16(path):
    """Read a UTF-16 LE CSV file, strip BOM, return list of dicts."""
    with open(path, 'rb') as f:
        raw = f.read()
    text = raw.decode('utf-16-le').lstrip('﻿')
    reader = csv.DictReader(io.StringIO(text))
    rows = []
    for row in reader:
        rows.append({k.strip().lstrip('﻿'): v.strip() for k, v in row.items()})
    return rows

def strip_bom(s):
    return s.lstrip('﻿').strip()

conn = psycopg2.connect(DB_URL)
conn.autocommit = False
cur = conn.cursor()

# ── Governorate mapping ──────────────────────────────────────────────────────
cur.execute("SELECT id, name_ar FROM governorate ORDER BY name_ar")
govs = cur.fetchall()
print(f"Found {len(govs)} governorates:")
for g in govs:
    print(f"  {g[1]} → {g[0]}")

# CSV govern codes → DB UUIDs
# govern=1 → حولي, govern=2 → الأحمدي, govern=3 → مبارك الكبير
gov_map = {}
for gid, name in govs:
    if 'حولي' in name:
        gov_map['1'] = str(gid)
    elif 'حمدي' in name or 'أحمدي' in name:
        gov_map['2'] = str(gid)
    elif 'مبارك' in name:
        gov_map['3'] = str(gid)

if len(gov_map) != 3:
    print("ERROR: Could not map all 3 governorates. Found:", gov_map)
    sys.exit(1)
print(f"\nGovernorate map: {gov_map}")

# ── 1. Import areas ──────────────────────────────────────────────────────────
area_rows = read_utf16(AREA_CSV)
print(f"\nImporting {len(area_rows)} areas...")

area_code_to_uuid = {}  # CSV code → inserted area UUID
area_code_to_office_code = {}  # area code → office code (from CSV)

inserted_areas = 0
for row in area_rows:
    code    = strip_bom(row.get('code', ''))
    govern  = row.get('govern', '').strip()
    name_ar = row.get('namear', '').strip()
    name_en = row.get('nameen', '').strip() or name_ar
    office  = row.get('office', '').strip()

    if not code or not govern or not name_ar:
        continue

    gov_id = gov_map.get(govern)
    if not gov_id:
        print(f"  WARN: Unknown govern={govern} for area code={code}")
        continue

    area_code_to_office_code[code] = office

    cur.execute(
        """INSERT INTO area (governorate_id, name_ar, name_en)
           VALUES (%s, %s, %s)
           ON CONFLICT DO NOTHING
           RETURNING id""",
        (gov_id, name_ar, name_en)
    )
    result = cur.fetchone()
    if result:
        area_code_to_uuid[code] = str(result[0])
        inserted_areas += 1
    else:
        # Already exists — fetch it
        cur.execute("SELECT id FROM area WHERE name_ar=%s AND governorate_id=%s", (name_ar, gov_id))
        existing = cur.fetchone()
        if existing:
            area_code_to_uuid[code] = str(existing[0])

conn.commit()
print(f"  ✓ Inserted {inserted_areas} areas")

# ── 2. Import offices ────────────────────────────────────────────────────────
office_rows = read_utf16(OFFICE_CSV)
print(f"\nImporting {len(office_rows)} offices...")

# Build office code → area UUID mapping:
# For each office code, find all areas that reference it and use the first one
office_code_to_area_uuid = {}
for area_code, off_code in area_code_to_office_code.items():
    if off_code not in office_code_to_area_uuid and area_code in area_code_to_uuid:
        office_code_to_area_uuid[off_code] = area_code_to_uuid[area_code]

office_code_to_uuid = {}
inserted_offices = 0
for row in office_rows:
    code    = strip_bom(row.get('code', ''))
    name_ar = row.get('namear', '').strip()
    name_en = row.get('nameen', '').strip() or name_ar

    if not code or not name_ar:
        continue

    area_id = office_code_to_area_uuid.get(code)
    if not area_id:
        print(f"  WARN: No area found for office code={code}, skipping")
        continue

    cur.execute(
        """INSERT INTO office (area_id, code, name_ar, name_en, is_active)
           VALUES (%s, %s, %s, %s, true)
           ON CONFLICT (code) DO UPDATE SET name_ar=EXCLUDED.name_ar, name_en=EXCLUDED.name_en
           RETURNING id""",
        (area_id, code, name_ar, name_en)
    )
    result = cur.fetchone()
    if result:
        office_code_to_uuid[code] = str(result[0])
        inserted_offices += 1

conn.commit()
print(f"  ✓ Inserted/updated {inserted_offices} offices")

# ── 3. Import consumers ──────────────────────────────────────────────────────
# Consumer CSV has no area/office info — assign to first area + first office
if not area_code_to_uuid:
    print("\nERROR: No areas imported, cannot import consumers")
    sys.exit(1)

# Use first area (code=1) and its office
default_area_code = sorted(area_code_to_uuid.keys(), key=lambda x: int(x))[0]
default_area_id = area_code_to_uuid[default_area_code]
default_office_code = area_code_to_office_code.get(default_area_code, '1')
default_office_id = office_code_to_uuid.get(default_office_code)

if not default_office_id:
    default_office_id = list(office_code_to_uuid.values())[0]

print(f"\nDefault area_id={default_area_id}, office_id={default_office_id}")
print(f"Importing consumers from CSV ({CONSUMER_CSV})...")

with open(CONSUMER_CSV, 'rb') as f:
    raw = f.read()
text = raw.decode('utf-16-le').lstrip('﻿')
reader = csv.DictReader(io.StringIO(text))

batch = []
total = 0
skipped = 0
BATCH_SIZE = 500

for row in reader:
    csv_id   = strip_bom(row.get('id', '') or row.get('﻿id', '')).strip()
    civil_id = row.get('civil_id', '').strip()
    name_a   = row.get('name_a', '').strip()
    phone    = (row.get('phone_no', '') or row.get('mobile_no', '')).strip()
    reg_date = row.get('reg_date', '').strip()

    if not name_a:
        skipped += 1
        continue

    # consumer_no must be unique — use the original id from CSV
    consumer_no = csv_id if csv_id else str(total + 1)

    # Parse date DD/MM/YYYY
    created_at = None
    if reg_date:
        try:
            created_at = datetime.strptime(reg_date, '%d/%m/%Y')
        except ValueError:
            pass

    batch.append((
        default_office_id,
        default_area_id,
        consumer_no,
        name_a,
        civil_id or None,
        phone or None,
        created_at or datetime.now(),
    ))
    total += 1

    if len(batch) >= BATCH_SIZE:
        psycopg2.extras.execute_values(
            cur,
            """INSERT INTO consumer
               (office_id, area_id, consumer_no, full_name, national_id, phone, created_at)
               VALUES %s
               ON CONFLICT (consumer_no) DO NOTHING""",
            batch,
        )
        conn.commit()
        batch = []
        print(f"  ... {total} consumers imported", end='\r')

# Final batch
if batch:
    psycopg2.extras.execute_values(
        cur,
        """INSERT INTO consumer
           (office_id, area_id, consumer_no, full_name, national_id, phone, created_at)
           VALUES %s
           ON CONFLICT (consumer_no) DO NOTHING""",
        batch,
    )
    conn.commit()

print(f"\n  ✓ Inserted {total} consumers ({skipped} skipped — no name)")
print("\n✅ Import complete!")
cur.close()
conn.close()
