"use client";

import { useRouter } from "next/navigation";
import { Train, Info } from "lucide-react";

export default function TrainPage() {

  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">

      {/* top bar */}
      <div className="flex items-center gap-3 p-5">
        <button
          onClick={() => router.back()}
          className="text-2xl font-bold text-gray-700 hover:text-gray-900"
        >
          ←
        </button>
        <h1 className="text-3xl font-extrabold text-gray-800">
          Train Tickets
        </h1>
      </div>

      {/* hero section */}
      <div className="px-5 pb-10">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-400 to-blue-500 p-8 text-center text-white">
            <Train className="mx-auto w-16 h-16 mb-4" />
            <h2 className="text-2xl font-semibold">Explore by Rail</h2>
            <p className="mt-2 text-sm max-w-xl mx-auto">
              Find fast, comfortable and affordable train journeys across the country. Start your trip now!
            </p>
          </div>

          <div className="p-6">
            <button
              onClick={() => router.push("/booking/train/search")}
              className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition"
            >
              Search Trains
            </button>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="font-semibold">Flexible Dates</p>
                  <p className="text-sm text-gray-600">Search multiple days at once</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="font-semibold">Best Prices</p>
                  <p className="text-sm text-gray-600">View affordable options for every budget</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}