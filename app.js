/**
 * MO-TECH - Lost & Found Web Application Logic
 * Powered by Leaflet.js, CartoDB Dark Matter, and LocalStorage
 */

// ==========================================
// Seed / Initial Data
// ==========================================
const DEFAULT_ITEMS = [
  {
    id: "seed-1",
    title: "Black Leather Wallet",
    type: "lost",
    category: "bags",
    date: "2026-05-18",
    description: "Lost my premium leather wallet near Central Square. It contains my driver's license and some cards. There is a small metal engraving of a wolf on the bottom right corner.",
    contactAddress: "142 Baker St, London, UK",
    phone: "+44 20 7946 0912",
    email: "sarah.jenkins@mail.com",
    createdBy: "sarah_j",
    createdAt: Date.now() - 86400000
  },
  {
    id: "seed-2",
    title: "iPhone 15 Pro Max (Titanium)",
    type: "found",
    category: "electronics",
    date: "2026-05-17",
    description: "Found an iPhone 15 Pro Max sitting on a bench in Hyde Park near the Serpentine. It has a blue silicon cover with a pattern of stars on the back. It is currently locked, but turning on shows a lockscreen of a golden retriever.",
    contactAddress: "Hyde Park Police Station, London",
    phone: "+44 20 7946 0524",
    email: "officer.davis@metpolice.gov.uk",
    lat: 51.5072,
    lng: -0.1657,
    createdBy: "officer_davis",
    createdAt: Date.now() - 172800000
  }
];

// ==========================================
// Application State & Storage
// ==========================================
class AppStore {
  static getItems() {
    let items = localStorage.getItem("motech_items");
    if (!items) {
      localStorage.setItem("motech_items", JSON.stringify(DEFAULT_ITEMS));
      return DEFAULT_ITEMS;
    }
    return JSON.parse(items);
  }

  static saveItem(item) {
    const items = this.getItems();
    items.unshift(item);
    localStorage.setItem("motech_items", JSON.stringify(items));
    return items;
  }

  static getUsers() {
    let users = localStorage.getItem("motech_users");
    return users ? JSON.parse(users) : [];
  }

  static saveUser(user) {
    const users = this.getUsers();
    users.push(user);
    localStorage.setItem("motech_users", JSON.stringify(users));
  }

  static getCurrentUser() {
    let user = localStorage.getItem("motech_current_user");
    return user ? JSON.parse(user) : null;
  }

  static setCurrentUser(user) {
    if (user) {
      localStorage.setItem("motech_current_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("motech_current_user");
    }
  }
}

// ==========================================
// Map Managers (Leaflet + CartoDB tiles)
// ==========================================
let creationMapInstance = null;
let creationMarker = null;
let detailMapInstance = null;
let detailMarker = null;

// Premium dark-styled tiles
const MAP_TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const MAP_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

function initCreationMap() {
  if (creationMapInstance) return;

  // Center on London default
  const defaultLat = 51.5074;
  const defaultLng = -0.1278;

  creationMapInstance = L.map("creationMap", {
    zoomControl: true,
    scrollWheelZoom: true
  }).setView([defaultLat, defaultLng], 13);

  L.tileLayer(MAP_TILE_URL, {
    attribution: MAP_ATTRIBUTION,
    maxZoom: 19
  }).addTo(creationMapInstance);

  // Initial marker
  creationMarker = L.marker([defaultLat, defaultLng], {
    draggable: true
  }).addTo(creationMapInstance);

  updateCreationCoordinates(defaultLat, defaultLng);

  // Update on marker drag
  creationMarker.on("dragend", function (e) {
    const position = creationMarker.getLatLng();
    updateCreationCoordinates(position.lat, position.lng);
  });

  // Update on map click
  creationMapInstance.on("click", function (e) {
    creationMarker.setLatLng(e.latlng);
    updateCreationCoordinates(e.latlng.lat, e.latlng.lng);
  });
}

function updateCreationCoordinates(lat, lng) {
  document.getElementById("postLat").value = lat;
  document.getElementById("postLng").value = lng;
}

function resizeCreationMap() {
  if (creationMapInstance) {
    setTimeout(() => {
      creationMapInstance.invalidateSize();
    }, 200);
  }
}

function initDetailMap(lat, lng, title) {
  const container = document.getElementById("detailMap");
  
  // Re-create DOM element container to prevent leaflet init errors
  const parent = container.parentElement;
  parent.innerHTML = '<div id="detailMap" class="map-container"></div>';

  detailMapInstance = L.map("detailMap", {
    zoomControl: true,
    scrollWheelZoom: false
  }).setView([lat, lng], 14);

  L.tileLayer(MAP_TILE_URL, {
    attribution: MAP_ATTRIBUTION,
    maxZoom: 19
  }).addTo(detailMapInstance);

  detailMarker = L.marker([lat, lng]).addTo(detailMapInstance)
    .bindPopup(`<strong>${title}</strong><br/>Pickup Point`)
    .openPopup();

  setTimeout(() => {
    detailMapInstance.invalidateSize();
  }, 200);
}

// ==========================================
// UI Helpers & Toasts
// ==========================================
function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  const icon = type === "success" 
    ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;

