/**
 * Function to generate user initials from a given name string.
 * For single names, the first two characters are used.
 * For multiple names, the first character of the first and last name is used.
 *
 * @param {string} givenName -Full given name of the user
 * @param {string} [fallback="?"] -Fallback initials when no valid name is provided
 * @returns {string} -Uppercase initials to be displayed in the user avatar
 */
function initialsFromGivenName(givenName, fallback = "?") {
  if (!givenName) return fallback;

  const parts = String(givenName).trim().split(/\s+/).filter(Boolean);

  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Function to generate a deterministic color index for a user based on the user id.
 * The index is always between 1 and the maximum number of defined user colors.
 * Same user id will always result in the same color index.
 *
 * @param {string} userId -Unique user identifier (e.g. Firebase user id)
 * @returns {number} -Color index between 1 and USER_COLOR_COUNT
 */
function colorIndexFromUserId(userId) {
  // simple hash
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0; // unsigned
  }
  return (hash % USER_COLOR_COUNT) + 1; // 1..15
}

/**
 * Function to generate a CSS color variable reference for a user based on the user id.
 * Maps the user deterministically to one of the predefined CSS variables (--user_c_1 .. --user_c_15).
 *
 * @param {string} userId -Unique user identifier (e.g. Firebase user id)
 * @returns {string} -CSS variable string for the user color (e.g. "var(--user_c_7)")
 */
function colorVarFromUserId(userId) {
  const idx = colorIndexFromUserId(userId);
  return `var(--user_c_${idx})`;
}

function userExists(email) {
  if (!window.users || typeof window.users !== "object") return false;

  return Object.values(window.users).some((user) => user?.email === email);
}

function userLogout() {
  sessionStorage.clear();
  window.location.replace("index.html");
}