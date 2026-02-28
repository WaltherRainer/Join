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
}

/**
 * Handles contact card selection via event delegation on the contact list.
 *
 * Detects clicks on `.contact_list_card` elements, marks the clicked card as active,
 * renders the corresponding contact details, and switches to the details view on
 * mobile breakpoints.
 *
 * @listens HTMLElement#click
 * @param {MouseEvent} e - Click event from the contact list container.
 * @returns {void}
 */
document.querySelector(".contact_list_sect")?.addEventListener("click", (e) => {
  const card = e.target.closest(".contact_list_card");
  if (!card) return;
  const userId = card.dataset.userId;
  setActiveContactCard(card);
  renderContactDetails(users, userId);
  if (mqMobile.matches) showDetailsView();
});

document.querySelector(".back_to_list")?.addEventListener("click", () => {
  showListView();
});

mqMobile.addEventListener("change", (e) => {
  if (!e.matches) showListView();
});

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
