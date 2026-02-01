const dirtyTaskIds = new Set();
let currentDraggedTaskId;
let taskModalEscBound = false;

function initBoard() {
  checkIfUserIsLoggedIn();
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
  btn.addEventListener("click", openAddTaskModal);

  const taskSect = document.querySelectorAll(".task_section");
  if (taskSect.length === 0) return;

  taskSect.forEach((section) => {
    section.addEventListener("click", (e) => {
      const card = e.target.closest(".t_task");
      if (!card) return;
      const taskId = card.dataset.taskId;
      if (!taskId) return;
      openTaskModal(taskId, users);
    });
  });
}

function deleteTask(taskId) {
  console.log(taskId);
  console.log("Hier sollte die Löschfunktion implementiert werden.");
}

async function enterTaskEditMode(users) {
  const modal = document.getElementById("show_task_modal");
  const host = document.getElementById("EditTaskModalHost");
  const wrapper = document.getElementById("task_dialog_content_wrapper");
  const taskId = modal.dataset.taskId;
  const tasks = JSON.parse(sessionStorage.getItem("tasks") || "{}");
  const task = tasks[String(taskId)];
  if (!task) return;

  wrapper.classList.add("is-hidden");
  host.innerHTML = "";

  const form = await mountTaskForm(host, {
    title: "Task bearbeiten",
    preset: task,
    onSubmitData: async (data) => {
      tasks[String(taskId)] = {
        ...task,
        titel: data.titel,
        description: data.description,
        finishDate: data.finishDate,
        priority: data.priority,
        type: data.type,
        assignedTo: data.assignedTo,
        subTasks: data.subTasks,
      };
      sessionStorage.setItem("tasks", JSON.stringify(tasks));

      exitEditMode();
      const ui = getTaskUi();
      renderTaskModal(taskId, ui, tasks, users);
    },
  });

  initAssignedToDropdown(form, users);
  resetAssignedToDropdown(form);
  initTaskTypeDropdown(form, TASK_CATEGORIES);
  initSubtasksInput(form);
  renderIcons(modal);

  syncTypeUIFromHidden(form);
  syncAssignedUIFromHidden(form, users);
  syncSubtasksUIFromHidden(form);

  form.classList.add("edit_mode");
  const cancelBtn = form.querySelector("#clear_task_form_btn");
  cancelBtn?.classList.add("is-hidden");

  const submitBtn = form.querySelector("#submit_task_form_btn");
  submitBtn.querySelector(".btn_label").textContent = "OK";

  const actionBtn = form.querySelector(".form_actions");
  actionBtn.classList.add("edit_mode");

  const addTaskFormRight = form.querySelector(".add_task_form_right");
  addTaskFormRight.classList.add("edit_mode");

  const addTaskFormLeft = form.querySelector(".add_task_form_left");
  addTaskFormLeft.classList.add("edit_mode");


  form.querySelector("#task_titel")?.focus();

}

function exitEditMode() {
  document.getElementById("EditTaskModalHost").innerHTML = "";
  document.getElementById("task_dialog_content_wrapper").classList.remove("is-hidden");
}

function syncTypeUIFromHidden(form) {
  const hidden = form.elements.task_cat;
  const control = form.querySelector("#task_cat_control");
  const placeholder = control?.querySelector(".single_select__placeholder");
  const valueSpan = control?.querySelector(".single_select__value");

  if (!hidden || !control) return;

  const type = hidden.value?.trim();
  if (!type) return;

  const label = TASK_CATEGORIES[type];

  if (placeholder) placeholder.hidden = true;
  if (valueSpan) {
    valueSpan.hidden = false;
    valueSpan.textContent = label;
  }
}

function syncAssignedUIFromHidden(form, usersObj) {
  const hidden = form.elements.assigned_to_input; // <input type="hidden" id="assigned_to_input" ...>
  const ids = safeParseArray(hidden?.value);

  const placeholder = form.querySelector("#assigned_to_placeholder");
  const valueBox = form.querySelector("#assigned_to_value");

  if (!placeholder || !valueBox) return;

  if (!ids.length) {
    placeholder.hidden = false;
    valueBox.hidden = true;
    valueBox.textContent = "";
    return;
  }

  const names = ids
  .map((id) => usersObj?.[id]?.givenName)
  .filter(Boolean);

  placeholder.hidden = true;
  valueBox.hidden = false;
  valueBox.textContent = names.length ? names.join(", ") : `${ids.length} selected`;
}

function syncSubtasksUIFromHidden(form) {
  const hidden = form.elements.subtasks_json;
  const list = form.querySelector("#subtasks_list");
  if (!hidden || !list) return;

  const subTasks = safeParseArray(hidden.value);
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

  document.getElementById("btn_edit_task").addEventListener("click", () => {
    enterTaskEditMode(modal.__users || {});
  });

  document.getElementById("btn_delete_task").addEventListener("click", () => {
    deleteTask(modal.dataset.taskId);
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
  task.assignedTo.forEach((element) => {
    let user = users[element];
    if (user) {
      let bgColor = colorIndexFromUserId(element);
      let userName = user.givenName;
      let initials = initialsFromGivenName(userName);
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

  sortedItems.forEach((task) => {
    const taskHTML = taskItemTemplate(task, users);
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
  const items = returnArrayOfTasks(tasks);
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
