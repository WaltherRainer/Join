let users = {};
let activeUserId = "";
let tasks = {};
let activeUserName = "";
let localSubtasks = {};
const USER_COLOR_COUNT = 15;

let joinSessionStorageObject = {}; // erzeugt object für SessionStorage

let usersReady = null;

function indexInit() {
  initSessionStorage();
}

function initSessionStorage() {
  sessionStorage.setItem("userIsGuest", false); // Wenn User ein Gast (nicht eingeloggt) ist, dann 'true'
}

function saveSessionStorage(key, value) {
  sessionStorage.setItem(key, JSON.stringify(value));
}

function loadSessionStorage() {
  const tempArr = JSON.parse(sessionStorage.getItem("joinSessionStorageObject"));

  if (tempArr != null) {
    joinSessionStorageObject = tempArr;
  } else {
    console.error("Error loading data from session storage");
  }
}

function saveUserToSessionStorage(userId, userName, users) {
  sessionStorage.setItem("userId", userId);
  sessionStorage.setItem("userName", userName);
  sessionStorage.setItem("users", JSON.stringify(users));
}

function ensureTasksAreLoaded() {
  if (tasks && Object.keys(tasks).length > 0) return tasks;
}

function getUserIdFromSessionStorage() {
  return sessionStorage.getItem("userId");
}

function getUserNameFromSessionStorage() {
  return sessionStorage.getItem("userName");
}

async function ensureUsersLoaded() {
  if (users && Object.keys(users).length > 0) return users;
  const dataObj = JSON.parse(sessionStorage.getItem("users"));
  if (dataObj && Object.keys(dataObj).length > 0) return dataObj;
  users = (await loadData("/users")) || {};
  sessionStorage.setItem("users", JSON.stringify(users));
  return users;
}

async function ensureTasksLoaded() {
  if (tasks && Object.keys(tasks).length > 0) return tasks;
  const dataObj = JSON.parse(sessionStorage.getItem("tasks"));
  if (dataObj && Object.keys(dataObj).length > 0) return dataObj;
  tasks = (await loadData("/tasks")) || {};
  sessionStorage.setItem("tasks", JSON.stringify(tasks));
  return tasks;
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

// function showNav(page = "summary") {
//   setActiveNav(page);
//   const mainCont = document.getElementById("main_content");
//   mainCont.innerHTML = `<div w3-include-html="${page}.html"></div>`;

//   w3includeHTML(async () => {
//     renderIcons(document);
//     onPageLoaded();

//     if (page === "add_task") {
//       await ensureUsersLoaded();
//       initAssignedToDropdown(users);
//       initTaskTypeDropdown(TASK_CATEGORIES);
//       initSubtasksInput();
//     } else if (page === "contacts") {
//       renderContacts(users);
//       initContactsClick(users);
//     } else if (page === "summary") {
//       initSummary();
//     }
//   });
// }

function onPageLoaded() {
  const btn = document.getElementById("openAddTaskModalBtn");
  if (!btn) return;

  btn.onclick = () => openAddTaskModal();
}

function setActiveNav(page) {
  document.querySelectorAll(".nav_link").forEach((link) => {
    link.classList.toggle("active", link.dataset.page === page);
  });
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
  // console.log(userMenu);
  if (!userMenu) return;

  userMenu.classList.toggle("d_none");
}

function showUserDialog() {
  const dialog = document.getElementById("user_menu");
  openBtn.addEventListener("click", () => {
    dialog.showModal();
  });
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
    avatar.className = "user__avatar avatar_wrap";
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

// function editContactOverlayToggle() {
//   const overlay = document.getElementById("editContactOverlay");
//   overlay.classList.toggle("active");
// }

// document.getElementById("editContactOverlay").addEventListener("click", () => {
//   editContactOverlayToggle();
// });

// document.querySelector(".edit_contact_overlay").addEventListener("click", (event) => {
//   event.stopPropagation();
// });

function listenEscapeFromModal(modalDOMId = "editContactOverlay") {
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      document.getElementById(modalDOMId).classList.remove("active");
    }
  });
}

function InitGlobalEventListener() {
  const btn = document.getElementById("open_user_dialog");
  const menu = document.getElementById("user_dialog");

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    toggleUserMenu();
  });

  document.addEventListener("click", (e) => {
    if (menu.hidden) return;

    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      closeUserMenuDialog();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeUserMenuDialog();
    }
  });

  function toggleUserMenu() {
    if (menu.hidden) openUserMenuDialog();
    else closeUserMenuDialog();
  }
}

function openUserMenuDialog() {
  const menu = document.getElementById("user_dialog");
  menu.hidden = false;

  const firstLink = menu.querySelector("a, button");
  firstLink?.focus();
}

function closeUserMenuDialog() {
  const menu = document.getElementById("user_dialog");
  menu.hidden = true;
}

