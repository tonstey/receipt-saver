from django.db import models
from django.contrib.auth.models import User, AbstractUser
from django.utils import timezone

import uuid

# Create your models here.

class CustomUser(AbstractUser):
    user_uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True) 
    num_receipts = models.IntegerField(default=0)

    def __str__(self) -> str:
        return self.username

class Receipt(models.Model):
    receipt_uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True) 
    receipt_number = models.PositiveIntegerField()
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="receipts")
    name = models.CharField(max_length=100, blank=True)
    store = models.CharField(max_length=100)
    address = models.CharField()
    date_purchased = models.DateTimeField(default=timezone.now)
    subtotal = models.FloatField()
    total = models.FloatField()
    tax = models.FloatField()
    taxpercent=models.FloatField()
    num_items = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)
    
    
class Item(models.Model):
    item_uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True) 
    item_number = models.PositiveIntegerField()
    receipt = models.ForeignKey(Receipt, on_delete=models.CASCADE, related_name="items")
    name = models.CharField(max_length = 100)
    quantity = models.IntegerField()
    price = models.FloatField()
    stores_checked = models.JSONField(default=dict, blank=True, null=True)
    last_updated = models.DateTimeField(auto_now=True)
    


