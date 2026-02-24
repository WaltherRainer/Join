function initSubtasksInput(form) {
  if (!form) return;
  if (form.dataset.subtasksInit === "1") return;
  form.dataset.subtasksInit = "1";

  const inputSubTasks = form.querySelector("#input_subtasks");
  const subTaskListElem = form.querySelector("#subtasks_list");
  const subTaskListInp = form.querySelector("#subtasks_list_input");

  if (!inputSubTasks || !subTaskListElem || !subTaskListInp) return;

  const rowRoot = inputSubTasks.closest(".form_row") || form;
  const btnClear = rowRoot.querySelector(".subtasks_clear");
  const btnAdd = rowRoot.querySelector(".subtasks_add");
  if (!btnClear || !btnAdd) return;

  const subTaskUi = {
    inputSubTasks,
    SubTaskListElem: subTaskListElem,
    SubTaskListInp: subTaskListInp
  };

  const state = { subtasks: [], editingIndex: null, subTaskUi };

  state.subtasks = safeParseArray(subTaskListInp.value);

  btnClear.innerHTML = delCross({ width: 18, height: 18 });
  btnAdd.innerHTML = addCross({ width: 18, height: 18 });

  btnClear.onclick = () => clearSubtaskInput(state);
  btnAdd.onclick = () => addSubtaskFromInput(state);
  inputSubTasks.onkeydown = (e) => onSubtaskKeydown(state, e);

  wireSubtaskListEvents(state);
  renderSubtasks(state);
  syncSubtasksListInp(state);
}


/**
 * Attaches delegated event listeners to the subtasks list container.
 * Handles click actions (edit/delete) and keyboard interactions (commit/cancel) while editing.
 *
 * @param {Object} state - Subtasks UI state object.
 * @returns {void}
 */
function wireSubtaskListEvents(state) {
    state.subTaskUi.SubTaskListElem.addEventListener("click", (e) => onSubtaskListClick(state, e));
    state.subTaskUi.SubTaskListElem.addEventListener("keydown", (e) => onSubtaskListKeydown(state, e));
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
 * Rebuilds the entire subtasks list DOM from the current state.
 * Clears the list container and appends one `<li>` per subtask.
 *
 * @param {Object} state - Subtasks UI state object.
 * @returns {void}
 */
function renderSubtasks(state) {
    state.subTaskUi.SubTaskListElem.innerHTML = "";
    state.subtasks.forEach((subtask, idx) => {
    state.subTaskUi.SubTaskListElem.appendChild(makeSubtaskLi(state, subtask, idx));
  });
}


/**
 * Serializes the current subtasks array into a hidden/form input as JSON.
 * This enables server-side submission of subtasks.
 *
 * @param {Object} state - Subtasks UI state object.
 * @returns {void}
 */
function syncSubtasksListInp(state) {
    if (state.subTaskUi.SubTaskListInp) state.subTaskUi.SubTaskListInp.value = JSON.stringify(state.subtasks);
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

    if (!btn) return enterEditMode(state, idx);
    if (btn.dataset.action === "edit") return enterEditMode(state, idx);
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
    if (e.key === "Enter") { e.preventDefault(); commitEdit(state); }
    if (e.key === "Escape") exitEditMode(state);
}


/**
 * Creates a `<li>` element for a single subtask, including its main content and action buttons.
 * Marks the `<li>` as editing when its index matches `state.editingIndex`.
 *
 * @param {Object} state - Subtasks UI state object.
 * @param {{title: string, done: boolean}} subtask - Subtask data.
 * @param {number} idx - Index of the subtask in `state.subtasks`.
 * @returns {HTMLLIElement} The constructed list item element.
 */
function makeSubtaskLi(state, subtask, idx) {
    const li = document.createElement("li");
    li.dataset.index = String(idx);
    if (state.editingIndex === idx) li.classList.add("is-editing");
    li.appendChild(makeSubtaskMain(state, subtask, idx));
    li.appendChild(makeSubtaskActions());
    return li;
}


/**
 * Creates the main content node for a subtask list item.
 * - In normal mode, returns a `<span>` with the title.
 * - In edit mode, returns an `<input>` prefilled with the title and wired to commit on blur.
 *
 * @param {Object} state - Subtasks UI state object.
 * @param {{title: string, done: boolean}} subtask - Subtask data.
 * @param {number} idx - Index of the subtask in `state.subtasks`.
 * @returns {HTMLElement} The main content element (span or input).
 */
function makeSubtaskMain(state, subtask, idx) {
    if (state.editingIndex !== idx) {
        const span = document.createElement("span");
        span.textContent = subtask.title; 
        return span;
    }

    const input = document.createElement("input");
    input.className = "subtask_edit";
    input.type = "text";
    input.value = subtask.title;
    input.addEventListener("click", (e) => e.stopPropagation());
    input.addEventListener("blur", () => commitEdit(state));
    return input;
}


/**
 * Creates the actions container for a subtask row (edit + delete buttons).
 *
 * @returns {HTMLDivElement} Actions container element.
 */
function makeSubtaskActions() {
    const actions = document.createElement("div");
    actions.className = "subtask_actions";
    actions.appendChild(makeIconBtn("edit", editPencil));
    actions.appendChild(makeDivider());
    actions.appendChild(makeIconBtn("delete", recyBin));
    return actions;
}


/**
 * Creates an icon-only action button with the given action identifier and icon renderer.
 *
 * @param {string} action - Action name stored in `data-action` (e.g. "edit", "delete").
 * @param {(opts: {width: number, height: number}) => string} iconFn - Function that returns SVG markup.
 * @returns {HTMLButtonElement} The constructed button element.
 */
function makeIconBtn(action, iconFn) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "icon_btn icon_btn--nohovercircle icon_btn_std_size";
    btn.dataset.action = action;
    btn.innerHTML = iconFn({ width: 18, height: 18 });
    return btn;
}


/**
 * Creates a visual divider element used between action buttons.
 *
 * @returns {HTMLSpanElement} Divider element.
 */
function makeDivider() {
    const d = document.createElement("span");
    d.className = "subtask_divider";
    d.setAttribute("aria-hidden", "true");
    return d;
}


/**
 * Enters edit mode for the subtask at the given index, re-renders the list,
 * and focuses the edit input placing the cursor at the end.
 *
 * @param {Object} state - Subtasks UI state object.
 * @param {number} idx - Index to edit.
 * @returns {void}
 */
function enterEditMode(state, idx) {
    state.editingIndex = idx;
    renderSubtasks(state);
    focusEditInputEnd(state);
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
    const idx = state.editingIndex;
    if (typeof idx !== "number" || idx < 0 || idx >= state.subtasks.length) {
        return exitEditMode(state);
    }

    const input = state.subTaskUi.SubTaskListElem.querySelector("li.is-editing input.subtask_edit");
    if (!input) return exitEditMode(state);

    const title = input.value.trim();
    if (!title) return;
    state.subtasks[idx].title = title;

    exitEditMode(state);
    syncSubtasksListInp(state);
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
 * Focuses the active edit input (if present) and moves the caret to the end of the text.
 *
 * @param {Object} state - Subtasks UI state object.
 * @returns {void}
 */
function focusEditInputEnd(state) {
    const input = state.subTaskUi.SubTaskListElem.querySelector("li.is-editing input.subtask_edit");
    if (!input) return;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
}

window.initSubtasksInput = initSubtasksInput;
