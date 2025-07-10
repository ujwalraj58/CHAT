from django.contrib import admin
from django.urls import path, include, re_path # Import re_path for the catch-all route
from django.conf import settings
from chatbot.views import index 
from django.conf.urls.static import static
from django.views.generic import TemplateView # For serving the React app's index.html

urlpatterns = [
    # Django Admin URL
    path("admin/", admin.site.urls),
    path('', TemplateView.as_view(template_name='index.html')),
    # API Endpoints: All URLs starting with 'api/' are handled by your 'chatbot' app's urls.py
    path('api/', include('chatbot.urls')),
    path("", index),
    re_path(r"^(?!api/).*", index),
    path('', TemplateView.as_view(template_name='index.html')), 

    # Catch-all URL for serving the React Frontend's index.html
    # This pattern ensures that any URL not matched by the above Django patterns
    # will serve the React application. This is essential when Django acts as the
    # web server for the built React frontend (e.g., in production).
    # In development, Vite's dev server handles the frontend, but this setup
    # prepares for deployment.
    re_path(r'^(?:.*)/?$', TemplateView.as_view(template_name='index.html')),
]

# Serve static and media files during development.
# These lines should ONLY be used in DEBUG mode. In production, a dedicated web server
# like Nginx or Apache should serve static/media files.
if settings.DEBUG:
    # Serves media files (e.g., user uploads) from MEDIA_ROOT
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    
    # Serves static files (e.g., CSS, JS, images) from STATIC_ROOT or STATICFILES_DIRS
    # This is important if you're serving the built React app via Django,
    # as its static assets will be collected into STATIC_ROOT.
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

