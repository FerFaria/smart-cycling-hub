/* ==========================================================
   Accessibility Widget — Smart Cycling Hub
   Standalone additive script. Does NOT modify existing JS.
   ========================================================== */
(function () {
  'use strict';

  // ---- Storage key ----
  var STORAGE_KEY = 'sch-a11y-settings';

  // ---- Default settings ----
  var defaults = {
    fontSize: 0,        // -3 to +3 steps
    darkMode: false,
    highContrast: false,
    highlightLinks: false,
    reduceMotion: false,
    clickSpeed: false
  };

  // ---- Load persisted settings ----
  function loadSettings() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return Object.assign({}, defaults);
  }

  // ---- Save settings ----
  function saveSettings(s) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) { /* ignore */ }
  }

  var settings = loadSettings();

  // ---- Build the widget HTML ----
  function buildWidget() {
    // Overlay
    var overlay = document.createElement('div');
    overlay.id = 'a11y-overlay';
    overlay.addEventListener('click', closePanel);

    // Panel
    var panel = document.createElement('div');
    panel.id = 'a11y-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Accessibility Settings');
    panel.setAttribute('aria-modal', 'true');

    panel.innerHTML =
      '<div class="a11y-header">' +
        '<h2>Accessibility Settings</h2>' +
        '<button class="a11y-close" aria-label="Close accessibility settings">&times;</button>' +
      '</div>' +
      '<hr class="a11y-divider">' +
      '<div class="a11y-options">' +
        '<button class="a11y-option" data-action="fontUp">' +
          '<span class="a11y-icon">A+</span>' +
          '<span>Increase Font Size</span>' +
        '</button>' +
        '<button class="a11y-option" data-action="fontDown">' +
          '<span class="a11y-icon">A\u2013</span>' +
          '<span>Decrease Font Size</span>' +
        '</button>' +
        '<button class="a11y-option" data-action="darkMode">' +
          '<span class="a11y-icon" aria-hidden="true">\u263E</span>' +
          '<span>Dark Mode</span>' +
        '</button>' +
        '<button class="a11y-option" data-action="highContrast">' +
          '<span class="a11y-icon" aria-hidden="true">\u25D1</span>' +
          '<span>High Contrast</span>' +
        '</button>' +
        '<button class="a11y-option" data-action="highlightLinks">' +
          '<span class="a11y-icon" aria-hidden="true">\uD83D\uDD17</span>' +
          '<span>Highlight Links</span>' +
        '</button>' +
        '<button class="a11y-option" data-action="reduceMotion">' +
          '<span class="a11y-icon" aria-hidden="true">\u25A0</span>' +
          '<span>Reduce Motion</span>' +
        '</button>' +
        '<button class="a11y-option" data-action="clickSpeed">' +
          '<span class="a11y-icon" aria-hidden="true">\u2B50</span>' +
          '<span>Click Speed</span>' +
        '</button>' +
      '</div>' +
      '<button class="a11y-reset" data-action="reset">Reset All Settings</button>';

    // Trigger button
    var trigger = document.createElement('button');
    trigger.id = 'a11y-trigger';
    trigger.setAttribute('aria-label', 'Open accessibility settings');
    trigger.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">' +
        '<circle cx="12" cy="4" r="2"/>' +
        '<path d="M15.89 8.11C15.5 7.72 14.83 7 13 7h-2c-1.83 0-2.5.72-2.89 1.11L4 12.5 5.5 14l3.5-3v9h2v-5h2v5h2V11l3.5 3 1.5-1.5-4.11-4.39z"/>' +
      '</svg>';

    document.body.appendChild(overlay);
    document.body.appendChild(panel);
    document.body.appendChild(trigger);

    // ---- Event listeners ----
    trigger.addEventListener('click', togglePanel);

    panel.querySelector('.a11y-close').addEventListener('click', closePanel);

    var options = panel.querySelectorAll('.a11y-option');
    for (var i = 0; i < options.length; i++) {
      options[i].addEventListener('click', handleOption);
    }

    panel.querySelector('.a11y-reset').addEventListener('click', resetAll);

    // Keyboard: Escape to close
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('a11y-open')) {
        closePanel();
        trigger.focus();
      }
    });
  }

  // ---- Panel open/close ----
  var isOpen = false;

  function togglePanel() {
    if (isOpen) { closePanel(); } else { openPanel(); }
  }

  function openPanel() {
    var panel = document.getElementById('a11y-panel');
    var overlay = document.getElementById('a11y-overlay');
    var trigger = document.getElementById('a11y-trigger');
    panel.classList.add('a11y-open');
    overlay.classList.add('a11y-open');
    trigger.setAttribute('aria-expanded', 'true');
    isOpen = true;
    // Focus the first option
    var first = panel.querySelector('.a11y-option');
    if (first) first.focus();
    // Trap focus inside panel
    trapFocus(panel);
  }

  function closePanel() {
    var panel = document.getElementById('a11y-panel');
    var overlay = document.getElementById('a11y-overlay');
    var trigger = document.getElementById('a11y-trigger');
    panel.classList.remove('a11y-open');
    overlay.classList.remove('a11y-open');
    trigger.setAttribute('aria-expanded', 'false');
    isOpen = false;
    releaseFocus();
  }

  // ---- Focus trap ----
  var focusTrapHandler = null;

  function trapFocus(container) {
    releaseFocus();
    focusTrapHandler = function (e) {
      if (e.key !== 'Tab') return;
      var focusable = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', focusTrapHandler);
  }

  function releaseFocus() {
    if (focusTrapHandler) {
      document.removeEventListener('keydown', focusTrapHandler);
      focusTrapHandler = null;
    }
  }

  // ---- Handle option clicks ----
  function handleOption(e) {
    var btn = e.currentTarget;
    var action = btn.getAttribute('data-action');

    switch (action) {
      case 'fontUp':
        if (settings.fontSize < 3) settings.fontSize++;
        break;
      case 'fontDown':
        if (settings.fontSize > -3) settings.fontSize--;
        break;
      case 'darkMode':
        settings.darkMode = !settings.darkMode;
        break;
      case 'highContrast':
        settings.highContrast = !settings.highContrast;
        break;
      case 'highlightLinks':
        settings.highlightLinks = !settings.highlightLinks;
        break;
      case 'reduceMotion':
        settings.reduceMotion = !settings.reduceMotion;
        break;
      case 'clickSpeed':
        settings.clickSpeed = !settings.clickSpeed;
        break;
    }

    saveSettings(settings);
    applySettings();
    updateButtonStates();
  }

  // ---- Reset ----
  function resetAll() {
    settings = Object.assign({}, defaults);
    saveSettings(settings);
    applySettings();
    updateButtonStates();
  }

  // ---- Apply settings to the page ----
  function applySettings() {
    var html = document.documentElement;
    var body = document.body;

    // Font size: each step = 10%
    var base = 100 + (settings.fontSize * 10);
    html.style.fontSize = base + '%';

    // Toggle classes
    body.classList.toggle('a11y-dark-mode', settings.darkMode);
    body.classList.toggle('a11y-high-contrast', settings.highContrast);
    body.classList.toggle('a11y-highlight-links', settings.highlightLinks);
    body.classList.toggle('a11y-reduce-motion', settings.reduceMotion);
    body.classList.toggle('a11y-click-speed', settings.clickSpeed);
  }

  // ---- Update active states on buttons ----
  function updateButtonStates() {
    var panel = document.getElementById('a11y-panel');
    if (!panel) return;

    var buttons = panel.querySelectorAll('.a11y-option');
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var action = btn.getAttribute('data-action');
      var active = false;

      switch (action) {
        case 'fontUp':    active = settings.fontSize > 0; break;
        case 'fontDown':  active = settings.fontSize < 0; break;
        case 'darkMode':       active = settings.darkMode; break;
        case 'highContrast':   active = settings.highContrast; break;
        case 'highlightLinks': active = settings.highlightLinks; break;
        case 'reduceMotion':   active = settings.reduceMotion; break;
        case 'clickSpeed':     active = settings.clickSpeed; break;
      }

      btn.classList.toggle('a11y-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    }
  }

  // ---- Initialise ----
  function init() {
    buildWidget();
    applySettings();
    updateButtonStates();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
