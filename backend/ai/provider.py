from ai.gemini import generate_response as gemini_generate
from ai.openai_client import generate_response as openai_generate

def get_ai_response(messages, system_prompt, provider='gemini', api_key=None):
    if provider == 'openai':
        response = openai_generate(messages, system_prompt, api_key)
        # Fallback to gemini if openai fails
        if response.startswith('OpenAI Error:') or response.startswith('Error:'):
            fallback = gemini_generate(messages, system_prompt, None) # Use default API key for fallback
            if not fallback.startswith('Error:') and not fallback.startswith('Gemini Error:'):
                return fallback
        return response
    else:
        # Default to Gemini
        response = gemini_generate(messages, system_prompt, api_key)
        # Fallback to OpenAI if gemini fails
        if response.startswith('Gemini Error:') or response.startswith('Error:'):
            fallback = openai_generate(messages, system_prompt, None)
            if not fallback.startswith('Error:') and not fallback.startswith('OpenAI Error:'):
                return fallback
        return response
