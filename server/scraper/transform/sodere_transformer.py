import json


def extract_movies(file_path):
    movies = []

    with open(file_path, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue

            entry = json.loads(line)

            url = entry["url"]
            data = entry["data"]

            if "collections" in url and "items" in url:
                items = data.get("items", [])

                for item in items:
                    entity = item.get("entity", {})

                    # 🔥 FIX: fallback chain (VERY IMPORTANT)
                    title = (
                        entity.get("title")
                        or entity.get("name")
                        or item.get("title")
                    )

                    thumbnail = (
                        (entity.get("thumbnail") or {}).get("large")
                        if isinstance(entity.get("thumbnail"), dict)
                        else None
                    )

                    movies.append({
                        "externalId": entity.get("id") or item.get("id"),
                        "title": title,
                        "slug": entity.get("slug"),
                        "thumbnail": thumbnail,
                        "type": entity.get("type") or item.get("type"),
                        "source": "sodere",
                        "rawUrl": url
                    })

    print(f"Extracted: {len(movies)} movies")
    return movies


if __name__ == "__main__":
    movies = extract_movies("scraper/storage/sodere.jsonl")
    print(movies[:5])