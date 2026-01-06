let users = {};
let activeUserId = "54321";
let tasks = {};
let activeUserName = "TestUser";
let localSubtasks = {};
const USER_COLOR_COUNT = 15;
const signInContainer = document.getElementById("sign_up_form");
const logInContainer = document.getElementById("login_form");
const indexHeader = document.getElementById("index_header");
let usersReady = null;

function w3includeHTML(cb) {
  var z, i, elmnt, file, xhttp;
  z = document.getElementsByTagName("*");
  for (i = 0; i < z.length; i++) {
    elmnt = z[i];
    file = elmnt.getAttribute("w3-include-html");
    if (file) {
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
          if (this.status == 200) {
            elmnt.innerHTML = this.responseText;
          }
          if (this.status == 404) {
            elmnt.innerHTML = "Page not found.";
          }
          elmnt.removeAttribute("w3-include-html");
          w3includeHTML(cb);
        }
      };
      xhttp.open("GET", file, true);
      xhttp.send();
      return;
    }
  }
  if (cb) cb();
}

/**
 * Initializes the global user data exactly once and returns a shared promise.
 *
 * If the user data has not yet been loaded, this function triggers an
 * asynchronous request to fetch it and stores both the resulting data
 * and the associated promise on the global `window` object. Subsequent
 * calls return the same promise to prevent duplicate loading.
 *
 * In case the loading process fails, the cached promise is reset so that
 * a future call can retry the initialization.
 *
 * @function initUsersLoading
 * @returns {Promise<Object>} A promise that resolves to the loaded users object.
 *
 * @throws {Error} Propagates any error thrown by {@link loadData} during
 * the loading process.
 */
function initUsersLoading() {
  if (!window.usersReady) {
    window.usersReady = (async () => {
      const data = await loadData("/users");
      window.users = data || {};
      return window.users;
    })().catch((err) => {
      window.usersReady = null;
      throw err;
    });
  }
  return window.usersReady;
}

async function ensureUsersLoaded() {
  if (users && Object.keys(users).length > 0) return users;
  users = (await loadData("/users")) || {};
  return users;
}

function showNav(page = "summary") {
  setActiveNav(page);
  const mainCont = document.getElementById("main_content");
  mainCont.innerHTML = `<div w3-include-html="${page}.html"></div>`;

  w3includeHTML(async () => {
    renderIcons(document);
    onPageLoaded(page);

    if (page === "add_task") {
      await ensureUsersLoaded();
      initAssignedToDropdown(users);
      initTaskTypeDropdown(TASK_CATEGORIES);
      initSubtasksInput();
    } else if (page === "contacts") {
      renderContacts(users);
      initContactsClick(users);
    } else if (page === "summary") {
      initSummary();
    }
  });
}

function onPageLoaded(page) {
  const btn = document.getElementById("openAddTaskModalBtn");
  if (!btn) return;

  btn.onclick = () => openAddTaskModal();
}

function setActiveNav(page) {
  document.querySelectorAll(".nav_link").forEach((link) => {
    link.classList.toggle("active", link.dataset.page === page);
  });
}

async function loadStart() {
  users = (await loadData("/users")) || {};
  loadTasks();
  showNav("summary");
  showAvatar();
}

function showAvatar() {
  const avatar = document.getElementById("user_avatar_wrapper");
  avatar.innerHTML = renderAvatar(activeUserId, activeUserName);
}

function renderAvatar(activeUserId, activeUserName) {
  const initials = initialsFromGivenName(activeUserName);
  const bgColor = colorIndexFromUserId(activeUserId);
  return `
    <div class="user_avatar" onclick="toggleUserMenu()" style="color: var(--user_c_${bgColor});">${initials}</div>
  `;
}

function toggleUserMenu() {
  let userMenu = document.getElementById("user_menu");
  console.log(userMenu);
  if (!userMenu) return;
  userMenu.classList.toggle("d_none");
}

function renderAssignedAvatars(selectedUserIds, usersData) {
  const container = document.getElementById("assigned_avatar_container");
  if (!container) return;
  container.innerHTML = "";
  selectedUserIds.forEach((userId) => {
    const user = usersData[userId];
    if (!user) return;
    const initials = initialsFromGivenName(user.givenName);
    const bgColor = colorVarFromUserId(userId);
    const avatar = document.createElement("span");
    avatar.className = "user__avatar";
    avatar.style.background = bgColor;
    avatar.textContent = initials;
    container.appendChild(avatar);
  });
}

function wireContactActionsGlobalOnce() {
  if (document.documentElement.dataset.contactsBound === "1") return;
  document.documentElement.dataset.contactsBound = "1";

  document.addEventListener("click", async (e) => {
    const btn = e.target.closest('button[data-action="delete"][data-user-id]');
    if (!btn) return;
    const inContacts = btn.closest(".contact_detail");
    if (!inContacts) return;
    const userId = btn.dataset.userId;
    if (!userId) return;
    await deleteContact(userId);
  });
}

function editContactOverlayToggle() {
  const overlay = document.getElementById("editContactOverlay");
  overlay.classList.toggle("active");
}

window.initPage = async function initPage() {
  const page = document.body?.dataset?.page;

  if (page === "contacts") {
    if (typeof ensureUsersLoaded === "function") {
      await ensureUsersLoaded();
    }
    renderContacts(users);
    initContactsClick(users);
    return;
  }

  if (page === "add_task") {
    if (typeof ensureUsersLoaded === "function") {
      await ensureUsersLoaded();
    }
    initAssignedToDropdown(users);
    initTaskTypeDropdown(TASK_CATEGORIES);
    initSubtasksInput();
    bindAddTaskFormSubmitOnce();

    return;
  }

  if (page === "summary") {
    // falls du später Summary init hast
    if (typeof loadSummary === "function") loadSummary();
    if (typeof loadTasks === "function") await loadTasks();
    if (typeof renderSummary === "function") renderSummary();
    return;
  }

  if (page === "board") {
    if (typeof loadTasks === "function") await loadTasks();
    if (typeof renderBoard === "function") renderBoard();

    if (typeof initAddTaskModalOnce === "function") initAddTaskModalOnce();
    if (typeof initBoardModalButton === "function") initBoardModalButton();
    return;
  }
};

function setActiveNavLink() {
  const page = location.pathname.split("/").pop().replace(".html", "");

  document.querySelectorAll(".nav_link").forEach((link) => {
    link.classList.toggle("active", link.dataset.page === page);
  });
}
