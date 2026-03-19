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
 * Removes all currently visible drag placeholders from the board.
 *
 * @returns {void}
 */
function removeAllDragPlaceholders() {
  document.querySelectorAll(".drag-placeholder").forEach((el) => el.remove());
}

/**
 * Finds the task element before which the placeholder should be inserted.
 *
 * @param {DragEvent} event - The dragover event.
 * @param {HTMLElement} dropZone - The target drop zone.
 * @returns {HTMLElement|null} Task element to insert before, or null to append at end.
 */
function getInsertBeforeElement(event, dropZone) {
  const taskElements = Array.from(dropZone.querySelectorAll(".t_task"));
  const insertIndex = findDropPosition(event, taskElements);
  return taskElements[insertIndex] || null;
}

/**
 * Creates the drag placeholder element.
 *
 * @returns {HTMLDivElement} New placeholder element.
 */
function createDragPlaceholder() {
  const placeholder = document.createElement("div");
  placeholder.className = "drag-placeholder";
  return placeholder;
}

/**
 * Inserts the drag placeholder into the drop zone.
 *
 * @param {HTMLElement} dropZone - The target drop zone.
 * @param {HTMLElement|null} insertBeforeElement - Element to insert before, or null to append.
 * @param {HTMLDivElement} placeholder - Placeholder element to insert.
 * @returns {void}
 */
