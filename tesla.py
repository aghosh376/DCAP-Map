import requests
import json
import time
import re

API_KEY = "AIzaSyC6KDgRCgr8uAipghnPRpaCLREyWUhtKb0"  # <-- Replace with your Google Places API key
OUTPUT_FILE = "tesla.json"

# Major California cities to avoid Google result caps
CITIES = [
    "Los Angeles", "San Francisco", "San Diego", "Sacramento", "San Jose",
    "Fresno", "Oakland", "Bakersfield", "Long Beach", "Santa Ana",
    "Irvine", "Pasadena", "Anaheim", "Fremont", "Riverside",
    "Modesto", "Stockton", "Chula Vista", "Santa Clara", "Sunnyvale"
]

def fetch_places(query, api_key):
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {"query": query, "key": api_key}
    all_results = []

    while True:
        print(f"Fetching page: {params.get('pagetoken', 'first')}")
        resp = requests.get(url, params=params)
        data = resp.json()

        if data.get("status") not in ("OK", "ZERO_RESULTS"):
            print(f"API error: {data.get('status')}, {data.get('error_message')}")
            break

        for place in data.get("results", []):
            details = fetch_place_details(place["place_id"], api_key)
            if not details:
                continue

            name = details.get("name", "").lower()
            address = details.get("formatted_address", "")

            # Address filter (California or CA)
            if not re.search(r"(california|, ca\b)", address.lower()):
                continue

            # Filter out service centers & galleries
            if "service" in name or "gallery" in name:
                continue
            if "tesla" not in name:
                continue

            all_results.append({
                "name": details.get("name"),
                "placeId": details.get("place_id"),
                "website": details.get("website")
            })

        # Check for next page
        next_page_token = data.get("next_page_token")
        if not next_page_token:
            break
        time.sleep(2)  # required by Google before next page fetch
        params = {"pagetoken": next_page_token, "key": api_key}

    return all_results

def fetch_place_details(place_id, api_key):
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        "place_id": place_id,
        "fields": "name,formatted_address,website,place_id",
        "key": api_key
    }
    resp = requests.get(url, params=params).json()
    if resp.get("status") == "OK":
        return resp.get("result", {})
    return None

if __name__ == "__main__":
    all_results = []

    for city in CITIES:
        print(f"\n--- Searching in {city} ---")
        city_query = f"Tesla dealer in {city}, California"
        results = fetch_places(city_query, API_KEY)
        all_results.extend(results)

    # Deduplicate by placeId
    unique_results = {entry["placeId"]: entry for entry in all_results}
    final_list = list(unique_results.values())

    print(f"\nFound {len(final_list)} unique Tesla dealerships in California.")
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(final_list, f, indent=2)

    print(f"Saved to {OUTPUT_FILE}")
