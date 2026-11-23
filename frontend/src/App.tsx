import { useEffect, useState } from "react";
import { ShieldCheck, BarChart3, LayoutGrid, Activity, Bot } from "lucide-react";
import { DEMO_PERSONAS, PersonaBar } from "./components/PersonaBar";
import { PolicyForm } from "./components/PolicyForm";
import { RiskDashboard } from "./components/RiskDashboard";
import { AgentCopilot } from "./components/AgentCopilot";
import { BenchmarkModal } from "./components/BenchmarkModal";
import { fetchModelInfo, runFullAnalysis, simulateQuickRisk } from "./api";
import type { AgentActionPlan, ModelInfoResponse, PolicyInput, PredictionResponse } from "./types";
import type { DemoPersona } from "./components/PersonaBar";

export function App() {
  const [activePersonaId, setActivePersonaId] = useState<string>(DEMO_PERSONAS[0].id);
  const [policy, setPolicy] = useState<PolicyInput>(DEMO_PERSONAS[0].data);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [agentPlan, setAgentPlan] = useState<AgentActionPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);
  const [showBenchmarks, setShowBenchmarks] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<"all" | "risk" | "copilot">("all");

  const executeFullPipeline = async (targetPolicy: PolicyInput) => {
    setLoading(true);
    setError(null);
    try {
      const result = await runFullAnalysis(targetPolicy);
      setPrediction(result.prediction);
      setAgentPlan(result.agent_plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeFullPipeline(DEMO_PERSONAS[0].data);
    fetchModelInfo().then(setModelInfo).catch(() => {});
  }, []);

  const handleSelectPersona = (persona: DemoPersona) => {
    setActivePersonaId(persona.id);
    setPolicy(persona.data);
    executeFullPipeline(persona.data);
  };

  const handleLiveSliderChange = async (updatedPolicy: PolicyInput) => {
    setActivePersonaId("custom");
    try {
      const quickPred = await simulateQuickRisk(updatedPolicy);
      setPrediction(quickPred);
    } catch {
      // Ignore transient slider debounce errors
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-900 flex flex-col">
      {/* Executive Dark Navigation Header */}
      <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight text-white">
                  InsureRetain <span className="text-indigo-400">AI</span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Live Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Policy Lapse Risk Intelligence & Agentic Retention Copilot
              </p>
            </div>
          </div>

          {/* View Switcher & Model Benchmarks */}
          <div className="flex items-center gap-2.5">
            <div className="hidden md:flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveView("all")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeView === "all" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Full Workbench
              </button>
              <button
                type="button"
                onClick={() => setActiveView("risk")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeView === "risk" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                ML & SHAP
              </button>
              <button
                type="button"
                onClick={() => setActiveView("copilot")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeView === "copilot" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                AI Copilot
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowBenchmarks(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-100 transition-colors cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              Model Benchmarks
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1">
        {/* Executive KPI Summary Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white border border-slate-200/90 rounded-xl px-4 py-3 shadow-2xs">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Active Coverage</div>
            <div className="text-lg font-extrabold font-mono text-slate-900 mt-0.5">
              ${policy.benefit.toLocaleString()}
            </div>
          </div>
          <div className="bg-white border border-slate-200/90 rounded-xl px-4 py-3 shadow-2xs">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Installment ({policy.payment_mode})
            </div>
            <div className="text-lg font-extrabold font-mono text-slate-900 mt-0.5">
              ${policy.premium.toLocaleString()}
            </div>
          </div>
          <div className="bg-white border border-slate-200/90 rounded-xl px-4 py-3 shadow-2xs">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Lapse Probability</div>
            <div className="text-lg font-extrabold font-mono text-indigo-600 mt-0.5">
              {prediction ? `${prediction.lapse_probability}% (${prediction.risk_tier})` : "Calculating..."}
            </div>
          </div>
          <div className="bg-white border border-slate-200/90 rounded-xl px-4 py-3 shadow-2xs">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Playbook Match</div>
            <div className="text-lg font-extrabold font-mono text-emerald-700 mt-0.5">
              {agentPlan ? agentPlan.rule_id_cited : "Pending"}
            </div>
          </div>
        </div>

        <PersonaBar activeId={activePersonaId} onSelectPersona={handleSelectPersona} />

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium px-4 py-3 rounded-xl">
            {error} — Make sure your FastAPI backend is running on port 8000.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Policy Form & What-If Sliders */}
          <div className="lg:col-span-5">
            <PolicyForm
              policy={policy}
              onChange={(updated) => {
                setActivePersonaId("custom");
                setPolicy(updated);
              }}
              onLiveSliderChange={handleLiveSliderChange}
              onRunFullAgent={() => executeFullPipeline(policy)}
              loading={loading}
            />
          </div>

          {/* Right Column: ML Risk Score + SHAP + Gemini Agent Copilot */}
          <div className="lg:col-span-7 space-y-6">
            {prediction && (activeView === "all" || activeView === "risk") && (
              <RiskDashboard prediction={prediction} />
            )}
            {agentPlan && (activeView === "all" || activeView === "copilot") && (
              <AgentCopilot plan={agentPlan} />
            )}
          </div>
        </div>
      </main>

      {showBenchmarks && (
        <BenchmarkModal info={modelInfo} onClose={() => setShowBenchmarks(false)} />
      )}
    </div>
  );
}

export default App;