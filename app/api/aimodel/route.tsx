import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY,
});

const QUESTION_KEYWORDS = {
  DESTINATION: "Where would you like to travel?",
  ORIGIN: "Where are you travelling from?",
  TRIPTYPE: "What type of trip are you planning?",
  BUDGET: "What is your budget for the trip?",
  GROUP: "How many people are travelling?",
  DURATION: "How many days will your trip be?",
};

type IntentLabel =
  | "relaxation"
  | "adventure"
  | "family"
  | "romance"
  | "culture"
  | "food"
  | "nature"
  | "business"
  | "mixed";

type BudgetEstimate = {
  minTotalUsd: number;
  maxTotalUsd: number;
  dailyAverageUsd: number;
  confidence: "low" | "medium" | "high";
};

type BudgetBreakdown = {
  transport: { minUsd: number; maxUsd: number };
  hotel: { minUsd: number; maxUsd: number };
  food: { minUsd: number; maxUsd: number };
  activities: { minUsd: number; maxUsd: number };
};

type SmartBudgetPrediction = {
  total: {
    minUsd: number;
    maxUsd: number;
  };
  perDay: {
    minUsd: number;
    maxUsd: number;
  };
  confidence: "low" | "medium" | "high";
  assumptions: string[];
  breakdown: BudgetBreakdown;
  timeToBookSignal: TimeToBookSignal;
  demandHeatmapSignal: DemandHeatmapSignal;
};

type TimeToBookSignal = {
  trend: "rise" | "dip" | "stable";
  horizonDays: number;
  confidence: "low" | "medium" | "high";
  urgency: "low" | "medium" | "high";
  recommendation: string;
  reasons: string[];
};

type DemandHeatmapSignal = {
  crowdLevel: "low" | "medium" | "high";
  confidence: "low" | "medium" | "high";
  forecastWindowDays: number;
  bestDateWindows: string[];
  recommendation: string;
};

type FeasibilityInsight = {
  score: number;
  verdict: "easy" | "balanced" | "packed";
  reasons: string[];
};

type TripHotel = {
  hotel_name: string;
  hotel_address: string;
  price_per_night: string;
  hotel_image_url?: string;
  geo_coordinates?: {
    latitude: number;
    longitude: number;
  };
  rating: number;
  description: string;
  ml_score?: number;
  ml_reasons?: string[];
};

type TripActivity = {
  place_name: string;
  place_details: string;
  place_image_url?: string;
  geo_coordinates?: {
    latitude: number;
    longitude: number;
  };
  place_address: string;
  ticket_pricing: string;
  time_travel_each_location: string;
  best_time_to_visit: string;
  ml_score?: number;
  ml_reasons?: string[];
};

type TripDay = {
  day: number;
  day_plan: string;
  best_time_to_visit_day: string;
  activities: TripActivity[];
};

type TripPlan = {
  destination: string;
  duration: string;
  origin: string;
  budget: string;
  group_size: string;
  famous_food_items?: string[];
  hotels: TripHotel[];
  itinerary: TripDay[];
  mlInsights?: {
    intent: {
      label: IntentLabel;
      confidence: number;
      tags: string[];
    };
    budgetEstimate: BudgetEstimate;
    feasibility: FeasibilityInsight;
    timeToBookSignal: TimeToBookSignal;
    demandHeatmapSignal: DemandHeatmapSignal;
    generatedAt: string;
    modelVersion: string;
  };
};

const toNum = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const num = Number(value.match(/[\d.]+/)?.[0] ?? "");
    return Number.isFinite(num) ? num : fallback;
  }

  return fallback;
};

const parseDays = (value: string): number => {
  const parsed = toNum(value, 5);
  return Math.min(Math.max(Math.round(parsed), 1), 21);
};

const parseGroupSize = (value: string): number => {
  const direct = toNum(value, 0);
  if (direct > 0) {
    return Math.min(Math.round(direct), 20);
  }

  const text = value.toLowerCase();
  if (text.includes("solo")) return 1;
  if (text.includes("couple")) return 2;
  if (text.includes("family")) return 4;
  if (text.includes("group")) return 5;
  return 2;
};

