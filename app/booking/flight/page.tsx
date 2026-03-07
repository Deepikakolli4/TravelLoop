"use client";

import { useState } from "react";
import { Plane } from "lucide-react";

export default function FlightPage() {
  const [roundTrip, setRoundTrip] = useState(false);
  const [showFlights, setShowFlights] = useState(false);
  const [bookedFlight, setBookedFlight] = useState<number | null>(null);

  const flights = [
    {
      airline: "IndiGo",
      from: "Hyderabad",
      to: "Delhi",
      depart: "06:00 AM",
      arrive: "08:30 AM",
      duration: "2h 30m",
      price: "₹4,299",
    },
    {
      airline: "Air India",
      from: "Hyderabad",
      to: "Mumbai",
      depart: "09:15 AM",
      arrive: "11:00 AM",
      duration: "1h 45m",
      price: "₹3,850",
    },
    {
      airline: "SpiceJet",
      from: "Hyderabad",
      to: "Chennai",
      depart: "12:00 PM",
      arrive: "01:20 PM",
      duration: "1h 20m",
      price: "₹2,999",
    },
    {
      airline: "Vistara",
      from: "Hyderabad",
      to: "Bangalore",
      depart: "02:45 PM",
      arrive: "04:00 PM",
      duration: "1h 15m",
      price: "₹3,499",
    },
    {
      airline: "Akasa Air",
      from: "Hyderabad",
      to: "Pune",
      depart: "06:20 PM",
      arrive: "07:40 PM",
      duration: "1h 20m",
      price: "₹3,200",
    },
    {
      airline: "AirAsia",
      from: "Hyderabad",
      to: "Goa",
      depart: "08:10 PM",
      arrive: "09:30 PM",
      duration: "1h 20m",
      price: "₹3,750",
    },
    {
      airline: "Go First",
      from: "Hyderabad",
      to: "Kolkata",
      depart: "04:30 PM",
      arrive: "06:45 PM",
      duration: "2h 15m",
      price: "₹4,150",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-5 flex flex-col items-center">
      <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
          <Plane className="w-7 h-7 text-blue-500" />
          Flight Search
        </h1>

        <button
          onClick={() => setShowFlights(true)}
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Search Flights
        </button>
      </div>

      {showFlights && (
        <div className="w-full max-w-4xl mt-10 space-y-4">
          {flights.map((flight, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-md flex flex-col sm:flex-row justify-between items-center hover:shadow-lg transition"
            >
              <div>
                <h2 className="text-lg font-bold text-blue-600">
                  {flight.airline}
                </h2>
                <p className="text-gray-600 text-sm">
                  {flight.from} → {flight.to}
                </p>
                <p className="text-gray-500 text-sm">
                  {flight.depart} - {flight.arrive} | {flight.duration}
                </p>
              </div>

              <div className="mt-4 sm:mt-0 text-center">
                <p className="text-xl font-semibold text-gray-800">
                  {flight.price}
                </p>

                {bookedFlight === index ? (
                  <p className="mt-2 text-green-600 font-semibold">
                    ✅ Booking Confirmed
                  </p>
                ) : (
                  <button
                    onClick={() => setBookedFlight(index)}
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                  >
                    Book Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}