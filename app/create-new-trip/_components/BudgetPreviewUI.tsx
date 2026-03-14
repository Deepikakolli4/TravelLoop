import React from "react";
import { Button } from "@/components/ui/button";
import { AlarmClockCheck, TrendingDown, TrendingUp } from "lucide-react";

type Props = {
  data: {
    total: { minUsd: number; maxUsd: number };
    perDay: { minUsd: number; maxUsd: number };
    confidence: "low" | "medium" | "high";
    deltaFromPreviousUsd?: number | null;
    assumptions: string[];
    timeToBookSignal: {
      trend: "rise" | "dip" | "stable";
      horizonDays: number;
      confidence: "low" | "medium" | "high";
      urgency: "low" | "medium" | "high";
      recommendation: string;
      reasons: string[];
    };
    demandHeatmapSignal: {
      crowdLevel: "low" | "medium" | "high";
      confidence: "low" | "medium" | "high";
      forecastWindowDays: number;
      bestDateWindows: string[];
      recommendation: string;
    };
    breakdown: {
      transport: { minUsd: number; maxUsd: number };
      hotel: { minUsd: number; maxUsd: number };
      food: { minUsd: number; maxUsd: number };
      activities: { minUsd: number; maxUsd: number };
    };
  };
  onContinue: () => void;
  onAdjustBudget: (value: "Budget" | "Moderate" | "Luxury") => void;
};

const formatRange = (min: number, max: number) => `$${min} - $${max}`;
const formatDelta = (value: number) => `${value > 0 ? "+" : "-"} $${Math.abs(value)}`;

const getBookingActionBadge = (
  signal: Props["data"]["timeToBookSignal"]
): {
  label: "Book Now" | "Watch Prices" | "Wait";
  icon: React.ComponentType<{ className?: string }>;
  className: string;
} => {
  if (signal.trend === "rise" || signal.urgency === "high") {
    return {
      label: "Book Now",
      icon: TrendingUp,
      className: "bg-rose-100 text-rose-700 border-rose-200",
    };
  }

  if (signal.trend === "dip" && signal.urgency === "low") {
    return {
      label: "Wait",
      icon: TrendingDown,
      className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };
  }

  return {
    label: "Watch Prices",
    icon: AlarmClockCheck,
    className: "bg-amber-100 text-amber-700 border-amber-200",
  };
};

const BudgetPreviewUI = ({ data, onContinue, onAdjustBudget }: Props) => {
  const bookingAction = getBookingActionBadge(data.timeToBookSignal);
  const ActionIcon = bookingAction.icon;

  const cta =
    bookingAction.label === "Book Now"
      ? {
          label: "Open Flight Deals",
          onClick: () => window.open("/booking/flight", "_blank"),
        }
      : bookingAction.label === "Watch Prices"
      ? {
          label: "Set Price Alert",
          onClick: () => window.alert("Price alert created. We will notify you about major fare changes."),
        }
      : {
          label: "Remind Me in 7 Days",
          onClick: () => window.alert("Reminder set for 7 days. Re-check fares then."),
        };

  return (
    <div className="mt-3 rounded-xl border bg-white p-3 space-y-3">
      <h3 className="font-semibold text-sm text-slate-800">Smart Budget Predictor</h3>

      <div className="grid grid-cols-1 gap-2 text-xs">
        <div className="rounded-md border bg-slate-50 p-2">
          <p className="text-slate-500">Total Estimate</p>
          <p className="font-semibold text-slate-800">
            {formatRange(data.total.minUsd, data.total.maxUsd)}
          </p>
        </div>

        <div className="rounded-md border bg-slate-50 p-2">
          <p className="text-slate-500">Daily Estimate</p>
          <p className="font-semibold text-slate-800">
            {formatRange(data.perDay.minUsd, data.perDay.maxUsd)}
          </p>
        </div>

        {typeof data.deltaFromPreviousUsd === "number" ? (
          <div className="rounded-md border bg-amber-50 p-2">
            <p className="text-slate-600">Difference vs previous estimate</p>
            <p
              className={`font-semibold ${
                data.deltaFromPreviousUsd === 0
                  ? "text-slate-700"
                  : data.deltaFromPreviousUsd > 0
                  ? "text-rose-700"
                  : "text-emerald-700"
              }`}
            >
              {data.deltaFromPreviousUsd === 0
                ? "$0"
                : `${formatDelta(data.deltaFromPreviousUsd)} total`}
            </p>
          </div>
        ) : null}
      </div>

      <div className="space-y-1 text-xs">
        <p className="font-medium text-slate-700">Cost Breakdown</p>
        <p>Transport: {formatRange(data.breakdown.transport.minUsd, data.breakdown.transport.maxUsd)}</p>
        <p>Hotel: {formatRange(data.breakdown.hotel.minUsd, data.breakdown.hotel.maxUsd)}</p>
        <p>Food: {formatRange(data.breakdown.food.minUsd, data.breakdown.food.maxUsd)}</p>
        <p>Activities: {formatRange(data.breakdown.activities.minUsd, data.breakdown.activities.maxUsd)}</p>
      </div>

      <div className="rounded-md border bg-blue-50 p-2 text-xs">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium text-blue-900">Best Time-to-Book Signal</p>
          <div
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold ${bookingAction.className}`}
          >
            <ActionIcon className="h-3.5 w-3.5" />
            {bookingAction.label}
          </div>
        </div>
        <p className="text-blue-800 capitalize mt-1">
          Trend: {data.timeToBookSignal.trend} in next {data.timeToBookSignal.horizonDays} days
        </p>
        <p className="text-blue-800">
          Confidence: {data.timeToBookSignal.confidence} | Urgency: {data.timeToBookSignal.urgency}
        </p>
        <p className="text-blue-900 font-medium mt-1">{data.timeToBookSignal.recommendation}</p>
      </div>

      <div className="rounded-md border bg-purple-50 p-2 text-xs">
        <p className="font-medium text-purple-900">Demand Heatmap by Destination-Date</p>
        <p className="text-purple-800 capitalize mt-1">
          Crowd forecast: {data.demandHeatmapSignal.crowdLevel} in next {data.demandHeatmapSignal.forecastWindowDays} days
        </p>
        <p className="text-purple-800">
          Confidence: {data.demandHeatmapSignal.confidence}
        </p>
        <p className="text-purple-900 font-medium mt-1">Best date windows</p>
        {data.demandHeatmapSignal.bestDateWindows.map((window, idx) => (
          <p key={idx} className="text-purple-800">- {window}</p>
        ))}
        <p className="text-purple-900 font-medium mt-1">{data.demandHeatmapSignal.recommendation}</p>
      </div>

      <div className="text-xs text-slate-600">
        <p className="font-medium">Assumptions ({data.confidence} confidence)</p>
        {data.assumptions.map((line, idx) => (
          <p key={idx}>- {line}</p>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-700">Quick Adjust Budget</p>
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm" onClick={() => onAdjustBudget("Budget")}>
            Budget
          </Button>
          <Button variant="outline" size="sm" onClick={() => onAdjustBudget("Moderate")}>
            Moderate
          </Button>
          <Button variant="outline" size="sm" onClick={() => onAdjustBudget("Luxury")}>
            Luxury
          </Button>
        </div>
      </div>

      <Button variant="outline" onClick={cta.onClick} className="w-full">
        {cta.label}
      </Button>

      <Button onClick={onContinue} className="w-full">
        Continue to Generate Itinerary
      </Button>
    </div>
  );
};

export default BudgetPreviewUI;
