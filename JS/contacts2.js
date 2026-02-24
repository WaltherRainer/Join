/**
 * Binds one-time event handlers for closing and actions within the edit modal.
 *
 * Attaches listeners to the close button, delete button, and modal backdrop.
 * Ensures the modal closes appropriately and that the Escape key listener
 * is removed once the modal is closed.
 *
 * @function bindEditModalHandlers
 * @param {HTMLElement} modal - The edit modal element.
 * @param {string} userId - The ID of the user associated with the modal.
 * @param {Function} close - Callback that closes the modal and performs cleanup.
 * @param {Function} [removeEsc] - Optional callback to remove the Escape listener.
 * @returns {void}
 */
function bindEditModalHandlers(modal, userId, close, removeEsc) {
  document.getElementById("edit_modal_close")?.addEventListener("click", close, { once: true });
  document.getElementById("delete_contact_btn")?.addEventListener(
    "click",
    async () => {
      await deleteContact(userId);
      close();
    },
    { once: true },
  );
  modal.addEventListener(
    "click",
    (e) => {
      if (e.target === modal) close();
    },
    { once: true },
  );
  modal.addEventListener("close", () => removeEsc?.(), { once: true });
}

/**
 * Preloads the edit contact form with existing user data.
 *
 * Sets the values of the corresponding form fields so the user can
 * modify the current contact information.
 *
 * @function preloadEditFormData
 * @param {string} givenName - The user's given name.
 * @param {string} email - The user's email address.
 * @param {string} [userPhone] - The user's phone number.
 * @returns {void}
 */
function preloadEditFormData(givenName, email, userPhone) {
  setValueById("edit_user_name", givenName);
  setValueById("edit_user_email", email);
  setValueById("edit_user_phone", userPhone);
}

/**
 * Sets the `value` of an input element by its DOM id.
 *
 * Looks up the element via `document.getElementById` and assigns the given
 * value to its `.value` property if the element exists.
 *
 * @function setValueById
 * @param {string} id - The id of the target form element.
 * @param {*} value - The value to assign (will be coerced to a string by the DOM).
 * @returns {void}
 */
function setValueById(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

/**
 * Closes the add-contact modal and removes its submit handler.
 *
 * Detaches the `submit` event listener that triggers {@link addNewUser}
 * to prevent duplicate submissions on subsequent openings, then closes
 * the dialog via {@link HTMLDialogElement#close}.
 *
 * @function closeContactModal
 * @param {HTMLDialogElement} modal - The dialog element to close.
 * @returns {void}
 */
function closeContactModal(modal) {
  modal.removeEventListener("submit", addNewUser);
  modal.close();
}

/**
 * Registers click listeners to open the add-contact modal.
 *
 * Binds the "add user" buttons to {@link openContactModal} so the modal
 * can be opened from multiple UI entry points.
 *
 * @function contactEventList
 * @returns {void}
 */
function contactEventList() {
  document.getElementById("open_add_user_modal").addEventListener("click", () => {
    openContactModal();
  });
  document.getElementById("open_add_user_modal2").addEventListener("click", () => {
    openContactModal();
  });
}

/**
 * Closes the edit-contact modal and removes its submit handler.
 *
 * Detaches the `submit` event listener that triggers {@link editUser}
 * to prevent duplicate submissions on subsequent openings, then closes
 * the dialog via {@link HTMLDialogElement#close}.
 *
 * @function closeEditContactModal
 * @param {HTMLDialogElement} modal - The dialog element to close.
 * @returns {void}
 */
function closeEditContactModal(modal) {
  modal.removeEventListener("submit", editUser);
  modal.close();
}

/**
 * Binds the submit handler for the add-contact form exactly once.
 *
 * Uses a `data-submit-bound` flag on the form element to prevent
 * duplicate event registrations across multiple modal openings.
 * On submit, the default form action is prevented and {@link addNewUser}
 * is executed asynchronously; errors are caught and logged.
 *
 * @function bindContactFormSubmitOnce
 * @returns {void}
 */
function bindContactFormSubmitOnce() {
  const form = document.getElementById("contact_form");
  if (!form) return;
  if (form.dataset.submitBound === "1") return;
  form.dataset.submitBound = "1";
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await addNewUser();
    } catch (err) {
      console.error("addUser failed", err);
    }
  });
}

/**
 * Binds the submit handler for the edit-contact form exactly once.
 *
 * Uses a `data-submit-bound` flag on the form element to prevent multiple
 * event registrations when the edit modal is opened repeatedly. On submit,
 * the default form action is prevented and {@link editUser} is called with
 * the given user ID; errors are caught and logged.
 *
 * @function bindEditContactFormSubmitOnce
 * @param {string} userId - The ID of the user whose data should be updated.
 * @returns {void}
 */
function bindEditContactFormSubmitOnce(userId) {
  const form = document.getElementById("edit_contact_form");
  if (!form) return;
  if (form.dataset.submitBound === "1") return;
  form.dataset.submitBound = "1";
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await editUser(userId);
    } catch (err) {
      console.error("EditUser failed", err);
    }
  });
}

