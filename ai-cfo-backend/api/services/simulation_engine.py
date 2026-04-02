"""
Scenario Simulation Engine
Allows users to ask "What-If" questions and see projected financial impacts.
E.g., "What if we increase marketing spend by 20%?"
"""
import logging
from decimal import Decimal
from api.models import KPISnapshot, DepartmentData

logger = logging.getLogger(__name__)


def run_simulation(bot_id: str, period: str, scenarios: list) -> dict:
    """
    Recalculate KPI projections based on hypothetical changes.

    Args:
        bot_id: The company's bot instance ID.
        period: The base period for simulation (e.g., "2026-03").
        scenarios: A list of scenario dicts, each with:
            - type: "adjust_revenue", "adjust_expense", "adjust_department"
            - value: percentage change (e.g., 20 for +20%, -15 for -15%)
            - target: (optional) department name for department-level adjustments

    Returns:
        A dict comparing baseline vs simulated KPIs with impact analysis.
    """
    # Fetch baseline KPIs
    try:
        baseline = KPISnapshot.objects.filter(bot_id=bot_id, period=period).latest("created_at")
    except KPISnapshot.DoesNotExist:
        return {"error": f"No KPI data found for period {period}. Run analytics first."}

    # Start with baseline values
    sim_revenue = float(baseline.total_revenue)
    sim_expenses = float(baseline.total_expenses)

    # Apply each scenario
    applied_scenarios = []
    for scenario in scenarios:
        s_type = scenario.get("type", "")
        s_value = float(scenario.get("value", 0))
        s_target = scenario.get("target", "")

        if s_type == "adjust_revenue":
            change = sim_revenue * (s_value / 100)
            sim_revenue += change
            applied_scenarios.append({
                "type": s_type,
                "description": f"Revenue {'increased' if s_value > 0 else 'decreased'} by {abs(s_value)}%",
                "impact": round(change, 2),
            })

        elif s_type == "adjust_expense":
            change = sim_expenses * (s_value / 100)
            sim_expenses += change
            applied_scenarios.append({
                "type": s_type,
                "description": f"Expenses {'increased' if s_value > 0 else 'decreased'} by {abs(s_value)}%",
                "impact": round(change, 2),
            })

        elif s_type == "adjust_department" and s_target:
            dept = DepartmentData.objects.filter(
                bot_id=bot_id, month_year=period, department_name__icontains=s_target
            ).first()
            if dept:
                dept_change = float(dept.actual_spend) * (s_value / 100)
                sim_expenses += dept_change
                applied_scenarios.append({
                    "type": s_type,
                    "description": f"{s_target} spend {'increased' if s_value > 0 else 'cut'} by {abs(s_value)}%",
                    "impact": round(dept_change, 2),
                    "department": s_target,
                })

    # Calculate simulated KPIs
    sim_net_profit = sim_revenue - sim_expenses
    sim_margin = (sim_net_profit / sim_revenue * 100) if sim_revenue > 0 else 0
    sim_burn_rate = sim_expenses
    sim_runway = (sim_net_profit / sim_burn_rate) if sim_burn_rate > 0 else 0

    # Build comparison
    baseline_data = {
        "total_revenue": float(baseline.total_revenue),
        "total_expenses": float(baseline.total_expenses),
        "net_profit": float(baseline.net_profit),
        "profit_margin": float(baseline.profit_margin),
        "burn_rate": float(baseline.burn_rate),
        "runway_months": float(baseline.runway_months),
    }

    simulated_data = {
        "total_revenue": round(sim_revenue, 2),
        "total_expenses": round(sim_expenses, 2),
        "net_profit": round(sim_net_profit, 2),
        "profit_margin": round(sim_margin, 2),
        "burn_rate": round(sim_burn_rate, 2),
        "runway_months": round(max(sim_runway, 0), 1),
    }

    # Impact summary
    impact = {
        "revenue_change": round(simulated_data["total_revenue"] - baseline_data["total_revenue"], 2),
        "expense_change": round(simulated_data["total_expenses"] - baseline_data["total_expenses"], 2),
        "profit_change": round(simulated_data["net_profit"] - baseline_data["net_profit"], 2),
        "margin_change": round(simulated_data["profit_margin"] - baseline_data["profit_margin"], 2),
    }

    # Determine risk level
    if simulated_data["profit_margin"] < 0:
        risk_level = "critical"
        risk_message = "This scenario results in a net LOSS. Not recommended."
    elif simulated_data["profit_margin"] < 10:
        risk_level = "high"
        risk_message = "Profit margin drops below 10%. Proceed with caution."
    elif simulated_data["profit_margin"] < baseline_data["profit_margin"]:
        risk_level = "medium"
        risk_message = "Profit margin decreases but remains positive."
    else:
        risk_level = "low"
        risk_message = "This scenario improves financial performance."

    logger.info(f"Simulation run for bot={bot_id}: {len(applied_scenarios)} scenarios applied")

    return {
        "bot_id": bot_id,
        "period": period,
        "baseline": baseline_data,
        "simulated": simulated_data,
        "impact": impact,
        "risk_level": risk_level,
        "risk_message": risk_message,
        "scenarios_applied": applied_scenarios,
    }

def simulate_from_nlp(bot_id: str, period: str, prompt: str) -> dict:
    """
    Translates a natural language prompt into a structured simulation scenario array using LLM,
    then runs the simulation.
    """
    import os
    import json
    
    try:
        from google import genai
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            return {"error": "API Key missing for NLP simulation"}
            
        client = genai.Client(api_key=api_key)
        
        system_instructions = '''
        You are a financial modeler. The user will provide a hypothetical scenario in natural language.
        You must deduce the intended simulation scenarios and output a JSON array of objects.
        Valid keys for objects:
        - type: strictly one of "adjust_revenue", "adjust_expense", "adjust_department"
        - value: a numeric percentage (e.g., 20 for +20%, -15 for -15%)
        - target: purely optional, only used if type is "adjust_department", string representing department name.
        
        Example Input: "What if we cut marketing spend by 10% and boost revenue by 5%?"
        Example Output: [{"type": "adjust_department", "target": "marketing", "value": -10}, {"type": "adjust_revenue", "value": 5}]
        '''
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=system_instructions + "\\n\\nThe User's prompt: " + prompt,
        )
        
        response_text = response.text
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
            
        scenarios = json.loads(response_text)
        if not isinstance(scenarios, list):
            scenarios = [scenarios]
            
        return run_simulation(bot_id, period, scenarios)
        
    except Exception as e:
        logger.error(f"Error in NLP simulation translation: {e}")
        return {"error": "Failed to translate standard prompt into simulation."}
