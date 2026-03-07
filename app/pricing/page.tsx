'use client'

import React from 'react'
import { PricingTable } from '@clerk/nextjs'

const Pricing = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-10">
      
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6">
        
        <h1 className="text-3xl font-bold text-center mb-6">
          Choose Your Plan 🚀
        </h1>

        <PricingTable />

      </div>

    </div>
  )
}

export default Pricing