export interface PolicyInput {
  entry_age: number;
  sex: "M" | "F";
  policy_year: number;
  benefit: number;
  initial_benefit: number;
  premium: number;
  payment_mode: "Annually" | "Semiannually" | "Quaterly" | "Monthly" | "Single Premium";
  substandard_risk: number;
  number_of_advance_premium: number;
  non_lapse_guaranteed: "NO NLG" | "NLG Active" | "NLG Not Active" | "NLG Suspend";
  full_benefit: "Y" | "N";
  policy_type_1: number;
  policy_type_2: number;
  policy_type_3: "A" | "B" | "C" | "D" | "E";
  channel1: number;
  channel2: number;
  channel3: number;
  issue_month: "Jan" | "Feb" | "Mar" | "Apr" | "May" | "Jun" | "Jul" | "Aug" | "Sep" | "Oct" | "Nov" | "Dec";
}

export interface ShapDriver {
  feature_key: string;
  label: string;
  impact_score: number;
  direction: "Increases Lapse Risk" | "Reduces Lapse Risk";
}

export interface PredictionResponse {
  lapse_probability: number;
  risk_tier: "Low" | "Medium" | "High";
  predicted_status: "Likely to Lapse" | "Likely to Stay Inforce";
  top_drivers: ShapDriver[];
  engineered_metrics: {
    current_age: number;
    premium_to_benefit_percent: number;
    has_advance_premium: boolean;
  };
}

export interface AgentActionPlan {
  rule_id_cited: string;
  recommended_action_title: string;
  retention_offer: string;
  underwriter_reasoning: string;
  customer_email_subject: string;
  customer_email_body: string;
  agent_trace: string[];
  used_live_llm: boolean;
}

export interface FullAnalysisResponse {
  prediction: PredictionResponse;
  agent_plan: AgentActionPlan;
}

export interface ModelBenchmark {
  model_name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
}

export interface ModelInfoResponse {
  primary_served_model: string;
  dataset_rows_used: number;
  feature_count: number;
  benchmarks: ModelBenchmark[];
}