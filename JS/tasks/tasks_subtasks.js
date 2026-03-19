/**
 * Initializes the subtasks input module for a form.
 *
 * Guards against duplicate initialization, resolves required UI elements,
 * creates the module state, wires event handlers, and renders initial subtasks.
 *
 * @param {HTMLFormElement|null} form - Form containing the subtasks controls.
 * @returns {void}
 */
function initSubtasksInput(form) {
  const setup = setupSubtasksForForm(form);
  if (!setup) return;
  finalizeSubtasksInitialization(setup.state, setup.actionButtons);
}

/**
 * Builds and stores subtasks setup for a form.
 *
 * @param {HTMLFormElement|null} form - Form containing subtasks controls.
 * @returns {{state: Object, actionButtons: Object}|null} Setup payload or null when incomplete.
 */
function setupSubtasksForForm(form) {
  if (!shouldInitializeSubtasks(form)) return null;

  const subTaskUi = getSubtaskUiElements(form);
  if (!subTaskUi) return null;

  const actionButtons = getSubtaskActionButtons(form, subTaskUi.inputSubTasks);
  if (!actionButtons) return null;

  const state = createSubtaskState(subTaskUi);
  form._subtaskState = state;
  return { state, actionButtons };
}

/**
 * Wires handlers and renders subtasks after setup.
 *
 * @param {Object} state - Subtasks state object.
 * @param {{btnClear: HTMLButtonElement, btnAdd: HTMLButtonElement}} actionButtons - Action button refs.
 * @returns {void}
 */
function finalizeSubtasksInitialization(state, actionButtons) {
  initializeSubtaskActionButtons(actionButtons);
  wireSubtaskInputEvents(state, actionButtons);
  wireSubtaskListEvents(state);
  renderSubtasks(state);
  syncSubtasksListInp(state);
}

/**
 * Checks whether subtasks initialization should run and marks the form as initialized.
 *
 * @param {HTMLFormElement|null} form - Candidate form.
 * @returns {boolean} True when initialization should proceed.
 */
function shouldInitializeSubtasks(form) {
  if (!form) return false;
  if (form.dataset.subtasksInit === "1") return false;
  form.dataset.subtasksInit = "1";
  return true;
}

/**
 * Resolves required DOM elements for the subtasks module.
 *
 * @param {HTMLFormElement} form - Form containing subtask controls.
 * @returns {{inputSubTasks: HTMLInputElement, SubTaskListElem: HTMLElement, SubTaskListInp: HTMLInputElement}|null} UI object or null when incomplete.
 */
function getSubtaskUiElements(form) {
  const inputSubTasks = form.querySelector("#input_subtasks");
  const subTaskListElem = form.querySelector("#subtasks_list");
  const subTaskListInp = form.querySelector("#subtasks_list_input");

  if (!inputSubTasks || !subTaskListElem || !subTaskListInp) return null;

  return {
    inputSubTasks,
    SubTaskListElem: subTaskListElem,
    SubTaskListInp: subTaskListInp,
  };
}

/**
 * Resolves the clear/add action buttons for subtask input.
 *
 * @param {HTMLFormElement} form - Parent form.
 * @param {HTMLInputElement} inputSubTasks - Subtask input element.
 * @returns {{btnClear: HTMLButtonElement, btnAdd: HTMLButtonElement}|null} Action buttons or null when missing.
 */
function getSubtaskActionButtons(form, inputSubTasks) {
  const rowRoot = inputSubTasks.closest(".form_row") || form;
  const btnClear = rowRoot.querySelector(".subtasks_clear");
  const btnAdd = rowRoot.querySelector(".subtasks_add");
  if (!btnClear || !btnAdd) return null;
  return { btnClear, btnAdd };
}

/**
 * Creates the internal subtasks state object.
 *
 * @param {{inputSubTasks: HTMLInputElement, SubTaskListElem: HTMLElement, SubTaskListInp: HTMLInputElement}} subTaskUi - Resolved UI references.
 * @returns {{subtasks: Array<{title: string, done: boolean}>, editingIndex: number|null, subTaskUi: Object}} Initialized module state.
 */
function createSubtaskState(subTaskUi) {
  return {
    subtasks: safeParseArray(subTaskUi.SubTaskListInp.value),
    editingIndex: null,
    subTaskUi,
  };
}

/**
 * Renders the clear/add button icons.
 *
 * @param {{btnClear: HTMLButtonElement, btnAdd: HTMLButtonElement}} actionButtons - Subtask action buttons.
 * @returns {void}
 */
function initializeSubtaskActionButtons(actionButtons) {
  actionButtons.btnClear.innerHTML = delCross({ width: 18, height: 18 });
  actionButtons.btnAdd.innerHTML = addCross({ width: 18, height: 18 });
}

/**
 * Wires add/clear/keydown handlers for the subtasks input controls.
 *
 * @param {Object} state - Subtasks UI state object.
 * @param {{btnClear: HTMLButtonElement, btnAdd: HTMLButtonElement}} actionButtons - Subtask action buttons.
 * @returns {void}
 */
function wireSubtaskInputEvents(state, actionButtons) {
  actionButtons.btnClear.onclick = () => clearSubtaskInput(state);
  actionButtons.btnAdd.onclick = () => addSubtaskFromInput(state);
  state.subTaskUi.inputSubTasks.onkeydown = (e) => onSubtaskKeydown(state, e);
}

/**
 * Attaches delegated event listeners to the subtasks list container.
 * Handles click actions (edit/delete) and keyboard interactions (commit/cancel) while editing.
 *
 * @param {Object} state - Subtasks UI state object.
 * @returns {void}
 */
