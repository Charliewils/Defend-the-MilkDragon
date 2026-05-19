const STORAGE_KEY = 'defense-radish-audio-settings';

const DEFAULT_SETTINGS = {
  bgmVolume: 0.4,
  sfxVolume: 0.7,
  bgmMuted: false,
  sfxMuted: false
};

export function loadAudioSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return {
      bgmVolume: clamp01(parsed.bgmVolume, DEFAULT_SETTINGS.bgmVolume),
      sfxVolume: clamp01(parsed.sfxVolume, DEFAULT_SETTINGS.sfxVolume),
      bgmMuted: Boolean(parsed.bgmMuted),
      sfxMuted: Boolean(parsed.sfxMuted)
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveAudioSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    bgmVolume: clamp01(settings.bgmVolume, DEFAULT_SETTINGS.bgmVolume),
    sfxVolume: clamp01(settings.sfxVolume, DEFAULT_SETTINGS.sfxVolume),
    bgmMuted: Boolean(settings.bgmMuted),
    sfxMuted: Boolean(settings.sfxMuted)
  }));
}

function clamp01(value, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.min(1, number));
}
