class VoiceService {
  constructor() {
    this.recognition = null;
    this.synth = window.speechSynthesis;
    this.isListening = false;
    this.callbacks = {
      onResult: () => {},
      onListening: () => {},
      onEnd: () => {}
    };
    
    this.initRecognition();
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.callbacks.onListening(true);
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        this.callbacks.onResult(transcript);
        this.processCommand(transcript);
      };

      this.recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        this.isListening = false;
        this.callbacks.onListening(false);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.callbacks.onListening(false);
        this.callbacks.onEnd();
      };
    }
  }

  startListening(callbacks) {
    if (callbacks) {
      this.callbacks = { ...this.callbacks, ...callbacks };
    }
    
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
      } catch (e) {
        console.error("Recognition already started");
      }
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  speak(text, voiceName = null) {
    if (!this.synth) return;
    
    this.synth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (voiceName) {
      const voices = this.synth.getVoices();
      const selectedVoice = voices.find(v => v.name === voiceName);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }
    
    this.synth.speak(utterance);
  }

  processCommand(transcript) {
    if (transcript.includes("hey nova")) {
      this.speak("Yes, I'm here.");
    } else if (transcript.includes("open youtube")) {
      this.speak("Opening YouTube");
      window.open('https://youtube.com', '_blank');
    } else if (transcript.includes("open google")) {
      this.speak("Opening Google");
      window.open('https://google.com', '_blank');
    } else if (transcript.includes("open github")) {
      this.speak("Opening GitHub");
      window.open('https://github.com', '_blank');
    } else if (transcript.includes("tell time") || transcript.includes("what time is it")) {
      const time = new Date().toLocaleTimeString();
      this.speak(`The current time is ${time}`);
    } else if (transcript.includes("search")) {
      const query = transcript.replace("search", "").trim();
      this.speak(`Searching for ${query}`);
      window.open(`https://google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    } else if (transcript.includes("calculator")) {
      this.speak("I don't have a built-in calculator yet, but I can open one for you.");
      window.open('https://www.google.com/search?q=calculator', '_blank');
    }
  }
}

export default new VoiceService();
