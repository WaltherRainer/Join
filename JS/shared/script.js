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
  form.querySelector(".add_task_titel").classList.add("sec_backg_col");
  form.querySelector(".form_actions").classList.add("sec_backg_col");
  initAssignedToDropdown(form, usersDataObj);
  resetAssignedToDropdown(form);
  initTaskTypeDropdown(form, TASK_CATEGORIES);
  initSubtasksInput(form);
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
  initBoard();
  loadTaskBoard(tasksDataObj, usersDataObj);
  initAddTaskModalOnce();
}

/**
 * Initializes the current page by dispatching to a page-specific initializer.
 *
 * Selects the correct init function based on the `page` identifier and awaits it.
 * Uses {@link getPageInitializer} to resolve the handler.
 *
 * @function initializePageContent
 * @param {string} page - Page key (e.g. "contacts", "add_task", "board").
 * @param {Object} usersDataObj - Loaded users data passed to page initializers.
 * @param {Object} tasksDataObj - Loaded tasks data passed to page initializers.
 * @returns {Promise<void>} Resolves when the page initialization has finished.
 */
async function initializePageContent(page, usersDataObj, tasksDataObj) {
  const init = getPageInitializer(page);
  if (!init) return;
  await init(usersDataObj, tasksDataObj);
}

/**
 * Returns an async initializer function for the given page key.
 *
 * The returned function has a normalized signature `(users, tasks)` so the
 * caller can pass both data objects regardless of the page type.
 *
 * @function getPageInitializer
 * @param {string} page - Page key to resolve.
 * @returns {((users:Object, tasks:Object)=>Promise<void>)|null} Page initializer or null.
 */
function getPageInitializer(page) {
  const map = {
    contacts: (users) => initializeContactsPage(users),
    add_task: (users) => initializeAddTaskPage(users),
    board: (users, tasks) => initializeBoardPage(tasks, users),
  };
  return map[page] ?? null;
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
    if (userInfo) userInfo.classList.add("d_none");
    document.querySelectorAll(".nav_link").forEach((el) => el.classList.toggle("d_none"));
  }
}
