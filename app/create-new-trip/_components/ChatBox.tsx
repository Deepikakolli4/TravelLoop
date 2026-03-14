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
import { useTripDetail } from "@/app/provider";
import { TripInfo } from "./types";

type Message = {
  role: string;
  content: string;
  ui?: string;
  data?: any;
};

const ChatBox = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isFinal, setIsFinal] = useState(false);
  const [tripDetail, setTripDetail] = useState<TripInfo>();

  const SaveTripEvent = useMutation(api.tripDetail.CreateTripEvent);
  const { userDetail } = useUserDetail();
  const { setTripDetailInfo } = useTripDetail();

  const handleViewTrip = () => {
    if (!tripDetail?.tripId) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent("travelloop:view-trip-map", {
        detail: { tripId: tripDetail.tripId },
      })
    );

    SaveTripEvent({
      tripId: tripDetail.tripId,
      uid: userDetail?._id,
      eventType: "save",
      entityType: "trip",
      entityName: tripDetail.destination,
      score: tripDetail.mlInsights?.feasibility?.score,
      metadata: {
        intent: tripDetail.mlInsights?.intent?.label,
      },
    }).catch((error) => {
      console.error("Failed to log save event", error);
    });

    const itineraryEl = document.getElementById("itinerary-section");
    itineraryEl?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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

    try {
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
            data: data.uiData,
          },
        ]);
      }

      if (data?.trip_plan) {
        const isNewTrip = !tripDetail;
        const resolvedTripId = tripDetail?.tripId ?? uuidv4();

        const newTrip: TripInfo = {
          ...(data.trip_plan as TripInfo),
          tripId: resolvedTripId,
        };

        setTripDetail(newTrip);
        setTripDetailInfo(newTrip);

        if (isNewTrip && userDetail?._id) {
          await SaveTripEvent({
            tripId: resolvedTripId,
            uid: userDetail._id,
            eventType: "plan_generated",
            entityType: "trip",
            entityName: newTrip.destination,
            score: newTrip.mlInsights?.feasibility?.score,
            metadata: {
              intent: newTrip.mlInsights?.intent?.label,
              budgetBand: newTrip.budget,
              duration: newTrip.duration,
              hotelsCount: newTrip.hotels?.length ?? 0,
              daysCount: newTrip.itinerary?.length ?? 0,
            },
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch AI response", error);
    } finally {
      setLoading(false);
    }
  };

  /*
  START CHAT AUTOMATICALLY
  */
  useEffect(() => {
    if (messages.length === 0) {
      onSend("");
    }
  }, []);

  const RenderGenerativeUi = (ui: string, data?: any) => {
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
          viewTrip={handleViewTrip}
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
                {RenderGenerativeUi(msg.ui ?? "", msg.data)}
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