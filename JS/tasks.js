let parkedHost = null;
const statusTypes = {
  0 : "To Do",
  1 : "In Progress",
  2 : "Await Feedback",
  3 : "Done",
  4 : "Cancelled"
};


const TASK_CATEGORIES = [
  { value: 'technical_task', label: 'Technical Task' },
  { value: 'user_story', label: 'User Story' }
];


function initAssignedToDropdown(usersData) {
  const ui = getAssignedToUi();
  if (!ui.root || isInitialized(ui.root)) return;
  if (!usersData || typeof usersData !== "object") return;
  const state = { usersData, selected: new Set(), ui };
  ui.root._assignedState = state;
  wireDropdownEvents(state);
  renderUserList(state);
}


function getAssignedToUi() {
  const root = document.getElementById("assigned_to");
  if (!root) return { root: null };
  const toggleBtn = document.getElementById("assigned_to_toggle");
  return {
    root,
    control: root.querySelector(".multi_select__control"),
    toggleBtn,
    dropdown: document.getElementById("assigned_to_dropdown"),
    list: document.getElementById("assigned_to_list"),
    caret: toggleBtn?.querySelector(".caret"),
    placeholder: document.getElementById("assigned_to_placeholder"),
    valueEl: document.getElementById("assigned_to_value"),
    hiddenInput: document.getElementById("assigned_to_input"),
  };
}

function isInitialized(root) {
  if (root.dataset.initialized === "1") return true;
  root.dataset.initialized = "1";
  return false;
}

