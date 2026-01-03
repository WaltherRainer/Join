let users = {};
let activeUserId = "555454";
let tasks = {};
let activeUserName = "Walther";
let localSubtasks = {};
const USER_COLOR_COUNT = 15;
const signInContainer = document.getElementById("sign_up_form");
const logInContainer = document.getElementById("login_form");
const indexHeader = document.getElementById("index_header"); 
let usersReady = null;

function initUsersLoading() {
  if (!window.usersReady) {
    window.usersReady = (async () => {
      const data = await loadData("/users");
      window.users = data || {};
      return window.users;
    })().catch(err => {
      window.usersReady = null;
      throw err;
    });
  }
  return window.usersReady;
}

function toggleUserMenu() {
    let userMenu = document.getElementById('user_menu');
    userMenu.classList.toggle('d_none');
}

async function ensureUsersLoaded() {
  if (users && Object.keys(users).length > 0) return users;
  users = await loadData("/users") || {};
  return users;
}

function showNav(page = "summary") {
  setActiveNav(page); 
  const mainCont = document.getElementById("main_content");
  mainCont.innerHTML = `<div w3-include-html="${page}.html"></div>`;

  w3.includeHTML(async () => {
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
    }
  });
}

function onPageLoaded(page) {
  const btn = document.getElementById("openAddTaskModalBtn");
  if (!btn) return;

  btn.onclick = () => openAddTaskModal();
}

function setActiveNav(page) {
  document.querySelectorAll(".nav_link").forEach(link => {
    link.classList.toggle("active", link.dataset.page === page);
  });
}

async function loadStart() {
    users = await loadData("/users") || {};  
    loadTasks();
    showNav('summary');
    showAvatar();
    console.log(users);
    // let UserKeys = Object.keys(users);
}

function showAvatar() {
    const avatar = document.getElementById('user_avatar_wrapper');
    avatar.innerHTML = renderAvatar(activeUserId, activeUserName);
}

document.addEventListener("DOMContentLoaded", async () => {
  await initUsersLoading();
  if (window.renderIcons) window.renderIcons(document);
  loadTasks();
});

document.addEventListener("DOMContentLoaded", () => {
  initAddTaskModalOnce();

  const navAddTask = document.getElementById("navAddTask");
  if (navAddTask) {
    navAddTask.addEventListener("click", (e) => {
      e.preventDefault();
      openAddTaskModal();
    });
  }
  document.addEventListener("submit", async (e) => {
    const form = e.target;

    if (!(form instanceof HTMLFormElement)) return;
    if (form.id !== "addTaskForm") return;
    e.preventDefault();
    await addTask();
    }, true);

    const openBtn = document.getElementById("openAddTaskModalBtn");
    if (openBtn) {
      openBtn.addEventListener("click", (e) => {
        e.preventDefault();
        openAddTaskModal();
      });
    }
});


function renderAvatar(activeUserId, activeUserName) {
  const initials = initialsFromGivenName(activeUserName);
  const bgColor = colorIndexFromUserId(activeUserId);
  return `
    <div class="user_avatar" onclick="toggleUserMenu()" style="color: var(--user_c_${bgColor});">${initials}</div>
  `
}

function renderAssignedAvatars(selectedUserIds, usersData) {
  const container = document.getElementById('assigned_avatar_container');
  if (!container) return;

  container.innerHTML = '';

  selectedUserIds.forEach(userId => {
    const user = usersData[userId];
    if (!user) return;

    const initials = initialsFromGivenName(user.givenName);
    const bgColor = colorVarFromUserId(userId);

    const avatar = document.createElement('span');
    avatar.className = 'user__avatar';
    avatar.style.background = bgColor;
    avatar.textContent = initials;

    container.appendChild(avatar);
  });
}

function wireContactActionsGlobalOnce() {
  if (document.documentElement.dataset.contactsBound === "1") return;
  document.documentElement.dataset.contactsBound = "1";

  document.addEventListener("click", async (e) => {
    const btn = e.target.closest('button[data-action="delete"]');
    if (!btn) return;

    const userId = btn.dataset.userId;
    if (!userId) {
      console.warn("Delete clicked, but no data-user-id on button", btn);
      return;
    }

    await deleteContact(userId);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  wireContactActionsGlobalOnce();
});

window.usersReady = null;
window.users = window.users || {};

function editContactOverlayToggle() {
            const overlay = document.getElementById("editContactOverlay");
            overlay.classList.toggle("d_none");
        }