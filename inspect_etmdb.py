import sqlite3
import json

db_path = r'd:\Code\Letterboxd-ET\etmdb.db'
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

# ========== 1. ALL OBJECTS ==========
cur.execute("SELECT name, type FROM sqlite_master WHERE type IN ('table','view') ORDER BY type, name")
objects = cur.fetchall()
print("=== TABLES AND VIEWS ===")
for obj in objects:
    print(f"  [{obj['type'].upper()}] {obj['name']}")

# ========== 2. ALL INDEXES ==========
print("\n=== INDEXES ===")
cur.execute("SELECT name, tbl_name, sql FROM sqlite_master WHERE type='index' ORDER BY tbl_name, name")
for idx in cur.fetchall():
    print(f"  {idx['tbl_name']}.{idx['name']}")

# ========== 3. SCHEMA FOR EVERY TABLE ==========
print("\n=== TABLE SCHEMAS ===")
cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tables = [row['name'] for row in cur.fetchall()]

for tbl in tables:
    cur.execute(f"PRAGMA table_info({tbl})")
    cols = cur.fetchall()
    cur.execute(f"PRAGMA foreign_key_list({tbl})")
    fks = cur.fetchall()
    cur.execute(f"SELECT COUNT(*) as cnt FROM [{tbl}]")
    count = cur.fetchone()['cnt']

    print(f"\n--- TABLE: {tbl} (rows: {count}) ---")
    for col in cols:
        pk_marker = " [PK]" if col['pk'] else ""
        null_marker = " NOT NULL" if col['notnull'] else " NULL"
        default = f" DEFAULT={col['dflt_value']}" if col['dflt_value'] is not None else ""
        print(f"  {col['name']:40s} {col['type']:20s}{pk_marker}{null_marker}{default}")

    if fks:
        print(f"  Foreign Keys:")
        for fk in fks:
            print(f"    {fk['from']} -> {fk['table']}.{fk['to']}")

# ========== 4. ROW COUNTS ==========
print("\n=== ROW COUNTS ===")
for tbl in tables:
    cur.execute(f"SELECT COUNT(*) as cnt FROM [{tbl}]")
    count = cur.fetchone()['cnt']
    print(f"  {tbl:50s} {count:>8,}")

conn.close()
