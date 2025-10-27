from django.urls import path
from . import views
from .views import views, user_views, receipt_views, item_views

urlpatterns = [
    path("csrf/", views.get_csrftoken),
    path("createuser/", user_views.create_user),
    path("user/", user_views.user_view),
    path("user/figures", user_views.figures),
    path("logout/", user_views.logout_view),
    path("createreceipt/", receipt_views.create_receipt),
    path("getreceipts/", receipt_views.get_receipts),
    path("receipt/<str:receipt_id>/", receipt_views.receipt_view),
    path("createitem/<str:receipt_id>/", item_views.create_item),
    path("getitems/<str:receipt_id>/", item_views.get_all_items),
    path("item/<str:item_id>/", item_views.item_view)
]
