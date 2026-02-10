const TASK_CATEGORIES = [
  { value: 'technical_task', label: 'Technical Task' },
  { value: 'user_story', label: 'User Story' }
];


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

function checkOverflow(description) {
  if (!description || description == "") return "";
  if (typeof description !== "string") return "";
  const maxLength = 50;
  if (description.length > maxLength) {
    return description.substring(0, maxLength) + "...";
  }
  return description;
}

function subtasksCounter(task) {
  const subtaskcount = countSubtasksDone(task);
  if (subtaskcount.counter === 0) return "";
  return getSubtasksCountAndTotalTemplate(subtaskcount.done, subtaskcount.counter);
}

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

function updateTaskCard(taskId, tasks) {
  const users = loadUsersFromSession();
  const task = tasks[taskId];
  if (!task) return;
  const cards = document.querySelectorAll(
    `.t_task[data-task-id="${taskId}"]`
  );

  cards.forEach(function(card) {
    card.innerHTML = getTaskItemContent(task, users);
  });
}

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

  initAssignedToDropdown(form, usersDataObj);
  resetAssignedToDropdown(form);
  initTaskTypeDropdown(form, TASK_CATEGORIES);
  initSubtasksInput(form);

  renderIcons(modal);
  modal.showModal();

  const removeEsc = listenEscapeFromModal("addTaskModal", async () => {
    closeAddTaskModal();
  });
  modal.addEventListener("close", removeEsc, { once: true });
}



function isInitialized(root) {
  if (root.dataset.initialized === "1") return true;
  root.dataset.initialized = "1";
  return false;
}

function getAssignedToUi(form) {
  const root = form.querySelector("#assigned_to");
  if (!root) return { root: null };

  const toggleBtn = root.querySelector("#assigned_to_toggle");

  return {
    root,
    control: root.querySelector(".multi_select__control"),
    toggleBtn,
    dropdown: root.querySelector("#assigned_to_dropdown"),
    list: root.querySelector("#assigned_to_list"),
    caret: toggleBtn?.querySelector(".caret"),
    assignedToPlaceholder: root.querySelector("#assigned_to_placeholder"),
    valueEl: root.querySelector("#assigned_to_value"),
    assignedToInput: root.querySelector("#assigned_to_input"),
    assignedToassignedToFilterInput: root.querySelector("#assigned_to_filter"),
    avatarContainer: form.querySelector("#assigned_avatar_container"),
  };
}


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

function onUserToggle(state, li, userId) {
  const isSelected = li.classList.toggle("is-selected");
  updateSelection(state, userId, isSelected);
}

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

function wireDropdownEvents(state) {
  const { ui } = state;

  function afterToggleSync() {
    const isOpen = !ui.dropdown.hidden;

    if (ui.assignedToassignedToFilterInput) {
      ui.assignedToassignedToFilterInput.hidden = !isOpen;
      if (isOpen) {
        ui.assignedToassignedToFilterInput.focus();
        ui.assignedToassignedToFilterInput.select();
      } else {
        ui.assignedToassignedToFilterInput.value = "";
        state.query = "";
        renderUserList(state);
      }
    }
    if (isOpen) ui.assignedToPlaceholder.hidden = true;
    else {
      if (state.selected.size === 0) ui.assignedToPlaceholder.hidden = false;
    }
  }

  ui.toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown(ui);
    afterToggleSync();
  });

  ui.control.addEventListener("click", (e) => {
    if (e.target === ui.toggleBtn || ui.toggleBtn.contains(e.target)) return;

    toggleDropdown(ui);
    afterToggleSync();
  });

  document.addEventListener("click", (e) => {
    if (!ui.root.contains(e.target)) {
      closeDropdown(ui);
      afterToggleSync();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeDropdown(ui);
      afterToggleSync();
    }
  });
}

function toggleDropdown(ui) {
  ui.dropdown.hidden ? openDropdown(ui) : closeDropdown(ui);
}

function openDropdown(ui) {
  ui.dropdown.hidden = false;
  ui.control.setAttribute("aria-expanded", "true");
  ui.caret?.classList.add("caret_rotate");
}

