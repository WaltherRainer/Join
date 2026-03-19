const PROTECTED_PAGE_KEYS = new Set(["summary", "board", "add_task", "contacts"]);

/**
 * Determines whether the current document is a protected app page.
 *
 * @returns {boolean} True when login is required for the current page.
 */
function isProtectedPage() {
  const pageKey = document.body?.dataset?.page;
  return PROTECTED_PAGE_KEYS.has(pageKey);
}

/**
 * Returns whether a valid login flag exists in session storage.
 *
 * @returns {boolean} True when the user is currently logged in.
 */
function hasActiveSession() {
  return sessionStorage.getItem("userLoggedIn") === "true";
}

/**
 * Redirects to the login page using history-safe replace.
 *
 * @returns {void}
 */
function redirectToLoginPage() {
  window.location.replace("index.html");
}

/**
 * Enforces login for protected pages.
 *
 * @returns {boolean} True when access is allowed.
 */
function enforceProtectedPageAuth() {
  if (!isProtectedPage()) return true;
  if (hasActiveSession()) {
    document.documentElement.style.visibility = "visible";
    return true;
  }
  document.documentElement.style.visibility = "hidden";
  redirectToLoginPage();
  return false;
}

/**
 * Re-validates authentication on page show events.
 *
 * Ensures that protected pages are only visible when a valid session exists,
 * and redirects to the login page if necessary.
 *
 * @returns {void}
 */
window.addEventListener("pageshow", () => {
  enforceProtectedPageAuth();
});

/**
 * Hides the page content before it is cached by the browser.
 *
 * Listens for the `pagehide` event and sets the document visibility to hidden
 * if the current page is protected, preventing cached snapshots from showing stale content.
 *
 * @returns {void}
 */
window.addEventListener("pagehide", () => {
  if (!isProtectedPage()) return;
  document.documentElement.style.visibility = "hidden";
});

enforceProtectedPageAuth();

/**
 * Verifies whether the current user is logged in.
 *
 * Reads the login flag from session storage and redirects
 * to the login page if no active session is found.
 *
 * @function checkIfUserIsLoggedIn
 * @returns {void}
 */
function checkIfUserIsLoggedIn() {
  enforceProtectedPageAuth();
}
