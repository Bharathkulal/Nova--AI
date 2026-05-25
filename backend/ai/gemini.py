import os
import google.generativeai as genai

def generate_response(messages_list, system_prompt, api_key=None):
    key = api_key or os.environ.get('GEMINI_API_KEY')
    if not key:
        return "Error: Gemini API key is not configured."
    
    try:
        genai.configure(api_key=key)
        
        # We use gemini-1.5-flash as the default model
        model = genai.GenerativeModel('gemini-1.5-flash', system_instruction=system_prompt)
        
        # Convert our messages to Gemini format
        history = []
        for msg in messages_list[:-1]:  # Exclude the latest user message
            role = "user" if msg['role'] == "user" else "model"
            history.append({"role": role, "parts": [msg['content']]})
            
        chat = model.start_chat(history=history)
        
        latest_message = messages_list[-1]['content'] if messages_list else "Hello"
        response = chat.send_message(latest_message)
        
        return response.text
    except Exception as e:
        return f"Gemini Error: {str(e)}"
