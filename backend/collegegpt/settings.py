import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Security key and debug mode from .env
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key")
DEBUG = True # Keep True for development

ALLOWED_HOSTS = ["*"]  # Allow all hosts for development. Restrict in production.

# Installed apps
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework", # Ensure Django REST Framework is installed
    "chatbot",        # Your main app
    "corsheaders",    # For handling CORS
]

# Middleware
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware", # Must be very high up
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",  # Serve static files in production (if applicable)
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware", # Crucial for CSRF protection
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "collegegpt.urls"

# Templates
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [os.path.join(BASE_DIR, "templates")], # If you have project-level templates
        "APP_DIRS": True, # Look for templates inside app directories
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "collegegpt.wsgi.application"

# SQLite database
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# Static files configuration
STATIC_URL = '/static/'
# This is where Django will look for additional static files (e.g., project-wide static folder)
STATICFILES_DIRS = [
    #os.path.join(BASE_DIR, 'static'),
    os.path.join(BASE_DIR.parent, 'frontend', 'dist'), # Ensure this 'static' folder exists at your project root
]
# This is where `collectstatic` command will gather all static files for production deployment
STATIC_ROOT = BASE_DIR / "staticfiles" # Renamed to avoid confusion with STATICFILES_DIRS
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage" # For production serving

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Media files configuration (for user uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media') # Where uploaded files will be stored

LOGIN_URL = '/' # URL for login, used by login_required decorator

# CORS Configuration (for React frontend)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173", # Your React development server URL
    # Add other frontend origins if you have them (e.g., your production frontend URL)
]

CORS_ALLOW_CREDENTIALS = True # Crucial for allowing cookies (like CSRF token) across origins

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:8000",
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken', # IMPORTANT: Ensure this is included for CSRF
    'x-requested-with',
]

# backend/settings.py
CSRF_COOKIE_HTTPONLY = False # Ensure this is False if you are reading the cookie with JS