import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

# Load environment variables
load_dotenv()

# Get OpenRouter API key from .env
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Ensure the key exists
if not OPENROUTER_API_KEY:
    raise EnvironmentError("OPENROUTER_API_KEY not found in environment variables.")

# Set up the language model
llm = ChatOpenAI(
    model="mistralai/mistral-7b-instruct:free",
    openai_api_key=OPENROUTER_API_KEY,
    openai_api_base="https://openrouter.ai/api/v1"
)

# Main function to get a response from the chatbot
def get_answer(question: str) -> str:
    try:
        response = llm.invoke(question)
        return getattr(response, "content", str(response))
    except Exception as e:
        return f"❌ Error fetching response: {str(e)}"