const budgetBandToDaily = (
  budget: string
): { min: number; max: number; confidence: "low" | "medium" | "high" } => {
  const text = budget.toLowerCase();

  if (text.includes("lux") || text.includes("premium")) {
    return { min: 260, max: 520, confidence: "high" };
  }

  if (text.includes("budget") || text.includes("cheap") || text.includes("low")) {
    return { min: 45, max: 120, confidence: "high" };
  }

  if (text.includes("mid") || text.includes("moderate") || text.includes("standard")) {
    return { min: 120, max: 260, confidence: "high" };
  }

  return { min: 90, max: 280, confidence: "medium" };
};

const detectIntent = (tripType: string, destination: string): { label: IntentLabel; confidence: number; tags: string[] } => {
  const text = `${tripType} ${destination}`.toLowerCase();

  const keywordMap: Array<{ label: IntentLabel; tags: string[]; weight: number }> = [
    { label: "adventure", tags: ["trek", "hike", "adventure", "surf", "ski", "camp"], weight: 0 },
    { label: "relaxation", tags: ["relax", "beach", "wellness", "spa", "chill"], weight: 0 },
    { label: "family", tags: ["family", "kids", "child", "children"], weight: 0 },
    { label: "romance", tags: ["honeymoon", "romantic", "couple", "anniversary"], weight: 0 },
    { label: "culture", tags: ["museum", "history", "heritage", "culture", "temple"], weight: 0 },
    { label: "food", tags: ["food", "culinary", "street food", "restaurant"], weight: 0 },
    { label: "nature", tags: ["nature", "wildlife", "mountain", "forest", "lake"], weight: 0 },
    { label: "business", tags: ["business", "work", "conference", "remote work"], weight: 0 },
  ];

  for (const item of keywordMap) {
    for (const tag of item.tags) {
      if (text.includes(tag)) {
        item.weight += 1;
      }
    }
  }

  keywordMap.sort((a, b) => b.weight - a.weight);
  const top = keywordMap[0];
  const second = keywordMap[1];

  if (!top || top.weight === 0) {
    return {
      label: "mixed",
      confidence: 0.55,
      tags: ["general", "balanced"],
    };
  }

  const confidence = Math.min(0.95, 0.62 + (top.weight - (second?.weight ?? 0)) * 0.1);
  return {
    label: top.label,
    confidence: Number(confidence.toFixed(2)),
    tags: top.tags.filter((tag) => text.includes(tag)).slice(0, 3),
  };
};

const estimateBudget = (budget: string, days: number, groupText: string): BudgetEstimate => {
  const band = budgetBandToDaily(budget);
  const groupSize = parseGroupSize(groupText);
  const groupMultiplier = groupSize <= 2 ? 1 : 1 + (groupSize - 2) * 0.35;

  const minTotal = Math.round(band.min * days * groupMultiplier);
  const maxTotal = Math.round(band.max * days * groupMultiplier);

  return {
    minTotalUsd: minTotal,
    maxTotalUsd: maxTotal,
    dailyAverageUsd: Math.round((minTotal + maxTotal) / 2 / days),
    confidence: band.confidence,
  };
};

const getTimeToBookSignal = (
  destination: string,
  tripType: string,
  budget: string
): TimeToBookSignal => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const text = `${destination} ${tripType} ${budget}`.toLowerCase();

  let score = 0;
  const reasons: string[] = [];

  if ([5, 6, 7, 11, 12].includes(month)) {
    score += 2;
    reasons.push("Approaching or within high-demand season");
  }

  if (text.includes("beach") || text.includes("honeymoon") || text.includes("family")) {
    score += 1;
    reasons.push("Category typically sees faster price movement");
  }

  if (text.includes("budget") || text.includes("low")) {
    score += 1;
    reasons.push("Budget inventory tends to sell out earlier");
  }

  if (text.includes("business") || text.includes("work")) {
    score += 1;
    reasons.push("Business routes often tighten close to travel dates");
  }

  if (score >= 3) {
    return {
      trend: "rise",
      horizonDays: 7,
      confidence: "high",
      urgency: "high",
      recommendation: "Prices are likely to rise soon. Book flights and core hotel nights now.",
      reasons: reasons.slice(0, 3),
    };
  }

  if (score === 2) {
    return {
      trend: "rise",
      horizonDays: 14,
      confidence: "medium",
      urgency: "medium",
      recommendation: "Slight upward pressure expected. Book within 1-2 weeks for better value.",
      reasons: reasons.slice(0, 3),
    };
  }

  if (score <= 0) {
    return {
      trend: "dip",
      horizonDays: 21,
      confidence: "low",
      urgency: "low",
      recommendation: "Potential short-term dip. Track for 1-2 weeks before booking.",
      reasons: ["Current demand signals look soft", "No immediate seasonal pressure"],
    };
  }

  return {
    trend: "stable",
    horizonDays: 14,
    confidence: "medium",
    urgency: "medium",
    recommendation: "Prices likely to stay range-bound. Book when you find a fair fare.",
    reasons: reasons.slice(0, 3),
  };
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const fmtDate = (date: Date) =>
  `${date.toLocaleString("en-US", { month: "short" })} ${String(
    date.getDate()
  ).padStart(2, "0")}`;

