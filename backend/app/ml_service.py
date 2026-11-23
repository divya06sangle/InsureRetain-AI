import json
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from app.schemas import PolicyInput, PredictionResponse, ShapDriver

# Safely resolve paths to ml_pipeline/artifacts
ROOT_DIR = Path(__file__).resolve().parents[2]
ARTIFACTS_DIR = ROOT_DIR / "ml_pipeline" / "artifacts"

# Maps internal encoded column names to clean human-readable labels for the UI & AI Agent
FRIENDLY_LABELS = {
    "Premium_to_Benefit_Ratio": "Premium-to-Coverage Burden Ratio",
    "Premium": "Annual/Installment Premium Amount",
    "BENEFIT": "Total Coverage Benefit",
    "Policy Year": "Policy Tenure (Years Active)",
    "Policy Year (Decimal)": "Exact Policy Duration",
    "ENTRY AGE": "Customer Age at Policy Start",
    "Current_Age": "Current Policyholder Age",
    "SUBSTANDARD RISK": "Health / Substandard Risk Rating",
    "NUMBER OF ADVANCE PREMIUM": "Advance Premium Payments Made",
    "Has_Advance_Premium": "Advance Payment History",
    "PAYMENT MODE_Monthly": "Monthly Payment Frequency",
    "PAYMENT MODE_Annually": "Annual Payment Frequency",
    "PAYMENT MODE_Quaterly": "Quarterly Payment Frequency",
    "PAYMENT MODE_Semiannually": "Semi-Annual Payment Frequency",
    "PAYMENT MODE_Single Premium": "Single Upfront Premium",
    "NON LAPSE GUARANTEED_NO NLG": "No Non-Lapse Guarantee Protection",
    "NON LAPSE GUARANTEED_NLG Active": "Active Non-Lapse Guarantee",
    "Premium_Missing": "Incomplete Historical Premium Record",
    "Benefit_Missing": "Incomplete Coverage Record",
    "POLICY TYPE 1": "Core Policy Plan Category",
    "POLICY TYPE 2": "Policy Sub-Plan Tier",
    "CHANNEL1": "Primary Sales Channel",
    "CHANNEL2": "Secondary Distribution Channel",
}


class MLService:
    def __init__(self):
        self.model = joblib.load(ARTIFACTS_DIR / "rf_lapse_model.joblib")
        self.explainer = joblib.load(ARTIFACTS_DIR / "shap_explainer.joblib")
        with open(ARTIFACTS_DIR / "metrics.json", "r", encoding="utf-8") as f:
            self.metrics_report = json.load(f)

        self.feature_columns: list[str] = self.metrics_report["preprocessing"]["feature_columns"]

    def _prepare_features(self, payload: PolicyInput) -> tuple[pd.DataFrame, dict]:
        """Transforms validated user input into the exact 50-feature vector used during training."""
        current_age = payload.entry_age + payload.policy_year
        prem_to_benefit = payload.premium / (payload.benefit + 1.0)
        has_advance = 1 if payload.number_of_advance_premium > 0 else 0
        benefit_changed = 1 if payload.initial_benefit > 0 else 0

        raw_row = {
            "CHANNEL1": payload.channel1,
            "CHANNEL2": payload.channel2,
            "CHANNEL3": payload.channel3,
            "ENTRY AGE": payload.entry_age,
            "Current_Age": current_age,
            "POLICY TYPE 1": payload.policy_type_1,
            "POLICY TYPE 2": payload.policy_type_2,
            "BENEFIT": payload.benefit,
            "INITIAL BENEFIT": payload.initial_benefit,
            "Premium": payload.premium,
            "Premium_to_Benefit_Ratio": prem_to_benefit,
            "SUBSTANDARD RISK": payload.substandard_risk,
            "NUMBER OF ADVANCE PREMIUM": payload.number_of_advance_premium,
            "Has_Advance_Premium": has_advance,
            "Benefit_Changed": benefit_changed,
            "Policy Year (Decimal)": float(payload.policy_year),
            "Policy Year": payload.policy_year,
            "Substandard_Unknown": 0,
            "Premium_Missing": 0,
            "Benefit_Missing": 0,
            "SEX": payload.sex,
            "PAYMENT MODE": payload.payment_mode,
            "NON LAPSE GUARANTEED": payload.non_lapse_guaranteed,
            "Full Benefit?": payload.full_benefit,
            "POLICY TYPE 3": payload.policy_type_3,
            "Issue_Month": payload.issue_month,
        }

        df_single = pd.DataFrame([raw_row])
        cat_cols = self.metrics_report["preprocessing"]["categorical_cols"]
        df_encoded = pd.get_dummies(df_single, columns=cat_cols, drop_first=False)

        # Align strictly with the 50 columns expected by Random Forest
        df_aligned = df_encoded.reindex(columns=self.feature_columns, fill_value=0).astype(float)

        engineered_summary = {
            "current_age": current_age,
            "premium_to_benefit_percent": round(prem_to_benefit * 100, 3),
            "has_advance_premium": bool(has_advance),
        }
        return df_aligned, engineered_summary

    def predict(self, payload: PolicyInput) -> PredictionResponse:
        X_input, engineered_summary = self._prepare_features(payload)

        # 1. Predict Lapse Probability (Class 1)
        lapse_prob = float(self.model.predict_proba(X_input)[0][1])
        lapse_pct = round(lapse_prob * 100, 1)

        if lapse_pct >= 65.0:
            risk_tier = "High"
        elif lapse_pct >= 40.0:
            risk_tier = "Medium"
        else:
            risk_tier = "Low"

        predicted_status = "Likely to Lapse" if lapse_pct >= 50.0 else "Likely to Stay Inforce"

        # 2. Extract SHAP values for Class 1 (Lapse)
        shap_vals = self.explainer.shap_values(X_input)
        if isinstance(shap_vals, list):
            class1_shap = shap_vals[1][0]
        elif shap_vals.ndim == 3:
            class1_shap = shap_vals[0, :, 1]
        else:
            class1_shap = shap_vals[0]

        # Rank top 4 strongest drivers by absolute SHAP impact
        top_indices = np.argsort(np.abs(class1_shap))[::-1][:4]
        drivers: list[ShapDriver] = []
        for idx in top_indices:
            col_name = self.feature_columns[idx]
            val = float(class1_shap[idx])
            friendly = FRIENDLY_LABELS.get(col_name, col_name.replace("_", " ").title())
            drivers.append(
                ShapDriver(
                    feature_key=col_name,
                    label=friendly,
                    impact_score=round(val, 4),
                    direction="Increases Lapse Risk" if val >= 0 else "Reduces Lapse Risk",
                )
            )

        return PredictionResponse(
            lapse_probability=lapse_pct,
            risk_tier=risk_tier,
            predicted_status=predicted_status,
            top_drivers=drivers,
            engineered_metrics=engineered_summary,
        )

    def get_model_info(self) -> dict:
        return {
            "primary_served_model": self.metrics_report["primary_served_model"],
            "dataset_rows_used": self.metrics_report["dataset_rows_used"],
            "feature_count": self.metrics_report["feature_count"],
            "benchmarks": self.metrics_report["benchmarks"],
        }