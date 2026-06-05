import json
import os
from playwright.sync_api import sync_playwright

# Ensure storage folder exists
os.makedirs("scraper/storage", exist_ok=True)


def save(url, data):
    """
    Saves each captured API response as a JSONL entry.
    This is ingestion-friendly (data lake format).
    """
    with open("scraper/storage/sodere.jsonl", "a", encoding="utf-8") as f:
        f.write(json.dumps(
            {
                "url": url,
                "data": data
            },
            ensure_ascii=False
        ) + "\n")


def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        def handle_response(response):
            url = response.url

            # Capture only relevant VHX endpoints
            if "items" in url or "collections" in url:
                try:
                    data = response.json()

                    print("\n🔥 CAPTURED API:", url)

                    save(url, data)

                except Exception as e:
                    # silently ignore non-json responses
                    pass

        page.on("response", handle_response)

        # Load page and trigger API calls
        page.goto("https://www.sodere.com/browse", wait_until="networkidle")

        # Let additional lazy-loaded requests fire
        page.wait_for_timeout(10000)

        browser.close()


if __name__ == "__main__":
    run()