const getDemandHeatmapSignal = (destination: string): DemandHeatmapSignal => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const text = destination.toLowerCase();

  let demandScore = 0;

  if ([5, 6, 7, 11, 12].includes(month)) {
    demandScore += 2;
  }

  if (
    text.includes("goa") ||
    text.includes("bali") ||
    text.includes("paris") ||
    text.includes("dubai") ||
    text.includes("swiss") ||
    text.includes("london")
  ) {
    demandScore += 1;
  }

  let crowdLevel: "low" | "medium" | "high" = "medium";
  let confidence: "low" | "medium" | "high" = "medium";
  let recommendation = "Expect moderate crowd levels. Prefer mid-week starts.";

  if (demandScore >= 3) {
    crowdLevel = "high";
    confidence = "high";
    recommendation = "Peak crowd pressure likely. Choose shoulder-week windows to avoid queues.";
  } else if (demandScore <= 1) {
    crowdLevel = "low";
    confidence = "medium";
    recommendation = "Crowd levels are likely manageable. Good flexibility on travel dates.";
  }

  const bestDateWindows = [
    `${fmtDate(addDays(now, 9))} - ${fmtDate(addDays(now, 13))}`,
    `${fmtDate(addDays(now, 16))} - ${fmtDate(addDays(now, 20))}`,
  ];

  return {
    crowdLevel,
    confidence,
    forecastWindowDays: 21,
    bestDateWindows,
    recommendation,
  };
};

const buildSmartBudgetPrediction = (
  origin: string,
  destination: string,
  tripType: string,
  budget: string,
  days: number,
  groupText: string
): SmartBudgetPrediction => {
  const groupSize = parseGroupSize(groupText);
  const band = budgetBandToDaily(budget);
  const groupMultiplier = groupSize <= 2 ? 1 : 1 + (groupSize - 2) * 0.35;

  let distanceFactor = 1;
  if (origin.toLowerCase() !== destination.toLowerCase()) {
    distanceFactor = 1.2;
  }

  const baseMin = band.min * days * groupMultiplier;
  const baseMax = band.max * days * groupMultiplier;

  const transportMin = Math.round(baseMin * 0.22 * distanceFactor);
  const transportMax = Math.round(baseMax * 0.32 * distanceFactor);
  const hotelMin = Math.round(baseMin * 0.34);
  const hotelMax = Math.round(baseMax * 0.4);
  const foodMin = Math.round(baseMin * 0.2);
  const foodMax = Math.round(baseMax * 0.24);
  const activitiesMin = Math.round(baseMin * 0.18);
  const activitiesMax = Math.round(baseMax * 0.24);

  const totalMin = transportMin + hotelMin + foodMin + activitiesMin;
  const totalMax = transportMax + hotelMax + foodMax + activitiesMax;
  const timeToBookSignal = getTimeToBookSignal(destination, tripType, budget);
  const demandHeatmapSignal = getDemandHeatmapSignal(destination);

  return {
    total: {
      minUsd: totalMin,
      maxUsd: totalMax,
    },
    perDay: {
      minUsd: Math.round(totalMin / days),
      maxUsd: Math.round(totalMax / days),
    },
    confidence: band.confidence,
    assumptions: [
      `Calculated for ${days} day(s) and ${groupSize} traveler(s).`,
      "Hotel is mid-range within your selected budget band.",
      "Activities include a mix of paid and free experiences.",
    ],
    breakdown: {
      transport: { minUsd: transportMin, maxUsd: transportMax },
      hotel: { minUsd: hotelMin, maxUsd: hotelMax },
      food: { minUsd: foodMin, maxUsd: foodMax },
      activities: { minUsd: activitiesMin, maxUsd: activitiesMax },
    },
    timeToBookSignal,
    demandHeatmapSignal,
  };
};

