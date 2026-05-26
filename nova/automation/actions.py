import subprocess
import webbrowser
import os
import re
from datetime import datetime

def handle_automation(user_message):
    msg = user_message.lower().strip()

    # Time / Date
    if re.search(r"\b(what time is it|current time|what's the time)\b", msg):
        now = datetime.now().strftime("%I:%M %p")
        return True, f"The current time is {now}."
    
    if re.search(r"\b(what is the date|what's the date|current date|today's date)\b", msg):
        today = datetime.now().strftime("%A, %B %d, %Y")
        return True, f"Today is {today}."

    # Open VS Code
    if re.search(r"\b(open vs code|open vscode|open code)\b", msg):
        try:
            subprocess.Popen("code .", shell=True)
            return True, "Opening VS Code in this directory."
        except Exception as e:
            return True, f"Failed to open VS Code. Error: {e}"

    # Open Chrome
    if re.search(r"\b(open chrome|open browser|launch chrome)\b", msg):
        try:
            webbrowser.open("https://www.google.com")
            return True, "Launching Google Chrome."
        except Exception as e:
            return True, f"Failed to launch Chrome. Error: {e}"

    # Google / Web Search
    search_match = re.search(r"\b(?:search (?:the )?web for|search google for|google|search for)\s+(.+)", msg)
    if search_match:
        query = search_match.group(1)
        try:
            webbrowser.open(f"https://www.google.com/search?q={query}")
            return True, f"Searching the web for '{query}'."
        except Exception as e:
            return True, f"Search failed. Error: {e}"

    # Search YouTube
    youtube_match = re.search(r"\b(?:search (?:on )?youtube for|youtube search for|youtube)\s+(.+)", msg)
    if youtube_match:
        query = youtube_match.group(1)
        try:
            webbrowser.open(f"https://www.youtube.com/results?search_query={query}")
            return True, f"Searching YouTube for '{query}'."
        except Exception as e:
            return True, f"YouTube search failed. Error: {e}"

    # Play Music
    if re.search(r"\b(play music|play some music|play songs)\b", msg):
        try:
            webbrowser.open("https://music.youtube.com")
            return True, "Opening YouTube Music."
        except Exception as e:
            return True, f"Failed to open music player: {e}"

    # Open Folder
    folder_match = re.search(r"\b(?:open folder|open directory)(?:\s+(.+))?\b", msg)
    if folder_match:
        target_path = folder_match.group(1)
        if not target_path or target_path.strip() in ('here', 'current', 'this', '.'):
            path_to_open = os.getcwd()
        else:
            path_to_open = target_path.strip()
        try:
            path_to_open = os.path.abspath(path_to_open)
            if os.path.exists(path_to_open):
                os.startfile(path_to_open)
                return True, f"Opening folder: {path_to_open}"
            else:
                return True, f"Folder does not exist: {path_to_open}"
        except Exception as e:
            return True, f"Failed to open folder: {e}"

    # Open Notepad
    if re.search(r"\b(open notepad|launch notepad)\b", msg):
        try:
            subprocess.Popen("notepad.exe")
            return True, "Opening Notepad."
        except Exception as e:
            return True, f"Failed to open Notepad: {e}"

    # Open Calculator
    if re.search(r"\b(open calculator|launch calculator|open calc)\b", msg):
        try:
            subprocess.Popen("calc.exe")
            return True, "Opening Calculator."
        except Exception as e:
            return True, f"Failed to open Calculator: {e}"

    # Shutdown / Restart
    if msg == "shutdown":
        return True, "SYSTEM_SHUTDOWN_CONFIRM"
    if msg == "restart":
        return True, "SYSTEM_RESTART_CONFIRM"

    return False, ""
