let contactClickHandler = null;

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
 * Creates and appends a contact group section for a given first letter.
 *
 * Builds the wrapper element, adds the letter header, appends all user cards
 * from the provided groups map, and finally appends the wrapper to the container.
 *
 * @function createContactGroup
 * @param {string} letter - Group letter (e.g., "A", "B").
 * @param {Object<string, Array>} groups - Map of letters to user arrays.
 * @param {HTMLElement} container - Target container to append the group into.
 * @returns {void}
 */
function createContactGroup(letter, groups, container) {
  const wrapper = document.createElement("div");
  wrapper.className = "contact_list_item";
  wrapper.appendChild(createContactGroupHeader(letter));
  (groups?.[letter] ?? []).forEach((user) => wrapper.appendChild(createContactCard(user)));
  container?.appendChild(wrapper);
}

/**
 * Creates the header element displaying the group letter.
 *
 * @function createContactGroupHeader
 * @param {string} letter - Group letter to display.
 * @returns {HTMLDivElement} Header element for the contact group.
 */
function createContactGroupHeader(letter) {
  const letterDiv = document.createElement("div");
  letterDiv.className = "first_letter";
  letterDiv.textContent = letter;
  return letterDiv;
}

/**
 * Creates a single contact card element for a user.
 *
 * @function createContactCard
 * @param {{id:string|number,givenName:string,email:string}} user - User data.
 * @returns {HTMLDivElement} Contact card element.
 */
