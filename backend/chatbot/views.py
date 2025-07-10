import os
import json
import fitz # For PDF parsing
from docx import Document # For DOCX parsing
from django.shortcuts import render
from django.conf import settings
from django.views import View
from django.http import JsonResponse, HttpResponse, Http404 # Import HttpResponse for specific cases
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt # <--- ADD THIS IMPORT LINE
from django.core.files.storage import default_storage
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.middleware.csrf import get_token # Import get_token
from django.views.generic import TemplateView
from .models import Reminder, ChatMessage
from .langchain_rag import get_answer

def index(request):
    file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', 'dist', 'index.html')
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return HttpResponse(f.read())
    except FileNotFoundError:
        raise Http404("index.html not found, please build frontend first.")


# --- New View to get CSRF Token ---
# This view is explicitly exempt because its sole purpose is to provide the token
# for cross-origin requests, which are handled by CORS and the token itself.
@csrf_exempt
def get_csrf_token(request):
    """
    Returns the CSRF token as a JSON response.
    This helps frontend applications explicitly fetch the token.
    Django's CsrfViewMiddleware will set the 'csrftoken' cookie on this response.
    """
    token = get_token(request) # This call ensures the csrftoken cookie is set
    return JsonResponse({'csrftoken': token})


# --- Authentication Views ---

# Removed @csrf_exempt from login_view in previous corrections.
# CSRF protection is now handled by CsrfViewMiddleware and Axios configuration on frontend.
def login_view(request):
    """
    Handles user login. Expects JSON payload with 'username' and 'password'.
    Returns JSON response indicating success or failure.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')

            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)
                return JsonResponse({'message': 'Login successful'}, status=200)
            else:
                # Use 401 Unauthorized for invalid credentials
                return JsonResponse({'error': 'Invalid credentials'}, status=401)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON payload'}, status=400)
        except Exception as e:
            # Catch broader exceptions for unexpected errors
            return JsonResponse({'error': f'An unexpected error occurred: {str(e)}'}, status=500)
    return JsonResponse({'error': 'Only POST method is allowed for login'}, status=405)


# --- File Upload Views ---

@login_required # Protect this view, only logged-in users can upload
def upload_file_view(request):
    """
    Handles file uploads (PDF, DOCX, TXT). Stores file and extracts text content.
    The text content is stored in the session for later use by the chat.
    """
    upload_dir = os.path.join(settings.MEDIA_ROOT, "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    if request.method == "POST":
        if request.FILES.get("file"):
            uploaded_file = request.FILES["file"]
            path = default_storage.save(os.path.join("uploads", uploaded_file.name), uploaded_file)
            full_path = os.path.join(settings.MEDIA_ROOT, path)

            text_content = ""
            try:
                if uploaded_file.name.lower().endswith(".pdf"):
                    with fitz.open(full_path) as doc:
                        text_content = "\n".join([page.get_text() for page in doc])
                elif uploaded_file.name.lower().endswith(".docx"):
                    doc = Document(full_path)
                    text_content = "\n".join([p.text for p in doc.paragraphs])
                elif uploaded_file.name.lower().endswith(".txt"):
                    with open(full_path, "r", encoding="utf-8") as f:
                        text_content = f.read()
                else:
                    os.remove(full_path)
                    return JsonResponse({"error": "Unsupported file type. Only PDF, DOCX, TXT are allowed."}, status=400)

                request.session["uploaded_content"] = text_content
                return JsonResponse({"success": True, "filename": uploaded_file.name, "message": "File uploaded and processed successfully."})

            except Exception as e:
                if os.path.exists(full_path):
                    os.remove(full_path)
                return JsonResponse({"error": f"Error processing file: {str(e)}"}, status=500)
        else:
            return JsonResponse({"error": "No file provided in the request."}, status=400)
    
    elif request.method == "GET":
        uploaded_files_list = []
        try:
            upload_path = os.path.join(settings.MEDIA_ROOT, "uploads")
            if os.path.exists(upload_path):
                for f_name in os.listdir(upload_path):
                    f_path = os.path.join(upload_path, f_name)
                    if os.path.isfile(f_path):
                        uploaded_files_list.append({
                            "id": f_name,
                            "name": f_name,
                            "url": f"{settings.MEDIA_URL}uploads/{f_name}"
                        })
            return JsonResponse(uploaded_files_list, safe=False)
        except Exception as e:
            return JsonResponse({"error": f"Error listing files: {str(e)}"}, status=500)

    return JsonResponse({"error": "Method not allowed."}, status=405)


@login_required # Protect this view
def delete_file_view(request, filename):
    """
    Deletes an uploaded file.
    """
    if request.method == "POST":
        try:
            file_path_in_media = os.path.join("uploads", filename)
            full_path = default_storage.path(file_path_in_media)

            if os.path.exists(full_path):
                os.remove(full_path)
                return JsonResponse({"success": True, "message": f"File '{filename}' deleted successfully."})
            else:
                return JsonResponse({"error": "File not found."}, status=404)
        except Exception as e:
            return JsonResponse({"error": f"Error deleting file: {str(e)}"}, status=500)
    return JsonResponse({"error": "Only POST method is allowed for deletion."}, status=405)


# --- Chat API ---

@login_required # Protect this view
def chat_view(request):
    """
    Handles chat messages and interacts with the RAG model.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode("utf-8"))
            message = data.get("message")

            if not message:
                return JsonResponse({"error": "Message is required."}, status=400)

            context = request.session.get("uploaded_content", "")
            if context and ("file" in message.lower() or "document" in message.lower() or "context" in message.lower()):
                prompt = f"Context from uploaded document: {context.strip()}\n\nUser query: {message}"
            else:
                prompt = message

            answer = get_answer(prompt)

            # Save chat messages to database if user is authenticated
            ChatMessage.objects.create(user=request.user, sender="user", message=message)
            ChatMessage.objects.create(user=request.user, sender="bot", message=answer)

            return JsonResponse({"response": answer})

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON payload."}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"An error occurred during chat processing: {str(e)}"}, status=500)

    return JsonResponse({"error": "Only POST method is allowed for chat."}, status=405)