/**
 * Resets the add-contact form fields to empty strings.
 *
 * Clears the name, email, and phone input values using {@link setValueById}.
 *
 * @function resetContactForm
 * @returns {void}
 */
function resetContactForm() {
  setValueById("user_name", "");
  setValueById("user_email", "");
  setValueById("user_phone", "");
}

/**
 * Creates a new contact from the add-contact form and updates the contacts UI.
 *
 * Reads and validates the form payload, loads the current users collection via
 * {@link initUsersLoading}, prevents duplicates by checking the email with
 * {@link userExistsIn}, then uploads the new user record. After a successful
 * upload, it refreshes the users list, resets and closes the form/modal, re-renders
 * the contact list, re-binds click handling, and shows a success toast.
 *
 * @async
 * @function addNewUser
 * @returns {Promise<void>} Resolves when the user has been created and the UI has been updated.
 *
 * @throws {Error} Propagates errors thrown by {@link initUsersLoading},
 * {@link uploadData}, or {@link refreshUsers} if not handled by the caller.
 */
async function addNewUser() {
  const modal = document.getElementById("add_contact_modal");
  const payload = readNewUserForm();
  if (!payload) return;
  const users = await initUsersLoading();
  if (userExistsIn(users, payload.email)) return;
  await uploadData("/users", { ...payload, password: "12345" });
  const updatedUsers = await refreshUsers();
  resetContactForm();
  if (modal) closeContactModal(modal);
  renderContacts(updatedUsers);
  initContactsClick(updatedUsers);
  showToastOverlay("toast_contact_added");
}

/**
 * Reads and validates the add-contact form values.
 *
 * Extracts email, name, and phone from the form inputs, trims whitespace,
 * and returns a payload object or `null` if any required field is missing.
 *
 * @function readNewUserForm
 * @returns {{email: string, givenName: string, userPhone: string} | null}
 * The normalized form payload, or `null` when validation fails.
 */
function readNewUserForm() {
  const email = document.getElementById("user_email")?.value?.trim() ?? "";
  const givenName = document.getElementById("user_name")?.value?.trim() ?? "";
  const userPhone = document.getElementById("user_phone")?.value?.trim() ?? "";
  if (!email || !givenName || !userPhone) return null;
  return { email, givenName, userPhone };
}

/**
 * Checks whether a user with the given email exists in a users collection.
 *
 * Normalizes the email (trim + lowercase) and compares it against the
 * normalized `email` field of each user entry.
 *
 * @function userExistsIn
 * @param {Object<string, Object>} users - Object mapping user IDs to user data.
 * @param {string} email - Email address to search for.
 * @returns {boolean} `true` if a matching email is found, otherwise `false`.
 */
function userExistsIn(users, email) {
  if (!users || typeof users !== "object") return false;
  const needle = (email ?? "").trim().toLowerCase();
  return Object.values(users).some((u) => (u?.email ?? "").trim().toLowerCase() === needle);
}

/**
 * Reloads the users collection and persists it to session storage.
 *
 * Clears the cached users-loading promise, re-initializes loading via
 * {@link initUsersLoading}, stores the result using {@link saveUsersToSessionStorage},
 * and returns the refreshed users object.
 *
 * @async
 * @function refreshUsers
 * @returns {Promise<Object<string, Object>>} A promise that resolves to the refreshed users collection.
 */
async function refreshUsers() {
  window.usersReady = null;
  const users = await initUsersLoading();
  saveUsersToSessionStorage(users);
  return users;
}

/**
 * Updates an existing user with values from the edit-contact form.
 *
 * Reads and validates the form payload, sends the update request via
 * {@link window.editData}, refreshes the users UI state, and closes the
 * edit modal if present.
 *
 * @async
 * @function editUser
 * @param {string} userId - The ID of the user to update.
 * @returns {Promise<void>} Resolves when the update and UI refresh are complete.
 */
async function editUser(userId) {
  const modal = document.getElementById("edit_contact_modal");
  const payload = readEditUserForm();
  if (!payload) return;
  await window.editData("/users", userId, payload);
  const users = await refreshUsersUI(userId);
  if (modal) closeEditContactModal(modal);
}

/**
 * Reads and validates the edit-contact form values.
 *
 * Extracts email, name, and phone from the edit form inputs, trims whitespace,
 * and returns a payload object or `null` if any required field is missing.
 *
 * @function readEditUserForm
 * @returns {{email: string, givenName: string, userPhone: string} | null}
 * The normalized form payload, or `null` when validation fails.
 */
function readEditUserForm() {
  const email = document.getElementById("edit_user_email")?.value?.trim() ?? "";
  const givenName = document.getElementById("edit_user_name")?.value?.trim() ?? "";
  const userPhone = document.getElementById("edit_user_phone")?.value?.trim() ?? "";
  if (!email || !givenName || !userPhone) return null;
  return { email, givenName, userPhone };
}

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
