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
