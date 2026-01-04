let parkedHost = null;
const TASK_CATEGORIES = [
  { value: 'technical_task', label: 'Technical Task' },
  { value: 'user_story', label: 'User Story' }
];

function initAssignedToDropdown(usersData) {
  const ui = getAssignedToUi();
  if (!ui.root || isInitialized(ui.root)) return;
  if (!usersData || typeof usersData !== "object") return;

  const state = { usersData, selected: new Set(), ui }; // <-- hier rein
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
  const hidden = document.getElementById("subtasks_input");
  if (!hidden || !hidden.value) return [];
  try {
    const arr = JSON.parse(hidden.value);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function loadTasks() {
    tasks = await loadData('/tasks');
    console.log(tasks);
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

async function addTask() {
  console.log("addTask() called");

  const taskTitel   = document.getElementById("task_titel");
  const taskDescr   = document.getElementById("task_descr");
  const taskCat     = document.getElementById("task_cat");
  const taskPrio    = document.querySelector('input[name="priority"]:checked');
  const taskDueDate = document.getElementById("task_due_date");
  const subTasks   = getSubtasksArray();
  const assignedTo = getAssignedToIds();
  const newTaskObj = {
    titel: taskTitel?.value?.trim() || "",
    description: taskDescr?.value?.trim() || "",
    category: taskCat?.value || "",
    priority: taskPrio?.value || "",
    finishDate: taskDueDate?.value || "",
    assignedTo,
    subTasks
  };
  const result = await uploadData("tasks", newTaskObj);
  console.log("Firebase Key:", result?.name);
  loadTasks();
}

function ensureParkedHost() {
  if (!parkedHost) {
    parkedHost = document.createElement("div");
    parkedHost.id = "addTaskParkedHost";
    parkedHost.style.display = "none";
    document.body.appendChild(parkedHost);
  }
  return parkedHost;
}

function getModalEls() {
  const modal = document.getElementById("addTaskModal");
  const host = document.getElementById("addTaskModalHost");
  const closeBtn = modal?.querySelector(".modal_close");
  return { modal, host, closeBtn };
}

// function ensureAddTaskFormLoaded(cb) {
//   const existing = document.getElementById("addTaskForm");
//   if (existing) return cb(existing);

//   const loader = document.getElementById("addTaskLoader");
//   if (!loader) {
//     console.error("addTaskLoader fehlt auf dieser Seite.");
//     return;
//   }

//   loader.innerHTML = `<div w3-include-html="add_task_form.html"></div>`;

//   w3.includeHTML(() => {
//     const form = document.getElementById("addTaskForm");
//     if (!form) {
//       console.error("addTaskForm fehlt in add_task_form.html");
//       return;
//     }
//     cb(form);
//   });
// }

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

    if (typeof ensureUsersLoaded === "function") await ensureUsersLoaded();
    if (typeof initAssignedToDropdown === "function") initAssignedToDropdown(users);
    if (typeof initTaskTypeDropdown === "function") initTaskTypeDropdown(TASK_CATEGORIES);
    if (typeof initSubtasksInput === "function") initSubtasksInput();
    if (typeof bindAddTaskFormSubmitOnce === "function") bindAddTaskFormSubmitOnce();


    modal.showModal();
  });
}

// function openAddTaskModal() {
//   const { modal, host } = getModalEls();
//   if (!modal || !host) return;

//   const existingForm = document.getElementById("addTaskForm");
//   if (existingForm) {
//     host.appendChild(existingForm);
//     initAssignedToDropdown(users);
//     initTaskTypeDropdown(TASK_CATEGORIES);
//     modal.showModal();
//     return;
//   } 

  // const loader = document.getElementById("addTaskLoader");
  // loader.innerHTML = `<div w3-include-html="add_task.html"></div>`;

  // w3.includeHTML(() => {
  //   const loadedForm = document.getElementById("addTaskForm");
  //   if (!loadedForm) {
  //     console.error("Form nicht gefunden. Bitte id='addTaskForm' im add_task.html setzen.");
  //     return;
  //   }
  //   host.appendChild(loadedForm);
  //   initAssignedToDropdown(users);
  //   initTaskTypeDropdown(TASK_CATEGORIES);
  //   initSubtasksInput();
  //   modal.showModal();
  // });


