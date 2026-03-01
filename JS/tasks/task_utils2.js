/**
 * Synchronizes dropdown filter state.
 * 
 * @function syncDropdownFilterState
 * @param {Object} state - State object.
 * @param {boolean} isOpen - Whether dropdown is open.
 * @returns {void}
 */
function syncDropdownFilterState(state, isOpen) {
  const { ui } = state;
  if (!ui.assignedToassignedToFilterInput) return;
  
  ui.assignedToassignedToFilterInput.hidden = !isOpen;
  if (isOpen) {
    ui.assignedToassignedToFilterInput.focus();
    ui.assignedToassignedToFilterInput.select();
  } else {
    ui.assignedToassignedToFilterInput.value = "";
    state.query = "";
    renderUserList(state);
  }
}

/**
 * Synchronizes dropdown placeholder state.
 * 
 * @function syncDropdownPlaceholder
 * @param {Object} ui - UI elements object.
 * @param {boolean} isOpen - Whether dropdown is open.
 * @param {number} selectedSize - Number of selected items.
 * @returns {void}
 */
function syncDropdownPlaceholder(ui, isOpen, selectedSize) {
  if (isOpen) {
    ui.assignedToPlaceholder.hidden = true;
  } else {
    if (selectedSize === 0) ui.assignedToPlaceholder.hidden = false;
  }
}

/**
 * Executes synchronization after toggle.
 * 
 * @function afterToggleSync
 * @param {Object} ui - UI elements object.
 * @param {Object} state - State object.
 * @returns {void}
 */
function afterToggleSync(ui, state) {
  const isOpen = !ui.dropdown.hidden;
  syncDropdownFilterState(state, isOpen);
  syncDropdownPlaceholder(ui, isOpen, state.selected.size);
}

/**
 * Adds toggle button click listener.
 * 
 * @function addToggleBtnListener
 * @param {Object} ui - UI elements object.
 * @param {Object} state - State object.
 * @returns {void}
 */
function addToggleBtnListener(ui, state) {
  ui.toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown(ui);
    afterToggleSync(ui, state);
  });
}

/**
 * Adds control element click listener.
 * 
 * @function addControlClickListener
 * @param {Object} ui - UI elements object.
 * @param {Object} state - State object.
 * @returns {void}
 */
function addControlClickListener(ui, state) {
  ui.control.addEventListener("click", (e) => {
    if (e.target === ui.toggleBtn || ui.toggleBtn.contains(e.target)) return;
    toggleDropdown(ui);
    afterToggleSync(ui, state);
  });
}
/**
 * Adds document click listener for closing dropdown.
 * 
 * @function addDocumentClickListener
 * @param {Object} ui - UI elements object.
 * @param {Object} state - State object.
 * @returns {void}
 */
function addDocumentClickListener(ui, state) {
  document.addEventListener("click", (e) => {
    if (!ui.root.contains(e.target)) {
      closeDropdown(ui);
      afterToggleSync(ui, state);
    }
  });
}
/**
 * Adds document keydown listener for Escape key.
 * 
 * @function addDocumentKeydownListener
 * @param {Object} ui - UI elements object.
 * @param {Object} state - State object.
 * @returns {void}
 */
function addDocumentKeydownListener(ui, state) {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeDropdown(ui);
      afterToggleSync(ui, state);
    }
  });
}

/**
 * Wires all dropdown event handlers.
 * 
 * @function wireDropdownEvents
 * @param {Object} state - State object with UI elements and data.
 * @returns {void}
 */
function wireDropdownEvents(state) {
  const { ui } = state;
  addToggleBtnListener(ui, state);
  addControlClickListener(ui, state);
  addDocumentClickListener(ui, state);
  addDocumentKeydownListener(ui, state);
}

/**
 * Toggles dropdown open/closed state.
 * 
 * @function toggleDropdown
 * @param {Object} ui - UI elements object.
 * @returns {void}
 */
function toggleDropdown(ui) {
  ui.dropdown.hidden ? openDropdown(ui) : closeDropdown(ui);
}

/**
 * Opens the dropdown.
 * 
 * @function openDropdown
 * @param {Object} ui - UI elements object.
 * @returns {void}
 */
function openDropdown(ui) {
  ui.dropdown.hidden = false;
  ui.control.setAttribute("aria-expanded", "true");
  ui.caret?.classList.add("caret_rotate");
}

/**
 * Closes the dropdown.
 * 
 * @function closeDropdown
 * @param {Object} ui - UI elements object.
 * @returns {void}
 */
function closeDropdown(ui) {
  ui.dropdown.hidden = true;
  ui.control.setAttribute("aria-expanded", "false");
  ui.caret?.classList.remove("caret_rotate");
}

/**
 * Escapes HTML special characters.
 * 
 * @function escapeHtml
 * @param {string} str - String to escape.
 * @returns {string} Escaped string.
 */
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * Gets subtasks array from hidden input.
 * 
 * @function getSubtasksArray
 * @returns {Array<Object>} Array of subtask objects with title and done properties.
 */
function getSubtasksArray() {
  const hidden = document.querySelector("#subtasks_list_input");
  if (!hidden || !hidden.value) return [];
  try {
    const arr = JSON.parse(hidden.value);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter(x => x && typeof x === "object")
      .map(x => ({ title: String(x.title ?? "").trim(), done: Boolean(x.done) }))
      .filter(x => x.title.length > 0);
  } catch {
    return [];
  }
}

/**
 * Gets assigned user IDs from hidden input.
 * 
 * @function getAssignedToIds
 * @returns {Array<string>} Array of user IDs.
 */
