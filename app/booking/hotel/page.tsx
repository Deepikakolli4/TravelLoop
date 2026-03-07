"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Hotel, MapPin, Calendar } from "lucide-react";

export default function HotelSearchPage() {

  const router = useRouter();
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [showHotels, setShowHotels] = useState(false);
  const [bookedHotel, setBookedHotel] = useState<number | null>(null);

  const hotels = [
    {
      name: "Taj Palace Hotel",
      location: "Delhi",
      price: "₹7,999 / night",
      rating: "4.8 ⭐",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945"
    },
    {
      name: "Grand Residency",
      location: "Hyderabad",
      price: "₹4,599 / night",
      rating: "4.5 ⭐",
      image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa"
    },
    {
      name: "Ocean View Resort",
      location: "Goa",
      price: "₹6,299 / night",
      rating: "4.7 ⭐",
      image: "https://images.unsplash.com/photo-1501117716987-c8e1ecb210e6"
    },
    {
      name: "City Comfort Inn",
      location: "Chennai",
      price: "₹3,499 / night",
      rating: "4.3 ⭐",
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"
    },
    {
      name: "Royal Stay Hotel",
      location: "Mumbai",
      price: "₹5,999 / night",
      rating: "4.6 ⭐",
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
    },
    {
      name: "Green Leaf Suites",
      location: "Pune",
      price: "₹3,999 / night",
      rating: "4.2 ⭐",
      image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be"
    },
    {
      name: "Hilltop Luxury Hotel",
      location: "Ooty",
      price: "₹6,899 / night",
      rating: "4.9 ⭐",
      image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-5 flex flex-col items-center">

      {/* Header */}
      <div className="w-full max-w-lg flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="text-lg font-bold text-gray-700 hover:text-gray-900"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Hotel className="text-indigo-500" />
          Hotel Booking
        </h1>
      </div>

      {/* Search Card */}
      <div className="w-full max-w-lg bg-white p-6 rounded-xl shadow-lg">
        <div className="space-y-4">

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter City"
              className="border pl-10 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border pl-10 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <button
            onClick={() => setShowHotels(true)}
            className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Search Hotels
          </button>
        </div>
      </div>

      {/* Show Hotels After Search */}
      {showHotels && (
        <div className="w-full max-w-5xl mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {hotels.map((hotel, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
            >
              <img
                src={hotel.image}
                alt={hotel.name}
                className="w-full h-48 object-cover"
              />

              <div className="p-4">
                <h2 className="text-lg font-bold text-indigo-600">
                  {hotel.name}
                </h2>
                <p className="text-gray-600 text-sm">
                  📍 {hotel.location}
                </p>
                <p className="text-gray-500 text-sm">
                  ⭐ {hotel.rating}
                </p>

                <div className="flex justify-between items-center mt-4">
                  <p className="text-lg font-semibold text-gray-800">
                    {hotel.price}
                  </p>

                  {bookedHotel === index ? (
                    <p className="text-green-600 font-semibold">
                      ✅ Booking Confirmed
                    </p>
                  ) : (
                    <button
                      onClick={() => setBookedHotel(index)}
                      className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition"
                    >
                      Book Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}