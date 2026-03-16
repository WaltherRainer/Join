/**
 * Form-specific selectors used by the shared contact validation logic.
 *
 * @type {{
 *   add: {formId: string, fields: {name: string, email: string, phone: string}, warnings: {name: string, email: string, phone: string}},
 *   edit: {formId: string, fields: {name: string, email: string, phone: string}, warnings: {name: string, email: string, phone: string}}
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

/**
 * Immutable map of required-field validation messages.
 *
 * Used to display consistent error text for missing contact form fields.
 *
 * @constant
 * @type {Readonly<{name: string, email: string, phone: string}>}
 */
const REQUIRED_MESSAGES = Object.freeze({
  name: "Please enter a name.",
  email: "Please enter an email address.",
  phone: "Please enter a phone number.",
});

/**
 * Immutable map of validation messages for invalid field formats.
 *
 * Used to display consistent error text when inputs fail format checks.
 *
 * @constant
 * @type {Readonly<{email: string, phone: string}>}
 */
const INVALID_MESSAGES = Object.freeze({
  email: "Please enter a valid email address.",
  phone: "Please enter a valid phone number.",
});

/**
 * Immutable map of field validator functions.
 *
 * Each validator receives the raw field value and returns `true` if valid.
 *
 * @constant
 * @type {Readonly<{name: (value: string) => boolean, email: (value: string) => boolean, phone: (value: string) => boolean}>}
 */
const VALIDATORS = Object.freeze({
  name: (value) => Boolean(value),
  email: (value) => isValidEmail(value),
  phone: (value) => isValidPhone(value),
});

/**
 * Validates the add-contact form.
 *
 * @returns {boolean} True when all add-contact fields are valid.
 */
function validateAddForm() {
  return validateFormByConfig(FORM_CONFIGS.add);
}

/**
 * Validates the edit-contact form.
 *
 * @returns {boolean} True when all edit-contact fields are valid.
 */
