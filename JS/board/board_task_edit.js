/**
 * Deletes a task from storage and server.
 *
 * Removes task from sessionStorage, Firebase, and refreshes the board.
 *
 * @async
 * @param {string} taskId - ID of the task to delete.
 */
async function deleteTask(taskId) {
  const id = String(taskId || "").trim();
  if (!id) return;
  const modal = document.getElementById("show_task_modal");
  const users = modal?.__users;
  try {
    const tasks = await deleteTaskAndSyncLocalState(id);
    closeTaskModal(modal);
    rerenderBoardAfterDelete(tasks, users);
  } catch (err) {
    handleDeleteTaskError(err);
  }
}

/**
 * Deletes a task on the server and synchronizes local session state.
 *
 * @async
 * @param {string} id - ID of the task to delete.
 * @returns {Promise<Object>} Updated tasks object after deletion.
 */
async function deleteTaskAndSyncLocalState(id) {
  await deleteData(`tasks/${id}`);
  const tasks = loadTasksFromSession();
  delete tasks[id];
  saveTasksToSessionStorage(tasks);
  dirtyTaskIds?.delete?.(id);
  return tasks;
}

/**
 * Closes the task details modal if available.
 *
 * @param {HTMLDialogElement|null} modal - Task details modal element.
 * @returns {void}
 */
function closeTaskModal(modal) {
  modal?.close?.();
}

/**
 * Re-renders the board after a task was deleted.
 *
 * @param {Object} tasks - Updated tasks object.
 * @param {Object|undefined} users - Users data object.
 * @returns {void}
 */
function rerenderBoardAfterDelete(tasks, users) {
  if (users) {
    loadTaskBoard(tasks, users);
    return;
  }
  console.warn("deleteTask: users missing on modal -> board not rerendered");
}

/**
 * Handles delete-task errors consistently.
 *
 * @param {unknown} err - Thrown error value.
 * @returns {void}
 */
function handleDeleteTaskError(err) {
  console.error("deleteTask failed", err);
  alert("Löschen fehlgeschlagen. Details in der Konsole.");
}

/**
 * Enters edit mode for a task.
 *
 * Prepares DOM, creates edit form, and initializes all edit controls.
 *
 * @async
 * @param {Object} users - Users data object.
 */
async function enterTaskEditMode(users) {
  const { modal, host, wrapper, task, taskId } = getEditModeContext();
  if (!modal || !host || !wrapper || !task) return;
  prepareEditModeDOM(wrapper, host);
  const form = await createEditTaskForm(host, task, taskId, users);
  initializeEditFormControls(form, users);
  hydrateEditFormValues(form, task, users);
  syncEditFormDisplay(form, users);
  setupEditModeUI(form, modal);
  form.querySelector("#task_titel")?.focus();
}

/**
 * Retrieves context needed for edit mode.
 *
 * @returns {Object} Object with modal, host, wrapper, task, taskId properties.
 */
function getEditModeContext() {
  const modal = document.getElementById("show_task_modal");
  const host = document.getElementById("EditTaskModalHost");
  const wrapper = document.getElementById("task_dialog_content_wrapper");
  const taskId = String(modal?.dataset.taskId || "");
  const tasks = loadTasksFromSession();
  const task = tasks[taskId];
  return { modal, host, wrapper, task, taskId };
}

/**
 * Prepares DOM for edit mode.
 *
 * Hides content wrapper and clears host element.
 *
 * @param {HTMLElement} wrapper - The content wrapper element.
 * @param {HTMLElement} host - The edit form host element.
 */
function prepareEditModeDOM(wrapper, host) {
  wrapper.classList.add("is-hidden");
  host.innerHTML = "";
}

/**
 * Handles the submission of an edited task form.
 *
 * Validates dirty flag, builds patch from form data, persists changes locally
 * and to the server, then refreshes the UI.
 *
 * @async
 * @param {Object} data - Form data from submission.
 * @param {HTMLFormElement} formEl - The form element being submitted.
 * @param {Object} tasks - Tasks data object.
 * @param {string} taskId - ID of the task being edited.
 * @param {Object} users - Users data object.
 */
async function handleEditTaskFormSubmit(data, formEl, tasks, taskId, users) {
  if (formEl.dataset.editDirty !== "1") return;
  const patch = buildTaskPatchFromFormData(data);
  tasks[taskId] = { ...tasks[taskId], ...patch };
  saveTasksToSessionStorage(tasks);
  await patchData("tasks", taskId, patch);
  exitTaskEditMode();
  const ui = getTaskUi();
  renderTaskModal(taskId, ui, tasks, users);
  loadTaskBoard(tasks, users);
}

/**
 * Creates and mounts the edit task form.
 *
 * @async
 * @param {HTMLElement} host - The host element for the form.
 * @param {Object} task - The task data.
 * @param {string} taskId - The task ID.
 * @param {Object} users - Users data object.
 * @returns {Promise<HTMLFormElement>} The created form element.
 */
async function createEditTaskForm(host, task, taskId, users) {
  const tasks = loadTasksFromSession();
  const form = await mountTaskForm(host, {
    title: "Task bearbeiten",
    preset: task,
    onSubmitData: (data, formEl) => handleEditTaskFormSubmit(data, formEl, tasks, taskId, users),
  });
  return form;
}

/**
 * Initializes form controls for edit mode.
 *
 * Sets up dropdowns and input handlers.
 *
 * @param {HTMLFormElement} form - The form element.
 * @param {Object} users - Users data object.
 */
function initializeEditFormControls(form, users) {
  initAssignedToDropdown(form, users);
  initTaskTypeDropdown(form, TASK_CATEGORIES);
  initSubtasksInput(form);
}

