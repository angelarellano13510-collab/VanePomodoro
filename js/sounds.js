/**
 * Web Audio API alarm sounds — no external files needed
 */
(function (App) {
  let audioCtx = null;

  function getContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(ctx, freq, startTime, duration, volume, type) {
    type = type || 'sine';
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  function playBell(ctx, volume) {
    const t = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach(function (f, i) {
      playTone(ctx, f, t + i * 0.15, 1.2, volume * 0.4, 'sine');
    });
  }

  function playChime(ctx, volume) {
    const notes = [587.33, 698.46, 880.0, 1046.5];
    const t = ctx.currentTime;
    notes.forEach(function (f, i) {
      playTone(ctx, f, t + i * 0.2, 0.8, volume * 0.35, 'triangle');
    });
  }

  function playPiano(ctx, volume) {
    const notes = [261.63, 329.63, 392.0, 523.25];
    const t = ctx.currentTime;
    notes.forEach(function (f, i) {
      playTone(ctx, f, t + i * 0.18, 0.6, volume * 0.3, 'sine');
    });
  }

  function playForest(ctx, volume) {
    const t = ctx.currentTime;
    playTone(ctx, 392, t, 0.5, volume * 0.2, 'sine');
    playTone(ctx, 523.25, t + 0.3, 0.5, volume * 0.2, 'sine');
    playTone(ctx, 659.25, t + 0.6, 0.8, volume * 0.25, 'triangle');

    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.08;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(volume * 0.08, t + 0.1);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(t + 0.1);
  }

  function playDigital(ctx, volume) {
    const t = ctx.currentTime;
    [880, 880, 1108.73].forEach(function (f, i) {
      playTone(ctx, f, t + i * 0.15, 0.12, volume * 0.4, 'square');
    });
  }

  const SOUND_MAP = {
    bell: playBell,
    chime: playChime,
    piano: playPiano,
    forest: playForest,
    digital: playDigital,
  };

  function playAlarm(soundName, volumePercent, muted) {
    if (muted) return;
    try {
      const ctx = getContext();
      const volume = Math.max(0, Math.min(100, volumePercent)) / 100;
      const player = SOUND_MAP[soundName] || SOUND_MAP.bell;
      player(ctx, volume);
    } catch (e) {
      console.warn('Could not play alarm sound:', e);
    }
  }

  App.sounds = { playAlarm };
})(window.PomodoroApp = window.PomodoroApp || {});
