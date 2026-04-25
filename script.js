/* ============================================================
   Smart Cycling Hub — script.js
   Multi-page static site — no SPA, no modules, no build tools
   Works with file:// and Live Server on any Windows laptop
   ============================================================ */

/* ---- Auth State (localStorage) ---- */
var auth = {
  isAuthenticated: false,
  email: '',
  fullName: '',
  phone: '',
  country: '',
  cardNumber: '',
  cardExpiry: '',
  cardCvc: '',
  subscription: 'free',
  trialEnd: null
};

/* ---- Password Show/Hide Toggle ---- */
function togglePassword(inputId, btn) {
  var input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = '<i class="bi bi-eye-slash"></i>';
    btn.setAttribute('aria-label', 'Hide password');
  } else {
    input.type = 'password';
    btn.innerHTML = '<i class="bi bi-eye"></i>';
    btn.setAttribute('aria-label', 'Show password');
  }
}

var STORAGE_KEY = 'sch_auth';
var TRIAL_USED_KEY = 'sch_trial_used';

function loadAuth() {
  try {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      var parsed = JSON.parse(stored);
      for (var key in parsed) { auth[key] = parsed[key]; }
      if (auth.subscription === 'trial' && auth.trialEnd) {
        if (new Date(auth.trialEnd) <= new Date()) {
          auth.subscription = 'free';
          auth.trialEnd = null;
          saveAuth();
        }
      }
    }
  } catch (e) { /* ignore */ }
}

function saveAuth() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

