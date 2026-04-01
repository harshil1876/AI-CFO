import os
import logging
from decimal import Decimal
from datetime import datetime
from django.db.models import Sum

from api.models import Transaction, CategoryMapping

logger = logging.getLogger(__name__)

def get_or_create_category_mapping(bot_id: str, raw_category: str) -> str:
    """
    Returns the standardized account_type (Revenue, COGS, OPEX, Asset, Liability, Equity, Other)
    for a given raw category. Uses Gemini for unknown categories.
    """
    if not raw_category:
        return 'Other'

    # Check database cache first (The Fast Lane)
    mapping = CategoryMapping.objects.filter(bot_id=bot_id, raw_category=raw_category).first()
    if mapping:
        return mapping.account_type

    # The Intelligent Lane - Ask Gemini
    try:
        from google import genai
        
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            logger.warning("GEMINI_API_KEY not set. Defaulting to 'OPEX' for unknown category.")
            return _save_mapping(bot_id, raw_category, "OPEX", "Uncategorized Expense")

        prompt = f"""You are an expert AI CFO. 
A company has a transaction category named: "{raw_category}". 
Classify this category strictly into one of the following exact types:
- Revenue
- COGS
- OPEX
- Asset
- Liability
- Equity
- Other

Also provide a short, professional standardized name for it.
Respond EXACTLY in this format: 
Type|StandardName
Example: OPEX|Software Subscriptions
"""
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        
        text = response.text.strip()
        parts = text.split('|')
        
        # Valid account types as defined in models.py
        valid_types = ['Revenue', 'COGS', 'OPEX', 'Asset', 'Liability', 'Equity', 'Other']
        account_type = parts[0].strip()
        if account_type not in valid_types:
            account_type = 'Other'
            
        standard_name = parts[1].strip() if len(parts) > 1 else raw_category
        
        return _save_mapping(bot_id, raw_category, account_type, standard_name)

    except Exception as e:
        logger.error(f"Gemini classification failed for '{raw_category}': {e}")
        return _save_mapping(bot_id, raw_category, "Other", raw_category)


def _save_mapping(bot_id: str, raw_category: str, account_type: str, standardized_name: str) -> str:
    CategoryMapping.objects.create(
        bot_id=bot_id,
        raw_category=raw_category,
        account_type=account_type,
        standardized_name=standardized_name
    )
    return account_type


def generate_pnl(bot_id: str, start_date=None, end_date=None) -> dict:
    """
    Generates a Profit and Loss statement structure based on Transactions mapped to Revenue, COGS, OPEX.
    """
    qs = Transaction.objects.filter(bot_id=bot_id)
    if start_date:
        qs = qs.filter(date__gte=start_date)
    if end_date:
        qs = qs.filter(date__lte=end_date)

    # Dictionary to hold subtotals
    pnl = {
        "Revenue": {"total": Decimal('0.0'), "items": {}},
        "COGS": {"total": Decimal('0.0'), "items": {}},
        "GrossMargin": Decimal('0.0'),
        "OPEX": {"total": Decimal('0.0'), "items": {}},
        "NetIncome": Decimal('0.0'),
    }

    # Aggregate by category string in db
    category_totals = qs.values('category').annotate(total=Sum('amount'))
    
    for item in category_totals:
        raw_cat = item['category']
        total_amt = item['total'] or Decimal('0.0')
        account_type = get_or_create_category_mapping(bot_id, raw_cat)
        
        # Determine standard name
        mapping = CategoryMapping.objects.filter(bot_id=bot_id, raw_category=raw_cat).first()
        std_name = mapping.standardized_name if mapping else raw_cat

        # Map to P&L section
        if account_type in ['Revenue', 'COGS', 'OPEX']:
            section = pnl[account_type]
            if std_name not in section["items"]:
                section["items"][std_name] = Decimal('0.0')
            
            # Assuming transactions positive = inflow, negative = outflow generally.
            # Convert to absolute values for the statement display, math handled accordingly.
            val = abs(total_amt)
            section["items"][std_name] += val
            section["total"] += val

    # Calculate Margins
    pnl["GrossMargin"] = pnl["Revenue"]["total"] - pnl["COGS"]["total"]
    pnl["NetIncome"] = pnl["GrossMargin"] - pnl["OPEX"]["total"]

    return _serialize_decimals(pnl)

