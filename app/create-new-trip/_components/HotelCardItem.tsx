"use client"

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Wallet, Star, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hotel } from "./types";
import axios from "axios";

type Props = {
  hotel: Hotel;
};

const HotelCardItem = ({ hotel }: Props) => {
  useEffect(() => {
    hotel && GetGooglePlaceDetail();
  }, [hotel]);

  const GetGooglePlaceDetail = async () => {
    const result = await axios.post("/api/google-place-detail", {
      placeNmae: hotel?.hotel_name,
    });
    console.log(result.data);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="w-full h-48 overflow-hidden">
        {hotel?.hotel_image_url &&
        (hotel.hotel_image_url.startsWith("http") ||
          hotel.hotel_image_url.startsWith("https")) ? (
          <img
            src={hotel.hotel_image_url}
            alt={hotel?.hotel_name || "place-image"}
            className="w-full h-full object-cover"
          />
        ) : (
          <Image
            src={hotel?.hotel_image_url || "/logo.svg"}
            alt={hotel?.hotel_name || "place-image"}
            width={800}
            height={400}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{hotel?.hotel_name}</h3>
        <p className="text-sm text-gray-500 mb-3">{hotel?.hotel_address}</p>

        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-green-600 font-medium flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            <span>{hotel?.price_per_night}</span>
          </div>

          <div className="flex items-center gap-2 text-yellow-500">
            <Star className="w-4 h-4" />
            <span className="font-medium">{hotel?.rating ?? "—"}</span>
          </div>
        </div>

        <p className="text-sm text-gray-600 line-clamp-3 mb-3">
          {hotel?.description}
        </p>

        <Link
          href={
            "https://www.google.com/maps/search/?api=1&query=" + hotel?.hotel_name
          }
          target="_blank"
        >
          <Button variant={"outline"} className="w-full rounded-lg">
            View on Map
            <ExternalLink className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default HotelCardItem;