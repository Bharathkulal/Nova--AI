"""
Chat command: interactive chat session or one-shot prompt
"""
from utils.ui import console, type_print, loading


def run(args, db, ai, user):
    # args may provide a prompt list or be empty
    prompt = None
    if hasattr(args, 'prompt') and args.prompt:
        prompt = ' '.join(args.prompt)
    if prompt:
        loading(0.3, 'Querying AI...')
        resp = ai.chat(prompt)
        type_print(resp, delay=0.005, style='bright_white')
        db.add_chat(user.get('id') if user else None, user.get('username') if user else 'guest', prompt, resp)
        return

    console.print('\n[bold green]Entering interactive chat. Type \'/exit\' to return.\n')
    while True:
        try:
            q = input('You: ')
        except KeyboardInterrupt:
            console.print('\nExiting chat.')
            break
        if not q.strip():
            continue
        if q.strip().lower() in ('/exit', '/quit'):
            break
        loading(0.25, 'Thinking...')
        resp = ai.chat(q)
        type_print(resp)
        db.add_chat(user.get('id') if user else None, user.get('username') if user else 'guest', q, resp)
