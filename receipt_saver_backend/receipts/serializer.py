from rest_framework import serializers
from django.contrib.auth.hashers import make_password

from .models import CustomUser, Receipt, Item


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    user_uuid = serializers.UUIDField(read_only=True)
    num_receipts = serializers.IntegerField(default=0)
    
    class Meta:
        model = CustomUser
        fields = ["id", "username", "email", "password", "user_uuid", "num_receipts"]

    def create(self, data):
        password = data.pop("password")
        user = CustomUser(**data)
        user.set_password(password)
        user.save()
        return user

class ItemSerializer(serializers.ModelSerializer):
    item_number=serializers.IntegerField(read_only=True)
    id = serializers.IntegerField(required=False)
    class Meta:
        model = Item
        fields = "__all__"
    def create(self, validated_data):

        receipt = validated_data["receipt"]
        last_item = Item.objects.filter(receipt=receipt).order_by("-item_number").first()
        next_number = last_item.item_number + 1 if last_item else 1

        item = Item.objects.create(item_number=next_number, **validated_data)
        item.name = item.name + f" ({next_number})"
        item.save()
        return item

class ReceiptSerializer(serializers.ModelSerializer):
    receipt_number = serializers.IntegerField(read_only=True)
    user=serializers.PrimaryKeyRelatedField(read_only=True)
    items = ItemSerializer(many=True)
    class Meta:
        model = Receipt
        fields = "__all__"

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        user = self.context["request"].user

        last_receipt = Receipt.objects.filter(user = user).order_by("-receipt_number").first()
        next_number = last_receipt.receipt_number + 1 if last_receipt else 1

        receipt = Receipt.objects.create(user=user, receipt_number=next_number, **validated_data)
        receipt.name = receipt.name + f" ({next_number})"
        receipt.save()
        for item_data in items_data:
            item = Item.objects.create(receipt=receipt, **item_data)
            item.save()

        return receipt
    
    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
  
        if items_data is not None:
            for item_data in items_data:
                item_id = item_data.get("id")
                if item_id:
                    try:
                        # Update existing item
                        item_instance = instance.items.get(id=item_id)
                        for attr, value in item_data.items():
                            if attr != "id" and attr != "receipt":
                                setattr(item_instance, attr, value)
                        item_instance.save()
                    except Item.DoesNotExist:
                        # If item doesn't exist, create it
                        item_data.pop("id", None)
                        Item.objects.create(receipt=instance, **item_data)
                else:
                    # If no ID provided, create new item
                    Item.objects.create(receipt=instance, **item_data)

        if hasattr(instance, "subtotal") and hasattr(instance, "taxpercent"):
            instance.tax = instance.subtotal * instance.taxpercent /100.0
            instance.total = instance.subtotal + instance.tax
            instance.save(update_fields=["tax", "total"])


        return instance

class FileSerializer(serializers.Serializer):
    file = serializers.FileField()
