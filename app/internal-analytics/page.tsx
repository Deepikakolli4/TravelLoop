"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type MetricRow = {
  impressions: number;
  clicks: number;
  ctr: number;
};

const pct = (value: number) => `${(value * 100).toFixed(2)}%`;
const pctSigned = (value: number) => `${value > 0 ? "+" : ""}${(value * 100).toFixed(2)}%`;
const ppSigned = (value: number) =>
  `${value > 0 ? "+" : ""}${(value * 100).toFixed(2)} percentage points`;

const deltaClass = (value: number, inverse = false) => {
  if (value === 0) return "text-slate-600";
  const positive = value > 0;
  const isGood = inverse ? !positive : positive;
  return isGood ? "text-emerald-700" : "text-rose-700";
};

const relativeDelta = (current: number, previous: number) => {
  if (previous === 0) {
    return current === 0 ? 0 : 1;
  }

  return (current - previous) / previous;
};

const numberFmt = new Intl.NumberFormat("en-US");

const DUMMY_METRICS = {
  totals: {
    eventCount: 1248,
    recommendationImpressions: 860,
    recommendationClicks: 184,
    recommendationCtr: 0.2139,
    saves: 96,
  },
  byIntent: {
    family: { impressions: 220, clicks: 54, ctr: 0.2455 },
    solo: { impressions: 210, clicks: 51, ctr: 0.2429 },
    adventure: { impressions: 190, clicks: 39, ctr: 0.2053 },
    luxury: { impressions: 130, clicks: 22, ctr: 0.1692 },
    budget: { impressions: 110, clicks: 18, ctr: 0.1636 },
  } as Record<string, MetricRow>,
  byScoreBucket: {
    high: { impressions: 330, clicks: 93, ctr: 0.2818 },
    mid: { impressions: 360, clicks: 71, ctr: 0.1972 },
    low: { impressions: 125, clicks: 17, ctr: 0.136 },
    unknown: { impressions: 45, clicks: 3, ctr: 0.0667 },
  } as Record<string, MetricRow>,
  topClickedEntities: [
    { name: "Goa Beach Resort", clicks: 24 },
    { name: "Manali Adventure Camp", clicks: 21 },
    { name: "Kerala Backwater Cruise", clicks: 19 },
    { name: "Jaipur Heritage Stay", clicks: 17 },
    { name: "Rishikesh River Rafting", clicks: 15 },
  ],
};

const DUMMY_CURRENT_7D = {
  totals: {
    recommendationCtr: 0.219,
    recommendationClicks: 78,
    recommendationImpressions: 356,
    saves: 32,
  },
};

const DUMMY_PREVIOUS_7D = {
  totals: {
    recommendationCtr: 0.191,
    recommendationClicks: 64,
    recommendationImpressions: 334,
    saves: 25,
  },
};

const DUMMY_DAILY_CTR_SERIES = {
  series: [
    { label: "03-01", ctr: 0.14 },
    { label: "03-02", ctr: 0.16 },
    { label: "03-03", ctr: 0.15 },
    { label: "03-04", ctr: 0.18 },
    { label: "03-05", ctr: 0.17 },
    { label: "03-06", ctr: 0.2 },
    { label: "03-07", ctr: 0.19 },
    { label: "03-08", ctr: 0.21 },
    { label: "03-09", ctr: 0.2 },
    { label: "03-10", ctr: 0.22 },
    { label: "03-11", ctr: 0.23 },
    { label: "03-12", ctr: 0.22 },
    { label: "03-13", ctr: 0.24 },
    { label: "03-14", ctr: 0.23 },
  ],
};

const DATA_MODE_STORAGE_KEY = "travelLoop.analytics.dataMode";

const EMPTY_METRICS = {
  totals: {
    eventCount: 0,
    recommendationImpressions: 0,
    recommendationClicks: 0,
    recommendationCtr: 0,
    saves: 0,
  },
  byIntent: {} as Record<string, MetricRow>,
  byScoreBucket: {} as Record<string, MetricRow>,
  topClickedEntities: [] as Array<{ name: string; clicks: number }>,
};

const EMPTY_7D = {
  totals: {
    recommendationCtr: 0,
    recommendationClicks: 0,
    recommendationImpressions: 0,
    saves: 0,
  },
};