const getLatestBudgetChoice = (userMessages: any[], fallback: string): string => {
  const candidate = String(userMessages[3]?.content ?? "").trim();
  return candidate || fallback;
};

const getPriceTier = (priceText: string): "budget" | "mid" | "luxury" => {
  const value = toNum(priceText, 0);
  if (value === 0) {
    const text = priceText.toLowerCase();
    if (text.includes("lux") || text.includes("premium")) return "luxury";
    if (text.includes("budget") || text.includes("cheap")) return "budget";
    return "mid";
  }

  if (value <= 120) return "budget";
  if (value <= 260) return "mid";
  return "luxury";
};

const matchesBudgetTier = (budgetText: string, tier: "budget" | "mid" | "luxury"): boolean => {
  const text = budgetText.toLowerCase();
  if (text.includes("budget") || text.includes("cheap") || text.includes("low")) {
    return tier === "budget";
  }
  if (text.includes("mid") || text.includes("moderate") || text.includes("standard")) {
    return tier === "mid" || tier === "budget";
  }
  if (text.includes("lux") || text.includes("premium")) {
    return tier === "luxury" || tier === "mid";
  }
  return true;
};

const scoreHotels = (hotels: TripHotel[], budget: string, intent: IntentLabel, groupText: string): TripHotel[] => {
  return [...hotels]
    .map((hotel) => {
      let score = 0.5;
      const reasons: string[] = [];
      const rating = toNum(hotel.rating, 4);
      const tier = getPriceTier(hotel.price_per_night ?? "");
      const desc = `${hotel.description ?? ""} ${hotel.hotel_name ?? ""}`.toLowerCase();
      const groupSize = parseGroupSize(groupText);

      score += Math.min(0.25, (rating - 3.5) * 0.1);
      reasons.push(`Rating ${rating.toFixed(1)}`);

      if (matchesBudgetTier(budget, tier)) {
        score += 0.18;
        reasons.push("Good budget fit");
      } else {
        score -= 0.08;
      }

      if (groupSize >= 4 && (desc.includes("family") || desc.includes("suite"))) {
        score += 0.1;
        reasons.push("Family-friendly setup");
      }

      if (intent === "romance" && (desc.includes("romantic") || desc.includes("couple"))) {
        score += 0.1;
        reasons.push("Romance-oriented vibe");
      }

      if (intent === "business" && (desc.includes("business") || desc.includes("wifi"))) {
        score += 0.08;
        reasons.push("Business convenience");
      }

      const finalScore = Number(Math.min(0.99, Math.max(0.1, score)).toFixed(2));

      return {
        ...hotel,
        ml_score: finalScore,
        ml_reasons: reasons.slice(0, 3),
      };
    })
    .sort((a, b) => (b.ml_score ?? 0) - (a.ml_score ?? 0));
};

const scoreActivity = (activity: TripActivity, budget: string, intent: IntentLabel): TripActivity => {
  let score = 0.5;
  const reasons: string[] = [];
  const text = `${activity.place_name} ${activity.place_details} ${activity.ticket_pricing}`.toLowerCase();

  const freeOrLow = text.includes("free") || toNum(activity.ticket_pricing, 999) <= 25;
  if (freeOrLow && budget.toLowerCase().includes("budget")) {
    score += 0.15;
    reasons.push("Budget-friendly activity");
  }

  if (intent === "adventure" && (text.includes("trek") || text.includes("hike") || text.includes("adventure"))) {
    score += 0.16;
    reasons.push("Matches adventure intent");
  }

  if (intent === "culture" && (text.includes("museum") || text.includes("heritage") || text.includes("temple"))) {
    score += 0.16;
    reasons.push("Strong cultural relevance");
  }

  if (intent === "food" && (text.includes("food") || text.includes("market") || text.includes("restaurant"))) {
    score += 0.16;
    reasons.push("Food-centric experience");
  }

  if (intent === "nature" && (text.includes("nature") || text.includes("park") || text.includes("lake") || text.includes("forest"))) {
    score += 0.16;
    reasons.push("Nature-oriented pick");
  }

  score += 0.03;
  reasons.push("Fits day flow");

  return {
    ...activity,
    ml_score: Number(Math.min(0.99, Math.max(0.1, score)).toFixed(2)),
    ml_reasons: reasons.slice(0, 3),
  };
};

