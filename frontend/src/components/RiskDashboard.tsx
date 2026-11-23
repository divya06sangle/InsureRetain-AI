import { Activity, ArrowUpRight, ArrowDownRight, Calendar, Percent, Wallet } from "lucide-react";
import type { PredictionResponse } from "../types";

interface Props {
  prediction: PredictionResponse;
}

export function RiskDashboard({ prediction }: Props) {
  const tierStyles = {
    High: {
      badge: "bg-rose-100 text-rose-800 border-rose-200",
      stroke: "#e11d48",
      text: "text-rose-600",
      softBg: "bg-rose-50/70 border-rose-100",
    },
    Medium: {
      badge: "bg-amber-100 text-amber-800 border-amber-200",
      stroke: "#d97706",
      text: "text-amber-600",
      softBg: "bg-amber-50/70 border-amber-100",
    },
    Low: {
      badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
      stroke: "#059669",
      text: "text-emerald-600",
      softBg: "bg-emerald-50/70 border-emerald-100",
    },
  }[prediction.risk_tier];

  const maxAbsImpact = Math.max(...prediction.top_drivers.map((d) => Math.abs(d.impact_score)), 0.05);

  // SVG Circular Gauge math
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const clampedPct = Math.min(100, Math.max(0, prediction.lapse_probability));
  const strokeDashoffset = circumference - (clampedPct / 100) * circumference;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-5 animate-fade-in">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </span>
            ML Lapse Risk Assessment
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Random Forest Classification + TreeSHAP Feature Attribution
          </p>
        </div>
        <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${tierStyles.badge}`}>
          {prediction.risk_tier} Risk
        </span>
      </div>

      {/* Top Gauge + Engineered Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Radial SVG Gauge */}
        <div className={`sm:col-span-5 rounded-xl p-4 border flex flex-col items-center justify-center text-center ${tierStyles.softBg}`}>
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 104 104">
              <circle
                cx="52"
                cy="52"
                r={radius}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="9"
              />
              <circle
                cx="52"
                cy="52"
                r={radius}
                fill="none"
                stroke={tierStyles.stroke}
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-extrabold font-mono ${tierStyles.text}`}>
                {prediction.lapse_probability}%
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Lapse Risk
              </span>
            </div>
          </div>
          <span className="mt-2 text-xs font-bold text-slate-800">{prediction.predicted_status}</span>
        </div>

        {/* Engineered Feature Tiles */}
        <div className="sm:col-span-7 grid grid-cols-1 gap-2.5">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-medium text-slate-500">Current Policyholder Age</div>
                <div className="text-xs font-bold text-slate-900">Entry Age + Policy Tenure</div>
              </div>
            </div>
            <span className="font-mono text-sm font-extrabold text-slate-900">
              {prediction.engineered_metrics.current_age} yrs
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600">
                <Percent className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-medium text-slate-500">Premium-to-Coverage Ratio</div>
                <div className="text-xs font-bold text-slate-900">Affordability Burden Index</div>
              </div>
            </div>
            <span className="font-mono text-sm font-extrabold text-indigo-700">
              {prediction.engineered_metrics.premium_to_benefit_percent}%
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-medium text-slate-500">Advance Premium Buffer</div>
                <div className="text-xs font-bold text-slate-900">Pre-Payment Commitment</div>
              </div>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                prediction.engineered_metrics.has_advance_premium
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {prediction.engineered_metrics.has_advance_premium ? "Active Buffer" : "None"}
            </span>
          </div>
        </div>
      </div>

      {/* SHAP Explainability Drivers */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Top SHAP Risk Drivers (Model Explainability)
          </h3>
          <span className="text-[11px] text-slate-400">Impact on Lapse Probability</span>
        </div>

        <div className="space-y-3">
          {prediction.top_drivers.map((driver) => {
            const isRiskUp = driver.impact_score >= 0;
            const widthPct = Math.min(100, Math.round((Math.abs(driver.impact_score) / maxAbsImpact) * 100));
            return (
              <div
                key={driver.feature_key}
                className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-slate-800">{driver.label}</span>
                  <span
                    className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      isRiskUp ? "bg-rose-100/80 text-rose-700" : "bg-emerald-100/80 text-emerald-700"
                    }`}
                  >
                    {isRiskUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {driver.direction} ({driver.impact_score > 0 ? "+" : ""}
                    {driver.impact_score})
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isRiskUp ? "bg-rose-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.max(10, widthPct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}