/**
 * Reloads users, updates the contacts list, and optionally re-renders the active user's details.
 *
 * Clears the cached users-loading promise, fetches the latest users via
 * {@link initUsersLoading}, persists them to session storage, and re-renders
 * the contacts list. If an `activeUserId` is provided, the contact details
 * view is rendered for that user.
 *
 * @async
 * @function refreshUsersUI
 * @param {string} [activeUserId] - Optional user ID whose details should remain visible after refresh.
 * @returns {Promise<Object<string, Object>>} A promise that resolves to the refreshed users collection.
 */
async function refreshUsersUI(activeUserId) {
  window.usersReady = null;
  const users = await initUsersLoading();
  saveUsersToSessionStorage(users);
  renderContacts(users);
  initContactsClick(users);
  if (activeUserId) {
    renderContactDetails(users, activeUserId);
  }
  return users;
}

/**
 * Renders the avatar preview in the edit contact form.
 *
 * Computes the user's initials and a color index, then applies the
 * corresponding background color and initials to the avatar element.
 * If the avatar element is not present, the function exits silently.
 *
 * @function renderEditContactAvatar
 * @param {string} userId - The ID of the user used to derive the color.
 * @param {string} givenName - The user's given name used to compute initials.
 * @returns {void}
 */
function renderEditContactAvatar(userId, givenName) {
  const avatarEl = document.getElementById("user_avatar_edit");
  if (!avatarEl) return;
  const initials = initialsFromGivenName(givenName);
  const bgColor = colorIndexFromUserId(userId);
  avatarEl.style.backgroundColor = `var(--user_c_${bgColor})`;
  avatarEl.innerHTML = initials;
}

const mqMobile = window.matchMedia("(max-width: 1100px)");

/**
 * Closes the mobile edit/delete popup menu.
 *
 * Removes the open state class and updates related ARIA attributes.
 *
 * @function closeMobileEditDeleteMenu
 * @returns {void}
 */
function closeMobileEditDeleteMenu() {
  const menu = document.getElementById("mobile_edit_delete_menu");
  const trigger = document.getElementById("open_edit_delete_menu");
  if (!menu || !trigger) return;

  menu.classList.remove("is-open");
  menu.setAttribute("aria-hidden", "true");
  trigger.setAttribute("aria-expanded", "false");
}

/**
 * Initializes the mobile edit/delete popup menu interactions.
 *
 * Wires the options FAB to toggle a popup and forwards menu actions to the
 * existing detail-view edit/delete buttons so current handlers are reused.
 *
 * @function initMobileEditDeleteMenu
 * @returns {void}
 */
function getMobileEditDeleteMenuElements() {
  const trigger = document.getElementById("open_edit_delete_menu");
  const menu = document.getElementById("mobile_edit_delete_menu");
  const editAction = document.getElementById("mobile_menu_edit");
  const deleteAction = document.getElementById("mobile_menu_delete");
  if (!trigger || !menu || !editAction || !deleteAction) return null;
  return { trigger, menu, editAction, deleteAction };
}

function setMobileMenuTriggerA11y(trigger) {
  trigger.setAttribute("aria-haspopup", "true");
  trigger.setAttribute("aria-controls", "mobile_edit_delete_menu");
  trigger.setAttribute("aria-expanded", "false");
}

function toggleMobileEditDeleteMenu(menu, trigger) {
  const willOpen = !menu.classList.contains("is-open");
  menu.classList.toggle("is-open", willOpen);
  menu.setAttribute("aria-hidden", String(!willOpen));
  trigger.setAttribute("aria-expanded", String(willOpen));
}

function bindMobileMenuTriggerToggle(trigger, menu) {
  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleMobileEditDeleteMenu(menu, trigger);
  });
}

function bindMobileMenuOutsideClose(menu, trigger) {
  document.addEventListener("click", (event) => {
    if (!menu.classList.contains("is-open")) return;
    if (menu.contains(event.target) || trigger.contains(event.target)) return;
    closeMobileEditDeleteMenu();
  });
}

function bindMobileMenuEscapeClose() {
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMobileEditDeleteMenu();
  });
}

function clickContactActionButton(buttonId) {
  document.getElementById(buttonId)?.click();
}

function bindMobileMenuAction(actionButton, targetButtonId) {
  actionButton.addEventListener("click", () => {
    closeMobileEditDeleteMenu();
    clickContactActionButton(targetButtonId);
  });
}

function bindMobileMenuActions(editAction, deleteAction) {
  bindMobileMenuAction(editAction, "edit_user");
  bindMobileMenuAction(deleteAction, "btn_delete_user");
}

function initMobileEditDeleteMenu() {
  const elements = getMobileEditDeleteMenuElements();
  if (!elements) return;

  const { trigger, menu, editAction, deleteAction } = elements;
  if (!bindOnce(trigger, "mobileMenuBound")) return;

  setMobileMenuTriggerA11y(trigger);
  bindMobileMenuTriggerToggle(trigger, menu);
  bindMobileMenuOutsideClose(menu, trigger);
  bindMobileMenuEscapeClose();
  bindMobileMenuActions(editAction, deleteAction);
}

