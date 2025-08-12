import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

// Dummy dealership data
const dealerships = [
  { name: "City Motors", city: "Chicago", lat: 41.8781, lng: -87.6298, website: "https://example.com/chicago" },
  { name: "Sunshine Auto", city: "Miami", lat: 25.7617, lng: -80.1918, website: "https://example.com/miami" },
  { name: "Bay Area Cars", city: "San Francisco", lat: 37.7749, lng: -122.4194, website: "https://example.com/sf" }
];

app.get("/api/dealerships", (req, res) => {
  res.json(dealerships);
});

app.listen(5000, () => {
  console.log("✅ Backend running on http://localhost:5000");
});

