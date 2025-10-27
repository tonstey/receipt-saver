from django.contrib import admin
from .models import CustomUser, Receipt, Item

# Register your models here.
admin.site.register(CustomUser)
admin.site.register(Receipt)
admin.site.register(Item)