"use client"

import React, { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from 'convex/react'
import ChatBox from './_components/ChatBox'
import Itinerary from './_components/Itinerary'
import { useTripDetail, useUserDetail } from '../provider'
import { api } from '@/convex/_generated/api'

const CreateNewTrip = () => {
  const searchParams = useSearchParams()
  const tripId = (searchParams.get('tripId') || '').trim()
  const { userDetail } = useUserDetail()
  const { setTripDetailInfo } = useTripDetail()
  const loadedTripIdRef = useRef<string | null>(null)

  const savedTrip = useQuery(
    api.tripDetail.GetSavedTripByTripId,
    userDetail?._id && tripId ? { uid: userDetail._id, tripId } : "skip"
  )

  useEffect(() => {
    if (!tripId || loadedTripIdRef.current === tripId) {
      return
    }

    if (!savedTrip?.tripDetail) {
      return
    }

    setTripDetailInfo(savedTrip.tripDetail)
    loadedTripIdRef.current = tripId

    window.dispatchEvent(
      new CustomEvent("travelloop:view-trip-map", {
        detail: { tripId },
      })
    )
  }, [savedTrip, setTripDetailInfo, tripId])

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-5 p-10'>
        <div>
          <ChatBox />
        </div>
        <div className='col-span-2'>
           <Itinerary />
        </div>
    </div>
  )
}

export default CreateNewTrip