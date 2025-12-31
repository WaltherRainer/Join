let users = {};
let activeUserId = "555454";
let tasks = {};
let activeUserName = "Walther";
let localSubtasks = {};
const USER_COLOR_COUNT = 15;

const signInContainer = document.getElementById("sign_up_form");
const logInContainer = document.getElementById("login_form");
const indexHeader = document.getElementById("index_header"); 

function toggleUserMenu() {
    let userMenu = document.getElementById('user_menu');
    userMenu.classList.toggle('d_none');
}

function showNav(page = "summary") {
    const mainCont = document.getElementById('main_content');
    mainCont.innerHTML = `<div w3-include-html="${page}.html"></div>`;

    w3.includeHTML(() => {
        onPageLoaded(page);
        if (page === "add_task") {
        initAssignedToDropdown(users);
        initTaskTypeDropdown(TASK_CATEGORIES);
        }
    });
}

function onPageLoaded(page) {
  // Button exists z.B. nur auf board.html
  const btn = document.getElementById("openAddTaskModalBtn");
  if (btn) {
    btn.addEventListener("click", () => openAddTaskModal());
  }
}

async function renderUsers() {
    users = await loadData("/users") || {};
    document.getElementById('user_cards').innerHTML = "";
    let UserKeys = Object.keys(users);
    for (let index = 0; index < UserKeys.length; index++) {
        const element = UserKeys[index];
        email = users[element].email;
        lastName = users[element].lastname;
        firstName = users[element].firstname;
        document.getElementById('user_cards').innerHTML += getUserCardTempl(index, email, lastName, firstName)
    }
}

function getUserCardTempl(index, email, lastName, firstName) {
    return `
        <div class="user_div">
            <h3 id="user_${index}_name">${firstName} ${lastName}</h3>
            <p id="user_${index}_email">${email}</p>
        </div>
    `
}

async function onloadFunc() {
    users = await loadData("/users") || {};  
    loadTasks();
    // console.log(users);
    // let UserKeys = Object.keys(users);
}

async function loadStart() {
    users = await loadData("/users") || {};  
    loadTasks();
    showNav('summary');
    showAvatar();
    // console.log(users);
    // let UserKeys = Object.keys(users);
}

function showAvatar() {
    const avatar = document.getElementById('user_avatar_wrapper');
    avatar.innerHTML = renderAvatar(activeUserId, activeUserName);
}

document.addEventListener("DOMContentLoaded", () => {
  initAddTaskModalOnce();

  const navAddTask = document.getElementById("navAddTask");
  if (navAddTask) {
    navAddTask.addEventListener("click", (e) => {
      e.preventDefault();
      openAddTaskModal();
    });
  }
});

/**
 * Function to generate a deterministic color index for a user based on the user id.
 * The index is always between 1 and the maximum number of defined user colors.
 * Same user id will always result in the same color index.
 *
 * @param {string} userId -Unique user identifier (e.g. Firebase user id)
 * @returns {number} -Color index between 1 and USER_COLOR_COUNT
 */
function colorIndexFromUserId(userId) {
  // simple hash
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0; // unsigned
  }
  return (hash % USER_COLOR_COUNT) + 1; // 1..15
}

/**
 * Function to generate a CSS color variable reference for a user based on the user id.
 * Maps the user deterministically to one of the predefined CSS variables (--user_c_1 .. --user_c_15).
 *
 * @param {string} userId -Unique user identifier (e.g. Firebase user id)
 * @returns {string} -CSS variable string for the user color (e.g. "var(--user_c_7)")
 */
function colorVarFromUserId(userId) {
  const idx = colorIndexFromUserId(userId);
  return `var(--user_c_${idx})`;
}

/**
 * Function to generate user initials from a given name string.
 * For single names, the first two characters are used.
 * For multiple names, the first character of the first and last name is used.
 *
 * @param {string} givenName -Full given name of the user
 * @param {string} [fallback="?"] -Fallback initials when no valid name is provided
 * @returns {string} -Uppercase initials to be displayed in the user avatar
 */
function initialsFromGivenName(givenName, fallback = "?") {
  if (!givenName) return fallback;

  const parts = String(givenName).trim().split(/\s+/).filter(Boolean);

  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

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