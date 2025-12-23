// Demo admin panel logic for region/district scoped roles

const data = {
  regions: [
    { id: 1, name: "Toshkent" },
    { id: 2, name: "Samarqand" },
    { id: 3, name: "Farg'ona" }
  ],
  districts: [
    { id: 1, region_id: 1, name: "Yunusobod" },
    { id: 2, region_id: 1, name: "Chilonzor" },
    { id: 3, region_id: 2, name: "Kattakurgan" },
    { id: 4, region_id: 2, name: "Urgut" },
    { id: 5, region_id: 3, name: "Marg'ilon" }
  ],
  users: [
    { id: 1, name: "Super Admin", email: "super@demo.uz", phone: "+998900000001", password: "superadmin", role: "super_admin", region_id: null, district_id: null, created_by: null, last_login_at: "2025-12-15T09:10:00Z" },
    { id: 2, name: "Ali Admin", email: "ali.admin@demo.uz", phone: "+998900000002", password: "hashed-ali", role: "admin", region_id: 1, district_id: 1, created_by: 1, last_login_at: "2025-12-20T12:00:00Z" },
    { id: 3, name: "Dilshod Admin", email: "dilshod.admin@demo.uz", phone: "+998900000003", password: "hashed-dilshod", role: "admin", region_id: 2, district_id: 3, created_by: 1, last_login_at: "2025-12-18T15:30:00Z" },
    { id: 4, name: "Zafar User", email: "zafar@demo.uz", phone: "+998900000101", password: "hashed-zafar", role: "user", region_id: 1, district_id: 1, created_by: 2, last_login_at: "2025-12-22T07:45:00Z" },
    { id: 5, name: "Madina User", email: "madina@demo.uz", phone: "+998900000102", password: "hashed-madina", role: "user", region_id: 2, district_id: 3, created_by: 3, last_login_at: "2025-12-21T08:20:00Z" },
    { id: 6, name: "Kamola User", email: "kamola@demo.uz", phone: "+998900000103", password: "hashed-kamola", role: "user", region_id: 1, district_id: 2, created_by: 2, last_login_at: "2025-12-23T06:55:00Z" }
  ],
  results: [
    { id: 1, user_id: 4, score: 86, created_at: "2025-12-20T10:00:00Z" },
    { id: 2, user_id: 4, score: 92, created_at: "2025-12-22T12:00:00Z" },
    { id: 3, user_id: 5, score: 78, created_at: "2025-12-19T09:30:00Z" },
    { id: 4, user_id: 6, score: 81, created_at: "2025-12-21T11:15:00Z" }
  ]
};

const appConfig = (() => {
  if (typeof window === "undefined") return {};
  if (window.APP_CONFIG) return window.APP_CONFIG;
  const raw = localStorage.getItem("appConfig");
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    localStorage.removeItem("appConfig");
    return parsed || {};
  } catch (e) {
    localStorage.removeItem("appConfig");
    return {};
  }
})();

const state = {
  currentUserId: appConfig.defaultUserId || appConfig.userId || 1,
  selectedRegionId: null,
  selectedDistrictId: null
};

const permissionPages = {
  super_admin: ["dashboard", "admins", "users", "regions", "analytics", "results"],
  admin: ["dashboard", "users", "regions", "results"],
  user: ["dashboard", "users", "results"]
};

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initRoleSwitcher();
  initModals();
  initRegionSelects();
  recordLogin(state.currentUserId); // simulate session login tracking
  renderAll();
  initCharts();
});

function currentUser() {
  return data.users.find((u) => u.id === state.currentUserId);
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("uz-UZ");
}

function regionName(id) {
  const region = data.regions.find((r) => r.id === id);
  return region ? region.name : "-";
}

function districtName(id) {
  const district = data.districts.find((d) => d.id === id);
  return district ? district.name : "-";
}

function filterByScope(collection) {
  const user = currentUser();
  if (user.role === "super_admin") return collection;
  if (user.role === "admin") {
    return collection.filter(
      (item) => {
        const target = item.user_id ? data.users.find((u) => u.id === item.user_id) || {} : item;
        return target.region_id === user.region_id && target.district_id === user.district_id;
      }
    );
  }
  return collection.filter((item) => item.id === user.id || item.user_id === user.id);
}

