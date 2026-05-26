"""
Voice command: voice interface disabled in terminal-only mode.
"""
from utils.ui import console


def run(args, db, ai, user):
    console.print('\n[bold magenta]Voice features are disabled in this build. Use the chat command to interact via text.[/bold magenta]\n')
    return
