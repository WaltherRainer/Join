const TASK_CATEGORIES = [
  { value: 'technical_task', label: 'Technical Task' },
  { value: 'user_story', label: 'User Story' }
];


/**
 * Gets the label and color for a task category.
 * 
 * @function getTaskCatLabel
 * @param {string} value - Category value (technical_task, user_story).
 * @returns {Object} Object with label and color properties.
 */
function getTaskCatLabel(value) {
  let taskObj = {};
  
  switch (value) {
    case "technical_task":
      taskObj = {"label" : "Technical Task", "color" : "#0038FF"};
      break;
    case "user_story":
      taskObj = {"label" : "User Story", "color" : "#1FD7C1"};
      break;
    default:
      taskObj = {"label" : "Task", "color" : "#0038FF"};
      break;
  }

  return taskObj;
}

/**
 * Truncates a description if it exceeds maximum length.
 * 
 * @function checkOverflow
 * @param {string} description - Description text to check.
 * @returns {string} Truncated description with "..." or original string.
 */
function checkOverflow(description) {
  if (!description || description == "") return "";
  if (typeof description !== "string") return "";
  const maxLength = 50;
  if (description.length > maxLength) {
    return description.substring(0, maxLength) + "...";
  }
  return description;
}

/**
 * Generates subtasks counter display.
 * 
 * @function subtasksCounter
 * @param {Object} task - Task object with subTasks array.
 * @returns {string} HTML template string or empty string.
 */
function subtasksCounter(task) {
  const subtaskcount = countSubtasksDone(task);
  if (subtaskcount.counter === 0) return "";
  return getSubtasksCountAndTotalTemplate(subtaskcount.done, subtaskcount.counter);
}

/**
 * Counts completed and total subtasks.
 * 
 * @function countSubtasksDone
 * @param {Object} task - Task object with subTasks array.
 * @returns {Object} Object with done and counter properties.
 */
function countSubtasksDone(task) {
  let returnObj = {"done" : 0, "counter" : 0};
  let counter = 0;
  let done = 0;
  let Obj = task.subTasks;
  if (!Obj) return returnObj;
  Obj.forEach((subTask) => {
    counter++;
    if (subTask.done === true) {
      done++;
    }
  })
  returnObj = {"done" : done, "counter" : counter}
  return returnObj;
}

/**
 * Calculates progress bar percentage for subtasks.
 * 
 * @function fillSubTasksBar
 * @param {Object} task - Task object with subTasks array.
 * @returns {number} Percentage value for progress bar (0-40).
 */
function fillSubTasksBar(task) {
  const subtaskcount = countSubtasksDone(task);
  const total = subtaskcount.counter;
  const done = subtaskcount.done;
  let percentage = 0;
  if (total > 0) {
    percentage = (done / total) * 40;
  }
  return percentage;
}

/**
 * Updates task card HTML in the DOM.
 * 
 * @function updateTaskCard
 * @param {string} taskId - Task ID to update.
 * @param {Object} tasks - Object containing all tasks.
 * @returns {void}
 */
function updateTaskCard(taskId, tasks) {
  const users = loadUsersFromSession();
  const task = tasks[taskId];
  if (!task) return;
  const cards = document.querySelectorAll(
    `.t_task[data-task-id="${taskId}"]`
  );
  cards.forEach(function(card) {
    const selectEl = card.querySelector(".task_status_select");
    const selectHtml = selectEl ? selectEl.outerHTML : "";
    const wasDraggable = card.hasAttribute("draggable");
    card.innerHTML = (wasDraggable ? "" : selectHtml) + getTaskItemContent(task, users);
    if (window.renderIcons) {
      renderIcons(card);
    }
  });
}

/**
 * Initializes the assigned users dropdown.
 * 
 * @function initAssignedToDropdown
 * @param {HTMLFormElement} form - Form element containing the dropdown.
 * @param {Object} usersData - Object with user data keyed by user ID.
 * @returns {void}
 */
function initAssignedToDropdown(form, usersData) {
  const ui = getAssignedToUi(form);
  if (!ui.root || isInitialized(ui.root)) return;
  if (!usersData || typeof usersData !== "object") return;

  const state = { form, usersData, selected: new Set(), ui };
  ui.root._assignedState = state;

  wireDropdownEvents(state);
  wireFilterEvents(state);
  renderUserList(state);
}

/**
 * Initializes all task form controls.
 * 
 * @function initTaskFormControls
 * @param {HTMLFormElement} form - Form element to initialize.
 * @param {Object} usersData - Object with user data.
 * @returns {void}
 */