/**
 * Initializes page-specific logic based on the current page identifier.
 *
 * @async
 * @function initPage
 * @returns {Promise<void>}
 */
window.initPage = async function initPage() {
  const page = document.body?.dataset?.page;
  renderActiveUserAvatar();
  const usersDataObj = await ensureUsersLoaded();
  const tasksDataObj = await ensureTasksLoaded();
  switch (page) {
    case "contacts":
      renderContacts(usersDataObj);
      initContactsClick(usersDataObj);
      break;
    case "add_task":
      initAssignedToDropdown(usersDataObj);
      initTaskTypeDropdown(TASK_CATEGORIES);
      initSubtasksInput();
      bindAddTaskFormSubmitOnce();
      break;
    case "summary":
      // loadSummary();
      await ensureTasksLoaded();
      // renderSummary();
      break;
    case "board":
      await ensureTasksLoaded();
      loadTaskBoard(tasksDataObj, usersDataObj);
      // renderBoard();
      initAddTaskModalOnce();
      initBoardModalButtons();
      break;

    default:
      // optional: console.warn(`No initPage handler for page: ${page}`);
      break;
  }

  InitGlobalEventListener();
};

function renderActiveUserAvatar() {
  const color = colorVarFromUserId(sessionStorage.userId);
  document.documentElement.style.setProperty("--user_c_active", color);
  const initials = initialsFromGivenName(sessionStorage.userName);
  document.getElementById("active_user_avatar").innerHTML = initials;
}

function setActiveNavLink() {
  const page = location.pathname.split("/").pop().replace(".html", "");

  document.querySelectorAll(".nav_link").forEach((link) => {
    link.classList.toggle("active", link.dataset.page === page);
  });
}

/**
 * Universeller Overlay-Toast: visible -> slide-in animation -> hold -> hide -> callback
 *
 * Erwartet:
 * - overlay bekommt Klassen: is_visible, is_animating
 * - "box" im Overlay animiert per CSS, wenn overlay.is_animating gesetzt ist
 *
 * @param {string} overlayId
 * @param {object} [opts]
 * @param {string} [opts.boxSelector]   - CSS selector für die Box im Overlay (default: "[data-toast-box], .signup_success_box, .task_success_box")
 * @param {number} [opts.holdMs]        - Standzeit nach Slide-In (default: data-hold-ms am Overlay oder 1000)
 * @param {Function} [opts.onDone]      - Callback nach dem Ausblenden (z.B. activateLogIn)
 * @param {string} [opts.visibleClass]  - default "is_visible"
 * @param {string} [opts.animateClass]  - default "is_animating"
 */
function showToastOverlay(overlayId, opts = {}) {
  const overlay = document.getElementById(overlayId);
  if (!overlay) {
    console.warn("Overlay nicht gefunden:", overlayId);
    return;
  }

  const visibleClass = opts.visibleClass || "is_visible";
  const animateClass = opts.animateClass || "is_animating";
  const boxSelector = opts.boxSelector || "[data-toast-box], .signup_success_box, .task_success_box";

  const box = overlay.querySelector(boxSelector);
  if (!box) {
    console.warn("Toast-Box nicht gefunden in:", overlayId, "Selector:", boxSelector);
    return;
  }

  // Hold: Options -> data-attr -> default
  const holdMs = Number.isFinite(opts.holdMs) ? opts.holdMs : parseInt(overlay.dataset.holdMs, 10) || 1000;

  // laufende Timer/Listener sauber weg
  if (overlay._toastTimer) window.clearTimeout(overlay._toastTimer);
  if (overlay._toastCleanup) overlay._toastCleanup();

  overlay.setAttribute("aria-hidden", "false");
  overlay.classList.add(visibleClass);

  // Reflow erzwingen, damit animation zuverlässig neu startet
  // (wichtig wenn man denselben Toast schnell hintereinander zeigt)
  void box.offsetWidth;

  overlay.classList.add(animateClass);

  const onAnimEnd = (ev) => {
    // Nur reagieren, wenn die Box-Animation fertig ist (nicht ggf. child animations)
    if (ev.target !== box) return;

    box.removeEventListener("animationend", onAnimEnd);

    overlay._toastTimer = window.setTimeout(() => {
      overlay.classList.remove(animateClass, visibleClass);
      overlay.setAttribute("aria-hidden", "true");

      if (typeof opts.onDone === "function") {
        opts.onDone();
        return;
      }

      // Optionaler Fallback: data-on-done="activateLogIn"
      const fnName = overlay.dataset.onDone;
      if (fnName && typeof window[fnName] === "function") {
        window[fnName]();
      }
    }, holdMs);
  };

  box.addEventListener("animationend", onAnimEnd);

  // Cleanup merken (falls Toast während Animation neu getriggert wird)
  overlay._toastCleanup = () => {
    box.removeEventListener("animationend", onAnimEnd);
  };
}

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
