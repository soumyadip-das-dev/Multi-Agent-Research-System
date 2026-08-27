import os
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Logger setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("multi_agent_research")

# Configuration variables
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini").lower()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")
SEMANTIC_SCHOLAR_API_KEY = os.getenv("SEMANTIC_SCHOLAR_API_KEY", "")
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))


def get_llm():
    """
    Factory function to return the configured LLM instance.
    Supports Gemini ('gemini'), OpenAI ('openai'), or fallback mock mode.
    """
    if LLM_PROVIDER == "gemini" and GEMINI_API_KEY:
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            logger.info("Initializing ChatGoogleGenerativeAI (gemini-1.5-flash)...")
            return ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                google_api_key=GEMINI_API_KEY,
                temperature=0.2
            )
        except Exception as e:
            logger.warning(f"Failed to initialize Gemini LLM: {e}. Falling back to mock mode.")

    elif LLM_PROVIDER == "openai" and OPENAI_API_KEY:
        try:
            from langchain_openai import ChatOpenAI
            logger.info("Initializing ChatOpenAI (gpt-4o-mini)...")
            return ChatOpenAI(
                model="gpt-4o-mini",
                api_key=OPENAI_API_KEY,
                temperature=0.2
            )
        except Exception as e:
            logger.warning(f"Failed to initialize OpenAI LLM: {e}. Falling back to mock mode.")

    logger.info("Using Mock LLM Mode (No valid LLM provider key configured).")
    return None
