// fetchPlaces.js
import fs from 'fs/promises';
import fetch from 'node-fetch';

const API_KEY = 'AIzaSyC6KDgRCgr8uAipghnPRpaCLREyWUhtKb0'; // Google Places API key
const INPUT_FILE = './dealerships_with_places.json'; // input JSON
const OUTPUT_FILE = './enriched_dealerships.json'; // output JSON

async function loadLocations() {
  const raw = await fs.readFile(INPUT_FILE, 'utf-8');
  return JSON.parse(raw);
}

async function fetchPlaceDetails(placeId) {
  const fields = [
    'name',
    'formatted_address',
    'geometry/location',
    'rating',
    'user_ratings_total',
    'photos',
    'website'
  ].join(',');

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${fields}&key=${API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP error ${res.status}`);
  }

  const data = await res.json();
  if (data.status !== 'OK') {
    console.warn(`Place ID ${placeId} returned status: ${data.status}`);
    return null;
  }

  return data.result;
}

async function enrichLocations() {
  const locations = await loadLocations();
  const enriched = [];

  for (const loc of locations) {
    console.log(`Fetching details for: ${loc.name} (${loc.placeId})`);
    const details = await fetchPlaceDetails(loc.placeId);

    if (details) {
      enriched.push({
        name: loc.name,
        placeId: loc.placeId,
        website: loc.website || details.website || null,
        displayName: details.name,
        formattedAddress: details.formatted_address,
        location: details.geometry?.location || null,
        rating: details.rating || null,
        userRatingCount: details.user_ratings_total || null,
        photos: details.photos?.map(p => p.photo_reference) || []
      });
    }
  }

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(enriched, null, 2));
  console.log(`Saved ${enriched.length} enriched locations to ${OUTPUT_FILE}`);
}

enrichLocations().catch(console.error);
