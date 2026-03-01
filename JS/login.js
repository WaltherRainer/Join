const signInContainer = document.getElementById("sign_up_form");
const logInContainer = document.getElementById("login_wrapper");
const indexHeader = document.getElementById("index_header");
const ICON = Object.freeze({
  LOCK: "lock",
  EYE_CLOSED: "eye_closed",
  EYE_OPEN: "eye_open",
});

/**
 * Sets the password field icon (lock, eye closed, or eye open).
 *
 * Updates the data-icon attribute and re-renders the icon if the renderer is available.
 *
 * @param {HTMLElement} button - The button element containing the icon.
 * @param {string} iconName - The name of the icon to display (LOCK, EYE_CLOSED, EYE_OPEN).
 * @returns {void}
 */
function setPwIcon(button, iconName) {
  const holder = button.querySelector("[data-icon]");
  if (!holder) return;
  holder.dataset.icon = iconName;
  if (window.renderIcons) window.renderIcons(button);
}

/**
 * Sets the ARIA label for the password toggle button based on input state.
 *
 * Provides appropriate accessibility labels for screen readers depending on whether
 * the password field is empty, hidden, or visible.
 *
 * @param {HTMLInputElement} input - The password input element.
 * @param {HTMLElement} btn - The password toggle button element.
 * @returns {void}
 */
function setAriaLabel(input, btn) {
  const hasValue = input.value.length > 0;
  if (!hasValue) btn.setAttribute("aria-label", "Passwortfeld ist leer");
  else if (input.type === "password") btn.setAttribute("aria-label", "Passwort anzeigen");
  else btn.setAttribute("aria-label", "Passwort verbergen");
}

/**
 * Updates the password field icon and ARIA label.
 *
 * Updates the state object, sets the new icon, and updates the accessibility label.
 *
 * @param {Object} state - The password toggle state object.
 * @param {HTMLElement} state.button - The toggle button element.
 * @param {HTMLInputElement} state.input - The password input element.
 * @param {string} nextIcon - The icon name to render.
 * @returns {void}
 */
function renderIcon(state, nextIcon) {
  state.currentIcon = nextIcon;
  setPwIcon(state.button, nextIcon);
  setAriaLabel(state.input, state.button);
}

/**
 * Toggles the pointer CSS class on the button based on clickability.
 *
 * @param {Object} state - The password toggle state object.
 * @param {HTMLElement} state.button - The toggle button element.
 * @param {boolean} clickable - Whether the button should be clickable.
 * @returns {void}
 */
function setClickable(state, clickable) {
  state.button.classList.toggle("pointer", clickable);
}

/**
 * Synchronizes the password field state (icon, clickability, type).
 *
 * When the field is empty, shows a lock icon and disables the button.
 * When the field has content, shows an eye icon and enables the button.
 *
 * @param {Object} state - The password toggle state object.
 * @param {HTMLElement} state.button - The toggle button element.
 * @param {HTMLInputElement} state.input - The password input element.
 * @returns {void}
 */
function syncState(state) {
  const hasValue = state.input.value.length > 0;

  if (!hasValue) {
    state.input.type = "password";
    setClickable(state, false);
    renderIcon(state, ICON.LOCK);
    return;
  }

  setClickable(state, true);
  renderIcon(state, state.input.type === "password" ? ICON.EYE_CLOSED : ICON.EYE_OPEN);
}

/**
 * Maintains the cursor position in the password input field.
 *
 * Uses requestAnimationFrame to ensure the input is focused and the caret
 * is positioned at the specified location.
 *
 * @param {Object} state - The password toggle state object.
 * @param {HTMLInputElement} state.input - The password input element.
 * @param {number} pos - The desired cursor position.
 * @returns {void}
 */
function keepCaret(state, pos) {
  requestAnimationFrame(() => {
    state.input.focus();
    const len = state.input.value.length;
    const p = Math.min(pos, len);
    state.input.setSelectionRange(p, p);
  });
}

