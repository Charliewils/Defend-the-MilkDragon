function waveSample(phase, wave) {
  switch (wave) {
    case 'square':
      return Math.sin(phase) >= 0 ? 1 : -1;
    case 'triangle':
      return (2 / Math.PI) * Math.asin(Math.sin(phase));
    case 'saw': {
      const normalized = (phase / (2 * Math.PI)) % 1;
      const phase01 = normalized < 0 ? normalized + 1 : normalized;
      return 2 * phase01 - 1;
    }
    default:
      return Math.sin(phase);
  }
}

function envelope(t, duration, attack, release) {
  if (t < 0 || t > duration) return 0;
  if (t < attack) return t / attack;
  const timeToEnd = duration - t;
  if (timeToEnd < release) return Math.max(0, timeToEnd / release);
  return 1;
}

export class BufferSynthesizer {
  constructor(duration, sampleRate) {
    this.sampleRate = sampleRate;
    this.length = Math.ceil(duration * sampleRate);
    this.left = new Float32Array(this.length);
    this.right = new Float32Array(this.length);
  }

  addTone({
    freq,
    start,
    duration,
    volume = 1,
    attack = 0.01,
    release = 0.05,
    wave = 'sine',
    pan = 0,
    pitchSemitones = 0
  }) {
    const frequency = freq * 2 ** (pitchSemitones / 12);
    const startFrame = Math.floor(start * this.sampleRate);
    const endFrame = Math.min(this.length, Math.floor((start + duration) * this.sampleRate));
    const phaseInc = (2 * Math.PI * frequency) / this.sampleRate;
    let phase = 0;

    for (let frame = startFrame; frame < endFrame; frame += 1) {
      const t = (frame - startFrame) / this.sampleRate;
      const env = envelope(t, duration, attack, release);
      let sample = waveSample(phase, wave) * volume * env;
      if (wave === 'square' && volume > 0.2) {
        sample = Math.tanh(sample * 2.4);
      }
      const leftGain = 0.5 * (1 - pan);
      const rightGain = 0.5 * (1 + pan);
      this.left[frame] += sample * leftGain;
      this.right[frame] += sample * rightGain;
      phase += phaseInc;
    }
  }

  addNoiseBurst({ start, duration, volume = 0.2, attack = 0.001, release = 0.08 }) {
    const startFrame = Math.floor(start * this.sampleRate);
    const endFrame = Math.min(this.length, Math.floor((start + duration) * this.sampleRate));
    for (let frame = startFrame; frame < endFrame; frame += 1) {
      const t = (frame - startFrame) / this.sampleRate;
      const env = envelope(t, duration, attack, release);
      const sample = (Math.random() * 2 - 1) * volume * env;
      this.left[frame] += sample * 0.5;
      this.right[frame] += sample * 0.5;
    }
  }

  addSweepTone({
    freqStart,
    freqEnd,
    start,
    duration,
    volume = 1,
    attack = 0.01,
    release = 0.05,
    wave = 'sine',
    pan = 0
  }) {
    const startFrame = Math.floor(start * this.sampleRate);
    const endFrame = Math.min(this.length, Math.floor((start + duration) * this.sampleRate));
    let phase = 0;
    for (let frame = startFrame; frame < endFrame; frame += 1) {
      const t = (frame - startFrame) / this.sampleRate;
      const progress = duration <= 0 ? 1 : t / duration;
      const frequency = freqStart + (freqEnd - freqStart) * progress;
      const env = envelope(t, duration, attack, release);
      const sample = waveSample(phase, wave) * volume * env;
      const leftGain = 0.5 * (1 - pan);
      const rightGain = 0.5 * (1 + pan);
      this.left[frame] += sample * leftGain;
      this.right[frame] += sample * rightGain;
      phase += (2 * Math.PI * frequency) / this.sampleRate;
    }
  }

  addLinearFadeTone({
    freq,
    start,
    duration,
    volumeStart = 0,
    volumeEnd = 1,
    wave = 'sine',
    pan = 0
  }) {
    const startFrame = Math.floor(start * this.sampleRate);
    const endFrame = Math.min(this.length, Math.floor((start + duration) * this.sampleRate));
    const phaseInc = (2 * Math.PI * freq) / this.sampleRate;
    let phase = 0;
    for (let frame = startFrame; frame < endFrame; frame += 1) {
      const t = (frame - startFrame) / this.sampleRate;
      const progress = duration <= 0 ? 1 : t / duration;
      const volume = volumeStart + (volumeEnd - volumeStart) * progress;
      const sample = waveSample(phase, wave) * volume;
      const leftGain = 0.5 * (1 - pan);
      const rightGain = 0.5 * (1 + pan);
      this.left[frame] += sample * leftGain;
      this.right[frame] += sample * rightGain;
      phase += phaseInc;
    }
  }

