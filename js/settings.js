/**
 * Settings UI bindings and dark mode
 */
(function (App) {
  const { loadSettings, saveSettings, DEFAULT_SETTINGS, formatFocusTime } = App.storage;
  const { applySettings } = App.timer;
  const { playAlarm } = App.sounds;

  let settings = Object.assign({}, DEFAULT_SETTINGS);
  const fields = {};

  function applyDarkMode(enabled) {
    document.body.classList.toggle('dark-mode', enabled);
  }

  function renderStatsDisplay(stats) {
    const map = {
      'stat-today-pomodoros': stats.todayPomodoros,
      'stat-today-focus': formatFocusTime(stats.todayFocusSeconds),
      'stat-current-streak': stats.currentStreak + ' ' + (stats.currentStreak === 1 ? 'día' : 'días'),
      'stat-longest-streak': stats.longestStreak + ' ' + (stats.longestStreak === 1 ? 'día' : 'días'),
      'stat-total-pomodoros': stats.totalPomodoros,
    };

    Object.keys(map).forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.textContent = map[id];
    });
  }

  function clampInt(value, min, max, fallback) {
    const n = parseInt(value, 10);
    if (isNaN(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  function populateForm() {
    fields.work.value = settings.workDuration;
    fields.short.value = settings.shortBreak;
    fields.long.value = settings.longBreak;
    fields.longInterval.value = settings.longInterval;
    fields.autoStart.checked = settings.autoStartNext;
    fields.autoBreak.checked = settings.autoStartBreaks;
    fields.sound.value = settings.alarmSound;
    fields.volume.value = settings.alarmVolume;
    fields.volumeLabel.textContent = settings.alarmVolume + '%';
    fields.muted.checked = settings.muted;
    fields.dark.checked = settings.darkMode;
  }

  function persistSettings() {
    settings = {
      workDuration: clampInt(fields.work.value, 1, 120, DEFAULT_SETTINGS.workDuration),
      shortBreak: clampInt(fields.short.value, 1, 60, DEFAULT_SETTINGS.shortBreak),
      longBreak: clampInt(fields.long.value, 1, 120, DEFAULT_SETTINGS.longBreak),
      longInterval: clampInt(fields.longInterval.value, 2, 10, DEFAULT_SETTINGS.longInterval),
      autoStartNext: fields.autoStart.checked,
      autoStartBreaks: fields.autoBreak.checked,
      alarmSound: fields.sound.value,
      alarmVolume: clampInt(fields.volume.value, 0, 100, DEFAULT_SETTINGS.alarmVolume),
      muted: fields.muted.checked,
      darkMode: fields.dark.checked,
    };

    saveSettings(settings);
    applyDarkMode(settings.darkMode);
    applySettings(settings);
  }

  function initSettings(onStatsRender) {
    settings = loadSettings();

    fields.work = document.getElementById('setting-work');
    fields.short = document.getElementById('setting-short');
    fields.long = document.getElementById('setting-long');
    fields.longInterval = document.getElementById('setting-long-interval');
    fields.autoStart = document.getElementById('setting-auto-start');
    fields.autoBreak = document.getElementById('setting-auto-break');
    fields.sound = document.getElementById('setting-sound');
    fields.volume = document.getElementById('setting-volume');
    fields.volumeLabel = document.getElementById('volume-label');
    fields.muted = document.getElementById('setting-muted');
    fields.dark = document.getElementById('setting-dark');

    populateForm();
    applyDarkMode(settings.darkMode);

    [
      fields.work, fields.short, fields.long, fields.longInterval,
      fields.autoStart, fields.autoBreak, fields.sound, fields.volume,
      fields.muted, fields.dark,
    ].forEach(function (input) {
      input.addEventListener('change', function () {
        persistSettings();
        populateForm();
      });
    });

    fields.volume.addEventListener('input', function () {
      fields.volumeLabel.textContent = fields.volume.value + '%';
      persistSettings();
    });

    var previewBtn = document.getElementById('btn-preview-sound');
    if (previewBtn) {
      previewBtn.addEventListener('click', function () {
        persistSettings();
        playAlarm(settings.alarmSound, settings.alarmVolume, settings.muted);
      });
    }

    if (onStatsRender) onStatsRender();
  }

  App.settings = {
    initSettings,
    renderStatsDisplay,
    applyDarkMode,
    getSettings: function () { return settings; },
  };
})(window.PomodoroApp = window.PomodoroApp || {});
