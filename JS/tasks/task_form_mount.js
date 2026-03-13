// Task form loading, validation and submission helpers

const PROTECTED_PAGE_KEYS = new Set(["summary", "board", "add_task", "contacts"]);

/**
 * Determines whether the current document is a protected app page.
 *
 * @returns {boolean} True when login is required for the current page.
 */
function isProtectedPage() {
  const pageKey = document.body?.dataset?.page;
  return PROTECTED_PAGE_KEYS.has(pageKey);
}

/**
 * Returns whether a valid login flag exists in session storage.
 *
 * @returns {boolean} True when the user is currently logged in.
 */
function hasActiveSession() {
  return sessionStorage.getItem("userLoggedIn") === "true";
}

/**
 * Redirects to the login page using history-safe replace.
 *
 * @returns {void}
 */
function redirectToLoginPage() {
  window.location.replace("index.html");
}

/**
 * Enforces login for protected pages.
 *
 * @returns {boolean} True when access is allowed.
 */
function enforceProtectedPageAuth() {
  if (!isProtectedPage()) return true;
  if (hasActiveSession()) return true;
  redirectToLoginPage();
  return false;
}

// Re-check auth when a page is restored via browser back/forward cache.
window.addEventListener("pageshow", () => {
  enforceProtectedPageAuth();
});

enforceProtectedPageAuth();

/**
 * Verifies whether the current user is logged in.
 *
 * Reads the login flag from session storage and redirects
 * to the login page if no active session is found.
 *
 * @function checkIfUserIsLoggedIn
 * @returns {void}
 */
function checkIfUserIsLoggedIn() {
  enforceProtectedPageAuth();
}

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
  const error = errorElement.nextElementSibling;
  element.classList.add("is-invalid");
  element.classList.remove("is-valid");
  error.innerText = "This field is required";
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
  const error = errorElement.nextElementSibling;
  element.classList.add("is-valid");
  element.classList.remove("is-invalid");
  error.innerText = "";
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
 * Loads an HTML partial from a URL.
 *
 * Resolves the given URL against the current page URL, removes
 * embedded credentials (`username`/`password`) from the request URL,
 * and fetches the resource with `no-store` cache mode.
 *
 * @async
 * @function loadPartial
 * @param {string} url - Relative or absolute URL of the partial template.
 * @returns {Promise<string>} Loaded HTML markup.
 */
