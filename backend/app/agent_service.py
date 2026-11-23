import json
import os
from pathlib import Path
from pydantic import BaseModel
from google import genai
from google.genai import types
from app.schemas import PolicyInput, PredictionResponse

RULES_PATH = Path(__file__).parent / "retention_rules.json"


class AgentActionPlan(BaseModel):
    rule_id_cited: str
    recommended_action_title: str
    retention_offer: str
    underwriter_reasoning: str
    customer_email_subject: str
    customer_email_body: str
    agent_trace: list[str]
    used_live_llm: bool


def lookup_retention_playbook(risk_tier: str, primary_driver: str) -> str:
    """Tool called by Gemini to fetch approved insurance retention rules."""
    with open(RULES_PATH, "r", encoding="utf-8") as f:
        rules = json.load(f)

    matched = []
    driver_lower = primary_driver.lower()
    for rule in rules:
        if risk_tier in rule["applies_to_risk"]:
            if any(kw.lower() in driver_lower for kw in rule["trigger_keywords"]) or "All" in rule["trigger_keywords"]:
                matched.append(rule)

    if not matched:
        matched = [r for r in rules if risk_tier in r["applies_to_risk"]][:1]

    return json.dumps(matched, indent=2)


class RetentionAgentService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "").strip()
        self.client = genai.Client(api_key=self.api_key) if self.api_key and self.api_key != "your_actual_api_key_here" else None
        self.cache: dict[str, AgentActionPlan] = {}

    def _build_fallback_plan(self, policy: PolicyInput, prediction: PredictionResponse, reason: str) -> AgentActionPlan:
        """Deterministic safety fallback so the demo never breaks if API quota is reached."""
        top_driver = prediction.top_drivers[0].label if prediction.top_drivers else "Policy Tenure"
        raw_rules = json.loads(lookup_retention_playbook(prediction.risk_tier, top_driver))
        rule = raw_rules[0]

        return AgentActionPlan(
            rule_id_cited=rule["rule_id"],
            recommended_action_title=rule["offer_title"],
            retention_offer=rule["approved_incentive"],
            underwriter_reasoning=(
                f"Policy shows a {prediction.lapse_probability}% lapse probability ({prediction.risk_tier} Risk), "
                f"primarily driven by {top_driver}. Applied official playbook rule {rule['rule_id']}."
            ),
            customer_email_subject=f"Important Update: Flexible Options for Your Life Insurance Policy",
            customer_email_body=(
                f"Dear Valued Policyholder,\n\n"
                f"We noticed your policy (Year {policy.policy_year}, Coverage ${policy.benefit:,.0f}) is approaching an important milestone. "
                f"To make sure your protection stays uninterrupted, you are eligible for our {rule['offer_title']}: "
                f"{rule['approved_incentive']}\n\n"
                f"Reply to this email or schedule a quick 5-minute call with your advisor to activate this option.\n\n"
                f"Warm regards,\nCustomer Retention Team"
            ),
            agent_trace=[
                f"1. Received ML score: {prediction.lapse_probability}% ({prediction.risk_tier} Risk)",
                f"2. Called tool lookup_retention_playbook(risk_tier='{prediction.risk_tier}', primary_driver='{top_driver}')",
                f"3. Matched approved rule {rule['rule_id']} ({reason})",
            ],
            used_live_llm=False,
        )

    def generate_retention_plan(self, policy: PolicyInput, prediction: PredictionResponse) -> AgentActionPlan:
        top_driver_label = prediction.top_drivers[0].label if prediction.top_drivers else "General"
        cache_key = f"{prediction.risk_tier}|{top_driver_label}|{policy.payment_mode}|{policy.policy_year}"

        if cache_key in self.cache:
            return self.cache[cache_key]

        if not self.client:
            return self._build_fallback_plan(policy, prediction, "Offline Rulebook Mode — add GEMINI_API_KEY in .env for live AI")

        trace_steps = [
            f"1. Analyzed ML Prediction: {prediction.lapse_probability}% Lapse Risk ({prediction.risk_tier})",
            f"2. Top SHAP Driver identified: {top_driver_label}",
        ]

        try:
            # Step A: Let Gemini call our lookup_retention_playbook tool
            prompt = (
                f"You are an expert Life Insurance Retention AI Copilot.\n"
                f"Policyholder details: Age {policy.entry_age + policy.policy_year}, Policy Year {policy.policy_year}, "
                f"Coverage Benefit ${policy.benefit:,.0f}, Premium ${policy.premium:,.0f} ({policy.payment_mode}).\n"
                f"ML Model Output: {prediction.lapse_probability}% Lapse Probability ({prediction.risk_tier} Risk).\n"
                f"Top SHAP Drivers: {[f'{d.label} ({d.direction})' for d in prediction.top_drivers[:3]]}.\n\n"
                f"First, call `lookup_retention_playbook` to retrieve the official approved retention rule for this risk tier and primary driver."
            )

            first_turn = self.client.models.generate_content(
                model="gemini-3.5-flash-lite",
                contents=prompt,
                config=types.GenerateContentConfig(
                    tools=[lookup_retention_playbook],
                    automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True),
                    temperature=0.2,
                ),
            )

            # Execute the tool requested by Gemini
            tool_result_text = lookup_retention_playbook(prediction.risk_tier, top_driver_label)
            if first_turn.function_calls:
                fc = first_turn.function_calls[0]
                args = fc.args or {}
                tool_result_text = lookup_retention_playbook(
                    risk_tier=args.get("risk_tier", prediction.risk_tier),
                    primary_driver=args.get("primary_driver", top_driver_label),
                )
                trace_steps.append(f"3. Gemini Agent invoked tool: lookup_retention_playbook({args})")
            else:
                trace_steps.append("3. Retrieved company retention playbook rules")

            # Step B: Ask Gemini to synthesize the final structured JSON action plan
            final_prompt = (
                f"{prompt}\n\n"
                f"Approved Company Rulebook Match:\n{tool_result_text}\n\n"
                f"Generate a concise, empathetic retention plan strictly grounded in the matched rule above. "
                f"Return valid JSON with keys: rule_id_cited, recommended_action_title, retention_offer, "
                f"underwriter_reasoning, customer_email_subject, customer_email_body."
            )

            second_turn = self.client.models.generate_content(
                model="gemini-3.5-flash-lite",
                contents=final_prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.3,
                ),
            )

            parsed = json.loads(second_turn.text)
            trace_steps.append(f"4. Synthesized personalized retention offer & email citing {parsed.get('rule_id_cited', 'RET-101')}")

            plan = AgentActionPlan(
                rule_id_cited=parsed.get("rule_id_cited", "RET-101"),
                recommended_action_title=parsed.get("recommended_action_title", "Retention Outreach"),
                retention_offer=parsed.get("retention_offer", ""),
                underwriter_reasoning=parsed.get("underwriter_reasoning", ""),
                customer_email_subject=parsed.get("customer_email_subject", "Your Life Insurance Policy Options"),
                customer_email_body=parsed.get("customer_email_body", ""),
                agent_trace=trace_steps,
                used_live_llm=True,
            )
            self.cache[cache_key] = plan
            return plan

        except Exception as exc:
            return self._build_fallback_plan(policy, prediction, f"Fallback active ({type(exc).__name__})")