  toast.innerHTML = `
    ${icon}
    <span>${message}</span>
  `;

  container.appendChild(toast);
  
  // Trigger entry animation
  setTimeout(() => {
    toast.classList.add("show");
  }, 50);

  // Remove toast
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 4000);
}

function formatDate(dateStr) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString(undefined, options);
}

// ==========================================
// Auth Manager
// ==========================================
let authMode = "signin";

function setAuthMode(mode) {
  authMode = mode;
  const title = document.getElementById("authModalTitle");
  const userGroup = document.getElementById("usernameGroup");
  const passwordGroup = document.getElementById("passwordGroup");
  const submitBtn = document.getElementById("btnAuthSubmit");
  const switchContainer = document.querySelector(".auth-switch");
  const switchText = document.getElementById("authSwitchText");
  const switchLink = document.getElementById("authSwitchLink");
  const pwdLabel = document.querySelector("#passwordGroup .form-label");

  // Reset defaults
  if (pwdLabel) pwdLabel.textContent = "Password";
  document.getElementById("authUsername").removeAttribute("required");
  document.getElementById("authPassword").removeAttribute("required");
  userGroup.style.display = "none";
  switchContainer.style.display = "block";

  if (mode === "signup") {
    title.textContent = "Create Account";
    userGroup.style.display = "block";
    submitBtn.textContent = "Register";
    switchText.textContent = "Already have an account?";
    switchLink.textContent = "Sign In";
    document.getElementById("authUsername").setAttribute("required", "true");
    document.getElementById("authPassword").setAttribute("required", "true");
  } else if (mode === "signin") {
    title.textContent = "Sign In";
    submitBtn.textContent = "Sign In";
    switchText.textContent = "New to MO-TECH?";
    switchLink.textContent = "Create an account";
    document.getElementById("authPassword").setAttribute("required", "true");
  } else if (mode === "recover") {
    title.textContent = "Reset Password";
    submitBtn.textContent = "Reset & Save Password";
    switchText.textContent = "Remembered password?";
    switchLink.textContent = "Sign In";
    document.getElementById("authPassword").setAttribute("required", "true");
    if (pwdLabel) pwdLabel.textContent = "New Password";
  }
}

function toggleAuthMode() {
  if (authMode === "signin") {
    setAuthMode("signup");
  } else {
    setAuthMode("signin");
  }
}

