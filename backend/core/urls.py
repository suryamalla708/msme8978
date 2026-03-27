import os
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.static import serve

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# SPA static files and catch-all
urlpatterns += [
    re_path(r'^assets/(?P<path>.*)$', serve, {
        'document_root': os.path.join(settings.BASE_DIR.parent, 'frontend', 'dist', 'assets')
    }),
    # Match other root files like favicon.svg
    re_path(r'^(?P<path>favicon\.svg)$', serve, {
        'document_root': os.path.join(settings.BASE_DIR.parent, 'frontend', 'dist')
    }),
    # Catch-all for React Router
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]
