"""
History command: show recent chats
"""
from utils.ui import console, print_card


def run(args, db, ai, user):
    limit = int(args.limit) if hasattr(args, 'limit') and args.limit else 10
    rows = db.get_recent_chats(limit=limit)
    if not rows:
        console.print('[dim]No history found.')
        return
    for r in rows:
        title = f"{r.get('username','guest')} @ {r.get('created_at')}"
        content = f"[bold]Q:[/bold] {r.get('prompt')}\n\n[bold]A:[/bold] {r.get('response')}"
        print_card(title, content, style='purple')
