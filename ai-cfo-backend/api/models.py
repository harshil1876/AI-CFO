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
    REVIEW_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('reviewed', 'Reviewed'),
        ('flagged', 'Flagged'),
        ('approved', 'Approved'),
    ]
    # Isolated by bot_id to ensure multi-tenancy
    bot_id = models.CharField(max_length=255, db_index=True)
    
    date = models.DateField(default=timezone.now)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=255)
    review_status = models.CharField(max_length=20, choices=REVIEW_STATUS_CHOICES, default='pending')
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
    
    # Sprint 11: Collaborative Resolution
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in-review', 'In Review'),
        ('resolved', 'Resolved')
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    assigned_to = models.CharField(max_length=255, blank=True, null=True) # Clerk user ID

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

# =====================================================
# Sprint 8: Invoice & AP Automation
# =====================================================

class PurchaseOrder(models.Model):
    bot_id = models.CharField(max_length=100)
    po_number = models.CharField(max_length=100)
    vendor_name = models.CharField(max_length=255)
    expected_amount = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(
        max_length=50, 
        choices=[
            ('open', 'Open'),
            ('fulfilled', 'Fulfilled'),
            ('cancelled', 'Cancelled')
        ],
        default='open'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('bot_id', 'po_number')

class Invoice(models.Model):
    bot_id = models.CharField(max_length=100)
    vendor_name = models.CharField(max_length=255)
    invoice_number = models.CharField(max_length=100, null=True, blank=True)
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    tax_amount = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    date_issued = models.DateField(null=True, blank=True)
    
    # AI Extracted Data
    line_items = models.JSONField(default=list, help_text="[{'description': '...', 'amount': 100}]")
    gl_code = models.CharField(max_length=100, null=True, blank=True)
    
    # Workflow & Risk
    matched_po = models.ForeignKey(PurchaseOrder, on_delete=models.SET_NULL, null=True, blank=True)
    fraud_confidence_score = models.IntegerField(default=0, help_text="0 to 100")
    fraud_flags = models.JSONField(default=list, help_text="List of reasons e.g., 'Math mismatch', 'Unregistered vendor'")
    
    status = models.CharField(
        max_length=50,
        choices=[
            ('pending_approval', 'Pending Approval'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
            ('paid', 'Paid')
        ],
        default='pending_approval'
    )
    additional_notes = models.TextField(null=True, blank=True, help_text="Any extra text, terms, or context extracted from the document.")
    file_path = models.CharField(max_length=500, null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.vendor_name} - {self.total_amount}"


class NotificationMeta(models.Model):
    """Tracks the last time a bot_id viewed their notifications context."""
    bot_id = models.CharField(max_length=255, unique=True, db_index=True)
    last_seen_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Meta [{self.bot_id}] — Last seen: {self.last_seen_at}"


# =====================================================
# Sprint 10: Financial Reporting & Dashboards
# =====================================================

class CategoryMapping(models.Model):
    """
    Caches the AI (Gemini) classification of raw transaction categories into standard accounting lines.
    Prevents repeated LLM calls for the same category string.
    """
    ACCOUNT_TYPES = [
        ('Revenue', 'Revenue'),
        ('COGS', 'Cost of Goods Sold (COGS)'),
        ('OPEX', 'Operating Expense (OPEX)'),
        ('Asset', 'Asset'),
        ('Liability', 'Liability'),
        ('Equity', 'Equity'),
        ('Other', 'Other/Ignored')
    ]

    bot_id = models.CharField(max_length=255, db_index=True)
    
    # The raw string found in a user's CSV or bank feed (e.g. "Stripe Payout", "AWS Cloud", "Uber Rides")
    raw_category = models.CharField(max_length=255)
    
    # The standardized accounting destination
    account_type = models.CharField(max_length=50, choices=ACCOUNT_TYPES, default='Other')
    
    # A cleaner, standard sub-category name generated by the AI (e.g., "Software Subscriptions")
    standardized_name = models.CharField(max_length=255, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('bot_id', 'raw_category')

    def __str__(self):
        return f"[{self.bot_id}] '{self.raw_category}' -> {self.account_type} ({self.standardized_name})"


# =====================================================
# Sprint 11: Enterprise RBAC, Audit Trails & Collaboration
# =====================================================

class UserFeaturePermission(models.Model):
    """
    Granular feature toggles overriding standard Clerk roles.
    Only editable by Organization Admins.
    """
    bot_id = models.CharField(max_length=255, db_index=True)
    user_id = models.CharField(max_length=255, db_index=True)  # Clerk User ID
    user_email = models.CharField(max_length=255, blank=True)
    
    # Granular Feature Access
    can_view_reports = models.BooleanField(default=True)
    can_upload_data = models.BooleanField(default=False)
    can_manage_budgets = models.BooleanField(default=False)
    can_manage_ap = models.BooleanField(default=False)
    can_run_simulations = models.BooleanField(default=False)
    
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('bot_id', 'user_id')

    def __str__(self):
        return f"{self.user_email} Permissions ({self.bot_id})"


class AuditEvent(models.Model):
    """
    Immutable Event Logger for SOC2 / Compliance tracking.
    """
    bot_id = models.CharField(max_length=255, db_index=True)
    user_id = models.CharField(max_length=255)
    user_email = models.CharField(max_length=255)
    
    action = models.CharField(max_length=255)  # e.g., "EXPORTED_PNL", "UPLOAD_BUDGET"
    resource_type = models.CharField(max_length=255, blank=True)  # e.g., "Report", "Transaction"
    resource_id = models.CharField(max_length=255, blank=True)
    details = models.TextField(blank=True)     # JSON string or generic context
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return f"[{self.timestamp}] {self.user_email} {self.action} {self.resource_type}"


class AnomalyComment(models.Model):
    """
    In-app discussion thread attached to specific Anomalies.
    """
    bot_id = models.CharField(max_length=255, db_index=True)
    anomaly = models.ForeignKey(AnomalyLog, on_delete=models.CASCADE, related_name='comments')
    
    user_id = models.CharField(max_length=255)
    user_email = models.CharField(max_length=255)
    
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.user_email} on Anomaly {self.anomaly.id}"

# ─────────────────────────────────────────────────────────────
# Sprint 15: Workspace Architecture & Org Features
# ─────────────────────────────────────────────────────────────

class Workspace(models.Model):
    """
    Sub-level isolation within a single Clerk Organization (bot_id).
    Allows an enterprise to have multiple isolated ledgers (e.g. US Branch, EU Branch).
    """
    STATUS_ACTIVE  = 'active'
    STATUS_PAUSED  = 'paused'
    STATUS_CLOSED  = 'closed'
    STATUS_CHOICES = [
        (STATUS_ACTIVE, 'Active'),
        (STATUS_PAUSED, 'Paused'),
        (STATUS_CLOSED, 'Closed'),
    ]

    org_id      = models.CharField(max_length=255, db_index=True)  # Clerk Org ID
    name        = models.CharField(max_length=255)
    entity_type = models.CharField(max_length=100, default='Corporate')
    description = models.TextField(blank=True, null=True)
    currency    = models.CharField(max_length=10, default='USD')
    region      = models.CharField(max_length=100, default='Asia-Pacific')

    # Sprint 16: full lifecycle status (replaces is_active boolean)
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ACTIVE)

    # Workspace isolation key (hashed, used for API-level RLS)
    secure_key  = models.CharField(max_length=128, blank=True, default='')

    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} (Org: {self.org_id}) [{self.status}]"



