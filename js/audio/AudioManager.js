import { BGM_RENDERERS } from './bgmFactory.js';
import { createSoundBuffers } from './sfxFactory.js';
import { loadAudioSettings, saveAudioSettings } from '../storage/audioSettings.js';

const BGM_FADE_SECONDS = 0.5;

export class AudioManager {
  constructor() {
    this.context = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.bgmVolume = 0.4;
    this.sfxVolume = 0.7;
    this.bgmMuted = false;
    this.sfxMuted = false;
    this.bgmBuffers = new Map();
    this.sfxBuffers = new Map();
    this.currentBgmName = null;
    this.bgmSource = null;
    this.bgmVoiceGain = null;
    this.bgmFadeToken = 0;
    this.bossActive = false;
    this.restoreBgmName = null;
    this.endlessWave = 1;
    this.gestureBound = false;
    this.pendingBgm = null;
    this.settingsListeners = new Set();
    this.applyPersistedSettings();
  }

  applyPersistedSettings() {
    const settings = loadAudioSettings();
    this.bgmVolume = settings.bgmVolume;
    this.sfxVolume = settings.sfxVolume;
    this.bgmMuted = settings.bgmMuted;
    this.sfxMuted = settings.sfxMuted;
    this.applyBgmGain();
    this.applySfxGain();
  }

  persistSettings() {
    saveAudioSettings({
      bgmVolume: this.bgmVolume,
      sfxVolume: this.sfxVolume,
      bgmMuted: this.bgmMuted,
      sfxMuted: this.sfxMuted
    });
    this.notifySettingsListeners();
  }

  onSettingsChange(listener) {
    this.settingsListeners.add(listener);
    return () => this.settingsListeners.delete(listener);
  }

  notifySettingsListeners() {
    for (const listener of this.settingsListeners) {
      listener(this.getSettingsState());
    }
  }

  getSettingsState() {
    return {
      bgmVolume: this.bgmVolume,
      sfxVolume: this.sfxVolume,
      bgmMuted: this.bgmMuted,
      sfxMuted: this.sfxMuted
    };
  }

  applyBgmGain() {
    if (!this.bgmGain) return;
    this.bgmGain.gain.value = this.bgmMuted ? 0 : this.bgmVolume;
  }

  applySfxGain() {
    if (!this.sfxGain) return;
    this.sfxGain.gain.value = this.sfxMuted ? 0 : this.sfxVolume;
  }

  bindUserGesture(target = document) {
    if (this.gestureBound) return;
    this.gestureBound = true;

    const onGesture = () => {
      if (!this.ensureContext({ fromGesture: true })) return;
      this.flushPendingBgm();
      target.removeEventListener('pointerdown', onGesture);
      target.removeEventListener('keydown', onGesture);
    };

    target.addEventListener('pointerdown', onGesture);
    target.addEventListener('keydown', onGesture);
  }

  flushPendingBgm() {
    if (!this.pendingBgm || !this.context) return;
    const pending = this.pendingBgm;
    this.pendingBgm = null;
    this.setBGM(pending.name, pending.options);
  }

  ensureContext({ fromGesture = false } = {}) {
    if (!this.context) {
      if (!fromGesture) return null;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      this.context = new AudioContextClass();
      this.bgmGain = this.context.createGain();
      this.sfxGain = this.context.createGain();
      this.applyBgmGain();
      this.applySfxGain();
      this.bgmGain.connect(this.context.destination);
      this.sfxGain.connect(this.context.destination);
      this.loadSoundBuffers();
    }

    if (this.context.state === 'suspended') {
      this.context.resume();
    }

    return this.context;
  }

  loadSoundBuffers() {
    if (!this.context) return;
    for (const [name, renderer] of Object.entries(BGM_RENDERERS)) {
      if (!this.bgmBuffers.has(name)) {
        this.bgmBuffers.set(name, renderer(this.context, 0));
      }
    }
    const sfx = createSoundBuffers(this.context);
    for (const [name, buffer] of Object.entries(sfx)) {
      this.sfxBuffers.set(name, buffer);
    }
  }

