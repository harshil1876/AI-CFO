"""
Sprint 18 Part B — Generative Planning Agent
============================================
Generates AI-drafted budget plans from natural-language parameters.
Inspired by Vena Solutions' AI-assisted planning workflows.
The user provides growth assumptions and the AI synthesizes a full budget draft
modeled against historical transaction data.
"""

import os
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


def generate_ai_budget(bot_id: str, prompt_params: dict) -> dict:
    """
    Generate a complete budget plan using Gemini + historical data.

    Args:
        bot_id: The workspace identifier.
        prompt_params: {
            "target_month": "2026-06",            # Month to plan for (YYYY-MM)
            "growth_assumption": 15,              # % growth vs prior month
            "instructions": "Focus on cutting travel by 20%",  # Optional freetext
            "apply_to_db": True                   # Whether to save result to Budget table
        }

    Returns:
        { "success": True, "budget_items": [...], "ai_rationale": "..." }
    """
    from api.models import Transaction, Budget
    from django.db.models import Sum, Avg

    target_month = prompt_params.get("target_month", datetime.now().strftime("%Y-%m"))
    growth_pct = float(prompt_params.get("growth_assumption", 10))
    instructions = prompt_params.get("instructions", "")
    apply_to_db = prompt_params.get("apply_to_db", False)

    # 1. Pull historical expense averages per category (last 3 months)
    historical = (
        Transaction.objects
        .filter(bot_id=bot_id, amount__lt=0)
        .values("category")
        .annotate(avg_spend=Avg("amount"), total_spend=Sum("amount"))
        .order_by("-total_spend")
    )

    if not historical:
        return {
            "success": False,
            "error": "No historical transaction data found. Upload financial data first to enable AI budget generation."
        }

    historical_summary = "\n".join(
        [f"- {h['category']}: avg ${float(h['avg_spend']):.2f}/period, total ${float(h['total_spend']):.2f}"
         for h in historical]
    )

    # 2. Pull existing budget for comparison context
    existing_budgets = Budget.objects.filter(bot_id=bot_id, is_active=True).values("category", "allocated_amount", "month_year")
    existing_str = "\n".join([f"- {b['category']}: ${float(b['allocated_amount']):.2f} ({b['month_year']})" for b in existing_budgets]) or "None"

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return {"success": False, "error": "GEMINI_API_KEY not configured."}

    # 3. Construct the generative planning prompt
    planning_prompt = f"""
You are an expert CFO AI Budget Planner. Your task is to generate a detailed budget plan.

HISTORICAL EXPENSE DATA (actual averages per category):
{historical_summary}

EXISTING BUDGETS FOR CONTEXT:
{existing_str}

PLANNING PARAMETERS:
- Target Month: {target_month}
- Growth Assumption: {growth_pct:+.1f}% vs historical averages
- Special Instructions: {instructions or "None — follow standard corporate allocation best practices."}

TASK:
Generate a complete budget allocation plan for {target_month}.
Apply the growth assumption intelligently (e.g., revenue-driving categories like Marketing may get more, operational overheads less).
Respect the special instructions.

You MUST respond with a JSON object in EXACTLY this format:
{{
  "budget_items": [
    {{"category": "Marketing", "allocated_amount": 12000.00, "rationale": "15% growth applied to sustain customer acquisition."}},
    {{"category": "Engineering", "allocated_amount": 45000.00, "rationale": "Core team costs remain stable."}}
  ],
  "ai_rationale": "Overall budget is balanced for {growth_pct:+.1f}% growth. Total planned: $XXX,XXX. Key focus areas are...",
  "total_budget": 0.0
}}

Include ALL categories from historical data. Calculate total_budget as the sum.
"""

    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=planning_prompt,
        )
        text = response.text.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()

        result_obj = json.loads(text)
        items = result_obj.get("budget_items", [])
        ai_rationale = result_obj.get("ai_rationale", "AI budget generated successfully.")

    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg or "Quota" in error_msg:
            logger.warning("[BudgetGen] Gemini rate limit hit. Falling back to algorithmic budgeting.")
            items = []
            for h in historical:
                cat = h["category"]
                avg_spend = abs(float(h["avg_spend"]))
                
                multiplier = 1.0 + (growth_pct / 100.0)
                
                if "reduce" in instructions.lower() and cat.lower().split()[0] in instructions.lower():
                    multiplier = 0.85
                elif "protect" in instructions.lower() and cat.lower().split()[0] in instructions.lower():
                    multiplier = max(1.0, multiplier)
                
                allocated = round(avg_spend * multiplier, 2)
                items.append({
                    "category": cat,
                    "allocated_amount": allocated,
                    "rationale": f"Algorithmic Fallback: applied {multiplier*100 - 100:+.1f}% heuristic adjustment."
                })
            ai_rationale = f"Google API Rate Limit reached. Controller shifted to localized algorithmic baseline applying {growth_pct}% growth and heuristic adjustments."
        else:
            logger.error(f"[BudgetGen] Error: {error_msg}")
            return {"success": False, "error": error_msg}

    # Recalculate total
    total = sum(float(item.get("allocated_amount", 0)) for item in items)
    
    final_result = {
        "success": True,
        "target_month": target_month,
        "total_budget": round(total, 2),
        "ai_rationale": ai_rationale,
        "budget_items": items
    }

    # 4. Optionally persist to Budget table
    if apply_to_db and items:
        saved_count = 0
        from django.db import transaction
        with transaction.atomic():
            for item in items:
                category = item.get("category", "").strip()
                amount = float(item.get("allocated_amount", 0))
                if not category or amount <= 0:
                    continue
                
                Budget.objects.filter(
                    bot_id=bot_id, category=category, month_year=target_month, is_active=True
                ).update(is_active=False)
                
                latest = Budget.objects.filter(bot_id=bot_id, category=category, month_year=target_month).order_by("-version").first()
                version = (latest.version + 1) if latest else 1
                
                Budget.objects.create(
                    bot_id=bot_id, category=category, month_year=target_month,
                    allocated_amount=amount, version=version, is_active=True
                )
                saved_count += 1
        final_result["saved_to_db"] = saved_count
        final_result["message"] = f"✅ {saved_count} budget categories saved to {target_month}."

    return final_result
