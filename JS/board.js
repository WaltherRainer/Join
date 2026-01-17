const dirtyTaskIds = new Set();

let currentDraggedTaskId;

function loadTasksFromSession() {
  return JSON.parse(sessionStorage.getItem("tasks") || "{}");
}

function saveTasksToSession(tasks) {
  sessionStorage.setItem("tasks", JSON.stringify(tasks));
}

function initBoard() {
  checkIfUserIsLoggedIn();
}

function initBoardEventList(tasks, users) {
  const btn = document.getElementById("openAddTaskModalBtn");
  if (!btn) return;
  btn.addEventListener("click", openAddTaskModal);

  const taskSect = document.querySelectorAll(".task_section");
  if (taskSect.length === 0) return;

  taskSect.forEach(section => {
    section.addEventListener("click", (e) => {
      const card = e.target.closest(".t_task");
      if (!card) return;
      const taskId = card.dataset.taskId;
      if (!taskId) return;
      openTaskModal(taskId, tasks, users);
    });
  });

  console.log(tasks)
}

function deleteTask(taskId) {
  console.log(taskId)
}

function initEditMode() {
  console.log("edit")
}

function initTaskModal(tasks) {
  const ui = getTaskUi();
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

function initTaskModalEventList(modal, taskId, tasks) {

    listenEscapeFromModal(async () => {
    await closeTaskModal(modal, taskId);
  });

  document.getElementById("tsk_dlg_close").addEventListener("click", async () => {
    await closeTaskModal(modal, taskId);
  });

  modal.addEventListener("click", async (e) => {
    if (e.target === modal) await closeTaskModal(modal, taskId);
  });

  const editBtn = document.getElementById("btn_edit_task");
  editBtn.addEventListener("click", initEditMode);

  const deleteBtn = document.getElementById("btn_delete_task");
  deleteBtn.addEventListener("click", () => deleteTask(taskId));

  const subTaskLi = document.getElementById("subtasks_check_list");
  subTaskLi.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const li = button.closest("li");
    const index = Number(li.dataset.index);
    console.log(index);
    toggleSubtaskDone(index, taskId, tasks)
});
}


function toggleSubtaskDone(index, taskId) {
  const tasks = loadTasksFromSession();
  const task = tasks[taskId];
  if (!task || !task.subTasks[index]) return;

  const done = !task.subTasks[index].done;
  task.subTasks[index].done = done;

  saveTasksToSession(tasks);
  dirtyTaskIds.add(taskId);

  const li = document.querySelector(
    `#subtasks_check_list li[data-index="${index}"]`
  );

  if (li) {
    li.classList.toggle("is-done", done);

    const btn = li.querySelector("button[data-action]");
    btn?.setAttribute("aria-pressed", String(done));
  }
}


async function closeTaskModal(modal, taskId) {
  if (dirtyTaskIds.has(taskId)) {
    const tasks = loadTasksFromSession();
    const task = tasks[taskId];
    if (task) {
      await saveTaskSubtasksToFirebase(taskId, task.subTasks); 
      dirtyTaskIds.delete(taskId);
    }
  }
  modal.close?.();
//Hier noch die aktualisierung des Boards triggern

}

async function saveTaskSubtasksToFirebase(taskId, subTasks) {
  return await patchData("tasks", taskId, { subTasks });
}


async function openTaskModal(taskId, tasks, users) {
  const modal = document.getElementById("show_task_modal");
  if (!modal) return;

  modal.showModal();
  

  const ui = getTaskUi();
  renderTaskModal(taskId, ui, tasks, users);

  initTaskModalEventList(modal, taskId, tasks);


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
  let assTo = ""
  task.assignedTo.forEach(element => {
    console.log(task.assignedTo)
    let user = users[element];
    if (user) {
      console.log(user);
      let bgColor = colorIndexFromUserId(element);
      let userName = user.givenName;
      let initials = initialsFromGivenName(userName);
      assTo += getAssignedToTempl(initials, userName, bgColor);
    }
  });
return assTo;
}


