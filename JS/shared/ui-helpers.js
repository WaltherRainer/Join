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
 * Renders all assigned user avatars into a container.
 * Displays up to MAX_VISIBLE avatars and a "+N" indicator for extras.
 * Orchestrates all avatar creation and rendering functions.
 *
 * @function renderAssignedAvatars
 * @param {Array|Set|Iterable} selectedUserIds - User IDs to render
 * @param {Object} usersData - Lookup object with user data keyed by ID
 * @param {HTMLElement} container - Container element to render into
 * @returns {void}
 */
function renderAssignedAvatars(selectedUserIds, usersData, container) {
  if (!container) return;
  clearAvatarContainer(container);
  const idsArray = normalizeUserIds(selectedUserIds);
  const { visibleUsers, extraCount } = calculateVisibleAvatars(idsArray);
  visibleUsers.forEach((userId) => {
    const user = usersData[userId];
    if (!user) return;
    const avatar = createUserAvatar(userId, user);
    appendAvatarToContainer(container, avatar);
  });
  if (extraCount > 0) {
    const moreAvatar = createMoreAvatar(extraCount);
    appendAvatarToContainer(container, moreAvatar);
  }
}

/**
 * Attaches a global escape-key handler for modals.
 *
 * @function listenEscapeFromModal
 * @param {string} modalDOMId - ID of modal element
 * @param {Function} onClose - Callback to execute on close
 * @returns {Function} Cleanup function
 */
function listenEscapeFromModal(modalDOMId, onClose) {
  const handler = async (event) => {
    if (event.key !== "Escape") return;
    const modal = document.getElementById(modalDOMId);
    if (!modal) return;
    const isOpen = modal.open === true || modal.classList.contains("active");
    if (!isOpen) return;
    if (typeof onClose === "function") {
      await onClose(modal);
    } else {
      modal.close?.();
      modal.classList.remove("active");
    }
  };
  document.addEventListener("keydown", handler);
  return () => document.removeEventListener("keydown", handler);
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
