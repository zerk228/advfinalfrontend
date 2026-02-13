/* =========================
   CONFIG
========================= */
const API_URL = "http://localhost:8080";

/* =========================
   STATE
========================= */
let cooksFromApi = [];
let positionsFromApi = [];

let selectedDish = null;
let selectedCook = null;

/* =========================
   TOKENS
========================= */
function saveTokens(data) {
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);
}

function getAccessToken() {
  return localStorage.getItem("access_token");
}

function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

/* =========================
   API REQUEST
========================= */
async function apiRequest(path, method = "GET", body = null, auth = true) {
  const headers = {};

  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getAccessToken();
    if (!token) throw new Error("No access token. Please login.");
    headers["Authorization"] = "Bearer " + token;
  }

  const res = await fetch(API_URL + path, {
    method,
    headers,
    body: body
      ? body instanceof FormData
        ? body
        : JSON.stringify(body)
      : null,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  }

  if (res.status === 204) return null;
  return await res.json();
}

/* =========================
   NAVIGATION
========================= */
function showSection(id, push = true) {
  document.querySelectorAll("section").forEach((s) =>
    s.classList.remove("active")
  );

  const target = document.getElementById(id);
  if (!target) return;

  target.classList.add("active");

  if (push) {
    history.pushState({ section: id }, "", "#" + id);
  }
}

window.addEventListener("popstate", (e) => {
  if (e.state && e.state.section) {
    showSection(e.state.section, false);
  }
});

/* =========================
   AUTH
========================= */
async function login(email, password) {
  const data = await apiRequest(
    "/auth/login",
    "POST",
    { email, password },
    false
  );

  saveTokens(data);
}

async function registerUser(name, email, password) {
  const data = await apiRequest(
    "/auth/register",
    "POST",
    { name, email, password },
    false
  );

  saveTokens(data);
}

function logout() {
  clearTokens();

  cooksFromApi = [];
  positionsFromApi = [];
  selectedDish = null;
  selectedCook = null;

  alert("✅ Logged out");
  showSection("login");
}

/* =========================
   LOAD DATA
========================= */
async function loadData() {
  cooksFromApi = await apiRequest("/api/cooks");
  positionsFromApi = await apiRequest("/api/positions");

  renderFoodList();
}