function getScopedRegions() {
  const user = currentUser();
  if (user.role === "super_admin") return data.regions;
  if (user.role === "admin") return data.regions.filter((r) => r.id === user.region_id);
  const userRegion = data.regions.find((r) => r.id === user.region_id);
  return userRegion ? [userRegion] : [];
}

function getScopedDistricts() {
  const user = currentUser();
  if (user.role === "super_admin") return data.districts;
  if (user.role === "admin") return data.districts.filter((d) => d.id === user.district_id);
  const userDistrict = data.districts.find((d) => d.id === user.district_id);
  return userDistrict ? [userDistrict] : [];
}

function getScopedAdmins() {
  return filterByScope(data.users.filter((u) => u.role === "admin"));
}

function getScopedUsers() {
  return filterByScope(data.users.filter((u) => u.role === "user"));
}

function getScopedResults() {
  return filterByScope(data.results);
}

function getLastLogins(role, limit = 5) {
  const users = filterByScope(data.users.filter((u) => u.role === role));
  return users
    .slice()
    .sort((a, b) => new Date(b.last_login_at || 0) - new Date(a.last_login_at || 0))
    .slice(0, limit);
}

function computeResultStats(scopedResults) {
  if (!scopedResults.length) {
    return { avg: 0, max: 0, attempts: 0 };
  }
  const attempts = scopedResults.length;
  const sum = scopedResults.reduce((acc, r) => acc + (r.score || 0), 0);
  const max = Math.max(...scopedResults.map((r) => r.score || 0));
  return { avg: Math.round((sum / attempts) * 10) / 10, max, attempts };
}

function computeMostActiveRegion() {
  const scopedResults = getScopedResults();
  if (!scopedResults.length) return null;
  const buckets = {};
  scopedResults.forEach((r) => {
    const user = data.users.find((u) => u.id === r.user_id);
    if (!user) return;
    const key = `${user.region_id || "none"}-${user.district_id || "none"}`;
    if (!buckets[key]) {
      buckets[key] = { count: 0, region_id: user.region_id, district_id: user.district_id };
    }
    buckets[key].count += 1;
  });
  const top = Object.values(buckets).sort((a, b) => b.count - a.count)[0];
  return top || null;
}

function initNav() {
  document.querySelectorAll("a[data-page]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = link.getAttribute("data-page");
      showPage(page);
    });
  });
  const userMenuBtn = document.getElementById("userMenuBtn");
  const userMenu = document.getElementById("userMenu");
  if (userMenuBtn && userMenu) {
    userMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      userMenu.classList.toggle("hidden");
    });
    document.addEventListener("click", () => userMenu.classList.add("hidden"));
  }
}

function showPage(page) {
  const allowed = permissionPages[currentUser().role] || [];
  if (!allowed.includes(page)) {
    alert("Bu bo'limga ruxsat yo'q");
    return;
  }
  document.querySelectorAll(".page-content").forEach((p) => p.classList.add("hidden"));
  const pageEl = document.getElementById(`${page}-page`);
  if (pageEl) pageEl.classList.remove("hidden");
}

function initRoleSwitcher() {
  const select = document.getElementById("roleSwitcher");
  const wrapper = document.getElementById("roleSwitcherWrapper");
  if (!select) return;
  const allowed = Array.isArray(appConfig.allowedUserIds) && appConfig.allowedUserIds.length ? appConfig.allowedUserIds : null;
  if (allowed) {
    Array.from(select.options).forEach((opt) => {
      if (!allowed.includes(Number(opt.value))) {
        opt.remove();
      }
    });
    if (!allowed.includes(state.currentUserId)) {
      state.currentUserId = allowed[0];
      select.value = String(state.currentUserId);
    }
  }
  if (appConfig.lockRoleSwitcher && wrapper) {
    wrapper.style.display = "none";
  }
  select.addEventListener("change", (e) => {
    state.currentUserId = Number(e.target.value);
    recordLogin(state.currentUserId);
    renderAll();
    showPage("dashboard");
  });
}

function recordLogin(userId) {
  const user = data.users.find((u) => u.id === userId);
  if (user) {
    user.last_login_at = new Date().toISOString();
  }
}

