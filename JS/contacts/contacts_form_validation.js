const contactFormValidation = (() => {
  /**
   * Form-specific selectors used by the shared contact validation logic.
   *
   * @type {{
   *   add: {formId: string, fields: {name: string, email: string, phone: string}, warnings: {email: string, phone: string}},
   *   edit: {formId: string, fields: {name: string, email: string, phone: string}, warnings: {email: string, phone: string}}
   * }}
   */
  const FORM_CONFIGS = Object.freeze({
    add: {
      formId: "contact_form",
      fields: {
        name: "user_name",
        email: "user_email",
        phone: "user_phone",
      },
      warnings: {
        name: "warning_contact_name_required",
        email: "warning_contact_email_invalid",
        phone: "warning_contact_phone_invalid",
      },
    },
    edit: {
      formId: "edit_contact_form",
      fields: {
        name: "edit_user_name",
        email: "edit_user_email",
        phone: "edit_user_phone",
      },
      warnings: {
        name: "warning_edit_name_required",
        email: "warning_edit_email_invalid",
        phone: "warning_edit_phone_invalid",
      },
    },
  });

  const REQUIRED_MESSAGES = Object.freeze({
    name: "Please enter a name.",
    email: "Please enter an email address.",
    phone: "Please enter a phone number.",
  });

  const INVALID_MESSAGES = Object.freeze({
    email: "Please enter a valid email address.",
    phone: "Please enter a valid phone number.",
  });

  /**
   * Validates the add-contact form using the shared validation pipeline.
   *
   * @returns {boolean} True when all add-contact fields are valid.
   */
  function validateAddForm() {
    return validateFormByConfig(FORM_CONFIGS.add);
  }

  /**
   * Validates the edit-contact form using the shared validation pipeline.
   *
   * @returns {boolean} True when all edit-contact fields are valid.
   */
  function validateEditForm() {
    return validateFormByConfig(FORM_CONFIGS.edit);
  }

  /**
   * Validates the name field for the configured contact form.
   *
   * @param {{formId: string, fields: {name: string}, warnings: {name: string}}} config - Form configuration.
   * @returns {boolean} True when the name field is valid.
   */
  function validateNameField(config) {
    const name = document.getElementById(config.fields.name)?.value?.trim() || "";
    if (!name) {
      showFieldValidationError(config.fields.name, config.warnings.name, REQUIRED_MESSAGES.name);
      return false;
    }
    return true;
  }

  /**
   * Validates the email field for the configured contact form.
   *
   * @param {{formId: string, fields: {email: string}, warnings: {email: string}}} config - Form configuration.
   * @returns {boolean} True when the email field is valid.
   */
  function validateEmailField(config) {
    const email = document.getElementById(config.fields.email)?.value?.trim() || "";
    if (!email) {
      showFieldValidationError(config.fields.email, config.warnings.email, REQUIRED_MESSAGES.email);
      return false;
    } else if (!isValidEmail(email)) {
      showFieldValidationError(config.fields.email, config.warnings.email, INVALID_MESSAGES.email);
      return false;
    }
    return true;
  }

  /**
   * Validates the phone field for the configured contact form.
   *
   * @param {{formId: string, fields: {phone: string}, warnings: {phone: string}}} config - Form configuration.
   * @returns {boolean} True when the phone field is valid.
   */
  function validatePhoneField(config) {
    const phone = document.getElementById(config.fields.phone)?.value?.trim() || "";
    if (!phone) {
      showFieldValidationError(config.fields.phone, config.warnings.phone, REQUIRED_MESSAGES.phone);
      return false;
    } else if (!isValidPhone(phone)) {
      showFieldValidationError(config.fields.phone, config.warnings.phone, INVALID_MESSAGES.phone);
      return false;
    }
    return true;
  }

  /**
   * Runs required, email, and phone validation for a configured contact form.
   *
   * Clears previous errors first, then delegates validation to field-specific validators.
   *
   * @param {{formId: string, fields: {name: string, email: string, phone: string}, warnings: {name: string, email: string, phone: string}}} config - Form configuration.
   * @returns {boolean} True when all checks pass.
   */
  function validateFormByConfig(config) {
    clearFormErrors(config.formId);
    const isNameValid = validateNameField(config);
    const isEmailValid = validateEmailField(config);
    const isPhoneValid = validatePhoneField(config);
    return isNameValid && isEmailValid && isPhoneValid;
  }

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
   * Checks whether a phone string matches the accepted phone format.
   *
   * Accepts digits, spaces, plus sign, dashes, and parentheses.
   *
   * @param {string} phone - Phone value to validate.
   * @returns {boolean} True when the phone format is valid.
   */
  function isValidPhone(phone) {
    if (!phone) return false;
    const phoneRegex = /^[\d\s\-+()]{4,}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Marks a field as invalid and shows its related warning text element.
   *
   * @param {string} inputId - ID of the input element.
   * @param {string} warningId - ID of the warning message element.
   * @returns {void}
   */
  function showFieldValidationError(inputId, warningId, message) {
    const input = document.getElementById(inputId);
    const warning = document.getElementById(warningId);
    if (!input) return;

    const wrapper = input.closest(".input-wrapper");
    wrapper?.classList.add("has_error");
    if (warning && message) warning.textContent = message;
    warning?.classList.add("visible");
  }

  /**
   * Clears all visual error states for the add-contact form.
   *
   * @returns {void}
   */
  function clearAddErrors() {
    clearFormErrors(FORM_CONFIGS.add.formId);
  }

  /**
   * Clears all visual error states for the edit-contact form.
   *
   * @returns {void}
   */
  function clearEditErrors() {
    clearFormErrors(FORM_CONFIGS.edit.formId);
  }

  /**
   * Removes field and warning error classes from the given form.
   *
   * @param {string} formId - ID of the target form.
   * @returns {void}
   */
  function clearFormErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.querySelectorAll(".has_error").forEach((el) => el.classList.remove("has_error"));
    form.querySelectorAll(".warning_text").forEach((el) => el.classList.remove("visible"));
  }

  /**
   * Enables automatic error reset while the user edits form inputs.
   *
   * Each input listener removes wrapper error styles and hides warning texts
   * in the same form as soon as the user types.
   *
   * @param {HTMLFormElement | null} form - Form element to bind listeners on.
   * @returns {void}
   */
  function enableErrorReset(form) {
    if (!form) return;

    const inputWrappers = form.querySelectorAll(".input-wrapper");

    inputWrappers.forEach((wrapper) => {
      const input = wrapper.querySelector("input");
      if (!input) return;

      input.addEventListener("input", () => {
        wrapper.classList.remove("has_error");
        const warningElements = form.querySelectorAll(".warning_text");
        warningElements.forEach((warning) => warning.classList.remove("visible"));
      });
    });
  }

  return {
    validateAddForm,
    validateEditForm,
    clearAddErrors,
    clearEditErrors,
    enableErrorReset,
  };
})();

window.contactFormValidation = contactFormValidation;
