let parkedHost = null;
const statusTypes = {
  0: "To Do",
  1: "In Progress",
  2: "Await Feedback",
  3: "Done",
  4: "Cancelled",
};

function initAddTask() {
  checkIfUserIsLoggedIn();
  
  // HIER DEN CODE EINFÜGEN:
  const form = document.querySelector(".add_task_form");
  if (form) {
    form.addEventListener("submit", handleFormSubmit);
  }
}

async function loadTasks() {
  tasks = await loadData("/tasks");
  const users = await ensureUsersLoaded();
}

async function addTaskData(newTaskObj, { toastId = "task_success_overlay", afterDone, refreshAfter = false } = {}) {
  if (!newTaskObj.titel || !newTaskObj.finishDate || !newTaskObj.type) {
    console.warn("addTaskData blocked: missing required fields", newTaskObj);
    return;
  }

  // Ensure the new task appears at the top of its status column.
  // 1) Load current tasks
  const allTasks = await loadData("/tasks") || {};
  const status = typeof newTaskObj.status === "number" ? newTaskObj.status : 0;

  // 2) Bump order of existing tasks in the same status (increment by 1)
  const patches = [];
  Object.entries(allTasks).forEach(([id, t]) => {
    if (t && Number(t.status) === status) {
      const newOrder = (t.order || 0) + 1;
      // update local copy
      t.order = newOrder;
      // prepare patch to persist
      patches.push(patchData("tasks", id, { order: newOrder }).catch((e) => {
        console.error("failed to patch order for", id, e);
      }));
    }
  });

  // wait for order patches to complete (best-effort)
  await Promise.all(patches);

  // 3) Set new task order to 0 (top) and upload
  newTaskObj.order = 0;
  const result = await uploadData("tasks", newTaskObj);
  console.log("Firebase Key:", result?.name);

  // 4) Refresh session storage and show toast
  const refreshed = await loadData("/tasks");
  saveTasksToSessionStorage(refreshed || {});
  // Also update global tasks variable so ensureTasksLoaded() gets fresh data
  tasks = refreshed || {};

  showToastOverlay(toastId, {
    onDone: () => {
      if (typeof afterDone === "function") afterDone();
      if (refreshAfter) loadTasks();
    },
  });
}

function activateBoard() {
  window.location.replace("board.html");
}

async function afterTaskAddedInModal() {
  const modal = document.querySelector(".add_task_modal");
  modal?.classList.remove("is_background");
  closeAddTaskModal();
  
  // load ne task from DB and update session storage
  const newTasks = await loadData("/tasks");
  saveTasksToSessionStorage(newTasks);
  
  // reload board if function exists
  if (typeof loadTaskBoard === "function") {
    const users = JSON.parse(sessionStorage.getItem("users") || "{}");
    loadTaskBoard(newTasks, users);
  }
}

function bringModalToBackground() {
  const modal = document.getElementById("addTaskModal");
  modal?.classList.add("is_background");
}


function getModalElements() {
  const modal = document.getElementById("addTaskModal");
  const host = document.getElementById("addTaskModalHost");
  const closeBtn = modal?.querySelector(".add_task_modal_close");
  return { modal, host, closeBtn };
}

function closeAddTaskModal() {
  const { modal, host } = getModalElements();
  if (!modal) return;
  if (host) host.innerHTML = "";
  modal.classList.remove("is_background");
  modal.close();
}


function initAddTaskModalOnce() {
  const { modal, closeBtn } = getModalElements();
  if (!modal || !closeBtn) return;

  if (modal.dataset.initOnce === "1") return;
  modal.dataset.initOnce = "1";

  closeBtn.addEventListener("click", closeAddTaskModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeAddTaskModal();
  });

}

function clearTaskForm(form) {
  if (!form) return;

  const setVal = (sel, v) => {
    const el = form.querySelector(sel);
    if (el) el.value = v;
  };

  setVal("#task_titel", "");
  setVal("#task_descr", "");
  setVal("#task_due_date", "");
  setVal("#task_cat", "");
  setVal("#input_subtasks", "");
  setVal("#subtasks_list_input", "[]");
  setVal("#subtasks_json", "[]"); 

  const list = form.querySelector("#subtasks_list");
  if (list) list.innerHTML = "";

  resetPriorityButtons(form);
  resetAssignedToDropdown(form);

  const avatarContainer = form.querySelector("#assigned_avatar_container");
  if (avatarContainer) avatarContainer.innerHTML = "";

  resetTaskCatDropdownUi(form);
  removeAllInputErrors(form);
}

function clearEditInput(state) {
  const el = state.ui.listEl.querySelector("li.is-editing input.subtask_edit");
  if (el) el.value = "";
  if (el) el.focus();
}

function validateAddTaskForm(form) {
  let ok = true;
  const title = form.querySelector("#task_titel");
  const due = form.querySelector("#task_due_date");

  if (!title?.checkValidity()) {
    setInputInValid(title, title);
    ok = false;
  } else {
    setInputValid(title, title);
  }

  if (!due?.checkValidity()) {
    setInputInValid(due, due);
    ok = false;
  } else {
    setInputValid(due, due);
  }

  const taskCat = form.querySelector("#task_cat");
  const taskCatDiv = form.querySelector("#task_cat_control");
  const taskCatOuterDiv = form.querySelector("#task_cat_select");

  if (!taskCat?.value) {
    setInputInValid(taskCatDiv, taskCatOuterDiv);
    ok = false;
  } else {
    setInputValid(taskCatDiv, taskCatOuterDiv);
  }

  if (!ok) {
    const firstInvalid = form.querySelector(".is-invalid");
    if (firstInvalid?.id === "task_cat_control") {
      form.querySelector("#task_cat_btn")?.focus();
    } else {
      firstInvalid?.focus?.();
    }
  }

  return ok;
}

function buildTaskPatchFromFormData(data) {
  return {
    titel: data.titel,
    description: data.description,
    finishDate: data.finishDate,
    priority: data.priority,
    type: data.type,
    assignedTo: data.assignedTo,
    subTasks: data.subTasks,
  };
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;

  // 1. Validierung prüfen
  if (!validateAddTaskForm(form)) {
    return; // Stoppt hier, wenn Felder leer sind
  }

  // 2. Daten für die Datenbank vorbereiten (Mapping)
  const newTask = {
    titel: form.querySelector("#task_titel").value,
    description: form.querySelector("#task_descr").value,
    finishDate: form.querySelector("#task_due_date").value, // Mapping auf finishDate
    type: form.querySelector("#task_cat").value,           // Mapping auf type
    priority: form.querySelector('input[name="priority"]:checked')?.value || "medium",
    subTasks: JSON.parse(form.querySelector("#subtasks_list_input").value || "[]"),
    status: 0
  };

  // 3. Datenbank-Upload aufrufen
  await addTaskData(newTask, {
    afterDone: () => window.location.href = "board.html"
  });
}

// Hilfsfunktionen für die Optik der Fehlermeldungen
function setInputInValid(el, root) {
  root.classList.add("is-invalid");
}

function setInputValid(el, root) {
  root.classList.remove("is-invalid");
}