/**
 * Toggles the visibility of the password field.
 *
 * Switches the input type between 'password' and 'text', updates the icon,
 * and preserves the cursor position.
 *
 * @param {Object} state - The password toggle state object.
 * @param {HTMLInputElement} state.input - The password input element.
 * @param {HTMLElement} state.button - The toggle button element.
 * @returns {void}
 */
function toggleVisibility(state) {
  if (state.input.value.length === 0) return;

  const pos = state.input.selectionStart ?? state.input.value.length;
  const nowHidden = state.input.type === "password";

  state.input.type = nowHidden ? "text" : "password";
  renderIcon(state, nowHidden ? ICON.EYE_OPEN : ICON.EYE_CLOSED);
  keepCaret(state, pos);
}

/**
 * Prevents the button from losing focus when clicked.
 *
 * Prevents the default mousedown behavior to keep focus on the input field
 * while interacting with the password toggle button.
 *
 * @param {HTMLElement} btn - The password toggle button element.
 * @returns {void}
 */
function preventBlurOnMouseDown(btn) {
  btn.addEventListener("mousedown", (e) => e.preventDefault());
}

/**
 * Attaches event listeners for password field interactions.
 *
 * Wires up click, input, and change event handlers to manage password visibility
 * toggling and state synchronization.
 *
 * @param {Object} state - The password toggle state object.
 * @param {HTMLElement} state.button - The toggle button element.
 * @param {HTMLInputElement} state.input - The password input element.
 * @returns {void}
 */
function wirePWEvents(state) {
  preventBlurOnMouseDown(state.button);
  state.button.addEventListener("click", () => toggleVisibility(state));
  state.input.addEventListener("input", () => syncState(state));
  state.input.addEventListener("change", () => syncState(state));
}

/**
 * Creates a password toggle state object from a container element.
 *
 * Queries the container for password input and toggle button elements,
 * and initializes the state with these references.
 *
 * @param {HTMLElement} container - The form field container.
 * @returns {Object|null} State object with container, input, button, and currentIcon properties, or null if elements not found.
 */
function createPwToggleState(container) {
  const input = container.querySelector("[data-password]");
  const button = container.querySelector("[data-password-toggle]");
  if (!input || !button) return null;
  return { container, input, button, currentIcon: ICON.LOCK };
}

/**
 * Initializes password visibility toggle functionality for a form field.
 *
 * Creates the state object, attaches event handlers, and synchronizes the initial state.
 *
 * @param {HTMLElement} container - The form field container with password input and toggle button.
 * @returns {void}
 */
function initPasswordToggle(container) {
  const state = createPwToggleState(container);
  if (!state) return;
  wirePWEvents(state);
  syncState(state);
}

/**
 * Extracts and sanitizes email and password from the login form.
 *
 * Retrieves the values from the form inputs, trims whitespace,
 * and returns the inputs along with the warning element.
 *
 * @param {HTMLFormElement} form - The login form element.
 * @returns {Object|null} Object with email, password, and warningElement properties, or null if required fields not found.
 */
function extractFormInputs(form) {
  const emailInput = form.querySelector("#email");
  const passwordInput = form.querySelector("input[data-password]");
  const warningLogin = form.querySelector("#warning_login_failed");

  if (!emailInput || !passwordInput) return null;

  return {
    email: emailInput.value.trim(),
    password: passwordInput.value.trim(),
    warningElement: warningLogin,
  };
}

/**
 * Handles post-login success actions.
 *
 * Saves the login status to session storage and redirects to the summary page.
 *
 * @returns {void}
 */
function handleLoginSuccess() {
  saveSessionStorage("userIsGuest", false);
  sessionStorage.setItem("userLoggedIn", true);
  window.location.replace("summary.html");
}

/**
 * Displays the login error message.
 *
 * Adds the 'visible' class to the warning element to show the error message to the user.
 *
 * @param {HTMLElement|null} warningElement - The warning message element.
 * @returns {void}
 */
function handleLoginError(warningElement) {
  warningElement?.classList.add("visible");
}

/**
 * Enables automatic error clearing when user inputs form data.
 *
 * Attaches input event listeners to all form fields that remove the 'has_error' class
 * from all input boxes when the user starts typing.
 *
 * @param {HTMLFormElement} formElement - The form element containing input boxes.
 * @returns {void}
 */
