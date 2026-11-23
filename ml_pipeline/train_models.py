import json
import joblib
import numpy as np
import pandas as pd
import shap
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from lightgbm import LGBMClassifier
from xgboost import XGBClassifier

# Paths
BASE_DIR = Path(__file__).parent
DATA_PATH = BASE_DIR / "data" / "insurance_data.csv"
ARTIFACTS_DIR = BASE_DIR / "artifacts"
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)


def clean_and_engineer_features(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series, dict]:
    """Cleans raw Kaggle insurance data and creates high-signal domain features."""
    # 1. Keep only binary target: Lapse (1) vs Inforce (0)
    df = df[df["POLICY STATUS"].isin(["Lapse", "Inforce"])].copy()
    y = (df["POLICY STATUS"] == "Lapse").astype(int)

    # 2. Fix negative sentinel codes (-99 in Substandard Risk, <= 0 in Premium)
    df["Substandard_Unknown"] = (df["SUBSTANDARD RISK"] < 0).astype(int)
    df.loc[df["SUBSTANDARD RISK"] < 0, "SUBSTANDARD RISK"] = np.nan

    df["Premium_Missing"] = (df["Premium"].isna() | (df["Premium"] <= 0)).astype(int)
    df.loc[df["Premium"] <= 0, "Premium"] = np.nan

    df["Benefit_Missing"] = df["BENEFIT"].isna().astype(int)

    # 3. Compute safe medians from data so backend can reuse exact same values later
    medians = {
        "BENEFIT": float(df["BENEFIT"].median()),
        "Premium": float(df["Premium"].median()),
        "SUBSTANDARD RISK": float(df["SUBSTANDARD RISK"].median()),
        "INITIAL BENEFIT": float(df["INITIAL BENEFIT"].median()),
    }

    for col, med_val in medians.items():
        df[col] = df[col].fillna(med_val)

    # 4. Feature Engineering (ratios & customer lifecycle indicators)
    df["Current_Age"] = df["ENTRY AGE"] + df["Policy Year"]
    df["Premium_to_Benefit_Ratio"] = df["Premium"] / (df["BENEFIT"] + 1.0)
    df["Has_Advance_Premium"] = (df["NUMBER OF ADVANCE PREMIUM"] > 0).astype(int)
    df["Benefit_Changed"] = (df["INITIAL BENEFIT"] > 0).astype(int)

    # Extract month from Issue Date (e.g., '11-Aug' -> 'Aug')
    df["Issue_Month"] = df["Issue Date"].astype(str).str.split("-").str[-1].fillna("Unknown")

    # 5. Select clean, interpretable features for modeling & UI
    numeric_cols = [
        "CHANNEL1", "CHANNEL2", "CHANNEL3",
        "ENTRY AGE", "Current_Age",
        "POLICY TYPE 1", "POLICY TYPE 2",
        "BENEFIT", "INITIAL BENEFIT", "Premium",
        "Premium_to_Benefit_Ratio",
        "SUBSTANDARD RISK", "NUMBER OF ADVANCE PREMIUM",
        "Has_Advance_Premium", "Benefit_Changed",
        "Policy Year (Decimal)", "Policy Year",
        "Substandard_Unknown", "Premium_Missing", "Benefit_Missing",
    ]

    categorical_cols = [
        "SEX", "PAYMENT MODE", "NON LAPSE GUARANTEED",
        "Full Benefit?", "POLICY TYPE 3", "Issue_Month",
    ]

    X_raw = df[numeric_cols + categorical_cols].copy()
    X_encoded = pd.get_dummies(X_raw, columns=categorical_cols, drop_first=False)

    # Ensure all boolean columns are clean integers (0/1)
    for col in X_encoded.columns:
        if X_encoded[col].dtype == bool:
            X_encoded[col] = X_encoded[col].astype(int)

    preprocessing_metadata = {
        "medians": medians,
        "feature_columns": X_encoded.columns.tolist(),
        "numeric_cols": numeric_cols,
        "categorical_cols": categorical_cols,
    }

    return X_encoded, y, preprocessing_metadata