function closeAddTaskModal() {
  const { modal, host } = getModalEls();
  if (!modal || !host) return;

  const form = document.getElementById("addTaskForm");
  if (form) {
    const inlineHost = document.getElementById("addTaskInlineHost");
    (inlineHost || ensureParkedHost()).appendChild(form);
  }
  modal.close();
}

function initAddTaskModalOnce() {
  const { modal, closeBtn } = getModalEls();
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
  setValueById("subtasks", "");
  setValueById("subtasks_input", "[]");
  const list = document.getElementById("subtasks_list");
  if (list) list.innerHTML = "";
  resetPriorityButtons();
  resetAssignedToDropdown();
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
  const placeholder = document.getElementById("assigned_to_placeholder");
  const valueEl = document.getElementById("assigned_to_value");
  const input = document.getElementById("assigned_to_input");

  if (placeholder) placeholder.hidden = false;
  if (valueEl) {
    valueEl.hidden = true;
    valueEl.textContent = "";
  }
  if (input) input.value = "";
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

function initSubtasksInput() {
  const input = document.getElementById("subtasks");
  const listEl = document.getElementById("subtasks_list");
  const hidden = document.getElementById("subtasks_input");
  if (!input || !listEl) return;

  const root = input.closest(".form_row") || document;
  const btnClear = root.querySelector(".subtasks_clear");
  const btnAdd = root.querySelector(".subtasks_add");
  if (!btnClear || !btnAdd) return;

  const ui = { input, listEl, hidden };
  const state = { subtasks: [], editingIndex: null, ui };

  btnClear.innerHTML = delCross({ width: 18, height: 18 });
  btnAdd.innerHTML = addCross({ width: 18, height: 18 });
  btnClear.onclick = () => clearSubtaskInput(state);
  btnAdd.onclick = () => addSubtaskFromInput(state);
  input.onkeydown = (e) => onSubtaskKeydown(state, e);

  wireSubtaskListEvents(state);
  renderSubtasks(state);
  syncSubtasksHidden(state);
}

function clearSubtaskInput(state) {
  state.ui.input.value = "";
  state.ui.input.focus();
}

function onSubtaskKeydown(state, e) {
  if (e.key !== "Enter") return;
  e.preventDefault();
  addSubtaskFromInput(state);
}

function addSubtaskFromInput(state) {
  const text = state.ui.input.value.trim();
  if (!text) return;

  state.subtasks.push(text);
  state.ui.input.value = "";
  renderSubtasks(state);
  syncSubtasksHidden(state);
}

function syncSubtasksHidden(state) {
  if (state.ui.hidden) state.ui.hidden.value = JSON.stringify(state.subtasks);
}

function getSubtasksUi() {
  return {
    input: document.getElementById("subtasks"),
    listEl: document.getElementById("subtasks_list"),
    hidden: document.getElementById("subtasks_input"),
  };
}

function handleViewActions(state, idx, action) {
  if (action === "edit") return enterEditMode(state, idx);
  if (action === "delete") return deleteSubtask(state, idx);
}

function handleEditActions(state, action) {
  if (action === "clear") return clearEditInput(state);
  if (action === "commit") return commitEdit(state);
}

function focusEditInput(state) {
  const el = state.ui.listEl.querySelector('li.is-editing input.subtask_edit');
  if (el) el.focus();
}

function clearEditInput(state) {
  const el = state.ui.listEl.querySelector('li.is-editing input.subtask_edit');
  if (el) el.value = "";
  if (el) el.focus();
}

function renderSubtasks(state) {
  state.ui.listEl.innerHTML = "";
  state.subtasks.forEach((text, idx) => {
    state.ui.listEl.appendChild(makeSubtaskLi(state, text, idx));
  });
}

function makeSubtaskLi(state, text, idx) {
  const li = document.createElement("li");
  li.dataset.index = String(idx);
  if (state.editingIndex === idx) li.classList.add("is-editing");

  li.appendChild(makeSubtaskMain(state, text, idx));
  li.appendChild(makeSubtaskActions());
  return li;
}

function makeSubtaskMain(state, text, idx) {
  if (state.editingIndex !== idx) {
    const span = document.createElement("span");
    span.textContent = text;
    return span;
  }
  const input = document.createElement("input");
  input.className = "subtask_edit";
  input.type = "text";
  input.value = text;
  input.addEventListener("click", (e) => e.stopPropagation());
  input.addEventListener("blur", () => commitEdit(state)); // optional: blur speichert
  return input;
}


function wireSubtaskListEvents(state) {
  state.ui.listEl.addEventListener("click", (e) => onSubtaskListClick(state, e));
  state.ui.listEl.addEventListener("keydown", (e) => onSubtaskListKeydown(state, e));
}

function onSubtaskListClick(state, e) {
  const li = e.target.closest("li[data-index]");
  if (!li) return;

  const idx = Number(li.dataset.index);
  const btn = e.target.closest("button[data-action]");

  if (!btn) return enterEditMode(state, idx);
  if (btn.dataset.action === "edit") return enterEditMode(state, idx);
  if (btn.dataset.action === "delete") return deleteSubtask(state, idx);
}

function onSubtaskListKeydown(state, e) {
  if (state.editingIndex === null) return;
  if (e.key === "Enter") { e.preventDefault(); commitEdit(state); }
  if (e.key === "Escape") exitEditMode(state);
}

function enterEditMode(state, idx) {
  state.editingIndex = idx;
  renderSubtasks(state);
  focusEditInputEnd(state);
}

function exitEditMode(state) {
  state.editingIndex = null;
  renderSubtasks(state);
}

function focusEditInputEnd(state) {
  const input = state.ui.listEl.querySelector("li.is-editing input.subtask_edit");
  if (!input) return;
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);
}

