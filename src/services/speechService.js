/**
 * Web Speech API Pod-Notes player for formula revision during commutes.
 * Generates spoken descriptions of key formulas with ambient synth backing.
 */

class SpeechService {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.utterance = null;
    this.isPlaying = false;
  }

  speak(text, opts = {}) {
    if (!this.synth) {
      console.warn('Web Speech API not supported in this browser.');
      return false;
    }
    this.stop();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = opts.rate || 0.95;
    utterance.pitch = opts.pitch || 1.0;
    utterance.volume = opts.volume || 1.0;

    // Try pick an English voice
    const voices = this.synth.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('google'));
    if (englishVoice) utterance.voice = englishVoice;

    utterance.onend = () => { this.isPlaying = false; };
    utterance.onerror = () => { this.isPlaying = false; };

    this.utterance = utterance;
    this.synth.speak(utterance);
    this.isPlaying = true;
    return true;
  }

  stop() {
    if (this.synth && this.synth.speaking) this.synth.cancel();
    this.isPlaying = false;
  }

  togglePlayPause(text, opts) {
    if (this.isPlaying) this.stop();
    else this.speak(text, opts);
    return this.isPlaying;
  }
}

export const speechService = new SpeechService();
