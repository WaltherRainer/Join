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
    await deleteData(`tasks/${id}`);
    const tasks = loadTasksFromSession();
    delete tasks[id];
    saveTasksToSessionStorage(tasks);
    dirtyTaskIds?.delete?.(id);
    modal?.close?.();
    if (users) {
      loadTaskBoard(tasks, users);
    } else {
      console.warn("deleteTask: users missing on modal -> board not rerendered");
    }
  } catch (err) {
    console.error("deleteTask failed", err);
    alert("Löschen fehlgeschlagen. Details in der Konsole.");
  }
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
  exitEditMode();
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
 * Hydrates form with existing task values.
 *
 * Restores assigned users and selection state from task data.
 *
 * @param {HTMLFormElement} form - The form element.
 * @param {Object} task - The task data.
 * @param {Object} users - Users data object.
 */
function hydrateEditFormValues(form, task, users) {
  const hidden = form.querySelector("#assigned_to_input");
  if (hidden && hidden.value) {
    try {
      const ids = JSON.parse(hidden.value);
      const ui = getAssignedToUi(form);
      const state = ui.root?._assignedState;
      if (state && Array.isArray(ids)) {
        ids.forEach(id => state.selected.add(id));
        renderUserList(state);
        applySelectionUi(state.ui, ids.map(id => users[id]?.givenName).filter(Boolean), state.selected, users);
      }
    } catch (e) {
      console.warn("hydrateEditFormValues: failed to parse assignedTo preset", e);
    }
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
 * Sets up UI for edit mode.
 *
 * Adds edit mode classes and modifies button labels/visibility.
 *
 * @param {HTMLFormElement} form - The form element.
 * @param {HTMLDialogElement} modal - The modal dialog element.
 */
function setupEditModeUI(form, modal) {
  form.classList.add("edit_mode");
  renderIcons(modal);
  installEditDirtyTracking(form);

  const cancelBtn = form.querySelector("#clear_task_form_btn");
  cancelBtn?.classList.add("is-hidden");

  const submitBtn = form.querySelector("#submit_task_form_btn");
  submitBtn.querySelector(".btn_label").textContent = "OK";

  const actionBtn = form.querySelector(".form_actions");
  actionBtn?.classList.add("edit_mode");

  const addTaskFormRight = form.querySelector(".add_task_form_right");
  addTaskFormRight?.classList.add("edit_mode");

  const addTaskFormLeft = form.querySelector(".add_task_form_left");
  addTaskFormLeft?.classList.add("edit_mode");
}

/**
 * Exits edit mode and restores original view.
 */
function exitEditMode() {
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

/**
 * Retrieves DOM elements for task category UI.
 *
 * @param {HTMLFormElement} form - The form element.
 * @returns {Object|null} Object with root, taskCat, valueEl, placeholder elements, or null if not found.
 */
function getTaskCategoryElements(form) {
  const root = form.querySelector("#task_cat_select");
  if (!root) return null;

  const taskCat = form.querySelector("#task_cat");
  const valueEl = root.querySelector(".single_select__value");
  const placeholder = root.querySelector(".single_select__placeholder");

  if (!taskCat || !valueEl || !placeholder) return null;

  return { taskCat, valueEl, placeholder };
}

/**
 * Hides the category value and shows placeholder.
 *
 * @param {HTMLElement} valueEl - The value element.
 * @param {HTMLElement} placeholder - The placeholder element.
 */
function hideTaskCategory(valueEl, placeholder) {
  valueEl.textContent = "";
  valueEl.hidden = true;
  placeholder.hidden = false;
}

/**
 * Displays the selected category label.
 *
 * @param {string} value - The category value.
 * @param {HTMLElement} valueEl - The value element.
 * @param {HTMLElement} placeholder - The placeholder element.
 */
function renderTaskCategory(value, valueEl, placeholder) {
  const cat = (Array.isArray(TASK_CATEGORIES) ? TASK_CATEGORIES : [])
    .find(c => c.value === value);

  valueEl.textContent = cat?.label || value;
  valueEl.hidden = false;
  placeholder.hidden = true;
}

/**
 * Synchronizes the task category UI with form data.
 *
 * Updates visibility and display of selected category or placeholder.
 *
 * @param {HTMLFormElement} form - The form element.
 */
function syncTaskCatUI(form) {
  if (!form) return;

  const els = getTaskCategoryElements(form);
  if (!els) return;

  const val = String(els.taskCat.value || "").trim();
  
  if (!val) {
    hideTaskCategory(els.valueEl, els.placeholder);
  } else {
    renderTaskCategory(val, els.valueEl, els.placeholder);
  }
}

/**
 * Retrieves UI elements for assigned users.
 *
 * @param {HTMLFormElement} form - The form element.
 * @returns {Object} Object with placeholder, valueBox, avatarContainer elements.
 */
function getAssignedToUIElements(form) {
  const placeholder = form.querySelector("#assigned_to_placeholder");
  const valueBox = form.querySelector("#assigned_to_value");
  const avatarContainer = form.querySelector("#assigned_avatar_container");
  return { placeholder, valueBox, avatarContainer };
}

/**
 * Renders empty state for assigned users.
 *
 * @param {HTMLElement} valueBox - The value display element.
 * @param {HTMLElement} placeholder - The placeholder element.
 */
function renderEmptyAssignedState(valueBox, placeholder) {
  placeholder.assignedToInput = false;
  valueBox.assignedToInput = true;
  valueBox.textContent = "";
}

/**
 * Renders populated state for assigned users.
 *
 * Displays user names and avatars.
 *
 * @param {Array<string>} ids - Array of user IDs.
 * @param {HTMLElement} valueBox - The value display element.
 * @param {HTMLElement} placeholder - The placeholder element.
 * @param {Object} usersObj - Users data object.
 * @param {HTMLElement} avatarContainer - Container for avatars.
 */
function renderPopulatedAssignedState(ids, valueBox, placeholder, usersObj, avatarContainer) {
  const names = ids
    .map((id) => usersObj?.[id]?.givenName)
    .filter(Boolean);

  placeholder.classList.add("is-hidden");
  valueBox.assignedToInput = false;
  valueBox.textContent = names.length ? names.join(", ") : `${ids.length} selected`;
  renderAssignedAvatars(ids, usersObj, avatarContainer);
}

/**
 * Synchronizes assigned users UI with form data.
 *
 * @param {HTMLFormElement} form - The form element.
 * @param {Object} usersObj - Users data object.
 */
function syncAssignedToUI(form, usersObj) {
  const assignedToInput = form.elements.assigned_to_input;
  const ids = safeParseArray(assignedToInput?.value);
  const ui = getAssignedToUIElements(form);

  if (!ui.placeholder || !ui.valueBox) return;

  if (!ids.length) {
    renderEmptyAssignedState(ui.valueBox, ui.placeholder);
    return;
  }

  renderPopulatedAssignedState(ids, ui.valueBox, ui.placeholder, usersObj, ui.avatarContainer);
}

/**
 * Synchronizes subtasks UI with form data.
 *
 * @param {HTMLFormElement} form - The form element.
 */
function syncSubtasksUI(form) {
  const subTask = form.elements.subtasks_json;
  const list = form.querySelector("#subtasks_list");
  if (!subTask || !list) return;

  const subTasks = safeParseArray(subTask.value);
  list.innerHTML = "";

  subTasks.forEach((st, idx) => {
    const li = document.createElement("li");
    li.textContent = st?.title ?? st?.name ?? `Subtask ${idx + 1}`;
    list.appendChild(li);
  });
}