/* =========================
   FOOD LIST
========================= */
function renderFoodList() {
  const grid = document.getElementById("foodGrid");
  if (!grid) return;

  grid.innerHTML = "";

  if (!positionsFromApi.length) {
    grid.innerHTML = "<p>No dishes found</p>";
    return;
  }

  positionsFromApi.forEach((pos) => {
    const cook = cooksFromApi.find((c) => c.id === pos.cook_id);

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${pos.title}</h3>
      <p>${pos.description || ""}</p>
      <p><b>${pos.price} ₸</b></p>
      <p style="opacity:0.7; font-size:14px;">
        Cook: ${cook ? cook.display_name : "Unknown"}
      </p>
      <button class="action" onclick="selectDish('${pos.id}')">Select</button>
    `;

    grid.appendChild(card);
  });
}

/* =========================
   SELECT DISH
========================= */
function selectDish(positionId) {
  selectedDish = positionsFromApi.find((p) => p.id === positionId);
  if (!selectedDish) return;

  selectedCook = cooksFromApi.find((c) => c.id === selectedDish.cook_id);
  if (!selectedCook) {
    alert("❌ Cook not found for this dish");
    return;
  }

  renderCook();
  showSection("cook");
}

/* =========================
   RENDER COOK
========================= */
function renderCook() {
  const photo = document.getElementById("cookPhoto");
  const name = document.getElementById("cookName");
  const rating = document.getElementById("cookRating");
  const review = document.getElementById("cookReview");
  const dishInfo = document.getElementById("selectedDishInfo");

  if (photo) {
    if (selectedCook.avatar_url) {
      photo.innerHTML = `<img src="${selectedCook.avatar_url}" alt="${selectedCook.display_name}">`;
    } else {
      photo.innerHTML = `<div style="padding:20px; text-align:center; opacity:0.6;">
        No photo
      </div>`;
    }
  }

  if (name) name.innerText = selectedCook.display_name;
  if (rating) rating.innerText = "⭐ " + (selectedCook.rating || 0);
  if (review) review.innerText = selectedCook.bio || "";

  if (dishInfo) {
    dishInfo.innerText = `${selectedDish.title} — ${selectedDish.price} ₸ (${selectedDish.description || ""})`;
  }
}

/* =========================
   ORDER
========================= */
async function makeOrder() {
  if (!selectedDish) return;

  const address = document.getElementById("orderAddress")?.value?.trim();
  const amount = parseInt(document.getElementById("orderAmount")?.value || "1", 10);

  if (!address) {
    alert("❌ Please enter address");
    return;
  }

  if (!amount || amount < 1) {
    alert("❌ Amount must be >= 1");
    return;
  }

  try {
    const order = await apiRequest("/api/orders", "POST", {
      address,
      amount,
      position_id: selectedDish.id,
    });

    document.getElementById("orderMessage").innerText =
      `Order created: ${order.id}\nStatus: ${order.status}\nTotal: ${order.total} ₸`;

    // очистка выбора
    selectedDish = null;
    selectedCook = null;

    showSection("orderSuccess");
  } catch (err) {
    alert("❌ Order failed: " + err.message);
  }
}

/* =========================
   REVIEW
========================= */
async function sendReview(cookId, rating, comment) {
  return await apiRequest("/api/reviews", "POST", {
    cook_id: cookId,
    rating: rating,
    comment: comment || "",
  });
}

/* =========================
   COMPLAINT
========================= */
async function sendComplaint(targetId, reason) {
  return await apiRequest("/api/complaints", "POST", {
    target_id: targetId,
    reason: reason,
  });
}

/* =========================
   DOM EVENTS
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  // LOGIN FORM
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

      try {
        await login(email, password);
        await loadData();
        showSection("food");
        alert("✅ Logged in!");
      } catch (err) {
        alert("❌ Login failed: " + err.message);
      }
    });
  }

  // REGISTER FORM
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("regName").value.trim();
      const email = document.getElementById("regEmail").value.trim();
      const password = document.getElementById("regPassword").value.trim();

      try {
        await registerUser(name, email, password);
        await loadData();
        showSection("food");
        alert("✅ Registered and logged in!");
      } catch (err) {
        alert("❌ Register failed: " + err.message);
      }
    });
  }

  // REVIEW FORM
  const reviewForm = document.getElementById("reviewForm");
  if (reviewForm) {
    reviewForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const cookId = document.getElementById("reviewCookId").value.trim();
      const rating = parseInt(document.getElementById("reviewRating").value, 10);
      const comment = document.getElementById("reviewMessage").value.trim();

      try {
        await sendReview(cookId, rating, comment);
        alert("✅ Review sent!");
        reviewForm.reset();
      } catch (err) {
        alert("❌ Review failed: " + err.message);
      }
    });
  }

  // COMPLAINT FORM
  const complaintForm = document.getElementById("complaintForm");
  if (complaintForm) {
    complaintForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const targetId = document.getElementById("complaintTargetId").value.trim();
      const reason = document.getElementById("complaintMessage").value.trim();

      try {
        await sendComplaint(targetId, reason);
        alert("✅ Complaint sent!");
        complaintForm.reset();
      } catch (err) {
        alert("❌ Complaint failed: " + err.message);
      }
    });
  }

  // AUTO LOGIN
  const token = getAccessToken();
  if (token) {
    try {
      await loadData();
      showSection("food", false);
    } catch (err) {
      clearTokens();
      showSection("login", false);
    }
  } else {
    showSection("login", false);
  }
});
