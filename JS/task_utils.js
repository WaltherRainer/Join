


function initAssignedToDropdown(usersData) {
  const ui = getAssignedToUi();
  if (!ui.root || isInitialized(ui.root)) return;
  if (!usersData || typeof usersData !== "object") return;
  const state = { usersData, selected: new Set(), ui };
  ui.root._assignedState = state;
  wireDropdownEvents(state);
  renderUserList(state);
}

function openAddTaskModal() {
  const modal = document.getElementById("addTaskModal");
  const host = document.getElementById("addTaskModalHost");

  if (!modal || !host) return;
  ensureAddTaskFormLoaded(async (form) => {
    host.appendChild(form);
    const usersDataObj = await ensureUsersLoaded();
    initAssignedToDropdown(usersDataObj);
    resetAssignedToDropdown();
    initTaskTypeDropdown(TASK_CATEGORIES);
    initSubtasksInput();
    bindAddTaskFormSubmitOnce();
    renderIcons(modal);
    modal.showModal();
  });
  listenEscapeFromModal("addTaskModal");
}

function isInitialized(root) {
  if (root.dataset.initialized === "1") return true;
  root.dataset.initialized = "1";
  return false;
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


window.initAssignedToDropdown = initAssignedToDropdown;