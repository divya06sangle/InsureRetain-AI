import { UserCheck, AlertTriangle, Scale, Sparkles } from "lucide-react";
import type { PolicyInput } from "../types";

export interface DemoPersona {
  id: string;
  name: string;
  tag: string;
  description: string;
  badgeColor: string;
  data: PolicyInput;
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: "high-risk",
    name: "Rahul Verma — High-Burden Monthly Policy",
    tag: "High Lapse Risk",
    description: "Year 2 • High monthly premium vs coverage • No advance pay",
    badgeColor: "bg-rose-100 text-rose-700 border-rose-200",
    data: {
      entry_age: 35,
      sex: "M",
      policy_year: 2,
      benefit: 100000,
      initial_benefit: 0,
      premium: 1200,
      payment_mode: "Monthly",
      substandard_risk: 0,
      number_of_advance_premium: 0,
      non_lapse_guaranteed: "NO NLG",
      full_benefit: "N",
      policy_type_1: 1,
      policy_type_2: 2,
      policy_type_3: "A",
      channel1: 1,
      channel2: 1,
      channel3: 0,
      issue_month: "Aug",
    },
  },
  {
    id: "borderline",
    name: "Ananya Nair — Mid-Tenure Quarterly Policy",
    tag: "Medium Risk",
    description: "Year 4 • Moderate quarterly premium • Standard risk",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    data: {
      entry_age: 38,
      sex: "F",
      policy_year: 4,
      benefit: 150000,
      initial_benefit: 0,
      premium: 540,
      payment_mode: "Quaterly",
      substandard_risk: 10,
      number_of_advance_premium: 0,
      non_lapse_guaranteed: "NO NLG",
      full_benefit: "N",
      policy_type_1: 2,
      policy_type_2: 10,
      policy_type_3: "B",
      channel1: 2,
      channel2: 3,
      channel3: 0,
      issue_month: "Mar",
    },
  },
  {
    id: "loyal",
    name: "Vikram Desai — Established Annual Policy",
    tag: "Low Risk (Inforce)",
    description: "Year 5 • Annual auto-pay with advance premium & NLG Active",
    badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
    data: {
      entry_age: 30,
      sex: "F",
      policy_year: 5,
      benefit: 300000,
      initial_benefit: 300000,
      premium: 450,
      payment_mode: "Annually",
      substandard_risk: 0,
      number_of_advance_premium: 3,
      non_lapse_guaranteed: "NLG Active",
      full_benefit: "Y",
      policy_type_1: 3,
      policy_type_2: 15,
      policy_type_3: "C",
      channel1: 2,
      channel2: 3,
      channel3: 0,
      issue_month: "Jun",
    },
  },
];

interface Props {
  activeId: string;
  onSelectPersona: (persona: DemoPersona) => void;
}

export function PersonaBar({ activeId, onSelectPersona }: Props) {
  const getVisuals = (id: string) => {
    if (id === "high-risk") {
      return {
        icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
        topStrip: "bg-rose-500",
        iconBg: "bg-rose-50 border-rose-100",
      };
    }
    if (id === "borderline") {
      return {
        icon: <Scale className="w-4 h-4 text-amber-600" />,
        topStrip: "bg-amber-500",
        iconBg: "bg-amber-50 border-amber-100",
      };
    }
    return {
      icon: <UserCheck className="w-4 h-4 text-emerald-600" />,
      topStrip: "bg-emerald-500",
      iconBg: "bg-emerald-50 border-emerald-100",
    };
  };

  return (
    <section className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            1-Click Policyholder Demo Scenarios
          </span>
        </div>
        <span className="text-xs text-slate-400">
          Select a sample customer profile to run live ML + Gemini analysis
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {DEMO_PERSONAS.map((persona) => {
          const isSelected = activeId === persona.id;
          const visuals = getVisuals(persona.id);
          return (
            <button
              key={persona.id}
              type="button"
              onClick={() => onSelectPersona(persona)}
              className={`group relative overflow-hidden text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "border-indigo-600 bg-indigo-50/40 shadow-sm ring-2 ring-indigo-600/15 -translate-y-0.5"
                  : "border-slate-200 hover:border-indigo-300 bg-white hover:bg-slate-50/60 hover:-translate-y-0.5"
              }`}
            >
              <div className={`absolute inset-x-0 top-0 h-1 ${visuals.topStrip} opacity-85`} />

              <div className="flex items-start justify-between gap-2.5 mb-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${visuals.iconBg}`}>
                    {visuals.icon}
                  </div>
                  <span className="font-bold text-sm text-slate-900 truncate group-hover:text-indigo-700 transition-colors">
                    {persona.name}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed mb-3">{persona.description}</p>

              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${persona.badgeColor}`}>
                  {persona.tag}
                </span>
                {isSelected && (
                  <span className="text-[11px] font-bold text-indigo-600">Active Profile</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}