function enableFormErrorReset(formElement) {
  if (!formElement) return;

  const inputBoxes = formElement.querySelectorAll(".input_box");

  inputBoxes.forEach((box) => {
    const input = box.querySelector("input, textarea, select");
    if (!input) return;

    input.addEventListener("input", () => {
      inputBoxes.forEach((b) => b.classList.remove("has_error"));
    });
  });
}

/**
 * Handles guest login functionality.
 *
 * Loads user data from the server, saves guest session to storage, and redirects to the summary page.
 *
 * @async
 * @function guestLogin
 * @returns {Promise<void>} Resolves when the guest login process is complete.
 */
async function guestLogin() {
  let dataObj = await loadData("/users");
  saveUserToSessionStorage("guest", "Guest", dataObj);
  sessionStorage.setItem("userLoggedIn", true);
  window.location.replace("summary.html");
}

/**
 * Handles the user login process triggered by a form submission.
 *
 * Prevents the default submit behavior, initializes the user data,
 * reads and sanitizes the email and password inputs, and validates
 * the credentials. On successful authentication, the user is
 * redirected to the start page; otherwise, a warning message is shown.
 *
 * @async
 * @function userLogin
 * @param {SubmitEvent} e - The submit event emitted by the login form.
 * @returns {Promise<void>} Resolves when the login process has completed.
 *
 * @throws {Error} Propagates errors thrown by {@link initUsersLoading}
 * if the user data cannot be initialized.
 */
async function userLogin(e) {
  e.preventDefault();
  const form = e.currentTarget;
  if (!form) return;
  
  await initUsersLoading();
  
  const inputs = extractFormInputs(form);
  if (!inputs) return;
  
  if (accessGranted(inputs.email, inputs.password)) {
    handleLoginSuccess();
  } else {
    handleLoginError(inputs.warningElement);
  }
}

/**
 * Function to check if user and password matches, sets the user id and returns true when a match was found
 * @param {string} email -Email address for login
 * @param {string} password -user password
 * @returns {boolean} -True when access is granted, false if not
 */
function accessGranted(email, password) {
  if (!window.users || typeof users !== "object") return false;

  for (const [id, u] of Object.entries(window.users)) {
    if (!u) continue;
    if (email === u.email && password === u.password) {
      window.activeUserId = id;
      window.activeUserName = u.givenName;
      saveUserToSessionStorage(id, u.givenName, window.users);

      return true;
    }
  }
  return false;
}

const loginForm = document.querySelector(".login_form form");
enableFormErrorReset(loginForm);

/**
 * Displays the signup/registration form and hides the login form.
 *
 * Adds 'enable' class to signup container and 'disable' class to login elements.
 *
 * @returns {void}
 */
function activateSignIn() {
  signInContainer.classList.add("enable");
  logInContainer.classList.add("disable");
  indexHeader.classList.add("disable");
}
/**
 * Displays the login form and hides the signup form.
 *
 * Removes 'enable/disable' classes from form containers and reinitializes
 * the error reset handlers for the login form.
 *
 * @returns {void}
 */
function activateLogIn() {
  signInContainer.classList.remove("enable");
  logInContainer.classList.remove("disable");
  indexHeader.classList.remove("disable");
  const loginForm = document.querySelector(".login_form form");
  enableFormErrorReset(loginForm);
}

window.addEventListener("load", () => {
  const indexBody = document.getElementById("index_body");
  const logoContainer = document.getElementById("logo_container");
  const pageContent = document.querySelector(".page_content");

  setTimeout(() => {
    indexBody.classList.add("is_loaded");
    logoContainer.classList.add("is_in_corner");

    pageContent.classList.add("is_visible");
  }, 1000);
});

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("login_form")?.addEventListener("submit", userLogin);
  document.getElementById("btn_activate_sign_in")?.addEventListener("click", activateSignIn);
  if (window.renderIcons) window.renderIcons(document);

  document.querySelectorAll(".input_box").forEach((box) => {
    initPasswordToggle(box);
  });
});