function renderUserList(state) {
  const { list } = state.ui;
  list.innerHTML = "";
  for (const [userId, userObj] of Object.entries(state.usersData)) {
    const li = createUserListItem(state, userId, userObj);
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
  applySelectionUi(ui, names, selected);
  renderAssignedAvatars(selected, usersData);
}

function applySelectionUi(ui, names, selected) {
  if (names.length === 0) {
    ui.placeholder.hidden = false;
    ui.valueEl.hidden = true;
    ui.valueEl.textContent = "";
    ui.hiddenInput.value = "";
    return;
  }
  ui.placeholder.hidden = true;
  ui.valueEl.hidden = false;
  ui.valueEl.textContent = names.join(", ");
  ui.hiddenInput.value = JSON.stringify([...selected]);
}

function wireDropdownEvents(state) {
  const { ui } = state;
  ui.toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown(ui);
  });
  ui.control.addEventListener("click", (e) => {
    if (e.target === ui.toggleBtn || ui.toggleBtn.contains(e.target)) return;
    toggleDropdown(ui);
  });
  document.addEventListener("click", (e) => {
    if (!ui.root.contains(e.target)) closeDropdown(ui);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDropdown(ui);
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
  const hidden = document.getElementById("subtasks_list_input");
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

async function addTask({ toastId = "task_success_overlay", taskStatus = 0, afterDone, refreshAfter = false } = {}) {
  const taskTitel   = document.getElementById("task_titel");
  const taskDescr   = document.getElementById("task_descr");
  const taskType     = document.getElementById("task_type");
  const taskPrio    = document.querySelector('input[name="priority"]:checked');
  const taskDueDate = document.getElementById("task_due_date");

  const subTasks   = getSubtasksArray();
  const assignedTo = getAssignedToIds();

  const newTaskObj = {
    titel: taskTitel?.value?.trim() || "",
    description: taskDescr?.value?.trim() || "",
    type: taskType?.value || "",
    status: taskStatus, // Status 0 = ToDo, Status 1 = In Progress, Status 2 = Await Feedback, Status 3 = Done, Status 4 = Cancelled
    priority: taskPrio?.value || "",
    finishDate: taskDueDate?.value || "",
    assignedTo,
    subTasks
  };

  const result = await uploadData("tasks", newTaskObj);
  console.log("Firebase Key:", result?.name);

  showToastOverlay(toastId, {
    onDone: () => {
      if (typeof afterDone === "function") afterDone();
      if (refreshAfter) loadTasks();
    }
  });

  clearTaskForm();
}

function activateBoard() {
  window.location.replace("board.html");
}

async function addTaskFromAddTaskPage() {
  await addTask({
    toastId: "task_success_overlay",
    afterDone: activateBoard,
    refreshAfter: false,
  });
}

function afterTaskAddedInModal() {
  const modal = document.querySelector(".add_task_modal");
  modal?.classList.remove("is_background");

  closeAddTaskModal();
  loadTasks();
}

async function addTaskFromBoardModal() {
  bringModalToBackground();

  await addTask({
    toastId: "task_modal_success_overlay",
    afterDone: afterTaskAddedInModal,
  });
}

function bringModalToBackground() {
  const modal = document.querySelector(".add_task_modal");
  modal?.classList.add("is_background");
}

function getModalElements() {
  const modal = document.getElementById("addTaskModal");
  const host = document.getElementById("addTaskModalHost");
  const closeBtn = modal?.querySelector(".modal_close");
  return { modal, host, closeBtn };
}

function ensureAddTaskFormLoaded(cb) {
  const existing = document.getElementById("addTaskForm");
  if (existing) return cb(existing);
  const loader = document.getElementById("addTaskLoader");
  if (!loader) {
    console.error("addTaskLoader fehlt auf dieser Seite.");
    return;
  }
  loader.innerHTML = `<div w3-include-html="add_task.html"></div>`;
  w3.includeHTML(() => {
    const form = document.getElementById("addTaskForm");
    if (!form) {
      console.error("Form nicht gefunden. Prüfe add_task.html (id='addTaskForm').");
      return;
    }
    cb(form);
  });
}

function openAddTaskModal() {
  const modal = document.getElementById("addTaskModal");
  const host = document.getElementById("addTaskModalHost");
  if (!modal || !host) return;
  ensureAddTaskFormLoaded(async (form) => {
    host.appendChild(form);
    await ensureUsersLoaded();
    initAssignedToDropdown(users);
    resetAssignedToDropdown();
    initTaskTypeDropdown(TASK_CATEGORIES);
    initSubtasksInput();
    bindAddTaskFormSubmitOnce();
    renderIcons(modal);
    modal.showModal();
  });
}

function closeAddTaskModal() {
  const { modal, host } = getModalElements();
  if (!modal || !host) return;
  const form = document.getElementById("addTaskForm");
  if (form) {
    const inlineHost = document.getElementById("addTaskInlineHost");
    (inlineHost || ensureParkedHost()).appendChild(form);
  }
  modal.close();
}

function initAddTaskModalOnce() {
  const { modal, closeBtn } = getModalElements();
  if (!modal || !closeBtn) return;
  closeBtn.addEventListener("click", closeAddTaskModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeAddTaskModal();
  });
  modal.addEventListener("close", () => {
    const form = document.getElementById("addTaskForm");
    const inlineHost = document.getElementById("addTaskInlineHost");
    if (form && modal.contains(form)) {
      (inlineHost || ensureParkedHost()).appendChild(form);
    }
  });
}

function initTaskTypeDropdown(categories) {
  const root = document.getElementById("task_type_select");
  if (!root || isInitialized(root)) return;
  const ui = getTaskTypeUi(root);
  renderTaskTypeOptions(ui, categories);
  wireTaskTypeEvents(ui);
}

function getTaskTypeUi(root) {
  return {
    root,
    control: root.querySelector(".single_select__control"),
    dropdown: root.querySelector(".single_select__dropdown"),
    list: root.querySelector(".single_select__list"),
    valueEl: root.querySelector(".single_select__value"),
    placeholder: root.querySelector(".single_select__placeholder"),
    hiddenInput: document.getElementById("task_type"),
    caret: root.querySelector(".caret"),
  };
}

function renderTaskTypeOptions(ui, categories) {
  ui.list.innerHTML = "";
  categories.forEach((cat) => {
    const li = document.createElement("li");
    li.className = "single_select__item";
    li.textContent = cat.label;
    li.addEventListener("click", () => selectTaskType(ui, cat));
    ui.list.appendChild(li);
  });
}

function selectTaskType(ui, cat) {
  ui.hiddenInput.value = cat.value;
  ui.valueEl.textContent = cat.label;
  ui.valueEl.hidden = false;
  ui.placeholder.hidden = true;
  closeTaskTypeDropdown(ui);
}

function wireTaskTypeEvents(ui) {
  ui.control.addEventListener("click", () => toggleTaskTypeDropdown(ui));

  document.addEventListener("click", (e) => {
    if (!ui.root.contains(e.target)) closeTaskTypeDropdown(ui);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeTaskTypeDropdown(ui);
  });
}

function toggleTaskTypeDropdown(ui) {
  ui.dropdown.hidden ? openTaskTypeDropdown(ui) : closeTaskTypeDropdown(ui);
}

function openTaskTypeDropdown(ui) {
  ui.dropdown.hidden = false;
  ui.caret.classList.add("caret_rotate");
}

function closeTaskTypeDropdown(ui) {
  ui.dropdown.hidden = true;
  ui.caret.classList.remove("caret_rotate");
}

function clearTaskForm() {
  setValueById("task_titel", "");
  setValueById("task_descr", "");
  setValueById("task_cat", "");
  setValueById("task_due_date", "");
  setValueById("input_subtasks", "");
  setValueById("subtasks_list_input", "[]");

  const list = document.getElementById("subtasks_list");
  if (list) list.innerHTML = "";

  resetPriorityButtons();
  resetAssignedToDropdown();

  const avatarContainer = document.getElementById("assigned_avatar_container");
  if (avatarContainer) avatarContainer.innerHTML = "";

  resetTaskTypeDropdownUi();
}


function setValueById(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

function resetPriorityButtons() {
  const urgent = document.querySelector('input[name="priority"][value="urgent"]');
  const medium = document.querySelector('input[name="priority"][value="medium"]');
  const low = document.querySelector('input[name="priority"][value="low"]');
  if (urgent) urgent.checked = false;
  if (medium) medium.checked = true;
  if (low) low.checked = false;
}

function resetAssignedToDropdown() {
  const ui = getAssignedToUi();
  if (!ui.root) return;

  const state = ui.root._assignedState;

  if (state) {
    state.selected.clear();

    state.ui.list?.querySelectorAll(".is-selected").forEach(li => {
      li.classList.remove("is-selected");
    });

    applySelectionUi(state.ui, [], state.selected);
    renderAssignedAvatars(state.selected, state.usersData);
    return;
  }

  // Fallback (falls init noch nicht gelaufen ist)
  if (ui.placeholder) ui.placeholder.hidden = false;
  if (ui.valueEl) {
    ui.valueEl.hidden = true;
    ui.valueEl.textContent = "";
  }
  if (ui.hiddenInput) ui.hiddenInput.value = "";

  const avatarContainer = document.getElementById("assigned_avatar_container");
  if (avatarContainer) avatarContainer.innerHTML = "";
}


function resetTaskTypeDropdownUi() {
  const root = document.getElementById("task_type_select");
  if (!root) return;
  const valueEl = root.querySelector(".single_select__value");
  const placeholder = root.querySelector(".single_select__placeholder");
  const hiddenInput = document.getElementById("task_type");
  if (valueEl) {
    valueEl.hidden = true;
    valueEl.textContent = "";
  }
  if (placeholder) placeholder.hidden = false;
  if (hiddenInput) hiddenInput.value = "";
}

function clearEditInput(state) {
  const el = state.ui.listEl.querySelector('li.is-editing input.subtask_edit');
  if (el) el.value = "";
  if (el) el.focus();
}

function bindAddTaskFormSubmitOnce() {
  const form = document.getElementById("addTaskForm");
  if (!form) return;
  if (form.dataset.submitBound === "1") return;
  form.dataset.submitBound = "1";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const page = document.body.dataset.page;

      if (page === "board") {
        await addTaskFromBoardModal();
      } else {
        await addTaskFromAddTaskPage();
      }
    } catch (err) {
      console.error("addTask failed", err);
    }
  });
}


window.initAssignedToDropdown = initAssignedToDropdown;