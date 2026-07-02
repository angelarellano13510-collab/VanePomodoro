/**
 * Pomodoro timer engine — work, short break, long break cycles
 */
(function (App) {
  const { loadSettings, loadStats, saveStats, getTodayKey, formatFocusTime } = App.storage;
  const { playAlarm } = App.sounds;

  const MODES = {
    WORK: 'work',
    SHORT_BREAK: 'short',
    LONG_BREAK: 'long',
  };

  const MODE_LABELS = {
    work: 'Focus',
    short: 'Short Break',
    long: 'Long Break',
  };

  const MODE_ICONS = {
    work: '🌷',
    short: '🌸',
    long: '💐',
  };

  let mode = MODES.WORK;
  let remainingSeconds = 0;
  let intervalId = null;
  let isRunning = false;
  let isPaused = false;
  let completedPomodoros = 0;
  let sessionPomodoros = 0;
  let els = {};
  let onStatsUpdate = null;
  let startTime = null;
  let pausedAt = null;
  let expectedRemaining = 0;

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function getDurationForMode(m, settings) {
    switch (m) {
      case MODES.WORK: return settings.workDuration * 60;
      case MODES.SHORT_BREAK: return settings.shortBreak * 60;
      case MODES.LONG_BREAK: return settings.longBreak * 60;
      default: return settings.workDuration * 60;
    }
  }

  function applyModeTheme() {
    document.body.classList.remove('mode-focus', 'mode-break', 'mode-long-break');
    if (mode === MODES.WORK) {
      document.body.classList.add('mode-focus');
    } else if (mode === MODES.SHORT_BREAK) {
      document.body.classList.add('mode-break');
    } else {
      document.body.classList.add('mode-long-break');
    }
  }

  function updateSessionStats() {
    if (els.sessionPomodoros) els.sessionPomodoros.textContent = sessionPomodoros;
    // Today's focus time persists in localStorage (survives refresh)
    if (els.sessionFocusTime) {
      els.sessionFocusTime.textContent = formatFocusTime(loadStats().todayFocusSeconds);
    }
  }

  function updateDisplay() {
    if (els.display) els.display.textContent = formatTime(remainingSeconds);
    if (els.modeLabel) els.modeLabel.textContent = MODE_LABELS[mode];
    if (els.modeIcon) els.modeIcon.textContent = MODE_ICONS[mode];

    if (els.timerCard) {
      els.timerCard.classList.toggle('running', isRunning && !isPaused);
    }

    applyModeTheme();
    updateSessionStats();
  }

  function updateButtons() {
    if (!els.btnStart) return;
    els.btnStart.disabled = isRunning && !isPaused;
    els.btnPause.disabled = !isRunning || isPaused;
    els.btnResume.disabled = !isPaused;
    // Skip Break only active during break modes
    if (els.btnSkip) els.btnSkip.disabled = mode === MODES.WORK;
  }

  function recordCompletedPomodoro(settings) {
    const stats = loadStats();
    const today = getTodayKey();
    const workSeconds = settings.workDuration * 60;

    stats.todayDate = today;
    stats.todayPomodoros += 1;
    stats.todayFocusSeconds += workSeconds;
    stats.totalPomodoros += 1;

    if (stats.lastActivityDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = yesterday.getFullYear() + '-' +
        String(yesterday.getMonth() + 1).padStart(2, '0') + '-' +
        String(yesterday.getDate()).padStart(2, '0');

      if (stats.lastActivityDate === yesterdayKey) {
        stats.currentStreak += 1;
      } else {
        stats.currentStreak = 1;
      }
      stats.lastActivityDate = today;
      stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
    }

    saveStats(stats);
    sessionPomodoros += 1;

    if (onStatsUpdate) onStatsUpdate(stats);
  }

  function getNextMode(settings) {
    if (mode === MODES.WORK) {
      completedPomodoros += 1;
      if (completedPomodoros % settings.longInterval === 0) {
        return MODES.LONG_BREAK;
      }
      return MODES.SHORT_BREAK;
    }
    return MODES.WORK;
  }

  function onSegmentComplete() {
    const settings = loadSettings();
    playAlarm(settings.alarmSound, settings.alarmVolume, settings.muted);

    if (mode === MODES.WORK) {
      recordCompletedPomodoro(settings);
    }

    const next = getNextMode(settings);
    switchMode(next, settings);

    const shouldAutoStart =
      (next === MODES.WORK && settings.autoStartNext) ||
      (next !== MODES.WORK && settings.autoStartBreaks);

    if (shouldAutoStart) {
      startTimer();
    } else {
      isRunning = false;
      isPaused = false;
      updateButtons();
      updateDisplay();
    }
  }

  function switchMode(newMode, settings) {
    const s = settings || loadSettings();
    mode = newMode;
    remainingSeconds = getDurationForMode(mode, s);
    isRunning = false;
    isPaused = false;
    startTime = null;
    pausedAt = null;
    expectedRemaining = 0;
    clearInterval(intervalId);
    intervalId = null;
    updateDisplay();
    updateButtons();
  }

  function tick() {
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    remainingSeconds = expectedRemaining - elapsed;
    
    if (remainingSeconds <= 0) {
      clearInterval(intervalId);
      intervalId = null;
      remainingSeconds = 0;
      onSegmentComplete();
      return;
    }
    updateDisplay();
  }

  function startTimer() {
    if (isRunning && !isPaused) return;
    isRunning = true;
    isPaused = false;
    startTime = Date.now();
    expectedRemaining = remainingSeconds;
    if (!intervalId) intervalId = setInterval(tick, 1000);
    updateButtons();
    updateDisplay();
  }

  function pauseTimer() {
    if (!isRunning || isPaused) return;
    isPaused = true;
    pausedAt = Date.now();
    clearInterval(intervalId);
    intervalId = null;
    updateButtons();
    updateDisplay();
  }

  function resumeTimer() {
    if (!isPaused) return;
    const pauseDuration = Math.floor((Date.now() - pausedAt) / 1000);
    startTime += pauseDuration * 1000;
    isPaused = false;
    if (!intervalId) intervalId = setInterval(tick, 1000);
    updateButtons();
    updateDisplay();
  }

  function resetTimer() {
    clearInterval(intervalId);
    intervalId = null;
    isRunning = false;
    isPaused = false;
    startTime = null;
    pausedAt = null;
    expectedRemaining = 0;
    const settings = loadSettings();
    remainingSeconds = getDurationForMode(mode, settings);
    updateButtons();
    updateDisplay();
  }

  function skipBreak() {
    if (mode === MODES.WORK) return;
    clearInterval(intervalId);
    intervalId = null;
    isRunning = false;
    isPaused = false;
    switchMode(MODES.WORK);
  }

  function applySettings(settings) {
    if (!isRunning && !isPaused) {
      remainingSeconds = getDurationForMode(mode, settings);
      updateDisplay();
    }
  }

  function initTimer(elements, statsCallback) {
    els = elements;
    onStatsUpdate = statsCallback;
    switchMode(MODES.WORK, loadSettings());
    updateSessionStats();
    
    // Handle page visibility changes to update timer when tab becomes visible again
    document.addEventListener('visibilitychange', function() {
      if (!document.hidden && isRunning && !isPaused && intervalId) {
        tick();
      }
    });
  }

  App.timer = {
    MODES,
    formatTime,
    switchMode,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipBreak,
    applySettings,
    initTimer,
    getMode: function () { return mode; },
    getIsRunning: function () { return isRunning; },
  };
})(window.PomodoroApp = window.PomodoroApp || {});
