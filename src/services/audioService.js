/**
 * Web Audio API Synthwave / Lo-Fi Ambient Generator
 * Generates real-time procedural focus beats without any external audio files.
 */

class AudioBeatsEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.activeNodes = [];
    this.currentMode = 'synthwave';
    this.volume = 0.3;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.volume;
    this.masterGain.connect(this.ctx.destination);
  }

  setVolume(v) {
    this.volume = v;
    if (this.masterGain) this.masterGain.gain.value = v;
  }

  stop() {
    if (!this.ctx) return;
    this.activeNodes.forEach(node => {
      try { node.stop(); } catch (e) {}
      try { node.disconnect(); } catch (e) {}
    });
    this.activeNodes = [];
    this.isPlaying = false;
  }

  play(mode = 'synthwave') {
    this.init();
    this.stop();
    this.currentMode = mode;
    this.ctx.resume();

    if (mode === 'synthwave') this._playSynthwave();
    else if (mode === 'lofi') this._playLoFi();
    else if (mode === 'binaural') this._playBinaural();
    else if (mode === 'whitenoise') this._playWhiteNoise();

    this.isPlaying = true;
  }

  toggle(mode = 'synthwave') {
    if (this.isPlaying) this.stop();
    else this.play(mode);
    return this.isPlaying;
  }

  _playSynthwave() {
    // Deep bass drone (C2 ~ 65.41 Hz) + pad chord (C minor)
    const bassFreq = 65.41;
    const padFreqs = [130.81, 155.56, 196.0]; // C3, Eb3, G3

    const bassOsc = this.ctx.createOscillator();
    bassOsc.type = 'sawtooth';
    bassOsc.frequency.value = bassFreq;
    const bassFilter = this.ctx.createBiquadFilter();
    bassFilter.type = 'lowpass';
    bassFilter.frequency.value = 400;
    const bassGain = this.ctx.createGain();
    bassGain.gain.value = 0.35;
    bassOsc.connect(bassFilter).connect(bassGain).connect(this.masterGain);
    bassOsc.start();
    this.activeNodes.push(bassOsc);

    // Pad chord with slight detune for warmth
    padFreqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      osc.detune.value = (Math.random() - 0.5) * 10;
      const g = this.ctx.createGain();
      g.gain.value = 0.08;
      // slow LFO tremolo
      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.1 + i * 0.03;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 0.03;
      lfo.connect(lfoGain).connect(g.gain);
      lfo.start();
      osc.connect(g).connect(this.masterGain);
      osc.start();
      this.activeNodes.push(osc, lfo);
    });
  }

  _playLoFi() {
    // Soft pink noise + slow modulated lowpass
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99 * b0 + white * 0.05;
      b1 = 0.5 * b0 + 0.5 * b1;
      b2 = 0.3 * b1 + 0.7 * b2;
      data[i] = b2 * 3.5;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;

    // Slow filter sweep
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.05;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 200;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();

    const g = this.ctx.createGain();
    g.gain.value = 0.4;
    noise.connect(filter).connect(g).connect(this.masterGain);
    noise.start();
    this.activeNodes.push(noise, lfo);
  }

  _playBinaural() {
    // 200 Hz left, 210 Hz right -> 10 Hz alpha beat
    const left = this.ctx.createOscillator();
    left.frequency.value = 200;
    const right = this.ctx.createOscillator();
    right.frequency.value = 210;
    const splitter = this.ctx.createChannelMerger(2);
    const gL = this.ctx.createGain(); gL.gain.value = 0.3;
    const gR = this.ctx.createGain(); gR.gain.value = 0.3;
    left.connect(gL).connect(splitter, 0, 0);
    right.connect(gR).connect(splitter, 0, 1);
    splitter.connect(this.masterGain);
    left.start(); right.start();
    this.activeNodes.push(left, right);
  }

  _playWhiteNoise() {
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    const g = this.ctx.createGain();
    g.gain.value = 0.2;
    noise.connect(filter).connect(g).connect(this.masterGain);
    noise.start();
    this.activeNodes.push(noise);
  }
}

export const audioBeatsEngine = new AudioBeatsEngine();

export const BEATS_MODES = [
  { id: 'synthwave', name: 'Synthwave Drone', icon: 'Music' },
  { id: 'lofi', name: 'Lo-Fi Rain', icon: 'CloudRain' },
  { id: 'binaural', name: 'Alpha Binaural', icon: 'Brain' },
  { id: 'whitenoise', name: 'White Noise', icon: 'Radio' }
];
