import React from "react";
import Image from "next/image";
import { Ticket, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Activity } from "./types";

type Props = {
  activity: Activity;
};

const PlaceCardItem = ({ activity }: Props) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image Container */}
      <div className="w-full h-48 overflow-hidden">
        {activity?.place_image_url &&
        (activity.place_image_url.startsWith("http") ||
          activity.place_image_url.startsWith("https")) ? (
          <img
            src={activity.place_image_url}
            alt={activity.place_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Image
            src={activity?.place_image_url || "/logo.svg"}
            alt={activity.place_name}
            width={800}
            height={400}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Content Container */}
      <div className="p-4">
        {/* Title */}
        <h2 className="font-semibold text-lg mb-1">{activity.place_name}</h2>

        {/* Description */}
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
          {activity?.place_details}
        </p>

        {/* Info Row: Ticket + Time Travel */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-blue-500">
            <Ticket className="w-4 h-4" />
            <span className="text-sm font-medium">{activity?.ticket_pricing}</span>
          </div>

          <div className="flex items-center gap-2 text-orange-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">
              {activity?.time_travel_each_location}
            </span>
          </div>
        </div>

        {/* Best Time */}
        <p className="text-xs text-gray-600 mb-3">
          <span className="font-medium">Best time:</span> {activity?.best_time_to_visit}
        </p>

        {/* View on Map Button */}
        <Link
          href={
            "https://www.google.com/maps/search/?api=1&query=" +
            activity?.place_name
          }
          target="_blank"
        >
          <Button variant={"outline"} className="w-full rounded-lg">
            View on Map <ExternalLink className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PlaceCardItem;
