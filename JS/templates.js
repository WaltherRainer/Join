function userListItemTemplate({ bgColor, initials, name }) {
  return `
    <div class="multi_select__left">
      <span class="user__avatar" style="background:${bgColor};">
        ${initials}
      </span>
      <span class="user_name">${name}</span>
    </div>

    <div class="checkbox_svg" aria-hidden="true">
      <svg class="checkbox_unchecked" width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="1" width="16" height="16" rx="3" stroke="var(--blue)" stroke-width="2"/>
      </svg>

      <svg class="checkbox_checked" width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M17 8V14C17 15.6569 15.6569 17 14 17H4C2.34315 17 1 15.6569 1 14V4C1 2.34315 2.34315 1 4 1H12"
              stroke="white" stroke-width="2" stroke-linecap="round"/>
        <path d="M5 9L9 13L17 1.5"
              stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  `;
}

function getContactListTempl(userId, givenName, userEmail) {
  return `
      <div class="contact_list_content">
        <span class="user__avatar" style="background: ${colorVarFromUserId(userId)};">
          ${initialsFromGivenName(givenName)}
        </span>
        <div class="user_contact">
          <span>${givenName}</span>
          <p>${userEmail}</p>
        </div>
      </div>
  `;
}

function getContactDetailsTempl(bgColor, initials, givenName, userEmail, phoneNo, userId) {
  return `
      <span class="user_avatar_large" style="background-color: var(--user_c_${bgColor});">${initials}</span>
      <div class="contact_detail">
          <h2>${givenName}</h2>
          <div class="contact_actions">
              <button type="button" class="icon_text_btn is-edit" id="edit_user" data-action="edit" data-user-id="${userId}">
                  <span class="svg-icon" data-icon="editPencil" data-w="18" data-h="18"></span>
                  <span>Edit</span>
              </button>

            <button type="button"
                    class="icon_text_btn is-delete"
                    data-action="delete"
                    data-user-id="${userId}"
                    id="btn_delete_user">
              <span class="svg-icon" data-icon="recyBin" data-w="18" data-h="18"></span>
              <span>Delete</span>
            </button>

          </div>
      </div>
      <div class="contact_information">
          <h3>Contact Information</h3>
          <h4>Email</h4>
          <p><a href="mailto:${userEmail}">${userEmail}</a></p>
          <h4>Phone</h4>
          <span>${phoneNo}</span>
      </div>
  `;
}

function taskItemTemplate(task, users) {
  return `
    <div class="t_task" draggable="true" ondragstart="startDragTask('${task.id}')" 
    ondragend="endDragTask(event, '${task.id}')" data-task-id="${task.id}">
      ${getTaskItemContent(task, users)}
      </div>
  `;
}

function getTaskItemContent(task, users) {
  return `
    <div class="t_category">
      <p style="background-color: ${getTaskCatLabel(task.type).color};" >${getTaskCatLabel(task.type).label}</p>
    </div>
        <div class="t_title_description">
            <p class="t_title">${task.titel}</p>
            <p class="t_description">${checkOverflow(task.description)}</p>
        </div>
          <div class="t_sub_tasks">
            <div class="t_sub_task_bar" style="width: ${fillSubTasksBar(task)}%;"></div>
            ${subtasksCounter(task)}
        </div>
        <div class="t_assigned_priotity">
            <div class="t_assigned_to">${mapAssignedTo(task.assignedTo, users)}</div>
            <div class="t_priority">
              ${getTaskDialogPrioTempl(task.priority)}
            </div>
        </div>
  `
}
function getSubtasksCountAndTotalTemplate(done, total) {
  return `
    <span class="task_subtask_count">
      ${done} / ${total} Subtasks
    </span>
  `;
}


function noTaskTemplate(text) {
  return `
  <div class="no_task"><p>${text}</p></div>
  `;
}
// ${fillSubTasksBar(task.subTasks)}

window.userListItemTemplate = userListItemTemplate;

/**
 * Generates the HTML content for the personalized name greeting.
 *
 * This function returns the currently active user's name as a string.
 * The value is typically injected into the DOM by {@link writeGreetingName}.
 *
 * It relies on the existence of the external variable `activeUserName`,
 * which is expected to contain the display name of the active user.
 *
 * @function writeGreetingNameTemplate
 * @returns {string} A string containing the active user's name.
 */
function writeGreetingNameTemplate() {
  return `${sessionStorage.userName}`;
}


function getTaskDialogPrioTempl(prio) {
  switch (prio) {
    case "medium":
    return `
      <span>Medium</span>
      <span class="svg-icon" data-icon="prioMedium" data-w="20" data-h="16"></span>
    `
    case "low":
    return `
      <span>Low</span>
      <span class="svg-icon" data-icon="prioLow" data-w="20" data-h="16"></span>
    `
    case "urgent":
    return `
      <span>Urgent</span>
      <span class="svg-icon" data-icon="prioUrgent" data-w="20" data-h="16"></span>
    `
  }
}

function getTaskDialAssToTempl(initials, userName, bgColor) {
  return `
      <div class="tsk_dlg_assgnd">
        <span class="sml_user_avatar" style="background-color: var(--user_c_${bgColor});">${initials}</span>
        <span>${userName}</span>
     </div>
  `
}

function getTaskDialSubtaskTempl(subTaskTitel, done, index) {
  return `
    <li class="subtask_li_elements ${done ? "is-done" : ""}" data-index="${index}">
      <div class="subtask_action">
        <button 
          type="button"
          class="icon_btn icon_btn--nohovercircle"
          data-action="toggle"
          aria-pressed="${done}"
        >
          <div class="checkbox_svg">
            
            <!-- unchecked -->
            <svg class="checkbox_unchecked" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="16" height="16" rx="3" stroke="var(--blue)" stroke-width="2"/>
            </svg>

            <!-- checked -->

            
            <svg class="checkbox_checked" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 8V14C17 15.6569 15.6569 17 14 17H4C2.34315 17 1 15.6569 1 14V4C1 2.34315 2.34315 1 4 1H12" stroke="var(--blue)" stroke-width="2" stroke-linecap="round"/>
              <path d="M5 9L9 13L17 1.5" stroke="var(--blue)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>

            <span>${subTaskTitel}</span>
          </div>
        </button>
      </div>
    </li>
  `;
}

function getAssignedToTempl(initials, userName, bgColor) {
  return `
      <div class="tsk_dlg_assgnd"> <!-- Avatar und Name -->
          <span class="sml_user_avatar" style="background-color: var(--user_c_${bgColor});">${initials}</span>
          <span>${userName}</span>
      </div>
  `
}
