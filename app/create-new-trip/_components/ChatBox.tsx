"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Loader, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTripDetail } from "@/app/provider";
import { Message } from "./types";

const ChatBot = () => {

  const { setTripDetailInfo } = useTripDetail();

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi 👋 Where are you leaving from?" },
  ]);

  const [step, setStep] = useState(0);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(1);
  const [budget, setBudget] = useState("");
  const [travelWith, setTravelWith] = useState("");

  const [loading, setLoading] = useState(false);

  const messagesRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  /* ============================= */
  /* ADD MESSAGE */
  /* ============================= */

  const addMessage = (role: "user" | "assistant", text: string) => {
    setMessages(prev => [...prev, { role, content: text }]);
  };

  /* ============================= */
  /* GENERATE TRIP */
  /* ============================= */

  const generateTrip = async (selectedTravelWith: string) => {

    setLoading(true);

    try {

      const res = await axios.post("/api/aimodel", {
        origin,
        destination,
        days,
        budget,
        travelWith: selectedTravelWith,
      });

      const trip =
        res?.data?.trip_plan ||
        res?.data?.trip ||
        res?.data?.data?.trip_plan;

      if (!trip) {
        addMessage("assistant", "Trip generation failed 😔");
        setLoading(false);
        return;
      }

      addMessage("assistant", `Trip to ${trip.destination} created 🎉`);

      setTripDetailInfo(trip);

      setStep(5);

    } catch (err: any) {

      if (err.response?.status === 403) {

        addMessage(
          "assistant",
          "🚀 Free limit finished.\n\nPlease upgrade your plan to continue using TravelLoop."
        );

        setLoading(false);
        return;
      }

      addMessage("assistant", "Something went wrong 😔 Please try again.");
    }

    setLoading(false);
  };

  /* ============================= */
  /* STEP HANDLERS */
  /* ============================= */

  const handleNext = () => {

    if (step === 0 && origin.trim()) {
      addMessage("user", origin);
      addMessage("assistant", "Where do you want to go?");
      setStep(1);
    }

    else if (step === 1 && destination.trim()) {
      addMessage("user", destination);
      addMessage("assistant", "How many days?");
      setStep(2);
    }

    else if (step === 2 && days > 0) {
      addMessage("user", `${days} Days`);
      addMessage("assistant", "Select your budget");
      setStep(3);
    }
  };

  const selectBudget = (value: string) => {
    setBudget(value);
    addMessage("user", value);
    addMessage("assistant", "Who are you traveling with?");
    setStep(4);
  };

  const selectTravel = async (value: string) => {
    setTravelWith(value);
    addMessage("user", value);
    addMessage("assistant", "Planning your dream trip ✨");

    await generateTrip(value);
  };

  /* ============================= */
  /* AUTO SCROLL */
  /* ============================= */

  useEffect(() => {
    const el = messagesRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages, loading]);

  useEffect(() => {
    const el = inputRef.current;
    if (el) el.focus();
  }, [step]);

  /* ============================= */
  /* UI */
  /* ============================= */

  return (
    <div className="h-[84vh] flex flex-col bg-white rounded-xl shadow-md overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">TL</div>
          <div>
            <div className="font-semibold">TravelLoop Assistant</div>
            <div className="text-xs text-muted-foreground">Guided trip builder — step by step</div>
          </div>
        </div>
        <div className="text-sm text-gray-500">Step {Math.min(step + 1, 6)}/6</div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-gray-200">
        <div
          className="h-1 bg-indigo-500 transition-all"
          style={{ width: `${Math.min(((step + 1) / 6) * 100, 100)}%` }}
        />
      </div>

      {/* Messages */}
      <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-gray-50">

        {messages.map((msg, i) => (
          <div key={`${msg.role}-${i}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm ${
              msg.role === 'user'
                ? 'bg-indigo-600 text-white rounded-br-none'
                : 'bg-white text-gray-900 rounded-bl-none'
            }`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader className="animate-spin" />
            <div>Generating itinerary…</div>
          </div>
        )}

      </div>

      {/* Controls */}
      <div className="p-4 border-t bg-white space-y-3">

        {step === 0 && (
          <div className="flex gap-2">
            <input
              ref={inputRef}
              className="flex-1 border rounded-lg px-3 py-2"
              placeholder="Leaving from"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            />
            <Button disabled={!origin} onClick={handleNext}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="flex gap-2">
            <input
              ref={inputRef}
              className="flex-1 border rounded-lg px-3 py-2"
              placeholder="Destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
            <Button disabled={!destination} onClick={handleNext}>
              Next
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="flex items-center gap-3">
            <button onClick={() => setDays(Math.max(1, days - 1))}>-</button>
            <div>{days} Days</div>
            <button onClick={() => setDays(days + 1)}>+</button>
            <Button onClick={handleNext}>Confirm</Button>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Cheap", icon: "💸" },
              { label: "Moderate", icon: "💼" },
              { label: "Luxury", icon: "💎" },
            ].map((b) => (
              <div
                key={b.label}
                onClick={() => selectBudget(b.label)}
                className="p-3 rounded-xl shadow-md cursor-pointer text-center bg-gray-100 hover:bg-gray-200 flex flex-col items-center justify-center"
              >
                <span className="text-2xl mb-1">{b.icon}</span>
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Solo", icon: "🧍" },
              { label: "Couple", icon: "❤️" },
              { label: "Family", icon: "👨‍👩‍👧" },
              { label: "Friends", icon: "👯" },
            ].map((p) => (
              <div
                key={p.label}
                onClick={() => selectTravel(p.label)}
                className="p-4 rounded-xl shadow-lg cursor-pointer bg-gray-100 hover:bg-gray-200 text-center flex flex-col items-center justify-center"
              >
                <span className="text-2xl mb-1">{p.icon}</span>
                <span>{p.label}</span>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};

export default ChatBot;