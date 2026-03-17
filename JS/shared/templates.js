/**
 * Generates the HTML template for a selectable user list item.
 *
 * Renders an avatar (background color + initials), the user name, and a
 * checkbox icon block used for multi-select UI.
 *
 * @function userListItemTemplate
 * @param {{bgColor: string, initials: string, name: string}} params - Render data for the list item.
 * @returns {string} HTML string for the user list item.
 */
function userListItemTemplate({ bgColor, initials, name }) {
  return `
    <div class="multi_select__left">
      <span class="user__avatar" style="background:${bgColor};">
        ${initials}
      </span>
      <span class="user_name">${name}</span>
    </div>
    <div class="checkbox_svg multi_checkbox_svg" aria-hidden="true">
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

/**
 * Generates the HTML template for a contact list card.
 *
 * Renders an avatar (color derived from user ID + initials), the given name,
 * and the email address for display in the contacts list.
 *
 * @function getContactListTempl
 * @param {string} userId - User ID used to derive the avatar background color.
 * @param {string} givenName - User name used for display and initials generation.
 * @param {string} userEmail - User email shown in the list item.
 * @returns {string} HTML string for the contact list card content.
 */
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

/**
 * Generates the HTML template for the contact details panel.
 *
 * Renders a large avatar, contact name, edit/delete action buttons (with icon hooks),
 * and the contact information section (email + phone).
 *
 * @function getContactDetailsTempl
 * @param {number|string} bgColor - Color index used for the avatar background CSS variable.
 * @param {string} initials - Initials displayed inside the avatar.
 * @param {string} givenName - Contact display name.
 * @param {string} userEmail - Contact email address (also used for the mailto link).
 * @param {string} phoneNo - Contact phone number to display.
 * @param {string} userId - User ID embedded into action button datasets/IDs.
 * @returns {string} HTML string for the contact details view.
 */
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

/**
 * Generates the HTML template for a task card (board item).
 *
 * Optionally adds drag-and-drop attributes when `isDraggable` is enabled.
 * When not draggable, includes a status `<select>` to change the task state.
 * The main card content is rendered via {@link getTaskItemContent}.
 *
 * @function taskItemTemplate
 * @param {Object} task - Task data object (must include at least `id` and `status`).
 * @param {Object<string, Object>} users - Users lookup object for rendering assigned users.
 * @param {boolean} isDraggable - Whether the task should be draggable.
 * @returns {string} HTML string for the task item.
 */
function taskItemTemplate(task, users, isDraggable) {
  const dragAttrs = isDraggable ? `draggable="true" ondragstart="startDragTask('${task.id}')" ondragend="endDragTask(event, '${task.id}')"` : "";
  const selectHtml = !isDraggable
    ? `<select class="task_status_select secondary-button" onchange="switchStatusContainer('${task.id}', this.value)" onclick="event.stopPropagation()">
        <button class="caret select-btn"></button>
        <option value="0" ${task.status === 0 ? "selected" : ""}>To Do</option>
        <option value="1" ${task.status === 1 ? "selected" : ""}>In progress</option>
        <option value="2" ${task.status === 2 ? "selected" : ""}>Await feedback</option>
        <option value="3" ${task.status === 3 ? "selected" : ""}>Done</option>
      </select>`
    : "";
  return `
    <div class="t_task" ${dragAttrs} data-task-id="${task.id}">
      ${selectHtml}
      ${getTaskItemContent(task, users)}
    </div>
  `;
}

/**
 * Generates the inner HTML for a task card, including category, title/description,
 * optional subtasks progress, assigned avatars, and priority indicator.
 *
 * Calculates the number of completed subtasks to decide whether to render the
 * progress section, then composes the markup using helper functions for labels,
 * overflow handling, assigned users, and priority.
 *
 * @function getTaskItemContent
 * @param {Object} task - Task data object (e.g. type, titel, description, subTasks, assignedTo, priority).
 * @param {Object<string, Object>} users - Users lookup object for rendering assigned users.
 * @returns {string} HTML string for the task card content.
 */
function getTaskItemContent(task, users) {
  const doneSubtasks = Array.isArray(task.subTasks) ? task.subTasks.filter((subTask) => subTask?.done === true).length : 0;
  return `
    <div class="t_category">
      <p style="background-color: ${getTaskCatLabel(task.type).color};" >${getTaskCatLabel(task.type).label}</p>
    </div>
        <div class="t_title_description">
            <p class="t_title">${task.titel}</p>
            <p class="t_description">${checkOverflow(task.description)}</p>
        </div>
          ${
            doneSubtasks > 0
              ? `<div class="t_sub_tasks">
            <div class="progress_bar_container">
              <div class="t_sub_task_bar" style="width: ${fillSubTasksBar(task)}%;">
            </div></div>
            ${subtasksCounter(task)}
        </div>`
              : ""
          }
        <div class="t_assigned_priotity">
            <div class="t_assigned_to">${mapAssignedTo(task.assignedTo, users)}</div>
            <div class="t_priority">
              ${getTaskDialogPrioTempl(task.priority)}
            </div>
        </div>
  `;
}

/**
 * Generates the HTML template for displaying a subtasks done/total counter.
 *
 * @function getSubtasksCountAndTotalTemplate
 * @param {number} done - Number of completed subtasks.
 * @param {number} total - Total number of subtasks.
 * @returns {string} HTML string showing the subtasks progress text.
 */
function getSubtasksCountAndTotalTemplate(done, total) {
  return `
    <span class="task_subtask_count">
      ${done}/${total} Subtasks
    </span>
  `;
}

/**
 * Generates the HTML template for an empty-state message when no tasks are available.
 *
 * @function noTaskTemplate
 * @param {string} text - Message to display.
 * @returns {string} HTML string for the empty-state element.
 */
function noTaskTemplate(text) {
  return `
  <div class="no_task"><p>${text}</p></div>
  `;
}

window.userListItemTemplate = userListItemTemplate;

/**
 * Returns the current user's name from session storage for greeting display.
 *
 * @function writeGreetingNameTemplate
 * @returns {string} The stored user name (may be `"undefined"` if not set).
 */
function writeGreetingNameTemplate() {
  return `${sessionStorage.userName}`;
}

/**
 * Generates the HTML snippet for a task priority label with its corresponding icon.
 *
 * Returns markup for `medium`, `low`, or `urgent` priority values.
 *
 * @function getTaskDialogPrioTempl
 * @param {"low"|"medium"|"urgent"} prio - Priority value to render.
 * @returns {string|undefined} HTML string for the priority display, or `undefined` for unknown values.
 */
function getTaskDialogPrioTempl(prio) {
  switch (prio) {
    case "medium":
      return `
      <span>Medium</span>
      <span class="svg-icon" data-icon="prioMedium" data-w="20" data-h="16"></span>
    `;
    case "low":
      return `
      <span>Low</span>
      <span class="svg-icon" data-icon="prioLow" data-w="20" data-h="16"></span>
    `;
    case "urgent":
      return `
      <span>Urgent</span>
      <span class="svg-icon" data-icon="prioUrgent" data-w="20" data-h="16"></span>
    `;
  }
}

/**
 * Generates the HTML template for an "assigned to" entry in the task dialog.
 *
 * Renders a small avatar (initials + user color) alongside the user's name.
 *
 * @function getTaskDialAssToTempl
 * @param {string} initials - User initials displayed in the avatar.
 * @param {string} userName - User name displayed next to the avatar.
 * @param {number|string} bgColor - Color index used for the avatar CSS variable.
 * @returns {string} HTML string for the assigned-user row.
 */
function getTaskDialAssToTempl(initials, userName, bgColor) {
  return `
      <div class="tsk_dlg_assgnd">
        <span class="sml_user_avatar" style="background-color: var(--user_c_${bgColor});">${initials}</span>
        <span>${userName}</span>
     </div>
  `;
}

/**
 * Generates the HTML template for a single subtask row in the task dialog.
 *
 * Renders a list item with a toggle button and checkbox icons, marks the row as
 * done via CSS class and ARIA state, and stores the subtask index in `data-index`.
 *
 * @function getTaskDialSubtaskTempl
 * @param {string} subTaskTitel - Subtask title text.
 * @param {boolean} done - Whether the subtask is completed.
 * @param {number} index - Subtask index used for identification in the UI.
 * @returns {string} HTML string for the subtask list item.
 */
function getTaskDialSubtaskTempl(subTaskTitel, done, index) {
  return `
    <li class="subtask_li_elements ${done ? "is-done" : ""}" data-index="${index}">
      <div class="subtask_action">
        <button type="button" class="icon_btn icon_btn--nohovercircle" data-action="toggle" aria-pressed="${done}">
          <div class="checkbox_svg single_checkbox_svg">
            <svg class="checkbox_unchecked" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="16" height="16" rx="3" stroke="var(--blue)" stroke-width="2"/>
            </svg>
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

/**
 * Generates the HTML for a small user avatar containing escaped initials.
 *
 * Uses the provided color index to set the avatar background via a CSS variable.
 *
 * @function renderSingleAvatar
 * @param {string} initials - Initials to display inside the avatar.
 * @param {number|string} bgColor - Color index used for the avatar CSS variable.
 * @returns {string} HTML string for the small avatar element.
 */
function renderSingleAvatar(initials, bgColor) {
  return `<span class="user_avatar_small" style="background-color: var(--user_c_${bgColor});">${escapeHtml(initials)}</span>`;
}

/**
 * Generates the HTML for an overflow indicator showing remaining assigned users.
 *
 * @function renderRemainingCount
 * @param {number} remaining - Number of additional users not shown.
 * @returns {string} HTML string for the "+N" overflow badge.
 */
function renderRemainingCount(remaining) {
  return `\n      <span class="user_avatar_more">+${remaining}</span>`;
}

/**
 * Generates the HTML template for an "assigned to" entry (avatar + name).
 *
 * @function getAssignedToTempl
 * @param {string} initials - User initials displayed in the avatar.
 * @param {string} userName - User name displayed next to the avatar.
 * @param {number|string} bgColor - Color index used for the avatar CSS variable.
 * @returns {string} HTML string for the assigned-to row.
 */
function getAssignedToTempl(initials, userName, bgColor) {
  return `
      <div class="tsk_dlg_assgnd"> <!-- Avatar und Name -->
          <span class="sml_user_avatar" style="background-color: var(--user_c_${bgColor});">${initials}</span>
          <span>${userName}</span>
      </div>
  `;
}
