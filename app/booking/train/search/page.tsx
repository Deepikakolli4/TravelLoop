"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Train, MapPin, Calendar, X } from "lucide-react";

export default function TrainSearchPage() {

  const router = useRouter();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [freeCancel, setFreeCancel] = useState(false);
  const [showTrains, setShowTrains] = useState(false);
  const [bookedTrain, setBookedTrain] = useState<number | null>(null);

  const trains = [
    {
      name: "Rajdhani Express",
      number: "12301",
      from: "Hyderabad",
      to: "Delhi",
      depart: "06:00 AM",
      arrive: "08:00 PM",
      duration: "14h",
      price: "₹1,850",
    },
    {
      name: "Shatabdi Express",
      number: "12025",
      from: "Hyderabad",
      to: "Chennai",
      depart: "07:30 AM",
      arrive: "01:00 PM",
      duration: "5h 30m",
      price: "₹1,200",
    },
    {
      name: "Duronto Express",
      number: "12245",
      from: "Hyderabad",
      to: "Mumbai",
      depart: "09:00 AM",
      arrive: "05:30 PM",
      duration: "8h 30m",
      price: "₹1,450",
    },
    {
      name: "Garib Rath",
      number: "12735",
      from: "Hyderabad",
      to: "Bangalore",
      depart: "11:00 AM",
      arrive: "06:00 PM",
      duration: "7h",
      price: "₹950",
    },
    {
      name: "Intercity Express",
      number: "12710",
      from: "Hyderabad",
      to: "Vijayawada",
      depart: "02:00 PM",
      arrive: "06:30 PM",
      duration: "4h 30m",
      price: "₹650",
    },
    {
      name: "Superfast Express",
      number: "12615",
      from: "Hyderabad",
      to: "Pune",
      depart: "04:30 PM",
      arrive: "11:30 PM",
      duration: "7h",
      price: "₹1,100",
    },
    {
      name: "Jan Shatabdi",
      number: "12070",
      from: "Hyderabad",
      to: "Tirupati",
      depart: "06:15 PM",
      arrive: "11:00 PM",
      duration: "4h 45m",
      price: "₹800",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-5 flex flex-col items-center">

      {/* Header */}
      <div className="w-full max-w-lg flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="text-lg font-bold text-gray-700 hover:text-gray-900 transition"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold">Train Search</h1>
      </div>

      <div className="w-full max-w-lg bg-white p-6 rounded-xl shadow-lg">

        <div className="bg-green-100 p-3 rounded-lg mb-4 text-center font-medium text-green-800">
          Get up to ₹100 off on your first rail booking!
        </div>

        <div className="space-y-4">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
            <input
              value={from}
              onChange={e => setFrom(e.target.value)}
              placeholder="From (city/station)"
              className="border pl-10 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500" />
            <input
              value={to}
              onChange={e => setTo(e.target.value)}
              placeholder="To (destination)"
              className="border pl-10 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="border pl-10 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="cancel"
              type="checkbox"
              checked={freeCancel}
              onChange={() => setFreeCancel(!freeCancel)}
              className="h-4 w-4 text-blue-600"
            />
            <label htmlFor="cancel" className="text-gray-700">
              Free cancellation
            </label>
          </div>

          <button
            onClick={() => setShowTrains(true)}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Search Trains
          </button>
        </div>
      </div>

      {/* Show Trains After Search */}
      {showTrains && (
        <div className="w-full max-w-4xl mt-10 space-y-4">
          {trains.map((train, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-md flex flex-col sm:flex-row justify-between items-center hover:shadow-lg transition"
            >
              <div>
                <h2 className="text-lg font-bold text-green-600">
                  {train.name} ({train.number})
                </h2>
                <p className="text-gray-600 text-sm">
                  {train.from} → {train.to}
                </p>
                <p className="text-gray-500 text-sm">
                  {train.depart} - {train.arrive} | {train.duration}
                </p>
              </div>

              <div className="mt-4 sm:mt-0 text-center">
                <p className="text-xl font-semibold text-gray-800">
                  {train.price}
                </p>

                {bookedTrain === index ? (
                  <p className="mt-2 text-green-600 font-semibold">
                    ✅ Booking Confirmed
                  </p>
                ) : (
                  <button
                    onClick={() => setBookedTrain(index)}
                    className="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
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