/**
 * Switches the contacts layout into "details" view mode.
 *
 * Adds the `is-details` class to the `.contacts_layout` container if it exists.
 *
 * @function showDetailsView
 * @returns {void}
 */
function showDetailsView() {
  document.querySelector(".contacts_layout")?.classList.add("is-details");
}

/**
 * Switches the contacts layout back to "list" view mode.
 *
 * Removes the `is-details` class from the `.contacts_layout` container if it exists.
 *
 * @function showListView
 * @returns {void}
 */
function showListView() {
  document.querySelector(".contacts_layout")?.classList.remove("is-details");
  closeMobileEditDeleteMenu();
}



document.querySelector(".back_to_list")?.addEventListener("click", () => {
  showListView();
});

mqMobile.addEventListener("change", (e) => {
  if (!e.matches) showListView();
});

initMobileEditDeleteMenu();

/**
 * Opens the edit-contact modal and initializes its state.
 *
 * Ensures the modal is opened only once, preloads the form with the
 * current user data, renders the avatar preview, binds the submit
 * handler, and attaches close and cleanup listeners including Escape.
 *
 * @function openEditContactModal
 * @param {string} userId - The ID of the user being edited.
 * @param {string} givenName - The user's given name.
 * @param {string} email - The user's email address.
 * @param {string} [userPhone] - The user's phone number.
 * @returns {void}
 */
function openEditContactModal(userId, givenName, email, userPhone) {
  const modal = document.getElementById("edit_contact_modal");
  if (!modal) return;

  if (modal.open) return;

  modal.showModal();

  preloadEditFormData(givenName, email, userPhone);
  renderEditContactAvatar(userId, givenName);

  bindEditContactFormSubmitOnce(userId);

  const removeEsc = listenEscapeFromModal(modal.id, (m) => closeEditContactModal(m));
  const close = () => closeAndCleanupEditModal(modal, removeEsc);

  bindEditModalHandlers(modal, userId, close, removeEsc);
}

/**
 * Closes the edit-contact modal and performs cleanup.
 *
 * Invokes the edit modal close routine and optionally removes the
 * Escape key listener associated with the modal.
 *
 * @function closeAndCleanupEditModal
 * @param {HTMLElement} modal - The edit modal element to close.
 * @param {Function} [removeEsc] - Optional callback to remove the Escape listener.
 * @returns {void}
 */
function closeAndCleanupEditModal(modal, removeEsc) {
  closeEditContactModal(modal);
  removeEsc?.();
}

/**
 * Opens the add-contact modal and initializes its behavior.
 *
 * Displays the modal dialog, ensures the submit handler is bound once,
 * registers an Escape key listener, and attaches close handlers that
 * properly clean up when the modal is dismissed.
 *
 * @function openContactModal
 * @returns {void}
 */
function openContactModal() {
  const modal = document.getElementById("add_contact_modal");
  if (!modal) return;
  modal.showModal();
  bindContactFormSubmitOnce();
  const removeEsc = listenEscapeFromModal(modal.id, (m) => closeContactModal(m));
  const close = () => closeAndCleanup(modal, removeEsc);
  bindContactModalCloseHandlers(modal, close, removeEsc);
}

/**
 * Closes a modal dialog and performs related cleanup.
 *
 * Invokes the modal close routine and optionally removes the
 * previously registered Escape key listener.
 *
 * @function closeAndCleanup
 * @param {HTMLElement} modal - The modal element to close.
 * @param {Function} [removeEsc] - Optional callback to remove the Escape listener.
 * @returns {void}
 */
function closeAndCleanup(modal, removeEsc) {
  closeContactModal(modal);
  removeEsc?.();
}

/**
 * Binds one-time close and cleanup handlers to the contact modal.
 *
 * Attaches click listeners to the modal’s close and clear buttons,
 * closes the modal when clicking on the backdrop, and ensures the
 * Escape key listener is removed once the modal is closed.
 *
 * @function bindContactModalCloseHandlers
 * @param {HTMLElement} modal - The modal element to attach handlers to.
 * @param {Function} close - Callback that closes the modal and performs cleanup.
 * @param {Function} [removeEsc] - Optional callback to remove the Escape listener.
 * @returns {void}
 */
function bindContactModalCloseHandlers(modal, close, removeEsc) {
  const closeBtn = document.getElementById("modal_close");
  closeBtn?.addEventListener("click", close, { once: true });
  const clearBtn = document.getElementById("clear_contact_form");
  clearBtn?.addEventListener("click", close, { once: true });
  modal.addEventListener(
    "click",
    (e) => {
      if (e.target === modal) close();
    },
    { once: true },
  );
  modal.addEventListener("close", () => removeEsc?.(), { once: true });
}
