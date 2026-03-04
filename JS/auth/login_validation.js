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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
   * Validates login form inputs for required values and email format.
   *
   * @param {{emailInput: HTMLInputElement, passwordInput: HTMLInputElement, email: string, password: string, warningElement: HTMLElement|null}} inputs - Extracted login input values and elements.
   * @returns {boolean} True when all login checks pass.
   */
  function validate(inputs) {
    clearWarning(inputs.warningElement);
    toggleInputError(inputs.emailInput, false);
    toggleInputError(inputs.passwordInput, false);

    if (!inputs.email || !inputs.password) {
      setWarning(inputs.warningElement, LOGIN_MESSAGES.REQUIRED);
      if (!inputs.email) toggleInputError(inputs.emailInput, true);
      if (!inputs.password) toggleInputError(inputs.passwordInput, true);
      return false;
    }

    if (!isValidEmail(inputs.email)) {
      toggleInputError(inputs.emailInput, true);
      setWarning(inputs.warningElement, LOGIN_MESSAGES.EMAIL_INVALID);
      return false;
    }

    return true;
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
