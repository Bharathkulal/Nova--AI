import os
from openai import OpenAI

def generate_response(messages_list, system_prompt, api_key=None):
    key = api_key or os.environ.get('OPENAI_API_KEY')
    if not key:
        return "Error: OpenAI API key is not configured."
    
    try:
        client = OpenAI(api_key=key)
        
        # Format messages for OpenAI
        formatted_messages = [{"role": "system", "content": system_prompt}]
        for msg in messages_list:
            formatted_messages.append({
                "role": msg['role'],
                "content": msg['content']
            })
            
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=formatted_messages
        )
        
        return response.choices[0].message.content
    except Exception as e:
        return f"OpenAI Error: {str(e)}"
