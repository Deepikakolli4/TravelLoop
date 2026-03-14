"use client";

import React, { useEffect, useRef, useState } from "react";
import { Timeline } from "@/components/ui/timeline";
import HotelCardItem from "./HotelCardItem";
import PlaceCardItem from "./PlaceCardItem";
import FoodCardItem from "./FoodCardItem";
import { TripInfo } from "../_components/types";
import { useTripDetail } from "@/app/provider";
import RotatingGlobe from "./RotatingGlobe";
import { useUserDetail } from "@/app/provider";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AlarmClockCheck, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const formatUsd = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const getBookingActionBadge = (
  signal: NonNullable<TripInfo["mlInsights"]>["timeToBookSignal"]
): {
  label: "Book Now" | "Watch Prices" | "Wait";
  icon: React.ComponentType<{ className?: string }>;
  className: string;
} => {
  if (signal.trend === "rise" || signal.urgency === "high") {
    return {
      label: "Book Now",
      icon: TrendingUp,
      className: "bg-rose-100 text-rose-700 border-rose-200",
    };
  }

  if (signal.trend === "dip" && signal.urgency === "low") {
    return {
      label: "Wait",
      icon: TrendingDown,
      className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };
  }

  return {
    label: "Watch Prices",
    icon: AlarmClockCheck,
    className: "bg-amber-100 text-amber-700 border-amber-200",
  };
};

