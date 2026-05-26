"""
Configuration loader for NOVA AI CLI
"""
import os
from dotenv import load_dotenv, find_dotenv

# Load .env (searches up the path so project root .env will be found)
load_dotenv(find_dotenv())

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DB_PATH = os.path.join(BASE_DIR, 'nova.db')

# Provider selection: 'auto', 'openai', 'ollama', 'gemini', 'groq'
# Default to 'ollama' as requested
PROVIDER = os.getenv('NOVA_PROVIDER') or os.getenv('AI_PROVIDER') or 'ollama'

# Ollama URL if you run a local Ollama instance (e.g. http://localhost:11434)
OLLAMA_URL = os.getenv('OLLAMA_URL') or 'http://localhost:11434'
# Default Ollama model
OLLAMA_MODEL = os.getenv('OLLAMA_MODEL') or 'phi3'

# Wake Word Settings
WAKE_WORD_ENABLED = os.getenv('WAKE_WORD_ENABLED', 'false').lower() in ('true', '1', 'yes')
WAKE_WORD = os.getenv('WAKE_WORD') or 'hey nova'

# Google Gemini API key (if you want to use Gemini / Google Generative API)
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
# Groq API key (for fast Llama/Mixtral inference)
GROQ_API_KEY = os.getenv('GROQ_API_KEY')

# Simple config values
APP_NAME = "NOVA AI"

