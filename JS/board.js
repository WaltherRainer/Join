

function initBoardModalButton() {
  const btn = document.getElementById("openAddTaskModalBtn");
  if (!btn) return;
  btn.addEventListener("click", openAddTaskModal);
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
  const s = String(status || "").toLowerCase();
  if (s.includes("to do") || s === "to do") return containers.toDoDiv;
  if (s.includes("in progress")) return containers.inProgressDiv;
  if (s.includes("await")) return containers.awaitfeedbackdiv;
  if (s.includes("done")) return containers.doneDiv;
  return containers.toDoDiv; // fallback
}

function renderItems(items, containers) {
  containers.toDoDiv.innerHTML = "";
  containers.inProgressDiv.innerHTML = "";
  containers.awaitfeedbackdiv.innerHTML = "";
  containers.doneDiv.innerHTML = "";
  items.forEach(task => {
    const taskHTML = taskItemTemplate(task);
    const target = statusContainerFor(task.status, containers);
    target.insertAdjacentHTML('beforeend', taskHTML);
  });
}

function renderEmptyStates(containers) {
  const isEmpty = el => !el.querySelector('.t_task');
  if (isEmpty(containers.toDoDiv)) containers.toDoDiv.insertAdjacentHTML('beforeend', noTaskTemplate("No task To do"));
  if (isEmpty(containers.inProgressDiv)) containers.inProgressDiv.insertAdjacentHTML('beforeend', noTaskTemplate("No task In progress"));
  if (isEmpty(containers.awaitfeedbackdiv)) containers.awaitfeedbackdiv.insertAdjacentHTML('beforeend', noTaskTemplate("No task Await feedback"));
  if (isEmpty(containers.doneDiv)) containers.doneDiv.insertAdjacentHTML('beforeend', noTaskTemplate("No task Done"));
}

function loadTaskBoard(tasks) {
  const containers = getBoardContainers();
  if (!containers) return;
  const items = returnArrayOfTasks(tasks);
  renderItems(items, containers);
  renderEmptyStates(containers);
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