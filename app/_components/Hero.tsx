"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HeroVideoDialog } from "@/components/ui/hero-video-dialog";
import {
  ArrowDown,
  Compass,
  Globe2,
  Landmark,
  Plane,
  Send,
} from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export const suggestions = [
  {
    title: "Create New Trip",
    icon: <Globe2 className="text-blue-400 h-5 w-5" />,
  },
  {
    title: "Inspire me where to go",
    icon: <Plane className="text-green-400 h-5 w-5" />,
  },
  {
    title: "Discover Hidden Gems",
    icon: <Landmark className="text-orange-400 h-5 w-5" />,
  },
  {
    title: "Adventure Destination",
    icon: <Compass className="text-amber-400 h-5 w-5" />,
  },
];

const Hero = () => {
  const { user } = useUser();
  const router = useRouter();
  const onSend = () => {
    if (!user) {
      router.push("/sign-in");
      return;
    }
    //Navigate to Create Trip Planner Web Page
    router.push("/create-new-trip");
  };
  return (
    <div className="mt-24 flex items-center justify-center">
      {/* Content */}
      <div className="max-w-3xl w-full text-center space-y-6">
        <h1 className="text-xl md:text-5xl font-bold">
          Hey, I'm your Personal{" "}
          <span className="text-primary">Trip Planner</span>{" "}
        </h1>
        <p className="text-lg">
          Tell me what you want, and I'll handle the rest: Flights, Hotels, Trip
          Planner - all in seconds!
        </p>
        {/* Input Box */}
        <div>
          <div className="border rounded-2xl p-4 relative">
            <Textarea
              placeholder="Create a Trip for Paris From NewYork"
              className="w-full h-28 bg-transparent border-none focus-visible:ring-0 shadow-none resize-none"
            />
            <Button
              size={"icon"}
              className="absolute bottom-6 right-6"
              onClick={() => onSend()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Suggestion List */}
        <div className="flex gap-5">
          {suggestions.map((suggestions, index) => (
            <div
              key={index}
              className="flex items-center gap-2 border rounded-full p-2 
                  cursor-pointer hover:bg-primary hover:text-white"
            >
              {suggestions.icon}
              <h2 className="text-sm">{suggestions.title}</h2>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center flex-col">
          <h2 className="my-7 mt-14 flex gap-2 text-center">
            Not Sure where to Start?<strong>See how it works</strong>
            <ArrowDown />
          </h2>
        </div>

        {/* Video Section */}
        <HeroVideoDialog
          className="block dark:hidden "
          animationStyle="from-center"
          videoSrc="https://www.example.com/dummy-video"
          thumbnailSrc="https://mma.prnewswire.com/media/2401528/1_MindtripProduct.jpg?p=facebook"
          thumbnailAlt="Dummy Video Thumbnail"
        />
      </div>
    </div>
  );
};

export default Hero;
