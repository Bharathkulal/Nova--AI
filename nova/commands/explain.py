"""
Explain command: explain a code snippet or file contents
"""
from utils.ui import console, type_print, loading
import os


def run(args, db, ai, user):
    target = ' '.join(args.target) if hasattr(args, 'target') and args.target else None
    code_snippet = ''
    if target and os.path.exists(target):
        with open(target, 'r', encoding='utf-8') as f:
            code_snippet = f.read()
    elif target:
        code_snippet = target
    else:
        console.print('[bold yellow]Paste code now (end with a single line containing only "EOF")')
        lines = []
        while True:
            line = input()
            if line.strip() == 'EOF':
                break
            lines.append(line)
        code_snippet = '\n'.join(lines)

    if not code_snippet.strip():
        console.print('[red]No code provided.')
        return

    loading(0.4, 'Analyzing code...')
    resp = ai.explain_code(code_snippet)
    type_print(resp)
    db.add_chat(user.get('id') if user else None, user.get('username') if user else 'guest', '[explain] snippet', resp)
