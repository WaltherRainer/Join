/**
 * Toggles the visibility of the user menu element by toggling CSS class.
 *
 * @function toggleUserMenu
 * @returns {void}
 */
function toggleUserMenu() {
  let userMenu = document.getElementById("user_menu");
  if (!userMenu) return;
  userMenu.classList.toggle("d_none");
}

/**
 * Configures the button to open the user dialog when clicked.
 *
 * @function showUserDialog
 * @returns {void}
 */
function showUserDialog() {
  const dialog = document.getElementById("user_menu");
  openBtn.addEventListener("click", () => {
    dialog.showModal();
  });
}

/**
 * Normalizes user IDs to a consistent array format.
 * Converts various input types (Array, Set, etc.) to a standard array.
 *
 * @function normalizeUserIds
 * @param {Array|Set|Iterable} selectedUserIds - User IDs in any iterable format
 * @returns {Array} Array of user IDs
 */
function normalizeUserIds(selectedUserIds) {
  return Array.isArray(selectedUserIds) ? selectedUserIds : Array.from(selectedUserIds);
}

/**
 * Calculates which users should be visible and how many are hidden.
 * Respects the MAX_VISIBLE limit.
 *
 * @function calculateVisibleAvatars
 * @param {Array} idsArray - Array of user IDs
 * @param {number} maxVisible - Maximum number of avatars to display
 * @returns {Object} Object with visibleUsers array and extraCount number
 */
function calculateVisibleAvatars(idsArray, maxVisible = 5) {
  return {
    visibleUsers: idsArray.slice(0, maxVisible),
    extraCount: idsArray.length - maxVisible,
  };
}

/**
 * Creates a single user avatar element.
 * Builds span element with user initials and background color.
 *
 * @function createUserAvatar
 * @param {string} userId - The user ID
 * @param {Object} user - User data object
 * @returns {HTMLElement} The avatar span element
 */
function createUserAvatar(userId, user) {
  const initials = initialsFromGivenName(user.givenName);
  const bgColor = colorVarFromUserId(userId);
  const avatar = document.createElement("span");
  avatar.className = "user__avatar avatar_wrap";
  avatar.style.background = bgColor;
  avatar.textContent = initials;
  return avatar;
}

/**
 * Creates the "+N more users" avatar element.
 * Displayed when there are more avatars than can be shown.
 *
 * @function createMoreAvatar
 * @param {number} extraCount - Number of hidden users
 * @returns {HTMLElement} The more avatar span element
 */
function createMoreAvatar(extraCount) {
  const moreAvatar = document.createElement("span");
  moreAvatar.className = "user__avatar avatar_wrap avatar_more";
  moreAvatar.textContent = `+${extraCount}`;
  return moreAvatar;
}

/**
 * Clears all child elements from the container.
 *
 * @function clearAvatarContainer
 * @param {HTMLElement} container - The container element
 * @returns {void}
 */
function clearAvatarContainer(container) {
  container.innerHTML = "";
}

/**
 * Appends an avatar element to the container.
 *
 * @function appendAvatarToContainer
 * @param {HTMLElement} container - The container element
 * @param {HTMLElement} avatar - The avatar element to append
 * @returns {void}
 */
function appendAvatarToContainer(container, avatar) {
  container.appendChild(avatar);
}

/**
 * Renders assigned user avatars into the given container.
 *
 * Clears the container, renders up to the maximum visible avatars, and appends
 * a "+N" avatar if more users are assigned than can be shown.
 *
 * @function renderAssignedAvatars
 * @param {Array<string>|Set<string>} selectedUserIds - Selected user IDs to render.
 * @param {Object<string, Object>} usersData - Map of userId -> user data.
 * @param {HTMLElement} container - Target container for avatar elements.
 * @returns {void}
 */
function renderAssignedAvatars(selectedUserIds, usersData, container) {
  if (!container) return;
  clearAvatarContainer(container);

  const { visibleUsers, extraCount } = calculateVisibleAvatars(normalizeUserIds(selectedUserIds));
  renderVisibleUserAvatars(visibleUsers, usersData, container);

  if (extraCount > 0) appendAvatarToContainer(container, createMoreAvatar(extraCount));
}

/**
 * Appends avatar elements for the provided user IDs to the container.
 *
 * Skips IDs that are missing in the users data map and uses {@link createUserAvatar}
 * to create each avatar element before appending.
 *
 * @function renderVisibleUserAvatars
 * @param {string[]} userIds - User IDs to render as avatars.
 * @param {Object<string, Object>} usersData - Map of userId -> user data.
 * @param {HTMLElement} container - Target container for avatar elements.
 * @returns {void}
 */
function renderVisibleUserAvatars(userIds, usersData, container) {
  userIds.forEach((userId) => {
    const user = usersData?.[userId];
    if (!user) return;
    appendAvatarToContainer(container, createUserAvatar(userId, user));
  });
}

/**
 * Registers a global Escape-key listener that closes a modal when it is open.
 *
 * Creates a keydown handler via {@link createEscapeModalHandler}, attaches it to the document,
 * and returns an unsubscribe function to remove the listener again.
 *
 * @function listenEscapeFromModal
 * @param {string} modalDOMId - DOM id of the modal element to control.
 * @param {(modal: HTMLElement) => (void|Promise<void>)} [onClose] - Optional custom close callback.
 * @returns {() => void} Unsubscribe function that removes the keydown listener.
 */
