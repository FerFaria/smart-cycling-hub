/* ============================================================
   Chain Reaction — Cycling Date Feature Logic
   Tinder-style matchmaking for Smart Cycling Hub
   ============================================================ */

/* ---- CR Auth / Profile Storage ---- */
var CR_PROFILE_KEY = "cr_profile";
var CR_SWIPES_KEY = "cr_swipes";
var CR_MATCHES_KEY = "cr_matches";
var CR_CHATS_KEY = "cr_chats";

function getCRProfile() {
  try {
    var raw = localStorage.getItem(CR_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function saveCRProfile(profile) {
  localStorage.setItem(CR_PROFILE_KEY, JSON.stringify(profile));
}

function getCRSwipes() {
  try {
    var raw = localStorage.getItem(CR_SWIPES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveCRSwipes(swipes) {
  localStorage.setItem(CR_SWIPES_KEY, JSON.stringify(swipes));
}

function getCRMatches() {
  try {
    var raw = localStorage.getItem(CR_MATCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCRMatches(matches) {
  localStorage.setItem(CR_MATCHES_KEY, JSON.stringify(matches));
}

function getCRChats() {
  try {
    var raw = localStorage.getItem(CR_CHATS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveCRChats(chats) {
  localStorage.setItem(CR_CHATS_KEY, JSON.stringify(chats));
}

/* ---- Sample Rider Profiles ---- */
var CR_RIDERS = [
  {
    id: "sanne",
    name: "Sanne",
    age: 34,
    city: "Amsterdam",
    photos: [
      "cr-images/sanne-01.jpeg",
      "cr-images/sanne-02.jpeg",
      "cr-images/sanne-03.jpeg",
      "cr-images/sanne-04.jpeg",
      "cr-images/sanne-05.jpeg",
    ],
    bio: "I commute to work every day by bike\u2014just like most people in my city. Cycling is simply part of my life. I ride to work, to meet friends, and to run errands. Even though I\u2019m active and love being outdoors, I don\u2019t think of myself as a \u201Cserious cyclist.\u201D What I\u2019m really hoping for is to meet someone who also rides every day and shares my eco-friendly values and healthy, simple lifestyle. Traditional dating apps don\u2019t make it easy to filter for that, so I\u2019m here looking for someone who enjoys the everyday joy and freedom of cycling as much as I do.",
    languages: "Dutch, English",
    interestedIn: "Any",
    looking: "Individuals, Short-Ride",
    bikeStyle: "Commuter Bike",
    avgDistance: "7 - 10km",
    routes: "Canals, Parks",
    swipesYes: ["alan"],
  },
  {
    id: "alan",
    name: "Alan",
    age: 38,
    city: "Amsterdam",
    photos: [
      "cr-images/alan-01.jpeg",
      "cr-images/alan-02.jpeg",
      "cr-images/alan-03.jpeg",
      "cr-images/alan-04.jpeg",
      "cr-images/alan-05.jpeg",
    ],
    bio: "I\u2019ve lived in Amsterdam long enough that cycling feels as natural to me as walking. I ride to the office, to caf\u00E9s, to weekend markets, or simply to get some fresh air. I\u2019m not chasing long-distance goals; my rides are short, practical, and part of my daily rhythm. I value efficiency, sustainability, and a relaxed lifestyle. I\u2019m hoping to meet someone who shares that same everyday connection to cycling \u2014 someone who also chooses the bike as their default way of moving through the city.",
    languages: "Dutch, English",
    interestedIn: "Woman",
    looking: "Individuals, Short-Ride",
    bikeStyle: "Commuter Bike",
    avgDistance: "5 - 12km",
    routes: "Canals, Parks, Nature",
    swipesYes: ["sanne"],
  },
  {
    id: "andrea",
    name: "Andrea",
    age: 57,
    city: "Munich",
    photos: [
      "cr-images/andrea-01.jpeg",
      "cr-images/andrea-02.jpeg",
      "cr-images/andrea-03.jpeg",
      "cr-images/andrea-04.jpeg",
      "cr-images/andrea-05.jpeg",
    ],
    bio: "I rediscovered cycling through my e-MTB, which has opened up mountain routes that used to feel out of reach. These days I\u2019m often exploring scenic paths\u2014sometimes parts of EuroVelo\u2014and I love taking cycling trips whenever I can. The only drawback is not always having someone to join me on weekend rides or longer adventures. I\u2019m healthy, active, and happiest outdoors, and I\u2019m hoping to meet people who appreciate nature, adventure, and beautiful landscapes\u2014maybe even someone open to a long-term relationship.",
    languages: "German, English",
    interestedIn: "Any",
    looking: "Individuals",
    bikeStyle: "E-Bike",
    avgDistance: "25 - 45km",
    routes: "Mountains, Greenways",
    swipesYes: [],
  },
  {
    id: "carlos",
    name: "Carlos",
    age: 42,
    city: "Barcelona",
    photos: [
      "cr-images/carlos-01.jpeg",
      "cr-images/carlos-02.jpeg",
      "cr-images/carlos-03.jpeg",
      "cr-images/carlos-04.jpeg",
      "cr-images/carlos-05.jpeg",
    ],
    bio: "I\u2019m passionate about endurance cycling\u2014weekends mean long coastal routes, and weekdays are for training whenever possible. It\u2019s tough to find people who ride at a similar pace, since most of my friends don\u2019t cycle much and group rides can feel impersonal. I\u2019d love to meet someone who enjoys the mix of effort, scenery, and long conversations that come with multi-hour rides. Open to dating or just building solid cycling friendships with people who love the road as much as I do.",
    languages: "Spanish, English",
    interestedIn: "Man",
    looking: "Individuals, Groups",
    bikeStyle: "Road Bike",
    avgDistance: "40 - 70km",
    routes:
      "EV6 \u2013 Rivers Route, EV15 \u2013 Rhine Cycle Route, EV7 \u2013 Sun Route, Elbe Cycle Route, Alps-Adria",
    swipesYes: [],
  },
  {
    id: "david",
    name: "David",
    age: 28,
    city: "Paris",
    photos: [
      "cr-images/david-01.jpeg",
      "cr-images/david-02.jpeg",
      "cr-images/david-03.jpeg",
      "cr-images/david-04.jpeg",
      "cr-images/david-05.jpeg",
    ],
    bio: "I love downhill trails, MTB parks, and the adrenaline of off-road cycling. I usually ride with a few friends, but I\u2019d really like to meet more people my age who share the same intensity and passion for trail riding. I use Strava to track my rides, but it feels too impersonal when it comes to making new connections. Dating isn\u2019t my main focus, but I\u2019m open to meeting someone who enjoys outdoor sports and adventure as much as I do.",
    languages: "French, English",
    interestedIn: "Any",
    looking: "Individuals, Groups",
    bikeStyle: "Mountain Bike",
    avgDistance: "40 - 70km",
    routes: "Alpe-Adria Route",
    swipesYes: [],
  },
];

/* ---- Swipe / Riders Page Logic ---- */
var currentRiderIndex = 0;
var currentPhotoIndex = 0;
var ridersToShow = [];

function initRidersPage() {
  var profile = getCRProfile();
  if (!profile) {
    window.location.href = "chain-reaction-create.html";
    return;
  }
  renderTopBar(profile);
  var swipes = getCRSwipes();
  ridersToShow = CR_RIDERS.filter(function (r) {
    return r.id !== profile.id && !swipes[r.id];
  });
  currentRiderIndex = 0;
  showCurrentRider();
}

function renderTopBar(profile) {
  var topbar = document.getElementById("crTopbar");
  if (!topbar) return;

  var hasPhoto = profile.photos && profile.photos[0];

  // Get initial (fallback to "?" if no name)
  var initial =
    profile.name && profile.name.length > 0
      ? profile.name.charAt(0).toUpperCase()
      : "?";

  var avatarHtml = hasPhoto
    ? '<img src="' + profile.photos[0] + '" class="cr-topbar-avatar" alt="You">'
    : '<div class="cr-topbar-avatar cr-topbar-avatar--empty">' +
      initial +
      "</div>";

  topbar.innerHTML =
    avatarHtml +
    '<span class="cr-topbar-name">' +
    profile.name +
    ", " +
    profile.age +
    ", " +
    profile.city +
    "</span>" +
    '<div class="cr-topbar-links">' +
    '<a href="chain-reaction-create.html">Chain Reaction Profile</a>' +
    '<a href="chain-reaction.html">Riders</a>' +
    '<a href="chain-reaction-chat.html" title="Chat"><span class="cr-topbar-logo-circle"><img src="LogoCR.svg" alt="Chat"></span></a>' +
    "</div>";
}

function showCurrentRider() {
  var container = document.getElementById("crRiderView");
  if (!container) return;
  if (currentRiderIndex >= ridersToShow.length) {
    container.innerHTML =
      '<div class="cr-no-more">There are no more riders at the moment</div>';
    return;
  }
  var rider = ridersToShow[currentRiderIndex];
  currentPhotoIndex = 0;
  var photosHtml = "";
  for (var i = 0; i < rider.photos.length; i++) {
    photosHtml +=
      '<img src="' +
      rider.photos[i] +
      '" alt="' +
      rider.name +
      '" class="' +
      (i === 0 ? "active" : "") +
      '">';
  }
  var dotsHtml = "";
  for (var i = 0; i < rider.photos.length; i++) {
    dotsHtml += '<div class="cr-dot ' + (i === 0 ? "active" : "") + '"></div>';
  }

  container.innerHTML =
    '<div class="cr-card-wrapper">' +
    '<div class="cr-profile-card">' +
    '<div class="cr-card-name">' +
    rider.name +
    ", " +
    rider.age +
    ", " +
    rider.city +
    "</div>" +
    '<div class="cr-carousel" id="crCarousel">' +
    photosHtml +
    '<button class="cr-carousel-prev" onclick="prevPhoto()"></button>' +
    '<button class="cr-carousel-next" onclick="nextPhoto()"></button>' +
    "</div>" +
    '<div class="cr-dots" id="crDots">' +
    dotsHtml +
    "</div>" +
    "</div>" +
    "</div>" +
    '<div class="cr-action-buttons">' +
    '<div class="cr-action-btn" onclick="swipeNo()" title="Not Interested"><img src="No.svg" alt="No"></div>' +
    '<div class="cr-action-btn" onclick="swipeYes()" title="Interested"><img src="Yes.svg" alt="Yes"></div>' +
    "</div>" +
    '<div class="cr-info-section">' +
    '<div class="cr-bio-card"><h3>Bio:</h3><p>' +
    rider.bio +
    "</p></div>" +
    '<div class="cr-info-row"><strong>Languages:</strong> <span>' +
    rider.languages +
    "</span></div>" +
    '<div class="cr-info-row"><strong>Interested in:</strong> <span>' +
    rider.interestedIn +
    "</span></div>" +
    '<div class="cr-info-row"><strong>Looking For:</strong> <span>' +
    rider.looking +
    "</span></div>" +
    '<div class="cr-info-row"><strong>Bike Category:</strong> <span>' +
    rider.bikeStyle +
    "</span></div>" +
    '<div class="cr-info-row"><strong>Average Distance Ridden:</strong> <span>' +
    rider.avgDistance +
    "</span></div>" +
    '<div class="cr-info-row"><strong>Routes of Interest:</strong> <span>' +
    rider.routes +
    "</span></div>" +
    "</div>";
}

function prevPhoto() {
  var rider = ridersToShow[currentRiderIndex];
  if (!rider) return;
  currentPhotoIndex =
    (currentPhotoIndex - 1 + rider.photos.length) % rider.photos.length;
  updateCarousel(rider);
}

function nextPhoto() {
  var rider = ridersToShow[currentRiderIndex];
  if (!rider) return;
  currentPhotoIndex = (currentPhotoIndex + 1) % rider.photos.length;
  updateCarousel(rider);
}

function updateCarousel(rider) {
  var carousel = document.getElementById("crCarousel");
  var dots = document.getElementById("crDots");
  if (!carousel || !dots) return;
  var imgs = carousel.querySelectorAll("img");
  var dotEls = dots.querySelectorAll(".cr-dot");
  for (var i = 0; i < imgs.length; i++) {
    imgs[i].className = i === currentPhotoIndex ? "active" : "";
  }
  for (var i = 0; i < dotEls.length; i++) {
    dotEls[i].className = "cr-dot" + (i === currentPhotoIndex ? " active" : "");
  }
}

function swipeNo() {
  var rider = ridersToShow[currentRiderIndex];
  if (!rider) return;
  var swipes = getCRSwipes();
  swipes[rider.id] = "no";
  saveCRSwipes(swipes);
  currentRiderIndex++;
  showCurrentRider();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function swipeYes() {
  var rider = ridersToShow[currentRiderIndex];
  if (!rider) return;
  var swipes = getCRSwipes();
  swipes[rider.id] = "yes";
  saveCRSwipes(swipes);

  // Always add the rider to matches when user clicks Yes
  var profile = getCRProfile();
  var matches = getCRMatches();
  if (matches.indexOf(rider.id) === -1) {
    matches.push(rider.id);
    saveCRMatches(matches);
  }

  // Check for mutual match: does this rider have the current user in their swipesYes?
  var isMatch = rider.swipesYes && rider.swipesYes.indexOf(profile.id) !== -1;

  if (isMatch) {
    showMatchPopup(profile, rider);
  } else {
    currentRiderIndex++;
    showCurrentRider();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/* ---- Match Popup ---- */
function showMatchPopup(profile, rider) {
  var overlay = document.getElementById("crMatchOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "crMatchOverlay";
    overlay.className = "cr-match-overlay";
    document.body.appendChild(overlay);
  }
  var hasMyPhoto = profile.photos && profile.photos[0];
  var theirPhoto = rider.photos[0];
  var myAvatarHtml;
  if (hasMyPhoto) {
    myAvatarHtml = '<img src="' + profile.photos[0] + '" class="cr-match-avatar" alt="You">';
  } else {
    var myInitial = (profile.name || '?').charAt(0).toUpperCase();
    myAvatarHtml = '<span class="cr-match-avatar cr-match-avatar-initial">' + myInitial + '</span>';
  }

  overlay.innerHTML =
    '<div class="cr-match-card">' +
    '<div class="cr-match-photos">' +
    myAvatarHtml +
    '<img src="LogoCR.svg" class="cr-match-logo" alt="Match">' +
    '<img src="' +
    theirPhoto +
    '" class="cr-match-avatar" alt="' +
    rider.name +
    '">' +
    "</div>" +
    '<div class="cr-match-title">Your Next Ride Awaits!</div>' +
    '<div class="cr-match-subtitle">You and ' +
    rider.name +
    " have matched!</div>" +
    '<div class="cr-match-actions">' +
    '<button class="cr-match-btn cr-match-btn-chat" onclick="goToChat(\'' +
    rider.id +
    "')\">Send a Message</button>" +
    '<button class="cr-match-btn cr-match-btn-meet" onclick="suggestMeeting(\'' +
    rider.id +
    "')\">Suggest a Meeting Place</button>" +
    '<button class="cr-match-btn cr-match-btn-continue" onclick="closeMatchPopup()">Keep Swiping</button>' +
    "</div>" +
    "</div>";

  setTimeout(function () {
    overlay.classList.add("open");
  }, 50);
  if (typeof schDialog === 'function') schDialog(overlay);
}

function closeMatchPopup() {
  var overlay = document.getElementById("crMatchOverlay");
  if (overlay) overlay.classList.remove("open");
  currentRiderIndex++;
  showCurrentRider();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goToChat(riderId) {
  window.location.href = "chain-reaction-chat.html?rider=" + riderId;
}

function suggestMeeting(riderId) {
  var place = prompt("Suggest a meeting place for your ride:");
  if (place && place.trim()) {
    var chats = getCRChats();
    if (!chats[riderId]) chats[riderId] = [];
    var profile = getCRProfile();
    chats[riderId].push({
      from: profile.id,
      text: "\uD83D\uDCCD Meeting suggestion: " + place.trim(),
      time: new Date().toISOString(),
    });
    saveCRChats(chats);
    goToChat(riderId);
  }
}

/* ---- Chat Page Logic ---- */
var activeChatRider = null;

function initChatPage() {
  var profile = getCRProfile();
  if (!profile) {
    window.location.href = "chain-reaction-create.html";
    return;
  }
  renderTopBar(profile);
  renderChatSidebar(profile);

  // Check URL param for pre-selected rider
  var params = new URLSearchParams(window.location.search);
  var riderId = params.get("rider");
  if (riderId) {
    openChat(riderId);
  }
}

function renderChatSidebar(profile) {
  var sidebar = document.getElementById("crChatSidebar");
  if (!sidebar) return;
  var matches = getCRMatches();
  if (matches.length === 0) {
    sidebar.innerHTML =
      '<div class="cr-chat-no-matches">No matches yet. Keep swiping!</div>';
    return;
  }
  var html = "";
  for (var i = 0; i < matches.length; i++) {
    var rider = getRiderById(matches[i]);
    if (!rider) continue;
    html +=
      '<div class="cr-chat-contact" onclick="openChat(\'' +
      rider.id +
      '\')" data-rider="' +
      rider.id +
      '">' +
      '<img src="' +
      rider.photos[0] +
      '" alt="' +
      rider.name +
      '">' +
      '<div class="cr-chat-contact-info">' +
      '<span class="cr-chat-contact-name">' +
      rider.name +
      "</span>" +
      '<span class="cr-chat-contact-detail">' +
      rider.age +
      " \u2022 " +
      rider.city +
      "</span>" +
      "</div>" +
      "</div>";
  }
  sidebar.innerHTML = html;
}

function getRiderById(id) {
  for (var i = 0; i < CR_RIDERS.length; i++) {
    if (CR_RIDERS[i].id === id) return CR_RIDERS[i];
  }
  return null;
}

function openChat(riderId) {
  activeChatRider = getRiderById(riderId);
  if (!activeChatRider) return;

  // Highlight sidebar
  var contacts = document.querySelectorAll(".cr-chat-contact");
  for (var i = 0; i < contacts.length; i++) {
    contacts[i].classList.toggle(
      "active",
      contacts[i].getAttribute("data-rider") === riderId,
    );
  }

  renderChatMessages();
}

function renderChatMessages() {
  var main = document.getElementById("crChatMain");
  if (!main || !activeChatRider) return;
  var profile = getCRProfile();
  var chats = getCRChats();
  var messages = chats[activeChatRider.id] || [];

  var html = '<div class="cr-chat-messages" id="crChatMessages">';
  if (messages.length === 0) {
    html +=
      '<div class="cr-chat-placeholder">Say hi to ' +
      activeChatRider.name +
      "!</div>";
  } else {
    for (var i = 0; i < messages.length; i++) {
      var msg = messages[i];
      var isSent = msg.from === profile.id;
      var avatarHtml;
      if (isSent) {
        if (profile.photos && profile.photos[0]) {
          avatarHtml = '<img src="' + profile.photos[0] + '" alt="You">';
        } else {
          var initial = (profile.name || '?').charAt(0).toUpperCase();
          avatarHtml = '<span class="cr-chat-avatar-initial">' + initial + '</span>';
        }
      } else {
        avatarHtml = '<img src="' + activeChatRider.photos[0] + '" alt="' + activeChatRider.name + '">';
      }
      html +=
        '<div class="cr-chat-msg ' +
        (isSent ? "sent" : "received") +
        '">' +
        avatarHtml +
        '<div class="cr-chat-bubble">' +
        escapeHtml(msg.text) +
        "</div>" +
        "</div>";
    }
  }
  html += "</div>";
  html +=
    '<div class="cr-chat-input-area">' +
    '<input type="text" class="cr-chat-input" id="crChatInput" placeholder="Type a message..." onkeydown="if(event.key===\'Enter\')sendChatMessage()">' +
    '<button class="cr-chat-send-btn" onclick="sendChatMessage()"><i class="bi bi-send-fill"></i></button>' +
    "</div>";

  main.innerHTML = html;

  // Scroll to bottom
  var msgContainer = document.getElementById("crChatMessages");
  if (msgContainer) msgContainer.scrollTop = msgContainer.scrollHeight;
}

function sendChatMessage() {
  var input = document.getElementById("crChatInput");
  if (!input || !activeChatRider) return;
  var text = input.value.trim();
  if (!text) return;

  var profile = getCRProfile();
  var chats = getCRChats();
  if (!chats[activeChatRider.id]) chats[activeChatRider.id] = [];
  chats[activeChatRider.id].push({
    from: profile.id,
    text: text,
    time: new Date().toISOString(),
  });
  saveCRChats(chats);
  renderChatMessages();

  // Simulate auto-reply after 1.5s
  setTimeout(function () {
    simulateReply(activeChatRider);
  }, 1500);
}

function simulateReply(rider) {
  var replies = [
    "Hi! Great to connect with you! \uD83D\uDE80",
    "Hey! Would love to go for a ride sometime!",
    "That sounds awesome! What route do you have in mind?",
    "I'm free this weekend if you want to ride together!",
    "Nice to meet you! What's your favourite cycling route?",
    "Let's plan a ride! \uD83D\uDEB4",
  ];
  var chats = getCRChats();
  if (!chats[rider.id]) chats[rider.id] = [];
  var replyIndex = chats[rider.id].length % replies.length;
  chats[rider.id].push({
    from: rider.id,
    text: replies[replyIndex],
    time: new Date().toISOString(),
  });
  saveCRChats(chats);
  if (activeChatRider && activeChatRider.id === rider.id) {
    renderChatMessages();
  }
}

function escapeHtml(text) {
  var div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/* ---- CR Profile Creation Logic ---- */
var crPhotoFiles = [null, null, null, null, null];
var crPhotoDataUrls = [null, null, null, null, null];

function initCreatePage() {
  var profile = getCRProfile();
  var isExisting = !!profile;

  // Update button visibility based on profile state
  updateCreatePageButtons(isExisting);

  // Sync displayed user name from auth
  syncDisplayedUserName();

  // If existing profile, disable form fields until Edit is clicked
  if (isExisting) {
    setFormEditable(false);
  }

  if (profile) {
    // Pre-fill form with existing data
    var nameInput = document.getElementById("crName");
    var ageInput = document.getElementById("crAge");
    var cityInput = document.getElementById("crCity");
    var bioInput = document.getElementById("crBio");
    var langInput = document.getElementById("crLanguages");
    if (nameInput) nameInput.value = profile.name || "";
    if (ageInput) ageInput.value = profile.age || "";
    if (cityInput) cityInput.value = profile.city || "";
    if (bioInput) bioInput.value = profile.bio || "";
    if (langInput) langInput.value = profile.languages || "";

    // Pre-select checkboxes
    if (profile.interestedIn) {
      var vals = profile.interestedIn.split(", ");
      for (var i = 0; i < vals.length; i++) {
        var cb = document.querySelector(
          'input[name="crInterestedIn"][value="' + vals[i] + '"]',
        );
        if (cb) cb.checked = true;
      }
    }
    if (profile.looking) {
      var vals = profile.looking.split(", ");
      for (var i = 0; i < vals.length; i++) {
        var cb = document.querySelector(
          'input[name="crLooking"][value="' + vals[i] + '"]',
        );
        if (cb) cb.checked = true;
      }
    }
    if (profile.bikeStyle) {
      var vals = profile.bikeStyle.split(", ");
      for (var i = 0; i < vals.length; i++) {
        var cb = document.querySelector(
          'input[name="crBikeCategory"][value="' + vals[i] + '"]',
        );
        if (cb) cb.checked = true;
      }
    }
    if (profile.avgDistance) {
      var sel = document.getElementById("crAvgDistance");
      if (sel) sel.value = profile.avgDistance;
    }
    if (profile.routes) {
      var vals = profile.routes.split(", ");
      for (var i = 0; i < vals.length; i++) {
        var cb = document.querySelector(
          'input[name="crRoutes"][value="' + vals[i] + '"]',
        );
        if (cb) cb.checked = true;
      }
    }

    // Show existing photos
    if (profile.photos) {
      for (var i = 0; i < profile.photos.length && i < 5; i++) {
        crPhotoDataUrls[i] = profile.photos[i];
        var slot = document.getElementById("crPhotoSlot" + i);
        if (slot) {
          var img = slot.querySelector("img");
          if (img) {
            img.src = profile.photos[i];
            img.style.display = "block";
          }
          var plus = slot.querySelector(".cr-photo-plus");
          if (plus) plus.style.display = "none";
          var label = slot.querySelector(".cr-photo-label");
          if (label) label.style.display = "none";
          var delBtn = slot.querySelector(".cr-photo-delete");
          if (delBtn) delBtn.classList.add("visible");
        }
      }
    }
  }
}

function deleteCRPhoto(event, index) {
  event.stopPropagation();
  event.preventDefault();
  crPhotoFiles[index] = null;
  crPhotoDataUrls[index] = null;
  var slot = document.getElementById("crPhotoSlot" + index);
  if (slot) {
    var img = slot.querySelector("img");
    if (img) {
      img.src = "";
      img.style.display = "none";
    }
    var plus = slot.querySelector(".cr-photo-plus");
    if (plus) plus.style.display = "";
    var label = slot.querySelector(".cr-photo-label");
    if (label) label.style.display = "";
    var fileInput = slot.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
    var delBtn = slot.querySelector(".cr-photo-delete");
    if (delBtn) delBtn.classList.remove("visible");
  }
}

function handleCRPhotoUpload(index, input) {
  if (!input.files || !input.files[0]) return;
  var file = input.files[0];
  crPhotoFiles[index] = file;
  var reader = new FileReader();
  reader.onload = function (e) {
    crPhotoDataUrls[index] = e.target.result;
    var slot = document.getElementById("crPhotoSlot" + index);
    if (slot) {
      var img = slot.querySelector("img");
      if (img) {
        img.src = e.target.result;
        img.style.display = "block";
      }
      var plus = slot.querySelector(".cr-photo-plus");
      if (plus) plus.style.display = "none";
      var delBtn = slot.querySelector(".cr-photo-delete");
      if (delBtn) delBtn.classList.add("visible");
    }
  };
  reader.readAsDataURL(file);
}

function handleCRMultiPhotoUpload(input) {
  if (!input.files || input.files.length === 0) return;
  var files = Array.prototype.slice.call(input.files);
  // Find first empty slot
  var startSlot = 0;
  for (var s = 0; s < 5; s++) {
    if (!crPhotoDataUrls[s]) {
      startSlot = s;
      break;
    }
    if (s === 4) {
      startSlot = 5;
    }
  }
  var added = 0;
  for (var f = 0; f < files.length && startSlot + added < 5; f++) {
    var slotIndex = startSlot + added;
    // Skip slots that already have photos
    while (slotIndex < 5 && crPhotoDataUrls[slotIndex]) {
      slotIndex++;
    }
    if (slotIndex >= 5) break;
    crPhotoFiles[slotIndex] = files[f];
    (function (idx, file) {
      var reader = new FileReader();
      reader.onload = function (e) {
        crPhotoDataUrls[idx] = e.target.result;
        var slot = document.getElementById("crPhotoSlot" + idx);
        if (slot) {
          var img = slot.querySelector("img");
          if (img) {
            img.src = e.target.result;
            img.style.display = "block";
          }
          var plus = slot.querySelector(".cr-photo-plus");
          if (plus) plus.style.display = "none";
          var label = slot.querySelector(".cr-photo-label");
          if (label) label.style.display = "none";
          var delBtn = slot.querySelector(".cr-photo-delete");
          if (delBtn) delBtn.classList.add("visible");
        }
      };
      reader.readAsDataURL(file);
    })(slotIndex, files[f]);
    added++;
  }
  if (files.length > 5 - startSlot) {
    showCRUploadMessage(
      "Maximum 5 Photos",
      "You can upload up to 5 photos. Only the first " +
        Math.min(5, startSlot + added) +
        " were added.",
      "error",
    );
  } else if (added > 0) {
    showCRUploadMessage(
      "Photos Uploaded",
      added + " photo" + (added > 1 ? "s" : "") + " added successfully!",
      "success",
    );
  }
}

function showCRUploadMessage(title, message, type) {
  var existing = document.getElementById("crUploadOverlay");
  if (existing) existing.remove();
  var overlay = document.createElement("div");
  overlay.id = "crUploadOverlay";
  overlay.className = "cr-upload-overlay";
  var iconHtml =
    type === "success"
      ? '<i class="bi bi-check-circle-fill"></i>'
      : '<i class="bi bi-exclamation-circle-fill"></i>';
  overlay.innerHTML =
    '<div class="cr-upload-card">' +
    '<div class="cr-upload-icon ' +
    type +
    '">' +
    iconHtml +
    "</div>" +
    "<h3>" +
    title +
    "</h3>" +
    "<p>" +
    message +
    "</p>" +
    '<button onclick="closeCRUploadMessage()">OK</button>' +
    "</div>";
  document.body.appendChild(overlay);
  setTimeout(function () {
    overlay.classList.add("open");
  }, 50);
  if (typeof schDialog === 'function') schDialog(overlay);
}

function closeCRUploadMessage() {
  var overlay = document.getElementById("crUploadOverlay");
  if (overlay) {
    overlay.classList.remove("open");
    setTimeout(function () {
      overlay.remove();
    }, 300);
  }
}

function cancelCRProfile() {
  // Discard unsaved changes by reloading the page (restores saved profile or empty state)
  window.location.reload();
}

function handleCRProfileSubmit(e) {
  e.preventDefault();
  var name = document.getElementById("crName").value.trim();
  var age = parseInt(document.getElementById("crAge").value, 10);
  var city = document.getElementById("crCity").value.trim();
  var bio = document.getElementById("crBio").value.trim();
  var languages = document.getElementById("crLanguages").value.trim();

  if (!name || !age || !city) {
    alert("Please fill in your name, age, and city.");
    return;
  }

  // Word count check for bio
  if (bio) {
    var wordCount = bio.split(/\s+/).filter(function (w) {
      return w.length > 0;
    }).length;
    if (wordCount > 200) {
      alert(
        "Bio must be 200 words or fewer. Currently: " + wordCount + " words.",
      );
      return;
    }
  }

  var interestedIn = getCheckedValues("crInterestedIn");
  var looking = getCheckedValues("crLooking");
  var bikeStyle = getCheckedValues("crBikeCategory");
  var avgDistance = document.getElementById("crAvgDistance").value;
  var routes = getCheckedValues("crRoutes");

  var photos = [];
  for (var i = 0; i < 5; i++) {
    if (crPhotoDataUrls[i]) photos.push(crPhotoDataUrls[i]);
  }

  // Photos are optional — no validation needed

  var profileId =
    name.toLowerCase().replace(/[^a-z0-9]/g, "") + "_" + Date.now();
  var existing = getCRProfile();
  if (existing && existing.id) profileId = existing.id;

  var profile = {
    id: profileId,
    name: name,
    age: age,
    city: city,
    bio: bio,
    languages: languages,
    interestedIn: interestedIn,
    looking: looking,
    bikeStyle: bikeStyle,
    avgDistance: avgDistance,
    routes: routes,
    photos: photos,
  };

  saveCRProfile(profile);
  // Show success message and update button states
  showCRUploadMessage(
    "Profile Saved",
    "Your rider profile has been saved successfully!",
    "success",
  );
  // Re-init the page to update button states
  setTimeout(function () {
    initCreatePage();
  }, 300);
}

function getCheckedValues(name) {
  var checkboxes = document.querySelectorAll(
    'input[name="' + name + '"]:checked',
  );
  var values = [];
  for (var i = 0; i < checkboxes.length; i++) {
    values.push(checkboxes[i].value);
  }
  return values.join(", ");
}

/* ---- Button State Management ---- */
function updateCreatePageButtons(isExisting) {
  var btnCreate = document.getElementById("crBtnCreate");
  var btnEdit = document.getElementById("crBtnEdit");
  var btnSave = document.getElementById("crBtnSave");
  var btnStartRiding = document.getElementById("crBtnStartRiding");
  var btnCancel = document.getElementById("crBtnCancel");

  if (isExisting) {
    // Profile exists: show Edit, Save, Start Riding, Cancel; hide Create Profile
    if (btnCreate) btnCreate.style.display = "none";
    if (btnEdit) btnEdit.style.display = "";
    if (btnSave) btnSave.style.display = "";
    if (btnStartRiding) btnStartRiding.style.display = "";
    if (btnCancel) btnCancel.style.display = "";
  } else {
    // Profile empty: show Create Profile and Cancel; hide Edit, Save, Start Riding
    if (btnCreate) btnCreate.style.display = "";
    if (btnEdit) btnEdit.style.display = "none";
    if (btnSave) btnSave.style.display = "none";
    if (btnStartRiding) btnStartRiding.style.display = "none";
    if (btnCancel) btnCancel.style.display = "";
  }
}

function syncDisplayedUserName() {
  var nameDisplay = document.getElementById("crProfileNameDisplay");
  if (!nameDisplay) return;
  // Try to get name from auth
  try {
    var raw = localStorage.getItem("sch_auth");
    if (raw) {
      var auth = JSON.parse(raw);
      if (auth.user && auth.user.name) {
        nameDisplay.textContent = auth.user.name;
        // Also pre-fill the name input if empty
        var nameInput = document.getElementById("crName");
        if (nameInput && !nameInput.value) {
          nameInput.value = auth.user.name;
        }
        return;
      }
    }
  } catch (e) {}
  // Fallback: use CR profile name
  var profile = getCRProfile();
  if (profile && profile.name) {
    nameDisplay.textContent = profile.name;
  }
}

function setFormEditable(editable) {
  var form = document.querySelector(".cr-create-card form");
  if (!form) return;
  var inputs = form.querySelectorAll("input, select, textarea");
  for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].type === "file") {
      // Disable/enable file inputs too
      inputs[i].disabled = !editable;
      continue;
    }
    inputs[i].disabled = !editable;
  }
  // Also toggle photo upload slots — disable file inputs
  var photoSlots = form.querySelectorAll('.cr-photo-slot input[type="file"]');
  for (var i = 0; i < photoSlots.length; i++) {
    photoSlots[i].disabled = !editable;
  }
  // Also toggle multi-upload input
  var multiUpload = document.getElementById("crMultiUpload");
  if (multiUpload) multiUpload.disabled = !editable;

  // Toggle photo delete buttons visibility
  var deleteButtons = form.querySelectorAll('.cr-photo-delete');
  for (var i = 0; i < deleteButtons.length; i++) {
    if (editable) {
      deleteButtons[i].classList.remove('edit-locked');
    } else {
      deleteButtons[i].classList.add('edit-locked');
    }
  }

  // Toggle pointer-events on photo slots to prevent clicking when locked
  var slots = form.querySelectorAll('.cr-photo-slot');
  for (var i = 0; i < slots.length; i++) {
    if (editable) {
      slots[i].classList.remove('edit-locked');
    } else {
      slots[i].classList.add('edit-locked');
    }
  }
}

function enableEditMode() {
  setFormEditable(true);
  // Focus on the first input
  var nameInput = document.getElementById("crName");
  if (nameInput) nameInput.focus();
}

function startRiding() {
  window.location.href = "chain-reaction.html";
}
