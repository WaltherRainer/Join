const dirtyTaskIds = new Set();
let currentDraggedTaskId;
let taskModalEscBound = false;

function initBoard() {
  checkIfUserIsLoggedIn();
  initSearchInput();
}

function bindTaskModalEscapeOnce(modal) {
  if (taskModalEscBound) return;
  taskModalEscBound = true;

  document.addEventListener("keydown", async (event) => {
    if (event.key !== "Escape") return;
    if (modal.open) {
      await closeTaskModal(modal, modal.dataset.taskId);
    }
  });
}

function loadTasksFromSession() {
  return JSON.parse(sessionStorage.getItem("tasks") || "{}");
}

function loadUsersFromSession() {
  return JSON.parse(sessionStorage.getItem("users") || "{}");
}

function initBoardEventList(users) {
  const btn = document.getElementById("openAddTaskModalBtn");
  if (!btn) return;
  btn.addEventListener("click", () => openAddTaskModal(0));
  const buttons = document.querySelectorAll(".add_task_trigger");
  if (!buttons) return;
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const status = Number(button.dataset.status) || 0;
      openAddTaskModal(status);
    });
});

  const taskSect = document.querySelectorAll(".task_section");
  if (taskSect.length === 0) return;

  taskSect.forEach((section) => {
    section.addEventListener("click", (e) => {
      if (e.target.tagName === "SELECT") return;
      const card = e.target.closest(".t_task");
      if (!card) return;
      const taskId = card.dataset.taskId;
      if (!taskId) return;
      openTaskModal(taskId, users);
    });
  });
}

function setSubmitLabel(form, label) {
  const btn = form.querySelector("#submit_task_form_btn");
  const span = btn?.querySelector(".btn_label");
  if (span) span.textContent = label;
}

function setSubmitEnabled(form, enabled) {
  const btn = form.querySelector("#submit_task_form_btn");
  if (!btn) return;
  btn.disabled = !enabled;
  btn.classList.toggle("is-disabled", !enabled);
}


function markEditFormDirty(form) {
  if (!form || form.dataset.editDirty === "1") return;
  form.dataset.editDirty = "1";
  setSubmitEnabled(form, true);
}


function installEditDirtyTracking(form) {
  form.dataset.editDirty = "0";
  setSubmitLabel(form, "OK");
  setSubmitEnabled(form, false);
  const mark = () => markEditFormDirty(form);
  form.addEventListener("input", mark, true);
  form.addEventListener("change", mark, true);
  form._markDirty = mark;
}


async function deleteTask(taskId) {
  const id = String(taskId || "").trim();
  if (!id) return;

  const modal = document.getElementById("show_task_modal");
  const users = modal?.__users;

  try {
    await deleteData(`tasks/${id}`);
    const tasks = loadTasksFromSession();
    delete tasks[id];
    saveTasksToSessionStorage(tasks);
    dirtyTaskIds?.delete?.(id);
    modal?.close?.();
    if (users) {
      loadTaskBoard(tasks, users);
    } else {
      console.warn("deleteTask: users missing on modal -> board not rerendered");
    }
  } catch (err) {
    console.error("deleteTask failed", err);
    alert("Löschen fehlgeschlagen. Details in der Konsole.");
  }
}


async function enterTaskEditMode(users) {
  // 1. Collect data and elements
  const { modal, host, wrapper, task, taskId } = getEditModeContext();
  if (!modal || !host || !wrapper || !task) return;

  // 2. Prepare DOM for edit mode
  prepareEditModeDOM(wrapper, host);

  // 3. Create and mount the form
  const form = await createEditTaskForm(host, task, taskId, users);

  // 4. Initialize dropdown controls
  initializeEditFormControls(form, users);

  // 5. Hydrate preset values into the controls
  hydrateEditFormValues(form, task, users);

  // 6. Synchronize visual representations
  syncEditFormDisplay(form, users);

  // 7. Apply edit mode styling and behavior
  setupEditModeUI(form, modal);

  // 8. Set focus to title field
  form.querySelector("#task_titel")?.focus();
}

function getEditModeContext() {
  const modal = document.getElementById("show_task_modal");
  const host = document.getElementById("EditTaskModalHost");
  const wrapper = document.getElementById("task_dialog_content_wrapper");
  const taskId = String(modal?.dataset.taskId || "");
  const tasks = loadTasksFromSession();
  const task = tasks[taskId];
  return { modal, host, wrapper, task, taskId };
}

