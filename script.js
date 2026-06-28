/**
 * Pomodoro para Ti — Main entry point
 * Wires together router, timer, settings, and UI effects
 */
(function () {
  var App = window.PomodoroApp;
  var router = App.router;
  var storage = App.storage;
  var timer = App.timer;
  var settings = App.settings;

  /** Create slow-floating petals, hearts, and sparkles in the background */
  function createFloatingParticles() {
    var container = document.getElementById('floating-bg');
    if (!container) return;

    var symbols = ['🌸', '💕', '✿', '♡', '🌷', '✦', '🩷', '💮'];
    var count = window.innerWidth < 640 ? 12 : 20;

    for (var i = 0; i < count; i++) {
      var el = document.createElement('span');
      el.className = 'float-particle';
      el.textContent = symbols[i % symbols.length];
      el.style.left = Math.random() * 100 + '%';
      el.style.animationDuration = (18 + Math.random() * 22) + 's';
      el.style.animationDelay = Math.random() * 20 + 's';
      el.style.fontSize = (0.8 + Math.random() * 1.2) + 'rem';
      container.appendChild(el);
    }
  }

  /** Mobile hamburger menu toggle */
  function initMobileNav() {
    var toggle = document.getElementById('nav-toggle');
    var links = document.querySelector('.nav-links');

    if (toggle) {
      toggle.addEventListener('click', function () {
        var open = links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
      });
    }

    if (links) {
      links.querySelectorAll('.nav-link').forEach(function (link) {
        link.addEventListener('click', function () {
          links.classList.remove('open');
          if (toggle) toggle.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }


  /** Bind timer control buttons */
  function initTimerControls() {
    document.getElementById('btn-start').addEventListener('click', timer.startTimer);
    document.getElementById('btn-pause').addEventListener('click', timer.pauseTimer);
    document.getElementById('btn-resume').addEventListener('click', timer.resumeTimer);
    document.getElementById('btn-reset').addEventListener('click', timer.resetTimer);
    document.getElementById('btn-skip').addEventListener('click', timer.skipBreak);
  }

  /** Bootstrap the application */
  function init() {
    createFloatingParticles();
    initMobileNav();

    function refreshStats(stats) {
      settings.renderStatsDisplay(stats || storage.loadStats());
    }

    settings.initSettings(refreshStats);
    refreshStats(storage.loadStats());

    timer.initTimer(
      {
        display: document.getElementById('timer-display'),
        modeLabel: document.getElementById('mode-label'),
        modeIcon: document.getElementById('mode-icon'),
        timerCard: document.getElementById('timer-card'),
        sessionPomodoros: document.getElementById('session-pomodoros'),
        sessionFocusTime: document.getElementById('session-focus-time'),
        btnStart: document.getElementById('btn-start'),
        btnPause: document.getElementById('btn-pause'),
        btnResume: document.getElementById('btn-resume'),
        btnSkip: document.getElementById('btn-skip'),
      },
      refreshStats
    );

    initTimerControls();

    router.onRouteChange(function (page) {
      router.showPage(page);
    });
    router.initRouter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