function initTaskFormControls(form, usersData) {
  initAssignedToDropdown(form, usersData);
  resetAssignedToDropdown(form);
  initTaskTypeDropdown(form, TASK_CATEGORIES);
  initSubtasksInput(form);
}

/**
 * Sets up event handlers for the task modal.
 * 
 * @function setupModalEventHandlers
 * @param {HTMLElement} modal - Modal dialog element.
 * @returns {void}
 */
function setupModalEventHandlers(modal) {
  renderIcons(modal);
  modal.showModal();

  const removeEsc = listenEscapeFromModal("addTaskModal", async () => {
    closeAddTaskModal();
  });
  modal.addEventListener("close", removeEsc, { once: true });
}

/**
 * Opens the add task modal window.
 * 
 * @async
 * @function openAddTaskModal
 * @param {number} [taskStatus=0] - Initial status for the new task.
 * @returns {Promise<void>}
 */
async function openAddTaskModal(taskStatus = 0) {
  const modalHost = document.getElementById("addTaskModalHost");
  const modal = document.getElementById("addTaskModal");
  if (!modal || !modalHost) return;

  const usersDataObj = await ensureUsersLoaded();

  const form = await mountTaskForm(modalHost, {
    title: "Add Task",
    preset: { titel: "", description: "", priority: "medium" },
    mode: "modal",
    toastId: "task_modal_success_overlay",
    taskStatus: taskStatus,
    afterSaved: afterTaskAddedInModal, 
  });

  initTaskFormControls(form, usersDataObj);
  setupModalEventHandlers(modal);
}

/**
 * Checks if an element is already initialized.
 * 
 * @function isInitialized
 * @param {HTMLElement} root - Root element to check.
 * @returns {boolean} true if already initialized, false otherwise.
 */
function isInitialized(root) {
  if (root.dataset.initialized === "1") return true;
  root.dataset.initialized = "1";
  return false;
}

/**
 * Gets UI element references for assigned users dropdown.
 * 
 * @function getAssignedToUi
 * @param {HTMLFormElement} form - Form containing the dropdown.
 * @returns {Object} Object with UI element references.
 */
function getAssignedToUi(form) {
  const root = form.querySelector("#assigned_to");
  if (!root) return { root: null };

  const toggleBtn = root.querySelector("#assigned_to_toggle");
  const control = root.querySelector(".multi_select__control");
  const dropdown = root.querySelector("#assigned_to_dropdown");
  const list = root.querySelector("#assigned_to_list");
  const caret = toggleBtn?.querySelector(".caret");

  return buildAssignedToUiObject(root, control, toggleBtn, dropdown, list, caret, form);
}

/**
 * Builds the complete UI object for assigned users dropdown.
 * 
 * @function buildAssignedToUiObject
 * @param {HTMLElement} root - Root element.
 * @param {HTMLElement} control - Control element.
 * @param {HTMLElement} toggleBtn - Toggle button element.
 * @param {HTMLElement} dropdown - Dropdown element.
 * @param {HTMLElement} list - List element.
 * @param {HTMLElement} caret - Caret icon element.
 * @param {HTMLFormElement} form - Parent form element.
 * @returns {Object} Complete UI object with all element references.
 */
function buildAssignedToUiObject(root, control, toggleBtn, dropdown, list, caret, form) {
  const assignedToPlaceholder = root.querySelector("#assigned_to_placeholder");
  const valueEl = root.querySelector("#assigned_to_value");
  const assignedToInput = root.querySelector("#assigned_to_input");
  const assignedToassignedToFilterInput = root.querySelector("#assigned_to_filter");
  const avatarContainer = form.querySelector("#assigned_avatar_container");

  return { root, control, toggleBtn, dropdown, list, caret, assignedToPlaceholder, 
    valueEl, assignedToInput, assignedToassignedToFilterInput, avatarContainer };
}


/**
 * Wires filter input event handlers.
 * 
 * @function wireFilterEvents
 * @param {Object} state - State object with UI and data.
 * @returns {void}
 */
function wireFilterEvents(state) {
  const { ui } = state;
  if (!ui.assignedToassignedToFilterInput) return;
  ui.assignedToassignedToFilterInput.addEventListener("input", (e) => {
    state.query = e.target.value || "";
    renderUserList(state);
  });
  ui.assignedToassignedToFilterInput.addEventListener("click", (e) => {
    e.stopPropagation();
  });
  ui.assignedToassignedToFilterInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeDropdown(ui);
      ui.assignedToassignedToFilterInput.blur();
    }
  });
}