function prepareEditModeDOM(wrapper, host) {
  wrapper.classList.add("is-hidden");
  host.innerHTML = "";
}

async function createEditTaskForm(host, task, taskId, users) {
  const tasks = loadTasksFromSession();
  const form = await mountTaskForm(host, {
    title: "Task bearbeiten",
    preset: task,
    onSubmitData: async (data, formEl) => {
      if (formEl.dataset.editDirty !== "1") return;
      const patch = buildTaskPatchFromFormData(data);
      tasks[taskId] = { ...tasks[taskId], ...patch };
      saveTasksToSessionStorage(tasks);
      await patchData("tasks", taskId, patch);
      exitEditMode();
      const ui = getTaskUi();
      renderTaskModal(taskId, ui, tasks, users);
      loadTaskBoard(tasks, users);
    },
  });
  return form;
}

function initializeEditFormControls(form, users) {
  initAssignedToDropdown(form, users);
  initTaskTypeDropdown(form, TASK_CATEGORIES);
  initSubtasksInput(form);
}

function hydrateEditFormValues(form, task, users) {
  const hidden = form.querySelector("#assigned_to_input");
  if (hidden && hidden.value) {
    try {
      const ids = JSON.parse(hidden.value);
      const ui = getAssignedToUi(form);
      const state = ui.root?._assignedState;
      if (state && Array.isArray(ids)) {
        ids.forEach(id => state.selected.add(id));
        renderUserList(state);
        applySelectionUi(state.ui, ids.map(id => users[id]?.givenName).filter(Boolean), state.selected, users);
      }
    } catch (e) {
      console.warn("hydrateEditFormValues: failed to parse assignedTo preset", e);
    }
  }
}

function syncEditFormDisplay(form, users) {
  syncTaskCatUI(form);
  syncAssignedToUI(form, users);
}

function setupEditModeUI(form, modal) {
  form.classList.add("edit_mode");
  renderIcons(modal);
  installEditDirtyTracking(form);

  const cancelBtn = form.querySelector("#clear_task_form_btn");
  cancelBtn?.classList.add("is-hidden");

  const submitBtn = form.querySelector("#submit_task_form_btn");
  submitBtn.querySelector(".btn_label").textContent = "OK";

  const actionBtn = form.querySelector(".form_actions");
  actionBtn?.classList.add("edit_mode");

  const addTaskFormRight = form.querySelector(".add_task_form_right");
  addTaskFormRight?.classList.add("edit_mode");

  const addTaskFormLeft = form.querySelector(".add_task_form_left");
  addTaskFormLeft?.classList.add("edit_mode");
}

function exitEditMode() {
  document.getElementById("EditTaskModalHost").innerHTML = "";
  document.getElementById("task_dialog_content_wrapper").classList.remove("is-hidden");
}

function syncTaskCatUI(form) {
  if (!form) return;

  const root = form.querySelector("#task_cat_select");
  if (!root) return;

  const taskCat = form.querySelector("#task_cat");
  const valueEl = root.querySelector(".single_select__value");
  const placeholder = root.querySelector(".single_select__placeholder");

  if (!taskCat || !valueEl || !placeholder) return;

  const val = String(taskCat.value || "").trim();
  if (!val) {
    // no category selected -> show placeholder, hide value element
    valueEl.textContent = "";
    valueEl.hidden = true;
    placeholder.hidden = false;
    return;
  }

  const cat = (Array.isArray(TASK_CATEGORIES) ? TASK_CATEGORIES : [])
    .find(c => c.value === val);

  // show the chosen label (or raw value if category list changed)
  valueEl.textContent = cat?.label || val;
  valueEl.hidden = false;
  placeholder.hidden = true;
}


function syncAssignedToUI(form, usersObj) {
  const assignedToInput = form.elements.assigned_to_input;
  const ids = safeParseArray(assignedToInput?.value);

  const placeholder = form.querySelector("#assigned_to_placeholder");
  const valueBox = form.querySelector("#assigned_to_value");
  const avatarContainer = form.querySelector("#assigned_avatar_container");

  if (!placeholder || !valueBox) return;

  if (!ids.length) {
    placeholder.assignedToInput = false;
    valueBox.assignedToInput = true;
    valueBox.textContent = "";
    return;
  }

  const names = ids
    .map((id) => usersObj?.[id]?.givenName)
    .filter(Boolean);

  placeholder.classList.add("is-hidden");      // Placeholder verstecken
  valueBox.assignedToInput = false;
  valueBox.textContent = names.length ? names.join(", ") : `${ids.length} selected`;

  renderAssignedAvatars(ids, usersObj, avatarContainer);

}

