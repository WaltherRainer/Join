/**
 * Initiates drag operation for a task.
 *
 * Sets the currently dragged task ID and adds visual styling.
 *
 * @param {string} id - The ID of the task being dragged.
 */
function startDragTask(id) {
  currentDraggedTaskId = id;
  const taskElement = document.querySelector(`[data-task-id="${id}"]`);
  if (taskElement) {
    taskElement.classList.add("dragging-task");
  }
}

/**
 * Ends drag operation for a task.
 *
 * Clears the dragged task ID, removes placeholders, and resets styling.
 *
 * @param {DragEvent} event - The drag event.
 * @param {string} id - The ID of the task being dragged.
 */
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

/**
 * Finds the drop position index for a dragged task.
 *
 * Determines where to insert the task based on cursor position relative to existing tasks.
 *
 * @param {DragEvent} event - The drag event with cursor coordinates.
 * @param {Array<HTMLElement>} taskElements - Array of task elements in the drop zone.
 * @returns {number} The index where the task should be inserted.
 */
function findDropPosition(event, taskElements) {
  for (let i = 0; i < taskElements.length; i++) {
    const rect = taskElements[i].getBoundingClientRect();
    if (event.clientY < rect.top + rect.height / 2) {
      return i;
    }
  }
  return taskElements.length;
}

/**
 * Allows drop operation and shows visual placeholder.
 *
 * Prevents default behavior, removes old placeholders, and inserts new placeholder
 * at the calculated drop position.
 *
 * @param {DragEvent} event - The dragover event.
 */
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

/**
 * Handles task drop operation.
 *
 * Finalizes task move by updating status and order, then re-rendering board.
 *
 * @param {DragEvent} event - The drop event.
 * @param {number} status - The new status code for the dropped task.
 */
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

/**
 * Sorts tasks within a status category by order.
 *
 * @param {number} status - The status code to filter by.
 * @param {Object} tasks - Tasks data object.
 * @returns {Array<Object>} Sorted array of task objects with id and task data.
 */
function sortTasksInStatus(status, tasks) {
  const tasksInStatus = Object.entries(tasks)
    .filter(([_, task]) => task.status === status)
    .map(([id, task]) => ({ id, task }))
    .sort((a, b) => (a.task.order || 0) - (b.task.order || 0));
  return tasksInStatus;
}

/**
 * Removes dragged task from old position and inserts at new position.
 *
 * Modifies the tasksInStatus array in place, adjusting insert index if needed.
 *
 * @param {Array<Object>} tasksInStatus - Array of tasks in the target status.
 * @param {number} insertIndex - Index where task should be inserted.
 * @param {Object} tasks - Tasks data object.
 */
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

/**
 * Re-renders board after task reordering.
 *
 * Updates task status and order values, saves to sessionStorage and Firebase,
 * then refreshes the board display.
 *
 * @param {Array<Object>} tasksInStatus - Sorted tasks in the status category.
 * @param {Object} tasks - Tasks data object.
 * @param {Object} users - Users data object.
 * @param {number} status - The status code of the category.
 */
function reRenderTasksInOrder(tasksInStatus, tasks, users, status) {
  tasks[currentDraggedTaskId].status = status;
  tasksInStatus.forEach(({ id }, index) => {
    tasks[id].order = index;
  });

  saveTasksToSessionStorage(tasks);
  patchData("tasks", currentDraggedTaskId, { status, order: tasks[currentDraggedTaskId].order });
  loadTaskBoard(tasks, users);
}

/**
 * Removes drag placeholder from drop zone.
 *
 * @param {DragEvent} event - The dragleave event.
 */
function removeDragPlaceholder(event) {
  if (event.target === event.currentTarget) {
    const dropZone = event.currentTarget;
    dropZone.querySelectorAll(".drag-placeholder").forEach((el) => el.remove());
  }
}
