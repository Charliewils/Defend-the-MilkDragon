import { BufferSynthesizer } from './bufferSynth.js';
import { NOTE_FREQ } from './notes.js';

function renderLoop(context, duration, renderFn) {
  const synth = new BufferSynthesizer(duration, context.sampleRate);
  renderFn(synth, duration);
  synth.normalize(0.88);
  return synth.toBuffer(context);
}

export function createMainMenuBGM(context) {
  const duration = 4.8;
  const melody = ['C4', 'E4', 'G4', 'E4', 'C4', 'D4', 'F4', 'A4'];
  const noteDuration = 0.3;
  const beat = 60 / 120;
  const bassRoots = ['C3', 'C3', 'G3', 'G3', 'C3', 'C3', 'F3', 'F3'];

  return renderLoop(context, duration, (synth) => {
    for (let cycle = 0; cycle * melody.length * noteDuration < duration; cycle += 1) {
      const cycleStart = cycle * melody.length * noteDuration;
      melody.forEach((note, index) => {
        synth.addTone({
          freq: NOTE_FREQ[note],
          start: cycleStart + index * noteDuration,
          duration: noteDuration * 0.95,
          volume: 0.16,
          wave: 'sine',
          release: 0.04
        });
      });
    }

    for (let beatIndex = 0; beatIndex < duration / beat; beatIndex += 1) {
      const root = bassRoots[beatIndex % bassRoots.length];
      synth.addTone({
        freq: NOTE_FREQ[root],
        start: beatIndex * beat,
        duration: beat * 0.85,
        volume: 0.09,
        wave: 'triangle',
        release: 0.08
      });
    }
  });
}

export function createStageBGM(context) {
  const duration = 6.4;
  const beat = 60 / 140;
  const melody = ['E4', 'G4', 'A4', 'G4', 'E4', 'D4', 'C4', 'D4'];
  const chords = [
    ['E3', 'G3', 'B3'],
    ['A3', 'C4', 'E4'],
    ['D3', 'F3', 'A3'],
    ['G3', 'B3', 'D4']
  ];

  return renderLoop(context, duration, (synth) => {
    for (let beatIndex = 0; beatIndex < duration / beat; beatIndex += 1) {
      const time = beatIndex * beat;
      synth.addTone({
        freq: NOTE_FREQ.C2,
        start: time,
        duration: 0.08,
        volume: 0.22,
        wave: 'sine',
        attack: 0.001,
        release: 0.07
      });
    }

    for (let beatIndex = 0; beatIndex < duration / beat; beatIndex += 1) {
      const chord = chords[Math.floor(beatIndex / 2) % chords.length];
      const time = beatIndex * beat;
      for (const note of chord) {
        synth.addTone({
          freq: NOTE_FREQ[note],
          start: time,
          duration: beat * 1.8,
          volume: 0.05,
          wave: 'saw',
          release: 0.12
        });
      }
    }

    const noteDuration = beat * 0.45;
    for (let time = 0; time < duration; time += noteDuration) {
      const note = melody[Math.floor(time / noteDuration) % melody.length];
      synth.addTone({
        freq: NOTE_FREQ[note],
        start: time,
        duration: noteDuration * 0.9,
        volume: 0.11,
        wave: 'square',
        release: 0.03
      });
    }
  });
}

export function createEndlessBGM(context, pitchSemitones = 0) {
  const duration = 8;
  const beat = 0.5;
  const minor = ['A3', 'C4', 'D4', 'E4', 'G3', 'A3', 'B3', 'C4', 'E4', 'D4', 'A3', 'G3'];
  const rhythm = [0, 0.35, 0.75, 1.2, 1.55, 2.1, 2.45, 3.0, 3.4, 3.85, 4.2, 4.75];

  return renderLoop(context, duration, (synth) => {
    synth.addDrone({
      freq: 100,
      start: 0,
      duration,
      volume: 0.2,
      wave: 'sine',
      pitchSemitones
    });

    minor.forEach((note, index) => {
      const start = rhythm[index % rhythm.length] + Math.floor(index / rhythm.length) * 5;
      if (start >= duration) return;
      synth.addTone({
        freq: NOTE_FREQ[note],
        start,
        duration: 0.16,
        volume: 0.1,
        wave: 'square',
        release: 0.04,
        pitchSemitones
      });
    });

    for (let beatIndex = 0; beatIndex < duration / beat; beatIndex += 1) {
      synth.addNoiseBurst({
        start: beatIndex * beat,
        duration: 0.05,
        volume: 0.12,
        release: 0.04
      });
    }
  });
}

export function createBossBGM(context) {
  const duration = 6;
  const beat = 60 / 160;
  const melody = ['A3', 'C4', 'E4', 'A4', 'G4', 'E4', 'C4', 'A3'];

  return renderLoop(context, duration, (synth) => {
    synth.addDrone({
      freq: 55,
      start: 0,
      duration,
      volume: 0.18,
      wave: 'saw'
    });

    melody.forEach((note, index) => {
      const noteDuration = beat * 0.45;
      synth.addTone({
        freq: NOTE_FREQ[note],
        start: index * noteDuration,
        duration: noteDuration * 0.92,
        volume: 0.12,
        wave: 'saw',
        release: 0.03
      });
    });

    for (let beatIndex = 0; beatIndex < duration / beat; beatIndex += 1) {
      synth.addNoiseBurst({
        start: beatIndex * beat,
        duration: 0.04,
        volume: 0.16,
        release: 0.03
      });
    }
  });
}

export const BGM_RENDERERS = {
  mainMenuBGM: createMainMenuBGM,
  stageBGM: createStageBGM,
  endlessBGM: createEndlessBGM,
  bossBGM: createBossBGM
};