function wireSubtaskListEvents(state) {
  state.subTaskUi.SubTaskListElem.addEventListener("click", (e) =>
    onSubtaskListClick(state, e),
  );
  state.subTaskUi.SubTaskListElem.addEventListener("keydown", (e) =>
    onSubtaskListKeydown(state, e),
  );
}

/**
 * Clears the subtask input field and focuses it.
 *
 * @param {Object} state - Subtasks UI state object.
 * @returns {void}
 */
function clearSubtaskInput(state) {
  state.subTaskUi.inputSubTasks.value = "";
  state.subTaskUi.inputSubTasks.focus();
}

/**
 * Reads the current subtask title from the input, appends a new subtask to state,
 * then re-renders the list and syncs the hidden JSON input.
 *
 * @param {Object} state - Subtasks UI state object.
 * @returns {void}
 */
function addSubtaskFromInput(state) {
  const title = state.subTaskUi.inputSubTasks.value.trim();
  if (!title) return;
  state.subtasks.push({ title, done: false });
  state.subTaskUi.inputSubTasks.value = "";
  renderSubtasks(state);
  syncSubtasksListInp(state);
}

/**
 * Handles keydown events on the subtask input field.
 * Submits the current input as a subtask when Enter is pressed.
 *
 * @param {Object} state - Subtasks UI state object.
 * @param {KeyboardEvent} e - The keydown event.
 * @returns {void}
 */
function onSubtaskKeydown(state, e) {
  if (e.key !== "Enter") return;
  e.preventDefault();
  addSubtaskFromInput(state);
}

/**
 * Serializes the current subtasks array into a hidden/form input as JSON.
 * This enables server-side submission of subtasks.
 *
 * @param {Object} state - Subtasks UI state object.
 * @returns {void}
 */
function syncSubtasksListInp(state) {
  if (state.subTaskUi.SubTaskListInp)
    state.subTaskUi.SubTaskListInp.value = JSON.stringify(state.subtasks);
  state.subTaskUi.SubTaskListInp.closest("form")?._markDirty?.();
}

/**
 * Handles click events inside the subtasks list using event delegation.
 * - Clicking the row enters edit mode.
 * - Clicking an action button triggers edit or delete.
 *
 * @param {Object} state - Subtasks UI state object.
 * @param {MouseEvent} e - The click event.
 * @returns {void}
 */
function onSubtaskListClick(state, e) {
  const li = e.target.closest("li[data-index]");
  if (!li) return;

  const idx = Number(li.dataset.index);
  const btn = e.target.closest("button[data-action]");

  if (!btn) return enterSubtaskEditMode(state, idx);
  if (btn.dataset.action === "edit") return enterSubtaskEditMode(state, idx);
  if (btn.dataset.action === "delete") return deleteSubtask(state, idx);
}

/**
 * Handles keydown events inside the subtasks list while editing.
 * - Enter commits the current edit.
 * - Escape cancels editing and exits edit mode.
 *
 * @param {Object} state - Subtasks UI state object.
 * @param {KeyboardEvent} e - The keydown event.
 * @returns {void}
 */
function onSubtaskListKeydown(state, e) {
  if (state.editingIndex === null) return;
  if (e.key === "Enter") {
    e.preventDefault();
    commitEdit(state);
  }
  if (e.key === "Escape") exitSubtaskEditMode(state);
}

/**
 * Enters edit mode for the subtask at the given index, re-renders the list,
 * and focuses the edit input placing the cursor at the end.
 *
 * @param {Object} state - Subtasks UI state object.
 * @param {number} idx - Index to edit.
 * @returns {void}
 */
function enterSubtaskEditMode(state, idx) {
  state.editingIndex = idx;
  renderSubtasks(state);
  focusEditInputEnd(state);
}

/**
 * Exits edit mode by clearing the editing index and re-rendering the subtasks list.
 *
 * @param {Object} state - Subtasks UI state object.
 * @returns {void}
 */
function exitSubtaskEditMode(state) {
  state.editingIndex = null;
  renderSubtasks(state);
}

/**
 * Commits the current edit (if valid) to the subtask title:
 * - Validates the editing index and the presence of the edit input.
 * - Trims the new title and updates the corresponding subtask.
 * - Exits edit mode and syncs the hidden JSON input.
 *
 * @param {Object} state - Subtasks UI state object.
 * @returns {void}
 */
function commitEdit(state) {
  const editTarget = getCurrentEditTarget(state);
  if (!editTarget) return exitSubtaskEditMode(state);

  const title = editTarget.input.value.trim();
  if (!title) return;
  state.subtasks[editTarget.idx].title = title;

  exitSubtaskEditMode(state);
  syncSubtasksListInp(state);
}

/**
 * Resolves current edit index and input element.
 *
 * @param {Object} state - Subtasks UI state object.
 * @returns {{idx:number, input:HTMLInputElement}|null} Edit target or null.
 */
function getCurrentEditTarget(state) {
  const idx = state.editingIndex;
  if (typeof idx !== "number" || idx < 0 || idx >= state.subtasks.length) return null;

  const input = state.subTaskUi.SubTaskListElem.querySelector(
    "li.is-editing input.subtask_edit",
  );
  if (!input) return null;
  return { idx, input };
}

/**
 * Deletes the subtask at the given index, updates edit state if necessary,
 * then re-renders and syncs the hidden JSON input.
 *
 * @param {Object} state - Subtasks UI state object.
 * @param {number} idx - Index to delete.
 * @returns {void}
 */
function deleteSubtask(state, idx) {
  state.subtasks.splice(idx, 1);
  if (state.editingIndex === idx) state.editingIndex = null;
  renderSubtasks(state);
  syncSubtasksListInp(state);
}

/**
 * Placeholder for removing the complete subtask array.
 *
 * @returns {void}
 */
function deleteSubtaskArray() {}

window.initSubtasksInput = initSubtasksInput;