/**
 * Resets the assigned users dropdown to initial state.
 * 
 * @function resetAssignedToDropdown
 * @param {HTMLFormElement} form - Form containing the dropdown.
 * @returns {void}
 */
function resetAssignedToDropdown(form) {
  const ui = getAssignedToUi(form);
  if (!ui.root) return;

  const state = ui.root._assignedState;

  if (state) {
    state.selected.clear();

    state.ui.list?.querySelectorAll(".is-selected").forEach(li => li.classList.remove("is-selected"));

    applySelectionUi(state.ui, [], state.selected, state.usersData);
    renderAssignedAvatars(state.selected, state.usersData, state.ui.avatarContainer);
    return;
  }
  if (ui.avatarContainer) ui.avatarContainer.innerHTML = "";
}

/**
 * Renders the user list in the dropdown.
 * 
 * @function renderUserList
 * @param {Object} state - State object with users data and UI.
 * @returns {void}
 */
function renderUserList(state) {
  const { list } = state.ui;
  list.innerHTML = "";
  const q = (state.query || "").trim().toLowerCase();
  for (const [userId, userObj] of Object.entries(state.usersData)) {
    const nameRaw = userObj?.givenName ?? "";
    const name = nameRaw.toLowerCase();
    if (q && !name.includes(q)) continue;
    const li = createUserListItem(state, userId, userObj);
    if (state.selected.has(userId)) li.classList.add("is-selected");
    list.appendChild(li);
  }
}

/**
 * Creates a list item element for a user.
 * 
 * @function createUserListItem
 * @param {Object} state - State object.
 * @param {string} userId - User ID.
 * @param {Object} userObj - User data object.
 * @returns {HTMLElement} List item element.
 */
function createUserListItem(state, userId, userObj) {
  const nameRaw = userObj?.givenName ?? "(no name)";
  const name = escapeHtml(nameRaw);
  const initials = escapeHtml(initialsFromGivenName(nameRaw));
  const bgColor = colorVarFromUserId(userId);
  const li = document.createElement("li");
  li.className = "multi_select__item";
  li.setAttribute("role", "option");
  li.dataset.userid = userId;
  li.innerHTML = userListItemTemplate({ bgColor, initials, name });
  li.addEventListener("click", () => onUserToggle(state, li, userId));
  return li;
}

/**
 * Handles user selection toggle.
 * 
 * @function onUserToggle
 * @param {Object} state - State object.
 * @param {HTMLElement} li - List item element.
 * @param {string} userId - User ID.
 * @returns {void}
 */
function onUserToggle(state, li, userId) {
  const isSelected = li.classList.toggle("is-selected");
  updateSelection(state, userId, isSelected);
}

/**
 * Updates selection state and UI.
 * 
 * @function updateSelection
 * @param {Object} state - State object.
 * @param {string} userId - User ID.
 * @param {boolean} isChecked - Whether user is selected.
 * @returns {void}
 */
function updateSelection(state, userId, isChecked) {
  const { selected, usersData, ui } = state;
  isChecked ? selected.add(userId) : selected.delete(userId);
  const names = [...selected]
  .map(id => usersData[id]?.givenName)
  .filter(Boolean);
  applySelectionUi(ui, names, selected, state.usersData);
  renderAssignedAvatars(selected, usersData, ui.avatarContainer);
  state.form?._markDirty?.();
}

/**
 * Applies selection changes to the UI.
 * 
 * @function applySelectionUi
 * @param {Object} ui - UI elements object.
 * @param {Array<string>} names - Array of selected user names.
 * @param {Set} selected - Set of selected user IDs.
 * @param {Object} usersData - User data object.
 * @returns {void}
 */
function applySelectionUi(ui, names, selected, usersData) {
  if (names.length === 0) {
    ui.assignedToPlaceholder.hidden = false;
    ui.valueEl.hidden = true;
    ui.valueEl.textContent = "";
    ui.assignedToInput.value = "";
    renderAssignedAvatars(selected, usersData, ui.avatarContainer);
    return;
  }
  ui.assignedToPlaceholder.hidden = true;
  ui.valueEl.hidden = true;
  ui.valueEl.textContent = "";
  ui.assignedToInput.value = JSON.stringify([...selected]);
  renderAssignedAvatars(selected, usersData, ui.avatarContainer);
}