  addTremoloTone({
    freq,
    start,
    duration,
    volume = 0.14,
    wave = 'sine',
    tremoloRate = 6,
    tremoloDepth = 0.18,
    attack = 0.01,
    release = 0.06
  }) {
    const startFrame = Math.floor(start * this.sampleRate);
    const endFrame = Math.min(this.length, Math.floor((start + duration) * this.sampleRate));
    const phaseInc = (2 * Math.PI * freq) / this.sampleRate;
    let phase = 0;
    for (let frame = startFrame; frame < endFrame; frame += 1) {
      const t = (frame - startFrame) / this.sampleRate;
      const env = envelope(t, duration, attack, release);
      const tremolo = 1 + tremoloDepth * Math.sin(2 * Math.PI * tremoloRate * t);
      const sample = waveSample(phase, wave) * volume * env * tremolo;
      this.left[frame] += sample * 0.5;
      this.right[frame] += sample * 0.5;
      phase += phaseInc;
    }
  }

  addBandpassNoise({
    start,
    duration,
    centerFreq = 1200,
    volume = 0.2,
    attack = 0.005,
    release = 0.06,
    sweepEnd = null
  }) {
    const startFrame = Math.floor(start * this.sampleRate);
    const endFrame = Math.min(this.length, Math.floor((start + duration) * this.sampleRate));
    let phase = 0;
    for (let frame = startFrame; frame < endFrame; frame += 1) {
      const t = (frame - startFrame) / this.sampleRate;
      const progress = duration <= 0 ? 1 : t / duration;
      const frequency = sweepEnd === null
        ? centerFreq
        : centerFreq + (sweepEnd - centerFreq) * progress;
      const env = envelope(t, duration, attack, release);
      const noise = (Math.random() * 2 - 1) * volume * env;
      const tone = Math.sin(phase);
      const sample = noise * (0.35 + 0.65 * Math.abs(tone));
      this.left[frame] += sample * 0.5;
      this.right[frame] += sample * 0.5;
      phase += (2 * Math.PI * frequency) / this.sampleRate;
    }
  }

  addReverbTail({ start, duration, decay = 0.3, mix = 0.35, delays = [0.03, 0.055, 0.08] }) {
    const startFrame = Math.floor(start * this.sampleRate);
    const endFrame = Math.min(this.length, Math.floor((start + duration) * this.sampleRate));
    const sourceLength = endFrame - startFrame;
    if (sourceLength <= 0) return;

    const sourceLeft = this.left.slice(startFrame, endFrame);
    const sourceRight = this.right.slice(startFrame, endFrame);
    for (const delay of delays) {
      const delayFrames = Math.floor(delay * this.sampleRate);
      const fadeFrames = Math.floor(decay * this.sampleRate);
      for (let i = 0; i < sourceLength; i += 1) {
        const target = startFrame + i + delayFrames;
        if (target >= this.length) break;
        const fade = Math.max(0, 1 - i / fadeFrames);
        this.left[target] += sourceLeft[i] * mix * fade;
        this.right[target] += sourceRight[i] * mix * fade;
      }
    }
  }

  addSwellTone({
    freq,
    start,
    duration,
    peakVolume = 0.2,
    wave = 'sine'
  }) {
    const startFrame = Math.floor(start * this.sampleRate);
    const endFrame = Math.min(this.length, Math.floor((start + duration) * this.sampleRate));
    const phaseInc = (2 * Math.PI * freq) / this.sampleRate;
    let phase = 0;
    for (let frame = startFrame; frame < endFrame; frame += 1) {
      const t = (frame - startFrame) / this.sampleRate;
      const progress = duration <= 0 ? 1 : t / duration;
      const swell = progress < 0.35
        ? progress / 0.35
        : Math.max(0, 1 - ((progress - 0.35) / 0.65));
      const sample = waveSample(phase, wave) * peakVolume * swell;
      this.left[frame] += sample * 0.5;
      this.right[frame] += sample * 0.5;
      phase += phaseInc;
    }
  }

  addDrone({ freq, start, duration, volume = 0.2, wave = 'sine', pitchSemitones = 0 }) {
    this.addTone({
      freq,
      start,
      duration,
      volume,
      attack: 0.2,
      release: 0.2,
      wave,
      pitchSemitones
    });
  }

  normalize(maxPeak = 0.9) {
    let peak = 0;
    for (let i = 0; i < this.length; i += 1) {
      peak = Math.max(peak, Math.abs(this.left[i]), Math.abs(this.right[i]));
    }
    if (peak <= 0.0001) return;
    const gain = maxPeak / peak;
    for (let i = 0; i < this.length; i += 1) {
      this.left[i] *= gain;
      this.right[i] *= gain;
    }
  }

  toBuffer(context) {
    const buffer = context.createBuffer(2, this.length, this.sampleRate);
    buffer.copyToChannel(this.left, 0);
    buffer.copyToChannel(this.right, 1);
    return buffer;
  }
}