function initModals() {
  window.openUserModal = () => {
    const user = currentUser();
    document.getElementById("userModal").classList.remove("hidden");
    const regionSelect = document.getElementById("userViloyat");
    const districtSelect = document.getElementById("userTuman");
    const adminSelect = document.getElementById("userAdminSelect");
    if (adminSelect) {
      adminSelect.innerHTML = `<option value="">Admin tanlang</option>`;
      const admins = data.users.filter((u) => u.role === "admin");
      admins.forEach((a) => {
        const opt = document.createElement("option");
        opt.value = a.id;
        opt.textContent = `${a.name} (${regionName(a.region_id)} • ${districtName(a.district_id)})`;
        adminSelect.appendChild(opt);
      });
      if (user.role === "admin") {
        adminSelect.value = user.id;
        adminSelect.disabled = true;
        setAdminRegionDistrict(user.id);
      } else {
        adminSelect.disabled = false;
        adminSelect.value = "";
        regionSelect.disabled = true;
        districtSelect.disabled = true;
        regionSelect.value = "";
        districtSelect.value = "";
      }
      adminSelect.onchange = (e) => {
        const adminId = Number(e.target.value);
        if (adminId) {
          setAdminRegionDistrict(adminId);
        } else {
          regionSelect.value = "";
          districtSelect.value = "";
        }
      };
    }
    fillDistricts("userViloyat", "userTuman");
    if (user.role === "admin") {
      regionSelect.value = user.region_id;
       fillDistricts("userViloyat", "userTuman");
      districtSelect.value = user.district_id;
      regionSelect.disabled = true;
      districtSelect.disabled = true;
    } else {
      regionSelect.disabled = true;
      districtSelect.disabled = true;
      regionSelect.value = "";
      districtSelect.value = "";
    }
  };
  window.closeUserModal = () => {
    document.getElementById("userModal").classList.add("hidden");
  };
  window.openAdminModal = () => {
    document.getElementById("adminModal").classList.remove("hidden");
    fillDistricts("adminViloyat", "adminTuman");
  };
  window.closeAdminModal = () => {
    document.getElementById("adminModal").classList.add("hidden");
  };
  window.saveUser = (event) => {
    event.preventDefault();
    const form = document.getElementById("userForm");
    const name = document.getElementById("userName").value.trim();
    const email = document.getElementById("userEmail").value.trim();
    const phone = document.getElementById("userPhone").value.trim();
    const password = document.getElementById("userPassword").value.trim();
    const regionSelect = document.getElementById("userViloyat");
    const districtSelect = document.getElementById("userTuman");
    const adminSelect = document.getElementById("userAdminSelect");
    const user = currentUser();
    const newId = Math.max(...data.users.map((u) => u.id)) + 1;
    const adminId = user.role === "admin" ? user.id : Number(adminSelect ? adminSelect.value : 0);
    const adminUser = data.users.find((u) => u.id === adminId && u.role === "admin");
    if (!adminUser) {
      alert("Avval admin tanlanishi kerak (yoki admin yarating)");
      return;
    }
    const regionId = adminUser.region_id;
    const districtId = adminUser.district_id;
    if (!regionId || !districtId) {
      alert("Tanlangan admin uchun viloyat va tuman mavjud emas");
      return;
    }
    data.users.push({
      id: newId,
      name,
      email,
      phone,
      password,
      role: "user",
      region_id: regionId,
      district_id: districtId,
      created_by: adminUser.id,
      last_login_at: null
    });
    closeUserModal();
    form.reset();
    renderAll();
  };
  window.saveAdmin = (event) => {
    event.preventDefault();
    const name = document.getElementById("adminName").value.trim();
    const email = document.getElementById("adminEmail").value.trim();
    const phone = document.getElementById("adminPhone").value.trim();
    const password = document.getElementById("adminPassword").value.trim();
    const regionId = Number(document.getElementById("adminViloyat").value);
    const districtId = Number(document.getElementById("adminTuman").value);
    if (!regionId || !districtId) {
      alert("Viloyat va tuman majburiy");
      return;
    }
    const newId = Math.max(...data.users.map((u) => u.id)) + 1;
    data.users.push({
      id: newId,
      name,
      email,
      phone,
      password,
      role: "admin",
      region_id: regionId,
      district_id: districtId,
      created_by: currentUser().id,
      last_login_at: null
    });
    document.getElementById("adminForm").reset();
    closeAdminModal();
    renderAll();
  };
}

