/**
 * Hash-based SPA router for GitHub Pages compatibility
 */
(function (App) {
  const ROUTES = {
    '/': 'pomodoro',
    '/pomodoro': 'pomodoro',
    '/dedicatoria': 'dedicatoria',
    '/ajustes': 'ajustes',
  };

  const listeners = [];

  function getHashPath() {
    const hash = window.location.hash.slice(1) || '/';
    const normalized = hash.startsWith('/') ? hash : '/' + hash;
    return normalized.replace(/\/$/, '') || '/';
  }

  function resolvePage(path) {
    return ROUTES[path] || 'pomodoro';
  }

  function navigate(path) {
    const normalized = path.startsWith('/') ? path : '/' + path;
    window.location.hash = normalized;
  }

  function onRouteChange(callback) {
    listeners.push(callback);
  }

  function getCurrentPage() {
    return resolvePage(getHashPath());
  }

  function emitRoute() {
    const page = getCurrentPage();
    listeners.forEach(function (fn) { fn(page); });
  }

  function initRouter() {
    window.addEventListener('hashchange', emitRoute);

    if (!window.location.hash) {
      window.location.hash = '#/pomodoro';
    } else {
      emitRoute();
    }
  }

  function updateNavHighlight(page) {
    document.querySelectorAll('.nav-link').forEach(function (link) {
      link.classList.toggle('active', link.dataset.route === page);
    });
  }

  function showPage(page) {
    document.querySelectorAll('.page').forEach(function (section) {
      section.classList.toggle('active', section.dataset.page === page);
    });
    updateNavHighlight(page);
  }

  App.router = {
    navigate,
    onRouteChange,
    getCurrentPage,
    initRouter,
    updateNavHighlight,
    showPage,
  };
})(window.PomodoroApp = window.PomodoroApp || {});
