/**
 * Helpers for task form mounting, validation, and submission workflows.
 *
 * @type {Set<string>}
 */

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
  if (hasActiveSession()) {
    document.documentElement.style.visibility = "visible";
    return true;
  }
  document.documentElement.style.visibility = "hidden";
  redirectToLoginPage();
  return false;
}

/**
 * Re-validates authentication on page show events.
 *
 * Ensures that protected pages are only visible when a valid session exists,
 * and redirects to the login page if necessary.
 *
 * @returns {void}
 */
window.addEventListener("pageshow", () => {
  enforceProtectedPageAuth();
});

/**
 * Hides the page content before it is cached by the browser.
 *
 * Listens for the `pagehide` event and sets the document visibility to hidden
 * if the current page is protected, preventing cached snapshots from showing stale content.
 * 
 * @returns {void}
 */
window.addEventListener("pagehide", () => {
  if (!isProtectedPage()) return;
  document.documentElement.style.visibility = "hidden";
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
 * Sets display none in Task Edit Mode
 *
 * @function setTaskFormTitle
 * @param {HTMLFormElement} form - Form whose title should be updated.
 * @param {string} title - Title text to display.
 * @returns {void}
 */
function setTaskFormTitle(form, title) {
  form.querySelector(".add_task_titel").textContent = title;
  if (title === "Task bearbeiten") {
    form.querySelector(".add_task_titel").classList.add("d_none");
  };
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
 * Sets a form control value only when a value is provided.
 *
 * @function setFormValueIfPresent
 * @param {HTMLFormElement} form - Form containing the target element.
 * @param {string} fieldName - Name of the form control in `form.elements`.
 * @param {*} value - Value to apply when not null/undefined.
 * @returns {void}
 */
function setFormValueIfPresent(form, fieldName, value) {
  if (value == null) return;
  const field = form.elements[fieldName];
  if (field) field.value = value;
}

/**
 * Applies simple preset fields that map directly to form controls.
 *
 * @function applyBasicPresetFields
 * @param {HTMLFormElement} form - Form to update.
 * @param {Object} preset - Preset values object.
 * @returns {void}
 */
function applyBasicPresetFields(form, preset) {
  setFormValueIfPresent(form, "task_titel", preset.titel);
  setFormValueIfPresent(form, "task_descr", preset.description);
  setFormValueIfPresent(form, "task_due_date", preset.finishDate);
  setFormValueIfPresent(form, "task_cat", preset.type);
}

/**
 * Applies the preset priority by checking the matching radio input.
 *
 * @function applyPriorityPreset
 * @param {HTMLFormElement} form - Form containing priority controls.
 * @param {string|null|undefined} priority - Priority value to select.
 * @returns {void}
 */
function applyPriorityPreset(form, priority) {
  if (priority == null) return;
  const radio = form.querySelector(`input[name="priority"][value="${priority}"]`);
  if (radio) radio.checked = true;
}

/**
 * Stores structured preset data into a hidden input as JSON.
 *
 * @function setHiddenJsonField
 * @param {HTMLFormElement} form - Form containing the hidden field.
 * @param {string} selector - CSS selector for the hidden field.
 * @param {*|null|undefined} value - Value to serialize when present.
 * @returns {void}
 */
function setHiddenJsonField(form, selector, value) {
  if (value == null) return;
  const hidden = form.querySelector(selector);
  if (hidden) hidden.value = JSON.stringify(value);
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

  applyBasicPresetFields(form, preset);
  applyPriorityPreset(form, preset.priority);
  setHiddenJsonField(form, "#assigned_to_input", preset.assignedTo);
  setHiddenJsonField(form, "#subtasks_list_input", preset.subTasks);
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
 * Executes a custom submit handler when one is provided.
 *
 * @async
 * @function runCustomSubmitHandler
 * @param {Function|null} onSubmitData - Optional custom submit callback.
 * @param {Object} data - Normalized task data.
 * @param {HTMLFormElement} form - Submitted form element.
 * @returns {Promise<boolean>} True when submission was handled by the custom callback.
 */
async function runCustomSubmitHandler(onSubmitData, data, form) {
  if (typeof onSubmitData !== "function") return false;
  await onSubmitData(data, form);
  return true;
}

/**
 * Executes the optional callback after a task has been saved.
 *
 * @function invokeAfterSaved
 * @param {Function|null} afterSaved - Optional callback to execute.
 * @param {Object} task - Newly created task object.
 * @returns {void}
 */
function invokeAfterSaved(afterSaved, task) {
  if (typeof afterSaved === "function") afterSaved(task);
}

/**
 * Saves a new task using the shared storage helper.
 *
 * @async
 * @function submitTaskData
 * @param {Object} data - Normalized task data.
 * @param {number} taskStatus - Initial status for the created task.
 * @param {string} toastId - Toast overlay id for success feedback.
 * @param {Function|null} afterSaved - Optional callback executed after successful save.
 * @returns {Promise<void>}
 */
async function submitTaskData(data, taskStatus, toastId, afterSaved) {
  const newTaskObj = { ...data, status: taskStatus };

  await addTaskData(newTaskObj, {
    toastId,
    afterDone: () => invokeAfterSaved(afterSaved, newTaskObj),
    refreshAfter: false,
  });
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

  const handledByCustomSubmit = await runCustomSubmitHandler(onSubmitData, data, form);
  if (handledByCustomSubmit) return;

  await submitTaskData(data, taskStatus, toastId, afterSaved);

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