function getAssignedToIds() {
  const hidden = document.getElementById("assigned_to_input");
  if (!hidden || !hidden.value) return [];
  try {
    const arr = JSON.parse(hidden.value);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/**
 * Initializes task category dropdown.
 * 
 * @function initTaskTypeDropdown
 * @param {HTMLFormElement} form - Form containing the dropdown.
 * @param {Array<Object>} categories - Array of category objects.
 * @returns {void}
 */
function initTaskTypeDropdown(form, categories) {
  const root = form.querySelector("#task_cat_select");
  if (!root || isInitialized(root)) return;
  const ui = getTaskCatUi(root);
  renderTaskCatOptions(ui, categories);
  wireTaskCatEvents(ui);
}

/**
 * Gets UI element references for task category dropdown.
 * 
 * @function getTaskCatUi
 * @param {HTMLElement} root - Root element.
 * @returns {Object} Object with UI element references.
 */
function getTaskCatUi(root) {
  return {
    root,
    control: root.querySelector(".single_select__control"),
    dropdown: root.querySelector(".single_select__dropdown"),
    list: root.querySelector(".single_select__list"),
    valueEl: root.querySelector(".single_select__value"),
    placeholder: root.querySelector(".single_select__placeholder"),
    assignedToInput: root.querySelector("#task_cat"),
    caret: root.querySelector(".caret"),
  };
}

/**
 * Renders task category options in dropdown.
 * 
 * @function renderTaskCatOptions
 * @param {Object} ui - UI elements object.
 * @param {Array<Object>} categories - Array of category objects.
 * @returns {void}
 */
function renderTaskCatOptions(ui, categories) {
  ui.list.innerHTML = "";
  categories.forEach((cat) => {
    const li = document.createElement("li");
    li.className = "single_select__item";
    li.textContent = cat.label;
    li.addEventListener("click", () => selectTaskCat(ui, cat));
    ui.list.appendChild(li);
  });
}

/**
 * Selects a task category.
 * 
 * @function selectTaskCat
 * @param {Object} ui - UI elements object.
 * @param {Object} cat - Category object with value and label.
 * @returns {void}
 */
function selectTaskCat(ui, cat) {
  ui.assignedToInput.value = cat.value;
  ui.valueEl.textContent = cat.label;
  ui.valueEl.hidden = false;
  ui.placeholder.hidden = true;
  closeTaskCatDropdown(ui);

  const taskTypeDiv = ui.root.querySelector("#task_cat_control");
  const taskTypeOuterDiv = ui.root; 
  if (taskTypeDiv && taskTypeOuterDiv) {
    setInputValid(taskTypeDiv, taskTypeOuterDiv);
  }
  ui.root.closest("form")?._markDirty?.();
}


/**
 * Wires event handlers for task category dropdown.
 * 
 * @function wireTaskCatEvents
 * @param {Object} ui - UI elements object.
 * @returns {void}
 */
function wireTaskCatEvents(ui) {
  ui.control.addEventListener("click", () => toggleTaskCatDropdown(ui));

  document.addEventListener("click", (e) => {
    if (!ui.root.contains(e.target)) closeTaskCatDropdown(ui);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeTaskCatDropdown(ui);
  });
}

/**
 * Toggles task category dropdown open/closed state.
 * 
 * @function toggleTaskCatDropdown
 * @param {Object} ui - UI elements object.
 * @returns {void}
 */
function toggleTaskCatDropdown(ui) {
  ui.dropdown.hidden ? openTaskCatDropdown(ui) : closeTaskCatDropdown(ui);
}

/**
 * Opens task category dropdown.
 * 
 * @function openTaskCatDropdown
 * @param {Object} ui - UI elements object.
 * @returns {void}
 */
function openTaskCatDropdown(ui) {
  ui.dropdown.hidden = false;
  ui.caret.classList.add("caret_rotate");
}

/**
 * Closes task category dropdown.
 * 
 * @function closeTaskCatDropdown
 * @param {Object} ui - UI elements object.
 * @returns {void}
 */
function closeTaskCatDropdown(ui) {
  ui.dropdown.hidden = true;
  ui.caret.classList.remove("caret_rotate");
}

/**
 * Resets priority buttons to default state (medium selected).
 * 
 * @function resetPriorityButtons
 * @param {HTMLFormElement} form - Form containing priority buttons.
 * @returns {void}
 */
function resetPriorityButtons(form) {
  const urgent = form.querySelector('input[name="priority"][value="urgent"]');
  const medium = form.querySelector('input[name="priority"][value="medium"]');
  const low = form.querySelector('input[name="priority"][value="low"]');

  if (urgent) urgent.checked = false;
  if (medium) medium.checked = true;
  if (low) low.checked = false;
}


/**
 * Resets task category dropdown UI to default state.
 * 
 * @function resetTaskCatDropdownUi
 * @param {HTMLFormElement} form - Form containing the dropdown.
 * @returns {void}
 */
function resetTaskCatDropdownUi(form) {
  const root = form.querySelector("#task_cat_select");
  if (!root) return;

  const valueEl = root.querySelector(".single_select__value");
  const placeholder = root.querySelector(".single_select__placeholder");
  const assignedToInput = form.querySelector("#task_cat");

  if (valueEl) {
    valueEl.hidden = true;
    valueEl.textContent = "";
  }
  if (placeholder) placeholder.hidden = false;
  if (assignedToInput) assignedToInput.value = "";
}


window.initAssignedToDropdown = initAssignedToDropdown;