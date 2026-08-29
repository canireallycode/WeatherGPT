/**
 * WeatherGPT - Voice Interaction & Accessibility Engine
 * Provides Speech-to-Text (STT) and Text-to-Speech (TTS) for rural & hands-free accessibility.
 */

class VoiceManager {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.synth = window.speechSynthesis;
    this.initSpeechRecognition();
  }

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;
    } else {
      console.warn("Speech Recognition API not supported natively in this browser.");
    }
  }

  /**
   * Start listening for voice input
   */
  startListening(lang = 'en', onResult, onEnd, onError) {
    if (!this.recognition) {
      if (onError) onError("Voice recognition is not supported in this browser. Please use Chrome/Edge or type directly.");
      return;
    }

    const langCodes = {
      en: 'en-IN',
      hi: 'hi-IN',
      mr: 'mr-IN',
      bn: 'bn-IN',
      ta: 'ta-IN',
      te: 'te-IN'
    };

    this.recognition.lang = langCodes[lang] || 'en-IN';

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onResult) onResult(transcript);
    };

    this.recognition.onerror = (event) => {
      console.warn("Voice recognition error:", event.error);
      this.isListening = false;
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn("Recognition start error:", e);
      if (onError) onError("Microphone busy or permission denied.");
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Read aloud AI response using Text-to-Speech
   */
  speakText(text, lang = 'en') {
    if (!this.synth) return;

    // Clean markdown symbols from text before speaking
    const cleanText = text
      .replace(/#+\s/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/[`_]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .substring(0, 400); // speak essential summary

    this.synth.cancel(); // Stop any previous speech

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const langCodes = {
      en: 'en-IN',
      hi: 'hi-IN',
      mr: 'mr-IN',
      bn: 'bn-IN',
      ta: 'ta-IN',
      te: 'te-IN'
    };

    utterance.lang = langCodes[lang] || 'en-IN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick Indian voice if available in system
    const voices = this.synth.getVoices();
    const matchingVoice = voices.find(v => v.lang.includes(utterance.lang) || v.name.includes('India'));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    this.synth.speak(utterance);
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

window.voiceManager = new VoiceManager();
