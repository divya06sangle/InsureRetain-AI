from typing import Literal
from pydantic import BaseModel, Field


class PolicyInput(BaseModel):
    """Validates incoming policyholder details before running ML inference."""
    entry_age: int = Field(default=35, ge=0, le=90, description="Age when policy started")
    sex: Literal["M", "F"] = Field(default="M", description="Gender")
    policy_year: int = Field(default=2, ge=1, le=50, description="Completed policy years")
    benefit: float = Field(default=100000.0, gt=0, le=10000000, description="Coverage amount")
    initial_benefit: float = Field(default=0.0, ge=0, le=10000000, description="Initial coverage if changed")
    premium: float = Field(default=1200.0, gt=0, le=1000000, description="Policy premium amount")
    payment_mode: Literal[
        "Annually", "Semiannually", "Quaterly", "Monthly", "Single Premium"
    ] = Field(default="Monthly", description="How often customer pays")
    substandard_risk: float = Field(default=0.0, ge=0, le=500, description="Health/risk loading score")
    number_of_advance_premium: int = Field(default=0, ge=0, le=20, description="Advance payments made")
    non_lapse_guaranteed: Literal[
        "NO NLG", "NLG Active", "NLG Not Active", "NLG Suspend"
    ] = Field(default="NO NLG", description="Non-lapse guarantee status")
    full_benefit: Literal["Y", "N"] = Field(default="N", description="Full benefit flag")
    policy_type_1: int = Field(default=1, ge=1, le=30)
    policy_type_2: int = Field(default=2, ge=1, le=100)
    policy_type_3: Literal["A", "B", "C", "D", "E"] = Field(default="A")
    channel1: int = Field(default=1, ge=1, le=10)
    channel2: int = Field(default=1, ge=1, le=10)
    channel3: int = Field(default=0, ge=0, le=100)
    issue_month: Literal[
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ] = Field(default="Aug")


class ShapDriver(BaseModel):
    feature_key: str
    label: str
    impact_score: float
    direction: Literal["Increases Lapse Risk", "Reduces Lapse Risk"]


class PredictionResponse(BaseModel):
    lapse_probability: float
    risk_tier: Literal["Low", "Medium", "High"]
    predicted_status: Literal["Likely to Lapse", "Likely to Stay Inforce"]
    top_drivers: list[ShapDriver]
    engineered_metrics: dict