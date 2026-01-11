function initBoardModalButtons() {
  const btn = document.getElementById("openAddTaskModalBtn");
  if (!btn) return;
  btn.addEventListener("click", openAddTaskModal);

  const taskSect = document.querySelectorAll(".task_section");
  if (taskSect.length === 0) return;

  taskSect.forEach(section => {
    section.addEventListener("click", (e) => {
      const card = e.target.closest(".t_task");
      if (!card) return;

      // console.log(card.dataset.taskId);

      const taskId = card.dataset.taskId;
      if (!taskId) return;
      renderTaskModal(taskId);
      // setActiveTaskCard(card);
    });
  });
}

function showTaskModal() {
  const modal = document.getElementById("show_task_modal");
  
  modal.showModal();
}

function renderTaskModal(taskId) {

  showTaskModal();

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

function renderItems(items, containers, users) {
  containers.toDoDiv.innerHTML = "";
  containers.inProgressDiv.innerHTML = "";
  containers.awaitfeedbackdiv.innerHTML = "";
  containers.doneDiv.innerHTML = "";
  items.forEach(task => {
    const taskHTML = taskItemTemplate(task, users);
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

function loadTaskBoard(tasks, users) {
  const containers = getBoardContainers();
  if (!containers) return;
  const items = returnArrayOfTasks(tasks);
  renderItems(items, containers, users);
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