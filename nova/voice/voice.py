"""
Voice utilities for NOVA AI using SpeechRecognition and pyttsx3.
Provides simple `listen()` and `speak()` helpers with graceful fallbacks.
This module enables TTS/STT if the optional packages are installed,
and falls back to terminal-only behavior when they're absent.
"""
import time

try:
    import speech_recognition as sr
    _sr_available = True
except Exception:
    _sr_available = False

try:
    import pyaudio
    _pyaudio_available = True
except Exception:
    _pyaudio_available = False

try:
    import pyttsx3
    _tts_available = True
except Exception:
    _tts_available = False

from utils.ui import console, type_print


class VoiceEngine:
    def __init__(self):
        self.recognizer = sr.Recognizer() if _sr_available else None
        self.engine = None
        if _tts_available:
            try:
                self.engine = pyttsx3.init()
                self.engine.setProperty('rate', 170)
            except Exception:
                self.engine = None

    def is_voice_input_available(self):
        return _sr_available and _pyaudio_available and self.recognizer is not None

    def listen(self, timeout=5, phrase_time_limit=15):
        """Listen from the default microphone and return recognized text.
        Falls back to empty string on any failure.
        """
        if not self.is_voice_input_available():
            return ''
        try:
            with sr.Microphone() as source:
                console.print('[dim]Listening... (speak now)')
                self.recognizer.adjust_for_ambient_noise(source, duration=0.6)
                audio = self.recognizer.listen(source, timeout=timeout, phrase_time_limit=phrase_time_limit)
                text = self.recognizer.recognize_google(audio)
                return text
        except Exception:
            return ''

    def listen_for_wake_word(self, wake_word="hey nova") -> bool:
        """Listen briefly for the wake word. Returns True if detected."""
        if not self.is_voice_input_available():
            return False
        try:
            with sr.Microphone() as source:
                self.recognizer.adjust_for_ambient_noise(source, duration=0.3)
                audio = self.recognizer.listen(source, timeout=1.5, phrase_time_limit=2.0)
                text = self.recognizer.recognize_google(audio).lower()
                return wake_word in text
        except Exception:
            return False

    def speak(self, text):
        """Speak text using pyttsx3; fallback to typed printing."""
        if self.engine:
            try:
                self.engine.say(text)
                self.engine.runAndWait()
            except Exception:
                type_print(text)
        else:
            type_print(text)


if __name__ == '__main__':
    ve = VoiceEngine()
    txt = ve.listen()
    print('Heard:', txt)
    ve.speak('Testing voice engine.')