function commitEdit(state) {
  const input = state.ui.listEl.querySelector("li.is-editing input.subtask_edit");
  if (!input) return exitEditMode(state);

  const txt = input.value.trim();
  if (!txt) return; 

  state.subtasks[state.editingIndex] = txt;
  exitEditMode(state);
  syncSubtasksHidden(state);
}

function deleteSubtask(state, idx) {
  state.subtasks.splice(idx, 1);
  if (state.editingIndex === idx) state.editingIndex = null;
  renderSubtasks(state);
  syncSubtasksHidden(state);
}

function makeSubtaskActions() {
  const actions = document.createElement("div");
  actions.className = "subtask_actions";
  actions.appendChild(makeIconBtn("edit", editPencil));
  actions.appendChild(makeDivider());
  actions.appendChild(makeIconBtn("delete", recyBin));
  return actions;
}

function makeIconBtn(action, iconFn) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "icon-btn icon-btn--nohovercircle";
  btn.dataset.action = action;
  btn.innerHTML = iconFn({ width: 18, height: 18 });
  return btn;
}

function makeDivider() {
  const d = document.createElement("span");
  d.className = "subtask_divider";
  d.setAttribute("aria-hidden", "true");
  return d;
}

function bindAddTaskFormSubmitOnce() {
  const form = document.getElementById("addTaskForm");
  if (!form) return;
  if (form.dataset.submitBound === "1") return;
  form.dataset.submitBound = "1";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await addTask(); // deine bestehende Funktion
    } catch (err) {
      console.error("addTask failed", err);
    }
  });
}


window.initAssignedToDropdown = initAssignedToDropdown;