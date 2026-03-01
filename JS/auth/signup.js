const signupFormElement = document.getElementById("register_form");
const registerBtn = document.getElementById("register_btn");
const privacyCheckbox = document.getElementById("terms_accepted");
const signupInputs = signupFormElement?.querySelectorAll("input[required]:not([type='checkbox'])") || [];

/**
 * Extracts and sanitizes email, password, and name from the signup form.
 *
 * Retrieves values from signup form inputs, trims whitespace, and returns
 * an object with user registration data.
 *
 * @returns {Object} Object with email, password, and givenName properties.
 */
function extractSignupFormInputs() {
  const emailEl = document.getElementById("email_sign_up");
  const pwEl = document.getElementById("new_user_password");
  const nameEl = document.getElementById("given_name");

  return {
    email: emailEl?.value?.trim() || "",
    password: pwEl?.value || "",
    givenName: nameEl?.value?.trim() || "",
  };
}

/**
 * Validates that all required signup fields are filled.
 *
 * @param {string} email - The user email address.
 * @param {string} password - The user password.
 * @param {string} givenName - The user's given name.
 * @returns {boolean} True if all fields are non-empty, false otherwise.
 */
function validateSignupInputs(email, password, givenName) {
  return email && password && givenName;
}

/**
 * Sends new user data to the server and reloads user data.
 *
 * Uploads the user registration data to the database, clears the cached
 * users state, and reloads user data from the server.
 *
 * @async
 * @function registerNewUser
 * @param {Object} dataObj - Object containing email, givenName, and password.
 * @returns {Promise<void>} Resolves when user data has been uploaded and reloaded.
 */
async function registerNewUser(dataObj) {
  await uploadData("/users", dataObj);
  window.usersReady = null;
  await initUsersLoading();
}

/**
 * Displays success message and resets the signup form.
 *
 * Shows a toast notification and clears the signup form. After the notification
 * is dismissed, the user is taken to the login form.
 *
 * @returns {void}
 */
function completeSignup() {
  showToastOverlay("signup_success_overlay", { onDone: activateLogIn });
  resetSignupForm();
}

/**
 * Handles the user signup process.
 *
 * Validates password match, extracts form inputs, checks if user already exists,
 * creates a new user in the database, and displays a success message.
 *
 * @async
 * @function addUser
 * @returns {Promise<void>} Resolves when the signup process has completed.
 */
async function addUser() {
  if (!passwordsMatch()) {
    showSignupPasswordError();
    return;
  }

  const { email, password, givenName } = extractSignupFormInputs();

  if (!validateSignupInputs(email, password, givenName)) {
    return;
  }

  await initUsersLoading();

  if (userExists(email)) {
    return;
  }

  const dataObj = { email, givenName, password };
  await registerNewUser(dataObj);
  completeSignup();
}

/**
 * Compares password and password confirmation fields.
 *
 * @returns {boolean} True if password and confirmation match, false otherwise.
 */
function passwordsMatch() {
  const passwordInput = document.getElementById("new_user_password");
  const confirmInput = document.getElementById("confirm_user_password");
  if (!passwordInput || !confirmInput) return false;
  return passwordInput.value === confirmInput.value;
}

/**
 * Displays password mismatch error in the signup form.
 *
 * Adds 'has_error' class to both password fields and shows the warning message
 * to indicate that passwords do not match.
 *
 * @returns {void}
 */
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

/**
 * Displays a success toast notification for completed signup.
 *
 * Shows an animated overlay with configurable slide and hold durations from CSS variables.
 * After the animation completes, the login form is activated.
 *
 * @returns {void}
 */
function showSignupSuccessToast() {
  const overlay = document.getElementById("signup_success_overlay");
  if (!overlay) return;

  overlay.classList.add("is_visible", "is_animating");
  overlay.setAttribute("aria-hidden", "false");

  const slideMs =
    parseInt(getComputedStyle(document.documentElement).getPropertyValue("--signup_success_slide_duration"), 10) || 600;
  const holdMs =
    parseInt(getComputedStyle(document.documentElement).getPropertyValue("--signup_success_hold_duration"), 10) || 1000;

  window.setTimeout(() => {
    overlay.classList.remove("is_animating", "is_visible");
    overlay.setAttribute("aria-hidden", "true");
    if (typeof activateLogIn === "function") {
      activateLogIn();
    } else {
      console.warn("activateLogIn() ist nicht definiert.");
    }
  }, slideMs + holdMs);
}

/**
 * Clears all fields and error states in the signup form.
 *
 * Resets input values, unchecks checkboxes, removes error classes,
 * and hides warning messages.
 *
 * @returns {void}
 */
function resetSignupForm() {
  const form = document.querySelector(".sign_up_form form");
  if (!form) return;

  form.querySelectorAll("input").forEach((input) => {
    if (input.type === "checkbox") {
      input.checked = false;
    } else {
      input.value = "";
    }
  });

  form.querySelectorAll(".has_error").forEach((el) => el.classList.remove("has_error"));

  const warning = form.querySelector("#warning_signup_failed");
  warning?.classList.remove("visible");
}

/**
 * Validates signup form state and updates the register button.
 *
 * Checks if all required fields are filled and privacy terms are accepted.
 * Enables or disables the register button based on form validity.
 *
 * @returns {void}
 */
function checkForm() {
  const allFilled = [...signupInputs].every((input) => input.value.trim() !== "");
  const privacyAccepted = privacyCheckbox?.checked;

  const isValid = allFilled && privacyAccepted;

  registerBtn?.classList.toggle("is-disabled", !isValid);
  registerBtn?.setAttribute("aria-disabled", String(!isValid));
}

if (signupInputs.length && privacyCheckbox) {
  signupInputs.forEach((input) => input.addEventListener("input", checkForm));
  privacyCheckbox.addEventListener("change", checkForm);
  checkForm();
}
