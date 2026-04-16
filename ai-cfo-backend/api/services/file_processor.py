"""
File Processing Service
Handles arbitrary file uploads (CSV, Excel, JSON, etc.)
Uses pandas for local parsing and Gemini for AI-powered analysis.
Falls back to Hugging Face if Gemini rate limit is hit.
"""
import os
import io
import json
import logging
import time
from decimal import Decimal
from datetime import datetime
from pathlib import Path
from django.conf import settings
from django.utils import timezone
from api.models import UploadedFile, ParsedRecord, Transaction, DepartmentData

logger = logging.getLogger(__name__)

# Upload directory
UPLOAD_DIR = Path(settings.BASE_DIR) / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


def save_uploaded_file(file_obj, bot_id: str) -> UploadedFile:
    """
    Save an uploaded file to disk and create a tracking record.

    Args:
        file_obj: Django's UploadedFile object from the request.
        bot_id: The company's bot instance ID.

    Returns:
        UploadedFile model instance.
    """
    # Determine file type
    filename = file_obj.name
    extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else "unknown"

    # Create bot-specific upload directory
    bot_upload_dir = UPLOAD_DIR / bot_id
    bot_upload_dir.mkdir(exist_ok=True)

    # Save file with timestamp to avoid overwrites
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_filename = f"{timestamp}_{filename}"
    file_path = bot_upload_dir / safe_filename

    with open(file_path, "wb") as f:
        for chunk in file_obj.chunks():
            f.write(chunk)

    # Create tracking record
    upload = UploadedFile.objects.create(
        bot_id=bot_id,
        original_filename=filename,
        file_type=extension,
        file_size=file_obj.size,
        file_path=str(file_path),
        status="pending",
    )

    logger.info(f"File saved: {filename} ({extension}) for bot={bot_id}")
    return upload


def process_file(upload_id: int) -> dict:
    """
    Process an uploaded file: parse with pandas, classify with Gemini.

    Args:
        upload_id: The ID of the UploadedFile record.

    Returns:
        A dictionary with processing results.
    """
    upload = UploadedFile.objects.get(id=upload_id)
    upload.status = "processing"
    upload.save()

    try:
        # Step 1: Read file into DataFrame using pandas
        df = _read_file_to_dataframe(upload)

        if df is None or df.empty:
            upload.status = "failed"
            upload.error_message = "Could not read file or file is empty."
            upload.save()
            return {"status": "failed", "error": upload.error_message}

        upload.row_count = len(df)

        # Step 2: Detect schema (column names, types, sample values)
        schema = _detect_schema(df)
        upload.detected_schema = schema

        # Step 3: Use Gemini to generate an AI summary of the data
        ai_summary = _generate_ai_summary(df, schema, upload.original_filename)
        upload.ai_summary = ai_summary

        # Step 4: Store all rows as flexible ParsedRecords
        _store_parsed_records(df, upload)
        
        # Step 4.5: If it looks like a financial ledger, map it to Transactions
        try:
            _auto_populate_ledger(df, upload.bot_id)
        except Exception as e:
            logger.error(f"Ledger auto-populate warning: {e}")

        upload.status = "completed"
        upload.processed_at = timezone.now()
        upload.save()

        logger.info(f"File processed successfully: {upload.original_filename} ({upload.row_count} rows)")

        return {
            "status": "completed",
            "file_id": upload.id,
            "filename": upload.original_filename,
            "row_count": upload.row_count,
            "detected_schema": schema,
            "ai_summary": ai_summary,
        }

    except Exception as e:
        upload.status = "failed"
        upload.error_message = str(e)
        upload.save()
        logger.error(f"File processing failed: {upload.original_filename} — {e}")
        return {"status": "failed", "error": str(e)}


