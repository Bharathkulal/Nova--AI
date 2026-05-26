"""
Terminal UI helpers using Rich: banner, typing effect, cards and simple menus.
"""
import sys
import time
from rich.console import Console
from rich.panel import Panel
from rich.align import Align
from rich.text import Text
from rich.table import Table
from rich import box

console = Console()

def banner():
    title = Text('NOVA AI', style='bold cyan', justify='center')
    subtitle = Text('Futururistic CLI Assistant', style='magenta')
    panel = Panel(Align.center(title + '\n' + subtitle), box=box.ROUNDED, style='dim')
    console.print(panel)

def loading(seconds=2, message='Initializing NOVA AI...'):
    with console.status(f"[bold green]{message}", spinner='dots'):
        time.sleep(seconds)

def type_print(text, delay=0.007, style='white'):
    # simple typing animation
    for ch in text:
        console.print(ch, end='', style=style, soft_wrap=True)
        time.sleep(delay)
    console.print()

def print_card(title, content, style='cyan'):
    panel = Panel(content, title=title, style=style, box=box.ROUNDED)
    console.print(panel)

def show_stats(stats: dict):
    table = Table.grid(expand=True)
    table.add_column()
    table.add_column()
    table.add_row('[bold cyan]Total Users', str(stats.get('total_users', 0)))
    table.add_row('[bold cyan]Total Chats', str(stats.get('total_chats', 0)))
    console.print(Panel(table, title='Overview', box=box.ROUNDED))

def nova_print(text, delay=0.005):
    # Print the prefix, then stream the text with typing animation
    console.print('[bold magenta]NOVA > [/bold magenta]', end='')
    type_print(text, delay=delay, style='bright_white')

def user_input(prompt='[bold cyan]You > '):
    try:
        return input(prompt)
    except (KeyboardInterrupt, EOFError):
        return None
