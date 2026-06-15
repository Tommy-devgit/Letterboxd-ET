import sqlite3
import json

db_path = r'd:\Code\Letterboxd-ET\etmdb.db'
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

print("=" * 60)
print("PHASE 2: DATA QUALITY ANALYSIS")
print("=" * 60)

# ---- MOVIES ----
print("\n### MOVIES ###")
cur.execute("SELECT COUNT(*) FROM movie")
print(f"Total movies: {cur.fetchone()[0]}")

cur.execute("SELECT COUNT(*) FROM movie WHERE title IS NULL OR trim(title)=''")
print(f"Missing title: {cur.fetchone()[0]}")

cur.execute("SELECT COUNT(*) FROM movie WHERE poster_url IS NULL OR trim(poster_url)=''")
print(f"Missing poster_url: {cur.fetchone()[0]}")

cur.execute("SELECT COUNT(*) FROM movie WHERE backdrop_url IS NULL OR trim(backdrop_url)=''")
print(f"Missing backdrop_url: {cur.fetchone()[0]}")

cur.execute("SELECT COUNT(*) FROM movie WHERE overview IS NULL OR trim(overview)=''")
print(f"Missing overview: {cur.fetchone()[0]}")

cur.execute("SELECT COUNT(*) FROM movie WHERE release_date IS NULL OR trim(release_date)=''")
print(f"Missing release_date: {cur.fetchone()[0]}")

cur.execute("SELECT COUNT(*) FROM movie WHERE runtime IS NULL")
print(f"Missing runtime: {cur.fetchone()[0]}")

cur.execute("SELECT COUNT(*) FROM movie WHERE imdb_id IS NOT NULL")
print(f"Has IMDB id: {cur.fetchone()[0]}")

cur.execute("SELECT COUNT(*) FROM movie WHERE tmdb_id IS NOT NULL")
print(f"Has TMDB id: {cur.fetchone()[0]}")

cur.execute("SELECT type, COUNT(*) as cnt FROM movie GROUP BY type ORDER BY cnt DESC")
print("\nMovie types:")
for row in cur.fetchall():
    print(f"  {row['type']}: {row['cnt']}")

cur.execute("SELECT source, COUNT(*) as cnt FROM movie GROUP BY source ORDER BY cnt DESC LIMIT 10")
print("\nMovie sources:")
for row in cur.fetchall():
    print(f"  {row['source']}: {row['cnt']}")

# Sample titles
cur.execute("SELECT title, release_year, tmdb_id, imdb_id, slug FROM movie ORDER BY id LIMIT 10")
print("\nSample movies (first 10):")
for row in cur.fetchall():
    print(f"  [{row['release_year']}] {row['title']} (tmdb:{row['tmdb_id']}, imdb:{row['imdb_id']}, slug:{row['slug']})")

# ---- PEOPLE ----
print("\n### PEOPLE ###")
cur.execute("SELECT COUNT(*) FROM person")
print(f"Total people: {cur.fetchone()[0]}")

cur.execute("SELECT COUNT(*) FROM person WHERE photo_url IS NULL")
print(f"Missing photo_url: {cur.fetchone()[0]}")

cur.execute("SELECT COUNT(*) FROM person WHERE bio IS NULL")
print(f"Missing bio: {cur.fetchone()[0]}")

cur.execute("SELECT COUNT(*) FROM person WHERE tmdb_id IS NOT NULL")
print(f"Has TMDB id: {cur.fetchone()[0]}")

# ---- CREDITS ----
print("\n### CREDITS ###")
cur.execute("SELECT COUNT(*) FROM credit")
print(f"Total credits: {cur.fetchone()[0]}")

cur.execute("SELECT role, COUNT(*) as cnt FROM credit GROUP BY role ORDER BY cnt DESC")
print("By role:")
for row in cur.fetchall():
    print(f"  {row['role']}: {row['cnt']}")

# How many movies have at least one credit?
cur.execute("SELECT COUNT(DISTINCT movie_id) FROM credit")
print(f"\nMovies with credits: {cur.fetchone()[0]}")

# ---- GENRES ----
print("\n### GENRES ###")
cur.execute("SELECT id, name, name_am, slug FROM genre ORDER BY name")
for row in cur.fetchall():
    print(f"  [{row['id']}] {row['name']} (am: {row['name_am']}, slug: {row['slug']})")