function insertDragPlaceholder(dropZone, insertBeforeElement, placeholder) {
  if (insertBeforeElement) {
    insertBeforeElement.parentNode.insertBefore(placeholder, insertBeforeElement);
  } else {
    dropZone.appendChild(placeholder);
  }
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
  removeAllDragPlaceholders();
  const insertBeforeElement = getInsertBeforeElement(event, dropZone);
  const placeholder = createDragPlaceholder();
  insertDragPlaceholder(dropZone, insertBeforeElement, placeholder);
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
 * Removes the currently dragged task from its old position (if present) and
 * inserts it at the desired index within the same status list.
 *
 * Delegates lookup/removal and index correction to {@link extractDraggedTaskData}.
 *
 * @function deleteAndAddTaskInStatusPosition
 * @param {Array<{id:string|number, task:any}>} tasksInStatus - List of tasks for one status.
 * @param {number} insertIndex - Target index where the dragged task should be inserted.
 * @param {Object<string|number, any>} tasks - Global tasks map used as fallback source.
 * @returns {void}
 */
function deleteAndAddTaskInStatusPosition(tasksInStatus, insertIndex, tasks) {
  const { draggedTaskData, correctedIndex } = extractDraggedTaskData(tasksInStatus, insertIndex, tasks);
  if (draggedTaskData?.task) tasksInStatus.splice(correctedIndex, 0, draggedTaskData);
}

/**
 * Finds the dragged task in the status list, removes it if present, and returns
 * the task data along with a corrected insertion index.
 *
 * If the task is not already in the status list, a fallback object is created
 * from `tasks[currentDraggedTaskId]`.
 *
 * @function extractDraggedTaskData
 * @param {Array<{id:string|number, task:any}>} tasksInStatus - List of tasks for one status.
 * @param {number} insertIndex - Desired insertion index.
 * @param {Object<string|number, any>} tasks - Global tasks map used as fallback source.
 * @returns {{draggedTaskData: ({id:any, task:any}|null), correctedIndex: number}}
 */
function extractDraggedTaskData(tasksInStatus, insertIndex, tasks) {
  const oldIndex = tasksInStatus.findIndex(({ id }) => id === currentDraggedTaskId);
  if (oldIndex !== -1) {
    const draggedTaskData = tasksInStatus.splice(oldIndex, 1)[0];
    return { draggedTaskData, correctedIndex: oldIndex < insertIndex ? insertIndex - 1 : insertIndex };
  }
  return { draggedTaskData: { id: currentDraggedTaskId, task: tasks?.[currentDraggedTaskId] }, correctedIndex: insertIndex };
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

/**
 * Retrieves DOM elements for task category UI.
 *
 * @param {HTMLFormElement} form - The form element.
 * @returns {Object|null} Object with root, taskCat, valueEl, placeholder elements, or null if not found.
 */
function getTaskCategoryElements(form) {
  const root = form.querySelector("#task_cat_select");
  if (!root) return null;
  const taskCat = form.querySelector("#task_cat");
  const valueEl = root.querySelector(".single_select__value");
  const placeholder = root.querySelector(".single_select__placeholder");
  if (!taskCat || !valueEl || !placeholder) return null;
  return { taskCat, valueEl, placeholder };
}

/**
 * Hides the category value and shows placeholder.
 *
 * @param {HTMLElement} valueEl - The value element.
 * @param {HTMLElement} placeholder - The placeholder element.
 */
function hideTaskCategory(valueEl, placeholder) {
  valueEl.textContent = "";
  valueEl.hidden = true;
  placeholder.hidden = false;
}

/**
 * Displays the selected category label.
 *
 * @param {string} value - The category value.
 * @param {HTMLElement} valueEl - The value element.
 * @param {HTMLElement} placeholder - The placeholder element.
 */
function renderTaskCategory(value, valueEl, placeholder) {
  const cat = (Array.isArray(TASK_CATEGORIES) ? TASK_CATEGORIES : []).find((c) => c.value === value);
  valueEl.textContent = cat?.label || value;
  valueEl.hidden = false;
  placeholder.hidden = true;
}

/**
 * Synchronizes the task category UI with form data.
 *
 * Updates visibility and display of selected category or placeholder.
 *
 * @param {HTMLFormElement} form - The form element.
 */
function syncTaskCatUI(form) {
  if (!form) return;
  const els = getTaskCategoryElements(form);
  if (!els) return;
  const val = String(els.taskCat.value || "").trim();
  if (!val) {
    hideTaskCategory(els.valueEl, els.placeholder);
  } else {
    renderTaskCategory(val, els.valueEl, els.placeholder);
  }
}

/**
 * Retrieves UI elements for assigned users.
 *
 * @param {HTMLFormElement} form - The form element.
 * @returns {Object} Object with placeholder, valueBox, avatarContainer elements.
 */
function getAssignedToUIElements(form) {
  const placeholder = form.querySelector("#assigned_to_placeholder");
  const valueBox = form.querySelector("#assigned_to_value");
  const avatarContainer = form.querySelector("#assigned_avatar_container");
  return { placeholder, valueBox, avatarContainer };
}

/**
 * Renders empty state for assigned users.
 *
 * @param {HTMLElement} valueBox - The value display element.
 * @param {HTMLElement} placeholder - The placeholder element.
 */
function renderEmptyAssignedState(valueBox, placeholder) {
  placeholder.hidden = false;
  valueBox.hidden = true;
  valueBox.textContent = "";
}

/**
 * Renders populated state for assigned users.
 *
 * Displays user names and avatars.
 *
 * @param {Array<string>} ids - Array of user IDs.
 * @param {HTMLElement} valueBox - The value display element.
 * @param {HTMLElement} placeholder - The placeholder element.
 * @param {Object} usersObj - Users data object.
 * @param {HTMLElement} avatarContainer - Container for avatars.
 */
function renderPopulatedAssignedState(ids, valueBox, placeholder, usersObj, avatarContainer) {
  renderEmptyAssignedState(valueBox, placeholder);
  renderAssignedAvatars(ids, usersObj, avatarContainer);
}

/**
 * Synchronizes assigned users UI with form data.
 *
 * @param {HTMLFormElement} form - The form element.
 * @param {Object} usersObj - Users data object.
 */
function syncAssignedToUI(form, usersObj) {
  const assignedToInput = form.elements.assigned_to_input;
  const ids = safeParseArray(assignedToInput?.value);
  const ui = getAssignedToUIElements(form);
  if (!ui.placeholder || !ui.valueBox) return;
  if (!ids.length) {
    renderEmptyAssignedState(ui.valueBox, ui.placeholder);
    return;
  }
  renderPopulatedAssignedState(ids, ui.valueBox, ui.placeholder, usersObj, ui.avatarContainer);
}

/**
 * Synchronizes subtasks UI with form data.
 *
 * @param {HTMLFormElement} form - The form element.
 */
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
