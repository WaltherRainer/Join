/**
 * Removes all validation styles from required form fields.
 *
 * Iterates over all elements marked with `.required_input`
 * and resets their valid/invalid visual state.
 *
 * @function removeAllInputErrors
 * @param {HTMLFormElement} form - Task form element.
 * @returns {void}
 */
function removeAllInputErrors(form) {
  const reqInputFields = form.querySelectorAll(".required_input");
  reqInputFields.forEach(resetInputValidation);
}

/**
 * Marks a form control as invalid and shows a default message.
 *
 * Applies invalid CSS classes to the target element and writes
 * an error message into the helper text element after `errorElement`.
 *
 * @function setInputInValid
 * @param {HTMLElement} element - Input element to mark invalid.
 * @param {HTMLElement} errorElement - Reference element used to locate the error text node.
 * @returns {void}
 */
function setInputInValid(element, errorElement) {
  const error = errorElement?.nextElementSibling;
  element.classList.add("is-invalid");
  element.classList.remove("is-valid");
  if (error) error.innerText = "This field is required";
}

/**
 * Marks a form control as valid and clears its message.
 *
 * Applies valid CSS classes to the target element and removes
 * the error text located after `errorElement`.
 *
 * @function setInputValid
 * @param {HTMLElement} element - Input element to mark valid.
 * @param {HTMLElement} errorElement - Reference element used to locate the error text node.
 * @returns {void}
 */
function setInputValid(element, errorElement) {
  const error = errorElement?.nextElementSibling;
  element.classList.add("is-valid");
  element.classList.remove("is-invalid");
  if (error) error.innerText = "";
}

/**
 * Resets validity classes on a form control.
 *
 * Removes both `is-invalid` and `is-valid` classes
 * from the supplied element.
 *
 * @function resetInputValidation
 * @param {HTMLElement} element - Form control to reset.
 * @returns {void}
 */
function resetInputValidation(element) {
  element.classList.remove("is-invalid");
  element.classList.remove("is-valid");
}

/**
 * Adds blur-based validation handlers to required standard inputs.
 *
 * @function initializeInputValidation
 * @param {HTMLFormElement} form - Form whose inputs should be validated.
 * @returns {void}
 */
function initializeInputValidation(form) {
  form.querySelectorAll(".standard_input_box[required]").forEach((input) => {
    input.addEventListener("blur", () => {
      if (!input.checkValidity()) setInputInValid(input, input);
      else setInputValid(input, input);
    });
  });
}

/**
 * Adds validation logic for task category selection.
 *
 * Validates the hidden category field when the category trigger
 * loses focus and updates the category control visual state.
 *
 * @function initializeTaskCategoryValidation
 * @param {HTMLFormElement} form - Form containing category controls.
 * @returns {void}
 */
function initializeTaskCategoryValidation(form) {
  form.querySelector("#task_cat_btn")?.addEventListener("blur", () => {
    const hidden = form.querySelector("#task_cat");
    const taskTypeDiv = form.querySelector("#task_cat_control");
    const taskTypeOuterDiv = form.querySelector("#task_cat_select");
    if (!hidden.value) setInputInValid(taskTypeDiv, taskTypeOuterDiv);
    else setInputValid(taskTypeDiv, taskTypeOuterDiv);
  });
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