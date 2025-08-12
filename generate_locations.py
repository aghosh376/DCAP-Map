import pdfplumber
import re
import json
import requests
import time

API_KEY = "AIzaSyC6KDgRCgr8uAipghnPRpaCLREyWUhtKb0"  # <-- Replace with your Google Places API key

def parse_line(line):
    phone_match = re.search(r'\(\d{3}\)\s*\d{3}[- ]\d{4}$', line.strip())
    if not phone_match:
        return None, None

    phone = phone_match.group()
    line_wo_phone = line[:phone_match.start()].strip()

    parts = re.split(r'\s{2,}', line_wo_phone)
    if len(parts) < 2:
        parts = line_wo_phone.rsplit(' ', 1)
        if len(parts) < 2:
            return None, None

    city = parts[-1].strip()
    dealership_name = ' '.join(parts[:-1]).strip()

    if dealership_name == '' or city == '':
        return None, None

    return dealership_name, city

def extract_dealerships_from_pdf(pdf_path):
    dealerships = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if not text:
                continue
            lines = text.split('\n')
            for line in lines:
                if line.strip() == '' or 'Dealership' in line or 'Phone' in line:
                    continue
                name, city = parse_line(line)
                if name and city:
                    dealerships.append({
                        "name": name,
                        "city": city
                    })
    return dealerships

def google_places_search(name, city):
    """Search dealership on Google Places API and return place_id and website"""
    query = f"{name} {city}"
    url = f"https://maps.googleapis.com/maps/api/place/findplacefromtext/json"
    params = {
        "input": query,
        "inputtype": "textquery",
        "fields": "place_id",
        "key": API_KEY
    }
    resp = requests.get(url, params=params)
    data = resp.json()
    if data.get("candidates"):
        place_id = data["candidates"][0]["place_id"]
        # Now get place details for website
        details_url = "https://maps.googleapis.com/maps/api/place/details/json"
        details_params = {
            "place_id": place_id,
            "fields": "website",
            "key": API_KEY
        }
        details_resp = requests.get(details_url, params=details_params)
        details_data = details_resp.json()
        website = details_data.get("result", {}).get("website", None)
        return place_id, website
    return None, None

if __name__ == "__main__":
    pdf_file = "backend/Dealer-List-7.18.pdf"   # Replace with your PDF file path
    output_json = "dealerships_with_places2.json"

    dealerships = extract_dealerships_from_pdf(pdf_file)
    print(f"Extracted {len(dealerships)} dealerships.")

    results = []
    for idx, d in enumerate(dealerships):
        place_id, website = google_places_search(d['name'], d['city'])
        print(f"{idx+1}/{len(dealerships)}: {d['name']} in {d['city']} -> place_id: {place_id}, website: {website}")
        results.append({
            "name": d['name'],
            "placeId": place_id,
            "website": website
        })
        time.sleep(0.1)  # To avoid hitting API rate limits

    with open(output_json, 'w') as f:
        json.dump(results, f, indent=2)

    print(f"Saved enriched dealerships to {output_json}")
