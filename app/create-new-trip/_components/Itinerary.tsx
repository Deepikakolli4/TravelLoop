"use client";

import React from "react";
import { useTripDetail } from "@/app/provider";

/* ============================= */
/* COMPONENT */
/* ============================= */
const ActivityCard = ({ activity }: any) => {
  const [imageError, setImageError] = React.useState(false);

  return (
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        activity.place_name
      )}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">
        <div className="w-full h-44 bg-gray-200 flex items-center justify-center overflow-hidden">
          {!imageError ? (
            <img
              src={activity.place_image_url || "https://via.placeholder.com/400x300?text=Place"}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
              alt={activity.place_name}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-center p-4">
              <span className="text-sm font-semibold">{activity.place_name}</span>
            </div>
          )}
        </div>

        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-lg">
            {activity.place_name}
          </h3>

          <p className="text-sm text-gray-500">
            {activity.place_address}
          </p>

          <p className="text-sm">
            {activity.place_details}
          </p>

          <p className="text-sm">
            🎫 {activity.ticket_pricing}
          </p>
        </div>
      </div>
    </a>
  );
};
const Itinerary = () => {

  const { tripDetailInfo } = useTripDetail();

  const EmptyPlaceholder = ({ when }: { when: string }) => {
    // always show three sample hostels with images for the selected time slot
    const suggestions: Record<
      string,
      { name: string; image: string }[]
    > = {
      morning: [
        {
          name: "Sunrise Hostel",
          image: "https://source.unsplash.com/400x300/?hostel,sunrise",
        },
        {
          name: "Central Hostel",
          image: "https://source.unsplash.com/400x300/?hostel,city",
        },
        {
          name: "Garden Hostel",
          image: "https://source.unsplash.com/400x300/?hostel,garden",
        },
      ],
      afternoon: [
        {
          name: "Riverside Hostel",
          image: "https://source.unsplash.com/400x300/?hostel,river",
        },
        {
          name: "Market Hostel",
          image: "https://source.unsplash.com/400x300/?hostel,market",
        },
        {
          name: "Historic Hostel",
          image: "https://source.unsplash.com/400x300/?hostel,historic",
        },
      ],
      evening: [
        {
          name: "Sunset Hostel",
          image: "https://source.unsplash.com/400x300/?hostel,sunset",
        },
        {
          name: "Nightlife Hostel",
          image: "https://source.unsplash.com/400x300/?hostel,night",
        },
        {
          name: "Skyline Hostel",
          image: "https://source.unsplash.com/400x300/?hostel,skyline",
        },
      ],
    };

    const items = suggestions[when.toLowerCase()] || [];

    return (
      <div className="py-8 bg-white rounded-lg border border-dashed border-gray-300">
        {items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {items.map((item, idx) => (
              <a
                key={idx}
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div
                  className="bg-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-2 text-sm font-medium text-gray-700">
                    {item.name}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    );
  };


  // Loading / Empty state
  if (!tripDetailInfo) {
    return (
      <div className="flex items-center justify-center h-[83vh] text-gray-400 text-lg">
        Generate a trip to see itinerary ✨
      </div>
    );
  }

  return (
    <div className="p-6 space-y-10 h-[83vh] overflow-auto bg-gray-50">

      {/* ================= HEADER ================= */}

      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold">
          Explore {tripDetailInfo.destination || "Destination"}
        </h1>

        <p className="text-gray-500 mt-1">
          {tripDetailInfo.duration || ""} • {tripDetailInfo.budget || ""}
        </p>
      </div>


      {/* ================= HOTELS ================= */}

      <div>

        <h2 className="text-xl font-semibold mb-4">
          🏨 Best Hotels
        </h2>

        {tripDetailInfo?.hotels?.length > 0 ? (

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {tripDetailInfo.hotels.map((hotel:any, index:number) => {
              const [hotelImgError, setHotelImgError] = React.useState(false);
              return (
              <div
                key={index}
                className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
              >

                <div className="w-full h-44 bg-gray-200 flex items-center justify-center overflow-hidden">
                  {!hotelImgError ? (
                    <img
                      src={hotel.hotel_image_url || "https://via.placeholder.com/400x300?text=Hotel"}
                      onError={() => setHotelImgError(true)}
                      className="w-full h-full object-cover"
                      alt={hotel.hotel_name}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-center p-4">
                      <span className="text-sm font-semibold">{hotel.hotel_name}</span>
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-2">

                  <h3 className="font-semibold text-lg">
                    {hotel.hotel_name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {hotel.hotel_address}
                  </p>

                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">
                      💰 {hotel.price_per_night}
                    </span>

                    <span className="text-yellow-500">
                      ⭐ {hotel.rating}
                    </span>
                  </div>

                </div>

              </div>
              );
            })}

          </div>

        ) : (

          <p className="text-gray-400">No hotels available</p>

        )}

      </div>
      {/* ================= FOODS ================= */}

{tripDetailInfo?.foods?.length > 0 && (
  <div>
    <h2 className="text-xl font-semibold mb-4">
      🍴 Best Foods to Try
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {tripDetailInfo.foods.map((food:any, index:number) => {
        const [foodImgError, setFoodImgError] = React.useState(false);
        return (
        <div key={index} className="bg-white rounded-xl shadow overflow-hidden">
          <div className="w-full h-40 bg-gray-200 flex items-center justify-center overflow-hidden">
            {!foodImgError ? (
              <img
                src={food.food_image_url || "https://via.placeholder.com/400x300?text=Food"}
                onError={() => setFoodImgError(true)}
                className="w-full h-full object-cover"
                alt={food.food_name}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-center p-4">
                <span className="text-sm font-semibold">{food.food_name}</span>
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold">{food.food_name}</h3>
            <p className="text-sm text-gray-500">
              {food.food_description}
            </p>
          </div>
        </div>
        );
      })}
    </div>
  </div>
)}

      {/* ================= DAY WISE ITINERARY ================= */}


{tripDetailInfo?.itinerary ? (

  (Array.isArray(tripDetailInfo.itinerary)
    ? tripDetailInfo.itinerary
    : Object.values(tripDetailInfo.itinerary)
  ).map((day: any, index: number) => {

    const activities = day.activities || [];

    // Smart grouping: Check if time_of_day exists, otherwise auto-divide
    const hasTimeOfDay = activities.some((a: any) => a.time_of_day);

    let morning = [];
    let afternoon = [];
    let evening = [];

    if (hasTimeOfDay) {
      // Time of day provided by AI
      morning = activities.filter(
        (a: any) => a.time_of_day?.toLowerCase() === "morning"
      );
      afternoon = activities.filter(
        (a: any) => a.time_of_day?.toLowerCase() === "afternoon"
      );
      evening = activities.filter(
        (a: any) => a.time_of_day?.toLowerCase() === "evening"
      );
    } else {
      // Auto-divide activities into thirds
      const total = activities.length;
      morning = activities.slice(0, Math.ceil(total / 3));
      afternoon = activities.slice(
        Math.ceil(total / 3),
        Math.ceil((2 * total) / 3)
      );
      evening = activities.slice(Math.ceil((2 * total) / 3));
    }

    return (
      <div key={index} className="space-y-6">

        <h2 className="text-2xl font-bold">
          Day {day.day || index + 1}
        </h2>

        {/* 🌅 MORNING */}
        <div>
          <h3 className="text-orange-500 font-semibold mb-3 text-lg">
            🌅 Morning
          </h3>
          {morning.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {morning.map((activity: any, idx: number) => (
                <ActivityCard key={idx} activity={activity} />
              ))}
            </div>
          ) : (
            <EmptyPlaceholder when="morning" />
          )}
        </div>

        {/* ☀ AFTERNOON */}
        <div>
          <h3 className="text-yellow-500 font-semibold mb-3 text-lg">
            ☀ Afternoon
          </h3>
          {afternoon.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {afternoon.map((activity: any, idx: number) => (
                <ActivityCard key={idx} activity={activity} />
              ))}
            </div>
          ) : (
            <EmptyPlaceholder when="afternoon" />
          )}
        </div>

        {/* 🌙 EVENING */}
        <div>
          <h3 className="text-purple-500 font-semibold mb-3 text-lg">
            🌙 Evening
          </h3>
          {evening.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {evening.map((activity: any, idx: number) => (
                <ActivityCard key={idx} activity={activity} />
              ))}
            </div>
          ) : (
            <EmptyPlaceholder when="evening" />
          )}
        </div>

      </div>
    );
  })

) : (
  <p className="text-gray-400">No itinerary available</p>
)}

    </div>
  );
};

export default Itinerary;