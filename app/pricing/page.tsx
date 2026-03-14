'use client'

import React from 'react'
import { PricingTable } from '@clerk/nextjs'

const Pricing = () => {
  return (
    <div className="min-h-screen py-16 px-5 bg-gradient-to-b">

      <div className="max-w-6xl mx-auto text-center">

        {/* Heading */}
        <h1 className="text-2xl md:text-5xl font-extrabold text-gray-800 mb-2">
          Choose Your {" "}<span className="text-purple-700">Perfect Plan</span>{" "}
        </h1>

        <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-12">
          Travel Loop helps you plan smarter trips with AI-powered itineraries,
          booking tools, and travel management features.
        </p>

        {/* Main Pricing Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-10 hover:shadow-2xl transition">

          {/* Plan Description Boxes */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">

            {/* Free Plan */}
            <div className="border border-purple-100 rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold text-purple-700 mb-3">
                Free Plan
              </h3>

              <p className="text-gray-600 mb-3">
                Perfect for casual travelers who want quick itinerary suggestions
                and simple planning tools.
              </p>

              <ul className="text-gray-600 text-sm space-y-2 text-left">
                <li>✔ Generate basic trip itineraries</li>
                <li>✔ Explore travel destinations</li>
                <li>✔ Limited itinerary generations</li>
                <li>✔ Simple travel planning tools</li>
              </ul>
            </div>

            {/* Pro Plan */}
            <div className="border border-purple-200 rounded-xl p-6 shadow-sm hover:shadow-md transition bg-purple-50">
              <h3 className="text-xl font-semibold text-purple-700 mb-3">
                Pro Plan
              </h3>

              <p className="text-gray-600 mb-3">
                Ideal for frequent travelers who want unlimited AI itineraries
                and advanced planning tools.
              </p>

              <ul className="text-gray-600 text-sm space-y-2 text-left">
                <li>✔ Unlimited itinerary generation</li>
                <li>✔ Advanced travel planning tools</li>
                <li>✔ Priority feature updates</li>
                <li>✔ Premium travel recommendations</li>
              </ul>
            </div>

          </div>

          {/* Pricing Table */}
          <div className="border-t pt-8">
            <PricingTable />
          </div>

        </div>

      </div>

    </div>
  )
}

export default Pricing