const scoreItinerary = (itinerary: TripDay[], budget: string, intent: IntentLabel): TripDay[] => {
  return itinerary.map((day) => {
    const activities = [...(day.activities ?? [])]
      .map((a) => scoreActivity(a, budget, intent))
      .sort((a, b) => (b.ml_score ?? 0) - (a.ml_score ?? 0));

    return {
      ...day,
      activities,
    };
  });
};

const estimateTravelMinutes = (value: string): number => {
  const text = value.toLowerCase();
  const hour = toNum(text.match(/(\d+)\s*h/)?.[1] ?? "", 0);
  const min = toNum(text.match(/(\d+)\s*m/)?.[1] ?? "", 0);
  const compactHour = hour > 0 ? hour : toNum(text.match(/(\d+(?:\.\d+)?)\s*hour/)?.[1] ?? "", 0);
  const compactMin = min > 0 ? min : toNum(text.match(/(\d+)\s*min/)?.[1] ?? "", 0);
  const fallback = toNum(text, 45);

  const total = compactHour * 60 + compactMin;
  return total > 0 ? total : fallback;
};

const evaluateFeasibility = (itinerary: TripDay[], days: number): FeasibilityInsight => {
  const reasons: string[] = [];
  if (!itinerary.length) {
    return {
      score: 0.5,
      verdict: "balanced",
      reasons: ["No activities found, using neutral feasibility"],
    };
  }

  const activityCounts = itinerary.map((d) => d.activities?.length ?? 0);
  const avgActivities = activityCounts.reduce((a, b) => a + b, 0) / activityCounts.length;
  const totalTravelMins = itinerary
    .flatMap((d) => d.activities ?? [])
    .reduce((sum, a) => sum + estimateTravelMinutes(a.time_travel_each_location ?? ""), 0);

  const avgTravelPerActivity = totalTravelMins / Math.max(1, activityCounts.reduce((a, b) => a + b, 0));

  let score = 0.9;

  if (avgActivities > 4.5) {
    score -= 0.3;
    reasons.push("High number of activities per day");
  } else if (avgActivities > 3.5) {
    score -= 0.15;
    reasons.push("Moderately packed schedule");
  } else {
    reasons.push("Reasonable activity pacing");
  }

  if (avgTravelPerActivity > 70) {
    score -= 0.25;
    reasons.push("Long average travel time between stops");
  } else if (avgTravelPerActivity > 45) {
    score -= 0.12;
    reasons.push("Some travel-heavy segments");
  } else {
    reasons.push("Short transfer durations");
  }

  if (days <= 2 && avgActivities > 4) {
    score -= 0.15;
    reasons.push("Short trip with dense activities");
  }

  const bounded = Number(Math.max(0.1, Math.min(0.99, score)).toFixed(2));
  let verdict: "easy" | "balanced" | "packed" = "balanced";

  if (bounded >= 0.78) verdict = "easy";
  if (bounded < 0.55) verdict = "packed";

  return {
    score: bounded,
    verdict,
    reasons: reasons.slice(0, 3),
  };
};