function renderSubtasksContent(task) {
  let subTaskCont = ""
  let index = 0;
  if (task.subTasks && typeof task.subTasks === "object" && task.subTasks.length > 0) {
    task.subTasks.forEach(element => {
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
  items.forEach(task => {
    const taskHTML = taskItemTemplate(task, users);
    const target = statusContainerFor(task.status, containers);
    target.insertAdjacentHTML('beforeend', taskHTML);
    renderIcons(target);
  });
  
}

function renderEmptyStates(containers) {
  const isEmpty = el => !el.querySelector('.t_task');
  if (isEmpty(containers.toDoDiv)) containers.toDoDiv.insertAdjacentHTML('beforeend', noTaskTemplate("No task To do"));
  if (isEmpty(containers.inProgressDiv)) containers.inProgressDiv.insertAdjacentHTML('beforeend', noTaskTemplate("No task In progress"));
  if (isEmpty(containers.awaitfeedbackdiv)) containers.awaitfeedbackdiv.insertAdjacentHTML('beforeend', noTaskTemplate("No task Await feedback"));
  if (isEmpty(containers.doneDiv)) containers.doneDiv.insertAdjacentHTML('beforeend', noTaskTemplate("No task Done"));
}

function loadTaskBoard(tasks, users) {
  const containers = getBoardContainers();
  if (!containers) return;
  const items = returnArrayOfTasks(tasks);
  renderItems(items, containers, users);
  renderEmptyStates(containers);
  initBoardEventList(tasks, users);
}

const returnArrayOfTasks = (tasks) => {
  if (tasks && typeof tasks === "object" && !Array.isArray(tasks)) {
    return Object.entries(tasks).map(([id, t]) => ({ id, ...t }));
  } else if (Array.isArray(tasks)) {
    return tasks;
  } else {
    return [];
  }
}

function findUserDataNameAndColor(item, users = window.users || {}) {
  if (!item) return null;

  // item can be a userId (string) or an object with userId/id/givenName/name
  if (typeof item === 'string') {
    const user = users?.[item];
    if (!user) return null; // skip undefined user ids
    const givenName = user.givenName || user.name;
    if (!givenName) return null; // no displayable name
    return { initials: initialsFromGivenName(givenName, ''), bgColor: colorIndexFromUserId(item) };
  }

  if (typeof item === 'object') {
    const userId = item.userId || item.id;
    const givenName = item.givenName || item.name;
    if (givenName) {
      return { initials: initialsFromGivenName(givenName, ''), bgColor: colorIndexFromUserId(userId || '') };
    }
    if (userId && users?.[userId]) {
      const user = users[userId];
      const name = user.givenName || user.name;
      if (name) return { initials: initialsFromGivenName(name, ''), bgColor: colorIndexFromUserId(userId) };
    }
  }

  return null; // nothing usable
}

function mapAssignedTo(assignedTo, users = window.users || {}) {
  if (!assignedTo || !Array.isArray(assignedTo)) return "";
  const entries = assignedTo
    .map(item => findUserDataNameAndColor(item, users))
    .filter(Boolean);

  if (entries.length === 0) return "";

  const maxVisible = 3;
  const visible = entries.slice(0, maxVisible)
    .map(({ initials, bgColor }) => `
      <span class="user_avatar_small" style="background-color: var(--user_c_${bgColor});">${escapeHtml(initials)}</span>
    `)
    .join("");

  if (entries.length > maxVisible) {
    const remaining = entries.length - maxVisible;
    return visible + `\n      <span class="user_avatar_more">+${remaining}</span>`;
  }

  return visible;
}

function startDragTask(id) {
  currentDraggedTaskId = id;
}

function allowDrop(event) {
  event.preventDefault();
}

function dropTask(status) {
  const tasks = loadTasksFromSession();
  const users = window.users || {};
  
  if (currentDraggedTaskId && tasks[currentDraggedTaskId]) {
    tasks[currentDraggedTaskId].status = status;
    saveTasksToSession(tasks);
  }
  
  loadTaskBoard(tasks, users);
}