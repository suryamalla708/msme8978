from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

# Simple home view (prevents 500 error)
def home(request):
    return HttpResponse("Backend is running 🚀")

urlpatterns = [
    path('', home),                 # Root URL fix
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
