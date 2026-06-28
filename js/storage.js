/**
 * localStorage persistence layer for Pomodoro para Ti
 */
(function (App) {
  const STORAGE_KEYS = {
    SETTINGS: 'ppt_settings',
    STATS: 'ppt_stats',
    DEDICATORIA: 'ppt_dedicatoria',
  };

  const DEFAULT_SETTINGS = {
    workDuration: 25,
    shortBreak: 5,
    longBreak: 15,
    longInterval: 4,
    autoStartNext: false,
    autoStartBreaks: false,
    alarmSound: 'bell',
    alarmVolume: 70,
    muted: false,
    darkMode: false,
  };

  const DEFAULT_STATS = {
    todayDate: '',
    todayPomodoros: 0,
    todayFocusSeconds: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalPomodoros: 0,
    lastActivityDate: '',
  };

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return { ...fallback };
      return { ...fallback, ...JSON.parse(raw) };
    } catch {
      return { ...fallback };
    }
  }

  function writeJSON(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function getTodayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function loadSettings() {
    return readJSON(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  function saveSettings(settings) {
    writeJSON(STORAGE_KEYS.SETTINGS, settings);
  }

  function loadStats() {
    const stats = readJSON(STORAGE_KEYS.STATS, DEFAULT_STATS);
    const today = getTodayKey();

    if (stats.todayDate !== today) {
      stats.todayDate = today;
      stats.todayPomodoros = 0;
      stats.todayFocusSeconds = 0;
      saveStats(stats);
    }

    return stats;
  }

  function saveStats(stats) {
    writeJSON(STORAGE_KEYS.STATS, stats);
  }

  function loadDedicatoria() {
    return readJSON(STORAGE_KEYS.DEDICATORIA, { body: '', signature: '' });
  }

  function saveDedicatoria(data) {
    writeJSON(STORAGE_KEYS.DEDICATORIA, data);
  }

  function formatFocusTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0 && minutes > 0) return `${hours} h ${minutes} min`;
    if (hours > 0) return `${hours} h`;
    if (minutes > 0) return `${minutes} min`;
    return '0 min';
  }

  App.storage = {
    STORAGE_KEYS,
    DEFAULT_SETTINGS,
    DEFAULT_STATS,
    getTodayKey,
    loadSettings,
    saveSettings,
    loadStats,
    saveStats,
    loadDedicatoria,
    saveDedicatoria,
    formatFocusTime,
  };
})(window.PomodoroApp = window.PomodoroApp || {});
