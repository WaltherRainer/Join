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

  const result = await uploadData("tasks", newTaskObj);
  console.log("Firebase Key:", result?.name);

  saveTasksToSessionStorage(tasks);

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

function afterTaskAddedInModal() {
  const modal = document.querySelector(".add_task_modal");
  modal?.classList.remove("is_background");
  closeAddTaskModal();
  loadTasks();
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

  resetTaskTypeDropdownUi(form);
  removeAllInputErrors(form);
}

function clearEditInput(state) {
  const el = state.ui.listEl.querySelector("li.is-editing input.subtask_edit");
  if (el) el.value = "";
  if (el) el.focus();
}

function validateAddTaskForm(form) {

  console.log("validateAddTaskForm called", form);

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

  const hidden = form.querySelector("#task_cat");
  const taskTypeDiv = form.querySelector("#task_cat_control");
  const taskTypeOuterDiv = form.querySelector("#task_cat_select");

  if (!hidden?.value) {
    setInputInValid(taskTypeDiv, taskTypeOuterDiv);
    ok = false;
  } else {
    setInputValid(taskTypeDiv, taskTypeOuterDiv);
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