# --- Reminder API (Class-Based View) ---

# Removed @csrf_exempt from ReminderAPI in previous corrections.
# CSRF protection is handled by CsrfViewMiddleware and Axios configuration on frontend.
@method_decorator(login_required, name='dispatch') # Protect all methods in this class
class ReminderAPI(View):
    """
    API for managing Reminders (GET, POST, PUT, DELETE).
    """
    def get(self, request):
        """Retrieves all reminders for the authenticated user."""
        reminders = Reminder.objects.all().order_by('-created_at')
        data = [{"id": r.id, "task": r.task, "date": r.date.strftime('%Y-%m-%d') if r.date else ""} for r in reminders]
        return JsonResponse(data, safe=False)

    def post(self, request):
        """Creates a new reminder."""
        try:
            body = json.loads(request.body)
            task = body.get('task')
            date_str = body.get('date')
            
            if not task:
                return JsonResponse({'error': 'Task is required'}, status=400)
            
            date = None
            if date_str:
                try:
                    from datetime import datetime
                    date = datetime.strptime(date_str, '%Y-%m-%d').date()
                except ValueError:
                    return JsonResponse({'error': 'Invalid date format. UseYYYY-MM-DD.'}, status=400)

            reminder = Reminder.objects.create(task=task, date=date)
            return JsonResponse({'id': reminder.id, 'task': reminder.task, 'date': reminder.date.strftime('%Y-%m-%d') if reminder.date else '', 'success': True}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON payload'}, status=400)
        except Exception as e:
            return JsonResponse({'error': f'Error creating reminder: {str(e)}'}, status=400)

    def put(self, request):
        """Updates an existing reminder."""
        try:
            body = json.loads(request.body)
            reminder_id = body.get('id')
            task = body.get('task')
            date_str = body.get('date')

            if not reminder_id:
                return JsonResponse({'error': 'Reminder ID is required for update'}, status=400)

            reminder = Reminder.objects.get(id=reminder_id)

            if task:
                reminder.task = task
            
            if date_str is not None:
                if date_str == "":
                    reminder.date = None
                else:
                    try:
                        from datetime import datetime
                        reminder.date = datetime.strptime(date_str, '%Y-%m-%d').date()
                    except ValueError:
                        return JsonResponse({'error': 'Invalid date format. UseYYYY-MM-DD.'}, status=400)
            
            reminder.save()
            return JsonResponse({'success': True, 'message': 'Reminder updated successfully'}, status=200)

        except Reminder.DoesNotExist:
            return JsonResponse({'error': 'Reminder not found'}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON payload'}, status=400)
        except Exception as e:
            return JsonResponse({'error': f'Error updating reminder: {str(e)}'}, status=400)

    def delete(self, request):
        """Deletes a reminder."""
        try:
            body = json.loads(request.body)
            reminder_id = body.get('id')

            if not reminder_id:
                return JsonResponse({'error': 'Reminder ID is required for delete'}, status=400)

            reminder = Reminder.objects.get(id=reminder_id)

            reminder.delete()
            return JsonResponse({'success': True, 'message': 'Reminder deleted successfully'}, status=200)

        except Reminder.DoesNotExist:
            return JsonResponse({'error': 'Reminder not found'}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON payload'}, status=400)
        except Exception as e:
            return JsonResponse({'error': f'Error deleting reminder: {str(e)}'}, status=400)


# --- Chat History View ---

@login_required # Protect this view
def view_history(request):
    """
    Retrieves chat messages for the authenticated user.
    Returns JSON array of chat messages.
    """
    messages = ChatMessage.objects.filter(user=request.user).order_by('-timestamp')[:50]
    data = [
        {
            "id": msg.id, # Include ID for React key prop
            "sender": msg.sender,
            "text": msg.message,
            "timestamp": msg.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        }
        for msg in messages
    ]
    return JsonResponse(data, safe=False)