def evaluate_model(name: str, model, X_test: pd.DataFrame, y_test: pd.Series) -> dict:
    """Calculates standard classification metrics for model benchmarking."""
    preds = model.predict(X_test)
    probs = model.predict_proba(X_test)[:, 1]
    return {
        "model_name": name,
        "accuracy": round(float(accuracy_score(y_test, preds)) * 100, 2),
        "precision": round(float(precision_score(y_test, preds)) * 100, 2),
        "recall": round(float(recall_score(y_test, preds)) * 100, 2),
        "f1_score": round(float(f1_score(y_test, preds)) * 100, 2),
        "roc_auc": round(float(roc_auc_score(y_test, probs)) * 100, 2),
    }


def main():
    print("Step 1/4: Loading and cleaning insurance dataset...")
    raw_df = pd.read_csv(DATA_PATH)
    X, y, metadata = clean_and_engineer_features(raw_df)
    print(f"Clean dataset ready: {len(X):,} policies | {X.shape[1]} engineered features")
    print(f"Lapse rate: {y.mean()*100:.2f}%\n")

    # 80/20 Stratified split so both sets preserve exact Lapse/Inforce ratio
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    print("Step 2/4: Training Random Forest, LightGBM, and XGBoost...")

    # 1. Tuned Random Forest Classifier
    rf_model = RandomForestClassifier(
        n_estimators=100,
        max_depth=12,
        min_samples_split=10,
        min_samples_leaf=5,
        max_features="sqrt",
        class_weight="balanced",
        n_jobs=-1,
        random_state=42,
    )
    rf_model.fit(X_train, y_train)

    # 2. LightGBM Classifier
    lgbm_model = LGBMClassifier(
        n_estimators=300,
        learning_rate=0.05,
        max_depth=10,
        num_leaves=63,
        random_state=42,
        n_jobs=-1,
        verbose=-1,
    )
    lgbm_model.fit(X_train, y_train)

    # 3. XGBoost Classifier
    xgb_model = XGBClassifier(
        n_estimators=300,
        learning_rate=0.05,
        max_depth=8,
        subsample=0.8,
        colsample_bytree=0.8,
        eval_metric="logloss",
        random_state=42,
        n_jobs=-1,
    )
    xgb_model.fit(X_train, y_train)

    print("Step 3/4: Evaluating all 3 models on unseen test data...")
    benchmark_results = [
        evaluate_model("Random Forest (Tuned)", rf_model, X_test, y_test),
        evaluate_model("LightGBM", lgbm_model, X_test, y_test),
        evaluate_model("XGBoost", xgb_model, X_test, y_test),
    ]

    for res in benchmark_results:
        print(
            f" -> {res['model_name']}: "
            f"Accuracy={res['accuracy']}% | F1={res['f1_score']}% | ROC-AUC={res['roc_auc']}%"
        )

    print("\nStep 4/4: Building SHAP explainer and saving artifacts...")
    # Build fast TreeExplainer on Random Forest for live API explanations
    explainer = shap.TreeExplainer(rf_model)

    # Quick sanity check on 5 test rows
    sample_shap = explainer.shap_values(X_test.iloc[:5])
    if isinstance(sample_shap, list):
        assert sample_shap[1].shape[1] == X_test.shape[1]
    elif sample_shap.ndim == 3:
        assert sample_shap[:, :, 1].shape[1] == X_test.shape[1]

    joblib.dump(rf_model, ARTIFACTS_DIR / "rf_lapse_model.joblib", compress=3)
    joblib.dump(explainer, ARTIFACTS_DIR / "shap_explainer.joblib", compress=3)

    report = {
        "dataset_rows_used": int(len(X)),
        "train_rows": int(len(X_train)),
        "test_rows": int(len(X_test)),
        "feature_count": int(X.shape[1]),
        "primary_served_model": "Random Forest (Tuned)",
        "benchmarks": benchmark_results,
        "preprocessing": metadata,
    }

    with open(ARTIFACTS_DIR / "metrics.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(f"\nSuccess! Saved model, SHAP explainer, and metrics.json to: {ARTIFACTS_DIR}")


if __name__ == "__main__":
    main()