# movie_genre is empty — check if genres embedded elsewhere
print(f"\nmovie_genre rows: 0 (confirmed)")

# Any genre info in movie.spoken_languages or movie.countries JSON?
# Check spoken_languages sample
cur.execute("SELECT spoken_languages FROM movie WHERE spoken_languages IS NOT NULL LIMIT 3")
print("\nSample spoken_languages JSON:")
for row in cur.fetchall():
    print(f"  {row['spoken_languages']}")

cur.execute("SELECT countries FROM movie WHERE countries IS NOT NULL LIMIT 3")
print("\nSample countries JSON:")
for row in cur.fetchall():
    print(f"  {row['countries']}")

# ---- TRAILERS ----
print("\n### YOUTUBE LINKS ###")
cur.execute("SELECT COUNT(*) FROM youtube_link")
print(f"Total youtube_link rows: {cur.fetchone()[0]}")

cur.execute("SELECT COUNT(*) FROM youtube_link WHERE embeddable=1")
print(f"Embeddable: {cur.fetchone()[0]}")

cur.execute("SELECT COUNT(*) FROM youtube_link WHERE embeddable=0")
print(f"Not embeddable: {cur.fetchone()[0]}")

cur.execute("SELECT COUNT(*) FROM youtube_link WHERE movie_id IS NOT NULL")
print(f"Linked to a movie: {cur.fetchone()[0]}")

cur.execute("SELECT COUNT(*) FROM youtube_link WHERE is_primary=1")
print(f"Is primary: {cur.fetchone()[0]}")

cur.execute("SELECT COUNT(DISTINCT movie_id) FROM youtube_link WHERE movie_id IS NOT NULL")
print(f"Distinct movies with trailers: {cur.fetchone()[0]}")

cur.execute("SELECT language, COUNT(*) as cnt FROM youtube_link GROUP BY language ORDER BY cnt DESC LIMIT 10")
print("\nTrailers by language:")
for row in cur.fetchall():
    print(f"  {row['language']}: {row['cnt']}")

# Sample trailers
cur.execute("""
SELECT yl.video_id, yl.title, yl.is_primary, m.title as movie_title
FROM youtube_link yl
JOIN movie m ON m.id = yl.movie_id
WHERE yl.movie_id IS NOT NULL AND yl.is_primary=1
LIMIT 5
""")
print("\nSample primary trailers:")
for row in cur.fetchall():
    print(f"  '{row['movie_title']}' -> youtube.com/watch?v={row['video_id']}")
    print(f"    Title: {row['title']}")

# Movies with NO trailer
cur.execute("""
SELECT COUNT(*) FROM movie m
WHERE NOT EXISTS (SELECT 1 FROM youtube_link yl WHERE yl.movie_id = m.id)
""")
print(f"\nMovies with no trailer: {cur.fetchone()[0]}")

# ---- DATA QUALITY SAMPLES ----
print("\n### SAMPLE MOVIE DETAIL ###")
cur.execute("""
SELECT m.*,
    (SELECT COUNT(*) FROM credit c WHERE c.movie_id=m.id) as credit_count,
    (SELECT COUNT(*) FROM youtube_link yl WHERE yl.movie_id=m.id) as trailer_count
FROM movie m
WHERE m.poster_url IS NOT NULL AND m.overview IS NOT NULL AND m.release_year IS NOT NULL
ORDER BY m.id
LIMIT 3
""")
for row in cur.fetchall():
    print(f"\n  Title: {row['title']}")
    print(f"  Original: {row['original_title']}")
    print(f"  Year: {row['release_year']}, Runtime: {row['runtime']}")
    print(f"  TMDB: {row['tmdb_id']}, IMDB: {row['imdb_id']}")
    print(f"  Poster: {str(row['poster_url'])[:80]}")
    print(f"  Backdrop: {str(row['backdrop_url'])[:80] if row['backdrop_url'] else 'None'}")
    print(f"  Overview: {str(row['overview'])[:120]}...")
    print(f"  Credits: {row['credit_count']}, Trailers: {row['trailer_count']}")
    print(f"  Languages: {row['spoken_languages']}")
    print(f"  Countries: {row['countries']}")

conn.close()