function closeDropdown(ui) {
  ui.dropdown.hidden = true;
  ui.control.setAttribute("aria-expanded", "false");
  ui.caret?.classList.remove("caret_rotate");
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getSubtasksArray() {
  const hidden = document.querySelector("#subtasks_list_input");
  if (!hidden || !hidden.value) return [];
  try {
    const arr = JSON.parse(hidden.value);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter(x => x && typeof x === "object")
      .map(x => ({ title: String(x.title ?? "").trim(), done: Boolean(x.done) }))
      .filter(x => x.title.length > 0);
  } catch {
    return [];
  }
}

function getAssignedToIds() {
  const hidden = document.getElementById("assigned_to_input");
  if (!hidden || !hidden.value) return [];
  try {
    const arr = JSON.parse(hidden.value);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function initTaskTypeDropdown(form, categories) {
  const root = form.querySelector("#task_cat_select");
  if (!root || isInitialized(root)) return;
  const ui = getTaskCatUi(root);
  renderTaskCatOptions(ui, categories);
  wireTaskCatEvents(ui);
}

function getTaskCatUi(root) {
  return {
    root,
    control: root.querySelector(".single_select__control"),
    dropdown: root.querySelector(".single_select__dropdown"),
    list: root.querySelector(".single_select__list"),
    valueEl: root.querySelector(".single_select__value"),
    placeholder: root.querySelector(".single_select__placeholder"),
    assignedToInput: root.querySelector("#task_cat"),
    caret: root.querySelector(".caret"),
  };
}

function renderTaskCatOptions(ui, categories) {
  ui.list.innerHTML = "";
  categories.forEach((cat) => {
    const li = document.createElement("li");
    li.className = "single_select__item";
    li.textContent = cat.label;
    li.addEventListener("click", () => selectTaskCat(ui, cat));
    ui.list.appendChild(li);
  });
}

function selectTaskCat(ui, cat) {
  ui.assignedToInput.value = cat.value;
  ui.valueEl.textContent = cat.label;
  ui.valueEl.hidden = false;
  ui.placeholder.hidden = true;
  closeTaskCatDropdown(ui);

  const taskTypeDiv = ui.root.querySelector("#task_cat_control");
  const taskTypeOuterDiv = ui.root; 
  if (taskTypeDiv && taskTypeOuterDiv) {
    setInputValid(taskTypeDiv, taskTypeOuterDiv);
  }
  ui.root.closest("form")?._markDirty?.();
}


function wireTaskCatEvents(ui) {
  ui.control.addEventListener("click", () => toggleTaskCatDropdown(ui));

  document.addEventListener("click", (e) => {
    if (!ui.root.contains(e.target)) closeTaskCatDropdown(ui);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeTaskCatDropdown(ui);
  });
}

function toggleTaskCatDropdown(ui) {
  ui.dropdown.hidden ? openTaskCatDropdown(ui) : closeTaskCatDropdown(ui);
}

function openTaskCatDropdown(ui) {
  ui.dropdown.hidden = false;
  ui.caret.classList.add("caret_rotate");
}

function closeTaskCatDropdown(ui) {
  ui.dropdown.hidden = true;
  ui.caret.classList.remove("caret_rotate");
}

function resetPriorityButtons(form) {
  const urgent = form.querySelector('input[name="priority"][value="urgent"]');
  const medium = form.querySelector('input[name="priority"][value="medium"]');
  const low = form.querySelector('input[name="priority"][value="low"]');

  if (urgent) urgent.checked = false;
  if (medium) medium.checked = true;
  if (low) low.checked = false;
}


function resetTaskCatDropdownUi(form) {
  const root = form.querySelector("#task_cat_select");
  if (!root) return;

  const valueEl = root.querySelector(".single_select__value");
  const placeholder = root.querySelector(".single_select__placeholder");
  const assignedToInput = form.querySelector("#task_cat");

  if (valueEl) {
    valueEl.hidden = true;
    valueEl.textContent = "";
  }
  if (placeholder) placeholder.hidden = false;
  if (assignedToInput) assignedToInput.value = "";
}


window.initAssignedToDropdown = initAssignedToDropdown;