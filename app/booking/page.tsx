"use client";

import { useState } from "react";
import {
  Plane,
  Train,
  Building,
  Bus,
  Car,
  PersonStanding,
  Bike,
} from "lucide-react";

const categories = [
  { key: "flights", label: "Flights", icon: Plane },
  { key: "trains", label: "Trains", icon: Train },
  { key: "buses", label: "Buses", icon: Bus },
  { key: "hotels", label: "Hotels", icon: Building },
  { key: "rentals", label: "Rentals", icon: Car },
] as const;

type CategoryKey = (typeof categories)[number]["key"];

const providers: Record<
  CategoryKey,
  { name: string; desc: string; color: string; iconColor: string; link: string }[]
> = {
  flights: [
    {
      name: "MakeMyTrip",
      desc: "Search and book the best flight deals.",
      color: "from-blue-400 to-blue-600",
      iconColor: "text-blue-600",
      link: "https://www.makemytrip.com/flights/",
    },
    {
      name: "Skyscanner",
      desc: "Compare flight prices worldwide.",
      color: "from-indigo-400 to-indigo-600",
      iconColor: "text-indigo-600",
      link: "https://www.skyscanner.co.in/",
    },
    {
      name: "Cleartrip",
      desc: "Book flights quickly and easily.",
      color: "from-sky-400 to-sky-600",
      iconColor: "text-sky-600",
      link: "https://www.cleartrip.com/flights",
    },
  ],

  trains: [
    {
      name: "IRCTC",
      desc: "Official Indian Railway booking portal.",
      color: "from-green-400 to-green-600",
      iconColor: "text-green-600",
      link: "https://www.irctc.co.in",
    },
    {
      name: "ConfirmTkt",
      desc: "Train tickets with prediction insights.",
      color: "from-emerald-400 to-emerald-600",
      iconColor: "text-emerald-600",
      link: "https://www.confirmtkt.com",
    },
    {
      name: "RailYatri",
      desc: "Check seat availability and train status.",
      color: "from-lime-400 to-lime-600",
      iconColor: "text-lime-600",
      link: "https://www.railyatri.in",
    },
  ],

  buses: [
    {
      name: "APSRTC",
      desc: "Reserve bus tickets via RTC services.",
      color: "from-orange-400 to-orange-600",
      iconColor: "text-orange-600",
      link: "https://www.apsrtconline.in",
    },
    {
      name: "RedBus",
      desc: "India's largest bus ticket platform.",
      color: "from-red-400 to-red-600",
      iconColor: "text-red-600",
      link: "https://www.redbus.in",
    },
    {
      name: "AbhiBus",
      desc: "Book bus tickets easily online.",
      color: "from-amber-400 to-amber-600",
      iconColor: "text-amber-600",
      link: "https://www.abhibus.com",
    },
  ],

  hotels: [
    {
      name: "MakeMyTrip",
      desc: "Discover comfortable stays worldwide.",
      color: "from-purple-400 to-purple-600",
      iconColor: "text-purple-600",
      link: "https://www.makemytrip.com/hotels/",
    },
    {
      name: "Booking.com",
      desc: "Book hotels and accommodations globally.",
      color: "from-indigo-400 to-indigo-600",
      iconColor: "text-indigo-600",
      link: "https://www.booking.com",
    },
    {
      name: "Airbnb",
      desc: "Unique homes and experiences.",
      color: "from-pink-400 to-pink-600",
      iconColor: "text-pink-600",
      link: "https://www.airbnb.com",
    },
  ],

  rentals: [
    {
      name: "Zoomcar",
      desc: "Self-drive cars across India.",
      color: "from-blue-400 to-blue-600",
      iconColor: "text-blue-600",
      link: "https://www.zoomcar.com",
    },
    {
      name: "Ola",
      desc: "Instant cab booking service.",
      color: "from-yellow-400 to-yellow-600",
      iconColor: "text-yellow-600",
      link: "https://www.olacabs.com",
    },
    {
      name: "Rapido",
      desc: "Fast bike taxi service.",
      color: "from-rose-400 to-rose-600",
      iconColor: "text-rose-600",
      link: "https://www.rapido.bike",
    },
  ],
};

export default function Home() {
  const [active, setActive] = useState<CategoryKey>("flights");

  const ActiveIcon = categories.find((c) => c.key === active)!.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br">

      {/* Hero */}
      <header className="py-20 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-6">
          Plan Your Journey With{" "}
          <span className="text-purple-700">Ease</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Choose a travel category and get redirected to the best providers instantly.
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-20">

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = active === cat.key;

            return (
              <button
                key={cat.key}
                onClick={() => setActive(cat.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full border font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-gray-800 text-white border-gray-800 shadow-md"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Provider Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {providers[active].map((provider, index) => (
            <div
              key={index}
              onClick={() => window.open(provider.link, "_blank")}
              className="group bg-white rounded-2xl shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className={`h-28 w-full bg-gradient-to-r ${provider.color} rounded-t-2xl`} />

              <div className="p-6 flex flex-col items-center text-center">
                <div className="bg-gray-50 p-4 rounded-full shadow-sm group-hover:scale-110 transition">
                  <ActiveIcon className={`w-10 h-10 ${provider.iconColor}`} />
                </div>

                <h3 className="text-xl font-semibold mt-4">
                  {provider.name}
                </h3>

                <p className="text-sm text-gray-500 mt-2">
                  {provider.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}