def generate_cashflow(bot_id: str, start_date=None, end_date=None) -> dict:
    # Basic inferred cashflow implementation
    qs = Transaction.objects.filter(bot_id=bot_id)
    if start_date:
        qs = qs.filter(date__gte=start_date)
    if end_date:
        qs = qs.filter(date__lte=end_date)
        
    cf = {
        "OperatingActivities": {"net_cash": Decimal('0.0'), "inflows": Decimal('0.0'), "outflows": Decimal('0.0')},
        "InvestingActivities": {"net_cash": Decimal('0.0'), "inflows": Decimal('0.0'), "outflows": Decimal('0.0')},
        "FinancingActivities": {"net_cash": Decimal('0.0'), "inflows": Decimal('0.0'), "outflows": Decimal('0.0')},
        "NetCashFlow": Decimal('0.0')
    }
    
    category_totals = qs.values('category').annotate(total=Sum('amount'))
    for item in category_totals:
        raw_cat = item['category']
        amt = item['total'] or Decimal('0.0')
        account_type = get_or_create_category_mapping(bot_id, raw_cat)
        
        if account_type in ['Revenue', 'COGS', 'OPEX', 'Other']:
            act = cf['OperatingActivities']
        elif account_type == 'Asset':
            act = cf['InvestingActivities']
        elif account_type in ['Liability', 'Equity']:
            act = cf['FinancingActivities']
        else:
            act = cf['OperatingActivities']
            
        if amt > 0:
            act['inflows'] += amt
        else:
            act['outflows'] += abs(amt)
            
        act['net_cash'] += amt
        cf['NetCashFlow'] += amt

    return _serialize_decimals(cf)

def generate_balancesheet(bot_id: str, target_date=None) -> dict:
    # Cumulative data up to target date
    qs = Transaction.objects.filter(bot_id=bot_id)
    if target_date:
        qs = qs.filter(date__lte=target_date)
        
    bs = {
        "Assets": {"total": Decimal('0.0'), "items": {}},
        "Liabilities": {"total": Decimal('0.0'), "items": {}},
        "Equity": {"total": Decimal('0.0'), "items": {}},
        "RetainedEarnings": Decimal('0.0'),
        "LiabilitiesAndEquity": Decimal('0.0')
    }
    
    # Needs entire P&L net income up to date to get retained earnings
    pnl = generate_pnl(bot_id, end_date=target_date)
    bs['RetainedEarnings'] = Decimal(str(pnl['NetIncome']))
    
    category_totals = qs.values('category').annotate(total=Sum('amount'))
    for item in category_totals:
        raw_cat = item['category']
        amt = item['total'] or Decimal('0.0')
        account_type = get_or_create_category_mapping(bot_id, raw_cat)
        
        mapping = CategoryMapping.objects.filter(bot_id=bot_id, raw_category=raw_cat).first()
        std_name = mapping.standardized_name if mapping else raw_cat
        
        if account_type in ['Asset', 'Liability', 'Equity']:
            section = bs[account_type]
            if std_name not in section["items"]:
                section["items"][std_name] = Decimal('0.0')
            
            section["items"][std_name] += amt
            section["total"] += amt
            
    # Calculate Total L&E
    bs['Equity']['total'] += bs['RetainedEarnings'] 
    bs['LiabilitiesAndEquity'] = bs['Liabilities']['total'] + bs['Equity']['total']
    
    return _serialize_decimals(bs)

def _serialize_decimals(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, dict):
        return {k: _serialize_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [_serialize_decimals(v) for v in obj]
    return obj