function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById("authEmail").value.trim().toLowerCase();
  const password = document.getElementById("authPassword").value;
  const fullName = document.getElementById("authUsername").value.trim();
  const users = AppStore.getUsers();

  if (authMode === "signup") {
    // Check if user already exists
    if (users.find(u => u.email === email)) {
      showToast("Email address already registered.", "error");
      return;
    }

    const newUser = {
      id: "user-" + Date.now(),
      fullName,
      email,
      password // In a real production app, password hashing is essential.
    };

    AppStore.saveUser(newUser);
    AppStore.setCurrentUser(newUser);
    showToast(`Account successfully registered! Welcome, ${fullName}.`);
  } else if (authMode === "signin") {
    // Sign In Mode
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      showToast("Invalid email or password. Please try again.", "error");
      return;
    }

    AppStore.setCurrentUser(user);
    showToast(`Welcome back, ${user.fullName}!`);
  } else if (authMode === "recover") {
    // Password Recovery Mode
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) {
      showToast("No account found with this email address.", "error");
      return;
    }

    users[userIndex].password = password;
    localStorage.setItem("motech_users", JSON.stringify(users));
    AppStore.setCurrentUser(users[userIndex]);
    showToast(`Password successfully reset! Welcome back, ${users[userIndex].fullName}.`);
  }

  // Update UI and close modal
  updateSessionUI();
  closeModal("authModal");
  document.getElementById("authForm").reset();
}

function handleSignOut() {
  AppStore.setCurrentUser(null);
  updateSessionUI();
  showToast("You have been signed out successfully.");
}

function updateSessionUI() {
  const currentUser = AppStore.getCurrentUser();
  const guestControls = document.getElementById("guestControls");
  const authControls = document.getElementById("authControls");
  const safetyBanner = document.getElementById("safetyBanner");

  if (currentUser) {
    guestControls.style.display = "none";
    authControls.style.display = "flex";
    
    // Set safety notice visible prominently after user login (as explicitly requested!)
    safetyBanner.style.display = "flex";

    document.getElementById("navUsername").textContent = currentUser.fullName;
    document.getElementById("avatarLetter").textContent = currentUser.fullName.charAt(0).toUpperCase();
  } else {
    guestControls.style.display = "flex";
    authControls.style.display = "none";
    
    // Hide safety banner when logged out
    safetyBanner.style.display = "none";
  }
}

// ==========================================
// Item Posting Manager
// ==========================================
let currentPostType = "lost";

function setPostType(type) {
  currentPostType = type;
  const lostBtn = document.getElementById("postTypeLost");
  const foundBtn = document.getElementById("postTypeFound");
  const mapSection = document.getElementById("foundMapSection");

  if (type === "lost") {
    lostBtn.classList.add("active");
    foundBtn.classList.remove("active");
    mapSection.style.display = "none";
  } else {
    lostBtn.classList.remove("active");
    foundBtn.classList.add("active");
    mapSection.style.display = "block";
    
    // Trigger map container layout recalculation
    resizeCreationMap();
  }
}

function handlePostSubmit(e) {
  e.preventDefault();
  const currentUser = AppStore.getCurrentUser();
  
  if (!currentUser) {
    showToast("You must be logged in to report an item.", "error");
    openModal("authModal");
    return;
  }

  const title = document.getElementById("postTitle").value.trim();
  const category = document.getElementById("postCategory").value;
  const date = document.getElementById("postDate").value;
  const description = document.getElementById("postDescription").value.trim();
  const contactAddress = document.getElementById("postContactAddress").value.trim();
  const phone = document.getElementById("postPhone").value.trim();
  const email = document.getElementById("postEmail").value.trim();

  const newItem = {
    id: "item-" + Date.now(),
    title,
    type: currentPostType,
    category,
    date,
    description,
    contactAddress,
    phone,
    email,
    createdBy: currentUser.email,
    createdAt: Date.now(),
    image: uploadedImageBase64
  };

  // Add coordinates if item is Found
  if (currentPostType === "found") {
    const lat = parseFloat(document.getElementById("postLat").value);
    const lng = parseFloat(document.getElementById("postLng").value);
    if (!isNaN(lat) && !isNaN(lng)) {
      newItem.lat = lat;
      newItem.lng = lng;
    }
  }

  AppStore.saveItem(newItem);
  showToast(`Successfully reported ${currentPostType} item: ${title}!`);
  
  closeModal("postModal");
  document.getElementById("postForm").reset();
  
  // Reset Upload Image Preview States
  uploadedImageBase64 = null;
  const previewContainer = document.getElementById("postImagePreviewContainer");
  const previewImage = document.getElementById("postImagePreview");
  if (previewContainer) previewContainer.style.display = "none";
  if (previewImage) previewImage.src = "";
  
  // Reload posts feed
  renderFeed();
}

