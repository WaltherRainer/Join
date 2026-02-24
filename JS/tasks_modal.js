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

/**
 * Gets references to add task modal elements.
 * 
 * @function getModalElements
 * @returns {Object} Object with modal elements.
 */
function getModalElements() {
  const modal = document.getElementById("addTaskModal");
  const host = document.getElementById("addTaskModalHost");
  const closeBtn = modal?.querySelector(".add_task_modal_close");
  return { modal, host, closeBtn };
}

/**
 * Closes the add task modal window.
 * 
 * Clears the container content, removes the background class,
 * and closes the dialog window.
 * 
 * @function closeAddTaskModal
 * @returns {void}
 */
function closeAddTaskModal() {
  const { modal, host } = getModalElements();
  if (!modal) return;
  if (host) host.innerHTML = "";
  modal.classList.remove("is_background");
  modal.close();
}

/**
 * Initializes the add task modal window once.
 * 
 * Checks that initialization hasn't been performed yet, then binds
 * event handlers for closing the modal (button and background click).
 * 
 * @function initAddTaskModalOnce
 * @returns {void}
 */
function initAddTaskModalOnce() {
  const { modal, closeBtn } = getModalElements();
  if (!modal || !closeBtn) return;

  if (modal.dataset.initOnce === "1") return;
  modal.dataset.initOnce = "1";

  closeBtn.addEventListener("click", closeAddTaskModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeAddTaskModal();
  });
}
