"""
AI provider wrapper with OpenAI support and offline fallback.
This supports both the legacy `openai` interface (pre-1.0) and the
newer `openai.OpenAI` client (1.0+). It can also send requests to an
Ollama instance if `OLLAMA_URL` is set. If no provider is available or an
error occurs (for example an invalid API key), the provider falls back to a
simple offline echo response and returns a clear, sanitized error message.
"""
import time
import logging
import os
from typing import Optional

try:
    import requests
except Exception:
    requests = None

OPENAI_CLIENT = None
_modern_openai = False
_legacy_openai = False

try:
    # New interface: `from openai import OpenAI` (openai-python 1.0+)
    from openai import OpenAI as OpenAIClient
    _modern_openai = True
except Exception:
    OpenAIClient = None
    _modern_openai = False

try:
    import openai as openai_legacy
    _legacy_openai = True
except Exception:
    openai_legacy = None
    _legacy_openai = False

from config.config import OPENAI_API_KEY, PROVIDER, OLLAMA_URL, OLLAMA_MODEL
from config.config import GEMINI_API_KEY
from config.config import GROQ_API_KEY
import json



def _is_invalid_api_key_error(exc: Exception) -> bool:
    # legacy helper kept for compatibility
    text = str(exc).lower()
    return any(k in text for k in ('invalid_api_key', 'incorrect api key', '401', '403', 'forbidden'))


def _classify_error(exc: Exception) -> str:
    """Return a short error classification: 'auth', 'quota', 'forbidden', or 'other'."""
    text = str(exc).lower()
    if any(k in text for k in ('invalid_api_key', 'incorrect api key', '401', 'unauthorized')):
        return 'auth'
    if any(k in text for k in ('429', 'quota', 'insufficient_quota', 'rate limit')):
        return 'quota'
    if any(k in text for k in ('403', 'forbidden', 'permission')):
        return 'forbidden'
    if any(k in text for k in ('404', 'not found', 'not_found')):
        return 'notfound'
    return 'other'


