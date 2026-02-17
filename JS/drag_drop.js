
function startDragTask(id) {
  currentDraggedTaskId = id;
  const taskElement = document.querySelector(`[data-task-id="${id}"]`);
  if (taskElement) {
    taskElement.classList.add("dragging-task");
  }
}

function endDragTask(event, id) {
  currentDraggedTaskId = null;
  document.querySelectorAll(".task_list_div").forEach((div) => {
    div.querySelectorAll(".drag-placeholder").forEach((el) => el.remove());
  });
  const taskElement = document.querySelector(`[data-task-id="${id}"]`);
  if (taskElement) {
    taskElement.classList.remove("dragging-task");
  }
}

function findDropPosition(event, taskElements) {
  for (let i = 0; i < taskElements.length; i++) {
    const rect = taskElements[i].getBoundingClientRect();
    if (event.clientY < rect.top + rect.height / 2) {
      return i;
    }
  }
  return taskElements.length;
}

function allowDrop(event) {
  event.preventDefault();
  const dropZone = event.currentTarget;
  
  document.querySelectorAll(".drag-placeholder").forEach((el) => el.remove());
  
  const taskElements = Array.from(dropZone.querySelectorAll(".t_task"));

  dropZone.querySelectorAll(".drag-placeholder").forEach((el) => el.remove());

  let insertBeforeElement = null;
  insertBeforeElement = taskElements[findDropPosition(event, taskElements)];

  const placeholder = document.createElement("div");
  placeholder.className = "drag-placeholder";

  if (insertBeforeElement) {
    insertBeforeElement.parentNode.insertBefore(placeholder, insertBeforeElement);
  } else {
    dropZone.appendChild(placeholder);
  }
}

function dropTask(event, status) {
  event.preventDefault();
  const tasks = loadTasksFromSession();
  const users = loadUsersFromSession();

  if (!currentDraggedTaskId || !tasks[currentDraggedTaskId]) return;

  const dropZone = event.currentTarget;
  const taskElements = Array.from(dropZone.querySelectorAll(".t_task"));

  insertIndex = findDropPosition(event, taskElements);
  const tasksInStatus = sortTasksInStatus(status, tasks);
  deleteAndAddTaskInStatusPosition(tasksInStatus, insertIndex, tasks);
  reRenderTasksInOrder(tasksInStatus, tasks, users, status);
}

function sortTasksInStatus(status, tasks) {
  const tasksInStatus = Object.entries(tasks)
    .filter(([_, task]) => task.status === status)
    .map(([id, task]) => ({ id, task }))
    .sort((a, b) => (a.task.order || 0) - (b.task.order || 0));
  return tasksInStatus;
}

function deleteAndAddTaskInStatusPosition(tasksInStatus, insertIndex, tasks) {
  const oldTaskIndex = tasksInStatus.findIndex(({ id }) => id === currentDraggedTaskId);
  let draggedTaskData = null;

  if (oldTaskIndex !== -1) {
    draggedTaskData = tasksInStatus[oldTaskIndex];
    tasksInStatus.splice(oldTaskIndex, 1);
    if (oldTaskIndex < insertIndex) {
      insertIndex--;
    }
  } else {
    draggedTaskData = { id: currentDraggedTaskId, task: tasks[currentDraggedTaskId] };
  }

  if (draggedTaskData && draggedTaskData.task) {
    tasksInStatus.splice(insertIndex, 0, draggedTaskData);
  }
}

function reRenderTasksInOrder(tasksInStatus, tasks, users, status) {
  tasks[currentDraggedTaskId].status = status;
  tasksInStatus.forEach(({ id }, index) => {
    tasks[id].order = index;
  });

  saveTasksToSessionStorage(tasks);
  patchData("tasks", currentDraggedTaskId, { status, order: tasks[currentDraggedTaskId].order });
  loadTaskBoard(tasks, users);
}

function removeDragPlaceholder(event) {
  if (event.target === event.currentTarget) {
    const dropZone = event.currentTarget;
    console.log(dropZone)
    dropZone.querySelectorAll(".drag-placeholder").forEach((el) => el.remove());
  }
}
