import os
from groq import Groq

def generate_response(messages_list, system_prompt, api_key=None):
    key = api_key or os.environ.get('GROQ_API_KEY')
    if not key:
        return "Error: Groq API key is not configured."
    
    try:
        client = Groq(api_key=key)
        
        # Format messages for Groq
        formatted_messages = [{"role": "system", "content": system_prompt}]
        for msg in messages_list:
            formatted_messages.append({
                "role": msg['role'],
                "content": msg['content']
            })
            
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=formatted_messages
        )
        
        return response.choices[0].message.content
    except Exception as e:
        return f"Groq Error: {str(e)}"