function initRegionSelects() {
  const regionSelects = [document.getElementById("userViloyat"), document.getElementById("adminViloyat"), document.getElementById("resultsRegionFilter")].filter(Boolean);
  regionSelects.forEach((select) => {
    select.innerHTML = `<option value="">${select.id === "resultsRegionFilter" ? "Viloyat" : "Tanlang"}</option>`;
    const regionsSource = select.id === "resultsRegionFilter" ? getScopedRegions() : data.regions;
    regionsSource.forEach((r) => {
      const opt = document.createElement("option");
      opt.value = r.id;
      opt.textContent = r.name;
      select.appendChild(opt);
    });
  });
  const userViloyat = document.getElementById("userViloyat");
  const adminViloyat = document.getElementById("adminViloyat");
  if (userViloyat) {
    userViloyat.addEventListener("change", () => fillDistricts("userViloyat", "userTuman"));
  }
  if (adminViloyat) {
    adminViloyat.addEventListener("change", () => fillDistricts("adminViloyat", "adminTuman"));
  }
  fillDistricts("resultsRegionFilter", "resultsDistrictFilter", true);
}

function fillDistricts(regionSelectId, districtSelectId, allowEmpty = false) {
  const regionSelect = document.getElementById(regionSelectId);
  const districtSelect = document.getElementById(districtSelectId);
  if (!regionSelect || !districtSelect) return;
  const regionId = Number(regionSelect.value);
  const scoped = getScopedDistricts();
  const districts =
    allowEmpty && !regionId
      ? scoped
      : data.districts.filter((d) => d.region_id === regionId && scoped.some((s) => s.id === d.id));
  districtSelect.innerHTML = `<option value="">${districtSelectId.includes("results") ? "Tuman" : "Tanlang"}</option>`;
  districts.forEach((d) => {
    const opt = document.createElement("option");
    opt.value = d.id;
    opt.textContent = d.name;
    districtSelect.appendChild(opt);
  });
}

function setAdminRegionDistrict(adminId) {
  const admin = data.users.find((u) => u.id === Number(adminId) && u.role === "admin");
  const regionSelect = document.getElementById("userViloyat");
  const districtSelect = document.getElementById("userTuman");
  if (!admin || !regionSelect || !districtSelect) return;
  regionSelect.value = admin.region_id || "";
  fillDistricts("userViloyat", "userTuman");
  districtSelect.value = admin.district_id || "";
  regionSelect.disabled = true;
  districtSelect.disabled = true;
}

