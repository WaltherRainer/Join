function initSubtasksInput() {
  const form = document.getElementById("addTaskForm");
  if (form?.dataset.subtasksInit === "1") return;
  form.dataset.subtasksInit = "1";

  const input = document.getElementById("subtasks");
  const listEl = document.getElementById("subtasks_list");
  const hidden = document.getElementById("subtasks_input");
  if (!input || !listEl || !hidden) return;

  const root = input.closest(".form_row") || document;
  const btnClear = root.querySelector(".subtasks_clear");
  const btnAdd = root.querySelector(".subtasks_add");
  if (!btnClear || !btnAdd) return;

  const ui = { input, listEl, hidden };

  // ✅ subtasks sind jetzt Objekte
  const state = { subtasks: [], editingIndex: null, ui };

  btnClear.innerHTML = delCross({ width: 18, height: 18 });
  btnAdd.innerHTML = addCross({ width: 18, height: 18 });
  btnClear.onclick = () => clearSubtaskInput(state);
  btnAdd.onclick = () => addSubtaskFromInput(state);
  input.onkeydown = (e) => onSubtaskKeydown(state, e);

  wireSubtaskListEvents(state);

  // ✅ falls hidden schon was enthält (z.B. beim Re-Open), laden
  state.subtasks = readSubtasksHidden(state) || [];
  renderSubtasks(state);
  syncSubtasksHidden(state);
}

function readSubtasksHidden(state) {
  const hidden = state.ui.hidden;
  if (!hidden?.value) return [];
  try {
    const arr = JSON.parse(hidden.value);
    if (!Array.isArray(arr)) return [];
    // ✅ strikt: nur {title, done}
    return arr
      .filter(x => x && typeof x === "object")
      .map(x => ({
        title: String(x.title ?? "").trim(),
        done: Boolean(x.done),
      }))
      .filter(x => x.title.length > 0);
  } catch {
    return [];
  }
}

function clearSubtaskInput(state) {
  state.ui.input.value = "";
  state.ui.input.focus();
}

function onSubtaskKeydown(state, e) {
  if (e.key !== "Enter") return;
  e.preventDefault();
  addSubtaskFromInput(state);
}

function addSubtaskFromInput(state) {
  const title = state.ui.input.value.trim();
  if (!title) return;

  // ✅ Objekt statt String
  state.subtasks.push({ title, done: false });

  state.ui.input.value = "";
  renderSubtasks(state);
  syncSubtasksHidden(state);
}

function syncSubtasksHidden(state) {
  if (state.ui.hidden) state.ui.hidden.value = JSON.stringify(state.subtasks);
}

function wireSubtaskListEvents(state) {
  state.ui.listEl.addEventListener("click", (e) => onSubtaskListClick(state, e));
  state.ui.listEl.addEventListener("keydown", (e) => onSubtaskListKeydown(state, e));
}

function onSubtaskListClick(state, e) {
  const li = e.target.closest("li[data-index]");
  if (!li) return;

  const idx = Number(li.dataset.index);
  const btn = e.target.closest("button[data-action]");

  if (!btn) return enterEditMode(state, idx);
  if (btn.dataset.action === "edit") return enterEditMode(state, idx);
  if (btn.dataset.action === "delete") return deleteSubtask(state, idx);
}

function onSubtaskListKeydown(state, e) {
  if (state.editingIndex === null) return;
  if (e.key === "Enter") { e.preventDefault(); commitEdit(state); }
  if (e.key === "Escape") exitEditMode(state);
}

function renderSubtasks(state) {
  state.ui.listEl.innerHTML = "";

  // ✅ subtask ist Objekt
  state.subtasks.forEach((subtask, idx) => {
    state.ui.listEl.appendChild(makeSubtaskLi(state, subtask, idx));
  });
}

function makeSubtaskLi(state, subtask, idx) {
  const li = document.createElement("li");
  li.dataset.index = String(idx);
  if (state.editingIndex === idx) li.classList.add("is-editing");

  li.appendChild(makeSubtaskMain(state, subtask, idx));
  li.appendChild(makeSubtaskActions());
  return li;
}

function makeSubtaskMain(state, subtask, idx) {
  if (state.editingIndex !== idx) {
    const span = document.createElement("span");
    span.textContent = subtask.title; // ✅
    return span;
  }

  const input = document.createElement("input");
  input.className = "subtask_edit";
  input.type = "text";
  input.value = subtask.title; // ✅
  input.addEventListener("click", (e) => e.stopPropagation());
  input.addEventListener("blur", () => commitEdit(state));
  return input;
}

function makeSubtaskActions() {
  const actions = document.createElement("div");
  actions.className = "subtask_actions";
  actions.appendChild(makeIconBtn("edit", editPencil));
  actions.appendChild(makeDivider());
  actions.appendChild(makeIconBtn("delete", recyBin));
  return actions;
}

function makeIconBtn(action, iconFn) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "icon-btn icon-btn--nohovercircle";
  btn.dataset.action = action;
  btn.innerHTML = iconFn({ width: 18, height: 18 });
  return btn;
}

function makeDivider() {
  const d = document.createElement("span");
  d.className = "subtask_divider";
  d.setAttribute("aria-hidden", "true");
  return d;
}

function enterEditMode(state, idx) {
  state.editingIndex = idx;
  renderSubtasks(state);
  focusEditInputEnd(state);
}

function exitEditMode(state) {
  state.editingIndex = null;
  renderSubtasks(state);
}

// function commitEdit(state) {
//     console.log("commitEdit", { editingIndex: state.editingIndex, len: state.subtasks.length });

//   const input = state.ui.listEl.querySelector("li.is-editing input.subtask_edit");
//   if (!input) return exitEditMode(state);

//   const title = input.value.trim();
//   if (!title) return;

//   // ✅ Objekt aktualisieren
//   state.subtasks[state.editingIndex].title = title;

//   exitEditMode(state);
//   syncSubtasksHidden(state);
// }

function commitEdit(state) {
  // ✅ wenn kein gültiger Index: raus
  const idx = state.editingIndex;
  if (typeof idx !== "number" || idx < 0 || idx >= state.subtasks.length) {
    return exitEditMode(state);
  }

  const input = state.ui.listEl.querySelector("li.is-editing input.subtask_edit");
  if (!input) return exitEditMode(state);

  const title = input.value.trim();
  if (!title) return; // optional: leere nicht speichern

  // ✅ Objekt existiert garantiert
  state.subtasks[idx].title = title;

  exitEditMode(state);
  syncSubtasksHidden(state);
}


function deleteSubtask(state, idx) {
  state.subtasks.splice(idx, 1);
  if (state.editingIndex === idx) state.editingIndex = null;
  renderSubtasks(state);
  syncSubtasksHidden(state);
}

function focusEditInputEnd(state) {
  const input = state.ui.listEl.querySelector("li.is-editing input.subtask_edit");
  if (!input) return;
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);
}

window.initSubtasksInput = initSubtasksInput;
