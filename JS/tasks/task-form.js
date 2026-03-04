// Task form loading, validation and submission helpers

function checkIfUserIsLoggedIn() {
  const userLoggedIn = sessionStorage.getItem("userLoggedIn");
  if (userLoggedIn !== "true") {
    window.location.replace("index.html");
  }
}

function removeAllInputErrors(form) {
  const reqInputFields = form.querySelectorAll(".required_input");
  reqInputFields.forEach(resetInputValidation);
}

function setInputInValid(element, errorElement) {
  const error = errorElement.nextElementSibling;
  element.classList.add("is-invalid");
  element.classList.remove("is-valid");
  error.innerText = "This field is required";
}

function setInputValid(element, errorElement) {
  const error = errorElement.nextElementSibling;
  element.classList.add("is-valid");
  element.classList.remove("is-invalid");
  error.innerText = "";
}

function resetInputValidation(element) {
  element.classList.remove("is-invalid");
  element.classList.remove("is-valid");
}

async function loadPartial(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load partial: ${url} (${res.status})`);
  return await res.text();
}

async function loadAndRenderTaskForm(hostEl) {
  const html = await loadPartial("./partials/task_form.html");
  hostEl.innerHTML = html;

  if (window.renderIcons) {
    window.renderIcons(hostEl);
  }

  return hostEl.querySelector("form.add_task_form");
}

function setTaskFormTitle(form, title) {
  form.querySelector(".add_task_titel").textContent = title;
}

function initializeClearButton(form) {
  const clearBtn = form.querySelector("#clear_task_form_btn");
  clearBtn.addEventListener("click", () => clearTaskForm(form));
}

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

function initializeInputValidation(form) {
  form.querySelectorAll(".standard_input_box[required]").forEach((input) => {
    input.addEventListener("blur", () => {
      if (!input.checkValidity()) setInputInValid(input, input);
      else setInputValid(input, input);
    });
  });
}

function initializeTaskCategoryValidation(form) {
  form.querySelector("#task_cat_btn")?.addEventListener("blur", () => {
    const hidden = form.querySelector("#task_cat");
    const taskTypeDiv = form.querySelector("#task_cat_control");
    const taskTypeOuterDiv = form.querySelector("#task_cat_select");
    if (!hidden.value) setInputInValid(taskTypeDiv, taskTypeOuterDiv);
    else setInputValid(taskTypeDiv, taskTypeOuterDiv);
  });
}

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

function initializeFormSubmit(form, options) {
  form.addEventListener("submit", (e) => handleTaskFormSubmit(e, form, options));
}

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