// ==========================================
// Feed Rendering & Filtering
// ==========================================
let currentFilterType = "all"; // all, lost, found
let currentCategory = "all";
let searchQuery = "";
let showOnlyMyPosts = false;
let uploadedImageBase64 = null;

function renderFeed() {
  const items = AppStore.getItems();
  const grid = document.getElementById("itemsGrid");
  const counter = document.getElementById("itemCounter");
  const currentUser = AppStore.getCurrentUser();

  grid.innerHTML = "";

  // Perform filtering
  const filtered = items.filter(item => {
    // Filter Type
    if (currentFilterType !== "all" && item.type !== currentFilterType) {
      return false;
    }

    // Filter Category
    if (currentCategory !== "all" && item.category !== currentCategory) {
      return false;
    }

    // Filter My Posts
    if (showOnlyMyPosts) {
      if (!currentUser || item.createdBy !== currentUser.email) {
        return false;
      }
    }

    // Filter Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchAddress = item.contactAddress.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchAddress;
    }

    return true;
  });

  // Update Item Count and Feed Title dynamically
  counter.textContent = `${filtered.length} item${filtered.length === 1 ? "" : "s"} indexed`;
  
  const feedTitle = document.getElementById("feedTitle");
  if (showOnlyMyPosts) {
    feedTitle.textContent = `My Posted Reports (${filtered.length})`;
  } else {
    feedTitle.textContent = `Latest Reports (${filtered.length} Indexed)`;
  }

  // Render Grid items
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3>No matching posts found</h3>
        <p>Try refining your search keyword, changing filter tags, or adding your own item report!</p>
      </div>
    `;
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement("article");
    card.className = "card";
    card.addEventListener("click", () => openItemDetail(item));

    // Choose visual category icons
    let categoryIcon = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`;
    if (item.category === "electronics") {
      categoryIcon = `<svg viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`;
    } else if (item.category === "documents") {
      categoryIcon = `<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
    } else if (item.category === "bags") {
      categoryIcon = `<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="15" rx="2"/><path d="M16 6a4 4 0 0 0-8 0"/></svg>`;
    } else if (item.category === "clothing") {
      categoryIcon = `<svg viewBox="0 0 24 24"><path d="M20.38 3.46L16 6.14V4a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v2.14L3.62 3.46a2 2 0 0 0-2.42.42 2 2 0 0 0-.42 2.42l8 15A2 2 0 0 0 10.54 22h2.92a2 2 0 0 0 1.76-1.04l8-15a2 2 0 0 0-.42-2.42 2 2 0 0 0-2.42-.42z"/></svg>`;
    } else if (item.category === "accessories") {
      categoryIcon = `<svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`;
    } else if (item.category === "pets") {
      categoryIcon = `<svg viewBox="0 0 24 24"><circle cx="4.5" cy="9.5" r="2"/><circle cx="9" cy="5.5" r="2"/><circle cx="15" cy="5.5" r="2"/><circle cx="19.5" cy="9.5" r="2"/><path d="M12 10c-2.5 0-4.5 2-4.5 5s2 5.5 4.5 5.5 4.5-2.5 4.5-5.5-2-5-4.5-5z"/></svg>`;
    } else if (item.category === "cars") {
      categoryIcon = `<svg viewBox="0 0 24 24"><rect x="2" y="10" width="20" height="8" rx="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M4 10l3-6h10l3 6"/></svg>`;
    } else if (item.category === "people") {
      categoryIcon = `<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
    }

    const imageMarkup = item.image 
      ? `<img src="${item.image}" alt="${escapeHTML(item.title)}" class="card-image">` 
      : categoryIcon;

    card.innerHTML = `
      <div class="card-image-placeholder">
        <span class="card-badge badge-${item.type}">${item.type}</span>
        <span class="card-category">${item.category}</span>
        ${imageMarkup}
      </div>
      <div class="card-body">
        <h3 class="card-title">${escapeHTML(item.title)}</h3>
        <p class="card-description">${escapeHTML(item.description)}</p>
        <div class="card-meta">
          <div class="meta-item">
            <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>${formatDate(item.date)}</span>
          </div>
          <div class="meta-item">
            <svg viewBox="0 0 24 24"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
            <span class="contact-value">${escapeHTML(item.contactAddress)}</span>
          </div>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// ==========================================
// Item Detail Modal
// ==========================================
function openItemDetail(item) {
  document.getElementById("detailItemType").textContent = `${item.type} Item Detail`;
  document.getElementById("detailTitle").textContent = item.title;
  document.getElementById("detailDescription").textContent = item.description;
  document.getElementById("detailDate").textContent = formatDate(item.date);
  document.getElementById("detailLocation").textContent = item.contactAddress;
  document.getElementById("detailCategory").textContent = item.category;

  document.getElementById("detailContactAddress").textContent = item.contactAddress;
  document.getElementById("detailPhone").textContent = item.phone;
  document.getElementById("detailEmail").textContent = item.email;

  const imgContainer = document.getElementById("detailImageContainer");
  const imgEl = document.getElementById("detailImage");
  
  if (item.image) {
    imgContainer.style.display = "block";
    imgEl.src = item.image;
    imgEl.alt = item.title;
  } else {
    imgContainer.style.display = "none";
    imgEl.src = "";
  }

  const mapSection = document.getElementById("detailMapSection");

  if (item.type === "found" && item.lat && item.lng) {
    mapSection.style.display = "block";
    initDetailMap(item.lat, item.lng, item.title);
  } else {
    mapSection.style.display = "none";
  }

  openModal("detailModal");
}

// ==========================================
// Modal Handlers
// ==========================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.add("active");
  
  if (modalId === "postModal" && currentPostType === "found") {
    resizeCreationMap();
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove("active");
}

// ==========================================
// Event Listeners Initialization
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // Initialize storage seeds
  AppStore.getItems();

  // Initial Auth Check
  updateSessionUI();

  // Render main feed
  renderFeed();

  // Navbar Auth triggers
  document.getElementById("btnSignIn").addEventListener("click", () => {
    setAuthMode("signin");
    openModal("authModal");
  });

  document.getElementById("btnSignUp").addEventListener("click", () => {
    setAuthMode("signup");
    openModal("authModal");
  });

  document.getElementById("btnSignOut").addEventListener("click", handleSignOut);
  
  document.getElementById("btnPostItem").addEventListener("click", () => {
    const user = AppStore.getCurrentUser();
    if (!user) {
      showToast("Please log in or sign up to submit posts.", "error");
      openModal("authModal");
      return;
    }
    
    // Set posting map picker ready
    setPostType("lost");
    openModal("postModal");
    initCreationMap();
  });

  // Modal exit triggers
  document.getElementById("closeAuthModal").addEventListener("click", () => closeModal("authModal"));
  document.getElementById("closePostModal").addEventListener("click", () => closeModal("postModal"));
  document.getElementById("closeDetailModal").addEventListener("click", () => closeModal("detailModal"));

  // Toggle modal overlay clicks
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeModal(overlay.id);
      }
    });
  });

  // Auth switch toggles
  document.getElementById("authSwitchLink").addEventListener("click", toggleAuthMode);
  
  // Forgot password flow
  document.getElementById("forgotPasswordLink").addEventListener("click", (e) => {
    e.preventDefault();
    setAuthMode("recover");
  });
  
  // Submit actions
  document.getElementById("authForm").addEventListener("submit", handleAuthSubmit);
  document.getElementById("postForm").addEventListener("submit", handlePostSubmit);

  // Form type toggles (Lost / Found)
  document.getElementById("postTypeLost").addEventListener("click", () => setPostType("lost"));
  document.getElementById("postTypeFound").addEventListener("click", () => setPostType("found"));

  // Search Live queries
  document.getElementById("searchInput").addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderFeed();
  });

  // Category filtering
  document.getElementById("categoryFilter").addEventListener("change", (e) => {
    currentCategory = e.target.value;
    renderFeed();
  });

  // Tab Filtering (All / Lost / Found)
  document.getElementById("tabAll").addEventListener("click", (e) => toggleTab(e.target, "all"));
  document.getElementById("tabLost").addEventListener("click", (e) => toggleTab(e.target, "lost"));
  document.getElementById("tabFound").addEventListener("click", (e) => toggleTab(e.target, "found"));

  // Toggle show current user posts
  document.getElementById("btnMyPosts").addEventListener("click", () => {
    showOnlyMyPosts = !showOnlyMyPosts;
    const myBtn = document.getElementById("btnMyPosts");
    if (showOnlyMyPosts) {
      myBtn.classList.add("active");
      myBtn.style.background = "hsl(var(--primary))";
      myBtn.style.color = "white";
    } else {
      myBtn.classList.remove("active");
      myBtn.style.background = "hsla(var(--text-primary), 0.06)";
      myBtn.style.color = "hsl(var(--text-primary))";
    }
    renderFeed();
  });

  // Logo home navigation
  document.getElementById("logoLink").addEventListener("click", (e) => {
    e.preventDefault();
    searchQuery = "";
    currentCategory = "all";
    currentFilterType = "all";
    showOnlyMyPosts = false;
    
    document.getElementById("searchInput").value = "";
    document.getElementById("categoryFilter").value = "all";
    
    document.querySelectorAll(".tab-group .tab-btn").forEach(b => b.classList.remove("active"));
    document.getElementById("tabAll").classList.add("active");

    const myBtn = document.getElementById("btnMyPosts");
    myBtn.classList.remove("active");
    myBtn.style.background = "hsla(var(--text-primary), 0.06)";
    myBtn.style.color = "hsl(var(--text-primary))";

    renderFeed();
  });

  // Handle Picture Uploads and compression
  const postImageInput = document.getElementById("postImage");
  const previewContainer = document.getElementById("postImagePreviewContainer");
  const previewImage = document.getElementById("postImagePreview");
  const removeImageBtn = document.getElementById("btnRemoveImage");

  postImageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("File size too large. Maximum size is 5MB.", "error");
      postImageInput.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
      const img = new Image();
      img.onload = function() {
        // Downscale image to fit safely in LocalStorage (max size 600px)
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxSize = 600;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Compress as JPEG with 0.75 quality
        uploadedImageBase64 = canvas.toDataURL("image/jpeg", 0.75);
        
        previewImage.src = uploadedImageBase64;
        previewContainer.style.display = "block";
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  removeImageBtn.addEventListener("click", () => {
    uploadedImageBase64 = null;
    postImageInput.value = "";
    previewContainer.style.display = "none";
    previewImage.src = "";
  });
});

function toggleTab(clickedBtn, type) {
  document.querySelectorAll(".tab-group .tab-btn").forEach(btn => btn.classList.remove("active"));
  clickedBtn.classList.add("active");
  currentFilterType = type;
  renderFeed();
}
