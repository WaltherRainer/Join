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
    state.subTaskUi.SubTaskListElem.appendChild(
      makeSubtaskLi(state, subtask, idx),
    );
  });
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
 * Focuses the active edit input (if present) and moves the caret to the end of the text.
 *
 * @param {Object} state - Subtasks UI state object.
 * @returns {void}
 */
function focusEditInputEnd(state) {
  const input = state.subTaskUi.SubTaskListElem.querySelector(
    "li.is-editing input.subtask_edit",
  );
  if (!input) return;
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);
}