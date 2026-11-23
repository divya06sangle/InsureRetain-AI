import { X, BarChart3, Award } from "lucide-react";
import type { ModelInfoResponse } from "../types";

interface Props {
  info: ModelInfoResponse | null;
  onClose: () => void;
}

export function BenchmarkModal({ info, onClose }: Props) {
  if (!info) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">ML Model Benchmark & Dataset Summary</h3>
              <p className="text-xs text-slate-500">80/20 Stratified Validation on Real Life Insurance Policy Data</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 text-xs">
          <div>
            <div className="text-slate-500 font-medium">Clean Policies Trained</div>
            <div className="text-lg font-extrabold font-mono text-slate-900 mt-0.5">
              {info.dataset_rows_used.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-slate-500 font-medium">Engineered Features</div>
            <div className="text-lg font-extrabold font-mono text-slate-900 mt-0.5">{info.feature_count}</div>
          </div>
          <div>
            <div className="text-slate-500 font-medium">Served Model</div>
            <div className="text-sm font-extrabold text-indigo-600 mt-1">{info.primary_served_model}</div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px]">
                <th className="py-3 px-3.5">Algorithm</th>
                <th className="py-3 px-3">Accuracy</th>
                <th className="py-3 px-3">Precision</th>
                <th className="py-3 px-3">Recall</th>
                <th className="py-3 px-3">F1-Score</th>
                <th className="py-3 px-3.5">ROC-AUC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {info.benchmarks.map((row) => {
                const isServed = row.model_name === info.primary_served_model;
                return (
                  <tr key={row.model_name} className={isServed ? "bg-indigo-50/40" : "hover:bg-slate-50"}>
                    <td className="py-3 px-3.5 font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{row.model_name}</span>
                      {isServed && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                          <Award className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono">{row.accuracy}%</td>
                    <td className="py-3 px-3 font-mono">{row.precision}%</td>
                    <td className="py-3 px-3 font-mono">{row.recall}%</td>
                    <td className="py-3 px-3 font-mono font-semibold text-indigo-700">{row.f1_score}%</td>
                    <td className="py-3 px-3.5 font-mono font-extrabold text-emerald-700">{row.roc_auc}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}