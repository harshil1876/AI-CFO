"""
Sprint 18 Part B — Custom KPI Formula Evaluator
================================================
Evaluates user-defined formula strings against live DB data.
Maps plain-English variable names to actual Django ORM aggregations.
e.g. "Total Revenue - Total Expenses" → computes from Transaction model.
"""

import logging
import re
from django.db.models import Sum

logger = logging.getLogger(__name__)

# Maps human-readable variable names → Django ORM aggregation callables
VARIABLE_MAP = {
    "total revenue":    lambda bot_id: _sum_transactions(bot_id, "revenue"),
    "revenue":          lambda bot_id: _sum_transactions(bot_id, "revenue"),
    "total expenses":   lambda bot_id: _sum_transactions(bot_id, "expense"),
    "expenses":         lambda bot_id: _sum_transactions(bot_id, "expense"),
    "net profit":       lambda bot_id: _sum_transactions(bot_id, "revenue") - _sum_transactions(bot_id, "expense"),
    "total invoices":   lambda bot_id: _count_invoices(bot_id, None),
    "pending invoices": lambda bot_id: _count_invoices(bot_id, "pending_approval"),
    "approved invoices":lambda bot_id: _count_invoices(bot_id, "approved"),
    "burn rate":        lambda bot_id: _get_kpi_field(bot_id, "burn_rate"),
    "runway":           lambda bot_id: _get_kpi_field(bot_id, "runway_months"),
    "profit margin":    lambda bot_id: _get_kpi_field(bot_id, "profit_margin"),
}


def _sum_transactions(bot_id: str, txn_type: str) -> float:
    from api.models import Transaction
    result = Transaction.objects.filter(bot_id=bot_id, transaction_type=txn_type).aggregate(total=Sum("amount"))
    return float(result["total"] or 0)


def _count_invoices(bot_id: str, status: str | None) -> float:
    from api.models import Invoice
    qs = Invoice.objects.filter(bot_id=bot_id)
    if status:
        qs = qs.filter(status=status)
    return float(qs.count())


def _get_kpi_field(bot_id: str, field: str) -> float:
    from api.models import KPISnapshot
    kpi = KPISnapshot.objects.filter(bot_id=bot_id).order_by("-created_at").first()
    if kpi:
        return float(getattr(kpi, field, 0) or 0)
    return 0.0


def _resolve_category_spend(bot_id: str, category_name: str) -> float:
    """Resolve a department/category name like 'Marketing Spend' to its actual sum."""
    from api.models import Transaction
    # Strip common suffixes
    clean = re.sub(r'\s+(spend|cost|costs|expense|expenses)$', '', category_name, flags=re.IGNORECASE).strip()
    result = Transaction.objects.filter(
        bot_id=bot_id,
        transaction_type="expense",
        category__icontains=clean
    ).aggregate(total=Sum("amount"))
    return float(result["total"] or 0)


def evaluate_formula(bot_id: str, formula: str) -> dict:
    """
    Evaluate a user-defined formula string.
    Returns dict with numeric result and a variable breakdown.
    """
    formula_lower = formula.lower()
    variable_values = {}

    # Resolve known variables first (longest match first to avoid partial overlaps)
    sorted_vars = sorted(VARIABLE_MAP.keys(), key=len, reverse=True)
    working_formula = formula_lower

    for var_name in sorted_vars:
        if var_name in working_formula:
            try:
                value = VARIABLE_MAP[var_name](bot_id)
                variable_values[var_name] = value
                # Replace in formula with the numeric value for eval
                working_formula = working_formula.replace(var_name, str(value))
            except Exception as e:
                logger.error(f"[KPI Eval] Failed to resolve '{var_name}': {e}")
                variable_values[var_name] = 0.0
                working_formula = working_formula.replace(var_name, "0")

    # Handle remaining "X Spend" / "X Cost" style variables
    spend_pattern = re.compile(r'([a-zA-Z &]+(?:\s+(?:spend|cost|costs|expense|expenses)))', re.IGNORECASE)
    for match in spend_pattern.finditer(working_formula):
        raw = match.group(0)
        if raw not in variable_values:
            value = _resolve_category_spend(bot_id, raw)
            variable_values[raw] = value
            working_formula = working_formula.replace(raw, str(value))

    # Sanitize: only allow numbers, operators, parentheses, spaces
    if not re.match(r'^[\d\s\+\-\*\/\(\)\.]+$', working_formula.strip()):
        return {
            "success": False,
            "error": f"Formula contains unresolvable variables after substitution: '{working_formula}'",
            "variable_values": variable_values,
        }

    try:
        # Safe eval with only math operations
        result = float(eval(working_formula, {"__builtins__": {}}, {}))
        return {
            "success": True,
            "result": round(result, 2),
            "variable_values": {k: round(v, 2) for k, v in variable_values.items()},
            "resolved_formula": working_formula,
        }
    except ZeroDivisionError:
        return {"success": False, "error": "Division by zero in formula."}
    except Exception as e:
        return {"success": False, "error": f"Formula evaluation error: {str(e)}"}
