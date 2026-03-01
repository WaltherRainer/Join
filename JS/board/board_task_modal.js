/**
 * Binds Escape key handler to close task modal.
 *
 * @param {HTMLDialogElement} modal - The task modal dialog element.
 */
function bindTaskModalEscapeOnce(modal) {
  if (taskModalEscBound) return;
  taskModalEscBound = true;

  document.addEventListener("keydown", async (event) => {
    if (event.key !== "Escape") return;
    if (modal.open) {
      await closeTaskModal(modal, modal.dataset.taskId);
    }
  });
}

/**
 * Initializes modal close handlers.
 *
 * Sets up click handlers for close button and backdrop.
 *
 * @param {HTMLDialogElement} modal - The modal dialog element.
 */
function initModalCloseHandlers(modal) {
  modal.querySelector(".btn_close_modal")?.addEventListener("click", async () => {
    modal.querySelector("#EditTaskModalHost")?.replaceChildren();
    modal.querySelector("#task_dialog_content_wrapper")?.classList.remove("is-hidden");
    await closeTaskModal(modal, modal.dataset.taskId);
  });

  modal.addEventListener("click", async (e) => {
    if (e.target === modal) {
      modal.querySelector("#EditTaskModalHost")?.replaceChildren();
      modal.querySelector("#task_dialog_content_wrapper")?.classList.remove("is-hidden");
      await closeTaskModal(modal, modal.dataset.taskId);
    }
  });
}

/**
 * Initializes modal action handlers.
 *
 * Sets up edit and delete button handlers.
 *
 * @param {HTMLDialogElement} modal - The modal dialog element.
 */
function initModalActionHandlers(modal) {
  modal.querySelector("#btn_edit_task").addEventListener("click", () => {
    enterTaskEditMode(modal.__users || {});
  });

  modal.querySelector("#btn_delete_task").addEventListener("click", async () => {
    await deleteTask(modal.dataset.taskId);
  });
}

/**
 * Initializes subtask toggle handler.
 *
 * Sets up click delegation for subtask checkboxes.
 *
 * @param {HTMLDialogElement} modal - The modal dialog element.
 */
function initSubtaskToggleHandler(modal) {
  modal.addEventListener("click", (event) => {
    const button = event.target.closest('button[data-action="toggle"]');
    if (!button) return;

    const ul = button.closest("#subtasks_check_list");
    if (!ul) return;

    const li = button.closest("li[data-index]");
    if (!li) return;

    const index = Number(li.dataset.index);
    toggleSubtaskDone(index, modal.dataset.taskId);
  });
}

/**
 * Initializes all task modal event listeners.
 *
 * @param {HTMLDialogElement} modal - The modal dialog element.
 */
function initTaskModalEventList(modal) {
  if (modal.dataset.listenersBound === "true") return;
  modal.dataset.listenersBound = "true";
  initModalCloseHandlers(modal);
  initModalActionHandlers(modal);
  initSubtaskToggleHandler(modal);
}

/**
 * Toggles subtask completion status.
 *
 * Updates task data, sessionStorage, and UI.
 *
 * @param {number} index - Index of the subtask.
 * @param {string} taskId - ID of the parent task.
 */
function toggleSubtaskDone(index, taskId) {
  const tasks = loadTasksFromSession();
  const task = tasks[taskId];
  if (!task || !task.subTasks[index]) return;

  const done = !task.subTasks[index].done;
  task.subTasks[index].done = done;

  saveTasksToSessionStorage(tasks);
  dirtyTaskIds.add(taskId);

  const li = document.querySelector(`#subtasks_check_list li[data-index="${index}"]`);

  if (li) {
    li.classList.toggle("is-done", done);

    const btn = li.querySelector("button[data-action]");
    btn?.setAttribute("aria-pressed", String(done));
  }
}

/**
 * Closes task modal and saves dirty subtasks.
 *
 * @async
 * @param {HTMLDialogElement} modal - The modal dialog element.
 * @param {string} taskId - The task ID.
 */
async function closeTaskModal(modal, taskId) {
  const tasks = loadTasksFromSession();
  if (dirtyTaskIds.has(taskId)) {
    const task = tasks[taskId];
    if (task) {
      await saveTaskSubtasksToFirebase(taskId, task.subTasks);
      dirtyTaskIds.delete(taskId);
      updateTaskCard(taskId, tasks);
    }
  }
  modal.close?.();
}

