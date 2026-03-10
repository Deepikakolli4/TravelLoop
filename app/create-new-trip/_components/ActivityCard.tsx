"use client";

import { useState } from "react";

const ActivityCard = ({ activity }: any) => {
  const [imageError, setImageError] = useState(false);

  return (
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        activity.place_name
      )}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">

        <div className="h-44 bg-gray-200 flex items-center justify-center">
          {!imageError ? (
            <img
              src={activity.place_image_url || "https://via.placeholder.com/400"}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-white bg-gradient-to-r from-indigo-500 to-purple-500 w-full h-full flex items-center justify-center">
              {activity.place_name}
            </div>
          )}
        </div>

        <div className="p-4 space-y-2">
          <h3 className="font-semibold">{activity.place_name}</h3>
          <p className="text-sm text-gray-500">{activity.place_address}</p>
          <p className="text-sm">{activity.place_details}</p>
          <p className="text-sm">🎫 {activity.ticket_pricing}</p>
        </div>

      </div>
    </a>
  );
};

export default ActivityCard;