const getFamousFoodItems = (destination: string): string[] => {
  const text = destination.toLowerCase();

  if (text.includes("goa")) {
    return ["Goan Fish Curry", "Prawn Balchao", "Pork Vindaloo", "Bebinca", "Poi"];
  }
  if (text.includes("jaipur") || text.includes("rajasthan")) {
    return ["Dal Baati Churma", "Laal Maas", "Gatte ki Sabzi", "Ker Sangri", "Ghewar"];
  }
  if (text.includes("kerala")) {
    return ["Appam and Stew", "Kerala Sadya", "Puttu and Kadala", "Malabar Parotta", "Payasam"];
  }
  if (text.includes("manali") || text.includes("himachal")) {
    return ["Siddu", "Madra", "Dhaam", "Chha Gosht", "Babru"];
  }
  if (text.includes("mumbai")) {
    return ["Vada Pav", "Pav Bhaji", "Bombay Sandwich", "Bhel Puri", "Bombil Fry"];
  }
  if (text.includes("paris")) {
    return ["Croissant", "Coq au Vin", "Crepes", "Ratatouille", "Macarons"];
  }
  if (text.includes("tokyo")) {
    return ["Sushi", "Ramen", "Tempura", "Okonomiyaki", "Mochi"];
  }
  if (text.includes("dubai")) {
    return ["Shawarma", "Machboos", "Luqaimat", "Harees", "Knafeh"];
  }

  return ["Local Street Food", "Regional Thali", "Signature Seafood", "Traditional Dessert", "Cafe Specialties"];
};

const normalizeTripPlan = (raw: any, fallback: Omit<TripPlan, "hotels" | "itinerary">): TripPlan => {
  const normalizeGeneratedImageUrl = (value: any, fallbackTag: string) => {
    const str = typeof value === "string" ? value.trim() : "";
    if (!str) {
      return "";
    }

    if (str.includes("unsplash.com/photos") || str.includes("source.unsplash.com")) {
      return "";
    }

    return str;
  };

  const itineraryFromDailyPlan = Array.isArray(raw?.dailyPlan)
    ? raw.dailyPlan.map((item: any, idx: number) => ({
        day: toNum(item?.day, idx + 1),
        day_plan:
          item?.day_plan ||
          [item?.morning, item?.afternoon, item?.evening].filter(Boolean).join(" | ") ||
          "Explore at your own pace",
        best_time_to_visit_day: item?.best_time_to_visit_day || "Morning to Evening",
        activities: Array.isArray(item?.activities)
          ? item.activities
          : [
            {
              place_name: item?.morning || "Morning exploration",
              place_details: "Start the day with a key attraction.",
              place_address: raw?.destination || fallback.destination,
              ticket_pricing: "Varies",
              time_travel_each_location: "30 min",
              best_time_to_visit: "Morning",
              place_image_url: "",
            },
            {
              place_name: item?.afternoon || "Afternoon highlights",
              place_details: "Continue with central daytime experiences.",
              place_address: raw?.destination || fallback.destination,
              ticket_pricing: "Varies",
              time_travel_each_location: "30 min",
              best_time_to_visit: "Afternoon",
              place_image_url: "",
            },
            {
              place_name: item?.evening || "Evening plan",
              place_details: item?.restaurant || "End with local culture or dining.",
              place_address: raw?.destination || fallback.destination,
              ticket_pricing: "Varies",
              time_travel_each_location: "30 min",
              best_time_to_visit: "Evening",
              place_image_url: "",
            },
          ],
      }))
    : [];

  const itineraryRaw = Array.isArray(raw?.itinerary)
    ? raw.itinerary
    : itineraryFromDailyPlan;

  const ensureDayCoverage = (day: any) => {
    const slots: Array<"Morning" | "Afternoon" | "Evening"> = ["Morning", "Afternoon", "Evening"];
    const existing = Array.isArray(day?.activities) ? day.activities : [];

    const filled = [...existing].map((a) => ({
      ...a,
      place_image_url: normalizeGeneratedImageUrl(
        a?.place_image_url,
        `${fallback.destination},attraction`
      ),
    }));

    for (const slot of slots) {
      const hasSlot = filled.some((a) =>
        String(a?.best_time_to_visit ?? "")
          .toLowerCase()
          .includes(slot.toLowerCase())
      );

      if (!hasSlot) {
        filled.push({
          place_name: `${slot} exploration`,
          place_details: `Planned ${slot.toLowerCase()} activity for balanced pacing.`,
          place_image_url: normalizeGeneratedImageUrl(
            "",
            `${fallback.destination},${slot.toLowerCase()},travel`
          ),
          place_address: raw?.destination || fallback.destination,
          ticket_pricing: "Varies",
          time_travel_each_location: "30 min",
          best_time_to_visit: slot,
        });
      }
    }

    while (filled.length < 5) {
      const idx = filled.length + 1;
      const slot = idx % 2 === 0 ? "Afternoon" : "Evening";
      filled.push({
        place_name: idx % 2 === 0 ? `Cafe stop ${idx}` : `Restaurant pick ${idx}`,
        place_details:
          idx % 2 === 0
            ? "Local cafe and street exploration."
            : "Recommended dining experience and local cuisine.",
        place_image_url: normalizeGeneratedImageUrl(
          "",
          `${fallback.destination},food,restaurant`
        ),
        place_address: raw?.destination || fallback.destination,
        ticket_pricing: idx % 2 === 0 ? "Free" : "$10-$30",
        time_travel_each_location: "20-30 min",
        best_time_to_visit: slot,
      });
    }

    return {
      ...day,
      best_time_to_visit_day: day?.best_time_to_visit_day || "Morning, Afternoon, Evening",
      activities: filled.slice(0, 5),
    };
  };

  const itinerary = itineraryRaw.map((day: any, idx: number) =>
    ensureDayCoverage({
      day: toNum(day?.day, idx + 1),
      day_plan: day?.day_plan || "Explore key highlights throughout the day",
      best_time_to_visit_day: day?.best_time_to_visit_day,
      activities: day?.activities,
    })
  );

  const hotels = (Array.isArray(raw?.hotels) ? raw.hotels : []).map((hotel: any) => ({
    ...hotel,
    hotel_image_url: normalizeGeneratedImageUrl(
      hotel?.hotel_image_url,
      `${fallback.destination},hotel`
    ),
  }));

  return {
    destination: raw?.destination || fallback.destination,
    duration: raw?.duration || fallback.duration,
    origin: raw?.origin || fallback.origin,
    budget: raw?.budget || fallback.budget,
    group_size: raw?.group_size || raw?.groupSize || fallback.group_size,
    famous_food_items: Array.isArray(raw?.famous_food_items) && raw.famous_food_items.length
      ? raw.famous_food_items.slice(0, 8)
      : getFamousFoodItems(raw?.destination || fallback.destination),
    hotels,
    itinerary,
  };
};

