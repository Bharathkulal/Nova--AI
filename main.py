"""
Top-level launcher for NOVA AI CLI.
Run this from the repository root: `python main.py`
"""
import os
import sys

# Ensure project nova package is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'nova'))

from main import main

if __name__ == '__main__':
    main()
