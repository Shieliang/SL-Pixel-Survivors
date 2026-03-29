const Audio = {
  ctx: null,
  bgmNodes: [],
  bgmPlaying: false,
  muted: false,
  masterGain: null,

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.5;
    this.masterGain.connect(this.ctx.destination);
  },

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },

  toggleMute() {
    this.muted = !this.muted;
    this.masterGain.gain.value = this.muted ? 0 : 0.5;
    return this.muted;
  },

  // ---- helpers ----
  _osc(type, freq, start, duration, gainVal, destination) {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gainVal, start);
    g.gain.exponentialRampToValueAtTime(0.001, start + duration);
    g.connect(destination || this.masterGain);

    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, start);
    o.connect(g);
    o.start(start);
    o.stop(start + duration + 0.01);
  },

  _noise(start, duration, gainVal, filterFreq) {
    const bufSize = this.ctx.sampleRate * duration;
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

    const src = this.ctx.createBufferSource();
    src.buffer = buf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq || 800;
    filter.Q.value = 1;

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gainVal, start);
    g.gain.exponentialRampToValueAtTime(0.001, start + duration);

    src.connect(filter);
    filter.connect(g);
    g.connect(this.masterGain);
    src.start(start);
    src.stop(start + duration + 0.01);
  },

  // ---- SFX ----
  shoot() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this._osc('square', 880, t, 0.04, 0.15);
    this._osc('square', 440, t + 0.02, 0.06, 0.1);
  },

  shootExtra() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this._osc('square', 660, t, 0.03, 0.08);
  },

  swordSwing() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this._noise(t, 0.18, 0.3, 1200);
    this._osc('sawtooth', 200, t, 0.18, 0.08);
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(400, t);
    o.frequency.exponentialRampToValueAtTime(80, t + 0.18);
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.connect(g); g.connect(this.masterGain);
    o.start(t); o.stop(t + 0.2);
  },

  enemyHit() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this._noise(t, 0.06, 0.2, 600);
    this._osc('square', 150, t, 0.06, 0.1);
  },

  enemyDie() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this._noise(t, 0.12, 0.35, 400);
    this._osc('sawtooth', 120, t, 0.1, 0.15);
    this._osc('square', 60, t + 0.05, 0.1, 0.1);
  },

  bossDie() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this._noise(t, 0.4, 0.5, 200);
    [120, 90, 60].forEach((f, i) => this._osc('sawtooth', f, t + i * 0.08, 0.25, 0.2));
  },

  playerHurt() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this._noise(t, 0.15, 0.4, 300);
    this._osc('sawtooth', 80, t, 0.15, 0.2);
  },

  levelUp() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [523, 659, 784, 1047].forEach((f, i) => {
      this._osc('sine', f, t + i * 0.1, 0.15, 0.25);
    });
  },

  goldPickup() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this._osc('sine', 1200, t, 0.06, 0.2);
    this._osc('sine', 1600, t + 0.04, 0.06, 0.15);
  },

  xpPickup() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this._osc('sine', 800, t, 0.05, 0.1);
  },

  waveAlert() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this._osc('sawtooth', 110, t, 0.3, 0.3);
    this._osc('sawtooth', 110, t + 0.35, 0.3, 0.3);
    this._osc('sawtooth', 140, t + 0.7, 0.4, 0.35);
  },

  gameOver() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [440, 370, 311, 220].forEach((f, i) => {
      this._osc('sine', f, t + i * 0.22, 0.3, 0.3);
    });
    this._noise(t + 0.7, 0.4, 0.2, 200);
  },

  // ---- BGM ----
  // Procedural chiptune loop using oscillators + sequencer
  startBGM() {
    if (!this.ctx || this.bgmPlaying) return;
    this.bgmPlaying = true;

    const bpm = 140;
    const step = 60 / bpm / 2; // 8th note duration

    // Melody notes (C minor pentatonic feel)
    const melody = [
      523, 622, 784, 622, 523, 415, 466, 523,
      622, 784, 932, 784, 622, 523, 466, 415,
      523, 622, 784, 932, 784, 622, 784, 622,
      523, 466, 415, 466, 523, 622, 523, 0
    ];

    // Bass line
    const bass = [
      131, 0, 131, 0, 156, 0, 156, 0,
      175, 0, 175, 0, 131, 0, 131, 0,
      131, 0, 131, 0, 156, 0, 156, 0,
      175, 0, 196, 0, 131, 0, 131, 0
    ];

    // Chord pads (every 4 steps)
    const chords = [
      [131, 156, 196], [131, 156, 196],
      [117, 147, 175], [117, 147, 175],
      [131, 156, 196], [131, 156, 196],
      [117, 147, 175], [131, 156, 196]
    ];

    const loopDuration = step * melody.length;

    const playLoop = (startTime) => {
      if (!this.bgmPlaying) return;

      // Melody
      melody.forEach((freq, i) => {
        if (freq === 0) return;
        const t = startTime + i * step;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'square';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.08, t);
        g.gain.setValueAtTime(0.06, t + step * 0.6);
        g.gain.exponentialRampToValueAtTime(0.001, t + step * 0.9);
        o.connect(g); g.connect(this.masterGain);
        o.start(t); o.stop(t + step);
        this.bgmNodes.push(o);
      });

      // Bass
      bass.forEach((freq, i) => {
        if (freq === 0) return;
        const t = startTime + i * step;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'triangle';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.12, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + step * 1.8);
        o.connect(g); g.connect(this.masterGain);
        o.start(t); o.stop(t + step * 2);
        this.bgmNodes.push(o);
      });

      // Chord pads
      chords.forEach((chord, i) => {
        const t = startTime + i * step * 4;
        chord.forEach(freq => {
          const o = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          o.type = 'sine';
          o.frequency.value = freq;
          g.gain.setValueAtTime(0.0, t);
          g.gain.linearRampToValueAtTime(0.04, t + step);
          g.gain.setValueAtTime(0.04, t + step * 3);
          g.gain.linearRampToValueAtTime(0.0, t + step * 4);
          o.connect(g); g.connect(this.masterGain);
          o.start(t); o.stop(t + step * 4 + 0.05);
          this.bgmNodes.push(o);
        });
      });

      // Percussion (noise bursts)
      for (let i = 0; i < melody.length; i++) {
        const t = startTime + i * step;
        // Kick on beats 1 and 3
        if (i % 8 === 0 || i % 8 === 4) {
          const o = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(150, t);
          o.frequency.exponentialRampToValueAtTime(40, t + 0.1);
          g.gain.setValueAtTime(0.3, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
          o.connect(g); g.connect(this.masterGain);
          o.start(t); o.stop(t + 0.2);
          this.bgmNodes.push(o);
        }
        // Hi-hat on every step
        this._noise(t, 0.04, 0.04, 8000);
      }

      // Schedule next loop
      const nextStart = startTime + loopDuration;
      const delay = (nextStart - this.ctx.currentTime) * 1000 - 100;
      const timer = setTimeout(() => playLoop(nextStart), Math.max(0, delay));
      this.bgmNodes.push({ stop: () => clearTimeout(timer) });
    };

    playLoop(this.ctx.currentTime + 0.1);
  },

  stopBGM() {
    this.bgmPlaying = false;
    this.bgmNodes.forEach(n => { try { n.stop(); } catch {} });
    this.bgmNodes = [];
  }
};
