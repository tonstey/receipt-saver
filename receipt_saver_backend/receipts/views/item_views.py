from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from django.utils import timezone

from ..models import CustomUser, Receipt, Item
from ..serializer import ItemSerializer

@api_view(["POST"])
def create_item(request, receipt_id):
    try:
        if not request.user.is_authenticated or not request.user:
            return Response({"error": "Please log in."}, status=status.HTTP_401_UNAUTHORIZED)
        
        receipt = Receipt.objects.get(receipt_uuid = receipt_id) # Throws DoesNotExist exception

        if receipt.user != request.user:
            return Response({"error": "Not authorized to access this receipt"}, status=status.HTTP_403_FORBIDDEN)
    
        item = {
            "receipt": receipt.id,
            "name": "Unnamed Item",
            "quantity": 0,
            "price": 0.00,
        }
        item_serializer = ItemSerializer(data=item)

        if not item_serializer.is_valid():
            return Response({"error": "Error in creating item, please try again later"}, status=status.HTTP_400_BAD_REQUEST)
   
        item_serializer.save(receipt=receipt)
        receipt.last_updated = timezone.now()
        receipt.num_items += 1
        receipt.save()
        return Response({"success":True }, status=status.HTTP_201_CREATED)
    except Receipt.DoesNotExist:
        return Response({"error": "Receipt not found"}, status=status.HTTP_404_NOT_FOUND)
    except:
        return Response({"error":"Internal server error, please try again later."},status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
def get_all_items(request, receipt_id):
    try:
        if not request.user.is_authenticated or not request.user:
            return Response({"error": "Please log in."}, status=status.HTTP_401_UNAUTHORIZED)
        
        receipt = Receipt.objects.get(receipt_uuid = receipt_id) # Throws DoesNotExist exception

        if receipt.user != request.user:
            return Response({"error": "Not authorized to access this receipt"}, status=status.HTTP_403_FORBIDDEN)
        
        items = Item.objects.filter(receipt = receipt).order_by("-last_updated")
     
        items_serialized = ItemSerializer(items, many=True)
        
        return Response({"success": True, "data": items_serialized.data}, status=status.HTTP_200_OK)
    except Receipt.DoesNotExist:
        return Response({"error": "Searching respective receipt does not exist."}, status=status.HTTP_404_NOT_FOUND)
    except:
        return Response({"error":"Internal server error, please try again later."},status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET", "PUT", "DELETE"])
def item_view(request, item_id):
    try:
        
        if item_id is None:
            return Response({"error": "Missing item id."}, status=status.HTTP_400_BAD_REQUEST)
        if not request.user.is_authenticated or not request.user:
            return Response({"error": "Please log in."}, status=status.HTTP_401_UNAUTHORIZED)
       
        item = Item.objects.get(item_uuid=item_id)
        receipt = item.receipt
        user = receipt.user
        if user != request.user:
            return Response({"error": "Not authorized to edit this item."}, status=status.HTTP_401_UNAUTHORIZED)

        if request.method == "GET":
            item_data = request.data
            item = Item.objects.get(item_data)
            item_serialized = ItemSerializer(item)

            if not item_serialized.is_valid:
                return Response({"error": "Error receiving items."}, status=status.HTTP_400_BAD_REQUEST)

            return Response({"success":True, "data": item_serialized}, status=status.HTTP_200_OK)
        elif request.method == "PUT":
            item_data = request.data
  
            

            item_serializer = ItemSerializer(item, data = item_data, partial=True)
  
            if not item_serializer.is_valid():
                return Response({"error": "Invalid item data."}, status=status.HTTP_400_BAD_REQUEST)
            
            item_serializer.save()
       
            all_items = Item.objects.filter(receipt=receipt).all()
            receipt.subtotal = sum([items.price * items.quantity for items in all_items])
            receipt.tax = (receipt.taxpercent / 100.0) * receipt.subtotal
            receipt.total = receipt.subtotal + receipt.tax 
            receipt.last_updated = timezone.now()
            receipt.save()

            return Response({"success":True}, status=status.HTTP_200_OK)
        elif request.method == "DELETE":
         
            item.delete()

            all_items = Item.objects.filter(receipt=receipt).all()
            receipt.subtotal = sum([items.price * items.quantity for items in all_items])
            receipt.tax = (receipt.taxpercent / 100.0) * receipt.subtotal
            receipt.total = receipt.subtotal + receipt.tax 
            receipt.last_updated = timezone.now()

            receipt.num_items = len(all_items)
            receipt.save()

            return Response({"success": True}, status=status.HTTP_200_OK)

        return Response({"error": "Invalid method called."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    

    except Item.DoesNotExist:
        return Response({"error": "Item does not exist."}, status=status.HTTP_404_NOT_FOUND)
    except:

        return Response({"error":"Internal server error, please try again later."},status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    