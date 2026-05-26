"""
Help command (not required but helpful for CLI usage)
"""
from utils.ui import console

def run(args):
    console.print('Available commands:\n - chat [prompt]\n - code [prompt]\n - explain [file|code]\n - history [--limit]\n - automate\n')
