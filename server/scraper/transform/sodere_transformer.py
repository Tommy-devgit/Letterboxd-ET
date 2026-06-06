import json


# -----------------------------
# CLASSIFIER (STEP 1)
# -----------------------------
def classify_item(item):
    entity = item.get("entity", {}) or {}

    title = entity.get("title") or item.get("title") or ""
    slug = entity.get("slug") or ""

    if "trailer" in title.lower() or "trailer" in slug.lower():
        return "TRAILER"

    if item.get("type") == "video":
        return "VIDEO"

    return "UNKNOWN"


# -----------------------------
# TRANSFORMER
# -----------------------------
def extract_movies(file_path):
    movies = []

    with open(file_path, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue

            entry = json.loads(line)

            url = entry["url"]
            data = entry["data"]

            # Only process collection items feed
            if "collections" in url and "items" in url:
                items = data.get("items", [])

                for item in items:
                    entity = item.get("entity", {}) or {}

                    # -----------------------------
                    # TITLE EXTRACTION (robust)
                    # -----------------------------
                    title = (
                        entity.get("title")
                        or entity.get("name")
                        or item.get("title")
                    )

                    # -----------------------------
                    # THUMBNAIL EXTRACTION (safe)
                    # -----------------------------
                    thumbnail = None
                    if isinstance(entity.get("thumbnail"), dict):
                        thumbnail = entity["thumbnail"].get("large")

                    # -----------------------------
                    # BUILD NORMALIZED OBJECT
                    # -----------------------------
                    movies.append({
                        "externalId": entity.get("id") or item.get("id"),
                        "title": title,
                        "slug": entity.get("slug"),
                        "thumbnail": thumbnail,
                        "type": entity.get("type") or item.get("type"),

                        # 🔥 CLASSIFICATION ADDED
                        "contentType": classify_item(item),

                        "source": "sodere",
                        "rawUrl": url
                    })

    print(f"Extracted: {len(movies)} movies")
    return movies


# -----------------------------
# DEBUG RUN
# -----------------------------
if __name__ == "__main__":
    movies = extract_movies("scraper/storage/sodere.jsonl")
    print(movies[:5])