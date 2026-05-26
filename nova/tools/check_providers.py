#!/usr/bin/env python3
"""
Check configured AI provider keys (OpenAI/Gemini) without exposing secrets.
Outputs one of:
- OPENAI_OK / OPENAI_AUTH_ERROR / OPENAI_RATE_LIMIT / OPENAI_ERROR_<code> / OPENAI_NO_KEY / OPENAI_NETWORK_ERROR
- GEMINI_OK / GEMINI_AUTH_ERROR / GEMINI_FORBIDDEN / GEMINI_NOTFOUND / GEMINI_RATE_LIMIT / GEMINI_NO_KEY / GEMINI_NETWORK_ERROR
- NO_PROVIDER_KEYS
"""
import sys
import os
try:
    import requests
except Exception:
    print('MISSING_REQUESTS')
    sys.exit(0)

# load config from package
try:
    # ensure repo root is on sys.path so `nova` package can be imported
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    if repo_root not in sys.path:
        sys.path.insert(0, repo_root)
    from nova.config.config import OPENAI_API_KEY, GEMINI_API_KEY, PROVIDER
except Exception:
    # try relative import if executed inside nova
    try:
        from config.config import OPENAI_API_KEY, GEMINI_API_KEY, PROVIDER
    except Exception:
        print('CONFIG_LOAD_ERROR')
        sys.exit(0)

PROVIDER = (PROVIDER or 'auto').lower()


def check_openai(key):
    if not key:
        print('OPENAI_NO_KEY')
        return
    url = 'https://api.openai.com/v1/models'
    headers = {'Authorization': f'Bearer {key}'}
    try:
        r = requests.get(url, headers=headers, timeout=10)
        code = r.status_code
        if code == 200:
            print('OPENAI_OK')
        elif code == 401:
            print('OPENAI_AUTH_ERROR')
        elif code == 429:
            print('OPENAI_RATE_LIMIT')
        else:
            print(f'OPENAI_ERROR_{code}')
    except Exception:
        print('OPENAI_NETWORK_ERROR')


def check_gemini(key):
    if not key:
        print('GEMINI_NO_KEY')
        return
    # use text-bison lightweight generate endpoint
    url = f'https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generate?key={key}'
    payload = {"prompt": {"text": "hello"}, "maxOutputTokens": 5}
    try:
        r = requests.post(url, json=payload, timeout=10)
        code = r.status_code
        if code == 200:
            print('GEMINI_OK')
        elif code == 401:
            print('GEMINI_AUTH_ERROR')
        elif code == 403:
            print('GEMINI_FORBIDDEN')
        elif code == 404:
            print('GEMINI_NOTFOUND')
        elif code == 429:
            print('GEMINI_RATE_LIMIT')
        else:
            print(f'GEMINI_ERROR_{code}')
    except Exception:
        print('GEMINI_NETWORK_ERROR')


if PROVIDER == 'openai':
    check_openai(OPENAI_API_KEY)
elif PROVIDER == 'gemini':
    check_gemini(GEMINI_API_KEY)
else:
    # auto: prefer OpenAI if key present
    if OPENAI_API_KEY:
        check_openai(OPENAI_API_KEY)
    elif GEMINI_API_KEY:
        check_gemini(GEMINI_API_KEY)
    else:
        print('NO_PROVIDER_KEYS')
