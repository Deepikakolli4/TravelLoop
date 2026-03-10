"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader, Send } from "lucide-react";
import EmptyBoxState from "./EmptyBoxState";
import GroupSizeUI from "./GroupSizeUI";
import BudgetUI from "./BudgetUI";
import SelectDaysUI from "./SelectDaysUI";
import FinalUI from "./FinalUI";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUserDetail } from "@/app/provider";
import { v4 as uuidv4 } from "uuid";

type Message = {
  role: string;
  content: string;
  ui?: string;
};

export type TripInfo = {
  destination: string;
  duration: string;
  origin: string;
  budget: string;
  group_size: string;
  hotels: Hotel[];
  itinerary: Itinerary;
};

export type Hotel = {
  hotel_name: string;
  hotel_address: string;
  price_per_night: string;
  hotel_image_url: string;
  geo_coordinates: {
    latitude: number;
    longitude: number;
  };
  rating: number;
  description: string;
};

export type Activity = {
  place_name: string;
  place_details: string;
  place_image_url: string;
  geo_coordinates: {
    latitude: number;
    longitude: number;
  };
  place_address: string;
  ticket_pricing: string;
  time_travel_each_location: string;
  best_time_to_visit: string;
};

export type Itinerary = {
  day: number;
  day_plan: string;
  best_time_to_visit_day: string;
  activities: Activity[];
};

const ChatBox = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isFinal, setIsFinal] = useState(false);
  const [tripDetail, setTripDetail] = useState<TripInfo>();

  const SaveTripDetail = useMutation(api.tripDetail.CreateTripDetail);
  const { userDetail } = useUserDetail();

  const onSend = async (input?: string) => {
    const contentToSend = input ?? userInput ?? "";

    setLoading(true);
    setUserInput("");

    let updatedMessages = [...messages];

    if (contentToSend.trim()) {
      const newMsg: Message = {
        role: "user",
        content: contentToSend,
      };

      updatedMessages = [...messages, newMsg];
      setMessages(updatedMessages);
    }

    const result = await axios.post("/api/aimodel", {
      messages: updatedMessages,
      isFinal: isFinal,
    });

    const data = result.data;

    if (data?.resp) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.resp,
          ui: data.ui,
        },
      ]);
    }

    if (data?.trip_plan && !tripDetail) {
      setTripDetail(data.trip_plan);
      const tripId = uuidv4();

      await SaveTripDetail({
        tripDetail: data.trip_plan,
        tripId,
        uid: userDetail?._id,
      });
    }

    setLoading(false);
  };

  /*
  START CHAT AUTOMATICALLY
  */
  useEffect(() => {
    if (messages.length === 0) {
      onSend("");
    }
  }, []);

  const RenderGenerativeUi = (ui: string) => {
    if (ui === "budget") {
      return <BudgetUI onSelectedOption={(v: string) => onSend(v)} />;
    }

    if (ui === "groupSize") {
      return <GroupSizeUI onSelectedOption={(v: string) => onSend(v)} />;
    }

    if (ui === "tripDuration") {
      return <SelectDaysUI onSelectedOption={(v: string) => onSend(v)} />;
    }

    if (ui === "final") {
      return (
        <FinalUI
          viewTrip={() => console.log("View Trip Clicked")}
          disable={!tripDetail}
        />
      );
    }

    return null;
  };

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.ui === "final") {
      setIsFinal(true);
      setUserInput("Ok, Great!");
    }
  }, [messages]);

  return (
    <div className="h-[84vh] flex flex-col">

      <section className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <EmptyBoxState onSelectOption={(v: string) => onSend(v)} />
        )}

        {messages.map((msg, index) =>
          msg.role === "user" ? (
            <div className="flex justify-end mt-2" key={index}>
              <div className="max-w-lg bg-primary text-white px-4 py-2 rounded-lg">
                {msg.content}
              </div>
            </div>
          ) : (
            <div className="flex justify-start mt-2" key={index}>
              <div className="max-w-lg bg-gray-100 text-black px-4 py-2 rounded-lg">
                {msg.content}
                {RenderGenerativeUi(msg.ui ?? "")}
              </div>
            </div>
          )
        )}

        {loading && (
          <div className="flex justify-start mt-2">
            <div className="max-w-lg bg-gray-100 text-black px-4 py-2 rounded-lg">
              <Loader className="animate-spin" />
            </div>
          </div>
        )}
      </section>

      <section>
        <div className="border rounded-2xl p-4 relative">
          <Textarea
            placeholder="Start Typing Here....."
            className="w-full h-28 bg-transparent border-none focus-visible:ring-0 shadow-none resize-none"
            onChange={(e) => setUserInput(e.target.value)}
            value={userInput}
          />

          <Button
            size="icon"
            className="absolute bottom-6 right-6"
            onClick={() => onSend()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </section>

    </div>
  );
};

export default ChatBox;