import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .langchain_rag import get_answer
from django.shortcuts import render

def home(request):
    return render(request, "index.html")

@csrf_exempt
def chat(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode("utf-8"))
            message = data.get("message")

            if not message:
                return JsonResponse({"error": "Message field is required."}, status=400)

            answer = get_answer(message)
            return JsonResponse({"response": answer})

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON in request."}, status=400)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Only POST requests are allowed."}, status=405)
