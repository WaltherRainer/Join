let parkedHost = null;
// const usersData = users || {}; 

function initAssignedToDropdown(usersData) {
    console.log("initAssignedToDropdown called", usersData);
    const root = document.getElementById('assigned_to');
    if (!root) return;
    if (root.dataset.initialized === "1") return;
    root.dataset.initialized = "1";
    const control = root.querySelector('.multi_select__control');
    const toggleBtn = document.getElementById('assigned_to_toggle');
    const dropdown = document.getElementById('assigned_to_dropdown');
    const list = document.getElementById('assigned_to_list');

    const placeholder = document.getElementById('assigned_to_placeholder');
    const valueEl = document.getElementById('assigned_to_value');
    const hiddenInput = document.getElementById('assigned_to_input');

  // Intern: ausgewählte userIds
  const selected = new Set();

  // 1) Liste befüllen (givenName + Checkbox)
  function renderUserList() {
    list.innerHTML = '';

    Object.entries(usersData).forEach(([userId, userObj]) => {
      const name = userObj?.givenName ?? '(no name)';
      const li = document.createElement('li');
      const initials = initialsFromGivenName(name);
      const bgColor = colorVarFromUserId(userId);
      li.className = 'multi_select__item';
      li.setAttribute('role', 'option');
      li.dataset.userid = userId;

    li.innerHTML = `
        <div class="multi_select__left">
            <span class="user_avatar" style="background:${bgColor};">${escapeHtml(initials)}</span>
            <span class="user_name">${escapeHtml(name)}</span>
        </div>
        <input class="multi_select__checkbox" type="checkbox" tabindex="-1" />
    `;

    li.addEventListener('click', (e) => {
    const cb = li.querySelector('.multi_select__checkbox');

    if (e.target !== cb) {
        cb.checked = !cb.checked;
    }

    updateSelection(userId, cb.checked);
    });
      list.appendChild(li);
    });
  }

  function updateSelection(userId, isChecked) {
    if (isChecked) selected.add(userId);
    else selected.delete(userId);

    // UI-Text aktualisieren
    const names = Array.from(selected).map(id => usersData[id]?.givenName).filter(Boolean);

    if (names.length === 0) {
      placeholder.hidden = false;
      valueEl.hidden = true;
      valueEl.textContent = '';
      hiddenInput.value = '';
    } else {
      placeholder.hidden = true;
      valueEl.hidden = false;
      valueEl.textContent = names.join(', ');
      // Für DB: z.B. JSON-String mit IDs (oder ändere auf Names, je nach Bedarf)
      hiddenInput.value = JSON.stringify(Array.from(selected));
    }

    // required-Feeling: falls du HTML required nutzt, brauchst du etwas, das nicht leer ist
    // hiddenInput ist required -> sobald value gesetzt, passt es.
  }

  // 2) Dropdown open/close
  function openDropdown() {
    dropdown.hidden = false;
    control.setAttribute('aria-expanded', 'true');
  }

  function closeDropdown() {
    dropdown.hidden = true;
    control.setAttribute('aria-expanded', 'false');
  }

  function toggleDropdown() {
    dropdown.hidden ? openDropdown() : closeDropdown();
  }

  // Carrot toggelt
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown();
  });

  // Klick auf Control (Inputfläche) öffnet (aber NICHT toggeln, nur öffnen)
  control.addEventListener('click', (e) => {
    // wenn auf Button geklickt: oben schon behandelt
    if (e.target === toggleBtn) return;
    openDropdown();
  });

  // Klick außerhalb schließt
  document.addEventListener('click', (e) => {
    if (!root.contains(e.target)) closeDropdown();
  });

  // ESC schließt
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDropdown();
  });

  // helper gegen HTML Injection
  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  renderUserList();
};


async function loadTasks() {
    tasks = await loadData('/tasks');
    console.log(tasks);
}

async function addTask() {
    let taskTitel = document.getElementById('task_titel');
    let taskDescr = document.getElementById('task_descr');
    let taskCat = document.getElementById('task_cat');
    let taskPrio = document.querySelector('input[name="priority"]:checked');
    let taskDueDate = document.getElementById('task_due_date');
    let subTask = document.getElementById('subtasks');

    let newTaskObj = {
        'titel' : taskTitel.value,
        'description' : taskDescr.value,
        'category' : taskCat.value,
        'priority' : taskPrio.checked,
        'finishDate' : taskDueDate.value,
        'assignedTo' : {'userId' : ""},
        'subTasks' : {'subtask' : subTask.value}, 
    };
    let result = await uploadData('/tasks', newTaskObj)
     console.log("Firebase Key:", result?.name);
     loadTasks();
}

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
    initAssignedToDropdown(users);
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
    initAssignedToDropdown(users);   // ✅ HIER rein (wichtig!)
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

function resetAssignedToDropdown() {
  document.getElementById('assigned_to_placeholder').hidden = false;
  document.getElementById('assigned_to_value').hidden = true;
  document.getElementById('assigned_to_value').textContent = '';
  document.getElementById('assigned_to_input').value = '';

  document.querySelectorAll('#assigned_to_list .multi_select__checkbox').forEach(checkBox => checkBox.checked = false);
}

function priorityButtonsReset() {
  document.querySelector('input[name="priority"][value="urgent"]').checked = false;
  document.querySelector('input[name="priority"][value="medium"]').checked = true;
  document.querySelector('input[name="priority"][value="low"]').checked = false;
}

function clearTaskForm() {
  document.getElementById('task_titel').value = '';
  document.getElementById('task_descr').value = '';
  document.getElementById('task_cat').value = '';
  document.getElementById('task_due_date').value = '';
  document.getElementById('subtasks').value = '';

  priorityButtonsReset();

  resetAssignedToDropdown();
}