const EMPTY_DAILY_CTR_SERIES = {
  series: [] as Array<{ label: string; ctr: number }>,
};

const hasEvents = (data: any) => Boolean(data?.totals?.eventCount > 0);

const BarRow = ({
  label,
  value,
  max,
  colorClass,
}: {
  label: string;
  value: number;
  max: number;
  colorClass: string;
}) => {
  const width = max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium capitalize">{label}</span>
        <span className="text-muted-foreground">{pct(value)}</span>
      </div>
      <div className="h-2 rounded bg-slate-100 overflow-hidden">
        <div className={`h-2 rounded ${colorClass}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
};

const CtrSparkline = ({
  values,
  labels,
}: {
  values: number[];
  labels: string[];
}) => {
  const width = 640;
  const height = 140;
  const paddingX = 16;
  const paddingY = 14;

  if (values.length === 0) {
    return <p className="text-sm text-slate-500">No daily data yet.</p>;
  }

  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0.01);
  const range = max - min || 1;

  const getX = (index: number) =>
    paddingX + (index * (width - paddingX * 2)) / Math.max(values.length - 1, 1);
  const getY = (value: number) =>
    height - paddingY - ((value - min) / range) * (height - paddingY * 2);

  const points = values
    .map((value, index) => `${getX(index).toFixed(1)},${getY(value).toFixed(1)}`)
    .join(" ");

  const lastIndex = values.length - 1;
  const lastValue = values[lastIndex];

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 rounded-lg bg-slate-50 border">
        <line
          x1={paddingX}
          y1={height - paddingY}
          x2={width - paddingX}
          y2={height - paddingY}
          stroke="#cbd5e1"
          strokeWidth="1"
        />
        <polyline fill="none" stroke="#0f766e" strokeWidth="3" points={points} strokeLinecap="round" />
        <circle cx={getX(lastIndex)} cy={getY(lastValue)} r="4" fill="#0f766e" />
      </svg>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{labels[0]}</span>
        <span>Latest Click-through Rate: {pct(lastValue)}</span>
        <span>{labels[lastIndex]}</span>
      </div>
    </div>
  );
};

export default function InternalAnalyticsPage() {
  const [daysBack, setDaysBack] = useState(30);
  const [dataMode, setDataMode] = useState<"live" | "demo">("live");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(DATA_MODE_STORAGE_KEY);
      if (stored === "live" || stored === "demo") {
        setDataMode(stored);
      }
    } catch {
      // Ignore read failures in restricted browser contexts.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(DATA_MODE_STORAGE_KEY, dataMode);
    } catch {
      // Ignore write failures in restricted browser contexts.
    }
  }, [dataMode]);

  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const nowTs = useMemo(() => Date.now(), []);
  const currentWindowStart = useMemo(() => nowTs - sevenDaysMs, [nowTs, sevenDaysMs]);
  const previousWindowStart = useMemo(
    () => nowTs - sevenDaysMs * 2,
    [nowTs, sevenDaysMs]
  );

  const metricsArgs = useMemo(() => ({ daysBack }), [daysBack]);
  const sparklineArgs = useMemo(() => ({ daysBack: 14 }), []);
  const current7dArgs = useMemo(
    () => ({ startTs: currentWindowStart, endTs: nowTs }),
    [currentWindowStart, nowTs]
  );
  const previous7dArgs = useMemo(
    () => ({ startTs: previousWindowStart, endTs: currentWindowStart }),
    [previousWindowStart, currentWindowStart]
  );

  const metrics = useQuery(api.tripAnalytics.GetMlEventMetrics, metricsArgs);
  const dailyCtrSeries = useQuery(api.tripAnalytics.GetMlDailyCtrSeries, sparklineArgs);
  const current7d = useQuery(api.tripAnalytics.GetMlEventMetrics, current7dArgs);
  const previous7d = useQuery(api.tripAnalytics.GetMlEventMetrics, previous7dArgs);

  const liveMetrics = metrics ?? EMPTY_METRICS;
  const liveCurrent7d = current7d ?? EMPTY_7D;
  const livePrevious7d = previous7d ?? EMPTY_7D;
  const liveDailyCtr =
    dailyCtrSeries?.series && dailyCtrSeries.series.length > 0
      ? dailyCtrSeries
      : EMPTY_DAILY_CTR_SERIES;

  const hasLiveData =
    hasEvents(metrics) &&
    hasEvents(current7d) &&
    hasEvents(previous7d) &&
    Boolean(dailyCtrSeries?.series && dailyCtrSeries.series.length > 0);

  const usingDemoData = dataMode === "demo";

  const effectiveMetrics = usingDemoData ? DUMMY_METRICS : liveMetrics;
  const effectiveCurrent7d = usingDemoData
    ? { ...DUMMY_METRICS, ...DUMMY_CURRENT_7D }
    : liveCurrent7d;
  const effectivePrevious7d = usingDemoData
    ? { ...DUMMY_METRICS, ...DUMMY_PREVIOUS_7D }
    : livePrevious7d;
  const effectiveDailyCtr = usingDemoData ? DUMMY_DAILY_CTR_SERIES : liveDailyCtr;

  const intentRows = useMemo(() => {
    if (!effectiveMetrics?.byIntent) {
      return [] as Array<[string, MetricRow]>;
    }

    return Object.entries(effectiveMetrics.byIntent).sort((a, b) => b[1].ctr - a[1].ctr);
  }, [effectiveMetrics]);

  const scoreRows = useMemo(() => {
    if (!effectiveMetrics?.byScoreBucket) {
      return [] as Array<[string, MetricRow]>;
    }

    return Object.entries(effectiveMetrics.byScoreBucket).sort((a, b) => b[1].ctr - a[1].ctr);
  }, [effectiveMetrics]);

  const maxIntentCtr = intentRows.reduce((max, [, row]) => Math.max(max, row.ctr), 0);
  const maxScoreCtr = scoreRows.reduce((max, [, row]) => Math.max(max, row.ctr), 0);

  const modelHealth = useMemo(() => {
    if (!effectiveCurrent7d || !effectivePrevious7d) {
      return null;
    }

    const ctrDelta =
      effectiveCurrent7d.totals.recommendationCtr -
      effectivePrevious7d.totals.recommendationCtr;
    const clicksDelta = relativeDelta(
      effectiveCurrent7d.totals.recommendationClicks,
      effectivePrevious7d.totals.recommendationClicks
    );
    const impressionsDelta = relativeDelta(
      effectiveCurrent7d.totals.recommendationImpressions,
      effectivePrevious7d.totals.recommendationImpressions
    );
    const savesDelta = relativeDelta(
      effectiveCurrent7d.totals.saves,
      effectivePrevious7d.totals.saves
    );

    const isRegression = ctrDelta < -0.003 || clicksDelta < -0.08;

    return {
      ctrDelta,
      clicksDelta,
      impressionsDelta,
      savesDelta,
      isRegression,
    };
  }, [effectiveCurrent7d, effectivePrevious7d]);

  const ctrSparklineData = useMemo(() => {
    const series = effectiveDailyCtr?.series ?? [];
    return {
      values: series.map((row) => row.ctr),
      labels: series.map((row) => row.label),
    };
  }, [effectiveDailyCtr]);

  return (
    <main className="min-h-screen px-6 py-8 md:px-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Internal {" "}<span className="text-purple-700">ML Analytics</span>{" "}</h1>
            <p className="text-slate-600 mt-1">
              Monitor recommendation quality with click-through rate by intent and score buckets.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white border rounded-lg p-2">
            <label htmlFor="daysBack" className="text-sm text-slate-600">
              Window
            </label>
            <select
              id="daysBack"
              value={daysBack}
              onChange={(e) => setDaysBack(Number(e.target.value))}
              className="rounded border px-2 py-1 text-sm"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>

            <div className="mx-1 h-5 w-px bg-slate-200" />

            <div className="flex items-center gap-1 rounded-md border border-slate-200 p-1">
              <button
                type="button"
                onClick={() => setDataMode("live")}
                className={`px-2 py-1 text-xs rounded ${
                  dataMode === "live"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Live
              </button>
              <button
                type="button"
                onClick={() => setDataMode("demo")}
                className={`px-2 py-1 text-xs rounded ${
                  dataMode === "demo"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Demo
              </button>
            </div>
          </div>
        </header>

        <section className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-900">
          <p className="text-sm">
            Delta shows change versus the previous 7-day window. Click-through Rate Delta is an
            absolute difference in percentage points, while Clicks, Impressions, and Saves Delta
            are relative percentage changes.
          </p>
        </section>

        {usingDemoData ? (
          <section className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900">
            <p className="text-sm">
              Showing demo analytics data for now. Live metrics will automatically replace this as
              events are captured.
            </p>
          </section>
        ) : null}

        {!usingDemoData && !hasLiveData ? (
          <section className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-slate-700">
            <p className="text-sm">
              Live mode is on, but there is not enough captured event data yet. Switch to Demo to
              preview dashboard behavior.
            </p>
          </section>
        ) : null}

          <>
            <section className="bg-white rounded-xl border p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Model Health (7d vs previous 7d)</h2>
                {modelHealth ? (
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      modelHealth.isRegression
                        ? "bg-rose-100 text-rose-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {modelHealth.isRegression ? "Regression Risk" : "Healthy Trend"}
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-slate-500 mt-2">
                This compares this week against last week to quickly flag whether recommendation
                quality is improving or degrading.
              </p>

              {!effectiveCurrent7d || !effectivePrevious7d || !modelHealth ? (
                <p className="text-sm text-slate-500 mt-3">Loading model health...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-slate-500">Click-through Rate Delta</p>
                    <p className={`text-lg font-semibold ${deltaClass(modelHealth.ctrDelta)}`}>
                      {ppSigned(modelHealth.ctrDelta)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {pct(effectivePrevious7d.totals.recommendationCtr)} to {pct(effectiveCurrent7d.totals.recommendationCtr)}
                    </p>
                  </div>

                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-slate-500">Clicks Delta</p>
                    <p className={`text-lg font-semibold ${deltaClass(modelHealth.clicksDelta)}`}>
                      {pctSigned(modelHealth.clicksDelta)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {numberFmt.format(effectivePrevious7d.totals.recommendationClicks)} to {numberFmt.format(effectiveCurrent7d.totals.recommendationClicks)}
                    </p>
                  </div>

                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-slate-500">Impressions Delta</p>
                    <p className={`text-lg font-semibold ${deltaClass(modelHealth.impressionsDelta)}`}>
                      {pctSigned(modelHealth.impressionsDelta)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {numberFmt.format(effectivePrevious7d.totals.recommendationImpressions)} to {numberFmt.format(effectiveCurrent7d.totals.recommendationImpressions)}
                    </p>
                  </div>

                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-slate-500">Saves Delta</p>
                    <p className={`text-lg font-semibold ${deltaClass(modelHealth.savesDelta)}`}>
                      {pctSigned(modelHealth.savesDelta)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {numberFmt.format(effectivePrevious7d.totals.saves)} to {numberFmt.format(effectiveCurrent7d.totals.saves)}
                    </p>
                  </div>
                </div>
              )}
            </section>

            <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border p-4">
                <p className="text-sm text-slate-500">Events</p>
                <p className="text-xs text-slate-400 mt-1">All tracked actions in the selected window.</p>
                <p className="text-2xl font-semibold mt-1">
                  {numberFmt.format(effectiveMetrics.totals.eventCount)}
                </p>
              </div>
              <div className="bg-white rounded-xl border p-4">
                <p className="text-sm text-slate-500">Impressions</p>
                <p className="text-xs text-slate-400 mt-1">How often recommendations were shown.</p>
                <p className="text-2xl font-semibold mt-1">
                  {numberFmt.format(effectiveMetrics.totals.recommendationImpressions)}
                </p>
              </div>
              <div className="bg-white rounded-xl border p-4">
                <p className="text-sm text-slate-500">Clicks</p>
                <p className="text-xs text-slate-400 mt-1">How often users engaged with recommendations.</p>
                <p className="text-2xl font-semibold mt-1">
                  {numberFmt.format(effectiveMetrics.totals.recommendationClicks)}
                </p>
              </div>
              <div className="bg-white rounded-xl border p-4">
                <p className="text-sm text-slate-500">Recommendation Click-through Rate</p>
                <p className="text-xs text-slate-400 mt-1">Click-through rate = clicks / impressions.</p>
                <p className="text-2xl font-semibold mt-1 text-emerald-700">
                  {pct(effectiveMetrics.totals.recommendationCtr)}
                </p>
              </div>
            </section>

            <section className="bg-white rounded-xl border p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Daily Click-through Rate Trend (Last 14 days)</h2>
                <span className="text-xs text-slate-500">Sparkline</span>
              </div>
              <p className="text-sm text-slate-500 mb-3">
                This line shows day-by-day CTR movement to spot momentum shifts and sudden drops.
              </p>
              <CtrSparkline values={ctrSparklineData.values} labels={ctrSparklineData.labels} />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border p-5 space-y-4">
                <h2 className="text-lg font-semibold">Click-through Rate by Intent</h2>
                <p className="text-sm text-slate-500">
                  Compare which user intents (family, solo, budget, etc.) respond best to your recommendations.
                </p>
                {intentRows.length === 0 ? (
                  <p className="text-sm text-slate-500">No intent-level events yet.</p>
                ) : (
                  intentRows.map(([intent, row]) => (
                    <BarRow
                      key={intent}
                      label={intent}
                      value={row.ctr}
                      max={maxIntentCtr}
                      colorClass="bg-emerald-500"
                    />
                  ))
                )}
              </div>

              <div className="bg-white rounded-xl border p-5 space-y-4">
                <h2 className="text-lg font-semibold">Click-through Rate by Score Bucket</h2>
                <p className="text-sm text-slate-500">
                  Validate that higher model scores actually lead to higher click-through.
                </p>
                {scoreRows.length === 0 ? (
                  <p className="text-sm text-slate-500">No score-bucket events yet.</p>
                ) : (
                  scoreRows.map(([bucket, row]) => (
                    <BarRow
                      key={bucket}
                      label={bucket}
                      value={row.ctr}
                      max={maxScoreCtr}
                      colorClass="bg-sky-500"
                    />
                  ))
                )}
              </div>
            </section>

            <section className="bg-white rounded-xl border p-5">
              <h2 className="text-lg font-semibold mb-3">Top Clicked Entities</h2>
              <p className="text-sm text-slate-500 mb-3">
                Highlights destinations/hotels/activities users click the most.
              </p>
              {effectiveMetrics.topClickedEntities.length === 0 ? (
                <p className="text-sm text-slate-500">No click events yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-2 pr-3">Entity</th>
                        <th className="py-2 pr-3">Clicks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {effectiveMetrics.topClickedEntities.map((row: { name: string; clicks: number }) => (
                        <tr key={row.name} className="border-b last:border-b-0">
                          <td className="py-2 pr-3">{row.name}</td>
                          <td className="py-2 pr-3">{numberFmt.format(row.clicks)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="bg-white rounded-xl border p-5">
              <h2 className="text-lg font-semibold mb-3">Detailed Breakdown</h2>
              <p className="text-sm text-slate-500 mb-4">
                Use these tables for exact counts behind each chart so teams can act on concrete numbers.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Intent Stats</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left border-b">
                          <th className="py-2 pr-3">Intent</th>
                          <th className="py-2 pr-3">Impressions</th>
                          <th className="py-2 pr-3">Clicks</th>
                          <th className="py-2 pr-3">Click-through Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {intentRows.map(([intent, row]) => (
                          <tr key={intent} className="border-b last:border-b-0">
                            <td className="py-2 pr-3 capitalize">{intent}</td>
                            <td className="py-2 pr-3">{numberFmt.format(row.impressions)}</td>
                            <td className="py-2 pr-3">{numberFmt.format(row.clicks)}</td>
                            <td className="py-2 pr-3">{pct(row.ctr)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Score Bucket Stats</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left border-b">
                          <th className="py-2 pr-3">Bucket</th>
                          <th className="py-2 pr-3">Impressions</th>
                          <th className="py-2 pr-3">Clicks</th>
                          <th className="py-2 pr-3">Click-through Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scoreRows.map(([bucket, row]) => (
                          <tr key={bucket} className="border-b last:border-b-0">
                            <td className="py-2 pr-3 capitalize">{bucket}</td>
                            <td className="py-2 pr-3">{numberFmt.format(row.impressions)}</td>
                            <td className="py-2 pr-3">{numberFmt.format(row.clicks)}</td>
                            <td className="py-2 pr-3">{pct(row.ctr)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>
          </>
      </div>
    </main>
  );
}