class GoalTarget(models.Model):
    """
    Drives the BI Radial KPI Widgets on the dashboard.
    """
    bot_id = models.CharField(max_length=255, db_index=True)
    workspace_id = models.CharField(max_length=255, blank=True, null=True)
    
    goal_name = models.CharField(max_length=255)  # e.g., "Q2 Revenue Goal"
    target_value = models.DecimalField(max_digits=15, decimal_places=2)
    period = models.CharField(max_length=50)      # e.g., "Q2-2026"
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.goal_name} - ${self.target_value}"


class OrgChatMessage(models.Model):
    """
    Real-time internal team discussion threads.
    """
    org_id = models.CharField(max_length=255, db_index=True)
    workspace_id = models.CharField(max_length=255, blank=True, null=True)
    
    user_id = models.CharField(max_length=255)
    user_name = models.CharField(max_length=255)
    user_avatar = models.TextField(blank=True, null=True)
    
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.user_name} at {self.created_at}"

class DeveloperAPIKey(models.Model):
    """
    API Keys for Developer Platform integration (external ingress).
    """
    bot_id = models.CharField(max_length=255, db_index=True)
    workspace_id = models.CharField(max_length=255, blank=True, null=True)
    
    name = models.CharField(max_length=100) # e.g., "Zapier Integration"
    prefix = models.CharField(max_length=15) # e.g., "cfo_live"
    # In a real system, the actual key is hashed, and only the first/last chars are kept
    hashed_key = models.CharField(max_length=128)
    is_active = models.BooleanField(default=True)
    last_used = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.prefix}...)"
