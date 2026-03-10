"use client";

import { useState } from "react";

const HotelCard = ({ hotel, selectedHotel, setSelectedHotel }: any) => {

  const [imgError, setImgError] = useState(false);
  const isSelected = selectedHotel?.hotel_name === hotel.hotel_name;

  return (
    <div
      onClick={() => setSelectedHotel(hotel)}
      className={`cursor-pointer rounded-xl overflow-hidden shadow transition transform hover:scale-105
      ${isSelected ? "ring-4 ring-indigo-500 scale-105" : "bg-white"}`}
    >

      <div className="h-40 bg-gray-200">
        {!imgError ? (
          <img
            src={hotel.hotel_image_url || "https://via.placeholder.com/400"}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="bg-indigo-500 text-white flex items-center justify-center h-full">
            {hotel.hotel_name}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold">{hotel.hotel_name}</h3>

        <p className="text-sm text-gray-500">{hotel.hotel_address}</p>

        <div className="flex justify-between mt-2 text-sm">
          <span>💰 {hotel.price_per_night}</span>
          <span>⭐ {hotel.rating}</span>
        </div>

      </div>

    </div>
  );
};

export default HotelCard;