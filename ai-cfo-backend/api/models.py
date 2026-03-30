from django.db import models
from django.utils import timezone


class UploadedFile(models.Model):
    """Tracks any file uploaded by a company. Supports CSV, Excel, PDF, JSON, etc."""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    bot_id = models.CharField(max_length=255, db_index=True)

    original_filename = models.CharField(max_length=500)
    file_type = models.CharField(max_length=50)  # csv, xlsx, pdf, json, etc.
    file_size = models.IntegerField(default=0)  # bytes
    file_path = models.TextField()  # storage path (local or Azure Blob)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    detected_schema = models.JSONField(null=True, blank=True)  # AI-detected column mapping
    row_count = models.IntegerField(default=0)
    ai_summary = models.TextField(blank=True, null=True)  # Gemini-generated file summary
    error_message = models.TextField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"[{self.bot_id}] {self.original_filename} ({self.status})"


class ParsedRecord(models.Model):
    """Flexible key-value records extracted from any uploaded file."""
    bot_id = models.CharField(max_length=255, db_index=True)
    source_file = models.ForeignKey(UploadedFile, on_delete=models.CASCADE, related_name='records')

    row_index = models.IntegerField(default=0)
    data = models.JSONField()  # The actual row data as {column: value} pairs
    record_type = models.CharField(max_length=100, blank=True, null=True)  # AI-classified type
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Record [{self.bot_id}] row={self.row_index} type={self.record_type}"


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


# =====================================================
# Sprint 6: Data Integration Layer
# =====================================================

class DataSource(models.Model):
    """Stores credentials/config for external data connectors per organization."""
    SOURCE_TYPES = [
        ('tally', 'Tally Prime'),
        ('razorpay', 'Razorpay'),
        ('google_sheets', 'Google Sheets'),
        ('zoho', 'Zoho Books'),
        ('manual_csv', 'Manual CSV Upload'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('error', 'Error'),
    ]

    bot_id = models.CharField(max_length=255, db_index=True)
    source_type = models.CharField(max_length=50, choices=SOURCE_TYPES)
    display_name = models.CharField(max_length=255)  # e.g. "My Razorpay Production"
    config = models.JSONField(default=dict)  # Encrypted credentials/config per connector
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    last_synced_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('bot_id', 'source_type', 'display_name')

    def __str__(self):
        return f"[{self.bot_id}] {self.get_source_type_display()} — {self.display_name}"


class ConnectorSyncLog(models.Model):
    """Audit log for every sync run per DataSource."""
    STATUS_CHOICES = [
        ('success', 'Success'),
        ('partial', 'Partial'),
        ('failed', 'Failed'),
    ]

    data_source = models.ForeignKey(DataSource, on_delete=models.CASCADE, related_name='sync_logs')
    bot_id = models.CharField(max_length=255, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    records_fetched = models.IntegerField(default=0)
    records_inserted = models.IntegerField(default=0)
    error_message = models.TextField(blank=True, null=True)
    currency_used = models.CharField(max_length=10, default='INR')  # Multi-currency
    exchange_rate = models.DecimalField(max_digits=12, decimal_places=6, default=1.0)  # to INR
    synced_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Sync [{self.bot_id}] {self.data_source.source_type} — {self.status} @ {self.synced_at}"

# =====================================================
# Sprint 7: Advanced Budgeting & Forecasting
# =====================================================

class Budget(models.Model):
    """Stores budgeted amounts for either general Revenue/Expenses or specific Departmental Categories."""
    bot_id = models.CharField(max_length=255, db_index=True)
    
    # "expense", "revenue", or a specific department/category name
    category = models.CharField(max_length=255) 
    
    allocated_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    month_year = models.CharField(max_length=7) # e.g. "2026-03"
    
    # Version control (e.g. 1 = drafted, 2 = revised)
    version = models.IntegerField(default=1)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Only one active version per category per month per bot
        constraints = [
            models.UniqueConstraint(
                fields=['bot_id', 'month_year', 'category'],
                condition=models.Q(is_active=True),
                name='unique_active_budget'
            )
        ]

    def __str__(self):
        return f"Budget [{self.bot_id}] {self.month_year} - {self.category}: ${self.allocated_amount} (v{self.version})"