function getTrialUsedEmails() {
  try {
    var raw = localStorage.getItem(TRIAL_USED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

function markTrialUsed(email) {
  var emails = getTrialUsedEmails();
  var lower = email.toLowerCase();
  if (emails.indexOf(lower) === -1) {
    emails.push(lower);
    localStorage.setItem(TRIAL_USED_KEY, JSON.stringify(emails));
  }
}

function hasPaidAccess() {
  return auth.subscription === 'trial' || auth.subscription === 'subscribed';
}

/* ---- Init on every page ---- */
document.addEventListener('DOMContentLoaded', function() {
  loadAuth();
  updateNav();
  // If access was blocked by inline gating script, show the popup
  if (window.__schBlockedAccess) {
    showSubscriptionPopup();
    return; // Do not run page-specific init
  }
  // Page-specific init
  if (typeof pageInit === 'function') pageInit();
});

/* ---- Accessible Dialog Helper ---- */
function schDialog(overlayEl) {
  /* Add ARIA attributes to the overlay and its dialog box */
  overlayEl.setAttribute('role', 'dialog');
  overlayEl.setAttribute('aria-modal', 'true');
  var box = overlayEl.querySelector('.confirm-box, .modal-box, .cr-upload-card, .cr-match-card');
  if (box) {
    var heading = box.querySelector('h2, h3');
    if (heading) {
      if (!heading.id) heading.id = 'dlg-title-' + Date.now();
      overlayEl.setAttribute('aria-labelledby', heading.id);
    }
  }

  /* Collect all focusable elements inside the dialog */
  function getFocusable() {
    return overlayEl.querySelectorAll(
      'button:not([disabled]), a[href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
  }

  /* Focus trap: keep Tab / Shift+Tab inside the dialog */
  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    var focusable = getFocusable();
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  /* Escape key closes the dialog */
  function handleEsc(e) {
    if (e.key === 'Escape') {
      /* Find the cancel/dismiss button and click it; otherwise close the overlay */
      var cancelBtn = overlayEl.querySelector('.btn-cancel-dismiss, .cr-match-btn-continue');
      var closeBtn = overlayEl.querySelector('.sub-req-close-x, .modal-close');
      if (cancelBtn) { cancelBtn.click(); }
      else if (closeBtn) { closeBtn.click(); }
      else { overlayEl.remove(); }
    }
  }

  overlayEl.addEventListener('keydown', trapFocus);
  overlayEl.addEventListener('keydown', handleEsc);

  /* Store cleanup so we can remove listeners if needed */
  overlayEl._schCleanup = function() {
    overlayEl.removeEventListener('keydown', trapFocus);
    overlayEl.removeEventListener('keydown', handleEsc);
  };

  /* Auto-focus the Cancel/dismiss button if present, otherwise the first button */
  setTimeout(function() {
    var cancelBtn = overlayEl.querySelector('.btn-cancel-dismiss, .cr-match-btn-continue');
    if (cancelBtn) {
      cancelBtn.focus();
    } else {
      var firstBtn = overlayEl.querySelector('button, a[href]');
      if (firstBtn) firstBtn.focus();
    }
  }, 80);
}

/* ---- Navigation Update ---- */
function updateNav() {
  var authLinks = document.querySelectorAll('.auth-link');
  for (var i = 0; i < authLinks.length; i++) {
    authLinks[i].style.display = 'none';
  }
  if (auth.isAuthenticated) {
    var signedIn = document.querySelectorAll('.show-signed-in');
    for (var i = 0; i < signedIn.length; i++) signedIn[i].style.display = '';
    var signedOut = document.querySelectorAll('.show-signed-out');
    for (var i = 0; i < signedOut.length; i++) signedOut[i].style.display = 'none';
  } else {
    var signedIn = document.querySelectorAll('.show-signed-in');
    for (var i = 0; i < signedIn.length; i++) signedIn[i].style.display = 'none';
    var signedOut = document.querySelectorAll('.show-signed-out');
    for (var i = 0; i < signedOut.length; i++) signedOut[i].style.display = '';
  }
  /* Replace header profile icon with avatar */
  if (auth.isAuthenticated) {
    renderHeaderAvatar();
  }
}

/* ---- Global Header Avatar ---- */
function renderHeaderAvatar() {
  var profileLinks = document.querySelectorAll('a[href="profile.html"].show-signed-in');
  for (var i = 0; i < profileLinks.length; i++) {
    var link = profileLinks[i];
    /* Only process links that contain the person-circle icon or already have an avatar */
    var icon = link.querySelector('.bi-person-circle');
    var existingAvatar = link.querySelector('.nav-avatar');
    if (!icon && !existingAvatar) continue;
    /* Remove existing icon */
    if (icon) icon.remove();
    if (existingAvatar) existingAvatar.remove();
    /* Create avatar element */
    var avatar = document.createElement('span');
    avatar.className = 'nav-avatar';
    if (auth.profilePicture) {
      avatar.innerHTML = '<img src="' + auth.profilePicture + '" alt="Profile" />';
    } else {
      var initial = (auth.fullName || auth.email || '?').charAt(0).toUpperCase();
      avatar.innerHTML = '<span class="nav-avatar-initial">' + initial + '</span>';
    }
    link.appendChild(avatar);
  }
}

/* ---- Mobile Menu ---- */
function toggleMobile() {
  var menu = document.getElementById('mobileMenu');
  menu.classList.toggle('open');
  var btn = document.querySelector('.mobile-toggle');
  if (btn) {
    var expanded = menu.classList.contains('open');
    btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  }
}

/* ---- Sign Out ---- */
function handleSignOut() {
  /* Reset auth to defaults */
  auth = {
    isAuthenticated: false,
    email: '',
    fullName: '',
    phone: '',
    country: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    subscription: 'free',
    trialEnd: null,
    profilePicture: ''
  };
  localStorage.removeItem(STORAGE_KEY);

  /* Reset 7-day trial availability */
  localStorage.removeItem(TRIAL_USED_KEY);

  /* Reset Chain Reaction rider profile and swipe data */
  localStorage.removeItem('cr_profile');
  localStorage.removeItem('cr_swipes');
  localStorage.removeItem('cr_matches');
  localStorage.removeItem('cr_chats');

  /* Ensure auth state is fully cleared */
  auth.isAuthenticated = false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  localStorage.removeItem(STORAGE_KEY);

  window.location.href = 'index.html';
}

/* ---- Sign Up ---- */
function handleSignUp(e) {
  e.preventDefault();
  var email = document.getElementById('signupEmail').value.trim();
  var pw = document.getElementById('signupPassword').value;
  var confirm = document.getElementById('signupConfirm').value;
  if (!email) { alert('Please enter your email address.'); return; }
  if (pw.length < 6) { alert('Password must be at least 6 characters.'); return; }
  if (pw !== confirm) { alert('Passwords do not match.'); return; }
  auth.email = email;
  auth.subscription = 'free';
  auth.trialEnd = null;
  saveAuth();
  window.location.href = 'create-profile.html';
}

/* ---- Log In ---- */
function handleLogIn(e) {
  e.preventDefault();
  var email = document.getElementById('loginEmail').value.trim();
  var pw = document.getElementById('loginPassword').value;
  if (!email) { alert('Please enter your email.'); return; }
  if (!pw) { alert('Please enter your password.'); return; }
  auth.email = email;
  auth.isAuthenticated = true;
  if (auth.subscription === 'trial' && auth.trialEnd) {
    if (new Date(auth.trialEnd) <= new Date()) {
      auth.subscription = 'free';
      auth.trialEnd = null;
    }
  }
  saveAuth();
  window.location.href = 'index.html';
}

/* ---- Create Profile ---- */
function handleCreateProfile(e) {
  e.preventDefault();
  auth.fullName = document.getElementById('cpFullName').value.trim();
  auth.phone = document.getElementById('cpPhone').value.trim();
  auth.country = document.getElementById('cpCountry').value;
  auth.cardNumber = document.getElementById('cpCard').value.trim();
  auth.cardExpiry = document.getElementById('cpExpiry').value.trim();
  auth.cardCvc = document.getElementById('cpCvc').value.trim();
  /* Save profile picture if uploaded */
  if (typeof auth.profilePicture === 'undefined') {
    auth.profilePicture = '';
  }
  auth.isAuthenticated = true;
  saveAuth();
  window.location.href = 'index.html';
}

/* ---- Subscription Required Popup (global) ---- */
function showSubscriptionPopup() {
  var existing = document.getElementById('subRequiredOverlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'subRequiredOverlay';
  overlay.className = 'confirm-overlay open';
  overlay.innerHTML = '<div class="confirm-box">' +
    '<button class="sub-req-close-x" onclick="window.location.href=\'index.html\'" aria-label="Close dialog">&times;</button>' +
    '<div class="confirm-icon"><i class="bi bi-lock"></i></div>' +
    '<h2>Subscription Required</h2>' +
    '<div class="stripe-bar" style="margin:0.5rem auto 0.75rem;"></div>' +
    '<p class="confirm-detail">' + (auth.isAuthenticated ? 'Please subscribe to access this feature.' : 'Please sign in and subscribe to access this feature.') + '</p>' +
    '<div class="confirm-actions" style="flex-wrap:wrap;gap:0.6rem;">' +
      (auth.isAuthenticated
        ? '<a href="profile.html" class="btn-confirm-close" style="text-decoration:none;">Subscribe</a>'
        : '<a href="signin.html" class="btn-confirm-close" style="text-decoration:none;">Sign In</a>') +
      '<button class="btn-cancel-dismiss" onclick="window.location.href=\'index.html\'">Cancel</button>' +
    '</div>' +
    '</div>';

  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) window.location.href = 'index.html';
  });
  schDialog(overlay);
}

function closeSubscriptionPopup() {
  var overlay = document.getElementById('subRequiredOverlay');
  if (overlay) overlay.remove();
}

/* ---- Subscription Modal ---- */
function openModal() {
  if (!auth.isAuthenticated) {
    showSubscriptionPopup();
    return;
  }
  if (hasPaidAccess()) {
    return;
  }
  var modal = document.getElementById('subModal');
  if (!modal) {
    showSubscriptionPopup();
    return;
  }
  modal.classList.add('open');
  schDialog(modal);
  var trialBtn = document.getElementById('trialBtn');
  if (trialBtn) {
    if (auth.subscription === 'subscribed') {
      // Block downgrade from paid plan to free trial
      trialBtn.textContent = 'Not Available';
      trialBtn.disabled = true;
      trialBtn.style.opacity = '0.4';
    } else {
      var usedEmails = getTrialUsedEmails();
      var trialUsed = usedEmails.indexOf((auth.email || '').toLowerCase()) !== -1;
      if (trialUsed) {
        trialBtn.textContent = 'Trial Already Used';
        trialBtn.disabled = true;
        trialBtn.style.opacity = '0.5';
      } else {
        trialBtn.textContent = 'Start Free Trial';
        trialBtn.disabled = false;
        trialBtn.style.opacity = '1';
      }
    }
  }
}

function closeModal() {
  var modal = document.getElementById('subModal');
  if (modal) modal.classList.remove('open');
}

function handleSubscribe() {
  auth.subscription = 'subscribed';
  auth.trialEnd = null;
  saveAuth();
  closeModal();
  showConfirmation('subscribed');
}

function handleStartTrial() {
  // Block downgrade from paid plan to free trial
  if (auth.subscription === 'subscribed') {
    return;
  }
  var usedEmails = getTrialUsedEmails();
  if (usedEmails.indexOf((auth.email || '').toLowerCase()) !== -1) {
    showConfirmation('trial-used');
    return;
  }
  var end = new Date();
  end.setDate(end.getDate() + 7);
  auth.subscription = 'trial';
  auth.trialEnd = end.toISOString();
  markTrialUsed(auth.email);
  saveAuth();
  closeModal();
  showConfirmation('trial');
}

/* ---- Subscription Confirmation Modal ---- */
function showConfirmation(type) {
  // Remove existing confirmation overlay if present
  var existing = document.getElementById('confirmOverlay');
  if (existing) existing.remove();

  var icon, title, badge, badgeClass, detail;

  if (type === 'subscribed') {
    icon = 'bi-check-lg';
    title = 'Subscription Activated';
    badge = 'EUR 10/month';
    badgeClass = 'confirm-plan-subscribed';
    detail = 'You now have <strong>full access</strong> to all premium features including AI Bike Finder, Route Insight, and all Maintenance Guides.';
  } else if (type === 'trial') {
    var endDate = auth.trialEnd ? new Date(auth.trialEnd).toLocaleDateString() : '';
    icon = 'bi-clock';
    title = 'Free Trial Activated';
    badge = '7-Day Free Trial';
    badgeClass = 'confirm-plan-trial';
    detail = 'You have <strong>7 days of full access</strong> to all premium features.' + (endDate ? '<br>Your trial ends on <strong>' + endDate + '</strong>.' : '');
  } else if (type === 'trial-used') {
    icon = 'bi-exclamation-circle';
    title = 'Trial Already Used';
    badge = 'One Trial Per Account';
    badgeClass = 'confirm-plan-subscribed';
    detail = 'You have already used your free trial on this account.<br>Subscribe to the <strong>EUR 10/month</strong> plan for full access.';
  } else if (type === 'upgrade') {
    icon = 'bi-arrow-up-circle';
    title = 'Upgrade Successful';
    badge = 'EUR 10/month';
    badgeClass = 'confirm-plan-subscribed';
    detail = 'You have been upgraded from the Free Trial to the <strong>EUR 10/month</strong> plan. Enjoy uninterrupted access to all premium features.';
  }

  var overlay = document.createElement('div');
  overlay.id = 'confirmOverlay';
  overlay.className = 'confirm-overlay open';
  overlay.innerHTML = '<div class="confirm-box">' +
    '<div class="confirm-icon"><i class="bi ' + icon + '"></i></div>' +
    '<h2>' + title + '</h2>' +
    '<div class="stripe-bar" style="margin:0.5rem auto 0.75rem;"></div>' +
    '<span class="confirm-plan ' + badgeClass + '">' + badge + '</span>' +
    '<p class="confirm-detail">' + detail + '</p>' +
    '<button class="btn-confirm-close" onclick="closeConfirmation()">Continue</button>' +
    '</div>';

  document.body.appendChild(overlay);

  // Close on overlay background click
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeConfirmation();
  });
  schDialog(overlay);
}

