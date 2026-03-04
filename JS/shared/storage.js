// Storage and data-loading helpers

let users = {};
let activeUserId = "";
let tasks = {};
let activeUserName = "";
let localSubtasks = {};
const USER_COLOR_COUNT = 15;
let joinSessionStorageObject = {};
let usersReady = null;

/**
 * Initializes the index page by setting default session values.
 *
 * @function indexInit
 * @returns {void}
 */
function indexInit() {
  initSessionStorage();
}

/**
 * Initializes default session storage values for the login state.
 *
 * Sets `userLoggedIn` to `false` and initializes `userId` with a placeholder.
 *
 * @function initSessionStorage
 * @returns {void}
 */
function initSessionStorage() {
  sessionStorage.setItem("userLoggedIn", false);
  sessionStorage.setItem("userId", "notLoggedIn");
}

/**
 * Stores a value in session storage as JSON.
 *
 * @function saveSessionStorage
 * @param {string} key - Session storage key to write.
 * @param {*} value - Value to serialize and store.
 * @returns {void}
 */
function saveSessionStorage(key, value) {
  sessionStorage.setItem(key, JSON.stringify(value));
}

/**
 * Loads the persisted `joinSessionStorageObject` from session storage.
 *
 * @function loadSessionStorage
 * @returns {void}
 */
function loadSessionStorage() {
  const tempArr = JSON.parse(sessionStorage.getItem("joinSessionStorageObject"));
  if (tempArr != null) {
    joinSessionStorageObject = tempArr;
  } else {
    console.error("Error loading data from session storage");
  }
}

/**
 * Saves the current user information to session storage.
 *
 * @function saveUserToSessionStorage
 * @param {string} userId - Identifier of the user
 * @param {string} userName - Display name of the user
 * @param {Object} users - Complete users object to persist
 * @returns {void}
 */
function saveUserToSessionStorage(userId, userName, users) {
  sessionStorage.setItem("userId", userId);
  sessionStorage.setItem("userName", userName);
  sessionStorage.setItem("users", JSON.stringify(users));
}

/**
 * Saves users object to session storage directly.
 * @function saveUsersToSessionStorage
 * @param {Object} users - Users object
 */
function saveUsersToSessionStorage(users) {
  sessionStorage.setItem("users", JSON.stringify(users));
}

/**
 * Saves tasks object to session storage directly.
 * @function saveTasksToSessionStorage
 * @param {Object} tasks - Tasks object
 */
function saveTasksToSessionStorage(tasks) {
  sessionStorage.setItem("tasks", JSON.stringify(tasks));
}

/**
 * Returns the globally cached `tasks` object if it has been loaded.
 *
 * @function ensureTasksAreLoaded
 * @returns {Object|undefined} The tasks object or undefined if not set
 */
function ensureTasksAreLoaded() {
  if (tasks && Object.keys(tasks).length > 0) return tasks;
}

/**
 * Retrieves the stored user ID from session storage.
 *
 * @function getUserIdFromSessionStorage
 * @returns {string|null} Stored user ID or null if none
 */
function getUserIdFromSessionStorage() {
  return sessionStorage.getItem("userId");
}

/**
 * Retrieves the stored user name from session storage.
 *
 * @function getUserNameFromSessionStorage
 * @returns {string|null} Stored user name or null if none
 */
function getUserNameFromSessionStorage() {
  return sessionStorage.getItem("userName");
}

/**
 * Loads users from cache or server and persists them.
 *
 * @async
 * @function ensureUsersLoaded
 * @returns {Promise<Object>} Users object
 */
async function ensureUsersLoaded() {
  if (users && Object.keys(users).length > 0) return users;
  const dataObj = JSON.parse(sessionStorage.getItem("users"));
  if (dataObj && Object.keys(dataObj).length > 0) return dataObj;
  users = (await loadData("/users")) || {};
  sessionStorage.setItem("users", JSON.stringify(users));
  return users;
}

/**
 * Loads tasks from cache or server and persists them.
 *
 * @async
 * @function ensureTasksLoaded
 * @returns {Promise<Object>} Tasks object
 */
async function ensureTasksLoaded() {
  if (tasks && Object.keys(tasks).length > 0) return tasks;
  const dataObj = JSON.parse(sessionStorage.getItem("tasks"));
  if (dataObj && Object.keys(dataObj).length > 0) return dataObj;
  tasks = (await loadData("/tasks")) || {};
  sessionStorage.setItem("tasks", JSON.stringify(tasks));
  return tasks;
}

/**
 * Begins asynchronous loading of users if not already in progress.
 * Caches a promise on `window.usersReady` to avoid duplicate loads.
 *
 * @function initUsersLoading
 * @returns {Promise<Object>} Promise resolving to users object
 */
function initUsersLoading() {
  if (!window.usersReady) {
    window.usersReady = (async () => {
      const data = await loadData("/users");
      window.users = data && typeof data === "object" ? data : {};
      return window.users;
    })().catch((err) => {
      window.usersReady = null;
      throw err;
    });
  }
  return window.usersReady;
}

/**
 * Safely parses a JSON string into an array.
 * Returns an empty array on any parsing error or if result is not an array.
 *
 * @function safeParseArray
 * @param {string} str - JSON string to parse
 * @returns {Array} Parsed array or empty array
 */
function safeParseArray(str) {
  try {
    const v = JSON.parse(str || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}