function renderDashboard() {
  const user = currentUser();
  const titleEl = document.getElementById("dashboardTitle");
  const subtitleEl = document.getElementById("dashboardSubtitle");
  if (titleEl) titleEl.textContent = user.role === "super_admin" ? "Super Admin Dashboard" : user.role === "admin" ? "Admin Dashboard" : "User Dashboard";
  if (subtitleEl) {
    if (user.role === "admin") {
      subtitleEl.textContent = `${regionName(user.region_id)} • ${districtName(user.district_id)} hududi uchun ko‘rsatkichlar`;
    } else {
      subtitleEl.textContent = "Hududiy boshqaruv ko‘rsatkichlari";
    }
  }

  const kpiRegions = document.getElementById("kpiRegions");
  const kpiDistricts = document.getElementById("kpiDistricts");
  const kpiAdmins = document.getElementById("kpiAdmins");
  const kpiUsers = document.getElementById("kpiUsers");
  if (kpiRegions) kpiRegions.textContent = getScopedRegions().length;
  if (kpiDistricts) kpiDistricts.textContent = getScopedDistricts().length;
  if (kpiAdmins) kpiAdmins.textContent = getScopedAdmins().length;
  if (kpiUsers) kpiUsers.textContent = getScopedUsers().length;

  const lastAdmins = getLastLogins("admin");
  const lastUsers = getLastLogins("user");
  const lastAdminsList = document.getElementById("lastAdminsList");
  const lastUsersList = document.getElementById("lastUsersList");
  if (lastAdminsList) {
    lastAdminsList.innerHTML = lastAdmins.length
      ? lastAdmins
          .map(
            (a) => `
          <div class="py-3 flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-800">${a.name}</p>
              <p class="text-xs text-gray-500">${regionName(a.region_id)} • ${districtName(a.district_id)}</p>
            </div>
            <p class="text-xs text-gray-500">${formatDate(a.last_login_at)}</p>
          </div>
        `
          )
          .join("")
      : `<p class="text-gray-500 text-sm py-2">Ma'lumot yo'q</p>`;
  }
  if (lastUsersList) {
    lastUsersList.innerHTML = lastUsers.length
      ? lastUsers
          .map(
            (u) => `
          <div class="py-3 flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-800">${u.name}</p>
              <p class="text-xs text-gray-500">${regionName(u.region_id)} • ${districtName(u.district_id)}</p>
            </div>
            <p class="text-xs text-gray-500">${formatDate(u.last_login_at)}</p>
          </div>
        `
          )
          .join("")
      : `<p class="text-gray-500 text-sm py-2">Ma'lumot yo'q</p>`;
  }

  const active = computeMostActiveRegion();
  const activeBox = document.getElementById("mostActiveRegion");
  if (activeBox) {
    if (active) {
      activeBox.innerHTML = `
        <p class="text-sm text-gray-500 mb-1">Natijalar soni bo‘yicha</p>
        <p class="text-lg font-semibold text-gray-800">${regionName(active.region_id)} • ${districtName(active.district_id)}</p>
        <p class="text-sm text-gray-600">Jami urinishlar: ${active.count}</p>
      `;
    } else {
      activeBox.innerHTML = `<p class="text-gray-500 text-sm">Hozircha natijalar yo‘q</p>`;
    }
  }

  const statsBox = document.getElementById("resultsStats");
  if (statsBox) {
    const stats = computeResultStats(getScopedResults());
    statsBox.innerHTML = `
      <div class="p-4 border border-gray-200 rounded-lg">
        <p class="text-sm text-gray-500">Urinishlar</p>
        <p class="text-2xl font-semibold text-gray-800">${stats.attempts}</p>
      </div>
      <div class="p-4 border border-gray-200 rounded-lg">
        <p class="text-sm text-gray-500">O‘rtacha ball</p>
        <p class="text-2xl font-semibold text-gray-800">${stats.avg}</p>
      </div>
      <div class="p-4 border border-gray-200 rounded-lg">
        <p class="text-sm text-gray-500">Eng yuqori ball</p>
        <p class="text-2xl font-semibold text-gray-800">${stats.max}</p>
      </div>
    `;
  }
}

function renderAll() {
  renderCurrentBadge();
  renderDashboard();
  renderUsersTable();
  renderAdminsTable();
  renderRegions();
  renderResultsTable();
  const addUserBtn = document.querySelector('button[onclick="openUserModal()"]');
  if (addUserBtn) addUserBtn.style.display = currentUser().role === "user" ? "none" : "flex";
  const addAdminBtn = document.querySelector('button[onclick="openAdminModal()"]');
  if (addAdminBtn) addAdminBtn.style.display = currentUser().role === "super_admin" ? "flex" : "none";
}

function renderCurrentBadge() {
  const badge = document.querySelector("#userMenuBtn div");
  const label = document.querySelector("#userMenuBtn span");
  const select = document.getElementById("roleSwitcher");
  const user = currentUser();
  if (badge) badge.textContent = user.name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
  if (label) label.textContent = user.name;
  if (select) select.value = String(user.id);
}

