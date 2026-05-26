# NOVA AI — Terminal Assistant

This is a small, modular command-line AI assistant built with Python.

Prereqs:
- Python 3.10+
- pip

Installation (recommended):

Windows (PowerShell):
```powershell
cd nova
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
# Add your API credentials to `.env` (examples below)
# For OpenAI:
# OPENAI_API_KEY=sk-...
# For Ollama (local):
# OLLAMA_URL=http://localhost:11434
# Optionally force a provider: NOVA_PROVIDER=openai|ollama|auto
python main.py
```

Examples:
- Interactive menu: `python main.py`
- One-shot chat: `python main.py chat "Hello NOVA"`
- Generate code: `python main.py code "small http server in python"`

Notes:
- Uses SQLite (`nova.db`) in the project folder.
Notes:
- Uses SQLite (`nova.db`) in the project folder.
- Provider selection: set `NOVA_PROVIDER` to `openai`, `ollama` or `auto` (default).
- If `OPENAI_API_KEY` is not provided or invalid, NOVA falls back to an offline echo-mode for demos and will show a helpful error message.

Enjoy! — NOVA AI
