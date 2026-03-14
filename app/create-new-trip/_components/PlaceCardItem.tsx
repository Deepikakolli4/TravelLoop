import React from "react";
import Image from "next/image";
import { Ticket,Clock,Timer,ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Activity } from "./types";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTripDetail, useUserDetail } from "@/app/provider";
import { useEffect, useState } from "react";

type Props = {
    activity:Activity,
    hotelCoords?: {
      latitude: number;
      longitude: number;
    }
}

const DEFAULT_IMAGE = "/placeholder.svg";

const googlePlacePhotoUrl = (placeName?: string, context?: string) => {
  const name = (placeName || "").trim();
  if (!name) {
    return "";
  }

  const params = new URLSearchParams({
    placeName: name,
  });

  if (context?.trim()) {
    params.set("context", context.trim());
  }

  return `/api/google-place-photo?${params.toString()}`;
};

const normalizeImageUrl = (value?: string) => {
  if (!value) {
    return DEFAULT_IMAGE;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return DEFAULT_IMAGE;
  }

  if (trimmed.includes("unsplash.com/photos") || trimmed.includes("source.unsplash.com")) {
    return "";
  }

  return trimmed;
};

const getDistanceKm = (
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
) => {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRadians(to.latitude - from.latitude);
  const dLng = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
};

const PlaceCardItem = ({activity, hotelCoords}:Props) => {
  const { tripDetailInfo } = useTripDetail();
  const { userDetail } = useUserDetail();
  const SaveTripEvent = useMutation(api.tripDetail.CreateTripEvent);
  const [imgCandidates, setImgCandidates] = useState<string[]>([]);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    const candidates = [
      googlePlacePhotoUrl(
        activity?.place_name,
        `${activity?.place_address || ""} ${tripDetailInfo?.destination || ""}`.trim()
      ),
      normalizeImageUrl(activity?.place_image_url),
      DEFAULT_IMAGE,
    ].filter(Boolean);

    const uniqueCandidates = Array.from(new Set(candidates));
    setImgCandidates(uniqueCandidates.length ? uniqueCandidates : [DEFAULT_IMAGE]);
    setImgIndex(0);
  }, [activity?.place_image_url, activity?.place_name, activity?.place_address, tripDetailInfo?.destination]);

  const currentImage = imgCandidates[imgIndex] || DEFAULT_IMAGE;

  const onActivityClick = () => {
    const tripId = tripDetailInfo?.tripId;
    if (!tripId) {
      return;
    }

    SaveTripEvent({
      tripId,
      uid: userDetail?._id,
      eventType: "click",
      entityType: "activity",
      entityName: activity?.place_name,
      score: activity?.ml_score,
      metadata: {
        address: activity?.place_address,
        ticket_pricing: activity?.ticket_pricing,
        intent: tripDetailInfo?.mlInsights?.intent?.label,
      },
    }).catch((error) => {
      console.error("Failed to log activity click event", error);
    });
  };

  const activityCoords = activity?.geo_coordinates;
  const distanceFromHotel =
    hotelCoords && activityCoords
      ? getDistanceKm(hotelCoords, activityCoords)
      : null;

  return (
    <div>
      <Image
        src={currentImage}
        alt={activity.place_name}
        width={400}
        height={200}
        className="object-cover rounded-xl"
        onError={() => {
          setImgIndex((prev) => Math.min(prev + 1, Math.max(0, imgCandidates.length - 1)));
        }}
      />
      <h2 className="font-semibold text-lg">{activity.place_name}</h2>
      <p className="text-gray-500 line-clamp-2">{activity?.place_details}</p>
      <h2 className="flex gap-2 text-blue-500 line-clamp-1">
        <Ticket />
        {activity?.ticket_pricing}
      </h2>
      <p className="flex text-orange-400 gap-2">
        <Clock />
        {activity?.time_travel_each_location}
      </p>
      <p className="flex text-green-400 gap-2 line-clamp-1">
        <Timer />
        {activity?.best_time_to_visit}
      </p>
      {distanceFromHotel !== null ? (
        <p className="text-xs text-slate-600 mt-1">
          Distance from hotel: {distanceFromHotel} km
        </p>
      ) : null}
      {activity.ml_score ? (
        <div className="mt-2 rounded-lg border border-sky-200 bg-sky-50 p-2">
          <p className="text-xs font-semibold text-sky-700">
            Match Score: {Math.round(activity.ml_score * 100)}%
          </p>
          {activity.ml_reasons?.length ? (
            <p className="text-xs text-sky-700 mt-1 line-clamp-2">
              {activity.ml_reasons.join(" | ")}
            </p>
          ) : null}
        </div>
      ) : null}
      <Link
        onClick={onActivityClick}
        href={
          "https://www.google.com/maps/search/?api=1&query=" +
          activity?.place_name
        }
        target="_blank"
      >
        <Button
          size={"sm"}
          variant={"outline"}
          className="width-full mt-4 border-black"
        >
          {" "}
          View <ExternalLink />{" "}
        </Button>
      </Link>
    </div>
  );
};

export default PlaceCardItem;
