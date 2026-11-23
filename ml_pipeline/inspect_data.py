import pandas as pd
from pathlib import Path

# Safely locate the dataset relative to this script
DATA_PATH = Path(__file__).parent / "data" / "insurance_data.csv"

def main():
    print(f"Loading dataset from: {DATA_PATH}\n")
    df = pd.read_csv(DATA_PATH)

    print(f"Total Rows: {len(df):,} | Total Columns: {len(df.columns)}\n")

    print("--- 1. POLICY STATUS COUNTS (Our Target) ---")
    print(df["POLICY STATUS"].value_counts(dropna=False), "\n")

    print("--- 2. MISSING VALUES PER COLUMN ---")
    missing = df.isnull().sum()
    print(missing[missing > 0] if missing.sum() > 0 else "No blank/NaN cells found!", "\n")

    print("--- 3. NUMERIC SUMMARY (Min / Median / Max) ---")
    print(df.describe().T[["min", "50%", "max"]], "\n")

    print("--- 4. CATEGORICAL UNIQUE VALUES ---")
    cat_cols = ["SEX", "PAYMENT MODE", "NON LAPSE GUARANTEED", "Full Benefit?", "POLICY TYPE 3"]
    for col in cat_cols:
        if col in df.columns:
            print(f"{col}: {df[col].unique().tolist()}")

if __name__ == "__main__":
    main()