def _read_file_to_dataframe(upload: UploadedFile):
    """Read any supported file format into a pandas DataFrame."""
    import pandas as pd
    file_path = upload.file_path
    ext = upload.file_type.lower()

    try:
        if ext == "csv":
            return pd.read_csv(file_path)
        elif ext in ("xlsx", "xls"):
            return pd.read_excel(file_path)
        elif ext == "json":
            return pd.read_json(file_path)
        elif ext == "tsv":
            return pd.read_csv(file_path, sep="\t")
        else:
            logger.warning(f"Unsupported file type: {ext}")
            return None
    except Exception as e:
        logger.error(f"Error reading file {file_path}: {e}")
        return None


def _detect_schema(df) -> dict:
    """
    Auto-detect column types and sample values from a DataFrame.
    """
    import pandas as pd
    schema = {"columns": []}

    for col in df.columns:
        col_info = {
            "name": str(col),
            "dtype": str(df[col].dtype),
            "non_null_count": int(df[col].notna().sum()),
            "null_count": int(df[col].isna().sum()),
            "sample_values": [str(v) for v in df[col].dropna().head(3).tolist()],
        }

        # Try to classify column semantics
        col_lower = str(col).lower()
        if any(kw in col_lower for kw in ["date", "time", "year", "month", "day"]):
            col_info["semantic_type"] = "datetime"
        elif any(kw in col_lower for kw in ["amount", "price", "cost", "revenue",
                                              "salary", "expense", "budget", "spend",
                                              "total", "balance", "payment", "fee"]):
            col_info["semantic_type"] = "monetary"
        elif any(kw in col_lower for kw in ["category", "type", "department", "group",
                                              "class", "sector", "division"]):
            col_info["semantic_type"] = "category"
        elif any(kw in col_lower for kw in ["name", "description", "note", "comment",
                                              "detail", "memo", "remark"]):
            col_info["semantic_type"] = "text"
        elif any(kw in col_lower for kw in ["id", "code", "number", "ref"]):
            col_info["semantic_type"] = "identifier"
        else:
            col_info["semantic_type"] = "unknown"

        schema["columns"].append(col_info)

    schema["total_rows"] = len(df)
    schema["total_columns"] = len(df.columns)
    return schema


def _generate_ai_summary(df, schema: dict, filename: str) -> str:
    """
    Use Gemini to generate an intelligent summary of the uploaded data.
    """
    import pandas as pd
    # Build a concise data preview for Gemini
    preview_rows = df.head(5).to_string(index=False)
    stats = df.describe(include="all").to_string()

    prompt = f"""You are an AI CFO assistant analyzing uploaded financial data.

File: {filename}
Total Rows: {schema['total_rows']}
Columns: {json.dumps([c['name'] for c in schema['columns']])}

Data Preview (first 5 rows):
{preview_rows}

Statistics:
{stats}

Provide a concise financial summary:
1. What type of financial data is this? (e.g., transactions, payroll, P&L, budget)
2. What time period does it cover?
3. Key observations (trends, totals, notable values)
4. Any data quality issues?

Keep your response under 300 words."""

    try:
        from google import genai

        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            logger.warning("GEMINI_API_KEY not set, using local summary fallback")
            return _local_summary_fallback(df, schema, filename)

        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        return response.text

    except Exception as e:
        logger.warning(f"Gemini API failed: {e}. Using local summary fallback.")
        return _local_summary_fallback(df, schema, filename)


def _local_summary_fallback(df, schema: dict, filename: str) -> str:
    """Generate a basic summary without any API call."""
    import pandas as pd
    monetary_cols = [c["name"] for c in schema["columns"] if c["semantic_type"] == "monetary"]
    date_cols = [c["name"] for c in schema["columns"] if c["semantic_type"] == "datetime"]

    summary_parts = [
        f"File: {filename}",
        f"Rows: {schema['total_rows']}, Columns: {schema['total_columns']}",
    ]

    if monetary_cols:
        for col in monetary_cols:
            try:
                values = pd.to_numeric(df[col], errors="coerce")
                summary_parts.append(
                    f"  {col}: Total={values.sum():.2f}, "
                    f"Mean={values.mean():.2f}, Min={values.min():.2f}, Max={values.max():.2f}"
                )
            except Exception:
                pass

    if date_cols:
        for col in date_cols:
            try:
                dates = pd.to_datetime(df[col], errors="coerce")
                summary_parts.append(
                    f"  {col}: Range {dates.min()} to {dates.max()}"
                )
            except Exception:
                pass

    return "\n".join(summary_parts)