  setBGMVolume(volume) {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    this.applyBgmGain();
    this.persistSettings();
  }

  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.applySfxGain();
    this.persistSettings();
  }

  toggleBGMMute() {
    this.bgmMuted = !this.bgmMuted;
    this.applyBgmGain();
    this.persistSettings();
    if (!this.bgmMuted) {
      const pending = this.pendingBgm;
      const target = pending?.name || this.currentBgmName;
      if (target) {
        this.setBGM(target, pending?.options || { wave: this.endlessWave });
      }
    }
    return this.bgmMuted;
  }

  toggleSFXMute() {
    this.sfxMuted = !this.sfxMuted;
    this.applySfxGain();
    this.persistSettings();
    return this.sfxMuted;
  }

  getEndlessPitchSemitones(wave = this.endlessWave) {
    return Math.floor(Math.max(1, wave - 1) / 5);
  }

  getBGMBuffer(name) {
    if (!this.bgmBuffers.has(name)) {
      const renderer = BGM_RENDERERS[name];
      if (!renderer) return null;
      this.bgmBuffers.set(name, renderer(this.context, 0));
    }
    return this.bgmBuffers.get(name);
  }

  stopCurrentBGM(fadeSeconds = BGM_FADE_SECONDS) {
    if (!this.bgmSource || !this.bgmVoiceGain || !this.context) return Promise.resolve();

    const fadeToken = ++this.bgmFadeToken;
    const source = this.bgmSource;
    const gain = this.bgmVoiceGain;
    const now = this.context.currentTime;

    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + fadeSeconds);

    return new Promise((resolve) => {
      window.setTimeout(() => {
        if (fadeToken !== this.bgmFadeToken) {
          resolve();
          return;
        }
        try {
          source.stop();
        } catch {
          // already stopped
        }
        source.disconnect();
        gain.disconnect();
        if (this.bgmSource === source) {
          this.bgmSource = null;
          this.bgmVoiceGain = null;
        }
        resolve();
      }, fadeSeconds * 1000 + 30);
    });
  }

  async setBGM(name, { fade = BGM_FADE_SECONDS, wave = this.endlessWave } = {}) {
    if (!name) return;
    this.endlessWave = wave;

    if (!this.context) {
      this.pendingBgm = { name, options: { fade, wave } };
      return;
    }

    const context = this.ensureContext({ fromGesture: true });
    if (!context) return;
    if (this.bgmMuted) {
      this.currentBgmName = name;
      this.pendingBgm = { name, options: { fade, wave } };
      return;
    }
    if (this.bossActive && name !== 'bossBGM') {
      this.restoreBgmName = name;
      return;
    }

    if (this.currentBgmName === name && !this.bossActive && this.bgmSource) {
      if (name === 'endlessBGM') {
        this.applyEndlessPitch();
      }
      return;
    }

    const buffer = this.getBGMBuffer(name);
    if (!buffer) return;

    await this.stopCurrentBGM(fade);

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const voiceGain = context.createGain();
    voiceGain.gain.value = 0;
    source.connect(voiceGain);
    voiceGain.connect(this.bgmGain);

    const now = context.currentTime;
    source.start(now);
    voiceGain.gain.linearRampToValueAtTime(1, now + fade);

    this.bgmSource = source;
    this.bgmVoiceGain = voiceGain;
    this.currentBgmName = name;
    this.pendingBgm = null;

    if (name === 'endlessBGM') {
      this.applyEndlessPitch();
    }
  }

  applyEndlessPitch() {
    if (!this.bgmSource || this.currentBgmName !== 'endlessBGM') return;
    const semitones = this.getEndlessPitchSemitones(this.endlessWave);
    this.bgmSource.detune.value = semitones * 100;
  }

  setEndlessWave(wave) {
    this.endlessWave = wave;
    if (this.currentBgmName === 'endlessBGM' && !this.bossActive) {
      this.applyEndlessPitch();
    }
  }

  async enterBossBattle() {
    if (this.bossActive) return;
    this.bossActive = true;
    this.restoreBgmName = this.currentBgmName || this.restoreBgmName || 'stageBGM';
    await this.setBGM('bossBGM');
    this.playSound('bossSpawn');
  }

  async exitBossBattle() {
    if (!this.bossActive) return;
    this.bossActive = false;
    const restoreName = this.restoreBgmName || (this.endlessWave > 0 ? 'endlessBGM' : 'stageBGM');
    this.restoreBgmName = null;
    await this.setBGM(restoreName, { wave: this.endlessWave });
  }

  playSound(name) {
    if (this.sfxMuted) return;
    if (!this.context) return;
    const context = this.ensureContext({ fromGesture: true });
    if (!context) return;
    const buffer = this.sfxBuffers.get(name);
    if (!buffer) return;

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.sfxGain);
    source.start();
  }
}

export const audioManager = new AudioManager();
