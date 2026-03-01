const dirtyTaskIds = new Set();
let currentDraggedTaskId;
let taskModalEscBound = false;

/**
 * Initializes the board page.
 *
 * Checks user authentication and sets up search input functionality.
 */
function initBoard() {
  checkIfUserIsLoggedIn();
  initSearchInput();
}

/**
 * Loads tasks from sessionStorage.
 *
 * @returns {Object} Tasks object from session storage.
 */
function loadTasksFromSession() {
  return JSON.parse(sessionStorage.getItem("tasks") || "{}");
}

/**
 * Loads users from sessionStorage.
 *
 * @returns {Object} Users object from session storage.
 */
function loadUsersFromSession() {
  return JSON.parse(sessionStorage.getItem("users") || "{}");
}

/**
 * Initializes event listeners for board interactions.
 *
 * Sets up click handlers for add task buttons and task card clicks.
 *
 * @param {Object} users - Users data object.
 */
function initBoardEventList(users) {
  const btn = document.getElementById("openAddTaskModalBtn");
  if (!btn) return;
  btn.addEventListener("click", () => openAddTaskModal(0));
  const buttons = document.querySelectorAll(".add_task_trigger");
  if (!buttons) return;
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const status = Number(button.dataset.status) || 0;
      openAddTaskModal(status);
    });
});

  const taskSect = document.querySelectorAll(".task_section");
  if (taskSect.length === 0) return;

  taskSect.forEach((section) => {
    section.addEventListener("click", (e) => {
      if (e.target.tagName === "SELECT") return;
      const card = e.target.closest(".t_task");
      if (!card) return;
      const taskId = card.dataset.taskId;
      if (!taskId) return;
      openTaskModal(taskId, users);
    });
  });
}

/**
 * Retrieves board container elements.
 *
 * @returns {Object|null} Object with container references or null if missing.
 */
function getBoardContainers() {
  const toDoDiv = document.getElementById("task_to_do");
  const inProgressDiv = document.getElementById("task_progress");
  const awaitfeedbackdiv = document.getElementById("task_await");
  const doneDiv = document.getElementById("task_done");
  if (!toDoDiv || !inProgressDiv || !awaitfeedbackdiv || !doneDiv) {
    console.error("getBoardContainers: missing containers");
    return null;
  }
  return { toDoDiv, inProgressDiv, awaitfeedbackdiv, doneDiv };
}

/**
 * Finds status name from status code.
 *
 * @param {number} status - Status code.
 * @returns {string} Status name.
 */
function findStatusName(status) {
  if(statusTypes[status] == "In Progress"){
    return "Progress";
  } else {
    return statusTypes[status] || "Unknown";
  }
}

/**
 * Switches task status container.
 *
 * Moves task to new status and re-renders.
 *
 * @param {string} taskId - The task ID.
 * @param {number} newStatusNum - New status code.
 */
function switchStatusContainer(taskId, newStatusNum) {
  currentDraggedTaskId = taskId;
  const tasks = loadTasksFromSession();
  const task = tasks[taskId];
  const users = loadUsersFromSession();
  
  if (!task) return;
  
  const newStatus = Number(newStatusNum);
  const tasksInStatus = sortTasksInStatus(newStatus, tasks);
  
  // Insert at the beginning (position 0)
  const insertIndex = 0;
  deleteAndAddTaskInStatusPosition(tasksInStatus, insertIndex, tasks);
  reRenderTasksInOrder(tasksInStatus, tasks, users, newStatus);
  currentDraggedTaskId = null;
}

/**
 * Returns appropriate container for status.
 *
 * @param {number} status - Status code.
 * @param {Object} containers - Board container references.
 * @returns {HTMLElement} The container element.
 */
function statusContainerFor(status, containers) {
  if (status === 0) return containers.toDoDiv;
  if (status === 1) return containers.inProgressDiv;
  if (status === 2) return containers.awaitfeedbackdiv;
  if (status === 3) return containers.doneDiv;
  return containers.toDoDiv; // fallback
}

/**
 * Renders task items in their containers.
 *
 * @param {Array} items - Array of task objects.
 * @param {Object} containers - Board container references.
 * @param {Object} users - Users data object.
 */
function renderItems(items, containers, users) {
  containers.toDoDiv.innerHTML = "";
  containers.inProgressDiv.innerHTML = "";
  containers.awaitfeedbackdiv.innerHTML = "";
  containers.doneDiv.innerHTML = "";

  // Sortiere Tasks nach ihrer Reihenfolge innerhalb der Kategorie
  const sortedItems = items.sort((a, b) => (a.order || 0) - (b.order || 0));
  const isDraggable = window.innerWidth > 880;
  sortedItems.forEach((task) => {
    const taskHTML = taskItemTemplate(task, users, isDraggable);
    const target = statusContainerFor(task.status, containers);
    target.insertAdjacentHTML("beforeend", taskHTML);
    renderIcons(target);
  });
}

/**
 * Renders empty states for containers without tasks.
 *
 * @param {Object} containers - Board container references.
 */
function renderEmptyStates(containers) {
  const isEmpty = (el) => !el.querySelector(".t_task");
  if (isEmpty(containers.toDoDiv)) containers.toDoDiv.insertAdjacentHTML("beforeend", noTaskTemplate("No task To do"));
  if (isEmpty(containers.inProgressDiv)) containers.inProgressDiv.insertAdjacentHTML("beforeend", noTaskTemplate("No task In progress"));
  if (isEmpty(containers.awaitfeedbackdiv)) containers.awaitfeedbackdiv.insertAdjacentHTML("beforeend", noTaskTemplate("No task Await feedback"));
  if (isEmpty(containers.doneDiv)) containers.doneDiv.insertAdjacentHTML("beforeend", noTaskTemplate("No task Done"));
}