function listenEscapeFromModal(modalDOMId, onClose) {
  const handler = createEscapeModalHandler(modalDOMId, onClose);
  document.addEventListener("keydown", handler);
  return () => document.removeEventListener("keydown", handler);
}

/**
 * Creates a keydown handler that closes the target modal when Escape is pressed.
 *
 * Only acts if the element exists and is considered open (`<dialog>.open` or `.active` class).
 * If no custom onClose is provided, it falls back to `modal.close()` and removing `.active`.
 *
 * @function createEscapeModalHandler
 * @param {string} modalDOMId - DOM id of the modal element to control.
 * @param {(modal: HTMLElement) => (void|Promise<void>)} [onClose] - Optional custom close callback.
 * @returns {(event: KeyboardEvent) => void} Keydown event handler.
 */
function createEscapeModalHandler(modalDOMId, onClose) {
  return (event) => {
    if (event.key !== "Escape") return;
    const modal = document.getElementById(modalDOMId);
    if (!modal || !(modal.open === true || modal.classList.contains("active"))) return;
    if (typeof onClose === "function") Promise.resolve(onClose(modal));
    else {
      modal.close?.();
      modal.classList.remove("active");
    }
  };
}

/**
 * Initializes global event listeners for the user dialog/menu.
 *
 * Retrieves the required UI elements and binds handlers for toggling the dialog,
 * closing on outside clicks, and closing via the Escape key.
 *
 * @function InitGlobalEventListener
 * @returns {void}
 */
function InitGlobalEventListener() {
  const ui = getUserDialogUI();
  if (!ui) return;
  bindUserDialogToggle(ui);
  bindUserDialogOutsideClose(ui);
  bindUserDialogEscapeClose();
}

/**
 * Retrieves the UI elements required for the user dialog/menu.
 *
 * Looks up the open button and the dialog element and returns them as a bundle,
 * or `null` if any element is missing.
 *
 * @function getUserDialogUI
 * @returns {{btn: HTMLElement, menu: HTMLDialogElement} | null} UI bundle or `null` when incomplete.
 */
function getUserDialogUI() {
  const btn = document.getElementById("open_user_dialog");
  const menu = document.getElementById("user_dialog");
  return btn && menu ? { btn, menu } : null;
}

/**
 * Binds the click handler to toggle the user dialog.
 *
 * Prevents the default button behavior and toggles the dialog via {@link toggleUserDialog}.
 *
 * @function bindUserDialogToggle
 * @param {{btn: HTMLElement, menu: HTMLDialogElement}} ui - UI bundle containing trigger button and dialog.
 * @returns {void}
 */
function bindUserDialogToggle({ btn, menu }) {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    toggleUserDialog(menu);
  });
}

/**
 * Closes the user dialog when clicking outside the dialog or its trigger button.
 *
 * Listens on the document for clicks and, when the dialog is visible, closes it
 * if the click occurred outside both the dialog and the toggle button.
 *
 * @function bindUserDialogOutsideClose
 * @param {{btn: HTMLElement, menu: HTMLDialogElement}} ui - UI bundle containing trigger button and dialog.
 * @returns {void}
 */
function bindUserDialogOutsideClose({ btn, menu }) {
  document.addEventListener("click", (e) => {
    if (menu.hidden) return;
    if (clickedOutside(e, menu, btn)) closeUserMenuDialog();
  });
}

/**
 * Closes the user dialog when the Escape key is pressed.
 *
 * @function bindUserDialogEscapeClose
 * @returns {void}
 */
function bindUserDialogEscapeClose() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeUserMenuDialog();
  });
}

/**
 * Toggles the user dialog open or closed based on its current hidden state.
 *
 * @function toggleUserDialog
 * @param {HTMLElement} menu - The user dialog element whose visibility is toggled.
 * @returns {void}
 */
function toggleUserDialog(menu) {
  menu.hidden ? openUserMenuDialog() : closeUserMenuDialog();
}

/**
 * Checks whether an event target lies outside all provided elements.
 *
 * Returns `true` only if every element exists and does not contain `event.target`.
 *
 * @function clickedOutside
 * @param {Event} event - Event containing the click target.
 * @param {...HTMLElement} els - Elements to test against.
 * @returns {boolean} `true` if the target is outside all elements, otherwise `false`.
 */
function clickedOutside(event, ...els) {
  return els.every((el) => el && !el.contains(event.target));
}

/**
 * Opens the user menu dialog and focuses first link.
 *
 * @function openUserMenuDialog
 * @returns {void}
 */
function openUserMenuDialog() {
  const menu = document.getElementById("user_dialog");
  menu.hidden = false;
  const firstLink = menu.querySelector("a, button");
  firstLink?.focus();
}

/**
 * Closes the user menu dialog.
 *
 * @function closeUserMenuDialog
 * @returns {void}
 */
function closeUserMenuDialog() {
  const menu = document.getElementById("user_dialog");
  menu.hidden = true;
}
