import os
import json
import logging
from typing import Optional, List
from math import isclose
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

from api.models import Invoice, PurchaseOrder

logger = logging.getLogger(__name__)

# Define Pydantic schema for structured Gemini output
class LineItem(BaseModel):
    description: str
    amount: float

class InvoiceData(BaseModel):
    vendor_name: str
    invoice_number: Optional[str] = None
    total_amount: float
    tax_amount: Optional[float] = None
    date_issued: Optional[str] = Field(description="YYYY-MM-DD format")
    line_items: List[LineItem]
    fraud_confidence_score: int = Field(description="Percentage 0-100 indicating likelihood of fraud/tampering. 0 is perfectly safe. 100 is definitely fake.")
    fraud_flags: List[str] = Field(description="List of reasons for fraud score. E.g. 'Line items do not sum to total'. Be highly analytical.")
    additional_notes: Optional[str] = Field(description="Any extra text, contact info, shipping terms, promotions, payment instructions, or other details found on the document not captured in the other structured fields.")
    gl_code: str = Field(description="Auto-mapped General Ledger category based on the vendor or line items (e.g., 'Software Subscriptions', 'Travel & Entertainment', 'Legal Services', 'Office Supplies'). Choose a standard corporate GL code.")


def process_invoice_document(bot_id: str, file_path: str, mime_type: str, raw_bytes: bytes) -> dict:
    """
    Analyzes an invoice image/PDF using Gemini 2.5 Flash.
    Returns the parsed data and fraud flags, and saves it to the DB.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return {"error": "GEMINI_API_KEY environment variable not set."}

    client = genai.Client(api_key=api_key)

    prompt = (
        "You are an expert forensic accountant and document parser. "
        "Analyze this invoice deeply. Extract all required fields accurately. "
        "CRITICAL: Perform mathematical integrity checks! Do the line items and tax sum up exactly to the total? "
        "If not, raise the fraud_confidence_score significantly and add to fraud_flags. "
        "Look for any font mismatches, unusual alignment, or missing critical data."
    )

    try:
        # Build document part
        doc_part = types.Part.from_bytes(data=raw_bytes, mime_type=mime_type)

        # Call Gemini with Structured Output
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[prompt, doc_part],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=InvoiceData,
                temperature=0.1
            ),
        )

        response_text = response.text
        # Optional manual block cleaning just in case
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()

        parsed_data = json.loads(response_text)

        # Build DB model
        vendor_name = parsed_data.get("vendor_name", "Unknown Vendor")
        total_amount = parsed_data.get("total_amount", 0.0)
        date_issued = parsed_data.get("date_issued")
        invoice_number = parsed_data.get("invoice_number")
        
        # 1. Duplicate Detection Check
        # Same vendor, same amount, same date
        duplicates = Invoice.objects.filter(
            bot_id=bot_id,
            vendor_name__iexact=vendor_name,
            total_amount=total_amount,
            date_issued=date_issued
        )
        status_code = "pending_approval"
        flags = parsed_data.get("fraud_flags", [])
        fraud_score = parsed_data.get("fraud_confidence_score", 0)

        if duplicates.exists():
            status_code = "rejected"
            flags.append("DUPLICATE_DETECTED: An identical invoice (vendor/amount/date) already exists in the system.")
            fraud_score = max(fraud_score, 90)

        # 2. PO Matching Check
        matched_po = None
        if invoice_number:
            po = PurchaseOrder.objects.filter(bot_id=bot_id, po_number=invoice_number).first()
            if po:
                matched_po = po
                # 2-way match: Check Amount
                if not isclose(po.expected_amount, float(total_amount), rel_tol=0.01):
                    flags.append(f"PO_MISMATCH: Invoice amount ({total_amount}) differs from PO expected amount ({po.expected_amount}).")
                    fraud_score = max(fraud_score, 50)
                else:
                    if status_code == "pending_approval" and fraud_score < 30:
                        # Auto-Approve if perfectly matched and no fraud!
                        status_code = "approved"

        # 3. Autopilot: Auto-approve low-risk invoices under the configured threshold
        # Criteria: confidence score < 15%, no fraud flags, amount < $5,000
        AUTOPILOT_AMOUNT_THRESHOLD = float(os.environ.get("AUTOPILOT_AMOUNT_THRESHOLD", "5000"))
        autopilot_approved = False
        if (
            status_code == "pending_approval"
            and fraud_score < 15
            and len(flags) == 0
            and float(total_amount) < AUTOPILOT_AMOUNT_THRESHOLD
        ):
            status_code = "approved"
            autopilot_approved = True
            logger.info(f"[Autopilot] Auto-approved invoice from {vendor_name} for ${total_amount} (fraud_score={fraud_score})")

        # 4. Create Model
        invoice = Invoice.objects.create(
            bot_id=bot_id,
            vendor_name=vendor_name,
            invoice_number=invoice_number,
            total_amount=total_amount,
            tax_amount=parsed_data.get("tax_amount"),
            date_issued=date_issued,
            line_items=parsed_data.get("line_items", []),
            gl_code=parsed_data.get("gl_code", "Uncategorized"),
            matched_po=matched_po,
            fraud_confidence_score=fraud_score,
            fraud_flags=flags,
            additional_notes=parsed_data.get("additional_notes"),
            status=status_code,
            file_path=file_path
        )

        # Format and return for frontend to render in InvoiceAnalysisPanel.tsx
        return {
            "success": True,
            "invoice_id": invoice.id,
            "vendor_name": invoice.vendor_name,
            "total_amount": invoice.total_amount,
            "date_issued": invoice.date_issued,
            "fraud_score": invoice.fraud_confidence_score,
            "fraud_flags": invoice.fraud_flags,
            "status": invoice.status,
            "autopilot_approved": autopilot_approved,
            "gl_code": invoice.gl_code,
            "matched_po": matched_po.po_number if matched_po else None,
            "line_items": invoice.line_items,
            "additional_notes": invoice.additional_notes
        }

    except Exception as e:
        logger.error(f"Error processing invoice document: {e}")
        return {"error": str(e)}
