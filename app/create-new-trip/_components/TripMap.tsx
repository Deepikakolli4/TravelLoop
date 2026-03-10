"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const TripMap = ({ itinerary }: any) => {

  if (!itinerary) return null;

  const locations = itinerary.flatMap((day: any) =>
    day.activities.map((a: any) => ({
      name: a.place_name,
      lat: a.geo_coordinates?.latitude,
      lng: a.geo_coordinates?.longitude
    }))
  );

  if (!locations.length) return null;

  return (
    <div className="h-[400px] rounded-xl overflow-hidden shadow">

      <MapContainer
        center={[locations[0].lat, locations[0].lng]}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {locations.map((loc: any, i: number) => (
          <Marker key={i} position={[loc.lat, loc.lng]}>
            <Popup>{loc.name}</Popup>
          </Marker>
        ))}

      </MapContainer>

    </div>
  );
};

export default TripMap;