/**
 * Loads and renders the task board.
 *
 * @param {Object|Array} tasks - Tasks data.
 * @param {Object} users - Users data object.
 */
function loadTaskBoard(tasks, users) {
  const containers = getBoardContainers();
  if (!containers) return;

  const items = Array.isArray(tasks) ? tasks : returnArrayOfTasks(tasks);

  renderItems(items, containers, users);
  renderEmptyStates(containers);
  initBoardEventList(users);
}

/**
 * Converts tasks object to array.
 *
 * @param {Object|Array} tasks - Tasks data.
 * @returns {Array} Array of task objects.
 */
const returnArrayOfTasks = (tasks) => {
  if (tasks && typeof tasks === "object" && !Array.isArray(tasks)) {
    return Object.entries(tasks).map(([id, t]) => ({ id, ...t }));
  } else if (Array.isArray(tasks)) {
    return tasks;
  } else {
    return [];
  }
};

/**
 * Safely parses JSON array from string.
 *
 * @param {string} str - JSON string to parse.
 * @returns {Array} Parsed array or empty array on error.
 */
function safeParseArray(str) {
  try {
    const v = JSON.parse(str || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

/**
 * Retrieves user data from string (user ID).
 *
 * @param {string} userId - The user ID.
 * @param {Object} users - Users data object.
 * @returns {Object|null} Object with initials and bgColor or null.
 */
function getUserDataFromString(userId, users) {
  const user = users?.[userId];
  if (!user) return null;
  const givenName = user.givenName || user.name;
  if (!givenName) return null;
  return { initials: initialsFromGivenName(givenName, ""), bgColor: colorIndexFromUserId(userId) };
}

/**
 * Retrieves user data from object.
*
 * @param {Object} item - User data object.
 * @param {Object} users - Users data object.
 * @returns {Object|null} Object with initials and bgColor or null.
 */
function getUserDataFromObject(item, users) {
  const userId = item.userId || item.id;
  const givenName = item.givenName || item.name;
  
  if (givenName) {
    return { initials: initialsFromGivenName(givenName, ""), bgColor: colorIndexFromUserId(userId || "") };
  }
  
  if (userId && users?.[userId]) {
    const user = users[userId];
    const name = user.givenName || user.name;
    if (name) return { initials: initialsFromGivenName(name, ""), bgColor: colorIndexFromUserId(userId) };
  }
  
  return null;
}

/**
 * Finds user data (name and color) from item.
 *
 * @param {string|Object} item - User ID or user object.
 * @param {Object} users - Users data object.
 * @returns {Object|null} Object with initials and bgColor or null.
 */
function findUserDataNameAndColor(item, users = window.users || {}) {
  if (!item) return null;
  if (typeof item === "string") return getUserDataFromString(item, users);
  if (typeof item === "object") return getUserDataFromObject(item, users);
  return null;
}

/**
 * Maps assigned users to avatar HTML.
 *
 * @param {Array} assignedTo - Array of user IDs or objects.
 * @param {Object} users - Users data object.
 * @returns {string} HTML string with avatars.
 */
function mapAssignedTo(assignedTo, users = window.users || {}) {
  if (!assignedTo || !Array.isArray(assignedTo)) return "";
  const entries = assignedTo.map((item) => findUserDataNameAndColor(item, users)).filter(Boolean);
  if (entries.length === 0) return "";
  
  const maxVisible = 3;
  const visible = entries
    .slice(0, maxVisible)
    .map(({ initials, bgColor }) => renderSingleAvatar(initials, bgColor))
    .join("");

  if (entries.length > maxVisible) {
    return visible + renderRemainingCount(entries.length - maxVisible);
  }
  return visible;
}

/**
 * Searches and filters board tasks by input.
 */
function searchBoardTasks() {
  const inputWord = document.getElementById("input_search_task").value.trim().replace(/\s+/g, ' ').toLowerCase();
  const tasks = returnArrayOfTasks(loadTasksFromSession());
  const filteredTasks = filterTasksBySearch(tasks, inputWord);
  updateNoResultsMessage(filteredTasks);
  loadTaskBoard(filteredTasks, loadUsersFromSession());
}

/**
 * Filters tasks by search query.
 *
 * @param {Array} tasks - Array of task objects.
 * @param {string} inputWord - Search query string.
 * @returns {Array} Filtered tasks array.
 */
function filterTasksBySearch(tasks, inputWord) {
  if (!inputWord) return tasks;
  return tasks.filter(task =>
    task.titel?.trim().replace(/\s+/g, ' ').toLowerCase().includes(inputWord) || 
    (task.description?.trim().replace(/\s+/g, ' ').toLowerCase().includes(inputWord))
  );
}

/**
 * Initializes search input event listener.
 */
function initSearchInput() {
  const input = document.getElementById("input_search_task");
  if (!input) return;
  input.addEventListener("input", searchBoardTasks);
}

/**
 * Updates "no results" message visibility.
 *
 * @param {Array} filteredTasks - Filtered tasks array.
 */
function updateNoResultsMessage(filteredTasks) {
  let messageEl = document.getElementById("no_results_message");
  if (filteredTasks.length === 0) {
    messageEl.classList.remove("is-hidden");
  } else {
    messageEl.classList.add("is-hidden");
  }
}
