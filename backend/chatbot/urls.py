# chatbot/urls.py
from django.urls import path
from . import views # Import your views from views.py

urlpatterns = [
    # API endpoints specific to the chatbot app
    path('login/', views.login_view, name='login'),
    path('upload/', views.upload_file_view, name='upload_file'),
    path('upload/delete/<str:filename>/', views.delete_file_view, name='delete_file'),
    path('chat/', views.chat_view, name='chat'),
    path('reminders/', views.ReminderAPI.as_view(), name='reminders'),
    path('history/', views.view_history, name='history'),

    # New endpoint to explicitly get CSRF token
    path('get-csrf-token/', views.get_csrf_token, name='get_csrf_token'),
]
