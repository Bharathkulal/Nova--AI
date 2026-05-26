"""
Code command: ask AI to generate code based on prompt
"""
from utils.ui import console, type_print, loading


def run(args, db, ai, user):
    prompt = ' '.join(args.prompt) if hasattr(args, 'prompt') and args.prompt else None
    if not prompt:
        console.print('[bold yellow]Enter a short description of what to generate (or /exit).')
        prompt = input('You: ')
        if prompt.strip().lower() in ('/exit',''):
            return
    loading(0.4, 'Generating code...')
    resp = ai.generate_code(prompt)
    type_print(resp, delay=0.002)
    db.add_chat(user.get('id') if user else None, user.get('username') if user else 'guest', f"[code request] {prompt}", resp)
