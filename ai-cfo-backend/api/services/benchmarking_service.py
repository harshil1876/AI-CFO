import logging

logger = logging.getLogger(__name__)

# Static Benchmark Data for standard SaaS/Retail
BENCHMARKS = {
    "software": {
        "gross_margin": 80.0,
        "net_profit_margin": 20.0,
        "revenue_growth_yoy": 35.0,
        "cac_payback_months": 15.0
    },
    "retail": {
        "gross_margin": 45.0,
        "net_profit_margin": 5.0,
        "revenue_growth_yoy": 10.0,
        "inventory_turnover": 8.0
    }
}

def get_benchmarks(industry: str = "software") -> dict:
    """Returns static benchmark targets for contextual analysis."""
    return BENCHMARKS.get(industry, BENCHMARKS["software"])

def compare_kpis_to_benchmark(bot_id: str, kpis: dict, industry: str = "software") -> list:
    """
    Compares live KPIs against industry benchmarks.
    Returns a list of variance reports.
    """
    benchmarks = get_benchmarks(industry)
    comparisons = []
    
    pm = kpis.get("profit_margin", 0)
    target_pm = benchmarks["net_profit_margin"]
    
    comparisons.append({
        "metric": "Net Profit Margin",
        "current": pm,
        "benchmark": target_pm,
        "variance": round(pm - target_pm, 2),
        "status": "above" if pm >= target_pm else "below"
    })
    
    return comparisons
    