function renderUsersTable() {
  const tbody = document.getElementById("usersTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";
  const scoped = filterByScope(data.users.filter((u) => u.role === "user"));
  const role = currentUser().role;
  const showEmail = role === "super_admin";
  const showPassword = role === "super_admin";
  const thEmail = document.getElementById("thEmail");
  const thPassword = document.getElementById("thPassword");
  if (thEmail) thEmail.style.display = showEmail ? "" : "none";
  if (thPassword) thPassword.style.display = showPassword ? "" : "none";
  document.querySelectorAll("#usersTable tbody tr").forEach((tr) => tr.remove());
  scoped.forEach((u) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${u.id}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${u.name}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${u.phone || "-"}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-cell="email">${u.email || "-"}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${regionName(u.region_id)}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${districtName(u.district_id)}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono" data-cell="password">${u.password || "-"}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm"><span class="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">Active</span></td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(u.last_login_at)}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-600">View</td>
    `;
    const emailCell = tr.querySelector('[data-cell="email"]');
    const passwordCell = tr.querySelector('[data-cell="password"]');
    if (emailCell) emailCell.style.display = showEmail ? "" : "none";
    if (passwordCell) passwordCell.style.display = showPassword ? "" : "none";
    tbody.appendChild(tr);
  });
}

function renderAdminsTable() {
  const tbody = document.getElementById("adminsTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";
  const scoped = filterByScope(data.users.filter((u) => u.role === "admin"));
  scoped.forEach((u) => {
    const userCount = data.users.filter((x) => x.role === "user" && x.region_id === u.region_id && x.district_id === u.district_id).length;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${u.id}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${u.name}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${u.email}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${regionName(u.region_id)}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${districtName(u.district_id)}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${userCount}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(u.last_login_at)}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-600">View</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderRegions() {
  const list = document.getElementById("regionsList");
  const details = document.getElementById("regionDetails");
  if (!list || !details) return;
  list.innerHTML = "";
  const regions = getScopedRegions();
  if (state.selectedRegionId && !regions.some((r) => r.id === state.selectedRegionId)) {
    state.selectedRegionId = null;
  }
  if (!state.selectedRegionId && regions.length) {
    state.selectedRegionId = regions[0].id;
  }
  regions.forEach((region) => {
    const user = currentUser();
    const districts = data.districts.filter((d) => d.region_id === region.id && (user.role === "super_admin" || d.id === user.district_id));
    const regionUsers = data.users.filter(
      (u) => u.region_id === region.id && u.role === "user" && (user.role === "super_admin" || u.district_id === user.district_id)
    );
    const card = document.createElement("div");
    const isActive = state.selectedRegionId === region.id;
    card.className = `p-4 border rounded-lg cursor-pointer ${isActive ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-500"}`;
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500">Viloyat</p>
          <p class="font-semibold text-gray-800">${region.name}</p>
        </div>
        <div class="text-right">
          <p class="text-xs text-gray-500">${districts.length} ta tuman</p>
          <p class="text-xs text-gray-500">${regionUsers.length} ta user</p>
        </div>
      </div>
    `;
    card.addEventListener("click", () => renderRegionDetails(region.id));
    list.appendChild(card);
  });
  if (regions.length) {
    renderRegionDetails(state.selectedRegionId || regions[0].id);
  } else {
    details.innerHTML = `<p class="text-gray-500 text-center py-8">Hudud topilmadi</p>`;
  }
}

function renderRegionDetails(regionId) {
  const details = document.getElementById("regionDetails");
  const region = data.regions.find((r) => r.id === regionId);
  const user = currentUser();
  if (!details || !region) return;
  state.selectedRegionId = regionId;
  const districtsAll = data.districts.filter((d) => d.region_id === region.id);
  const districts = user.role === "super_admin" ? districtsAll : districtsAll.filter((d) => d.id === user.district_id);
  if (state.selectedDistrictId && !districts.some((d) => d.id === state.selectedDistrictId)) {
    state.selectedDistrictId = null;
  }
  const admins = data.users.filter(
    (u) =>
      u.role === "admin" &&
      u.region_id === region.id &&
      (user.role === "super_admin" || u.district_id === user.district_id)
  );
  const usersInRegion = data.users.filter(
    (u) =>
      u.role === "user" &&
      u.region_id === region.id &&
      (user.role === "super_admin" || u.district_id === user.district_id)
  );
  const list = districts
    .map((d) => {
      const districtUsers = usersInRegion.filter((u) => u.district_id === d.id).length;
      const districtAdmins = admins.filter((a) => a.district_id === d.id).length;
      const active = state.selectedDistrictId === d.id;
      return `
        <div class="p-3 border ${active ? "border-purple-500 bg-purple-50" : "border-gray-200"} rounded-lg flex items-center justify-between cursor-pointer hover:border-purple-500" data-district-card="${d.id}">
          <div>
            <p class="text-sm text-gray-800">${d.name}</p>
            <p class="text-xs text-gray-500">${districtAdmins} admin • ${districtUsers} user</p>
          </div>
          <span class="text-xs text-gray-500">${region.name}</span>
        </div>
      `;
    })
    .join("");
  details.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <div>
        <p class="text-sm text-gray-500">Viloyat</p>
        <p class="text-xl font-semibold text-gray-800">${region.name}</p>
      </div>
      <div class="text-right">
        <p class="text-sm text-gray-500">Adminlar: ${admins.length}</p>
        <p class="text-sm text-gray-500">Userlar: ${usersInRegion.length}</p>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="space-y-2">${list || "<p class='text-gray-500 text-center'>Tumanlar yo'q</p>"}</div>
      <div id="districtDetails" class="p-4 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700">
        ${districts.length ? "Tuman tanlang" : "<p class='text-gray-500 text-center'>Tumanlar yo'q</p>"}
      </div>
    </div>
  `;
  document.querySelectorAll("[data-district-card]").forEach((card) => {
    card.addEventListener("click", () => renderDistrictDetails(Number(card.dataset.districtCard)));
  });
  if (districts.length) {
    const target = districts.find((d) => d.id === state.selectedDistrictId) || districts[0];
    renderDistrictDetails(target.id);
  } else {
    state.selectedDistrictId = null;
  }
}

function renderDistrictDetails(districtId) {
  const container = document.getElementById("districtDetails");
  const district = data.districts.find((d) => d.id === districtId);
  if (!container || !district) return;
  state.selectedDistrictId = districtId;
  document.querySelectorAll("[data-district-card]").forEach((card) => {
    const isActive = Number(card.dataset.districtCard) === districtId;
    card.classList.toggle("border-purple-500", isActive);
    card.classList.toggle("bg-purple-50", isActive);
    card.classList.toggle("border-gray-200", !isActive);
  });
  const admins = data.users.filter((u) => u.role === "admin" && u.district_id === districtId && u.region_id === district.region_id);
  const users = data.users.filter((u) => u.role === "user" && u.district_id === districtId && u.region_id === district.region_id);
  const lastAdmin = admins.slice().sort((a, b) => new Date(b.last_login_at || 0) - new Date(a.last_login_at || 0))[0];
  const lastUser = users.slice().sort((a, b) => new Date(b.last_login_at || 0) - new Date(a.last_login_at || 0))[0];
  const districtResults = getScopedResults().filter((r) => {
    const u = data.users.find((x) => x.id === r.user_id);
    return u && u.district_id === districtId && u.region_id === district.region_id;
  });
  const stats = computeResultStats(districtResults);
  container.innerHTML = `
    <div class="flex items-center justify-between mb-3">
      <div>
        <p class="text-xs text-gray-500">Tuman</p>
        <p class="font-semibold text-gray-800">${district.name}</p>
      </div>
      <p class="text-xs text-gray-500">${regionName(district.region_id)}</p>
    </div>
    <div class="grid grid-cols-2 gap-3 mb-3">
      <div class="p-3 bg-white rounded border border-gray-200">
        <p class="text-xs text-gray-500">Adminlar</p>
        <p class="text-lg font-semibold text-gray-800">${admins.length}</p>
      </div>
      <div class="p-3 bg-white rounded border border-gray-200">
        <p class="text-xs text-gray-500">Userlar</p>
        <p class="text-lg font-semibold text-gray-800">${users.length}</p>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-3 mb-3">
      <div class="p-3 bg-white rounded border border-gray-200">
        <p class="text-xs text-gray-500">Oxirgi admin</p>
        <p class="text-sm text-gray-800">${lastAdmin ? lastAdmin.name : "-"}</p>
        <p class="text-xs text-gray-500">${lastAdmin ? formatDate(lastAdmin.last_login_at) : ""}</p>
      </div>
      <div class="p-3 bg-white rounded border border-gray-200">
        <p class="text-xs text-gray-500">Oxirgi user</p>
        <p class="text-sm text-gray-800">${lastUser ? lastUser.name : "-"}</p>
        <p class="text-xs text-gray-500">${lastUser ? formatDate(lastUser.last_login_at) : ""}</p>
      </div>
    </div>
    <div class="p-3 bg-white rounded border border-gray-200">
      <p class="text-xs text-gray-500">Natijalar statistikasi</p>
      <p class="text-sm text-gray-700">Urinishlar: ${stats.attempts}</p>
      <p class="text-sm text-gray-700">O‘rtacha ball: ${stats.avg}</p>
      <p class="text-sm text-gray-700">Eng yuqori ball: ${stats.max}</p>
    </div>
  `;
}

function renderResultsTable() {
  const tbody = document.getElementById("resultsTableBody");
  if (!tbody) return;
  const userFilter = document.getElementById("resultsUserFilter");
  const regionFilter = document.getElementById("resultsRegionFilter");
  const districtFilter = document.getElementById("resultsDistrictFilter");
  fillDistricts("resultsRegionFilter", "resultsDistrictFilter", true);
  tbody.innerHTML = "";
  const scopedResults = filterByScope(data.results);
  const filtered = scopedResults.filter((r) => {
    const user = data.users.find((u) => u.id === r.user_id);
    if (!user) return false;
    if (userFilter && userFilter.value && user.id !== Number(userFilter.value)) return false;
    if (regionFilter && regionFilter.value && user.region_id !== Number(regionFilter.value)) return false;
    if (districtFilter && districtFilter.value && user.district_id !== Number(districtFilter.value)) return false;
    return true;
  });
  filtered.forEach((r) => {
    const user = data.users.find((u) => u.id === r.user_id);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${r.id}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${user?.name || "-"}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${regionName(user?.region_id)}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${districtName(user?.district_id)}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">${r.score}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(r.created_at)}</td>
    `;
    tbody.appendChild(tr);
  });
  populateResultsFilters();
}

function populateResultsFilters() {
  const userFilter = document.getElementById("resultsUserFilter");
  if (!userFilter) return;
  const scopedUsers = filterByScope(data.users.filter((u) => u.role === "user"));
  userFilter.innerHTML = `<option value="">Barchasi</option>`;
  scopedUsers.forEach((u) => {
    const opt = document.createElement("option");
    opt.value = u.id;
    opt.textContent = u.name;
    userFilter.appendChild(opt);
  });
  ["resultsUserFilter", "resultsRegionFilter", "resultsDistrictFilter"].forEach((id) => {
    const select = document.getElementById(id);
    if (select && !select.dataset.bound) {
      select.addEventListener("change", () => renderResultsTable());
      select.dataset.bound = "true";
    }
  });
}

function initCharts() {
  const revenueEl = document.getElementById("revenueChart");
  const activityEl = document.getElementById("activityChart");
  const userActivityEl = document.getElementById("userActivityChart");
  const regionEl = document.getElementById("regionChart");
  if (revenueEl) {
    new Chart(revenueEl, {
      type: "line",
      data: {
        labels: ["Yan", "Fev", "Mar", "Apr", "May", "Jun"],
        datasets: [
          { label: "Revenue", data: [12, 19, 15, 22, 24, 27], borderColor: "#6366f1", tension: 0.3, fill: false }
        ]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });
  }
  if (activityEl) {
    new Chart(activityEl, {
      type: "bar",
      data: {
        labels: ["Dush", "Sesh", "Chor", "Pay", "Juma", "Shan", "Yak"],
        datasets: [
          { label: "Faollik", data: [8, 12, 10, 15, 13, 9, 6], backgroundColor: "#22c55e" }
        ]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });
  }
  if (userActivityEl) {
    new Chart(userActivityEl, {
      type: "line",
      data: {
        labels: ["Yan", "Fev", "Mar", "Apr", "May", "Jun"],
        datasets: [
          { label: "User kirishlari", data: [30, 45, 40, 55, 60, 58], borderColor: "#0ea5e9", tension: 0.3, fill: false }
        ]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });
  }
  if (regionEl) {
    const labels = data.regions.map((r) => r.name);
    const counts = labels.map((_, idx) => data.users.filter((u) => u.role === "user" && u.region_id === data.regions[idx].id).length);
    new Chart(regionEl, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: counts,
            backgroundColor: ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#0ea5e9"]
          }
        ]
      },
      options: { responsive: true }
    });
  }
}

