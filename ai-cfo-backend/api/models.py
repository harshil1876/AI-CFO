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
