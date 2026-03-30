import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from django.db.models import Sum
from api.models import Transaction, Budget

def calculate_variance(bot_id, month_year):
    """
    Computes Budget vs Actual Variance for a given month.
    Aggregates transactions grouped by category and compares with active Budget entries.
    """
    # 1. Fetch active budgets for the month
    budgets = Budget.objects.filter(bot_id=bot_id, month_year=month_year, is_active=True)
    budget_map = {b.category: float(b.allocated_amount) for b in budgets}
    
    # 2. Fetch actuals (Transactions)
    # Parse month_year (e.g., "2026-03")
    try:
        year, month = map(int, month_year.split('-'))
        start_date = datetime(year, month, 1)
        end_date = start_date + relativedelta(months=1)
    except ValueError:
        return {"error": "Invalid month_year format. Use YYYY-MM."}

    actuals = Transaction.objects.filter(
        bot_id=bot_id,
        date__gte=start_date,
        date__lt=end_date
    ).values('category').annotate(total_spent=Sum('amount'))

    actual_map = {a['category']: float(a['total_spent']) for a in actuals}

    # 3. Combine into variance report
    all_categories = set(budget_map.keys()).union(set(actual_map.keys()))
    
    variance_report = []
    total_budget = 0.0
    total_actual = 0.0

    for category in all_categories:
        b_amount = budget_map.get(category, 0.0)
        a_amount = actual_map.get(category, 0.0)
        variance = b_amount - a_amount
        
        # Calculate percentage (prevent division by zero)
        variance_percent = 0.0
        if b_amount > 0:
            variance_percent = (variance / b_amount) * 100
        elif b_amount == 0 and a_amount > 0:
            variance_percent = -100.0 # 100% over budget
            
        variance_report.append({
            "category": category,
            "budgeted": b_amount,
            "actual": a_amount,
            "variance": variance,
            "variance_percent": round(variance_percent, 2),
            "status": "over" if variance < 0 else "under" if variance > 0 else "on_track"
        })
        
        total_budget += b_amount
        total_actual += a_amount

    total_variance = total_budget - total_actual
    total_variance_percent = 0.0
    if total_budget > 0:
        total_variance_percent = (total_variance / total_budget) * 100
    
    return {
        "month_year": month_year,
        "total_budget": total_budget,
        "total_actual": total_actual,
        "total_variance": total_variance,
        "total_variance_percent": round(total_variance_percent, 2),
        "details": variance_report
    }

def run_monte_carlo_simulation(bot_id, months_to_project=12, num_simulations=1000):
    """
    Uses Numpy to run Monte Carlo simulations on historical transactions
    to predict future cash flow percentiles (10th, 50th, 90th).
    """
    # 1. Fetch historical monthly expenses
    twelve_months_ago = datetime.now() - relativedelta(months=12)
    transactions = Transaction.objects.filter(
        bot_id=bot_id,
        date__gte=twelve_months_ago,
        amount__gt=0 # Assuming positive amounts are expenses in this context, or adjust based on your schema
    )
    
    if not transactions.exists():
        return {"error": "Not enough historical data to generate a simulation. Need at least 1 transaction."}
        
    df = pd.DataFrame(list(transactions.values('date', 'amount')))
    df['amount'] = df['amount'].astype(float)
    df['month'] = pd.to_datetime(df['date']).dt.to_period('M')
    
    monthly_data = df.groupby('month')['amount'].sum().reset_index()
    
    if len(monthly_data) < 2:
        # If we only have 1 month of data, mock a standard deviation
        mean_expense = monthly_data['amount'].mean()
        std_expense = mean_expense * 0.1 # 10% std dev fallback
    else:
        mean_expense = monthly_data['amount'].mean()
        std_expense = monthly_data['amount'].std()

    # 2. Run simulation
    # Ensure std_expense is not NaN or 0 in edge cases
    if pd.isna(std_expense) or std_expense == 0:
        std_expense = mean_expense * 0.05

    # Matrix: rows = simulations, cols = months projected
    # We use a normal distribution centered around the historical mean
    simulation_matrix = np.random.normal(
        loc=mean_expense, 
        scale=std_expense, 
        size=(num_simulations, months_to_project)
    )
    
    # 3. Aggregate results into percentiles
    p10 = np.percentile(simulation_matrix, 10, axis=0) # Best case (lowest expense)
    p50 = np.percentile(simulation_matrix, 50, axis=0) # Expected
    p90 = np.percentile(simulation_matrix, 90, axis=0) # Worst case (highest expense)
    
    future_months = [(datetime.now() + relativedelta(months=i)).strftime('%Y-%m') for i in range(1, months_to_project + 1)]
    
    results = []
    for i in range(months_to_project):
        results.append({
            "month_year": future_months[i],
            "p10_best_case": round(float(max(p10[i], 0)), 2), # Prevent negative expenses if normal dist dips
            "p50_expected": round(float(max(p50[i], 0)), 2),
            "p90_worst_case": round(float(max(p90[i], 0)), 2)
        })
        
    return {
        "status": "success",
        "bot_id": bot_id,
        "historical_mean": round(float(mean_expense), 2),
        "historical_std": round(float(std_expense), 2),
        "projections": results
    }