function syncSubtasksUI(form) {
  const subTask = form.elements.subtasks_json;
  const list = form.querySelector("#subtasks_list");
  if (!subTask || !list) return;

  const subTasks = safeParseArray(subTask.value);
  list.innerHTML = "";

  subTasks.forEach((st, idx) => {
    const li = document.createElement("li");
    li.textContent = st?.title ?? st?.name ?? `Subtask ${idx + 1}`;
    list.appendChild(li);
  });
}

function safeParseArray(str) {
  try {
    const v = JSON.parse(str || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function getTaskUi() {
  const titel = document.getElementById("tsk_dlg_h1");
  const descr = document.getElementById("tsk_dlg_h2");
  const dueDate = document.getElementById("tsk_dlg_due_date");
  const prio = document.getElementById("tsk_dlg_prio_div");
  const assignedTo = document.getElementById("tsk_dlg_assgnd_div");
  const subTaskDiv = document.getElementById("tsk_dlg_sbtsk");
  const SubTaskList = document.getElementById("subtasks_check_list");
  return {
    titel: titel,
    descr: descr,
    dueDate: dueDate,
    prio: prio,
    assignedTo: assignedTo,
    subTaskDiv: subTaskDiv,
    SubTaskList: SubTaskList,
  };
}

function initTaskModalEventList(modal) {
  if (modal.dataset.listenersBound === "true") return;
  modal.dataset.listenersBound = "true";

  modal.querySelector(".btn_close_modal")?.addEventListener("click", async () => {
    modal.querySelector("#EditTaskModalHost")?.replaceChildren();
    modal.querySelector("#task_dialog_content_wrapper")?.classList.remove("is-hidden");
    await closeTaskModal(modal, modal.dataset.taskId);
  });

  modal.addEventListener("click", async (e) => {
    if (e.target === modal) {
      modal.querySelector("#EditTaskModalHost")?.replaceChildren();
      modal.querySelector("#task_dialog_content_wrapper")?.classList.remove("is-hidden");
      await closeTaskModal(modal, modal.dataset.taskId);
    }
  });

  modal.querySelector("#btn_edit_task").addEventListener("click", () => {
    enterTaskEditMode(modal.__users || {});
  });

  modal.querySelector("#btn_delete_task").addEventListener("click", async () => {
    await deleteTask(modal.dataset.taskId);
  });

  modal.addEventListener("click", (event) => {
    const button = event.target.closest('button[data-action="toggle"]');
    if (!button) return;

    const ul = button.closest("#subtasks_check_list");
    if (!ul) return;

    const li = button.closest("li[data-index]");
    if (!li) return;

    const index = Number(li.dataset.index);
    toggleSubtaskDone(index, modal.dataset.taskId);
  });
}

function toggleSubtaskDone(index, taskId) {
  const tasks = loadTasksFromSession();
  const task = tasks[taskId];
  if (!task || !task.subTasks[index]) return;

  const done = !task.subTasks[index].done;
  task.subTasks[index].done = done;

  saveTasksToSessionStorage(tasks);
  dirtyTaskIds.add(taskId);

  const li = document.querySelector(`#subtasks_check_list li[data-index="${index}"]`);

  if (li) {
    li.classList.toggle("is-done", done);

    const btn = li.querySelector("button[data-action]");
    btn?.setAttribute("aria-pressed", String(done));
  }
}

async function closeTaskModal(modal, taskId) {
  const tasks = loadTasksFromSession();
  if (dirtyTaskIds.has(taskId)) {
    const task = tasks[taskId];
    if (task) {
      await saveTaskSubtasksToFirebase(taskId, task.subTasks);
      dirtyTaskIds.delete(taskId);
      updateTaskCard(taskId, tasks);
    }
  }
  modal.close?.();
}

async function saveTaskSubtasksToFirebase(taskId, subTasks) {
  return await patchData("tasks", taskId, { subTasks });
}

async function openTaskModal(taskId, users) {
  const tasks = JSON.parse(sessionStorage.getItem("tasks") || "{}");
  const modal = document.getElementById("show_task_modal");
  modal.__users = users;
  if (!modal) return;
  modal.dataset.taskId = String(taskId);
  modal.showModal();
  bindTaskModalEscapeOnce(modal);
  const ui = getTaskUi();
  renderTaskModal(taskId, ui, tasks, users);
  initTaskModalEventList(modal);
}

function renderTaskModal(taskId, ui, tasks, users) {
  const id = String(taskId).trim();
  const task = tasks[id];

  if (!task) {
    console.warn("Task nicht gefunden:", id);
    return;
  }

  ui.titel.textContent = task.titel;
  ui.descr.textContent = task.description ?? "(without description)";
  ui.dueDate.textContent = task.finishDate;
  ui.prio.innerHTML = getTaskDialogPrioTempl(task.priority);
  ui.assignedTo.innerHTML = renderAssignedTo(task, users);
  ui.SubTaskList.innerHTML = renderSubtasksContent(task);
  renderIcons();
}

function renderAssignedTo(task, users) {
  let assTo = "";
  if (!task || !Array.isArray(task.assignedTo) || task.assignedTo.length === 0) return assTo;

  task.assignedTo.forEach((element) => {
    const user = users?.[element];
    if (user) {
      const bgColor = colorIndexFromUserId(element);
      const userName = user.givenName || user.name || "";
      const initials = initialsFromGivenName(userName);
      assTo += getAssignedToTempl(initials, userName, bgColor);
    }
  });
  return assTo;
}

function renderSubtasksContent(task) {
  let subTaskCont = "";
  let index = 0;
  if (task.subTasks && typeof task.subTasks === "object" && task.subTasks.length > 0) {
    task.subTasks.forEach((element) => {
      let subTaskTitel = element.title;
      let done = element.done;
      subTaskCont += getTaskDialSubtaskTempl(subTaskTitel, done, index);
      index++;
    });
  }
  return subTaskCont;
}

function getBoardContainers() {
  const toDoDiv = document.getElementById("task_to_do");
  const inProgressDiv = document.getElementById("task_progress");
  const awaitfeedbackdiv = document.getElementById("task_await");
  const doneDiv = document.getElementById("task_done");
  if (!toDoDiv || !inProgressDiv || !awaitfeedbackdiv || !doneDiv) {
    console.error("getBoardContainers: missing containers");
    return null;
  }
  return { toDoDiv, inProgressDiv, awaitfeedbackdiv, doneDiv };
}

function findStatusName(status) {
  if(statusTypes[status] == "In Progress"){
    return "Progress";
  } else {
    return statusTypes[status] || "Unknown";
  }
}

function switchStatusContainer(taskId, newStatusNum) {
  currentDraggedTaskId = taskId;
  const tasks = loadTasksFromSession();
  const task = tasks[taskId];
  const users = loadUsersFromSession();
  
  if (!task) return;
  
  const newStatus = Number(newStatusNum);
  const tasksInStatus = sortTasksInStatus(newStatus, tasks);
  
  // Insert at the beginning (position 0)
  const insertIndex = 0;
  deleteAndAddTaskInStatusPosition(tasksInStatus, insertIndex, tasks);
  reRenderTasksInOrder(tasksInStatus, tasks, users, newStatus);
  currentDraggedTaskId = null;
}


function statusContainerFor(status, containers) {
  if (status === 0) return containers.toDoDiv;
  if (status === 1) return containers.inProgressDiv;
  if (status === 2) return containers.awaitfeedbackdiv;
  if (status === 3) return containers.doneDiv;
  return containers.toDoDiv; // fallback
}

function renderItems(items, containers, users) {
  containers.toDoDiv.innerHTML = "";
  containers.inProgressDiv.innerHTML = "";
  containers.awaitfeedbackdiv.innerHTML = "";
  containers.doneDiv.innerHTML = "";

  // Sortiere Tasks nach ihrer Reihenfolge innerhalb der Kategorie
  const sortedItems = items.sort((a, b) => (a.order || 0) - (b.order || 0));
  const isDraggable = window.innerWidth > 880;
  sortedItems.forEach((task) => {
    const taskHTML = taskItemTemplate(task, users, isDraggable);
    const target = statusContainerFor(task.status, containers);
    target.insertAdjacentHTML("beforeend", taskHTML);
    renderIcons(target);
  });
}

function renderEmptyStates(containers) {
  const isEmpty = (el) => !el.querySelector(".t_task");
  if (isEmpty(containers.toDoDiv)) containers.toDoDiv.insertAdjacentHTML("beforeend", noTaskTemplate("No task To do"));
  if (isEmpty(containers.inProgressDiv)) containers.inProgressDiv.insertAdjacentHTML("beforeend", noTaskTemplate("No task In progress"));
  if (isEmpty(containers.awaitfeedbackdiv)) containers.awaitfeedbackdiv.insertAdjacentHTML("beforeend", noTaskTemplate("No task Await feedback"));
  if (isEmpty(containers.doneDiv)) containers.doneDiv.insertAdjacentHTML("beforeend", noTaskTemplate("No task Done"));
}

function loadTaskBoard(tasks, users) {
  const containers = getBoardContainers();
  if (!containers) return;

  const items = Array.isArray(tasks) ? tasks : returnArrayOfTasks(tasks);

  renderItems(items, containers, users);
  renderEmptyStates(containers);
  initBoardEventList(users);
}

const returnArrayOfTasks = (tasks) => {
  if (tasks && typeof tasks === "object" && !Array.isArray(tasks)) {
    return Object.entries(tasks).map(([id, t]) => ({ id, ...t }));
  } else if (Array.isArray(tasks)) {
    return tasks;
  } else {
    return [];
  }
};

function findUserDataNameAndColor(item, users = window.users || {}) {
  if (!item) return null;

  // item can be a userId (string) or an object with userId/id/givenName/name
  if (typeof item === "string") {
    const user = users?.[item];
    if (!user) return null;
    const givenName = user.givenName || user.name;
    if (!givenName) return null;
    return { initials: initialsFromGivenName(givenName, ""), bgColor: colorIndexFromUserId(item) };
  }

  if (typeof item === "object") {
    const userId = item.userId || item.id;
    const givenName = item.givenName || item.name;
    if (givenName) {
      return { initials: initialsFromGivenName(givenName, ""), bgColor: colorIndexFromUserId(userId || "") };
    }
    if (userId && users?.[userId]) {
      const user = users[userId];
      const name = user.givenName || user.name;
      if (name) return { initials: initialsFromGivenName(name, ""), bgColor: colorIndexFromUserId(userId) };
    }
  }

  return null; // nothing usable
}

function mapAssignedTo(assignedTo, users = window.users || {}) {
  if (!assignedTo || !Array.isArray(assignedTo)) return "";
  const entries = assignedTo.map((item) => findUserDataNameAndColor(item, users)).filter(Boolean);

  if (entries.length === 0) return "";

  const maxVisible = 3;
  const visible = entries
    .slice(0, maxVisible)
    .map(
      ({ initials, bgColor }) => `
      <span class="user_avatar_small" style="background-color: var(--user_c_${bgColor});">${escapeHtml(initials)}</span>
    `,
    )
    .join("");

  if (entries.length > maxVisible) {
    const remaining = entries.length - maxVisible;
    return visible + `\n      <span class="user_avatar_more">+${remaining}</span>`;
  }

  return visible;
}

function searchBoardTasks() {
  const inputWord = document.getElementById("input_search_task").value.trim().replace(/\s+/g, ' ').toLowerCase();
  const tasks = returnArrayOfTasks(loadTasksFromSession());
  const filteredTasks = filterTasksBySearch(tasks, inputWord);
  updateNoResultsMessage(filteredTasks);
  loadTaskBoard(filteredTasks, loadUsersFromSession());
}

function filterTasksBySearch(tasks, inputWord) {
  if (!inputWord) return tasks;
  return tasks.filter(task =>
    task.titel?.trim().replace(/\s+/g, ' ').toLowerCase().includes(inputWord) || 
    (task.description?.trim().replace(/\s+/g, ' ').toLowerCase().includes(inputWord))
  );
}

function initSearchInput() {
  const input = document.getElementById("input_search_task");
  if (!input) return;
  input.addEventListener("input", searchBoardTasks);
}

function updateNoResultsMessage(filteredTasks) {
  let messageEl = document.getElementById("no_results_message");
  if (filteredTasks.length === 0) {
    messageEl.classList.remove("is-hidden");
  } else {
    messageEl.classList.add("is-hidden");
  }

}