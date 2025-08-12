/*import React, { useState, useEffect, useCallback } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import "./App.css";

function App() {
  const [dealerships, setDealerships] = useState([]);
  const [selected, setSelected] = useState(null);
  const [mapRef, setMapRef] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/dealerships")
      .then(res => res.json())
      .then(data => setDealerships(data))
      .catch(err => console.error("Error fetching dealerships:", err));
  }, []);

  const onMapLoad = useCallback((map) => {
    setMapRef(map);
  }, []);

  const flyTo = (lat, lng) => {
    if (mapRef) {
      mapRef.panTo({ lat, lng });
      mapRef.setZoom(10);
    }
  };

  const containerStyle = { width: "100%", height: "100%" };
  const center = { lat: 39.8283, lng: -98.5795 }; // US center

  return (
    <div className="app-container">
      <aside className="sidebar">
        <h2>Dealership Finder</h2>
        <ul>
          {dealerships.map((dealer, i) => (
            <li key={i} onClick={() => flyTo(dealer.lat, dealer.lng)}>
              {dealer.name} <span className="city">{dealer.city}</span>
            </li>
          ))}
        </ul>
      </aside>

      <main className="map-container">
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_API_KEY}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={4}
            onLoad={onMapLoad}
          >
            {dealerships.map((dealer, i) => (
              <Marker
                key={i}
                position={{ lat: dealer.lat, lng: dealer.lng }}
                onClick={() => setSelected(dealer)}
              />
            ))}

            {selected && (
              <InfoWindow
                position={{ lat: selected.lat, lng: selected.lng }}
                onCloseClick={() => setSelected(null)}
              >
                <div>
                  <h3>{selected.name}</h3>
                  <p>{selected.city}</p>
                  <a href={selected.website} target="_blank" rel="noopener noreferrer">
                    Visit Website
                  </a>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </main>
    </div>
  );
}

export default App;*//*

import React from 'react';
import { APIProvider, Map } from '@vis.gl/react-google-maps';

const App = () => {
  // Move API key to environment variable for security
  const apiKey = '';

  // Handler functions
  const handleMapLoad = () => {
    console.log('Maps API has loaded.');
  };

  const handleCameraChange = (ev) => {
    console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom);
  };

  return (
    <div className="map-container" style={{ height: '100vh', width: '100%' }}>
      <APIProvider 
        apiKey={apiKey} 
        onLoad={handleMapLoad}
      >
        <Map
          defaultZoom={13}
          defaultCenter={{ lat: -33.860664, lng: 151.208138 }}
          onCameraChanged={handleCameraChange}
          mapId="ab749fc600c31c23b448b1c9" // Optional: Add if using styled maps
          style={{ height: '100%', width: '100%' }}
        >
          //{ You can add markers or other components here }
        </Map>
      </APIProvider>
    </div>
  );
};

export default App;*/

import React, { useState, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  DirectionsRenderer,
  Autocomplete,
  Marker,
} from "@react-google-maps/api";
import "./App.css";

const containerStyle = {
  width: "150vh",
  height: "100vh",
};

const center = {
  lat: 36.7783,
  lng: -119.4179,
};

function MyGoogleMap() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "", // Replace with your API key
    libraries: ["places"], // Include 'places' for Autocomplete
  });

  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState("");
  const [markers, setMarkers] = useState([]);
  const fromRef = useRef(null);
  const toRef = useRef(null);

  const calculateRoute = async () => {
    if (!fromRef.current || !toRef.current) return;

    const fromPlace = fromRef.current.getPlace();
    const toPlace = toRef.current.getPlace();

    if (!fromPlace || !toPlace || !fromPlace.geometry || !toPlace.geometry)
      return;

    /*const directionsService = new window.google.maps.DirectionsService();

    const result = await directionsService.route({
      origin: {
        lat: fromPlace.geometry.location.lat(),
        lng: fromPlace.geometry.location.lng(),
      },
      destination: {
        lat: toPlace.geometry.location.lat(),
        lng: toPlace.geometry.location.lng(),
      },
      travelMode: window.google.maps.TravelMode.DRIVING,
    });

    setDirectionsResponse(result);

    const distanceText = result.routes[0].legs[0].distance.text;
    setDistance(distanceText); // Extract distance from the route
    */
  };

  const handleMapClick = (event) => {
    const newMarker = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        
        <button
          onClick={calculateRoute}
          style={{
            marginLeft: "10px",
            padding: "10px 20px",
            borderRadius: "5px",
            border: "none",
            background: "#007bff",
            color: "white",
            cursor: "pointer",
          }}
        >
          Get Route
        </button>
      </div>

      {distance && (
        <div style={{ marginBottom: "10px" }}>
          <strong>Distance:</strong> {distance}
        </div>
      )}

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={7}
        onClick={handleMapClick}
      >
        {markers.map((marker, index) => (
          <Marker key={index} position={marker} />
        ))}
        {directionsResponse && (
          <DirectionsRenderer directions={directionsResponse} />
        )}
      </GoogleMap>
    </div>
  );
}

export default MyGoogleMap;