def _store_parsed_records(df, upload: UploadedFile):
    """Store all DataFrame rows as flexible ParsedRecord entries."""
    import pandas as pd
    records = []
    for idx, row in df.iterrows():
        # Convert row to dict, handling non-serializable types
        row_data = {}
        for col, val in row.items():
            if pd.isna(val):
                row_data[str(col)] = None
            elif isinstance(val, (pd.Timestamp, datetime)):
                row_data[str(col)] = str(val)
            elif isinstance(val, Decimal):
                row_data[str(col)] = float(val)
            else:
                row_data[str(col)] = val

        records.append(ParsedRecord(
            bot_id=upload.bot_id,
            source_file=upload,
            row_index=idx,
            data=row_data,
        ))

    # Bulk create for performance
    ParsedRecord.objects.bulk_create(records, batch_size=500)
    logger.info(f"Stored {len(records)} parsed records for file={upload.original_filename}")


def _auto_populate_ledger(df, bot_id: str):
    """
    Attempts to map standard CSV columns (Date, Amount, Category, Vendor/Description, Department)
    directly into the core Transaction and DepartmentData tables.
    """
    import pandas as pd
    cols_lower = {str(c).lower(): str(c) for c in df.columns}
    
    # Needs at least a Date and an Amount column
    date_col = cols_lower.get('date')
    amount_col = cols_lower.get('amount') or cols_lower.get('amount_inr') or cols_lower.get('value')
    
    if not date_col or not amount_col:
        return

    cat_col = cols_lower.get('category') or cols_lower.get('type')
    desc_col = cols_lower.get('vendor') or cols_lower.get('description')
    dept_col = cols_lower.get('department')

    transactions_to_create = []
    department_map = {} # (dept_name, month_year) -> spend

    for idx, row in df.iterrows():
        # Parse Date
        try:
            raw_date = pd.to_datetime(row[date_col]).date()
        except Exception:
            continue
            
        # Parse Amount
        try:
            amt_val = float(str(row[amount_col]).replace(',', ''))
            amt = Decimal(str(amt_val))
        except Exception:
            continue
            
        cat = str(row[cat_col]) if cat_col and pd.notna(row[cat_col]) else "Uncategorized"
        desc = str(row[desc_col]) if desc_col and pd.notna(row[desc_col]) else ""
        
        transactions_to_create.append(Transaction(
            bot_id=bot_id,
            date=raw_date,
            amount=amt,
            category=cat,
            description=desc,
            review_status='reviewed'
        ))
        
        # Track Department spend
        if dept_col and pd.notna(row[dept_col]):
            dept = str(row[dept_col])
            month_year = raw_date.strftime("%Y-%m")
            key = (dept, month_year)
            if key not in department_map:
                department_map[key] = Decimal("0")
            
            # Usually only negative amounts (expenses) are considered "actual spend" against a budget
            if amt < 0:
                department_map[key] += abs(amt)
                
    # Bulk create transactions
    if transactions_to_create:
        Transaction.objects.bulk_create(transactions_to_create, batch_size=500)
        logger.info(f"Auto-populated {len(transactions_to_create)} Transactions for bot={bot_id}")
        
    # Bulk create or update Department data
    for (dept_name, month_year), spend in department_map.items():
        dept_obj, created = DepartmentData.objects.get_or_create(
            bot_id=bot_id,
            department_name=dept_name,
            month_year=month_year,
            defaults={'budget': spend * Decimal('1.2'), 'actual_spend': spend}
        )
        if not created:
            dept_obj.actual_spend += spend
            dept_obj.save()
            