function createContactCard(user) {
  const card = document.createElement("div");
  card.className = "contact_list_card";
  card.dataset.userId = user.id;
  card.innerHTML = getContactListTempl(user.id, user.givenName, user.email);
  return card;
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

/**
 * Initializes click handling for the contacts list.
 *
 * Removes any previously attached click handler, creates a new handler with
 * the current users data and mobile media query, stores it in the global
 * {@link contactClickHandler} to allow later removal, and attaches it to
 * the contacts list container. This pattern allows updating the users data
 * when new contacts are added without accumulating multiple listeners.
 *
 * @function initContactsClick
 * @param {Object<string, Object>} users - Object mapping user IDs to user data.
 * @returns {void}
 */

function initContactsClick(users) {
  const list = document.querySelector(".contact_list_sect");
  if (!list) return;
  const mqMobile = window.matchMedia("(max-width: 1100px)");
  if (contactClickHandler) {
    list.removeEventListener("click", contactClickHandler);
  }
  contactClickHandler = (e) => handleContactCardClick(e, users, mqMobile);
  list.addEventListener("click", contactClickHandler);
}

/**
 * Ensures an element is only bound/initialized once using a data-flag.
 *
 * Checks `el.dataset[flag]` for a marker value and sets it to `"1"` if not present.
 *
 * @function bindOnce
 * @param {HTMLElement} el - Element used to store the binding flag.
 * @param {string} flag - Dataset key used as the one-time marker.
 * @returns {boolean} `true` if binding should proceed, otherwise `false`.
 */
function bindOnce(el, flag) {
  if (el.dataset[flag] === "1") return false;
  el.dataset[flag] = "1";
  return true;
}

/**
 * Handles a click on a contact card: activates it, renders details, and toggles mobile view.
 *
 * Resolves the clicked user ID, marks the corresponding card as active, renders the
 * contact details, and switches to the details view on mobile breakpoints.
 *
 * @function handleContactCardClick
 * @param {MouseEvent} e - Click event from the contact list.
 * @param {MediaQueryList} mqMobile - Media query used to detect mobile layout.
 * @returns {void}
 */
function handleContactCardClick(e, users, mqMobile) {
  const userId = getClickedUserId(e);
  if (!userId) return;
  const card = e.target.closest(".contact_list_card");
  setActiveContactCard(card);
  renderContactDetails(users, userId);
  if (mqMobile.matches) showDetailsView();
}

/**
 * Extracts the clicked contact's user ID from a click event.
 *
 * Finds the nearest `.contact_list_card` element and returns its `data-user-id`
 * value, or `null` if the click was not on a contact card.
 *
 * @function getClickedUserId
 * @param {MouseEvent} e - Click event to inspect.
 * @returns {string|null} The clicked user's ID, or `null` if none was found.
 */
function getClickedUserId(e) {
  const card = e.target.closest(".contact_list_card");
  return card?.dataset?.userId ?? null;
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
 * Requests user confirmation before deleting a contact.
 *
 * Retrieves the confirmation UI, opens the modal, binds the required handlers,
 * and resolves with `true` (confirmed) or `false` (canceled / unavailable).
 *
 * @function requestDeleteContactConfirmation
 * @returns {Promise<boolean>} Resolves to `true` if deletion is confirmed, otherwise `false`.
 */
function requestDeleteContactConfirmation() {
  const ui = getDeleteConfirmUI();
  if (!ui) return Promise.resolve(false);
  return new Promise((resolve) => {
    const state = { settled: false };
    const finalize = (result) => finalizeConfirm(ui, state, result, resolve);
    const handlers = makeDeleteConfirmHandlers(ui, finalize);
    bindDeleteConfirmHandlers(ui, handlers);
    openDeleteConfirmModal(ui);
  });
}

/**
 * Collects and returns the required DOM elements for the delete-confirmation modal.
 *
 * Looks up the modal and its close/cancel/confirm buttons. If any element is missing,
 * returns `null`.
 *
 * @function getDeleteConfirmUI
 * @returns {{modal: HTMLDialogElement, closeBtn: HTMLElement, cancelBtn: HTMLElement, confirmBtn: HTMLElement} | null}
 * UI element bundle or `null` when incomplete.
 */
function getDeleteConfirmUI() {
  const modal = document.getElementById("confirm_delete_contact_modal");
  const closeBtn = document.getElementById("confirm_delete_contact_close");
  const cancelBtn = document.getElementById("cancel_delete_contact_btn");
  const confirmBtn = document.getElementById("confirm_delete_contact_btn");
  return modal && closeBtn && cancelBtn && confirmBtn ? { modal, closeBtn, cancelBtn, confirmBtn } : null;
}

/**
 * Creates the event handler set for the delete-confirmation modal.
 *
 * Maps confirm/cancel/backdrop/close interactions to the shared `finalize`
 * function, resolving with `true` on confirm and `false` otherwise.
 *
 * @function makeDeleteConfirmHandlers
 * @param {{modal: HTMLDialogElement}} ui - Delete-confirm modal UI bundle.
 * @param {(result: boolean) => void} finalize - Finalizer that resolves the confirmation.
 * @returns {{
 *   onConfirm: () => void,
 *   onCancel: () => void,
 *   onBackdrop: (e: MouseEvent) => void,
 *   onClose: () => void
 * }} Handler functions for binding to UI events.
 */
function makeDeleteConfirmHandlers(ui, finalize) {
  return {
    onConfirm: () => finalize(true),
    onCancel: () => finalize(false),
    onBackdrop: (e) => e.target === ui.modal && finalize(false),
    onClose: () => finalize(false),
  };
}

/**
 * Binds event listeners for the delete-confirmation modal and stores a teardown hook.
 *
 * Attaches handlers for confirm/cancel/close button clicks, backdrop clicks, and the
 * dialog `close` event. Also assigns a `_deleteConfirmTeardown` function on the modal
 * to remove these listeners later via {@link teardownDeleteConfirmHandlers}.
 *
 * @function bindDeleteConfirmHandlers
 * @param {{modal: HTMLDialogElement, closeBtn: HTMLElement, cancelBtn: HTMLElement, confirmBtn: HTMLElement}} ui
 * UI element bundle for the confirmation modal.
 * @param {{onConfirm: Function, onCancel: Function, onBackdrop: Function, onClose: Function}} h
 * Handler functions to bind.
 * @returns {void}
 */
function bindDeleteConfirmHandlers(ui, h) {
  ui.confirmBtn.addEventListener("click", h.onConfirm);
  ui.cancelBtn.addEventListener("click", h.onCancel);
  ui.closeBtn.addEventListener("click", h.onCancel);
  ui.modal.addEventListener("click", h.onBackdrop);
  ui.modal.addEventListener("close", h.onClose);
  ui.modal._deleteConfirmTeardown = () => teardownDeleteConfirmHandlers(ui, h);
}

/**
 * Removes previously bound event listeners from the delete-confirmation modal.
 *
 * Detaches all handlers added by {@link bindDeleteConfirmHandlers}.
 *
 * @function teardownDeleteConfirmHandlers
 * @param {{modal: HTMLDialogElement, closeBtn: HTMLElement, cancelBtn: HTMLElement, confirmBtn: HTMLElement}} ui
 * UI element bundle for the confirmation modal.
 * @param {{onConfirm: Function, onCancel: Function, onBackdrop: Function, onClose: Function}} h
 * Handler functions to remove.
 * @returns {void}
 */
function teardownDeleteConfirmHandlers(ui, h) {
  ui.confirmBtn.removeEventListener("click", h.onConfirm);
  ui.cancelBtn.removeEventListener("click", h.onCancel);
  ui.closeBtn.removeEventListener("click", h.onCancel);
  ui.modal.removeEventListener("click", h.onBackdrop);
  ui.modal.removeEventListener("close", h.onClose);
}
