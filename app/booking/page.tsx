"use client";

import { useRouter } from "next/navigation";
import { Plane, Train, Building } from "lucide-react";

export default function Home() {

  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">

      {/* hero section */}
      <header className="py-16 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
          Ready for your next adventure?
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Choose a service to start planning your trip – flights, trains or
          hotels, all in one place.
        </p>
      </header>

      <main className="px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

          <div
            onClick={() => router.push("/booking/flight")}
            className="group bg-white rounded-2xl shadow-lg cursor-pointer transform transition hover:scale-105"
          >
            <div className="h-32 w-full bg-gradient-to-r from-blue-400 to-blue-600" />
            <div className="p-6 flex flex-col items-center">
              <Plane className="w-14 h-14 text-blue-600 mb-3" />
              <p className="text-xl font-semibold">Flights</p>
              <p className="text-sm text-gray-500 mt-1 text-center">
                Find and book the best deals on flights worldwide.
              </p>
            </div>
          </div>

          <div
            onClick={() => router.push("/booking/train")}
            className="group bg-white rounded-2xl shadow-lg cursor-pointer transform transition hover:scale-105"
          >
            <div className="h-32 w-full bg-gradient-to-r from-green-400 to-green-600" />
            <div className="p-6 flex flex-col items-center">
              <Train className="w-14 h-14 text-green-600 mb-3" />
              <p className="text-xl font-semibold">Trains</p>
              <p className="text-sm text-gray-500 mt-1 text-center">
                Reserve comfortable train journeys across cities.
              </p>
            </div>
          </div>

          <div
            onClick={() => router.push("/booking/hotel")}
            className="group bg-white rounded-2xl shadow-lg cursor-pointer transform transition hover:scale-105"
          >
            <div className="h-32 w-full bg-gradient-to-r from-purple-400 to-purple-600" />
            <div className="p-6 flex flex-col items-center">
              <Building className="w-14 h-14 text-purple-600 mb-3" />
              <p className="text-xl font-semibold">Hotels</p>
              <p className="text-sm text-gray-500 mt-1 text-center">
                Book cozy stays and amazing accommodations.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}