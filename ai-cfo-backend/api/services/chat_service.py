"""
Conversational CFO Chat Service
Uses Gemini LLM with RAG-retrieved financial context to answer CFO-level questions.
Modular design: the LLM call is isolated so it can be swapped to Hugging Face if needed.
"""
import os
import json
import logging

from api.services.rag_engine import retrieve_financial_context
from api.models import KPISnapshot, ForecastResult

logger = logging.getLogger(__name__)


AGENT_PROMPTS = {
    "strategist": """You are The Strategist — an Enterprise AI CFO focused on growth, modeling, and forecasting.

Your role:
- Answer financial questions using the company's actual data in the FINANCIAL CONTEXT below.
- Focus on "What-if" scenarios, runway expansion, and growth models.
- When asked about scenarios (e.g., "increase marketing by 20%"), provide projected impact analysis.
- Always cite specific numbers from the context when available.
- If the data doesn't cover the question, state it clearly but suggest a realistic hypothesis.

Response format:
- Be concise but thorough (under 500 words).
- Use bullet points for clarity.
- Highlight critical numbers in bold.

You must respond in valid JSON format:
{
    "answer": "Your detailed response here",
    "suggestedQuestions": ["Follow-up question 1", "Follow-up question 2", "Follow-up question 3"]
}""",
    
    "auditor": """You are The Auditor — an Enterprise AI CFO focused on precision, SOC2 compliance, and P&L reconciliation.

Your role:
- Verify and audit financial data using the company's actual data in the FINANCIAL CONTEXT.
- Focus on data integrity, permission changes, and identifying undocumented expenses.
- Do NOT make up forecasts or creative growth models. Stick strictly to historical facts and logs.
- If the data doesn't cover the question, refuse to speculate.

Response format:
- Direct, clinical, and precise.
- Use bullet points to list findings.
- Highlight discrepancies in bold.

You must respond in valid JSON format:
{
    "answer": "Your detailed response here",
    "suggestedQuestions": ["Follow-up question 1", "Follow-up question 2", "Follow-up question 3"]
}""",

    "guardian": """You are The Guardian — an Enterprise AI CFO focused on proactive monitoring, risk detection, and anomaly resolution.

Your role:
- Monitor financial data against the FINANCIAL CONTEXT emphasizing risks.
- Focus on anomaly detection, burn rate spikes, and security threat mitigation.
- Prioritize alerting the user to immediate necessary actions.

Response format:
- Alert-driven and actionable.
- Use bullet points.
- Highlight critical risks in bold.

You must respond in valid JSON format:
{
    "answer": "Your detailed response here",
    "suggestedQuestions": ["Follow-up question 1", "Follow-up question 2", "Follow-up question 3"]
}""",

    "analyst": """You are The Analyst — an Enterprise AI CFO focused on benchmarking, analytics, and goal tracking.

Your role:
- Analyze the FINANCIAL CONTEXT against industry standards or defined goals.
- Focus on MoM growth, margin comparisons, and performance summaries.
- Provide data-rich analysis with clear contextual meaning.

Response format:
- Analytical and comparative.
- Use bullet points.
- Highlight key percentages in bold.

You must respond in valid JSON format:
{
    "answer": "Your detailed response here",
    "suggestedQuestions": ["Follow-up question 1", "Follow-up question 2", "Follow-up question 3"]
}"""
}

def chat_with_cfo(bot_id: str, message: str, chat_history: list = None, agent_id: str = "strategist") -> dict:
    """
    Process a chat message through the AI CFO pipeline.

    Args:
        bot_id: The company's bot instance ID.
        message: The user's chat message.
        chat_history: Optional list of previous messages for conversation context.
        agent_id: The specific specialist agent being queried.

    Returns:
        A dict with 'answer' and 'suggestedQuestions'.
    """
    # Step 1: Retrieve financial context from RAG
    rag_context = retrieve_financial_context(bot_id, message)

    # Step 2: Fetch live KPIs (most recent snapshot)
    live_kpis = _get_live_kpis(bot_id)

    # Step 2.5: Fetch Live Accounts Payable (Invoices & POs)
    live_invoices = _get_live_invoices(bot_id)
    live_pos = _get_live_pos(bot_id)

    # Step 2.6: Fetch Live Budgets
    live_budgets = _get_live_budgets(bot_id)

    # Step 3: Build the full prompt
    full_context = ""
    if rag_context:
        full_context += rag_context + "\n\n"
    if live_kpis:
        full_context += live_kpis + "\n\n"
    if live_invoices:
        full_context += live_invoices + "\n\n"
    if live_pos:
        full_context += live_pos + "\n\n"
    if live_budgets:
        full_context += live_budgets + "\n\n"

    # Step 4: Call the LLM
    response = _call_gemini(message, full_context, chat_history, agent_id)

    return response


