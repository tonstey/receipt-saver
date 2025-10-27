from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.middleware.csrf import get_token

@api_view(["GET"])
def get_csrftoken(request):
    token = get_token(request)

    return Response({"csrf_token":token}, status=status.HTTP_200_OK)