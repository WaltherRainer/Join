/**
 * Provides a small login validation module with a private scope.
 *
 * Exposes helper methods to validate required login fields and email format,
 * display authentication/validation warnings, and reset error states while
 * the user is typing.
 *
 * @type {{validate: (inputs: {emailInput: HTMLInputElement, passwordInput: HTMLInputElement, email: string, password: string, warningElement: (HTMLElement|null)}) => boolean, showAuthError: (warningElement: (HTMLElement|null)) => void, enableErrorReset: (formElement: (HTMLFormElement|null)) => void}}
 */
const loginValidation = (() => {
  const LOGIN_MESSAGES = Object.freeze({
    REQUIRED: "Please enter email and password.",
    EMAIL_INVALID: "Please enter a valid email address.",
    AUTH_FAILED: "Check your Email and password. Please try again.",
  });

  /**
   * Checks whether an email string matches a basic email format.
   *
   * @param {string} email - Email value to validate.
   * @returns {boolean} True when the email format is valid.
   */
  function isValidEmail(email) {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[a-zA-Z][a-zA-Z.-]*\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Shows a warning message for the login form.
   *
   * @param {HTMLElement|null} warningElement - Warning element in the login form.
   * @param {string} message - Warning text to display.
   * @returns {void}
   */
  function setWarning(warningElement, message) {
    if (!warningElement) return;
    warningElement.textContent = message;
    warningElement.classList.add("visible");
  }

  /**
   * Hides the warning message for the login form.
   *
   * @param {HTMLElement|null} warningElement - Warning element in the login form.
   * @returns {void}
   */
  function clearWarning(warningElement) {
    if (!warningElement) return;
    warningElement.classList.remove("visible");
  }

  /**
   * Toggles the visual error state for an input's wrapper.
   *
   * @param {HTMLInputElement|null} inputElement - Target input element.
   * @param {boolean} hasError - Whether the input should be marked as invalid.
   * @returns {void}
   */
  function toggleInputError(inputElement, hasError) {
    const inputBox = inputElement?.closest(".input_box");
    inputBox?.classList.toggle("has_error", hasError);
  }

  /**
   * Validates login inputs for required values and email format.
   *
   * Clears previous warning/error states, then checks required fields and
   * delegates required-field handling to {@link validateLoginRequiredFields}.
   *
   * @function validate
   * @param {{emailInput: HTMLInputElement, passwordInput: HTMLInputElement, email: string, password: string, warningElement: HTMLElement|null}} inputs
   * @returns {boolean} True when all login checks pass.
   */
  function validate(inputs) {
    clearWarning(inputs.warningElement);
    toggleInputError(inputs.emailInput, false);
    toggleInputError(inputs.passwordInput, false);
    if (!validateLoginRequiredFields(inputs)) return false;
    if (!isValidEmail(inputs.email)) {
      toggleInputError(inputs.emailInput, true);
      setWarning(inputs.warningElement, LOGIN_MESSAGES.EMAIL_INVALID);
      return false;
    }
    return true;
  }

  /**
   * Validates that email and password are present and sets UI warnings if not.
   *
   * Marks missing fields as invalid and shows the required-fields message.
   *
   * @function validateLoginRequiredFields
   * @param {{emailInput: HTMLInputElement, passwordInput: HTMLInputElement, email: string, password: string, warningElement: HTMLElement|null}} inputs
   * @returns {boolean} True when both required fields are provided.
   */
  function validateLoginRequiredFields(inputs) {
    if (inputs.email && inputs.password) return true;
    setWarning(inputs.warningElement, LOGIN_MESSAGES.REQUIRED);
    if (!inputs.email) toggleInputError(inputs.emailInput, true);
    if (!inputs.password) toggleInputError(inputs.passwordInput, true);
    return false;
  }

  /**
   * Shows the generic authentication failed message.
   *
   * @param {HTMLElement|null} warningElement - Warning element in the login form.
   * @returns {void}
   */
  function showAuthError(warningElement) {
    setWarning(warningElement, LOGIN_MESSAGES.AUTH_FAILED);
  }

  /**
   * Enables automatic reset of login error styles while typing.
   *
   * @param {HTMLFormElement|null} formElement - Login form element.
   * @returns {void}
   */
  function enableErrorReset(formElement) {
    if (!formElement) return;
    const inputBoxes = formElement.querySelectorAll(".input_box");
    const warningElement = formElement.querySelector("#warning_login_failed");
    inputBoxes.forEach((box) => {
      const input = box.querySelector("input, textarea, select");
      if (!input) return;
      input.addEventListener("input", () => {
        inputBoxes.forEach((item) => item.classList.remove("has_error"));
        clearWarning(warningElement);
      });
    });
  }

  return {
    validate,
    showAuthError,
    enableErrorReset,
  };
})();

window.loginValidation = loginValidation;
