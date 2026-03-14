"use client"

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Wallet, Star,ExternalLink} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hotel } from "./types";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTripDetail, useUserDetail } from "@/app/provider";

type Props = {
    hotel:Hotel
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

const HotelCardItem = ({hotel}:Props) => {
  const { tripDetailInfo } = useTripDetail();
  const { userDetail } = useUserDetail();
  const SaveTripEvent = useMutation(api.tripDetail.CreateTripEvent);
  const [imgCandidates, setImgCandidates] = useState<string[]>([]);
  const [imgIndex, setImgIndex] = useState(0);

  const onHotelClick = () => {
    const tripId = tripDetailInfo?.tripId;
    if (!tripId) {
      return;
    }

    SaveTripEvent({
      tripId,
      uid: userDetail?._id,
      eventType: "click",
      entityType: "hotel",
      entityName: hotel?.hotel_name,
      score: hotel?.ml_score,
      metadata: {
        address: hotel?.hotel_address,
        price_per_night: hotel?.price_per_night,
        intent: tripDetailInfo?.mlInsights?.intent?.label,
      },
    }).catch((error) => {
      console.error("Failed to log hotel click event", error);
    });
  };
  useEffect(() => {
    const candidates = [
      googlePlacePhotoUrl(
        hotel?.hotel_name,
        `${hotel?.hotel_address || ""} ${tripDetailInfo?.destination || ""}`.trim()
      ),
      normalizeImageUrl(hotel?.hotel_image_url),
      DEFAULT_IMAGE,
    ].filter(Boolean);

    const uniqueCandidates = Array.from(new Set(candidates));
    setImgCandidates(uniqueCandidates.length ? uniqueCandidates : [DEFAULT_IMAGE]);
    setImgIndex(0);
  }, [hotel?.hotel_image_url, hotel?.hotel_name, hotel?.hotel_address, tripDetailInfo?.destination]);

  const currentImage = imgCandidates[imgIndex] || DEFAULT_IMAGE;


  return (
    <div className="flex flex-col gap-1">
      <Image
        src={currentImage}
        alt="place-image"
        width={400}
        height={200}
        className="rounded-xl shadow object-cover mb-2"
        onError={() => {
          setImgIndex((prev) => Math.min(prev + 1, Math.max(0, imgCandidates.length - 1)));
        }}
      />
      <h2 className="font-semibold text-lg">{hotel?.hotel_name}</h2>
      <h2 className="text-gray-500">{hotel.hotel_address}</h2>
      <div className="flex justify-between items-center">
        <p className="flex gap-2 text-green-600">
          <Wallet /> {hotel.price_per_night}
        </p>
        <p className="flex gap-2 text-yellow-500">
          <Star />
          {hotel.rating}
        </p>
      </div>
      <p className="line-clamp-3 text-gray-500">{hotel.description}</p>
      {hotel.ml_score ? (
        <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2">
          <p className="text-xs font-semibold text-emerald-700">
            Match Score: {Math.round(hotel.ml_score * 100)}%
          </p>
          {hotel.ml_reasons?.length ? (
            <p className="text-xs text-emerald-700 mt-1 line-clamp-2">
              {hotel.ml_reasons.join(" | ")}
            </p>
          ) : null}
        </div>
      ) : null}
      <Link
        onClick={onHotelClick}
        href={
          "https://www.google.com/maps/search/?api=1&query=" + hotel?.hotel_name
        }
        target="_blank"
      >
        <Button variant={"outline"} className="mt-4 border-black w-full">
          View
          <ExternalLink />
        </Button>
      </Link>
    </div>
  );
};

export default HotelCardItem;
