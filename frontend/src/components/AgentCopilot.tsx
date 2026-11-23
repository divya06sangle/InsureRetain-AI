import { useState } from "react";
import { Bot, Check, Copy, FileCheck2, Terminal, Mail, CheckCircle2 } from "lucide-react";
import type { AgentActionPlan } from "../types";

interface Props {
  plan: AgentActionPlan;
}

export function AgentCopilot({ plan }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    const fullEmail = `Subject: ${plan.customer_email_subject}\n\n${plan.customer_email_body}`;
    await navigator.clipboard.writeText(fullEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3.5">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </span>
            Gemini Retention AI Copilot
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Grounded in official retention playbook via Agentic Function Calling
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
            <FileCheck2 className="w-3.5 h-3.5" />
            {plan.rule_id_cited}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${
              plan.used_live_llm
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                plan.used_live_llm ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
              }`}
            />
            {plan.used_live_llm ? "Gemini 3.5 Live" : "Rulebook Fallback"}
          </span>
        </div>
      </div>

      {/* Recommended Retention Offer Card */}
      <div className="bg-linear-to-br from-emerald-50/90 to-teal-50/50 border border-emerald-200/80 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{plan.recommended_action_title}</span>
        </div>
        <p className="text-sm font-semibold text-slate-900 leading-snug">{plan.retention_offer}</p>
        <div className="pt-2 border-t border-emerald-200/60 text-xs text-slate-700 leading-relaxed">
          <span className="font-bold text-slate-900">Underwriter Rationale: </span>
          {plan.underwriter_reasoning}
        </div>
      </div>

      {/* Ready-to-Send Customer Email Preview */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-xs font-bold text-slate-700">Personalized Retention Outreach Draft</span>
          </div>
          <button
            type="button"
            onClick={handleCopyEmail}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied to Clipboard" : "Copy Email"}
          </button>
        </div>

        <div className="p-4 bg-white space-y-3 text-xs">
          <div className="pb-2.5 border-b border-slate-100 flex flex-col gap-1">
            <div className="text-slate-400">
              To: <span className="text-slate-700 font-medium">Policyholder (Active Policy Account)</span>
            </div>
            <div className="text-slate-400">
              Subject: <span className="font-bold text-slate-900">{plan.customer_email_subject}</span>
            </div>
          </div>
          <pre className="whitespace-pre-wrap font-sans leading-relaxed text-slate-700 text-[13px]">
            {plan.customer_email_body}
          </pre>
        </div>
      </div>

      {/* Agent Tool-Calling Audit Trace */}
      <div className="bg-slate-950 text-slate-200 rounded-xl p-4 text-xs space-y-2 border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
            <Terminal className="w-3.5 h-3.5" />
            Agent Execution & Tool-Calling Audit Trace
          </div>
          <span className="text-[10px] font-mono text-slate-500">Deterministic Audit Log</span>
        </div>
        <div className="space-y-1 pt-1">
          {plan.agent_trace.map((step, idx) => (
            <div key={idx} className="font-mono text-[11px] text-slate-300 flex items-start gap-2">
              <span className="text-emerald-400 select-none">›</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}