/**
 * Hydrates edit-form UI state from hidden preset values (e.g. assigned users).
 *
 * Reads the JSON payload from `#assigned_to_input` and delegates parsing + UI
 * application to {@link hydrateAssignedToFromHidden}.
 *
 * @function hydrateEditFormValues
 * @param {HTMLFormElement} form - The task edit form to hydrate.
 * @param {Object} task - Task data (unused here but kept for API compatibility).
 * @param {Object<string, Object>} users - Map of userId -> user data.
 * @returns {void}
 */
function hydrateEditFormValues(form, task, users) {
  const hidden = form.querySelector("#assigned_to_input");
  if (!hidden?.value) return;
  hydrateAssignedToFromHidden(form, hidden.value, users);
}

/**
 * Applies assigned-to preset IDs to the assigned-to dropdown state and UI.
 *
 * Parses the provided JSON string, updates the internal selected set, and
 * re-renders the list and selection UI. Logs a warning if parsing fails.
 *
 * @function hydrateAssignedToFromHidden
 * @param {HTMLElement} form - Form element hosting the assigned-to UI.
 * @param {string} jsonValue - JSON string containing an array of user IDs.
 * @param {Object<string, Object>} users - Map of userId -> user data.
 * @returns {void}
 */
function hydrateAssignedToFromHidden(form, jsonValue, users) {
  try {
    const ids = JSON.parse(jsonValue);
    const ui = getAssignedToUi(form);
    const state = ui.root?._assignedState;
    if (!state || !Array.isArray(ids)) return;
    ids.forEach((id) => state.selected.add(id));
    renderUserList(state);
    const names = ids.map((id) => users?.[id]?.givenName).filter(Boolean);
    applySelectionUi(state.ui, names, state.selected, users);
  } catch (e) {
    console.warn("hydrateEditFormValues: failed to parse assignedTo preset", e);
  }
}

/**
 * Synchronizes edit form display elements.
 *
 * Updates category and assigned users UI.
 *
 * @param {HTMLFormElement} form - The form element.
 * @param {Object} users - Users data object.
 */
function syncEditFormDisplay(form, users) {
  syncTaskCatUI(form);
  syncAssignedToUI(form, users);
}

/**
 * Applies base edit-mode setup on form and modal.
 *
 * @param {HTMLFormElement} form - The form element.
 * @param {HTMLDialogElement} modal - The modal dialog element.
 * @returns {void}
 */
function applyEditModeBase(form, modal) {
  form.classList.add("edit_mode");
  renderIcons(modal);
  installEditDirtyTracking(form);
}

/**
 * Hides the cancel button in edit mode.
 *
 * @param {HTMLFormElement} form - The form element.
 * @returns {void}
 */
function hideEditModeCancelButton(form) {
  const cancelBtn = form.querySelector("#clear_task_form_btn");
  cancelBtn?.classList.add("is-hidden");
}

/**
 * Sets the submit button label for edit mode.
 *
 * @param {HTMLFormElement} form - The form element.
 * @returns {void}
 */
function applyEditModeSubmitLabel(form) {
  setSubmitLabel(form, "OK");
}

/**
 * Adds edit mode class to form layout sections.
 *
 * @param {HTMLFormElement} form - The form element.
 * @returns {void}
 */
function applyEditModeLayoutClasses(form) {
  [".form_actions", ".add_task_form_right", ".add_task_form_left", ".add_task_form_wrapper"].forEach((selector) => {
    form.querySelector(selector)?.classList.add("edit_mode");
  });
}

/**
 * Sets up UI for edit mode.
 *
 * Adds edit mode classes and modifies button labels/visibility.
 *
 * @param {HTMLFormElement} form - The form element.
 * @param {HTMLDialogElement} modal - The modal dialog element.
 */
function setupEditModeUI(form, modal) {
  applyEditModeBase(form, modal);
  hideEditModeCancelButton(form);
  applyEditModeSubmitLabel(form);
  applyEditModeLayoutClasses(form);
}

/**
 * Exits edit mode and restores original view.
 */
function exitTaskEditMode() {
  document.getElementById("EditTaskModalHost").innerHTML = "";
  document.getElementById("task_dialog_content_wrapper").classList.remove("is-hidden");
}

/**
 * Sets the label text of the submit button.
 *
 * @param {HTMLFormElement} form - The form element.
 * @param {string} label - The new label text.
 */
function setSubmitLabel(form, label) {
  const btn = form.querySelector("#submit_task_form_btn");
  const span = btn?.querySelector(".btn_label");
  if (span) span.textContent = label;
}

/**
 * Enables or disables the submit button.
 *
 * @param {HTMLFormElement} form - The form element.
 * @param {boolean} enabled - Whether to enable the button.
 */
function setSubmitEnabled(form, enabled) {
  const btn = form.querySelector("#submit_task_form_btn");
  if (!btn) return;
  btn.disabled = !enabled;
  btn.classList.toggle("is-disabled", !enabled);
}

/**
 * Marks the edit form as dirty (changed).
 *
 * @param {HTMLFormElement} form - The form element.
 */
function markEditFormDirty(form) {
  if (!form || form.dataset.editDirty === "1") return;
  form.dataset.editDirty = "1";
  setSubmitEnabled(form, true);
}

/**
 * Installs dirty tracking on edit form.
 *
 * Monitors form input/change events to detect modifications.
 *
 * @param {HTMLFormElement} form - The form element.
 */
function installEditDirtyTracking(form) {
  form.dataset.editDirty = "0";
  setSubmitLabel(form, "OK");
  setSubmitEnabled(form, false);
  const mark = () => markEditFormDirty(form);
  form.addEventListener("input", mark, true);
  form.addEventListener("change", mark, true);
  form._markDirty = mark;
}
