/**
 * Initializes the contacts view by verifying the login state
 * and attaching contact-related event listeners.
 *
 * @function initContacts
 * @returns {void}
 */
function initContacts() {
  checkIfUserIsLoggedIn();
  contactEventList();
}

/**
 * Groups users by the first letter of their given name.
 *
 * Iterates over a users object, creates alphabetical groups based on
 * the first character of `givenName`, and sorts each group by name.
 * Users without a valid name are grouped under "#".
 *
 * @function groupUsersByFirstLetter
 * @param {Object<string, Object>} usersObj - Object mapping user IDs to user data.
 * @returns {Object<string, Object[]>} An object whose keys are letters and values are arrays of users.
 */
function groupUsersByFirstLetter(usersObj) {
  const groups = {};
  for (const [id, u] of Object.entries(usersObj || {})) {
    const name = (u?.givenName || "").trim();
    const letter = name ? name[0].toUpperCase() : "#";
    (groups[letter] ||= []).push({ id, ...u });
  }
  for (const letter of Object.keys(groups)) {
    groups[letter].sort((a, b) => (a.givenName || "").localeCompare(b.givenName || ""));
  }
  return groups;
}

/**
 * Renders the contact list grouped alphabetically.
 *
 * Clears existing list items, groups users by their first letter,
 * sorts the groups, and delegates the creation of each group
 * section to {@link createContactGroup}.
 *
 * @function renderContacts
 * @param {Object<string, Object>} users - Object mapping user IDs to user data.
 * @returns {void}
 */
function renderContacts(users) {
  const container = document.querySelector(".contact_list_sect");
  if (!container) return;

  container.querySelectorAll(".contact_list_item").forEach((e) => e.remove());
  const groups = groupUsersByFirstLetter(users);
  const sortedLetters = Object.keys(groups).sort();

  for (const letter of sortedLetters) {
    createContactGroup(letter, groups, container);
  }
}

/**
 * Creates and appends a grouped contact list section for a specific letter.
 *
 * Builds a wrapper element containing the letter header and a list of
 * contact cards generated from the provided user group, then appends
 * the section to the given container.
 *
 * @function createContactGroup
 * @param {string} letter - The group key representing the first letter.
 * @param {Object<string, Object[]>} groups - Object containing user arrays grouped by letter.
 * @param {HTMLElement} container - The DOM element to which the group should be appended.
 * @returns {void}
 */
function createContactGroup(letter, groups, container) {
  const wrapper = document.createElement("div");
  wrapper.className = "contact_list_item";
  const letterDiv = document.createElement("div");
  letterDiv.className = "first_letter";
  letterDiv.textContent = letter;
  wrapper.appendChild(letterDiv);
  groups[letter].forEach((user) => {
    const card = document.createElement("div");
    card.className = "contact_list_card";
    card.dataset.userId = user.id;
    card.innerHTML = getContactListTempl(user.id, user.givenName, user.email);
    wrapper.appendChild(card);
  });
  container.appendChild(wrapper);
}

/**
 * Renders the detailed view for a selected contact.
 *
 * Retrieves the user by ID, computes display metadata such as initials
 * and color, injects the contact details template into the target
 * container, and initializes related UI controls (icons, edit, delete).
 *
 * @function renderContactDetails
 * @param {Object<string, Object>} users - Object mapping user IDs to user data.
 * @param {string} userId - The ID of the user whose details should be rendered.
 * @returns {void}
 */
function renderContactDetails(users, userId) {
  const u = users?.[userId];
  if (!u) return;

  const initials = initialsFromGivenName(u.givenName);
  const bgColor = colorIndexFromUserId(userId);

  const target = document.getElementById("contact_details_sect");
  if (!target) return;
  target.dataset.userId = userId;
  target.innerHTML = getContactDetailsTempl(bgColor, initials, u.givenName, u.email, u.userPhone || "-", userId);
  renderIcons(target);

  initEditButton(userId, u.givenName, u.email, u.userPhone);
  initDeleteButton(userId);
}

/**
 * Attaches a click handler to the edit button to open the contact edit modal.
 *
 * When the button is clicked, the edit modal is opened with the provided
 * user data. If the button is not present in the DOM, the function exits
 * without performing any action.
 *
 * @function initEditButton
 * @param {string} userId - The ID of the user to edit.
 * @param {string} givenName - The user's given name.
 * @param {string} email - The user's email address.
 * @param {string} [userPhone] - The user's phone number.
 * @returns {void}
 */
function initEditButton(userId, givenName, email, userPhone) {
  const editBtn = document.getElementById("edit_user");
  if (!editBtn) return;

  editBtn.addEventListener("click", () => {
    openEditContactModal(userId, givenName, email, userPhone);
    console.log(window.users);
  });
}

/**
 * Attaches a click handler to the delete button to remove a contact.
 *
 * When triggered, the provided user ID is passed to the contact deletion
 * routine. If the delete button is not found in the DOM, the function
 * exits without side effects.
 *
 * @function initDeleteButton
 * @param {string} userId - The ID of the user to be deleted.
 * @returns {void}
 */
function initDeleteButton(userId) {
  const deleteBtn = document.getElementById("btn_delete_user");
  if (!deleteBtn) return;

  deleteBtn.addEventListener("click", () => {
    deleteContact(userId);
  });
}

function initContactsClick(users) {
  const list = document.querySelector(".contact_list_sect");
  if (!list) return;

  // verhindert Mehrfach-Bindings, falls initContactsClick öfter aufgerufen wird
  if (list.dataset.clickBound === "1") return;
  list.dataset.clickBound = "1";

  const mqMobile = window.matchMedia("(max-width: 1100px)");

  list.addEventListener("click", (e) => {
    const card = e.target.closest(".contact_list_card");
    if (!card) return;

    const userId = card.dataset.userId;
    if (!userId) return;

    setActiveContactCard(card);
    renderContactDetails(users, userId);

    if (mqMobile.matches) {
      document.querySelector(".contacts_layout")?.classList.add("is-details");
    }
  });
}

/**
 * Marks a contact card as active and removes the active state from others.
 *
 * Ensures that only one contact card has the `is-active` class by clearing
 * it from any previously active cards and applying it to the provided element.
 *
 * @function setActiveContactCard
 * @param {HTMLElement} cardEl - The contact card element to activate.
 * @returns {void}
 */
function setActiveContactCard(cardEl) {
  document.querySelectorAll(".contact_list_card.is-active").forEach((el) => el.classList.remove("is-active"));
  cardEl.classList.add("is-active");
}

/**
 * Deletes a contact and refreshes the UI state.
 *
 * Sends a delete request for the specified user ID, reloads the updated
 * users collection, persists it to session storage, and re-renders the
 * contact list. Any active selection is cleared and the contact details
 * panel is reset. Errors during the process are caught and logged.
 *
 * @async
 * @function deleteContact
 * @param {string} userId - The ID of the user to delete.
 * @returns {Promise<void>}
 */
async function deleteContact(userId) {
  if (!userId) return;
  try {
    await deleteData(`/users/${userId}`);
    users = (await loadData("/users")) || {};
    saveUsersToSessionStorage(users);
    renderContacts(users);
    document.querySelectorAll(".contact_list_card.is-active").forEach((el) => el.classList.remove("is-active"));
    const details = document.getElementById("contact_details_sect");
    if (details) {
      details.innerHTML = "";
    }
  } catch (err) {
    console.error("Delete failed:", err);
  }
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

  if (modal.open) return; // optional gegen Doppel-Open

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
