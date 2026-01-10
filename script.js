let users = {};
let activeUserId = "54321";
let tasks = {};
let activeUserName = "TestUser";
let localSubtasks = {};
const USER_COLOR_COUNT = 15;

let joinLocalStorageObject = {}; // erzeugt object für localStorage

let usersReady = null;

function indexInit() {
  initLocalStorage();
}

function initLocalStorage() {
  localStorage.removeItem("joinLocalStorageObject"); // Löscht zum Start von Join die alten Daten im localStorage
  joinLocalStorageObject.userIsGuest = false; // Wenn User ein Gast (nicht eingeloggt) ist, dann 'true'
  joinLocalStorageObject.activeUserId = activeUserId;
  joinLocalStorageObject.activeUserName = activeUserName;
  localStorage.setItem("joinLocalStorageObject", JSON.stringify(joinLocalStorageObject));
}

function saveLocalStorage(key, value) {
  joinLocalStorageObject[key] = value;
  localStorage.setItem("joinLocalStorageObject", JSON.stringify(joinLocalStorageObject));
}

function loadLocalStorage() {
  const tempArr = JSON.parse(localStorage.getItem("joinLocalStorageObject"));

  if (tempArr != null) {
    joinLocalStorageObject = tempArr;
  } else {
    console.error("Error loading data from localstorage");
  }
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

async function loadTasks() {
  tasks = await loadData("/tasks");
  const users = await ensureUsersLoaded();
  // console.log(users);
  // loadTaskBoard(tasks, users);
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

// async function loadStart() {
//   users = (await loadData("/users")) || {};
//   await loadTasks();
//   showNav("summary");
//   showAvatar();
// }

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

/**
 * Initializes page-specific logic based on the current page identifier.
 *
 * @async
 * @function initPage
 * @returns {Promise<void>}
 */
window.initPage = async function initPage() {
  const page = document.body?.dataset?.page;

  switch (page) {
    case "contacts":
      if (typeof ensureUsersLoaded === "function") {
        await ensureUsersLoaded();
      }
      renderContacts(users);
      initContactsClick(users);
      break;

    case "add_task":
      if (typeof ensureUsersLoaded === "function") {
        await ensureUsersLoaded();
      }
      initAssignedToDropdown(users);
      initTaskTypeDropdown(TASK_CATEGORIES);
      initSubtasksInput();
      bindAddTaskFormSubmitOnce();
      break;

    case "summary":
      // loadSummary();
      await loadTasks();
      // renderSummary();
      break;

    case "board":
      await loadTasks();

      loadTaskBoard(tasks, users);
      // renderBoard();
      initAddTaskModalOnce();
      initBoardModalButton();
      break;

    default:
      // optional: console.warn(`No initPage handler for page: ${page}`);
      break;
  }
};

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
