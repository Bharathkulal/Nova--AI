import os
import sys
import time
import threading
import msvcrt
import requests

from config.config import DB_PATH, WAKE_WORD_ENABLED, WAKE_WORD
from database.db import Database
from ai.provider import AIProvider
from memory.memory_manager import MemoryManager
from conversation.manager import ConversationManager
from voice.voice import VoiceEngine
from automation.actions import handle_automation
from utils.ui import console, banner, nova_print, user_input, type_print

def check_dependencies(voice_engine, ai):
    """Verify system requirements and print status report."""
    console.print("[bold magenta]=== Dependency and System Checks ===[/bold magenta]")
    
    # 1. Python Version
    py_version = sys.version.split()[0]
    console.print(f"[green][OK][/green] Python {py_version}")

    # 2. Required Packages
    required_packages = {
        'rich': 'rich',
        'openai': 'openai',
        'dotenv': 'python-dotenv',
        'speech_recognition': 'SpeechRecognition',
        'pyttsx3': 'pyttsx3',
        'requests': 'requests'
    }
    missing_packages = []
    for module_name, pip_name in required_packages.items():
        try:
            __import__(module_name)
        except ImportError:
            missing_packages.append(pip_name)
            
    if not missing_packages:
        console.print("[green][OK][/green] Required Python packages installed")
    else:
        console.print(f"[red][FAIL][/red] Missing packages: {', '.join(missing_packages)}")
        console.print("   [yellow]To fix: pip install " + " ".join(missing_packages) + "[/yellow]")

    # 3. Ollama Status
    if ai.mode == 'ollama':
        if ai.is_ollama_running():
            console.print(f"[green][OK][/green] Ollama local service online (Model: {ai.ollama_model})")
        else:
            console.print("[red][FAIL][/red] Ollama local service offline")
            console.print("   [yellow]To fix: Start Ollama on http://localhost:11434[/yellow]")
    else:
        console.print(f"[yellow][INFO][/yellow] Provider set to '{ai.mode}' (Skipping Ollama checks)")

    # 4. Microphone Status
    if voice_engine.is_voice_input_available():
        console.print("[green][OK][/green] Microphone input (PyAudio) online")
    else:
        console.print("[yellow][INFO][/yellow] Microphone input offline (PyAudio is missing or not installed)")
        console.print("   [dim]Note: NOVA will default to keyboard typed input.[/dim]")
        
    console.print("[bold magenta]====================================[/bold magenta]\n")

def get_voice_or_text(voice_engine, timeout=4):
    """Wait for voice input, but immediately switch to typing if a key is pressed."""
    if not voice_engine.is_voice_input_available():
        return user_input()
        
    console.print('[bold magenta]NOVA > [/bold magenta][dim]Listening... (Speak now or press any key to type)[/dim]')
    
    result = {"text": "", "done": False}
    
    def listen_thread():
        try:
            res = voice_engine.listen(timeout=timeout, phrase_time_limit=8)
            result["text"] = res
        except Exception:
            pass
        result["done"] = True

    t = threading.Thread(target=listen_thread, daemon=True)
    t.start()
    
    while not result["done"]:
        if msvcrt.kbhit():
            try:
                while msvcrt.kbhit():
                    msvcrt.getch()
            except Exception:
                pass
            return user_input()
        time.sleep(0.05)
        
    if result["text"] and result["text"].strip():
        heard_text = result["text"].strip()
        console.print(f"[bold cyan]You (Voice) › {heard_text}")
        return heard_text
        
    return user_input()

