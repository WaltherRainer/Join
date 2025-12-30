let parkedHost = null;

function ensureParkedHost() {
  if (!parkedHost) {
    parkedHost = document.createElement("div");
    parkedHost.id = "addTaskParkedHost";
    parkedHost.style.display = "none";
    document.body.appendChild(parkedHost);
  }
  return parkedHost;
}

function getModalEls() {
  const modal = document.getElementById("addTaskModal");
  const host = document.getElementById("addTaskModalHost");
  const closeBtn = modal?.querySelector(".modal_close");
  return { modal, host, closeBtn };
}

function openAddTaskModal() {
  const { modal, host } = getModalEls();
  if (!modal || !host) return;

  // Wenn Form schon existiert: umhängen + öffnen
  const existingForm = document.getElementById("addTaskForm");
  if (existingForm) {
    host.appendChild(existingForm);
    modal.showModal();
    return;
  }

  const loader = document.getElementById("addTaskLoader");
  loader.innerHTML = `<div w3-include-html="add_task.html"></div>`;

  w3.includeHTML(() => {
    const loadedForm = document.getElementById("addTaskForm");
    if (!loadedForm) {
      console.error("Form nicht gefunden. Bitte id='addTaskForm' im add_task.html setzen.");
      return;
    }
    host.appendChild(loadedForm);
    modal.showModal();
  });
}


function closeAddTaskModal() {
  const { modal, host } = getModalEls();
  if (!modal || !host) return;

  const form = document.getElementById("addTaskForm");
  if (form) {
    const inlineHost = document.getElementById("addTaskInlineHost");
    (inlineHost || ensureParkedHost()).appendChild(form);
  }
  modal.close();
}

function initAddTaskModalOnce() {
  const { modal, closeBtn } = getModalEls();
  if (!modal || !closeBtn) return;

  // Close button
  closeBtn.addEventListener("click", closeAddTaskModal);

  // Backdrop click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeAddTaskModal();
  });

  // ESC / close event: Form zurückhängen, falls noch im Modal
  modal.addEventListener("close", () => {
    const form = document.getElementById("addTaskForm");
    const inlineHost = document.getElementById("addTaskInlineHost");
    if (form && modal.contains(form)) {
      (inlineHost || ensureParkedHost()).appendChild(form);
    }
  });
}
