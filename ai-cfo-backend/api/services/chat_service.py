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


SYSTEM_PROMPT = """You are an Enterprise AI CFO — a highly intelligent financial advisor powered by real-time data.

Your role:
- Answer financial questions using the company's actual data provided in the FINANCIAL CONTEXT below.
- Provide actionable, data-driven recommendations.
- Explain complex financial concepts in a clear, professional manner.
- When asked about scenarios (e.g., "increase marketing by 20%"), provide projected impact analysis.
- Always cite specific numbers from the context when available.
- If the data doesn't cover the question, say so honestly.

Response format:
- Be concise but thorough (under 500 words).
- Use bullet points for clarity.
- Highlight critical numbers in bold when appropriate.

You must respond in valid JSON format:
{
    "answer": "Your detailed response here",
    "suggestedQuestions": ["Follow-up question 1", "Follow-up question 2", "Follow-up question 3"]
}"""


def chat_with_cfo(bot_id: str, message: str, chat_history: list = None) -> dict:
    """
    Process a chat message through the AI CFO pipeline.

    Args:
        bot_id: The company's bot instance ID.
        message: The user's chat message.
        chat_history: Optional list of previous messages for conversation context.

    Returns:
        A dict with 'answer' and 'suggestedQuestions'.
    """
    # Step 1: Retrieve financial context from RAG
    rag_context = retrieve_financial_context(bot_id, message)

    # Step 2: Fetch live KPIs (most recent snapshot)
    live_kpis = _get_live_kpis(bot_id)

    # Step 3: Build the full prompt
    full_context = ""
    if rag_context:
        full_context += rag_context + "\n\n"
    if live_kpis:
        full_context += live_kpis + "\n\n"

    # Step 4: Call the LLM
    response = _call_gemini(message, full_context, chat_history)

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


def _call_gemini(message: str, context: str, chat_history: list = None) -> dict:
    """
    Call the Gemini API with the user message and financial context.
    This function is isolated so it can be swapped to another LLM provider.
    """
    try:
        import google.generativeai as genai

        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            return _fallback_response("Gemini API key not configured.")

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.5-flash")

        # Build conversation
        prompt_parts = [SYSTEM_PROMPT]

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

        response = model.generate_content(full_prompt)
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