def main():
    # 1. Futuristic Startup Sequence
    banner()
    
    console.print("[bold cyan]Loading NOVA AI Core...")
    time.sleep(0.4)
    console.print("[bold cyan]Loading Voice Engine...")
    voice_engine = VoiceEngine()
    time.sleep(0.4)
    console.print("[bold cyan]Loading Memory Database...")
    db = Database(DB_PATH)
    memory_manager = MemoryManager(db)
    conv_manager = ConversationManager(memory_manager)
    time.sleep(0.4)
    console.print("[bold cyan]Connecting to Ollama...")
    ai = AIProvider()
    
    ollama_online = False
    if ai.mode == 'ollama':
        ollama_online = ai.is_ollama_running()
        
    time.sleep(0.4)
    console.print("[bold green]NOVA AI Online.[/bold green]\n")
    
    # Run System Checks
    check_dependencies(voice_engine, ai)
    
    user_name = memory_manager.get_user_name()
    
    # 2. Greeting Logic
    # Check if they have chatted before
    chats = db.get_recent_chats(limit=1)
    if chats:
        greeting = f"Welcome back, {user_name}."
    else:
        greeting = f"Hello {user_name}, I am NOVA AI. How can I help you today?"
        
    nova_print(greeting)
    voice_engine.speak(greeting)
    
    # Check if Ollama is running and warn if not
    if ai.mode == 'ollama' and not ollama_online:
        warning_msg = "Ollama is not running. Please start Ollama."
        nova_print(warning_msg)
        voice_engine.speak(warning_msg)
        
    # 3. Conversation Loop
    while True:
        user_msg = ""
        
        # Wake word detection logic
        if WAKE_WORD_ENABLED and voice_engine.is_voice_input_available():
            console.print(f"[dim]Waiting for wake word '{WAKE_WORD}'... (or press any key to type)[/dim]")
            wake_detected = False
            while not wake_detected:
                if msvcrt.kbhit():
                    try:
                        while msvcrt.kbhit():
                            msvcrt.getch()
                    except Exception:
                        pass
                    user_msg = user_input()
                    break
                
                if voice_engine.listen_for_wake_word(WAKE_WORD):
                    wake_detected = True
                    activation_msg = f"Yes, {user_name}?"
                    nova_print(activation_msg)
                    voice_engine.speak(activation_msg)
                    user_msg = get_voice_or_text(voice_engine, timeout=5)
                    break
                time.sleep(0.1)
        else:
            user_msg = get_voice_or_text(voice_engine, timeout=4)
            
        # Exit if Ctrl+C or empty EOF
        if user_msg is None:
            farewell = f"Goodbye, {user_name}."
            nova_print(farewell)
            break
            
        user_msg = user_msg.strip()
        if not user_msg:
            continue
            
        # Check for natural exits
        if user_msg.lower() in ('/exit', '/quit', 'exit', 'quit', 'goodbye', 'bye'):
            farewell = f"Goodbye, {user_name}!"
            nova_print(farewell)
            break
            
        # Model switching commands
        if user_msg.lower() in ('/model', '/model list'):
            models = ['phi3', 'mistral', 'llama3', 'codellama']
            if ai.is_ollama_running():
                try:
                    r = requests.get(f"{ai.ollama_url.rstrip('/')}/api/tags", timeout=1.5)
                    if r.status_code == 200:
                        models = [m['name'] for m in r.json().get('models', [])]
                except Exception:
                    pass
            models_str = ", ".join(models)
            resp = f"Available Ollama models: {models_str}. Current model: {ai.ollama_model}."
            nova_print(resp)
            voice_engine.speak(resp)
            continue
            
        if user_msg.lower().startswith('/model '):
            model_name = user_msg.split(' ', 1)[1].strip()
            success, msg_resp = ai.set_model(model_name)
            nova_print(msg_resp)
            voice_engine.speak(msg_resp)
            continue
            
        # 4. Handle Automation Intercept
        handled, action_resp = handle_automation(user_msg)
        if handled:
            if action_resp == "SYSTEM_SHUTDOWN_CONFIRM":
                confirm_prompt = "Are you sure you want to shut down the computer? (yes/no): "
                nova_print(confirm_prompt)
                voice_engine.speak(confirm_prompt)
                confirm = user_input()
                if confirm and confirm.lower().strip() in ('yes', 'y'):
                    nova_print("Shutting down the system...")
                    voice_engine.speak("Shutting down the system.")
                    os.system("shutdown /s /t 1")
                    break
                else:
                    nova_print("Shutdown cancelled.")
                    voice_engine.speak("Shutdown cancelled.")
                    continue
                    
            elif action_resp == "SYSTEM_RESTART_CONFIRM":
                confirm_prompt = "Are you sure you want to restart the computer? (yes/no): "
                nova_print(confirm_prompt)
                voice_engine.speak(confirm_prompt)
                confirm = user_input()
                if confirm and confirm.lower().strip() in ('yes', 'y'):
                    nova_print("Restarting the system...")
                    voice_engine.speak("Restarting the system.")
                    os.system("shutdown /r /t 1")
                    break
                else:
                    nova_print("Restart cancelled.")
                    voice_engine.speak("Restart cancelled.")
                    continue

            nova_print(action_resp)
            voice_engine.speak(action_resp)
            db.add_chat(None, user_name, user_msg, action_resp)
            conv_manager.add_message("user", user_msg)
            conv_manager.add_message("assistant", action_resp)
            continue
            
        # 5. Get AI Response
        messages = conv_manager.build_messages(user_msg)
        raw_response = ""
        
        # Check if Ollama is actually running (if in Ollama mode)
        if ai.mode == 'ollama' and not ai.is_ollama_running():
            offline_warning = "Ollama is not running. Please start Ollama."
            nova_print(offline_warning)
            voice_engine.speak(offline_warning)
            continue
            
        # Stream response if using Ollama
        if ai.mode == 'ollama':
            console.print('[bold magenta]NOVA > [/bold magenta]', end='')
            current_line = ""
            try:
                for chunk in ai.chat_stream(messages):
                    for char in chunk:
                        if char == '\n':
                            if "[MEM_UPDATE:" not in current_line:
                                console.print(current_line, style='bright_white', end='\n', flush=True)
                            raw_response += current_line + '\n'
                            current_line = ""
                        else:
                            current_line += char
                if current_line:
                    if "[MEM_UPDATE:" not in current_line:
                        console.print(current_line, style='bright_white', flush=True)
                    raw_response += current_line
                console.print()
            except Exception as e:
                raw_response = f"I've encountered an issue communicating with my core. Details: {e}"
                console.print(raw_response, style='red')
            
            clean_response = memory_manager.extract_and_save_facts(raw_response)
            nova_print(clean_response)
            voice_engine.speak(clean_response)
            
        else:
            # Fallback (Groq, Gemini, OpenAI)
            with console.status("[bold green]NOVA is thinking...", spinner="dots"):
                try:
                    raw_response = ai.chat(messages)
                except Exception as e:
                    raw_response = f"I've encountered an issue communicating with my core. Details: {e}"
                    
            clean_response = memory_manager.extract_and_save_facts(raw_response)
            nova_print(clean_response)
            voice_engine.speak(clean_response)
            
        # 7. Persist to Database & Context History
        db.add_chat(None, user_name, user_msg, clean_response)
        conv_manager.add_message("user", user_msg)
        conv_manager.add_message("assistant", clean_response)

if __name__ == '__main__':
    main()
