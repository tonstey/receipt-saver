from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status

from ..models import Receipt
from ..serializer import ReceiptSerializer, FileSerializer

from ..methods import read_receipt, ReceiptParser

@api_view(["GET"])
def get_receipts(request):
    try:
        if not request.user or not request.user.is_authenticated:
            return Response({"error": "Please log in."}, status=status.HTTP_400_BAD_REQUEST)
        
        limit = int(request.query_params.get("limit"))
        dateordertype = request.query_params.get("dateordertype")

        if not limit:
            limit = 10

        if not dateordertype:
            dateordertype = "last_updated"
        
        receipts = Receipt.objects.filter(user=request.user).order_by(f"-{dateordertype}").values("receipt_uuid","name","date_purchased","num_items","total")[0:limit] 

        return Response(receipts, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": "Internal server error, please try again later."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def create_receipt(request):
    try:
      if not request.user.is_authenticated:
              return Response({"error": "Please log in."}, status=status.HTTP_401_UNAUTHORIZED)
  ########## BEGIN FILE PROCESSING

      if "file" not in request.data:
          return Response({"error": "No existing file"}, status=status.HTTP_400_BAD_REQUEST)

      serializer = FileSerializer(data = request.data)

      if not serializer.is_valid():
          return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

      valid_file = request.FILES["file"]
    
      if valid_file.name.split(".")[-1].lower() not in ["jpg", "jpeg", "png", "pdf", "bmp", "tiff", "gif"]:
          return Response({"error": "Invalid file type, please input files in the form of jpg, jpeg, png, pdf, bmp, tiff, or gif."}, status=status.HTTP_400_BAD_REQUEST)

      if valid_file.size > 1024 * 1024:
          return Response({"error": "File size is too large."}, status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)
  ########## END FILE PROCESSING

  ########## BEGIN TEXT PROCESSING    
      image_text = read_receipt(valid_file)
      
      if not image_text["success"]:
          return Response({"error": "Unable to convert image to text, please try again later."}, status=status.HTTP_400_BAD_REQUEST)

      text = image_text["data"]
    
      receipt_parser = ReceiptParser()
    
      subtotal, tax, total = receipt_parser.extract_totals(text)
      
      receipt_input = {
          
      
          "name": "Unnamed Receipt",
          "store": receipt_parser.extract_store_name(text),
          "address": receipt_parser.extract_address(text),
          "date_purchased": receipt_parser.extract_date(text),
          "subtotal": subtotal,
          "tax": tax,
          "taxpercent": tax / total if total != 0 else 0,
          "total": total,
          
          "items": receipt_parser.extract_items(text)
      }
      receipt_input["num_items"] = len(receipt_input["items"])
  ########## END TEXT PROCESSING
    
      receipt = ReceiptSerializer(data = receipt_input, context={"request": request})

      if not receipt.is_valid():
          return Response({"error": "Invalid receipt data, please try again later."}, status=status.HTTP_400_BAD_REQUEST)

      receipt.save()

      request.user.num_receipts = Receipt.objects.filter(user = request.user).count()
      request.user.save()
      return Response(receipt.data,status=status.HTTP_201_CREATED)
    
     
    except:
        return Response({"error":"Internal server error, please try again later."},status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET", "PUT", "DELETE"])
def receipt_view(request, receipt_id):
    try:
        if not request.user.is_authenticated:
                return Response({"error": "Please log in."}, status=status.HTTP_401_UNAUTHORIZED)
        if receipt_id is None:
            return Response({"error":"Missing receipt id."}, status=status.HTTP_400_BAD_REQUEST)
        
        receipt = Receipt.objects.get(receipt_uuid = receipt_id)
        if receipt.user != request.user:
            return Response({"error": "Not authorized to access this receipt"}, status=status.HTTP_403_FORBIDDEN)
        if not receipt:
            return Response({"error": "Receipt not found"}, status=status.HTTP_404_NOT_FOUND)

        # BEGIN METHODS
        if request.method == "GET":
            receipt_serializer = ReceiptSerializer(receipt)
            
            return Response(receipt_serializer.data, status=status.HTTP_200_OK)
        
        elif request.method == "PUT":
            edit_receipt = request.data
 
            receipt_serializer = ReceiptSerializer(receipt, data=edit_receipt, partial=True)
      
            if not receipt_serializer.is_valid():
                return Response({"error": "Invalid receipt information"}, status=status.HTTP_400_BAD_REQUEST)
  
            receipt_serializer.save()

            return Response(receipt_serializer.data, status=status.HTTP_200_OK)
        
        elif request.method == "DELETE":
            receipt.delete()  
            request.user.num_receipts = Receipt.objects.filter(user = request.user).count()

            request.user.save()
            return Response({"success": True},status=status.HTTP_200_OK)
        
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
    except Receipt.DoesNotExist:
        return Response({"error": "Receipt not found"}, status=status.HTTP_404_NOT_FOUND)

    except:
   
        return Response({"error":"Internal server error, please try again later."},status=status.HTTP_500_INTERNAL_SERVER_ERROR)