function closeConfirmation() {
  var overlay = document.getElementById('confirmOverlay');
  if (overlay) overlay.remove();
  location.reload();
}

/* ---- Check Paid Access ---- */
function requirePaid(targetPage) {
  if (!auth.isAuthenticated) {
    showSubscriptionPopup();
    return false;
  }
  if (!hasPaidAccess()) {
    showSubscriptionPopup();
    return false;
  }
  if (targetPage) window.location.href = targetPage;
  return true;
}

function requireAuth(targetPage) {
  if (!auth.isAuthenticated) {
    showSubscriptionPopup();
    return false;
  }
  if (targetPage) window.location.href = targetPage;
  return true;
}

/* ---- Countries List ---- */
var COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria",
  "Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan",
  "Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia",
  "Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo (DRC)","Congo (Republic)",
  "Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador",
  "Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France",
  "Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau",
  "Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland",
  "Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait",
  "Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg",
  "Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico",
  "Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru",
  "Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman",
  "Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal",
  "Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe",
  "Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia",
  "South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria",
  "Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey",
  "Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu",
  "Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
];

function populateCountrySelect(selectId, selected) {
  var sel = document.getElementById(selectId);
  if (!sel) return;
  sel.innerHTML = '<option value="">Select your country</option>';
  for (var i = 0; i < COUNTRIES.length; i++) {
    var opt = document.createElement('option');
    opt.value = COUNTRIES[i];
    opt.textContent = COUNTRIES[i];
    if (COUNTRIES[i] === selected) opt.selected = true;
    sel.appendChild(opt);
  }
}

