/* ============================================================
   Account System (shared across hub, games, shop, leaderboard, admin)
   ============================================================ */

// Retrieve user data object from localStorage
function getUserData(username) {
  const data = localStorage.getItem("arcadeUser_" + username);
  return data ? JSON.parse(data) : null;
}

// Save user data object back to localStorage
function saveUserData(username, data) {
  localStorage.setItem("arcadeUser_" + username, JSON.stringify(data));
}

// Create a new account
function createAccount() {
  const u = document.getElementById("username").value.trim();
  const p = document.getElementById("password").value.trim();
  if (!u || !p) { alert("Fill all fields"); return; }
  if (getUserData(u)) { alert("User already exists"); return; }
  const newUser = {
    password: p,
    coins: 0,
    highScoreStickman: 0,
    bestLevelStickman: 0,
    upgrades: { jump:0, magnet:0, hacker:0, time:0, curseBender:0 },
    skins: { owned:["default"], equipped:"default" }
  };
  saveUserData(u,newUser);
  alert("Account created! Please login.");
}

// Login to an existing account
function loginAccount() {
  const u = document.getElementById("username").value.trim();
  const p = document.getElementById("password").value.trim();
  const data = getUserData(u);
  if (!data) { alert("No account found"); return; }
  if (data.password !== p) { alert("Wrong password"); return; }
  localStorage.setItem("arcadeCurrentUser", u);
  updateAccountBar(u, data);
}

// Logout current user
function logout() {
  localStorage.removeItem("arcadeCurrentUser");
  document.getElementById("account-bar").classList.add("hidden");
  document.getElementById("login-section").classList.remove("hidden");
}

// Update account bar UI
function updateAccountBar(username, data) {
  document.getElementById("current-user").textContent = username;
  document.getElementById("coin-count").textContent = data.coins;
  document.getElementById("stickman-score").textContent = data.highScoreStickman;
  document.getElementById("account-bar").classList.remove("hidden");
  document.getElementById("login-section").classList.add("hidden");
}

// Initialize hub page
function initHub() {
  const currentUser = localStorage.getItem("arcadeCurrentUser");
  if (currentUser) {
    const data = getUserData(currentUser);
    if (data) updateAccountBar(currentUser, data);
  }
  // Disable play buttons if not logged in
  if (!currentUser) {
    document.querySelectorAll(".play-btn").forEach(btn => {
      btn.classList.add("opacity-50","cursor-not-allowed");
      btn.addEventListener("click", e => {
        e.preventDefault();
        alert("Please login to play this game.");
      });
    });
  }
}

// Get current logged in user
function getCurrentUser() {
  return localStorage.getItem("arcadeCurrentUser");
}
