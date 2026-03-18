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
 * Resets subtasks array index and it's state
 * Calls sequentially the functions for clearing fields, UI elements,
 * and resetting state.
 *
 * @function clearTaskForm
 * @param {HTMLFormElement} form - Form to clear.
 * @returns {void}
 */
function clearTaskForm(form) {
  if (!form) return;
  const state = form._subtaskState;
  if (state) {
    state.subtasks = [];
    state.editingIndex = null;
    state.subTaskUi.inputSubTasks.value = "";
  }
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

