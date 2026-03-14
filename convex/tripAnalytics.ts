import { v } from "convex/values";
import { query } from "./_generated/server";

type EventDoc = {
  tripId: string;
  uid?: string;
  eventType: string;
  entityType: string;
  entityName?: string;
  score?: number;
  metadata?: any;
  createdAt: number;
};

const getScoreBucket = (score?: number): "low" | "mid" | "high" | "unknown" => {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return "unknown";
  }

  if (score < 0.4) return "low";
  if (score < 0.7) return "mid";
  return "high";
};

const getRecommendationEvents = (events: EventDoc[]) =>
  events.filter((e) => e.entityType === "hotel" || e.entityType === "activity");

const getRecommendationMetricSummary = (events: EventDoc[]) => {
  const recommendationEvents = getRecommendationEvents(events);
  const impressions = recommendationEvents.filter((e) => e.eventType === "impression").length;
  const clicks = recommendationEvents.filter((e) => e.eventType === "click").length;

  return {
    impressions,
    clicks,
    ctr: impressions > 0 ? Number((clicks / impressions).toFixed(4)) : 0,
  };
};

export const GetMlEventMetrics = query({
  args: {
    daysBack: v.optional(v.number()),
    startTs: v.optional(v.number()),
    endTs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const hasCustomRange =
      typeof args.startTs === "number" && typeof args.endTs === "number";

    const days = args.daysBack && args.daysBack > 0 ? args.daysBack : 30;
    const defaultFrom = now - days * 24 * 60 * 60 * 1000;

    const fromTs = hasCustomRange ? args.startTs! : defaultFrom;
    const toTs = hasCustomRange ? args.endTs! : now;

    const events = (await ctx.db
      .query("TripEventTable")
      .filter((q) => q.and(q.gte(q.field("createdAt"), fromTs), q.lt(q.field("createdAt"), toTs)))
      .collect()) as EventDoc[];

    const recommendationEvents = getRecommendationEvents(events);
    const summary = getRecommendationMetricSummary(events);
    const totalImpressions = summary.impressions;
    const totalClicks = summary.clicks;
    const totalSaves = events.filter((e) => e.eventType === "save").length;

    const intentStats: Record<
      string,
      { impressions: number; clicks: number; ctr: number }
    > = {};

    for (const event of recommendationEvents) {
      const intent = String(event.metadata?.intent ?? "unknown");
      if (!intentStats[intent]) {
        intentStats[intent] = { impressions: 0, clicks: 0, ctr: 0 };
      }

      if (event.eventType === "impression") {
        intentStats[intent].impressions += 1;
      }
      if (event.eventType === "click") {
        intentStats[intent].clicks += 1;
      }
    }

    for (const intent of Object.keys(intentStats)) {
      const row = intentStats[intent];
      row.ctr = row.impressions > 0 ? Number((row.clicks / row.impressions).toFixed(4)) : 0;
    }

    const scoreBuckets: Record<
      "low" | "mid" | "high" | "unknown",
      { impressions: number; clicks: number; ctr: number }
    > = {
      low: { impressions: 0, clicks: 0, ctr: 0 },
      mid: { impressions: 0, clicks: 0, ctr: 0 },
      high: { impressions: 0, clicks: 0, ctr: 0 },
      unknown: { impressions: 0, clicks: 0, ctr: 0 },
    };

    for (const event of recommendationEvents) {
      const bucket = getScoreBucket(event.score);
      if (event.eventType === "impression") {
        scoreBuckets[bucket].impressions += 1;
      }
      if (event.eventType === "click") {
        scoreBuckets[bucket].clicks += 1;
      }
    }

    for (const bucket of Object.keys(scoreBuckets) as Array<
      "low" | "mid" | "high" | "unknown"
    >) {
      const row = scoreBuckets[bucket];
      row.ctr = row.impressions > 0 ? Number((row.clicks / row.impressions).toFixed(4)) : 0;
    }

    const clickCountByEntity: Record<string, number> = {};
    recommendationEvents
      .filter((e) => e.eventType === "click")
      .forEach((event) => {
        const key = event.entityName || "unknown";
        clickCountByEntity[key] = (clickCountByEntity[key] ?? 0) + 1;
      });

    const topClickedEntities = Object.entries(clickCountByEntity)
      .map(([name, clicks]) => ({ name, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    return {
      window: {
        days: hasCustomRange ? null : days,
        from: fromTs,
        to: toTs,
      },
      totals: {
        eventCount: events.length,
        recommendationImpressions: totalImpressions,
        recommendationClicks: totalClicks,
        recommendationCtr:
          totalImpressions > 0 ? Number((totalClicks / totalImpressions).toFixed(4)) : 0,
        saves: totalSaves,
      },
      byIntent: intentStats,
      byScoreBucket: scoreBuckets,
      topClickedEntities,
    };
  },
});

export const GetMlDailyCtrSeries = query({
  args: {
    daysBack: v.optional(v.number()),
    endTs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = typeof args.endTs === "number" ? args.endTs : Date.now();
    const days = args.daysBack && args.daysBack > 0 ? Math.floor(args.daysBack) : 14;
    const startTs = now - days * 24 * 60 * 60 * 1000;

    const events = (await ctx.db
      .query("TripEventTable")
      .filter((q) => q.and(q.gte(q.field("createdAt"), startTs), q.lt(q.field("createdAt"), now)))
      .collect()) as EventDoc[];

    const dayMs = 24 * 60 * 60 * 1000;
    const dayBuckets: Array<{
      dayStart: number;
      label: string;
      impressions: number;
      clicks: number;
      ctr: number;
    }> = [];

    for (let i = 0; i < days; i += 1) {
      const dayStart = startTs + i * dayMs;
      const dayEnd = dayStart + dayMs;
      const dayEvents = events.filter((e) => e.createdAt >= dayStart && e.createdAt < dayEnd);
      const summary = getRecommendationMetricSummary(dayEvents);

      dayBuckets.push({
        dayStart,
        label: new Date(dayStart).toISOString().slice(5, 10),
        impressions: summary.impressions,
        clicks: summary.clicks,
        ctr: summary.ctr,
      });
    }

    return {
      window: {
        days,
        from: startTs,
        to: now,
      },
      series: dayBuckets,
    };
  },
});
