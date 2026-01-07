const ICON = Object.freeze({
  LOCK: "lock",
  EYE_CLOSED: "eye_closed",
  EYE_OPEN: "eye_open",
});


function setPwIcon(button, iconName) {
  const holder = button.querySelector("[data-icon]");
  if (!holder) return;
  holder.dataset.icon = iconName;
  if (window.renderIcons) window.renderIcons(button);
}

function guestLogin() {
  window.location.replace("summary.html");
}

function setAriaLabel(input, btn) {
  const hasValue = input.value.length > 0;
  if (!hasValue) btn.setAttribute("aria-label", "Passwortfeld ist leer");
  else if (input.type === "password") btn.setAttribute("aria-label", "Passwort anzeigen");
  else btn.setAttribute("aria-label", "Passwort verbergen");
}

function renderIcon(state, nextIcon) {
  state.currentIcon = nextIcon;
  setPwIcon(state.button, nextIcon);
  setAriaLabel(state.input, state.button);
}

function setClickable(state, clickable) {
  state.button.classList.toggle("pointer", clickable);
}

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

function keepCaret(state, pos) {
  requestAnimationFrame(() => {
    state.input.focus();
    const len = state.input.value.length;
    const p = Math.min(pos, len);
    state.input.setSelectionRange(p, p);
  });
}

function toggleVisibility(state) {
  if (state.input.value.length === 0) return;

  const pos = state.input.selectionStart ?? state.input.value.length;
  const nowHidden = state.input.type === "password";

  state.input.type = nowHidden ? "text" : "password";
  renderIcon(state, nowHidden ? ICON.EYE_OPEN : ICON.EYE_CLOSED);
  keepCaret(state, pos);
}

function preventBlurOnMouseDown(btn) {
  btn.addEventListener("mousedown", (e) => e.preventDefault());
}

function wireEvents(state) {
  preventBlurOnMouseDown(state.button);
  state.button.addEventListener("click", () => toggleVisibility(state));
  state.input.addEventListener("input", () => syncState(state));
  state.input.addEventListener("change", () => syncState(state));
}

function createPwToggleState(container) {
  const input = container.querySelector("[data-password]");
  const button = container.querySelector("[data-password-toggle]");
  if (!input || !button) return null;
  return { container, input, button, currentIcon: ICON.LOCK };
}

function initPasswordToggle(container) {
  const state = createPwToggleState(container);
  if (!state) return;
  wireEvents(state);
  syncState(state); // initial
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
  const emailInput = form.querySelector("#email");
  const passwordInput = form.querySelector("input[data-password]");
  const warningLogin = form.querySelector("#warning_login_failed");
  if (!emailInput || !passwordInput) return;
  const emailValue = emailInput.value.trim();
  const passwordValue = passwordInput.value.trim();
  if (accessGranted(emailValue, passwordValue)) {
    window.location.replace("summary.html");
  } else {
    warningLogin?.classList.add("visible");
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
      return true;
    }
  }
  return false;
}

/** resets the error when user is typing in something the input box */
function enableFormErrorReset(formElement) {
  const inputBoxes = formElement.querySelectorAll(".input_box");

  inputBoxes.forEach((box) => {
    const input = box.querySelector("input, textarea, select");
    if (!input) return;

    input.addEventListener("input", () => {
      inputBoxes.forEach((b) => b.classList.remove("has_error"));
    });
  });
}

const loginForm = document.querySelector(".login_form form");
enableFormErrorReset(loginForm);

/** Activates Sign In Form */
function activateSignIn() {
  signInContainer.classList.add("enable");
  logInContainer.classList.add("disable");
  indexHeader.classList.add("disable");
}
/** Activates Log In Form */
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
  if (window.renderIcons) window.renderIcons(document);

  document.querySelectorAll(".input_box").forEach((box) => {
    initPasswordToggle(box);
  });
});

/**
 * This Function is used to add a User to the path users in the Database
 *
 */
async function addUser() {
  if (!passwordsMatch()) {
    showSignupPasswordError();
    return;
  }
  const emailEl = document.getElementById("email_sign_up");
  const pwEl = document.getElementById("new_user_password");
  const nameEl = document.getElementById("given_name");
  const email = emailEl?.value?.trim() || "";
  const password = pwEl?.value || "";
  const givenName = nameEl?.value?.trim() || "";
  if (!email || !password || !givenName) return;
  await initUsersLoading();
  if (userExists(email)) return;
  const dataObj = { email, givenName, password };
  const result = await uploadData("/users", dataObj);
  console.log("Firebase Key:", result?.name);
  window.usersReady = null;
  await initUsersLoading();

  showToastOverlay("signup_success_overlay", { onDone: activateLogIn });
  // showSignupSuccessToast();
  resetSignupForm();
}

function userExists(email) {
  if (!window.users || typeof window.users !== "object") return false;

  return Object.values(window.users).some((user) => user?.email === email);
}

function passwordsMatch() {
  const passwordInput = document.getElementById("new_user_password");
  const confirmInput = document.getElementById("confirm_user_password");
  if (!passwordInput || !confirmInput) return false;
  return passwordInput.value === confirmInput.value;
}

function showSignupPasswordError() {
  const passwordInput = document.getElementById("new_user_password");
  const confirmInput = document.getElementById("confirm_user_password");
  const warningSignup = document.getElementById("warning_signup_failed");
  if (!passwordInput || !confirmInput) return;
  const passwordBox = passwordInput.closest(".input_box");
  const confirmBox = confirmInput.closest(".input_box");
  passwordBox?.classList.add("has_error");
  confirmBox?.classList.add("has_error");
  warningSignup?.classList.add("visible");
}

function showSignupSuccessToast() {
  const overlay = document.getElementById("signup_success_overlay");
  if (!overlay) return;

  // sichtbar + animieren
  overlay.classList.add("is_visible", "is_animating");
  overlay.setAttribute("aria-hidden", "false");

  // nach "slide in" + 1s Pause Login aktivieren
  const slideMs = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--signup_success_slide_duration"), 10) || 600;
  const holdMs = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--signup_success_hold_duration"), 10) || 1000;

  window.setTimeout(() => {
    // optional: Toast wieder ausblenden
    overlay.classList.remove("is_animating", "is_visible");
    overlay.setAttribute("aria-hidden", "true");

    // Login anzeigen
    if (typeof activateLogIn === "function") {
      activateLogIn();
    } else {
      console.warn("activateLogIn() ist nicht definiert.");
    }
  }, slideMs + holdMs);
}

function resetSignupForm() {
  const form = document.querySelector(".sign_up_form form");
  if (!form) return;

  // Inputs leeren
  form.querySelectorAll("input").forEach((input) => {
    if (input.type === "checkbox") {
      input.checked = false;
    } else {
      input.value = "";
    }
  });

  // Error-Zustände entfernen
  form.querySelectorAll(".has_error").forEach((el) => el.classList.remove("has_error"));

  // Warning-Text ausblenden
  const warning = form.querySelector("#warning_signup_failed");
  warning?.classList.remove("visible");
}

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("login_form")?.addEventListener("submit", userLogin);
});
