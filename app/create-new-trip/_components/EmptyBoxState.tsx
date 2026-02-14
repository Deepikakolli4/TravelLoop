import React from "react";
import { suggestions } from "@/app/_components/Hero";
const EmptyBoxState = ({onSelectOption}:any) => {
  return (
    <div className="mt-7">
      <h2 className="font-bold text-2xl text-center">
        Start Planning New
        <strong className="text-primary"> Trip </strong>
        Using AI
      </h2>
      <p className="text-center text-gray-400 mt-2">
        Discover personalized travel itineraries, explore the best destinations,
        and plan your dream vacations effortlessly 🌍 Let our smart AI assistant
        handle all the planning while you sit back, relax, and enjoy the
        journey✨.
      </p>
      <div className="flex  flex-col gap-5 mt-7">
        {suggestions.map((suggestions, index) => (
          <div
            key={index}
            onClick={() => onSelectOption(suggestions.title)}
            className="flex items-center gap-2 border rounded-xl p-2
                        cursor-pointer hover:border-primary hover:text-primary"
          >
            {suggestions.icon}
            <h2 className="text-md">{suggestions.title}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmptyBoxState;
