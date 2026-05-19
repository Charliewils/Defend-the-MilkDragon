import { BufferSynthesizer } from './bufferSynth.js';
import { NOTE_FREQ } from './notes.js';

function renderOneShot(context, duration, renderFn) {
  const synth = new BufferSynthesizer(duration, context.sampleRate);
  renderFn(synth, duration);
  synth.normalize(0.9);
  return synth.toBuffer(context);
}

export function createSoundBuffers(context) {
  return {
    no_gold: renderOneShot(context, 0.14, (synth) => {
      synth.addSweepTone({
        freqStart: 220,
        freqEnd: 120,
        start: 0,
        duration: 0.12,
        volume: 0.16,
        wave: 'square',
        attack: 0.002,
        release: 0.06
      });
    }),
    uiClick: renderOneShot(context, 0.08, (synth) => {
      synth.addTone({
        freq: 520,
        start: 0,
        duration: 0.06,
        volume: 0.12,
        wave: 'square',
        release: 0.03
      });
    }),
    placeTower: renderOneShot(context, 0.12, (synth) => {
      synth.addTone({
        freq: 392,
        start: 0,
        duration: 0.1,
        volume: 0.14,
        wave: 'triangle',
        release: 0.04
      });
    }),
    upgrade: renderOneShot(context, 0.18, (synth) => {
      synth.addTone({
        freq: 523,
        start: 0,
        duration: 0.08,
        volume: 0.12,
        wave: 'sine',
        release: 0.03
      });
      synth.addTone({
        freq: 659,
        start: 0.06,
        duration: 0.1,
        volume: 0.12,
        wave: 'sine',
        release: 0.04
      });
    }),
    carrot_hurt: renderOneShot(context, 0.2, (synth) => {
      synth.addTremoloTone({
        freq: 300,
        start: 0,
        duration: 0.2,
        volume: 0.15,
        wave: 'sine',
        tremoloRate: 7,
        tremoloDepth: 0.2,
        release: 0.08
      });
    }),
    bossSpawn: renderOneShot(context, 0.35, (synth) => {
      synth.addTone({
        freq: 70,
        start: 0,
        duration: 0.3,
        volume: 0.2,
        wave: 'saw',
        release: 0.12
      });
      synth.addNoiseBurst({
        start: 0,
        duration: 0.12,
        volume: 0.18,
        release: 0.08
      });
    }),
    shoot_normal: renderOneShot(context, 0.08, (synth) => {
      synth.addTone({
        freq: 400,
        start: 0,
        duration: 0.08,
        volume: 0.16,
        wave: 'square',
        attack: 0.001,
        release: 0.06
      });
    }),
    shoot_ice: renderOneShot(context, 0.22, (synth) => {
      synth.addSweepTone({
        freqStart: 800,
        freqEnd: 1200,
        start: 0,
        duration: 0.12,
        volume: 0.14,
        wave: 'sine',
        release: 0.04
      });
      synth.addSweepTone({
        freqStart: 800,
        freqEnd: 1200,
        start: 0.03,
        duration: 0.12,
        volume: 0.06,
        wave: 'sine',
        release: 0.05
      });
      synth.addReverbTail({
        start: 0,
        duration: 0.12,
        decay: 0.18,
        mix: 0.28
      });
    }),
    shoot_titan: renderOneShot(context, 0.15, (synth) => {
      synth.addTone({
        freq: 120,
        start: 0,
        duration: 0.15,
        volume: 0.2,
        wave: 'sine',
        attack: 0.004,
        release: 0.12
      });
    }),
    shoot_hell: renderOneShot(context, 0.12, (synth) => {
      synth.addNoiseBurst({
        start: 0,
        duration: 0.04,
        volume: 0.18,
        release: 0.03
      });
      synth.addNoiseBurst({
        start: 0.05,
        duration: 0.04,
        volume: 0.16,
        release: 0.03
      });
    }),
    shoot_lava: renderOneShot(context, 0.1, (synth) => {
      synth.addBandpassNoise({
        start: 0,
        duration: 0.1,
        centerFreq: 900,
        sweepEnd: 2200,
        volume: 0.16,
        release: 0.05
      });
    }),
    shoot_spread: renderOneShot(context, 0.28, (synth) => {
      for (let i = 0; i < 8; i += 1) {
        synth.addTone({
          freq: 360,
          start: i * 0.03,
          duration: 0.045,
          volume: 0.055,
          wave: 'sine',
          attack: 0.002,
          release: 0.03
        });
      }
    }),
    shoot_butter: renderOneShot(context, 0.1, (synth) => {
      synth.addBandpassNoise({
        start: 0,
        duration: 0.1,
        centerFreq: 200,
        volume: 0.17,
        attack: 0.002,
        release: 0.05
      });
    }),
    hit_normal: renderOneShot(context, 0.05, (synth) => {
      synth.addNoiseBurst({
        start: 0,
        duration: 0.05,
        volume: 0.14,
        release: 0.04
      });
    }),
    hit_ice: renderOneShot(context, 0.1, (synth) => {
      synth.addSweepTone({
        freqStart: 1000,
        freqEnd: 400,
        start: 0,
        duration: 0.1,
        volume: 0.13,
        wave: 'sine',
        release: 0.04
      });
    }),
    hit_butter: renderOneShot(context, 0.12, (synth) => {
      synth.addTone({
        freq: 150,
        start: 0,
        duration: 0.12,
        volume: 0.13,
        wave: 'sine',
        attack: 0.002,
        release: 0.07
      });
      synth.addNoiseBurst({
        start: 0,
        duration: 0.05,
        volume: 0.09,
        release: 0.04
      });
    }),
    hit_burn: renderOneShot(context, 0.08, (synth) => {
      synth.addBandpassNoise({
        start: 0,
        duration: 0.08,
        centerFreq: 1400,
        volume: 0.12,
        release: 0.05
      });
    }),
    enemy_die: renderOneShot(context, 0.12, (synth) => {
      synth.addTone({
        freq: 200,
        start: 0,
        duration: 0.12,
        volume: 0.14,
        wave: 'sine',
        attack: 0.001,
        release: 0.1
      });
    }),
    boss_die: renderOneShot(context, 0.9, (synth) => {
      synth.addSwellTone({
        freq: 100,
        start: 0,
        duration: 0.6,
        peakVolume: 0.22,
        wave: 'sine'
      });
      synth.addNoiseBurst({
        start: 0,
        duration: 0.6,
        volume: 0.18,
        attack: 0.02,
        release: 0.35
      });
      synth.addReverbTail({
        start: 0.45,
        duration: 0.3,
        decay: 0.3,
        mix: 0.4
      });
    }),
    stealth_vanish: renderOneShot(context, 0.3, (synth) => {
      synth.addLinearFadeTone({
        freq: 600,
        start: 0,
        duration: 0.3,
        volumeStart: 0.14,
        volumeEnd: 0,
        wave: 'sine'
      });
    }),
    stealth_appear: renderOneShot(context, 0.3, (synth) => {
      synth.addLinearFadeTone({
        freq: 600,
        start: 0,
        duration: 0.3,
        volumeStart: 0,
        volumeEnd: 0.14,
        wave: 'sine'
      });
    }),
    victory: renderOneShot(context, 1.35, (synth) => {
      const melody = [NOTE_FREQ.C4, NOTE_FREQ.E4, NOTE_FREQ.G4, NOTE_FREQ.C5];
      melody.forEach((freq, index) => {
        synth.addTone({
          freq,
          start: index * 0.2,
          duration: 0.2,
          volume: 0.14,
          wave: 'sine',
          release: 0.05
        });
      });
      synth.addTone({
        freq: NOTE_FREQ.C5,
        start: 0.8,
        duration: 0.5,
        volume: 0.16,
        wave: 'sine',
        attack: 0.01,
        release: 0.35
      });
    }),
    defeat: renderOneShot(context, 1.2, (synth) => {
      synth.addSweepTone({
        freqStart: NOTE_FREQ.G4,
        freqEnd: NOTE_FREQ.C3,
        start: 0,
        duration: 1.2,
        volume: 0.16,
        wave: 'sine',
        attack: 0.02,
        release: 0.55
      });
    }),
    star_earn_0: renderOneShot(context, 0.12, (synth) => {
      synth.addTone({
        freq: NOTE_FREQ.E5,
        start: 0,
        duration: 0.1,
        volume: 0.12,
        wave: 'sine',
        release: 0.05
      });
    }),
    star_earn_1: renderOneShot(context, 0.12, (synth) => {
      synth.addTone({
        freq: NOTE_FREQ.G5,
        start: 0,
        duration: 0.1,
        volume: 0.12,
        wave: 'sine',
        release: 0.05
      });
    }),
    star_earn_2: renderOneShot(context, 0.12, (synth) => {
      synth.addTone({
        freq: NOTE_FREQ.C6,
        start: 0,
        duration: 0.1,
        volume: 0.12,
        wave: 'sine',
        release: 0.05
      });
    }),
    butter_root: renderOneShot(context, 0.15, (synth) => {
      synth.addSweepTone({
        freqStart: 400,
        freqEnd: 200,
        start: 0,
        duration: 0.15,
        volume: 0.12,
        wave: 'sine',
        attack: 0.002,
        release: 0.06
      });
    }),
    armor_immune: renderOneShot(context, 0.1, (synth) => {
      synth.addTone({
        freq: 800,
        start: 0,
        duration: 0.08,
        volume: 0.18,
        wave: 'sine',
        attack: 0.001,
        release: 0.07
      });
    }),
    worm_split: renderOneShot(context, 0.32, (synth) => {
      synth.addNoiseBurst({
        start: 0,
        duration: 0.2,
        volume: 0.22,
        attack: 0.002,
        release: 0.14
      });
      synth.addTone({
        freq: 800,
        start: 0.18,
        duration: 0.1,
        volume: 0.14,
        wave: 'sine',
        attack: 0.002,
        release: 0.08
      });
    })
  };
}