async function loadPartial(url) {
  const resolvedUrl = new URL(url, window.location.href);
  // Some hosting setups expose user:pass in the page URL, which fetch rejects.
  resolvedUrl.username = "";
  resolvedUrl.password = "";

  const res = await fetch(resolvedUrl.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load partial: ${url} (${res.status})`);
  return await res.text();
}

/**
 * Renders the task form partial into a host element.
 *
 * Injects the partial HTML, renders icons if available,
 * and returns the mounted form element.
 *
 * @async
 * @function loadAndRenderTaskForm
 * @param {HTMLElement} hostEl - Container element for the form markup.
 * @returns {Promise<HTMLFormElement|null>} Mounted form element.
 */
async function loadAndRenderTaskForm(hostEl) {
  const html = await loadPartial("./partials/task_form.html");
  hostEl.innerHTML = html;

  if (window.renderIcons) {
    window.renderIcons(hostEl);
  }

  return hostEl.querySelector("form.add_task_form");
}

/**
 * Sets the visible title of the mounted task form.
 *
 * @function setTaskFormTitle
 * @param {HTMLFormElement} form - Form whose title should be updated.
 * @param {string} title - Title text to display.
 * @returns {void}
 */
function setTaskFormTitle(form, title) {
  form.querySelector(".add_task_titel").textContent = title;
}

/**
 * Initializes the clear button behavior for the task form.
 *
 * Binds a click handler that resets all form fields and UI state.
 *
 * @function initializeClearButton
 * @param {HTMLFormElement} form - Form containing the clear button.
 * @returns {void}
 */
function initializeClearButton(form) {
  const clearBtn = form.querySelector("#clear_task_form_btn");
  clearBtn.addEventListener("click", () => clearTaskForm(form));
}

/**
 * Applies preset task values to the form.
 *
 * Supports all major fields including title, description, due date,
 * priority, category, assignees, and subtasks.
 *
 * @function populateFormWithPreset
 * @param {HTMLFormElement} form - Form to populate.
 * @param {Object|null} preset - Optional preset data object.
 * @returns {void}
 */
function populateFormWithPreset(form, preset) {
  if (!preset) return;

  if (preset.titel != null) form.elements.task_titel.value = preset.titel;
  if (preset.description != null) form.elements.task_descr.value = preset.description;
  if (preset.finishDate != null) form.elements.task_due_date.value = preset.finishDate;

  if (preset.priority != null) {
    const radio = form.querySelector(`input[name="priority"][value="${preset.priority}"]`);
    if (radio) radio.checked = true;
  }

  if (preset.type != null) form.elements.task_cat.value = preset.type;

  if (preset?.assignedTo != null) {
    const hiddenAssigned = form.querySelector("#assigned_to_input");
    if (hiddenAssigned) hiddenAssigned.value = JSON.stringify(preset.assignedTo);
  }

  if (preset?.subTasks != null) {
    const hidden = form.querySelector("#subtasks_list_input");
    if (hidden) hidden.value = JSON.stringify(preset.subTasks);
  }
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
 * Collects task-related values from the form.
 *
 * Normalizes missing values to empty strings/arrays and delegates
 * assignee/subtask extraction to dedicated helpers.
 *
 * @function collectFormData
 * @param {HTMLFormElement} form - Task form element.
 * @returns {Object} Normalized task data object.
 */
function collectFormData(form) {
  return {
    titel: form.querySelector("#task_titel")?.value?.trim() || "",
    description: form.querySelector("#task_descr")?.value?.trim() || "",
    finishDate: form.querySelector("#task_due_date")?.value || "",
    priority: form.querySelector('input[name="priority"]:checked')?.value || "",
    type: form.querySelector("#task_cat")?.value || "",
    assignedTo: getAssignedToIds(form),
    subTasks: getSubtasksArray(form),
  };
}

/**
 * Handles task form submission for page and modal contexts.
 *
 * Validates the form, collects form data, supports custom submit hooks,
 * saves a new task object, and clears the form after success.
 *
 * @async
 * @function handleTaskFormSubmit
 * @param {SubmitEvent} event - Native submit event.
 * @param {HTMLFormElement} form - Submitted form element.
 * @param {Object} options - Submission configuration.
 * @param {string} options.toastId - Toast overlay id for success feedback.
 * @param {number} options.taskStatus - Initial status for the created task.
 * @param {Function|null} options.afterSaved - Optional callback executed after successful save.
 * @param {Function|null} options.onSubmitData - Optional custom submit handler.
 * @returns {Promise<void>}
 */
async function handleTaskFormSubmit(event, form, { toastId, taskStatus, afterSaved, onSubmitData }) {
  event.preventDefault();

  if (!validateAddTaskForm(form)) return;

  const data = collectFormData(form);

  if (typeof onSubmitData === "function") {
    await onSubmitData(data, form);
    return;
  }

  const newTaskObj = { ...data, status: taskStatus };

  await addTaskData(newTaskObj, {
    toastId,
    afterDone: () => typeof afterSaved === "function" && afterSaved(newTaskObj),
    refreshAfter: false,
  });

  clearTaskForm(form);
}

/**
 * Registers the submit listener for a task form instance.
 *
 * @function initializeFormSubmit
 * @param {HTMLFormElement} form - Form to bind.
 * @param {Object} options - Submit options passed to the handler.
 * @returns {void}
 */
function initializeFormSubmit(form, options) {
  form.addEventListener("submit", (e) => handleTaskFormSubmit(e, form, options));
}

/**
 * Mounts and initializes a reusable task form instance.
 *
 * Loads the partial template, applies title/preset values, wires up
 * validation, clear behavior, and submit handling.
 *
 * @async
 * @function mountTaskForm
 * @param {HTMLElement} hostEl - Element where the form will be rendered.
 * @param {Object} [config={}] - Mount configuration.
 * @param {string} [config.title="Add Task"] - Visible form title.
 * @param {Object|null} [config.preset=null] - Optional preset values.
 * @param {string} [config.mode="page"] - Context mode (page/modal), currently reserved for future use.
 * @param {string} [config.toastId="task_success_overlay"] - Success toast overlay id.
 * @param {number} [config.taskStatus=0] - Initial status for created tasks.
 * @param {Function|null} [config.afterSaved=null] - Callback executed after successful save.
 * @param {Function|null} [config.onSubmitData=null] - Optional custom submit callback.
 * @returns {Promise<HTMLFormElement|null>} Initialized form element.
 */
async function mountTaskForm(
  hostEl,
  { title = "Add Task", preset = null, mode = "page", toastId = "task_success_overlay", taskStatus = 0, afterSaved = null, onSubmitData = null } = {},
) {
  const form = await loadAndRenderTaskForm(hostEl);

  setTaskFormTitle(form, title);

  initializeClearButton(form);

  populateFormWithPreset(form, preset);

  initializeInputValidation(form);
  initializeTaskCategoryValidation(form);

  initializeFormSubmit(form, { toastId, taskStatus, afterSaved, onSubmitData });

  return form;
}