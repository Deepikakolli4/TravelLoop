"use client";

import { useState } from "react";

const FoodCard = ({ food }: any) => {

  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">

      <div className="h-40 bg-gray-200">
        {!imgError ? (
          <img
            src={food.food_image_url || "https://via.placeholder.com/400"}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="bg-orange-500 text-white flex items-center justify-center h-full">
            {food.food_name}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold">{food.food_name}</h3>
        <p className="text-sm text-gray-500">{food.food_description}</p>
      </div>

    </div>
  );
};

export default FoodCard;