const Itinerary = () => {
  const { tripDetailInfo } = useTripDetail();
  const { userDetail } = useUserDetail();
  const SaveTripEvent = useMutation(api.tripDetail.CreateTripEvent);
  const SaveTripPlan = useMutation(api.tripDetail.SaveTripPlan);

  const hasLoggedImpression = useRef(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [savingTrip, setSavingTrip] = useState(false);
  const [isTripSaved, setIsTripSaved] = useState(false);

  const tripData = tripDetailInfo as TripInfo | undefined;
  const destination = tripData?.destination;
  const hotels = tripData?.hotels ?? [];
  const itineraryArr = tripData?.itinerary ?? [];
  const mlInsights = tripData?.mlInsights;
  const primaryHotelCoords = hotels.find((h) => h.geo_coordinates)?.geo_coordinates;

  const bookingAction = mlInsights
    ? getBookingActionBadge(mlInsights.timeToBookSignal)
    : null;
  const BookingActionIcon = bookingAction?.icon;
  const bookingCta =
    bookingAction?.label === "Book Now"
      ? {
          label: "Open Flight Deals",
          onClick: () => window.open("/booking/flight", "_blank"),
        }
      : bookingAction?.label === "Watch Prices"
      ? {
          label: "Set Price Alert",
          onClick: () =>
            window.alert("Price alert created. We will notify you about major fare changes."),
        }
      : {
          label: "Remind Me in 7 Days",
          onClick: () => window.alert("Reminder set for 7 days. Re-check fares then."),
        };

  useEffect(() => {
    const onViewTripMap = () => {
      setShowTimeline(true);
    };

    window.addEventListener("travelloop:view-trip-map", onViewTripMap);
    return () => {
      window.removeEventListener("travelloop:view-trip-map", onViewTripMap);
    };
  }, []);

  useEffect(() => {
    if (!tripDetailInfo) {
      setShowTimeline(false);
      hasLoggedImpression.current = false;
      setIsTripSaved(false);
    }
  }, [tripDetailInfo]);

  const onSaveTripPlan = async () => {
    if (!tripData?.tripId || !userDetail?._id) {
      window.alert("Please sign in and generate a trip plan before saving.");
      return;
    }

    try {
      setSavingTrip(true);

      await SaveTripPlan({
        tripId: tripData.tripId,
        uid: userDetail._id,
        tripDetail: tripData,
      });

      await SaveTripEvent({
        tripId: tripData.tripId,
        uid: userDetail._id,
        eventType: "save",
        entityType: "trip",
        entityName: tripData.destination,
        score: tripData.mlInsights?.feasibility?.score,
        metadata: {
          intent: tripData.mlInsights?.intent?.label,
          source: "save_button",
        },
      });

      setIsTripSaved(true);
      window.alert("Trip saved successfully. You can see it in My Trips.");
    } catch (error) {
      console.error("Failed to save trip plan", error);
      window.alert("Unable to save your trip right now. Please try again.");
    } finally {
      setSavingTrip(false);
    }
  };

  useEffect(() => {
    if (!tripData?.tripId || hasLoggedImpression.current) {
      return;
    }

    hasLoggedImpression.current = true;

    SaveTripEvent({
      tripId: tripData.tripId,
      uid: userDetail?._id,
      eventType: "impression",
      entityType: "itinerary",
      entityName: tripData.destination,
      score: mlInsights?.feasibility?.score,
      metadata: {
        hotelsCount: hotels.length,
        activityCount: itineraryArr.reduce((sum, day) => sum + (day.activities?.length ?? 0), 0),
        intent: mlInsights?.intent?.label,
      },
    }).catch((error) => {
      console.error("Failed to log itinerary impression", error);
    });

    const intent = mlInsights?.intent?.label;

    hotels.slice(0, 12).forEach((hotel) => {
      SaveTripEvent({
        tripId: tripData.tripId!,
        uid: userDetail?._id,
        eventType: "impression",
        entityType: "hotel",
        entityName: hotel.hotel_name,
        score: hotel.ml_score,
        metadata: {
          intent,
          price_per_night: hotel.price_per_night,
        },
      }).catch((error) => {
        console.error("Failed to log hotel impression", error);
      });
    });

    itineraryArr
      .flatMap((day) => day.activities ?? [])
      .slice(0, 36)
      .forEach((activity) => {
        SaveTripEvent({
          tripId: tripData.tripId!,
          uid: userDetail?._id,
          eventType: "impression",
          entityType: "activity",
          entityName: activity.place_name,
          score: activity.ml_score,
          metadata: {
            intent,
            ticket_pricing: activity.ticket_pricing,
          },
        }).catch((error) => {
          console.error("Failed to log activity impression", error);
        });
      });
  }, [SaveTripEvent, hotels.length, itineraryArr, mlInsights, tripData, userDetail?._id]);

  const famousFoods =
    tripData?.famous_food_items && tripData.famous_food_items.length
      ? tripData.famous_food_items
      : ["Local Street Food", "Regional Special", "Traditional Dessert"];

  const timelineItems = [
    {
      title: "Recommended Hotels and Restaurants",
      content: (
        <div className="space-y-6 p-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Recommended Hotels</h3>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((hotel, index) => (
                <HotelCardItem key={`hotel-${index}`} hotel={hotel} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-900">Recommended Restaurants and Local Food</h3>
            <p className="text-sm text-slate-500 mt-1">
              Famous local dishes to try during your trip.
            </p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {famousFoods.slice(0, 8).map((item, index) => (
                <FoodCardItem
                  key={`${item}-${index}`}
                  name={item}
                  index={index}
                  destination={tripData?.destination}
                />
              ))}
            </div>
          </div>
        </div>
      ),
    },
    ...itineraryArr.map((dayData) => ({
      title: `Day ${dayData.day}`,
      content: (
        <div className="space-y-6 p-4">
          <p className="text-lg font-medium text-muted-foreground">
            Best Time: {dayData.best_time_to_visit_day || "Flexible"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dayData.activities?.map((activity, idx) => (
              <PlaceCardItem
                key={`activity-day${dayData.day}-${idx}`}
                activity={activity}
                hotelCoords={primaryHotelCoords}
              />
            ))}
          </div>
        </div>
      ),
    })),
  ];

  if (!tripData || !showTimeline) {
    return (
      <div
        id="itinerary-section"
        className="relative w-full h-[83vh] bg-slate-950 rounded-xl overflow-hidden"
      >
        <RotatingGlobe />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-sm text-white/80">
          {!tripData
            ? destination
              ? `Exploring ${destination}...`
              : "Start planning your trip!"
            : "Click View Trip to open your timeline"}
        </div>
      </div>
    );
  }

  return (
    <div id="itinerary-section" className="relative w-full h-[83vh] overflow-y-auto bg-background space-y-4">
      <section className="rounded-xl border bg-white p-3 mx-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            Ready to book? Open the booking hub and choose your preferred transport or stay.
          </p>
          <Link href="/booking" target="_blank">
            <Button size="sm" variant="outline">Go to Booking Page</Button>
          </Link>
        </div>
      </section>

      {mlInsights ? (
        <section className="rounded-xl border bg-linear-to-r from-teal-50 to-cyan-50 p-4 mx-1">
          <h3 className="text-lg font-semibold text-teal-900">ML Trip Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mt-3 text-sm">
            <div className="rounded-lg bg-white border p-3">
              <p className="text-muted-foreground">Detected Intent</p>
              <p className="font-semibold capitalize">
                {mlInsights.intent.label} ({Math.round(mlInsights.intent.confidence * 100)}%)
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tags: {mlInsights.intent.tags.join(", ") || "general"}
              </p>
            </div>

            <div className="rounded-lg bg-white border p-3">
              <p className="text-muted-foreground">Estimated Budget</p>
              <p className="font-semibold">
                {formatUsd(mlInsights.budgetEstimate.minTotalUsd)} - {formatUsd(mlInsights.budgetEstimate.maxTotalUsd)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Avg/day: {formatUsd(mlInsights.budgetEstimate.dailyAverageUsd)} ({mlInsights.budgetEstimate.confidence} confidence)
              </p>
            </div>

            <div className="rounded-lg bg-white border p-3">
              <p className="text-muted-foreground">Feasibility</p>
              <p className="font-semibold capitalize">
                {mlInsights.feasibility.verdict} ({Math.round(mlInsights.feasibility.score * 100)}%)
              </p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {mlInsights.feasibility.reasons.join(" | ")}
              </p>
            </div>

            <div className="rounded-lg bg-white border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-muted-foreground">Best Time to Book</p>
                {bookingAction && BookingActionIcon ? (
                  <div
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold ${bookingAction.className}`}
                  >
                    <BookingActionIcon className="h-3.5 w-3.5" />
                    {bookingAction.label}
                  </div>
                ) : null}
              </div>
              <p className="font-semibold capitalize">
                {mlInsights.timeToBookSignal.trend} in {mlInsights.timeToBookSignal.horizonDays} days
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {mlInsights.timeToBookSignal.confidence} confidence | {mlInsights.timeToBookSignal.urgency} urgency
              </p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {mlInsights.timeToBookSignal.recommendation}
              </p>
              <Button variant="outline" size="sm" className="mt-2 w-full" onClick={bookingCta.onClick}>
                {bookingCta.label}
              </Button>
            </div>

            <div className="rounded-lg bg-white border p-3">
              <p className="text-muted-foreground">Demand Heatmap</p>
              <p className="font-semibold capitalize">
                {mlInsights.demandHeatmapSignal.crowdLevel} crowd forecast
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {mlInsights.demandHeatmapSignal.confidence} confidence | next {mlInsights.demandHeatmapSignal.forecastWindowDays} days
              </p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                Best windows: {mlInsights.demandHeatmapSignal.bestDateWindows.join(" | ")}
              </p>
            </div>
          </div>
        </section>
      ) : null}
      <Timeline data={timelineItems} tripData={tripData} />

      <section className="rounded-xl border bg-white p-4 mx-1 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Save My Trip Plan</h3>
            <p className="text-sm text-slate-500 mt-1">
              Save this plan to your My Trips list so you can revisit or delete it anytime.
            </p>
          </div>
          <Button onClick={onSaveTripPlan} disabled={savingTrip || isTripSaved}>
            {savingTrip ? "Saving..." : isTripSaved ? "Trip Saved" : "Save My Trip Plan"}
          </Button>
        </div>
      </section>

    </div>
  );
};

export default Itinerary;
