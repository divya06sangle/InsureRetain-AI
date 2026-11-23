import { Sliders, Sparkles, Loader2, Shield, CreditCard } from "lucide-react";
import type { PolicyInput } from "../types";

interface Props {
  policy: PolicyInput;
  onChange: (updated: PolicyInput) => void;
  onLiveSliderChange: (updated: PolicyInput) => void;
  onRunFullAgent: () => void;
  loading: boolean;
}

export function PolicyForm({ policy, onChange, onLiveSliderChange, onRunFullAgent, loading }: Props) {
  const updateField = <K extends keyof PolicyInput>(key: K, value: PolicyInput[K]) => {
    onChange({ ...policy, [key]: value });
  };

  const updateWithLiveSim = <K extends keyof PolicyInput>(key: K, value: PolicyInput[K]) => {
    const next = { ...policy, [key]: value };
    onChange(next);
    onLiveSliderChange(next);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </span>
            Policyholder Profile & Simulator
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Adjust sliders for live ML risk updates, or generate a full Gemini retention plan.
          </p>
        </div>
      </div>

      {/* Live What-If Sliders */}
      <div className="bg-linear-to-br from-slate-900 to-indigo-950 text-white rounded-xl p-4 space-y-4 shadow-inner">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
            Live What-If Simulator
          </span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
            Real-Time ML Sync
          </span>
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium text-slate-200 mb-1.5">
            <span>Installment Premium ($)</span>
            <span className="font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded">
              ${policy.premium.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min={100}
            max={5000}
            step={50}
            value={policy.premium}
            onChange={(e) => updateWithLiveSim("premium", Number(e.target.value))}
            className="w-full accent-indigo-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span>$100</span>
            <span>$2,500</span>
            <span>$5,000</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium text-slate-200 mb-1.5">
            <span>Policy Tenure (Years Active)</span>
            <span className="font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded">
              Year {policy.policy_year}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={15}
            step={1}
            value={policy.policy_year}
            onChange={(e) => updateWithLiveSim("policy_year", Number(e.target.value))}
            className="w-full accent-indigo-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span>Yr 1 (New)</span>
            <span>Yr 8</span>
            <span>Yr 15 (Mature)</span>
          </div>
        </div>
      </div>

      {/* Section 1: Customer Demographics */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Shield className="w-3.5 h-3.5 text-slate-400" />
          Policyholder & Coverage Details
        </div>
        <div className="grid grid-cols-2 gap-3.5 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Entry Age</label>
            <input
              type="number"
              min={18}
              max={80}
              value={policy.entry_age}
              onChange={(e) => updateField("entry_age", Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Gender</label>
            <select
              value={policy.sex}
              onChange={(e) => updateField("sex", e.target.value as "M" | "F")}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 focus:outline-none transition-all"
            >
              <option value="M">Male (M)</option>
              <option value="F">Female (F)</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Coverage Benefit ($)</label>
            <input
              type="number"
              min={5000}
              max={5000000}
              step={5000}
              value={policy.benefit}
              onChange={(e) => updateField("benefit", Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-slate-900 font-mono font-semibold focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Billing & Protection */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
          Billing & Non-Lapse Terms
        </div>
        <div className="grid grid-cols-2 gap-3.5 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Frequency</label>
            <select
              value={policy.payment_mode}
              onChange={(e) => updateField("payment_mode", e.target.value as PolicyInput["payment_mode"])}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 focus:outline-none transition-all"
            >
              <option value="Monthly">Monthly</option>
              <option value="Quaterly">Quarterly</option>
              <option value="Semiannually">Semi-Annually</option>
              <option value="Annually">Annually</option>
              <option value="Single Premium">Single Premium</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Advance Premiums</label>
            <input
              type="number"
              min={0}
              max={10}
              value={policy.number_of_advance_premium}
              onChange={(e) => updateField("number_of_advance_premium", Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 focus:outline-none transition-all"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Non-Lapse Guarantee (NLG)</label>
            <select
              value={policy.non_lapse_guaranteed}
              onChange={(e) => updateField("non_lapse_guaranteed", e.target.value as PolicyInput["non_lapse_guaranteed"])}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 focus:outline-none transition-all"
            >
              <option value="NO NLG">No NLG Protection</option>
              <option value="NLG Active">NLG Active</option>
              <option value="NLG Not Active">NLG Not Active</option>
              <option value="NLG Suspend">NLG Suspended</option>
            </select>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onRunFullAgent}
        disabled={loading}
        className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:bg-indigo-400 text-white font-bold text-sm shadow-sm shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Running Random Forest & Gemini Agent...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Analyze Policy & Generate AI Retention Plan
          </>
        )}
      </button>
    </div>
  );
}