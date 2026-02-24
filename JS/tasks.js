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

/**
 * Clears all input fields of the add task form.
 * 
 * Resets the values of fields: title, description, date, category,
 * subtasks, and JSON subtask lists.
 * 
 * @function clearFormInputFields
 * @param {HTMLFormElement} form - Form to clear.
 * @returns {void}
 */
function clearFormInputFields(form) {
  const setVal = (sel, v) => {
    const el = form.querySelector(sel);
    if (el) el.value = v;
  };

  setVal("#task_titel", "");
  setVal("#task_descr", "");
  setVal("#task_due_date", "");
  setVal("#task_cat", "");
  setVal("#input_subtasks", "");
  setVal("#subtasks_list_input", "[]");
  setVal("#subtasks_json", "[]");
}

/**
 * Clears UI elements of the add task form.
 * 
 * Clears the subtask list and assigned users avatar container.
 * 
 * @function clearFormUIElements
 * @param {HTMLFormElement} form - Form to clear.
 * @returns {void}
 */
function clearFormUIElements(form) {
  const list = form.querySelector("#subtasks_list");
  if (list) list.innerHTML = "";

  const avatarContainer = form.querySelector("#assigned_avatar_container");
  if (avatarContainer) avatarContainer.innerHTML = "";
}

/**
 * Resets the state of the add task form.
 * 
 * Resets priority buttons, assignment dropdown,
 * category UI, and removes all error messages.
 * 
 * @function resetFormState
 * @param {HTMLFormElement} form - Form to reset.
 * @returns {void}
 */
function resetFormState(form) {
  resetPriorityButtons(form);
  resetAssignedToDropdown(form);
  resetTaskCatDropdownUi(form);
  removeAllInputErrors(form);
}

/**
 * Completely clears the add task form.
 * 
 * Calls sequentially the functions for clearing fields, UI elements,
 * and resetting state.
 * 
 * @function clearTaskForm
 * @param {HTMLFormElement} form - Form to clear.
 * @returns {void}
 */
function clearTaskForm(form) {
  if (!form) return;
  clearFormInputFields(form);
  clearFormUIElements(form);
  resetFormState(form);
}

/**
 * Clears the editable subtask input field.
 * 
 * Finds the input field in edit mode, clears it,
 * and sets focus on it.
 * 
 * @function clearEditInput
 * @param {Object} state - State object with UI elements.
 * @returns {void}
 */
function clearEditInput(state) {
  const el = state.ui.listEl.querySelector("li.is-editing input.subtask_edit");
  if (el) el.value = "";
  if (el) el.focus();
}

/**
 * Validates the task title field.
 * 
 * Checks the field using checkValidity(), sets
 * corresponding error classes.
 * 
 * @function validateTitleField
 * @param {HTMLFormElement} form - Form with field to validate.
 * @returns {boolean} true if the field is valid.
 */
function validateTitleField(form) {
  const title = form.querySelector("#task_titel");
  if (!title?.checkValidity()) {
    setInputInValid(title, title);
    return false;
  }
  setInputValid(title, title);
  return true;
}

/**
 * Validates the task due date field.
 * 
 * Checks the field using checkValidity(), sets
 * corresponding error classes.
 * 
 * @function validateDueDateField
 * @param {HTMLFormElement} form - Form with field to validate.
 * @returns {boolean} true if the field is valid.
 */
function validateDueDateField(form) {
  const due = form.querySelector("#task_due_date");
  if (!due?.checkValidity()) {
    setInputInValid(due, due);
    return false;
  }
  setInputValid(due, due);
  return true;
}

/**
 * Validates the task category field.
 * 
 * Checks that a category is selected, sets
 * corresponding error classes on control elements.
 * 
 * @function validateCategoryField
 * @param {HTMLFormElement} form - Form with field to validate.
 * @returns {boolean} true if a category is selected.
 */
function validateCategoryField(form) {
  const taskCat = form.querySelector("#task_cat");
  const taskCatDiv = form.querySelector("#task_cat_control");
  const taskCatOuterDiv = form.querySelector("#task_cat_select");

  if (!taskCat?.value) {
    setInputInValid(taskCatDiv, taskCatOuterDiv);
    return false;
  }
  setInputValid(taskCatDiv, taskCatOuterDiv);
  return true;
}

