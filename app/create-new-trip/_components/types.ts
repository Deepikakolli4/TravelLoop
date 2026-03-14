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
  ml_score?: number;
  ml_reasons?: string[];
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
  ml_score?: number;
  ml_reasons?: string[];
};

export type Itinerary = {
  day: number;
  day_plan: string;
  best_time_to_visit_day: string;
  activities: Activity[];
};

export type IntentLabel =
  | "relaxation"
  | "adventure"
  | "family"
  | "romance"
  | "culture"
  | "food"
  | "nature"
  | "business"
  | "mixed";

export type BudgetEstimate = {
  minTotalUsd: number;
  maxTotalUsd: number;
  dailyAverageUsd: number;
  confidence: "low" | "medium" | "high";
};

export type FeasibilityInsight = {
  score: number;
  verdict: "easy" | "balanced" | "packed";
  reasons: string[];
};

export type TimeToBookSignal = {
  trend: "rise" | "dip" | "stable";
  horizonDays: number;
  confidence: "low" | "medium" | "high";
  urgency: "low" | "medium" | "high";
  recommendation: string;
  reasons: string[];
};

export type DemandHeatmapSignal = {
  crowdLevel: "low" | "medium" | "high";
  confidence: "low" | "medium" | "high";
  forecastWindowDays: number;
  bestDateWindows: string[];
  recommendation: string;
};

export type MlInsights = {
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

export type TripInfo = {
  tripId?: string;
  destination: string;
  duration: string;
  origin: string;
  budget: string;
  group_size: string;
  famous_food_items?: string[];
  hotels: Hotel[];
  itinerary: Itinerary[];
  mlInsights?: MlInsights;
};

export type Message = {
  role: "user" | "assistant";
  content: string;
};
