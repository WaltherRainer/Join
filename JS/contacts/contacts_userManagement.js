/**
 * Deletes a contact after confirmation and performs related cleanup.
 *
 * Asks for user confirmation, deletes the user and refreshes the UI, then
 * removes the contact from any tasks. Returns a boolean indicating success.
 *
 * @async
 * @function deleteContact
 * @param {string} userId - The ID of the user to delete.
 * @returns {Promise<boolean>} `true` if deletion succeeded, otherwise `false`.
 */
async function deleteContact(userId) {
  if (!userId) return false;
  if (!(await confirmDelete())) return false;

  try {
    await deleteUserAndRefreshUI(userId);
    await removeContactFromTasks(userId);
    return true;
  } catch (err) {
    console.error("Delete failed:", err);
    return false;
  }
}

/**
 * Prompts the user for delete confirmation.
 *
 * Delegates to {@link requestDeleteContactConfirmation} and coerces the result
 * to a strict boolean.
 *
 * @async
 * @function confirmDelete
 * @returns {Promise<boolean>} `true` if the user confirmed, otherwise `false`.
 */
async function confirmDelete() {
  return !!(await requestDeleteContactConfirmation());
}

/**
 * Deletes a user record and refreshes the contacts UI.
 *
 * Removes the user via {@link deleteData}, reloads the users collection,
 * re-renders the contacts list, clears any active selection and details,
 * and ensures the mobile layout returns to the list view.
 *
 * @async
 * @function deleteUserAndRefreshUI
 * @param {string} userId - The ID of the user to delete.
 * @returns {Promise<void>} Resolves when deletion and UI updates are complete.
 */
async function deleteUserAndRefreshUI(userId) {
  await deleteData(`/users/${userId}`);
  const users = await reloadUsers();
  renderContacts(users);
  clearActiveContactUI();
  clearContactDetails();
  ensureMobileListView();
}

/**
 * Reloads the users collection from the backend and persists it to session storage.
 *
 * Fetches `/users` via {@link loadData}, falls back to `{}` when missing, stores the
 * result using {@link saveUsersToSessionStorage}, and returns the loaded users.
 *
 * @async
 * @function reloadUsers
 * @returns {Promise<Object<string, Object>>} A promise that resolves to the loaded users collection.
 */
async function reloadUsers() {
  const users = (await loadData("/users")) ?? {};
  saveUsersToSessionStorage(users);
  return users;
}

/**
 * Clears the active state from all contact cards.
 *
 * Removes the `is-active` class from any `.contact_list_card` elements that currently have it.
 *
 * @function clearActiveContactUI
 * @returns {void}
 */
function clearActiveContactUI() {
  document.querySelectorAll(".contact_list_card.is-active").forEach((el) => el.classList.remove("is-active"));
}

/**
 * Clears the contact details section.
 *
 * Empties the `#contact_details_sect` container if it exists.
 *
 * @function clearContactDetails
 * @returns {void}
 */
function clearContactDetails() {
  const details = document.getElementById("contact_details_sect");
  if (details) details.innerHTML = "";
}

/**
 * Ensures the contacts layout is in list view on mobile breakpoints.
 *
 * If the viewport matches `(max-width: 1100px)`, switches back to the list view
 * using {@link showListView} when available, otherwise falls back to removing
 * the `is-details` class directly.
 *
 * @function ensureMobileListView
 * @returns {void}
 */
function ensureMobileListView() {
  if (!window.matchMedia("(max-width: 1100px)").matches) return;
  if (typeof showListView === "function") showListView();
  else document.querySelector(".contacts_layout")?.classList.remove("is-details");
}

/**
 * Removes a contact from all tasks where they are assigned.
 *
 * Loads tasks from session storage, identifies tasks containing the user,
 * removes the user from each task's assignedTo array, updates session storage,
 * and syncs the changes to the server.
 *
 * @async
 * @function removeContactFromTasks
 * @param {string} userId - The ID of the user to remove from tasks.
 * @returns {Promise<void>}
 */
async function removeContactFromTasks(userId) {
  if (!userId) return;
  const tasks = sessionStorage.getItem("tasks") ? JSON.parse(sessionStorage.getItem("tasks")) : {};
  const updatedTaskIds = removeUserFromTasksAndCollectIds(tasks, userId);

  if (updatedTaskIds.length === 0) return;

  sessionStorage.setItem("tasks", JSON.stringify(tasks));

  await Promise.all(updatedTaskIds.map((taskId) => editData("tasks", taskId, tasks[taskId])));
}

/**
 * Identifies and removes a user from tasks, returning affected task IDs.
 *
 * Iterates over all tasks, checks if the user is in the assignedTo array,
 * removes them if present, and collects the IDs of modified tasks.
 *
 * @function removeUserFromTasksAndCollectIds
 * @param {Object<string, Object>} tasks - Object mapping task IDs to task data.
 * @param {string} userId - The ID of the user to remove.
 * @returns {string[]} Array of task IDs that were modified.
 */
function removeUserFromTasksAndCollectIds(tasks, userId) {
  const updatedTaskIds = [];
  for (const key of Object.keys(tasks)) {
    const task = tasks[key];
    if (Array.isArray(task.assignedTo) && task.assignedTo.includes(userId)) {
      task.assignedTo = task.assignedTo.filter((id) => id !== userId);
      updatedTaskIds.push(key);
    }
  }
  return updatedTaskIds;
}
