from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import login, authenticate, logout
from django.views.decorators.csrf import csrf_protect
from django.utils.timezone import now
from dateutil.relativedelta import relativedelta

from ..models import CustomUser, Receipt, Item
from ..serializer import UserSerializer

from ..methods import verifyPassword

@api_view(["POST"])
def create_user(request):
    try:
        email = request.data.get("email")
        username = request.data.get("username")
        password = request.data.get("password")

        #### BEGIN VERIFICATION ####
        if not email or not username or not password:
            return Response({"error": "Missing credentials"}, status=status.HTTP_400_BAD_REQUEST)
        
        email_exists = CustomUser.objects.filter(email=email).exists()
        if email_exists:
            return Response({"error": "This email is already in use."}, status=status.HTTP_409_CONFLICT)
        
        user_exists = CustomUser.objects.filter(username = username).exists()
        if user_exists:
            return Response({"error": "This username is already in use."}, status=status.HTTP_409_CONFLICT)
        
        passwordStatus, passwordError = verifyPassword(password)
        if not passwordStatus:
            return Response({"error": passwordError}, status=status.HTTP_400_BAD_REQUEST)
        #### END VERIFICATION ####

        user = UserSerializer(data=request.data)

        if user.is_valid():
            user.save()
            return Response({"success": True}, status=status.HTTP_201_CREATED)

        return Response({"error": user.errors}, status=status.HTTP_400_BAD_REQUEST)
    except:
        return Response({"error": "Internal server error, please try again later."},status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_protect
@api_view(["POST", "GET", "PUT", "DELETE"])
def user_view(request):
    try:   
        if request.method == "POST":
            username = request.data.get("username")
            password = request.data.get("password")

            if not username or not password:
                return Response({"error": "Missing fields."}, status=status.HTTP_406_NOT_ACCEPTABLE)
      
            user = authenticate(request, username=username, password=password)
           
            if user is None:
                return Response({"error": "User not found, please input correct credentials."},status=status.HTTP_404_NOT_FOUND)
       
            login(request,user)

            serialized = UserSerializer(user)
    
            return Response(data = serialized.data, status=status.HTTP_200_OK)

        elif request.method == "GET":
            if not request.user.is_authenticated:
                return Response({"error": "Unauthorized to access."}, status=status.HTTP_401_UNAUTHORIZED)
    
            serializer = UserSerializer(request.user)
         
            return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
            
        elif request.method == "PUT":
            if not request.user.is_authenticated:
                return Response(status=status.HTTP_401_UNAUTHORIZED)

        elif request.method == "DELETE":
            if not request.user.is_authenticated:
                return Response(status=status.HTTP_401_UNAUTHORIZED)
            request.user.delete()
            return Response({"message": "Account deleted successfully"},status=status.HTTP_204_NO_CONTENT)
      
    except:
        return Response({"error":"Internal server error, please try again later."},status=status.HTTP_400_BAD_REQUEST)
  
    
    return Response(data=serializer.data, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
@api_view(["GET"])
def figures(request):
    try:
        if not request.user or not request.user.is_authenticated:
            return Response({"error": "Please log in."}, status=status.HTTP_400_BAD_REQUEST)

        monthtime = now() - relativedelta(month=1)
        receipts = Receipt.objects.filter(user=request.user, created_at__gte=monthtime).all()
        items = Item.objects.filter(receipt__user=request.user)
    
        monthlysum = sum([receipt.total for receipt in receipts])
        totalsavingssum = sum([sum(item.stores_checked.values()) for item in items])
    
        return Response({"monthlyspent": monthlysum, "savings": totalsavingssum}, status=status.HTTP_200_OK)
    except:
        return Response({"error": "Internal server error, please try again later."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
def logout_view(request):

    if not request.user.is_authenticated:
        return Response(status=status.HTTP_401_UNAUTHORIZED)

    logout(request)
    
    return Response(status=status.HTTP_200_OK)