def _get_live_kpis(bot_id: str) -> str:
    """Fetch the most recent KPI snapshot for real-time context."""
    try:
        kpi = KPISnapshot.objects.filter(bot_id=bot_id).order_by("-created_at").first()
        if not kpi:
            return ""

        return (
            f"LIVE KPI SNAPSHOT (Period: {kpi.period})\n"
            f"Revenue: ${kpi.total_revenue}\n"
            f"Expenses: ${kpi.total_expenses}\n"
            f"Net Profit: ${kpi.net_profit}\n"
            f"Profit Margin: {kpi.profit_margin}%\n"
            f"Burn Rate: ${kpi.burn_rate}/month\n"
            f"Runway: {kpi.runway_months} months"
        )
    except Exception as e:
        logger.error(f"Error fetching live KPIs: {e}")
        return ""

def _get_live_invoices(bot_id: str) -> str:
    """Fetch recent invoices to give the chatbot immediate context on AP workflows."""
    from api.models import Invoice
    try:
        invoices = Invoice.objects.filter(bot_id=bot_id).order_by("-uploaded_at")[:10]
        if not invoices.exists():
            return ""

        lines = ["RECENT ACCOUNTS PAYABLE INVOICES:"]
        for i in invoices:
            lines.append(f"- Vendor: {i.vendor_name} | Amount: ${float(i.total_amount):.2f} | Date: {i.date_issued} | Status: {i.status} | Fraud Score: {i.fraud_confidence_score}%")
        return "\n".join(lines)
    except Exception as e:
        logger.error(f"Error fetching live invoices for chat context: {e}")
        return ""

def _get_live_pos(bot_id: str) -> str:
    from api.models import PurchaseOrder
    try:
        pos = PurchaseOrder.objects.filter(bot_id=bot_id).order_by("-created_at")[:10]
        if not pos.exists(): return ""
        lines = ["RECENT PURCHASE ORDERS:"]
        for p in pos: lines.append(f"- PO #{p.po_number} | Vendor: {p.vendor_name} | Amount: ${float(p.expected_amount):.2f} | Status: {p.status}")
        return "\n".join(lines)
    except Exception as e: return ""

def _get_live_budgets(bot_id: str) -> str:
    from api.models import Budget
    try:
        budgets = Budget.objects.filter(bot_id=bot_id, is_active=True).order_by("-created_at")[:20]
        if not budgets.exists(): return ""
        lines = ["ACTIVE BUDGET ALLOCATIONS:"]
        for b in budgets: lines.append(f"- Category: {b.category} | Allocated: ${float(b.allocated_amount):.2f} | Month Focus: {b.month_year}")
        return "\n".join(lines)
    except Exception as e: return ""


def _call_gemini(message: str, context: str, chat_history: list = None, agent_id: str = "strategist") -> dict:
    """
    Call the Gemini API with the user message and financial context.
    This function is isolated so it can be swapped to another LLM provider.
    """
    try:
        from google import genai

        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            return _fallback_response("Gemini API key not configured.")

        client = genai.Client(api_key=api_key)

        # Build conversation
        system_prompt = AGENT_PROMPTS.get(agent_id, AGENT_PROMPTS["strategist"])
        prompt_parts = [system_prompt]

        if context:
            prompt_parts.append(f"\n{context}")

        if chat_history:
            for msg in chat_history[-6:]:  # Last 6 messages for context
                role = msg.get("role", "user")
                content = msg.get("content", "")
                prompt_parts.append(f"\n{role}: {content}")

        prompt_parts.append(f"\nUser: {message}")
        prompt_parts.append("\nRespond in valid JSON format as specified above.")

        full_prompt = "\n".join(prompt_parts)

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=full_prompt,
        )
        response_text = response.text

        # Try to parse JSON response
        try:
            # Clean potential markdown code blocks
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()

            parsed = json.loads(response_text)
            return {
                "answer": parsed.get("answer", response_text),
                "suggestedQuestions": parsed.get("suggestedQuestions", []),
            }
        except json.JSONDecodeError:
            # If JSON parsing fails, return raw text
            return {
                "answer": response.text,
                "suggestedQuestions": [],
            }

    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        return _fallback_response(str(e))


def _fallback_response(error: str) -> dict:
    """Return a graceful fallback when the LLM is unavailable."""
    return {
        "answer": (
            "I'm experiencing a temporary issue connecting to the AI service. "
            "Please try again in a moment. If this persists, check your API configuration."
        ),
        "suggestedQuestions": [
            "What are my current KPIs?",
            "Show me recent anomalies",
            "What's my revenue forecast?",
        ],
        "error": error,
    }