export async function POST(req: Request) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    console.log("[DEBUG] === NEW REQUEST RECEIVED ===");

    const { messages = [] } = body;

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: "messages must be an array" },
        { status: 400 }
      );
    }

    const userMessages = messages.filter((m: any) => m?.role === "user");
    const assistantMessages = messages.filter((m: any) => m?.role === "assistant");

    console.log("[DEBUG] user messages count:", userMessages.length);
    console.log("[DEBUG] assistant messages count:", assistantMessages.length);

    let responseText = "";
    let uiType: string | undefined = undefined;

    /*
    =====================================
    CHAT FLOW CONTROL (FIXED)
    =====================================
    */

    switch (userMessages.length) {
      case 0:
        console.log("[STEP 1] Asking DESTINATION");
        responseText = QUESTION_KEYWORDS.DESTINATION;
        break;

      case 1:
        console.log("[STEP 2] Asking ORIGIN");
        responseText = QUESTION_KEYWORDS.ORIGIN;
        break;

      case 2:
        console.log("[STEP 3] Asking TRIP TYPE");
        responseText = QUESTION_KEYWORDS.TRIPTYPE;
        uiType = "tripType";
        break;

      case 3:
        console.log("[STEP 4] Asking BUDGET");
        responseText = QUESTION_KEYWORDS.BUDGET;
        uiType = "budget";
        break;

      case 4:
        console.log("[STEP 5] Asking GROUP SIZE");
        responseText = QUESTION_KEYWORDS.GROUP;
        uiType = "groupSize";
        break;

      case 5:
        console.log("[STEP 6] Asking TRIP DURATION");
        responseText = QUESTION_KEYWORDS.DURATION;
        uiType = "tripDuration";
        break;

      default:
        console.log("[STEP 7] GENERATING ITINERARY");

        const destination = userMessages[0]?.content?.trim() || "unknown";
        const origin = userMessages[1]?.content?.trim() || "unknown";
        const tripType = userMessages[2]?.content?.trim() || "Leisure";
        const baseBudget = userMessages[3]?.content?.trim() || "Moderate";
        const budget = getLatestBudgetChoice(userMessages, baseBudget);
        const group = userMessages[4]?.content?.trim() || "Couple";
        const days = userMessages[5]?.content?.trim() || "5";

        console.log("[DEBUG] Using answers:");
        console.log("destination:", destination);
        console.log("origin:", origin);
        console.log("tripType:", tripType);
        console.log("budget:", budget);
        console.log("group:", group);
        console.log("days:", days);

        const prompt = `
You are an expert travel planner.

Create a detailed travel itinerary in JSON format.

Trip Details:
Destination: ${destination}
Origin: ${origin}
Trip Type: ${tripType}
Budget: ${budget}
Group Size: ${group}
Trip Duration: ${days} days

Return ONLY JSON in this format:

{
  "destination": "",
  "duration": "",
  "origin": "",
  "budget": "",
  "group_size": "",
  "famous_food_items": ["", "", "", "", ""],
  "hotels": [
    {
      "hotel_name": "",
      "hotel_address": "",
      "price_per_night": "",
      "hotel_image_url": "",
      "rating": 4.5,
      "description": ""
    }
  ],
  "itinerary": [
    {
      "day": 1,
      "day_plan": "",
      "best_time_to_visit_day": "",
      "activities": [
        {
          "place_name": "",
          "place_details": "",
          "place_image_url": "",
          "place_address": "",
          "ticket_pricing": "",
          "time_travel_each_location": "",
          "best_time_to_visit": ""
        }
      ]
    }
  ]
}

Rules:
- Fill EVERY day from Day 1 to Day ${days}.
- For EVERY day, include up to 5 activities.
- Cover Morning, Afternoon, and Evening within each day.
- Include 2 to 5 food/restaurant or cafe recommendations per day where relevant.
- Set best_time_to_visit_day to "Morning, Afternoon, Evening".
- Each activity must include a realistic best_time_to_visit from Morning/Afternoon/Evening.
- Always include hotel_image_url and place_image_url using valid public image URLs (prefer destination-related Unsplash-style URLs).
`;

        const aiResponse = await openai.chat.completions.create({
          model: "deepseek/deepseek-chat",
          messages: [
            {
              role: "system",
              content: "Return ONLY valid JSON. No explanation.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.35,
          max_tokens: 4500,
        });

        let text = aiResponse.choices?.[0]?.message?.content?.trim() || "{}";

        let tripPlanRaw: Record<string, unknown> = {};

        try {
          const cleaned = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

          tripPlanRaw = JSON.parse(cleaned);
        } catch (e) {
          console.error("[ERROR] JSON parsing failed:", e);

          tripPlanRaw = {
            error: "Invalid JSON from AI",
            raw: text,
          };
        }

        const normalizedPlan = normalizeTripPlan(tripPlanRaw, {
          destination,
          duration: `${days} days`,
          origin,
          budget,
          group_size: group,
        });

        const intent = detectIntent(tripType, destination);
        const parsedDays = parseDays(days);
        const budgetEstimate = estimateBudget(budget, parsedDays, group);
        const timeToBookSignal = getTimeToBookSignal(destination, tripType, budget);
        const demandHeatmapSignal = getDemandHeatmapSignal(destination);
        const scoredHotels = scoreHotels(normalizedPlan.hotels, budget, intent.label, group);
        const scoredItinerary = scoreItinerary(normalizedPlan.itinerary, budget, intent.label);
        const feasibility = evaluateFeasibility(scoredItinerary, parsedDays);

        const trip_plan: TripPlan = {
          ...normalizedPlan,
          hotels: scoredHotels,
          itinerary: scoredItinerary,
          mlInsights: {
            intent,
            budgetEstimate,
            feasibility,
            timeToBookSignal,
            demandHeatmapSignal,
            generatedAt: new Date().toISOString(),
            modelVersion: "ml-v1-heuristic-ranker",
          },
        };

        return NextResponse.json({
          resp: "Your travel itinerary is ready!",
          ui: "final",
          trip_plan,
        });
    }

    console.log("[RESPONSE] Sending question:", responseText);

    return NextResponse.json({
      resp: responseText,
      ui: uiType,
    });

  } catch (error) {
    console.error("[CRITICAL] API route crashed:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}