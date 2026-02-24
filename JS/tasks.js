let parkedHost = null;
const statusTypes = {
  0: "To Do",
  1: "In Progress",
  2: "Await Feedback",
  3: "Done",
  4: "Cancelled",
};

/**
 * Initializes the add task page.
 * 
 * Checks user authorization and binds the submit event
 * handler to the add task form.
 * 
 * @function initAddTask
 * @returns {void}
 */
function initAddTask() {
  checkIfUserIsLoggedIn();
  const form = document.querySelector(".add_task_form");
  if (form) {
    form.addEventListener("submit", handleFormSubmit);
  }
}

/**
 * Loads tasks and users from the server.
 * 
 * Retrieves the list of all tasks from the database and ensures
 * that user data is also loaded.
 * 
 * @async
 * @function loadTasks
 * @returns {Promise<void>}
 */
async function loadTasks() {
  tasks = await loadData("/tasks");
  const users = await ensureUsersLoaded();
}

/**
 * Validates the presence of required fields in the task object.
 * 
 * Checks that the title, due date, and category are filled in.
 * 
 * @function validateTaskFields
 * @param {Object} newTaskObj - Task object to validate.
 * @returns {boolean} true if all required fields are filled, otherwise false.
 */
function validateTaskFields(newTaskObj) {
  if (!newTaskObj.titel || !newTaskObj.finishDate || !newTaskObj.type) {
    console.warn("addTaskData blocked: missing required fields", newTaskObj);
    return false;
  }
  return true;
}

/**
 * Updates the order of existing tasks in the specified column.
 * 
 * Increments order by 1 for all tasks with the specified status
 * to make room for a new task at the beginning of the list.
 * 
 * @async
 * @function updateExistingTasksOrder
 * @param {Object} allTasks - Object containing all tasks.
 * @param {number} status - Status of the column to update order in.
 * @returns {Promise<void>}
 */
async function updateExistingTasksOrder(allTasks, status) {
  const patches = [];
  Object.entries(allTasks).forEach(([id, t]) => {
    if (t && Number(t.status) === status) {
      const newOrder = (t.order || 0) + 1;
      t.order = newOrder;
      patches.push(
        patchData("tasks", id, { order: newOrder }).catch((e) => {
          console.error("failed to patch order for", id, e);
        }),
      );
    }
  });
  await Promise.all(patches);
}

/**
 * Saves a new task to the server and updates local storage.
 * 
 * Sets the task order to 0, uploads it to the server,
 * then updates session storage with current data.
 * 
 * @async
 * @function saveNewTask
 * @param {Object} newTaskObj - New task object.
 * @returns {Promise<void>}
 */
async function saveNewTask(newTaskObj) {
  newTaskObj.order = 0;
  const result = await uploadData("tasks", newTaskObj);
  const refreshed = await loadData("/tasks");
  saveTasksToSessionStorage(refreshed || {});
  tasks = refreshed || {};
}

/**
 * Adds a new task to the database.
 * 
 * Validates required fields, updates the order of existing tasks
 * in the same column, uploads the task to the server, updates session storage,
 * and displays a success notification.
 * 
 * @async
 * @function addTaskData
 * @param {Object} newTaskObj - Object with new task data.
 * @param {Object} [options] - Additional parameters.
 * @param {string} [options.toastId="task_success_overlay"] - ID of the notification element.
 * @param {Function} [options.afterDone] - Callback function after completion.
 * @param {boolean} [options.refreshAfter=false] - Reload tasks after adding.
 * @returns {Promise<void>}
 */
async function addTaskData(newTaskObj, { toastId = "task_success_overlay", afterDone, refreshAfter = false } = {}) {
  if (!validateTaskFields(newTaskObj)) return;

  const allTasks = (await loadData("/tasks")) || {};
  const status = typeof newTaskObj.status === "number" ? newTaskObj.status : 0;

  await updateExistingTasksOrder(allTasks, status);
  await saveNewTask(newTaskObj);

  showToastOverlay(toastId, {
    onDone: () => {
      if (typeof afterDone === "function") afterDone();
      if (refreshAfter) loadTasks();
    },
  });
}

/**
 * Redirects the user to the task board page.
 * 
 * @function activateBoard
 * @returns {void}
 */
function activateBoard() {
  window.location.replace("board.html");
}

/**
 * Performs actions after adding a task via modal window.
 * 
 * Removes the background class from the modal, closes it,
 * reloads tasks from the server, and updates the task board.
 * 
 * @async
 * @function afterTaskAddedInModal
 * @returns {Promise<void>}
 */
async function afterTaskAddedInModal() {
  const modal = document.querySelector(".add_task_modal");
  modal?.classList.remove("is_background");
  closeAddTaskModal();

  const newTasks = await loadData("/tasks");
  saveTasksToSessionStorage(newTasks);

  if (typeof loadTaskBoard === "function") {
    const users = JSON.parse(sessionStorage.getItem("users") || "{}");
    loadTaskBoard(newTasks, users);
  }
}

/**
 * Brings the modal window to the background.
 * 
 * Adds a CSS class for visual display of the modal in the background.
 * 
 * @function bringModalToBackground
 * @returns {void}
 */
function bringModalToBackground() {
  const modal = document.getElementById("addTaskModal");
  modal?.classList.add("is_background");
}