class AIProvider:
    def __init__(self):
        self.api_key = OPENAI_API_KEY
        self.provider_choice = (PROVIDER or 'auto').lower()
        self.gemini_key = GEMINI_API_KEY
        self.groq_key = GROQ_API_KEY
        self.available = False
        self.client = None
        self.mode = None
        self.ollama_url = OLLAMA_URL or os.getenv('OLLAMA_URL') or 'http://localhost:11434'
        self.ollama_model = OLLAMA_MODEL


        # Selection logic
        # If provider explicitly chosen as gemini
        if self.provider_choice == 'gemini':
            if self.gemini_key:
                self.mode = 'gemini'
                self.available = True
            else:
                logging.debug('Gemini selected but GEMINI_API_KEY not set')

        # If provider explicitly chosen as groq
        if self.provider_choice == 'groq':
            if self.groq_key:
                self.mode = 'groq'
                self.available = True
            else:
                logging.debug('Groq selected but GROQ_API_KEY not set')

        # If provider explicitly chosen as ollama
        if self.provider_choice == 'ollama' and not self.available:
            if requests is not None and self.ollama_url:
                self.mode = 'ollama'
                self.available = True
            else:
                logging.debug('Ollama selected but requests/OLLAMA_URL not available')

        # If provider explicitly set to openai or in auto mode, try OpenAI
        if (self.provider_choice in ('openai', 'auto') or not self.mode) and not self.available:
            # Try modern OpenAI client first
            if _modern_openai:
                try:
                    self.client = OpenAIClient(api_key=self.api_key) if self.api_key else OpenAIClient()
                    self.mode = 'modern'
                    self.available = True
                except Exception as e:
                    logging.debug('Modern OpenAI init failed: %s', e)
                    self.client = None
                    self.available = False

            # Fallback to legacy openai
            if not self.available and _legacy_openai:
                try:
                    if self.api_key:
                        openai_legacy.api_key = self.api_key
                    self.client = openai_legacy
                    self.mode = 'legacy'
                    self.available = True
                except Exception as e:
                    logging.debug('Legacy OpenAI init failed: %s', e)

        # If provider explicitly set to ollama or openai not available, try Ollama
        if (not self.available and self.ollama_url) or self.provider_choice == 'ollama':
            if requests is not None and self.ollama_url:
                self.mode = 'ollama'
                self.available = True
            else:
                logging.debug('Ollama selected but requests/OLLAMA_URL not available')

    def is_ollama_running(self) -> bool:
        """Check if local Ollama server is online."""
        if not requests or not self.ollama_url:
            return False
        try:
            r = requests.get(self.ollama_url, timeout=1.5)
            return r.status_code == 200
        except Exception:
            return False

    def set_model(self, model_name: str) -> tuple[bool, str]:
        """Switch the active Ollama model and verify if downloaded."""
        self.ollama_model = model_name
        if self.is_ollama_running():
            try:
                r = requests.get(f"{self.ollama_url.rstrip('/')}/api/tags", timeout=1.5)
                if r.status_code == 200:
                    models = [m['name'].split(':')[0] for m in r.json().get('models', [])]
                    models_exact = [m['name'] for m in r.json().get('models', [])]
                    if model_name not in models and model_name not in models_exact:
                        return True, f"Model switched to '{model_name}'. Note: It is not yet downloaded in Ollama. Pull it via 'ollama pull {model_name}'."
            except Exception:
                pass
        return True, f"Model successfully switched to '{model_name}'."

    def _call_ollama_chat(self, messages, temperature=0.2) -> str:
        if not requests or not self.ollama_url:
            raise RuntimeError('Ollama support not available')
        url = self.ollama_url.rstrip('/') + '/api/chat'
        payload = {
            'model': self.ollama_model,
            'messages': messages,
            'stream': False,
            'options': {
                'temperature': temperature
            }
        }
        try:
            r = requests.post(url, json=payload, timeout=25)
            r.raise_for_status()
            data = r.json()
            return data.get('message', {}).get('content', '')
        except requests.exceptions.ConnectionError:
            return "Ollama is not running. Please start Ollama."
        except Exception as e:
            raise

    def chat_stream(self, messages, temperature=0.2):
        """Yield response tokens from Ollama chat completions endpoint in real time."""
        if not requests or not self.ollama_url:
            yield "Ollama support not available."
            return
        url = self.ollama_url.rstrip('/') + '/api/chat'
        payload = {
            'model': self.ollama_model,
            'messages': messages,
            'stream': True,
            'options': {
                'temperature': temperature
            }
        }
        try:
            r = requests.post(url, json=payload, stream=True, timeout=25)
            if r.status_code != 200:
                yield f"[Ollama Error {r.status_code}]"
                return
            for line in r.iter_lines():
                if line:
                    chunk = json.loads(line.decode('utf-8'))
                    content = chunk.get('message', {}).get('content', '')
                    if content:
                        yield content
        except requests.exceptions.ConnectionError:
            yield "Ollama is not running. Please start Ollama."
        except Exception as e:
            yield f"[Ollama Connection Error: {e}]"

    def _call_ollama(self, prompt: str) -> str:
        if not requests or not self.ollama_url:
            raise RuntimeError('Ollama support not available')
        url = self.ollama_url.rstrip('/') + '/api/generate'
        payload = {
            'model': self.ollama_model,
            'prompt': prompt,
            'max_tokens': 512,
        }
        try:
            r = requests.post(url, json=payload, timeout=20)
            r.raise_for_status()
            data = r.json()
            # Try common response shapes
            if isinstance(data, dict):
                for key in ('result', 'response', 'text'):
                    if key in data:
                        return data[key]
                # Ollama may nest outputs
                choices = data.get('choices') or data.get('outputs')
                if choices and isinstance(choices, list):
                    first = choices[0]
                    if isinstance(first, dict) and 'text' in first:
                        return first['text']
                    return str(first)
            return str(data)
        except Exception as e:
            raise


    def _call_gemini(self, prompt: str) -> str:
        """Call Google Generative Language (Gemini) REST endpoint using API key.

        This uses the v1beta2 `models/{model}:generate` endpoint with an API key
        parameter. GEMINI_API_KEY should be a valid Google Cloud API key or
        service credential usable with the endpoint.
        """
        if not requests or not self.gemini_key:
            raise RuntimeError('Gemini support not available or GEMINI_API_KEY missing')
        model = os.getenv('GEMINI_MODEL', 'models/text-bison-001')
        url = f'https://generativelanguage.googleapis.com/v1beta2/{model}:generate?key={self.gemini_key}'
        payload = {
            'prompt': {
                'text': prompt
            },
            'temperature': float(os.getenv('GEMINI_TEMPERATURE', 0.2)),
            'maxOutputTokens': int(os.getenv('GEMINI_MAXTOKENS', 512)),
        }
        try:
            r = requests.post(url, json=payload, timeout=20)
            r.raise_for_status()
            data = r.json()
            # Try common response shapes
            if isinstance(data, dict):
                # text-bison returns `candidates` list
                if 'candidates' in data and isinstance(data['candidates'], list) and data['candidates']:
                    first = data['candidates'][0]
                    if isinstance(first, dict) and 'content' in first:
                        return first['content']
                # other shapes
                for key in ('output', 'result', 'response', 'text'):
                    if key in data:
                        return data[key]
            return str(data)
        except Exception as e:
            raise

    def _call_groq(self, prompt_or_messages, system: Optional[str] = None) -> str:
        """Call Groq API using REST endpoint."""
        if not requests or not self.groq_key:
            raise RuntimeError('Groq support not available or GROQ_API_KEY missing')
        url = 'https://api.groq.com/openai/v1/chat/completions'
        headers = {
            'Authorization': f'Bearer {self.groq_key}',
            'Content-Type': 'application/json'
        }
        
        if isinstance(prompt_or_messages, list):
            messages = prompt_or_messages
        else:
            messages = []
            if system:
                messages.append({"role": "system", "content": system})
            messages.append({"role": "user", "content": prompt_or_messages})

        payload = {
            'model': os.getenv('GROQ_MODEL', 'llama-3.1-8b-instant'),
            'messages': messages,
            'temperature': float(os.getenv('GROQ_TEMPERATURE', 0.2)),
            'max_tokens': int(os.getenv('GROQ_MAXTOKENS', 512)),
        }
        try:
            r = requests.post(url, headers=headers, json=payload, timeout=20)
            if r.status_code != 200:
                raise RuntimeError(f"Groq API Error {r.status_code}: {r.text}")
            r.raise_for_status()
            data = r.json()
            if 'choices' in data and len(data['choices']) > 0:
                return data['choices'][0]['message']['content']
            return str(data)
        except Exception as e:
            raise

    def chat(self, prompt, system: Optional[str] = None, temperature: float = 0.2) -> str:
        """Send prompt or message list to the selected provider, or fall back to offline echo.

        Returns a sanitized error message on authentication failures and
        switches to offline mode automatically.
        """
        if isinstance(prompt, list):
            messages = prompt
        else:
            messages = [
                {"role": "system", "content": system or "You are NOVA AI, a helpful assistant."},
                {"role": "user", "content": prompt},
            ]

        if self.available and self.mode:
            try:
                if self.mode == 'ollama':
                    return self._call_ollama_chat(messages, temperature=temperature)
                if self.mode == 'gemini':
                    prompt_str = prompt if isinstance(prompt, str) else prompt[-1]['content']
                    return self._call_gemini(prompt_str)
                if self.mode == 'groq':
                    return self._call_groq(messages, system=system)


                if self.mode == 'modern':
                    resp = self.client.chat.completions.create(
                        model=os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo'),
                        messages=messages,
                        temperature=temperature,
                        max_tokens=600,
                    )
                    # Try attribute access first
                    try:
                        content = resp.choices[0].message.content
                    except Exception:
                        content = resp['choices'][0]['message']['content']
                    return content.strip()

                elif self.mode == 'legacy':
                    resp = self.client.ChatCompletion.create(
                        model=os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo'),
                        messages=messages,
                        temperature=temperature,
                        max_tokens=600,
                    )
                    return resp['choices'][0]['message']['content'].strip()

            except Exception as e:
                kind = _classify_error(e)
                if kind == 'auth':
                    self.available = False
                    return ("[AI ERROR] Authentication failed for the selected provider. "
                            "Check your API key (OPENAI_API_KEY, GEMINI_API_KEY) and provider settings. "
                            "Falling back to offline demo mode.")
                if kind == 'quota':
                    # keep provider enabled; quota might renew soon
                    return ("[AI ERROR] Request quota exceeded or rate limited. "
                            "Check your billing/usage for the selected provider.")
                if kind == 'forbidden':
                    self.available = False
                    return ("[AI ERROR] Access forbidden by the provider (403). "
                            "Check that the API key has the required permissions.")
                if kind == 'notfound':
                    return ("[AI ERROR] Requested model or endpoint not found (404). "
                            "If using Gemini, verify GEMINI_MODEL and that the Generative API is enabled for your project.")
                # Other errors: return sanitized message
                return f"[AI ERROR] {str(e)}"

        # Offline fallback
        time.sleep(0.2)
        return f"[offline-mode] Echo: {prompt[:800]}"

    def generate_code(self, prompt: str, language_hint: str = '') -> str:
        return self.chat(f"Generate {language_hint} code for: {prompt}")

    def explain_code(self, code_snippet: str, language: str = '') -> str:
        return self.chat(f"Explain this {language} code:\n{code_snippet}")
