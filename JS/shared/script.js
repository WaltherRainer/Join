/**
 * Page-specific initialization helpers.
 * These are the only functions kept in script.js after splitting.
 */

/**
 * Initializes the contacts page.
 * Renders the contacts list and sets up click handlers.
 *
 * @async
 * @function initializeContactsPage
 * @param {Object} usersDataObj - Users data object
 * @returns {Promise<void>}
 */
async function initializeContactsPage(usersDataObj) {
  renderContacts(usersDataObj);
  initContactsClick(usersDataObj);
}

/**
 * Initializes the add task page.
 * Mounts the task form and initializes all form controls.
 *
 * @async
 * @function initializeAddTaskPage
 * @param {Object} usersDataObj - Users data object
 * @returns {Promise<void>}
 */
async function initializeAddTaskPage(usersDataObj) {
  const host = document.getElementById("addTaskInlineHost");
  const form = await mountTaskForm(host, {
    title: "Add Task",
    preset: { titel: "", description: "", priority: "medium" },
    toastId: "task_success_overlay",
    afterSaved: () => activateBoard(),
  });
  initAssignedToDropdown(form, usersDataObj);
  resetAssignedToDropdown(form);
  initTaskTypeDropdown(form, TASK_CATEGORIES);
  initSubtasksInput(form);
}

/**
 * Initializes the summary page.
 * Summary page requires data to be loaded but no additional initialization.
 *
 * @async
 * @function initializeSummaryPage
 * @returns {Promise<void>}
 */
async function initializeSummaryPage() {
  // Summary page is initialized by data loading
}

/**
 * Initializes the board page.
 * Renders the task board and sets up the add task modal.
 *
 * @async
 * @function initializeBoardPage
 * @param {Object} tasksDataObj - Tasks data object
 * @param {Object} usersDataObj - Users data object
 * @returns {Promise<void>}
 */
async function initializeBoardPage(tasksDataObj, usersDataObj) {
  loadTaskBoard(tasksDataObj, usersDataObj);
  initAddTaskModalOnce();
}

/**
 * Routes to the appropriate page initialization function.
 * Dispatches initialization based on the current page type.
 *
 * @async
 * @function initializePageContent
 * @param {string} page - The page identifier
 * @param {Object} usersDataObj - Users data object
 * @param {Object} tasksDataObj - Tasks data object
 * @returns {Promise<void>}
 */
async function initializePageContent(page, usersDataObj, tasksDataObj) {
  switch (page) {
    case "contacts":
      await initializeContactsPage(usersDataObj);
      break;

    case "add_task":
      await initializeAddTaskPage(usersDataObj);
      break;

    case "summary":
      await initializeSummaryPage();
      break;

    case "board":
      await initializeBoardPage(tasksDataObj, usersDataObj);
      break;

    default:
      break;
  }
}

/**
 * Initializes page-specific logic based on the current page identifier.
 * Orchestrates all initialization steps and global event listeners.
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
  await initializePageContent(page, usersDataObj, tasksDataObj);
  InitGlobalEventListener();
};

/**
 * Update the avatar shown for the active user using stored session values.
 *
 * @function renderActiveUserAvatar
 * @returns {void}
 */
function renderActiveUserAvatar() {
  const color = colorVarFromUserId(sessionStorage.userId);
  document.documentElement.style.setProperty("--user_c_active", color);
  const initials = initialsFromGivenName(sessionStorage.userName);
  document.getElementById("active_user_avatar").innerHTML = initials;
}

/**
 * Highlights the current navigation link based on the path.
 *
 * @function setActiveNavLink
 * @returns {void}
 */
function setActiveNavLink() {
  const page = location.pathname.split("/").pop().replace(".html", "");

  document.querySelectorAll(".nav_link").forEach((link) => {
    link.classList.toggle("active", link.dataset.page === page);
  });
}

/**
 * Adjusts visibility of privacy/legal notice links for logged-out users.
 *
 * @function initPrivacyPoliceOrLegalNotice
 * @returns {void}
 */
function initPrivacyPoliceOrLegalNotice() {
  const userInfo = document.getElementById("user_info_top_menu");
  const userLoggedIn = sessionStorage.getItem("userLoggedIn");
  if (userLoggedIn !== "true") {
    userInfo.classList.add("d_none");
    document.querySelectorAll(".nav_link").forEach((el) => el.classList.toggle("d_none"));
  }
}
