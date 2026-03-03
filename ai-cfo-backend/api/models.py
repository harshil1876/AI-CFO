from django.db import models
from django.utils import timezone

class Transaction(models.Model):
    # Isolated by bot_id to ensure multi-tenancy
    bot_id = models.CharField(max_length=255, db_index=True)
    
    date = models.DateField(default=timezone.now)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.date} - {self.category} - ${self.amount}"

class DepartmentData(models.Model):
    # Isolated by bot_id to ensure multi-tenancy
    bot_id = models.CharField(max_length=255, db_index=True)
    
    department_name = models.CharField(max_length=255)
    budget = models.DecimalField(max_digits=15, decimal_places=2)
    actual_spend = models.DecimalField(max_digits=15, decimal_places=2)
    month_year = models.CharField(max_length=7) # e.g. "2026-03"
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.department_name} ({self.month_year}) - Spent: ${self.actual_spend}"


class KPISnapshot(models.Model):
    """Stores computed KPI metrics per bot per period."""
    bot_id = models.CharField(max_length=255, db_index=True)

    period = models.CharField(max_length=7)  # e.g. "2026-03"
    total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    net_profit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    profit_margin = models.DecimalField(max_digits=6, decimal_places=2, default=0)  # percentage
    burn_rate = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    runway_months = models.DecimalField(max_digits=6, decimal_places=1, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"KPI [{self.bot_id}] {self.period} — Margin: {self.profit_margin}%"


class ForecastResult(models.Model):
    """Stores Prophet forecasting output per bot."""
    bot_id = models.CharField(max_length=255, db_index=True)

    forecast_date = models.DateField()
    predicted_revenue = models.DecimalField(max_digits=15, decimal_places=2)
    predicted_expenses = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    lower_bound = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    upper_bound = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Forecast [{self.bot_id}] {self.forecast_date} — ${self.predicted_revenue}"


class AnomalyLog(models.Model):
    """Stores Isolation Forest anomaly detection results."""
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    bot_id = models.CharField(max_length=255, db_index=True)

    detected_at = models.DateTimeField(auto_now_add=True)
    category = models.CharField(max_length=255)
    description = models.TextField()
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='medium')
    amount = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    is_resolved = models.BooleanField(default=False)

    def __str__(self):
        return f"Anomaly [{self.bot_id}] {self.severity.upper()} — {self.category}"


class Recommendation(models.Model):
    """Stores prescriptive logic output."""
    PRIORITY_CHOICES = [
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('action', 'Action Required'),
    ]

    bot_id = models.CharField(max_length=255, db_index=True)

    title = models.CharField(max_length=500)
    detail = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='info')
    related_kpi = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Rec [{self.bot_id}] {self.priority.upper()} — {self.title}"
