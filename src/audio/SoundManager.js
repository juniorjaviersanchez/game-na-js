// SoundManager.js - Motor de Audio Procedural Web Audio API
// Garantiza 0% de fallas por links caídos o tiempos de carga de archivos externos.

class SoundManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.ambientGain = null;
    this.isMuted = false;
    this.sfxVolume = 0.8;
    this.ambientVolume = 0.35;
    this.ambientOsc1 = null;
    this.ambientOsc2 = null;
    this.ambientFilter = null;
    this.isAmbientPlaying = false;
    this.unlocked = false;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // SFX Gain
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Ambient Gain
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.ambientVolume, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      this.unlocked = true;
    } catch (e) {
      console.warn("Web Audio API no soportado o bloqueado inicialmente:", e);
    }
  }

  unlock() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
    }
  }

  setVolumes(sfx, ambient) {
    this.sfxVolume = sfx;
    this.ambientVolume = ambient;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(sfx, this.ctx.currentTime);
    }
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(ambient, this.ctx.currentTime);
    }
  }

  // 1. Cambio de carril (Whoosh)
  playWhoosh(direction = 1) {
    if (!this.ctx || this.isMuted) return;
    this.unlock();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

    osc.type = "sine";
    const startFreq = direction > 0 ? 320 : 480;
    const endFreq = direction > 0 ? 540 : 280;

    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.12);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    if (panner) {
      panner.pan.setValueAtTime(direction * 0.4, t);
      osc.connect(gain);
      gain.connect(panner);
      panner.connect(this.sfxGain);
    } else {
      osc.connect(gain);
      gain.connect(this.sfxGain);
    }

    osc.start(t);
    osc.stop(t + 0.13);
  }

  // 2. Salto (Jump)
  playJump() {
    if (!this.ctx || this.isMuted) return;
    this.unlock();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(460, t + 0.22);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  // 3. Aterrizaje suave (Land)
  playLand() {
    if (!this.ctx || this.isMuted) return;
    this.unlock();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  // 4. Colección de Chispa de Sabiduría (Sparkle chime)
  playCollectSpark() {
    if (!this.ctx || this.isMuted) return;
    this.unlock();
    const t = this.ctx.currentTime;

    // Acorde brillante en campana
    const notes = [659.25, 783.99, 1046.5]; // Mi, Sol, Do agudo
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t + idx * 0.035);

      gain.gain.setValueAtTime(0.18, t + idx * 0.035);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.035 + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + idx * 0.035);
      osc.stop(t + idx * 0.035 + 0.24);
    });
  }

  // 5. Impacto y Ruptura de Caja Misteriosa (Shatter 3D)
  playBoxShatter() {
    if (!this.ctx || this.isMuted) return;
    this.unlock();
    const t = this.ctx.currentTime;

    // Buffer de ruido blanco para explosión cristalina
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.09));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1400, t);
    filter.Q.setValueAtTime(2.5, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noise.start(t);

    // Tono resonante místico que reverbera
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, t); // Re5
    osc.frequency.exponentialRampToValueAtTime(293.66, t + 0.4);

    oscGain.gain.setValueAtTime(0.3, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.46);
  }

  // 6. Revelación de Pregunta Filosófica (Ethereal Question Modal)
  playQuestionReveal() {
    if (!this.ctx || this.isMuted) return;
    this.unlock();
    const t = this.ctx.currentTime;

    const chords = [523.25, 659.25, 783.99, 987.77]; // Cmaj7
    chords.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);

      gain.gain.setValueAtTime(0.15, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.65);
    });
  }

  // 7. Respuesta Correcta (Fanfarria del Despertar)
  playCorrect() {
    if (!this.ctx || this.isMuted) return;
    this.unlock();
    const t = this.ctx.currentTime;

    const notes = [
      { f: 523.25, d: 0.1 },  // Do
      { f: 659.25, d: 0.1 },  // Mi
      { f: 783.99, d: 0.12 }, // Sol
      { f: 1046.5, d: 0.35 }  // Do agudo
    ];

    let delay = 0;
    notes.forEach((n) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(n.f, t + delay);

      gain.gain.setValueAtTime(0.28, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + n.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + delay);
      osc.stop(t + delay + n.d + 0.02);

      delay += 0.09;
    });
  }

  // 8. Respuesta Incorrecta (Buzzer de Aprendizaje)
  playWrong() {
    if (!this.ctx || this.isMuted) return;
    this.unlock();
    const t = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = "sawtooth";
    osc2.type = "sawtooth";

    osc1.frequency.setValueAtTime(185, t); // F#
    osc2.frequency.setValueAtTime(174.61, t); // F (Segunda menor disonante)

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.4);
    osc2.stop(t + 0.4);
  }

  // 9. Colisión / Tropezón con Obstáculo
  playHit() {
    if (!this.ctx || this.isMuted) return;
    this.unlock();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.25);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  // 10. Victoria (200 Metros Alcanzados - Despertar Platónico)
  playVictory() {
    if (!this.ctx || this.isMuted) return;
    this.unlock();
    const t = this.ctx.currentTime;

    const melody = [
      { f: 523.25, time: 0.0, dur: 0.15 },
      { f: 659.25, time: 0.15, dur: 0.15 },
      { f: 783.99, time: 0.3, dur: 0.18 },
      { f: 1046.5, time: 0.48, dur: 0.45 },
      { f: 880.0, time: 0.95, dur: 0.18 },
      { f: 1046.5, time: 1.15, dur: 0.8 }
    ];

    melody.forEach((item) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(item.f, t + item.time);

      gain.gain.setValueAtTime(0.32, t + item.time);
      gain.gain.exponentialRampToValueAtTime(0.001, t + item.time + item.dur);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + item.time);
      osc.stop(t + item.time + item.dur + 0.05);
    });
  }

  // 11. Música Atmosférica Procedural Dinámica (Evoluciona con la distancia)
  startAmbient() {
    if (!this.ctx || this.isAmbientPlaying) return;
    this.unlock();

    try {
      this.ambientFilter = this.ctx.createBiquadFilter();
      this.ambientFilter.type = "lowpass";
      this.ambientFilter.frequency.setValueAtTime(260, this.ctx.currentTime); // Caverna profunda

      this.ambientOsc1 = this.ctx.createOscillator();
      this.ambientOsc1.type = "triangle";
      this.ambientOsc1.frequency.setValueAtTime(110, this.ctx.currentTime); // La2

      this.ambientOsc2 = this.ctx.createOscillator();
      this.ambientOsc2.type = "sine";
      this.ambientOsc2.frequency.setValueAtTime(165, this.ctx.currentTime); // Mi3

      this.ambientOsc1.connect(this.ambientFilter);
      this.ambientOsc2.connect(this.ambientFilter);
      this.ambientFilter.connect(this.ambientGain);

      this.ambientOsc1.start();
      this.ambientOsc2.start();
      this.isAmbientPlaying = true;
    } catch (e) {
      console.warn("Error al iniciar ambiente musical:", e);
    }
  }

  // Actualiza la atmósfera musical conforme el jugador avanza de 0m a 200m
  updateAmbientProgression(distance, maxDistance = 200) {
    if (!this.ambientFilter || !this.ctx || !this.isAmbientPlaying) return;
    const progress = Math.min(Math.max(distance / maxDistance, 0), 1);

    // El filtro se abre desde 260Hz (cueva oscura) hasta 2200Hz (sol radiante)
    const cutoff = 260 + progress * 1940;
    this.ambientFilter.frequency.setTargetAtTime(cutoff, this.ctx.currentTime, 0.5);

    // Los osciladores modulan de tono sombrío a armónico mayor
    if (this.ambientOsc1 && this.ambientOsc2) {
      const baseFreq = 110 + progress * 20; // 110Hz a 130Hz
      this.ambientOsc1.frequency.setTargetAtTime(baseFreq, this.ctx.currentTime, 0.5);
      this.ambientOsc2.frequency.setTargetAtTime(baseFreq * 1.5, this.ctx.currentTime, 0.5);
    }
  }

  stopAmbient() {
    if (this.isAmbientPlaying) {
      try {
        if (this.ambientOsc1) {
          this.ambientOsc1.stop();
          this.ambientOsc1.disconnect();
          this.ambientOsc1 = null;
        }
        if (this.ambientOsc2) {
          this.ambientOsc2.stop();
          this.ambientOsc2.disconnect();
          this.ambientOsc2 = null;
        }
        this.isAmbientPlaying = false;
      } catch (e) {
        console.warn("Error al detener ambiente:", e);
      }
    }
  }
}

export const soundManager = new SoundManager();
export default soundManager;