/**
 * Saves task subtasks to Firebase.
 *
 * @async
 * @param {string} taskId - The task ID.
 * @param {Array} subTasks - Array of subtask objects.
 * @returns {Promise} Promise resolving when data is saved.
 */
async function saveTaskSubtasksToFirebase(taskId, subTasks) {
  return await patchData("tasks", taskId, { subTasks });
}

/**
 * Opens task modal and renders task details.
 *
 * @async
 * @param {string} taskId - The task ID.
 * @param {Object} users - Users data object.
 */
async function openTaskModal(taskId, users) {
  const tasks = JSON.parse(sessionStorage.getItem("tasks") || "{}");
  const modal = document.getElementById("show_task_modal");
  modal.__users = users;
  if (!modal) return;
  modal.dataset.taskId = String(taskId);
  modal.showModal();
  bindTaskModalEscapeOnce(modal);
  const ui = getTaskUi();
  renderTaskModal(taskId, ui, tasks, users);
  initTaskModalEventList(modal);
}

/**
 * Retrieves task modal UI element references.
 *
 * @returns {Object} Object with references to modal UI elements.
 */
function getTaskUi() {
  const titel = document.getElementById("tsk_dlg_h1");
  const descr = document.getElementById("tsk_dlg_h2");
  const dueDate = document.getElementById("tsk_dlg_due_date");
  const prio = document.getElementById("tsk_dlg_prio_div");
  const assignedTo = document.getElementById("tsk_dlg_assgnd_div");
  const subTaskDiv = document.getElementById("tsk_dlg_sbtsk");
  const SubTaskList = document.getElementById("subtasks_check_list");
  return {
    titel: titel,
    descr: descr,
    dueDate: dueDate,
    prio: prio,
    assignedTo: assignedTo,
    subTaskDiv: subTaskDiv,
    SubTaskList: SubTaskList,
  };
}

/**
 * Renders task details in modal.
 *
 * @param {string} taskId - The task ID.
 * @param {Object} ui - UI element references.
 * @param {Object} tasks - Tasks data object.
 * @param {Object} users - Users data object.
 */
function renderTaskModal(taskId, ui, tasks, users) {
  const id = String(taskId).trim();
  const task = tasks[id];

  if (!task) {
    console.warn("Task nicht gefunden:", id);
    return;
  }

  ui.titel.textContent = task.titel;
  ui.descr.textContent = task.description ?? "(without description)";
  ui.dueDate.textContent = task.finishDate;
  ui.prio.innerHTML = getTaskDialogPrioTempl(task.priority);
  ui.assignedTo.innerHTML = renderAssignedTo(task, users);
  ui.SubTaskList.innerHTML = renderSubtasksContent(task);
  renderIcons();
}

/**
 * Renders assigned users HTML for task modal.
 *
 * @param {Object} task - The task data.
 * @param {Object} users - Users data object.
 * @returns {string} HTML string for assigned users.
 */
function renderAssignedTo(task, users) {
  let assTo = "";
  if (!task || !Array.isArray(task.assignedTo) || task.assignedTo.length === 0) return assTo;

  task.assignedTo.forEach((element) => {
    const user = users?.[element];
    if (user) {
      const bgColor = colorIndexFromUserId(element);
      const userName = user.givenName || user.name || "";
      const initials = initialsFromGivenName(userName);
      assTo += getAssignedToTempl(initials, userName, bgColor);
    }
  });
  return assTo;
}

/**
 * Renders subtasks HTML for task modal.
 *
 * @param {Object} task - The task data.
 * @returns {string} HTML string for subtasks.
 */
function renderSubtasksContent(task) {
  let subTaskCont = "";
  let index = 0;
  if (task.subTasks && typeof task.subTasks === "object" && task.subTasks.length > 0) {
    task.subTasks.forEach((element) => {
      let subTaskTitel = element.title;
      let done = element.done;
      subTaskCont += getTaskDialSubtaskTempl(subTaskTitel, done, index);
      index++;
    });
  }
  return subTaskCont;
}
