from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.middleware.csrf import get_token
from django_ratelimit.decorators import ratelimit
from django_ratelimit.exceptions import Ratelimited



@api_view(["GET"])
@ratelimit(key="ip", rate="5/s", block=True)
def get_csrftoken(request):
    try:
        token = get_token(request)

        return Response({"csrf_token":token}, status=status.HTTP_200_OK)
    except Ratelimited:
        return Response({"error": ""}, status=status.HTTP_429_TOO_MANY_REQUESTS)
    except Exception as e:
        print(str(e))
        return Response({"error": "Internal server error, please try again later."},status=status.HTTP_500_INTERNAL_SERVER_ERROR)