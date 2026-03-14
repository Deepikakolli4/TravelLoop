"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUserDetail } from "@/app/provider";
import { Button } from "@/components/ui/button";

type SavedTripDoc = {
  _id: string;
  tripId: string;
  tripDetail: {
    destination?: string;
    duration?: string;
    budget?: string;
    group_size?: string;
    hotels?: Array<unknown>;
    itinerary?: Array<unknown>;
  };
  savedAt?: number;
};

const formatDate = (ts?: number) => {
  if (!ts) return "Unknown date";
  return new Date(ts).toLocaleString();
};

const MyTripsPage = () => {
  const { userDetail } = useUserDetail();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const savedTripsRaw = useQuery(
    api.tripDetail.GetSavedTripsByUser,
    userDetail?._id ? { uid: userDetail._id } : "skip"
  );

  const deleteTrip = useMutation(api.tripDetail.DeleteTripPlan);

  const savedTrips = useMemo(
    () => (savedTripsRaw ?? []) as SavedTripDoc[],
    [savedTripsRaw]
  );

  const onDeleteTrip = async (tripDocId: string) => {
    if (!userDetail?._id) {
      window.alert("Please sign in to manage saved trips.");
      return;
    }

    const shouldDelete = window.confirm("Delete this trip from My Trips?");
    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingId(tripDocId);
      const success = await deleteTrip({
        tripDocId: tripDocId as never,
        uid: userDetail._id,
      });

      if (!success) {
        window.alert("Unable to delete this trip.");
      }
    } catch (error) {
      console.error("Failed to delete trip", error);
      window.alert("Something went wrong while deleting this trip.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 md:p-10">
      <div className="mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Trips</h1>
          <p className="text-sm text-slate-600 mt-1">Your saved trip plans appear here.</p>
        </div>
      </div>

      {!userDetail ? (
        <div className="rounded-xl border bg-white p-6 text-sm text-slate-600">
          Please sign in to view your saved trips.
        </div>
      ) : savedTripsRaw === undefined ? (
        <div className="rounded-xl border bg-white p-6 text-sm text-slate-600">
          Loading your saved trips...
        </div>
      ) : savedTrips.length === 0 ? (
        <div className="rounded-xl border bg-white p-6 text-sm text-slate-600">
          No saved trips yet. Generate a plan and click "Save My Trip Plan".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {savedTrips.map((trip) => {
            const hotelsCount = trip.tripDetail?.hotels?.length ?? 0;
            const daysCount = trip.tripDetail?.itinerary?.length ?? 0;

            return (
              <article key={trip._id} className="rounded-xl border bg-white p-4 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 line-clamp-1">
                  {trip.tripDetail?.destination || "Untitled Trip"}
                </h2>
                <p className="text-xs text-slate-500 mt-1">Saved on {formatDate(trip.savedAt)}</p>

                <div className="mt-3 space-y-1 text-sm text-slate-700">
                  <p>Duration: {trip.tripDetail?.duration || "N/A"}</p>
                  <p>Budget: {trip.tripDetail?.budget || "N/A"}</p>
                  <p>Group: {trip.tripDetail?.group_size || "N/A"}</p>
                  <p>Hotels: {hotelsCount}</p>
                  <p>Itinerary Days: {daysCount}</p>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Link href={`/create-new-trip?tripId=${encodeURIComponent(trip.tripId)}`} className="flex-1">
                    <Button variant="outline" className="w-full">Open Planner</Button>
                  </Link>
                  <Button
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => onDeleteTrip(trip._id)}
                    disabled={deletingId === trip._id}
                  >
                    {deletingId === trip._id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTripsPage;
