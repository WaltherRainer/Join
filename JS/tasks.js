let parkedHost = null;


const statusTypes = {
  0 : "To Do",
  1 : "In Progress",
  2 : "Await Feedback",
  3 : "Done",
  4 : "Cancelled"
};


function initAddTask() {
  checkIfUserIsLoggedIn();
}

async function loadTasks() {
  tasks = await loadData("/tasks");
  const users = await ensureUsersLoaded();
}

async function addTask({ toastId = "task_success_overlay", taskStatus = 0, afterDone, refreshAfter = false } = {}) {
  const taskTitel   = document.getElementById("task_titel");
  const taskDescr   = document.getElementById("task_descr");
  const taskType     = document.getElementById("task_type");
  const taskPrio    = document.querySelector('input[name="priority"]:checked');
  const taskDueDate = document.getElementById("task_due_date");

  const subTasks   = getSubtasksArray();
  const assignedTo = getAssignedToIds();

  const newTaskObj = {
    titel: taskTitel?.value?.trim() || "",
    description: taskDescr?.value?.trim() || "",
    type: taskType?.value || "",
    status: taskStatus, // Status 0 = ToDo, Status 1 = In Progress, Status 2 = Await Feedback, Status 3 = Done, Status 4 = Cancelled
    priority: taskPrio?.value || "",
    finishDate: taskDueDate?.value || "",
    assignedTo,
    subTasks
  };

  const result = await uploadData("tasks", newTaskObj);
  console.log("Firebase Key:", result?.name);

  showToastOverlay(toastId, {
    onDone: () => {
      if (typeof afterDone === "function") afterDone();
      if (refreshAfter) loadTasks();
    }
  });

  clearTaskForm();
}

function activateBoard() {
  window.location.replace("board.html");
}

async function addTaskFromAddTaskPage() {
  await addTask({
    toastId: "task_success_overlay",
    afterDone: activateBoard,
    refreshAfter: false,
  });
}

function afterTaskAddedInModal() {
  const modal = document.querySelector(".add_task_modal");
  modal?.classList.remove("is_background");

  closeAddTaskModal();
  loadTasks();
}

async function addTaskFromBoardModal() {
  bringModalToBackground();

  await addTask({
    toastId: "task_modal_success_overlay",
    afterDone: afterTaskAddedInModal,
  });
}

function bringModalToBackground() {
  const modal = document.querySelector(".add_task_modal");
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
  if (!modal || !host) return;
  const form = document.getElementById("addTaskForm");
  if (form) {
    const inlineHost = document.getElementById("addTaskInlineHost");
    (inlineHost || ensureParkedHost()).appendChild(form);
  }
  modal.close();
}

function initAddTaskModalOnce() {
  const { modal, closeBtn } = getModalElements();
  if (!modal || !closeBtn) return;
  closeBtn.addEventListener("click", closeAddTaskModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeAddTaskModal();
  });
  modal.addEventListener("close", () => {
    const form = document.getElementById("addTaskForm");
    const inlineHost = document.getElementById("addTaskInlineHost");
    if (form && modal.contains(form)) {
      (inlineHost || ensureParkedHost()).appendChild(form);
    }
  });
}


function clearTaskForm() {
  setValueById("task_titel", "");
  setValueById("task_descr", "");
  setValueById("task_cat", "");
  setValueById("task_due_date", "");
  setValueById("input_subtasks", "");
  setValueById("subtasks_list_input", "[]");

  const list = document.getElementById("subtasks_list");
  if (list) list.innerHTML = "";

  resetPriorityButtons();
  resetAssignedToDropdown();

  const avatarContainer = document.getElementById("assigned_avatar_container");
  if (avatarContainer) avatarContainer.innerHTML = "";
  resetTaskTypeDropdownUi();
}

function clearEditInput(state) {
  const el = state.ui.listEl.querySelector('li.is-editing input.subtask_edit');
  if (el) el.value = "";
  if (el) el.focus();
}

function bindAddTaskFormSubmitOnce() {
  const form = document.getElementById("addTaskForm");
  if (!form) return;
  if (form.dataset.submitBound === "1") return;
  form.dataset.submitBound = "1";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const page = document.body.dataset.page;

      if (page === "board") {
        await addTaskFromBoardModal();
      } else {
        await addTaskFromAddTaskPage();
      }
    } catch (err) {
      console.error("addTask failed", err);
    }
  });
}