/* ---- Bike Finder ---- */
var BIKE_DATABASE = {
  electric: {
    500: [
      { name: "Ancheer 350W City E-Bike", price: "\u20AC449", shop: "Amazon", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/tQGCtMpRb0Ik_3d94dfeb.jpg", url: "https://www.amazon.com" },
      { name: "Eskute Netuno E-Bike", price: "\u20AC499", shop: "Eskute", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/tQGCtMpRb0Ik_3d94dfeb.jpg", url: "https://www.eskute.com" }
    ],
    1000: [
      { name: "Decathlon Riverside 500E", price: "\u20AC899", shop: "Decathlon", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/tQGCtMpRb0Ik_3d94dfeb.jpg", url: "https://www.decathlon.com" },
      { name: "Rad Power RadMission", price: "\u20AC999", shop: "Rad Power Bikes", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/tQGCtMpRb0Ik_3d94dfeb.jpg", url: "https://www.radpowerbikes.eu" }
    ],
    1500: [
      { name: "VanMoof S3", price: "\u20AC1,298", shop: "VanMoof", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/tQGCtMpRb0Ik_3d94dfeb.jpg", url: "https://www.vanmoof.com" },
      { name: "Cube Touring Hybrid ONE 400", price: "\u20AC1,449", shop: "Cube", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/tQGCtMpRb0Ik_3d94dfeb.jpg", url: "https://www.cube.eu" }
    ],
    2000: [
      { name: "Trek Verve+ 2", price: "\u20AC1,899", shop: "Trek", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/tQGCtMpRb0Ik_3d94dfeb.jpg", url: "https://www.trekbikes.com" },
      { name: "Specialized Turbo Vado 3.0", price: "\u20AC1,999", shop: "Specialized", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/tQGCtMpRb0Ik_3d94dfeb.jpg", url: "https://www.specialized.com" }
    ],
    2500: [
      { name: "Riese & M\u00FCller Charger3 GT", price: "\u20AC3,499", shop: "Riese & M\u00FCller", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/tQGCtMpRb0Ik_3d94dfeb.jpg", url: "https://www.r-m.de" },
      { name: "Canyon Pathlite:ON 7", price: "\u20AC2,799", shop: "Canyon", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/tQGCtMpRb0Ik_3d94dfeb.jpg", url: "https://www.canyon.com" }
    ]
  },
  mountain: {
    500: [
      { name: "B'Twin Rockrider ST100", price: "\u20AC249", shop: "Decathlon", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/9mAYf40sS1zG_e429aa45.jpg", url: "https://www.decathlon.com" },
      { name: "Voodoo Hoodoo", price: "\u20AC450", shop: "Halfords", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/9mAYf40sS1zG_e429aa45.jpg", url: "https://www.halfords.com" }
    ],
    1000: [
      { name: "Giant Talon 2", price: "\u20AC699", shop: "Giant", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/9mAYf40sS1zG_e429aa45.jpg", url: "https://www.giant-bicycles.com" },
      { name: "Trek Marlin 7", price: "\u20AC899", shop: "Trek", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/9mAYf40sS1zG_e429aa45.jpg", url: "https://www.trekbikes.com" }
    ],
    1500: [
      { name: "Specialized Rockhopper Elite", price: "\u20AC1,200", shop: "Specialized", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/9mAYf40sS1zG_e429aa45.jpg", url: "https://www.specialized.com" },
      { name: "Canyon Stoic 3", price: "\u20AC1,399", shop: "Canyon", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/9mAYf40sS1zG_e429aa45.jpg", url: "https://www.canyon.com" }
    ],
    2000: [
      { name: "Santa Cruz Chameleon D", price: "\u20AC1,899", shop: "Santa Cruz", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/9mAYf40sS1zG_e429aa45.jpg", url: "https://www.santacruzbicycles.com" },
      { name: "Orbea Laufey H30", price: "\u20AC1,799", shop: "Orbea", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/9mAYf40sS1zG_e429aa45.jpg", url: "https://www.orbea.com" }
    ],
    2500: [
      { name: "Yeti SB130 C1", price: "\u20AC4,299", shop: "Yeti Cycles", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/9mAYf40sS1zG_e429aa45.jpg", url: "https://www.yeticycles.com" },
      { name: "Trek Fuel EX 8", price: "\u20AC3,499", shop: "Trek", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/9mAYf40sS1zG_e429aa45.jpg", url: "https://www.trekbikes.com" }
    ]
  },
  road: {
    500: [
      { name: "B'Twin Triban RC120", price: "\u20AC449", shop: "Decathlon", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/mYO97CzkShd4_ecb1efb4.jpg", url: "https://www.decathlon.com" },
      { name: "Merida Scultura 100", price: "\u20AC499", shop: "Merida", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/mYO97CzkShd4_ecb1efb4.jpg", url: "https://www.merida-bikes.com" }
    ],
    1000: [
      { name: "Giant Contend AR 3", price: "\u20AC899", shop: "Giant", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/mYO97CzkShd4_ecb1efb4.jpg", url: "https://www.giant-bicycles.com" },
      { name: "Canyon Endurace AL 6.0", price: "\u20AC999", shop: "Canyon", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/mYO97CzkShd4_ecb1efb4.jpg", url: "https://www.canyon.com" }
    ],
    1500: [
      { name: "Trek Domane AL 5", price: "\u20AC1,399", shop: "Trek", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/mYO97CzkShd4_ecb1efb4.jpg", url: "https://www.trekbikes.com" },
      { name: "Specialized Allez Sprint", price: "\u20AC1,499", shop: "Specialized", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/mYO97CzkShd4_ecb1efb4.jpg", url: "https://www.specialized.com" }
    ],
    2000: [
      { name: "Cannondale CAAD13 105", price: "\u20AC1,899", shop: "Cannondale", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/mYO97CzkShd4_ecb1efb4.jpg", url: "https://www.cannondale.com" },
      { name: "Bianchi Via Nirone 7", price: "\u20AC1,699", shop: "Bianchi", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/mYO97CzkShd4_ecb1efb4.jpg", url: "https://www.bianchi.com" }
    ],
    2500: [
      { name: "Cerv\u00E9lo Caledonia 105", price: "\u20AC2,999", shop: "Cerv\u00E9lo", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/mYO97CzkShd4_ecb1efb4.jpg", url: "https://www.cervelo.com" },
      { name: "Pinarello Paris 105", price: "\u20AC3,200", shop: "Pinarello", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/mYO97CzkShd4_ecb1efb4.jpg", url: "https://www.pinarello.com" }
    ]
  },
  gravel: {
    500: [
      { name: "B'Twin Triban GRVL 120", price: "\u20AC499", shop: "Decathlon", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/zY0UsKSPxDOL_0315b61d.png", url: "https://www.decathlon.com" }
    ],
    1000: [
      { name: "Canyon Grail 6", price: "\u20AC999", shop: "Canyon", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/zY0UsKSPxDOL_0315b61d.png", url: "https://www.canyon.com" },
      { name: "Giant Revolt 2", price: "\u20AC899", shop: "Giant", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/zY0UsKSPxDOL_0315b61d.png", url: "https://www.giant-bicycles.com" }
    ],
    1500: [
      { name: "Trek Checkpoint ALR 5", price: "\u20AC1,499", shop: "Trek", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/zY0UsKSPxDOL_0315b61d.png", url: "https://www.trekbikes.com" },
      { name: "Specialized Diverge E5", price: "\u20AC1,399", shop: "Specialized", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/zY0UsKSPxDOL_0315b61d.png", url: "https://www.specialized.com" }
    ],
    2000: [
      { name: "Cerv\u00E9lo \u00C1spero Apex", price: "\u20AC1,999", shop: "Cerv\u00E9lo", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/zY0UsKSPxDOL_0315b61d.png", url: "https://www.cervelo.com" },
      { name: "Orbea Terra H30", price: "\u20AC1,899", shop: "Orbea", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/zY0UsKSPxDOL_0315b61d.png", url: "https://www.orbea.com" }
    ],
    2500: [
      { name: "3T Exploro Race", price: "\u20AC3,499", shop: "3T", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/zY0UsKSPxDOL_0315b61d.png", url: "https://www.3t.bike" },
      { name: "Canyon Grail CF SL 8", price: "\u20AC2,999", shop: "Canyon", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/zY0UsKSPxDOL_0315b61d.png", url: "https://www.canyon.com" }
    ]
  },
  city: {
    500: [
      { name: "B'Twin Elops 520", price: "\u20AC349", shop: "Decathlon", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/QkOc8xZgId8h_aad699f3.jpg", url: "https://www.decathlon.com" },
      { name: "Raleigh Pioneer Trail", price: "\u20AC450", shop: "Raleigh", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/QkOc8xZgId8h_aad699f3.jpg", url: "https://www.raleigh.co.uk" }
    ],
    1000: [
      { name: "Trek FX 3", price: "\u20AC799", shop: "Trek", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/QkOc8xZgId8h_aad699f3.jpg", url: "https://www.trekbikes.com" },
      { name: "Giant Escape 2 City Disc", price: "\u20AC699", shop: "Giant", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/QkOc8xZgId8h_aad699f3.jpg", url: "https://www.giant-bicycles.com" }
    ],
    1500: [
      { name: "Cannondale Quick 3", price: "\u20AC1,099", shop: "Cannondale", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/QkOc8xZgId8h_aad699f3.jpg", url: "https://www.cannondale.com" },
      { name: "Specialized Sirrus X 4.0", price: "\u20AC1,299", shop: "Specialized", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/QkOc8xZgId8h_aad699f3.jpg", url: "https://www.specialized.com" }
    ],
    2000: [
      { name: "Brompton C Line Urban", price: "\u20AC1,795", shop: "Brompton", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/QkOc8xZgId8h_aad699f3.jpg", url: "https://www.brompton.com" }
    ],
    2500: [
      { name: "Moulton TSR 9", price: "\u20AC2,999", shop: "Moulton", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663483835851/D9GdNEfPQNTJHTvmEmsjsu/QkOc8xZgId8h_aad699f3.jpg", url: "https://www.moultonbicycles.co.uk" }
    ]
  }
};

function findBikes() {
  var budget = parseInt(document.getElementById('bfBudget').value);
  var terrain = document.getElementById('bfTerrain').value;
  var experience = document.getElementById('bfExperience').value;
  var wrapper = document.getElementById('bikeResults');
  var grid = document.getElementById('bikeResultsGrid');
  var terrainData = BIKE_DATABASE[terrain];
  var bikes = [];
  var fallbackLabel = '';

  // Map HTML budget values to DB keys
  var budgetMap = { 500: 500, 1000: 1000, 2000: 1500, 3000: 2000, 5000: 2500 };
  var mappedBudget = budgetMap[budget] || budget;

  if (terrainData) {
    bikes = terrainData[mappedBudget] || [];
    // Fallback: find closest budget if no exact match
    if (bikes.length === 0) {
      var keys = Object.keys(terrainData).map(Number).sort(function(a,b){return a-b;});
      var closest = keys[0];
      var minDiff = Math.abs(mappedBudget - closest);
      for (var k = 1; k < keys.length; k++) {
        var diff = Math.abs(mappedBudget - keys[k]);
        if (diff < minDiff) { minDiff = diff; closest = keys[k]; }
      }
      bikes = terrainData[closest] || [];
      fallbackLabel = '<p style="color:#aaa; text-align:center; margin-bottom:1rem; font-size:0.9rem;">No exact match found. Showing closest suggestions:</p>';
    }
  }

  if (bikes.length === 0) {
    grid.innerHTML = '<p style="color:#888; text-align:center; grid-column:1/-1;">No bikes found for this combination. Try adjusting your filters.</p>';
    wrapper.style.display = 'block';
    return;
  }

  var levelNote = experience === 'beginner' ? 'Great for beginners' : experience === 'advanced' ? 'Suited for advanced riders' : 'Good all-rounder';
  var levelBadge = experience === 'beginner' ? '<span style="display:inline-block;background:#E8F5E9;color:#2E7D32;font-size:0.7rem;padding:2px 8px;border-radius:3px;margin-top:0.5rem;">Beginner Friendly</span>' : experience === 'advanced' ? '<span style="display:inline-block;background:#FFF3E0;color:#E65100;font-size:0.7rem;padding:2px 8px;border-radius:3px;margin-top:0.5rem;">Advanced</span>' : '<span style="display:inline-block;background:#E3F2FD;color:#1565C0;font-size:0.7rem;padding:2px 8px;border-radius:3px;margin-top:0.5rem;">All Levels</span>';

  var html = fallbackLabel;
  for (var i = 0; i < bikes.length; i++) {
    var b = bikes[i];
    html += '<div class="bike-card">' +
      '<img src="' + b.img + '" alt="' + b.name + '" loading="lazy" />' +
      '<div class="bike-card-body">' +
        '<h3>' + b.name + '</h3>' +
        '<div class="bike-price">' + b.price + '</div>' +
        '<div class="bike-shop">' + b.shop + ' &middot; ' + levelNote + '</div>' +
        levelBadge +
        '<a href="' + b.url + '" target="_blank" rel="noopener">View on ' + b.shop + ' &rarr;</a>' +
      '</div></div>';
  }
  grid.innerHTML = html;
  wrapper.style.display = 'block';
  wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---- Bike Size Guide ---- */
function calculateSize() {
  var height = parseInt(document.getElementById('sgHeight').value);
  var type = document.getElementById('sgType').value;
  if (!height || height < 100 || height > 220) {
    alert('Please enter a valid height between 100 and 220 cm.');
    return;
  }
  var size = '', note = '';
  if (type === 'road') {
    if (height <= 160) size = '47\u201350 cm';
    else if (height <= 170) size = '50\u201353 cm';
    else if (height <= 175) size = '53\u201355 cm';
    else if (height <= 183) size = '55\u201358 cm';
    else if (height <= 191) size = '58\u201360 cm';
    else size = '60+ cm';
    note = 'Road bike frame sizes are measured in centimetres (seat tube length).';
  } else if (type === 'mountain') {
    if (height <= 165) size = 'Small (S)';
    else if (height <= 175) size = 'Medium (M)';
    else if (height <= 185) size = 'Large (L)';
    else if (height <= 195) size = 'XL';
    else size = 'XXL';
    note = 'Mountain bike sizes use S/M/L designations. Test ride when possible.';
  } else if (type === 'city' || type === 'gravel') {
    if (height <= 165) size = 'S (15\u201316\u2033)';
    else if (height <= 175) size = 'M (17\u201318\u2033)';
    else if (height <= 185) size = 'L (19\u201320\u2033)';
    else if (height <= 195) size = 'XL (21\u201322\u2033)';
    else size = 'XXL';
    note = 'City/gravel bikes use inch-based frame sizes.';
  } else if (type === 'electric') {
    if (height <= 165) size = 'Small (S)';
    else if (height <= 175) size = 'Medium (M)';
    else if (height <= 185) size = 'Large (L)';
    else if (height <= 195) size = 'XL';
    else size = 'XXL';
    note = 'Electric bike sizing follows standard frame sizes.';
  }
  document.getElementById('frameSizeValue').textContent = size;
  document.getElementById('sizeNote').textContent = note;
  document.getElementById('sizeResult').style.display = 'block';
}

/* ---- Social Login ---- */
function handleSocialLogin(provider) {
  var providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
  // Generate a simulated email for the social login
  var socialEmail = 'user@' + provider + '.com';
  auth.email = socialEmail;
  auth.isAuthenticated = true;
  auth.fullName = providerName + ' User';
  auth.subscription = 'free';
  auth.trialEnd = null;
  saveAuth();
  // Redirect to Home Page
  window.location.href = 'index.html';
}

/* ---- Cancel Profile Creation ---- */
function handleCancelProfile() {
  // Reset auth state completely so user can start fresh
  auth = {
    isAuthenticated: false,
    email: '',
    fullName: '',
    phone: '',
    country: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    subscription: 'free',
    trialEnd: null
  };
  saveAuth();
  // Redirect to Home page
  window.location.href = 'index.html';
}

/* ---- Route Insight ---- */
/* Google Maps integration is now in route-insight.html (self-contained, no backend required) */





/* ---- FAQ Toggle ---- */
function toggleFaq(btn) {
  var answer = btn.nextElementSibling;
  if (!answer) {
    // fallback: answer is sibling of parent
    answer = btn.parentElement.querySelector('.faq-a');
  }
  if (answer) answer.classList.toggle('open');
  btn.classList.toggle('open');
  // Update aria-expanded state
  var isOpen = btn.classList.contains('open');
  btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}
// Alias for backward compatibility
var toggleFAQ = toggleFaq;

/* ---- Contact Form ---- */
function handleContact(e) {
  e.preventDefault();
  var form = e.target;

  // Clear previous errors
  clearContactErrors();

  var valid = true;

  // Name validation
  var name = form.querySelector('#contactName');
  if (!name.value.trim()) {
    showFieldError('contactName', 'contactNameError', 'Please enter your name.');
    valid = false;
  }

  // Email validation
  var email = form.querySelector('#contactEmail');
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value.trim()) {
    showFieldError('contactEmail', 'contactEmailError', 'Please enter your email address.');
    valid = false;
  } else if (!emailPattern.test(email.value.trim())) {
    showFieldError('contactEmail', 'contactEmailError', 'Please enter a valid email address.');
    valid = false;
  }

  // Subject validation
  var subject = form.querySelector('#contactSubject');
  if (!subject.value) {
    showFieldError('contactSubject', 'contactSubjectError', 'Please select a subject.');
    valid = false;
  }

  // Message validation
  var msg = form.querySelector('#contactMsg');
  if (!msg.value.trim()) {
    showFieldError('contactMsg', 'contactMsgError', 'Please enter your message.');
    valid = false;
  }

  // Terms checkbox validation
  var terms = form.querySelector('#contactTerms');
  if (!terms.checked) {
    showFieldError('contactTerms', 'contactTermsError', 'You must agree to the Terms of Use.');
    valid = false;
  }

  if (!valid) {
    // Focus the first field with an error
    var firstErr = form.querySelector('.form-group.has-error input, .form-group.has-error select, .form-group.has-error textarea');
    if (firstErr) firstErr.focus();
    return;
  }

  // Submit via FormSubmit using fetch (AJAX)
  var submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  var formData = new FormData(form);

  fetch(form.action, {
    method: 'POST',
    body: formData,
    headers: { 'Accept': 'application/json' }
  })
  .then(function(response) {
    if (response.ok) {
      form.reset();
      form.style.display = 'none';
      document.getElementById('contactSuccess').style.display = 'block';
      showContactConfirmation();
    } else {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
      alert('Something went wrong. Please try again later.');
    }
  })
  .catch(function() {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
    alert('Network error. Please check your connection and try again.');
  });
}

function showFieldError(fieldId, errorId, message) {
  var field = document.getElementById(fieldId);
  var error = document.getElementById(errorId);
  if (field) field.closest('.form-group').classList.add('has-error');
  if (error) error.textContent = message;
}

function clearContactErrors() {
  var groups = document.querySelectorAll('#contactForm .form-group');
  for (var i = 0; i < groups.length; i++) {
    groups[i].classList.remove('has-error');
  }
  var errors = document.querySelectorAll('#contactForm .field-error');
  for (var j = 0; j < errors.length; j++) {
    errors[j].textContent = '';
  }
}

function showContactConfirmation() {
  var existing = document.getElementById('confirmOverlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'confirmOverlay';
  overlay.className = 'confirm-overlay open';
  overlay.innerHTML = '<div class="confirm-box">' +
    '<div class="confirm-icon"><i class="bi bi-envelope-check"></i></div>' +
    '<h2>Message Sent</h2>' +
    '<div class="stripe-bar" style="margin:0.5rem auto 0.75rem;"></div>' +
    '<p class="confirm-detail">Thank you for your message!<br>We will get back to you soon.</p>' +
    '<button class="btn-confirm-close" onclick="closeContactConfirmation()">OK</button>' +
    '</div>';

  document.body.appendChild(overlay);

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeContactConfirmation();
  });
  schDialog(overlay);
}

function closeContactConfirmation() {
  var overlay = document.getElementById('confirmOverlay');
  if (overlay) overlay.remove();
  window.location.href = 'about.html';
}

/* ---- Profile Edit ---- */
var profileEditing = false;

function renderProfile() {
  var container = document.getElementById('profileContent');
  if (!container) return;
  if (!auth.isAuthenticated) {
    container.innerHTML = '<p>Please <a href="signin.html">sign in</a> to view your profile.</p>';
    return;
  }
  var subLabel = auth.subscription === 'subscribed' ? 'Subscribed' : auth.subscription === 'trial' ? 'Free Trial' : 'Free';
  var subClass = auth.subscription === 'subscribed' ? 'sub-subscribed' : auth.subscription === 'trial' ? 'sub-trial' : 'sub-free';
  var trialInfo = (auth.subscription === 'trial' && auth.trialEnd) ? '<p style="color:#aaa;font-size:0.85rem;margin-top:0.5rem;">Trial ends: ' + new Date(auth.trialEnd).toLocaleDateString() + '</p>' : '';

  // Build subscription actions based on current plan
  var subActions = '';
  if (auth.subscription === 'free') {
    subActions = '<p style="margin-top:0.75rem;">Upgrade to access all premium features.</p>' +
      '<button class="btn btn-gradient btn-sm" onclick="openModal()">Upgrade</button>';
  } else if (auth.subscription === 'trial') {
    subActions = '<p style="margin-top:0.75rem;">You have full access to all features.</p>' +
      '<div style="display:flex;flex-wrap:wrap;gap:0.75rem;margin-top:0.75rem;">' +
      '<button class="btn btn-gradient btn-sm" onclick="handleUpgradeFromTrial()"><i class="bi bi-arrow-up-circle"></i> Upgrade to &euro;10/month</button>' +
      '<button class="btn btn-sm" style="background:#333;color:#fff;" onclick="handleCancelSub()">Cancel Subscription</button>' +
      '</div>';
  } else if (auth.subscription === 'subscribed') {
    subActions = '<p style="margin-top:0.75rem;">You have full access to all features.</p>' +
      '<p style="color:#aaa;font-size:0.8rem;margin-top:0.25rem;"><i class="bi bi-info-circle"></i> You are on the paid plan. Downgrading to the free trial is not available.</p>' +
      '<button class="btn btn-sm" style="background:#333;color:#fff;margin-top:0.75rem;" onclick="handleCancelSub()">Cancel Subscription</button>';
  }

  /* Build avatar section (view mode only) */
  var avatarInitial = (auth.fullName || auth.email || '?').charAt(0).toUpperCase();
  var avatarHTML = '<div class="profile-avatar-section">';
  avatarHTML += '<div class="profile-avatar-large" id="profileAvatarArea">';
  if (auth.profilePicture) {
    avatarHTML += '<img src="' + auth.profilePicture + '" alt="Profile" class="profile-avatar-img" />';
  } else {
    avatarHTML += '<span class="profile-avatar-initial">' + avatarInitial + '</span>';
  }
  avatarHTML += '</div>';
  avatarHTML += '</div>';

  container.innerHTML = avatarHTML + '<div class="profile-card"><label>Email</label><div class="value">' + (auth.email || '\u2014') + '</div><label>Full Name</label><div class="value">' + (auth.fullName || '\u2014') + '</div><label>Phone</label><div class="value">' + (auth.phone || '\u2014') + '</div><label>Country</label><div class="value">' + (auth.country || '\u2014') + '</div><label>Card</label><div class="value">' + (auth.cardNumber ? '\u2022\u2022\u2022\u2022 ' + auth.cardNumber.slice(-4) : '\u2014') + '</div><div class="profile-actions"><button class="btn btn-gradient btn-sm" onclick="enterEditMode()">Edit Profile</button></div></div><div class="sub-box"><h3>Subscription</h3><span class="sub-status ' + subClass + '">' + subLabel + '</span>' + trialInfo + subActions + '</div>';
}

function saveProfileEdit() {
  auth.fullName = document.getElementById('editName').value.trim();
  auth.phone = document.getElementById('editPhone').value.trim();
  auth.country = document.getElementById('editCountry').value;
  auth.cardNumber = document.getElementById('editCard').value.trim();
  auth.cardExpiry = document.getElementById('editExpiry').value.trim();
  auth.cardCvc = document.getElementById('editCvc').value.trim();
  saveAuth();
  profileEditing = false;
  renderProfile();
  renderHeaderAvatar();
}

/* ---- Profile Picture Upload (Profile Page) ---- */
function handleProfilePicUpload(input) {
  if (!input.files || !input.files[0]) return;
  var file = input.files[0];
  if (!file.type.match(/^image\/(jpeg|png)$/)) {
    alert('Please upload a JPG or PNG image.');
    input.value = '';
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    auth.profilePicture = e.target.result;
    saveAuth();
    renderProfile();
    renderHeaderAvatar();
  };
  reader.readAsDataURL(file);
}

/* ---- Delete Profile Picture ---- */
function deleteProfilePicture() {
  auth.profilePicture = '';
  saveAuth();
  renderProfile();
  renderHeaderAvatar();
}

function handleUpgradeFromTrial() {
  if (auth.subscription !== 'trial') return;
  auth.subscription = 'subscribed';
  auth.trialEnd = null;
  saveAuth();
  showConfirmation('upgrade');
}

function handleCancelSub() {
  // Show custom cancellation confirmation modal
  var existing = document.getElementById('confirmOverlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'confirmOverlay';
  overlay.className = 'confirm-overlay open';
  overlay.innerHTML = '<div class="confirm-box">' +
    '<div class="confirm-icon"><i class="bi bi-exclamation-triangle"></i></div>' +
    '<h2>Cancel Subscription</h2>' +
    '<div class="stripe-bar" style="margin:0.5rem auto 0.75rem;"></div>' +
    '<p class="confirm-detail">Are you sure you want to cancel your subscription?<br>You will lose access to all premium features.</p>' +
    '<div class="confirm-actions">' +
    '<button class="btn-cancel-dismiss" onclick="closeCancelModal()">Cancel</button>' +
    '<button class="btn-cancel-proceed" onclick="confirmCancelSub()">Confirm Cancellation</button>' +
    '</div>' +
    '</div>';

  document.body.appendChild(overlay);

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeCancelModal();
  });
  schDialog(overlay);
}

function closeCancelModal() {
  var overlay = document.getElementById('confirmOverlay');
  if (overlay) overlay.remove();
}

function confirmCancelSub() {
  auth.subscription = 'free';
  auth.trialEnd = null;
  saveAuth();
  closeCancelModal();
  renderProfile();
}