function validateEditForm() {
  return validateFormByConfig(FORM_CONFIGS.edit);
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
 * Runs validation for all fields defined in the given form configuration.
 *
 * @param {object} config - Form configuration object.
 * @returns {boolean} True when all fields are valid.
 */
function validateFormByConfig(config) {
  clearFormErrors(config.formId);

  const nameValid = validateField(config, "name");
  const emailValid = validateField(config, "email");
  const phoneValid = validateField(config, "phone");

  return nameValid && emailValid && phoneValid;
}

/**
 * Validates a single field based on its type.
 *
 * @param {object} config - Form configuration.
 * @param {"name"|"email"|"phone"} fieldName - Field identifier.
 * @returns {boolean} True when the field value is valid.
 */
function validateField(config, fieldName) {
  let value = getTrimmedValue(config.fields[fieldName]);
  if (fieldName === "phone") {
    value = normalizePhone(value);
    updateInputValue(config.fields.phone, value);
  }
  if (!value) {
    showValidationError(config, fieldName, REQUIRED_MESSAGES[fieldName]);
    return false;
  }
  if (!VALIDATORS[fieldName](value)) {
    return handleInvalidFormat(config, fieldName);
  }
  return true;
}

/**
 * Handles invalid format errors for specific fields.
 *
 * @param {object} config - Form configuration.
 * @param {string} fieldName - Field identifier.
 * @returns {boolean} Always returns false after displaying an error.
 */
function handleInvalidFormat(config, fieldName) {
  const invalidMessage = INVALID_MESSAGES[fieldName];
  if (!invalidMessage) return true;

  showValidationError(config, fieldName, invalidMessage);
  return false;
}

/**
 * Returns the trimmed value of an input element.
 *
 * @param {string} elementId - DOM id of the input element.
 * @returns {string} Trimmed input value.
 */
function getTrimmedValue(elementId) {
  return document.getElementById(elementId)?.value?.trim() || "";
}

/**
 * Normalizes phone numbers by removing whitespace.
 *
 * Ensures that users cannot submit phone numbers containing spaces.
 *
 * @param {string} phone - Raw phone input.
 * @returns {string} Sanitized phone number.
 */
function normalizePhone(phone) {
  if (!phone) return "";
  return phone.trim().replace(/\s+/g, "");
}

/**
 * Normalizes email input by removing all whitespace.
 *
 * @param {string} email - Raw email input.
 * @returns {string} Sanitized email.
 */
function normalizeEmail(email) {
  if (!email) return "";
  return email.trim().replace(/\s+/g, "");
}

/**
 * Determines whether an input element represents an email field.
 *
 * @param {HTMLInputElement} input - Input element.
 * @returns {boolean} True when the input is an email field.
 */
function isEmailInput(input) {
  return input.type === "email" || input.name?.toLowerCase().includes("email");
}

/**
 * Updates the value of a DOM input element.
 *
 * @param {string} elementId - Input element id.
 * @param {string} value - New value to apply.
 */
function updateInputValue(elementId, value) {
  const input = document.getElementById(elementId);
  if (input) input.value = value;
}

/**
 * Displays a validation error for a specific field.
 *
 * @param {object} config - Form configuration.
 * @param {string} fieldName - Field identifier.
 * @param {string} message - Warning message to display.
 */
function showValidationError(config, fieldName, message) {
  showFieldValidationError(config.fields[fieldName], config.warnings[fieldName], message);
}

/**
 * Checks whether an email string matches a basic email format.
 *
 * @param {string} email - Email value to validate.
 * @returns {boolean} True when the email format is valid.
 */
function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Checks whether a phone string matches the accepted phone format.
 *
 * @param {string} phone - Phone value to validate.
 * @returns {boolean} True when the phone format is valid.
 */
function isValidPhone(phone) {
  if (!phone) return false;
  const phoneRegex = /^\+?\d{4,}$/;
  return phoneRegex.test(phone);
}

/**
 * Marks a field as invalid and shows its related warning element.
 *
 * @param {string} inputId - ID of the input element.
 * @param {string} warningId - ID of the warning element.
 * @param {string} message - Warning message text.
 */
function showFieldValidationError(inputId, warningId, message) {
  const input = document.getElementById(inputId);
  const warning = document.getElementById(warningId);
  if (!input) return;

  input.closest(".input-wrapper")?.classList.add("has_error");

  if (warning && message) {
    warning.textContent = message;
  }

  warning?.classList.add("visible");
}

/**
 * Removes all error styles and warning messages from a form.
 *
 * @param {string} formId - ID of the form element.
 */
function clearFormErrors(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  removeClassFromElements(form, ".has_error", "has_error");
  removeClassFromElements(form, ".warning_text", "visible");
}

/**
 * Removes a specific CSS class from all matching elements.
 *
 * @param {HTMLElement} root - Root element to search within.
 * @param {string} selector - CSS selector.
 * @param {string} className - Class to remove.
 */
function removeClassFromElements(root, selector, className) {
  root.querySelectorAll(selector).forEach((el) => {
    el.classList.remove(className);
  });
}

/**
 * Enables automatic removal of error styles when users edit inputs.
 *
 * @param {HTMLFormElement|null} form - Form element.
 */
function enableErrorReset(form) {
  if (!form) return;

  form.querySelectorAll(".input-wrapper input").forEach((input) => {
    input.addEventListener("input", () => resetInputError(form, input));
  });
}

/**
 * Clears error styling for a specific input and hides warnings.
 *
 * @param {HTMLFormElement} form - Parent form element.
 * @param {HTMLInputElement} input - Input element.
 */
function resetInputError(form, input) {
  if (isPhoneInput(input)) {
    input.value = normalizePhone(input.value);
  }

  if (isEmailInput(input)) {
    input.value = normalizeEmail(input.value);
  }

  input.closest(".input-wrapper")?.classList.remove("has_error");
  hideWarnings(form);
}

/**
 * Determines whether an input element represents a phone field.
 *
 * @param {HTMLInputElement} input - Input element.
 * @returns {boolean} True when the input is a phone field.
 */
function isPhoneInput(input) {
  return input.type === "tel" || input.name?.toLowerCase().includes("phone");
}

/**
 * Hides all warning messages inside a form.
 *
 * @param {HTMLFormElement} form - Form element.
 */
function hideWarnings(form) {
  form.querySelectorAll(".warning_text").forEach((warning) => {
    warning.classList.remove("visible");
  });
}

/**
 * Public API for contact form validation.
 */
const contactFormValidation = Object.freeze({
  validateAddForm,
  validateEditForm,
  clearAddErrors,
  clearEditErrors,
  enableErrorReset,
});

window.contactFormValidation = contactFormValidation;
