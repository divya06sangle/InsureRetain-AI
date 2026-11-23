import type { FullAnalysisResponse, ModelInfoResponse, PolicyInput, PredictionResponse } from "./types";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

export async function runFullAnalysis(policy: PolicyInput): Promise<FullAnalysisResponse> {
  const res = await fetch(`${API_BASE}/api/analyze-and-act`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(policy),
  });
  if (!res.ok) throw new Error("Failed to analyze policy risk.");
  return res.json();
}

export async function simulateQuickRisk(policy: PolicyInput): Promise<PredictionResponse> {
  const res = await fetch(`${API_BASE}/api/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(policy),
  });
  if (!res.ok) throw new Error("Failed to simulate policy change.");
  return res.json();
}

export async function fetchModelInfo(): Promise<ModelInfoResponse> {
  const res = await fetch(`${API_BASE}/api/model-info`);
  if (!res.ok) throw new Error("Failed to load model metrics.");
  return res.json();
}