/**
 * Sets focus on the first invalid field of the form.
 * 
 * Finds the first element with the is-invalid class and sets focus on it.
 * For category, focuses the button instead of the hidden field.
 * 
 * @function focusFirstInvalidField
 * @param {HTMLFormElement} form - Form with invalid fields.
 * @returns {void}
 */
function focusFirstInvalidField(form) {
  const firstInvalid = form.querySelector(".is-invalid");
  if (firstInvalid?.id === "task_cat_control") {
    form.querySelector("#task_cat_btn")?.focus();
  } else {
    firstInvalid?.focus?.();
  }
}

/**
 * Validates the entire add task form.
 * 
 * Calls validations for each required field (title, date, category)
 * and sets focus on the first invalid field if there are errors.
 * 
 * @function validateAddTaskForm
 * @param {HTMLFormElement} form - Form to validate.
 * @returns {boolean} true if all fields are valid.
 */
function validateAddTaskForm(form) {
  const isTitleValid = validateTitleField(form);
  const isDueDateValid = validateDueDateField(form);
  const isCategoryValid = validateCategoryField(form);

  const isFormValid = isTitleValid && isDueDateValid && isCategoryValid;

  if (!isFormValid) {
    focusFirstInvalidField(form);
  }

  return isFormValid;
}

/**
 * Creates an object to update a task from form data.
 * 
 * Extracts the necessary fields for updating an existing task.
 * 
 * @function buildTaskPatchFromFormData
 * @param {Object} data - Object with data from the form.
 * @returns {Object} Object with fields to update.
 */
function buildTaskPatchFromFormData(data) {
  return {
    titel: data.titel,
    description: data.description,
    finishDate: data.finishDate,
    priority: data.priority,
    type: data.type,
    assignedTo: data.assignedTo,
    subTasks: data.subTasks,
  };
}

/**
 * Extracts new task data from the form.
 * 
 * Collects values from all form fields: title, description, date,
 * category, priority, and subtasks. Sets status to 0 (To Do).
 * 
 * @function extractFormData
 * @param {HTMLFormElement} form - Form with task data.
 * @returns {Object} Object with new task data.
 */
function extractFormData(form) {
  return {
    titel: form.querySelector("#task_titel").value,
    description: form.querySelector("#task_descr").value,
    finishDate: form.querySelector("#task_due_date").value,
    type: form.querySelector("#task_cat").value,
    priority: form.querySelector('input[name="priority"]:checked')?.value || "medium",
    subTasks: JSON.parse(form.querySelector("#subtasks_list_input").value || "[]"),
    status: 0,
  };
}

/**
 * Handles the add task form submission.
 * 
 * Prevents default form submission, performs validation,
 * extracts data, adds the task, and redirects to board.html.
 * 
 * @async
 * @function handleFormSubmit
 * @param {Event} event - Form submission event.
 * @returns {Promise<void>}
 */
async function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;

  if (!validateAddTaskForm(form)) {
    return;
  }

  const newTask = extractFormData(form);

  await addTaskData(newTask, {
    afterDone: () => (window.location.href = "board.html"),
  });
}

/**
 * Marks a form element as invalid.
 * 
 * Adds the 'is-invalid' CSS class to the root element.
 * 
 * @function setInputInValid
 * @param {HTMLElement} el - Input element (not used).
 * @param {HTMLElement} root - Root element to add the class to.
 * @returns {void}
 */
function setInputInValid(el, root) {
  root.classList.add("is-invalid");
}

/**
 * Removes the invalid mark from a form element.
 * 
 * Removes the 'is-invalid' CSS class from the root element.
 * 
 * @function setInputValid
 * @param {HTMLElement} el - Input element (not used).
 * @param {HTMLElement} root - Root element to remove the class from.
 * @returns {void}
 */
function setInputValid(el, root) {
  root.classList.remove("is-invalid");
}
